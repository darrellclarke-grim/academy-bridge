import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SubReasonModal({
  visible,
  onClose,
  subReasonModalState,
  finalizeSubWithReason
}) {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { borderColor: '#39FF14', borderWidth: 2 }]}>
          <Text style={styles.modalTitle}>Select Substitution Reason</Text>
          <Text style={[styles.bulletText, { textAlign: 'center', marginBottom: 15 }]}>
            {subReasonModalState.onPlayer?.name} (ON) for {subReasonModalState.offPlayer?.name} (OFF)
          </Text>

          {['Coaches Decision', 'Players Decision', 'Injury'].map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[styles.primaryAuthBtn, { backgroundColor: '#0B0E14', borderWidth: 1, borderColor: '#2E3A44', marginBottom: 10 }]}
              onPress={() => finalizeSubWithReason(reason)}
            >
              <Text style={[styles.primaryAuthBtnText, { color: '#39FF14' }]}>
                {reason === 'Injury' ? '🚑 ' : reason === 'Players Decision' ? '🙋‍♂️ ' : '📋 '}
                {reason}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  modalBox: { backgroundColor: '#1A1F26', width: '88%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#2E3A44', zIndex: 5 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  bulletText: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, lineHeight: 20 },
  primaryAuthBtn: { backgroundColor: '#39FF14', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  primaryAuthBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94a3b8', fontSize: 14 }
});