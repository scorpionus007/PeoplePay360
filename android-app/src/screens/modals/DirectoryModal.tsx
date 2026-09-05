import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { ModalSheet } from '../../components/common/ModalSheet';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';
import { teamService } from '../../api/services';
import { TeamMember } from '../../types';

export const DirectoryModal: React.FC = () => {
  const { activeModal, closeModal } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (activeModal === 'directory') {
      setLoading(true);
      (async () => {
        try {
          const data = await teamService.getTeamMembers();
          setMembers(data);
        } catch {
          setMembers([]);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [activeModal]);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ModalSheet
      visible={activeModal === 'directory'}
      onClose={closeModal}
      title="People Directory"
      subtitle={`${members.length} colleagues`}
    >
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <LucideIcon name="search" size={16} color={colors.ink400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, role, department..."
            placeholderTextColor={colors.ink400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary600} style={{ marginVertical: 40 }} />
        ) : filteredMembers.length === 0 ? (
          <Text style={styles.emptyText}>
            {searchQuery ? 'No results found' : 'No team members found'}
          </Text>
        ) : (
          /* Directory List */
          <View style={styles.membersList}>
            {filteredMembers.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{member.initials}</Text>
                </View>

                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                </View>

                <View style={styles.deptBadge}>
                  <Text style={styles.deptBadgeText}>{member.department}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4FA',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink950,
  },
  emptyText: {
    fontSize: 14,
    color: colors.ink500,
    textAlign: 'center',
    paddingVertical: 32,
  },
  membersList: {
    gap: 10,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4FA',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D7E2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: '#28468F',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink950,
  },
  memberRole: {
    fontSize: 12,
    color: colors.ink500,
    marginTop: 2,
  },
  deptBadge: {
    backgroundColor: '#EEF0F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deptBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink700,
  },
});
