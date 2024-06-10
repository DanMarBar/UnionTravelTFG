// Maneja la posibilidad de insertar fechas al usuario
import {Platform} from "react-native";
import {useState} from "react";

// Formato yyyy-mm-dd
export const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

// Formato hora - minuto
export const formatTime = (date) => {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
    };
    return new Date(date).toLocaleString('es-ES', options);
};
