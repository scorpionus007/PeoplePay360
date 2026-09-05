import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';

export const AttendanceCard: React.FC = () => {
  const { isClockedIn, workedDuration, handleClockIn, handleClockOut } = useApp();
  const [loading, setLoading] = useState<boolean>(false);

  const onToggleAttendance = async () => {
    setLoading(true);
    try {
      if (isClockedIn) {
        await handleClockOut();
      } else {
        await handleClockIn();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={styles.card} padding={20}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={[styles.statusPulse, { backgroundColor: isClockedIn ? colors.mint500 : colors.ink400 }]} />
          <Text style={styles.cardTitle}>Daily Attendance</Text>
        </View>
        <Badge
          label={isClockedIn ? 'Clocked In' : 'Clocked Out'}
          variant={isClockedIn ? 'success' : 'neutral'}
        />
      </View>

      <View style={styles.metricsRow}>
        <View>
          <Text style={styles.label}>Worked Today</Text>
          <Text style={styles.timerValue}>{isClockedIn ? workedDuration : '00h 00m'}</Text>
        </View>

        <View style={styles.divider} />

        <View>
          <Text style={styles.label}>Shift Schedule</Text>
          <Text style={styles.scheduleValue}>09:00 - 18:00</Text>
        </View>
      </View>

      <Button
        title={isClockedIn ? 'Clock Out for Day' : 'Clock In Now'}
        variant={isClockedIn ? 'secondary' : 'primary'}
        icon={isClockedIn ? 'clock' : 'check'}
        onPress={onToggleAttendance}
        loading={loading}
        style={styles.actionBtn}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink950,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F8FC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: '#E4E7F4',
  },
  label: {
    fontSize: 12,
    color: colors.ink500,
    fontWeight: '500',
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink950,
    fontFamily: 'System',
  },
  scheduleValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink800,
  },
  actionBtn: {
    width: '100%',
  },
});
