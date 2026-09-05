import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { colors } from '../theme/colors';

/**
 * Deel-style "p." mark corresponding to frontend/public/logo-mark.svg
 */
export const LogoMark: React.FC<{ size?: number; color?: string; inverted?: boolean }> = ({
  size = 28,
  color = colors.ink950,
  inverted = false,
}) => {
  const textColor = inverted ? colors.white : color;
  return (
    <View style={[styles.markContainer, { width: size, height: size }]}>
      <Text
        style={[
          styles.markText,
          {
            fontSize: size * 0.82,
            lineHeight: size * 0.95,
            color: textColor,
          },
        ]}
      >
        p.
      </Text>
    </View>
  );
};

/**
 * PeoplePay wordmark: bold "people" + regular "pay" + bold "."
 * Aligned with frontend/src/components/Logo.tsx
 */
export const LogoWordmark: React.FC<{ size?: number; inverted?: boolean }> = ({
  size = 24,
  inverted = false,
}) => {
  const primaryColor = inverted ? colors.white : colors.ink950;
  const secondaryColor = inverted ? colors.ink300 : colors.ink600;

  return (
    <View style={styles.wordmarkRow}>
      <Text style={[styles.wordmarkStrong, { fontSize: size, color: primaryColor }]}>people</Text>
      <Text style={[styles.wordmarkWeak, { fontSize: size, color: secondaryColor }]}>pay</Text>
      <Text style={[styles.wordmarkStrong, { fontSize: size, color: colors.primary600 }]}>.</Text>
    </View>
  );
};

/**
 * 2FA Security Lock Illustration matching Screenshot 1:
 * Blue shaded padlock with keyhole and blue circular checkmark badge.
 */
export const SecurityLockIllustration: React.FC<{ size?: number }> = ({ size = 120 }) => {
  return (
    <Svg width={size} height={size * 1.05} viewBox="0 0 100 105" fill="none">
      {/* Shackle */}
      <Path
        d="M28 42V26C28 14.9543 37.8497 6 50 6C62.1503 6 72 14.9543 72 26V42"
        stroke="#9BB7DC"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Lock Body */}
      <Rect
        x="18"
        y="38"
        width="64"
        height="56"
        rx="10"
        fill="#A5C8ED"
      />
      <Rect
        x="22"
        y="42"
        width="56"
        height="48"
        rx="8"
        fill="#B8D7F7"
      />
      {/* Keyhole */}
      <Circle cx="50" cy="62" r="5" fill="#1C4776" />
      <Path
        d="M48 64L46 76H54L52 64H48Z"
        fill="#1C4776"
      />
      {/* Verified Check Badge (Bottom Right) */}
      <Circle cx="76" cy="74" r="14" fill="#3B82F6" />
      <Path
        d="M70 74L74 78L82 70"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const styles = StyleSheet.create({
  markContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    fontWeight: '900',
    letterSpacing: -1,
    fontFamily: 'System',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmarkStrong: {
    fontWeight: '800',
    letterSpacing: -0.4,
    fontFamily: 'System',
  },
  wordmarkWeak: {
    fontWeight: '400',
    letterSpacing: -0.4,
    fontFamily: 'System',
  },
});
