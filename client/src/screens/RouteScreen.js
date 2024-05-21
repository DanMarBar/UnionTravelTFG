import React, {useState} from 'react';
import {Alert, ImageBackground, Linking, SafeAreaView, StyleSheet, View} from 'react-native';
import {Button, Input} from 'react-native-elements';

const RouteFormScreen = () => {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');

    // Dadas dos rutas optenidas de los parametros envia al usuario a maps con las rutas entre
    // los dos destinos
    const openGoogleMaps = () => {
        if (!origin.trim() || !destination.trim()) {
            Alert.alert('Error', 'Por favor, completa ambos campos.');
            return;
        }
        const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
        Linking.openURL(url).catch(err => console.error("No se pudo cargar Google Maps", err));
    };

    return (<SafeAreaView style={styles.container}>
        <ImageBackground
            source={require('../assets/images/PlazaFondo.jpg')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.containerBg}>
                <Input
                    placeholder="Dirección de origen"
                    value={origin}
                    onChangeText={setOrigin}
                    leftIcon={{type: 'material-icons', name: 'my-location'}}
                    containerStyle={styles.inputContainer}
                />
                <Input
                    placeholder="Dirección de destino"
                    value={destination}
                    onChangeText={setDestination}
                    leftIcon={{type: 'material-icons', name: 'place'}}
                    containerStyle={styles.inputContainer}
                />
                <Button
                    title="Abrir en Google Maps"
                    onPress={openGoogleMaps}
                    containerStyle={styles.buttonContainer}
                    buttonStyle={styles.button}
                    icon={{
                        name: 'map', type: 'material-icons', size: 25, color: 'white',
                    }}
                    iconRight
                />
            </View>
        </ImageBackground>
    </SafeAreaView>);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }, inputContainer: {
        marginBottom: 15,
    }, background: {
        flex: 1, justifyContent: 'center', padding: 20
    }, containerBg: {
        justifyContent: 'center', backgroundColor: 'white', padding: 30
    }, buttonContainer: {
        marginTop: 20, width: '100%',
    }, button: {
        backgroundColor: '#2196F3', paddingVertical: 10,
    },
});

export default RouteFormScreen;
