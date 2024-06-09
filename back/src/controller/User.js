import User from '../model/UserModel.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import sendEmail from "../config/Mailer.js";

dotenv.config();

// Se encarga de registar al usuario en la base de datos
export const registerNewUser = async (req, res) => {
    try {
        const name = req.body.name
        const email = req.body.email
        const password = req.body.password
        const confirmPassword = req.body.confirmPassword

        // Longitud de nombre o contraseña
        const dataLength = await validateUserCharacterLenght(name, password)
        if (!dataLength[0] || !dataLength) {
            return res.status(403).json({error: dataLength[1]});
        }

        // Que el email no este registrado
        const userFromDataBaseWithEmail = await User.findOne({where: {user: req.body.email}});
        if (userFromDataBaseWithEmail) {
            return res.status(403).json({error: "El correo " + email + "ya existe"});
        }

        // Ambas contraseñas iguales
        if (confirmPassword !== password) {
            return res.status(403).json({error: "Ambas contraseñas tienen que ser iguales"});
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({
            user: name,
            email: email,
            password: hashedPassword
        });

        const token = jwt.sign({
            id: user.id,
            user: user.user
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '2h'});

        // Crear el contenido del correo en formato HTML
        const emailContent = `
            Bienvenido a nuestra aplicación
            Hola ${name}
            Gracias por registrarte en nuestra aplicación! Estamos encantados de tenerte con nosotros
            Si tienes alguna pregunta, no dudes en contactarnos
            Saludos, El equipo de nuestra aplicación
        `;

        // Enviar correo de bienvenida
        sendEmail(email, 'Bienvenido a nuestra aplicación', emailContent);

        return res.status(201).json({message: "User created successfully", user, token});

    } catch (error) {
        console.log(" Error registrando al usuario", error)
        return res.status(400).json({error: "Error registrando al usuario"});
    }
};

// Logea al usuario en la app, se puede introducir la contraseña temporal
export const loginUser = async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    try {
        const user = await User.findOne({where: {email: email}});
        if (!user) {
            console.log("user cant be found")
            return res.status(400).json({error: "Usuario no encontrado"});
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid && !await validateTemporalPassword(password, user.tempPassword)) {
            console.log("wrong password")
            return res.status(400).json({
                error: "La contraseña no coincide con el correo electronico"
            });
        }

        const token = jwt.sign({
            id: user.id,
            user: user.user
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '2h'});

        console.log("login successful")
        res.json({message: "Login successful", token});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error iniciando sesión"});
    }
};

// Buscar usuario por email
export const findUserByEmail = async (req, res) => {
    const email = req.params.email
    const user = await User.findOne({where: {email: email}})
    return await res.json(user)
};

export const manageUpdateUserByEmail = async (req, res,) => {
    const {email} = req.params;
    const {
        name,
        surname,
        birthday,
        cellphone,
        secondCellphone,
        direction,
        zip,
    } = req.body;
    console.log(birthday)

    // Verificar que la imagen no sea null
    let profilePhoto = req.file ? req.file.path : null;
    if (profilePhoto == null) {
        const user = await User.findOne({where: {email: email}})
        if (user.profilePhoto != null) {
            profilePhoto = user.profilePhoto
        }
    }

    try {
        const [updatedRows] = await User.update({
            name,
            surname,
            birthday,
            cellphone,
            secondCellphone,
            direction,
            zip,
            profilePhoto,
        }, {
            where: {email}
        });

        return res.json("Usuario actualizado correctamente");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al actualizar el usuario");
    }
};

// Cambiar contraseña del usuario
export const changeUserPasswordByEmail = async (req, res) => {
    const {email} = req.params;
    const {newPassword, confirmNewPassword} = req.body;

    try {
        const user = await User.findOne({where: {email: email}});
        if (!user) {
            return res.status(404).json({error: "Usuario no encontrado"});
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({error: "La nueva contraseña y la confirmación no coinciden"});
        }

        if (newPassword.length < 5) {
            return res.status(400).json({error: "La nueva contraseña debe tener al menos 5 caracteres"});
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await User.update({password: hashedNewPassword}, {where: {email}});

        return res.status(200).json({message: "Contraseña actualizada correctamente"});
    } catch (error) {
        console.error("Error cambiando la contraseña del usuario:", error);
        return res.status(500).json({error: "Error cambiando la contraseña del usuario"});
    }
};

// Asigna contraseña temporal al usuario y la envie por gmail
export const createTempPasswordByEmail = async (req, res) => {
    const {email} = req.params;

    try {
        const user = await User.findOne({where: {email: email}});
        if (!user) {
            console.log("El usuario introdujo un correo que no existe en nuestra bd")
            return res.status(404).json({error: "Usuario no encontrado con ese correo"});
        }

        const newTempPassword = generateTempPassword();
        const emailContent = `
            Hola ${user.user}
            Te enviamos tu contraseña temporal con la que podras inciar sesion: 
            ${newTempPassword}
            Te recomendamos que no la compartas con nadie y que inmediatemente vayas a cambiar tu contraseña
            Atentamente, el equipo de UnionTravel
        `;

        // Enviar correo para avisar de cambio de contraseña
        sendEmail(email, 'Bienvenido a nuestra aplicación', emailContent);

        const hashedNewTempPassword = await bcrypt.hash(newTempPassword, 10);
        await User.update({tempPassword: hashedNewTempPassword}, {where: {email}});

        return res.status(200).json({message: "Contraseña actualizada correctamente"});

    } catch (error) {
        console.error("Error cambiando la contraseña del usuario:", error);
        return res.status(500).json({error: "Error cambiando la contraseña del usuario"});
    }
};

const generateTempPassword = (length = 8) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};

// Verifica que los datos dados por el usuario cumplan con lo esperado para poder registrarlo
const validateUserCharacterLenght = async (name, password) => {
    if (name.length < 5) {
        console.log("La constraseña debe de tener mas de 5 caracteres")
        return [false, "La constraseña debe de tener mas de 5 caracteres"]
    }

    if (password.length < 5) {
        console.log("La constraseña debe de tener mas de 5 caracteres")
        return [false, "La constraseña debe de tener mas de 5 caracteres"]
    }
    return [true, "Exito!"]
}

// Verificar si el usuario introdujo una contraseña temporal
const validateTemporalPassword = async (tempPassword, expectedTempPassword) => {
    if (expectedTempPassword === undefined || expectedTempPassword === null || expectedTempPassword === '') {
        return false
    }
    return await bcrypt.compare(tempPassword, expectedTempPassword)
}