import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';

export const WorkCyclesCard: React.FC = () => {
  const { openModal } = useApp();

  return (
    <Card style={styles.card} padding={16}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => openModal('payslip')}
        activeOpacity={0.7}
      >
        <View style={styles.leftRow}>
          <View style={styles.iconCircle}>
            <LucideIcon name="file-text" size={18} color={colors.ink800} />
          </View>
          <View>
            <Text style={styles.title}>Work cycles</Text>
            <Text style={styles.subtitle}>Monthly: Next cut-off Sep 28th</Text>
          </View>
        </View>

        <LucideIcon name="chevron-right" size={16} color={colors.ink400} />
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink950,
  },
  subtitle: {
    fontSize: 12,
    color: colors.ink500,
    marginTop: 2,
  },
});
