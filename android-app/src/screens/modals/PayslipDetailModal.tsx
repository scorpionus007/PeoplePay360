import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { ModalSheet } from '../../components/common/ModalSheet';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';

export const PayslipDetailModal: React.FC = () => {
  const { activeModal, closeModal, selectedPayslip, showToast } = useApp();
  const [downloading, setDownloading] = useState<boolean>(false);

  if (!selectedPayslip) {
    return (
      <ModalSheet
        visible={activeModal === 'payslip'}
        onClose={closeModal}
        title="Payslip"
        subtitle="No payslip selected"
      >
        <View style={styles.container}>
          <Text style={styles.emptyText}>No payslip data available. Please select a payslip from the invoices list.</Text>
        </View>
      </ModalSheet>
    );
  }

  const payslip = selectedPayslip;

  const handleDownloadPdf = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      showToast(`Payslip ${payslip.code}.pdf saved to Downloads`);
    }, 1200);
  };

  return (
    <ModalSheet
      visible={activeModal === 'payslip'}
      onClose={closeModal}
      title={`Payslip ${payslip.code}`}
      subtitle={`${payslip.period_start} to ${payslip.period_end}`}
    >
      <View style={styles.container}>
        {/* Net Pay Card */}
        <View style={styles.netCard}>
          <Text style={styles.netLabel}>Total Net Salary Paid</Text>
          <Text style={styles.netAmount}>₹{payslip.net_amount.toLocaleString()}</Text>
          <View style={styles.badgeRow}>
            <Badge label={payslip.status === 'paid' ? 'Paid & Disbursed' : payslip.status} variant="success" />
            <Text style={styles.payDateText}>Disbursed on {payslip.payment_date || 'N/A'}</Text>
          </View>
        </View>

        {/* Breakdown Card */}
        {payslip.lines && payslip.lines.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Salary Computation Breakdown</Text>
            <View style={styles.breakdownCard}>
              {payslip.lines.map((line) => {
                const isDeduction = line.category === 'deduction' || line.category === 'tax';
                const isNet = line.category === 'net';
                const isGross = line.category === 'gross';

                return (
                  <View
                    key={line.id}
                    style={[
                      styles.lineRow,
                      (isGross || isNet) && styles.highlightRow,
                    ]}
                  >
                    <Text
                      style={[
                        styles.lineName,
                        (isGross || isNet) && styles.boldText,
                      ]}
                    >
                      {line.name}
                    </Text>
                    <Text
                      style={[
                        styles.lineAmount,
                        isDeduction && styles.deductionText,
                        isNet && styles.netText,
                        (isGross || isNet) && styles.boldText,
                      ]}
                    >
                      {isDeduction ? `- ₹${line.amount.toLocaleString()}` : `₹${line.amount.toLocaleString()}`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Action Button */}
        <Button
          title="Download Official PDF Payslip"
          icon="download"
          onPress={handleDownloadPdf}
          loading={downloading}
          size="lg"
          style={styles.downloadBtn}
        />
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.ink500,
    textAlign: 'center',
    paddingVertical: 32,
  },
  netCard: {
    backgroundColor: '#F7F8FC',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ECEEF6',
  },
  netLabel: {
    fontSize: 13,
    color: colors.ink500,
    fontWeight: '500',
    marginBottom: 4,
  },
  netAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.ink950,
    fontFamily: 'System',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  payDateText: {
    fontSize: 12,
    color: colors.ink600,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink950,
    marginBottom: 10,
    marginTop: 6,
  },
  breakdownCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEEF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 18,
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4FA',
  },
  highlightRow: {
    backgroundColor: '#FAFBFD',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E5F2',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  lineName: {
    fontSize: 13,
    color: colors.ink700,
  },
  lineAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink950,
    fontFamily: 'System',
  },
  boldText: {
    fontWeight: '700',
    color: colors.ink950,
  },
  deductionText: {
    color: colors.rose500,
  },
  netText: {
    color: colors.mint500,
  },
  downloadBtn: {
    width: '100%',
    marginTop: 4,
  },
});
