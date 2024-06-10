import React, {useEffect, useState} from 'react';
import {
    Alert,
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
} from '../../config/Api';
import {formatTime} from "../../utils/DateUtils";
import {obtainAllUserInfo} from "../../utils/UserUtils";
import {Icon} from "react-native-elements";

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

    // Permite cambiar la hora de llega y salida del grupo
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

    // Si los campso estan bien completados crea el grupo
    const handleInsert = async () => {
        if (!groupDetails.name || !groupDetails.description) {
            setError('Por favor, complete todos los campos.');
            return;
        }
        if (groupDetails.name.length < 5) {
            Alert.alert("Nombre no valido", "El nombre del grupo debe de tener mas de 5 caracteres")
            return;
        }
        if (groupDetails.registration === undefined) {
            Alert.alert("Vehiculo no valido", "Selecciona un vehiculo en la lista, si no" +
                " tienes puedes crear uno")
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
                            navigation.goBack()

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
            <ScrollView style={styles.scrollView}>
                <Text style={styles.title}>Crea tu propio grupo</Text>
                <View style={styles.formContainer}>

                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                        style={styles.input}
                        value={groupDetails.name}
                        onChangeText={(text) => setGroupDetails({...groupDetails, name: text})}
                        placeholder="Nombre"
                        placeholderTextColor="#aaa"
                        maxLength={25}
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Text style={styles.label}>Descripción</Text>
                    <TextInput
                        style={[styles.input, styles.descriptionInput]}
                        value={groupDetails.description}
                        onChangeText={(text) => setGroupDetails({
                            ...groupDetails,
                            description: text
                        })}
                        placeholder="Descripción"
                        placeholderTextColor="#aaa"
                        multiline
                        maxLength={150}
                        textAlignVertical="top"
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Text style={styles.label}>Hora de llegada</Text>
                    <TouchableOpacity onPress={() => {
                        setShowTimePicker(true);
                        setIsArrival(true);
                    }}
                                      style={styles.dateInput}>
                        <Text style={styles.dateText}>{formatTime(groupDetails.arrivalTime)}</Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Hora de salida</Text>
                    <TouchableOpacity onPress={() => {
                        setShowTimePicker(true);
                        setIsArrival(false);
                    }}
                                      style={styles.dateInput}>
                        <Text
                            style={styles.dateText}>{formatTime(groupDetails.departureTime)}</Text>
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

                    <Text style={styles.label}>Seleccionar Lugar</Text>
                    <Picker
                        selectedValue={groupDetails.placeId}
                        onValueChange={(itemValue) => setGroupDetails({
                            ...groupDetails,
                            placeId: itemValue
                        })}
                        style={styles.picker}
                        dropdownIconColor="white"
                    >
                        {places.map((place) => (
                            <Picker.Item key={place.id} label={place.name} value={place.id}
                                         color="black"/>
                        ))}
                    </Picker>

                    <Text style={styles.label}>Registro del Vehículo</Text>
                    <Picker
                        selectedValue={groupDetails.registration}
                        onValueChange={(itemValue) => setGroupDetails({
                            ...groupDetails,
                            registration: itemValue
                        })}
                        style={styles.picker}
                        dropdownIconColor="white"
                    >
                        {vehiclesPersons.map((vp) => (
                            <Picker.Item key={vp.registration}
                                         label={vp.registration + " | " + vp.Car.name}
                                         value={vp.registration} color="black"/>
                        ))}
                    </Picker>
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.circularButton, styles.saveButton]}
                                  onPress={handleInsert}>
                    <Icon name="save" size={24} color="#fff"/>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.circularButton, styles.goBackButton]}
                                  onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#000"/>
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
        padding: 15
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    formContainer: {
        padding: 20,
        backgroundColor: 'rgba(24,24,24,0.9)',
        borderRadius: 20,
        paddingBottom: 80,
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
    descriptionInput: {
        height: 100,
        textAlignVertical: 'top',
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
    deleteButton: {
        backgroundColor: '#ff0000', // Rojo intenso
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

export default InsertGroupScreen;