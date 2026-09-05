import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { ModalSheet } from '../../components/common/ModalSheet';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useApp } from '../../context/AppContext';

export const ReferralModal: React.FC = () => {
  const { activeModal, closeModal, showToast } = useApp();
  const [candidateName, setCandidateName] = useState<string>('');
  const [candidateEmail, setCandidateEmail] = useState<string>('');
  const [role, setRole] = useState<string>('Staff Backend Architect');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!candidateName.trim() || !candidateEmail.trim()) {
      showToast('Please provide candidate name and email');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast(`Referral for ${candidateName} submitted to Talent Acquisition`);
      closeModal();
    }, 800);
  };

  return (
    <ModalSheet
      visible={activeModal === 'referral'}
      onClose={closeModal}
      title="Employee Referral Program"
      subtitle="Refer top talent to Bridge-it App Inc and earn a referral bonus"
    >
      <View style={styles.container}>
        {/* Bonus card */}
        <View style={styles.bonusCard}>
          <Text style={styles.bonusLabel}>Referral Bonus</Text>
          <Text style={styles.bonusAmount}>₹50,000</Text>
          <Text style={styles.bonusSub}>
            Credited directly to your wallet upon successful completion of probation.
          </Text>
        </View>

        {/* Form */}
        <Input
          label="Target Role"
          value={role}
          onChangeText={setRole}
          placeholder="e.g. Senior Backend Engineer"
        />

        <Input
          label="Candidate Full Name"
          value={candidateName}
          onChangeText={setCandidateName}
          placeholder="e.g. Priya Sharma"
        />

        <Input
          label="Candidate Work Email"
          value={candidateEmail}
          onChangeText={setCandidateEmail}
          placeholder="name@example.com"
          keyboardType="email-address"
        />

        <Input
          label="Recommendation Notes / LinkedIn"
          value={notes}
          onChangeText={setNotes}
          placeholder="Why would they be a great fit?"
        />

        <Button
          title="Submit Referral"
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
  bonusCard: {
    backgroundColor: '#F3F0FF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E6DCFF',
  },
  bonusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary600,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bonusAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink950,
    marginVertical: 4,
    fontFamily: 'System',
  },
  bonusSub: {
    fontSize: 12,
    color: colors.ink600,
    lineHeight: 16,
  },
  submitBtn: {
    width: '100%',
    marginTop: 8,
  },
});
