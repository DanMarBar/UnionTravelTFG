import React from 'react';
import {Image} from 'react-native';
import {useFonts} from 'expo-font';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CommonActions} from '@react-navigation/native';

const OnBoardingScreen = ({navigation}) => {
    const [fontsLoaded] = useFonts({
        'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
        'Roboto-Italic': require('../assets/fonts/Roboto-Italic.ttf')
    });

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                        {name: 'Login'},
                    ],
                })
            );
        } catch (error) {
            console.error('Failed to save onboarding status', error);
        }
    };

    const handleOnboardingFinish = async () => {
        await completeOnboarding();
    };

    if (!fontsLoaded) {
        return null;
    }

    const markOnboardingComplete = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        } catch (error) {
            console.error('Failed to save onboarding status', error);
        }
    };


    return (
        <Onboarding
            onSkip={handleOnboardingFinish}
            onDone={handleOnboardingFinish}
            pages={[
                {
                    backgroundColor: '#a6e4d0',
                    image: <Image style={{width: 300, height: 300}}
                                  source={require('../assets/images/onboarding/onboarding-img1.png')}/>,
                    title: 'Construyamos juntos un mejor futuro',
                    subtitle: 'Entre todos podemos crear un mundo mejor',
                },
                {
                    backgroundColor: '#fdeb93',
                    image: <Image style={{width: 300, height: 300}}
                                  source={require('../assets/images/onboarding/onboarding-img2.png')}/>,
                    title: 'Todos para uno',
                    subtitle: 'Uno para todos',
                },
                {
                    backgroundColor: '#e9bcbe',
                    image: <Image style={{width: 300, height: 300}}
                                  source={require('../assets/images/onboarding/onboarding-img3.png')}/>,
                    title: 'Acelera tu tiempo',
                    subtitle: 'Y mejora tu calidad de vida',
                }
            ]}
        />
    );
};

export default OnBoardingScreen;
