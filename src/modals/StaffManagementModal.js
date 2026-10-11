import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../supabase';

export default function StaffManagementModal({
  visible,
  onClose,
  activeTeamObj,
  currentUserId,
  userRole,
  isSuperUser,
  onTeamUpdated,
  shareStaffInvite
}) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);

  const isHeadCoach = userRole === 'coach' || isSuperUser;
  const isAssistantCoach = userRole === 'assistant';

  useEffect(() => {
    if (visible && activeTeamObj?.id) {
      fetchTeamStaff();
    }
  }, [visible, activeTeamObj?.id]);

  const fetchTeamStaff = async () => {
    if (!activeTeamObj?.id) return;
    setLoading(true);
    try {
      // Query team_staff specifically for active team ID
      const { data, error } = await supabase
        .from('team_staff')
        .select('id, role, user_id, profiles(id, full_name, email, role)')
        .eq('team_id', activeTeamObj.id);

      if (data) {
        const formatted = data.map((item) => ({
          id: item.profiles?.id || item.user_id,
          full_name: item.profiles?.full_name,
          email: item.profiles?.email,
          role: item.role,
          staff_link_id: item.id
        }));
        setStaffList(formatted);
      }
    } catch (err) {
      console.error('Error fetching team staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeStaffMember = (targetUser) => {
    if (targetUser.id === activeTeamObj?.created_by) {
      Alert.alert('Action Denied', 'The creator of the team cannot be removed.');
      return;
    }

    if (isAssistantCoach && targetUser.role !== 'admin') {
      Alert.alert('Permission Denied', 'Assistant Coaches can only manage Administrators.');
      return;
    }

    Alert.alert(
      'Remove Staff Member',
      `Are you sure you want to remove ${targetUser.full_name || targetUser.email} from this team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('team_staff')
              .delete()
              .eq('team_id', activeTeamObj.id)
              .eq('user_id', targetUser.id);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Staff Removed', 'User has been removed from this team.');
              fetchTeamStaff();
              if (onTeamUpdated) onTeamUpdated();
            }
          }
        }
      ]
    );
  };

  const promoteToHeadCoach = (targetUser) => {
    if (!isHeadCoach) return;

    Alert.alert(
      'Transfer Head Coach Role',
      `Are you sure you want to promote ${targetUser.full_name || targetUser.email} to Head Coach? You will become an Assistant Coach.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer Role',
          style: 'destructive',
          onPress: async () => {
            await supabase
              .from('team_staff')
              .update({ role: 'assistant' })
              .eq('team_id', activeTeamObj.id)
              .eq('user_id', currentUserId);

            await supabase
              .from('team_staff')
              .update({ role: 'coach' })
              .eq('team_id', activeTeamObj.id)
              .eq('user_id', targetUser.id);

            await supabase
              .from('teams')
              .update({ created_by: targetUser.id })
              .eq('id', activeTeamObj.id);

            Alert.alert(
              'Role Transferred',
              `${targetUser.full_name || 'User'} is now the Head Coach for ${activeTeamObj.name}.`
            );
            onClose();
            if (onTeamUpdated) onTeamUpdated();
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlayFull}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalBoxFull, { maxHeight: '85%' }]}>
          <Text style={styles.modalTitle}>👥 Staff: {activeTeamObj?.name}</Text>

          <ScrollView style={{ width: '100%' }} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionHeaderModal}>Keys & Shareable Invite Codes</Text>

            {isHeadCoach && (
              <View style={[styles.card, { borderColor: '#3b82f6', marginBottom: 10 }]}>
                <Text style={[styles.cardTitle, { color: '#3b82f6' }]}>Assistant Coach Code</Text>
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginVertical: 4, letterSpacing: 2 }}>
                  {activeTeamObj?.staff_code || 'STAF-PENDING'}
                </Text>
                <TouchableOpacity
                  style={[styles.inviteShareBtn, { backgroundColor: '#3b82f6' }]}
                  onPress={() => shareStaffInvite(activeTeamObj?.name, activeTeamObj?.staff_code)}
                >
                  <Text style={styles.inviteShareBtnText}>Share Assistant Code</Text>
                </TouchableOpacity>
              </View>
            )}

            {(isHeadCoach || isAssistantCoach) && (
              <View style={[styles.card, { borderColor: '#a855f7', marginBottom: 15 }]}>
                <Text style={[styles.cardTitle, { color: '#a855f7' }]}>Administrator Code</Text>
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginVertical: 4, letterSpacing: 2 }}>
                  {activeTeamObj?.admin_code || 'ADMN-PENDING'}
                </Text>
                <TouchableOpacity
                  style={[styles.inviteShareBtn, { backgroundColor: '#a855f7' }]}
                  onPress={() => shareStaffInvite(activeTeamObj?.name, activeTeamObj?.admin_code)}
                >
                  <Text style={styles.inviteShareBtnText}>Share Admin Code</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.sectionHeaderModal}>Active Team Staff</Text>

            {staffList.map((member) => {
              const isMe = member.id === currentUserId;
              const isMemberHead = member.role === 'coach' || member.id === activeTeamObj?.created_by;
              const isMemberAssistant = member.role === 'assistant';
              const isMemberAdmin = member.role === 'admin';

              return (
                <View key={member.id} style={styles.inviteRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inviteName}>
                      {member.full_name || member.email} {isMe ? '(You)' : ''}
                    </Text>
                    <Text style={[styles.inviteCodeText, { color: '#94a3b8' }]}>
                      {isMemberHead ? '👑 Head Coach' : isMemberAssistant ? '⚽ Assistant Coach' : '📋 Administrator'}
                    </Text>
                  </View>

                  {!isMe && (
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {isHeadCoach && isMemberAssistant && (
                        <TouchableOpacity style={[styles.inviteShareBtn, { backgroundColor: '#eab308' }]} onPress={() => promoteToHeadCoach(member)}>
                          <Text style={[styles.inviteShareBtnText, { color: '#0B0E14' }]}>Promote</Text>
                        </TouchableOpacity>
                      )}

                      {((isHeadCoach && !isMemberHead) || (isAssistantCoach && isMemberAdmin)) && (
                        <TouchableOpacity style={[styles.inviteShareBtn, { backgroundColor: '#ef4444' }]} onPress={() => removeStaffMember(member)}>
                          <Text style={styles.inviteShareBtnText}>Remove</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={[styles.cancelBtn, { marginTop: 15 }]} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlayFull: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalBoxFull: { backgroundColor: '#1A1F26', width: '92%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#2E3A44', zIndex: 5 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  card: { backgroundColor: '#1A1F26', borderRadius: 10, padding: 15, marginBottom: 10, borderColor: '#2E3A44', borderWidth: 1 },
  cardTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  sectionHeaderModal: { color: '#39FF14', fontSize: 13, fontWeight: 'bold', marginTop: 10, marginBottom: 10, textTransform: 'uppercase', alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#2E3A44', paddingBottom: 4, width: '100%' },
  inviteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#2E3A44' },
  inviteName: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  inviteCodeText: { fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  inviteShareBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  inviteShareBtnText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94a3b8', fontSize: 14 }
});