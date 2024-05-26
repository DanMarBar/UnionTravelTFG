import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/Navigation';
import { StripeProvider } from '@stripe/stripe-react-native';
import { LogBox } from 'react-native';
import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import { getInitialURL, subscribeToDeepLinks } from './src/service/Oauth';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const App = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const navigationRef = useRef();

    useEffect(() => {
        const handleInitialURL = async () => {
            await getInitialURL(navigationRef);
        };

        handleInitialURL();

        const unsubscribe = subscribeToDeepLinks(navigationRef);

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        const loadFonts = async () => {
            try {
                await Font.loadAsync({
                    'RalewayDots': require('./src/assets/fonts/RalewayDots-Regular.ttf'),
                });
                setFontsLoaded(true);
                console.log('Fuente RalewayDots cargada correctamente');
            } catch (e) {
                console.error('Error cargando las fuentes', e);
            }
        };

        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    return (
        <StripeProvider publishableKey="your-publishable-key">
            <NavigationContainer ref={navigationRef}>
                <AppNavigator />
            </NavigationContainer>
        </StripeProvider>
    );
};

export default App;
