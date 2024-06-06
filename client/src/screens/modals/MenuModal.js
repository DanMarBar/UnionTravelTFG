import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';

const MenuOption = ({ title, iconName, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <Icon name={iconName} type="material" color="#FF0000" />
        <Text style={styles.menuItemText}>{title}</Text>
    </TouchableOpacity>
);

const MenuModal = ({ isVisible, onClose }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}>
        <View style={styles.modalView}>
            <View style={styles.modalBackground}>
                <View style={styles.menuContainer}>
                    <ScrollView style={styles.scrollViewStyle}>
                        <Text style={styles.modalText}>Mi Menú</Text>

                        {/* Grupo de Perfil */}
                        <Text style={styles.groupTitle}>Perfil</Text>
                        <MenuOption title="Mi Cuenta" iconName="person" onPress={() => {}} />
                        <MenuOption title="Mis Pedidos" iconName="shopping-cart" onPress={() => {}} />

                        {/* Grupo de Configuración */}
                        <Text style={styles.groupTitle}>Configuración</Text>
                        <MenuOption title="Configuración de la App" iconName="settings" onPress={() => {}} />
                        <MenuOption title="Notificaciones" iconName="notifications" onPress={() => {}} />

                        {/* Grupo de Información */}
                        <Text style={styles.groupTitle}>Soporte</Text>
                        <MenuOption title="Ayuda" iconName="help" onPress={() => {}} />
                        <MenuOption title="Acerca de" iconName="info" onPress={() => {}} />
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
