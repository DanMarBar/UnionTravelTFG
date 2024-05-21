import React, {useEffect, useState} from 'react';
import {
    Alert,
    Button,
    Image,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import {serverConnectionId, updateUserByEmail} from '../../config/api';
import {obtainAllUserInfo} from '../../utils/UserUtils';
import {handleImageChange} from "../../utils/ImageUtils";

const UserUpdateScreen = ({}) => {
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

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const userData = await obtainAllUserInfo();
                setUserDetails({
                    ...userData,
                    birthday: new Date(userData.birthday),
                    profilePhoto: userData.profilePhoto
                });
                setFinalPhoto(serverConnectionId + '/' + userData.profilePhoto)

            } catch (error) {
                console.error('Error recuperando la info del usuario:', error);
                Alert.alert("Error del servidor", "No se pudo recuperar la información del usuario");
            }
        };

        fetchDetails();
    }, []);


    const handleUpdate = async () => {
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
            setUserDetails(prevState => ({
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


    return (
        <SafeAreaView style={styles.flexContainer}>
            <ImageBackground resizeMode="cover"
                             source={require('../../assets/images/peakpx.jpg')}
                             style={styles.imageBackground}>
                <ScrollView style={styles.scrollView}
                            contentContainerStyle={styles.contentContainer}>
                    <View style={styles.outerProfileImageContainer}>
                        <TouchableOpacity style={styles.profileImageContainer}
                                          onPress={handleProfilePhotoChange}>
                            <Image
                                source={{uri: finalPhoto || "dede"}}
                                style={styles.profileImage}/>
                            <Text style={styles.changePhotoText}>Cambiar foto</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.textContainer}>
                        <GroupedDetail title="Información Personal">
                            <EditableDetailWithIcon icon="person" label="Nombre"
                                                    value={userDetails.name}
                                                    onChangeText={(text) => setUserDetails({
                                                        ...userDetails,
                                                        name: text
                                                    })}/>
                            <EditableDetailWithIcon icon="person-outline" label="Apellido"
                                                    value={userDetails.surname}
                                                    onChangeText={(text) => setUserDetails({
                                                        ...userDetails,
                                                        surname: text
                                                    })}/>
                            <View style={styles.detailRow}>
                                <Icon name="cake" size={26} color="#4A90E2"
                                      style={styles.icon}/>
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
                        <Separator/>
                        <GroupedDetail title="Información de Contacto">
                            <EditableDetailWithIcon icon="phone" label="Teléfono"
                                                    value={userDetails.cellphone}
                                                    onChangeText={(text) => setUserDetails({
                                                        ...userDetails,
                                                        cellphone: text
                                                    })}/>
                            <EditableDetailWithIcon icon="phone" label="Teléfono secundario"
                                                    value={userDetails.secondCellphone}
                                                    onChangeText={(text) => setUserDetails({
                                                        ...userDetails,
                                                        secondCellphone: text
                                                    })}/>
                            <EditableDetailWithIcon icon="home" label="Dirección"
                                                    value={userDetails.direction}
                                                    onChangeText={(text) => setUserDetails({
                                                        ...userDetails,
                                                        direction: text
                                                    })}/>
                            <EditableDetailWithIcon icon="location-city" label="Código Postal"
                                                    value={userDetails.zip}
                                                    onChangeText={(text) => setUserDetails({
                                                        ...userDetails,
                                                        zip: text
                                                    })}/>
                        </GroupedDetail>
                        <Separator/>
                        <Button title="Guardar cambios" onPress={handleUpdate}/>
                    </View>
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    );
};

const EditableDetailWithIcon = ({icon, label, value, onChangeText}) => (
    <View style={styles.detailRow}>
        <Icon name={icon} size={26} color="#4A90E2" style={styles.icon}/>
        <View style={styles.editableFieldContainer}>
            <Text style={styles.label}>{label}:</Text>
            <TextInput style={styles.editableField} value={value} onChangeText={onChangeText}/>
        </View>
    </View>
);

const GroupedDetail = ({title, children}) => (
    <View style={styles.groupedContainer}>
        {title && <Text style={styles.groupTitle}>{title}</Text>}
        {children}
    </View>
);

const Separator = () => <View style={styles.separator}/>;

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: '#F0F3F5',
    },
    scrollView: {
        paddingHorizontal: 15,
    },
    contentContainer: {
        paddingVertical: 20,
    },
    imageBackground: {
        flex: 1,
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        alignItems: 'center',
        marginBottom: 20,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
        backgroundColor: '#fff',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    changePhotoText: {
        marginTop: 5,
        fontSize: 14,
        color: '#4A90E2',
    },
    textContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    outerProfileImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    groupedContainer: {
        marginBottom: 20,
    },
    groupTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#39d9b3',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 10,
    },
    icon: {
        marginRight: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    editableFieldContainer: {
        flex: 1,
    },
    editableField: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        fontSize: 16,
        color: '#333',
        marginVertical: 5,
    },
});

export default UserUpdateScreen;
