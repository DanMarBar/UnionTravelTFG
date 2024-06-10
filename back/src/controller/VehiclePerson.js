import VehiclePersonModel from "../model/VehiclePersonModel.js";
import VehicleModel from "../model/VehicleModel.js";
import User from "../model/UserModel.js";

// Obtiene los datos para crear los vehiculos
export const manageCreateNewUserVehicle = async (req, res) => {
    const {registration, color, year, operative, carId} = req.body;
    const {userId} = req.params;

    // Matricula valida
    if (!isValidRegistration(registration)) {
        return res.status(400).send("La matrícula no es válida");
    }

    // Matricula no repetida
    const vehiclePerson = await VehiclePersonModel.findOne({where: {registration: registration}});
    if (vehiclePerson) {
        return res.status(400).json({
            message: "El vehículo ya existe, su matricula esta" +
                " replicada", error: "matricula replicada"
        });
    }

    //Obtener imagen
    const imageUrl = req.file ? req.file.path : null;
    const newUserVehicle = await createNewUserVehicle(registration, color, year, operative, imageUrl, carId, userId);

    if (newUserVehicle) {
        return res.json(newUserVehicle);
    } else {
        return res.status(500).json({message: "Error", error: "Error al crear vehiculo"});
    }
}

// Crea el vehículo
const createNewUserVehicle = async (registration, color, year, operative, imageUrl, carId, userId) => {
    if (imageUrl === "" || imageUrl === null) {
        imageUrl = "uploads/DefaultCarPhoto.jpeg";
    }

    try {
        return await VehiclePersonModel.create({
            registration: registration,
            color: color,
            year: year,
            operative: operative,
            imageUrl: imageUrl,
            UserId: userId,
            CarId: carId
        });

    } catch (error) {
        console.error("Error al crear el vehículo:", error);
        return null;
    }
}

const isValidRegistration = (registration) => {
    registration = registration.trim().toUpperCase();
    const pattern = /^[A-Z0-9]{2,}-[A-Z0-9]{2,}$/;
    return pattern.test(registration);
};

// Regresa todos los autos en formato json
export const manageGetUserVehicleWithVehicleInfoByCarId = async (req, res) => {
    const carId = req.params.carId
    return res.json(await getUserVehicleWithVehicleInfoByCarId(carId))
}

// Regresa todos los carros de la base de datos
const getUserVehicleWithVehicleInfoByCarId = async (carId) => {
    try {
        return await VehiclePersonModel.findAll({
            include: [
                {
                    model: VehicleModel,
                    where: {id: carId}
                },
            ]
        });
    } catch (error) {
        console.error('Error fetching vehicle person:', error);
        return "Error en la consulta de el vehiculo "
    }
}

// Vehiculo del usuario por su id
export const manageGetUserVehiclesByUserId = async (req, res) => {
    try {
        const userId = req.params.userId
        const vehicles = await VehiclePersonModel.findAll({where: {userId: userId}});
        return res.json(vehicles)

    } catch (error) {
        console.log(error);
        return res.json("No se han podido obtener los vehículos")
    }
}

// Vehiculo del usuario por su id y la del vehiculo
export const manageGetUserVehiclesByUserWithCarsId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const vehicles = await VehiclePersonModel.findAll({
            where: { userId: userId },
            include: [{
                model: VehicleModel,
            }]
        });
        return res.json(vehicles);
    } catch (error) {
        console.log(error);
        return res.json("No se han podido obtener los vehículos");
    }
};

// Obtiene los valores necesarios para el update
export const manageUpdateUserCarByRegistration = async (req, res) => {
    const registration = req.params.registration
    const {color, year, operative, carId} = req.body

    // Verificar que la imagen no sea null
    let imageUrl = req.file ? req.file.path : null;
    if (imageUrl == null) {
        const vehicle = await VehiclePersonModel.findOne({where: {registration: registration}})
        if (vehicle.imageUrl != null) {
            imageUrl = vehicle.imageUrl
        }
    }

    return res.json(updateCar(registration, color, year, operative, imageUrl, carId))
}

// Actualiza el vehiculo a los valores dados
const updateCar = async (registration, color, year, operative, imageUrl, carId) => {
    try {
        await VehiclePersonModel.update({
            color: color,
            year: year,
            operative: operative,
            imageUrl: imageUrl,
            CarId: carId
        }, {
            where: {
                registration: registration
            }
        })
        return "La actualizacion de los datos del vehiculo ha sido exitosa"

    } catch (error) {
        console.log(error)
        return "Ha ocurrido un error a actualizar"
    }
}

// Obtiene el id necesario para el delete
export const manageDeleteUserCarByRegistration = async (req, res) => {
    const registration = req.params.registration;
    return res.json(deleteCar(registration))
}

// Elimina el vehiculo
const deleteCar = async (registration) => {
    try {
        await VehiclePersonModel.destroy({
            where: {
                registration: registration
            }
        })
        return "La eliminacion del vehiculo ha sido exitosa"

    } catch (error) {
        console.log(error)
        return "Ha ocurrido un error a actualizar"
    }
}

// Obtiene VehiclePersonModel por su matricula
export const getUserVehicleByRegistration = async (req, res) => {
    try {
        const registration = req.params.registration
        const vehicle = await VehiclePersonModel.findOne({where: {registration: registration}});
        return res.json(vehicle)
    } catch (error) {
        console.log(error)
        return "Ha ocurrido un error a actualizar"
    }
}

// Obtiene VehiclePersonModel por su matricula
export const getUserVehicleWithCarByRegistration = async (req, res) => {
    try {
        const registration = req.params.registration;
        const vehicle = await VehiclePersonModel.findOne({
            include: [
                {
                    model: VehicleModel,
                }
            ],
            where: { registration: registration }
        });
        return res.json(vehicle);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Ha ocurrido un error al actualizar" });
    }
};
