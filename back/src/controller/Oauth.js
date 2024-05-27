import axios from 'axios';
import dotenv from 'dotenv';
import User from '../model/UserModel.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const REDIRECT_URI = 'https://4156-66-81-168-49.ngrok-free.app/authenticate';

export const redirectToGitHub = (req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'read:user user:email',
        allow_signup: 'true',
    });

    res.redirect(`${GITHUB_OAUTH_URL}?${params.toString()}`);
};

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
