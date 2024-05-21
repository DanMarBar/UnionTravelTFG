import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { getMessages, createMessage } from '../../config/api';
import { joinGroup, sendMessage, onReceiveMessage, disconnectSocket } from '../../service/socket';
import { obtainAllUserInfo } from '../../utils/UserUtils';
import { obtainImgRoute } from '../../utils/ImageUtils';

const GroupChat = ({ route }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [groupId, setGroupId] = useState(null);

    useEffect(() => {
        const fetchUserAndMessages = async () => {
            try {
                const userResponse = await obtainAllUserInfo();
                setUserData(userResponse);
                setGroupId(route.params.group.Group.id);

                joinGroup(route.params.group.Group.id);
                const messagesResponse = await getMessages(route.params.group.Group.id);

                setMessages(messagesResponse.data);

                onReceiveMessage((message) => {
                    setMessages((prevMessages) => [...prevMessages, message]);
                });

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndMessages();

        return () => {
            disconnectSocket();
        };
    }, [route.params.group.Group.id]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;

        const message = {
            content: newMessage,
            userId: userData.id,
            groupId: groupId,
            User: userData
        };

        console.log(message);

        try {
            const createdMessage = await createMessage(groupId, message);
            sendMessage(createdMessage.data);

            const newMessageWithUser = {
                ...createdMessage.data,
                User: userData
            };

            setMessages((prevMessages) => [...prevMessages, newMessageWithUser]);
            setNewMessage('');
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()} // Fallback key extractor
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.messageContainer,
                            item.userId === userData.id ? styles.myMessage : styles.otherMessage
                        ]}
                    >
                        {item.User && (
                            <Image source={{ uri: obtainImgRoute(item.User.profilePhoto) }} style={styles.profilePhoto} />
                        )}
                        <View style={item.userId === userData.id ? styles.myMessageContent : styles.otherMessageContent}>
                            {item.User && <Text style={styles.userName}>{item.User.user}</Text>}
                            <Text style={styles.messageContent}>{item.content}</Text>
                        </View>
                    </View>
                )}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Escribe un mensaje"
                />
                <Button title="Enviar" onPress={handleSendMessage} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#dcf8c6',
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#ffffff',
    },
    profilePhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userName: {
        fontWeight: 'bold',
    },
    messageContent: {
        flex: 1,
    },
    myMessageContent: {
        backgroundColor: '#dcf8c6',
        padding: 10,
        borderRadius: 10,
        maxWidth: '80%',
    },
    otherMessageContent: {
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 10,
        maxWidth: '80%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    input: {
        flex: 1,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
});

export default GroupChat;
