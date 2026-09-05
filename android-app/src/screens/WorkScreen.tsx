import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { TopBar } from '../components/common/TopBar';
import { WorkMetricGrid } from '../components/work/WorkMetricGrid';
import { DeelITCard } from '../components/work/DeelITCard';
import { ContractCard } from '../components/work/ContractCard';
import { ImmigrationCard } from '../components/work/ImmigrationCard';
import { WorkCyclesCard } from '../components/work/WorkCyclesCard';

export const WorkScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <TopBar title="Work" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Metric Grid: Time Off (Used/scheduled 0) & People (Bridge-it App 26 people) */}
        <WorkMetricGrid />

        {/* PeoplePay IT card */}
        <DeelITCard />

        {/* Contract summary card */}
        <ContractCard />

        {/* Immigration / Visa card */}
        <ImmigrationCard />

        {/* Work cycles card */}
        <WorkCyclesCard />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
});
