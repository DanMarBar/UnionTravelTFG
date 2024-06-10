import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
    getUserVehicleByRegistration, getUserVehicleWithCarByRegistration,
    manageGetUserVehicleWithVehicleInfoByCarId
} from "../../config/Api";
import { Icon } from "react-native-elements";
import { obtainImgRoute } from "../../utils/ImageUtils";

const CarDetailScreen = ({ route }) => {
    const [carDetails, setCarDetails] = useState(null);

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                const { car } = route.params;
                const response = await getUserVehicleWithCarByRegistration(car.registration);
                console.log(response.data)
                setCarDetails(response.data);
            } catch (error) {
                console.error("Error obteniendo los detalles del coche:", error);
            }
        };

        fetchCarDetails();
    }, [route.params.car.id]);

    if (!carDetails) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando detalles del coche...</Text>
            </View>
        );
    }

    const car = carDetails;

    return (
        <SafeAreaView style={styles.flexContainer}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: obtainImgRoute(car.imageUrl) }} style={styles.carImage} />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.carTitle}>{car.Car.name}</Text>
                    <View style={styles.sectionContainer}>
                        <Text style={styles.groupHeader}>Información General</Text>
                        <View style={styles.row}>
                            <DetailWithIcon title="Nombre" icon="drive-eta" text={car.Car.name} iconColor="#ff0000" />
                            <DetailWithIcon title="Marca" icon="branding-watermark" text={car.Car.brand} iconColor="#ff0000" />
                        </View>
                        <View style={styles.row}>
                            <DetailWithIcon title="Modelo" icon="model-training" text={car.Car.model} iconColor="#ff0000" />
                            <DetailWithIcon title="Matrícula" icon="assignment" text={car.registration} iconColor="#ff0000" />
                        </View>
                    </View>
                    <View style={styles.sectionContainer}>
                        <Text style={styles.groupHeader}>Especificaciones</Text>
                        <View style={styles.row}>
                            <DetailWithIcon title="Año" icon="event" text={new Date(car.Car.year).getFullYear().toString()} iconColor="#ff0000" />
                            <DetailWithIcon title="Asientos" icon="event-seat" text={car.Car.seats.toString()} iconColor="#ff0000" />
                        </View>
                        <View style={styles.row}>
                            <DetailWithIcon title="Color" icon="color-lens" text={car.color} iconColor="#ff0000" />
                            <DetailWithIcon
                                title="Operativo"
                                icon={car.operative ? "check-circle" : "cancel"}
                                text={car.operative ? 'Sí' : 'No'}
                                iconColor={car.operative ? "#4CAF50" : "#F44336"}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const DetailWithIcon = ({ title, icon, text, iconColor = "#101010" }) => (
    <View style={styles.detailContainer}>
        <Icon name={icon} size={32} color={iconColor} />
        <Text style={styles.detailTitle}>{title}</Text>
        <Text style={styles.carDetail}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: '#121212',
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    carImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    infoContainer: {
        backgroundColor: '#101010',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        marginTop: -30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        width: '100%',
    },
    sectionContainer: {
        backgroundColor: '#101010',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent:"space-around",
        marginBottom: 20,
    },
    detailContainer: {
        backgroundColor: '#212121',
        borderRadius: 10,
        padding: 15,
        width: '40%',
        alignItems: 'center',
    },
    detailTitle: {
        fontSize: 17,
        color: '#ffffff',
        marginTop: 5,
    },
    carDetail: {
        fontSize: 16,
        marginTop: 4,
        color: '#ffffff',
        textAlign: 'center',
    },
    groupHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    carTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 20,
    },
    header: {
        backgroundColor: '#000000',
        padding: 10,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24,
        color: '#ffffff',
        fontWeight: 'bold',
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
});

export default CarDetailScreen;
