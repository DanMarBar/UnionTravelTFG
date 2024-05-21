// src/screens/PaymentScreen.js
import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useConfirmPayment, CardForm } from '@stripe/stripe-react-native';
import { createPaymentIntent } from '../config/api';
import { obtainAllUserInfo } from '../utils/UserUtils';

const PaymentScreen = ({ route, navigation }) => {
    const { confirmPayment, loading } = useConfirmPayment();
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
            { cancelable: false }
        );
    };

    const handlePayPress = async () => {
        try {
            const response = await createPaymentIntent(amount);
            const clientSecret = response.data.clientSecret;

            const { error, paymentIntent } = await confirmPayment(clientSecret, {
                type: 'Card',
                paymentMethodType: 'Card',
                billingDetails: {
                    email,
                    address: {
                        country: 'ES', // Código de país para España
                    },
                },
            });

            if (error) {
                Alert.alert('Pago fallido', error.message);
            } else if (paymentIntent) {
                Alert.alert('Pago exitoso', '¡Tu pago fue exitoso!');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error creando intención de pago:', error);
            Alert.alert('Error', 'Hubo un error procesando tu pago. Por favor, intenta de nuevo.');
        }
    };

    return (
        <View style={styles.container}>
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
                <Picker.Item label="5 EUR" value={500} />
                <Picker.Item label="10 EUR" value={1000} />
                <Picker.Item label="15 EUR" value={1500} />
                <Picker.Item label="20 EUR" value={2000} />
                <Picker.Item label="25 EUR" value={2500} />
                <Picker.Item label="50 EUR" value={5000} />
            </Picker>
            <Button onPress={handleConfirmPayPress} title="Pagar" disabled={loading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    cardForm: {
        height: 300,
        marginVertical: 30,
    },
    picker: {
        height: 50,
        marginBottom: 30,
        marginTop: -30,
    },
});

export default PaymentScreen;
