import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SeasonResetModal({
  visible,
  onClose,
  seasonResetConfirmText,
  setSeasonResetConfirmText,
  startNewSeasonFlow,
  isSavingSeason
}) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlayFull}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalBoxFull, { borderColor: '#EF4444', borderWidth: 2 }]}>
          <Text style={[styles.modalTitle, { color: '#EF4444', fontSize: 20 }]}>⚠️ Start New Season?</Text>
          
          <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: 15, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#EF4444' }}>
            <Text style={[styles.bulletText, { color: '#FCA5A5', fontWeight: 'bold', marginBottom: 10 }]}>
              This action will trigger the following irreversible resets:
            </Text>
            <Text style={styles.bulletText}>1. Collates all current stats into a master Season Report (saved to your Vault).</Text>
            <Text style={styles.bulletText}>2. Clears the current Match Archive.</Text>
            <Text style={styles.bulletText}>3. Resets ALL player stats (Apps, Goals, Mins, POTMs, Cards) back to zero.</Text>
            <Text style={[styles.bulletText, { marginTop: 10, fontStyle: 'italic', color: '#CBD5E1' }]}>
              * Player profiles, formations, and squad numbers will remain intact.
            </Text>
          </View>

          <Text style={[styles.inputLabel, { color: '#FFFFFF', textAlign: 'center' }]}>
            Type <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>RESET SEASON</Text> to confirm:
          </Text>
          <TextInput 
            style={[styles.input, { textAlign: 'center', fontWeight: 'bold', fontSize: 18, marginTop: 10, borderColor: '#EF4444' }]} 
            placeholder="Type RESET SEASON" 
            placeholderTextColor="#64748B" 
            value={seasonResetConfirmText} 
            onChangeText={setSeasonResetConfirmText} 
            autoCapitalize="characters"
          />
          
          <TouchableOpacity 
            style={[styles.deleteBtn, { opacity: seasonResetConfirmText.trim().toUpperCase() === 'RESET SEASON' ? 1 : 0.4 }]} 
            onPress={startNewSeasonFlow}
            disabled={seasonResetConfirmText.trim().toUpperCase() !== 'RESET SEASON' || isSavingSeason}
          >
            <Text style={styles.deleteBtnText}>{isSavingSeason ? "Processing..." : "Confirm Season Reset"}</Text>
          </TouchableOpacity>
          
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
  modalBoxFull: { backgroundColor: '#1A1F26', width: '92%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#2E3A44', zIndex: 5 },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  bulletText: { color: '#CBD5E1', fontSize: 14, marginBottom: 6, lineHeight: 20 },
  inputLabel: { color: '#94A3B8', fontWeight: 'bold', marginBottom: 6, fontSize: 12 },
  input: { backgroundColor: '#0B0E14', color: '#FFFFFF', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#2E3A44' },
  deleteBtn: { backgroundColor: '#991B1B', padding: 12, borderRadius: 8, alignItems: 'center', width: '100%' },
  deleteBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94A3B8', fontSize: 14 }
});