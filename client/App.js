import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/Navigation';
import { StripeProvider } from '@stripe/stripe-react-native';
import { LogBox, Platform } from 'react-native';
import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import { getInitialURL, subscribeToDeepLinks } from './src/service/Oauth';
import { registerForPushNotificationsAsync } from './src/utils/NotificationHandler';

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

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            console.log('Push Notification Token:', token);
        });

        Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification Received:', notification);
        });

        Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification Response Received:', response);
        });

    }, []);

    return (
        <StripeProvider publishableKey="pk_test_51PHrIw08Duz5BBWEIcQve9H0VFiPYcKCwWX7HYinfTI54281FBz4XLnacrERsXRIQcjkDb2leubrbkOJYVBimuVZ00xgN7LUeC">
            <NavigationContainer ref={navigationRef}>
                <AppNavigator />
            </NavigationContainer>
        </StripeProvider>
    );
};

export default App;
