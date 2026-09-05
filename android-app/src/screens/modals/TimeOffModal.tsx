import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { ModalSheet } from '../../components/common/ModalSheet';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';
import { timeOffService } from '../../api/services';
import { TimeOffAllocation, TimeOffRequest } from '../../types';

export const TimeOffModal: React.FC = () => {
  const { activeModal, closeModal, showToast } = useApp();
  const [allocations, setAllocations] = useState<TimeOffAllocation[]>([]);
  const [requestsList, setRequestsList] = useState<TimeOffRequest[]>([]);
  const [loadingAllocations, setLoadingAllocations] = useState<boolean>(true);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(true);

  const [selectedType, setSelectedType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [durationDays, setDurationDays] = useState<string>('1');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (activeModal === 'timeoff') {
      // Fetch allocations
      setLoadingAllocations(true);
      (async () => {
        try {
          const data = await timeOffService.getAllocations();
          setAllocations(data);
          if (data.length > 0 && !selectedType) {
            setSelectedType(data[0].time_off_type_id);
          }
        } catch {
          setAllocations([]);
        } finally {
          setLoadingAllocations(false);
        }
      })();

      // Fetch requests
      setLoadingRequests(true);
      (async () => {
        try {
          const data = await timeOffService.getRequests();
          setRequestsList(data);
        } catch {
          setRequestsList([]);
        } finally {
          setLoadingRequests(false);
        }
      })();
    }
  }, [activeModal]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      showToast('Please provide a reason for the leave request');
      return;
    }
    if (!startDate || !endDate) {
      showToast('Please enter start and end dates');
      return;
    }
    setSubmitting(true);
    try {
      const newReq = await timeOffService.submitRequest({
        time_off_type_id: selectedType,
        start_date: startDate,
        end_date: endDate,
        duration_days: parseInt(durationDays, 10) || 1,
        reason,
      });
      setRequestsList([newReq, ...requestsList]);
      showToast('Time off request submitted to manager for approval');
      setReason('');
      setStartDate('');
      setEndDate('');
      setDurationDays('1');
    } catch {
      showToast('Failed to submit time off request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loadingAllocations || loadingRequests;

  return (
    <ModalSheet
      visible={activeModal === 'timeoff'}
      onClose={closeModal}
      title="Time Off Management"
      subtitle="Leave balances, policies, and active requests"
    >
      <View style={styles.container}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary600} style={{ marginVertical: 40 }} />
        ) : (
          <>
            {/* Balances Row */}
            <Text style={styles.sectionTitle}>Your Leave Balances</Text>
            {allocations.length === 0 ? (
              <Text style={styles.emptyText}>No leave allocations found</Text>
            ) : (
              <View style={styles.allocationsRow}>
                {allocations.map((alloc) => (
                  <View key={alloc.id} style={styles.allocCard}>
                    <Text style={styles.allocDays}>{alloc.remaining_amount}</Text>
                    <Text style={styles.allocUnit}>days left</Text>
                    <Text style={styles.allocTitle} numberOfLines={1}>
                      {alloc.time_off_type?.name || 'Leave'}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Request Form */}
            {allocations.length > 0 && (
              <View style={styles.formContainer}>
                <Text style={styles.sectionTitle}>Request Leave</Text>

                {/* Type Selector Chips */}
                <View style={styles.typeChipsRow}>
                  {allocations.map((alloc) => (
                    <TouchableOpacity
                      key={alloc.time_off_type_id}
                      style={[
                        styles.typeChip,
                        selectedType === alloc.time_off_type_id && styles.typeChipActive,
                      ]}
                      onPress={() => setSelectedType(alloc.time_off_type_id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          selectedType === alloc.time_off_type_id && styles.typeChipTextActive,
                        ]}
                      >
                        {alloc.time_off_type?.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Date row */}
                <View style={styles.datesRow}>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Start Date"
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="End Date"
                      value={endDate}
                      onChangeText={setEndDate}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                </View>

                <Input
                  label="Duration (Working Days)"
                  value={durationDays}
                  onChangeText={setDurationDays}
                  keyboardType="numeric"
                />

                <Input
                  label="Reason / Notes"
                  value={reason}
                  onChangeText={setReason}
                  placeholder="e.g. Family vacation, doctor rest"
                />

                <Button
                  title="Submit Time Off Request"
                  onPress={handleSubmit}
                  loading={submitting}
                  style={styles.submitBtn}
                />
              </View>
            )}

            {/* Request History */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Requests</Text>
            {requestsList.length === 0 ? (
              <Text style={styles.emptyText}>No time off requests found</Text>
            ) : (
              <View style={styles.historyList}>
                {requestsList.map((req) => (
                  <View key={req.id} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyTypeName}>
                        {req.time_off_type?.name || 'Leave'}
                      </Text>
                      <Badge
                        label={req.status === 'approved' ? 'Approved' : 'Pending Review'}
                        variant={req.status === 'approved' ? 'success' : 'warning'}
                      />
                    </View>
                    <Text style={styles.historyDates}>
                      {req.start_date} to {req.end_date} ({req.duration_days} days)
                    </Text>
                    {req.reason && <Text style={styles.historyReason}>"{req.reason}"</Text>}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink950,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: colors.ink500,
    textAlign: 'center',
    paddingVertical: 16,
  },
  allocationsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  allocCard: {
    flex: 1,
    backgroundColor: '#F7F8FC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEEF6',
    alignItems: 'center',
  },
  allocDays: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink950,
    fontFamily: 'System',
  },
  allocUnit: {
    fontSize: 11,
    color: colors.ink500,
    fontWeight: '500',
    marginBottom: 4,
  },
  allocTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink800,
  },
  formContainer: {
    backgroundColor: '#FAFBFD',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF6',
  },
  typeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#D8DBEA',
  },
  typeChipActive: {
    backgroundColor: colors.ink950,
    borderColor: colors.ink950,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink700,
  },
  typeChipTextActive: {
    color: colors.white,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  submitBtn: {
    marginTop: 6,
  },
  historyList: {
    gap: 10,
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEEF6',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyTypeName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink950,
  },
  historyDates: {
    fontSize: 13,
    color: colors.ink600,
  },
  historyReason: {
    fontSize: 12,
    color: colors.ink500,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
