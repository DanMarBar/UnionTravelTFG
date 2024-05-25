import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'https://10da-66-81-168-49.ngrok-free.app';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const redirectUri = AuthSession.makeRedirectUri({
        useProxy: false,
        native: `${BACKEND_URL}/authenticate`
    });
    console.log('Redirect URI:', redirectUri);

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: "Ov23liVPnKd4Ud6L1ox8",
            redirectUri: `${BACKEND_URL}/authenticate`,
            scopes: ['read:user', 'user:email'],
        },
        { authorizationEndpoint: 'https://github.com/login/oauth/authorize' }
    );

    useEffect(() => {
        if (response?.type === 'success') {
            const { code } = response.params;

            fetch(`${BACKEND_URL}/authenticate?code=${code}`)
                .then(res => res.json())
                .then(data => {
                    AsyncStorage.setItem('userInfo', JSON.stringify(data));
                    navigation.replace('MainMenu');
                })
                .catch(error => {
                    console.error('Error fetching user info', error);
                    Alert.alert('Error', 'Failed to fetch user info');
                });
        }
    }, [response]);

    const handleLogin = async () => {
        try {
            const response = await loginUser({ email, password });
            await AsyncStorage.setItem('userToken', response.data.token);

            const userInfo = { email };
            await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
            navigation.replace('MainMenu');
        } catch (error) {
            console.error('Error logging in', error);
            Alert.alert('Error', 'Failed to log in');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.contentContainer}>
                    <View style={styles.topView}>
                        <Image
                            source={require('../assets/images/login-page.png')}
                            style={styles.imageLogin}
                        />
                    </View>
                    <StatusBar style="auto" />
                    <View style={styles.inputs}>
                        <MaterialIcons name="alternate-email" size={20} color="#666" style={{ marginRight: 5 }} />
                        <TextInput
                            placeholder="Email"
                            style={styles.input}
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                    <View style={styles.inputs}>
                        <MaterialIcons name="key" size={20} color="#666" style={{ marginRight: 5 }} />
                        <TextInput
                            placeholder="Password"
                            style={styles.input}
                            secureTextEntry={true}
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                    <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                    <Text style={styles.orText}>O, inicia sesión con...</Text>
                    <View style={styles.socialButtonsContainer}>
                        <TouchableOpacity onPress={() => promptAsync()} style={styles.socialButton}>
                            <Image source={require('../assets/images/misc/google.png')} style={styles.socialIcon} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.registerContainer}>
                        <Text>¿Eres nuevo? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerText}>Regístrate aquí</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    contentContainer: {
        paddingHorizontal: 25,
        paddingVertical: 40,
        marginHorizontal: 20,
        marginTop: 35,
        marginBottom: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 20,
    },
    topView: {
        alignItems: 'center',
        marginBottom: 5,
    },
    imageLogin: {
        width: 300,
        height: 300,
    },
    inputs: {
        flexDirection: 'row',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        paddingBottom: 8,
        marginBottom: 25,
    },
    input: {
        flex: 1,
        paddingVertical: 0,
    },
    loginButton: {
        backgroundColor: '#45c4a1',
        padding: 20,
        borderRadius: 10,
        marginBottom: 30,
    },
    loginButtonText: {
        textAlign: 'center',
        fontWeight: '700',
        color: '#fff',
        fontSize: 16,
    },
    orText: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 30,
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    socialButton: {
        borderColor: '#c0c0c0',
        borderWidth: 2,
        borderRadius: 10,
        paddingHorizontal: 30,
        paddingVertical: 10,
    },
    socialIcon: {
        height: 24,
        width: 24,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    registerText: {
        color: '#45c4a1',
        fontWeight: '700',
    },
});

export default LoginScreen;
