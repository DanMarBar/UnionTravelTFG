import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
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
import { Icon } from 'react-native-elements';
import {
    getUserVehicleByRegistration,
    manageUpdateUserCarByRegistration,
    obtainAllVehicles
} from '../../config/Api';
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
    const [initialCarDetails, setInitialCarDetails] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [date, setDate] = useState(new Date());
    const [error, setError] = useState('');
    const [newPhoto, setNewPhoto] = useState(null);
    const [finalPhoto, setFinalPhoto] = useState(null);

    const fetchCarDetails = async () => {
        try {
            const vehicleFromDb = await getUserVehicleByRegistration(car.registration);
            const vehicle = vehicleFromDb.data;

            const carDetailsData = {
                registration: vehicle.registration,
                color: vehicle.color,
                year: new Date(vehicle.year),
                operative: vehicle.operative,
                imageUrl: vehicle.imageUrl,
                carId: vehicle.CarId,
            };

            setCarDetails(carDetailsData);
            setInitialCarDetails(carDetailsData);

            setDate(new Date(vehicle.year));
            setSelectedVehicleId(vehicle.CarId);
            setFinalPhoto(obtainImgRoute(vehicle.imageUrl));
        } catch (error) {
            console.error("Error obteniendo los detalles del vehículo:", error);
        }
    };

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

        fetchVehicles();
        fetchCarDetails();
    }, [car.registration]);

    const onChangeDate = (event, selectedDate) => {
        if (event.type === "set") {
            const currentDate = selectedDate || carDetails.year;
            setShowDatePicker(false);
            setDate(currentDate);
            setCarDetails({ ...carDetails, year: currentDate });
        } else {
            setShowDatePicker(false);
        }
    };

    const handleProfilePhotoChange = async () => {
        const photoResult = await handleImageChange();

        if (photoResult && !photoResult.cancelled) {
            setNewPhoto({ uri: photoResult.uri, type: photoResult.type, name: photoResult.name });
            setFinalPhoto(photoResult.uri);
            setCarDetails(prevState => ({
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
                                    uri: newPhoto.uri,
                                    type: 'image/jpeg',
                                    name: 'carImage.jpg',
                                });
                            }

                            await manageUpdateUserCarByRegistration(car.registration, formData);

                            Alert.alert("Éxito", "Vehículo actualizado correctamente");
                            navigation.goBack();

                        } catch (error) {
                            console.log("Error actualizando el vehículo en el primer intento:", error);

                            await new Promise(resolve => setTimeout(resolve, 1000));

                            try {
                                const retryFormData = new FormData();
                                retryFormData.append('registration', carDetails.registration);
                                retryFormData.append('color', carDetails.color);
                                retryFormData.append('year', carDetails.year.toISOString());
                                retryFormData.append('operative', carDetails.operative);
                                retryFormData.append('carId', selectedVehicleId);

                                if (newPhoto) {
                                    retryFormData.append('imageUrl', {
                                        uri: newPhoto.uri,
                                        type: 'image/jpeg',
                                        name: 'carImage.jpg',
                                    });
                                }

                                await manageUpdateUserCarByRegistration(car.registration, retryFormData);

                                Alert.alert("Éxito", "Vehículo actualizado correctamente");
                                navigation.goBack();
                            } catch (secondError) {
                                console.error("Error actualizando el vehículo en el segundo intento:", secondError);

                                if (secondError.response) {
                                    Alert.alert("Error", secondError.response.data.message);
                                } else {
                                    Alert.alert("Error", "No se pudo actualizar el vehículo");
                                }
                            }
                        }
                    },
                },
            ]
        );
    };

    const handleDiscardChanges = () => {
        setCarDetails(initialCarDetails);
        setDate(initialCarDetails.year);
        setSelectedVehicleId(initialCarDetails.carId);
        setFinalPhoto(obtainImgRoute(initialCarDetails.imageUrl));
    };

    return (
        <SafeAreaView style={styles.flexContainer}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>{"Vehiculo " + carDetails.registration}</Text>
                    <View style={styles.imageUploaderContainer}>
                        <Text style={styles.label}>Imagen del Vehículo</Text>
                        <TouchableOpacity onPress={handleProfilePhotoChange}>
                            {finalPhoto ?
                                (<Image source={{ uri: finalPhoto }} style={styles.imagePreview} />)
                                :
                                (<View style={styles.imagePlaceholder}>
                                    <Text style={styles.placeholderText}>No hay imagen seleccionada</Text>
                                </View>)
                            }
                        </TouchableOpacity>
                    </View>
                    <View style={styles.labelWithIcon}>
                        <Icon name="palette" size={20} color="red" />
                        <Text style={styles.label}>Color</Text>
                    </View>
                    <TextInput
                        style={[styles.input, styles.largeInput]}
                        value={carDetails.color}
                        onChangeText={(text) => setCarDetails({ ...carDetails, color: text })}
                        placeholder="Color"
                        placeholderTextColor="#aaa"
                        maxLength={15}
                    />
                    {error && carDetails.color === '' ?
                        <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.labelWithIcon}>
                        <Icon name="calendar-today" size={20} color="red" />
                        <Text style={styles.label}>Fecha de creación</Text>
                    </View>
                    <View style={[styles.dateInput, styles.largeInput]}>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}
                                          style={styles.dateTouchable}>
                            <Text style={styles.dateText}>{formatDate(date)}</Text>
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
                    </View>

                    <View style={styles.labelWithIcon}>
                        <Icon name="directions-car" size={20} color="red" />
                        <Text style={styles.label}>Seleccionar Vehículo</Text>
                    </View>
                    <Picker
                        selectedValue={selectedVehicleId}
                        onValueChange={(itemValue) => {
                            setSelectedVehicleId(itemValue);
                            setError('');
                        }}
                        style={[styles.picker, styles.smallInput]}
                        dropdownIconColor="white"
                    >
                        {vehicles.map((vehicle) => (
                            <Picker.Item key={vehicle.id} label={vehicle.name} value={vehicle.id} color="black" />
                        ))}
                    </Picker>
                    {error && !selectedVehicleId ?
                        <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>Operativo</Text>
                        <Switch
                            trackColor={{ false: "#ff0000", true: "#ffffff" }}
                            thumbColor={carDetails.operative ? "#ffffff" : "#000000"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={newValue => setCarDetails({
                                ...carDetails,
                                operative: newValue
                            })}
                            value={carDetails.operative}
                        />
                    </View>
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.circularButton, styles.saveButton]} onPress={handleUpdate}>
                    <Icon name="save" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.circularButton, styles.discardButton]} onPress={handleDiscardChanges}>
                    <Icon name="refresh" size={24} color="#ff0000" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.circularButton, styles.goBackButton]} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: '#090909',
    },
    scrollView: {
        flex: 1,
        padding: 15
    },
    formContainer: {
        padding: 20,
        backgroundColor: 'rgba(24,24,24,0.9)',
        borderRadius: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        height: 40,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#282828',
        padding: 10,
        borderRadius: 15,
        backgroundColor: '#111',
        color: 'white',
    },
    largeInput: {
        height: 50,
    },
    smallInput: {
        height: 30,
        borderRadius: 15,
    },
    dateInput: {
        height: 50,
        borderRadius: 15,
        backgroundColor: '#111',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#444',
        justifyContent: 'center',
    },
    dateTouchable: {
        justifyContent: 'center',
        height: '100%',
        padding: 10,
    },
    dateText: {
        fontSize: 16,
        color: 'white',
    },
    button: {
        backgroundColor: '#3dbbe1',
        padding: 8,
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
        marginLeft: 8,
        color: 'white',
    },
    labelWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 30,
    },
    switchLabel: {
        marginRight: 10,
        fontSize: 16,
        color: 'white',
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
    },
    picker: {
        height: 40,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#444',
        padding: 5,
        borderRadius: 15,
        backgroundColor: '#111',
        color: 'white',
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
        backgroundColor: '#222',
    },
    imagePlaceholder: {
        width: 200,
        height: 200,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#aaa',
    },
    text: {
        color: 'white',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#131313',
        borderTopWidth: 1,
        borderTopColor: '#444',
    },
    circularButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    saveButton: {
        backgroundColor: '#ff0000',
    },
    discardButton: {
        backgroundColor: '#fff',
    },
    goBackButton: {
        backgroundColor: '#fff',
    },
});

export default UpdateCarScreen;