import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';

const MenuOption = ({ title, iconName, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <Icon name={iconName} type="material" color="#2196F3" />
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
            <View style={styles.greenBackground}>
                <View style={styles.whiteBackground}>
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
    greenBackground: {
        width: '100%',
        height: '100%',
        backgroundColor: "#5bdebf",
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    whiteBackground: {
        width: '100%',
        height: '70%',
        backgroundColor: 'white',
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
        borderBottomColor: '#D3D3D3',
    },
    menuItemText: {
        color: '#000',
        fontWeight: 'bold',
        marginLeft: 15,
    },
    buttonClose: {
        backgroundColor: "#2196F3",
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
        color: '#000',
    },
    groupTitle: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 20,
        marginBottom: 10,
        marginLeft: 15,
    },
});

export default MenuModal;
