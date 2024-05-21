import React, {useEffect, useState} from 'react';
import {
    Alert,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
    createGroup,
    createGroupPerson,
    getAllPlaces,
    manageGetUserVehiclesByUserWithCarsId,
} from '../../config/api';
import {formatTime} from "../../utils/DateUtils";
import {obtainAllUserInfo} from "../../utils/UserUtils";

const InsertGroupScreen = ({navigation}) => {
    const [groupDetails, setGroupDetails] = useState({
        name: '',
        description: '',
        arrivalTime: new Date(),
        departureTime: new Date(),
        placeId: '',
        registration: '',
    });
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isArrival, setIsArrival] = useState(true);
    const [places, setPlaces] = useState([]);
    const [user, setUser] = useState([]);
    const [vehiclesPersons, setVehiclesPersons] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const userInfo = await obtainAllUserInfo();
            setUser(userInfo)

            try {
                const placesResponse = await getAllPlaces(userInfo.id);
                setPlaces(placesResponse.data);
                setGroupDetails(prevState => ({
                    ...prevState,
                    placeId: placesResponse.data[0]?.id,
                }));

                const vehiclesPersonsResponse = await manageGetUserVehiclesByUserWithCarsId(userInfo.id);
                setVehiclesPersons(vehiclesPersonsResponse.data);
                setGroupDetails(prevState => ({
                    ...prevState,
                    registration: vehiclesPersonsResponse.data[0]?.registration,
                }));

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const onChangeTime = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            if (isArrival) {
                const arrivalTime = new Date(groupDetails.arrivalTime);
                arrivalTime.setHours(selectedTime.getHours());
                arrivalTime.setMinutes(selectedTime.getMinutes());
                setGroupDetails(prevDetails => ({
                    ...prevDetails,
                    arrivalTime,
                }));
            } else {
                const departureTime = new Date(groupDetails.departureTime);
                departureTime.setHours(selectedTime.getHours());
                departureTime.setMinutes(selectedTime.getMinutes());
                setGroupDetails(prevDetails => ({
                    ...prevDetails,
                    departureTime,
                }));
            }
        }
    };

    const handleInsert = async () => {
        if (!groupDetails.name || !groupDetails.description) {
            setError('Por favor, complete todos los campos.');
            return;
        }

        setError('');

        Alert.alert(
            "Confirmar Inserción",
            "¿Estás seguro de que quieres insertar este nuevo grupo?",
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
                            const payload = {
                                name: groupDetails.name,
                                description: groupDetails.description,
                                arrivalDate: groupDetails.arrivalTime,
                                departureDate: groupDetails.departureTime,
                                placeId: groupDetails.placeId,
                                registration: groupDetails.registration,
                            };

                            const response = await createGroup(payload);
                            const group = response.data

                            const userGroup = {
                                isUserLeader: true,
                                userStartPoint: null,
                                userEndPoint: null,
                                UserId: user.id,
                                GroupId: group.id
                            }

                            await createGroupPerson(userGroup)

                            Alert.alert("Éxito", "Grupo insertado correctamente");

                        } catch (error) {
                            if (error.response) {
                                Alert.alert("Error", error.response.data.message);
                            } else {
                                console.error("Error insertando el grupo:", error);
                                Alert.alert("Error", "No se pudo insertar el grupo");
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

                        <Text>Nombre</Text>
                        <TextInput
                            style={styles.input}
                            value={groupDetails.name}
                            onChangeText={(text) => setGroupDetails({...groupDetails, name: text})}
                            placeholder="Nombre"
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Text>Descripción</Text>
                        <TextInput
                            style={styles.input}
                            value={groupDetails.description}
                            onChangeText={(text) => setGroupDetails({
                                ...groupDetails,
                                description: text
                            })}
                            placeholder="Descripción"
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Text>Hora de llegada</Text>
                        <TouchableOpacity onPress={() => {
                            setShowTimePicker(true);
                            setIsArrival(true);
                        }}
                                          style={styles.dateInput}>
                            <Text>{formatTime(groupDetails.arrivalTime)}</Text>
                        </TouchableOpacity>

                        <Text>Hora de salida</Text>
                        <TouchableOpacity onPress={() => {
                            setShowTimePicker(true);
                            setIsArrival(false);
                        }}
                                          style={styles.dateInput}>
                            <Text>{formatTime(groupDetails.departureTime)}</Text>
                        </TouchableOpacity>

                        {showTimePicker && (
                            <DateTimePicker
                                value={isArrival ? groupDetails.arrivalTime : groupDetails.departureTime}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={onChangeTime}
                            />
                        )}

                        <Text>Seleccionar Lugar</Text>
                        <Picker
                            selectedValue={groupDetails.placeId}
                            onValueChange={(itemValue) => setGroupDetails({
                                ...groupDetails,
                                placeId: itemValue
                            })}
                            style={styles.picker}
                        >
                            {places.map((place) => (
                                <Picker.Item key={place.id} label={place.name} value={place.id}/>
                            ))}
                        </Picker>

                        <Text>Registro del Vehículo</Text>
                        <Picker
                            selectedValue={groupDetails.registration}
                            onValueChange={(itemValue) => setGroupDetails({
                                ...groupDetails,
                                registration: itemValue
                            })}
                            style={styles.picker}
                        >
                            {vehiclesPersons.map((vp) => (
                                <Picker.Item key={vp.registration}
                                             label={vp.registration + " | " + vp.Car.name}
                                             value={vp.registration}/>
                            ))}
                        </Picker>

                        <TouchableOpacity style={styles.imageButton} onPress={handleInsert}>
                            <Text style={styles.buttonText}>Insertar</Text>
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
        padding: 15,
    },
    formContainer: {
        padding: 20,
        backgroundColor: 'rgba(248,248,248,0.7)',
        borderRadius: 20,
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

export default InsertGroupScreen;
