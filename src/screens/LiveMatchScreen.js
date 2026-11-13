import { useEffect, useRef, useState } from 'react';
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
import { supabase } from '../supabase';

// Positional hierarchy ranking: ST (Top) -> Midfield -> Defense -> GK (Bottom)
const getTacticalRank = (posStr) => {
  if (!posStr) return 99;
  const p = String(posStr).toUpperCase().trim();

  // Attack
  if (['ST', 'CF', 'LS', 'RS'].some(x => p === x || p.startsWith(x))) return 10;
  if (['CAM', 'LAM', 'RAM', 'CAM/CF'].some(x => p === x || p.includes('CAM'))) return 11;
  if (['LW', 'LF', 'LF/LW/LM'].some(x => p === x || p.includes('LW') || p.includes('LF'))) return 20;
  if (['RW', 'RF', 'RF/RW/RM'].some(x => p === x || p.includes('RW') || p.includes('RF'))) return 21;

  // Midfield
  if (['CM', 'LCM', 'LDM', 'CDM'].some(x => p === x || p === 'LDM' || p === 'LCM')) return 30;
  if (['RCM', 'RDM'].some(x => p === x || p === 'RDM' || p === 'RCM')) return 31;
  if (['LM'].some(x => p === x)) return 32;
  if (['RM'].some(x => p === x)) return 33;

  // Defense
  if (['LB', 'LWB', 'LB/LWB'].some(x => p === x || p.includes('LB') || p.includes('LWB'))) return 40;
  if (['RB', 'RWB', 'RB/RWB'].some(x => p === x || p.includes('RB') || p.includes('RWB'))) return 41;
  if (['LCB'].some(x => p === x)) return 50;
  if (['RCB'].some(x => p === x)) return 51;
  if (['CB'].some(x => p === x || p.includes('CB'))) return 52;

  // GK
  if (['GK', 'SGK', 'GK/SGK'].some(x => p === x || p.includes('GK'))) return 90;

  return 80;
};

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
  const [fixtureSaveStatus, setFixtureSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const isDirtyRef = useRef(false);

  // 🛡️ ISOLATE STATE WHEN TEAM CHANGES
  useEffect(() => {
    if (activeTeamObj?.id) {
      useMatchdayStore.getState().setActiveTeamId(activeTeamObj.id);
      isDirtyRef.current = false;
      setFixtureSaveStatus('idle');
    }
  }, [activeTeamObj?.id]);

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

  // Disciplinary Store Selectors
  const disqualifiedPlayerIds = useMatchdayStore((state) => state.disqualifiedPlayerIds || []);
  const sinBins = useMatchdayStore((state) => state.sinBins || []);
  const removeSinBin = useMatchdayStore((state) => state.removeSinBin);

  // Multi-Staff Permission Check (Coaches, Admins, and Assistants share live match management)
  const isStaff = appMode === 'coach' || appMode === 'admin' || appMode === 'assistant';

  const isGameActive = matchPhase === '1ST HALF' || matchPhase === '2ND HALF';
  const isPreMatch = matchPhase === 'PRE-MATCH';
  const isHalfTime = matchPhase === 'HALF-TIME';

  // 💾 PERSIST PRE-MATCH FIXTURE (OPPONENT & MATCH TYPE) TO SUPABASE
  const persistPreMatchFixture = async (nextOpponent, nextMatchType) => {
    const teamId = activeTeamObj?.id;
    if (!teamId || !isStaff || !isPreMatch) return;

    setFixtureSaveStatus('saving');
    const payload = {
      matchPhase: 'PRE-MATCH',
      opponentName: (nextOpponent || '').trim(),
      matchType: nextMatchType || 'League',
      teamScore: 0,
      opponentScore: 0,
      matchStartTimestamp: null,
      accumulatedSeconds: 0,
      displaySeconds: 0
    };

    try {
      const { error } = await supabase
        .from('teams')
        .update({ live_match_state: payload })
        .eq('id', teamId);

      if (error) throw error;

      // Broadcast live update to any connected parent/fan/player devices
      const channel = supabase.channel(`team-realtime-${teamId}`);
      await channel.send({
        type: 'broadcast',
        event: 'match_state_sync',
        payload
      });

      isDirtyRef.current = false;
      setFixtureSaveStatus('saved');
    } catch (err) {
      console.warn('Fixture save warning:', err?.message);
      setFixtureSaveStatus('error');
    }
  };

  // Debounced auto-save 600ms after coach stops typing opponent name
  useEffect(() => {
    if (!isDirtyRef.current || !isPreMatch || !isStaff || !activeTeamObj?.id) return;

    setFixtureSaveStatus('saving');
    const timer = setTimeout(() => {
      persistPreMatchFixture(opponentName, matchType);
    }, 600);

    return () => clearTimeout(timer);
  }, [opponentName, matchType, isPreMatch, isStaff, activeTeamObj?.id]);

  const handleSelectMatchType = (type) => {
    setMatchType(type);
    persistPreMatchFixture(opponentName, type);
  };

  // ⚡ AUTO-RECOVERY & REALTIME WHISTLE DETECTOR (Prevents devices getting stuck on "Awaiting")
  useEffect(() => {
    if (!liveTicker || liveTicker.length === 0) return;

    const latestWhistle = liveTicker.find(e => e.icon === '⏱️' || e.icon === '🛑' || e.icon === '🏁');
    if (latestWhistle && latestWhistle.message) {
      if (latestWhistle.message.includes('1st Half Kick-Off') && matchPhase === 'PRE-MATCH') {
        useMatchdayStore.getState().setMatchPhase('1ST HALF');
      } else if (latestWhistle.message.includes('Half-Time') && matchPhase !== 'HALF-TIME' && matchPhase !== '2ND HALF' && matchPhase !== 'FULL-TIME') {
        useMatchdayStore.getState().setMatchPhase('HALF-TIME');
      } else if (latestWhistle.message.includes('2nd Half Kick-Off') && matchPhase !== '2ND HALF' && matchPhase !== 'FULL-TIME') {
        useMatchdayStore.getState().setMatchPhase('2ND HALF');
      } else if (latestWhistle.message.includes('Full-Time') && matchPhase !== 'FULL-TIME') {
        useMatchdayStore.getState().setMatchPhase('FULL-TIME');
      }
    }
  }, [liveTicker, matchPhase]);

  // 💡 KEEP-AWAKE INTEGRATION (PREVENTS SCREEN SLEEP DURING MATCHES)
  useEffect(() => {
    let KeepAwake;
    try {
      KeepAwake = require('expo-keep-awake');
    } catch (e) {}

    if (KeepAwake && KeepAwake.activateKeepAwakeAsync && KeepAwake.deactivateKeepAwake) {
      if (isGameActive) {
        KeepAwake.activateKeepAwakeAsync();
      } else {
        KeepAwake.deactivateKeepAwake();
      }
    }

    return () => {
      try {
        if (KeepAwake && KeepAwake.deactivateKeepAwake) {
          KeepAwake.deactivateKeepAwake();
        }
      } catch (e) {}
    };
  }, [isGameActive]);

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
        "Live play is paused. Use 'Half-Time Team Talk & Bulk Subs' to stage tactical changes for the 2nd half."
      );
    } else {
      Alert.alert(
        "Match Concluded",
        "The match has finished. Reset the match to record your next fixture."
      );
    }
  };

  const handleManualSync = async () => {
    const { flushOfflineQueue, getOfflineQueue } = require('../utils/offlineQueue');
    await flushOfflineQueue();
    const queue = await getOfflineQueue();
    setPendingOfflineCount(queue.length);
  };

  // Return player from Sin Bin to Bench / Squad pool
  const handleReleaseFromSinBin = async (sinBin) => {
    removeSinBin(sinBin.playerId);
    await supabase
      .from('players')
      .update({ matchday_position: 'Bench', is_starter: false })
      .eq('id', sinBin.playerId);

    Alert.alert(
      "Sin Bin Completed",
      `#${sinBin.squadNumber} ${sinBin.playerName} has completed their temporary dismissal and is eligible to re-enter play at the next stoppage.`
    );
  };

  // 1. FILTER ON-PITCH PLAYERS (EXCLUDES RED CARDS & ACTIVE SIN BINS)
  const activePitchPlayers = [...onPitchPlayers].filter(
    (p) => !disqualifiedPlayerIds.includes(p.id) && !sinBins.some((sb) => sb.playerId === p.id)
  );

  const outfieldStarters = activePitchPlayers
    .filter(p => !['GK', 'SGK', 'GK/SGK'].some(g => String(p.matchday_position || p.position).toUpperCase().includes(g)))
    .sort((a, b) => getTacticalRank(a.matchday_position || a.position) - getTacticalRank(b.matchday_position || b.position));

  const gkStarters = activePitchPlayers
    .filter(p => ['GK', 'SGK', 'GK/SGK'].some(g => String(p.matchday_position || p.position).toUpperCase().includes(g)));

  // 2. BENCH & DISCIPLINARY LISTS
  const eligibleSubs = [...subs]
    .filter((p) => !disqualifiedPlayerIds.includes(p.id) && !sinBins.some((sb) => sb.playerId === p.id))
    .sort((a, b) => getTacticalRank(a.position) - getTacticalRank(b.position));

  const sentOffPlayers = [...onPitchPlayers, ...subs].filter((p) =>
    disqualifiedPlayerIds.includes(p.id)
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0E14' }}>
      
      {/* HEADER: PHASE & RUNNING CLOCK */}
      <View style={styles.liveHeader}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.liveHeaderSub}>{matchPhase}</Text>
            <Text style={[styles.liveHeaderSub, { color: '#3b82f6' }]}>[{matchType.toUpperCase()}]</Text>
          </View>
          <Text style={styles.clockText}>{formatTime(displaySeconds)}</Text>
        </View>
        
        {isStaff && (
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
        {isPreMatch && isStaff && (
          <View style={{ marginBottom: 12 }}>
            <TextInput 
              style={[
                styles.opponentInput,
                !opponentName.trim() && { borderColor: '#39FF14', borderWidth: 2, backgroundColor: 'rgba(57,255,20,0.15)' }
              ]} 
              placeholder="Enter Opponent Name (Required)..." 
              placeholderTextColor={!opponentName.trim() ? '#39FF14' : '#64748b'} 
              value={opponentName} 
              onChangeText={(text) => {
                isDirtyRef.current = true;
                setOpponentName(text);
              }}
              onBlur={() => {
                if (isDirtyRef.current) {
                  persistPreMatchFixture(opponentName, matchType);
                }
              }}
              returnKeyType="done"
            />
            {/* 3-WAY MATCH TYPE SELECTOR */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 }}>
              <TouchableOpacity 
                style={[styles.fmtBtn, matchType === 'League' && styles.fmtBtnActive, { flex: 1, paddingVertical: 8, paddingHorizontal: 2 }]}
                onPress={() => handleSelectMatchType('League')}
              >
                <Text style={[styles.fmtBtnText, matchType === 'League' && styles.fmtBtnTextActive]} numberOfLines={1}>🏆 League</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fmtBtn, matchType === 'Cup' && styles.fmtBtnActive, { flex: 1, paddingVertical: 8, paddingHorizontal: 2 }]}
                onPress={() => handleSelectMatchType('Cup')}
              >
                <Text style={[styles.fmtBtnText, matchType === 'Cup' && styles.fmtBtnTextActive]} numberOfLines={1}>🥊 Cup</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fmtBtn, matchType === 'Friendly' && styles.fmtBtnActive, { flex: 1, paddingVertical: 8, paddingHorizontal: 2 }]}
                onPress={() => handleSelectMatchType('Friendly')}
              >
                <Text style={[styles.fmtBtnText, matchType === 'Friendly' && styles.fmtBtnTextActive]} numberOfLines={1}>🤝 Friendly</Text>
              </TouchableOpacity>
            </View>

            {/* CLOUD SYNC STATUS INDICATOR */}
            {fixtureSaveStatus !== 'idle' && (
              <Text style={{
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 'bold',
                marginTop: 6,
                color: fixtureSaveStatus === 'saved' ? '#39FF14' : fixtureSaveStatus === 'error' ? '#ef4444' : '#94a3b8'
              }}>
                {fixtureSaveStatus === 'saving' && '⏳ Saving upcoming fixture to cloud...'}
                {fixtureSaveStatus === 'saved' && '☁️ Upcoming fixture saved & visible to squad'}
                {fixtureSaveStatus === 'error' && '⚠️ Offline — fixture will sync when reconnected'}
              </Text>
            )}
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

      {/* 🟦 ACTIVE SIN BIN COUNTDOWN BANNERS */}
      {sinBins.length > 0 && (
        <View style={styles.sinBinContainer}>
          {sinBins.map((sb) => {
            const remainingSecs = Math.max(0, sb.returnSeconds - displaySeconds);
            const isExpired = remainingSecs === 0;

            return (
              <View
                key={sb.playerId}
                style={[
                  styles.sinBinBanner,
                  isExpired ? { borderColor: '#39FF14', backgroundColor: 'rgba(57,255,20,0.1)' } : {}
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sinBinBannerTitle, isExpired && { color: '#39FF14' }]}>
                    {isExpired ? '✅ SIN BIN EXPIRED' : '🟦 ACTIVE SIN BIN'}
                  </Text>
                  <Text style={styles.sinBinBannerSub}>
                    #{sb.squadNumber} {sb.playerName} • {isExpired ? 'Eligible to return at stoppage' : `${formatTime(remainingSecs)} remaining`}
                  </Text>
                </View>
                {isExpired && (
                  <TouchableOpacity
                    style={styles.sinBinReleaseBtn}
                    onPress={() => handleReleaseFromSinBin(sb)}
                  >
                    <Text style={styles.sinBinReleaseBtnText}>Return ➔</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* HALF-TIME BULK SUBSTITUTIONS BANNER */}
      {isHalfTime && isStaff && (
        <TouchableOpacity style={styles.halfTimeActionCard} onPress={openHalfTimeSubModal}>
          <View style={{ flex: 1 }}>
            <Text style={styles.htCardTitle}>🔄 Half-Time Team Talk & Bulk Subs</Text>
            <Text style={styles.htCardSub}>Stage and apply multiple changes together</Text>
          </View>
          <Text style={styles.htArrow}>Open ➔</Text>
        </TouchableOpacity>
      )}

      {/* COLLABORATIVE STAFF ACTION BUTTONS */}
      {isStaff && (
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

          {/* DISCIPLINARY (Available during active play and half-time) */}
          <TouchableOpacity 
            style={[
              styles.topActionBtn, 
              { borderColor: '#eab308' }, 
              (!isGameActive && !isHalfTime) && styles.btnDisabled
            ]} 
            onPress={(isGameActive || isHalfTime) ? initCardFlow : handleDisabledAction}
            activeOpacity={(isGameActive || isHalfTime) ? 0.7 : 1}
          >
            <Text style={[styles.topActionText, (!isGameActive && !isHalfTime) && { color: '#64748b' }]}>
              {(isGameActive || isHalfTime) ? '⚠️ Disciplinary' : '🔒 Disciplinary'}
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

      {/* LIVE EVENT TICKER STREAM */}
      <View style={styles.tickerContainer}>
        {(liveTicker || []).length === 0 ? (
          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
            <Text style={[styles.bulletText, { textAlign: 'center', color: '#94a3b8' }]}>
              {isPreMatch ? '⏱️ Awaiting Kick-Off...' : '⚡ Match underway • No live events logged yet'}
            </Text>
          </View>
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

      {/* PITCH ROSTER & BENCH */}
      {isStaff && (
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.rosterHeaderRow}>
            <Text style={styles.sectionHeaderModal}>
              ON PITCH ({outfieldStarters.length + gkStarters.length})
            </Text>
            <Text style={styles.rosterHint}>
              {isGameActive ? 'Tap player to substitute' : 'Locked outside active play'}
            </Text>
          </View>

          {/* OUTFIELD PAIRS (2-COLUMN BALANCED GRID) */}
          <View style={styles.outfieldGrid}>
            {outfieldStarters.length === 0 && gkStarters.length === 0 ? (
              <Text style={{ color: '#64748b' }}>No starters assigned to pitch.</Text>
            ) : null}

            {outfieldStarters.map((p) => (
              <TouchableOpacity 
                key={p.id} 
                style={[
                  styles.liveOutfieldCard,
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
                <View style={styles.cardHeader}>
                  <Text style={styles.livePlayerPos}>{p.matchday_position || p.position}</Text>
                  <Text style={styles.jerseyNum}>#{p.squad_number}</Text>
                </View>
                <Text style={styles.livePlayerName} numberOfLines={1}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* GOALKEEPER FULL-WIDTH CARD */}
          {gkStarters.map((p) => (
            <TouchableOpacity 
              key={p.id} 
              style={[
                styles.liveGkCard,
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
              <View style={styles.gkInnerRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.gkBadge}>🧤 GOALKEEPER</Text>
                  <Text style={styles.jerseyNum}>#{p.squad_number}</Text>
                  <Text style={styles.livePlayerName} numberOfLines={1}>{p.name}</Text>
                </View>
                <Text style={{ color: '#39FF14', fontSize: 11, fontWeight: 'bold' }}>
                  {isGameActive ? 'Tap for Quick Action ➔' : 'Locked'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* BENCH SUBSTITUTES */}
          <Text style={[styles.sectionHeaderModal, { marginTop: 24 }]}>
            BENCH (SUBS - {eligibleSubs.length})
          </Text>
          <View style={styles.outfieldGrid}>
            {eligibleSubs.length === 0 ? (
              <Text style={{ color: '#64748b' }}>Bench is empty.</Text>
            ) : null}

            {eligibleSubs.map((p) => (
              <TouchableOpacity 
                key={p.id} 
                style={[
                  styles.liveOutfieldCard, 
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
                <View style={styles.cardHeader}>
                  <Text style={[styles.livePlayerPos, { color: '#94a3b8' }]}>
                    {p.matchday_position || p.position}
                  </Text>
                  <Text style={styles.jerseyNum}>#{p.squad_number}</Text>
                </View>
                <Text style={[styles.livePlayerName, { color: '#cbd5e1' }]} numberOfLines={1}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 🟥 PERMANENTLY SENT OFF PLAYERS */}
          {sentOffPlayers.length > 0 && (
            <>
              <Text style={[styles.sectionHeaderModal, { marginTop: 24, color: '#ef4444' }]}>
                DISMISSED (RED CARDS - {sentOffPlayers.length})
              </Text>
              <View style={styles.outfieldGrid}>
                {sentOffPlayers.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.liveOutfieldCard, styles.dismissedCard]}
                    activeOpacity={1}
                    onPress={() => {
                      Alert.alert(
                        "Player Sent Off",
                        `#${p.squadNumber} ${p.name} was permanently dismissed via Red Card and cannot re-enter the match.`
                      );
                    }}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={[styles.livePlayerPos, { color: '#ef4444' }]}>🟥 SENT OFF</Text>
                      <Text style={styles.jerseyNum}>#{p.squad_number}</Text>
                    </View>
                    <Text style={[styles.livePlayerName, { color: '#ef4444', textDecorationLine: 'line-through' }]} numberOfLines={1}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
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
  sinBinContainer: { backgroundColor: '#0B0E14', paddingHorizontal: 12, paddingTop: 10 },
  sinBinBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1F26', padding: 10, borderRadius: 8, borderWidth: 1.5, borderColor: '#3b82f6', marginBottom: 6 },
  sinBinBannerTitle: { color: '#3b82f6', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  sinBinBannerSub: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  sinBinReleaseBtn: { backgroundColor: '#39FF14', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  sinBinReleaseBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 12 },
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
  outfieldGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  liveOutfieldCard: { backgroundColor: '#1A1F26', padding: 12, borderRadius: 10, width: '48.5%', borderWidth: 1, borderColor: '#39FF14' },
  dismissedCard: { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', opacity: 0.7 },
  liveGkCard: { backgroundColor: '#1A1F26', padding: 14, borderRadius: 10, width: '100%', borderWidth: 1.5, borderColor: '#39FF14', marginTop: 8 },
  gkInnerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gkBadge: { backgroundColor: '#39FF14', color: '#0B0E14', fontSize: 10, fontWeight: '900', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  livePlayerPos: { color: '#39FF14', fontSize: 12, fontWeight: 'bold' },
  jerseyNum: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
  livePlayerName: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' }
});