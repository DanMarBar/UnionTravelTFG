import * as React from 'react';
import {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterCreen from '../screens/RegisterScreen';
import MainMenuScreen from "../screens/MainMenuScreen";
import SignInScreen from "../screens/SignInScreen";
import CarsListScreen from "../screens/cars/CarsListScreen";
import CarDetailScreen from "../screens/cars/CarDetailScreen";
import UpdateCarScreen from "../screens/cars/UpdateCarScreen";
import InsertCarScreen from "../screens/cars/InsertCarScreen";
import OnBoardingScreen from "../screens/OnBoardingScreen";
import MenuModal from "../screens/modals/MenuModal";
import RouteScreen from "../screens/RouteScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {TouchableOpacity, View} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import UserUpdateScreen from "../screens/user/UserUpdateScreen";
import InsertGroupScreen from "../screens/group/InsertGroupScreen";
import ViewAllGroupsScreen from "../screens/group/ViewAllGroupsScreen";
import ViewGroupDetailsScreen from "../screens/group/ViewGroupDetailsScreen";
import PaymentScreen from "../screens/Payment";
import GroupChatScreen from "../screens/group/GroupChatScreen";
import UpdateGroupScreen from "../screens/group/UpdateGroupScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
    const [initialRoute, setInitialRoute] = useState('OnBoardingScreen');
    const [menuVisible, setMenuVisible] = useState(false);

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

    return (
        <>
            <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{
                    headerStyle: {backgroundColor: '#39d9b3'},
                    headerTintColor: '#050505',
                    headerTitleStyle: {fontWeight: 'bold', color: '#000000'},
                    headerRight: () => (
                        <View style={{flexDirection: 'row', marginRight: 10}}>
                            <TouchableOpacity onPress={() => navigation.navigate('MainMenu')}>
                                <MaterialIcons name="home" size={28} color="#ffffff"
                                               style={{marginRight: 20}}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
                                <MaterialIcons name="menu" size={28} color="#ffffff"/>
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            >
                <Stack.Screen name="OnBoardingScreen" component={OnBoardingScreen}/>
                <Stack.Screen name="UserProfileScreen" component={UserUpdateScreen}/>
                <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}}/>
                <Stack.Screen name="Register" component={RegisterCreen}
                              options={{headerShown: false}}/>
                <Stack.Screen name="MainMenu" component={MainMenuScreen} options={{
                    title: "Tu" +
                        " menu principal"
                }}/>
                <Stack.Screen name="SignIn" component={SignInScreen}/>
                <Stack.Screen name="CarsListScreen" component={CarsListScreen}/>
                <Stack.Screen name="InsertCarScreen" component={InsertCarScreen}/>
                <Stack.Screen name="CarDetail" component={CarDetailScreen}/>
                <Stack.Screen name="UpdateCar" component={UpdateCarScreen}/>
                <Stack.Screen name="RouteScreen" component={RouteScreen}/>
                <Stack.Screen name="InsertGroupScreen" component={InsertGroupScreen}/>
                <Stack.Screen name="ViewAllGroupsScreen" component={ViewAllGroupsScreen}/>
                <Stack.Screen name="ViewGroupDetailsScreen" component={ViewGroupDetailsScreen}/>
                <Stack.Screen name="PaymentScreen" component={PaymentScreen}/>
                <Stack.Screen name="GroupChatScreen" component={GroupChatScreen}/>
                <Stack.Screen name="UpdateGroupScreen" component={UpdateGroupScreen}/>
            </Stack.Navigator>
            <MenuModal isVisible={menuVisible} onClose={() => setMenuVisible(false)}/>
        </>
    );
};

export default AppNavigator;