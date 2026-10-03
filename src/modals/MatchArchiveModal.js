import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MatchArchiveModal({
  visible,
  onClose,
  matchHistory,
  appMode,
  teamSheet,
  startArchiveGoalEdit,
  archiveEditStep,
  selectedArchiveScorer,
  selectArchiveScorer,
  finishArchiveGoalEdit,
  setArchiveEditStep,
  setEditingArchiveMatch,
  setEditingArchiveEventIdx
}) {
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0E14' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#1A1F26', borderBottomWidth: 1, borderBottomColor: '#2E3A44' }}>
          <Text style={{ color: '#39FF14', fontSize: 18, fontWeight: 'bold' }}>📜 Past Match Reports</Text>
          <TouchableOpacity onPress={onClose} style={{ backgroundColor: '#0B0E14', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44' }}>
            <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Close Archive</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ padding: 15 }}>
          {(matchHistory || []).length === 0 ? (
            <Text style={styles.bulletText}>No past match reports archived yet.</Text>
          ) : (
            (matchHistory || []).map((m, idx) => (
              <View key={idx} style={[styles.card, { borderColor: '#3b82f6', marginBottom: 15 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
                    Us {m.team_score} - {m.opponent_score} {m.opponent_name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.resultBadge, m.result === 'W' ? styles.resW : m.result === 'L' ? styles.resL : styles.resD, { marginRight: 0 }]}>
                      {m.result}
                    </Text>
                    <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: 'bold' }}>[{m.match_type || 'League'}]</Text>
                  </View>
                </View>
                <Text style={{ color: '#64748b', fontSize: 11, marginBottom: 10 }}>Logged: {new Date(m.created_at || Date.now()).toLocaleDateString()}</Text>
                
                <View style={styles.divider} />
                <Text style={{ color: '#39FF14', fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>Match Ticker Feed Log:</Text>
                {(!m.ticker_events || m.ticker_events.length === 0) ? (
                  <Text style={[styles.bulletText, { fontSize: 12, color: '#64748b' }]}>No detailed ticker feed saved for this match.</Text>
                ) : (
                  m.ticker_events.map((evt, eIdx) => (
                    <View key={eIdx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#0B0E14' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Text style={{ color: '#39FF14', fontWeight: 'bold', width: 35, fontSize: 11 }}>{evt.minute}</Text>
                        <Text style={{ fontSize: 14, width: 22 }}>{evt.icon}</Text>
                        <Text style={{ color: '#cbd5e1', fontSize: 12, flex: 1 }}>{evt.message}</Text>
                      </View>
                      {appMode === 'coach' && evt.icon === '⚽' && (
                        <TouchableOpacity 
                          style={{ backgroundColor: '#0B0E14', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#3b82f6', marginLeft: 8 }}
                          onPress={() => startArchiveGoalEdit(m, eIdx)}
                        >
                          <Text style={{ color: '#3b82f6', fontSize: 10, fontWeight: 'bold' }}>Edit Event</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* INLINE GOAL & ASSIST EDIT OVERLAY */}
        {archiveEditStep !== 'none' && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
            <View style={[styles.modalBox, { width: '100%', maxHeight: '80%' }]}>
              {archiveEditStep === 'scorer' && (
                <>
                  <Text style={styles.modalTitle}>Step 1: Select Correct Goal Scorer</Text>
                  <ScrollView style={{ width: '100%', maxHeight: 300 }}>
                    {(teamSheet || []).map(p => (
                      <TouchableOpacity 
                        key={p.id} 
                        style={styles.liveActionBtnRow} 
                        onPress={() => selectArchiveScorer(p)}
                      >
                        <Text style={styles.liveActionTextRow}>#{p.squad_number || ''} {p.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {archiveEditStep === 'assist' && (
                <>
                  <Text style={styles.modalTitle}>Step 2: Select Assist Provider</Text>
                  <Text style={[styles.bulletText, { color: '#39FF14', textAlign: 'center', marginBottom: 10 }]}>
                    Scorer: {selectedArchiveScorer?.name}
                  </Text>
                  <ScrollView style={{ width: '100%', maxHeight: 300 }}>
                    <TouchableOpacity 
                      style={[styles.benchBtn, { backgroundColor: '#2E3A44', marginTop: 0 }]} 
                      onPress={() => finishArchiveGoalEdit('None')}
                    >
                      <Text style={styles.benchBtnText}>No Assist</Text>
                    </TouchableOpacity>
                    {(teamSheet || []).filter(p => p.id !== selectedArchiveScorer?.id).map(p => (
                      <TouchableOpacity 
                        key={p.id} 
                        style={styles.liveActionBtnRow} 
                        onPress={() => finishArchiveGoalEdit(p)}
                      >
                        <Text style={styles.liveActionTextRow}>#{p.squad_number || ''} {p.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <TouchableOpacity 
                style={[styles.cancelBtn, { marginTop: 15 }]} 
                onPress={() => { setArchiveEditStep('none'); setEditingArchiveMatch(null); setEditingArchiveEventIdx(null); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1A1F26', borderRadius: 10, padding: 15, marginBottom: 15, borderColor: '#2E3A44', borderWidth: 1 },
  bulletText: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, lineHeight: 20 },
  resultBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 12, fontWeight: 'bold', fontSize: 13, color: '#ffffff', overflow: 'hidden' },
  resW: { backgroundColor: '#15803d' },
  resD: { backgroundColor: '#ca8a04' },
  resL: { backgroundColor: '#991B1B' },
  divider: { height: 1, backgroundColor: '#2E3A44', marginVertical: 10 },
  modalBox: { backgroundColor: '#1A1F26', width: '88%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#2E3A44', zIndex: 5 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  liveActionBtnRow: { backgroundColor: '#0B0E14', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#2E3A44', width: '100%', alignItems: 'center' },
  liveActionTextRow: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  benchBtn: { backgroundColor: '#ca8a04', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10, marginTop: 25, width: '100%' },
  benchBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94a3b8', fontSize: 14 }
});