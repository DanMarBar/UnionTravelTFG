import React, {useEffect, useState} from 'react';
import {
    Alert,
    Image,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {getCars, manageDeleteCar, manageGetUserVehiclesByUserId} from '../../config/api.js';
import {Icon} from "react-native-elements";
import {useFocusEffect} from "@react-navigation/native";
import {obtainAllUserInfo} from "../../utils/UserUtils";
import {obtainImgRoute} from "../../utils/ImageUtils";

const CarListScreen = ({navigation}) => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const userId = 1; // Reemplaza esto con el id de usuario correspondiente

    // Obtiene todos los vehiculos
    const fetchCarsData = async () => {
        try {
            const user = await obtainAllUserInfo()
            const cars = await manageGetUserVehiclesByUserId(user.id);
            if (currentIndex >= cars.length) {
                setCurrentIndex(0);
            }

            setCars(cars.data);
            setLoading(false);

        } catch (error) {
            console.error("Error al obtener los autos:", error);
        }
    };

    useEffect(() => {
        fetchCarsData();
    }, [])

    const goToNextCar = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % cars.length);
    };

    const goToPrevCar = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + cars.length) % cars.length);
    };

    const handleUpdate = () => navigation.navigate('UpdateCar', {car});

    const handleDetails = () => navigation.navigate('CarDetail', {car});

    // Se encarga de eliminar, de avisar antes y despues al usuario
    const handleDelete = () => {
        Alert.alert(
            "Confirmar Eliminación",
            `¿Estás seguro de que deseas eliminar el auto "${car.name}"?`,
            [
                {
                    text: "Cancelar",
                    onPress: () => console.log("Eliminación cancelada"),
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        try {
                            await manageDeleteCar(car.id);
                            console.log("Auto eliminado correctamente");
                            Alert.alert("Eliminado", "El auto ha sido eliminado correctamente.");

                            await fetchCarsData();

                        } catch (error) {
                            console.error("Error eliminando el auto:", error);
                            Alert.alert("Error", "No se pudo eliminar el auto.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando autos...</Text>
            </View>
        );
    }

    if (cars.length === 0) {
        return (
            <SafeAreaView style={styles.flexContainer}>
                <ImageBackground
                    source={require('../../assets/images/peakpx.jpg')}
                    style={styles.flexContainer}
                    resizeMode="cover"
                >
                    <View style={styles.noCarsContainer}>
                        <Text style={styles.noCarsText}>No tienes vehículos disponibles</Text>
                    </View>
                </ImageBackground>
            </SafeAreaView>
        );
    }

    const car = cars[currentIndex];

    return (
        <SafeAreaView style={styles.flexContainer}>
            <ImageBackground
                source={require('../../assets/images/peakpx.jpg')}
                style={styles.flexContainer}
                resizeMode="cover"
            >
                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>Todos tus vehículos</Text>
                    <Text style={styles.secondaryTitle}>Puedes agregar más o modificarlos</Text>
                </View>
                <View style={styles.navigationContainer}>
                    <TouchableOpacity onPress={goToPrevCar} style={styles.navigationButton}>
                        <Text style={styles.navigationText}>{"<"}</Text>
                    </TouchableOpacity>

                    <ScrollView
                        horizontal={false}
                        style={styles.detailsScroll}
                        contentContainerStyle={styles.detailsScrollContent}
                    >
                        <View style={styles.contentContainer}>
                            <Image source={{ uri: obtainImgRoute(car.imageUrl) }} style={styles.carImage} />
                            <View style={styles.textContainer}>
                                {renderCarDetail("Registro", car.registration, "confirmation-number", "#ffc107")}
                                {renderCarDetail("Color", car.color, "palette", "#ff5722")}
                                {renderCarDetail("Año", new Date(car.year).getFullYear(), "event", "#9c27b0")}
                                {renderCarDetail("Operativo", car.operative ? "Sí" : "No", "build", car.operative ? "#4caf50" : "#f44336")}
                                <View/>
                                <View style={styles.actionContainer}>
                                    <TouchableOpacity onPress={handleUpdate}>
                                        <Icon name="edit" size={24} color="#007bff" style={styles.actionIcon} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleDelete}>
                                        <Icon name="delete" size={24} color="#dc3545" style={styles.actionIcon} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleDetails}>
                                        <Icon name="visibility" size={24} color="#28a745" style={styles.actionIcon} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableOpacity onPress={goToNextCar} style={styles.navigationButton}>
                        <Text style={styles.navigationText}>{">"}</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

const renderCarDetail = (label, value, iconName, iconColor) => (
    <View style={styles.detailRow}>
        <Icon name={iconName} size={24} color={iconColor} />
        <View style={styles.detailTextContainer}>
            <Text style={styles.carText}>
                {label}: <Text style={styles.carInfo}>{value}</Text>
            </Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
    },
    titleContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    mainTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#03b3c7',
    },
    secondaryTitle: {
        fontSize: 18,
        color: '#18b296',
    },
    navigationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        paddingHorizontal: 10,
    },
    navigationButton: {
        padding: 10,
    },
    navigationText: {
        fontSize: 30,
        color: '#007BFF',
    },
    detailsScroll: {
        flex: 1,
    },
    detailsScrollContent: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    contentContainer: {
        width: '90%',
        alignItems: 'center',
    },
    carImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
        marginBottom: 20,
        borderRadius: 20,
        elevation: 5,
    },
    textContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        elevation: 5,
        width: '100%',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    detailTextContainer: {
        marginLeft: 10,
    },
    carText: {
        fontSize: 16,
        color: '#444',
    },
    carInfo: {
        fontWeight: 'bold',
    },
    actionContainer: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'center',
    },
    actionIcon: {
        marginHorizontal: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 10,
    },
});

export default CarListScreen;