import React, {useEffect, useState} from 'react';
import {
    Alert,
    Button,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {Icon} from 'react-native-elements';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import {
    deleteUserFromGroup,
    getGroupRoute,
    obtainAllGroupsDataByGroupId,
    obtainAllPeopleFromGroupById, obtainPersonFromGroupById,
    removeUserFromGroup,
    saveGroupRoute
} from '../../config/api';
import {obtainImgRoute} from '../../utils/ImageUtils';
import {mapStyle} from "../../utils/MapUtils";
import {obtainAllUserInfo} from "../../utils/UserUtils";
import ProtectedData from "../../config/ProtectedData";
import config from "../../config/ProtectedData";

const GOOGLE_MAPS_APIKEY = config.googleMapsApiKey;

const ViewGroupDetailsScreen = ({route, navigation}) => {
    const [group, setGroup] = useState(null);
    const [users, setUsers] = useState([]);
    const [isLeader, setIsLeader] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [newRouteCoordinates, setNewRouteCoordinates] = useState([]);
    const [destination, setDestination] = useState(null);

    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const {groupId} = route.params;
                const groupData = await obtainAllGroupsDataByGroupId(groupId);
                setGroup(groupData.data[0]);

                const usersData = await obtainAllPeopleFromGroupById(groupId);
                setUsers(usersData.data);

                const routeData = await getGroupRoute(groupId);
                if (routeData.data.coordinates) {
                    setRouteCoordinates(routeData.data.coordinates);
                }

                const userInfo = await obtainAllUserInfo()
                const userGroupInfo = await obtainPersonFromGroupById(userInfo.id, groupId)
                const groupUserData = userGroupInfo.data
                setIsLeader(groupUserData.isUserLeader);
                setIsAdmin(userInfo.isAdmin);

            } catch (error) {
                console.error('Error obteniendo los detalles del grupo:', error);
            }
        };

        const getCurrentLocation = async () => {
            try {
                let {status} = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.error('Permiso de ubicación denegado');
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                setCurrentLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch (error) {
                console.error('Error obteniendo la ubicación:', error);
            }
        };

        fetchGroupDetails();
        getCurrentLocation();
    }, [route.params]);

    const handleRemoveUser = async (userId) => {
        Alert.alert(
            "Eliminar usuario",
            "¿Estás seguro de que quieres eliminar este usuario del grupo?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        try {
                            await deleteUserFromGroup(userId, group.GroupId);
                            setUsers(users.filter(user => user.UserId !== userId));
                        } catch (error) {
                            console.error('Error eliminando al usuario del grupo:', error);
                        }
                    }
                }
            ],
            { cancelable: false }
        );
    };

    const handleMapPress = (e) => {
        const newCoordinate = e.nativeEvent.coordinate;
        setNewRouteCoordinates(prevCoordinates => {
            const updatedCoordinates = [...prevCoordinates, newCoordinate];
            console.log('New Coordinate Added:', newCoordinate);
            console.log('Updated Coordinates:', updatedCoordinates);
            return updatedCoordinates;
        });
    };

    const handleAssignRoute = async () => {
        console.log('Coordinates to Save:', newRouteCoordinates);
        if (newRouteCoordinates.length === 0) {
            console.error('No coordinates to save');
            return;
        }

        try {
            await saveGroupRoute(group.GroupId, newRouteCoordinates);
            setRouteCoordinates(newRouteCoordinates);
            setNewRouteCoordinates([]);
        } catch (error) {
            console.error('Error asignando la ruta:', error);
        }
    };

    const handleResetRoute = () => {
        setNewRouteCoordinates([]);
    };

    const fetchPlaceDetails = async (placeId) => {
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_APIKEY}`);
        const data = await response.json();
        return data.result.geometry.location;
    };

    const handleDestinationSelect = async (data, details) => {
        if (details && details.geometry && details.geometry.location) {
            const {lat, lng} = details.geometry.location;
            const destinationCoordinate = {latitude: lat, longitude: lng};
            setDestination(destinationCoordinate);
        } else if (data.place_id) {
            try {
                const location = await fetchPlaceDetails(data.place_id);
                const destinationCoordinate = {latitude: location.lat, longitude: location.lng};
                setDestination(destinationCoordinate);
            } catch (error) {
                console.error('Error fetching place details:', error);
            }
        } else {
            console.error('Invalid location data:', details);
        }
    };

    useEffect(() => {
        if (currentLocation && destination) {
            const fetchDirections = async () => {
                const result = await fetch(
                    `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_APIKEY}`
                );
                const data = await result.json();
                if (data.routes.length) {
                    const points = decode(data.routes[0].overview_polyline.points);
                    const route = points.map(point => ({latitude: point[0], longitude: point[1]}));
                    setNewRouteCoordinates(route);
                } else {
                    Alert.alert("No se pudo crear una ruta", "No se ha podido crear una ruta con la ubicacion introducida");
                }
            };

            fetchDirections();
        }
    }, [currentLocation, destination]);

    const decode = (t, e = 5) => {
        let points = [];
        for (let step = 0, lat = 0, lon = 0; step < t.length;) {
            let result = 1, shift = 0, byte = 0;
            do {
                byte = t.charCodeAt(step++) - 63 - 1;
                result += byte << shift;
                shift += 5;
            } while (byte >= 0x1f);
            lat += result & 1 ? ~(result >> 1) : result >> 1;

            result = 1;
            shift = 0;
            do {
                byte = t.charCodeAt(step++) - 63 - 1;
                result += byte << shift;
                shift += 5;
            } while (byte >= 0x1f);
            lon += result & 1 ? ~(result >> 1) : result >> 1;

            points.push([lat * 1e-5, lon * 1e-5]);
        }
        return points;
    };

    if (!group || !currentLocation) {
        return <View style={styles.userContainer}>

        </View>
    }

    const renderItem = ({item}) => (
        <View style={styles.userContainer}>
            <Image source={{uri: obtainImgRoute(item.User.profilePhoto)}} style={styles.userImage}/>
            <View style={styles.userInfo}>
                <DetailWithIcon icon="person" text={`Usuario: ${item.User.user}`}
                                iconColor="#ff0000"/>
                <DetailWithIcon icon="phone" text={`Celular: ${item.User.cellphone || 'N/A'}`}
                                iconColor="#ff0000"/>
            </View>
            {isLeader || isAdmin && !item.isUserLeader && (
                <TouchableOpacity style={styles.removeButton}
                                  onPress={() => handleRemoveUser(item.UserId)}>
                    <Icon name="remove-circle" size={24} color="#FF0000"/>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.flexContainer}>
            <FlatList
                data={users}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={() => (
                    <>
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: currentLocation.latitude,
                                    longitude: currentLocation.longitude,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                }}
                                customMapStyle={mapStyle}
                                onPress={isLeader || isAdmin ? handleMapPress : null}
                            >
                                <Marker
                                    coordinate={currentLocation}
                                    title={"Your Location"}
                                    description={"This is where you are"}
                                />
                                {routeCoordinates.length > 0 && (
                                    <Polyline
                                        coordinates={routeCoordinates}
                                        strokeColor="#ff0000"
                                        strokeWidth={6}
                                    />
                                )}
                                {newRouteCoordinates.length > 0 && (
                                    <Polyline
                                        coordinates={newRouteCoordinates}
                                        strokeColor="#FF0000"
                                        strokeWidth={6}
                                    />
                                )}
                                {destination && (
                                    <Marker
                                        coordinate={destination}
                                        title={"Destination"}
                                        description={"This is your destination"}
                                    />
                                )}
                            </MapView>
                        </View>

                        {(isLeader || isAdmin) && (
                            <View style={styles.routeInputContainer}>
                                <GooglePlacesAutocomplete
                                    placeholder='Search for a place'
                                    onPress={handleDestinationSelect}
                                    query={{
                                        key: GOOGLE_MAPS_APIKEY,
                                        language: 'en',
                                    }}
                                    styles={{
                                        container: {
                                            flex: 0,
                                            position: 'relative',
                                            width: '100%',
                                            zIndex: 1,
                                        },
                                        textInputContainer: {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            borderTopWidth: 0,
                                            borderBottomWidth: 0,
                                        },
                                        textInput: {
                                            height: 38,
                                            color: '#131212',
                                            fontSize: 16,
                                        },
                                        predefinedPlacesDescription: {
                                            color: '#1faadb',
                                        },
                                    }}
                                />
                                <View style={styles.buttonContainer}>
                                    <Button title="Assign Route" color="#ff0000" onPress={handleAssignRoute}/>
                                    <Button title="Reset Route" color="#ff0000" onPress={handleResetRoute}/>
                                </View>
                            </View>
                        )}

                        <View style={styles.content}>
                            <View style={styles.section}>
                                <Text style={styles.groupHeader}>Información del Grupo</Text>
                                <Divider/>
                                <DetailWithIcon icon="group" text={`Nombre: ${group.Group.name}`} iconColor="#ff0000"/>
                                <DetailWithIcon icon="info" text={`Descripción: ${group.Group.description}`} iconColor="#ff0000"/>
                                <DetailWithIcon icon="place" text={`Lugar: ${group.Group.Place.name}`} iconColor="#ff0000"/>
                                <DetailWithIcon icon="event" text={`Llegada: ${new Date(group.Group.arrivalDate).toLocaleDateString()} | Salida: ${new Date(group.Group.departureDate).toLocaleDateString()}`} iconColor="#ff0000"/>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.groupHeader}>Información del Vehículo</Text>
                                <Divider/>
                                <DetailWithIcon icon="directions-car" text={`Registro: ${group.Group.VehiclePerson.registration}`} iconColor="#ff0000"/>
                                <DetailWithIcon icon="color-lens" text={`Color: ${group.Group.VehiclePerson.color}`} iconColor="#ff0000"/>
                                <DetailWithIcon icon="directions-car" text={`Carro: ${group.Group.VehiclePerson.Car.brand} ${group.Group.VehiclePerson.Car.model} (${group.Group.VehiclePerson.Car.year.substring(0, 4)})`} iconColor="#ff0000"/>
                                <Image source={{uri: obtainImgRoute(group.Group.VehiclePerson.imageUrl)}} style={styles.vehicleImage}/>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.groupHeader}>Usuarios del Grupo</Text>
                                <Divider/>
                                {users.map(user => (
                                    <View key={user.UserId} style={styles.userContainer}>
                                        <Image source={{uri: obtainImgRoute(user.User.profilePhoto)}} style={styles.userImage}/>
                                        <View style={styles.userInfo}>
                                            <DetailWithIcon icon="person" text={`Usuario: ${user.User.user}`} iconColor="#ff0000"/>
                                            <DetailWithIcon icon="phone" text={`Celular: ${user.User.cellphone || 'N/A'}`} iconColor="#ff0000"/>
                                        </View>
                                        {(isLeader || isAdmin) && !user.isUserLeader && (
                                            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveUser(user.UserId)}>
                                                <Icon name="remove-circle" size={24} color="#FF0000"/>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    </>
                )}
                renderItem={null}
            />
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('GroupChatScreen', {group: group})}>
                    <Icon name="chat" size={30} color="#000"/>
                </TouchableOpacity>
                {(isLeader || isAdmin) && (
                    <>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('UpdateGroupScreen', {group: group})}>
                            <Icon name="edit" size={30} color="#000"/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                            <Icon name="arrow-back" size={30} color="#000"/>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

const DetailWithIcon = ({icon, text, iconColor = "#000"}) => (
    <View style={styles.detailRow}>
        <Icon name={icon} size={24} color={iconColor}/>
        <Text style={styles.carDetail}>{text}</Text>
    </View>
);

const Divider = () => <View style={styles.divider}/>;

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: '#131313',
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingVertical: 20,
    },
    content: {
        margin: 20,
    },
    section: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    mapContainer: {
        height: 200,
        marginVertical: 20,
    },
    map: {
        flex: 1,
    },
    routeInputContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    carDetail: {
        fontSize: 16,
        marginLeft: 10,
        color: '#FFF',
        flexShrink: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 6,
    },
    groupHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    headerText: {
        fontSize: 22,
        color: '#ff0000',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        margin: 20,
    },
    iconButton: {
        backgroundColor: '#ff0000',
        padding: 15,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
    },
    vehicleImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginTop: 10,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userInfo: {
        flex: 1,
    },
    loadingText: {
        fontSize: 20,
        color: '#ffffff',
        textAlign: 'center',
        marginTop: 20,
    },
    removeButton: {
        marginLeft: 10,
    },
});

export default ViewGroupDetailsScreen;
