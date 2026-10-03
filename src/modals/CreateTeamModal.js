import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateTeamModal({
  visible,
  onClose,
  newTeamName,
  setNewTeamName,
  newTeamAgeGroup,
  setNewTeamAgeGroup,
  ageGroupOptions,
  createNewTeamFromSidebar
}) {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlayFull}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }} pointerEvents="box-none">
          <View style={[styles.modalBoxFull, { maxHeight: '85%', flexShrink: 1 }]}>
            <ScrollView style={{ flexGrow: 0 }} showsVerticalScrollIndicator={true} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Create Additional Team</Text>
              
              <TextInput style={styles.input} placeholder="Team Name (e.g. Marlow Utd U15)" placeholderTextColor="#64748B" value={newTeamName} onChangeText={setNewTeamName} />
              
              <Text style={styles.inputLabel}>Select Age Group:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {ageGroupOptions.map(age => (
                  <TouchableOpacity key={age} style={[styles.fmtBtn, newTeamAgeGroup === age && styles.fmtBtnActive]} onPress={() => setNewTeamAgeGroup(age)}>
                    <Text style={[styles.fmtBtnText, newTeamAgeGroup === age && styles.fmtBtnTextActive]}>{age}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.primaryAuthBtn} onPress={createNewTeamFromSidebar}><Text style={styles.primaryAuthBtnText}>Create Team</Text></TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={onClose}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlayFull: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalBoxFull: { backgroundColor: '#1A1F26', width: '92%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#2E3A44', zIndex: 5 },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { backgroundColor: '#0B0E14', color: '#FFFFFF', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#2E3A44' },
  inputLabel: { color: '#94A3B8', fontWeight: 'bold', marginBottom: 6, fontSize: 12 },
  fmtBtn: { backgroundColor: '#0B0E14', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#2E3A44', minWidth: 50, alignItems: 'center' },
  fmtBtnActive: { backgroundColor: '#39FF14', borderColor: '#39FF14' },
  fmtBtnText: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold' },
  fmtBtnTextActive: { color: '#0B0E14' },
  primaryAuthBtn: { backgroundColor: '#39FF14', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  primaryAuthBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94A3B8', fontSize: 14 }
});