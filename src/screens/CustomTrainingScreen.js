import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DrillCardItem from '../components/DrillCardItem';

export default function CustomTrainingScreen({
  setDrillSelectorMode,
  selectedWarmup,
  selectedDrill1,
  selectedDrill2,
  selectedSSG,
  openDrillVideo
}) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>Development Focus</Text>
        <Text style={styles.headerTitle}>Custom Training</Text>
      </View>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏱️ Dynamic Session Builder (1 hr 10 mins)</Text>
          <View style={styles.divider} />

          <Text style={[styles.inputLabel, {marginTop: 5}]}>Phase 1: Warm-Up & Physical Activation (10 mins)</Text>
          <TouchableOpacity style={styles.dropdownBtn} onPress={() => setDrillSelectorMode('warmup')}>
            <Text style={styles.dropdownBtnText}>{selectedWarmup?.title || 'Select Warm-Up'}</Text>
            <Text style={styles.dropdownBtnText}>▼</Text>
          </TouchableOpacity>

          <Text style={[styles.inputLabel, {marginTop: 15}]}>Phase 2: Tactical Rondo (12 mins)</Text>
          <TouchableOpacity style={styles.dropdownBtn} onPress={() => setDrillSelectorMode('rondo')}>
            <Text style={styles.dropdownBtnText}>{selectedDrill1 ? `[${selectedDrill1.category || 'Rondo'}] ${selectedDrill1.title}` : 'Select Rondo'}</Text>
            <Text style={styles.dropdownBtnText}>▼</Text>
          </TouchableOpacity>

          <Text style={[styles.inputLabel, {marginTop: 15}]}>Phase 3: Main Tactical Drill (28 mins)</Text>
          <TouchableOpacity style={styles.dropdownBtn} onPress={() => setDrillSelectorMode('drill2')}>
            <Text style={styles.dropdownBtnText}>{selectedDrill2 ? `[${selectedDrill2.category || 'Main'}] ${selectedDrill2.title}` : 'Select Main Drill'}</Text>
            <Text style={styles.dropdownBtnText}>▼</Text>
          </TouchableOpacity>

          <Text style={[styles.inputLabel, {marginTop: 15}]}>Phase 4: Small-Sided Game (20 mins)</Text>
          <TouchableOpacity style={styles.dropdownBtn} onPress={() => setDrillSelectorMode('ssg')}>
            <Text style={styles.dropdownBtnText}>{selectedSSG?.title || 'Select SSG'}</Text>
            <Text style={styles.dropdownBtnText}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { paddingBottom: 40 }]}>
          <Text style={styles.cardTitle}>⚽ Today's Custom Session Plan</Text>
          <View style={styles.divider} />
          
          {[selectedWarmup, selectedDrill1, selectedDrill2, selectedSSG].map((phase, index) => {
            if (!phase) return null;
            let phaseLabel = "Phase 1: Warm-Up (10m)";
            if (index === 1) phaseLabel = `Phase 2: Rondo (${phase.category || '12m'})`;
            if (index === 2) phaseLabel = `Phase 3: Main Drill (${phase.category || '28m'})`;
            if (index === 3) phaseLabel = "Phase 4: Small-Sided Game (20m)";

            return (
              <DrillCardItem 
                key={phase.id || index} 
                drill={phase} 
                phaseLabel={phaseLabel} 
                openDrillVideo={openDrillVideo} 
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#112240', padding: 20, borderBottomWidth: 1, borderBottomColor: '#233554' },
  headerSub: { color: '#f97316', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  content: { padding: 15 },
  card: { backgroundColor: '#112240', borderRadius: 10, padding: 15, marginBottom: 15, borderColor: '#233554', borderWidth: 1 },
  cardTitle: { color: '#f97316', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#233554', marginVertical: 10 },
  inputLabel: { color: '#94a3b8', fontWeight: 'bold', marginBottom: 6, fontSize: 12 },
  dropdownBtn: { backgroundColor: '#1e293b', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownBtnText: { color: '#cbd5e1', fontWeight: 'bold', fontSize: 13 }
});