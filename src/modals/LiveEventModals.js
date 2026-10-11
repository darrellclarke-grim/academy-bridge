import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LiveEventModals({
  liveEventMode,
  setLiveEventMode,
  pendingEvent,
  opponentName,
  onPitchPlayers,
  teamSheet,
  selectGoalScorer,
  selectGoalAssist,
  selectCardType,
  finishCardFlow,
  selectCoachMotm,
  selectParentMotm,
}) {
  return (
    <>
      <Modal visible={liveEventMode === 'goal_scorer'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLiveEventMode('none')} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Who Scored? ({pendingEvent?.minute})</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <TouchableOpacity style={[styles.benchBtn, { backgroundColor: '#7f1d1d' }]} onPress={() => selectGoalScorer('Opponent')}>
                <Text style={styles.benchBtnText}>{opponentName || 'Opponent'} Team ⚽</Text>
              </TouchableOpacity>
              {(onPitchPlayers || []).map((p) =>
                p ? (
                  <TouchableOpacity key={p.id} style={styles.liveActionBtnRow} onPress={() => selectGoalScorer(p)}>
                    <Text style={styles.liveActionTextRow}>{p.name}</Text>
                  </TouchableOpacity>
                ) : null
              )}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={liveEventMode === 'goal_assist'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLiveEventMode('none')} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Who Assisted? ({pendingEvent?.minute})</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <TouchableOpacity style={[styles.benchBtn, { backgroundColor: '#2E3A44' }]} onPress={() => selectGoalAssist('None')}>
                <Text style={styles.benchBtnText}>No Assist</Text>
              </TouchableOpacity>
              {(onPitchPlayers || []).map((p) =>
                p ? (
                  <TouchableOpacity key={p.id} style={styles.liveActionBtnRow} onPress={() => selectGoalAssist(p)}>
                    <Text style={styles.liveActionTextRow}>{p.name}</Text>
                  </TouchableOpacity>
                ) : null
              )}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={liveEventMode === 'card_type'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLiveEventMode('none')} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Log Disciplinary ({pendingEvent?.minute})</Text>
            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-around' }}>
              <TouchableOpacity style={[styles.liveActionBtn, { borderColor: '#eab308', borderWidth: 2 }]} onPress={() => selectCardType('yellow')}>
                <Text style={styles.liveActionIcon}>🟨</Text>
                <Text style={styles.liveActionText}>Yellow Card</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.liveActionBtn, { borderColor: '#ef4444', borderWidth: 2 }]} onPress={() => selectCardType('red')}>
                <Text style={styles.liveActionIcon}>🟥</Text>
                <Text style={styles.liveActionText}>Red Card</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={liveEventMode === 'card_player'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLiveEventMode('none')} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Who got the {pendingEvent?.cardType === 'yellow' ? 'Yellow' : 'Red'} Card?</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <TouchableOpacity style={[styles.benchBtn, { backgroundColor: '#7f1d1d' }]} onPress={() => finishCardFlow('Opponent')}>
                <Text style={styles.benchBtnText}>{opponentName || 'Opponent'} Team</Text>
              </TouchableOpacity>
              {(teamSheet || []).map((p) =>
                p ? (
                  <TouchableOpacity key={p.id} style={styles.liveActionBtnRow} onPress={() => finishCardFlow(p)}>
                    <Text style={styles.liveActionTextRow}>
                      {p.name} {p.is_starter ? '(Pitch)' : '(Bench)'}
                    </Text>
                  </TouchableOpacity>
                ) : null
              )}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={liveEventMode === 'coach_motm'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLiveEventMode('none')} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Coach's Player of the Match ⭐</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {(teamSheet || []).map((p) =>
                p ? (
                  <TouchableOpacity key={p.id} style={styles.liveActionBtnRow} onPress={() => selectCoachMotm(p)}>
                    <Text style={styles.liveActionTextRow}>#{p.squad_number || ''} {p.name}</Text>
                  </TouchableOpacity>
                ) : null
              )}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={liveEventMode === 'parent_motm'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLiveEventMode('none')} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Vote Fans' Player of the Match 🌟</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {(teamSheet || []).map((p) =>
                p ? (
                  <TouchableOpacity key={p.id} style={styles.liveActionBtnRow} onPress={() => selectParentMotm(p)}>
                    <Text style={styles.liveActionTextRow}>#{p.squad_number || ''} {p.name}</Text>
                  </TouchableOpacity>
                ) : null
              )}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  modalBox: { backgroundColor: '#1A1F26', width: '88%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#2E3A44', zIndex: 5 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  liveActionBtnRow: { backgroundColor: '#0B0E14', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#2E3A44', width: '100%', alignItems: 'center' },
  liveActionTextRow: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  benchBtn: { backgroundColor: '#ca8a04', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10, marginTop: 25, width: '100%' },
  benchBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  liveActionBtn: { backgroundColor: '#0B0E14', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 10, width: '45%', alignItems: 'center', borderWidth: 1, borderColor: '#2E3A44' },
  liveActionIcon: { fontSize: 24, marginBottom: 5 },
  liveActionText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%', marginTop: 10 },
  cancelBtnText: { color: '#94a3b8', fontSize: 14 },
});