import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';

export const NotificationBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState<boolean>(false);
  const { showToast } = useApp();

  if (dismissed) return null;

  const handleTurnOn = () => {
    setDismissed(true);
    showToast('Payment notifications enabled');
  };

  return (
    <Card style={styles.card} padding={18}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={styles.infoIconWrapper}>
            <LucideIcon name="info" size={16} color={colors.primary600} />
          </View>
          <Text style={styles.title}>Never miss a payment</Text>
        </View>

        <TouchableOpacity
          onPress={() => setDismissed(true)}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <LucideIcon name="x" size={16} color={colors.ink400} />
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        Get notified the moment a transaction hits your account.
      </Text>

      <View style={styles.buttonsRow}>
        <Button
          title="Maybe later"
          variant="secondary"
          size="sm"
          onPress={() => setDismissed(true)}
          style={styles.maybeLaterBtn}
        />
        <Button
          title="Turn on"
          variant="primary"
          size="sm"
          onPress={handleTurnOn}
          style={styles.turnOnBtn}
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink950,
  },
  closeButton: {
    padding: 4,
  },
  description: {
    fontSize: 13,
    color: colors.ink600,
    lineHeight: 18,
    marginBottom: 14,
    marginLeft: 32,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  maybeLaterBtn: {
    backgroundColor: '#EEF0F8',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  turnOnBtn: {
    backgroundColor: colors.ink950,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
});
