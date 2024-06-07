import React, {useState} from 'react';
import {StatusBar} from 'expo-status-bar';
import {
    Alert,
    Image, ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useGitHubAuth} from '../service/Oauth';
import {loginUser} from "../config/api";
import {BackgroundImage} from "react-native-elements/dist/config";

const LoginScreen = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const {request, promptAsync} = useGitHubAuth(navigation);

    const handleLogin = async () => {
        try {
            const response = await loginUser({email, password});
            await AsyncStorage.setItem('userToken', response.data.token);

            const userInfo = {email};
            await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
            navigation.replace('MainMenu');

        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data.error;
                console.log(errorMessage + error);
                Alert.alert("Error al iniciar sesion:", errorMessage);
            }else {
                console.error('Error logging in', error);
                Alert.alert('Error', 'No se puede iniciar sesion');
            }
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require('../assets/images/loginBg.jpg')}
                style={styles.background}
                resizeMode="cover"
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.contentContainer}>
                        <StatusBar style="auto" />
                        <Text style={styles.title}>Iniciar Sesión</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Email</Text>
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
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Contraseña</Text>
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
                        </View>
                        <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.orText}>O inicia sesión con...</Text>
                            <View style={styles.divider} />
                        </View>
                        <View style={styles.socialButtonsContainer}>
                            <TouchableOpacity onPress={() => promptAsync()} style={styles.socialButton}>
                                <Image source={require('../assets/images/misc/google.png')} style={styles.socialIcon} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.registerContainer}>
                            <Text style={styles.registerQuestionText}>¿No tienes cuenta?  </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerText}>Regístrate aquí</Text>
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
    },
    background: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    contentContainer: {
        paddingHorizontal: 25,
        paddingVertical: 40,
        marginHorizontal: 20,
        backgroundColor: 'rgba(0,0,0,0.89)',
        borderRadius: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 25,
    },
    inputLabel: {
        color: '#fff',
        marginBottom: 5,
    },
    inputs: {
        flexDirection: 'row',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        paddingBottom: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 0,
        color: '#fff',
    },
    loginButton: {
        backgroundColor: '#f80000',
        padding: 20,
        borderRadius: 10,
        marginBottom: 30,
        marginTop: 20,
    },
    loginButtonText: {
        textAlign: 'center',
        fontWeight: '700',
        color: '#fff',
        fontSize: 16,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
    },
    orText: {
        textAlign: 'center',
        color: '#666',
        marginHorizontal: 10,
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
        alignItems: 'center',
        marginBottom: 30,
    },
    registerQuestionText: {
        color: '#fff',
    },
    registerText: {
        color: '#ff0000',
        fontWeight: '700',
    },
});

export default LoginScreen;
