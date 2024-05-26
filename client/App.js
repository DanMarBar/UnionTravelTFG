import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/Navigation';
import { StripeProvider } from '@stripe/stripe-react-native';
import { LogBox } from 'react-native';
import { getInitialURL, subscribeToDeepLinks } from './src/service/Oauth';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const App = () => {
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

    return (
        <StripeProvider publishableKey="pk_test_51PHrIw08Duz5BBWEIcQve9H0VFiPYcKCwWX7HYinfTI54281FBz4XLnacrERsXRIQcjkDb2leubrbkOJYVBimuVZ00xgN7LUeC">
            <NavigationContainer ref={navigationRef}>
                <AppNavigator />
            </NavigationContainer>
        </StripeProvider>
    );
};

export default App;
