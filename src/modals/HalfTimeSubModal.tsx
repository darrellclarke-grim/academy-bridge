import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getSisterPositions } from '../utils/positionHelpers';

const SUB_REASONS = ["Coach's Decision", "Player's Decision", "Injury"] as const;
type SubReason = typeof SUB_REASONS[number];

// Positional hierarchy ranking: ST (Top) -> Midfield -> Defense -> GK (Bottom)
const getTacticalRank = (posStr: string | undefined): number => {
  if (!posStr) return 99;
  const p = String(posStr).toUpperCase().trim();

  if (['ST', 'CF', 'LS', 'RS'].some(x => p === x || p.startsWith(x))) return 10;
  if (['CAM', 'LAM', 'RAM', 'CAM/CF'].some(x => p === x || p.includes('CAM'))) return 20;
  if (['LW', 'LF', 'LF/LW/LM'].some(x => p === x || p.includes('LW') || p.includes('LF'))) return 30;
  if (['RW', 'RF', 'RF/RW/RM'].some(x => p === x || p.includes('RW') || p.includes('RF'))) return 31;
  if (['LM'].some(x => p === x)) return 40;
  if (['RM'].some(x => p === x)) return 41;
  if (['CM', 'LCM'].some(x => p === x || p === 'LCM')) return 42;
  if (['RCM'].some(x => p === x)) return 43;
  if (['CDM', 'LDM'].some(x => p === x || p === 'LDM')) return 50;
  if (['RDM'].some(x => p === x)) return 51;
  if (['LB', 'LWB', 'LB/LWB'].some(x => p === x || p.includes('LB') || p.includes('LWB'))) return 60;
  if (['RB', 'RWB', 'RB/RWB'].some(x => p === x || p.includes('RB') || p.includes('RWB'))) return 61;
  if (['LCB'].some(x => p === x)) return 70;
  if (['RCB'].some(x => p === x)) return 71;
  if (['CB'].some(x => p === x || p.includes('CB'))) return 72;
  if (['GK', 'SGK', 'GK/SGK'].some(x => p === x || p.includes('GK'))) return 90;

  return 80;
};

interface HalfTimeSubModalProps {
  visible: boolean;
  onClose: () => void;
  onPitchPlayers: any[];
  subs: any[];
  onConfirmBatchSubs: (swaps: Array<{ offPlayer: any; onPlayer: any; reason: string }>) => void;
}

export default function HalfTimeSubModal({
  visible,
  onClose,
  onPitchPlayers = [],
  subs = [],
  onConfirmBatchSubs,
}: HalfTimeSubModalProps) {
  const [plannedSwaps, setPlannedSwaps] = useState<Array<{ offPlayer: any; onPlayer: any; reason: string }>>([]);
  const [selectedOff, setSelectedOff] = useState<any>(null);
  const [selectedOn, setSelectedOn] = useState<any>(null);
  const [selectedReason, setSelectedReason] = useState<SubReason>("Coach's Decision");

  const isPlayerInSwaps = (playerId: string) => {
    return plannedSwaps.some(s => s.offPlayer.id === playerId || s.onPlayer.id === playerId);
  };

  const handleStageSwap = () => {
    if (!selectedOff || !selectedOn) {
      Alert.alert("Select Players", "Select one player coming OFF and one substitute coming ON.");
      return;
    }
    setPlannedSwaps(prev => [
      ...prev,
      { offPlayer: selectedOff, onPlayer: selectedOn, reason: selectedReason }
    ]);
    setSelectedOff(null);
    setSelectedOn(null);
    setSelectedReason("Coach's Decision");
  };

  const removeSwap = (index: number) => {
    setPlannedSwaps(prev => prev.filter((_, i) => i !== index));
  };

  const handleApplyAllChanges = () => {
    if (plannedSwaps.length === 0) {
      onClose();
      return;
    }
    onConfirmBatchSubs(plannedSwaps);
    setPlannedSwaps([]);
    setSelectedOff(null);
    setSelectedOn(null);
    onClose();
  };

  const getDepthPositions = (player: any) => {
    const primary = player.position || '';
    const secondary = player.secondary_position && player.secondary_position !== 'None' ? player.secondary_position : null;
    
    const naturalSister = [
      ...getSisterPositions(primary),
      ...(secondary ? getSisterPositions(secondary) : [])
    ];
    
    const playedPositions = Object.keys(player.position_minutes || {});
    const combined = Array.from(new Set([...naturalSister, ...playedPositions]));

    return combined.filter(pos => pos !== primary && pos !== secondary).slice(0, 3);
  };

  // Sorted arrays: ST down to GK
  const sortedPitchStarters = [...onPitchPlayers]
    .filter(p => !isPlayerInSwaps(p.id))
    .sort((a, b) => getTacticalRank(a.matchday_position || a.position) - getTacticalRank(b.matchday_position || b.position));

  const sortedBenchSubs = [...subs]
    .filter(p => !isPlayerInSwaps(p.id))
    .sort((a, b) => getTacticalRank(a.position) - getTacticalRank(b.position));

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>🔄 Half-Time Substitutions</Text>
              <Text style={styles.subTitle}>Position order: Attackers down to Goalkeepers</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ACTIVE STAGED SWAPS LIST */}
          {plannedSwaps.length > 0 && (
            <View style={styles.stagedContainer}>
              <Text style={styles.stagedHeading}>STAGED FOR 2ND HALF ({plannedSwaps.length}):</Text>
              {plannedSwaps.map((swap, idx) => (
                <View key={idx} style={styles.stagedRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stagedText}>
                      🟢 <Text style={{ color: '#39FF14', fontWeight: 'bold' }}>{swap.onPlayer.name}</Text> ON for 🔴 <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>{swap.offPlayer.name}</Text>
                    </Text>
                    <Text style={styles.stagedReasonTag}>Reason: {swap.reason}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeSwap(idx)} style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>Undo</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* DUAL SELECTOR COLUMNS */}
          <View style={styles.selectorRow}>
            {/* COLUMN 1: COMING OFF (STARTERS - CURRENT PITCH POSITION) */}
            <View style={styles.column}>
              <Text style={styles.colTitle}>🔴 COMING OFF (PITCH)</Text>
              <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={true}>
                {sortedPitchStarters.map(p => {
                  const isSelected = selectedOff?.id === p.id;
                  const activeSlot = p.matchday_position || p.position || 'Starter';
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.playerCard, isSelected && styles.playerCardSelectedOff]}
                      onPress={() => setSelectedOff(isSelected ? null : p)}
                    >
                      <Text style={[styles.playerJersey, isSelected && { color: '#ef4444' }]}>
                        #{p.squad_number || '-'}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.playerName} numberOfLines={1}>{p.name}</Text>
                        <View style={styles.pitchSlotPill}>
                          <Text style={styles.pitchSlotPillText}>Pitch: {activeSlot}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* COLUMN 2: COMING ON (BENCH - COLOR-CODED BADGES) */}
            <View style={styles.column}>
              <Text style={styles.colTitle}>🟢 COMING ON (BENCH)</Text>
              <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={true}>
                {sortedBenchSubs.map(p => {
                  const isSelected = selectedOn?.id === p.id;
                  const primary = p.position || 'TBD';
                  const hasSecondary = p.secondary_position && p.secondary_position !== 'None';
                  const depthRoles = getDepthPositions(p);

                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.playerCard, isSelected && styles.playerCardSelectedOn]}
                      onPress={() => setSelectedOn(isSelected ? null : p)}
                    >
                      <Text style={[styles.playerJersey, isSelected && { color: '#39FF14' }]}>
                        #{p.squad_number || '-'}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.playerName} numberOfLines={1}>{p.name}</Text>
                        
                        <View style={styles.badgeRow}>
                          {/* Primary: Green */}
                          <View style={[styles.posBadge, { backgroundColor: '#39FF14' }]}>
                            <Text style={[styles.posBadgeText, { color: '#0B0E14' }]}>{primary}</Text>
                          </View>

                          {/* Secondary: Blue */}
                          {hasSecondary && (
                            <View style={[styles.posBadge, { backgroundColor: '#3b82f6' }]}>
                              <Text style={[styles.posBadgeText, { color: '#ffffff' }]}>{p.secondary_position}</Text>
                            </View>
                          )}

                          {/* Depth / Tertiary: Purple */}
                          {depthRoles.map(pos => (
                            <View key={pos} style={[styles.posBadge, { backgroundColor: '#a855f7' }]}>
                              <Text style={[styles.posBadgeText, { color: '#ffffff' }]}>{pos}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* 3 STRICT REASONS */}
          <View style={styles.reasonSection}>
            <Text style={styles.reasonLabel}>SUBSTITUTION REASON:</Text>
            <View style={styles.reasonRow}>
              {SUB_REASONS.map(reason => {
                const isSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonChip, isSelected && styles.reasonChipActive]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <Text style={[styles.reasonChipText, isSelected && styles.reasonChipTextActive]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* STAGE CHANGE BUTTON */}
          <TouchableOpacity
            style={[
              styles.stageBtn,
              (!selectedOff || !selectedOn) && { opacity: 0.4 }
            ]}
            onPress={handleStageSwap}
            disabled={!selectedOff || !selectedOn}
          >
            <Text style={styles.stageBtnText}>
              ➕ Stage Swap ({selectedOff ? selectedOff.name : 'Off'} ➔ {selectedOn ? selectedOn.name : 'On'})
            </Text>
          </TouchableOpacity>

          {/* CONFIRM ALL CHANGES BUTTON */}
          <TouchableOpacity
            style={[styles.applyBtn, plannedSwaps.length === 0 && { opacity: 0.5 }]}
            onPress={handleApplyAllChanges}
            disabled={plannedSwaps.length === 0}
          >
            <Text style={styles.applyBtnText}>
              ✅ Apply All Changes ({plannedSwaps.length}) & Update Pitch
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 12 },
  container: { backgroundColor: '#1A1F26', width: '100%', maxHeight: '94%', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2E3A44' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#2E3A44', paddingBottom: 6 },
  title: { color: '#39FF14', fontSize: 17, fontWeight: 'bold' },
  subTitle: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  closeBtn: { padding: 6 },
  closeBtnText: { color: '#94a3b8', fontSize: 18, fontWeight: 'bold' },
  stagedContainer: { backgroundColor: '#0B0E14', padding: 8, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#39FF14' },
  stagedHeading: { color: '#39FF14', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  stagedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  stagedText: { color: '#ffffff', fontSize: 12 },
  stagedReasonTag: { color: '#38bdf8', fontSize: 10, marginTop: 2, fontWeight: '600' },
  removeBtn: { backgroundColor: '#7f1d1d', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  removeBtnText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  selectorRow: { flexDirection: 'row', gap: 8, height: 260 },
  column: { flex: 1, backgroundColor: '#0B0E14', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#2E3A44' },
  colTitle: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  scrollList: { flex: 1 },
  playerCard: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 6, backgroundColor: '#1A1F26', marginBottom: 6, borderWidth: 1, borderColor: '#2E3A44', gap: 6 },
  playerCardSelectedOff: { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  playerCardSelectedOn: { borderColor: '#39FF14', backgroundColor: 'rgba(57, 255, 20, 0.15)' },
  playerJersey: { color: '#94a3b8', fontWeight: 'bold', fontSize: 11, width: 22 },
  playerName: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  pitchSlotPill: { backgroundColor: 'rgba(239, 68, 68, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 3, borderWidth: 1, borderColor: '#ef4444' },
  pitchSlotPillText: { color: '#ef4444', fontSize: 9, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  posBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  posBadgeText: { fontSize: 9, fontWeight: 'bold' },
  reasonSection: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#2E3A44' },
  reasonLabel: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', marginBottom: 6, letterSpacing: 0.5 },
  reasonRow: { flexDirection: 'row', gap: 6 },
  reasonChip: { flex: 1, backgroundColor: '#0B0E14', paddingVertical: 7, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#2E3A44' },
  reasonChipActive: { backgroundColor: 'rgba(57, 255, 20, 0.15)', borderColor: '#39FF14' },
  reasonChipText: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
  reasonChipTextActive: { color: '#39FF14' },
  stageBtn: { backgroundColor: '#1E293B', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#3b82f6' },
  stageBtnText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 12 },
  applyBtn: { backgroundColor: '#39FF14', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 6 },
  applyBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 13 },
});