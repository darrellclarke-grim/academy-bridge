import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

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
  shareCoParentInvite,
  onJoinCode
}) {
  const isCoach = appMode === 'coach' || userRole === 'coach' || userRole === 'assistant' || userRole === 'admin';
  const isPlayer = userRole === 'player' || appMode === 'player';

  const [inAppJoinCode, setInAppJoinCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const handleInAppJoin = async () => {
    Keyboard.dismiss();
    if (!inAppJoinCode.trim()) {
      Alert.alert("Code Required", "Please enter a valid Join Code.");
      return;
    }
    if (!onJoinCode) {
      Alert.alert("Error", "Join handler not configured.");
      return;
    }

    setIsLinking(true);
    const success = await onJoinCode(inAppJoinCode.trim().toUpperCase());
    setIsLinking(false);

    if (success) {
      setInAppJoinCode('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlayFull}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          style={styles.keyboardAvoidContainer}
          pointerEvents="box-none"
        >
          <View style={styles.modalBoxFull}>
            <Text style={styles.modalTitle}>Team Codes & Multi-Squad Center</Text>

            <ScrollView
              style={{ width: '100%' }}
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              {isCoach ? (
                <>
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
                  <Text style={styles.sectionHeaderModal}>Player & Family Invite Codes</Text>
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
                </>
              ) : isPlayer ? (
                <View style={[styles.card, { borderColor: '#2E3A44', marginBottom: 15 }]}>
                  <Text style={[styles.cardTitle, { color: '#94a3b8' }]}>ℹ️ Player Account</Text>
                  <Text style={styles.bulletText}>
                    Team invite codes are managed by Coaching Staff. You can use the section below to link additional teams you play for.
                  </Text>
                </View>
              ) : (
                <>
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
                  <View style={[styles.card, { borderColor: '#eab308', marginBottom: 15 }]}>
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
                </>
              )}

              {/* 🔑 UNIVERSAL IN-APP JOIN SECTION (ALL ROLES) */}
              <View style={[styles.card, { borderColor: '#39FF14', marginTop: 15, backgroundColor: '#0B0E14' }]}>
                <Text style={[styles.cardTitle, { color: '#39FF14' }]}>🔑 Join Another Team / Link Squad</Text>
                <Text style={styles.bulletText}>
                  Have another squad code (e.g. STAF-1234, HEAD-1234, or FAM-1234)? Enter it here to link the team to this account without logging out:
                </Text>

                <TextInput
                  style={styles.joinInput}
                  placeholder="Enter Join Code..."
                  placeholderTextColor="#64748b"
                  value={inAppJoinCode}
                  onChangeText={setInAppJoinCode}
                  autoCapitalize="characters"
                />

                <TouchableOpacity
                  style={[styles.primaryAuthBtn, { backgroundColor: '#39FF14', marginTop: 4 }, isLinking && { opacity: 0.6 }]}
                  onPress={handleInAppJoin}
                  disabled={isLinking}
                >
                  {isLinking ? (
                    <ActivityIndicator color="#0B0E14" size="small" />
                  ) : (
                    <Text style={[styles.primaryAuthBtnText, { color: '#0B0E14' }]}>➕ Link Team to Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlayFull: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  keyboardAvoidContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBoxFull: {
    backgroundColor: '#1A1F26',
    width: '92%',
    maxHeight: '85%',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2E3A44',
    zIndex: 5
  },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  card: { backgroundColor: '#1A1F26', borderRadius: 10, padding: 15, marginBottom: 15, borderColor: '#2E3A44', borderWidth: 1 },
  cardTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 15, marginBottom: 8 },
  bulletText: { color: '#cbd5e1', fontSize: 13, marginBottom: 8, lineHeight: 18 },
  sectionHeaderModal: { color: '#39FF14', fontSize: 13, fontWeight: 'bold', marginTop: 10, marginBottom: 10, textTransform: 'uppercase', alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#2E3A44', paddingBottom: 4, width: '100%' },
  inviteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#2E3A44' },
  inviteName: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  inviteCodeText: { color: '#39FF14', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  inviteShareBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  inviteShareBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  joinInput: { backgroundColor: '#1A1F26', color: '#39FF14', fontSize: 16, fontWeight: 'bold', textAlign: 'center', padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: '#39FF14', marginVertical: 8, letterSpacing: 2 },
  primaryAuthBtn: { backgroundColor: '#39FF14', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  primaryAuthBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94a3b8', fontSize: 14 }
});