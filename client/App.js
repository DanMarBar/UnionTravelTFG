// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/Navigation';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
    return (
        <StripeProvider publishableKey={"pk_test_51PHrIw08Duz5BBWEIcQve9H0VFiPYcKCwWX7HYinfTI54281FBz4XLnacrERsXRIQcjkDb2leubrbkOJYVBimuVZ00xgN7LUeC"}>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </StripeProvider>
    );
}
