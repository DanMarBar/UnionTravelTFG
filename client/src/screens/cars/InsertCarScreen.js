import React, {useEffect, useState} from 'react';
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
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {manageCreateNewUserVehicle, obtainAllVehicles} from '../../config/api';
import {obtainAllUserInfo} from "../../utils/UserUtils";
import {formatDate} from "../../utils/DateUtils";
import {handleImageChange} from "../../utils/ImageUtils";
import {Icon} from "react-native-elements";

const isValidRegistration = (registration) => {
    registration = registration.trim().toUpperCase();
    const pattern = /^[A-Z0-9]{2,}-[A-Z0-9]{2,}$/;
    return pattern.test(registration);
};

const InsertCarScreen = ({navigation}) => {
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
                const cars = await obtainAllVehicles();
                setVehicles(cars.data);
                setSelectedVehicleId(cars.data[0].id);
            } catch (error) {
                console.error("Error obteniendo los vehículos:", error);
            }
        };

        fetchVehicles();
    }, []);

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        const currentDate = selectedDate || carDetails.year;
        setDate(currentDate);
        setCarDetails({...carDetails, year: currentDate});
    };

    const handleProfilePhotoChange = async () => {
        const photoResult = await handleImageChange();
        if (photoResult && !photoResult.cancelled) {
            setNewPhoto({ uri: photoResult.uri });
            setFinalPhoto(photoResult.uri);
            setCarDetails(prevState => ({
                ...prevState,
                imageUrl: photoResult.uri
            }));
        }
    };

    const handleInsert = async () => {
        if (!carDetails.color) {
            setError('Por favor, seleccione un vehículo.');
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
            "Confirmar Inserción",
            "¿Estás seguro de que quieres insertar este nuevo vehículo?",
            [
                {
                    text: "Cancelar",
                    onPress: () => console.log("Inserción cancelada"),
                    style: "cancel",
                },
                {
                    text: "Sí",
                    onPress: async () => {
                        try {
                            const userId = await obtainAllUserInfo();
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

                            const response = await manageCreateNewUserVehicle(userId.id, formData);

                            Alert.alert("Éxito", "Vehículo insertado correctamente");
                            navigation.goBack();

                        } catch (error) {
                            if (error.response) {
                                Alert.alert("Error", error.response.data.message);
                            } else {
                                console.error("Error insertando el vehículo:", error);
                                Alert.alert("Error", "No se pudo insertar el vehículo");
                            }
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.flexContainer}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Añade tu propio vehiculo</Text>

                    <View style={styles.imageUploaderContainer}>
                        <Text style={styles.label}>Imagen del Vehículo</Text>
                        {finalPhoto ?
                            (<Image source={{ uri: finalPhoto }} style={styles.imagePreview} />)
                            :
                            (<Text style={styles.placeholderText}>No hay imagen seleccionada</Text>)
                        }
                        <TouchableOpacity onPress={handleProfilePhotoChange} style={styles.selectImageButton}>
                            <Text style={styles.selectImageButtonText}>Seleccionar Imagen</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Matrícula</Text>
                    <TextInput
                        style={styles.input}
                        value={carDetails.registration}
                        onChangeText={(text) => setCarDetails({
                            ...carDetails,
                            registration: text
                        })}
                        placeholder="Ej AB-12JK"
                        placeholderTextColor="#aaa"
                        maxLength={10}
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Text style={styles.label}>Color</Text>
                    <TextInput
                        style={styles.input}
                        value={carDetails.color}
                        onChangeText={(text) => setCarDetails({ ...carDetails, color: text })}
                        placeholder="Color"
                        placeholderTextColor="#aaa"
                        maxLength={15}
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Text style={styles.label}>Fecha de creación</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}
                                      style={styles.dateInput}>
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

                    <Text style={styles.label}>Seleccionar Vehículo</Text>
                    <Picker
                        selectedValue={selectedVehicleId}
                        onValueChange={(itemValue) => setSelectedVehicleId(itemValue)}
                        style={styles.picker}
                        dropdownIconColor="white"
                    >
                        {vehicles.map((vehicle) => (
                            <Picker.Item key={vehicle.id} label={vehicle.name} value={vehicle.id} color="black" />
                        ))}
                    </Picker>

                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.circularButton, styles.saveButton]}
                                  onPress={handleInsert}>
                    <Icon name="save" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.circularButton, styles.goBackButton]}
                                  onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: '#090909',
    },
    scrollView: {
        flex: 1,
        padding: 15,
    },
    formContainer: {
        padding: 20,
        backgroundColor: 'rgba(24,24,24,0.9)',
        borderRadius: 20,
        paddingBottom: 80,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        height: 50,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#282828',
        padding: 10,
        borderRadius: 15,
        backgroundColor: '#111',
        color: 'white',
    },
    dateInput: {
        height: 50,
        borderRadius: 15,
        backgroundColor: '#111',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#444',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    dateText: {
        fontSize: 16,
        color: 'white',
    },
    selectImageButton: {
        backgroundColor: '#ff0000',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    selectImageButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
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
        color: 'white',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
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
    placeholderText: {
        color: '#aaa',
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
        backgroundColor: '#ff0000', // Rojo intenso
    },
    discardButton: {
        backgroundColor: '#fff',
    },
    goBackButton: {
        backgroundColor: '#fff',
    },
});

export default InsertCarScreen;