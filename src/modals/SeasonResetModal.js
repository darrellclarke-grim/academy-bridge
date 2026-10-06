import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

export default function SeasonResetModal({
  visible,
  onClose,
  seasonResetConfirmText,
  setSeasonResetConfirmText,
  startNewSeasonFlow,
  isSavingSeason
}) {
  const isConfirmed = seasonResetConfirmText.trim().toUpperCase() === 'RESET SEASON';

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>🎆 Start New Season</Text>
                
                <Text style={styles.bulletText}>
                  This action will archive your current season statistics into the <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>Season Vault</Text> and reset all player matchday stats to zero.
                </Text>

                <Text style={styles.warningText}>
                  To confirm, type <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>RESET SEASON</Text> below:
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Type RESET SEASON"
                  placeholderTextColor="#64748B"
                  value={seasonResetConfirmText}
                  onChangeText={setSeasonResetConfirmText}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  style={[styles.resetBtn, !isConfirmed && styles.disabledBtn]}
                  disabled={!isConfirmed || isSavingSeason}
                  onPress={startNewSeasonFlow}
                >
                  {isSavingSeason ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.resetBtnText}>🎆 Archive & Reset Season</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  disabled={isSavingSeason}
                  onPress={onClose}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  modalBox: {
    backgroundColor: '#1A1F26',
    width: '88%',
    maxWidth: 400,
    padding: 22,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2E3A44',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  bulletText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  warningText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0B0E14',
    color: '#39FF14',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E3A44',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  resetBtn: {
    backgroundColor: '#EF4444',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledBtn: {
    backgroundColor: '#331B1B',
    opacity: 0.5,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelBtn: {
    padding: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
  },
});