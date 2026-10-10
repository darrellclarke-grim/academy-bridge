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
import { curriculum52Weeks } from '../constants/curriculumData52';
import { supabase } from '../supabase';

export default function CustomTrainingScreen({
  activeTeamId,
  openDrillVideo
}) {
  // Session builder state: S1, S2, S3 selections
  const [selectedS1, setSelectedS1] = useState(null);
  const [selectedS2, setSelectedS2] = useState(null);
  const [selectedS3, setSelectedS3] = useState(null);

  // Saved Plans state
  const [savedPlans, setSavedPlans] = useState([]);
  const [isSavePlanModalOpen, setIsSavePlanModalOpen] = useState(false);
  const [isLoadPlanModalOpen, setIsLoadPlanModalOpen] = useState(false);
  const [planNameInput, setPlanNameInput] = useState('');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

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
      fetchSavedPlans();
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
          slot: 'all',
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

  const fetchSavedPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_training_plans')
        .select('*')
        .eq('team_id', activeTeamId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSavedPlans(data);
      }
    } catch (err) {
      console.error('❌ Error fetching saved training plans:', err);
    }
  };

  const handleSavePlan = async () => {
    if (!planNameInput.trim()) {
      Alert.alert('Missing Name', 'Please give your training plan a name.');
      return;
    }

    if (!selectedS1 && !selectedS2 && !selectedS3) {
      Alert.alert('Empty Session', 'Select at least one drill before saving a plan.');
      return;
    }

    setIsSavingPlan(true);
    try {
      const payload = {
        team_id: activeTeamId,
        plan_name: planNameInput.trim(),
        s1_drill: selectedS1,
        s2_drill: selectedS2,
        s3_drill: selectedS3
      };

      const { data, error } = await supabase
        .from('custom_training_plans')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setSavedPlans([data[0], ...savedPlans]);
      }

      setIsSavePlanModalOpen(false);
      setPlanNameInput('');
      Alert.alert('Plan Saved!', `"${payload.plan_name}" saved to your team plans.`);
    } catch (err) {
      Alert.alert('Save Error', err.message);
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleLoadPlan = (plan) => {
    setSelectedS1(plan.s1_drill || null);
    setSelectedS2(plan.s2_drill || null);
    setSelectedS3(plan.s3_drill || null);
    setIsLoadPlanModalOpen(false);
    Alert.alert('Plan Loaded', `Loaded "${plan.plan_name}" onto the session board.`);
  };

  const handleDeletePlan = async (planId) => {
    try {
      const { error } = await supabase.from('custom_training_plans').delete().eq('id', planId);
      if (error) throw error;
      setSavedPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      Alert.alert('Delete Error', err.message);
    }
  };

  // Compile 156 drills from 52-week curriculum
  const curriculumDrills = Object.keys(curriculum52Weeks).flatMap(weekNum => {
    const wData = curriculum52Weeks[weekNum];
    return [
      { id: `w${weekNum}-s1`, slot: 's1', title: `Week ${weekNum}: ${wData.theme} (S1)`, rpe: wData.s1.rpe, rpeVal: wData.s1.rpeVal, text: wData.s1.text },
      { id: `w${weekNum}-s2`, slot: 's2', title: `Week ${weekNum}: ${wData.theme} (S2)`, rpe: wData.s2.rpe, rpeVal: wData.s2.rpeVal, text: wData.s2.text },
      { id: `w${weekNum}-s3`, slot: 's3', title: `Week ${weekNum}: ${wData.theme} (S3)`, rpe: wData.s3.rpe, rpeVal: wData.s3.rpeVal, text: wData.s3.text },
    ];
  });

  const slotFilteredDrills = [...customVaultDrills, ...curriculumDrills].filter(drill => {
    if (!activePickerSlot) return true;
    if (drill.slot === 'all') return true;
    return drill.slot === activePickerSlot;
  });

  const groupedDrills = {
    easy: slotFilteredDrills.filter(d => d.rpeVal <= 3),
    moderate: slotFilteredDrills.filter(d => d.rpeVal >= 4 && d.rpeVal <= 5),
    challenging: slotFilteredDrills.filter(d => d.rpeVal >= 6 && d.rpeVal <= 7),
    hard: slotFilteredDrills.filter(d => d.rpeVal >= 8)
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
          slot: 'all',
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

      {/* 1. BEFORE EVERY SESSION */}
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
        <View style={{ backgroundColor: '#ffffff', padding: 15, borderRadius: 10, marginTop: 10 }}>
          <Text style={{ color: '#0B0E14', fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>
            ONE STRENGTH ROUND
          </Text>

          <View style={styles.exerciseRow}>
            <Text style={styles.exerciseText}>8 split squats per side</Text>
            <TouchableOpacity style={styles.formBtnPill} onPress={() => openDrillVideo && openDrillVideo('https://youtu.be/hXpGSa5HYqY?si=lMHSiLsWsQtrAZgu')}>
              <Text style={styles.formBtnPillText}>📹 Form</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.exerciseRowMulti}>
            <Text style={styles.exerciseText}>10 glute bridges or hip hinges</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              <TouchableOpacity style={styles.formBtnPill} onPress={() => openDrillVideo && openDrillVideo('https://youtube.com/shorts/voaUxW5QXAI?si=LEExwnGfP6nF6stS')}>
                <Text style={styles.formBtnPillText}>📹 Glute Bridge</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formBtnPill} onPress={() => openDrillVideo && openDrillVideo('https://youtube.com/shorts/ndw0uUc2UUk?si=RQqQS5eRMohIbiDl')}>
                <Text style={styles.formBtnPillText}>📹 Hip Hinge</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.exerciseRow}>
            <Text style={styles.exerciseText}>12 calf raises</Text>
            <TouchableOpacity style={styles.formBtnPill} onPress={() => openDrillVideo && openDrillVideo('https://youtube.com/shorts/haHcBAd637E?si=lOR9t3siYwTkRI_g')}>
              <Text style={styles.formBtnPillText}>📹 Form</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.exerciseRow}>
            <Text style={styles.exerciseText}>20-second side plank per side</Text>
            <TouchableOpacity style={styles.formBtnPill} onPress={() => openDrillVideo && openDrillVideo('https://youtube.com/shorts/BtM0a9x1F5o?si=6y0esyL3X2htSplP')}>
              <Text style={styles.formBtnPillText}>📹 Form</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: '#64748b', fontSize: 12, lineHeight: 16, marginTop: 10 }}>
            Control every repetition. Stop when you still have two good repetitions left.
          </Text>
        </View>
      </View>

      {/* 2. ASSEMBLE CUSTOM SESSION (S1 / S2 / S3) */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={styles.sectionTitle}>Assemble Custom Session:</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.planActionBtn} onPress={() => setIsLoadPlanModalOpen(true)}>
            <Text style={styles.planActionBtnText}>📂 Load Plan ({savedPlans.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.planActionBtn, { backgroundColor: '#39FF14' }]} onPress={() => setIsSavePlanModalOpen(true)}>
            <Text style={[styles.planActionBtnText, { color: '#0B0E14' }]}>💾 Save Plan</Text>
          </TouchableOpacity>
        </View>
      </View>

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

      {/* SAVE PLAN MODAL */}
      <Modal visible={isSavePlanModalOpen} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Save Assembled Plan</Text>
            <Text style={styles.inputLabel}>Plan Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Midfield Overload Session"
              placeholderTextColor="#64748b"
              value={planNameInput}
              onChangeText={setPlanNameInput}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSavePlan} disabled={isSavingPlan}>
              {isSavingPlan ? (
                <ActivityIndicator size="small" color="#0B0E14" />
              ) : (
                <Text style={styles.primaryBtnText}>Save Plan to Database</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsSavePlanModalOpen(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* LOAD PLAN MODAL */}
      <Modal visible={isLoadPlanModalOpen} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: '80%' }]}>
            <Text style={styles.modalTitle}>Load Saved Plan</Text>
            <ScrollView style={{ width: '100%', marginTop: 10 }}>
              {savedPlans.length === 0 ? (
                <Text style={styles.emptyGroupText}>No saved plans found for this team.</Text>
              ) : (
                savedPlans.map(plan => (
                  <View key={plan.id} style={styles.savedPlanRow}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => handleLoadPlan(plan)}>
                      <Text style={styles.savedPlanTitle}>{plan.plan_name}</Text>
                      <Text style={styles.savedPlanSub}>
                        Drills: {[plan.s1_drill?.title, plan.s2_drill?.title, plan.s3_drill?.title].filter(Boolean).join(' • ') || 'Empty'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeletePlan(plan.id)} style={styles.deletePlanBtn}>
                      <Text style={{ color: '#ef4444', fontSize: 12 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsLoadPlanModalOpen(false)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* RPE GROUPED DRILL PICKER MODAL */}
      <Modal visible={!!activePickerSlot} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: '85%' }]}>
            <Text style={styles.modalTitle}>
              Select {activePickerSlot ? activePickerSlot.toUpperCase() : ''} Drill
            </Text>
            <Text style={styles.modalSub}>
              Showing only {activePickerSlot ? activePickerSlot.toUpperCase() : ''} drills grouped by Exertion Level (RPE):
            </Text>

            <ScrollView style={{ width: '100%' }}>
              <TouchableOpacity
                style={[styles.rpeGroupHeader, { borderColor: '#22c55e' }]}
                onPress={() => setExpandedRpeSection(expandedRpeSection === 'easy' ? null : 'easy')}
              >
                <Text style={[styles.rpeGroupTitle, { color: '#22c55e' }]}>🟢 RPE 2-3 (Very Easy)</Text>
                <Text style={{ color: '#22c55e', fontWeight: 'bold' }}>{groupedDrills.easy.length} Drills {expandedRpeSection === 'easy' ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {expandedRpeSection === 'easy' && (
                groupedDrills.easy.length > 0 ? (
                  groupedDrills.easy.map(item => (
                    <TouchableOpacity key={item.id} style={styles.drillPickerRow} onPress={() => assignDrillToSlot(item)}>
                      <Text style={styles.pickerDrillTitle}>{item.title}</Text>
                      <Text style={styles.pickerDrillText}>{item.text}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyGroupText}>No {activePickerSlot?.toUpperCase()} drills in this RPE level.</Text>
                )
              )}

              <TouchableOpacity
                style={[styles.rpeGroupHeader, { borderColor: '#3b82f6', marginTop: 10 }]}
                onPress={() => setExpandedRpeSection(expandedRpeSection === 'moderate' ? null : 'moderate')}
              >
                <Text style={[styles.rpeGroupTitle, { color: '#3b82f6' }]}>🔵 RPE 4-5 (Light / Moderate)</Text>
                <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>{groupedDrills.moderate.length} Drills {expandedRpeSection === 'moderate' ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {expandedRpeSection === 'moderate' && (
                groupedDrills.moderate.length > 0 ? (
                  groupedDrills.moderate.map(item => (
                    <TouchableOpacity key={item.id} style={styles.drillPickerRow} onPress={() => assignDrillToSlot(item)}>
                      <Text style={styles.pickerDrillTitle}>{item.title}</Text>
                      <Text style={styles.pickerDrillText}>{item.text}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyGroupText}>No {activePickerSlot?.toUpperCase()} drills in this RPE level.</Text>
                )
              )}

              <TouchableOpacity
                style={[styles.rpeGroupHeader, { borderColor: '#eab308', marginTop: 10 }]}
                onPress={() => setExpandedRpeSection(expandedRpeSection === 'challenging' ? null : 'challenging')}
              >
                <Text style={[styles.rpeGroupTitle, { color: '#eab308' }]}>🟡 RPE 6-7 (Challenging)</Text>
                <Text style={{ color: '#eab308', fontWeight: 'bold' }}>{groupedDrills.challenging.length} Drills {expandedRpeSection === 'challenging' ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {expandedRpeSection === 'challenging' && (
                groupedDrills.challenging.length > 0 ? (
                  groupedDrills.challenging.map(item => (
                    <TouchableOpacity key={item.id} style={styles.drillPickerRow} onPress={() => assignDrillToSlot(item)}>
                      <Text style={styles.pickerDrillTitle}>{item.title}</Text>
                      <Text style={styles.pickerDrillText}>{item.text}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyGroupText}>No {activePickerSlot?.toUpperCase()} drills in this RPE level.</Text>
                )
              )}

              <TouchableOpacity
                style={[styles.rpeGroupHeader, { borderColor: '#ef4444', marginTop: 10 }]}
                onPress={() => setExpandedRpeSection(expandedRpeSection === 'hard' ? null : 'hard')}
              >
                <Text style={[styles.rpeGroupTitle, { color: '#ef4444' }]}>🔴 RPE 8+ (Hard Work)</Text>
                <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>{groupedDrills.hard.length} Drills {expandedRpeSection === 'hard' ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {expandedRpeSection === 'hard' && (
                groupedDrills.hard.length > 0 ? (
                  groupedDrills.hard.map(item => (
                    <TouchableOpacity key={item.id} style={styles.drillPickerRow} onPress={() => assignDrillToSlot(item)}>
                      <Text style={styles.pickerDrillTitle}>{item.title}</Text>
                      <Text style={styles.pickerDrillText}>{item.text}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyGroupText}>No {activePickerSlot?.toUpperCase()} drills in this RPE level.</Text>
                )
              )}
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

  exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  exerciseRowMulti: { flexDirection: 'column', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  exerciseText: { color: '#0B0E14', fontSize: 13, fontWeight: '600', flex: 1 },
  formBtnPill: { backgroundColor: '#0B0E14', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  formBtnPillText: { color: '#39FF14', fontSize: 11, fontWeight: 'bold' },

  sectionTitle: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  planActionBtn: { backgroundColor: '#0B0E14', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#2E3A44' },
  planActionBtnText: { color: '#39FF14', fontSize: 11, fontWeight: 'bold' },

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

  savedPlanRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#2E3A44' },
  savedPlanTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 13 },
  savedPlanSub: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  deletePlanBtn: { padding: 6, backgroundColor: '#1A1F26', borderRadius: 6, marginLeft: 10 },

  rpeGroupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, borderWidth: 1 },
  rpeGroupTitle: { fontWeight: 'bold', fontSize: 13 },
  drillPickerRow: { backgroundColor: '#0B0E14', padding: 10, borderRadius: 6, marginTop: 6, borderWidth: 1, borderColor: '#2E3A44' },
  pickerDrillTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 12 },
  pickerDrillText: { color: '#cbd5e1', fontSize: 11, marginTop: 2 },
  emptyGroupText: { color: '#64748b', fontSize: 11, fontStyle: 'italic', paddingVertical: 8, paddingHorizontal: 12 },

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