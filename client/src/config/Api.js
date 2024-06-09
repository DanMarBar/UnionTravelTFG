import axios from 'axios';

export const serverConnectionId = "http://192.168.1.129:3000"

const api = axios.create({
    baseURL: serverConnectionId
});

export const getNotes = () => api.get('/manageGetCars');

// Cars
export const obtainAllVehicles = () => api.get('/obtainAllVehicles');
export const createCars = (car) => api.post('/manageCreateCars', car);
export const manageGetCarById = (id) => api.get(`/manageGetCarById/${id}`);
export const manageUpdateCar = (id, carData) => api.put(`/manageUpdateCar/${id}`, carData);
export const manageDeleteCar = (id) => api.delete(`/manageDeleteCar/${id}`);

// Auth
export const googleSignIn = () => api.get('/auth/google');
export const registerNewUser = (userData) => api.post('/register', userData);
export const loginUser = (credentials) => api.post('/login', credentials);

// User
export const findUserByEmail = (email) => api.get(`/findUserByEmail/${email}`);
export const changeUserPasswordByEmail = (email, passwords) => api.post(`/changeUserPasswordByEmail/${email}`, passwords);
export const createTempPasswordByEmail = (email) => api.get(`/createTempPasswordByEmail/${email}`);
export const updateUserByEmail = (email, formData) => api.put(`/updateUser/${email}`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});

//User and car
export const manageCreateNewUserVehicle = (userId, carDetails) => api.post(`/manageCreateNewUserVehicle/${userId}`, carDetails, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
export const manageGetUserVehiclesByUserId = (userId) => api.get(`/manageGetUserVehiclesByUserId/${userId}`);
export const manageGetUserVehiclesByUserWithCarsId = (userId) => api.get(`/manageGetUserVehiclesByUserWithCarsId/${userId}`);
export const getUserVehicleByRegistration = (registration) => api.get(`/getUserVehicleByRegistration/${registration}`);
export const manageGetUserVehicleWithVehicleInfoByCarId = (carId) => api.get(`/manageGetUserVehicleWithVehicleInfoByCarId/${carId}`);
export const manageUpdateUserCarByRegistration = (registration, carDetails) => api.put(`/manageUpdateCar/${registration}`, carDetails, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
export const manageDeleteUserCarByRegistration = (registration) => api.delete(`/manageDeleteUserCarByRegistration/${registration}`);

// Place
export const getAllPlaces = () => api.get(`/getAllPlaces`);

// Group
export const createGroup = (group) => api.post('/createGroup', group);
export const getGroupById = (groupId) => api.get(`/getGroupById/${groupId}`);
export const deleteGroupById = (groupId) => api.delete(`/deleteGroup/${groupId}`);
export const checkIfCarIsBeingUsedInGroup = (registration) => api.get(`/checkIfCarIsBeingUsedInGroup/${registration}`);
export const updateGroupById = (groupId, group) => api.put(`/updateGroupById/${groupId}`, group);
export const getAllGroupsWithAllInfo = () => api.get(`/getAllGroupsWithAllInfo`);

// GroupPerson
export const createGroupPerson = (groupPerson) => api.post('/createGroupPerson', groupPerson);
export const obtainAllGroupsData = () => api.get('/obtainAllGroupsData');
export const obtainAllGroupsDataByGroupId = (groupId) => api.get(`/obtainAllGroupsDataByGroupId/${groupId}`);
export const obtainAllPeopleFromGroupById = (groupId) => api.get(`/obtainAllPeopleFromGroupById/${groupId}`);
export const deleteUserFromGroup = (userId, groupId) => api.delete(`/deleteGroupPerson/${userId}/${groupId}`);
export const obtainPersonFromGroupById = (userId, groupId) => api.get(`/obtainPersonFromGroupById/${userId}/${groupId}`);

//Payment
export const createPaymentIntent = (amount) => api.post('/create-payment-intent', {amount});

// Chat Messages
export const getMessages = (groupId) => api.get(`/groups/${groupId}/messages`);
export const createMessage = (groupId, message) => api.post(`/groups/${groupId}/messages`, message);

// Group Routes
export const saveGroupRoute = (groupId, coordinates) => api.post(`/route/${groupId}`, {coordinates});
export const getGroupRoute = (groupId) => api.get(`/route/${groupId}`);