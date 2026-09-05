import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { LogoMark } from '../../icons/LogoMark';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp, TabKey } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const handleTabPress = (tab: TabKey) => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.outerWrapper}>
      <View style={styles.navBar}>
        {/* Tab 1: Home (p. mark) */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'home' && styles.activePill]}
          onPress={() => handleTabPress('home')}
          activeOpacity={0.8}
        >
          <LogoMark
            size={activeTab === 'home' ? 24 : 22}
            color={activeTab === 'home' ? colors.ink950 : colors.ink500}
          />
        </TouchableOpacity>

        {/* Tab 2: Work (Building) */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'work' && styles.activePill]}
          onPress={() => handleTabPress('work')}
          activeOpacity={0.8}
        >
          <LucideIcon
            name="building"
            size={22}
            color={activeTab === 'work' ? colors.ink950 : colors.ink500}
            strokeWidth={activeTab === 'work' ? 2.4 : 1.8}
          />
        </TouchableOpacity>

        {/* Tab 3: Wallet (Card) */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'wallet' && styles.activePill]}
          onPress={() => handleTabPress('wallet')}
          activeOpacity={0.8}
        >
          <LucideIcon
            name="credit-card"
            size={22}
            color={activeTab === 'wallet' ? colors.ink950 : colors.ink500}
            strokeWidth={activeTab === 'wallet' ? 2.4 : 1.8}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
    alignItems: 'center',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 360,
    height: 58,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 30,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ECEEF6',
    shadowColor: '#101322',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tabButton: {
    width: 64,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  activePill: {
    backgroundColor: '#E4E7F4',
  },
});
