import User from '../model/UserModel.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import stytchClient from '../config/Stytch.js';

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
        return res.status(201).json({message: "User created successfully", user, token});

    } catch (error) {
        console.log(" Error registrando al usuario", error)
        return res.status(400).json({error: "Error registrando al usuario"});
    }
};

// Logea al usuario en la app
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
        if (!isValid) {
            console.log("wrong password")
            return res.status(400).json({error: "Contraseña no válida"});
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