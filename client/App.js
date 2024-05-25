import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/Navigation';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as Linking from 'expo-linking';
import { LogBox } from 'react-native';

// Ignorar advertencias irrelevantes para esta prueba
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const App = () => {
    useEffect(() => {
        const handleDeepLink = (event) => {
            const url = event.url;
            console.log('Received URL:', url); // Imprime la URL recibida

            const parseUrl = (url) => {
                const [path, queryString] = url.split('?');
                if (queryString) {
                    const params = new URLSearchParams(queryString);
                    const userInfo = params.get('userInfo') ? JSON.parse(decodeURIComponent(params.get('userInfo'))) : null;
                    return { path, userInfo };
                }
                return { path };
            };

            const { path, userInfo } = parseUrl(url);
            console.log('Parsed path:', path);
            console.log('User Info:', userInfo);
            // Manejar la información del usuario según sea necesario
        };

        const getInitialURL = async () => {
            const initialUrl = await Linking.getInitialURL();
            if (initialUrl) {
                console.log('Initial URL:', initialUrl); // Imprime la URL inicial
                handleDeepLink({ url: initialUrl });
            }
        };

        getInitialURL();

        const subscription = Linking.addEventListener('url', handleDeepLink);

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <StripeProvider publishableKey="pk_test_51PHrIw08Duz5BBWEIcQve9H0VFiPYcKCwWX7HYinfTI54281FBz4XLnacrERsXRIQcjkDb2leubrbkOJYVBimuVZ00xgN7LUeC">
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </StripeProvider>
    );
};

export default App;
