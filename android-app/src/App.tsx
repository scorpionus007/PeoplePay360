import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { colors } from './theme/colors';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WorkScreen } from './screens/WorkScreen';
import { WalletScreen } from './screens/WalletScreen';
import { BottomNav } from './components/common/BottomNav';

// Modals
import { AdvanceSalaryModal } from './screens/modals/AdvanceSalaryModal';
import { TimeOffModal } from './screens/modals/TimeOffModal';
import { PayslipDetailModal } from './screens/modals/PayslipDetailModal';
import { ITDevicesModal } from './screens/modals/ITDevicesModal';
import { ImmigrationModal } from './screens/modals/ImmigrationModal';
import { SubmitExpenseModal } from './screens/modals/SubmitExpenseModal';
import { AiChatModal } from './screens/modals/AiChatModal';
import { DirectoryModal } from './screens/modals/DirectoryModal';
import { ReferralModal } from './screens/modals/ReferralModal';

const MainPortal: React.FC = () => {
  const { activeTab, notificationToast } = useApp();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.bg}
        translucent={false}
      />

      {/* Floating Notification Toast */}
      {notificationToast && (
        <View style={styles.toastContainer}>
          <View style={styles.toastPill}>
            <Text style={styles.toastText}>{notificationToast}</Text>
          </View>
        </View>
      )}

      {/* Main Tab Screen */}
      <View style={styles.screenContainer}>
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'work' && <WorkScreen />}
        {activeTab === 'wallet' && <WalletScreen />}
      </View>

      {/* Floating Bottom Navigation Bar */}
      <BottomNav />

      {/* Modals & Overlays */}
      <AdvanceSalaryModal />
      <TimeOffModal />
      <PayslipDetailModal />
      <ITDevicesModal />
      <ImmigrationModal />
      <SubmitExpenseModal />
      <AiChatModal />
      <DirectoryModal />
      <ReferralModal />
    </SafeAreaView>
  );
};

const RootNavigator: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <AppProvider>
      <MainPortal />
    </AppProvider>
  );
};

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screenContainer: {
    flex: 1,
  },
  toastContainer: {
    position: 'absolute',
    top: 12,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastPill: {
    backgroundColor: colors.ink950,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#101322',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
});
