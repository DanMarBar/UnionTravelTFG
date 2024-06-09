import React, { useState } from 'react';
import {
    Alert, ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { createTempPasswordByEmail } from '../../config/Api';

const RequestTempPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');

    const handleRequestTempPassword = async () => {
        if (!email) {
            Alert.alert("Error", "Por favor, ingresa un correo electrónico");
            return;
        }

        Alert.alert(
            "Confirmación",
            "¿Estás seguro de que quieres solicitar una contraseña temporal?",
            [
                {
                    text: "Cancelar",
                    onPress: () => console.log("Solicitud cancelada"),
                    style: "cancel"
                },
                {
                    text: "Aceptar",
                    onPress: async () => {
                        try {
                            await createTempPasswordByEmail(email);
                            Alert.alert(
                                "Éxito",
                                "Se ha enviado una contraseña temporal a tu correo electrónico",
                                [
                                    {
                                        text: "OK",
                                        onPress: () => navigation.goBack()
                                    }
                                ]
                            );
                        } catch (error) {
                            if (error.response) {
                                const errorMessage = error.response.data.error;
                                console.log(error.response)
                                console.log(errorMessage + error);
                                Alert.alert("Error al iniciar sesion:", errorMessage);
                            }else {
                                console.error('Error solicitando contraseña temporal:', error);
                                Alert.alert("Error", "No se pudo enviar la contraseña temporal");
                            }
                        }
                    }
                }
            ],
            { cancelable: false }
        );
    };

    return (
        <SafeAreaView style={styles.flexContainer}>
            <ImageBackground
                source={require('../../assets/images/ForgotPasswordBg.jpg')}
                style={styles.background}
                resizeMode="cover"
            >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                <View style={styles.textContainer}>
                    <View style={styles.sectionContainer}>
                        <GroupedDetail title="Solicitar Contraseña Temporal">
                            <EditableDetailWithIcon
                                icon="email"
                                label="Correo Electrónico"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </GroupedDetail>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.circularButton, styles.saveButton]} onPress={handleRequestTempPassword}>
                    <Icon name="send" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.circularButton, styles.goBackButton]} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

const EditableDetailWithIcon = ({ icon, label, value, onChangeText, secureTextEntry = false }) => (
    <View style={styles.detailRow}>
        <Icon name={icon} size={26} color="#ff0000" style={styles.icon} />
        <View style={styles.editableFieldContainer}>
            <Text style={styles.label}>{label}:</Text>
            <TextInput
                style={styles.editableField}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
            />
        </View>
    </View>
);

const GroupedDetail = ({ title, children }) => (
    <View style={styles.groupedContainer}>
        {title && <Text style={styles.groupTitle}>{title}</Text>}
        {children}
    </View>
);

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: '#030303',
    },
    background: {
        flex: 1,
    },
    scrollView: {
        paddingHorizontal: 15,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    textContainer: {
        marginVertical: 10,
    },
    sectionContainer: {
        backgroundColor: '#0e0e0e',
        borderRadius: 12,
        padding: 20,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    groupedContainer: {
        marginBottom: 20,
    },
    groupTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#FFF',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        marginRight: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFF',
    },
    editableFieldContainer: {
        flex: 1,
    },
    editableField: {
        borderBottomWidth: 1,
        borderBottomColor: '#444',
        fontSize: 16,
        color: '#FFF',
        marginVertical: 5,
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
    saveButton: {
        backgroundColor: '#ff0000',
    },
    goBackButton: {
        backgroundColor: '#fff',
    },
});

export default RequestTempPasswordScreen;
