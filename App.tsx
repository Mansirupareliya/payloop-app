import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomTabNavigator } from './src/navigation/BottomTabNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { AddBillScreen } from './src/screens/AddBillScreen';
import { BillDetailScreen } from './src/screens/BillDetailScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { RootStackParamList } from './src/types';
import { useAuthStore } from './src/store/authStore';
import { usePhotoStore } from './src/store/photoStore';
import { Colors } from './src/constants/colors';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { loadPhotos } = usePhotoStore();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    checkAuth();
    loadPhotos();
  }, []);

  // Show animated splash until animation completes (≥3.6s)
  // Auth check (<1s) finishes well within that window
  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

  // Edge case: splash done but auth still resolving (network was slow)
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.deepNavy, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isAuthenticated ? 'dark-content' : 'light-content'}
        backgroundColor={isAuthenticated ? Colors.background : Colors.deepNavy}
      />
      <NavigationContainer>
        {isAuthenticated ? (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: 'transparent' },
              gestureEnabled: true,
            }}
          >
            <Stack.Screen name="MainTabs"   component={BottomTabNavigator} />
            <Stack.Screen name="AddBill"    component={AddBillScreen} />
            <Stack.Screen name="BillDetail" component={BillDetailScreen} />
            <Stack.Screen name="History"    component={HistoryScreen} />
          </Stack.Navigator>
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
