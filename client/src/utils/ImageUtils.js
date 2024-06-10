import * as ImagePicker from "expo-image-picker";
import {serverConnectionId} from "../config/Api";

// Gestionar el cambio de imagen
export const handleImageChange = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
    });

    if (!result.cancelled && result.assets) {
        const firstAsset = result.assets[0];
        return {uri: firstAsset.uri}
    }
}

// Obtener la ruta de la imagen
export const obtainImgRoute = (imageUri) => {
    return serverConnectionId + '/' + imageUri
}