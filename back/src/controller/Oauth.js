// controllers/oauthController.js
import stytchClient from '../config/Stytch.js';

const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const REDIRECT_URI = 'http://localhost:3000/authenticate'; // Asegúrate de que esta URL coincida con la que has registrado en Google

export const redirectToGoogle = (req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'openid email profile',
    });

    res.redirect(`${GOOGLE_OAUTH_URL}?${params.toString()}`);
};

export const googleAuth = async (req, res) => {
    const token = req.query.token;

    if (!token) {
        console.error('OAuth token not found in request.');
        return res.status(400).send('OAuth token not found.');
    }

    try {
        // Verifica el token con Stytch
        const authenticateResponse = await stytchClient.oauth.authenticate({
            token: token,
            session_duration_minutes: 60,
        });

        // Maneja la respuesta de autenticación
        res.json(authenticateResponse);
    } catch (error) {
        console.error('Error during Google OAuth authentication', error);
        res.status(500).send('Authentication failed');
    }
};
