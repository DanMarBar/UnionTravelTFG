import AsyncStorage from "@react-native-async-storage/async-storage";
import {findUserByEmail} from "../config/Api";
import {Alert} from "react-native";

// Obtiene toda la info del usuario con el email almacenado en el storage
export const obtainAllUserInfo = async () => {
    try {
        const userData = await AsyncStorage.getItem('userInfo');
        if (userData) {
            const userInfo = JSON.parse(userData);
            const response = await findUserByEmail(userInfo.email);
            return response.data
        } else {
            Alert.alert("Error", "No se encontró información del usuario");
        }
    } catch (error) {
        console.error('Error recuperando la info del usuario:', error);
        Alert.alert("Error del server", "No se pudo recuperar la información del usuario");
    }
};

// Obtiene toda la info del usuario con el email enviado por parametro
export const obtainAllUserInfoWithEmail = async (email) => {
    try {
        const response = await findUserByEmail(email);
        return response.data
    } catch (error) {
        console.error('Error recuperando la info del usuario:', error);
        Alert.alert("Error del server", "No se pudo recuperar la información del usuario");
    }
};