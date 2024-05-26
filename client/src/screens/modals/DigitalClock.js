import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DigitalClock = () => {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setCurrentTime(`${hours}:${minutes}`);
        };

        updateClock();
        const intervalId = setInterval(updateClock, 60000); // Actualiza cada minuto

        return () => clearInterval(intervalId);
    }, []);

    return (
        <View style={styles.clockContainer}>
            <Text style={styles.clockText}>{currentTime}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    clockContainer: {
        marginVertical: 10,
        backgroundColor: '#1C1C1C',
        borderRadius: 10,
        alignItems: 'center',
    },
    clockText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'RalewayDots',
    },
});

export default DigitalClock;
