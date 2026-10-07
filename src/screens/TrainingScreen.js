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
  curriculum52Blocks,
  curriculum52Weeks
} from '../constants/curriculumData52';
import { supabase } from '../supabase';

export default function TrainingScreen({
  activeTeamId,
  teamSheet = [],
  trainingRegister = {},
  setTrainingRegister,
  submitTrainingSession,
  isTrainingRegisterExpanded,
  setIsTrainingRegisterExpanded,
  openDrillVideo
}) {
  const [selectedBlockId, setSelectedBlockId] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  
  // Custom video overrides fetched from Supabase
  const [customBlockVideos, setCustomBlockVideos] = useState({});
  const [editingBlockVideo, setEditingBlockVideo] = useState(null);
  const [newVideoUrlInput, setNewVideoUrlInput] = useState('');
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  useEffect(() => {
    if (activeTeamId) {
      fetchVideoOverrides();
    }
  }, [activeTeamId]);

  const fetchVideoOverrides = async () => {
    try {
      const { data, error } = await supabase
        .from('block_video_overrides')
        .select('*')
        .eq('team_id', activeTeamId);

      if (!error && data) {
        const videoMap = {};
        data.forEach(item => {
          videoMap[item.block_number] = item.video_url;
        });
        setCustomBlockVideos(videoMap);
      }
    } catch (err) {
      console.error('❌ Error fetching video overrides:', err);
    }
  };

  const activeBlock = curriculum52Blocks.find(b => b.block === selectedBlockId) || curriculum52Blocks[0];
  const activeWeekData = curriculum52Weeks[selectedWeek] || curriculum52Weeks[1];
  const activeVideoUrl = customBlockVideos[activeBlock.block] || activeBlock.videoUrl;

  const getRpeColor = (rpeStr) => {
    if (!rpeStr) return '#39FF14';
    if (rpeStr.includes('7') || rpeStr.includes('8')) return '#ef4444';
    if (rpeStr.includes('5') || rpeStr.includes('6')) return '#eab308';
    if (rpeStr.includes('4')) return '#3b82f6';
    return '#22c55e';
  };

  const selectBlock = (blockObj) => {
    setSelectedBlockId(blockObj.block);
    setSelectedWeek(blockObj.weeks[0]);
  };

  const saveCustomVideo = async () => {
    if (!activeTeamId) {
      Alert.alert('Error', 'No active team selected.');
      return;
    }

    setIsSavingVideo(true);
    const blockNum = editingBlockVideo.block;
    const cleanUrl = newVideoUrlInput.trim();

    try {
      if (!cleanUrl) {
        await supabase
          .from('block_video_overrides')
          .delete()
          .eq('team_id', activeTeamId)
          .eq('block_number', blockNum);

        const updated = { ...customBlockVideos };
        delete updated[blockNum];
        setCustomBlockVideos(updated);
        Alert.alert('Reset Complete', 'Reverted to master academy video.');
      } else {
        const { error } = await supabase
          .from('block_video_overrides')
          .upsert([{ team_id: activeTeamId, block_number: blockNum, video_url: cleanUrl }], {
            onConflict: 'team_id,block_number'
          });

        if (error) throw error;

        setCustomBlockVideos({ ...customBlockVideos, [blockNum]: cleanUrl });
        Alert.alert('Video Saved', `Custom video set for Block ${blockNum}!`);
      }
    } catch (err) {
      Alert.alert('Save Error', err.message);
    } finally {
      setIsSavingVideo(false);
      setEditingBlockVideo(null);
      setNewVideoUrlInput('');
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerSub}>52-WEEK ACADEMY PLAN</Text>
        <Text style={styles.headerTitle}>Training Center</Text>
      </View>

      {/* 1. TRAINING ATTENDANCE REGISTER (MOVED TO TOP) */}
      <View style={[styles.card, { borderColor: '#39FF14', marginBottom: 15 }]}>
        <TouchableOpacity
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          onPress={() => setIsTrainingRegisterExpanded(!isTrainingRegisterExpanded)}
        >
          <Text style={{ color: '#39FF14', fontSize: 16, fontWeight: 'bold' }}>
            📋 Log Training Attendance
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 18 }}>
            {isTrainingRegisterExpanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {isTrainingRegisterExpanded && (
          <View style={{ marginTop: 15 }}>
            {teamSheet.map(p => (
              <TouchableOpacity
                key={p.id}
                style={styles.attendanceRow}
                onPress={() => setTrainingRegister({ ...trainingRegister, [p.id]: !trainingRegister[p.id] })}
              >
                <Text style={styles.attendanceName}>#{p.squad_number || ''} {p.name}</Text>
                <Text style={[styles.attendanceStatus, trainingRegister[p.id] && { color: '#39FF14' }]}>
                  {trainingRegister[p.id] ? '✅ Present' : '❌ Absent'}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.primaryBtn} onPress={submitTrainingSession}>
              <Text style={styles.primaryBtnText}>Save Attendance Register</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* RPE LEGEND BANNER */}
      <View style={styles.rpeBanner}>
        <Text style={styles.rpeTitle}>🔥 RPE System (Rate of Perceived Exertion)</Text>
        <View style={styles.rpeLegendRow}>
          <View style={styles.rpeBadgeBox}><View style={[styles.rpeDot, { backgroundColor: '#22c55e' }]} /><Text style={styles.rpeLegendText}>RPE 2-3 Easy</Text></View>
          <View style={styles.rpeBadgeBox}><View style={[styles.rpeDot, { backgroundColor: '#3b82f6' }]} /><Text style={styles.rpeLegendText}>RPE 4-5 Light/Mod</Text></View>
          <View style={styles.rpeBadgeBox}><View style={[styles.rpeDot, { backgroundColor: '#eab308' }]} /><Text style={styles.rpeLegendText}>RPE 6-7 Challenging</Text></View>
          <View style={styles.rpeBadgeBox}><View style={[styles.rpeDot, { backgroundColor: '#ef4444' }]} /><Text style={styles.rpeLegendText}>RPE 8+ Hard Work</Text></View>
        </View>
      </View>

      {/* 2. RECORD THESE TESTS (SCREENSHOT 2 GRAPHIC) */}
      <View style={styles.testsCard}>
        <Text style={styles.testsTitle}>RECORD THESE TESTS</Text>
        <View style={styles.testGrid}>
          <View style={styles.testBox}>
            <Text style={styles.testHeader}>WALL PASSES</Text>
            <Text style={styles.testDesc}>Count controlled returns for 60 seconds per foot.</Text>
          </View>

          <View style={styles.testBox}>
            <Text style={styles.testHeader}>FIVE-CONE DRIBBLE</Text>
            <Text style={styles.testDesc}>Time a five-cone slalom. Keep spacing the same.</Text>
          </View>

          <View style={styles.testBox}>
            <Text style={styles.testHeader}>SPEED</Text>
            <Text style={styles.testDesc}>Record best of four 10-meter accelerations.</Text>
          </View>

          <View style={styles.testBox}>
            <Text style={styles.testHeader}>ACCURACY</Text>
            <Text style={styles.testDesc}>Count target hits from 20 shots or firm passes.</Text>
          </View>
        </View>

        <View style={[styles.testBox, { width: '100%', marginTop: 8 }]}>
          <Text style={styles.testHeader}>MOVEMENT QUALITY</Text>
          <Text style={styles.testDesc}>Complete 8 split squats, 12 calf raises & 20s side plank per side. Record any pain or loss of control.</Text>
        </View>

        <View style={styles.retestNoticePill}>
          <Text style={styles.retestNoticeText}>⚡ Only retest during review weeks. Use the same ball, surface, shoes, and distances each time.</Text>
        </View>
      </View>

      {/* BLOCK SELECTOR (BLOCKS 1 - 13) */}
      <Text style={styles.sectionTitle}>Select Block (1-13):</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {curriculum52Blocks.map(b => (
          <TouchableOpacity
            key={b.block}
            style={[styles.blockBtn, selectedBlockId === b.block && styles.blockBtnActive]}
            onPress={() => selectBlock(b)}
          >
            <Text style={[styles.blockBtnSub, selectedBlockId === b.block && styles.blockBtnSubActive]}>
              BLOCK {b.block < 10 ? `0${b.block}` : b.block}
            </Text>
            <Text style={[styles.blockBtnTitle, selectedBlockId === b.block && styles.blockBtnTitleActive]} numberOfLines={1}>
              {b.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* WEEKS IN CURRENT BLOCK */}
      <View style={styles.weekTabRow}>
        {activeBlock.weeks.map(w => (
          <TouchableOpacity
            key={w}
            style={[styles.weekTab, selectedWeek === w && styles.weekTabActive]}
            onPress={() => setSelectedWeek(w)}
          >
            <Text style={[styles.weekTabText, selectedWeek === w && styles.weekTabTextActive]}>
              Week {w < 10 ? `0${w}` : w}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* WEEK FOCUS CARD */}
      <View style={[styles.card, { marginBottom: 30 }]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardBlockLabel}>BLOCK {activeBlock.block} • WEEK {selectedWeek}</Text>
          <View style={styles.checkPill}>
            <Text style={styles.checkPillText}>🎯 {activeWeekData.check}</Text>
          </View>
        </View>
        <Text style={styles.weekThemeTitle}>{activeWeekData.theme}</Text>

        <View style={styles.videoActionRow}>
          <TouchableOpacity
            style={styles.watchVideoBtn}
            onPress={() => openDrillVideo && openDrillVideo(activeVideoUrl)}
          >
            <Text style={styles.watchVideoBtnText}>📹 Watch Technique Tutorial</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editVideoBtn}
            onPress={() => {
              setEditingBlockVideo(activeBlock);
              setNewVideoUrlInput(customBlockVideos[activeBlock.block] || '');
            }}
          >
            <Text style={styles.editVideoBtnText}>✏️ Edit Link</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* SESSION 1 */}
        <View style={styles.sessionBox}>
          <View style={styles.sessionHeaderRow}>
            <Text style={styles.sessionName}>SESSION 1 (S1)</Text>
            <View style={[styles.rpeBadge, { borderColor: getRpeColor(activeWeekData.s1?.rpe) }]}>
              <Text style={[styles.rpeBadgeText, { color: getRpeColor(activeWeekData.s1?.rpe) }]}>
                {activeWeekData.s1?.rpe}
              </Text>
            </View>
          </View>
          <Text style={styles.sessionDesc}>{activeWeekData.s1?.text}</Text>
        </View>

        {/* SESSION 2 */}
        <View style={styles.sessionBox}>
          <View style={styles.sessionHeaderRow}>
            <Text style={styles.sessionName}>SESSION 2 (S2)</Text>
            <View style={[styles.rpeBadge, { borderColor: getRpeColor(activeWeekData.s2?.rpe) }]}>
              <Text style={[styles.rpeBadgeText, { color: getRpeColor(activeWeekData.s2?.rpe) }]}>
                {activeWeekData.s2?.rpe}
              </Text>
            </View>
          </View>
          <Text style={styles.sessionDesc}>{activeWeekData.s2?.text}</Text>
        </View>

        {/* SESSION 3 */}
        <View style={styles.sessionBox}>
          <View style={styles.sessionHeaderRow}>
            <Text style={styles.sessionName}>SESSION 3 (S3)</Text>
            <View style={[styles.rpeBadge, { borderColor: getRpeColor(activeWeekData.s3?.rpe) }]}>
              <Text style={[styles.rpeBadgeText, { color: getRpeColor(activeWeekData.s3?.rpe) }]}>
                {activeWeekData.s3?.rpe}
              </Text>
            </View>
          </View>
          <Text style={styles.sessionDesc}>{activeWeekData.s3?.text}</Text>
        </View>
      </View>

      {/* EDIT BLOCK VIDEO MODAL */}
      <Modal visible={!!editingBlockVideo} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Custom Video Override</Text>
            <Text style={styles.modalSub}>
              Paste a custom YouTube URL for Block {editingBlockVideo?.block}: {editingBlockVideo?.title}. Leave blank to reset to default.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Paste YouTube Link (e.g. https://youtu.be/...)"
              placeholderTextColor="#64748b"
              value={newVideoUrlInput}
              onChangeText={setNewVideoUrlInput}
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={saveCustomVideo} disabled={isSavingVideo}>
              {isSavingVideo ? (
                <ActivityIndicator size="small" color="#0B0E14" />
              ) : (
                <Text style={styles.primaryBtnText}>Save Custom Video Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingBlockVideo(null)} disabled={isSavingVideo}>
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
  header: { marginBottom: 15 },
  headerSub: { color: '#39FF14', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  
  rpeBanner: { backgroundColor: '#1A1F26', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#2E3A44', marginBottom: 15 },
  rpeTitle: { color: '#ffffff', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  rpeLegendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  rpeBadgeBox: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rpeDot: { width: 8, height: 8, borderRadius: 4 },
  rpeLegendText: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },

  testsCard: { backgroundColor: '#1A1F26', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#2E3A44', marginBottom: 15 },
  testsTitle: { color: '#39FF14', fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  testGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  testBox: { backgroundColor: '#0B0E14', width: '48%', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44' },
  testHeader: { color: '#39FF14', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  testDesc: { color: '#cbd5e1', fontSize: 11, lineHeight: 15 },
  retestNoticePill: { backgroundColor: '#39FF14', padding: 8, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  retestNoticeText: { color: '#0B0E14', fontSize: 11, fontWeight: 'bold', textAlign: 'center' },

  sectionTitle: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 },
  horizontalScroll: { marginBottom: 15 },
  blockBtn: { backgroundColor: '#1A1F26', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#2E3A44', marginRight: 8, width: 140 },
  blockBtnActive: { backgroundColor: '#39FF14', borderColor: '#39FF14' },
  blockBtnSub: { color: '#39FF14', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
  blockBtnSubActive: { color: '#0B0E14' },
  blockBtnTitle: { color: '#ffffff', fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  blockBtnTitleActive: { color: '#0B0E14' },

  weekTabRow: { flexDirection: 'row', gap: 6, marginBottom: 15 },
  weekTab: { flex: 1, backgroundColor: '#1A1F26', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#2E3A44' },
  weekTabActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  weekTabText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
  weekTabTextActive: { color: '#ffffff' },

  card: { backgroundColor: '#1A1F26', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2E3A44', marginBottom: 15 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardBlockLabel: { color: '#39FF14', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  checkPill: { backgroundColor: '#0B0E14', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#2E3A44' },
  checkPillText: { color: '#3b82f6', fontSize: 10, fontWeight: 'bold' },
  weekThemeTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },

  videoActionRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  watchVideoBtn: { flex: 1, backgroundColor: '#39FF14', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  watchVideoBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 12 },
  editVideoBtn: { backgroundColor: '#0B0E14', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#3b82f6', alignItems: 'center' },
  editVideoBtnText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 11 },

  divider: { height: 1, backgroundColor: '#2E3A44', marginVertical: 10 },

  sessionBox: { backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44', marginBottom: 10 },
  sessionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sessionName: { color: '#39FF14', fontSize: 12, fontWeight: 'bold' },
  rpeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1, backgroundColor: '#1A1F26' },
  rpeBadgeText: { fontSize: 10, fontWeight: 'bold' },
  sessionDesc: { color: '#cbd5e1', fontSize: 13, lineHeight: 18 },

  attendanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  attendanceName: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  attendanceStatus: { color: '#ef4444', fontWeight: 'bold', fontSize: 12 },
  primaryBtn: { backgroundColor: '#39FF14', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  primaryBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: '#1A1F26', width: '90%', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#2E3A44' },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  modalSub: { color: '#94a3b8', fontSize: 12, marginBottom: 15, lineHeight: 18 },
  input: { backgroundColor: '#0B0E14', color: '#ffffff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44', marginBottom: 15 },
  cancelBtn: { padding: 10, alignItems: 'center', marginTop: 5 },
  cancelBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' }
});