import ChatMessageModel from '../model/ChatMessageModel.js';
import UserModel from "../model/UserModel.js";

// Se guarda el mensaje enviado dentro de la base de datos
export const createMessage = async (req, res) => {
    const {groupId} = req.params;
    const {content, userId} = req.body;

    try {
        const message = await ChatMessageModel.create({content, userId, groupId});
        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

// Obtiene los mensajes del grupo cuya id fue pasada por parametro
export const getMessages = async (req, res) => {
    const { groupId } = req.params;

    try {
        const messages = await ChatMessageModel.findAll({
            where: { groupId },
            include: [
                {
                    model: UserModel,
                    attributes: ['id', 'user', 'profilePhoto']
                }
            ]
        });
        res.status(200).json(messages);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
