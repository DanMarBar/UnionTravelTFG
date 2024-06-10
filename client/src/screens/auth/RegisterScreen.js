import React, {useEffect, useRef, useState} from 'react'
import {StatusBar} from 'expo-status-bar';
import {
    Alert,
    Animated,
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
import {registerNewUser} from "../../config/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {CommonActions} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import {useGitHubAuth} from "../../service/Oauth";

const RegisterScreen = ({navigation}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(true);
    const errorHeight = useRef(new Animated.Value(0)).current;
    const {request, promptAsync} = useGitHubAuth(navigation);

    useEffect(() => {
        Animated.timing(errorHeight, {
            toValue: isValidEmail ? 0 : 30,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isValidEmail]);

    const resetNavigation = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    {name: 'MainMenu'},
                ],
            })
        );
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (input) => {
        setEmail(input);
        setIsValidEmail(validateEmail(input));
    };

    const registerUser = async () => {
        try {
            if (!isValidEmail) {
                return Alert.alert("El correo no es valido", 'Por favor, introduce un email' +
                    ' válido.');
            }

            const response = await registerNewUser({name, email, password, confirmPassword});
            if (response.status >= 200 && response.status < 300) {
                const userInfo = {
                    name: name,
                    email: email,
                };

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Bienvenido a Union Travel",
                        body: "Tu registro fue exitoso, te deseamos lo mejos",
                        sound: 'default',
                    },
                    trigger: { seconds: 1 },
                });

                await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
                await AsyncStorage.setItem('userToken', response.data.token);
                resetNavigation();
            }

        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data.error;
                console.log(error.response.data.error);
                Alert.alert("Error en introducir los datos:", errorMessage);

            } else {
                console.error("Error en el registro:", error);
                Alert.alert("Error al registrar el usuario", error.toString());
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require('../../assets/images/RegisterFondo.jpg')}
                style={styles.background}
                resizeMode="cover"
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.contentContainer}>
                        <StatusBar style="auto"/>
                        <Text style={styles.title}>Crear Cuenta</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nombre de Usuario</Text>
                            <View style={styles.inputs}>
                                <MaterialIcons name="person" size={20} color="#666" style={{ marginRight: 5 }} />
                                <TextInput
                                    placeholder="Nombre de usuario"
                                    style={styles.input}
                                    keyboardType="default"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>
                        <Animated.View style={[styles.errorContainer, { height: errorHeight }]}>
                            {!isValidEmail && (
                                <Text style={styles.errorText}>Por favor, introduce un email válido.</Text>
                            )}
                        </Animated.View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={styles.inputs}>
                                <MaterialIcons name="alternate-email" size={20} color="#666" style={{ marginRight: 5 }} />
                                <TextInput
                                    placeholder="Email"
                                    style={styles.input}
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={handleEmailChange}
                                />
                            </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Contraseña</Text>
                            <View style={styles.inputs}>
                                <MaterialIcons name="key" size={20} color="#666" style={{ marginRight: 5 }} />
                                <TextInput
                                    placeholder="Contraseña"
                                    style={styles.input}
                                    secureTextEntry={true}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
                            <View style={styles.inputs}>
                                <MaterialIcons name="key" size={20} color="#666" style={{ marginRight: 5 }} />
                                <TextInput
                                    placeholder="Confirmar Contraseña"
                                    style={styles.input}
                                    secureTextEntry={true}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>
                        </View>
                        <TouchableOpacity onPress={registerUser} style={styles.loginButton}>
                            <Text style={styles.loginButtonText}>Registrarse</Text>
                        </TouchableOpacity>
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.orText}>O..., regístrate con...</Text>
                            <View style={styles.divider} />
                        </View>
                        <View style={styles.socialButtonsContainer}>
                            <TouchableOpacity onPress={() => promptAsync()}
                                              style={styles.socialButton}>
                                <Image source={require('../../assets/images/misc/git.png')}
                                       style={styles.socialIcon}/>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.registerContainer}>
                            <Text style={styles.registerQuestionText}>¿Ya estás registrado? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.registerText}>Inicia sesión aquí</Text>
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
        marginHorizontal: 10,
        backgroundColor: 'rgba(0,0,0,0.91)',
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
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        color: 'rgba(225,105,105,0.53)',
        backgroundColor: '#ffebeb',
        overflow: 'hidden',
        justifyContent: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
    },
});

export default RegisterScreen;