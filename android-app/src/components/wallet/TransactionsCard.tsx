import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';
import { payrollService } from '../../api/services';

interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  amount: number;
  currency: string;
  type: string;
}

export const TransactionsCard: React.FC = () => {
  const { isBalanceMasked, openModal } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const payslips = await payrollService.getPayslips();
        // Transform payslips into transaction-like entries
        const txns: Transaction[] = payslips.slice(0, 3).map((ps) => ({
          id: ps.id,
          title: ps.payrun_name || ps.code,
          subtitle: ps.status === 'paid' ? 'Completed' : 'Upcoming',
          date: ps.payment_date || ps.period_end,
          amount: ps.net_amount,
          currency: ps.currency,
          type: ps.status === 'paid' ? 'completed' : 'upcoming',
        }));
        setTransactions(txns);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Card style={styles.card} padding={18}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <ActivityIndicator size="small" color={colors.primary600} style={{ marginVertical: 20 }} />
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card style={styles.card} padding={18}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <Text style={styles.emptyText}>No transactions found</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.card} padding={18}>
      <TouchableOpacity
        style={styles.headerLink}
        onPress={() => openModal('payslip')}
        activeOpacity={0.7}
      >
        <Text style={styles.headerTitle}>Transactions</Text>
        <LucideIcon name="chevron-right" size={16} color={colors.ink500} />
      </TouchableOpacity>

      <View style={styles.listContainer}>
        {transactions.map((tx, idx) => {
          const isUpcoming = tx.type === 'upcoming';
          return (
            <View
              key={tx.id}
              style={[styles.itemRow, idx > 0 && styles.itemBorder]}
            >
              <View style={styles.iconCircle}>
                <LucideIcon
                  name={isUpcoming ? 'clock' : 'building'}
                  size={18}
                  color={colors.ink700}
                />
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{tx.title}</Text>
                <Text style={styles.itemDate}>
                  {isUpcoming ? `Upcoming: ${tx.date}` : tx.date}
                </Text>
              </View>

              <Text style={styles.itemAmount}>
                {isBalanceMasked ? '₹******' : `₹${tx.amount.toLocaleString()}`}
              </Text>
            </View>
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
  itemTitle: {
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
