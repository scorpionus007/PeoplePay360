import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';

export const BalanceCard: React.FC = () => {
  const { isBalanceMasked, toggleBalanceMask } = useApp();

  return (
    <Card style={styles.card} padding={20}>
      <View style={styles.topRow}>
        <Text style={styles.label}>Balance</Text>
        <View style={styles.currencyPill}>
          <View style={styles.currencyDot} />
          <Text style={styles.currencyText}>INR</Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amountText}>
          {isBalanceMasked ? '₹******' : '₹1,85,000'}
        </Text>
        <TouchableOpacity
          onPress={toggleBalanceMask}
          style={styles.eyeButton}
          activeOpacity={0.7}
        >
          <LucideIcon
            name={isBalanceMasked ? 'eye-off' : 'eye'}
            size={20}
            color={colors.ink400}
          />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.ink500,
    fontWeight: '500',
  },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF0F8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink800,
    letterSpacing: 0.3,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.ink950,
    letterSpacing: -1,
    fontFamily: 'System',
  },
  eyeButton: {
    padding: 6,
  },
});
