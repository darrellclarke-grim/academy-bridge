import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useMatchdayStore } from '../store/useMatchdayStore';

export default function LiveMatchScreen({
  appMode,
  handlePhaseChange,
  getPhaseButtonText,
  activeTeamObj,
  initGoalFlow,
  initCardFlow,
  onPitchPlayers = [],
  subs = [],
  openHalfTimeSubModal
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

  // Match State Verification
  const isGameActive = matchPhase === '1ST HALF' || matchPhase === '2ND HALF';
  const isPreMatch = matchPhase === 'PRE-MATCH';
  const isHalfTime = matchPhase === 'HALF-TIME';

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDisabledAction = () => {
    if (isPreMatch) {
      Alert.alert(
        "Match Not Started",
        "Tap 'Start 1st Half' to kick off before logging goals, cards, or substitutions."
      );
    } else if (isHalfTime) {
      Alert.alert(
        "Half-Time Interval",
        "Live play is currently paused. Tap 'Half-Time Team Talk & Bulk Subs' to plan changes for the 2nd half."
      );
    } else {
      Alert.alert(
        "Match Concluded",
        "The match has finished. Reset the match to start a new fixture."
      );
    }
  };

  const handleManualSync = async () => {
    const { flushOfflineQueue, getOfflineQueue } = require('../utils/offlineQueue');
    await flushOfflineQueue();
    const queue = await getOfflineQueue();
    setPendingOfflineCount(queue.length);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0E14' }}>
      
      {/* HEADER: PHASE & TIMER */}
      <View style={styles.liveHeader}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.liveHeaderSub}>{matchPhase}</Text>
            <Text style={[styles.liveHeaderSub, { color: '#3b82f6' }]}>[{matchType.toUpperCase()}]</Text>
          </View>
          <Text style={styles.clockText}>{formatTime(displaySeconds)}</Text>
        </View>
        {appMode === 'coach' && (
          <TouchableOpacity 
            style={[
              styles.phaseBtn,
              matchPhase === '1ST HALF' && { backgroundColor: '#eab308' },
              matchPhase === 'HALF-TIME' && { backgroundColor: '#39FF14' },
              matchPhase === '2ND HALF' && { backgroundColor: '#ef4444' },
            ]} 
            onPress={handlePhaseChange}
          >
            <Text style={[styles.phaseBtnText, matchPhase === 'HALF-TIME' && { color: '#0B0E14' }]}>
              {getPhaseButtonText()}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* OFFLINE QUEUE INDICATOR */}
      {pendingOfflineCount > 0 && (
        <View style={styles.offlineBanner}>
          <Text style={{ color: '#0B0E14', fontWeight: 'bold', fontSize: 12 }}>
            📡 {pendingOfflineCount} Event{pendingOfflineCount > 1 ? 's' : ''} Saved Offline
          </Text>
          <TouchableOpacity onPress={handleManualSync} style={{ backgroundColor: '#0B0E14', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 11 }}>Sync Now 🔄</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SCOREBOARD CONTAINER */}
      <View style={styles.scoreboardContainer}>
        {isPreMatch && appMode === 'coach' && (
          <View style={{ marginBottom: 12 }}>
            <TextInput 
              style={[
                styles.opponentInput,
                !opponentName.trim() && { borderColor: '#39FF14', borderWidth: 2, backgroundColor: 'rgba(57,255,20,0.15)' }
              ]} 
              placeholder="Enter Opponent Name (Required)..." 
              placeholderTextColor={!opponentName.trim() ? '#39FF14' : '#64748b'}
              value={opponentName}
              onChangeText={setOpponentName}
            />
            {/* 3-WAY MATCH TYPE SELECTOR */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 }}>
              <TouchableOpacity 
                style={[styles.fmtBtn, matchType === 'League' && styles.fmtBtnActive, { flex: 1, paddingVertical: 8, paddingHorizontal: 2 }]}
                onPress={() => setMatchType('League')}
              >
                <Text style={[styles.fmtBtnText, matchType === 'League' && styles.fmtBtnTextActive]} numberOfLines={1}>🏆 League</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fmtBtn, matchType === 'Cup' && styles.fmtBtnActive, { flex: 1, paddingVertical: 8, paddingHorizontal: 2 }]}
                onPress={() => setMatchType('Cup')}
              >
                <Text style={[styles.fmtBtnText, matchType === 'Cup' && styles.fmtBtnTextActive]} numberOfLines={1}>🥊 Cup</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fmtBtn, matchType === 'Friendly' && styles.fmtBtnActive, { flex: 1, paddingVertical: 8, paddingHorizontal: 2 }]}
                onPress={() => setMatchType('Friendly')}
              >
                <Text style={[styles.fmtBtnText, matchType === 'Friendly' && styles.fmtBtnTextActive]} numberOfLines={1}>🤝 Friendly</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SCORE VIEW */}
        <View style={styles.scoreboard}>
          <View style={styles.scoreCol}>
            <Text style={styles.scoreTeam} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
              {activeTeamObj?.name || 'Our Team'}
            </Text>
            <Text style={styles.scoreNum}>{teamScore}</Text>
          </View>
          <View style={styles.scoreColCenter}>
            <Text style={styles.scoreVs}>VS</Text>
          </View>
          <View style={styles.scoreCol}>
            <Text style={styles.scoreTeam} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
              {opponentName || 'Opponent'}
            </Text>
            <Text style={styles.scoreNum}>{opponentScore}</Text>
          </View>
        </View>
      </View>

      {/* HALF-TIME BULK SUBSTITUTIONS BANNER */}
      {isHalfTime && appMode === 'coach' && (
        <TouchableOpacity style={styles.halfTimeActionCard} onPress={openHalfTimeSubModal}>
          <View style={{ flex: 1 }}>
            <Text style={styles.htCardTitle}>🔄 Half-Time Team Talk & Bulk Subs</Text>
            <Text style={styles.htCardSub}>Stage and apply multiple changes together</Text>
          </View>
          <Text style={styles.htArrow}>Open ➔</Text>
        </TouchableOpacity>
      )}

      {/* ACTION BUTTONS (LOCKED OUTSIDE ACTIVE PLAY) */}
      {appMode === 'coach' && (
        <View style={styles.liveActionHeader}>
          {/* LOG GOAL */}
          <TouchableOpacity 
            style={[
              styles.topActionBtn, 
              { borderColor: '#39FF14' }, 
              !isGameActive && styles.btnDisabled
            ]} 
            onPress={isGameActive ? initGoalFlow : handleDisabledAction}
            activeOpacity={isGameActive ? 0.7 : 1}
          >
            <Text style={[styles.topActionText, !isGameActive && { color: '#64748b' }]}>
              {isGameActive ? '⚽ Log Goal' : '🔒 Log Goal'}
            </Text>
          </TouchableOpacity>

          {/* DISCIPLINARY */}
          <TouchableOpacity 
            style={[
              styles.topActionBtn, 
              { borderColor: '#eab308' }, 
              !isGameActive && styles.btnDisabled
            ]} 
            onPress={isGameActive ? initCardFlow : handleDisabledAction}
            activeOpacity={isGameActive ? 0.7 : 1}
          >
            <Text style={[styles.topActionText, !isGameActive && { color: '#64748b' }]}>
              {isGameActive ? '⚠️ Disciplinary' : '🔒 Disciplinary'}
            </Text>
          </TouchableOpacity>

          {/* COACH POTM */}
          <TouchableOpacity 
            style={[
              styles.topActionBtn, 
              { borderColor: '#3b82f6' }, 
              isPreMatch && styles.btnDisabled
            ]} 
            onPress={!isPreMatch ? () => setLiveEventMode('coach_motm') : handleDisabledAction}
            activeOpacity={!isPreMatch ? 0.7 : 1}
          >
            <Text style={[styles.topActionText, isPreMatch && { color: '#64748b' }]}>
              {!isPreMatch ? '⭐ Coach POTM' : '🔒 Coach POTM'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LIVE BROADCAST TICKER */}
      <View style={styles.tickerContainer}>
        {(liveTicker || []).length === 0 ? (
          <Text style={[styles.bulletText, { textAlign: 'center', marginTop: 15 }]}>
            Awaiting Kick-Off...
          </Text>
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

      {/* PITCH ROSTER & BENCH (SUBSTITUTIONS) */}
      {appMode === 'coach' && (
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.rosterHeaderRow}>
            <Text style={styles.sectionHeaderModal}>ON PITCH (STARTERS)</Text>
            <Text style={styles.rosterHint}>
              {isGameActive ? 'Tap player to substitute' : 'Locked outside active play'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {(onPitchPlayers || []).length === 0 ? <Text style={{ color: '#64748b' }}>No starters selected.</Text> : null}
            {(onPitchPlayers || []).map((p) => {
              if (!p) return null;
              return (
                <TouchableOpacity 
                  key={p.id} 
                  style={[
                    styles.livePlayerCard,
                    !isGameActive && { opacity: 0.45, borderColor: '#2E3A44' }
                  ]} 
                  onPress={() => {
                    if (!isGameActive) {
                      handleDisabledAction();
                      return;
                    }
                    setActiveLivePlayer(p);
                  }}
                >
                  <Text style={[styles.livePlayerPos, !isGameActive && { color: '#64748b' }]}>
                    {p.matchday_position || 'N/A'}
                  </Text>
                  <Text style={styles.livePlayerName} numberOfLines={1}>
                    #{p.squad_number} {p.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionHeaderModal, { marginTop: 30 }]}>BENCH (SUBS)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 40 }}>
            {(subs || []).length === 0 ? <Text style={{ color: '#64748b' }}>Bench is empty.</Text> : null}
            {(subs || []).map((p) => {
              if (!p) return null;
              return (
                <TouchableOpacity 
                  key={p.id} 
                  style={[
                    styles.livePlayerCard, 
                    { borderColor: '#2E3A44', backgroundColor: '#0B0E14' },
                    !isGameActive && { opacity: 0.45 }
                  ]} 
                  onPress={() => {
                    if (!isGameActive) {
                      handleDisabledAction();
                      return;
                    }
                    setActiveLivePlayer(p);
                  }}
                >
                  <Text style={[styles.livePlayerPos, { color: '#94a3b8' }]}>{p.matchday_position || 'N/A'}</Text>
                  <Text style={[styles.livePlayerName, { color: '#cbd5e1' }]} numberOfLines={1}>
                    #{p.squad_number} {p.name}
                  </Text>
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
  liveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1F26', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  liveHeaderSub: { color: '#39FF14', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  clockText: { color: '#ffffff', fontSize: 32, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  phaseBtn: { backgroundColor: '#39FF14', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 },
  phaseBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 14 },
  offlineBanner: { backgroundColor: '#eab308', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 },
  scoreboardContainer: { backgroundColor: '#0B0E14', borderBottomWidth: 1, borderBottomColor: '#2E3A44', padding: 15 },
  opponentInput: { backgroundColor: '#1A1F26', color: '#ffffff', padding: 10, borderRadius: 8, textAlign: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#2E3A44' },
  scoreboard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreCol: { flex: 1, alignItems: 'center' },
  scoreColCenter: { width: 50, alignItems: 'center' },
  scoreTeam: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
  scoreNum: { color: '#ffffff', fontSize: 40, fontWeight: 'bold' },
  scoreVs: { color: '#39FF14', fontSize: 16, fontWeight: 'bold' },
  fmtBtn: { backgroundColor: '#1A1F26', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#2E3A44', minWidth: 50, alignItems: 'center' },
  fmtBtnActive: { backgroundColor: '#39FF14', borderColor: '#39FF14' },
  fmtBtnText: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
  fmtBtnTextActive: { color: '#0B0E14' },
  halfTimeActionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0E14', padding: 14, marginHorizontal: 12, marginTop: 10, borderRadius: 12, borderWidth: 2, borderColor: '#39FF14' },
  htCardTitle: { color: '#39FF14', fontSize: 14, fontWeight: 'bold' },
  htCardSub: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  htArrow: { color: '#39FF14', fontSize: 13, fontWeight: 'bold' },
  liveActionHeader: { flexDirection: 'row', justifyContent: 'center', gap: 6, padding: 12, borderBottomWidth: 1, borderBottomColor: '#2E3A44', backgroundColor: '#0B0E14' },
  topActionBtn: { backgroundColor: '#1A1F26', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, borderWidth: 2, alignItems: 'center', flex: 1 },
  topActionText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  btnDisabled: { opacity: 0.35, backgroundColor: '#0e1217', borderColor: '#2E3A44' },
  tickerContainer: { backgroundColor: '#0B0E14', borderBottomWidth: 1, borderBottomColor: '#2E3A44', maxHeight: 150 },
  tickerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  tickerMin: { color: '#39FF14', fontWeight: 'bold', width: 35, fontSize: 12 },
  tickerIcon: { fontSize: 16, width: 25 },
  tickerMessage: { color: '#cbd5e1', fontSize: 13, flex: 1 },
  bulletText: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, lineHeight: 20 },
  content: { padding: 15 },
  rosterHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionHeaderModal: { color: '#39FF14', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase' },
  rosterHint: { color: '#64748b', fontSize: 11 },
  livePlayerCard: { backgroundColor: '#1A1F26', padding: 15, borderRadius: 10, minWidth: '45%', alignItems: 'center', flex: 1, borderWidth: 1, borderColor: '#39FF14' },
  livePlayerPos: { color: '#39FF14', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  livePlayerName: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});