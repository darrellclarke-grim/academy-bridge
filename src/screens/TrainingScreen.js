import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DrillCardItem from '../components/DrillCardItem';

export default function TrainingScreen({
  isTrainingRegisterExpanded,
  setIsTrainingRegisterExpanded,
  teamSheet,
  trainingRegister,
  setTrainingRegister,
  submitTrainingSession,
  selectedWeek,
  setSelectedWeek,
  activeWeekData,
  openDrillVideo
}) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B0E14' }}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>Development Focus</Text>
        <Text style={styles.headerTitle}>Training Center</Text>
      </View>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        
        <View style={[styles.card, { borderColor: '#39FF14', borderWidth: 2 }]}>
          <TouchableOpacity 
            onPress={() => setIsTrainingRegisterExpanded(!isTrainingRegisterExpanded)} 
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <View>
              <Text style={styles.cardTitle}>📋 Quick Training Register</Text>
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13 }}>
                Tap to open attendance log
              </Text>
            </View>
            <Text style={{ color: '#39FF14', fontWeight: 'bold', fontSize: 24 }}>
              {isTrainingRegisterExpanded ? '▴' : '▾'}
            </Text>
          </TouchableOpacity>

          {isTrainingRegisterExpanded && (
            <View style={{ marginTop: 15 }}>
              <Text style={styles.bulletText}>Tap to mark players absent, then save the session to bulk-update their attendance stats.</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 15 }}>
                {(teamSheet || []).map(p => {
                  if (!p) return null;
                  const isPresent = (trainingRegister || {})[p.id] ?? false;
                  return (
                    <TouchableOpacity 
                      key={p.id} 
                      style={[styles.simButton, isPresent ? { backgroundColor: '#15803d', borderColor: '#22c55e' } : { backgroundColor: '#7f1d1d', borderColor: '#ef4444' }, { minWidth: '30%', marginBottom: 5 }]}
                      onPress={() => setTrainingRegister(prev => ({ ...(prev || {}), [p.id]: !(prev?.[p.id]) }))}
                    >
                      <Text style={styles.simButtonText}>{p.name} {isPresent ? '✅' : '❌'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity style={styles.primaryAuthBtn} onPress={submitTrainingSession}>
                <Text style={styles.primaryAuthBtnText}>Save Training Session</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Season Curriculum Selector</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }} keyboardShouldPersistTaps="handled">
            {Array.from({ length: 24 }, (_, i) => i + 1).map(wk => (
              <TouchableOpacity key={wk} style={[styles.weekBtn, selectedWeek === wk && styles.weekBtnActive]} onPress={() => setSelectedWeek(wk)}>
                <Text style={[styles.weekBtnText, selectedWeek === wk && styles.weekBtnTextActive]}>TS {wk}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.roleTitle}>{activeWeekData?.theme || 'Session Pending'}</Text>
          <Text style={styles.coreRule}>Core Principle: {activeWeekData?.principle || 'TBA'}</Text>
          <Text style={[styles.bulletText, { fontStyle: 'italic', color: '#39FF14', marginTop: 10 }]}>Key Objective: {activeWeekData?.question || 'TBA'}</Text>
          
          {activeWeekData?.overviewVideoUrl && (
            <TouchableOpacity style={styles.videoBtn} onPress={() => openDrillVideo(activeWeekData?.overviewVideoUrl)}>
              <Text style={styles.videoBtnText}>▶️ Watch Full Overview Video</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.card, { paddingBottom: 40 }]}>
          <Text style={styles.cardTitle}>⏱ 70-Minute PDP Session Plan</Text>
          <View style={styles.divider} />
          
          {(activeWeekData?.phases || []).map((phase, index) => (
            <DrillCardItem 
              key={phase.id || index} 
              drill={phase} 
              phaseLabel={phase.title} 
              openDrillVideo={openDrillVideo} 
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#1A1F26', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  headerSub: { color: '#39FF14', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  content: { padding: 15 },
  card: { backgroundColor: '#1A1F26', borderRadius: 10, padding: 15, marginBottom: 15, borderColor: '#2E3A44', borderWidth: 1 },
  cardTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  bulletText: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, lineHeight: 20 },
  simButton: { backgroundColor: '#0B0E14', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginRight: 8, borderWidth: 1, borderColor: '#2E3A44' },
  simButtonText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  primaryAuthBtn: { backgroundColor: '#39FF14', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  primaryAuthBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 15 },
  weekBtn: { backgroundColor: '#0B0E14', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#2E3A44' },
  weekBtnActive: { backgroundColor: '#39FF14', borderColor: '#39FF14' },
  weekBtnText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 12 },
  weekBtnTextActive: { color: '#0B0E14' },
  roleTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  coreRule: { color: '#39FF14', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  videoBtn: { backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: '#39FF14' },
  videoBtnText: { color: '#39FF14', fontWeight: 'bold', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#2E3A44', marginVertical: 10 }
});