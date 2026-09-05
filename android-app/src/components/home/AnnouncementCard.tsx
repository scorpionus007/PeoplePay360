import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { LucideIcon } from '../../icons/LucideIcon';

export const AnnouncementCard: React.FC = () => {
  return (
    <Card style={styles.card} padding={18}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <LucideIcon name="bell" size={16} color={colors.ink800} />
        </View>
        <Text style={styles.headerTitle}>Company Announcement</Text>
      </View>

      <Text style={styles.announcementTitle}>
        Q3 Global Hackathon & Employee Benefits Review
      </Text>
      <Text style={styles.announcementBody}>
        People operations has unlocked updated health insurance plans and expanded salary advance limits for the upcoming festive cycle.
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink600,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink950,
    marginBottom: 6,
  },
  announcementBody: {
    fontSize: 13,
    color: colors.ink600,
    lineHeight: 18,
  },
});
