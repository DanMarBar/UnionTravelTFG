import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ImageBackground,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
    getUserVehicleByRegistration, manageUpdateUserCarByRegistration,
    obtainAllVehicles
} from '../../config/api';
import { formatDate } from "../../utils/DateUtils";
import { handleImageChange, obtainImgRoute } from "../../utils/ImageUtils";

const isValidRegistration = (registration) => {
    registration = registration.trim().toUpperCase();
    const pattern = /^[A-Z0-9]{2,}-[A-Z0-9]{2,}$/;
    return pattern.test(registration);
};

const UpdateCarScreen = ({ route, navigation }) => {
    const { car } = route.params;
    const [carDetails, setCarDetails] = useState({
        registration: '',
        color: '',
        year: new Date(),
        operative: true,
        imageUrl: '',
        carId: '',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [date, setDate] = useState(new Date());
    const [error, setError] = useState('');
    const [newPhoto, setNewPhoto] = useState(null);
    const [finalPhoto, setFinalPhoto] = useState(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const vehiclesFromDb = await obtainAllVehicles();
                setVehicles(vehiclesFromDb.data);
                setSelectedVehicleId(car.CarId);
            } catch (error) {
                console.error("Error obteniendo los vehículos:", error);
            }
        };

        const fetchCarDetails = async () => {
            try {
                const vehicleFromDb = await getUserVehicleByRegistration(car.registration);
                const vehicle = vehicleFromDb.data;

                setCarDetails({
                    registration: vehicle.registration,
                    color: vehicle.color,
                    year: new Date(vehicle.year),
                    operative: vehicle.operative,
                    imageUrl: vehicle.imageUrl,
                    carId: vehicle.CarId,
                });

                setDate(new Date(vehicle.year));
                setSelectedVehicleId(vehicle.CarId);
                setFinalPhoto(obtainImgRoute(vehicle.imageUrl));
            } catch (error) {
                console.error("Error obteniendo los detalles del vehículo:", error);
            }
        };

        fetchVehicles();
        fetchCarDetails();
    }, [car.registration]);

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        const currentDate = selectedDate || carDetails.year;
        setDate(currentDate);
        setCarDetails({ ...carDetails, year: currentDate });
    };

    const handleProfilePhotoChange = async () => {
        const photoResult = await handleImageChange();

        if (photoResult && !photoResult.cancelled) {
            setNewPhoto({ uri: photoResult.uri, type: photoResult.type, name: photoResult.name });
            setFinalPhoto(photoResult.uri);
            await setCarDetails(prevState => ({
                ...prevState,
                imageUrl: photoResult.uri
            }));
        }
    };

    const handleUpdate = async () => {
        if (!carDetails.color) {
            setError('Por favor, ingrese un color.');
            return;
        }

        if (!isValidRegistration(carDetails.registration)) {
            setError('Matrícula no válida. Debe tener el formato correcto.');
            return;
        }

        if (!selectedVehicleId) {
            setError('Por favor, seleccione un vehículo.');
            return;
        }

        setError('');

        Alert.alert(
            "Confirmar Actualización",
            "¿Estás seguro de que quieres actualizar este vehículo?",
            [
                {
                    text: "Cancelar",
                    onPress: () => console.log("Actualización cancelada"),
                    style: "cancel",
                },
                {
                    text: "Sí",
                    onPress: async () => {
                        try {
                            const formData = new FormData();
                            formData.append('registration', carDetails.registration);
                            formData.append('color', carDetails.color);
                            formData.append('year', carDetails.year.toISOString());
                            formData.append('operative', carDetails.operative);
                            formData.append('carId', selectedVehicleId);

                            if (newPhoto) {
                                formData.append('imageUrl', {
                                    uri: carDetails.imageUrl,
                                    type: 'image/jpeg',
                                    name: 'carImage.jpg',
                                });
                            }

                            await manageUpdateUserCarByRegistration(car.registration, formData);

                            Alert.alert("Éxito", "Vehículo actualizado correctamente");
                            navigation.goBack();

                        } catch (error) {
                            if (error.response) {
                                Alert.alert("Error", error.response.data.message);
                            } else {
                                console.error("Error actualizando el vehículo:", error);
                                Alert.alert("Error", "No se pudo actualizar el vehículo");
                            }
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.flexContainer}>
            <ImageBackground
                source={require('../../assets/images/peakpx.jpg')}
                style={styles.flexContainer}
                resizeMode="cover"
            >
                <ScrollView style={styles.scrollView}>
                    <View style={styles.formContainer}>

                        <Text>Color</Text>
                        <TextInput
                            style={styles.input}
                            value={carDetails.color}
                            onChangeText={(text) => setCarDetails({ ...carDetails, color: text })}
                            placeholder="Color"
                        />
                        {error && carDetails.color === '' ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Text>Fecha de creación</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}
                                          style={styles.dateInput}>
                            <Text>{formatDate(date)}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                style={styles.input}
                                testID="dateTimePicker"
                                value={date}
                                mode="date"
                                is24Hour={true}
                                display="default"
                                onChange={onChangeDate}
                            />
                        )}

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Operativo</Text>
                            <Switch
                                trackColor={{ false: "#7bccff", true: "#7bccff" }}
                                thumbColor={carDetails.operative ? "#13be13" : "#d53939"}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={newValue => setCarDetails({
                                    ...carDetails,
                                    operative: newValue
                                })}
                                value={carDetails.operative}
                            />
                        </View>

                        <Text>Seleccionar Vehículo</Text>
                        <Picker
                            selectedValue={selectedVehicleId}
                            onValueChange={(itemValue) => {
                                setSelectedVehicleId(itemValue);
                                setError('');
                            }}
                            style={styles.picker}
                        >
                            {vehicles.map((vehicle) => (
                                <Picker.Item key={vehicle.id} label={vehicle.name} value={vehicle.id} />
                            ))}
                        </Picker>
                        {error && !selectedVehicleId ? <Text style={styles.errorText}>{error}</Text> : null}

                        <View style={styles.imageUploaderContainer}>
                            <Text style={styles.label}>Imagen del Vehículo</Text>
                            {finalPhoto ?
                                (<Image source={{ uri: finalPhoto }} style={styles.imagePreview} />)
                                :
                                (<Text style={styles.placeholderText}>No hay imagen seleccionada</Text>)
                            }
                            <TouchableOpacity onPress={handleProfilePhotoChange}
                                              style={styles.button}>
                                <Text style={styles.buttonText}>Seleccionar Imagen</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.imageButton} onPress={handleUpdate}>
                            <Text style={styles.buttonText}>Actualizar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 15
    },
    formContainer: {
        padding: 20,
        backgroundColor: 'rgba(248,248,248,0.7)',
        borderRadius: 20
    },
    input: {
        height: 40,
        marginBottom: 10,
        borderWidth: 1,
        padding: 10,
        borderRadius: 15,
        backgroundColor: 'white',
    },
    dateInput: {
        height: 40,
        borderRadius: 15,
        backgroundColor: 'white',
        marginBottom: 20,
        borderWidth: 1,
        padding: 10,
    },
    dateText: {
        fontSize: 16,
    },
    button: {
        backgroundColor: '#3dbbe1',
        padding: 8,
        borderRadius: 5,
        alignItems: 'center',
    },
    imageButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        marginLeft: 2,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',

    },
    switchLabel: {
        marginRight: 10,
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
    },
    picker: {
        height: 40,
        marginBottom: 20,
        borderWidth: 1,
        padding: 5,
        borderRadius: 15,
        backgroundColor: 'white',
        color: 'black',
    },
    imageUploaderContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    imagePreview: {
        width: 200,
        height: 200,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: '#eee',
    },
});

export default UpdateCarScreen;
