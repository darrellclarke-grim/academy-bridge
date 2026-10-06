import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LineupScreen({
  activeFormation = '4-2-3-1',
  appMode,
  lineupViewMode,
  setLineupViewMode,
  setIsFormationModalOpen,
  isTafeDisabled,
  openTafeModal,
  isLoadingSheet,
  squadDepthFilter,
  setSquadDepthFilter,
  activeLayout = [],
  renderDepthPosition,
  renderPosition,
  subs = [],
  setLineupAssignPlayer,
  getFootednessString,
  teamSheet = [],
  currentAvailablePositions = []
}) {
  const resolveTop = (node) => {
    const val = node.top !== undefined ? node.top : node.y;
    if (val === undefined) return '50%';
    if (typeof val === 'number') return `${val}%`;
    return String(val).endsWith('%') ? val : `${val}%`;
  };

  const resolveLeft = (node) => {
    const val = node.left !== undefined ? node.left : node.x;
    if (val === undefined) return '50%';
    if (typeof val === 'number') return `${val}%`;
    return String(val).endsWith('%') ? val : `${val}%`;
  };

  // Force pitch mode for non-coaches
  const activeMode = appMode === 'coach' ? lineupViewMode : 'pitch';

  // Real Vector Football Pitch Canvas Renderer (Attacking 3rd Turf Theme)
  const renderRealPitchCanvas = (children) => (
    <View style={styles.pitchCanvasFrame}>
      {/* Top Goal Frame */}
      <View style={styles.pitchGoalTopFrame} />

      {/* Main Pitch Turf Body */}
      <View style={styles.pitchTurfBody}>
        {/* Pitch Boundary Lines */}
        <View style={styles.pitchOuterBoundary} />

        {/* Halfway Line & Center Circle */}
        <View style={styles.pitchHalfwayLine} />
        <View style={styles.pitchCenterCircle} />
        <View style={styles.pitchCenterSpot} />

        {/* Top Penalty Box & 6-Yard Goal Box */}
        <View style={styles.pitchPenaltyBoxTop} />
        <View style={styles.pitchGoalBoxTop} />
        <View style={styles.pitchPenaltySpotTop} />
        <View style={styles.pitchPenaltyArcTop} />

        {/* Bottom Penalty Box & 6-Yard Goal Box */}
        <View style={styles.pitchPenaltyBoxBottom} />
        <View style={styles.pitchGoalBoxBottom} />
        <View style={styles.pitchPenaltySpotBottom} />
        <View style={styles.pitchPenaltyArcBottom} />

        {/* Corner Arcs */}
        <View style={[styles.cornerArc, { top: 10, left: 10, borderBottomRightRadius: 10 }]} />
        <View style={[styles.cornerArc, { top: 10, right: 10, borderBottomLeftRadius: 10 }]} />
        <View style={[styles.cornerArc, { bottom: 10, left: 10, borderTopRightRadius: 10 }]} />
        <View style={[styles.cornerArc, { bottom: 10, right: 10, borderTopLeftRadius: 10 }]} />

        {/* Overlay for Player Pins */}
        <View style={styles.pitchOverlayLayer}>
          {children}
        </View>
      </View>

      {/* Bottom Goal Frame */}
      <View style={styles.pitchGoalBottomFrame} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerSub}>SYSTEM: {activeFormation}</Text>
        <Text style={styles.headerTitle}>Match Day Lineup</Text>
      </View>

      {/* VIEW MODE TOGGLES (COACH ONLY) */}
      {appMode === 'coach' && (
        <View style={styles.toggleBar}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeMode === 'pitch' && styles.toggleBtnActive]}
            onPress={() => setLineupViewMode && setLineupViewMode('pitch')}
          >
            <Text style={[styles.toggleBtnText, activeMode === 'pitch' && styles.toggleBtnTextActive]}>
              ⚽ Pitch Lineup
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, activeMode === 'depth' && styles.toggleBtnActive]}
            onPress={() => setLineupViewMode && setLineupViewMode('depth')}
          >
            <Text style={[styles.toggleBtnText, activeMode === 'depth' && styles.toggleBtnTextActive]}>
              📊 Squad Depth
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* COACH-ONLY ACTION CONTROLS */}
      {appMode === 'coach' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.systemSelectBtn}
            onPress={() => setIsFormationModalOpen && setIsFormationModalOpen(true)}
          >
            <Text style={styles.systemSelectText}>System: {activeFormation} (Change ▼)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tafeBtn, isTafeDisabled && { opacity: 0.5 }]}
            disabled={isTafeDisabled}
            onPress={openTafeModal}
          >
            <Text style={styles.tafeBtnText}>⚡ TAFE Auto-Fill</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {activeMode === 'pitch' ? (
          <>
            <Text style={styles.instructionText}>
              {appMode === 'coach'
                ? 'Coach Mode: Tap any player on pitch or bench to reassign roles.'
                : 'Matchday Tactical Pitch Setup'}
            </Text>

            {/* TACTICAL PITCH GRAPHIC CANVAS */}
            {renderRealPitchCanvas(
              (activeLayout || []).map((node) => {
                const topPos = resolveTop(node);
                const leftPos = resolveLeft(node);
                return renderPosition ? renderPosition(node.code, node.label, topPos, leftPos) : null;
              })
            )}

            {/* BENCH LIST */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>SUBSTITUTES BENCH ({subs.length})</Text>
              <View style={styles.benchGrid}>
                {subs.length === 0 ? (
                  <Text style={styles.emptyText}>No substitutes assigned to bench.</Text>
                ) : (
                  subs.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.benchChip}
                      onPress={() => appMode === 'coach' && setLineupAssignPlayer && setLineupAssignPlayer(p)}
                    >
                      <Text style={styles.benchPos}>SUB</Text>
                      <Text style={styles.benchName} numberOfLines={1}>
                        #{p.squad_number || 0} {p.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* SQUAD DEPTH VIEW (COACH ONLY) */}
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.filterBtn, squadDepthFilter === 'primary' && styles.filterBtnActive]}
                onPress={() => setSquadDepthFilter && setSquadDepthFilter('primary')}
              >
                <Text style={[styles.filterBtnText, squadDepthFilter === 'primary' && styles.filterBtnTextActive]}>
                  Primary Roles
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterBtn, squadDepthFilter === 'secondary' && styles.filterBtnActive]}
                onPress={() => setSquadDepthFilter && setSquadDepthFilter('secondary')}
              >
                <Text style={[styles.filterBtnText, squadDepthFilter === 'secondary' && styles.filterBtnTextActive]}>
                  Secondary Roles
                </Text>
              </TouchableOpacity>
            </View>

            {renderRealPitchCanvas(
              (activeLayout || []).map((node) => {
                const topPos = resolveTop(node);
                const leftPos = resolveLeft(node);
                return renderDepthPosition ? renderDepthPosition(node.code, node.label, topPos, leftPos) : null;
              })
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14' },
  header: { backgroundColor: '#1A1F26', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  headerSub: { color: '#39FF14', fontWeight: 'bold', fontSize: 11, letterSpacing: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  toggleBar: { flexDirection: 'row', backgroundColor: '#1A1F26', borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  toggleBtnActive: { borderBottomWidth: 3, borderBottomColor: '#39FF14' },
  toggleBtnText: { color: '#64748B', fontWeight: 'bold', fontSize: 13 },
  toggleBtnTextActive: { color: '#FFFFFF' },
  actionRow: { flexDirection: 'row', gap: 10, padding: 15, paddingBottom: 0 },
  systemSelectBtn: { flex: 1, backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#39FF14' },
  systemSelectText: { color: '#39FF14', fontWeight: 'bold', fontSize: 12 },
  tafeBtn: { flex: 1, backgroundColor: '#39FF14', padding: 12, borderRadius: 8, alignItems: 'center' },
  tafeBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 12 },
  content: { padding: 15 },
  instructionText: { color: '#39FF14', fontSize: 12, fontWeight: 'bold', marginBottom: 12 },

  // REAL FOOTBALL PITCH CANVAS STYLES
  pitchCanvasFrame: {
    width: '100%',
    marginVertical: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  pitchGoalTopFrame: {
    width: 60,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    marginBottom: 2,
  },
  pitchGoalBottomFrame: {
    width: 60,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    marginTop: 2,
  },
  pitchTurfBody: {
    width: '100%',
    height: 420,
    backgroundColor: '#0D2B16', // Rich football pitch turf green
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1E4D2B',
    position: 'relative',
    overflow: 'hidden',
  },
  pitchOuterBoundary: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  pitchHalfwayLine: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  pitchCenterCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 80,
    height: 80,
    marginLeft: -40,
    marginTop: -40,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  pitchCenterSpot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 6,
    height: 6,
    marginLeft: -3,
    marginTop: -3,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  pitchPenaltyBoxTop: {
    position: 'absolute',
    top: 10,
    left: '22%',
    right: '22%',
    height: 60,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  pitchGoalBoxTop: {
    position: 'absolute',
    top: 10,
    left: '36%',
    right: '36%',
    height: 22,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  pitchPenaltySpotTop: {
    position: 'absolute',
    top: 52,
    left: '50%',
    width: 4,
    height: 4,
    marginLeft: -2,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  pitchPenaltyArcTop: {
    position: 'absolute',
    top: 54,
    left: '40%',
    width: '20%',
    height: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  pitchPenaltyBoxBottom: {
    position: 'absolute',
    bottom: 10,
    left: '22%',
    right: '22%',
    height: 60,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  pitchGoalBoxBottom: {
    position: 'absolute',
    bottom: 10,
    left: '36%',
    right: '36%',
    height: 22,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  pitchPenaltySpotBottom: {
    position: 'absolute',
    bottom: 52,
    left: '50%',
    width: 4,
    height: 4,
    marginLeft: -2,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  pitchPenaltyArcBottom: {
    position: 'absolute',
    bottom: 54,
    left: '40%',
    width: '20%',
    height: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  cornerArc: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  pitchOverlayLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  card: { backgroundColor: '#1A1F26', borderRadius: 12, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#2E3A44' },
  cardTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5, marginBottom: 10 },
  benchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  benchChip: { backgroundColor: '#0B0E14', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44', minWidth: '45%', flex: 1 },
  benchPos: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold' },
  benchName: { color: '#CBD5E1', fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  emptyText: { color: '#64748B', fontSize: 12, fontStyle: 'italic' },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  filterBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#1A1F26', borderWidth: 1, borderColor: '#2E3A44', alignItems: 'center' },
  filterBtnActive: { borderColor: '#39FF14', backgroundColor: '#1A1F26' },
  filterBtnText: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold' },
  filterBtnTextActive: { color: '#39FF14' }
});