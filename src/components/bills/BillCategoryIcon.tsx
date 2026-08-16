import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getCategoryById } from '../../constants/categories';
import { Radius } from '../../constants/theme';

interface BillCategoryIconProps {
  categoryId: string;
  size?: number;
}

export function BillCategoryIcon({ categoryId, size = 40 }: BillCategoryIconProps) {
  const cat = getCategoryById(categoryId);
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: Radius.md,
          backgroundColor: cat.bgColor,
        },
      ]}
    >
      <Feather name={cat.icon as any} size={size * 0.48} color={cat.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
