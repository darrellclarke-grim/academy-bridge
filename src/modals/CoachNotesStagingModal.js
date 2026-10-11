import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { supabase } from '../supabase';

export default function CoachNotesStagingModal({
  visible,
  onClose,
  teamSheet = [],
  activeTeamId,
  onNotesPushed,
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [draftWeaknesses, setDraftWeaknesses] = useState('');
  const [draftCommunication, setDraftCommunication] = useState('');
  const [draftGeneralNotes, setDraftGeneralNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && teamSheet.length > 0 && !selectedPlayer) {
      handleSelectPlayer(teamSheet[0]);
    }
  }, [visible, teamSheet]);

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player);
    setDraftWeaknesses(player?.draft_notes_weaknesses || player?.notes_weaknesses || '');
    setDraftCommunication(player?.draft_notes_communication || player?.notes_communication || '');
    setDraftGeneralNotes(player?.draft_coach_notes || player?.coach_development_notes || '');
  };

  const handleSaveDraft = async () => {
    if (!selectedPlayer?.id) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('players')
      .update({
        draft_notes_weaknesses: draftWeaknesses,
        draft_notes_communication: draftCommunication,
        draft_coach_notes: draftGeneralNotes,
      })
      .eq('id', selectedPlayer.id);

    setIsSaving(false);

    if (error) {
      Alert.alert('Save Error', error.message);
    } else {
      Alert.alert('Draft Saved', `Draft notes for ${selectedPlayer.name} saved privately.`);
      if (onNotesPushed) onNotesPushed();
    }
  };

  const handlePushToProfile = async () => {
    if (!selectedPlayer?.id) return;

    Alert.alert(
      'Push to Player Profile',
      `Are you sure you want to publish these notes to ${selectedPlayer.name}'s active profile? This will update their Report Card and PDF export.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish Now',
          style: 'default',
          onPress: async () => {
            setIsSaving(true);

            const { error } = await supabase
              .from('players')
              .update({
                notes_weaknesses: draftWeaknesses,
                notes_communication: draftCommunication,
                coach_development_notes: draftGeneralNotes,
                draft_notes_weaknesses: draftWeaknesses,
                draft_notes_communication: draftCommunication,
                draft_coach_notes: draftGeneralNotes,
              })
              .eq('id', selectedPlayer.id);

            setIsSaving(false);

            if (error) {
              Alert.alert('Publish Error', error.message);
            } else {
              Alert.alert(
                'Notes Published! 🚀',
                `Notes successfully pushed to ${selectedPlayer.name}'s profile and report card.`
              );
              if (onNotesPushed) onNotesPushed();
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBoxContainer}
        >
          <View style={styles.modalBox}>
            <View style={styles.headerRow}>
              <Text style={styles.modalTitle}>📝 COACH NOTES STAGING</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>SELECT PLAYER TO REVIEW:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, marginBottom: 15 }}
            >
              {teamSheet.map((p) => {
                const isSelected = selectedPlayer?.id === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.playerChip, isSelected && styles.playerChipActive]}
                    onPress={() => handleSelectPlayer(p)}
                  >
                    <Text style={[styles.playerChipText, isSelected && styles.playerChipTextActive]}>
                      #{p.squad_number || 0} {p.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedPlayer ? (
              <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
                <Text style={styles.sectionHeader}>
                  DRAFT NOTES FOR: <Text style={{ color: '#39FF14' }}>{selectedPlayer.name}</Text>
                </Text>

                <Text style={styles.inputLabel}>1. Areas for Improvement (Weaknesses):</Text>
                <TextInput
                  style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="e.g. Needs to work on weaker foot touch under pressure..."
                  placeholderTextColor="#64748b"
                  value={draftWeaknesses}
                  onChangeText={setDraftWeaknesses}
                />

                <Text style={styles.inputLabel}>2. Communication & Leadership Notes:</Text>
                <TextInput
                  style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="e.g. Excellent voice when organizing the backline..."
                  placeholderTextColor="#64748b"
                  value={draftCommunication}
                  onChangeText={setDraftCommunication}
                />

                <Text style={styles.inputLabel}>3. General Coach Observations & Development Plan:</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="e.g. Overall tactical understanding has improved significantly..."
                  placeholderTextColor="#64748b"
                  value={draftGeneralNotes}
                  onChangeText={setDraftGeneralNotes}
                />

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 15, marginBottom: 20 }}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#1A1F26', borderColor: '#3b82f6', borderWidth: 1 }]}
                    onPress={handleSaveDraft}
                    disabled={isSaving}
                  >
                    <Text style={[styles.actionBtnText, { color: '#3b82f6' }]}>💾 Save Draft Privately</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#39FF14' }]}
                    onPress={handlePushToProfile}
                    disabled={isSaving}
                  >
                    <Text style={[styles.actionBtnText, { color: '#0B0E14' }]}>🚀 Push to Profile</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>Select a player above to begin staging notes.</Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalBoxContainer: { width: '92%', height: '85%' },
  modalBox: { flex: 1, backgroundColor: '#1A1F26', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#2E3A44' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { color: '#39FF14', fontSize: 16, fontWeight: 'bold' },
  closeBtn: { backgroundColor: '#0B0E14', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#2E3A44' },
  closeBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
  inputLabel: { color: '#94a3b8', fontWeight: 'bold', marginBottom: 6, fontSize: 12 },
  sectionHeader: { color: '#ffffff', fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  playerChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#0B0E14', borderWidth: 1, borderColor: '#2E3A44' },
  playerChipActive: { backgroundColor: '#39FF14', borderColor: '#39FF14' },
  playerChipText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
  playerChipTextActive: { color: '#0B0E14' },
  input: { backgroundColor: '#0B0E14', color: '#ffffff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#2E3A44' },
  actionBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { fontWeight: 'bold', fontSize: 13 },
  emptyText: { color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: 30 },
});