import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, Linking} from 'react-native';
import {useEffect} from 'react';

const BACKEND_URL = 'https://4156-66-81-168-49.ngrok-free.app';

const clientId = "Ov23liVPnKd4Ud6L1ox8";

const redirectUri = AuthSession.makeRedirectUri({
    useProxy: false,
    native: `${BACKEND_URL}/authenticate`
});

const authRequestConfig = {
    clientId: clientId,
    redirectUri: `${BACKEND_URL}/authenticate`,
    scopes: ['read:user', 'user:email'],
};

const authRequestOptions = {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize'
};

const getGitHubUserInfo = async (code, navigation) => {
    try {
        const res = await fetch(`${BACKEND_URL}/authenticate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({code}),
        });

        const data = await res.json();

        const {email, login: name} = data;
        const userInfo = {name, email};


        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        navigation.replace('MainMenu');

    } catch (error) {
        console.error('Error fetching user info', error);
        Alert.alert('Error', 'Failed to fetch user info');
    }
};

export const useGitHubAuth = (navigation) => {
    const [request, response, promptAsync] = AuthSession.useAuthRequest(authRequestConfig, authRequestOptions);
    useEffect(() => {
        if (response?.type === 'success') {
            const {code} = response.params;

            getGitHubUserInfo(code, navigation);
        }
    }, [response]);

    return {request, promptAsync};
};

const handleDeepLink = async (event, navigationRef) => {
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

    if (userInfo) {
        const { email, login: name } = userInfo;
        const storedUserInfo = { name, email };
        await AsyncStorage.setItem('userInfo', JSON.stringify(storedUserInfo));
        navigationRef.current?.navigate('MainMenu');
    }
};

const getInitialURL = async (navigationRef) => {
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
        console.log('Initial URL:', initialUrl); // Imprime la URL inicial
        handleDeepLink({ url: initialUrl }, navigationRef);
    }
};

const subscribeToDeepLinks = (navigationRef) => {
    const subscription = Linking.addEventListener('url', (event) => handleDeepLink(event, navigationRef));
    return () => {
        subscription.remove();
    };
};

export { handleDeepLink, getInitialURL, subscribeToDeepLinks };