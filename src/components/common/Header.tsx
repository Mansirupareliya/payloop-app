import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, Shadow } from '../../constants/theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  transparent?: boolean;
}

export function Header({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  transparent = false,
}: HeaderProps) {
  return (
    <View style={[styles.header, transparent && styles.transparent]}>
      <View style={styles.side}>
        {leftIcon && (
          <Pressable onPress={onLeftPress} style={styles.iconBtn} hitSlop={8}>
            {leftIcon}
          </Pressable>
        )}
      </View>

      <View style={styles.center}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.side}>
        {rightIcon && (
          <Pressable onPress={onRightPress} style={styles.iconBtn} hitSlop={8}>
            {rightIcon}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    ...Shadow.sm,
  },
  transparent: {
    backgroundColor: 'transparent',
    ...({} as any), // reset shadow
    shadowOpacity: 0,
    elevation: 0,
  },
  side: {
    width: 44,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
});
