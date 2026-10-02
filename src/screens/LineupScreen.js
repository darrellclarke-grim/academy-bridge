import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LineupScreen({
  activeFormation,
  appMode,
  lineupViewMode,
  setLineupViewMode,
  setIsFormationModalOpen,
  isTafeDisabled,
  openTafeModal,
  isLoadingSheet,
  squadDepthFilter,
  setSquadDepthFilter,
  activeLayout,
  renderDepthPosition,
  renderPosition,
  subs,
  setLineupAssignPlayer,
  getFootednessString,
  teamSheet,
  currentAvailablePositions
}) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerSub}>System: {activeFormation}</Text>
          <Text style={styles.headerTitle}>Match Day Lineup</Text>
        </View>
      </View>

      {appMode === 'coach' && (
        <View style={{ flexDirection: 'row', backgroundColor: '#0a192f', borderBottomWidth: 1, borderBottomColor: '#233554' }}>
          <TouchableOpacity 
            style={[styles.subTab, lineupViewMode === 'pitch' && styles.activeSubTab]} 
            onPress={() => setLineupViewMode('pitch')}
          >
            <Text style={[styles.subTabText, lineupViewMode === 'pitch' && styles.activeSubTabText]}>⚽ Pitch Lineup</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.subTab, lineupViewMode === 'depth' && styles.activeSubTab]} 
            onPress={() => setLineupViewMode('depth')}
          >
            <Text style={[styles.subTabText, lineupViewMode === 'depth' && styles.activeSubTabText]}>📊 Squad Depth</Text>
          </TouchableOpacity>
        </View>
      )}

      {appMode === 'coach' && lineupViewMode === 'pitch' && (
        <View style={styles.formationBar}>
          <Text style={styles.formationBarLabel}>System:</Text>
          <TouchableOpacity style={[styles.fmtBtn, styles.fmtBtnActive, { flex: 1, paddingVertical: 8, marginRight: 5 }]} onPress={() => setIsFormationModalOpen(true)}>
            <Text style={[styles.fmtBtnText, styles.fmtBtnTextActive, { textAlign: 'center' }]}>{activeFormation} (Change ▼)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.fmtBtn, 
              { backgroundColor: '#10b981', borderColor: '#059669', flex: 1, paddingVertical: 8, marginLeft: 5 },
              isTafeDisabled && { opacity: 0.5, backgroundColor: '#475569', borderColor: '#334155' }
            ]} 
            onPress={isTafeDisabled ? null : openTafeModal}
            disabled={isTafeDisabled}
          >
            <Text style={[styles.fmtBtnText, styles.fmtBtnTextActive, { textAlign: 'center' }]}>
              {isTafeDisabled ? '🔒 TAFE (Needs Data)' : '⚡ TAFE Auto-Fill'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 15, alignItems: 'center' }} keyboardShouldPersistTaps="handled">
        {isLoadingSheet ? (
          <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 100 }} />
        ) : lineupViewMode === 'depth' ? (
          <>
            <Text style={{ color: '#3b82f6', fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
              📊 Visual Squad Depth Map ({activeFormation})
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15, backgroundColor: '#112240', padding: 6, borderRadius: 10, borderWidth: 1, borderColor: '#233554' }}>
              <TouchableOpacity 
                style={[
                  styles.fmtBtn, 
                  squadDepthFilter === 'primary' && { backgroundColor: '#f97316', borderColor: '#ea580c' },
                  { paddingHorizontal: 12, paddingVertical: 6 }
                ]} 
                onPress={() => setSquadDepthFilter('primary')}
              >
                <Text style={[styles.fmtBtnText, squadDepthFilter === 'primary' && { color: '#ffffff' }]}>🎯 Primary Role Depth</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.fmtBtn, 
                  squadDepthFilter === 'secondary' && { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
                  { paddingHorizontal: 12, paddingVertical: 6 }
                ]} 
                onPress={() => setSquadDepthFilter('secondary')}
              >
                <Text style={[styles.fmtBtnText, squadDepthFilter === 'secondary' && { color: '#ffffff' }]}>🔄 Secondary Role Depth</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.pitch, { height: 460 }]}>
              <View style={styles.halfwayLine} />
              <View style={styles.centerCircle} />
              {(activeLayout || []).map(node => renderDepthPosition(node.code, node.label, node.top, node.left))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.editInstructions}>Coach Mode: Tap any player on pitch, bench, or squad to assign roles.</Text>
            
            <View style={styles.pitch}>
              <View style={styles.halfwayLine} />
              <View style={styles.centerCircle} />
              {(activeLayout || []).map(node => renderPosition(node.code, node.label, node.top, node.left))}
            </View>

            <View style={styles.listContainer}>
              <Text style={styles.listTitle}>🔄 Substitutes ({(subs || []).length})</Text>
              {(subs || []).map((p, index) => {
                if (!p) return null;
                return (
                  <TouchableOpacity key={index} style={styles.benchCard} onPress={() => { if(appMode === 'coach') setLineupAssignPlayer(p); }}>
                    <Text style={styles.benchName}>
                      #{p.squad_number || ''} {p.name} 
                      <Text style={{fontWeight: 'normal', color: '#64748b', fontSize: 12}}>
                        {' '}({p.position || 'TBD'}{p.secondary_position && p.secondary_position !== 'None' ? ` / ${p.secondary_position}` : ''} | {getFootednessString(p.footedness)})
                      </Text>
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.listContainer}>
              <Text style={styles.listTitle}>👥 Squad Members</Text>
              {(teamSheet || []).map((p, index) => {
                if (!p) return null;
                const isOutdatedStarter = p.is_starter && p.matchday_position && !currentAvailablePositions.includes(p.matchday_position.toUpperCase());
                return (
                  <TouchableOpacity key={index} style={[styles.benchCard, !p.available && { opacity: 0.5, borderColor: '#ef4444' }]} onPress={() => { if(appMode === 'coach') setLineupAssignPlayer(p); }}>
                    <Text style={styles.benchName}>
                      #{p.squad_number || ''} {p.name} 
                      <Text style={{fontSize: 12, color: '#94a3b8'}}>
                        {' '}({p.is_starter ? (isOutdatedStarter ? `⚠️ Invalid Slot (${p.matchday_position})` : `Starter: ${p.matchday_position}`) : p.available ? 'Sub' : 'Unavailable'} | {p.position}{p.secondary_position && p.secondary_position !== 'None' ? ` / ${p.secondary_position}` : ''} | {getFootednessString(p.footedness)})
                      </Text>
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#112240', padding: 20, borderBottomWidth: 1, borderBottomColor: '#233554' },
  headerSub: { color: '#f97316', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  subTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeSubTab: { borderBottomWidth: 3, borderBottomColor: '#f97316' },
  subTabText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 11 },
  activeSubTabText: { color: '#f97316' },
  formationBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', paddingHorizontal: 15, paddingVertical: 8, gap: 8 },
  formationBarLabel: { color: '#f97316', fontWeight: 'bold', fontSize: 12 },
  fmtBtn: { backgroundColor: '#1e293b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#334155', minWidth: 50, alignItems: 'center' },
  fmtBtnActive: { backgroundColor: '#f97316', borderColor: '#f97316' },
  fmtBtnText: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
  fmtBtnTextActive: { color: '#ffffff' },
  editInstructions: { color: '#f97316', fontWeight: 'bold', marginBottom: 15 },
  pitch: { width: '100%', height: 420, backgroundColor: '#15803d', borderRadius: 10, borderWidth: 2, borderColor: '#ffffff', position: 'relative', marginBottom: 20 },
  halfwayLine: { position: 'absolute', top: '50%', width: '100%', height: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
  centerCircle: { position: 'absolute', top: '50%', left: '50%', width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', transform: [{ translateX: -30 }, { translateY: -30 }] },
  listContainer: { width: '100%', backgroundColor: '#112240', borderRadius: 10, padding: 15, marginBottom: 20, borderColor: '#233554', borderWidth: 1 },
  listTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  benchCard: { backgroundColor: '#1e293b', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  benchName: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});