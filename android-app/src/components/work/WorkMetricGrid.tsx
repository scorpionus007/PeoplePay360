import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const WorkMetricGrid: React.FC = () => {
  const { openModal } = useApp();
  const { user } = useAuth();
  const companyName = user?.organization?.name || 'Bridge-it App';

  return (
    <View style={styles.gridRow}>
      {/* Card 1: Time Off */}
      <Card style={styles.halfCard} padding={16}>
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={() => openModal('timeoff')}
          activeOpacity={0.7}
        >
          <View style={styles.headerLink}>
            <Text style={styles.headerTitle}>Time off</Text>
            <LucideIcon name="chevron-right" size={14} color={colors.ink500} />
          </View>

          <Text style={styles.subLabel}>Used/scheduled</Text>
          <Text style={styles.bigNumber}>0</Text>
        </TouchableOpacity>
      </Card>

      {/* Card 2: People */}
      <Card style={styles.halfCard} padding={16}>
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={() => openModal('directory')}
          activeOpacity={0.7}
        >
          <View style={styles.headerLink}>
            <Text style={styles.headerTitle}>People</Text>
            <LucideIcon name="chevron-right" size={14} color={colors.ink500} />
          </View>

          {/* Avatars cluster */}
          <View style={styles.avatarsRow}>
            <View style={[styles.avatarCircle, { backgroundColor: '#D7E2FE' }]}>
              <Text style={styles.avatarInitials}>AC</Text>
            </View>
            <View style={[styles.avatarCircle, { backgroundColor: '#FEE4E2', marginLeft: -10 }]}>
              <Text style={styles.avatarInitials}>JD</Text>
            </View>
            <View style={[styles.avatarCircle, { backgroundColor: '#EEF0F8', marginLeft: -10 }]}>
              <Text style={[styles.avatarInitials, { color: colors.ink700 }]}>+24</Text>
            </View>
          </View>

          <Text style={styles.companyName} numberOfLines={1}>
            {companyName}
          </Text>
          <Text style={styles.peopleCount}>26 people</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  halfCard: {
    flex: 1,
    borderRadius: 22,
    minHeight: 140,
    backgroundColor: colors.surface,
  },
  cardTouchable: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink700,
    marginRight: 4,
  },
  subLabel: {
    fontSize: 13,
    color: colors.ink500,
    fontWeight: '400',
  },
  bigNumber: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.ink950,
    marginTop: 4,
    fontFamily: 'System',
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink800,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink900,
  },
  peopleCount: {
    fontSize: 12,
    color: colors.ink500,
    marginTop: 2,
  },
});
