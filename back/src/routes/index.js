import express from "express";

import {
    findUserByEmail,
    loginUser,
    manageUpdateUserByEmail,
    registerNewUser
} from "../controller/User.js";
import {
    getUserVehicleByRegistration,
    manageCreateNewUserVehicle,
    manageDeleteUserCar,
    manageGetUserVehiclesByUserId,
    manageGetUserVehiclesByUserWithCarsId,
    manageGetUserVehicleWithVehicleInfoByCarId,
    manageUpdateUserCarByRegistration
} from "../controller/VehiclePerson.js";
import {
    createGroup,
    deleteGroup,
    getAllGroups, getAllGroupsWithAllInfo,
    getGroupById, getGroupRoute, saveGroupRoute,
    updateGroupById
} from "../controller/Group.js";
import {
    createPlace,
    deletePlace,
    getAllPlaces,
    getPlaceById,
    updatePlace
} from "../controller/Place.js";
import multer from "multer";
import {manageGetCarById, obtainAllVehicles} from "../controller/Vehicle.js";
import {
    createGroupPerson, deleteGroupPerson,
    obtainAllGroupsData,
    obtainAllGroupsDataByGroupId, obtainAllPeopleFromGroupById, obtainPersonFromGroupById
} from "../controller/GroupPerson.js";

const router = express.Router();

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}.${file.mimetype.split('/')[1]}`);
    }
});

const upload = multer({storage: storage});

// User
router.post("/register", registerNewUser);
router.post("/login", loginUser);
router.get("/findUserByEmail/:email", findUserByEmail);
router.put('/updateUser/:email', upload.single('profilePhoto'), manageUpdateUserByEmail);

// Car
router.get("/obtainAllVehicles", obtainAllVehicles)
router.get("/manageGetCarById/:id", manageGetCarById);
router.delete("/manageDeleteUserCar/:id", manageDeleteUserCar);

// UserCar
router.post("/manageCreateNewUserVehicle/:userId", upload.single('imageUrl'), manageCreateNewUserVehicle);
router.get("/manageGetUserVehiclesByUserId/:userId", manageGetUserVehiclesByUserId);
router.get("/manageGetUserVehiclesByUserWithCarsId/:userId", manageGetUserVehiclesByUserWithCarsId);
router.get("/manageGetUserVehicleWithVehicleInfoByCarId/:carId", manageGetUserVehicleWithVehicleInfoByCarId);
router.get("/manageGetCarById/:id", manageGetCarById);
router.get("/getUserVehicleByRegistration/:registration", getUserVehicleByRegistration);
router.put("/manageUpdateCar/:registration", upload.single('imageUrl'), manageUpdateUserCarByRegistration);
router.delete("/manageGetCarById/:id", manageDeleteUserCar);

// Group
router.post("/createGroup", createGroup)
router.post("/getAllGroups", getAllGroups)
router.get("/getGroupById/:id", getGroupById);
router.put("/updateGroupById/:id", updateGroupById);
router.delete("/deleteGroup/:id", deleteGroup);

// Place
router.post("/createPlace", createPlace)
router.get("/getAllPlaces", getAllPlaces)
router.get("/getPlaceById/:id", getPlaceById);
router.put("/updatePlace/:id", updatePlace);
router.delete("/deletePlace/:id", deletePlace);

// Group Person
router.post("/createGroupPerson", createGroupPerson)
router.delete("/deleteGroupPerson/:userId/:groupId", deleteGroupPerson);
router.get("/obtainPersonFromGroupById/:userId/:groupId", obtainPersonFromGroupById);


// Toda la informacion relacionada los grupos
router.get("/obtainAllGroupsData", obtainAllGroupsData)
router.get("/getAllGroupsWithAllInfo", getAllGroupsWithAllInfo)
router.get("/obtainAllGroupsDataByGroupId/:groupId", obtainAllGroupsDataByGroupId)
router.get("/obtainAllPeopleFromGroupById/:groupId", obtainAllPeopleFromGroupById)
router.post('/route/:groupId', saveGroupRoute);
router.get('/route/:groupId', getGroupRoute);

export default router