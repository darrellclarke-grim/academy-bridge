import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formationCategories, formationCategories9v9, formationLayouts } from '../constants/tactics';
import { supabase } from '../supabase';

// Position Remapping Hierarchy Matrix
const REMAP_PRIORITIES = {
  'LF': ['LW', 'LF', 'LM', 'ST', 'CAM'],
  'RF': ['RW', 'RF', 'RM', 'ST', 'CAM'],
  'LW': ['LF', 'LW', 'LM', 'ST', 'CAM'],
  'RW': ['RF', 'RW', 'RM', 'ST', 'CAM'],
  'LM': ['LW', 'LF', 'LM', 'LCM', 'CM'],
  'RM': ['RW', 'RF', 'RM', 'RCM', 'CM'],
  'CDM': ['CDM', 'LDM', 'RDM', 'CM', 'LCM', 'RCM', 'CB'],
  'LDM': ['CDM', 'LDM', 'CM', 'LCM', 'CB'],
  'RDM': ['CDM', 'RDM', 'CM', 'RCM', 'CB'],
  'CAM': ['CAM', 'CF', 'LAM', 'RAM', 'CM', 'LCM', 'RCM', 'ST', 'LW', 'RW'],
  'LAM': ['CAM', 'LAM', 'LW', 'LM', 'CM'],
  'RAM': ['CAM', 'RAM', 'RW', 'RM', 'CM'],
  'CF': ['CAM', 'CF', 'ST', 'CM'],
  'LCM': ['LCM', 'CM', 'CDM', 'CAM', 'LM'],
  'RCM': ['RCM', 'CM', 'CDM', 'CAM', 'RM'],
  'CM': ['CM', 'LCM', 'RCM', 'CDM', 'CAM'],
  'LWB': ['LWB', 'LB', 'LM'],
  'RWB': ['RWB', 'RB', 'RM'],
  'LB': ['LB', 'LWB', 'LCB', 'CB'],
  'RB': ['RB', 'RWB', 'RCB', 'CB'],
  'LCB': ['LCB', 'CB', 'LB', 'CDM'],
  'RCB': ['RCB', 'CB', 'RB', 'CDM'],
  'CB': ['CB', 'LCB', 'RCB', 'CDM'],
  'ST': ['ST', 'CF', 'LS', 'RS', 'CAM'],
  'LS': ['ST', 'LS', 'CF'],
  'RS': ['ST', 'RS', 'CF'],
  'GK': ['GK', 'SGK'],
  'SGK': ['GK', 'SGK']
};

export default function FormationModal({
  visible,
  onClose,
  activeFormation,
  setActiveFormation,
  teamSheet = [],
  setTeamSheet,
  ageGroup,
  activeTeamId,
  setMyTeams
}) {
  // ⚡ Declared here so it's accessible everywhere inside this component
  const is9v9 = ['U11', 'U12', 'U13'].includes(String(ageGroup || '').toUpperCase());
  const activeCategories = is9v9 ? formationCategories9v9 : formationCategories;

  // Smart Formation Switcher that remaps starters gracefully
  const handleSelectFormation = async (newFormation) => {
    setActiveFormation(newFormation);

    // 1. Update local team memory immediately
    if (activeTeamId && setMyTeams) {
      setMyTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, default_formation: newFormation } : t));
    }

    // 2. Persist choice to Supabase
    if (activeTeamId) {
      try {
        await supabase.from('teams').update({ default_formation: newFormation }).eq('id', activeTeamId);
      } catch (err) {
        console.warn('⚠️ Default formation update saved locally:', err);
      }
    }

    const targetLayout = formationLayouts[newFormation] || [];
    const availableSlotCodes = targetLayout.map(s => s.code);
    const occupiedSlots = new Set();
    const dbUpdates = [];

    const updatedSheet = teamSheet.map(p => {
      if (!p.is_starter || !p.available) return p;

      const currentPos = String(p.matchday_position || '').toUpperCase();

      if (availableSlotCodes.includes(currentPos) && !occupiedSlots.has(currentPos)) {
        occupiedSlots.add(currentPos);
        return p;
      }

      const priorityList = REMAP_PRIORITIES[currentPos] || [currentPos];
      const remappedSlot = priorityList.find(candidate => availableSlotCodes.includes(candidate) && !occupiedSlots.has(candidate));

      if (remappedSlot) {
        occupiedSlots.add(remappedSlot);
        dbUpdates.push(supabase.from('players').update({ matchday_position: remappedSlot }).eq('id', p.id));
        return { ...p, matchday_position: remappedSlot };
      }

      dbUpdates.push(supabase.from('players').update({ matchday_position: 'Bench', is_starter: false }).eq('id', p.id));
      return { ...p, matchday_position: 'Bench', is_starter: false };
    });

    if (setTeamSheet) {
      setTeamSheet(updatedSheet);
    }

    if (dbUpdates.length > 0) {
      try {
        await Promise.all(dbUpdates);
      } catch (err) {
        console.warn('⚠️ Remap DB update saved locally:', err);
      }
    }

    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlayFull}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalBoxFull, { maxHeight: '85%' }]}>
          <Text style={styles.modalTitle}>
            Select Match Formation ({is9v9 ? '9v9' : '11v11'})
          </Text>
          <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
            {activeCategories.map((category, idx) => (
              <View key={idx} style={{ marginBottom: 20 }}>
                <Text style={styles.sectionHeaderModal}>{category.title}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {category.formations.map(fmt => (
                    <TouchableOpacity 
                      key={fmt} 
                      style={[styles.gridBtn, activeFormation === fmt && { backgroundColor: '#39FF14' }, { minWidth: '45%' }]}
                      onPress={() => handleSelectFormation(fmt)}
                    >
                      <Text style={[styles.gridBtnText, activeFormation === fmt && { color: '#0B0E14' }]}>{fmt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlayFull: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalBoxFull: { backgroundColor: '#1A1F26', width: '92%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#2E3A44', zIndex: 5 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  sectionHeaderModal: { color: '#39FF14', fontSize: 13, fontWeight: 'bold', marginTop: 10, marginBottom: 10, textTransform: 'uppercase', alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#2E3A44', paddingBottom: 4, width: '100%' },
  gridBtn: { backgroundColor: '#0B0E14', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, minWidth: '22%', alignItems: 'center', borderWidth: 1, borderColor: '#2E3A44' },
  gridBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 11 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94a3b8', fontSize: 14 }
});