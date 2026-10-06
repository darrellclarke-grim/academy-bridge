import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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

  // Header Toggle inside Roles Tab ('role' | 'pitch')
  const [pitchMainTab, setPitchMainTab] = useState('role');
  // Sub-tab inside "Learn The Pitch" ('thirds' | 'zones18' | 'proZones' | 'jargon' | 'tips')
  const [pitchSubTab, setPitchSubTab] = useState('thirds');

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

  // Formatted Quiz Explanation Renderer with Subheadings
  const renderQuizExplanation = (explanation) => {
    if (!explanation) return null;

    const parts = explanation.split('\n').map(p => p.trim()).filter(Boolean);

    return (
      <View style={styles.explanationContentBox}>
        <Text style={styles.explanationHeaderTitle}>💡 TACTICAL ANALYSIS BREAKDOWN</Text>
        {parts.map((part, index) => {
          const upper = part.toUpperCase();
          const isOptimalHeader = upper.includes('OPTIMAL') || upper.includes('CORRECT') || upper.includes('BEST CHOICE');
          const isFailHeader = upper.includes('FAIL') || upper.includes('INCORRECT') || upper.includes('RISK') || upper.includes('WHY');
          const isOptionHeader = upper.startsWith('OPTION') || isOptimalHeader || isFailHeader;

          if (isOptionHeader) {
            return (
              <View key={index} style={styles.subHeadingBadgeRow}>
                <Text style={[
                  styles.optionBreakdownHeading,
                  isOptimalHeader ? { color: '#39FF14' } : isFailHeader ? { color: '#FF4D4D' } : { color: '#3B82F6' }
                ]}>
                  {isOptimalHeader && !part.startsWith('🟢') ? `🟢 ${part}` : isFailHeader && !part.startsWith('🔴') ? `🔴 ${part}` : part}
                </Text>
              </View>
            );
          }
          return (
            <Text key={index} style={styles.explanationBodyText}>
              • {part.replace(/^[•\-\*]\s*/, '')}
            </Text>
          );
        })}
      </View>
    );
  };

  // Reusable Native Real Football Pitch Vector Lines Component
  const renderRealPitchCanvas = (children) => (
    <View style={styles.pitchCanvasFrame}>
      {/* Top Goal Frame */}
      <View style={styles.pitchGoalTopFrame} />

      {/* Main Pitch Turf Canvas with Markings */}
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

        {/* Corner Arcs (Anchored inside pitch touchlines at 10px) */}
        <View style={[styles.cornerArc, { top: 10, left: 10, borderBottomRightRadius: 10 }]} />
        <View style={[styles.cornerArc, { top: 10, right: 10, borderBottomLeftRadius: 10 }]} />
        <View style={[styles.cornerArc, { bottom: 10, left: 10, borderTopRightRadius: 10 }]} />
        <View style={[styles.cornerArc, { bottom: 10, right: 10, borderTopLeftRadius: 10 }]} />

        {/* Overlay Content */}
        <View style={styles.pitchOverlayLayer}>
          {children}
        </View>
      </View>

      {/* Bottom Goal Frame */}
      <View style={styles.pitchGoalBottomFrame} />
    </View>
  );

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

      {/* SUB NAV TAB BAR */}
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

              {/* FAN POTM VOTE BUTTON */}
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

        {/* TAB 2: ROLE/S & TACTICAL MANUAL + QUIZ + LEARN THE PITCH */}
        {currentActiveTab === 'roles' && appMode !== 'parent' && (
          <>
            {/* TOP DUAL HEADER NAVIGATION BUTTONS */}
            <View style={styles.pitchHeaderNavRow}>
              <TouchableOpacity
                style={[styles.pitchHeaderBtn, pitchMainTab === 'role' && styles.pitchHeaderBtnActive]}
                onPress={() => setPitchMainTab('role')}
              >
                <Text style={[styles.pitchHeaderBtnText, pitchMainTab === 'role' && styles.pitchHeaderBtnTextActive]}>
                  ⚽ Learn My Role
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pitchHeaderBtn, pitchMainTab === 'pitch' && styles.pitchHeaderBtnActive]}
                onPress={() => setPitchMainTab('pitch')}
              >
                <Text style={[styles.pitchHeaderBtnText, pitchMainTab === 'pitch' && styles.pitchHeaderBtnTextActive]}>
                  🏟️ Learn The Pitch
                </Text>
              </TouchableOpacity>
            </View>

            {/* MODE A: LEARN MY ROLE */}
            {pitchMainTab === 'role' && (
              <>
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

                      {/* Options */}
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

                      {/* Explanation with formatted subheadings */}
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

            {/* MODE B: LEARN THE PITCH */}
            {pitchMainTab === 'pitch' && (
              <View style={{ marginBottom: 20 }}>
                {/* SUB-TABS: 3rds | 18 Zones | Pro Zones | Pitch Vocab | Tips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 15 }}>
                  <TouchableOpacity
                    style={[styles.pitchSubTabBtn, pitchSubTab === 'thirds' && styles.pitchSubTabBtnActive]}
                    onPress={() => setPitchSubTab('thirds')}
                  >
                    <Text style={[styles.pitchSubTabText, pitchSubTab === 'thirds' && styles.pitchSubTabTextActive]}>The 3rds</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.pitchSubTabBtn, pitchSubTab === 'zones18' && styles.pitchSubTabBtnActive]}
                    onPress={() => setPitchSubTab('zones18')}
                  >
                    <Text style={[styles.pitchSubTabText, pitchSubTab === 'zones18' && styles.pitchSubTabTextActive]}>18 Zones</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.pitchSubTabBtn, pitchSubTab === 'proZones' && styles.pitchSubTabBtnActive]}
                    onPress={() => setPitchSubTab('proZones')}
                  >
                    <Text style={[styles.pitchSubTabText, pitchSubTab === 'proZones' && styles.pitchSubTabTextActive]}>Pro Corridors</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.pitchSubTabBtn, pitchSubTab === 'jargon' && styles.pitchSubTabBtnActive]}
                    onPress={() => setPitchSubTab('jargon')}
                  >
                    <Text style={[styles.pitchSubTabText, pitchSubTab === 'jargon' && styles.pitchSubTabTextActive]}>Pitch Vocab</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.pitchSubTabBtn, pitchSubTab === 'tips' && styles.pitchSubTabBtnActive, { borderColor: '#39FF14' }]}
                    onPress={() => setPitchSubTab('tips')}
                  >
                    <Text style={[styles.pitchSubTabText, pitchSubTab === 'tips' && styles.pitchSubTabTextActive]}>💡 Tips & Hacks</Text>
                  </TouchableOpacity>
                </ScrollView>

                {/* SUB-TAB 1: THE 3RDS */}
                {pitchSubTab === 'thirds' && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>THE 3 BASIC PITCH ZONES (REAL PITCH VIEW)</Text>
                    <Text style={styles.bulletText}>The pitch is divided horizontally into 3 primary zones along the direction of play:</Text>

                    {/* REALISTIC VERTICAL FOOTBALL PITCH CANVAS */}
                    {renderRealPitchCanvas(
                      <View style={{ flex: 1 }}>
                        <View style={[styles.pitchOverlayThird, { backgroundColor: 'rgba(57, 255, 20, 0.22)', borderBottomWidth: 2, borderBottomColor: '#39FF14', borderStyle: 'dashed' }]}>
                          <View style={styles.pitchZoneBadge}>
                            <Text style={[styles.pitchZoneBadgeText, { color: '#39FF14' }]}>ATTACKING 3RD</Text>
                            <Text style={styles.pitchZoneSubText}>Creative • 1v1 Isolation • Shots</Text>
                          </View>
                        </View>

                        <View style={[styles.pitchOverlayThird, { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderBottomWidth: 2, borderBottomColor: '#3B82F6', borderStyle: 'dashed' }]}>
                          <View style={styles.pitchZoneBadge}>
                            <Text style={[styles.pitchZoneBadgeText, { color: '#3B82F6' }]}>MIDFIELD 3RD</Text>
                            <Text style={styles.pitchZoneSubText}>Control • Tempo • Breaking Lines</Text>
                          </View>
                        </View>

                        <View style={[styles.pitchOverlayThird, { backgroundColor: 'rgba(245, 158, 11, 0.18)' }]}>
                          <View style={styles.pitchZoneBadge}>
                            <Text style={[styles.pitchZoneBadgeText, { color: '#F59E0B' }]}>DEFENSIVE 3RD</Text>
                            <Text style={styles.pitchZoneSubText}>Low Risk • Build-Up • Safety First</Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* DESCRIPTIONS */}
                    <View style={styles.zoneDescCard}>
                      <Text style={[styles.zoneDescHeading, { color: '#39FF14' }]}>🔥 Attacking 3rd</Text>
                      <Text style={styles.zoneDescBody}>The area closest to opposition goal. Express creativity, isolation 1v1s, overloads, and high pressing.</Text>

                      <Text style={[styles.zoneDescHeading, { color: '#3B82F6', marginTop: 10 }]}>🧠 Midfield 3rd</Text>
                      <Text style={styles.zoneDescBody}>The engine room. Dictate match tempo, switch play, and execute line-breaking passes into forwards.</Text>

                      <Text style={[styles.zoneDescHeading, { color: '#F59E0B', marginTop: 10 }]}>🛡️ Defensive 3rd</Text>
                      <Text style={styles.zoneDescBody}>Low-risk territory. Clear communication, clean progression out from goalkeeper, and total box security.</Text>
                    </View>
                  </View>
                )}

                {/* SUB-TAB 2: THE 18 ADVANCED ZONES */}
                {pitchSubTab === 'zones18' && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>THE 18 ADVANCED PITCH ZONES</Text>
                    <Text style={styles.bulletText}>Professional academies divide the pitch into an 18-zone grid to measure spatial control. <Text style={{ color: '#39FF14', fontWeight: 'bold' }}>Zone 14 is the Golden Zone!</Text></Text>

                    {/* REALISTIC VERTICAL FOOTBALL PITCH CANVAS WITH 18 GRID */}
                    {renderRealPitchCanvas(
                      <View style={styles.grid18Container}>
                        {/* Row 1 (Attacking Penalty Box) */}
                        <View style={styles.grid18Row}>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>16</Text></View>
                          <View style={[styles.grid18Cell, styles.grid18BoxCell]}><Text style={styles.grid18Text}>17</Text></View>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>18</Text></View>
                        </View>

                        {/* Row 2 (Zone 14 Row) */}
                        <View style={styles.grid18Row}>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>13</Text></View>
                          <View style={[styles.grid18Cell, styles.grid18GoldenCell]}>
                            <Text style={styles.grid18GoldenText}>14 🌟</Text>
                          </View>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>15</Text></View>
                        </View>

                        {/* Row 3 (Attacking Midfield) */}
                        <View style={styles.grid18Row}>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>10</Text></View>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>11</Text></View>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>12</Text></View>
                        </View>

                        {/* Row 4 (Defensive Midfield) */}
                        <View style={styles.grid18Row}>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>7</Text></View>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>8</Text></View>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>9</Text></View>
                        </View>

                        {/* Row 5 (Build-up Area) */}
                        <View style={styles.grid18Row}>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>4</Text></View>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>5</Text></View>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>6</Text></View>
                        </View>

                        {/* Row 6 (Defensive Penalty Box) */}
                        <View style={styles.grid18Row}>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>1</Text></View>
                          <View style={[styles.grid18Cell, styles.grid18BoxCell]}><Text style={styles.grid18Text}>2</Text></View>
                          <View style={styles.grid18Cell}><Text style={styles.grid18Text}>3</Text></View>
                        </View>
                      </View>
                    )}

                    {/* ZONE 14 EXPLANATION CARD */}
                    <View style={styles.zoneDescCard}>
                      <Text style={[styles.zoneDescHeading, { color: '#39FF14' }]}>🌟 Zone 14 ("The Hole")</Text>
                      <Text style={styles.zoneDescBody}>The central area right outside the opponent's penalty box. Controlling Zone 14 yields the highest goal probability in modern football.</Text>

                      <Text style={[styles.zoneDescHeading, { color: '#3B82F6', marginTop: 10 }]}>⚡ Zones 13 & 15 (Advanced Half-Spaces)</Text>
                      <Text style={styles.zoneDescBody}>Flanking Zone 14. Excellent angles for diagonal through-balls and crossing into Zone 17.</Text>
                    </View>
                  </View>
                )}

                {/* SUB-TAB 3: PRO SPATIAL CORRIDORS (HALF-SPACE SPLIT ACROSS CENTER LINE INTO 'SPACE' & 'HALF') */}
                {pitchSubTab === 'proZones' && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>THE 5 PROFESSIONAL SPATIAL CORRIDORS</Text>
                    <Text style={styles.bulletText}>
                      Box-to-box central spine & half-spaces, with Left & Right Channels segmented into 6 tactical wide zones.
                    </Text>

                    {/* Header Label Bar Outside Pitch Turf (Clean Top Placement) */}
                    <View style={styles.corridorHeaderLabelBar}>
                      <Text style={styles.corridorLabelText}>LEFT CHANNEL</Text>
                      <Text style={[styles.corridorLabelText, { color: '#39FF14' }]}>HALF-SPACE</Text>
                      <Text style={styles.corridorLabelText}>CENTRAL</Text>
                      <Text style={[styles.corridorLabelText, { color: '#39FF14' }]}>HALF-SPACE</Text>
                      <Text style={styles.corridorLabelText}>RIGHT CHANNEL</Text>
                    </View>

                    {/* REALISTIC VERTICAL FOOTBALL PITCH CANVAS */}
                    {renderRealPitchCanvas(
                      <View style={styles.proCorridorCanvasContainer}>
                        {/* Col 1: Left Channel (6 Stacked Equal Segments with Thin Neon Lines) */}
                        <View style={styles.wideChannelCol}>
                          {[0, 1, 2, 3, 4, 5].map((_, idx) => (
                            <View key={idx} style={styles.wideSegmentCell}>
                              {idx < 5 && <View style={styles.thinNeonDividerLine} />}
                            </View>
                          ))}
                        </View>

                        {/* Col 2: Left Half-Space (Unsplit Box-to-Box Column with SPLIT SPACE & HALF Across Center Line) */}
                        <View style={styles.halfSpaceCol}>
                          <View style={styles.boxSpacerTop} />
                          <View style={[styles.boxToBoxSection, styles.corridorHighlightMiddle]}>
                            <View style={styles.centralHalfTop}>
                              <Text style={[styles.verticalCorridorLabelText, { color: '#39FF14' }]}>SPACE</Text>
                            </View>
                            <View style={styles.centralHalfBottom}>
                              <Text style={[styles.verticalCorridorLabelText, { color: '#39FF14' }]}>HALF</Text>
                            </View>
                          </View>
                          <View style={styles.boxSpacerBottom} />
                        </View>

                        {/* Col 3: Central Channel (Unsplit Box-to-Box Column with SPLIT CHANNEL & CENTRAL) */}
                        <View style={styles.centralChannelCol}>
                          <View style={styles.boxSpacerTop} />
                          <View style={styles.boxToBoxSection}>
                            <View style={styles.centralHalfTop}>
                              <Text style={styles.verticalCorridorLabelText}>CHANNEL</Text>
                            </View>
                            <View style={styles.centralHalfBottom}>
                              <Text style={styles.verticalCorridorLabelText}>CENTRAL</Text>
                            </View>
                          </View>
                          <View style={styles.boxSpacerBottom} />
                        </View>

                        {/* Col 4: Right Half-Space (Unsplit Box-to-Box Column with SPLIT SPACE & HALF Across Center Line) */}
                        <View style={styles.halfSpaceCol}>
                          <View style={styles.boxSpacerTop} />
                          <View style={[styles.boxToBoxSection, styles.corridorHighlightMiddle]}>
                            <View style={styles.centralHalfTop}>
                              <Text style={[styles.verticalCorridorLabelText, { color: '#39FF14' }]}>SPACE</Text>
                            </View>
                            <View style={styles.centralHalfBottom}>
                              <Text style={[styles.verticalCorridorLabelText, { color: '#39FF14' }]}>HALF</Text>
                            </View>
                          </View>
                          <View style={styles.boxSpacerBottom} />
                        </View>

                        {/* Col 5: Right Channel (6 Stacked Equal Segments with Thin Neon Lines) */}
                        <View style={styles.wideChannelCol}>
                          {[0, 1, 2, 3, 4, 5].map((_, idx) => (
                            <View key={idx} style={styles.wideSegmentCell}>
                              {idx < 5 && <View style={styles.thinNeonDividerLine} />}
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* CORRIDOR EXPLANATIONS */}
                    <View style={styles.zoneDescCard}>
                      <Text style={[styles.zoneDescHeading, { color: '#39FF14' }]}>🟩 Half-Space (Box-to-Box Goldmine)</Text>
                      <Text style={styles.zoneDescBody}>
                        Runs continuously between penalty boxes. Operating here forces opposition defenders into hesitation—too far wide for centre-backs, too narrow for full-backs!
                      </Text>

                      <Text style={[styles.zoneDescHeading, { color: '#3B82F6', marginTop: 10 }]}>🛣️ Left & Right Channels (6 Wide Segments)</Text>
                      <Text style={styles.zoneDescBody}>
                        Segmented into 6 zones along the touchlines outside the 18-yard boxes for wingers and wing-backs to isolate 1v1s or cross.
                      </Text>
                    </View>
                  </View>
                )}

                {/* SUB-TAB 4: PITCH VOCAB & MATCH JARGON */}
                {pitchSubTab === 'jargon' && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>ESSENTIAL MATCHDAY VOCABULARY</Text>
                    <Text style={styles.bulletText}>Clear, quick communication wins matches. Every Tactical Engine player must know these callouts:</Text>

                    <View style={styles.jargonItem}>
                      <Text style={styles.jargonTitle}>🏃‍♂️ "Down the Line"</Text>
                      <Text style={styles.jargonBody}>A vertical pass sent along the touchline into open space for a wide winger or overlapping full-back.</Text>
                    </View>

                    <View style={styles.jargonItem}>
                      <Text style={styles.jargonTitle}>📐 "Square It"</Text>
                      <Text style={styles.jargonBody}>Passing laterally straight across the pitch or face of goal to a teammate with a clearer angle.</Text>
                    </View>

                    <View style={styles.jargonItem}>
                      <Text style={styles.jargonTitle}>🗡️ "Play Me Through"</Text>
                      <Text style={styles.jargonBody}>Calling for a weighted pass into open space behind the defensive line for a sprinting forward.</Text>
                    </View>

                    <View style={styles.jargonItem}>
                      <Text style={styles.jargonTitle}>🔄 "On the Half-Turn"</Text>
                      <Text style={styles.jargonBody}>Receiving the ball angled sideways so you can see both the passer and the attacking goal in one fluid touch.</Text>
                    </View>

                    <View style={styles.jargonItem}>
                      <Text style={styles.jargonTitle}>🔁 "Overlap vs. Underlap"</Text>
                      <Text style={styles.jargonBody}>
                        <Text style={{ color: '#39FF14', fontWeight: 'bold' }}>Overlap:</Text> Passing around the outside of a teammate.{' '}
                        <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>Underlap:</Text> Sprinting inside through the half-space.
                      </Text>
                    </View>

                    <View style={styles.jargonItem}>
                      <Text style={styles.jargonTitle}>⚡ "Third-Man Run"</Text>
                      <Text style={styles.jargonBody}>A dummy runner draws defenders while a 3rd unseen player sprints into space to receive the pass.</Text>
                    </View>
                  </View>
                )}

                {/* SUB-TAB 5: TIPS & LEGAL RULE HACKS */}
                {pitchSubTab === 'tips' && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>💡 TACTICAL EXPLOITS & RULE HACKS</Text>
                    <Text style={styles.bulletText}>Clever ways to legally take advantage of IFAB Laws of the Game to gain a massive competitive edge:</Text>

                    <View style={styles.jargonItem}>
                      <Text style={styles.jargonTitle}>🚩 1. Extreme Offside Hack on Throw-Ins (Law 11)</Text>
                      <Text style={styles.jargonBody}>
                        <Text style={{ color: '#39FF14', fontWeight: 'bold' }}>The Rule:</Text> You CANNOT be offside directly from a throw-in!{'\n'}
                        <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>The Exploit:</Text> On long throw-ins, a striker can stand in an "extreme offside" position behind the opponent's entire defense next to the goalkeeper and legally score unchecked!
                      </Text>
                    </View>

                    <View style={styles.jargonItem}>
                      <Text style={styles.jargonTitle}>⚽ 2. Goal Kick Inside-the-Box Progression</Text>
                      <Text style={styles.jargonBody}>
                        <Text style={{ color: '#39FF14', fontWeight: 'bold' }}>The Rule:</Text> Teammates can legally receive goal kicks inside their own 18-yard box.{'\n'}
                        <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>The Exploit:</Text> Drop defenders inside the box to invite opposition high presses, creating massive space in midfield to break through in 2 passes.
                      </Text>
                    </View>

                    <View style={styles.jargonItem}>
                      <Text style={styles.jargonTitle}>⚡ 3. The Quick Free-Kick Blitz</Text>
                      <Text style={styles.jargonBody}>
                        <Text style={{ color: '#39FF14', fontWeight: 'bold' }}>The Rule:</Text> You have the legal right to restart play immediately unless you ask the ref to measure 10 yards.{'\n'}
                        <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>The Exploit:</Text> Never ask for a wall if an opponent turns their back—pass instantly to a teammate into goal while they argue.
                      </Text>
                    </View>

                    <View style={styles.jargonItem}>
                      <Text style={styles.jargonTitle}>🎯 4. Zero Offside on Corner Kicks & Goal Kicks</Text>
                      <Text style={styles.jargonBody}>
                        <Text style={{ color: '#39FF14', fontWeight: 'bold' }}>The Rule:</Text> No offside off corners, goal kicks, or throw-ins.{'\n'}
                        <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>The Exploit:</Text> On short corner routines or long goal kicks, attackers can stand in unmarkable positions behind the line.
                      </Text>
                    </View>

                    <View style={styles.jargonItem}>
                      <Text style={styles.jargonTitle}>🛡️ 5. Legal Ball Shielding Over the Touchline</Text>
                      <Text style={styles.jargonBody}>
                        <Text style={{ color: '#39FF14', fontWeight: 'bold' }}>The Rule:</Text> As long as the ball is within playing distance, you can block defenders without touching the ball.{'\n'}
                        <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>The Exploit:</Text> Shield rolling balls out of bounds without kicking them to win goal kicks or throw-ins without risk.
                      </Text>
                    </View>

                    <View style={styles.jargonItem}>
                      <Text style={styles.jargonTitle}>🧤 6. Goalkeeper Hand-to-Foot Release Exploits</Text>
                      <Text style={styles.jargonBody}>
                        <Text style={{ color: '#39FF14', fontWeight: 'bold' }}>The Rule:</Text> Goalkeepers can drop the ball from hands to feet to restart the 6-second hand count.{'\n'}
                        <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>The Exploit:</Text> Set the ball down inside the box to force opposition forwards to sprint out at you, opening up passing lanes.
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </>
        )}

        {/* TAB 3: REPORT CARD */}
        {currentActiveTab === 'radar' && (
          <>
            {renderRadarChart()}

            {/* COACH OBSERVATIONS & DEVELOPMENT NOTES */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>COACH OBSERVATIONS & DEVELOPMENT NOTES</Text>

              {activePlayer?.notes_weaknesses ? (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.sectionSubHeader}>🎯 AREAS FOR IMPROVEMENT</Text>
                  <Text style={styles.bulletText}>{activePlayer.notes_weaknesses}</Text>
                </View>
              ) : null}

              {activePlayer?.notes_communication ? (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.sectionSubHeader}>🗣️ COMMUNICATION & LEADERSHIP</Text>
                  <Text style={styles.bulletText}>{activePlayer.notes_communication}</Text>
                </View>
              ) : null}

              {activePlayer?.notes_notes ? (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.sectionSubHeader}>📝 GENERAL COACH NOTES</Text>
                  <Text style={styles.bulletText}>{activePlayer.notes_notes}</Text>
                </View>
              ) : null}

              {!activePlayer?.notes_weaknesses && !activePlayer?.notes_communication && !activePlayer?.notes_notes && (
                <Text style={styles.emptyText}>No coach observations recorded yet for this player.</Text>
              )}
            </View>

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
  
  // Dual Pitch Header Navigation
  pitchHeaderNavRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  pitchHeaderBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#1A1F26', borderWidth: 1, borderColor: '#2E3A44', alignItems: 'center' },
  pitchHeaderBtnActive: { backgroundColor: '#39FF14', borderColor: '#39FF14' },
  pitchHeaderBtnText: { color: '#94A3B8', fontSize: 14, fontWeight: 'bold' },
  pitchHeaderBtnTextActive: { color: '#0B0E14' },

  // Pitch Sub-Tabs
  pitchSubTabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0B0E14', borderWidth: 1, borderColor: '#2E3A44' },
  pitchSubTabBtnActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  pitchSubTabText: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold' },
  pitchSubTabTextActive: { color: '#FFFFFF' },

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
  subHeadingBadgeRow: { marginTop: 8, marginBottom: 3 },
  optionBreakdownHeading: { fontWeight: 'bold', fontSize: 13 },
  explanationBodyText: { color: '#CBD5E1', fontSize: 12, lineHeight: 18, marginBottom: 4 },

  // REAL FOOTBALL PITCH CANVAS STYLES
  pitchCanvasFrame: {
    width: '100%',
    marginVertical: 10,
    alignItems: 'center',
  },
  pitchGoalTopFrame: {
    width: 50,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    marginBottom: 2,
  },
  pitchGoalBottomFrame: {
    width: 50,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    marginTop: 2,
  },
  pitchTurfBody: {
    width: '100%',
    height: 380,
    backgroundColor: '#0D2B16', // Deep green turf
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
    width: 70,
    height: 70,
    marginLeft: -35,
    marginTop: -35,
    borderRadius: 35,
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
    height: 55,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  pitchGoalBoxTop: {
    position: 'absolute',
    top: 10,
    left: '36%',
    right: '36%',
    height: 20,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  pitchPenaltySpotTop: {
    position: 'absolute',
    top: 48,
    left: '50%',
    width: 4,
    height: 4,
    marginLeft: -2,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  pitchPenaltyArcTop: {
    position: 'absolute',
    top: 50,
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
    height: 55,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  pitchGoalBoxBottom: {
    position: 'absolute',
    bottom: 10,
    left: '36%',
    right: '36%',
    height: 20,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  pitchPenaltySpotBottom: {
    position: 'absolute',
    bottom: 48,
    left: '50%',
    width: 4,
    height: 4,
    marginLeft: -2,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  pitchPenaltyArcBottom: {
    position: 'absolute',
    bottom: 50,
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

  // OVERLAY LAYERS
  pitchOverlayLayer: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },

  // 3rds Pitch Diagram Overlay
  pitchOverlayThird: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pitchZoneBadge: {
    backgroundColor: 'rgba(11, 14, 20, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E3A44',
  },
  pitchZoneBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  pitchZoneSubText: {
    color: '#CBD5E1',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
  },
  zoneDescCard: {
    backgroundColor: '#0B0E14',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E3A44',
    marginTop: 5,
  },
  zoneDescHeading: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  zoneDescBody: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },

  // 18 Zones Grid Overlay
  grid18Container: {
    flex: 1,
  },
  grid18Row: {
    flex: 1,
    flexDirection: 'row',
  },
  grid18Cell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderStyle: 'dashed',
  },
  grid18BoxCell: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  grid18GoldenCell: {
    backgroundColor: 'rgba(57, 255, 20, 0.35)',
    borderColor: '#39FF14',
    borderWidth: 2,
    borderRadius: 4,
  },
  grid18Text: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  grid18GoldenText: {
    color: '#39FF14',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // PRO CORRIDORS STYLES
  corridorHeaderLabelBar: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#0B0E14',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2E3A44',
    marginBottom: 8,
  },
  corridorLabelText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  proCorridorCanvasContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  wideChannelCol: {
    width: '20%',
    flexDirection: 'column',
  },
  wideSegmentCell: {
    flex: 1,
    position: 'relative',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.35)',
  },
  thinNeonDividerLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    borderWidth: 0.5,
    borderColor: '#39FF14',
    borderStyle: 'dashed',
  },
  halfSpaceCol: {
    width: '20%',
    flexDirection: 'column',
  },
  centralChannelCol: {
    width: '20%',
    flexDirection: 'column',
  },
  boxSpacerTop: {
    height: 55, // Strictly matches top 18-yard penalty box depth
  },
  boxSpacerBottom: {
    height: 55, // Strictly matches bottom 18-yard penalty box depth
  },
  boxToBoxSection: {
    flex: 1,
    flexDirection: 'column',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#39FF14',
    borderStyle: 'dashed',
  },
  centralHalfTop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20, // Pushes upper label above the center circle
  },
  centralHalfBottom: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20, // Pushes lower label below the center circle
  },
  corridorHighlightMiddle: {
    backgroundColor: 'rgba(57, 255, 20, 0.28)',
    borderColor: '#39FF14',
    borderWidth: 1.5,
  },
  verticalCorridorLabelText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    transform: [{ rotate: '-90deg' }],
  },

  // Pitch Vocab Jargon List
  jargonItem: {
    backgroundColor: '#0B0E14',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E3A44',
    marginBottom: 10,
  },
  jargonTitle: {
    color: '#39FF14',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jargonBody: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },

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
  sectionSubHeader: { color: '#39FF14', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 6 },

  // RSVP
  rsvpBtn: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  rsvpActive: { backgroundColor: '#15803D' },
  rsvpInactive: { backgroundColor: '#991B1B' },
  rsvpBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }
});