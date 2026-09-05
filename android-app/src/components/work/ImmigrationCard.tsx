import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';

export const ImmigrationCard: React.FC = () => {
  const { openModal } = useApp();

  return (
    <Card style={styles.card} padding={18}>
      <TouchableOpacity
        style={styles.headerLink}
        onPress={() => openModal('immigration')}
        activeOpacity={0.7}
      >
        <Text style={styles.headerTitle}>Immigration</Text>
        <LucideIcon name="chevron-right" size={16} color={colors.ink500} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.requestRow}
        onPress={() => openModal('immigration')}
        activeOpacity={0.7}
      >
        <View style={styles.iconCircle}>
          <LucideIcon name="plane" size={18} color={colors.ink700} />
        </View>
        <Text style={styles.requestText}>Request a visa</Text>
      </TouchableOpacity>
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
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF0F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requestText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink950,
  },
});
