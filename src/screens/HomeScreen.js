import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen({
  appMode,
  activeTeamObj,
  teamSheet,
  activeFormation,
  setLineupAssignPlayer,
  setIsFormationModalOpen,
  setIsTafeModalOpen,
  matchHistory,
  setIsMatchArchiveOpen,
  scoutNotesInput,
  liveTicker,
  hasVotedMotm,
  votedPlayerName,
  setLiveEventMode,
}) {
  const starters = (teamSheet || []).filter((p) => p && p.is_starter);
  const bench = (teamSheet || []).filter((p) => p && !p.is_starter);

  return (
    <View style={styles.container}>
      {/* TACTICAL HUB HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>ACTIVE SYSTEM: {activeFormation}</Text>
          <Text style={styles.headerTitle}>{activeTeamObj?.name || 'Matchday Tactical Hub'}</Text>
        </View>
        {appMode === 'coach' && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setIsFormationModalOpen(true)}
          >
            <Text style={styles.actionBtnText}>⚙️ System</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* TAFE AI TACTICAL ENGINE QUICK TRIGGER */}
        {appMode === 'coach' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>TACTICAL ENGINE AI (TAFE)</Text>
            <Text style={styles.bulletText}>
              Optimize formation matchups against rival opposition tactics.
            </Text>
            <TouchableOpacity
              style={styles.neonBtn}
              onPress={() => setIsTafeModalOpen(true)}
            >
              <Text style={styles.neonBtnText}>⚡ Run Tactical AI Engine</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MATCHDAY LINEUP SUMMARY */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>PITCHSIDE LINEUP ({starters.length}/11)</Text>
            {appMode === 'coach' && (
              <TouchableOpacity onPress={() => setIsFormationModalOpen(true)}>
                <Text style={{ color: '#39FF14', fontWeight: 'bold', fontSize: 12 }}>Change Setup ➔</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionHeader}>STARTERS</Text>
          <View style={styles.playerGrid}>
            {starters.length === 0 ? (
              <Text style={styles.emptyText}>No starters selected on match sheet.</Text>
            ) : (
              starters.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.playerChip}
                  onPress={() => appMode === 'coach' && setLineupAssignPlayer(p)}
                >
                  <Text style={styles.playerPos}>{p.matchday_position || 'PITCH'}</Text>
                  <Text style={styles.playerName} numberOfLines={1}>
                    #{p.squad_number} {p.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <Text style={[styles.sectionHeader, { marginTop: 15 }]}>SUBSTITUTES BENCH ({bench.length})</Text>
          <View style={styles.playerGrid}>
            {bench.length === 0 ? (
              <Text style={styles.emptyText}>Bench is empty.</Text>
            ) : (
              bench.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.playerChip, styles.benchChip]}
                  onPress={() => appMode === 'coach' && setLineupAssignPlayer(p)}
                >
                  <Text style={[styles.playerPos, { color: '#94A3B8' }]}>SUB</Text>
                  <Text style={[styles.playerName, { color: '#CBD5E1' }]} numberOfLines={1}>
                    #{p.squad_number} {p.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* SCOUTING & TACTICAL NOTES */}
        {!!scoutNotesInput && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>OPPOSITION SCOUTING REPORT</Text>
            <Text style={styles.bulletText}>{scoutNotesInput}</Text>
          </View>
        )}

        {/* RECENT MATCH HISTORY */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>RECENT MATCHES</Text>
            <TouchableOpacity onPress={() => setIsMatchArchiveOpen(true)}>
              <Text style={{ color: '#39FF14', fontWeight: 'bold', fontSize: 12 }}>View All ➔</Text>
            </TouchableOpacity>
          </View>

          {(matchHistory || []).length === 0 ? (
            <Text style={styles.emptyText}>No matches recorded yet this season.</Text>
          ) : (
            matchHistory.slice(0, 3).map((m, idx) => (
              <View key={idx} style={styles.matchRow}>
                <View>
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>
                    vs {m.opponent || 'Opponent'}
                  </Text>
                  <Text style={{ color: '#94A3B8', fontSize: 11 }}>{m.date || 'Past Match'}</Text>
                </View>
                <Text style={{ color: '#39FF14', fontWeight: 'bold', fontSize: 16 }}>
                  {m.team_score ?? 0} - {m.opponent_score ?? 0}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1F26',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2E3A44',
  },
  headerSub: { color: '#39FF14', fontWeight: 'bold', fontSize: 11, letterSpacing: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  actionBtn: { backgroundColor: '#0B0E14', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44' },
  actionBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  content: { padding: 15 },
  card: { backgroundColor: '#1A1F26', borderRadius: 12, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#2E3A44' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },
  bulletText: { color: '#CBD5E1', fontSize: 13, lineHeight: 18, marginBottom: 10 },
  neonBtn: { backgroundColor: '#39FF14', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  neonBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 13 },
  sectionHeader: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginBottom: 8, marginTop: 5 },
  playerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  playerChip: { backgroundColor: '#0B0E14', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#39FF14', minWidth: '45%', flex: 1 },
  benchChip: { borderColor: '#2E3A44' },
  playerPos: { color: '#39FF14', fontSize: 10, fontWeight: 'bold' },
  playerName: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  emptyText: { color: '#64748B', fontSize: 12, fontStyle: 'italic' },
  matchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
});