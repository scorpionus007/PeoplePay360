import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { LucideIcon, LucideIconName } from '../../icons/LucideIcon';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'primaryLight' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.btnPrimary;
      case 'secondary':
        return styles.btnSecondary;
      case 'primaryLight':
        return styles.btnPrimaryLight;
      case 'danger':
        return styles.btnDanger;
      case 'ghost':
        return styles.btnGhost;
      default:
        return styles.btnPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.textPrimary;
      case 'secondary':
        return styles.textSecondary;
      case 'primaryLight':
        return styles.textPrimaryLight;
      case 'danger':
        return styles.textDanger;
      case 'ghost':
        return styles.textGhost;
      default:
        return styles.textPrimary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      default:
        return styles.sizeMd;
    }
  };

  const iconColor =
    variant === 'primary' || variant === 'danger'
      ? colors.white
      : variant === 'primaryLight'
      ? colors.primary600
      : colors.ink800;

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        getContainerStyle(),
        getSizeStyle(),
        disabled && styles.btnDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? colors.white : colors.primary600} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>
              <LucideIcon name={icon} size={size === 'sm' ? 14 : 18} color={iconColor} />
            </View>
          )}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>
              <LucideIcon name={icon} size={size === 'sm' ? 14 : 18} color={iconColor} />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sizeMd: {
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  sizeLg: {
    paddingVertical: 17,
    paddingHorizontal: 28,
  },
  btnPrimary: {
    backgroundColor: colors.ink950,
  },
  textPrimary: {
    color: colors.white,
    fontSize: 15,
  },
  btnSecondary: {
    backgroundColor: '#ECEEF6',
  },
  textSecondary: {
    color: colors.ink900,
    fontSize: 15,
  },
  btnPrimaryLight: {
    backgroundColor: colors.primary50,
  },
  textPrimaryLight: {
    color: colors.primary600,
    fontSize: 15,
  },
  btnDanger: {
    backgroundColor: colors.rose500,
  },
  textDanger: {
    color: colors.white,
    fontSize: 15,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  textGhost: {
    color: colors.ink500,
    fontSize: 15,
    fontWeight: '500',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
