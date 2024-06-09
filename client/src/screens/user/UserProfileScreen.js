import React, {useEffect, useState} from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {obtainAllUserInfo} from "../../utils/UserUtils";
import {obtainImgRoute} from "../../utils/ImageUtils";
import {useFocusEffect} from "@react-navigation/native";

const UserDetailScreen = ({navigation}) => {
    const [userDetails, setUserDetails] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            const fetchDetails = async () => {
                try {
                    const userInfo = await obtainAllUserInfo();
                    setUserDetails(userInfo);
                } catch (error) {
                    console.error('Error recuperando la info del usuario:', error);
                    Alert.alert("Error del server", "No se pudo recuperar la información del usuario");
                }
            };

            fetchDetails();
        }, [])
    );

    if (!userDetails) {
        return <Text>Cargando detalles del usuario...</Text>;
    }


    return (
        <SafeAreaView style={styles.flexContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('UserProfileScreen')}>
                    <Icon name="edit" size={30} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                <View style={styles.headerContainer}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={{ uri: obtainImgRoute(userDetails.profilePhoto) }}
                            style={styles.profileImage}
                        />
                    </View>
                    <Text style={styles.userName}>{userDetails.name} {userDetails.surname}</Text>
                    <View style={styles.infoBoxesContainer}>
                        <InfoBox icon="work" text="Puesto" value={"No necesario"} />
                        <InfoBox icon="location-on" text="Ubicación" value={"En Aragon"} />
                        <InfoBox icon="assignment" text="Proyectos" value={"En progreso"} />
                    </View>
                </View>
                <View style={styles.overlayContainer}>
                    <Section title="Información Personal">
                        <DetailWithTitle title="Nombre" icon="person" text={userDetails.name} />
                        <Separator />
                        <DetailWithTitle title="Apellido" icon="person-outline" text={userDetails.surname} />
                        <Separator />
                        <DetailWithTitle title="Cumpleaños" icon="cake" text={new Date(userDetails.birthday).toDateString()} />
                    </Section>
                    <Section title="Información de Contacto">
                        <DetailWithTitle title="Email" icon="mail" text={userDetails.email} />
                        <Separator />
                        <DetailWithTitle title="Teléfono" icon="phone" text={userDetails.cellphone} />
                        <Separator />
                        <DetailWithTitle title="Teléfono Secundario" icon="phone" text={userDetails.secondCellphone} />
                        <Separator />
                        <DetailWithTitle title="Dirección" icon="home" text={userDetails.direction} />
                        <Separator />
                        <DetailWithTitle title="Código Postal" icon="location-city" text={userDetails.zip} />
                    </Section>
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.circularButton, styles.editButton]}
                    onPress={() => navigation.navigate('UserProfileScreen')}
                >
                    <Icon name="edit" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.circularButton, styles.goBackButton]}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const Section = ({ title, children }) => (
    <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const InfoBox = ({ icon, text, value }) => (
    <View style={styles.infoBox}>
        <Icon name={icon} size={30} color="#ffffff" style={styles.infoBoxIcon} />
        <Text style={styles.infoBoxText}>{text}</Text>
        <Text style={styles.infoBoxValue}>{value}</Text>
    </View>
);

const DetailWithIcon = ({ icon, text, iconColor = '#ff0000' }) => (
    <View style={styles.detailRow}>
        <View style={styles.detailIconContainer}>
            <Icon name={icon} size={25} color={iconColor} style={styles.icon} />
        </View>
        <Text style={styles.userDetail}>{text}</Text>
    </View>
);

const DetailWithTitle = ({ title, icon, text, iconColor = '#ff0000' }) => (
    <View style={styles.detailContainer}>
        <Text style={styles.detailTitle}>{title}</Text>
        <DetailWithIcon icon={icon} text={text} iconColor={iconColor} />
    </View>
);

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: '#090909',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 10,
        backgroundColor: '#090909',
    },
    scrollView: {
        paddingHorizontal: 0,
    },
    contentContainer: {
        paddingVertical: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImageContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2C2C2C',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    userName: {
        fontSize: 26,
        fontWeight: '700',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'capitalize',
    },
    infoBoxesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    infoBox: {
        width: '30%',
        backgroundColor: '#111111',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
    },
    infoBoxIcon: {
        marginBottom: 10,
    },
    infoBoxText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFF',
        textAlign: 'center',
    },
    infoBoxValue: {
        fontWeight: '700',
        color: '#FFF',
        textAlign: 'center',
    },
    overlayContainer: {
        width: '100%',
        backgroundColor: '#111111',
        borderRadius: 30,
        padding: 20,
        marginTop: -20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#444',
        paddingBottom: 5,
    },
    detailContainer: {
        marginBottom: 15,
    },
    detailTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 5,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    icon: {
        marginRight: 0,
    },
    userDetail: {
        fontSize: 17,
        fontWeight: '400',
        color: '#FFF',
    },
    separator: {
        height: 1,
        backgroundColor: '#444',
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
    editButton: {
        backgroundColor: '#ff0000',
    },
    goBackButton: {
        backgroundColor: '#fff',
    },
});

export default UserDetailScreen;