import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TafeModal({
  visible,
  onClose,
  tafeStep,
  tafeBackline,
  tafeSuggestions,
  tafeOther,
  runTafeAlgorithm,
  applyTafeFormation
}) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlayFull}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalBoxFull, { maxHeight: '85%' }]}>
          <Text style={styles.modalTitle}>⚡ Tactical Auto-Formation Engine</Text>
          
          {tafeStep === 'backline' && (
            <View>
              <Text style={styles.bulletText}>Select your preferred backline. TAFE will analyze available players' impact (G/A) and average minutes to suggest optimal lineups.</Text>
              
              <TouchableOpacity style={[styles.primaryAuthBtn, { marginTop: 20, backgroundColor: '#3b82f6' }]} onPress={() => runTafeAlgorithm('4')}>
                <Text style={styles.primaryAuthBtnText}>4-at-the-Back (Standard)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.primaryAuthBtn, { marginTop: 15, backgroundColor: '#f97316' }]} onPress={() => runTafeAlgorithm('3')}>
                <Text style={styles.primaryAuthBtnText}>3-at-the-Back (Aggressive)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.primaryAuthBtn, { marginTop: 15, backgroundColor: '#10b981' }]} onPress={() => runTafeAlgorithm('5')}>
                <Text style={styles.primaryAuthBtnText}>5-at-the-Back (Defensive)</Text>
              </TouchableOpacity>
            </View>
          )}

          {tafeStep === 'suggestions' && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.sectionHeaderModal, { color: '#10b981' }]}>Top Suggested Formations</Text>
              {tafeSuggestions.map((sug, idx) => (
                <TouchableOpacity key={idx} style={[styles.card, { borderColor: '#10b981', borderWidth: 2, padding: 10 }]} onPress={() => applyTafeFormation(sug.name, sug.logic)}>
                  <Text style={[styles.cardTitle, { color: '#10b981', marginBottom: 2 }]}>{sug.name}</Text>
                  <Text style={{ color: '#cbd5e1', fontSize: 12 }}>Logic: {sug.reason}</Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.sectionHeaderModal, { marginTop: 20 }]}>Other {tafeBackline}-Back Options</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {tafeOther.map(fmt => (
                  <TouchableOpacity key={fmt} style={[styles.gridBtn, { minWidth: '45%' }]} onPress={() => applyTafeFormation(fmt, 'balanced')}>
                    <Text style={styles.gridBtnText}>{fmt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          <TouchableOpacity style={[styles.cancelBtn, { marginTop: 20 }]} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
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
  bulletText: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, lineHeight: 20 },
  primaryAuthBtn: { backgroundColor: '#f97316', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  primaryAuthBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  sectionHeaderModal: { color: '#f97316', fontSize: 13, fontWeight: 'bold', marginTop: 10, marginBottom: 10, textTransform: 'uppercase', alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#233554', paddingBottom: 4, width: '100%' },
  card: { backgroundColor: '#112240', borderRadius: 10, padding: 15, marginBottom: 15, borderColor: '#233554', borderWidth: 1 },
  cardTitle: { color: '#f97316', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  gridBtn: { backgroundColor: '#1e3a8a', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, minWidth: '22%', alignItems: 'center' },
  gridBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 11 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94a3b8', fontSize: 14 }
});