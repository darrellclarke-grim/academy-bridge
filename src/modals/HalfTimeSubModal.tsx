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

interface HalfTimeSubModalProps {
  visible: boolean;
  onClose: () => void;
  onPitchPlayers: any[];
  subs: any[];
  onConfirmBatchSubs: (swaps: Array<{ offPlayer: any; onPlayer: any }>) => void;
}

export default function HalfTimeSubModal({
  visible,
  onClose,
  onPitchPlayers = [],
  subs = [],
  onConfirmBatchSubs,
}: HalfTimeSubModalProps) {
  const [plannedSwaps, setPlannedSwaps] = useState<Array<{ offPlayer: any; onPlayer: any }>>([]);
  const [selectedOff, setSelectedOff] = useState<any>(null);
  const [selectedOn, setSelectedOn] = useState<any>(null);

  const isPlayerInSwaps = (playerId: string) => {
    return plannedSwaps.some(s => s.offPlayer.id === playerId || s.onPlayer.id === playerId);
  };

  const handleStageSwap = () => {
    if (!selectedOff || !selectedOn) {
      Alert.alert("Select Players", "Select one player coming OFF and one substitute coming ON.");
      return;
    }
    setPlannedSwaps(prev => [...prev, { offPlayer: selectedOff, onPlayer: selectedOn }]);
    setSelectedOff(null);
    setSelectedOn(null);
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

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>🔄 Half-Time Substitutions</Text>
              <Text style={styles.subTitle}>Plan multiple 2nd half changes together</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {plannedSwaps.length > 0 && (
            <View style={styles.stagedContainer}>
              <Text style={styles.stagedHeading}>STAGED CHANGES ({plannedSwaps.length}):</Text>
              {plannedSwaps.map((swap, idx) => (
                <View key={idx} style={styles.stagedRow}>
                  <Text style={styles.stagedText}>
                    🟢 <Text style={{ color: '#39FF14', fontWeight: 'bold' }}>{swap.onPlayer.name}</Text> ON for 🔴 <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>{swap.offPlayer.name}</Text>
                  </Text>
                  <TouchableOpacity onPress={() => removeSwap(idx)} style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>Undo</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.selectorRow}>
            {/* COLUMN 1: COMING OFF (STARTERS) */}
            <View style={styles.column}>
              <Text style={styles.colTitle}>🔴 COMING OFF (PITCH)</Text>
              <ScrollView style={styles.scrollList}>
                {onPitchPlayers
                  .filter(p => !isPlayerInSwaps(p.id))
                  .map(p => {
                    const isSelected = selectedOff?.id === p.id;
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
                          <Text style={styles.playerRole}>{p.matchday_position || p.position}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>

            {/* COLUMN 2: COMING ON (BENCH) */}
            <View style={styles.column}>
              <Text style={styles.colTitle}>🟢 COMING ON (BENCH)</Text>
              <ScrollView style={styles.scrollList}>
                {subs
                  .filter(p => !isPlayerInSwaps(p.id))
                  .map(p => {
                    const isSelected = selectedOn?.id === p.id;
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
                          <Text style={styles.playerRole}>{p.position || 'Sub'}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.stageBtn, (!selectedOff || !selectedOn) && { opacity: 0.4 }]}
            onPress={handleStageSwap}
            disabled={!selectedOff || !selectedOn}
          >
            <Text style={styles.stageBtnText}>
              ➕ Stage Swap ({selectedOff ? selectedOff.name : 'Off'} ➔ {selectedOn ? selectedOn.name : 'On'})
            </Text>
          </TouchableOpacity>

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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 15 },
  container: { backgroundColor: '#1A1F26', width: '100%', maxHeight: '90%', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#2E3A44' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#2E3A44', paddingBottom: 8 },
  title: { color: '#39FF14', fontSize: 18, fontWeight: 'bold' },
  subTitle: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  closeBtn: { padding: 6 },
  closeBtnText: { color: '#94a3b8', fontSize: 18, fontWeight: 'bold' },
  stagedContainer: { backgroundColor: '#0B0E14', padding: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#39FF14' },
  stagedHeading: { color: '#39FF14', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 6 },
  stagedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  stagedText: { color: '#ffffff', fontSize: 12 },
  removeBtn: { backgroundColor: '#7f1d1d', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  removeBtnText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  selectorRow: { flexDirection: 'row', gap: 10, height: 250 },
  column: { flex: 1, backgroundColor: '#0B0E14', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#2E3A44' },
  colTitle: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  scrollList: { flex: 1 },
  playerCard: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 6, backgroundColor: '#1A1F26', marginBottom: 6, borderWidth: 1, borderColor: '#2E3A44', gap: 8 },
  playerCardSelectedOff: { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  playerCardSelectedOn: { borderColor: '#39FF14', backgroundColor: 'rgba(57, 255, 20, 0.15)' },
  playerJersey: { color: '#94a3b8', fontWeight: 'bold', fontSize: 11, width: 24 },
  playerName: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  playerRole: { color: '#64748b', fontSize: 10 },
  stageBtn: { backgroundColor: '#1E293B', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#3b82f6' },
  stageBtnText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 13 },
  applyBtn: { backgroundColor: '#39FF14', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  applyBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 14 },
});