import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TOUCHLINE_TACTICAL_SHOUTS = [
  // Defensive Unit
  { id: 'def-1', role: 'DEF', title: "Don't Bounce", cue: "Don't let it bounce! Attack the flight!" },
  { id: 'def-2', role: 'DEF', title: 'Drop & Protect', cue: 'Drop off together! Protect the space behind!' },
  { id: 'def-3', role: 'DEF', title: 'Step & Squeeze', cue: 'Step up together and squeeze the pitch!' },
  { id: 'def-4', role: 'DEF', title: 'Be Strong', cue: 'Body in front! Win the 50/50 cleanly!' },
  { id: 'def-5', role: 'DEF', title: 'RB/LB Overlap', cue: 'Full-back overlap the winger, give an option!' },
  { id: 'def-6', role: 'DEF', title: 'RB/LB Underlap', cue: 'Underlap through the half-space channel!' },
  { id: 'def-7', role: 'DEF', title: 'Show Down Line', cue: "Show them down the line, don't let them cut inside!" },
  { id: 'def-8', role: 'DEF', title: 'Tuck In Tight', cue: 'Tuck in tight on the weak side, narrow up!' },

  // Midfield Unit
  { id: 'mid-1', role: 'MID', title: 'Scan Shoulder', cue: 'Scan your shoulder before receiving!' },
  { id: 'mid-2', role: 'MID', title: 'Lock 2nd Ball', cue: 'Lock down the second ball and secure it!' },
  { id: 'mid-3', role: 'MID', title: 'Switch Play', cue: 'Switch play to the far side, plenty of room!' },
  { id: 'mid-4', role: 'MID', title: 'Apply Pressure', cue: "Apply pressure! Don't let them turn!" },
  { id: 'mid-5', role: 'MID', title: 'Body Shape', cue: 'Open your body to see both goals!' },

  // Attacking Unit
  { id: 'att-1', role: 'ATT', title: 'Hold Width', cue: 'Winger hold your width, pull their full-back out!' },
  { id: 'att-2', role: 'ATT', title: 'Back Post', cue: 'Attack the back post on the cross!' },
  { id: 'att-3', role: 'ATT', title: 'Off Shoulder', cue: "Play off the defender's blind shoulder!" },
  { id: 'att-4', role: 'ATT', title: 'Hold It Up', cue: 'Hold the ball up, bring the midfield in!' },
  { id: 'att-5', role: 'ATT', title: 'Near Post Run', cue: 'First to the near post across the defender!' },

  // Goalkeeper
  { id: 'gk-1', role: 'GK', title: 'Set Early', cue: 'Set early and stay on your toes!' },
  { id: 'gk-2', role: 'GK', title: 'Command Box', cue: 'Command your box, be loud on crosses!' },
  { id: 'gk-3', role: 'GK', title: 'Distribute Quick', cue: 'Look up early, quick distribution on counter!' },

  // Game-State / Team
  { id: 'all-1', role: 'ALL', title: 'Help Defend', cue: 'Everyone get back behind the ball, help defend!' },
  { id: 'all-2', role: 'ALL', title: '5-Sec Press', cue: 'Counter-press! 5-second reaction to win it back!' },
  { id: 'all-3', role: 'ALL', title: 'Game Control', cue: 'Manage the game, slow tempo down, keep possession!' },
  { id: 'all-4', role: 'ALL', title: 'Be Aggressive', cue: 'Be first to everything, win your duels!' }
];

export default function CoachHubScreen({
  matchHistory = [],
  setIsMatchArchiveOpen,
  isRsvpListExpanded,
  setIsRsvpListExpanded,
  teamSheet = [],
  toggleRSVP,
  batchToggleRSVP,
  selectedGameState = 'level',
  setSelectedGameState,
  gameStateTactics = {},
  myLinkedPlayers = [],
  myChildId,
  setMyChildId,
  myChild = {},
  shareCoParentInvite
}) {
  const [selectedShoutFilter, setSelectedShoutFilter] = useState('ALL');
  const [activeShoutBanner, setActiveShoutBanner] = useState(null);

  const lastMatch = matchHistory[0];
  const availableCount = (teamSheet || []).filter(p => p && p.available).length;
  const totalCount = (teamSheet || []).length;
  const allIn = totalCount > 0 && availableCount === totalCount;

  // Strict Alphabetical Sorting for stationary RSVP list
  const sortedTeamSheet = [...(teamSheet || [])].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  // Cumulative Parent Vote Leaderboard Calculation
  const parentVoteLeaderboard = useMemo(() => {
    const voteCounts = {};
    const potmAwards = {};
    let totalSeasonVotes = 0;

    (matchHistory || []).forEach(match => {
      if (match.parentVotes && typeof match.parentVotes === 'object') {
        Object.entries(match.parentVotes).forEach(([playerId, count]) => {
          voteCounts[playerId] = (voteCounts[playerId] || 0) + Number(count);
          totalSeasonVotes += Number(count);
        });
      }

      if (match.parentPotmId) {
        potmAwards[match.parentPotmId] = (potmAwards[match.parentPotmId] || 0) + 1;
      }
    });

    return (teamSheet || [])
      .map(player => {
        const votes = voteCounts[player.id] || 0;
        const share = totalSeasonVotes > 0 ? ((votes / totalSeasonVotes) * 100).toFixed(1) : '0.0';
        const officialPotm = player.parent_motm || potmAwards[player.id] || 0;
        return {
          ...player,
          rawVotes: votes,
          potmAwards: officialPotm,
          voteShare: share
        };
      })
      .sort((a, b) => b.potmAwards - a.potmAwards || b.rawVotes - a.rawVotes);
  }, [matchHistory, teamSheet]);

  // Dynamic Game-State Tactics Resolution
  const activeStateData = gameStateTactics[selectedGameState] || {
    title: selectedGameState === 'leading' ? 'PROTECT & PUNISH (Leading)' : selectedGameState === 'losing' ? 'HIGH PRESS CHASE (Losing)' : 'BALANCED PATIENCE (Level)',
    bullets: selectedGameState === 'leading' 
      ? ['Control match tempo with secure possession in Midfield 3rd.', 'Exploit space behind opposition high line on transition.']
      : selectedGameState === 'losing'
      ? ['Trigger high press immediately upon losing possession.', 'Commit full-backs into advanced half-spaces.']
      : ['Maintain structural balance between lines.', 'Recognize when to accelerate attack vs reset play.'],
    shout: selectedGameState === 'leading'
      ? '📢 Touchline Shout: "Stay composed! Make the ball do the work!"'
      : selectedGameState === 'losing'
      ? '📢 Touchline Shout: "Squeeze the pitch! Win it back high!"'
      : '📢 Touchline Shout: "See early, decide early! Keep trusting the connections!"'
  };

  const filteredShouts = useMemo(() => {
    if (selectedShoutFilter === 'ALL') return TOUCHLINE_TACTICAL_SHOUTS;
    return TOUCHLINE_TACTICAL_SHOUTS.filter(s => s.role === selectedShoutFilter);
  }, [selectedShoutFilter]);

  // Touchline-only pitchside prompt (no database writes or ticker broadcast)
  const handleShoutTap = (shout) => {
    setActiveShoutBanner(`📢 "${shout.cue}"`);
    setTimeout(() => {
      setActiveShoutBanner(null);
    }, 4500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>COMMAND CENTER</Text>
        <Text style={styles.headerTitle}>Matchday Hub</Text>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* LAST MATCH RESULT */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>🏆 LAST MATCH RESULT</Text>
            <TouchableOpacity style={styles.smallArchiveBtn} onPress={() => setIsMatchArchiveOpen && setIsMatchArchiveOpen(true)}>
              <Text style={styles.smallArchiveBtnText}>Match Archive ➔</Text>
            </TouchableOpacity>
          </View>

          {lastMatch ? (
            <View style={styles.matchResultRow}>
              <View style={[styles.badge, lastMatch.result === 'W' ? styles.winBadge : lastMatch.result === 'L' ? styles.lossBadge : styles.drawBadge]}>
                <Text style={styles.badgeText}>{lastMatch.result || 'D'}</Text>
              </View>
              <Text style={styles.matchResultText}>
                Us {lastMatch.team_score ?? 0} - {lastMatch.opponent_score ?? 0} {lastMatch.opponent_name || lastMatch.opponent || 'Opponent'} [{lastMatch.match_type ? lastMatch.match_type.toUpperCase() : 'LEAGUE'}]
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No match history archived yet this season.</Text>
          )}
        </View>

        {/* SQUAD MATCHDAY RSVPs WITH ADD ALL / REMOVE ALL */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <TouchableOpacity 
              style={{ flex: 1 }} 
              onPress={() => setIsRsvpListExpanded && setIsRsvpListExpanded(!isRsvpListExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardTitle}>📋 SQUAD MATCHDAY RSVPs</Text>
              <Text style={styles.rsvpSummaryText}>
                ✅ {availableCount} IN | ❌ {totalCount - availableCount} OUT
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {batchToggleRSVP && (
                <TouchableOpacity
                  style={[styles.batchBtn, allIn ? styles.batchBtnRemove : styles.batchBtnAdd]}
                  onPress={batchToggleRSVP}
                >
                  <Text style={[styles.batchBtnText, allIn ? styles.batchBtnTextRemove : styles.batchBtnTextAdd]}>
                    {allIn ? 'Remove All' : 'Add All'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                onPress={() => setIsRsvpListExpanded && setIsRsvpListExpanded(!isRsvpListExpanded)}
                style={styles.arrowTouchable}
              >
                <Text style={styles.expandArrow}>{isRsvpListExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isRsvpListExpanded && (
            <View style={{ marginTop: 15 }}>
              {sortedTeamSheet.map((p) => (
                <View key={p.id} style={styles.rsvpRow}>
                  <Text style={styles.rsvpPlayerName}>#{p.squad_number || 0} {p.name}</Text>
                  <TouchableOpacity
                    style={[styles.rsvpChip, p.available ? styles.rsvpChipIn : styles.rsvpChipOut]}
                    onPress={() => toggleRSVP && toggleRSVP(p)}
                  >
                    <Text style={styles.rsvpChipText}>{p.available ? '✅ IN' : '❌ OUT'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* CUMULATIVE PARENT VOTE LEADERBOARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>👪 PARENT VOTE LEADERBOARD</Text>
            <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: 'bold' }}>Season Total</Text>
          </View>

          {parentVoteLeaderboard.map((player, index) => {
            const rankColor = index === 0 ? '#EAB308' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#2E3A44';

            return (
              <View key={player.id} style={styles.leaderboardRow}>
                <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.playerName}>#{player.squad_number || 0} {player.name}</Text>
                  <Text style={styles.playerSubtext}>
                    {player.potmAwards}x Fan POTM • {player.voteShare}% vote share
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.voteCount}>
                    {player.rawVotes} <Text style={{ fontSize: 10, color: '#94A3B8' }}>votes</Text>
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* TOUCHLINE GAME-STATE CONTROLLER & TACTICAL SHOUTS BANK */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ TOUCHLINE GAME-STATE CONTROLLER</Text>
          
          <View style={styles.stateBtnRow}>
            {['leading', 'level', 'losing'].map((stateKey) => (
              <TouchableOpacity
                key={stateKey}
                style={[styles.stateBtn, selectedGameState === stateKey && styles.stateBtnActive]}
                onPress={() => setSelectedGameState && setSelectedGameState(stateKey)}
              >
                <Text style={[styles.stateBtnText, selectedGameState === stateKey && styles.stateBtnTextActive]}>
                  {stateKey.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.gameStateHeading}>
            {activeStateData.title}
          </Text>

          {(activeStateData.bullets || []).map((bullet, idx) => (
            <Text key={idx} style={styles.bulletText}>
              • {bullet}
            </Text>
          ))}

          {activeStateData.shout ? (
            <Text style={styles.shoutText}>{activeStateData.shout}</Text>
          ) : null}

          {activeShoutBanner && (
            <View style={styles.activeShoutToast}>
              <Text style={styles.activeShoutToastText}>{activeShoutBanner}</Text>
            </View>
          )}

          <View style={styles.shoutDivider} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={styles.subCardTitle}>TACTICAL SHOUTS BANK</Text>
            <Text style={styles.tapTipText}>Tap to prompt dugout cue</Text>
          </View>

          <View style={styles.shoutFilterRow}>
            {['ALL', 'DEF', 'MID', 'ATT', 'GK'].map((filterKey) => (
              <TouchableOpacity
                key={filterKey}
                style={[styles.shoutFilterBtn, selectedShoutFilter === filterKey && styles.shoutFilterBtnActive]}
                onPress={() => setSelectedShoutFilter(filterKey)}
              >
                <Text style={[styles.shoutFilterBtnText, selectedShoutFilter === filterKey && styles.shoutFilterBtnTextActive]}>
                  {filterKey}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.shoutsGrid}>
            {filteredShouts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.shoutChip}
                onPress={() => handleShoutTap(item)}
                activeOpacity={0.7}
              >
                <View style={styles.shoutBadge}>
                  <Text style={styles.shoutBadgeText}>{item.role}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shoutTitle}>{item.title}</Text>
                  <Text style={styles.shoutCue} numberOfLines={2}>"{item.cue}"</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* MY LINKED FAMILY PLAYER */}
        {myLinkedPlayers && myLinkedPlayers.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👨‍👩‍👦 MY LINKED FAMILY PLAYER</Text>
            
            {myLinkedPlayers.length > 1 && (
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {myLinkedPlayers.map(child => (
                  <TouchableOpacity
                    key={child.id}
                    style={[styles.stateBtn, (myChildId === child.id || myChild?.id === child.id) && styles.stateBtnActive]}
                    onPress={() => setMyChildId && setMyChildId(child.id)}
                  >
                    <Text style={[styles.stateBtnText, (myChildId === child.id || myChild?.id === child.id) && styles.stateBtnTextActive]}>
                      #{child.squad_number || 0} {child.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.familyBox}>
              <Text style={styles.familyName}>
                #{myChild?.squad_number || myLinkedPlayers[0]?.squad_number || 0} {myChild?.name || myLinkedPlayers[0]?.name}
              </Text>
              <Text style={styles.familySub}>
                Primary Role: <Text style={{ color: '#39FF14' }}>{myChild?.position || myLinkedPlayers[0]?.position || 'TBD'}</Text>
              </Text>
              <TouchableOpacity
                style={styles.shareCodeBtn}
                onPress={() => shareCoParentInvite && shareCoParentInvite(myChild?.name || myLinkedPlayers[0]?.name, myChild?.family_code || myLinkedPlayers[0]?.family_code)}
              >
                <Text style={styles.shareCodeBtnText}>🔑 Share Co-Parent Invite Code</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  content: { padding: 15 },
  card: { backgroundColor: '#1A1F26', borderRadius: 12, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#2E3A44' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5 },
  subCardTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 11, letterSpacing: 0.5 },
  tapTipText: { color: '#64748B', fontSize: 10, fontStyle: 'italic' },
  smallArchiveBtn: { backgroundColor: '#0B0E14', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#3B82F6' },
  smallArchiveBtnText: { color: '#3B82F6', fontSize: 11, fontWeight: 'bold' },
  matchResultRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  badge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  winBadge: { backgroundColor: '#15803D' },
  lossBadge: { backgroundColor: '#991B1B' },
  drawBadge: { backgroundColor: '#CA8A04' },
  badgeText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  matchResultText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, flex: 1 },
  emptyText: { color: '#64748B', fontSize: 12, fontStyle: 'italic', marginTop: 8 },
  rsvpSummaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  arrowTouchable: { padding: 6 },
  expandArrow: { color: '#39FF14', fontSize: 14, fontWeight: 'bold' },
  batchBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  batchBtnAdd: { backgroundColor: '#39FF14', borderColor: '#39FF14' },
  batchBtnRemove: { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#EF4444' },
  batchBtnText: { fontSize: 11, fontWeight: 'bold' },
  batchBtnTextAdd: { color: '#0B0E14' },
  batchBtnTextRemove: { color: '#EF4444' },
  rsvpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  rsvpPlayerName: { color: '#CBD5E1', fontSize: 13, fontWeight: 'bold' },
  rsvpChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  rsvpChipIn: { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: '#22C55E' },
  rsvpChipOut: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' },
  rsvpChipText: { fontSize: 11, fontWeight: 'bold', color: '#FFFFFF' },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0E14',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2E3A44'
  },
  rankBadge: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  rankText: { color: '#000000', fontWeight: 'bold', fontSize: 11 },
  playerName: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  playerSubtext: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  voteCount: { color: '#39FF14', fontWeight: 'bold', fontSize: 14 },
  stateBtnRow: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  stateBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#0B0E14', borderWidth: 1, borderColor: '#2E3A44', alignItems: 'center' },
  stateBtnActive: { backgroundColor: '#39FF14', borderColor: '#39FF14' },
  stateBtnText: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold' },
  stateBtnTextActive: { color: '#0B0E14' },
  gameStateHeading: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  bulletText: { color: '#CBD5E1', fontSize: 13, lineHeight: 18, marginBottom: 4 },
  shoutText: { color: '#39FF14', fontSize: 12, fontWeight: 'bold', marginTop: 10, fontStyle: 'italic' },
  shoutDivider: { height: 1, backgroundColor: '#2E3A44', marginVertical: 14 },
  shoutFilterRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  shoutFilterBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: '#0B0E14', borderWidth: 1, borderColor: '#2E3A44' },
  shoutFilterBtnActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  shoutFilterBtnText: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold' },
  shoutFilterBtnTextActive: { color: '#FFFFFF' },
  shoutsGrid: { gap: 8 },
  shoutChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0E14',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E3A44',
    gap: 10
  },
  shoutBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3B82F6'
  },
  shoutBadgeText: { color: '#3B82F6', fontSize: 9, fontWeight: 'bold' },
  shoutTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  shoutCue: { color: '#94A3B8', fontSize: 11, fontStyle: 'italic', marginTop: 1 },
  activeShoutToast: {
    backgroundColor: '#15803D',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center'
  },
  activeShoutToastText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  familyBox: { backgroundColor: '#0B0E14', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#2E3A44', marginTop: 8 },
  familyName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  familySub: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginTop: 2, marginBottom: 10 },
  shareCodeBtn: { backgroundColor: '#1A1F26', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#39FF14', alignItems: 'center' },
  shareCodeBtnText: { color: '#39FF14', fontSize: 12, fontWeight: 'bold' }
});