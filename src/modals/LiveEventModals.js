import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface LiveEventModalsProps {
  liveEventMode: string;
  setLiveEventMode: (mode: string) => void;
  pendingEvent: any;
  opponentName?: string;
  onPitchPlayers: any[];
  subs: any[];
  teamSheet: any[];
  selectGoalScorer: (playerOrOpponent: any) => void;
  selectGoalAssist: (playerOrNone: any) => void;
  selectCardType: (type: 'yellow' | 'red') => void;
  finishCardFlow: (playerOrOpponent: any) => void;
  promptSubReason: (player: any) => void;
  selectCoachMotm: (player: any) => void;
  selectParentMotm: (player: any) => void;
}

export default function LiveEventModals({
  liveEventMode,
  setLiveEventMode,
  pendingEvent,
  opponentName,
  onPitchPlayers = [],
  subs = [],
  teamSheet = [],
  selectGoalScorer,
  selectGoalAssist,
  selectCardType,
  finishCardFlow,
  promptSubReason,
  selectCoachMotm,
  selectParentMotm,
}: LiveEventModalsProps) {
  if (liveEventMode === 'none') return null;

  return (
    <Modal visible={liveEventMode !== 'none'} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => setLiveEventMode('none')}
        />
        
        <View style={styles.modalBox}>
          
          {/* ========================================================= */}
          {/* 1. CARD TYPE SELECTOR (🟨 / 🟥) */}
          {/* ========================================================= */}
          {liveEventMode === 'card_type' && (
            <>
              <Text style={styles.modalTitle}>Select Disciplinary Card</Text>
              <Text style={styles.modalSubTitle}>Choose the card issued by the referee</Text>
              
              <View style={styles.cardTypeRow}>
                <TouchableOpacity
                  style={[styles.cardSelectBtn, { borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}
                  onPress={() => selectCardType('yellow')}
                >
                  <Text style={styles.cardSelectIcon}>🟨</Text>
                  <Text style={[styles.cardSelectText, { color: '#eab308' }]}>Yellow Card</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cardSelectBtn, { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}
                  onPress={() => selectCardType('red')}
                >
                  <Text style={styles.cardSelectIcon}>🟥</Text>
                  <Text style={[styles.cardSelectText, { color: '#ef4444' }]}>Red Card</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ========================================================= */}
          {/* 2. CARD PLAYER SELECTOR (Pitch First, Bench Second) */}
          {/* ========================================================= */}
          {liveEventMode === 'card_player' && (
            <>
              <Text style={styles.modalTitle}>
                {pendingEvent?.cardType === 'yellow' ? '🟨 Yellow Card' : '🟥 Red Card'} Recipient
              </Text>
              <Text style={styles.modalSubTitle}>Select the disciplined player</Text>

              <ScrollView style={{ maxHeight: 380, width: '100%', marginTop: 8 }} showsVerticalScrollIndicator={true}>
                {/* OPPONENT OPTION AT TOP */}
                <TouchableOpacity
                  style={styles.opponentRow}
                  onPress={() => finishCardFlow('Opponent')}
                >
                  <View>
                    <Text style={styles.opponentNameText}>⚠️ Opposition Player</Text>
                    <Text style={styles.opponentSubText}>{opponentName || 'Opponent Squad'}</Text>
                  </View>
                  <Text style={styles.actionArrow}>➔</Text>
                </TouchableOpacity>

                {/* SECTION 1: PITCH PLAYERS (STARTERS FIRST) */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>ON PITCH ({onPitchPlayers.length})</Text>
                </View>

                {onPitchPlayers.length === 0 ? (
                  <Text style={styles.emptyText}>No pitch players assigned</Text>
                ) : (
                  onPitchPlayers.map((player) => (
                    <TouchableOpacity
                      key={player.id}
                      style={styles.playerRowPitch}
                      onPress={() => finishCardFlow(player)}
                    >
                      <View style={styles.playerInfoLeft}>
                        <View style={styles.numberBadgePitch}>
                          <Text style={styles.numberTextPitch}>#{player.squad_number || '0'}</Text>
                        </View>
                        <View>
                          <Text style={styles.playerName}>{player.name}</Text>
                          <Text style={styles.playerPosText}>{player.matchday_position || player.position || 'Pitch'}</Text>
                        </View>
                      </View>
                      <View style={styles.pitchTag}>
                        <Text style={styles.pitchTagText}>ON PITCH</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}

                {/* SECTION 2: BENCH PLAYERS (SUBSTITUTES) */}
                <View style={[styles.sectionHeader, { marginTop: 12 }]}>
                  <Text style={[styles.sectionHeaderText, { color: '#94a3b8' }]}>BENCH ({subs.length})</Text>
                </View>

                {subs.length === 0 ? (
                  <Text style={styles.emptyText}>No substitutes available</Text>
                ) : (
                  subs.map((player) => (
                    <TouchableOpacity
                      key={player.id}
                      style={styles.playerRowBench}
                      onPress={() => finishCardFlow(player)}
                    >
                      <View style={styles.playerInfoLeft}>
                        <View style={styles.numberBadgeBench}>
                          <Text style={styles.numberTextBench}>#{player.squad_number || '0'}</Text>
                        </View>
                        <View>
                          <Text style={[styles.playerName, { color: '#cbd5e1' }]}>{player.name}</Text>
                          <Text style={styles.playerPosText}>Sub ({player.position || 'Bench'})</Text>
                        </View>
                      </View>
                      <View style={styles.benchTag}>
                        <Text style={styles.benchTagText}>BENCH</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>

              <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={() => setLiveEventMode('none')}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ========================================================= */}
          {/* 3. GOAL SCORER SELECTOR */}
          {/* ========================================================= */}
          {liveEventMode === 'goal_scorer' && (
            <>
              <Text style={styles.modalTitle}>⚽ Goal Scorer</Text>
              <Text style={styles.modalSubTitle}>Who scored the goal?</Text>

              <ScrollView style={{ maxHeight: 380, width: '100%', marginTop: 8 }} showsVerticalScrollIndicator={true}>
                <TouchableOpacity
                  style={styles.opponentRow}
                  onPress={() => selectGoalScorer('Opponent')}
                >
                  <View>
                    <Text style={styles.opponentNameText}>Opponent Goal ⚽</Text>
                    <Text style={styles.opponentSubText}>{opponentName || 'Opposition Squad'}</Text>
                  </View>
                  <Text style={styles.actionArrow}>➔</Text>
                </TouchableOpacity>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>ON PITCH ({onPitchPlayers.length})</Text>
                </View>

                {onPitchPlayers.map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={styles.playerRowPitch}
                    onPress={() => selectGoalScorer(player)}
                  >
                    <View style={styles.playerInfoLeft}>
                      <View style={styles.numberBadgePitch}>
                        <Text style={styles.numberTextPitch}>#{player.squad_number || '0'}</Text>
                      </View>
                      <View>
                        <Text style={styles.playerName}>{player.name}</Text>
                        <Text style={styles.playerPosText}>{player.matchday_position || player.position}</Text>
                      </View>
                    </View>
                    <Text style={styles.actionArrow}>➔</Text>
                  </TouchableOpacity>
                ))}

                {subs.length > 0 && (
                  <>
                    <View style={[styles.sectionHeader, { marginTop: 12 }]}>
                      <Text style={[styles.sectionHeaderText, { color: '#94a3b8' }]}>BENCH ({subs.length})</Text>
                    </View>
                    {subs.map((player) => (
                      <TouchableOpacity
                        key={player.id}
                        style={styles.playerRowBench}
                        onPress={() => selectGoalScorer(player)}
                      >
                        <View style={styles.playerInfoLeft}>
                          <View style={styles.numberBadgeBench}>
                            <Text style={styles.numberTextBench}>#{player.squad_number || '0'}</Text>
                          </View>
                          <View>
                            <Text style={[styles.playerName, { color: '#cbd5e1' }]}>{player.name}</Text>
                            <Text style={styles.playerPosText}>Sub ({player.position})</Text>
                          </View>
                        </View>
                        <Text style={styles.actionArrow}>➔</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>

              <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={() => setLiveEventMode('none')}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ========================================================= */}
          {/* 4. GOAL ASSIST SELECTOR */}
          {/* ========================================================= */}
          {liveEventMode === 'goal_assist' && (
            <>
              <Text style={styles.modalTitle}>🅰️ Assist Provider</Text>
              <Text style={styles.modalSubTitle}>Who provided the final pass?</Text>

              <ScrollView style={{ maxHeight: 380, width: '100%', marginTop: 8 }} showsVerticalScrollIndicator={true}>
                <TouchableOpacity
                  style={[styles.opponentRow, { borderColor: '#64748b' }]}
                  onPress={() => selectGoalAssist('None')}
                >
                  <View>
                    <Text style={[styles.opponentNameText, { color: '#94a3b8' }]}>Solo Goal (No Assist)</Text>
                    <Text style={styles.opponentSubText}>Unassisted / Solo Run / Rebound</Text>
                  </View>
                  <Text style={styles.actionArrow}>➔</Text>
                </TouchableOpacity>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>ON PITCH ({onPitchPlayers.length})</Text>
                </View>

                {onPitchPlayers
                  .filter((p) => p.id !== pendingEvent?.scorer?.id)
                  .map((player) => (
                    <TouchableOpacity
                      key={player.id}
                      style={styles.playerRowPitch}
                      onPress={() => selectGoalAssist(player)}
                    >
                      <View style={styles.playerInfoLeft}>
                        <View style={styles.numberBadgePitch}>
                          <Text style={styles.numberTextPitch}>#{player.squad_number || '0'}</Text>
                        </View>
                        <View>
                          <Text style={styles.playerName}>{player.name}</Text>
                          <Text style={styles.playerPosText}>{player.matchday_position || player.position}</Text>
                        </View>
                      </View>
                      <Text style={styles.actionArrow}>➔</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>

              <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={() => setLiveEventMode('none')}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ========================================================= */}
          {/* 5. SUBSTITUTION TARGET SELECTOR */}
          {/* ========================================================= */}
          {liveEventMode === 'sub_selection' && (
            <>
              <Text style={styles.modalTitle}>🔄 Complete Substitution</Text>
              <Text style={styles.modalSubTitle}>
                {pendingEvent?.isSubbingOff
                  ? `Select player to bring ON for ${pendingEvent?.sourcePlayer?.name}`
                  : `Select player to replace with ${pendingEvent?.sourcePlayer?.name}`}
              </Text>

              <ScrollView style={{ maxHeight: 350, width: '100%', marginTop: 8 }}>
                {(pendingEvent?.isSubbingOff ? subs : onPitchPlayers).map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={styles.playerRowPitch}
                    onPress={() => promptSubReason(player)}
                  >
                    <View style={styles.playerInfoLeft}>
                      <View style={styles.numberBadgePitch}>
                        <Text style={styles.numberTextPitch}>#{player.squad_number || '0'}</Text>
                      </View>
                      <View>
                        <Text style={styles.playerName}>{player.name}</Text>
                        <Text style={styles.playerPosText}>{player.matchday_position || player.position}</Text>
                      </View>
                    </View>
                    <Text style={[styles.actionArrow, { color: '#39FF14' }]}>Select ➔</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={() => setLiveEventMode('none')}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ========================================================= */}
          {/* 6. COACH POTM */}
          {/* ========================================================= */}
          {liveEventMode === 'coach_motm' && (
            <>
              <Text style={styles.modalTitle}>⭐ Award Coach's POTM</Text>
              <Text style={styles.modalSubTitle}>Select today's Player of the Match</Text>

              <ScrollView style={{ maxHeight: 350, width: '100%', marginTop: 8 }}>
                {teamSheet.filter(p => p.available).map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={styles.playerRowPitch}
                    onPress={() => selectCoachMotm(player)}
                  >
                    <View style={styles.playerInfoLeft}>
                      <View style={styles.numberBadgePitch}>
                        <Text style={styles.numberTextPitch}>#{player.squad_number || '0'}</Text>
                      </View>
                      <Text style={styles.playerName}>{player.name}</Text>
                    </View>
                    <Text style={{ color: '#eab308', fontWeight: 'bold' }}>Award ⭐</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={() => setLiveEventMode('none')}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ========================================================= */}
          {/* 7. PARENT/FAN POTM */}
          {/* ========================================================= */}
          {liveEventMode === 'parent_motm' && (
            <>
              <Text style={styles.modalTitle}>🌟 Vote for Fan's POTM</Text>
              <Text style={styles.modalSubTitle}>Cast your vote for today's top performer</Text>

              <ScrollView style={{ maxHeight: 350, width: '100%', marginTop: 8 }}>
                {teamSheet.filter(p => p.available).map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={styles.playerRowPitch}
                    onPress={() => selectParentMotm(player)}
                  >
                    <View style={styles.playerInfoLeft}>
                      <View style={styles.numberBadgePitch}>
                        <Text style={styles.numberTextPitch}>#{player.squad_number || '0'}</Text>
                      </View>
                      <Text style={styles.playerName}>{player.name}</Text>
                    </View>
                    <Text style={{ color: '#a855f7', fontWeight: 'bold' }}>Vote 🌟</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={() => setLiveEventMode('none')}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#1A1F26',
    width: '92%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E3A44',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalSubTitle: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  cardTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 18,
  },
  cardSelectBtn: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSelectIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardSelectText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  opponentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0B0E14',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ef4444',
    marginBottom: 10,
  },
  opponentNameText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 14,
  },
  opponentSubText: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    backgroundColor: '#0B0E14',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#39FF14',
  },
  sectionHeaderText: {
    color: '#39FF14',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  playerRowPitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0B0E14',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#2E3A44',
  },
  playerRowBench: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 14, 20, 0.5)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  playerInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  numberBadgePitch: {
    backgroundColor: '#1A1F26',
    borderWidth: 1,
    borderColor: '#39FF14',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  numberTextPitch: {
    color: '#39FF14',
    fontWeight: 'bold',
    fontSize: 11,
  },
  numberBadgeBench: {
    backgroundColor: '#0B0E14',
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  numberTextBench: {
    color: '#94a3b8',
    fontWeight: 'bold',
    fontSize: 11,
  },
  playerName: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  playerPosText: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 1,
  },
  pitchTag: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderWidth: 1,
    borderColor: '#39FF14',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pitchTagText: {
    color: '#39FF14',
    fontSize: 9,
    fontWeight: 'bold',
  },
  benchTag: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  benchTagText: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: 'bold',
  },
  actionArrow: {
    color: '#94a3b8',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 6,
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 'bold',
  },
});