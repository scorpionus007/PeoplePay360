import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';

export const AdvanceSalaryCard: React.FC = () => {
  const { openModal, isAdvanceMasked, toggleAdvanceMask } = useApp();

  return (
    <Card style={styles.card} padding={18}>
      {/* Header link */}
      <TouchableOpacity
        style={styles.headerLink}
        onPress={() => openModal('advance')}
        activeOpacity={0.7}
      >
        <Text style={styles.headerTitle}>PeoplePay Advance</Text>
        <LucideIcon name="chevron-right" size={16} color={colors.ink500} />
      </TouchableOpacity>

      {/* Available Limit */}
      <View style={styles.limitRow}>
        <TouchableOpacity
          style={styles.amountToggleRow}
          onPress={toggleAdvanceMask}
          activeOpacity={0.7}
        >
          <Text style={styles.limitAmount}>
            {isAdvanceMasked ? '$******' : '₹1,50,000'}
          </Text>
          <Text style={styles.availableLabel}> available</Text>
        </TouchableOpacity>
        <Text style={styles.limitStatus}>Full limit</Text>
      </View>

      {/* Purple Progress Bar */}
      <View style={styles.progressBarBackground}>
        <View style={styles.progressBarFill} />
      </View>

      {/* Footer callout and Action button */}
      <View style={styles.footerRow}>
        <Text style={styles.tagline}>Don't wait for payday: get money now</Text>
        <Button
          title="Get Advance"
          variant="secondary"
          size="sm"
          onPress={() => openModal('advance')}
          textStyle={styles.actionButtonText}
          style={styles.actionButton}
        />
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
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink600,
    marginRight: 4,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountToggleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  limitAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink950,
    fontFamily: 'System',
  },
  availableLabel: {
    fontSize: 14,
    color: colors.ink500,
    fontWeight: '500',
  },
  limitStatus: {
    fontSize: 13,
    color: colors.ink500,
    fontWeight: '500',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#EEF0F8',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary600,
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  tagline: {
    flex: 1,
    fontSize: 13,
    color: colors.ink600,
    lineHeight: 18,
    fontWeight: '400',
  },
  actionButton: {
    backgroundColor: '#EEF0F8',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink950,
  },
});
