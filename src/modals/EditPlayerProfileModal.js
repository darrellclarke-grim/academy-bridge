import {
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
import { profilePositions, profileSecondaryPositions } from '../constants/profileData';
import { getPosCategory } from '../utils/positionHelpers';

export default function EditPlayerProfileModal({
  visible,
  editingPlayer,
  setEditingPlayer,
  updateFullPlayerProfile,
  assignPlayerRole,
  initiateDeletePlayer,
  profile,
  appMode,
}) {
  if (!editingPlayer) return null;

  const render1to10Row = (label, statKey) => {
    const val = editingPlayer?.[statKey] ?? 5;
    const adjustProfileStat = (key, delta) => {
      setEditingPlayer((prev) => {
        if (!prev) return null;
        const currentVal = prev[key] || 5;
        const newVal = Math.max(1, Math.min(10, currentVal + delta));
        return { ...prev, [key]: newVal };
      });
    };

    return (
      <View style={styles.statCounterRow} key={statKey}>
        <Text style={styles.statCounterLabel}>{label}:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <TouchableOpacity style={styles.counterBtn} onPress={() => adjustProfileStat(statKey, -1)}>
            <Text style={styles.counterBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.statValueText}>{val}/10</Text>
          <TouchableOpacity style={styles.counterBtn} onPress={() => adjustProfileStat(statKey, 1)}>
            <Text style={styles.counterBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlayFull}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setEditingPlayer(null)} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
          pointerEvents="box-none"
        >
          <View style={[styles.modalBoxFull, { maxHeight: '85%', flexShrink: 1 }]}>
            <ScrollView style={{ flexGrow: 0 }} showsVerticalScrollIndicator={true} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Full Player Profile</Text>

              <Text style={styles.inputLabel}>Name & Jersey #:</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={editingPlayer?.name || ''}
                  onChangeText={(val) => setEditingPlayer((prev) => (prev ? { ...prev, name: val } : null))}
                />
                <TextInput
                  style={[styles.input, { width: 60, textAlign: 'center' }]}
                  keyboardType="numeric"
                  value={editingPlayer?.squad_number ? String(editingPlayer.squad_number) : ''}
                  onChangeText={(val) => setEditingPlayer((prev) => (prev ? { ...prev, squad_number: val } : null))}
                />
              </View>

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Dominant Foot (Left to Right):</Text>
              <View style={styles.footednessContainer}>
                <Text style={styles.footLabel}>L</Text>
                {[1, 2, 3, 4, 5].map((val) => (
                  <TouchableOpacity
                    key={val}
                    onPress={() => setEditingPlayer((prev) => (prev ? { ...prev, footedness: val } : null))}
                    style={[styles.footDot, editingPlayer?.footedness === val && styles.footDotActive]}
                  />
                ))}
                <Text style={styles.footLabel}>R</Text>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 15, color: '#39FF14' }]}>
                Primary Position (Coach Assigned):
              </Text>
              <View style={styles.positionGrid}>
                {(profilePositions || []).map((pos) => (
                  <TouchableOpacity
                    key={pos}
                    style={[styles.gridBtn, editingPlayer?.position === pos && { backgroundColor: '#39FF14' }]}
                    onPress={() => setEditingPlayer((prev) => (prev ? { ...prev, position: pos } : null))}
                  >
                    <Text style={[styles.gridBtnText, editingPlayer?.position === pos && { color: '#0B0E14' }]}>
                      {pos}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: '#3b82f6' }]}>Secondary Position (Coach Assigned):</Text>
              <View style={styles.positionGrid}>
                {(profileSecondaryPositions || []).map((pos) => (
                  <TouchableOpacity
                    key={pos}
                    style={[styles.gridBtn, editingPlayer?.secondary_position === pos && { backgroundColor: '#3b82f6' }]}
                    onPress={() => setEditingPlayer((prev) => (prev ? { ...prev, secondary_position: pos } : null))}
                  >
                    <Text style={styles.gridBtnText}>{pos}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionHeaderModal}>Physical Attributes</Text>
              {getPosCategory(editingPlayer?.position) !== 'GK' && render1to10Row('Sprint Speed', 'phys_sprint')}
              {getPosCategory(editingPlayer?.position) !== 'GK' && render1to10Row('Acceleration', 'phys_accel')}
              {getPosCategory(editingPlayer?.position) !== 'GK' && render1to10Row('Stamina', 'phys_stamina')}
              {render1to10Row('Strength', 'phys_strength')}
              {render1to10Row('Agility & Balance', 'phys_agility')}

              <Text style={styles.sectionHeaderModal}>Technical Abilities</Text>
              {render1to10Row('First Touch', 'tech_first_touch')}
              {render1to10Row('Short Pass', 'tech_short_pass')}

              {getPosCategory(editingPlayer?.position) === 'GK' ? (
                <>
                  {render1to10Row('Shot Stopping', 'gk_shot_stopping')}
                  {render1to10Row('Handling / Catching', 'gk_handling')}
                  {render1to10Row('1v1 / Rushing', 'gk_1v1')}
                  {render1to10Row('Aerial Command', 'gk_aerial')}
                  {render1to10Row('Sweeping', 'gk_sweeping')}
                  {render1to10Row('Distribution', 'gk_distribution')}
                </>
              ) : (
                <>
                  {render1to10Row('Dribbling', 'tech_dribbling')}
                  {render1to10Row('Long Pass', 'tech_long_pass')}
                  {render1to10Row('Shooting Accuracy', 'tech_shooting_acc')}
                  {render1to10Row('Shooting Power', 'tech_shooting_pow')}
                  {render1to10Row('Crossing', 'tech_crossing')}
                  {render1to10Row('Tackling', 'tech_tackling')}
                  {render1to10Row('Interceptions', 'tech_intercept')}
                  {render1to10Row('Heading / Aerial', 'tech_aerial')}
                  {render1to10Row('Attacking Position', 'tech_positioning')}
                </>
              )}

              <Text style={styles.sectionHeaderModal}>Tactical & Psychological</Text>
              {getPosCategory(editingPlayer?.position) !== 'GK' && render1to10Row('Awareness of Space', 'tact_awareness')}
              {getPosCategory(editingPlayer?.position) !== 'GK' && render1to10Row('Pressing Intelligence', 'tact_pressing')}
              {getPosCategory(editingPlayer?.position) !== 'GK' && render1to10Row('Follow Instructions', 'tact_instructions')}
              {getPosCategory(editingPlayer?.position) !== 'GK' && render1to10Row('Workrate', 'psych_workrate')}

              {render1to10Row('Decision Making', 'tact_decision')}
              {render1to10Row('Confidence Level', 'psych_confidence')}
              {render1to10Row('Leadership', 'psych_leadership')}
              {render1to10Row('Composure', 'psych_composure')}

              <Text style={styles.sectionHeaderModal}>Observations</Text>
              <Text style={styles.inputLabel}>Weaknesses to Improve:</Text>
              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                multiline
                value={editingPlayer?.notes_weaknesses || ''}
                onChangeText={(val) => setEditingPlayer((prev) => (prev ? { ...prev, notes_weaknesses: val } : null))}
              />

              <Text style={styles.inputLabel}>Communication (Notes):</Text>
              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                multiline
                value={editingPlayer?.notes_communication || ''}
                onChangeText={(val) => setEditingPlayer((prev) => (prev ? { ...prev, notes_communication: val } : null))}
              />

              <Text style={styles.inputLabel}>Generic Notes:</Text>
              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                multiline
                value={editingPlayer?.coach_development_notes || ''}
                onChangeText={(val) =>
                  setEditingPlayer((prev) => (prev ? { ...prev, coach_development_notes: val } : null))
                }
              />

              {profile?.role === 'coach' && appMode === 'coach' ? (
                <>
                  <Text style={styles.sectionHeaderModal}>Coach-Only Analytics</Text>
                  <Text style={[styles.inputLabel, { color: '#39FF14' }]}>Total Match Minutes Played:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(editingPlayer?.total_minutes_played || 0)}
                    onChangeText={(val) =>
                      setEditingPlayer((prev) => (prev ? { ...prev, total_minutes_played: parseInt(val) || 0 } : null))
                    }
                  />
                </>
              ) : null}

              <TouchableOpacity style={styles.primaryAuthBtn} onPress={updateFullPlayerProfile}>
                <Text style={styles.primaryAuthBtnText}>Save Profile Updates</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.benchBtn}
                onPress={() => {
                  assignPlayerRole(editingPlayer, 'Bench', false);
                  setEditingPlayer(null);
                }}
              >
                <Text style={styles.benchBtnText}>🔄 Drop to Bench</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteBtn, { marginTop: 15, marginBottom: 30 }]}
                onPress={() => initiateDeletePlayer(editingPlayer)}
              >
                <Text style={styles.deleteBtnText}>🗑️ Delete Player</Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
            <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={() => setEditingPlayer(null)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlayFull: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalBoxFull: { backgroundColor: '#1A1F26', width: '92%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#2E3A44', zIndex: 5 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  inputLabel: { color: '#94a3b8', fontWeight: 'bold', marginBottom: 6, fontSize: 12 },
  input: { backgroundColor: '#0B0E14', color: '#ffffff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#2E3A44' },
  footednessContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 15, marginVertical: 10, padding: 10, backgroundColor: '#0B0E14', borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44' },
  footLabel: { color: '#94a3b8', fontWeight: 'bold', fontSize: 12 },
  footDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#2E3A44', backgroundColor: '#1A1F26' },
  footDotActive: { borderColor: '#39FF14', backgroundColor: '#39FF14' },
  positionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 6, marginBottom: 15 },
  gridBtn: { backgroundColor: '#0B0E14', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, minWidth: '22%', alignItems: 'center', borderWidth: 1, borderColor: '#2E3A44' },
  gridBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 11 },
  sectionHeaderModal: { color: '#39FF14', fontSize: 13, fontWeight: 'bold', marginTop: 10, marginBottom: 10, textTransform: 'uppercase', alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#2E3A44', paddingBottom: 4, width: '100%' },
  statCounterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#2E3A44', width: '100%' },
  statCounterLabel: { color: '#cbd5e1', fontWeight: 'bold', fontSize: 13 },
  counterBtn: { backgroundColor: '#2E3A44', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#64748b' },
  counterBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
  statValueText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14, minWidth: 40, textAlign: 'center' },
  primaryAuthBtn: { backgroundColor: '#39FF14', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  primaryAuthBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 15 },
  benchBtn: { backgroundColor: '#ca8a04', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10, marginTop: 25, width: '100%' },
  benchBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  deleteBtn: { backgroundColor: '#7f1d1d', padding: 12, borderRadius: 8, alignItems: 'center', width: '100%' },
  deleteBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94a3b8', fontSize: 14 },
});