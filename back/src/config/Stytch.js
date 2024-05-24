import { Client, envs } from 'stytch';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    project_id: process.env.STYTCH_PROJECT_ID,
    secret: process.env.STYTCH_SECRET,
    env: envs.test, // Usa 'envs.live' para el entorno de producción
});

export default client;
