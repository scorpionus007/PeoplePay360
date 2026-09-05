import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { LogoWordmark } from '../icons/LogoMark';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Header */}
          <View style={styles.logoHeader}>
            <LogoWordmark size={32} />
            <Text style={styles.portalBadge}>Employee Mobile</Text>
          </View>

          {/* Title Box */}
          <View style={styles.titleBox}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in with your workspace credentials to continue.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Input
              label="Work Email"
              value={email}
              onChangeText={(val: string) => { setEmail(val); setError(null); }}
              placeholder="name@company.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(val: string) => { setPassword(val); setError(null); }}
              placeholder="Enter your password"
              secureTextEntry
            />

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              title={loading ? 'Signing in...' : 'Log In'}
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={styles.loginBtn}
            />
          </View>

          {/* Security note */}
          <Text style={styles.footerNote}>
            Secured by enterprise-grade 256-bit encryption. PeoplePay360 is built for global teams.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  logoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  portalBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary600,
    backgroundColor: colors.primary50,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  titleBox: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink950,
    letterSpacing: -0.6,
    fontFamily: 'System',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.ink500,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#ECEEF6',
    shadowColor: '#101322',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  loginBtn: {
    marginTop: 8,
    width: '100%',
  },
  errorBox: {
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECDCA',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#D92D20',
    fontWeight: '500',
    lineHeight: 18,
  },
  footerNote: {
    fontSize: 12,
    color: colors.ink400,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
