import React from 'react';
import { ImageBackground, Text, View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const OnBoardingScreen = ({ navigation }) => {
    const [fontsLoaded] = useFonts({
        'Roboto-Medium': require('../../assets/fonts/Roboto-Medium.ttf'),
        'Roboto-Italic': require('../../assets/fonts/Roboto-Italic.ttf')
    });

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                        { name: 'Login' },
                    ],
                })
            );
        } catch (error) {
            console.error('Failed to save onboarding status', error);
        }
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <Swiper loop={false}>
            <ImageBackground
                style={styles.backgroundImage}
                source={require('../../assets/images/onboarding/OnBoarding-bg-1.jpg')}
            >
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Transformando la Movilidad Industrial</Text>
                    <Text style={styles.subtitle}>Juntos, optimizamos el transporte compartido.</Text>
                </View>
            </ImageBackground>
            <ImageBackground
                style={styles.backgroundImage}
                source={require('../../assets/images/onboarding/OnBoarding-bg-2.jpg')}
            >
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Eficiencia y Sostenibilidad</Text>
                    <Text style={styles.subtitle}>Aprovecha el poder del viaje compartido.</Text>
                </View>
            </ImageBackground>
            <ImageBackground
                style={styles.backgroundImage}
                source={require('../../assets/images/onboarding/OnBoarding-bg-3.jpg')}
            >
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Acelera tu Tiempo</Text>
                    <Text style={styles.subtitle}>Mejora tu productividad con nosotros.</Text>
                    <TouchableOpacity style={styles.button} onPress={completeOnboarding}>
                        <Text style={styles.buttonText}>Comienza Ahora</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </Swiper>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        position: 'absolute',
        bottom: 100,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontFamily: 'Roboto-Medium',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'Roboto-Italic',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    buttonText: {
        fontSize: 16,
        color: '#000',
        fontFamily: 'Roboto-Medium',
    },
});

export default OnBoardingScreen;