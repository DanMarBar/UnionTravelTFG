import React, {useEffect, useState} from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

// En proceso
const GoogleUp = () => {
    const [userInfo, setUserInfo] = useState(null);
    const BACKEND_URL = 'https://bd96-66-81-175-61.ngrok-free.app';

    const handlePress = async () => {
        const authUrl = `${BACKEND_URL}/auth/google`;
        const result = await WebBrowser.openAuthSessionAsync(authUrl);
        console.log(authUrl);
    };

    const fetchUserInfo = async (accessToken) => {
        const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userData = await response.json();
        setUserInfo(userData);
    };

    useEffect(() => {
    }, []);



    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handlePress} style={styles.circle}>
                <Text style={styles.text}>G</Text>
            </TouchableOpacity>
            {userInfo && (
                <View>
                    <Text>Nombre: {userInfo.name}</Text>
                    <Text>Email: {userInfo.email}</Text>
                </View>
            )}
        </View>
    );
};

export default GoogleUp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#DEB887",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        color: "white",
        fontSize: 20,
    },
});
