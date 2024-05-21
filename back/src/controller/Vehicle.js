import Vehicle from "../model/VehicleModel.js";
import req from "express/lib/request.js";
import res from "express/lib/response.js";

// Crea un vehículo
export const manageCreateNewUserVehicle = async (req, res) => {
    const { name, year, seats, brand, model } = req.body
    try {
        const newVehicle = await Vehicle.create({
            name,
            year,
            seats,
            brand,
            model
        });
        return res.json(newVehicle);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al crear el vehículo");
    }
};

// Obtiene todos los vehículos por email
export const manageGetUserVehiclesByEmail = async (req, res) => {
    const { email } = req.params;
    try {
        const vehicles = await Vehicle.findAll({ where: { email } });
        return res.json(vehicles);

    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al obtener los vehículos");
    }
};

// Obtiene un vehículo
export const obtainAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll();
        return res.json(vehicles);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al obtener los vehículos");
    }
};

// Obtiene un vehículo por ID
export const manageGetCarById = async (req, res) => {
    const { id } = req.params;
    try {
        const vehicle = await Vehicle.findByPk(id);
        return res.json(vehicle);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al obtener el vehículo");
    }
};

// Actualiza un vehículo
export const manageUpdateUserCar = async (req, res) => {
    const { id } = req.params;
    const { name, year, seats, brand, model } = req.body;
    try {
        await Vehicle.update({
            name: name,
            year: year,
            seats: seats,
            brand: brand,
            model: model
        }, {
            where: { id }
        });
        return res.send("Actualización del vehículo exitosa");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al actualizar el vehículo");
    }
};

// Elimina un vehículo
export const manageDeleteUserCar = async (req, res) => {
    const { id } = req.params;
    try {
        await Vehicle.destroy({
            where: { id }
        });
        return res.send("Vehículo eliminado exitosamente");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al eliminar el vehículo");
    }
};
