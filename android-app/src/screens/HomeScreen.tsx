import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { TopBar } from '../components/common/TopBar';
import { AttendanceCard } from '../components/home/AttendanceCard';
import { UpcomingPayCard } from '../components/home/UpcomingPayCard';
import { AnnouncementCard } from '../components/home/AnnouncementCard';
import { LucideIcon, LucideIconName } from '../icons/LucideIcon';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { openModal, setActiveTab } = useApp();
  const firstName = user?.employee?.first_name || 'Aryan';

  const quickActions: Array<{ label: string; icon: LucideIconName; action: () => void; color: string }> = [
    {
      label: 'Request Leave',
      icon: 'calendar',
      action: () => openModal('timeoff'),
      color: colors.primary600,
    },
    {
      label: 'Get Advance',
      icon: 'dollar-sign',
      action: () => openModal('advance'),
      color: '#10B981',
    },
    {
      label: 'Submit Claim',
      icon: 'receipt',
      action: () => openModal('expense'),
      color: '#F59E0B',
    },
    {
      label: 'Refer Talent',
      icon: 'users',
      action: () => openModal('referral'),
      color: '#6366F1',
    },
  ];

  return (
    <View style={styles.container}>
      <TopBar title="Home" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Greeting */}
        <View style={styles.greetingBox}>
          <Text style={styles.greetingTime}>GOOD AFTERNOON</Text>
          <Text style={styles.greetingName}>Hi, {firstName}</Text>
          <Text style={styles.greetingSub}>
            {user?.employee?.job_title} at {user?.organization?.name}
          </Text>
        </View>

        {/* Attendance Card */}
        <AttendanceCard />

        {/* Quick Action Buttons Grid */}
        <View style={styles.actionsGrid}>
          {quickActions.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.actionTile}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#F3F4FA' }]}>
                <LucideIcon name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.actionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Pay Forecast */}
        <UpcomingPayCard />

        {/* Announcement */}
        <AnnouncementCard />
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
    gap: 14,
  },
  greetingBox: {
    marginBottom: 4,
  },
  greetingTime: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink400,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  greetingName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink950,
    letterSpacing: -0.5,
    fontFamily: 'System',
  },
  greetingSub: {
    fontSize: 13,
    color: colors.ink500,
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 4,
  },
  actionTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEEF6',
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink800,
    textAlign: 'center',
  },
});
