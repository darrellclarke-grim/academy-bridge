import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TeamSheetScreen({
  profile,
  appMode,
  gkPlayers,
  outfieldPlayers,
  adjustMatchStat
}) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B0E14' }}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerSub}>Season Performance</Text>
          <Text style={styles.headerTitle}>Team Sheet</Text>
        </View>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <ScrollView horizontal showsHorizontalScrollIndicator={true} keyboardShouldPersistTaps="handled">
          <View style={{ paddingBottom: 30 }}>

            <Text style={styles.sectionHeader}>GOALKEEPERS</Text>
            <View style={[styles.tableContainer, { alignSelf: 'flex-start' }]}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.thText, { width: 100 }]}>NAME</Text>
                <Text style={[styles.thText, { width: 50 }]}>POS</Text>
                <Text style={[styles.thText, { width: 75, textAlign: 'center' }]}>TRN</Text>
                <Text style={[styles.thText, { width: 75, textAlign: 'center' }]}>APPS</Text>
                {(profile?.role === 'coach' && appMode === 'coach') ? <Text style={[styles.thText, { width: 60, textAlign: 'center', color: '#39FF14' }]}>MINS</Text> : null}
                {(profile?.role === 'coach' && appMode === 'coach') ? <Text style={[styles.thText, { width: 50, textAlign: 'center', color: '#39FF14' }]}>AVG</Text> : null}
                <Text style={[styles.thText, { width: 75, textAlign: 'center' }]}>SAVES</Text>
                <Text style={[styles.thText, { width: 75, textAlign: 'center' }]}>CS</Text>
                <Text style={[styles.thText, { width: 75, textAlign: 'center' }]}>POTM</Text>
                <Text style={[styles.thText, { width: 75, textAlign: 'center' }]}>FPOTM</Text>
              </View>
              {(gkPlayers || []).length === 0 && <Text style={{ color: '#64748b', padding: 15 }}>No Goalkeepers found.</Text>}
              {(gkPlayers || []).map(p => {
                if (!p) return null;
                return (
                  <View key={p.id} style={styles.tableBodyRow}>
                    <Text style={[styles.tdTextName, { width: 100 }]} numberOfLines={1}>#{p.squad_number || ''} {p.name || 'Player'}</Text>
                    <Text style={[styles.tdTextPos, { width: 50 }]}>{p.position || 'GK'}</Text>
                    
                    <View style={styles.stepperCellSmall}>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'training_attended', -1)}><Text style={styles.stepBtnText}>-</Text></TouchableOpacity> : null}
                      <Text style={styles.stepValText}>{p.training_attended || 0}</Text>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'training_attended', 1)}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity> : null}
                    </View>
                    <View style={styles.stepperCellSmall}>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'apps', -1)}><Text style={styles.stepBtnText}>-</Text></TouchableOpacity> : null}
                      <Text style={styles.stepValText}>{p.apps || 0}</Text>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'apps', 1)}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity> : null}
                    </View>

                    {(profile?.role === 'coach' && appMode === 'coach') ? (
                      <Text style={[styles.stepValText, { width: 60, color: '#39FF14' }]}>{p.total_minutes_played || 0}</Text>
                    ) : null}
                    {(profile?.role === 'coach' && appMode === 'coach') ? (
                      <Text style={[styles.stepValText, { width: 50, color: '#39FF14' }]}>{p.apps > 0 ? Math.round((p.total_minutes_played || 0) / p.apps) : 0}</Text>
                    ) : null}

                    <View style={styles.stepperCellSmall}>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'saves', -1)}><Text style={styles.stepBtnText}>-</Text></TouchableOpacity> : null}
                      <Text style={styles.stepValText}>{p.saves || 0}</Text>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'saves', 1)}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity> : null}
                    </View>
                    <View style={styles.stepperCellSmall}>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'clean_sheets', -1)}><Text style={styles.stepBtnText}>-</Text></TouchableOpacity> : null}
                      <Text style={styles.stepValText}>{p.clean_sheets || 0}</Text>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'clean_sheets', 1)}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity> : null}
                    </View>
                    <View style={styles.stepperCellSmall}>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'motm', -1)}><Text style={styles.stepBtnText}>-</Text></TouchableOpacity> : null}
                      <Text style={styles.stepValText}>{p.motm || 0}</Text>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'motm', 1)}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity> : null}
                    </View>
                    <View style={styles.stepperCellSmall}>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'parent_motm', -1)}><Text style={styles.stepBtnText}>-</Text></TouchableOpacity> : null}
                      <Text style={styles.stepValText}>{p.parent_motm || 0}</Text>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'parent_motm', 1)}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity> : null}
                    </View>
                  </View>
                );
              })}
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 25 }]}>OUTFIELD SQUAD</Text>
            <View style={[styles.tableContainer, { alignSelf: 'flex-start' }]}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.thText, { width: 100 }]}>NAME</Text>
                <Text style={[styles.thText, { width: 50 }]}>POS</Text>
                <Text style={[styles.thText, { width: 75, textAlign: 'center' }]}>TRN</Text>
                <Text style={[styles.thText, { width: 75, textAlign: 'center' }]}>APPS</Text>
                {(profile?.role === 'coach' && appMode === 'coach') ? <Text style={[styles.thText, { width: 60, textAlign: 'center', color: '#39FF14' }]}>MINS</Text> : null}
                {(profile?.role === 'coach' && appMode === 'coach') ? <Text style={[styles.thText, { width: 50, textAlign: 'center', color: '#39FF14' }]}>AVG</Text> : null}
                <Text style={[styles.thText, { width: 75, textAlign: 'center' }]}>GOALS</Text>
                <Text style={[styles.thText, { width: 75, textAlign: 'center' }]}>ASSISTS</Text>
                <Text style={[styles.thText, { width: 75, textAlign: 'center' }]}>POTM</Text>
                <Text style={[styles.thText, { width: 75, textAlign: 'center' }]}>FPOTM</Text>
              </View>
              {(outfieldPlayers || []).length === 0 && <Text style={{ color: '#64748b', padding: 15 }}>No Outfield players found.</Text>}
              {(outfieldPlayers || []).map(p => {
                if (!p) return null;
                return (
                  <View key={p.id} style={styles.tableBodyRow}>
                    <Text style={[styles.tdTextName, { width: 100 }]} numberOfLines={1}>#{p.squad_number || ''} {p.name || 'Player'}</Text>
                    <Text style={[styles.tdTextPos, { width: 50 }]}>{p.position || 'TBD'}</Text>
                    
                    <View style={styles.stepperCellSmall}>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'training_attended', -1)}><Text style={styles.stepBtnText}>-</Text></TouchableOpacity> : null}
                      <Text style={styles.stepValText}>{p.training_attended || 0}</Text>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'training_attended', 1)}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity> : null}
                    </View>
                    <View style={styles.stepperCellSmall}>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'apps', -1)}><Text style={styles.stepBtnText}>-</Text></TouchableOpacity> : null}
                      <Text style={styles.stepValText}>{p.apps || 0}</Text>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'apps', 1)}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity> : null}
                    </View>

                    {(profile?.role === 'coach' && appMode === 'coach') ? (
                      <Text style={[styles.stepValText, { width: 60, color: '#39FF14' }]}>{p.total_minutes_played || 0}</Text>
                    ) : null}
                    {(profile?.role === 'coach' && appMode === 'coach') ? (
                      <Text style={[styles.stepValText, { width: 50, color: '#39FF14' }]}>{p.apps > 0 ? Math.round((p.total_minutes_played || 0) / p.apps) : 0}</Text>
                    ) : null}

                    <View style={styles.stepperCellSmall}>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'goals', -1)}><Text style={styles.stepBtnText}>-</Text></TouchableOpacity> : null}
                      <Text style={styles.stepValText}>{p.goals || 0}</Text>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'goals', 1)}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity> : null}
                    </View>
                    <View style={styles.stepperCellSmall}>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'assists', -1)}><Text style={styles.stepBtnText}>-</Text></TouchableOpacity> : null}
                      <Text style={styles.stepValText}>{p.assists || 0}</Text>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'assists', 1)}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity> : null}
                    </View>
                    <View style={styles.stepperCellSmall}>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'motm', -1)}><Text style={styles.stepBtnText}>-</Text></TouchableOpacity> : null}
                      <Text style={styles.stepValText}>{p.motm || 0}</Text>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'motm', 1)}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity> : null}
                    </View>
                    <View style={styles.stepperCellSmall}>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'parent_motm', -1)}><Text style={styles.stepBtnText}>-</Text></TouchableOpacity> : null}
                      <Text style={styles.stepValText}>{p.parent_motm || 0}</Text>
                      {appMode === 'coach' ? <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMatchStat(p, 'parent_motm', 1)}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1F26', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  headerSub: { color: '#39FF14', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  content: { padding: 15 },
  sectionHeader: { color: '#39FF14', fontSize: 16, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  tableContainer: { backgroundColor: '#1A1F26', borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44', overflow: 'hidden' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#0B0E14', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#2E3A44', alignItems: 'center' },
  thText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase' },
  tableBodyRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#0B0E14', alignItems: 'center' },
  tdTextName: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  tdTextPos: { color: '#94a3b8', fontWeight: 'bold', fontSize: 12 },
  stepperCellSmall: { width: 75, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  stepBtn: { backgroundColor: '#0B0E14', width: 24, height: 24, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#39FF14' },
  stepBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  stepValText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, minWidth: 16, textAlign: 'center' }
});