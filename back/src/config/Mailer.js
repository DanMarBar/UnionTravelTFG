import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuracion de nodemailer
let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Configuracion del email
function sendEmail(to, subject, text) {
    let mailOptions = {
        from: process.env.EMAIL_FROM,
        to: to,
        subject: subject,
        text: text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error al enviar el correo electrónico:", error);
        } else {
            console.log("Correo electrónico enviado: %s", info.messageId);
        }
    });
}

export default sendEmail;
