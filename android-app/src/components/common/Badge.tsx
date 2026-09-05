import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'info' | 'primary';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  style,
  textStyle,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'success':
        return styles.successContainer;
      case 'warning':
        return styles.warningContainer;
      case 'error':
        return styles.errorContainer;
      case 'info':
        return styles.infoContainer;
      case 'primary':
        return styles.primaryContainer;
      default:
        return styles.neutralContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'success':
        return styles.successText;
      case 'warning':
        return styles.warningText;
      case 'error':
        return styles.errorText;
      case 'info':
        return styles.infoText;
      case 'primary':
        return styles.primaryText;
      default:
        return styles.neutralText;
    }
  };

  return (
    <View style={[styles.badge, getContainerStyle(), style]}>
      <Text style={[styles.text, getTextStyle(), textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
    letterSpacing: -0.1,
  },
  successContainer: {
    backgroundColor: colors.mint100,
  },
  successText: {
    color: '#0E703A',
  },
  warningContainer: {
    backgroundColor: colors.amber100,
  },
  warningText: {
    color: '#B54708',
  },
  errorContainer: {
    backgroundColor: colors.rose100,
  },
  errorText: {
    color: '#B42318',
  },
  infoContainer: {
    backgroundColor: colors.sky100,
  },
  infoText: {
    color: '#026AA2',
  },
  primaryContainer: {
    backgroundColor: colors.primary50,
  },
  primaryText: {
    color: colors.primary600,
  },
  neutralContainer: {
    backgroundColor: '#ECEEF6',
  },
  neutralText: {
    color: colors.ink700,
  },
});
