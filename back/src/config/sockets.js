import ChatMessageModel from '../model/ChatMessageModel.js';

const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('a user connected');

        socket.on('joinGroup', (groupId) => {
            socket.join(groupId);
            console.log(`User joined group ${groupId}`);
        });

        socket.on('sendMessage', async (data) => {
            const {content, userId, groupId} = data;

            try {
                const message = await ChatMessageModel.create({content, userId, groupId});
                io.to(groupId).emit('receiveMessage', message);
            } catch (error) {
                console.error(error);
            }
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
};

export default initializeSocket;
