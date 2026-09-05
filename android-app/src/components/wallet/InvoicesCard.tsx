import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';
import { payrollService } from '../../api/services';
import { Payslip } from '../../types';

export const InvoicesCard: React.FC = () => {
  const { openModal, setSelectedPayslip, isBalanceMasked } = useApp();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await payrollService.getPayslips();
        setPayslips(data);
      } catch {
        setPayslips([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelectPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    openModal('payslip');
  };

  if (loading) {
    return (
      <Card style={styles.card} padding={18}>
        <Text style={styles.headerTitle}>Invoices</Text>
        <ActivityIndicator size="small" color={colors.primary600} style={{ marginVertical: 20 }} />
      </Card>
    );
  }

  if (payslips.length === 0) {
    return (
      <Card style={styles.card} padding={18}>
        <Text style={styles.headerTitle}>Invoices</Text>
        <Text style={styles.emptyText}>No payslips found</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.card} padding={18}>
      <TouchableOpacity
        style={styles.headerLink}
        onPress={() => handleSelectPayslip(payslips[0])}
        activeOpacity={0.7}
      >
        <Text style={styles.headerTitle}>Invoices</Text>
        <LucideIcon name="chevron-right" size={16} color={colors.ink500} />
      </TouchableOpacity>

      <View style={styles.listContainer}>
        {payslips.slice(0, 2).map((ps, idx) => {
          const isFirst = idx === 0;
          return (
            <TouchableOpacity
              key={ps.id}
              style={[styles.itemRow, idx > 0 && styles.itemBorder]}
              onPress={() => handleSelectPayslip(ps)}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                <LucideIcon
                  name={isFirst ? 'clock' : 'building'}
                  size={18}
                  color={colors.ink700}
                />
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemCode}>{ps.code}</Text>
                <Text style={styles.itemDate}>{ps.payment_date || 'Paid'}</Text>
              </View>

              <Text style={styles.itemAmount}>
                {isBalanceMasked ? '₹******' : `₹${ps.net_amount.toLocaleString()}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink600,
    marginRight: 4,
  },
  emptyText: {
    fontSize: 13,
    color: colors.ink400,
    textAlign: 'center',
    paddingVertical: 16,
  },
  listContainer: {
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F0F2F9',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF0F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemInfo: {
    flex: 1,
  },
  itemCode: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink950,
  },
  itemDate: {
    fontSize: 13,
    color: colors.ink500,
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink950,
    fontFamily: 'System',
  },
});
