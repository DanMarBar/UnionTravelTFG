import axios from 'axios';
import dotenv from 'dotenv';
import User from '../model/UserModel.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendEmail from "../config/Mailer.js";

dotenv.config();

const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const REDIRECT_URI = 'https://7379-66-81-168-49.ngrok-free.app/authenticate';

export const redirectToGitHub = (req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'read:user user:email',
        allow_signup: 'true',
    });

    res.redirect(`${GITHUB_OAUTH_URL}?${params.toString()}`);
};

// Utiliza el oauth de github para identificar al usuario
export const githubAuth = async (req, res) => {
    const code = req.query.code;

    if (!code) {
        console.error('OAuth code not found in request.');
        return res.status(400).send('OAuth code not found.');
    }

    try {
        const tokenResponse = await axios.post(GITHUB_TOKEN_URL, new URLSearchParams({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code,
            redirect_uri: REDIRECT_URI,
        }), {
            headers: {
                'Accept': 'application/json',
            },
        });

        const {access_token} = tokenResponse.data;

        const userProfileResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const userEmailsResponse = await axios.get('https://api.github.com/user/emails', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const primaryEmail = userEmailsResponse.data.find(email => email.primary).email;

        const userInfo = {
            ...userProfileResponse.data,
            email: primaryEmail
        };

        await verifyAndRegisterUser(userInfo, res);
    } catch (error) {
        console.error('Error during GitHub OAuth authentication', error.response ? error.response.data : error.message);
        res.status(500).send('Authentication failed');
    }
};

// Registra al usuario si es necesario usando lso datos del oauth
const verifyAndRegisterUser = async (userInfo, res) => {
    try {
        const email = userInfo.email;

        // Verificar si el usuario ya está registrado en la base de datos
        let user = await User.findOne({where: {email: email}});

        if (!user) {
            const generatedPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);

            user = await User.create({
                user: userInfo.login,
                email: email,
                password: hashedPassword
            });

            const emailContent =
            `Bienvenido a nuestra aplicación
            Hola ${user.user}
            Gracias por registrarte en nuestra aplicación! Estamos encantados de tenerte con nosotros
            Si tienes alguna pregunta, no dudes en contactarnos
            Saludos, El equipo de nuestra aplicación
        `;
            // Enviar correo de bienvenida
            sendEmail(email, 'Bienvenido a nuestra aplicación', emailContent);
        }

        // Generar un token de JWT para el usuario
        const token = jwt.sign({
            id: user.id,
            user: user.user
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '2h'});

        const redirectUrl = `exp://192.168.1.129:8081/--/auth?userInfo=${encodeURIComponent(JSON.stringify(userInfo))}&token=${token}`;

        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Error verifying or registering user', error);
        res.status(500).send('User verification or registration failed');
    }
};
