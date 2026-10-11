import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function InviteModal({
  visible,
  onClose,
  appMode,
  userRole,
  activeTeamObj,
  teamSheet,
  teamAgeGroup,
  activePlayer,
  shareStaffInvite,
  shareFanInvite,
  shareCoParentInvite
}) {
  const isCoach = appMode === 'coach' || userRole === 'coach' || userRole === 'assistant' || userRole === 'admin';
  const isPlayer = userRole === 'player' || appMode === 'player';

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={[styles.modalOverlayFull, { justifyContent: 'center', alignItems: 'center' }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalBoxFull, { maxHeight: '85%' }]}>
          <Text style={styles.modalTitle}>Team Invite & Join Codes</Text>

          {isCoach ? (
            <ScrollView style={{ width: '100%' }} keyboardShouldPersistTaps="handled">
              {/* STAFF & ADMINISTRATIVE CODES */}
              <Text style={styles.sectionHeaderModal}>Staff & Administrative Codes</Text>
              
              {/* Assistant Coach Code */}
              <View style={[styles.card, { borderColor: '#3b82f6', marginBottom: 12 }]}>
                <Text style={[styles.cardTitle, { color: '#3b82f6' }]}>📋 Assistant Coach Code</Text>
                <Text style={styles.bulletText}>Share this code with assistant coaches to grant tactical, lineup, and matchday access:</Text>
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginVertical: 8, letterSpacing: 2 }}>
                  {activeTeamObj?.staff_code || 'STAF-PENDING'}
                </Text>
                <TouchableOpacity style={[styles.inviteShareBtn, { backgroundColor: '#3b82f6' }]} onPress={() => shareStaffInvite(activeTeamObj?.name, activeTeamObj?.staff_code)}>
                  <Text style={styles.inviteShareBtnText}>Share Staff Code</Text>
                </TouchableOpacity>
              </View>

              {/* Administrator Code */}
              <View style={[styles.card, { borderColor: '#a855f7', marginBottom: 12 }]}>
                <Text style={[styles.cardTitle, { color: '#a855f7' }]}>📂 Administrator Code</Text>
                <Text style={styles.bulletText}>Share this code with club administrators to grant roster setup and profile access:</Text>
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginVertical: 8, letterSpacing: 2 }}>
                  {activeTeamObj?.admin_code || 'ADMN-PENDING'}
                </Text>
                <TouchableOpacity style={[styles.inviteShareBtn, { backgroundColor: '#a855f7' }]} onPress={() => shareStaffInvite(activeTeamObj?.name, activeTeamObj?.admin_code)}>
                  <Text style={styles.inviteShareBtnText}>Share Admin Code</Text>
                </TouchableOpacity>
              </View>

              {/* Team Fan Code */}
              <View style={[styles.card, { borderColor: '#eab308', marginBottom: 15 }]}>
                <Text style={[styles.cardTitle, { color: '#eab308' }]}>📣 General Team Fan Code</Text>
                <Text style={styles.bulletText}>Share this code with supporters for read-only live match scores and POTM voting:</Text>
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginVertical: 8, letterSpacing: 2 }}>
                  {activeTeamObj?.fan_code || 'FAN-PENDING'}
                </Text>
                <TouchableOpacity style={[styles.inviteShareBtn, { backgroundColor: '#eab308' }]} onPress={() => shareFanInvite(activeTeamObj?.name, activeTeamObj?.fan_code)}>
                  <Text style={styles.inviteShareBtnText}>Share Fan Code</Text>
                </TouchableOpacity>
              </View>

              {/* Player & Family Invite Codes */}
              <Text style={styles.sectionHeaderModal}>Player & Family Invite Codes (FAM-)</Text>
              {(teamSheet || []).map(p => (
                <View key={p.id} style={styles.inviteRow}>
                  <View>
                    <Text style={styles.inviteName}>#{p.squad_number || ''} {p.name}</Text>
                    <Text style={styles.inviteCodeText}>Code: {p.family_code || 'FAM-PENDING'}</Text>
                  </View>
                  <TouchableOpacity style={styles.inviteShareBtn} onPress={() => teamAgeGroup === 'Adult' ? shareFanInvite(p.name, p.family_code) : shareCoParentInvite(p.name, p.family_code)}>
                    <Text style={styles.inviteShareBtnText}>Share</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : isPlayer ? (
            <View style={[styles.card, { borderColor: '#2E3A44' }]}>
              <Text style={[styles.cardTitle, { color: '#94a3b8' }]}>ℹ️ Player Account</Text>
              <Text style={styles.bulletText}>
                Join codes and fan invites can only be shared by Coaching Staff or Parents/Guardians.
              </Text>
            </View>
          ) : (
            <ScrollView style={{ width: '100%' }} keyboardShouldPersistTaps="handled">
              {/* Co-Parent / Guardian Code */}
              <View style={[styles.card, { borderColor: '#3b82f6', marginBottom: 15 }]}>
                <Text style={styles.cardTitle}>👨‍👩‍👦 Co-Parent / Guardian Code</Text>
                <Text style={styles.bulletText}>
                  Share this secure code with another guardian to give them parent access to {activePlayer?.name || 'your child'}'s profile:
                </Text>
                <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginVertical: 12, textAlign: 'center', letterSpacing: 3 }}>
                  {activePlayer?.family_code || 'FAM-PENDING'}
                </Text>
                <TouchableOpacity style={[styles.primaryAuthBtn, { backgroundColor: '#3b82f6' }]} onPress={() => shareCoParentInvite(activePlayer?.name, activePlayer?.family_code)}>
                  <Text style={styles.primaryAuthBtnText}>Share Co-Parent Code</Text>
                </TouchableOpacity>
              </View>

              {/* Extended Family & Fan Code */}
              <View style={[styles.card, { borderColor: '#eab308' }]}>
                <Text style={[styles.cardTitle, { color: '#eab308' }]}>📣 Extended Family & Fan Code</Text>
                <Text style={styles.bulletText}>
                  Share this code with grandparents, relatives, and supporters to let them follow live match scores and vote for POTM:
                </Text>
                <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginVertical: 12, textAlign: 'center', letterSpacing: 3 }}>
                  {activeTeamObj?.fan_code || 'FAN-PENDING'}
                </Text>
                <TouchableOpacity style={[styles.primaryAuthBtn, { backgroundColor: '#eab308' }]} onPress={() => shareFanInvite(activeTeamObj?.name, activeTeamObj?.fan_code)}>
                  <Text style={styles.primaryAuthBtnText}>Share Fan Code</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

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
  card: { backgroundColor: '#1A1F26', borderRadius: 10, padding: 15, marginBottom: 15, borderColor: '#2E3A44', borderWidth: 1 },
  cardTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  bulletText: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, lineHeight: 20 },
  sectionHeaderModal: { color: '#39FF14', fontSize: 13, fontWeight: 'bold', marginTop: 10, marginBottom: 10, textTransform: 'uppercase', alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#2E3A44', paddingBottom: 4, width: '100%' },
  inviteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#2E3A44' },
  inviteName: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  inviteCodeText: { color: '#39FF14', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  inviteShareBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  inviteShareBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  primaryAuthBtn: { backgroundColor: '#39FF14', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  primaryAuthBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94a3b8', fontSize: 14 }
});