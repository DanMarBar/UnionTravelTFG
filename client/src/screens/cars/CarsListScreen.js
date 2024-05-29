import React, { useState, useCallback } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { manageDeleteCar, manageGetUserVehiclesByUserId } from '../../config/api.js';
import { obtainAllUserInfo } from "../../utils/UserUtils";
import { obtainImgRoute } from "../../utils/ImageUtils";

const CarListScreen = ({ navigation }) => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCarsData = useCallback(async () => {
        try {
            const user = await obtainAllUserInfo();
            const cars = await manageGetUserVehiclesByUserId(user.id);
            setCars(cars.data);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener los autos:", error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchCarsData();
        }, [fetchCarsData])
    );

    const handleUpdate = (car) => navigation.navigate('UpdateCar', { car });

    const handleDetails = (car) => navigation.navigate('CarDetail', { car });

    const handleDelete = (car) => {
        Alert.alert(
            "Confirmar Eliminación",
            `¿Estás seguro de que deseas eliminar el auto "${car.registration}"?`,
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
            <SafeAreaView style={styles.container}>
                <View style={styles.noCarsContainer}>
                    <Text style={styles.noCarsText}>No tienes vehículos disponibles</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.mainTitle}>Todos tus vehículos</Text>
                <Text style={styles.secondaryTitle}>Puedes agregar más o modificarlos</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {cars.map((car, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.imageAndDetailsContainer}>
                            {car.imageUrl ? (
                                <Image
                                    source={{ uri: obtainImgRoute(car.imageUrl) }}
                                    style={styles.carImage}
                                />
                            ) : (
                                <View style={[styles.carImage, styles.placeholderImage]}>
                                    <Text style={styles.placeholderText}>No Image</Text>
                                </View>
                            )}
                            <View style={styles.cardContent}>
                                <Text style={styles.carName}>{car.registration}</Text>
                                <View style={styles.carDetailRow}>
                                    <Icon name="color-palette" size={20} color="#ffffff" style={styles.detailIcon} />
                                    <Text style={styles.carDetail}>Color: {car.color}</Text>
                                </View>
                                <View style={styles.carDetailRow}>
                                    <Icon name="calendar" size={20} color="#ffffff" style={styles.detailIcon} />
                                    <Text style={styles.carDetail}>Año: {new Date(car.year).getFullYear()}</Text>
                                </View>
                                <View style={styles.carDetailRow}>
                                    <Icon name="construct" size={20} color="#ffffff" style={styles.detailIcon} />
                                    <Text style={styles.carDetail}>Operativo: {car.operative ? "Sí" : "No"}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity style={[styles.actionButton, styles.detailsButton]} onPress={() => handleDetails(car)}>
                                <Icon name="eye" size={20} color="#000000" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleUpdate(car)}>
                                <Icon name="create" size={20} color="#ff0000" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(car)}>
                                <Icon name="trash" size={20} color="#ffffff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    titleContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    mainTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    secondaryTitle: {
        fontSize: 18,
        color: '#888',
    },
    scrollViewContent: {
        padding: 20,
    },
    card: {
        backgroundColor: '#1e1e1e',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    imageAndDetailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    carImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    placeholderImage: {
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#888',
    },
    cardContent: {
        flex: 1,
        marginLeft: 20,
    },
    carName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 10,
    },
    carDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    carDetail: {
        fontSize: 14,
        color: '#cccccc',
        marginLeft: 5,
    },
    detailIcon: {
        marginRight: 5,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    actionButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    detailsButton: {
        backgroundColor: '#ffffff',
    },
    editButton: {
        backgroundColor: '#ffffff',
    },
    deleteButton: {
        backgroundColor: '#ff0000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    loadingText: {
        color: '#ffffff',
        fontSize: 18,
        textAlign: 'center',
    },
    noCarsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    noCarsText: {
        color: '#ffffff',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default CarListScreen;
