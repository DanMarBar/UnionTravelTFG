import io from 'socket.io-client';
import { serverConnectionId } from '../config/api';

const socket = io(serverConnectionId);

export const joinGroup = (groupId) => {
    socket.emit('joinGroup', groupId);
};

export const sendMessage = (message) => {
    socket.emit('sendMessage', message);
};

export const onReceiveMessage = (callback) => {
    socket.on('receiveMessage', callback);
};

export const disconnectSocket = () => {
    socket.off('receiveMessage');
    socket.disconnect();
};

export default socket;
