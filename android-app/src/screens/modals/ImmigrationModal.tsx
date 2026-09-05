import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { ModalSheet } from '../../components/common/ModalSheet';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';
import { mobilityService } from '../../api/services';
import { VisaCase } from '../../types';

export const ImmigrationModal: React.FC = () => {
  const { activeModal, closeModal, showToast } = useApp();
  const [visaCase, setVisaCase] = useState<VisaCase | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (activeModal === 'immigration') {
      setLoading(true);
      (async () => {
        try {
          const data = await mobilityService.getVisaCase();
          setVisaCase(data);
        } catch {
          setVisaCase(null);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [activeModal]);

  const handleAction = (msg: string) => {
    showToast(msg);
  };

  return (
    <ModalSheet
      visible={activeModal === 'immigration'}
      onClose={closeModal}
      title="Immigration & Global Mobility"
      subtitle="Corporate visa sponsorships, legal support, and travel clearances"
    >
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary600} style={{ marginVertical: 40 }} />
        ) : !visaCase ? (
          <Text style={styles.emptyText}>No active visa cases found for your profile.</Text>
        ) : (
          /* Petition Card */
          <View style={styles.petitionCard}>
            <View style={styles.headerRow}>
              <View style={styles.titleRow}>
                <View style={styles.iconCircle}>
                  <LucideIcon name="plane" size={18} color={colors.primary600} />
                </View>
                <View>
                  <Text style={styles.petitionTitle}>{visaCase.visa_type}</Text>
                  <Text style={styles.countryText}>{visaCase.country}</Text>
                </View>
              </View>

              <Badge label={visaCase.status === 'under_internal_review' ? 'In Review' : visaCase.status} variant="warning" />
            </View>

            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Filing Date</Text>
                <Text style={styles.detailValue}>{visaCase.filing_date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Expiration Horizon</Text>
                <Text style={styles.detailValue}>{visaCase.expiry_date}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Upload Travel Document / Passport"
            variant="secondary"
            onPress={() => handleAction('Document upload dialogue opened')}
            style={styles.actionBtn}
          />
          <Button
            title="Request Legal Consultation"
            variant="primary"
            onPress={() => handleAction('Legal counsel notified for appointment')}
            style={styles.actionBtn}
          />
        </View>
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
  petitionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF6',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petitionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink950,
  },
  countryText: {
    fontSize: 13,
    color: colors.ink500,
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: '#F7F8FC',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.ink500,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink900,
    maxWidth: '55%',
    textAlign: 'right',
  },
  actionsContainer: {
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    width: '100%',
  },
});
