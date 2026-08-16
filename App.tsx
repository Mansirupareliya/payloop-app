import React, { useEffect } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomTabNavigator } from './src/navigation/BottomTabNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { AddBillScreen } from './src/screens/AddBillScreen';
import { BillDetailScreen } from './src/screens/BillDetailScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { RootStackParamList } from './src/types';
import { useAuthStore } from './src/store/authStore';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const { isAuthenticated, isLoading, checkAuth, hasCompletedOnboarding } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f766e' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isAuthenticated ? "dark-content" : "light-content"} backgroundColor={isAuthenticated ? "#F0F4FF" : "#0f766e"} />
      <NavigationContainer>
        {isAuthenticated ? (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: 'transparent' },
              gestureEnabled: true,
            }}
          >
            {!hasCompletedOnboarding && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            )}
            <Stack.Screen name="MainTabs"   component={BottomTabNavigator} />
            <Stack.Screen name="AddBill"    component={AddBillScreen} />
            <Stack.Screen name="BillDetail" component={BillDetailScreen} />
          </Stack.Navigator>
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
