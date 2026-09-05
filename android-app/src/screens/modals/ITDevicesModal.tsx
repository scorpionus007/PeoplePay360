import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { ModalSheet } from '../../components/common/ModalSheet';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';
import { itService } from '../../api/services';
import { ITDevice } from '../../types';

export const ITDevicesModal: React.FC = () => {
  const { activeModal, closeModal, showToast } = useApp();
  const [devices, setDevices] = useState<ITDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (activeModal === 'it') {
      setLoading(true);
      (async () => {
        try {
          const data = await itService.getDevices();
          setDevices(data);
        } catch {
          setDevices([]);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [activeModal]);

  const handleAction = (type: string) => {
    showToast(`IT Request for ${type} submitted to Helpdesk`);
  };

  return (
    <ModalSheet
      visible={activeModal === 'it'}
      onClose={closeModal}
      title="PeoplePay IT & Hardware"
      subtitle="Centrally managed corporate devices and security compliance"
    >
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary600} style={{ marginVertical: 40 }} />
        ) : devices.length === 0 ? (
          <Text style={styles.emptyText}>No devices assigned to your account.</Text>
        ) : (
          <>
            {/* Compliance Banner */}
            <View style={styles.complianceCard}>
              <View style={styles.iconCircle}>
                <LucideIcon name="shield-check" size={20} color={colors.mint500} />
              </View>
              <View style={styles.complianceInfo}>
                <Text style={styles.complianceTitle}>Security Baseline Status</Text>
                <Text style={styles.complianceSub}>
                  {devices.length} device(s) assigned to your profile.
                </Text>
              </View>
            </View>

            {/* Assigned Devices List */}
            <Text style={styles.sectionTitle}>Assigned Hardware</Text>
            <View style={styles.devicesList}>
              {devices.map((dev) => (
                <View key={dev.id} style={styles.deviceCard}>
                  <View style={styles.deviceHeader}>
                    <View style={styles.deviceTitleRow}>
                      <LucideIcon
                        name={dev.category === 'laptop' ? 'laptop' : 'smartphone'}
                        size={18}
                        color={colors.ink800}
                      />
                      <Text style={styles.deviceName}>{dev.device_name}</Text>
                    </View>
                    <Badge label={dev.status || 'Assigned'} variant="success" />
                  </View>

                  <View style={styles.deviceDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Serial Number</Text>
                      <Text style={styles.detailValue}>{dev.serial_number}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>OS / Firmware</Text>
                      <Text style={styles.detailValue}>{dev.os_version}</Text>
                    </View>
                    {dev.assigned_date && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Assignment Date</Text>
                        <Text style={styles.detailValue}>{dev.assigned_date}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <Button
            title="Report Hardware Issue"
            variant="secondary"
            onPress={() => handleAction('Hardware Repair')}
            style={{ flex: 1 }}
          />
          <Button
            title="Request Accessory"
            variant="primary"
            onPress={() => handleAction('New Accessory')}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.ink500,
    textAlign: 'center',
    paddingVertical: 32,
  },
  complianceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1FADF',
    marginBottom: 20,
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  complianceInfo: {
    flex: 1,
  },
  complianceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0E703A',
  },
  complianceSub: {
    fontSize: 12,
    color: '#157B43',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink950,
    marginBottom: 10,
  },
  devicesList: {
    gap: 12,
    marginBottom: 20,
  },
  deviceCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF6',
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink950,
  },
  deviceDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F2F4FA',
    paddingTop: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.ink500,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink800,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
});
