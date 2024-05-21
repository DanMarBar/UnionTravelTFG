import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';

// Boton del para desplegar el menu en la barra superior
const CustomHeaderMenu = ({onPress}) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.menuButton}>
            <Text style={styles.menuText}>Menú</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    menuButton: {
        marginRight: 10,
    },
    menuText: {
        color: '#FFFFFF',
    },
});

export default CustomHeaderMenu;
