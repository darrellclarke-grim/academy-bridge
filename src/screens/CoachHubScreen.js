import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CoachHubScreen({
  matchHistory = [],
  setIsMatchArchiveOpen,
  isRsvpListExpanded,
  setIsRsvpListExpanded,
  teamSheet = [],
  toggleRSVP,
  selectedGameState = 'level',
  setSelectedGameState,
  gameStateTactics = {},
  myLinkedPlayers = [],
  myChildId,
  setMyChildId,
  myChild = {},
  shareCoParentInvite
}) {
  const lastMatch = matchHistory[0];
  const availableCount = (teamSheet || []).filter(p => p && p.available).length;
  const totalCount = (teamSheet || []).length;

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
        return {
          ...player,
          rawVotes: votes,
          potmAwards: potmAwards[player.id] || 0,
          voteShare: share
        };
      })
      .sort((a, b) => b.rawVotes - a.rawVotes || b.potmAwards - a.potmAwards);
  }, [matchHistory, teamSheet]);

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

        {/* SQUAD MATCHDAY RSVPs */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHeaderRow} onPress={() => setIsRsvpListExpanded && setIsRsvpListExpanded(!isRsvpListExpanded)}>
            <View>
              <Text style={styles.cardTitle}>📋 SQUAD MATCHDAY RSVPs</Text>
              <Text style={styles.rsvpSummaryText}>
                ✅ {availableCount} IN | ❌ {totalCount - availableCount} OUT
              </Text>
            </View>
            <Text style={styles.expandArrow}>{isRsvpListExpanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>

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
                    {player.potmAwards}x Parent POTM • {player.voteShare}% of total votes
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

        {/* TOUCHLINE GAME-STATE CONTROLLER */}
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
            {selectedGameState === 'leading' ? 'PROTECT & PUNISH (Leading)' : selectedGameState === 'losing' ? 'HIGH PRESS CHASE (Losing)' : 'BALANCED PATIENCE (Level)'}
          </Text>

          <Text style={styles.bulletText}>Maintain structural balance between lines.</Text>
          <Text style={styles.bulletText}>Recognize when to accelerate attack vs reset play.</Text>

          <Text style={styles.shoutText}>
            📢 Touchline Shout: "See early, decide early! Keep trusting the connections!"
          </Text>
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
  expandArrow: { color: '#39FF14', fontSize: 14, fontWeight: 'bold' },
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
  familyBox: { backgroundColor: '#0B0E14', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#2E3A44', marginTop: 8 },
  familyName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  familySub: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginTop: 2, marginBottom: 10 },
  shareCodeBtn: { backgroundColor: '#1A1F26', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#39FF14', alignItems: 'center' },
  shareCodeBtnText: { color: '#39FF14', fontSize: 12, fontWeight: 'bold' }
});