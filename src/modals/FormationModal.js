import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formationCategories } from '../constants/tactics';

export default function FormationModal({ visible, onClose, activeFormation, setActiveFormation }) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlayFull}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalBoxFull, { maxHeight: '85%' }]}>
          <Text style={styles.modalTitle}>Select Match Formation</Text>
          <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
            {formationCategories.map((category, idx) => (
              <View key={idx} style={{ marginBottom: 20 }}>
                <Text style={styles.sectionHeaderModal}>{category.title}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {category.formations.map(fmt => (
                    <TouchableOpacity 
                      key={fmt} 
                      style={[styles.gridBtn, activeFormation === fmt && { backgroundColor: '#f97316' }, { minWidth: '45%' }]}
                      onPress={() => { setActiveFormation(fmt); onClose(); }}
                    >
                      <Text style={styles.gridBtnText}>{fmt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={onClose}>
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
  sectionHeaderModal: { color: '#f97316', fontSize: 13, fontWeight: 'bold', marginTop: 10, marginBottom: 10, textTransform: 'uppercase', alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#233554', paddingBottom: 4, width: '100%' },
  gridBtn: { backgroundColor: '#1e3a8a', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, minWidth: '22%', alignItems: 'center' },
  gridBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 11 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94a3b8', fontSize: 14 }
});