import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { BillsScreen } from '../screens/BillsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { MoreStack } from './MoreStack';
import { BottomTabParamList } from '../types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

function TabIcon({ iconName, label, focused }: { iconName: keyof typeof Feather.glyphMap; label: string; focused: boolean }) {
  return (
    <View style={tabStyles.iconWrap}>
      <Feather 
        name={iconName} 
        size={22} 
        color={focused ? '#1e3a8a' : '#94a3b8'} 
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
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 2,
  },
  labelFocused: {
    color: '#1e3a8a',
    fontWeight: '700',
  },
  floatingButtonContainer: {
    alignItems: 'center',
    
  },
  floatingButton: {
    top: -16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1d4ed8', // Bright blue
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 0,
  },
  dashIcon: {
    width: 12,
    height: 3,
    marginTop: -8,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    marginBottom: 4,
  },
  floatingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  }
});

import { useNavigation } from '@react-navigation/native';

export function BottomTabNavigator() {
  const navigation = useNavigation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: 85,
          paddingBottom: 24,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#cbd5e1',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
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
            <View style={tabStyles.floatingButtonContainer}>
              <Pressable 
                style={tabStyles.floatingButton}
                onPress={(e: any) => {
                  e.preventDefault();
                  e.stopPropagation();
                  (navigation as any).navigate('AddBill');
                }}
              >
                <Feather name="plus" size={24} color="#ffffff" />
              </Pressable>
              <View style={tabStyles.dashIcon} />
              <Text style={[tabStyles.floatingLabel, focused && tabStyles.labelFocused]}>Calendar</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="bar-chart-2" label="Analytics" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={MoreStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="user" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
