import React, {useState} from 'react'
import {StatusBar} from 'expo-status-bar';
import {
    Alert,
    Image,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import {loginUser} from "../config/api";
import AsyncStorage from '@react-native-async-storage/async-storage'

const LoginScreen = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Se encarga de logear al usuario en la aplicacion. Si ocurre algo se informa al usuario
    // por alert
    const handleLogin = async () => {
        try {
            const response = await loginUser({email, password});
            await AsyncStorage.setItem('userToken', response.data.token);

            const userInfo = {
                email: email,
            };

            await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
            navigation.replace('MainMenu');

        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data.error;
                console.log("Error de inicio de sesión:", errorMessage);
                Alert.alert("Error de Inicio de Sesión", errorMessage);

            } else if (error.request) {
                console.log('Error de inicio de sesión: No se recibió respuesta del servidor');
                Alert.alert("Error de Inicio de Sesión", "No se recibió respuesta del servidor");

            } else {
                console.log('Error de inicio de sesión:', error.message);
                Alert.alert("Error al iniciar sesión", "Ha ocurrido un error inesperado");
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require('../assets/images/PlazaFondo.jpg')}
                style={styles.background}
                resizeMode="cover"
            >
                <ScrollView>
                    <View style={styles.contentContainer}>
                        <View style={styles.topView}>
                            <Image
                                source={require('../assets/images/login-page.png')}
                                style={styles.imageLogin}
                            />
                        </View>
                        <StatusBar style="auto"/>
                        <View style={styles.inputs}>
                            <MaterialIcons name="alternate-email" size={20} color="#666"
                                           style={{marginRight: 5}}/>
                            <TextInput
                                placeholder="email"
                                style={styles.input}
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                        <View style={styles.inputs}>
                            <MaterialIcons name="key" size={20} color="#666"
                                           style={{marginRight: 5}}/>
                            <TextInput
                                placeholder="Password"
                                style={styles.input}
                                secureTextEntry={true}
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => handleLogin()}
                            style={styles.loginButton}
                        >
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>
                        <Text style={styles.orText}>O, Inicia sesion con...</Text>
                        <View style={styles.socialButtonsContainer}>
                            <TouchableOpacity onPress={() => {
                            }} style={styles.socialButton}>
                                <Image source={require('../assets/images/misc/google.png')}
                                       style={styles.socialIcon}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                            }} style={styles.socialButton}>
                                <Image source={require('../assets/images/misc/facebook.png')}
                                       style={styles.socialIcon}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                            }} style={styles.socialButton}>
                                <Image source={require('../assets/images/misc/twitter.png')}
                                       style={styles.socialIcon}/>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.registerContainer}>
                            <Text>Eres nuevo? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerText}>Registrate aqui</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    background: {
        flex: 1,
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