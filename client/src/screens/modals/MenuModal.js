import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';
import AsyncStorage from "@react-native-async-storage/async-storage";

const MenuOption = ({ title, iconName, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <Icon name={iconName} type="font-awesome" color="#FF0000" size={20} />
        <Text style={styles.menuItemText}>{title}</Text>
    </TouchableOpacity>
);

// Se encarga de cerrar la sesión del usuario
const handleLogout = async (navigation, onClose) => {
    try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userInfo');
        onClose();
        navigation.navigate('Login');
    } catch (error) {
        console.error('Error logging out:', error);
    }
};

const MenuModal = ({ isVisible, onClose, navigation }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}>
        <View style={styles.modalView}>
            <View style={styles.modalBackground}>
                <View style={styles.menuContainer}>
                    <ScrollView style={styles.scrollViewStyle}>
                        <Text style={styles.groupTitle}>Perfil</Text>
                        <MenuOption title="Actualizar cuenta" iconName="edit" onPress={() => { onClose(); navigation.navigate('UserProfileScreen'); }} />
                        <MenuOption title="Ver mi perfil" iconName="user" onPress={() => { onClose(); navigation.navigate('UserDetailScreen'); }} />

                        {/* Grupo de Vehículos */}
                        <Text style={styles.groupTitle}>Vehículos</Text>
                        <MenuOption title="Vehículos" iconName="car" onPress={() => { onClose(); navigation.navigate('CarsListScreen'); }} />
                        <MenuOption title="Nuevo auto" iconName="plus" onPress={() => { onClose(); navigation.navigate('InsertCarScreen'); }} />

                        {/* Grupo de Grupos */}
                        <Text style={styles.groupTitle}>Grupos</Text>
                        <MenuOption title="Crear Grupo" iconName="users" onPress={() => { onClose(); navigation.navigate('InsertGroupScreen'); }} />
                        <MenuOption title="Ver grupos" iconName="eye" onPress={() => { onClose(); navigation.navigate('ViewAllGroupsScreen'); }} />

                        {/* Grupo de Configuración */}
                        <Text style={styles.groupTitle}>Configuración</Text>
                        <MenuOption title="Cerrar sesión" iconName="sign-out" onPress={() => handleLogout(navigation, onClose)} />
                    </ScrollView>

                    <TouchableOpacity onPress={onClose} style={styles.buttonClose}>
                        <Text style={styles.textStyle}>Cerrar Menú</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    modalBackground: {
        width: '100%',
        height: '100%',
        backgroundColor: "#0c0c0c",
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    menuContainer: {
        width: '100%',
        height: '70%',
        backgroundColor: '#151515',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center',
        paddingTop: 20,
    },
    scrollViewStyle: {
        width: '100%',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    menuItemText: {
        color: '#FFF',
        fontWeight: 'bold',
        marginLeft: 15,
    },
    buttonClose: {
        backgroundColor: "#ff0000",
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 15,
        marginBottom: 20,
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    groupTitle: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 20,
        marginBottom: 10,
        marginLeft: 15,
    },
});

export default MenuModal;
