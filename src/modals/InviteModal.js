import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../supabase';

export default function InviteModal({
  visible,
  onClose,
  appMode,
  userRole,
  activeTeamObj,
  teamSheet = [],
  teamAgeGroup = 'U16',
  activePlayer = {},
  shareStaffInvite,
  shareFanInvite,
  shareCoParentInvite,
  onJoinCode
}) {
  const isCoach = appMode === 'coach' || userRole === 'coach' || userRole === 'assistant' || userRole === 'admin';
  const isPlayer = userRole === 'player' || appMode === 'player';
  const isYouthTeam = !String(teamAgeGroup || '').toLowerCase().includes('adult');

  const [inAppJoinCode, setInAppJoinCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [localPlayerPin, setLocalPlayerPin] = useState(activePlayer?.player_activation_code || null);
  const [isGeneratingPin, setIsGeneratingPin] = useState(false);

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

  const shareHeadCoachInvite = (teamName, code) => {
    Share.share({
      message: `Hey! Join ${teamName || 'our team'} as Head Coach on Tactical Engine.\n\nUse Master Coach Code: ${code}` }); };  const sharePlayerPin = (playerName, code) => { Share.share({ message: `Hey ${playerName || 'Player'}! Here is your Tactical Engine login code: ${code}\n\nDownload the app, tap 'Join Existing Team', and enter this PIN to activate your personal player profile.`
    });
  };

  const handleGeneratePinFromModal = async () => {
    if (!activePlayer?.id) {
      Alert.alert("Error", "No linked player selected.");
      return;
    }

    setIsGeneratingPin(true);
    const newPin = `PL-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const { error } = await supabase
        .from('players')
        .update({ player_activation_code: newPin })
        .eq('id', activePlayer.id);

      if (error) throw error;

      setLocalPlayerPin(newPin);
      activePlayer.player_activation_code = newPin;

      Alert.alert(
        "Player PIN Generated! 🌟",
        `Activation Code for ${activePlayer.name}:${newPin}\n\nYour child can now download the app and enter this code to access their player account.`
      );
    } catch (err) {
      Alert.alert("Error", err?.message || "Failed to generate activation code.");
    } finally {
      setIsGeneratingPin(false);
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
            <Text style={styles.modalTitle}>Team Codes & Access Center</Text>

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
                  
                  {/* Head Coach Code */}
                  <View style={[styles.card, { borderColor: '#39FF14', marginBottom: 12 }]}>
                    <Text style={[styles.cardTitle, { color: '#39FF14' }]}>👑 Head Coach Master Code</Text>
                    <Text style={styles.bulletText}>Share this code with co-head coaches for full squad management, matchday control, and lineup optimization:</Text>
                    <Text style={[styles.codeDisplay, { color: '#39FF14' }]}>
                      {activeTeamObj?.invite_code || 'HEAD-PENDING'}
                    </Text>
                    <TouchableOpacity style={[styles.inviteShareBtn, { backgroundColor: '#39FF14' }]} onPress={() => shareHeadCoachInvite(activeTeamObj?.name, activeTeamObj?.invite_code)}>
                      <Text style={[styles.inviteShareBtnText, { color: '#0B0E14' }]}>Share Head Coach Code</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Assistant Coach Code */}
                  <View style={[styles.card, { borderColor: '#3b82f6', marginBottom: 12 }]}>
                    <Text style={[styles.cardTitle, { color: '#3b82f6' }]}>⚽ Assistant Coach Code</Text>
                    <Text style={styles.bulletText}>Share this code with assistants for match logging, drill management, and attendance:</Text>
                    <Text style={styles.codeDisplay}>
                      {activeTeamObj?.staff_code || 'STAF-PENDING'}
                    </Text>
                    <TouchableOpacity style={[styles.inviteShareBtn, { backgroundColor: '#3b82f6' }]} onPress={() => shareStaffInvite(activeTeamObj?.name, activeTeamObj?.staff_code)}>
                      <Text style={styles.inviteShareBtnText}>Share Staff Code</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Administrator Code */}
                  <View style={[styles.card, { borderColor: '#a855f7', marginBottom: 12 }]}>
                    <Text style={[styles.cardTitle, { color: '#a855f7' }]}>📋 Administrator Code</Text>
                    <Text style={styles.bulletText}>Share this code with club admins for roster registration and table management:</Text>
                    <Text style={styles.codeDisplay}>
                      {activeTeamObj?.admin_code || 'ADMN-PENDING'}
                    </Text>
                    <TouchableOpacity style={[styles.inviteShareBtn, { backgroundColor: '#a855f7' }]} onPress={() => shareStaffInvite(activeTeamObj?.name, activeTeamObj?.admin_code)}>
                      <Text style={styles.inviteShareBtnText}>Share Admin Code</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Team Fan Code */}
                  <View style={[styles.card, { borderColor: '#eab308', marginBottom: 15 }]}>
                    <Text style={[styles.cardTitle, { color: '#eab308' }]}>📣 Team Fan Code</Text>
                    <Text style={styles.bulletText}>Share this code with supporters for live scoreboard streaming and Fan POTM voting:</Text>
                    <Text style={styles.codeDisplay}>
                      {activeTeamObj?.fan_code || 'FAN-PENDING'}
                    </Text>
                    <TouchableOpacity style={[styles.inviteShareBtn, { backgroundColor: '#eab308' }]} onPress={() => shareFanInvite(activeTeamObj?.name, activeTeamObj?.fan_code)}>
                      <Text style={[styles.inviteShareBtnText, { color: '#0B0E14' }]}>Share Fan Code</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Player & Family Invite Codes */}
                  <Text style={styles.sectionHeaderModal}>
                    {isYouthTeam ? "Parent Registration Codes (Youth Safeguarding)" : "Player Squad Codes"}
                  </Text>
                  
                  {isYouthTeam && (
                    <View style={styles.safeguardBanner}>
                      <Text style={styles.safeguardBannerText}>
                        🛡️ <Text style={{ fontWeight: 'bold' }}>Safeguarding Note:</Text> Parents use their child's unique code to register first. Once registered, parents grant player app access to their child via an activation PIN.
                      </Text>
                    </View>
                  )}

                  {(teamSheet || []).map(p => (
                    <View key={p.id} style={styles.inviteRow}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.inviteName}>#{p.squad_number || '-'} {p.name}</Text>
                        <Text style={styles.inviteCodeText}>
                          {isYouthTeam ? 'Parent Code: ' : 'Player Code: '}
                          <Text style={{ color: '#39FF14' }}>{p.family_code || 'PENDING'}</Text>
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.inviteShareBtn}
                        onPress={() => isYouthTeam ? shareCoParentInvite(p.name, p.family_code) : shareFanInvite(p.name, p.family_code)}
                      >
                        <Text style={styles.inviteShareBtnText}>Share</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              ) : isPlayer ? (
                <View style={[styles.card, { borderColor: '#2E3A44', marginBottom: 15 }]}>
                  <Text style={[styles.cardTitle, { color: '#94a3b8' }]}>ℹ️ Player Account</Text>
                  <Text style={styles.bulletText}>
                    Your account is securely linked directly to your player profile. Team codes are managed by your Coaches and Parents. You can link another team below.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Co-Parent / Guardian Code */}
                  <View style={[styles.card, { borderColor: '#3b82f6', marginBottom: 15 }]}>
                    <Text style={styles.cardTitle}>👨‍👩‍👦 Co-Parent / Guardian Code</Text>
                    <Text style={styles.bulletText}>
                      Share this code with another guardian to give them co-parent access to {activePlayer?.name || 'your child'}'s profile:
                    </Text>
                    <Text style={styles.bigCodeText}>
                      {activePlayer?.family_code || 'FAM-PENDING'}
                    </Text>
                    <TouchableOpacity style={[styles.primaryAuthBtn, { backgroundColor: '#3b82f6' }]} onPress={() => shareCoParentInvite(activePlayer?.name, activePlayer?.family_code)}>
                      <Text style={styles.primaryAuthBtnText}>Share Co-Parent Code</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Dedicated Player Activation Code (Safeguarding) */}
                  {isYouthTeam && (
                    <View style={[styles.card, { borderColor: '#39FF14', marginBottom: 15 }]}>
                      <Text style={[styles.cardTitle, { color: '#39FF14' }]}>🏃 Player App Access PIN</Text>
                      <Text style={styles.bulletText}>
                        Send this one-time code to {activePlayer?.name || 'your child'} to activate their dedicated read-only player account:
                      </Text>

                      {localPlayerPin ? (
                        <>
                          <Text style={[styles.bigCodeText, { color: '#39FF14' }]}>
                            {localPlayerPin}
                          </Text>
                          <TouchableOpacity
                            style={[styles.primaryAuthBtn, { backgroundColor: '#39FF14' }]}
                            onPress={() => sharePlayerPin(activePlayer?.name, localPlayerPin)}
                          >
                            <Text style={[styles.primaryAuthBtnText, { color: '#0B0E14' }]}>
                              📲 Send Code to {activePlayer?.name || 'Player'}
                            </Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          style={[styles.primaryAuthBtn, { backgroundColor: '#141922', borderWidth: 1.5, borderColor: '#39FF14' }]}
                          onPress={handleGeneratePinFromModal}
                          disabled={isGeneratingPin}
                        >
                          {isGeneratingPin ? (
                            <ActivityIndicator color="#39FF14" size="small" />
                          ) : (
                            <Text style={[styles.primaryAuthBtnText, { color: '#39FF14' }]}>
                              🔑 Generate Player Activation PIN
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* Extended Family & Fan Code */}
                  <View style={[styles.card, { borderColor: '#eab308', marginBottom: 15 }]}>
                    <Text style={[styles.cardTitle, { color: '#eab308' }]}>📣 Extended Family & Fan Code</Text>
                    <Text style={styles.bulletText}>
                      Share this code with grandparents and relatives to let them follow live match scores and vote for POTM:
                    </Text>
                    <Text style={[styles.bigCodeText, { color: '#eab308' }]}>
                      {activeTeamObj?.fan_code || 'FAN-PENDING'}
                    </Text>
                    <TouchableOpacity style={[styles.primaryAuthBtn, { backgroundColor: '#eab308' }]} onPress={() => shareFanInvite(activeTeamObj?.name, activeTeamObj?.fan_code)}>
                      <Text style={[styles.primaryAuthBtnText, { color: '#0B0E14' }]}>Share Fan Code</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* 🔑 UNIVERSAL IN-APP JOIN SECTION (ALL ROLES) */}
              <View style={[styles.card, { borderColor: '#39FF14', marginTop: 15, backgroundColor: '#0B0E14' }]}>
                <Text style={[styles.cardTitle, { color: '#39FF14' }]}>🔑 Join Another Team / Link Squad</Text>
                <Text style={styles.bulletText}>
                  Have another squad or join code? Enter it here to link the team to this account without logging out:
                </Text>

                <TextInput
                  style={styles.joinInput}
                  placeholder="e.g. STAF-1234, HEAD-1234, or FAM-1234"
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

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
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
  codeDisplay: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginVertical: 8, letterSpacing: 2 },
  bigCodeText: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginVertical: 10, textAlign: 'center', letterSpacing: 3 },
  safeguardBanner: { backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#3b82f6', marginBottom: 12 },
  safeguardBannerText: { color: '#cbd5e1', fontSize: 12, lineHeight: 17 },
  inviteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#2E3A44' },
  inviteName: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  inviteCodeText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  inviteShareBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  inviteShareBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  joinInput: { backgroundColor: '#1A1F26', color: '#39FF14', fontSize: 16, fontWeight: 'bold', textAlign: 'center', padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: '#39FF14', marginVertical: 8, letterSpacing: 2 },
  primaryAuthBtn: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  primaryAuthBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%', marginTop: 8 },
  cancelBtnText: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold' }
});