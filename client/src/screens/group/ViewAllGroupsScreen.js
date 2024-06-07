import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { createGroupPerson, deleteUserFromGroup, getAllGroupsWithAllInfo } from '../../config/api';
import { obtainImgRoute } from "../../utils/ImageUtils";
import { obtainAllUserInfo } from "../../utils/UserUtils";
import { useFocusEffect } from "@react-navigation/native";
import { formatTime } from "../../utils/DateUtils";
import * as Notifications from "expo-notifications";

const ViewAllGroupsScreen = ({ route, navigation }) => {
    const [groups, setGroups] = useState(null);
    const [user, setUser] = useState(null);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filterByMine, setFilterByMine] = useState(false);
    const [filterStartHour, setFilterStartHour] = useState('');
    const [filterEndHour, setFilterEndHour] = useState('');

    const fetchGroups = async () => {
        try {
            const response = await getAllGroupsWithAllInfo();
            setGroups(response.data);
            setFilteredGroups(response.data);
        } catch (error) {
            console.error('Error obteniendo los detalles del coche:', error);
        }
    };

    const fetchUserData = async () => {
        try {
            const userData = await obtainAllUserInfo();
            setUser(userData);
        } catch (error) {
            console.error('Error obteniendo los detalles del usuario:', error);
        }
    };

    useEffect(() => {
        fetchGroups();
        fetchUserData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchGroups();
            fetchUserData();
        }, [])
    );

    const checkPhoneNumber = (user) => {
        if (!user || (!user.cellphone || user.cellphone === '' || !user.secondCellphone || user.secondCellphone === '')) {
            Alert.alert("Número de teléfono necesario", "Actualiza tu perfil y añade un número de teléfono para poder entrar en un grupo");
            return false;
        }
        return true;
    };

    useEffect(() => {
        if (user) {
            checkPhoneNumber(user);
        }
    }, [user]);

    const handleSearch = (text) => {
        setSearchText(text);
        applyFilters(text, filterByMine, filterStartHour, filterEndHour);
    };

    const handleFilterByMine = () => {
        setFilterByMine(!filterByMine);
        applyFilters(searchText, !filterByMine, filterStartHour, filterEndHour);
    };

    const handleFilterStartHour = (hour) => {
        setFilterStartHour(hour);
        applyFilters(searchText, filterByMine, hour, filterEndHour);
    };

    const handleFilterEndHour = (hour) => {
        setFilterEndHour(hour);
        applyFilters(searchText, filterByMine, filterStartHour, hour);
    };

    const applyFilters = (text, mine, startHour, endHour) => {
        if (!groups || !user) return;

        let filtered = groups.filter(group => group.name.toLowerCase().includes(text.toLowerCase()));

        if (mine) {
            filtered = filtered.filter(group => group.VehiclePerson.UserId === user.id);
        }

        if (startHour) {
            filtered = filtered.filter(group => new Date(group.arrivalDate).getHours() === parseInt(startHour));
        }

        if (endHour) {
            filtered = filtered.filter(group => new Date(group.departureDate).getHours() === parseInt(endHour));
        }

        setFilteredGroups(filtered);
    };

    const handleDetails = (groupId) => {
        navigation.navigate('ViewGroupDetailsScreen', { groupId });
    };

    const joinGroup = async (groupId) => {
        if (!user) {
            console.error('User data is not available');
            return;
        }

        if (!checkPhoneNumber(user)) {
            return;
        }

        const userGroup = {
            isUserLeader: false,
            userStartPoint: null,
            userEndPoint: null,
            UserId: user.id,
            GroupId: groupId
        };

        try {
            const response = await createGroupPerson(userGroup);
            console.log('Successfully joined the group:', response.data);
            Alert.alert('Éxito', 'Te has unido al grupo exitosamente', [
                {
                    text: 'OK',
                    onPress: () => {
                        handleDetails(groupId);
                        fetchGroups();
                    },
                }
            ]);
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Unión exitosa al grupo",
                    body: "Te has unido al grupo exitosamente",
                    sound: 'default',
                },
                trigger: { seconds: 1 },
            });
        } catch (error) {
            console.error('Error al unirse al grupo:', error);
            Alert.alert('Error', 'Hubo un error al intentar unirse al grupo');
        }

        console.log(`Unirse al grupo con ID: ${groupId}`);
    };

    const leaveGroup = async (groupId) => {
        if (!user) {
            console.error('User data is not available');
            return;
        }

        try {
            await deleteUserFromGroup(user.id, groupId);
            Alert.alert('Éxito', 'Has salido del grupo exitosamente', [
                {
                    text: 'OK',
                    onPress: () => fetchGroups(),
                }
            ]);
        } catch (error) {
            console.error('Error al salir del grupo:', error);
            Alert.alert('Error', 'Hubo un error al intentar salir del grupo');
        }
    };

    const handleLeaveGroup = (groupId) => {
        Alert.alert(
            'Confirmación',
            '¿Estás seguro de que quieres salir de este grupo?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Salir',
                    onPress: () => leaveGroup(groupId),
                },
            ],
            { cancelable: true }
        );
    };

    const handleJoinGroup = (groupId) => {
        const group = groups.find(group => group.id === groupId);

        if (group && group.GroupPeople.length >= 5) {
            Alert.alert(
                'Grupo Lleno',
                'Este grupo ya tiene 5 personas y no puedes unirte.',
                [{ text: 'OK' }],
                { cancelable: true }
            );
        } else {
            Alert.alert(
                'Confirmación',
                '¿Estás seguro de que quieres unirte a este grupo?',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                    },
                    {
                        text: 'Unirse',
                        onPress: () => joinGroup(groupId),
                    },
                ],
                { cancelable: true }
            );
        }
    };

    const isUserInGroup = (groupDetail) => {
        return groupDetail.GroupPeople && groupDetail.GroupPeople.some(member => member.UserId === user?.id);
    };

    const isUserLeader = (groupDetail) => {
        return groupDetail.GroupPeople && groupDetail.GroupPeople.some(member => member.UserId === user?.id && member.isUserLeader);
    };

    if (!groups) {
        return <Text style={styles.loadingText}>Cargando detalles del coche...</Text>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre de grupo"
                    placeholderTextColor="#888"
                    value={searchText}
                    onChangeText={handleSearch}
                />
            </View>
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filterByMine && styles.filterButtonActive]}
                    onPress={handleFilterByMine}
                >
                    <Text style={styles.filterButtonText}>Mis Grupos</Text>
                </TouchableOpacity>
                <TextInput
                    style={[styles.timeInput, filterByMine && styles.timeInputActive]}
                    placeholder="Entrada"
                    placeholderTextColor="#888"
                    value={filterStartHour}
                    onChangeText={handleFilterStartHour}
                    keyboardType="numeric"
                />
                <TextInput
                    style={[styles.timeInput, filterByMine && styles.timeInputActive]}
                    placeholder="Salida"
                    placeholderTextColor="#888"
                    value={filterEndHour}
                    onChangeText={handleFilterEndHour}
                    keyboardType="numeric"
                />
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {filteredGroups.map((groupDetail, index) => {
                    const userInGroup = isUserInGroup(groupDetail);
                    const userIsLeader = isUserLeader(groupDetail);

                    return (
                        <View key={index} style={styles.card}>
                            {groupDetail.Place && groupDetail.Place.image ? (
                                <Image
                                    source={{ uri: obtainImgRoute(`${groupDetail.Place.image}`) }}
                                    style={styles.placeImage}
                                />
                            ) : (
                                <View style={[styles.placeImage, styles.placeholderImage]}>
                                    <Text style={styles.placeholderText}>No Image</Text>
                                </View>
                            )}
                            <View style={styles.cardContent}>
                                <Text style={styles.groupName}>{groupDetail.name}</Text>
                                <Text style={styles.placeName}>{groupDetail.Place.name}</Text>
                                <Text style={styles.groupDates}>
                                    {`Salida ${formatTime(groupDetail.arrivalDate)} Vuelta ${formatTime(groupDetail.departureDate)}`}
                                </Text>
                                <Text
                                    style={styles.vehicleName}>{groupDetail.VehiclePerson.Car.name}</Text>
                                <View style={styles.buttonsContainer}>
                                    {userInGroup ? (
                                        <>
                                            <TouchableOpacity style={styles.detailsButton}
                                                              onPress={() => handleDetails(groupDetail.id)}>
                                                <Icon name="information-circle" size={20}
                                                      color="#ff0000" />
                                            </TouchableOpacity>

                                            {!userIsLeader && (
                                                <TouchableOpacity style={styles.leaveButton}
                                                                  onPress={() => handleLeaveGroup(groupDetail.id)}>
                                                    <Icon name="log-out-outline" size={20}
                                                          color="#ffffff" />
                                                </TouchableOpacity>
                                            )}
                                            <View style={styles.invisibleButton} />
                                        </>
                                    ) : (
                                        <>
                                            <TouchableOpacity style={styles.joinButton}
                                                              onPress={() => handleJoinGroup(groupDetail.id)}>
                                                <Icon name="car" size={20} color="#ffffff" />
                                            </TouchableOpacity>
                                            <View style={styles.invisibleButton} />
                                        </>
                                    )}
                                </View>
                            </View>
                        </View>
                    );
                })}
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('InsertGroupScreen')}>
                    <Text style={styles.actionButtonText}>Crea tu propio grupo</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    searchInput: {
        backgroundColor: '#1e1e1e',
        color: '#ffffff',
        padding: 10,
        borderRadius: 10,
        fontSize: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    filterButton: {
        backgroundColor: '#1e1e1e',
        padding: 10,
        borderRadius: 10,
    },
    filterButtonActive: {
        backgroundColor: '#ff0000',
    },
    filterButtonText: {
        color: '#ffffff',
        fontSize: 16,
    },
    timeInput: {
        backgroundColor: '#1e1e1e',
        color: '#ffffff',
        padding: 10,
        borderRadius: 10,
        fontSize: 16,
        width: 80,
        textAlign: "center"
    },
    scrollViewContent: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#1e1e1e',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    placeImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    placeholderImage: {
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#888',
    },
    cardContent: {
        flex: 1,
        marginLeft: 20,
        justifyContent: 'center',
    },
    groupName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 5,
    },
    groupDates: {
        fontSize: 14,
        color: '#cccccc',
        marginBottom: 5,
    },
    vehicleName: {
        fontSize: 14,
        color: '#cccccc',
        marginBottom: 5,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    detailsButton: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        padding: 10,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',

        flex: 1,
    },
    joinButton: {
        backgroundColor: '#ff0000',
        paddingHorizontal: 20,
        padding: 10,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    leaveButton: {
        backgroundColor: '#ff0000',
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20,
        flex: 1,
    },
    actionButton: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        margin: 20,
    },
    actionButtonText: {
        color: '#ff0000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingText: {
        color: '#ffffff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    placeName: {
        fontSize: 14,
        color: '#cccccc',
        marginBottom: 5,
    },
    invisibleButton: {
        flex: 1,
        marginHorizontal: 10,
    },
});

export default ViewAllGroupsScreen;
