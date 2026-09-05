import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { Card } from '../common/Card';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';
import { benefitsService } from '../../api/services';
import { PartnerReward } from '../../types';

export const RewardsCard: React.FC = () => {
  const { showToast } = useApp();
  const [rewards, setRewards] = useState<PartnerReward[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await benefitsService.getRewards();
        setRewards(data);
      } catch {
        setRewards([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRewardClick = (code?: string) => {
    showToast(`Reward unlocked: Code ${code || 'PEOPLEPAY'} copied to clipboard`);
  };

  if (loading) {
    return (
      <Card style={styles.card} padding={18}>
        <Text style={styles.headerTitle}>Rewards</Text>
        <ActivityIndicator size="small" color={colors.primary600} style={{ marginVertical: 20 }} />
      </Card>
    );
  }

  if (rewards.length === 0) {
    return (
      <Card style={styles.card} padding={18}>
        <Text style={styles.headerTitle}>Rewards</Text>
        <Text style={styles.emptyText}>No rewards available</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.card} padding={18}>
      <View style={styles.headerLink}>
        <Text style={styles.headerTitle}>Rewards</Text>
        <LucideIcon name="chevron-right" size={16} color={colors.ink500} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
      >
        {rewards.map((reward) => (
          <TouchableOpacity
            key={reward.id}
            style={styles.rewardItemCard}
            onPress={() => handleRewardClick(reward.discount_code)}
            activeOpacity={0.8}
          >
            {/* Visual Header / Banner */}
            <View style={[styles.rewardBanner, { backgroundColor: reward.accent_color || colors.primary600 }]}>
              <View style={styles.partnerBadge}>
                <Text style={styles.partnerBadgeText}>{reward.badge_text || 'Partner'}</Text>
              </View>
            </View>

            {/* Body */}
            <View style={styles.rewardBody}>
              <View style={styles.logoRow}>
                <View style={styles.iconThumb}>
                  <LucideIcon name="tag" size={14} color={colors.white} />
                </View>
                <Text style={styles.partnerName}>{reward.partner_name}</Text>
              </View>
              <Text style={styles.rewardDesc} numberOfLines={2}>
                {reward.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  headerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink600,
    marginRight: 4,
  },
  emptyText: {
    fontSize: 13,
    color: colors.ink400,
    textAlign: 'center',
    paddingVertical: 16,
  },
  scrollRow: {
    gap: 12,
    paddingRight: 8,
  },
  rewardItemCard: {
    width: 210,
    backgroundColor: '#FAFBFD',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEEF6',
    overflow: 'hidden',
  },
  rewardBanner: {
    height: 76,
    padding: 10,
    justifyContent: 'flex-start',
  },
  partnerBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  partnerBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  rewardBody: {
    padding: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.ink900,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  partnerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink950,
  },
  rewardDesc: {
    fontSize: 12,
    color: colors.ink600,
    lineHeight: 16,
  },
});
