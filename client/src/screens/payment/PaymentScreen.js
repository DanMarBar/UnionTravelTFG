// src/screens/PaymentScreen.js
import React, {useEffect, useState} from 'react';
import {Alert, Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {CardForm, useConfirmPayment} from '@stripe/stripe-react-native';
import {createInvoiceUsingUserEmail, createPaymentIntent} from '../../config/Api';
import {obtainAllUserInfo} from '../../utils/UserUtils';
import * as Notifications from "expo-notifications";

const PaymentScreen = ({route, navigation}) => {
    const {confirmPayment, loading} = useConfirmPayment();
    const [amount, setAmount] = useState(1000);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await obtainAllUserInfo();
                setEmail(userData.email);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleConfirmPayPress = () => {
        Alert.alert(
            'Confirmar Pago',
            `Estás a punto de pagar ${amount / 100} Euros. ¿Quieres proceder?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'OK',
                    onPress: handlePayPress,
                },
            ],
            {cancelable: false}
        );
    };

    // Hace la transaccion del pago enviado por el usuario, llama a la base de datos para
    // verificar y luego a Stripe. Si no hay error enviara notificacion y creara una factura
    const handlePayPress = async () => {
        try {
            const response = await createPaymentIntent(amount);
            const clientSecret = response.data.clientSecret;

            const {error, paymentIntent} = await confirmPayment(clientSecret, {
                type: 'Card',
                paymentMethodType: 'Card',
                billingDetails: {
                    email,
                    address: {
                        country: 'ES',
                    },
                },
            });

            if (error) {
                Alert.alert('Pago fallido', error.message);
                console.log(error)
            } else if (paymentIntent) {

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Donacion exitosa",
                        body: "Muchas gracias por tu donacion, apreciamos tu colaboracion",
                        sound: 'default',
                    },
                    trigger: {seconds: 1},
                });
                console.log(paymentIntent)
                Alert.alert('Pago exitoso', '¡Tu pago fue exitoso!');

                await createInvoiceUsingUserEmail(email, {
                    invoiceNumber: paymentIntent.id,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    status: paymentIntent.status,
                    created: paymentIntent.created,
                });

                navigation.goBack();
            }
        } catch (error) {
            console.error('Error creando intención de pago:', error);
            Alert.alert('Error', 'Hubo un error procesando tu pago. Por favor, intenta de nuevo.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Apoya nuestra causa</Text>
            <CardForm
                style={styles.cardForm}
                onFormComplete={(cardDetails) => {
                    console.log(cardDetails);
                }}
                autofocus
            />
            <Picker
                selectedValue={amount}
                style={styles.picker}
                onValueChange={(itemValue) => setAmount(itemValue)}
            >
                <Picker.Item label="5 EUR" value={500}/>
                <Picker.Item label="10 EUR" value={1000}/>
                <Picker.Item label="15 EUR" value={1500}/>
                <Picker.Item label="20 EUR" value={2000}/>
                <Picker.Item label="25 EUR" value={2500}/>
                <Picker.Item label="50 EUR" value={5000}/>
            </Picker>
            <TouchableOpacity style={styles.buttonContainer}>
                <Button onPress={handleConfirmPayPress} title="Pagar" disabled={loading}
                        color="#ff0000"/>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#111111',
    },
    title: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        marginTop: -30,
    },
    cardForm: {
        height: 300,
        marginVertical: 30,
    },
    picker: {
        backgroundColor: '#fff',
        borderRadius: 5,
        height: 50,
        marginBottom: 30,
        marginTop: -30,
    },
    buttonContainer: {
        backgroundColor: '#ff0000',
        borderRadius: 5,
        justifyContent: 'center',
    },
});

export default PaymentScreen;