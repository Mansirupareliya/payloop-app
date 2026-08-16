import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, Radius } from '../../constants/theme';

interface Option {
  label: string;
  value: string;
}

interface PillSelectorProps<T extends string> {
  options: T[] | Option[];
  selected: T | T[];
  onSelect: (value: T) => void;
  multiSelect?: boolean;
  style?: ViewStyle;
}

function isOption(o: unknown): o is Option {
  return typeof o === 'object' && o !== null && 'value' in o && 'label' in o;
}

export function PillSelector<T extends string>({
  options,
  selected,
  onSelect,
  multiSelect = false,
  style,
}: PillSelectorProps<T>) {
  const isSelected = (val: T) => {
    if (Array.isArray(selected)) return selected.includes(val);
    return selected === val;
  };

  return (
    <View style={[styles.grid, style]}>
      {options.map((opt) => {
        const val = isOption(opt) ? (opt.value as T) : (opt as T);
        const label = isOption(opt) ? opt.label : opt;
        const active = isSelected(val);

        return (
          <Pressable
            key={val}
            style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
            onPress={() => onSelect(val)}
          >
            <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    marginBottom: 4,
  },
  pillActive: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  pillInactive: {
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.border,
  },
  pillText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  pillTextActive: {
    color: Colors.accent,
  },
  pillTextInactive: {
    color: Colors.textSecondary,
  },
});
