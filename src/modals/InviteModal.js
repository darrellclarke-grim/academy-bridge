import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function InviteModal({
  visible,
  onClose,
  appMode,
  activeTeamObj,
  teamSheet,
  teamAgeGroup,
  activePlayer,
  shareStaffInvite,
  shareFanInvite,
  shareCoParentInvite
}) {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={[styles.modalOverlayFull, { justifyContent: 'center', alignItems: 'center' }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalBoxFull, { maxHeight: '80%' }]}>
          <Text style={styles.modalTitle}>Team Invite Codes</Text>

          {appMode === 'coach' ? (
            <>
              <View style={[styles.card, { borderColor: '#3b82f6', marginBottom: 15 }]}>
                <Text style={[styles.cardTitle, { color: '#3b82f6' }]}>📋 Assistant Coach / Staff Join Code</Text>
                <Text style={styles.bulletText}>Share this code with assistant coaches or team managers to grant them full admin control on matchday:</Text>
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginVertical: 8, letterSpacing: 2 }}>
                  {activeTeamObj?.staff_code || 'STAF-PENDING'}
                </Text>
                <TouchableOpacity style={[styles.inviteShareBtn, { backgroundColor: '#3b82f6' }]} onPress={() => shareStaffInvite(activeTeamObj?.name, activeTeamObj?.staff_code)}>
                  <Text style={styles.inviteShareBtnText}>Share Staff Code</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.sectionHeaderModal}>Player & Family Invite Codes</Text>
              <ScrollView style={{ width: '100%' }} keyboardShouldPersistTaps="handled">
                {(teamSheet || []).map(p => (
                  <View key={p.id} style={styles.inviteRow}>
                    <View>
                      <Text style={styles.inviteName}>#{p.squad_number || ''} {p.name}</Text>
                      <Text style={styles.inviteCodeText}>Code: {p.family_code}</Text>
                    </View>
                    <TouchableOpacity style={styles.inviteShareBtn} onPress={() => teamAgeGroup === 'Adult' ? shareFanInvite(p.name, p.family_code) : shareCoParentInvite(p.name, p.family_code)}>
                      <Text style={styles.inviteShareBtnText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </>
          ) : (
            <View style={[styles.card, { borderColor: '#3b82f6' }]}>
              <Text style={styles.cardTitle}>{teamAgeGroup === 'Adult' ? '📣 My Fan Invite Code' : '👨‍👩‍👦 Co-Parent / Guardian Code'}</Text>
              <Text style={styles.bulletText}>
                {teamAgeGroup === 'Adult' 
                  ? `Share this secure code with up to 2 fans to let them follow ${activePlayer?.name || 'your'} live match events and vote for POTM.`
                  : `Share this secure code with another guardian to give them parent access to ${activePlayer?.name || 'your child'}'s profile.`}
              </Text>
              <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginVertical: 15, textAlign: 'center', letterSpacing: 3 }}>
                {activePlayer?.family_code || 'FAM-PENDING'}
              </Text>
              <TouchableOpacity style={[styles.primaryAuthBtn, { backgroundColor: '#3b82f6' }]} onPress={() => teamAgeGroup === 'Adult' ? shareFanInvite(activePlayer?.name, activePlayer?.family_code) : shareCoParentInvite(activePlayer?.name, activePlayer?.family_code)}>
                <Text style={styles.primaryAuthBtnText}>Share Code</Text>
              </TouchableOpacity>
            </View>
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
  modalBoxFull: { backgroundColor: '#112240', width: '92%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#233554', zIndex: 5 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  card: { backgroundColor: '#112240', borderRadius: 10, padding: 15, marginBottom: 15, borderColor: '#233554', borderWidth: 1 },
  cardTitle: { color: '#f97316', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  bulletText: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, lineHeight: 20 },
  sectionHeaderModal: { color: '#f97316', fontSize: 13, fontWeight: 'bold', marginTop: 10, marginBottom: 10, textTransform: 'uppercase', alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#233554', paddingBottom: 4, width: '100%' },
  inviteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#334155' },
  inviteName: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  inviteCodeText: { color: '#f97316', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  inviteShareBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  inviteShareBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  primaryAuthBtn: { backgroundColor: '#f97316', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  primaryAuthBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94a3b8', fontSize: 14 }
});