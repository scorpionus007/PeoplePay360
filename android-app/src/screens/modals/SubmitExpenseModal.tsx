import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { ModalSheet } from '../../components/common/ModalSheet';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';
import { benefitsService } from '../../api/services';

export const SubmitExpenseModal: React.FC = () => {
  const { activeModal, closeModal, showToast } = useApp();
  const [category, setCategory] = useState<string>('meals');
  const [amount, setAmount] = useState<string>('2450');
  const [description, setDescription] = useState<string>('Team lunch with candidates');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const categories = [
    { key: 'meals', label: 'Meals & Dining' },
    { key: 'travel', label: 'Travel & Commute' },
    { key: 'tech', label: 'Hardware / Gadgets' },
    { key: 'wellness', label: 'Health & Wellness' },
  ];

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount))) {
      showToast('Please enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      await benefitsService.submitExpenseClaim({
        category,
        amount: Number(amount),
        description,
      });
      showToast(`Expense of ₹${Number(amount).toLocaleString()} submitted for reimbursement`);
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalSheet
      visible={activeModal === 'expense'}
      onClose={closeModal}
      title="Submit an Expense"
      subtitle="Reimbursements are paid directly into your linked bank account"
    >
      <View style={styles.container}>
        {/* Categories */}
        <Text style={styles.label}>Expense Category</Text>
        <View style={styles.categoryChipsRow}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={[styles.catChip, category === c.key && styles.catChipActive]}
              onPress={() => setCategory(c.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.catChipText, category === c.key && styles.catChipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount Input */}
        <Input
          label="Amount (INR)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0.00"
        />

        {/* Description Input */}
        <Input
          label="Description / Merchant"
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Uber receipt, client dinner"
        />

        {/* Attachment Card */}
        <TouchableOpacity
          style={styles.attachmentCard}
          onPress={() => showToast('Receipt attached from camera roll')}
          activeOpacity={0.7}
        >
          <View style={styles.attachIcon}>
            <LucideIcon name="file-text" size={20} color={colors.primary600} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.attachTitle}>Attach Receipt or Invoice</Text>
            <Text style={styles.attachSub}>Supports PDF, JPG, PNG up to 10MB</Text>
          </View>
          <LucideIcon name="plus" size={16} color={colors.ink600} />
        </TouchableOpacity>

        {/* Submit Button */}
        <Button
          title="Submit for Approval"
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
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink800,
    marginBottom: 8,
  },
  categoryChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  catChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F0F2F9',
    borderWidth: 1,
    borderColor: '#E2E5F2',
  },
  catChipActive: {
    backgroundColor: colors.ink950,
    borderColor: colors.ink950,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink700,
  },
  catChipTextActive: {
    color: colors.white,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFD',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D0D4E4',
    borderRadius: 14,
    padding: 14,
    marginBottom: 22,
    gap: 12,
  },
  attachIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink950,
  },
  attachSub: {
    fontSize: 12,
    color: colors.ink500,
    marginTop: 2,
  },
  submitBtn: {
    width: '100%',
  },
});
