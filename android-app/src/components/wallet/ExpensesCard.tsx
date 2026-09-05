import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';

export const ExpensesCard: React.FC = () => {
  const { openModal } = useApp();

  return (
    <Card style={styles.card} padding={18}>
      <TouchableOpacity
        style={styles.headerLink}
        onPress={() => openModal('expense')}
        activeOpacity={0.7}
      >
        <Text style={styles.headerTitle}>Expenses</Text>
        <LucideIcon name="chevron-right" size={16} color={colors.ink500} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.submitRow}
        onPress={() => openModal('expense')}
        activeOpacity={0.7}
      >
        <View style={styles.plusCircle}>
          <LucideIcon name="plus" size={18} color={colors.ink900} />
        </View>
        <Text style={styles.submitText}>Submit an expense</Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  headerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink600,
    marginRight: 4,
  },
  submitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  plusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF0F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink950,
  },
});
