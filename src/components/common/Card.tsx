import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radius, Shadow } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'dark';
  padding?: number;
}

export function Card({ children, style, variant = 'default', padding = 18 }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'dark' && styles.dark,
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius['2xl'],
    ...Shadow.md,
  },
  elevated: {
    ...Shadow.lg,
  },
  dark: {
    backgroundColor: Colors.primaryDark,
  },
});
