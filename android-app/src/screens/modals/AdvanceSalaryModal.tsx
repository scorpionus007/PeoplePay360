import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { ModalSheet } from '../../components/common/ModalSheet';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';
import { payrollService } from '../../api/services';

export const AdvanceSalaryModal: React.FC = () => {
  const { activeModal, closeModal, showToast } = useApp();
  const [selectedAmount, setSelectedAmount] = useState<number>(50000);
  const [repaymentMode, setRepaymentMode] = useState<'salary_deduction' | 'emi'>('salary_deduction');
  const [emiMonths, setEmiMonths] = useState<number>(3);
  const [reason, setReason] = useState<string>('Personal emergency & festive expenses');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const presetAmounts = [25000, 50000, 100000, 150000];
  const fee = Math.round(selectedAmount * 0.025);
  const netDisbursement = selectedAmount - fee;
  const monthlyEmi = repaymentMode === 'emi' ? Math.round(selectedAmount / emiMonths) : selectedAmount;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await payrollService.requestAdvanceSalary({
        requested_amount: selectedAmount,
        repayment_mode: repaymentMode,
        emi_months: repaymentMode === 'emi' ? emiMonths : 1,
        reason,
      });
      showToast(`Advance of ₹${selectedAmount.toLocaleString()} requested successfully`);
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalSheet
      visible={activeModal === 'advance'}
      onClose={closeModal}
      title="PeoplePay Advance"
      subtitle="Withdraw earned salary before payday with flexible repayments"
    >
      <View style={styles.container}>
        {/* Limit Info Header */}
        <View style={styles.limitCard}>
          <Text style={styles.limitLabel}>Available Pre-Approved Limit</Text>
          <Text style={styles.limitValue}>₹1,50,000</Text>
          <View style={styles.limitBadgeRow}>
            <Badge label="Instant Approval" variant="success" />
            <Text style={styles.limitSub}>2.5% platform fee</Text>
          </View>
        </View>

        {/* Amount Selector */}
        <Text style={styles.sectionTitle}>Select Withdrawal Amount</Text>
        <View style={styles.presetChipsRow}>
          {presetAmounts.map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[styles.presetChip, selectedAmount === amt && styles.presetChipActive]}
              onPress={() => setSelectedAmount(amt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetChipText, selectedAmount === amt && styles.presetChipTextActive]}>
                ₹{amt.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Repayment Option */}
        <Text style={styles.sectionTitle}>Repayment Method</Text>
        <View style={styles.repaymentRow}>
          <TouchableOpacity
            style={[styles.repaymentOption, repaymentMode === 'salary_deduction' && styles.repaymentOptionActive]}
            onPress={() => setRepaymentMode('salary_deduction')}
            activeOpacity={0.7}
          >
            <View style={styles.radioRow}>
              <View style={[styles.radioDot, repaymentMode === 'salary_deduction' && styles.radioDotActive]} />
              <Text style={styles.repaymentTitle}>Next Paycheck</Text>
            </View>
            <Text style={styles.repaymentSub}>100% deduction on Sep 8th</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.repaymentOption, repaymentMode === 'emi' && styles.repaymentOptionActive]}
            onPress={() => setRepaymentMode('emi')}
            activeOpacity={0.7}
          >
            <View style={styles.radioRow}>
              <View style={[styles.radioDot, repaymentMode === 'emi' && styles.radioDotActive]} />
              <Text style={styles.repaymentTitle}>Convert to EMI</Text>
            </View>
            <Text style={styles.repaymentSub}>Spread across months</Text>
          </TouchableOpacity>
        </View>

        {/* EMI Tenure (if EMI selected) */}
        {repaymentMode === 'emi' && (
          <View style={styles.emiTenureWrapper}>
            <Text style={styles.tenureLabel}>Choose Duration:</Text>
            <View style={styles.tenureRow}>
              {[3, 6, 9, 12].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.tenureChip, emiMonths === m && styles.tenureChipActive]}
                  onPress={() => setEmiMonths(m)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tenureChipText, emiMonths === m && styles.tenureChipTextActive]}>
                    {m} Months
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.emiBreakdownText}>
              Estimated Monthly EMI: ₹{monthlyEmi.toLocaleString()} / month
            </Text>
          </View>
        )}

        {/* Reason Input */}
        <Input
          label="Purpose / Reason (Optional)"
          value={reason}
          onChangeText={setReason}
          placeholder="e.g. Medical emergency, relocation"
        />

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Requested Amount</Text>
            <Text style={styles.summaryValue}>₹{selectedAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Fee (2.5%)</Text>
            <Text style={styles.summaryValue}>- ₹{fee.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Net Disbursed to Bank</Text>
            <Text style={styles.totalValue}>₹{netDisbursement.toLocaleString()}</Text>
          </View>
        </View>

        {/* Submit Button */}
        <Button
          title={`Confirm Advance: ₹${selectedAmount.toLocaleString()}`}
          onPress={handleSubmit}
          loading={submitting}
          size="lg"
          style={styles.submitBtn}
        />
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  limitCard: {
    backgroundColor: '#F3F0FF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  limitLabel: {
    fontSize: 12,
    color: colors.primary600,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  limitValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink950,
    marginVertical: 4,
    fontFamily: 'System',
  },
  limitBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  limitSub: {
    fontSize: 12,
    color: colors.ink600,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink900,
    marginBottom: 10,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  presetChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F0F2F9',
    borderWidth: 1,
    borderColor: '#E2E5F2',
  },
  presetChipActive: {
    backgroundColor: colors.ink950,
    borderColor: colors.ink950,
  },
  presetChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink800,
  },
  presetChipTextActive: {
    color: colors.white,
  },
  repaymentRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  repaymentOption: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8DBEA',
    backgroundColor: colors.surface,
  },
  repaymentOptionActive: {
    borderColor: colors.primary600,
    backgroundColor: '#FAF8FF',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#B0B5CF',
  },
  radioDotActive: {
    borderColor: colors.primary600,
    backgroundColor: colors.primary600,
  },
  repaymentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink950,
  },
  repaymentSub: {
    fontSize: 11,
    color: colors.ink500,
    marginLeft: 22,
  },
  emiTenureWrapper: {
    backgroundColor: '#F7F8FC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  tenureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink700,
    marginBottom: 8,
  },
  tenureRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  tenureChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#D8DBEA',
    alignItems: 'center',
  },
  tenureChipActive: {
    backgroundColor: colors.primary600,
    borderColor: colors.primary600,
  },
  tenureChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink800,
  },
  tenureChipTextActive: {
    color: colors.white,
  },
  emiBreakdownText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary600,
  },
  summaryCard: {
    backgroundColor: '#F7F8FC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.ink600,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink950,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E4E7F4',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink950,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.mint500,
    fontFamily: 'System',
  },
  submitBtn: {
    width: '100%',
    marginTop: 4,
  },
});
