import { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useMatchdayStore } from '../store/useMatchdayStore';
import { supabase } from '../supabase';

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
}) {
  const [sinBinDuration, setSinBinDuration] = useState(10); // 8m (youth) vs 10m (adult/senior)

  const disqualifiedPlayerIds = useMatchdayStore((s) => s.disqualifiedPlayerIds || []);
  const sinBins = useMatchdayStore((s) => s.sinBins || []);
  const displaySeconds = useMatchdayStore((s) => s.displaySeconds || 0);

  if (liveEventMode === 'none') return null;

  // Filter out any player who is permanently sent off
  const availablePitchPlayers = onPitchPlayers.filter(
    (p) => !disqualifiedPlayerIds.includes(p.id)
  );

  const availableBenchSubs = subs.filter(
    (p) => !disqualifiedPlayerIds.includes(p.id) && !sinBins.some((sb) => sb.playerId === p.id)
  );

  // Card Completion Handler
  const handleCardSelection = async (playerOrOpponent) => {
    const cardType = pendingEvent?.cardType || 'yellow';

    if (playerOrOpponent !== 'Opponent' && playerOrOpponent?.id) {
      if (cardType === 'red') {
        // 1. Permanent Dismissal: Register in store
        useMatchdayStore.getState().addRedCard(playerOrOpponent.id);

        // 2. Remove from pitch in Supabase
        await supabase
          .from('players')
          .update({ is_starter: false, matchday_position: 'Sent Off' })
          .eq('id', playerOrOpponent.id);
      } else if (cardType === 'blue') {
        // 1. Temporary Dismissal (Sin Bin): Register in store
        const duration = pendingEvent?.sinBinDuration || sinBinDuration || 10;
        useMatchdayStore.getState().addSinBin({
          playerId: playerOrOpponent.id,
          playerName: playerOrOpponent.name,
          squadNumber: playerOrOpponent.squad_number,
          durationMinutes: duration,
          returnSeconds: displaySeconds + duration * 60,
          startTime: Date.now(),
        });

        // 2. Move to touchline sin bin in Supabase
        await supabase
          .from('players')
          .update({ is_starter: false, matchday_position: 'Sin Bin' })
          .eq('id', playerOrOpponent.id);
      }
    }

    if (finishCardFlow) {
      finishCardFlow(playerOrOpponent);
    }
  };

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
          {/* 1. CARD TYPE SELECTOR (🟨 YELLOW / 🟦 BLUE / 🟥 RED)    */}
          {/* ========================================================= */}
          {liveEventMode === 'card_type' && (
            <>
              <Text style={styles.modalTitle}>Select Disciplinary Card</Text>
              <Text style={styles.modalSubTitle}>Choose the card issued by the referee</Text>

              <View style={styles.cardTypeRow}>
                {/* YELLOW CARD */}
                <TouchableOpacity
                  style={[styles.cardSelectBtn, { borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}
                  onPress={() => {
                    selectCardType('yellow');
                  }}
                >
                  <Text style={styles.cardSelectIcon}>🟨</Text>
                  <Text style={[styles.cardSelectText, { color: '#eab308' }]}>Yellow Card</Text>
                  <Text style={styles.cardDescText}>Standard Caution</Text>
                </TouchableOpacity>

                {/* BLUE CARD (SIN BIN) */}
                <TouchableOpacity
                  style={[styles.cardSelectBtn, { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}
                  onPress={() => {
                    useMatchdayStore.getState().setPendingEvent((prev) => ({
                      ...(prev || {}),
                      cardType: 'blue',
                      sinBinDuration,
                    }));
                    setLiveEventMode('card_player');
                  }}
                >
                  <Text style={styles.cardSelectIcon}>🟦</Text>
                  <Text style={[styles.cardSelectText, { color: '#3b82f6' }]}>Blue Card</Text>
                  <Text style={styles.cardDescText}>{sinBinDuration}m Sin Bin</Text>
                </TouchableOpacity>

                {/* RED CARD */}
                <TouchableOpacity
                  style={[styles.cardSelectBtn, { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}
                  onPress={() => {
                    selectCardType('red');
                  }}
                >
                  <Text style={styles.cardSelectIcon}>🟥</Text>
                  <Text style={[styles.cardSelectText, { color: '#ef4444' }]}>Red Card</Text>
                  <Text style={styles.cardDescText}>Dismissal</Text>
                </TouchableOpacity>
              </View>

              {/* SIN BIN DURATION TOGGLE (8m vs 10m) */}
              <View style={styles.sinBinDurationRow}>
                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: 'bold' }}>Sin Bin Length:</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity
                    style={[styles.durationPill, sinBinDuration === 8 && styles.durationPillActive]}
                    onPress={() => setSinBinDuration(8)}
                  >
                    <Text style={[styles.durationPillText, sinBinDuration === 8 && styles.durationPillTextActive]}>
                      8 Min (Youth)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.durationPill, sinBinDuration === 10 && styles.durationPillActive]}
                    onPress={() => setSinBinDuration(10)}
                  >
                    <Text style={[styles.durationPillText, sinBinDuration === 10 && styles.durationPillTextActive]}>
                      10 Min (Adult/U16+)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ========================================================= */}
          {/* 2. CARD PLAYER SELECTOR                                  */}
          {/* ========================================================= */}
          {liveEventMode === 'card_player' && (
            <>
              <Text style={styles.modalTitle}>
                {pendingEvent?.cardType === 'yellow'
                  ? '🟨 Yellow Card'
                  : pendingEvent?.cardType === 'blue'
                  ? `🟦 Blue Card (${pendingEvent?.sinBinDuration || sinBinDuration}m Sin Bin)`
                  : '🟥 Red Card (Permanent Dismissal)'}
              </Text>
              <Text style={styles.modalSubTitle}>Select the disciplined player</Text>

              <ScrollView style={{ maxHeight: 380, width: '100%', marginTop: 8 }} showsVerticalScrollIndicator={true}>
                {/* OPPOSITION RECIPIENT */}
                <TouchableOpacity
                  style={styles.opponentRow}
                  onPress={() => handleCardSelection('Opponent')}
                >
                  <View>
                    <Text style={styles.opponentNameText}>⚠️ Opposition Player</Text>
                    <Text style={styles.opponentSubText}>{opponentName || 'Opponent Squad'}</Text>
                  </View>
                  <Text style={styles.actionArrow}>➔</Text>
                </TouchableOpacity>

                {/* ON PITCH STARTERS */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>ON PITCH ({availablePitchPlayers.length})</Text>
                </View>

                {availablePitchPlayers.length === 0 ? (
                  <Text style={styles.emptyText}>No pitch players assigned</Text>
                ) : (
                  availablePitchPlayers.map((player) => (
                    <TouchableOpacity
                      key={player.id}
                      style={styles.playerRowPitch}
                      onPress={() => handleCardSelection(player)}
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

                {/* BENCH PLAYERS */}
                <View style={[styles.sectionHeader, { marginTop: 12 }]}>
                  <Text style={[styles.sectionHeaderText, { color: '#94a3b8' }]}>BENCH ({availableBenchSubs.length})</Text>
                </View>

                {availableBenchSubs.length === 0 ? (
                  <Text style={styles.emptyText}>No substitutes available</Text>
                ) : (
                  availableBenchSubs.map((player) => (
                    <TouchableOpacity
                      key={player.id}
                      style={styles.playerRowBench}
                      onPress={() => handleCardSelection(player)}
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
          {/* 3. GOAL SCORER SELECTOR                                  */}
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
                  <Text style={styles.sectionHeaderText}>ON PITCH ({availablePitchPlayers.length})</Text>
                </View>

                {availablePitchPlayers.map((player) => (
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

                {availableBenchSubs.length > 0 && (
                  <>
                    <View style={[styles.sectionHeader, { marginTop: 12 }]}>
                      <Text style={[styles.sectionHeaderText, { color: '#94a3b8' }]}>BENCH ({availableBenchSubs.length})</Text>
                    </View>
                    {availableBenchSubs.map((player) => (
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
          {/* 4. GOAL ASSIST SELECTOR                                  */}
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
                  <Text style={styles.sectionHeaderText}>ON PITCH ({availablePitchPlayers.length})</Text>
                </View>

                {availablePitchPlayers
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
          {/* 5. SUBSTITUTION TARGET SELECTOR                          */}
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
                {(pendingEvent?.isSubbingOff ? availableBenchSubs : availablePitchPlayers).map((player) => (
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
          {/* 6. COACH POTM                                            */}
          {/* ========================================================= */}
          {liveEventMode === 'coach_motm' && (
            <>
              <Text style={styles.modalTitle}>⭐ Award Coach's POTM</Text>
              <Text style={styles.modalSubTitle}>Select today's Player of the Match</Text>

              <ScrollView style={{ maxHeight: 350, width: '100%', marginTop: 8 }}>
                {teamSheet.filter((p) => p.available && !disqualifiedPlayerIds.includes(p.id)).map((player) => (
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
          {/* 7. PARENT/FAN POTM                                       */}
          {/* ========================================================= */}
          {liveEventMode === 'parent_motm' && (
            <>
              <Text style={styles.modalTitle}>🌟 Vote for Fan's POTM</Text>
              <Text style={styles.modalSubTitle}>Cast your vote for today's top performer</Text>

              <ScrollView style={{ maxHeight: 350, width: '100%', marginTop: 8 }}>
                {teamSheet.filter((p) => p.available && !disqualifiedPlayerIds.includes(p.id)).map((player) => (
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
    width: '94%',
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
    gap: 8,
    marginVertical: 14,
  },
  cardSelectBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSelectIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  cardSelectText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardDescText: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2,
  },
  sinBinDurationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0B0E14',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2E3A44',
  },
  durationPill: {
    backgroundColor: '#1A1F26',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2E3A44',
  },
  durationPillActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  durationPillText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  durationPillTextActive: {
    color: '#ffffff',
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