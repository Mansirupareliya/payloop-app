import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { BillsScreen } from '../screens/BillsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { MoreStack } from './MoreStack';
import { BottomTabParamList } from '../types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TABS = [
  { name: 'Home',      icon: 'home'       as const, label: 'Home'      },
  { name: 'Bills',     icon: 'file-text'  as const, label: 'Bills'     },
  { name: 'Calendar',  icon: 'plus'       as const, label: 'Add'       },
  { name: 'Analytics', icon: 'bar-chart-2'as const, label: 'Analytics' },
  { name: 'Profile',   icon: 'user'       as const, label: 'More'      },
];

function CustomTabBar({ state, navigation: tabNav }: any) {
  const rootNav = useNavigation();

  return (
    <View style={styles.barWrapper} pointerEvents="box-none">
      <View style={styles.glassBar}>
        {state.routes.map((route: any, index: number) => {
            const focused   = state.index === index;
            const isAdd     = route.name === 'Calendar';
            const tab       = TABS[index];

            const onPress = () => {
              if (isAdd) {
                (rootNav as any).navigate('AddBill', {});
                return;
              }
              const event = tabNav.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) tabNav.navigate(route.name);
            };

            if (isAdd) {
              return (
                <Pressable key={route.key} onPress={onPress} style={styles.addWrap}>
                  <View style={styles.addBtn}>
                    <Feather name="plus" size={22} color={Colors.deepNavy} />
                  </View>
                  <Text style={styles.addLabel}>Add</Text>
                </Pressable>
              );
            }

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tabItem}
              >
                <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                  <Feather
                    name={tab.icon}
                    size={20}
                    color={focused ? Colors.deepNavy : Colors.textMuted}
                  />
                </View>
                <Text style={[styles.label, focused && styles.labelActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
      </View>
    </View>
  );
}

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"      component={HomeScreen}    />
      <Tab.Screen name="Bills"     component={BillsScreen}   />
      <Tab.Screen name="Calendar"  component={CalendarScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen}/>
      <Tab.Screen name="Profile"   component={MoreStack}      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 32,
    overflow: 'hidden',
    // Glass shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 20,
  },
  glassBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  labelActive: {
    color: Colors.deepNavy,
    fontWeight: '700',
  },

  // Center Add button
  addWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    marginTop: -10,
  },
  addLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});
