import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LucideIcon } from '../../icons/LucideIcon';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const ContractCard: React.FC = () => {
  const { user } = useAuth();
  const { openModal } = useApp();
  const employeeName = user?.full_name || 'Aryan Sakaria';

  return (
    <Card style={styles.card} padding={18}>
      <TouchableOpacity
        style={styles.headerLink}
        onPress={() => openModal('timeoff')}
        activeOpacity={0.7}
      >
        <Text style={styles.headerTitle}>Contract</Text>
        <LucideIcon name="chevron-right" size={16} color={colors.ink500} />
      </TouchableOpacity>

      <View style={styles.contractRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>BA</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.nameText}>{employeeName}</Text>
          <Text style={styles.rateText}>Fixed rate</Text>
        </View>

        <Badge label="Active" variant="success" />
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
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink600,
    marginRight: 4,
  },
  contractRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D7E2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#28468F',
  },
  infoCol: {
    flex: 1,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink950,
  },
  rateText: {
    fontSize: 13,
    color: colors.ink500,
    marginTop: 2,
  },
});
