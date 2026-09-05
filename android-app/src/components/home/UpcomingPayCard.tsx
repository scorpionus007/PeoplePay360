import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';

export const UpcomingPayCard: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <Card style={styles.card} padding={18}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => setActiveTab('wallet')}
        activeOpacity={0.7}
      >
        <View style={styles.iconCircle}>
          <LucideIcon name="credit-card" size={20} color={colors.primary600} />
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.label}>Next Payroll Disbursement</Text>
          <Text style={styles.amount}>₹1,85,000 Expected</Text>
          <Text style={styles.subtext}>Bridge-it App Inc: Due on Sep 8th</Text>
        </View>

        <LucideIcon name="chevron-right" size={16} color={colors.ink400} />
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: '#F3F0FF',
    borderColor: '#E6DCFF',
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoCol: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary600,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink950,
    marginTop: 2,
    fontFamily: 'System',
  },
  subtext: {
    fontSize: 12,
    color: colors.ink600,
    marginTop: 2,
  },
});
