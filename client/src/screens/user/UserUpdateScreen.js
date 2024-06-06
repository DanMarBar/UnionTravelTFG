import React, { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Icon } from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import { serverConnectionId, updateUserByEmail } from '../../config/api';
import { obtainAllUserInfo } from '../../utils/UserUtils';
import { handleImageChange } from "../../utils/ImageUtils";

const UserUpdateScreen = ({ navigation }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [newPhoto, setNewPhoto] = useState(null);
    const [finalPhoto, setFinalPhoto] = useState(null);
    const [userDetails, setUserDetails] = useState({
        name: '',
        surname: '',
        birthday: new Date(),
        cellphone: '',
        secondCellphone: '',
        direction: '',
        zip: '',
        profilePhoto: '',
    });
    const [date, setDate] = useState(new Date());
    const [initialUserDetails, setInitialUserDetails] = useState({});

    const fetchDetails = async () => {
        try {
            const userData = await obtainAllUserInfo();
            setUserDetails({
                ...userData,
                birthday: new Date(userData.birthday),
                profilePhoto: userData.profilePhoto
            });
            setInitialUserDetails({
                ...userData,
                birthday: new Date(userData.birthday),
                profilePhoto: userData.profilePhoto
            });
            setFinalPhoto(serverConnectionId + '/' + userData.profilePhoto);
        } catch (error) {
            console.error('Error recuperando la info del usuario:', error);
            Alert.alert("Error del servidor", "No se pudo recuperar la información del usuario");
        }
    };

    useEffect(() => {
        fetchDetails();
    }, []);

    const handleUpdate = async () => {
        const isCellphoneUpdated = userDetails.cellphone !== initialUserDetails.cellphone;
        const isSecondCellphoneUpdated = userDetails.secondCellphone !== initialUserDetails.secondCellphone;

        if ((isCellphoneUpdated && !validatePhoneNumber(userDetails.cellphone)) ||
            (isSecondCellphoneUpdated && !validatePhoneNumber(userDetails.secondCellphone))) {
            Alert.alert("Número de teléfono no válido", "Debes introducir un número de teléfono válido");
            return;
        }

        const formData = new FormData();
        formData.append('name', userDetails.name);
        formData.append('surname', userDetails.surname);
        formData.append('birthday', userDetails.birthday.toISOString());
        formData.append('cellphone', userDetails.cellphone);
        formData.append('secondCellphone', userDetails.secondCellphone);
        formData.append('direction', userDetails.direction);
        formData.append('zip', userDetails.zip);

        if (newPhoto) {
            formData.append('profilePhoto', {
                uri: newPhoto.uri,
                type: newPhoto.type || 'image/jpeg',
                name: newPhoto.name || 'profilePhoto.jpg',
            });
        }

        Alert.alert(
            "Confirmación",
            "¿Estás seguro de que quieres actualizar tus datos?",
            [
                {
                    text: "No",
                    onPress: () => console.log("Actualización cancelada"),
                    style: "cancel"
                },
                {
                    text: "Sí",
                    onPress: async () => {
                        try {
                            await updateUserByEmail(userDetails.email, formData);
                            Alert.alert("Éxito", "Información actualizada correctamente");
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error actualizando la información del usuario:', error);
                            Alert.alert("Error", "No se pudo actualizar la información");
                        }
                    }
                }
            ],
            { cancelable: false }
        );
    };

    const handleProfilePhotoChange = async () => {
        const photoResult = await handleImageChange();
        if (photoResult && !photoResult.cancelled) {
            setNewPhoto({ uri: photoResult.uri, type: photoResult.type, name: photoResult.name });
            setFinalPhoto(photoResult.uri);
            await setUserDetails(prevState => ({
                ...prevState,
                profilePhoto: photoResult.uri
            }));
        }
    };

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
        setUserDetails({ ...userDetails, birthday: currentDate });
    };

    const handleDiscardChanges = () => {
        setUserDetails(initialUserDetails);
    };

    const validatePhoneNumber = (text) => {
        const phoneNumberPattern = /^(?:[6-7]\d{8}|[89]\d{8})$/;
        return phoneNumberPattern.test(text);
    };

    return (
        <SafeAreaView style={styles.flexContainer}>
            <ScrollView style={styles.scrollView}
                        contentContainerStyle={styles.contentContainer}>
                <View style={styles.outerProfileImageContainer}>
                    <TouchableOpacity style={styles.profileImageContainer}
                                      onPress={handleProfilePhotoChange}>
                        <Image
                            source={{ uri: finalPhoto || "dede" }}
                            style={styles.profileImage} />
                        <Text style={styles.changePhotoText}>Cambiar foto</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.sectionContainer}>
                        <GroupedDetail title="Información Personal">
                            <EditableDetailWithIcon icon="person" label="Nombre" maxLength={20}
                                                    value={userDetails.name}
                                                    onChangeText={(text) => setUserDetails({
                                                        ...userDetails,
                                                        name: text
                                                    })} />
                            <EditableDetailWithIcon icon="person-outline" label="Apellido" maxLength={15}
                                                    value={userDetails.surname}
                                                    onChangeText={(text) => setUserDetails({
                                                        ...userDetails,
                                                        surname: text
                                                    })} />
                            <View style={styles.detailRow}>
                                <Icon name="cake" size={26} color="#ff0000"
                                      style={styles.icon} />
                                <TouchableOpacity style={styles.editableFieldContainer}
                                                  onPress={() => setShowDatePicker(true)}>
                                    <Text style={styles.label}>Cumpleaños:</Text>
                                    <Text
                                        style={styles.editableField}>{userDetails.birthday.toDateString()}</Text>
                                </TouchableOpacity>
                            </View>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="default"
                                    onChange={onChangeDate}
                                />
                            )}
                        </GroupedDetail>
                    </View>
                    <View style={styles.sectionContainer}>
                        <GroupedDetail title="Información de Contacto">
                            <EditableDetailWithIcon icon="phone" label="Teléfono"
                                                    value={userDetails.cellphone}
                                                    onChangeText={(text) => setUserDetails({
                                                        ...userDetails,
                                                        cellphone: text
                                                    })}
                                                    keyboardType="numeric"
                                                    maxLength={9} />
                            <EditableDetailWithIcon icon="phone" label="Teléfono secundario"
                                                    value={userDetails.secondCellphone}
                                                    onChangeText={(text) => setUserDetails({
                                                        ...userDetails,
                                                        secondCellphone: text
                                                    })}
                                                    keyboardType="numeric"
                                                    maxLength={9} />
                            <EditableDetailWithIcon icon="home" label="Dirección" maxLength={20}
                                                    value={userDetails.direction}
                                                    onChangeText={(text) => setUserDetails({
                                                        ...userDetails,
                                                        direction: text
                                                    })} />
                            <EditableDetailWithIcon icon="location-city" label="Código Postal"
                                                    value={userDetails.zip}
                                                    onChangeText={(text) => setUserDetails({
                                                        ...userDetails,
                                                        zip: text
                                                    })}
                                                    keyboardType="numeric"
                                                    maxLength={5} />
                        </GroupedDetail>
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
};

const EditableDetailWithIcon = ({ icon, label, value, onChangeText, keyboardType, maxLength }) => (
    <View style={styles.detailRow}>
        <Icon name={icon} size={26} color="#ff0000" style={styles.icon} />
        <View style={styles.editableFieldContainer}>
            <Text style={styles.label}>{label}:</Text>
            <TextInput style={styles.editableField} value={value} onChangeText={onChangeText}
                       keyboardType={keyboardType}
                       maxLength={maxLength}
                       placeholderTextColor="#888" />
        </View>
    </View>
);

const GroupedDetail = ({ title, children }) => (
    <View style={styles.groupedContainer}>
        {title && <Text style={styles.groupTitle}>{title}</Text>}
        {children}
    </View>
);

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: '#030303',
    },
    scrollView: {
        paddingHorizontal: 15,
    },
    contentContainer: {
        paddingVertical: 20,
        paddingBottom: 120,
    },
    profileImageContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        overflow: 'hidden',
        alignItems: 'center',
        marginBottom: 10,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
        backgroundColor: '#2C2C2C',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    changePhotoText: {
        marginTop: 5,
        fontSize: 14,
        color: '#ff0000',
        textAlign: 'center',
    },
    textContainer: {
        marginVertical: 10,
    },
    sectionContainer: {
        backgroundColor: '#0e0e0e',
        borderRadius: 12,
        padding: 20,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    outerProfileImageContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    groupedContainer: {
        marginBottom: 20,
    },
    groupTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#FFF',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#444',
        marginVertical: 10,
    },
    icon: {
        marginRight: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFF',
    },
    editableFieldContainer: {
        flex: 1,
    },
    editableField: {
        borderBottomWidth: 1,
        borderBottomColor: '#444',
        fontSize: 16,
        color: '#FFF',
        marginVertical: 5,
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

export default UserUpdateScreen;