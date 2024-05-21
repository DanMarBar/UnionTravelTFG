import React, {useEffect, useState} from 'react';
import {
    Alert,
    Image,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {findUserByEmail} from "../../config/api";

const UserDetailScreen = ({}) => {
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const userData = await AsyncStorage.getItem('userInfo');
                if (userData) {
                    const userInfo = JSON.parse(userData);
                    const response = await findUserByEmail(userInfo.name);
                    setUserDetails(response.data);
                    console.log(response.data)
                } else {
                    Alert.alert("Error", "No se encontró información del usuario");
                }
            } catch (error) {
                console.error('Error recuperando la info del usuario:', error);
                Alert.alert("Error del server", "No se pudo recuperar la información del usuario");
            }
        };

        fetchDetails();
    }, []);

    if (!userDetails) {
        return <Text>Cargando detalles del usuario...</Text>;
    }


    return (
        <SafeAreaView style={styles.flexContainer}>
            <ImageBackground resizeMode="cover"
                             source={require('../../assets/images/peakpx.jpg')}
                             style={styles.imageBackground}>
                <ScrollView style={styles.scrollView}
                            contentContainerStyle={styles.contentContainer}>
                    <View style={styles.outerProfileImageContainer}>
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={{uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuBxpQ8P8WOYWRYOv-HVq2x8ZJDBB1bxohrRnCmd2cZw&s'}}
                                style={styles.profileImage}
                            />
                        </View>
                    </View>
                    <View style={styles.textContainer}>
                        <GroupedDetail title="Información Personal">
                            <DetailWithIcon icon="person" text={`Nombre: ${userDetails.name}`}
                                            iconColor="#4A90E2"/>
                            <DetailWithIcon icon="person-outline"
                                            text={`Apellido: ${userDetails.surname}`}
                                            iconColor="#50E3C2"/>
                            <DetailWithIcon icon="cake"
                                            text={`Cumpleaños: ${new Date(userDetails.birthday).toDateString()}`}
                                            iconColor="#4A90E2"/>
                        </GroupedDetail>
                        <Separator/>

                        <GroupedDetail title="Información de Contacto">
                            <DetailWithIcon icon="mail" text={`Email: ${userDetails.email}`}
                                            iconColor="#50E3C2"/>
                            <DetailWithIcon icon="phone" text={`Teléfono: ${userDetails.cellphone}`}
                                            iconColor="#4A90E2"/>
                            <DetailWithIcon icon="phone"
                                            text={`Teléfono secundario: ${userDetails.secondCellphone}`}
                                            iconColor="#50E3C2"/>
                            <DetailWithIcon icon="home" text={`Dirección: ${userDetails.direction}`}
                                            iconColor="#4A90E2"/>
                            <DetailWithIcon icon="location-city"
                                            text={`Código Postal: ${userDetails.zip}`}
                                            iconColor="#50E3C2"/>
                        </GroupedDetail>
                        <Separator/>

                        <GroupedDetail>
                            <DetailWithIcon
                                icon="check-circle"
                                text={`Solo se compartira la informacion importante entre tus compañeros`}
                                iconColor={'#4CAF50'}
                            />
                        </GroupedDetail>
                    </View>
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    );
};

const GroupedDetail = ({title, children}) => (
    <View style={styles.groupedContainer}>
        <Text style={styles.groupTitle}>{title}</Text>
        {children}
    </View>
);

const DetailWithIcon = ({icon, text, iconColor}) => (
    <View style={styles.detailRow}>
        <Icon name={icon} size={26} color={iconColor} style={styles.icon}/>
        <Text style={styles.userDetail}>{text}</Text>
    </View>
);

const Separator = () => (
    <View style={styles.separator}/>
);

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
    userDetail: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333333',
    },
    loading: {
        textAlign: 'center',
        fontSize: 18,
        marginTop: 20,
        color: '#4A90E2',
    },
});

export default UserDetailScreen;