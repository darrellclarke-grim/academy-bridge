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
              
              <TouchableOpacity style={[styles.primaryAuthBtn, { marginTop: 20, backgroundColor: '#3B82F6' }]} onPress={() => runTafeAlgorithm('4')}>
                <Text style={styles.primaryAuthBtnText}>4-at-the-Back (Standard)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.primaryAuthBtn, { marginTop: 15, backgroundColor: '#39FF14' }]} onPress={() => runTafeAlgorithm('3')}>
                <Text style={[styles.primaryAuthBtnText, { color: '#0B0E14' }]}>3-at-the-Back (Aggressive)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.primaryAuthBtn, { marginTop: 15, backgroundColor: '#0B0E14', borderWidth: 1, borderColor: '#2E3A44' }]} onPress={() => runTafeAlgorithm('5')}>
                <Text style={[styles.primaryAuthBtnText, { color: '#CBD5E1' }]}>5-at-the-Back (Defensive)</Text>
              </TouchableOpacity>
            </View>
          )}

          {tafeStep === 'suggestions' && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.sectionHeaderModal, { color: '#39FF14' }]}>Top Suggested Formations</Text>
              {tafeSuggestions.map((sug, idx) => (
                <TouchableOpacity key={idx} style={[styles.card, { borderColor: '#39FF14', borderWidth: 2, padding: 10 }]} onPress={() => applyTafeFormation(sug.name, sug.logic)}>
                  <Text style={[styles.cardTitle, { color: '#39FF14', marginBottom: 2 }]}>{sug.name}</Text>
                  <Text style={{ color: '#CBD5E1', fontSize: 12 }}>Logic: {sug.reason}</Text>
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
  modalBoxFull: { backgroundColor: '#1A1F26', width: '92%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#2E3A44', zIndex: 5 },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  bulletText: { color: '#CBD5E1', fontSize: 14, marginBottom: 6, lineHeight: 20 },
  primaryAuthBtn: { backgroundColor: '#39FF14', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  primaryAuthBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  sectionHeaderModal: { color: '#39FF14', fontSize: 13, fontWeight: 'bold', marginTop: 10, marginBottom: 10, textTransform: 'uppercase', alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#2E3A44', paddingBottom: 4, width: '100%' },
  card: { backgroundColor: '#1A1F26', borderRadius: 10, padding: 15, marginBottom: 15, borderColor: '#2E3A44', borderWidth: 1 },
  cardTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  gridBtn: { backgroundColor: '#0B0E14', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, minWidth: '22%', alignItems: 'center', borderWidth: 1, borderColor: '#2E3A44' },
  gridBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 11 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94A3B8', fontSize: 14 }
});