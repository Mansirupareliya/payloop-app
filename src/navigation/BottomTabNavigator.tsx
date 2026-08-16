import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/theme';
import { HomeScreen } from '../screens/HomeScreen';
import { BillsScreen } from '../screens/BillsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { MoreStack } from './MoreStack';
import { BottomTabParamList } from '../types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

function TabIcon({ iconName, label, focused }: { iconName: keyof typeof Feather.glyphMap; label: string; focused: boolean }) {
  return (
    <View style={tabStyles.iconWrap}>
      <Feather 
        name={iconName} 
        size={24} 
        color={focused ? Colors.primary : Colors.textMuted} 
      />
      <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{label}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    paddingTop: 8,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  labelFocused: {
    color: Colors.primary,
    fontWeight: '700',
  },
});

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.borderLight,
          height: 80,
          paddingBottom: 24, // For safe area on modern phones
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0, // Removed heavy shadow for cleaner look
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="home" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Bills"
        component={BillsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="file-text" label="Bills" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="calendar" label="Calendar" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="menu" label="More" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
