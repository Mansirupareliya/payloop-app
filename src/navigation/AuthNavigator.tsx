import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types';
import { LandingScreen } from '../screens/auth/LandingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { CongratulationsScreen } from '../screens/auth/CongratulationsScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen
        name="Congratulations"
        component={CongratulationsScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
};
