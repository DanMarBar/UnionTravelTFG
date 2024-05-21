import express from "express";
import {createMessage, getMessages} from "../controller/ChatMessage.js";

const router = express.Router();

// Chatrooms
router.post('/groups/:groupId/messages', createMessage);
router.get('/groups/:groupId/messages', getMessages)

export default router;
