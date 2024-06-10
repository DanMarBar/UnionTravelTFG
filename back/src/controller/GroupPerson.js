import GroupPersonModel from "../model/GroupPersonModel.js";
import PlaceModel from "../model/PlaceModel.js";
import VehicleModel from "../model/VehicleModel.js";
import VehiclePersonModel from "../model/VehiclePersonModel.js";
import User from "../model/UserModel.js";
import UserModel from "../model/UserModel.js";
import GroupModel from "../model/GroupModel.js";

// Crea una relación GroupPerson
export const createGroupPerson = async (req, res) => {
    const {isUserLeader, userStartPoint, userEndPoint, UserId, GroupId} = req.body;
    try {
        const newGroupPerson = await GroupPersonModel.create({
            isUserLeader,
            userStartPoint,
            userEndPoint,
            UserId,
            GroupId
        });
        return res.json(newGroupPerson);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al crear la relación GroupPerson");
    }
};

// Obtiene todas las relaciones GroupPerson
export const getAllGroupPersons = async (req, res) => {
    try {
        const groupPersons = await GroupPersonModel.findAll();
        return res.json(groupPersons);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al obtener las relaciones GroupPerson");
    }
};

// Obtiene una relación GroupPerson por ID
export const getGroupPersonById = async (req, res) => {
    const {id} = req.params;
    try {
        const groupPerson = await GroupPersonModel.findByPk(id);
        return res.json(groupPerson);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al obtener la relación GroupPerson");
    }
};

// Actualiza una relación GroupPerson
export const updateGroupPerson = async (req, res) => {
    const {id} = req.params;
    const {isUserLeader, userStartPoint, userEndPoint, UserId, GroupId} = req.body;
    try {
        await GroupPersonModel.update({
            isUserLeader,
            userStartPoint,
            userEndPoint,
            UserId,
            GroupId
        }, {
            where: {id}
        });
        return res.send("Actualización de la relación GroupPerson exitosa");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al actualizar la relación GroupPerson");
    }
};

// Elimina una relación GroupPerson
export const deleteGroupPerson = async (req, res) => {
    const {userId, groupId} = req.params;
    try {
        await GroupPersonModel.destroy({
            where: {UserId: userId, GroupId: groupId}
        });
        return res.send("Relación GroupPerson eliminada exitosamente");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al eliminar la relación GroupPerson");
    }
};


// Toda la informacion relacionada al grupo a partir de los GroupPersonModel
export const obtainAllGroupsData = async (req, res) => {
    try {
        const data = await GroupPersonModel.findAll({
            include: [
                {
                    model: User,
                    // No incluir VehiclePersonModel aquí
                },
                {
                    model: GroupModel,
                    include: [
                        {
                            model: PlaceModel
                        },
                        {
                            model: VehiclePersonModel,
                            as: 'VehiclePerson',
                            include: [
                                {
                                    model: VehicleModel
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al obtener los datos completos");
    }
};

// Toda la informacion relacionada a GroupPersonModel, como el grupo, los usuarios, el vehiculo...
export const obtainAllGroupsDataByGroupId = async (req, res) => {
    const {groupId} = req.params;

    try {
        const data = await GroupPersonModel.findAll({
            where: {GroupId: groupId},
            include: [
                {
                    model: User,
                },
                {
                    model: GroupModel,
                    include: [
                        {
                            model: PlaceModel
                        },
                        {
                            model: VehiclePersonModel,
                            as: 'VehiclePerson',
                            include: [
                                {
                                    model: VehicleModel
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al obtener los datos completos");
    }
};

// Obtiene Todos los usarios de un grupo por la id de este
export const obtainAllPeopleFromGroupById = async (req, res) => {
    const {groupId} = req.params;
    try {
        const groupPersons = await GroupPersonModel.findAll({
            where: {GroupId: groupId},
            include: [
                {
                    model: UserModel,
                }
            ]
        });

        if (!groupPersons.length) {
            return res.status(404).send("No se encontraron usuarios para este grupo");
        }

        return res.json(groupPersons);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al obtener los usuarios del grupo");
    }
};

// Obtiene Todos los usarios de un grupo por la id de este
export const obtainPersonFromGroupById = async (req, res) => {
    const {groupId, userId} = req.params;
    try {
        const groupPersons = await GroupPersonModel.findOne({
            where: {GroupId: groupId, UserId: userId},

        });

        return res.json(groupPersons);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al obtener los usuarios del grupo");
    }
};