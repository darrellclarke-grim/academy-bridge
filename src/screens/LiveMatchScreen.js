import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMatchdayStore } from '../store/useMatchdayStore';

export default function LiveMatchScreen({
  appMode,
  handlePhaseChange,
  getPhaseButtonText,
  activeTeamObj,
  initGoalFlow,
  initCardFlow,
  onPitchPlayers,
  subs
}) {
  const matchPhase = useMatchdayStore((state) => state.matchPhase);
  const matchType = useMatchdayStore((state) => state.matchType);
  const setMatchType = useMatchdayStore((state) => state.setMatchType);
  const displaySeconds = useMatchdayStore((state) => state.displaySeconds);
  const opponentName = useMatchdayStore((state) => state.opponentName);
  const setOpponentName = useMatchdayStore((state) => state.setOpponentName);
  const teamScore = useMatchdayStore((state) => state.teamScore);
  const opponentScore = useMatchdayStore((state) => state.opponentScore);
  const liveTicker = useMatchdayStore((state) => state.liveTicker);
  const setLiveEventMode = useMatchdayStore((state) => state.setLiveEventMode);
  const setActiveLivePlayer = useMatchdayStore((state) => state.setActiveLivePlayer);
  const pendingOfflineCount = useMatchdayStore((state) => state.pendingOfflineCount);
  const setPendingOfflineCount = useMatchdayStore((state) => state.setPendingOfflineCount);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleManualSync = async () => {
    const { flushOfflineQueue, getOfflineQueue } = require('../utils/offlineQueue');
    await flushOfflineQueue();
    const queue = await getOfflineQueue();
    setPendingOfflineCount(queue.length);
  };

  return (
    <View style={{ flex: 1 }}>
      
      <View style={styles.liveHeader}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.liveHeaderSub}>{matchPhase}</Text>
            <Text style={[styles.liveHeaderSub, { color: '#3b82f6' }]}>[{matchType.toUpperCase()}]</Text>
          </View>
          <Text style={styles.clockText}>{formatTime(displaySeconds)}</Text>
        </View>
        {appMode === 'coach' && (
          <TouchableOpacity style={styles.phaseBtn} onPress={handlePhaseChange}>
            <Text style={styles.phaseBtnText}>{getPhaseButtonText()}</Text>
          </TouchableOpacity>
        )}
      </View>

      {pendingOfflineCount > 0 && (
        <View style={{ backgroundColor: '#eab308', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 }}>
          <Text style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 12 }}>
            📡 {pendingOfflineCount} Event{pendingOfflineCount > 1 ? 's' : ''} Saved Offline
          </Text>
          <TouchableOpacity onPress={handleManualSync} style={{ backgroundColor: '#0f172a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 11 }}>Sync Now 🔄</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.scoreboardContainer}>
        {matchPhase === 'PRE-MATCH' && appMode === 'coach' && (
          <View style={{ marginBottom: 12 }}>
            <TextInput 
              style={[
                styles.opponentInput,
                !opponentName.trim() && { borderColor: '#f97316', borderWidth: 2, backgroundColor: 'rgba(249,115,22,0.15)' }
              ]} 
              placeholder="Enter Opponent Name (Required)..." 
              placeholderTextColor={!opponentName.trim() ? '#f97316' : '#64748b'}
              value={opponentName}
              onChangeText={setOpponentName}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 4 }}>
              <TouchableOpacity 
                style={[styles.fmtBtn, matchType === 'League' && styles.fmtBtnActive, { flex: 1, paddingVertical: 8 }]}
                onPress={() => setMatchType('League')}
              >
                <Text style={[styles.fmtBtnText, matchType === 'League' && styles.fmtBtnTextActive]}>🏆 League Match</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fmtBtn, matchType === 'Cup' && styles.fmtBtnActive, { flex: 1, paddingVertical: 8 }]}
                onPress={() => setMatchType('Cup')}
              >
                <Text style={[styles.fmtBtnText, matchType === 'Cup' && styles.fmtBtnTextActive]}>🥊 Cup Match</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.scoreboard}>
          <View style={styles.scoreCol}>
            <Text style={styles.scoreTeam} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>{activeTeamObj?.name || 'Our Team'}</Text>
            <Text style={styles.scoreNum}>{teamScore}</Text>
          </View>
          <View style={styles.scoreColCenter}>
            <Text style={styles.scoreVs}>VS</Text>
          </View>
          <View style={styles.scoreCol}>
            <Text style={styles.scoreTeam} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>{opponentName || 'Opponent'}</Text>
            <Text style={styles.scoreNum}>{opponentScore}</Text>
          </View>
        </View>
      </View>

      {appMode === 'coach' && (
        <View style={styles.liveActionHeader}>
          <TouchableOpacity style={[styles.topActionBtn, { borderColor: '#f97316' }]} onPress={initGoalFlow}>
            <Text style={styles.topActionText}>⚽ Log Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.topActionBtn, { borderColor: '#eab308' }]} onPress={initCardFlow}>
            <Text style={styles.topActionText}>⚠️ Disciplinary</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.topActionBtn, { borderColor: '#3b82f6' }]} onPress={() => setLiveEventMode('coach_motm')}>
            <Text style={styles.topActionText}>⭐ Coach POTM</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tickerContainer}>
        {(liveTicker || []).length === 0 ? (
          <Text style={[styles.bulletText, { textAlign: 'center', marginTop: 15 }]}>Awaiting Kick-Off...</Text>
        ) : (
          <ScrollView style={{ padding: 10 }}>
            {(liveTicker || []).map((evt, idx) => {
              if (!evt) return null;
              return (
                <View key={idx} style={styles.tickerRow}>
                  <Text style={styles.tickerMin}>{evt.minute}</Text>
                  <Text style={styles.tickerIcon}>{evt.icon}</Text>
                  <Text style={styles.tickerMessage}>{evt.message}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {appMode === 'coach' && (
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionHeaderModal}>ON PITCH (STARTERS)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {(onPitchPlayers || []).length === 0 ? <Text style={{ color: '#64748b' }}>No starters selected.</Text> : null}
            {(onPitchPlayers || []).map(p => {
              if (!p) return null;
              return (
                <TouchableOpacity key={p.id} style={styles.livePlayerCard} onPress={() => setActiveLivePlayer(p)}>
                  <Text style={styles.livePlayerPos}>{p.matchday_position || 'N/A'}</Text>
                  <Text style={styles.livePlayerName} numberOfLines={1}>#{p.squad_number} {p.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionHeaderModal, { marginTop: 30 }]}>BENCH (SUBS)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 40 }}>
            {(subs || []).length === 0 ? <Text style={{ color: '#64748b' }}>Bench is empty.</Text> : null}
            {(subs || []).map(p => {
              if (!p) return null;
              return (
                <TouchableOpacity key={p.id} style={[styles.livePlayerCard, { borderColor: '#475569', backgroundColor: '#1e293b' }]} onPress={() => setActiveLivePlayer(p)}>
                  <Text style={[styles.livePlayerPos, { color: '#94a3b8' }]}>{p.matchday_position || 'N/A'}</Text>
                  <Text style={[styles.livePlayerName, { color: '#cbd5e1' }]} numberOfLines={1}>#{p.squad_number} {p.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  liveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#112240', padding: 20, borderBottomWidth: 1, borderBottomColor: '#233554' },
  liveHeaderSub: { color: '#f97316', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  clockText: { color: '#ffffff', fontSize: 32, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  phaseBtn: { backgroundColor: '#1e3a8a', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 },
  phaseBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  scoreboardContainer: { backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#233554', padding: 15 },
  opponentInput: { backgroundColor: '#1e293b', color: '#ffffff', padding: 10, borderRadius: 8, textAlign: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#334155' },
  scoreboard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreCol: { flex: 1, alignItems: 'center' },
  scoreColCenter: { width: 50, alignItems: 'center' },
  scoreTeam: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
  scoreNum: { color: '#ffffff', fontSize: 40, fontWeight: 'bold' },
  scoreVs: { color: '#f97316', fontSize: 16, fontWeight: 'bold' },
  fmtBtn: { backgroundColor: '#1e293b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#334155', minWidth: 50, alignItems: 'center' },
  fmtBtnActive: { backgroundColor: '#f97316', borderColor: '#f97316' },
  fmtBtnText: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
  fmtBtnTextActive: { color: '#ffffff' },
  liveActionHeader: { flexDirection: 'row', justifyContent: 'center', gap: 6, padding: 12, borderBottomWidth: 1, borderBottomColor: '#233554' },
  topActionBtn: { backgroundColor: '#1e293b', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, borderWidth: 2, alignItems: 'center', flex: 1 },
  topActionText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  tickerContainer: { backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#233554', maxHeight: 150 },
  tickerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  tickerMin: { color: '#f97316', fontWeight: 'bold', width: 35, fontSize: 12 },
  tickerIcon: { fontSize: 16, width: 25 },
  tickerMessage: { color: '#cbd5e1', fontSize: 13, flex: 1 },
  bulletText: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, lineHeight: 20 },
  content: { padding: 15 },
  sectionHeaderModal: { color: '#f97316', fontSize: 13, fontWeight: 'bold', marginTop: 10, marginBottom: 10, textTransform: 'uppercase', alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#233554', paddingBottom: 4, width: '100%' },
  livePlayerCard: { backgroundColor: '#1e3a8a', padding: 15, borderRadius: 10, minWidth: '45%', alignItems: 'center', flex: 1, borderWidth: 1, borderColor: '#3b82f6' },
  livePlayerPos: { color: '#f97316', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  livePlayerName: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});