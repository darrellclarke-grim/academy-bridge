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
        <View style={[styles.modalBox, { borderColor: '#3b82f6', borderWidth: 2 }]}>
          <Text style={styles.modalTitle}>Select Substitution Reason</Text>
          <Text style={[styles.bulletText, { textAlign: 'center', marginBottom: 15 }]}>
            {subReasonModalState.onPlayer?.name} (ON) for {subReasonModalState.offPlayer?.name} (OFF)
          </Text>

          {['Coaches Decision', 'Players Decision', 'Injury'].map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[styles.primaryAuthBtn, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#3b82f6', marginBottom: 10 }]}
              onPress={() => finalizeSubWithReason(reason)}
            >
              <Text style={[styles.primaryAuthBtnText, { color: '#f97316' }]}>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  modalBox: { backgroundColor: '#112240', width: '88%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#233554', zIndex: 5 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  bulletText: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, lineHeight: 20 },
  primaryAuthBtn: { backgroundColor: '#f97316', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  primaryAuthBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94a3b8', fontSize: 14 }
});