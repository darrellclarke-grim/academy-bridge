import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  curriculum52Weeks
} from '../constants/curriculumData52';
import { supabase } from '../supabase';

export default function CustomTrainingScreen({
  activeTeamId,
  openDrillVideo
}) {
  // Session builder state: S1, S2, S3 selections
  const [selectedS1, setSelectedS1] = useState(null);
  const [selectedS2, setSelectedS2] = useState(null);
  const [selectedS3, setSelectedS3] = useState(null);

  // Picker modal state
  const [activePickerSlot, setActivePickerSlot] = useState(null); // 's1' | 's2' | 's3' | null
  const [expandedRpeSection, setExpandedRpeSection] = useState('moderate'); // 'easy' | 'moderate' | 'challenging' | 'hard'

  // Custom Vault Drills stored in Supabase
  const [customVaultDrills, setCustomVaultDrills] = useState([]);
  const [isAddDrillModalOpen, setIsAddDrillModalOpen] = useState(false);
  const [isSavingDrill, setIsSavingDrill] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRpeVal, setNewRpeVal] = useState(6);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    if (activeTeamId) {
      fetchCustomVaultDrills();
    }
  }, [activeTeamId]);

  const fetchCustomVaultDrills = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_drills')
        .select('*')
        .eq('team_id', activeTeamId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map(item => ({
          id: item.id,
          title: `[Vault] ${item.title}`,
          rpe: item.rpe_label || `RPE ${item.rpe_val}`,
          rpeVal: item.rpe_val,
          text: item.description,
          videoUrl: item.video_url
        }));
        setCustomVaultDrills(mapped);
      }
    } catch (err) {
      console.error('❌ Error fetching custom drills:', err);
    }
  };

  // Compile 156 drills from 52-week curriculum
  const curriculumDrills = Object.keys(curriculum52Weeks).flatMap(weekNum => {
    const wData = curriculum52Weeks[weekNum];
    return [
      { id: `w${weekNum}-s1`, title: `Week ${weekNum}: ${wData.theme} (S1)`, rpe: wData.s1.rpe, rpeVal: wData.s1.rpeVal, text: wData.s1.text },
      { id: `w${weekNum}-s2`, title: `Week ${weekNum}: ${wData.theme} (S2)`, rpe: wData.s2.rpe, rpeVal: wData.s2.rpeVal, text: wData.s2.text },
      { id: `w${weekNum}-s3`, title: `Week ${weekNum}: ${wData.theme} (S3)`, rpe: wData.s3.rpe, rpeVal: wData.s3.rpeVal, text: wData.s3.text },
    ];
  });

  const allDrills = [...customVaultDrills, ...curriculumDrills];

  // Group drills by RPE categories (No massive list!)
  const groupedDrills = {
    easy: allDrills.filter(d => d.rpeVal <= 3),
    moderate: allDrills.filter(d => d.rpeVal >= 4 && d.rpeVal <= 5),
    challenging: allDrills.filter(d => d.rpeVal >= 6 && d.rpeVal <= 7),
    hard: allDrills.filter(d => d.rpeVal >= 8)
  };

  const assignDrillToSlot = (drill) => {
    if (activePickerSlot === 's1') setSelectedS1(drill);
    if (activePickerSlot === 's2') setSelectedS2(drill);
    if (activePickerSlot === 's3') setSelectedS3(drill);
    setActivePickerSlot(null);
  };

  const handleCreateCustomDrill = async () => {
    if (!activeTeamId) {
      Alert.alert('Error', 'No active team selected.');
      return;
    }

    if (!newTitle.trim() || !newDesc.trim()) {
      Alert.alert('Input Error', 'Please provide a drill title and description.');
      return;
    }

    setIsSavingDrill(true);

    const rpeLabel = newRpeVal <= 3 
      ? `RPE ${newRpeVal} Easy` 
      : newRpeVal <= 5 
      ? `RPE ${newRpeVal} Light/Mod` 
      : newRpeVal <= 7 
      ? `RPE ${newRpeVal} Challenging` 
      : `RPE ${newRpeVal}+ Hard`;

    const payload = {
      team_id: activeTeamId,
      title: newTitle.trim(),
      description: newDesc.trim(),
      rpe_val: newRpeVal,
      rpe_label: rpeLabel,
      video_url: newVideoUrl.trim() || null
    };

    try {
      const { data, error } = await supabase.from('custom_drills').insert([payload]).select();

      if (error) throw error;

      if (data && data.length > 0) {
        const addedItem = {
          id: data[0].id,
          title: `[Vault] ${data[0].title}`,
          rpe: rpeLabel,
          rpeVal: data[0].rpe_val,
          text: data[0].description,
          videoUrl: data[0].video_url
        };
        setCustomVaultDrills([addedItem, ...customVaultDrills]);
      }

      setIsAddDrillModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewVideoUrl('');
      setNewRpeVal(6);
      Alert.alert('Drill Created!', 'Custom drill added to your private Vault catalog.');
    } catch (err) {
      Alert.alert('Save Error', err.message);
    } finally {
      setIsSavingDrill(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>SESSION BUILDER & DRILL VAULT</Text>
          <Text style={styles.headerTitle}>Custom Training Planner</Text>
        </View>
        <TouchableOpacity style={styles.addDrillBtn} onPress={() => setIsAddDrillModalOpen(true)}>
          <Text style={styles.addDrillBtnText}>➕ Add Drill</Text>
        </TouchableOpacity>
      </View>

      {/* 1. BEFORE EVERY SESSION (SCREENSHOT 1 GRAPHIC) */}
      <View style={styles.warmupCard}>
        <Text style={styles.warmupTitle}>BEFORE EVERY SESSION</Text>
        <Text style={styles.warmupSub}>A repeatable 10-minute warm-up to prepare your joints, movement and ball contact.</Text>

        <View style={styles.timelineRow}>
          <View style={styles.timeCircle}><Text style={styles.timeCircleText}>MIN 1-2</Text></View>
          <Text style={styles.timelineDesc}>Jog, skip, shuffle and move backward.</Text>
        </View>

        <View style={styles.timelineRow}>
          <View style={styles.timeCircle}><Text style={styles.timeCircleText}>MIN 3-4</Text></View>
          <Text style={styles.timelineDesc}>Complete ankle rocks, hip openings and controlled leg swings.</Text>
        </View>

        <View style={styles.timelineRow}>
          <View style={styles.timeCircle}><Text style={styles.timeCircleText}>MIN 5-7</Text></View>
          <Text style={styles.timelineDesc}>Complete calf raises, split squats and glute bridges.</Text>
        </View>

        <View style={styles.timelineRow}>
          <View style={styles.timeCircle}><Text style={styles.timeCircleText}>MIN 8-10</Text></View>
          <Text style={styles.timelineDesc}>Add close ball touches and three progressive runs.</Text>
        </View>

        {/* ONE STRENGTH ROUND */}
        <View style={styles.strengthBox}>
          <Text style={styles.strengthHeader}>ONE STRENGTH ROUND</Text>
          <Text style={styles.strengthBullet}>• 8 split squats per side</Text>
          <Text style={styles.strengthBullet}>• 10 glute bridges or hip hinges</Text>
          <Text style={styles.strengthBullet}>• 12 calf raises</Text>
          <Text style={styles.strengthBullet}>• 20-second side plank per side</Text>
          <Text style={styles.strengthNote}>Control every repetition. Stop when you still have two good repetitions left.</Text>
        </View>
      </View>

      {/* 2. ASSEMBLE CUSTOM SESSION (S1 / S2 / S3) */}
      <Text style={styles.sectionTitle}>Assemble Custom Session:</Text>
      <View style={styles.card}>
        {/* SLOT S1 */}
        <TouchableOpacity style={styles.slotRow} onPress={() => setActivePickerSlot('s1')}>
          <Text style={styles.slotLabel}>Session 1 (S1):</Text>
          <Text style={styles.selectBtnText}>{selectedS1 ? 'Change Drill' : 'Select Drill ➕'}</Text>
        </TouchableOpacity>
        {selectedS1 && (
          <View style={styles.selectedDrillBox}>
            <Text style={styles.drillName}>{selectedS1.title} ({selectedS1.rpe})</Text>
            <Text style={styles.drillDesc}>{selectedS1.text}</Text>
          </View>
        )}

        {/* SLOT S2 */}
        <TouchableOpacity style={styles.slotRow} onPress={() => setActivePickerSlot('s2')}>
          <Text style={styles.slotLabel}>Session 2 (S2):</Text>
          <Text style={styles.selectBtnText}>{selectedS2 ? 'Change Drill' : 'Select Drill ➕'}</Text>
        </TouchableOpacity>
        {selectedS2 && (
          <View style={styles.selectedDrillBox}>
            <Text style={styles.drillName}>{selectedS2.title} ({selectedS2.rpe})</Text>
            <Text style={styles.drillDesc}>{selectedS2.text}</Text>
          </View>
        )}

        {/* SLOT S3 */}
        <TouchableOpacity style={styles.slotRow} onPress={() => setActivePickerSlot('s3')}>
          <Text style={styles.slotLabel}>Session 3 (S3):</Text>
          <Text style={styles.selectBtnText}>{selectedS3 ? 'Change Drill' : 'Select Drill ➕'}</Text>
        </TouchableOpacity>
        {selectedS3 && (
          <View style={styles.selectedDrillBox}>
            <Text style={styles.drillName}>{selectedS3.title} ({selectedS3.rpe})</Text>
            <Text style={styles.drillDesc}>{selectedS3.text}</Text>
          </View>
        )}
      </View>

      <View style={{ height: 30 }} />

      {/* RPE GROUPED DRILL PICKER MODAL */}
      <Modal visible={!!activePickerSlot} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: '85%' }]}>
            <Text style={styles.modalTitle}>
              Select Drill for {activePickerSlot === 's1' ? 'Session 1 (S1)' : activePickerSlot === 's2' ? 'Session 2 (S2)' : 'Session 3 (S3)'}
            </Text>
            <Text style={styles.modalSub}>All drills are grouped by Exertion Level (RPE):</Text>

            <ScrollView style={{ width: '100%' }}>
              {/* GROUP 1: RPE 2-3 EASY */}
              <TouchableOpacity
                style={[styles.rpeGroupHeader, { borderColor: '#22c55e' }]}
                onPress={() => setExpandedRpeSection(expandedRpeSection === 'easy' ? null : 'easy')}
              >
                <Text style={[styles.rpeGroupTitle, { color: '#22c55e' }]}>🟢 RPE 2-3 (Very Easy)</Text>
                <Text style={{ color: '#22c55e', fontWeight: 'bold' }}>{groupedDrills.easy.length} Drills {expandedRpeSection === 'easy' ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {expandedRpeSection === 'easy' && groupedDrills.easy.map(item => (
                <TouchableOpacity key={item.id} style={styles.drillPickerRow} onPress={() => assignDrillToSlot(item)}>
                  <Text style={styles.pickerDrillTitle}>{item.title}</Text>
                  <Text style={styles.pickerDrillText}>{item.text}</Text>
                </TouchableOpacity>
              ))}

              {/* GROUP 2: RPE 4-5 LIGHT / MODERATE */}
              <TouchableOpacity
                style={[styles.rpeGroupHeader, { borderColor: '#3b82f6', marginTop: 10 }]}
                onPress={() => setExpandedRpeSection(expandedRpeSection === 'moderate' ? null : 'moderate')}
              >
                <Text style={[styles.rpeGroupTitle, { color: '#3b82f6' }]}>🔵 RPE 4-5 (Light / Moderate)</Text>
                <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>{groupedDrills.moderate.length} Drills {expandedRpeSection === 'moderate' ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {expandedRpeSection === 'moderate' && groupedDrills.moderate.map(item => (
                <TouchableOpacity key={item.id} style={styles.drillPickerRow} onPress={() => assignDrillToSlot(item)}>
                  <Text style={styles.pickerDrillTitle}>{item.title}</Text>
                  <Text style={styles.pickerDrillText}>{item.text}</Text>
                </TouchableOpacity>
              ))}

              {/* GROUP 3: RPE 6-7 CHALLENGING */}
              <TouchableOpacity
                style={[styles.rpeGroupHeader, { borderColor: '#eab308', marginTop: 10 }]}
                onPress={() => setExpandedRpeSection(expandedRpeSection === 'challenging' ? null : 'challenging')}
              >
                <Text style={[styles.rpeGroupTitle, { color: '#eab308' }]}>🟡 RPE 6-7 (Challenging)</Text>
                <Text style={{ color: '#eab308', fontWeight: 'bold' }}>{groupedDrills.challenging.length} Drills {expandedRpeSection === 'challenging' ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {expandedRpeSection === 'challenging' && groupedDrills.challenging.map(item => (
                <TouchableOpacity key={item.id} style={styles.drillPickerRow} onPress={() => assignDrillToSlot(item)}>
                  <Text style={styles.pickerDrillTitle}>{item.title}</Text>
                  <Text style={styles.pickerDrillText}>{item.text}</Text>
                </TouchableOpacity>
              ))}

              {/* GROUP 4: RPE 8+ HARD WORK */}
              <TouchableOpacity
                style={[styles.rpeGroupHeader, { borderColor: '#ef4444', marginTop: 10 }]}
                onPress={() => setExpandedRpeSection(expandedRpeSection === 'hard' ? null : 'hard')}
              >
                <Text style={[styles.rpeGroupTitle, { color: '#ef4444' }]}>🔴 RPE 8+ (Hard Work)</Text>
                <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>{groupedDrills.hard.length} Drills {expandedRpeSection === 'hard' ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {expandedRpeSection === 'hard' && groupedDrills.hard.map(item => (
                <TouchableOpacity key={item.id} style={styles.drillPickerRow} onPress={() => assignDrillToSlot(item)}>
                  <Text style={styles.pickerDrillTitle}>{item.title}</Text>
                  <Text style={styles.pickerDrillText}>{item.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setActivePickerSlot(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ADD DRILL MODAL */}
      <Modal visible={isAddDrillModalOpen} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Custom Drill to Vault</Text>

            <Text style={styles.inputLabel}>Drill Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3v2 Overload Counter"
              placeholderTextColor="#64748b"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.inputLabel}>Exertion Rating (RPE 1-10):</Text>
            <View style={styles.rpeSelectorRow}>
              {[2, 4, 6, 8].map(val => (
                <TouchableOpacity
                  key={val}
                  style={[styles.rpePill, newRpeVal === val && styles.rpePillActive]}
                  onPress={() => setNewRpeVal(val)}
                >
                  <Text style={[styles.rpePillText, newRpeVal === val && styles.rpePillTextActive]}>
                    RPE {val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>YouTube Video URL (Optional):</Text>
            <TextInput
              style={styles.input}
              placeholder="https://youtu.be/..."
              placeholderTextColor="#64748b"
              value={newVideoUrl}
              onChangeText={setNewVideoUrl}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Setup & Tactical Objectives:</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Drill instructions, grid size, rules..."
              placeholderTextColor="#64748b"
              multiline
              value={newDesc}
              onChangeText={setNewDesc}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateCustomDrill} disabled={isSavingDrill}>
              {isSavingDrill ? (
                <ActivityIndicator size="small" color="#0B0E14" />
              ) : (
                <Text style={styles.primaryBtnText}>Save Custom Drill</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddDrillModalOpen(false)} disabled={isSavingDrill}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14', padding: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerSub: { color: '#39FF14', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  addDrillBtn: { backgroundColor: '#39FF14', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addDrillBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 12 },

  warmupCard: { backgroundColor: '#1A1F26', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#2E3A44', marginBottom: 15 },
  warmupTitle: { color: '#39FF14', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  warmupSub: { color: '#cbd5e1', fontSize: 12, marginBottom: 12, lineHeight: 16 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  timeCircle: { backgroundColor: '#39FF14', width: 65, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  timeCircleText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 10 },
  timelineDesc: { color: '#ffffff', fontSize: 12, flex: 1 },

  strengthBox: { backgroundColor: '#ffffff', padding: 12, borderRadius: 8, marginTop: 8 },
  strengthHeader: { color: '#0B0E14', fontWeight: 'bold', fontSize: 13, marginBottom: 6 },
  strengthBullet: { color: '#0B0E14', fontSize: 12, marginBottom: 3 },
  strengthNote: { color: '#64748b', fontSize: 10, fontWeight: 'bold', marginTop: 6 },

  sectionTitle: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 },
  card: { backgroundColor: '#1A1F26', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2E3A44', marginBottom: 15 },
  slotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  slotLabel: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  selectBtnText: { color: '#39FF14', fontSize: 12, fontWeight: 'bold' },

  selectedDrillBox: { backgroundColor: '#0B0E14', padding: 10, borderRadius: 8, marginTop: 8, marginBottom: 8, borderWidth: 1, borderColor: '#39FF14' },
  drillName: { color: '#39FF14', fontSize: 13, fontWeight: 'bold' },
  drillDesc: { color: '#cbd5e1', fontSize: 12, marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: '#1A1F26', width: '92%', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#2E3A44' },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  modalSub: { color: '#94a3b8', fontSize: 12, marginBottom: 12, textAlign: 'center' },

  rpeGroupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, borderWidth: 1 },
  rpeGroupTitle: { fontWeight: 'bold', fontSize: 13 },
  drillPickerRow: { backgroundColor: '#0B0E14', padding: 10, borderRadius: 6, marginTop: 6, borderWidth: 1, borderColor: '#2E3A44' },
  pickerDrillTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 12 },
  pickerDrillText: { color: '#cbd5e1', fontSize: 11, marginTop: 2 },

  inputLabel: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  input: { backgroundColor: '#0B0E14', color: '#ffffff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44', marginBottom: 12 },

  rpeSelectorRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  rpePill: { flex: 1, backgroundColor: '#0B0E14', paddingVertical: 8, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#2E3A44' },
  rpePillActive: { backgroundColor: '#39FF14', borderColor: '#39FF14' },
  rpePillText: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
  rpePillTextActive: { color: '#0B0E14' },

  primaryBtn: { backgroundColor: '#39FF14', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  primaryBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { padding: 10, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' }
});