import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { LucideIcon } from '../../icons/LucideIcon';

interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeightPercent?: number;
}

export const ModalSheet: React.FC<ModalSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  maxHeightPercent = 88,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={[styles.sheetContainer, { maxHeight: `${maxHeightPercent}%` }]}
            >
              {/* Drag Pill */}
              <View style={styles.dragPillWrapper}>
                <View style={styles.dragPill} />
              </View>

              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                  <Text style={styles.titleText}>{title}</Text>
                  {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <LucideIcon name="x" size={18} color={colors.ink600} />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 13, 23, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 28,
    shadowColor: '#101322',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  dragPillWrapper: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D6D9E6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F7',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink950,
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 13,
    color: colors.ink500,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECEEF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
