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
import {registerNewUser} from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {CommonActions} from "@react-navigation/native";

const RegisterScreen = ({navigation}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(true);
    const errorHeight = useRef(new Animated.Value(0)).current;

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

                await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
                await AsyncStorage.setItem('userToken', response.data.token);
                resetNavigation();
            }

        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data.error;
                console.log(errorMessage + error);
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
                source={require('../assets/images/RegisterFondo.jpg')}
                style={styles.background}
                resizeMode="cover"
            >
                <ScrollView>
                    <View style={styles.contentContainer}>
                        <View style={styles.topView}>
                            <Image
                                source={require('../assets/images/register-page.png')}
                                style={styles.imageLogin}
                            />
                        </View>
                        <StatusBar style="auto"/>
                        <View style={styles.inputs}>
                            <MaterialIcons name="person" size={20} color="#666"
                                           style={{marginRight: 5}}/>
                            <TextInput
                                placeholder="nombre de usuario"
                                style={styles.input}
                                keyboardType={"default"}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                        <Animated.View style={[styles.errorContainer, {height: errorHeight}]}>
                            {!isValidEmail && (
                                <Text style={styles.errorText}>Por favor, introduce un email
                                    válido.</Text>
                            )}
                        </Animated.View>
                        <View style={styles.inputs}>
                            <MaterialIcons name="alternate-email" size={20} color="#666"
                                           style={{marginRight: 5}}/>
                            <TextInput
                                placeholder="email"
                                style={styles.input}
                                keyboardType="email-address"
                                value={email}
                                onChangeText={handleEmailChange}
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
                        <View style={styles.inputs}>
                            <MaterialIcons name="key" size={20} color="#666"
                                           style={{marginRight: 5}}/>
                            <TextInput
                                placeholder="Confirm Password"
                                style={styles.input}
                                secureTextEntry={true}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={registerUser}
                            style={styles.loginButton}
                        >
                            <Text style={styles.loginButtonText}>Registrarse</Text>
                        </TouchableOpacity>
                        <Text style={styles.orText}>O..., registrate con...</Text>
                        <View style={styles.socialButtonsContainer}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Image source={require('../assets/images/misc/google.png')}
                                       style={styles.socialIcon}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Image source={require('../assets/images/misc/facebook.png')}
                                       style={styles.socialIcon}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Image source={require('../assets/images/misc/twitter.png')}
                                       style={styles.socialIcon}/>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.registerContainer}>
                            <Text>Ya estás registrado? </Text>
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