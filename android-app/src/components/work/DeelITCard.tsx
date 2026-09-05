import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';

export const DeelITCard: React.FC = () => {
  const { openModal } = useApp();

  return (
    <Card style={styles.card} padding={16}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => openModal('it')}
        activeOpacity={0.7}
      >
        <View style={styles.leftRow}>
          <View style={styles.iconCircle}>
            <LucideIcon name="laptop" size={18} color={colors.ink800} />
          </View>
          <Text style={styles.title}>PeoplePay IT</Text>
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
});
