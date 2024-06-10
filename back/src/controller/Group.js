import Group from "../model/GroupModel.js";
import GroupModel from "../model/GroupModel.js";
import PlaceModel from "../model/PlaceModel.js";
import VehiclePersonModel from "../model/VehiclePersonModel.js";
import UserModel from "../model/UserModel.js";
import GroupPersonModel from "../model/GroupPersonModel.js";
import VehicleModel from "../model/VehicleModel.js";

// Crea un grupo
export const createGroup = async (req, res) => {
    const {name, description, arrivalDate, departureDate, placeId, registration} = req.body;
    try {
        const newGroup = await Group.create({
            name,
            description,
            arrivalDate,
            departureDate,
            placeId,
            registration
        });
        return res.json(newGroup);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al crear el grupo");
    }
};

// Obtiene todos los grupos
export const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.findAll();
        return res.json(groups);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al obtener los grupos");
    }
};

// Obtiene toda la informacion partiendo desde los grupos
export const getAllGroupsWithAllInfo = async (req, res) => {
    try {
        const groups = await Group.findAll({
            include: [
                {
                    model: PlaceModel,
                },
                {
                    model: VehiclePersonModel,
                    include: [
                        {
                            model: VehicleModel,
                        },
                    ]
                },
                {
                    model: GroupPersonModel,
                    include: [
                        {
                            model: UserModel,
                        }
                    ]
                },
            ]
        });

        return res.json(groups);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al obtener los grupos");
    }
};


// Obtiene un grupo por ID
export const getGroupById = async (req, res) => {
    const {id} = req.params;
    try {
        const group = await Group.findByPk(id);
        return res.json(group);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al obtener el grupo");
    }
};

// Actualiza un grupo
export const updateGroupById = async (req, res) => {
    const id = req.params.id
    const {name, description, arrivalDate, departureDate, placeId, registration} = req.body;
    try {
        await Group.update({
            name,
            description,
            arrivalDate,
            departureDate,
            placeId,
            registration
        }, {
            where: {id}
        });
        return res.send("Actualización del grupo exitosa");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al actualizar el grupo");
    }
};

// Elimina un grupo
export const deleteGroup = async (req, res) => {
    const {id} = req.params;
    try {
        await Group.destroy({
            where: {id}
        });
        return res.send("Grupo eliminado exitosamente");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al eliminar el grupo");
    }
};

// Verifica si el vehiculo esta siendo usado en al menos un grupo
export const checkIfCarIsBeingUsedInGroup = async (req, res) => {
    const { registration } = req.params;
    try {
        const group = await Group.findOne({
            where: { registration }
        });

        if (group) {
            return res.send(true);
        } else {
            return res.send(false);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al verificar los grupos");
    }
};

// Guarda la ruta propuesta dentro de la base de datos, lo guarda como json
export const saveGroupRoute = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { coordinates } = req.body;

        const routeString = JSON.stringify(coordinates);

        const group = await Group.update(
            { route: routeString },
            { where: { id: groupId } }
        );

        if (group[0] > 0) {
            res.status(200).json({ message: 'Route saved successfully' });
        } else {
            res.status(404).json({ message: 'Group not found' });
        }
    } catch (error) {
        console.error('Error saving route:', error);
        res.status(500).json({ message: 'Error saving route', error });
    }
};

// Obtiene los valores de la ruta del grupo cuya id fue pasada por parametro de la base de
// datos, parsea el json y la envia
export const getGroupRoute = async (req, res) => {
    try {
        const { groupId } = req.params;

        if (!groupId) {
            return res.status(400).json({ message: 'Group ID is required' });
        }

        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        let route = [];
        if (group.route) {
            try {
                route = JSON.parse(group.route);
            } catch (jsonParseError) {
                console.error('Error parsing route JSON:', jsonParseError);
                return res.status(500).json({ message: 'Error parsing route JSON', error: jsonParseError });
            }
        }

        return res.status(200).json({ coordinates: route });
    } catch (error) {
        console.error('Error getting route:', error);
        return res.status(500).json({ message: 'Error getting route', error });
    }
};