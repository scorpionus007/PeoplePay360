import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { TopBar } from '../components/common/TopBar';
import { BalanceCard } from '../components/wallet/BalanceCard';
import { AdvanceSalaryCard } from '../components/wallet/AdvanceSalaryCard';
import { InvoicesCard } from '../components/wallet/InvoicesCard';
import { TransactionsCard } from '../components/wallet/TransactionsCard';
import { NotificationBanner } from '../components/wallet/NotificationBanner';
import { ExpensesCard } from '../components/wallet/ExpensesCard';
import { RewardsCard } from '../components/wallet/RewardsCard';

export const WalletScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <TopBar title="Wallet" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Card (Screenshot 3) */}
        <BalanceCard />

        {/* PeoplePay Advance Card (Screenshot 2) */}
        <AdvanceSalaryCard />

        {/* Invoices / Payslips Card (Screenshot 2) */}
        <InvoicesCard />

        {/* Transactions Card (Screenshot 3) */}
        <TransactionsCard />

        {/* Notification Banner (Screenshot 3) */}
        <NotificationBanner />

        {/* Expenses Card (Screenshot 3) */}
        <ExpensesCard />

        {/* Rewards / Perks Card (Screenshot 2) */}
        <RewardsCard />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
});
