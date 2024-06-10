import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Icon} from 'react-native-elements';
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import {mapStyle} from "../utils/MapUtils";
import DigitalClock from './modals/DigitalClock';

const MainMenuScreen = ({navigation}) => {
    const [userInfo, setUserInfo] = useState({});
    const [currentLocation, setCurrentLocation] = useState(null);

    useEffect(() => {
        // Obtiene la información del usuario
        const getUserInfo = async () => {
            try {
                const userData = await AsyncStorage.getItem('userInfo');
                if (userData) {
                    setUserInfo(JSON.parse(userData));
                } else {
                    Alert.alert("Error", "No se encontró información del usuario");
                }
            } catch (error) {
                console.error('Error retrieving user info:', error);
                Alert.alert("Error", "No se pudo recuperar la información del usuario");
            }
        };

        // Obtiene la ubicación actual del usuario
        const getCurrentLocation = async () => {
            try {
                let {status} = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permiso de ubicación denegado', 'Por favor, habilita los servicios de ubicación en la configuración del dispositivo.');
                    setCurrentLocation({
                        latitude: 37.78825,
                        longitude: -122.4324,
                    });
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                setCurrentLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch (error) {
                console.error('Error obteniendo la ubicación:', error);
                setCurrentLocation({
                    latitude: 37.78825,
                    longitude: -122.4324,
                });
            }
        };

        getUserInfo();
        getCurrentLocation();
    }, []);

    if (!currentLocation) {
        return <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando...</Text>
        </View>
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.mainTitle}>Menu principal</Text>
                <Text style={styles.welcomeText}>Bienvenido de vuelta, {userInfo.name}</Text>
            </View>
            <View style={styles.clockContainer}>
                <DigitalClock />
            </View>
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    customMapStyle={mapStyle}
                >
                    <Marker
                        coordinate={currentLocation}
                        title={"Tu ubicación"}
                        description={"Aquí estás"}
                    />
                </MapView>
            </View>
            <View style={styles.menuContainer}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('CarsListScreen')}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="car" type="font-awesome" size={20} color="#FF0000" />
                    </View>
                    <Text style={styles.menuText}>Vehículos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('InsertCarScreen')}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="plus" type="font-awesome" size={23} color="#FF0000" />
                    </View>
                    <Text style={styles.menuText}>Nuevo auto</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('UserProfileScreen')}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="edit" type="font-awesome" size={20} color="#FF0000" />
                    </View>
                    <Text style={styles.menuText}>Actualizar cuenta</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('UserDetailScreen')}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="user" type="font-awesome" size={20} color="#FF0000" />
                    </View>
                    <Text style={styles.menuText}>Ver mi perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('InsertGroupScreen')}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="male" type="font-awesome" size={20} color="#FF0000" />
                    </View>
                    <Text style={styles.menuText}>Crear Grupo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('ViewAllGroupsScreen')}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="group" type="font-awesome" size={23} color="#FF0000" />
                    </View>
                    <Text style={styles.menuText}>Ver grupos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('PaymentScreen')}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="money" type="font-awesome" size={20} color="#FF0000" />
                    </View>
                    <Text style={styles.menuText}>¡Apóyanos!</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#000',
        padding: 20,
    },
    headerContainer: {
        marginBottom: 20,
    },
    mainTitle: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFF',
        textTransform: 'uppercase',
        alignItems: "center",
        letterSpacing: 2,
        marginBottom: 5,
    },
    welcomeText: {
        fontSize: 18,
        color: '#FFF',
        alignItems: "flex-start"
    },
    clockContainer: {
        backgroundColor: '#1C1C1C',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    mapContainer: {
        height: 200,
        marginBottom: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    menuContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    menuItem: {
        backgroundColor: '#1C1C1C',
        width: '30%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 20,
        padding: 10,
        shadowColor: "#ffffff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
        elevation: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    menuText: {
        color: '#FFF',
        marginTop: 5,
        fontSize: 14,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 20,
        color: '#FFF',
    },
});

export default MainMenuScreen;
