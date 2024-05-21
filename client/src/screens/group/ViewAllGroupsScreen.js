import React, { useEffect, useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { obtainAllGroupsData } from '../../config/api';
import {handleImageChange, obtainImgRoute} from "../../utils/ImageUtils";

const ViewAllGroupsScreen = ({ route, navigation }) => {
    const [groups, setGroups] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await obtainAllGroupsData();
                setGroups(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error obteniendo los detalles del coche:', error);
            }
        };

        fetchGroups();
    }, []);

    const handleDetails = (groupId) => {
        navigation.navigate('ViewGroupDetailsScreen', { groupId });
    };

    if (!groups) {
        return <Text>Cargando detalles del coche...</Text>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {groups.map((groupDetail, index) => (
                    <View key={index} style={styles.card}>
                        <Image
                            source={{ uri: obtainImgRoute(`${groupDetail.Group.Place.image}`) }}
                            style={styles.placeImage}
                        />
                        <View style={styles.cardContent}>
                            <Text style={styles.groupName}>{groupDetail.Group.name}</Text>
                            <Text style={styles.groupDescription}>{groupDetail.Group.description}</Text>
                            <Text style={styles.groupDates}>
                                {`Del ${new Date(groupDetail.Group.arrivalDate).toLocaleDateString()} al ${new Date(groupDetail.Group.departureDate).toLocaleDateString()}`}
                            </Text>
                            <Text style={styles.userEmail}>{groupDetail.User.email}</Text>
                            <TouchableOpacity style={styles.detailsButton} onPress={() => handleDetails(groupDetail.GroupId)}>
                                <Text style={styles.detailsButtonText}>Ver Detalles</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.actionButtonText}>Volver Atrás</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollViewContent: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
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
    cardContent: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    groupName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    groupDescription: {
        fontSize: 14,
        color: '#666',
        marginVertical: 5,
    },
    groupDates: {
        fontSize: 12,
        color: '#999',
    },
    userEmail: {
        fontSize: 12,
        color: '#999',
        marginVertical: 5,
    },
    detailsButton: {
        backgroundColor: '#007bff',
        padding: 5,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    detailsButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    actionButton: {
        backgroundColor: '#26b6c9',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        margin: 20,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ViewAllGroupsScreen;
