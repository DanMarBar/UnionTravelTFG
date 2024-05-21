import React, {useEffect, useState} from 'react';
import {
    Image,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View,
} from 'react-native';
import {manageGetUserVehicleWithVehicleInfoByCarId} from "../../config/api";
import {Icon} from "react-native-elements";
import {obtainAllUserInfo} from "../../utils/UserUtils";
import {obtainImgRoute} from "../../utils/ImageUtils";

const CarDetailScreen = ({route, navigation}) => {
    const [carDetails, setCarDetails] = useState(null);

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                const { car } = route.params;
                const response = await manageGetUserVehicleWithVehicleInfoByCarId(car.CarId);
                setCarDetails(response.data);

            } catch (error) {
                console.error("Error obteniendo los detalles del coche:", error);
            }
        };

        fetchCarDetails();
    }, [route.params.car.id]);

    if (!carDetails) {
        return <Text>Cargando detalles del coche...</Text>;
    }

    const car = carDetails[0];

    return (
        <SafeAreaView style={styles.flexContainer}>
            <ImageBackground
                source={require('../../assets/images/peakpx.jpg')}
                style={styles.flexContainer}
                resizeMode="cover"
            >
                <View style={styles.header}>
                    <Text style={styles.headerText}>{car.Car.name}</Text>
                </View>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: obtainImgRoute(car.imageUrl) }} style={styles.carImage} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.groupHeader}>Información General</Text>
                        <Divider />
                        <DetailWithIcon icon="drive-eta" text={`Nombre: ${car.Car.name}`} iconColor="#007bff" />
                        <DetailWithIcon icon="branding-watermark" text={`Marca: ${car.Car.brand}`} iconColor="#28a745" />
                        <DetailWithIcon icon="model-training" text={`Modelo: ${car.Car.model}`} iconColor="#007bff" />
                        <Divider />

                        <Text style={styles.groupHeader}>Especificaciones</Text>
                        <Divider />
                        <DetailWithIcon icon="event" text={`Año: ${new Date(car.Car.year).getFullYear()}`} iconColor="#28a745" />
                        <DetailWithIcon icon="event-seat" text={`Asientos: ${car.Car.seats}`} iconColor="#007bff" />
                        <DetailWithIcon icon="color-lens" text={`Color: ${car.color}`} iconColor="#28a745" />
                        <Divider />

                        <Text style={styles.groupHeader}>Estado</Text>
                        <Divider />
                        <DetailWithIcon icon="assignment" text={`Matrícula: ${car.registration}`} iconColor="#007bff" />
                        <DetailWithIcon
                            icon={car.operative ? "check-circle" : "cancel"}
                            text={`Operativo: ${car.operative ? 'Sí' : 'No'}`}
                            iconColor={car.operative ? "#4CAF50" : "#F44336"}
                        />
                    </View>
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.actionButtonText}>Volver Atras</Text>
                    </TouchableOpacity>
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    );
};

const DetailWithIcon = ({ icon, text, iconColor = "#000" }) => (
    <View style={styles.detailRow}>
        <Icon name={icon} size={24} color={iconColor} />
        <Text style={styles.carDetail}>{text}</Text>
    </View>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 20,
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    carImage: {
        width: '90%',
        height: 300,
        resizeMode: 'cover',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    textContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 10,
        padding: 20,
        margin: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    carDetail: {
        fontSize: 18,
        marginLeft: 10,
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#40E0D0',
        marginVertical: 10,
    },
    groupHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        marginTop: 20,
    },
    header: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24,
        color: '#40d0ba',
        fontWeight: 'bold',
    },
    actionButton: {
        backgroundColor: '#26b6c9',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        margin: 20,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        alignItems: 'center',
    },
    footerText: {
        color: '#fff',
        fontSize: 14,
    },
});

export default CarDetailScreen;