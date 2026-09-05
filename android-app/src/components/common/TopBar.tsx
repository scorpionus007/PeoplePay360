import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  title: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { openModal } = useApp();
  const { user } = useAuth();
  const initials = user?.employee?.avatar_initials || 'AS';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.actionsRow}>
        {/* Search button */}
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => openModal('directory')}
          activeOpacity={0.7}
        >
          <LucideIcon name="search" size={18} color={colors.ink800} />
        </TouchableOpacity>

        {/* AI Assistant button */}
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => openModal('ai')}
          activeOpacity={0.7}
        >
          <LucideIcon name="sparkles" size={18} color={colors.primary600} />
        </TouchableOpacity>

        {/* Profile Avatar Badge */}
        <TouchableOpacity
          style={styles.avatarPill}
          onPress={() => openModal('directory')}
          activeOpacity={0.7}
        >
          <Text style={styles.avatarText}>{initials}</Text>
          {/* Notification count badge */}
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.ink900,
    letterSpacing: -0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECEEF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D7E2FE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#28468F',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.rose500,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
});
