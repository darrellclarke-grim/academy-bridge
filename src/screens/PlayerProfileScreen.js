import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getPosCategory } from '../utils/positionHelpers';

export default function PlayerProfileScreen({
  myLinkedPlayers = [],
  teamSheet = [],
  activePlayerId,
  setActivePlayerId,
  activeFormation = '4-2-3-1',
  appMode = 'player', // 'coach' | 'parent' | 'player'
  teamAgeGroup = 'U16',
  playerTab = 'overview',
  setPlayerTab,
  matchHistory = [],
  setIsMatchArchiveOpen,
  liveTicker = [],
  activeTeamId,
  matchPhase = 'PRE-MATCH',
  hasVotedMotm = false,
  votedPlayerName = '',
  setLiveEventMode,
  scoutNotesInput = '',
  activePlayer = {},
  shareFanInvite,
  shareCoParentInvite,
  hasSecondaryRole = false,
  viewingRoleToggle = 'primary',
  setViewingRoleToggle,
  isGroupedRole = false,
  subRoleOptions = [],
  activeSubRole,
  setActiveSubRole,
  activeTactics = {},
  currentQuizIdx = 0,
  currentQuizList = [],
  currentQuiz = null,
  handleQuizAnswer,
  quizState = null,
  handleNextQuestion,
  handleRestartQuiz,
  renderProfileStatBar,
  toggleRSVP
}) {
  // Sync internal tab state if setPlayerTab prop is provided
  const [internalTab, setInternalTab] = useState('overview');
  const currentActiveTab = playerTab || internalTab;

  // Voting is strictly unlocked ONLY when the 2nd half is actively in play
  const isVotingUnlocked = matchPhase === '2ND HALF';
  const isVoteButtonDisabled = hasVotedMotm || !isVotingUnlocked;

  // Filter tabs by mode: Parents do NOT get the Role/s quiz tab
  const visibleTabs = appMode === 'parent'
    ? [
        { key: 'overview', label: 'Overview' },
        { key: 'radar', label: 'Report Card' },
        { key: 'rsvp', label: 'RSVP' }
      ]
    : [
        { key: 'overview', label: 'Overview' },
        { key: 'roles', label: 'Role/s' },
        { key: 'radar', label: 'Report Card' },
        { key: 'rsvp', label: 'RSVP' }
      ];

  // Prevent Parent Mode from remaining stuck on 'roles' tab if mode is switched
  useEffect(() => {
    if (appMode === 'parent' && currentActiveTab === 'roles') {
      changeTab('overview');
    }
  }, [appMode]);

  const changeTab = (tabKey) => {
    if (setPlayerTab) setPlayerTab(tabKey);
    setInternalTab(tabKey);
  };

  const squad = (teamSheet && teamSheet.length > 0) ? teamSheet : (myLinkedPlayers || []);
  const posCategory = getPosCategory(activePlayer?.position);

  // Formatted Quiz Explanation Renderer
  const renderQuizExplanation = (explanation) => {
    if (!explanation) return null;

    const parts = explanation.split('\n').map(p => p.trim()).filter(Boolean);

    return (
      <View style={styles.explanationContentBox}>
        <Text style={styles.explanationHeaderTitle}>💡 TACTICAL ANALYSIS BREAKDOWN</Text>
        {parts.map((part, index) => {
          const upper = part.toUpperCase();
          const isOptionHeader = upper.startsWith('OPTION') || 
                                 upper.startsWith('WHY') || 
                                 upper.startsWith('CORRECT:') || 
                                 upper.startsWith('INCORRECT:');

          if (isOptionHeader) {
            return (
              <Text key={index} style={styles.optionBreakdownHeading}>
                {part}
              </Text>
            );
          }
          return (
            <Text key={index} style={styles.explanationBodyText}>
              {part}
            </Text>
          );
        })}
      </View>
    );
  };

  // 4-Pillar Radar Chart Renderer
  const renderRadarChart = () => {
    const phy = Math.round(
      ((activePlayer?.phys_sprint || 5) +
        (activePlayer?.phys_accel || 5) +
        (activePlayer?.phys_stamina || 5) +
        (activePlayer?.phys_strength || 5) +
        (activePlayer?.phys_agility || 5)) / 5
    );
    const tec = Math.round(
      ((activePlayer?.tech_first_touch || 5) +
        (activePlayer?.tech_short_pass || 5) +
        (activePlayer?.tech_dribbling || 5) +
        (activePlayer?.tech_shooting_acc || 5) +
        (activePlayer?.tech_tackling || 5)) / 5
    );
    const tac = Math.round(
      ((activePlayer?.tact_awareness || 5) +
        (activePlayer?.tact_pressing || 5) +
        (activePlayer?.tact_instructions || 5) +
        (activePlayer?.tact_decision || 5)) / 4
    );
    const psy = Math.round(
      ((activePlayer?.psych_confidence || 5) +
        (activePlayer?.psych_workrate || 5) +
        (activePlayer?.psych_composure || 5) +
        (activePlayer?.psych_leadership || 5)) / 4
    );

    return (
      <View style={styles.radarCardBox}>
        <Text style={styles.cardTitle}>4-PILLAR RADAR PROFILE</Text>
        <View style={styles.radarGraphicContainer}>
          <View style={[styles.radarGridRing, { width: 220, height: 220 }]} />
          <View style={[styles.radarGridRing, { width: 150, height: 150 }]} />
          <View style={[styles.radarGridRing, { width: 80, height: 80 }]} />

          <View style={styles.radarAxisVertical} />
          <View style={styles.radarAxisHorizontal} />

          <Text style={[styles.radarLabel, { top: 0 }]}>PHY ({phy})</Text>
          <Text style={[styles.radarLabel, { bottom: 0 }]}>TAC ({tac})</Text>
          <Text style={[styles.radarLabel, { left: 0, top: '46%' }]}>TEC ({tec})</Text>
          <Text style={[styles.radarLabel, { right: 0, top: '46%' }]}>PSY ({psy})</Text>

          <View style={styles.radarDiamondShape} />
        </View>

        <View style={styles.radarLegendRow}>
          <Text style={styles.legendText}>🏃 PHY: {phy}</Text>
          <Text style={styles.legendText}>⚽ TEC: {tec}</Text>
          <Text style={styles.legendText}>🧠 TAC: {tac}</Text>
          <Text style={styles.legendText}>🔥 PSY: {psy}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* SQUAD / PLAYER SELECTOR CHIPS */}
      <View style={styles.selectorBar}>
        <Text style={styles.selectorLabel}>
          {appMode === 'parent' ? 'VIEWING PLAYER:' : 'SELECT PLAYER PROFILE:'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {squad.map((p) => {
            const isActive = (activePlayer?.id === p.id) || (activePlayerId === p.id);
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.playerChip, isActive && styles.playerChipActive]}
                onPress={() => setActivePlayerId && setActivePlayerId(p.id)}
              >
                <Text style={[styles.playerChipText, isActive && styles.playerChipTextActive]}>
                  #{p.squad_number || 0} {p.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* TACTICAL HUB BANNER */}
      <View style={styles.bannerRow}>
        <Text style={styles.bannerSub}>ACTIVE SYSTEM: {activeFormation}</Text>
        <Text style={styles.bannerTitle}>Matchday Tactical Hub</Text>
      </View>

      {/* SUB NAV TAB BAR (FILTERED BY MODE) */}
      <View style={styles.subTabBar}>
        {visibleTabs.map((tab) => {
          const isActive = currentActiveTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.subTab, isActive && styles.subTabActive]}
              onPress={() => changeTab(tab.key)}
            >
              <Text style={[styles.subTabText, isActive && styles.subTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* TAB 1: OVERVIEW */}
        {currentActiveTab === 'overview' && (
          <>
            {/* SEASON MATCHDAY STATS GRID */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>SEASON MATCHDAY STATS</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{activePlayer?.apps || 0}</Text>
                  <Text style={styles.statLabel}>Apps</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{Math.floor((activePlayer?.total_minutes_played || 0) / 60)}m</Text>
                  <Text style={styles.statLabel}>Minutes</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{activePlayer?.goals || 0}</Text>
                  <Text style={styles.statLabel}>Goals</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{activePlayer?.assists || 0}</Text>
                  <Text style={styles.statLabel}>Assists</Text>
                </View>
              </View>

              <View style={[styles.statsGrid, { marginTop: 10 }]}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{activePlayer?.motm || 0}</Text>
                  <Text style={styles.statLabel}>Coach POTM</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{activePlayer?.parent_motm || 0}</Text>
                  <Text style={styles.statLabel}>Fan POTM</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{activePlayer?.training_attended || 0}</Text>
                  <Text style={styles.statLabel}>Training</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{(activePlayer?.yellow_cards || 0) + (activePlayer?.red_cards || 0)}</Text>
                  <Text style={styles.statLabel}>Cards</Text>
                </View>
              </View>
            </View>

            {/* LIVE MATCHDAY TICKER FEED */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>LIVE MATCH TICKER</Text>
                <TouchableOpacity onPress={() => setIsMatchArchiveOpen && setIsMatchArchiveOpen(true)}>
                  <Text style={{ color: '#39FF14', fontWeight: 'bold', fontSize: 12 }}>Match Archive ➔</Text>
                </TouchableOpacity>
              </View>

              {matchPhase !== 'PRE-MATCH' && matchPhase !== 'FULL-TIME' && (
                <View style={styles.liveMatchStatusBadge}>
                  <Text style={styles.liveMatchStatusText}>🔴 LIVE MATCH IN PROGRESS ({matchPhase})</Text>
                </View>
              )}

              {(liveTicker || []).length === 0 ? (
                <Text style={styles.emptyText}>No live match events recorded yet.</Text>
              ) : (
                liveTicker.slice(0, 5).map((evt, idx) => (
                  <View key={idx} style={styles.tickerRow}>
                    <Text style={styles.tickerMinute}>{evt.minute || '0\''}</Text>
                    <Text style={styles.tickerIcon}>{evt.icon || '⚽'}</Text>
                    <Text style={styles.tickerMessage}>{evt.message || evt.text}</Text>
                  </View>
                ))
              )}

              {/* FAN POTM VOTE BUTTON (RESTRICTED TO PARENT MODE & 2ND HALF ONLY) */}
              {appMode === 'parent' && (
                <TouchableOpacity
                  style={[
                    styles.neonBtn,
                    { marginTop: 15, borderWidth: 1 },
                    hasVotedMotm
                      ? { backgroundColor: '#1A1F26', borderColor: '#39FF14' }
                      : isVotingUnlocked
                      ? { backgroundColor: '#39FF14', borderColor: '#39FF14' }
                      : { backgroundColor: '#0B0E14', borderColor: '#2E3A44' }
                  ]}
                  disabled={isVoteButtonDisabled}
                  onPress={() => setLiveEventMode && setLiveEventMode('parent_motm')}
                >
                  <Text
                    style={[
                      styles.neonBtnText,
                      hasVotedMotm
                        ? { color: '#39FF14' }
                        : isVotingUnlocked
                        ? { color: '#0B0E14' }
                        : { color: '#64748B' }
                    ]}
                  >
                    {hasVotedMotm
                      ? `🌟 Voted Fan POTM: ${votedPlayerName}`
                      : isVotingUnlocked
                      ? '🌟 Vote Fan Player of the Match'
                      : '🔒 Fan POTM Voting Unlocks in 2nd Half'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* OPPOSITION SCOUTING NOTES */}
            {!!scoutNotesInput && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>OPPOSITION SCOUTING REPORT</Text>
                <Text style={styles.bulletText}>{scoutNotesInput}</Text>
              </View>
            )}

            {/* FAMILY & FAN INVITES */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>SHARE PROFILE ACCESS</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                <TouchableOpacity
                  style={[styles.roleToggleBtn, { borderColor: '#3B82F6' }]}
                  onPress={() => shareFanInvite && shareFanInvite(activePlayer?.name, activePlayer?.family_code)}
                >
                  <Text style={[styles.roleToggleText, { color: '#3B82F6' }]}>📢 Share Fan Code</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleToggleBtn, { borderColor: '#39FF14' }]}
                  onPress={() => shareCoParentInvite && shareCoParentInvite(activePlayer?.name, activePlayer?.family_code)}
                >
                  <Text style={[styles.roleToggleText, { color: '#39FF14' }]}>👨‍👩‍👦 Share Parent Code</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* TAB 2: ROLE/S & TACTICAL MANUAL + QUIZ (PLAYER MODE ONLY) */}
        {currentActiveTab === 'roles' && appMode !== 'parent' && (
          <>
            <Text style={styles.sectionHeading}>Learn My Roles</Text>

            {/* PRIMARY / SECONDARY TOGGLES */}
            <View style={styles.roleToggleRow}>
              <TouchableOpacity
                style={[styles.roleToggleBtn, viewingRoleToggle === 'primary' && styles.roleToggleBtnActive]}
                onPress={() => setViewingRoleToggle && setViewingRoleToggle('primary')}
              >
                <Text style={[styles.roleToggleText, viewingRoleToggle === 'primary' && styles.roleToggleTextActive]}>
                  Primary: {activePlayer?.position || 'CM'}
                </Text>
              </TouchableOpacity>

              {hasSecondaryRole && (
                <TouchableOpacity
                  style={[styles.roleToggleBtn, viewingRoleToggle === 'secondary' && styles.roleToggleBtnActive]}
                  onPress={() => setViewingRoleToggle && setViewingRoleToggle('secondary')}
                >
                  <Text style={[styles.roleToggleText, viewingRoleToggle === 'secondary' && styles.roleToggleTextActive]}>
                    Secondary: {activePlayer?.secondary_position}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* SUB-ROLE BUTTON PICKER */}
            {isGroupedRole && (subRoleOptions || []).length > 0 && (
              <View style={styles.subRoleCard}>
                <Text style={styles.subRolePrompt}>Select Exact Matchday Role:</Text>
                <View style={styles.subRoleGroup}>
                  {subRoleOptions.map((code) => {
                    const isSel = activeSubRole === code;
                    return (
                      <TouchableOpacity
                        key={code}
                        style={[styles.subRoleBtn, isSel && styles.subRoleBtnActive]}
                        onPress={() => setActiveSubRole && setActiveSubRole(code)}
                      >
                        <Text style={[styles.subRoleBtnText, isSel && styles.subRoleBtnTextActive]}>
                          {code}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* TACTICAL INSTRUCTION BOX */}
            <View style={styles.tacticalBox}>
              <Text style={styles.tacticalBoxTitle}>{activeTactics?.title || `${activePlayer?.position || 'CM'} Role Guide`}</Text>

              <View style={styles.instructionBlock}>
                <Text style={styles.instructionHeader}>⚽ IN POSSESSION (ATTACKING)</Text>
                <Text style={styles.instructionBody}>
                  {activeTactics?.inPossession || 'Maintain passing lanes, move dynamically into open half-spaces, and offer progressive forward support.'}
                </Text>
              </View>

              <View style={styles.instructionBlock}>
                <Text style={styles.instructionHeader}>🛡️ OUT OF POSSESSION (DEFENDING)</Text>
                <Text style={styles.instructionBody}>
                  {activeTactics?.outOfPossession || 'Apply intense pressure on transition, force opposition wide, and protect central channels.'}
                </Text>
              </View>

              {!!activeTactics?.transition && (
                <View style={styles.instructionBlock}>
                  <Text style={styles.instructionHeader}>🔄 TRANSITION</Text>
                  <Text style={styles.instructionBody}>{activeTactics.transition}</Text>
                </View>
              )}
            </View>

            {/* INTERACTIVE TACTICAL QUIZ ENGINE */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>🧠 TACTICAL QUIZ & KNOWLEDGE CHECK</Text>
                <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: 'bold' }}>
                  {teamAgeGroup} Tier
                </Text>
              </View>

              {currentQuiz ? (
                <>
                  <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>
                    Question {currentQuizIdx + 1} of {currentQuizList.length}
                  </Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginBottom: 15, lineHeight: 22 }}>
                    {currentQuiz.question}
                  </Text>

                  {/* Multiple Choice Option Buttons */}
                  {(currentQuiz.options || []).map((opt, idx) => {
                    const isSelected = quizState?.selectedIdx === idx;
                    let btnStyle = styles.quizOptionBtn;
                    let txtStyle = styles.quizOptionText;

                    if (quizState?.answered) {
                      if (opt.isCorrect) {
                        btnStyle = [styles.quizOptionBtn, { backgroundColor: '#15803D', borderColor: '#22C55E' }];
                        txtStyle = [styles.quizOptionText, { color: '#FFFFFF' }];
                      } else if (isSelected && !opt.isCorrect) {
                        btnStyle = [styles.quizOptionBtn, { backgroundColor: '#7F1D1D', borderColor: '#EF4444' }];
                        txtStyle = [styles.quizOptionText, { color: '#FFFFFF' }];
                      }
                    }

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={btnStyle}
                        disabled={quizState?.answered}
                        onPress={() => handleQuizAnswer && handleQuizAnswer(idx, opt.isCorrect)}
                      >
                        <Text style={txtStyle}>{opt.text}</Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Formatted Explanation Box with Subheadings */}
                  {quizState?.answered && (
                    <View style={styles.explanationBox}>
                      <Text style={{ color: quizState.isCorrect ? '#39FF14' : '#EF4444', fontWeight: 'bold', fontSize: 15, marginBottom: 8 }}>
                        {quizState.isCorrect ? '✅ Correct Answer!' : '❌ Incorrect Selection'}
                      </Text>

                      {renderQuizExplanation(currentQuiz.explanation)}

                      {currentQuizIdx + 1 < currentQuizList.length ? (
                        <TouchableOpacity style={styles.neonBtn} onPress={handleNextQuestion}>
                          <Text style={styles.neonBtnText}>Next Question ➔</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity style={styles.neonBtn} onPress={handleRestartQuiz}>
                          <Text style={styles.neonBtnText}>🔄 Restart Quiz Module</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.emptyText}>No active tactical quizzes loaded for this role.</Text>
              )}
            </View>
          </>
        )}

        {/* TAB 3: REPORT CARD */}
        {currentActiveTab === 'radar' && (
          <>
            {renderRadarChart()}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>DETAILED ATTRIBUTE BREAKDOWN</Text>

              <Text style={styles.sectionSubHeader}>TECHNICAL ABILITIES</Text>
              {renderProfileStatBar ? (
                <>
                  {renderProfileStatBar('First Touch', activePlayer?.tech_first_touch)}
                  {renderProfileStatBar('Short Passing', activePlayer?.tech_short_pass)}
                  {renderProfileStatBar('Dribbling & Control', activePlayer?.tech_dribbling)}
                  {renderProfileStatBar('Shooting Accuracy', activePlayer?.tech_shooting_acc)}
                  {renderProfileStatBar('Tackling & Recovery', activePlayer?.tech_tackling)}
                </>
              ) : null}

              <Text style={[styles.sectionSubHeader, { marginTop: 15 }]}>PHYSICAL PROFILE</Text>
              {renderProfileStatBar ? (
                <>
                  {renderProfileStatBar('Sprint Speed', activePlayer?.phys_sprint)}
                  {renderProfileStatBar('Acceleration', activePlayer?.phys_accel)}
                  {renderProfileStatBar('Stamina & Engine', activePlayer?.phys_stamina)}
                  {renderProfileStatBar('Strength & Duels', activePlayer?.phys_strength)}
                </>
              ) : null}

              <Text style={[styles.sectionSubHeader, { marginTop: 15 }]}>TACTICAL & PSYCHOLOGICAL</Text>
              {renderProfileStatBar ? (
                <>
                  {renderProfileStatBar('Space Awareness', activePlayer?.tact_awareness)}
                  {renderProfileStatBar('Pressing Intelligence', activePlayer?.tact_pressing)}
                  {renderProfileStatBar('Confidence & Workrate', activePlayer?.psych_confidence)}
                  {renderProfileStatBar('Composure Under Pressure', activePlayer?.psych_composure)}
                </>
              ) : null}
            </View>
          </>
        )}

        {/* TAB 4: RSVP */}
        {currentActiveTab === 'rsvp' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>NEXT FIXTURE RSVP STATUS</Text>
            <Text style={styles.bulletText}>
              Confirm player availability for the upcoming matchday fixture:
            </Text>
            <TouchableOpacity
              style={[styles.rsvpBtn, activePlayer?.available ? styles.rsvpActive : styles.rsvpInactive]}
              onPress={() => toggleRSVP && toggleRSVP(activePlayer)}
            >
              <Text style={styles.rsvpBtnText}>
                {activePlayer?.available ? '✅ Confirmed Available' : '❌ Unavailable'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14' },
  selectorBar: { backgroundColor: '#1A1F26', paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  selectorLabel: { color: '#64748B', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  playerChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#0B0E14', borderWidth: 1, borderColor: '#2E3A44' },
  playerChipActive: { backgroundColor: '#39FF14', borderColor: '#39FF14' },
  playerChipText: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold' },
  playerChipTextActive: { color: '#0B0E14' },
  bannerRow: { padding: 20, backgroundColor: '#0B0E14' },
  bannerSub: { color: '#39FF14', fontWeight: 'bold', fontSize: 11, letterSpacing: 1 },
  bannerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  subTabBar: { flexDirection: 'row', backgroundColor: '#1A1F26', borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  subTab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  subTabActive: { borderBottomWidth: 3, borderBottomColor: '#39FF14' },
  subTabText: { color: '#64748B', fontWeight: 'bold', fontSize: 13 },
  subTabTextActive: { color: '#FFFFFF' },
  content: { padding: 15 },
  sectionHeading: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  roleToggleRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  roleToggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#1A1F26', borderWidth: 1, borderColor: '#2E3A44', alignItems: 'center' },
  roleToggleBtnActive: { borderColor: '#39FF14', backgroundColor: '#1A1F26' },
  roleToggleText: { color: '#94A3B8', fontSize: 13, fontWeight: 'bold' },
  roleToggleTextActive: { color: '#FFFFFF' },
  subRoleCard: { backgroundColor: '#1A1F26', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#2E3A44' },
  subRolePrompt: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, marginBottom: 10 },
  subRoleGroup: { flexDirection: 'row', gap: 10 },
  subRoleBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#0B0E14', borderWidth: 1, borderColor: '#2E3A44', alignItems: 'center' },
  subRoleBtnActive: { backgroundColor: '#39FF14', borderColor: '#39FF14' },
  subRoleBtnText: { color: '#94A3B8', fontSize: 14, fontWeight: 'bold' },
  subRoleBtnTextActive: { color: '#0B0E14' },
  tacticalBox: { backgroundColor: '#1A1F26', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#2E3A44', marginBottom: 15 },
  tacticalBoxTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  instructionBlock: { marginBottom: 15 },
  instructionHeader: { color: '#39FF14', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 6 },
  instructionBody: { color: '#CBD5E1', fontSize: 13, lineHeight: 20 },
  card: { backgroundColor: '#1A1F26', borderRadius: 12, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#2E3A44' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  statBox: { flex: 1, backgroundColor: '#0B0E14', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#2E3A44' },
  statNum: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  bulletText: { color: '#CBD5E1', fontSize: 13, lineHeight: 18, marginBottom: 10 },
  neonBtn: { backgroundColor: '#39FF14', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  neonBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 13 },
  emptyText: { color: '#64748B', fontSize: 12, fontStyle: 'italic' },

  // Ticker Feed
  liveMatchStatusBadge: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: '#EF4444', padding: 8, borderRadius: 6, marginBottom: 12, alignItems: 'center' },
  liveMatchStatusText: { color: '#EF4444', fontWeight: 'bold', fontSize: 11 },
  tickerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2E3A44', gap: 8 },
  tickerMinute: { color: '#39FF14', fontWeight: 'bold', fontSize: 12, width: 30 },
  tickerIcon: { fontSize: 14 },
  tickerMessage: { color: '#FFFFFF', fontSize: 13, flex: 1 },

  // Quiz Options & Formatted Breakdown
  quizOptionBtn: { backgroundColor: '#0B0E14', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44', marginBottom: 8 },
  quizOptionText: { color: '#CBD5E1', fontSize: 13, fontWeight: 'bold' },
  explanationBox: { backgroundColor: '#0B0E14', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44', marginTop: 12 },
  explanationContentBox: { marginBottom: 12 },
  explanationHeaderTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#2E3A44', paddingBottom: 4 },
  optionBreakdownHeading: { color: '#39FF14', fontWeight: 'bold', fontSize: 13, marginTop: 8, marginBottom: 3 },
  explanationBodyText: { color: '#CBD5E1', fontSize: 12, lineHeight: 18, marginBottom: 4 },

  // Radar Chart Graphic
  radarCardBox: { backgroundColor: '#1A1F26', borderRadius: 12, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#2E3A44', alignItems: 'center' },
  radarGraphicContainer: { width: 240, height: 240, justifyContent: 'center', alignItems: 'center', marginVertical: 20, position: 'relative' },
  radarGridRing: { position: 'absolute', borderRadius: 120, borderWidth: 1, borderColor: '#2E3A44' },
  radarAxisVertical: { position: 'absolute', width: 1, height: 220, backgroundColor: '#2E3A44' },
  radarAxisHorizontal: { position: 'absolute', width: 220, height: 1, backgroundColor: '#2E3A44' },
  radarLabel: { position: 'absolute', color: '#39FF14', fontSize: 11, fontWeight: 'bold' },
  radarDiamondShape: { width: 110, height: 110, transform: [{ rotate: '45deg' }], backgroundColor: 'rgba(57, 255, 20, 0.25)', borderWidth: 2, borderColor: '#39FF14' },
  radarLegendRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', width: '100%', borderTopWidth: 1, borderTopColor: '#2E3A44', paddingTop: 10 },
  legendText: { color: '#CBD5E1', fontSize: 11, fontWeight: 'bold' },
  sectionSubHeader: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 8 },

  // RSVP
  rsvpBtn: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  rsvpActive: { backgroundColor: '#15803D' },
  rsvpInactive: { backgroundColor: '#991B1B' },
  rsvpBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }
});