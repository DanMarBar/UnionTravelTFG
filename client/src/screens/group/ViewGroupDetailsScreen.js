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
    obtainAllPeopleFromGroupById,
    obtainPersonFromGroupById,
    saveGroupRoute
} from '../../config/Api';
import {obtainImgRoute} from '../../utils/ImageUtils';
import {mapStyle} from "../../utils/MapUtils";
import {obtainAllUserInfo} from "../../utils/UserUtils";
import {formatTime} from "../../utils/DateUtils";
import configProtection from "../../config/ProtectedData";

const GOOGLE_MAPS_APIKEY = configProtection.googleMapsApiKey;

const ViewGroupDetailsScreen = ({route, navigation}) => {
    const [group, setGroup] = useState(null);
    const [users, setUsers] = useState([]);
    const [isLeader, setIsLeader] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [newRouteCoordinates, setNewRouteCoordinates] = useState([]);
    const [destination, setDestination] = useState(null);
    const [stops, setStops] = useState([]);

    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const { groupId } = route.params;
                const groupData = await obtainAllGroupsDataByGroupId(groupId);
                setGroup(groupData.data[0]);

                const usersData = await obtainAllPeopleFromGroupById(groupId);
                setUsers(usersData.data);

                const routeData = await getGroupRoute(groupId);
                if (routeData.data && routeData.data.coordinates) {
                    const { stops, destination, coordinates } = routeData.data.coordinates;
                    setStops(stops || []);
                    setDestination(destination || null);
                    setRouteCoordinates(coordinates || []);
                } else {
                    setStops([]);
                    setDestination(null);
                    setRouteCoordinates([]);
                }

                const userInfo = await obtainAllUserInfo();
                const userGroupInfo = await obtainPersonFromGroupById(userInfo.id, groupId);
                const groupUserData = userGroupInfo.data;
                setIsLeader(groupUserData.isUserLeader);
                setIsAdmin(userInfo.isAdmin);

            } catch (error) {
                console.error('Error obteniendo los detalles del grupo:', error);
            }
        };

        // Obtiene la ubicacion actual del usuario, si niega los permisos se asignan unos
        // predeterminados
        const getCurrentLocation = async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permiso de ubicación denegado', 'Por favor, habilita los servicios de ubicación en la configuración del dispositivo.');
                    setCurrentLocation({
                        latitude: 34.052235,
                        longitude: -118.243683,
                    });
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                setCurrentLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch (error) {
                console.error('Error obteniendo la ubicación:', error);
                setCurrentLocation({
                    latitude: 34.052235,
                    longitude: -118.243683,
                });
            }
        };

        fetchGroupDetails();
        getCurrentLocation();
    }, [route.params]);

    // Elimina a un usuario del grupo
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
            {cancelable: false}
        );
    };

    // Permite crear una ruta tocando la pantalla
    const handleMapPress = (e) => {
        const newCoordinate = e.nativeEvent.coordinate;
        setNewRouteCoordinates(prevCoordinates => {
            const updatedCoordinates = [...prevCoordinates, newCoordinate];
            console.log('New Coordinate Added:', newCoordinate);
            console.log('Updated Coordinates:', updatedCoordinates);
            return updatedCoordinates;
        });
    };

    // Verifica que dos cordenadas sean iguales
    const areCoordinatesEqual = (coords1, coords2) => {
        if (coords1.length !== coords2.length) return false;
        for (let i = 0; i < coords1.length; i++) {
            if (coords1[i].latitude !== coords2[i].latitude || coords1[i].longitude !== coords2[i].longitude) {
                return false;
            }
        }
        return true;
    };

    // Guarda la ruta en la base de datos
    const handleAssignRoute = async () => {
        console.log('Coordinates to Save:', newRouteCoordinates);

        const finalRouteCoordinates = [
            { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
            ...newRouteCoordinates
        ];

        if (destination) {
            finalRouteCoordinates.push(destination);
        }

        if (areCoordinatesEqual(routeCoordinates, finalRouteCoordinates)) {
            Alert.alert('Sin cambios', 'La ruta nueva es igual a la ruta actual.');
            return;
        }

        Alert.alert(
            'Confirmar Guardado',
            '¿Estás seguro de que deseas guardar esta ruta?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Guardar',
                    onPress: async () => {
                        try {
                            const finalRoute = {
                                stops: stops,
                                destination: destination,
                                coordinates: finalRouteCoordinates
                            };

                            await saveGroupRoute(group.GroupId, finalRoute);
                            setRouteCoordinates(finalRouteCoordinates);
                            setNewRouteCoordinates([]);

                            Alert.alert('Ruta guardada', 'Se ha guardado la ruta con las paradas y el destino final');
                        } catch (error) {
                            console.error('Error asignando la ruta:', error);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    // Reinicia la ruta
    const handleResetRoute = () => {
        setRouteCoordinates([]);
        setNewRouteCoordinates([]);
        setStops([]);
        setDestination(null);
    };

    // LLama a la api de google para poder autocompletar
    const fetchPlaceDetails = async (placeId) => {
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${configProtection.googleMapsApiKey}`);
        const data = await response.json();
        return data.result.geometry.location;
    };

    // Usa el destino seleccionado (dado por la api de google) para añadirlo a la ruta, con
    // parada incluida
    const handleDestinationSelect = async (data, details) => {
        if (details && details.geometry && details.geometry.location) {
            const {lat, lng} = details.geometry.location;
            const destinationCoordinate = {latitude: lat, longitude: lng};
            if (newRouteCoordinates.length > 0) {
                setStops([...stops, newRouteCoordinates[newRouteCoordinates.length - 1]]);
            }
            setDestination(destinationCoordinate);
            setNewRouteCoordinates([destinationCoordinate]);
        } else if (data.place_id) {
            try {
                const location = await fetchPlaceDetails(data.place_id);
                const destinationCoordinate = {latitude: location.lat, longitude: location.lng};
                if (newRouteCoordinates.length > 0) {
                    setStops([...stops, newRouteCoordinates[newRouteCoordinates.length - 1]]);
                }
                setDestination(destinationCoordinate);
                setNewRouteCoordinates([destinationCoordinate]);
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
                let waypoints = stops.map(stop => `${stop.latitude},${stop.longitude}`).join('|');
                const result = await fetch(
                    `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destination.latitude},${destination.longitude}&waypoints=${waypoints}&key=${configProtection.googleMapsApiKey}`
                );
                const data = await result.json();
                console.log(data)
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

    // Codifica los datos obtenidos de googlemaps para guardados en la base de datos
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
            <Text style={styles.loadingText}>Cargando...</Text>
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
                                {stops.map((stop, index) => (
                                    <Marker
                                        key={index}
                                        coordinate={stop}
                                        title={`Stop ${index + 1}`}
                                        description={`Stop ${index + 1}`}
                                    />
                                ))}
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
                                    placeholder='Añade paradas'
                                    onPress={handleDestinationSelect}
                                    query={{
                                        key: configProtection.googleMapsApiKey,
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
                                    <TouchableOpacity style={styles.buttonNav}
                                                      onPress={handleAssignRoute}>
                                        <Text style={styles.buttonText}>Asignar ruta</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.buttonNav}
                                                      onPress={handleResetRoute}>
                                        <Text style={styles.buttonText}>Reiniciar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View style={styles.groupInfoContainer}>
                            <Text style={styles.groupTitle}>{group.Group.name}</Text>
                            <Text style={styles.groupDescription}>{group.Group.description}</Text>
                            <Divider/>
                        </View>

                        <View style={styles.content}>
                            <View style={styles.section}>
                                <DetailWithIcon icon="place"
                                                text={`Lugar: ${group.Group.Place.name}`}
                                                iconColor="#ff0000"/>
                                <DetailWithIcon icon="event"
                                                text={`Partida: ${formatTime(group.Group.arrivalDate)}`}
                                                iconColor="#ff0000"/>
                                <DetailWithIcon icon="event"
                                                text={`Salida ${formatTime(group.Group.departureDate)}`}
                                                iconColor="#ff0000"/>

                            </View>

                            <View style={styles.section}>
                                <Text style={styles.groupHeader}>Información del Vehículo</Text>
                                <Divider/>
                                <Image
                                    source={{uri: obtainImgRoute(group.Group.VehiclePerson.imageUrl)}}
                                    style={styles.vehicleImage}/>
                                <DetailWithIcon icon="directions-car"
                                                text={`Matricula: ${group.Group.VehiclePerson.registration}`}
                                                iconColor="#ff0000"/>
                                <DetailWithIcon icon="color-lens"
                                                text={`Color: ${group.Group.VehiclePerson.color}`}
                                                iconColor="#ff0000"/>
                                <DetailWithIcon icon="directions-car"
                                                text={`Carro: ${group.Group.VehiclePerson.Car.brand} ${group.Group.VehiclePerson.Car.model} (${group.Group.VehiclePerson.Car.year.substring(0, 4)})`}
                                                iconColor="#ff0000"/>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.groupHeader}>Usuarios del Grupo</Text>
                                <Divider/>
                                {users.map(user => (
                                    <View key={user.UserId} style={styles.userContainer}>
                                        <Image
                                            source={{uri: obtainImgRoute(user.User.profilePhoto)}}
                                            style={styles.userImage}/>
                                        <View style={styles.userInfo}>
                                            <DetailWithIcon icon="person"
                                                            text={`Usuario: ${user.User.user}`}
                                                            iconColor="#ffffff"/>
                                            <DetailWithIcon icon="phone"
                                                            text={`Celular: ${user.User.cellphone || 'N/A'}`}
                                                            iconColor="#ff0000"/>
                                        </View>
                                        {(isLeader || isAdmin) && !user.isUserLeader && (
                                            <TouchableOpacity style={styles.removeButton}
                                                              onPress={() => handleRemoveUser(user.UserId)}>
                                                <Icon name="remove-circle" size={24}
                                                      color="#FF0000"/>
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
                <TouchableOpacity style={styles.iconButtonChat}
                                  onPress={() => navigation.navigate('GroupChatScreen', {group: group})}>
                    <Icon name="chat" size={30} color="#ffffff"/>
                </TouchableOpacity>
                {(isLeader || isAdmin) && (
                    <>
                        <TouchableOpacity style={styles.iconButton}
                                          onPress={() => navigation.navigate('UpdateGroupScreen', {group: group})}>
                            <Icon name="edit" size={30} color="#ff0000"/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}
                                          onPress={() => navigation.goBack()}>
                            <Icon name="arrow-back" size={30} color="#000000"/>
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
        marginTop: 0
    },
    section: {
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    mapContainer: {
        height: 250,
        marginBottom: 20,
    },
    map: {
        flex: 1,
    },
    routeInputContainer: {
        marginHorizontal: 20,
        marginBottom: 7,
        borderRadius: 40,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
        borderRadius: 10,
    },
    buttonNav: {
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
    },
    groupInfoContainer: {
        margin: 30,
        marginTop: 0,
        marginBottom: 0,
        padding: 10,
        borderRadius: 10,
    },
    groupTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 5,
    },
    groupDescription: {
        fontSize: 15,
        color: '#ffffff',
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
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
    },
    iconButtonChat: {
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
        height: 200,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,
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
