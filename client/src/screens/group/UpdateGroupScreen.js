import React, { useEffect, useState } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Icon } from 'react-native-elements';
import {
    deleteGroupById,
    getAllPlaces,
    getGroupById,
    manageGetUserVehiclesByUserWithCarsId,
    updateGroupById,
} from '../../config/Api';
import { formatTime } from "../../utils/DateUtils";
import { obtainAllUserInfo } from "../../utils/UserUtils";

const UpdateGroupScreen = ({ route, navigation }) => {
    const [groupId, setGroupId] = useState(null);
    const [groupDetails, setGroupDetails] = useState({
        name: '',
        description: '',
        arrivalTime: new Date(),
        departureTime: new Date(),
        placeId: '',
        registration: '',
    });
    const [originalGroupDetails, setOriginalGroupDetails] = useState(null);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isArrival, setIsArrival] = useState(true);
    const [places, setPlaces] = useState([]);
    const [user, setUser] = useState([]);
    const [vehiclesPersons, setVehiclesPersons] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (route.params && route.params.group && route.params.group.Group && route.params.group.Group.id) {
            setGroupId(route.params.group.Group.id);
        }
    }, [route.params]);

    useEffect(() => {
        const fetchData = async () => {
            if (!groupId) return;

            const userInfo = await obtainAllUserInfo();
            setUser(userInfo);

            try {
                const groupResponse = await getGroupById(groupId);
                const group = groupResponse.data;
                const initialGroupDetails = {
                    name: group.name,
                    description: group.description,
                    arrivalTime: new Date(group.arrivalDate),
                    departureTime: new Date(group.departureDate),
                    placeId: group.placeId,
                    registration: group.registration,
                };
                setGroupDetails(initialGroupDetails);
                setOriginalGroupDetails(initialGroupDetails);

                const placesResponse = await getAllPlaces(userInfo.id);
                setPlaces(placesResponse.data);

                const vehiclesPersonsResponse = await manageGetUserVehiclesByUserWithCarsId(userInfo.id);
                setVehiclesPersons(vehiclesPersonsResponse.data);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [groupId]);

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

    const handleRefresh = async () => {
        if (originalGroupDetails) {
            setGroupDetails(originalGroupDetails);
        }
    };

    const handleUpdate = async () => {
        if (!groupDetails.name || !groupDetails.description) {
            setError('Por favor, complete todos los campos.');
            return;
        }
        if (groupDetails.name.length < 5) {
            Alert.alert("Nombre no válido", "El nombre debe superar los 5 caracteres");
            return;
        }

        setError('');

        Alert.alert(
            "Confirmar Actualización",
            "¿Estás seguro de que quieres actualizar este grupo?",
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
                            const payload = {
                                name: groupDetails.name,
                                description: groupDetails.description,
                                arrivalDate: groupDetails.arrivalTime,
                                departureDate: groupDetails.departureTime,
                                placeId: groupDetails.placeId,
                                registration: groupDetails.registration,
                            };

                            await updateGroupById(groupId, payload);

                            Alert.alert("Éxito", "Grupo actualizado correctamente");
                            navigation.navigate('ViewAllGroupsScreen')

                        } catch (error) {
                            if (error.response) {
                                Alert.alert("Error", error.response.data.message);
                                console.log(error);
                            } else {
                                console.error("Error actualizando el grupo:", error);
                                Alert.alert("Error", "No se pudo actualizar el grupo");
                            }
                        }
                    },
                },
            ]
        );
    };

    const handleDelete = async () => {
        Alert.alert(
            "Confirmar Eliminación",
            "¿Estás seguro de que quieres eliminar este grupo?",
            [
                {
                    text: "Cancelar",
                    onPress: () => console.log("Eliminación cancelada"),
                    style: "cancel",
                },
                {
                    text: "Sí",
                    onPress: async () => {
                        try {
                            await deleteGroupById(groupId);
                            Alert.alert("Éxito", "Grupo eliminado correctamente");
                            navigation.navigate('ViewAllGroupsScreen');
                        } catch (error) {
                            if (error.response) {
                                Alert.alert("Error", error.response.data.message);
                                console.log(error);
                            } else {
                                console.error("Error eliminando el grupo:", error);
                                Alert.alert("Error", "No se pudo eliminar el grupo");
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

                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                        style={styles.input}
                        value={groupDetails.name}
                        onChangeText={(text) => setGroupDetails({ ...groupDetails, name: text })}
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
                        <Text style={styles.dateText}>{formatTime(groupDetails.departureTime)}</Text>
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
                            <Picker.Item key={place.id} label={place.name} value={place.id} color="black" />
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
                                         value={vp.registration} color="black" />
                        ))}
                    </Picker>

                    <Text style={styles.label}>Eliminar vehiculo</Text>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Text style={styles.buttonText}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.circularButton, styles.saveButton]}
                                  onPress={handleUpdate}>
                    <Icon name="save" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.circularButton, styles.discardButton]}
                                  onPress={handleRefresh}>
                    <Icon name="refresh" size={24} color="#ff0000" />
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

export default UpdateGroupScreen;
