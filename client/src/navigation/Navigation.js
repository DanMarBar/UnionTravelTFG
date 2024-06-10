import * as React from 'react';
import {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MainMenuScreen from '../screens/MainMenuScreen';
import CarsListScreen from '../screens/cars/CarsListScreen';
import CarDetailScreen from '../screens/cars/CarDetailScreen';
import UpdateCarScreen from '../screens/cars/UpdateCarScreen';
import InsertCarScreen from '../screens/cars/InsertCarScreen';
import OnBoardingScreen from '../screens/auth/OnBoardingScreen';
import MenuModal from '../screens/modals/MenuModal';
import RouteScreen from '../screens/RouteScreen';
import UserUpdateScreen from '../screens/user/UserUpdateScreen';
import InsertGroupScreen from '../screens/group/InsertGroupScreen';
import ViewAllGroupsScreen from '../screens/group/ViewAllGroupsScreen';
import ViewGroupDetailsScreen from '../screens/group/ViewGroupDetailsScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import GroupChatScreen from '../screens/group/GroupChatScreen';
import UpdateGroupScreen from '../screens/group/UpdateGroupScreen';
import UserDetailScreen from "../screens/user/UserProfileScreen";
import changePasswordScreen from "../screens/user/ChangePasswordScreen";
import RequestTempPasswordScreen from "../screens/user/RequestTempPasswordScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
    const [initialRoute, setInitialRoute] = useState('OnBoardingScreen');
    const [menuVisible, setMenuVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredScreens, setFilteredScreens] = useState([]);
    const navigation = useNavigation();

    // Pantallas de la aplicacion, name es el nombre usado para que navigation identifique y
    // title es para que puedan ser localizadas por el usuario
    const screens = [
        {name: 'OnBoardingScreen', component: OnBoardingScreen, options: {headerShown: false}},
        {
            name: 'UserProfileScreen', component: UserUpdateScreen, options: {
                title: 'Actualizar perfil'
            }
        },
        {name: 'UserDetailScreen', component: UserDetailScreen, options: {title: 'Perfil'}},
        {name: 'Login', component: LoginScreen, options: {headerShown: false}},
        {name: 'Register', component: RegisterScreen, options: {headerShown: false}},
        {name: 'RequestTempPasswordScreen', component: RequestTempPasswordScreen, options: {headerShown: false}},
        {name: 'MainMenu', component: MainMenuScreen, options: {title: 'Menu principal'}},
        {name: 'CarsListScreen', component: CarsListScreen, options: {title: 'Lista de Vehiculos'}},
        {name: 'InsertCarScreen', component: InsertCarScreen, options: {title: 'Nuevo vehiculo'}},
        {name: 'CarDetail', component: CarDetailScreen},
        {name: 'UpdateCar', component: UpdateCarScreen},
        {name: 'RouteScreen', component: RouteScreen},
        {name: 'changePasswordScreen', component: changePasswordScreen},
        {name: 'InsertGroupScreen', component: InsertGroupScreen, options: {title: 'Nuevo grupo'}},
        {
            name: 'ViewAllGroupsScreen',
            component: ViewAllGroupsScreen,
            options: {title: 'Ver Todos los Grupos'}
        },
        {
            name: 'ViewGroupDetailsScreen',
            component: ViewGroupDetailsScreen,
            options: {title: 'Detalles del Grupo'}
        },
        {name: 'PaymentScreen', component: PaymentScreen},
        {name: 'GroupChatScreen', component: GroupChatScreen},
        {name: 'UpdateGroupScreen', component: UpdateGroupScreen},
    ];

    useEffect(() => {
        const initialize = async () => {
            try {
                const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
                const token = await AsyncStorage.getItem('userToken');

                if (hasSeenOnboarding !== 'true') {
                    setInitialRoute('OnBoardingScreen');
                } else if (token !== null) {
                    setInitialRoute('MainMenu');
                } else {
                    setInitialRoute('Login');
                }
            } catch (error) {
                console.error('Error initializing app:', error);
                setInitialRoute('OnBoardingScreen');
            }
        };

        initialize();
    }, []);

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredScreens([]);
        } else {
            setFilteredScreens(
                screens.filter(screen =>
                    screen.options && screen.options.title && screen.options.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    }, [searchTerm]);

    const handleSearchSelect = (screenName) => {
        setSearchTerm('');
        setFilteredScreens([]);
        navigation.navigate(screenName);
    };

    return (
        <>
            <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={({route, navigation}) => ({
                    headerStyle: {backgroundColor: '#131313'},
                    headerTintColor: '#ffffff',
                    headerTitleStyle: {fontWeight: 'bold', color: '#ffffff'},
                    headerTitle: '',
                    headerLeft: () => (
                        route.name !== 'MainMenu' && (
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <MaterialIcons name="arrow-back" size={28} color="#ffffff"
                                               style={{marginLeft: 10}}/>
                            </TouchableOpacity>
                        )
                    ),
                    headerRight: () => (
                        <View style={{flexDirection: 'row', marginRight: 10, alignItems: 'center'}}>
                            <View>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search"
                                    placeholderTextColor="#888"
                                    value={searchTerm}
                                    onChangeText={setSearchTerm}
                                />
                                {filteredScreens.length > 0 && (
                                    <FlatList
                                        data={filteredScreens}
                                        renderItem={({item}) => (
                                            <TouchableOpacity
                                                onPress={() => handleSearchSelect(item.name)}>
                                                <Text
                                                    style={styles.searchResult}>{item.options.title}</Text>
                                            </TouchableOpacity>
                                        )}
                                        keyExtractor={item => item.name}
                                        style={styles.searchResultsContainer}
                                    />
                                )}
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('MainMenu')}>
                                <MaterialIcons name="home" size={28} color="#ffffff"
                                               style={{marginRight: 20}}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
                                <MaterialIcons name="menu" size={28} color="#ffffff"/>
                            </TouchableOpacity>
                        </View>
                    ),
                })}
            >
                {screens.map(screen => (
                    <Stack.Screen
                        key={screen.name}
                        name={screen.name}
                        component={screen.component}
                        options={screen.options}
                    />
                ))}
            </Stack.Navigator>
            <MenuModal isVisible={menuVisible} onClose={() => setMenuVisible(false)} navigation={navigation} />
        </>
    );
};

const styles = StyleSheet.create({
    searchInput: {
        borderWidth: 1,
        borderColor: '#888',
        backgroundColor: '#333',
        color: '#fff',
        padding: 8,
        width: 240,
        marginRight: 10,
        borderRadius: 20,
    },
    searchResultsContainer: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        backgroundColor: '#1c1c1c',
        borderWidth: 1,
        borderColor: '#444',
        zIndex: 1,
        borderRadius: 20,
    },
    searchResult: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
        color: '#fff',
        borderRadius: 20,
    },
});

export default AppNavigator;
