import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Icon } from 'react-native-elements';
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker } from 'react-native-maps';
import PaymentScreen from "./Payment";

const MainMenuScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        // Obtiene la informacion del usario
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

        getUserInfo();
    }, []);

    // Se encarga de cerrar la sesion del usuario
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userInfo');
            navigation.replace('Login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.mainTitle}>Vehicle Panel</Text>
                <Text style={styles.welcomeText}>Welcome back, {userInfo.name}</Text>
            </View>
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    <Marker
                        coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
                        title={"Your Location"}
                        description={"This is where you are"}
                    />
                </MapView>
            </View>
            <View style={styles.menuContainer}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('CarsListScreen')}
                >
                    <Icon name="car" type="font-awesome" size={40} color="#FFD700" />
                    <Text style={styles.menuText}>Vehicles</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('InsertCarScreen')}
                >
                    <Icon name="plus-circle" type="font-awesome" size={40} color="#FFD700" />
                    <Text style={styles.menuText}>Add Vehicle</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('UserProfileScreen')}
                >
                    <Icon name="user" type="font-awesome" size={40} color="#FFD700" />
                    <Text style={styles.menuText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('RouteScreen')}
                >
                    <Icon name="road" type="font-awesome" size={40} color="#FFD700" />
                    <Text style={styles.menuText}>Find Route</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('InsertGroupScreen')}
                >
                    <Icon name="road" type="font-awesome" size={40} color="#FFD700" />
                    <Text style={styles.menuText}>Ver los grupos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('PaymentScreen')}
                >
                    <Icon name="road" type="font-awesome" size={40} color="#FFD700" />
                    <Text style={styles.menuText}>Apoyanos!</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('ViewAllGroupsScreen')}
                >
                    <Icon name="user" type="font-awesome" size={40} color="#FFD700" />
                    <Text style={styles.menuText}>Grupos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleLogout}
                >
                    <Icon name="sign-out" type="font-awesome" size={40} color="#FFD700" />
                    <Text style={styles.menuText}>Logout</Text>
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
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 10,
    },
    welcomeText: {
        fontSize: 20,
        color: '#FFD700',
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
        justifyContent: 'space-around',
    },
    menuItem: {
        backgroundColor: '#1C1C1C',
        width: '45%',
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 20,
        padding: 10,
        shadowColor: "#FFD700",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
        elevation: 10,
    },
    menuText: {
        color: '#FFD700',
        marginTop: 10,
        fontSize: 18,
        textAlign: 'center',
    },
});

export default MainMenuScreen;
