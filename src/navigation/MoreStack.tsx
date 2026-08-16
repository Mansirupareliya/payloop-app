import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MoreMenuScreen } from '../screens/MoreMenuScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { BudgetScreen } from '../screens/BudgetScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SubscriptionsScreen } from '../screens/SubscriptionsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MoreStackParamList } from '../types';

const Stack = createStackNavigator<MoreStackParamList>();

export function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="MoreMenu"       component={MoreMenuScreen} />
      <Stack.Screen name="Analytics"      component={AnalyticsScreen} />
      <Stack.Screen name="Budget"         component={BudgetScreen} />
      <Stack.Screen name="History"        component={HistoryScreen} />
      <Stack.Screen name="Subscriptions"  component={SubscriptionsScreen} />
      <Stack.Screen name="Settings"       component={SettingsScreen} />
    </Stack.Navigator>
  );
}
