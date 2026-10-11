import * as Linking from 'expo-linking';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';
import { supabase } from '../supabase';

// Constants & Utilities
import { ageGroupOptions, profilePositions, profileSecondaryPositions } from '../constants/profileData';
import { formationCategories, formationCategories9v9, formationLayouts, gameStateTactics } from '../constants/tactics';
import { seedFullTeamRoster, seedSeasonStats, testOfflineQueueFlow } from '../utils/devSeeder';
import { enqueueOfflineEvent, flushOfflineQueue, getOfflineQueue } from '../utils/offlineQueue';
import { generatePlayerReportCard, generateSeasonPdfReport } from '../utils/pdfGenerator';
import {
  getFootednessString,
  getPosCategory,
  getSisterPositions,
  getSubRoleOptions,
  getYouTubeId,
  isPlayerEligibleForSlot,
  resolvePosForFormation
} from '../utils/positionHelpers';

// Modals
import CoachNotesStagingModal from '../modals/CoachNotesStagingModal';
import CreateTeamModal from '../modals/CreateTeamModal';
import FormationModal from '../modals/FormationModal';
import InviteModal from '../modals/InviteModal';
import MatchArchiveModal from '../modals/MatchArchiveModal';
import SeasonResetModal from '../modals/SeasonResetModal';
import StaffManagementModal from '../modals/StaffManagementModal';
import SubReasonModal from '../modals/SubReasonModal';
import TafeModal from '../modals/TafeModal';

// Screens
import CoachHubScreen from '../screens/CoachHubScreen';
import CustomTrainingScreen from '../screens/CustomTrainingScreen';
import LineupScreen from '../screens/LineupScreen';
import LiveMatchScreen from '../screens/LiveMatchScreen';
import PlayerProfileScreen from '../screens/PlayerProfileScreen';
import TeamSheetScreen from '../screens/TeamSheetScreen';
import TrainingScreen from '../screens/TrainingScreen';

// Global Zustand Matchday Store
import { useMatchdayStore } from '../store/useMatchdayStore';

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Cloud Data State
  const [trainingLibrary, setTrainingLibrary] = useState({ warmups: [], rondos: [], drills: [], ssgs: [] });
  const [seasonCurriculum, setSeasonCurriculum] = useState({});
  const [tacticalManual, setTacticalManual] = useState({});
  
  // YouTube Modal State
  const [activeVideoId, setActiveVideoId] = useState(null);

  // Multi-Team Management State
  const [myTeams, setMyTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [teamAgeGroup, setTeamAgeGroup] = useState('U16'); 
  const [teamLogoUrl, setTeamLogoUrl] = useState('');
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamAgeGroup, setNewTeamAgeGroup] = useState('U16');
  
  // Staff Management Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Creation Role State
  const [selectedCreationRole, setSelectedCreationRole] = useState('coach');

  // 2-Step Team Deletion State
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [deleteTeamConfirmText, setDeleteTeamConfirmText] = useState('');

  // 2-Step Season Rollover & Archive Vault State
  const [isSeasonResetModalOpen, setIsSeasonResetModalOpen] = useState(false);
  const [seasonResetConfirmText, setSeasonResetConfirmText] = useState('');
  const [isSeasonArchiveOpen, setIsSeasonArchiveOpen] = useState(false);
  const [seasonReports, setSeasonReports] = useState([]);
  const [viewingSeasonReport, setViewingSeasonReport] = useState(null);
  const [isSavingSeason, setIsSavingSeason] = useState(false);

  // Auth & Onboarding State
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authMessage, setAuthMessage] = useState({ text: '', type: '' });
  const [onboardingStep, setOnboardingStep] = useState('choose_path');
  const [familyCodeInput, setFamilyCodeInput] = useState('');

  // App Layout State
  const [appMode, setAppMode] = useState('coach'); // 'coach' | 'parent' | 'player'
  const [currentTab, setCurrentTab] = useState('coachHub'); 
  const [playerTab, setPlayerTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // PDF Export State
  const [isPdfExportModalOpen, setIsPdfExportModalOpen] = useState(false);
  const [pdfExportStep, setPdfExportStep] = useState('type'); 
  
  // Notes Staging State
  const [isNotesStagingModalOpen, setIsNotesStagingModalOpen] = useState(false);

  // Formation & Lineup State
  const [activeFormation, setActiveFormation] = useState('4-2-3-1');
  const [isFormationModalOpen, setIsFormationModalOpen] = useState(false);
  const [lineupViewMode, setLineupViewMode] = useState('pitch');

  // Squad Depth Role Filter State
  const [squadDepthFilter, setSquadDepthFilter] = useState('primary');

  // TAFE Engine State
  const [isTafeModalOpen, setIsTafeModalOpen] = useState(false);
  const [tafeStep, setTafeStep] = useState('backline'); 
  const [tafeBackline, setTafeBackline] = useState('');
  const [tafeSuggestions, setTafeSuggestions] = useState([]);
  const [tafeOther, setTafeOther] = useState([]);
  
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedGameState, setSelectedGameState] = useState('level');

  // Dynamic Session Builder State
  const [selectedWarmup, setSelectedWarmup] = useState(null);
  const [selectedDrill1, setSelectedDrill1] = useState(null);
  const [selectedDrill2, setSelectedDrill2] = useState(null);
  const [selectedSSG, setSelectedSSG] = useState(null);
  const [drillSelectorMode, setDrillSelectorMode] = useState(null);

  // Zustand Store Selectors
  const matchPhase = useMatchdayStore((s) => s.matchPhase);
  const setMatchPhase = useMatchdayStore((s) => s.setMatchPhase);
  const matchType = useMatchdayStore((s) => s.matchType);
  const setMatchType = useMatchdayStore((s) => s.setMatchType);
  const opponentName = useMatchdayStore((s) => s.opponentName);
  const setOpponentName = useMatchdayStore((s) => s.setOpponentName);
  const teamScore = useMatchdayStore((s) => s.teamScore);
  const setTeamScore = useMatchdayStore((s) => s.setTeamScore);
  const opponentScore = useMatchdayStore((s) => s.opponentScore);
  const setOpponentScore = useMatchdayStore((s) => s.setOpponentScore);
  const displaySeconds = useMatchdayStore((s) => s.displaySeconds);
  const setDisplaySeconds = useMatchdayStore((s) => s.setDisplaySeconds);
  const accumulatedSeconds = useMatchdayStore((s) => s.accumulatedSeconds);
  const setAccumulatedSeconds = useMatchdayStore((s) => s.setAccumulatedSeconds);
  const matchStartTimestamp = useMatchdayStore((s) => s.matchStartTimestamp);
  const setMatchStartTimestamp = useMatchdayStore((s) => s.setMatchStartTimestamp);
  const liveTicker = useMatchdayStore((s) => s.liveTicker);
  const setLiveTicker = useMatchdayStore((s) => s.setLiveTicker);
  const activeLivePlayer = useMatchdayStore((s) => s.activeLivePlayer);
  const setActiveLivePlayer = useMatchdayStore((s) => s.setActiveLivePlayer);
  const liveEventMode = useMatchdayStore((s) => s.liveEventMode);
  const setLiveEventMode = useMatchdayStore((s) => s.setLiveEventMode);
  const pendingEvent = useMatchdayStore((s) => s.pendingEvent);
  const setPendingEvent = useMatchdayStore((s) => s.setPendingEvent);
  const resetMatchState = useMatchdayStore((s) => s.resetMatchState);

  const [playerMinutesTracker, setPlayerMinutesTracker] = useState({});
  const [isPreMatchModalVisible, setIsPreMatchModalOpen] = useState(false);
  const [matchHistory, setMatchHistory] = useState([]);
  const [isMatchArchiveOpen, setIsMatchArchiveOpen] = useState(false);

  // In-Archive Goal & Assist Event Editing State
  const [editingArchiveMatch, setEditingArchiveMatch] = useState(null);
  const [editingArchiveEventIdx, setEditingArchiveEventIdx] = useState(null);
  const [archiveEditStep, setArchiveEditStep] = useState('none');
  const [selectedArchiveScorer, setSelectedArchiveScorer] = useState(null);
  
  // Substitution Reason Modal State
  const [subReasonModalState, setSubReasonModalState] = useState({
    visible: false,
    offPlayer: null,
    onPlayer: null
  });

  // FA League Table WebView State
  const [faLeagueUrl, setFaLeagueUrl] = useState('');
  const [isFaWebviewOpen, setIsFaWebviewOpen] = useState(false);

  // POTM Voting State
  const [hasVotedMotm, setHasVotedMotm] = useState(false);
  const [votedPlayerName, setVotedPlayerName] = useState('');

  // Role Learning Tool State
  const [viewingRoleToggle, setViewingRoleToggle] = useState('primary'); 
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizState, setQuizState] = useState(null);
  const [activeSubRole, setActiveSubRole] = useState(null);

  // Scouting & Training State
  const [scoutNotesInput, setScoutNotesInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [trainingRegister, setTrainingRegister] = useState({});
  const [isTrainingRegisterExpanded, setIsTrainingRegisterExpanded] = useState(false);
  
  // Squad & Lineup Management Modals
  const [editingPlayer, setEditingPlayer] = useState(null); 
  const [lineupAssignPlayer, setLineupAssignPlayer] = useState(null); 
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // 2-Step Deletion State
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newSquadNumber, setNewSquadNumber] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState('GK/SGK');
  const [newSecondaryPosition, setNewSecondaryPosition] = useState('None');
  const [newPlayerFootedness, setNewPlayerFootedness] = useState(3);

  const [teamSheet, setTeamSheet] = useState([]);
  const [myLinkedPlayers, setMyLinkedPlayers] = useState([]);
  const [isLoadingSheet, setIsLoadingSheet] = useState(true);
  const [activePlayerId, setActivePlayerId] = useState(null);
  const [myChildId, setMyChildId] = useState(null);

  const [isRsvpListExpanded, setIsRsvpListExpanded] = useState(false);

  // Dynamic Team & Age Group Resolution
  const activeTeamObj = myTeams.find(t => t.id === activeTeamId) || {};
  const effectiveAgeGroup = activeTeamObj?.age_group || teamAgeGroup || 'U16';
  const isAdultTeam = String(effectiveAgeGroup).toLowerCase().includes('adult');
  const is9v9Team = String(effectiveAgeGroup).toUpperCase() === 'U13';

  // 🛡️ SUPERUSER ROLE LOCKDOWN (Darrell.Clarke@me.com)
  const isSuperUser = 
    profile?.role === 'superuser' || 
    session?.user?.email?.toLowerCase() === 'darrell.clarke@me.com';

  // STRICT ROLE ENFORCEMENT
  useEffect(() => {
    if (!profile || !profile.role_configured) return;
    const role = profile.role;
    if (isSuperUser || role === 'superuser') return;

    if (role === 'coach' || role === 'assistant' || role === 'admin') {
      if (appMode !== 'coach') {
        setAppMode('coach');
        setCurrentTab('coachHub');
      }
    } else if (role === 'parent' || role === 'fan') {
      if (appMode !== 'parent') {
        setAppMode('parent');
        setCurrentTab('player');
      }
    } else if (role === 'player') {
      if (appMode !== 'player') {
        setAppMode('player');
        setCurrentTab('player');
      }
    }
  }, [profile, appMode, isSuperUser]);

  const activeLayout = formationLayouts[activeFormation] || formationLayouts['4-2-3-1'];
  const currentAvailablePositions = activeLayout.map(node => node.code);

  const onPitchPlayers = (teamSheet || []).filter(p => p && p.is_starter && p.available);
  const subs = (teamSheet || []).filter(p => p && !p.is_starter && p.available);
  const activePlayer = (teamSheet || []).find(p => p && p.id === activePlayerId) || {};
  const myChild = (teamSheet || []).find(p => p && p.id === myChildId) || {};
  
  const hasSecondaryRole = activePlayer?.secondary_position && activePlayer.secondary_position !== 'None';
  
  const rawRoleCode = viewingRoleToggle === 'primary' ? activePlayer?.position : activePlayer?.secondary_position;
  const subRoleOptions = getSubRoleOptions(rawRoleCode);
  const isGroupedRole = subRoleOptions.length > 1;
  const resolvedRoleCode = isGroupedRole ? (activeSubRole || subRoleOptions[0]) : rawRoleCode;
  
  const safeTacticalPos = resolvedRoleCode ? String(resolvedRoleCode).toUpperCase() : 'DEFAULT';
  const activeTactics = tacticalManual[safeTacticalPos] || tacticalManual['DEFAULT'] || { quizzes: [] };
  
  const rawQuizList = activeTactics?.quizzes || [];
  const currentQuizList = rawQuizList.filter(q => {
    if (!q.tier) return true;
    const tierStr = q.tier.toLowerCase();
    const ageLower = effectiveAgeGroup.toLowerCase();

    if (['u13', 'u14', 'u15'].includes(ageLower)) return tierStr.includes('academy');
    if (['u16', 'u17', 'u18'].includes(ageLower)) return tierStr.includes('reserve');
    return tierStr.includes('first');
  });

  const currentQuiz = currentQuizList[currentQuizIdx];

  const gkPlayers = (teamSheet || []).filter(p => p && getPosCategory(p.position) === 'GK');
  const outfieldPlayers = (teamSheet || []).filter(p => p && getPosCategory(p.position) !== 'GK');

  const activeWeekData = seasonCurriculum[selectedWeek] || {};

  const totalTeamApps = (teamSheet || []).reduce((sum, p) => sum + (p.apps || 0), 0);
  const isTafeDisabled = totalTeamApps === 0;

  useEffect(() => {
    async function changeOrientation() {
      if (activeVideoId) {
        await ScreenOrientation.unlockAsync();
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    }
    changeOrientation();
  }, [activeVideoId]);

  const initialUrl = Linking.useURL();

  useEffect(() => {
    if (initialUrl) {
      const parsed = Linking.parse(initialUrl);
      const codeParam = parsed.queryParams?.code;
      if (codeParam) {
        const cleanCode = String(codeParam).trim().toUpperCase();
        setFamilyCodeInput(cleanCode);
        setOnboardingStep('parent_notice'); 
      }
    }
  }, [initialUrl]);

  const openDrillVideo = (url) => {
    const videoId = getYouTubeId(url);
    if (videoId) {
      setActiveVideoId(videoId);
    } else {
      Alert.alert("Video Error", "Invalid or missing video URL.");
    }
  };

  const fetchCloudData = async () => {
    try {
      const { data: drillsData } = await supabase.from('training_drills').select('*').order('id', { ascending: true });

      if (drillsData && drillsData.length > 0) {
        const mappedDrills = drillsData.map(d => ({
          ...d,
          title: d.title || 'Tactical Drill',
          desc: d.tactical_objective || d.setup_instructions || '',
          description: d.tactical_objective || d.setup_instructions || '',
          videoUrl: d.video_url || '',
          setupGrid: d.setup_instructions,
          coachingTriggers: d.uefa_coaching_trigger,
          matchContext: d.tactical_objective
        }));

        const warmups = mappedDrills.filter(d => d.bucket === 1);
        const rondos = mappedDrills.filter(d => d.bucket === 2);
        const mainDrills = mappedDrills.filter(d => d.bucket === 3);
        const ssgs = mappedDrills.filter(d => d.bucket === 4);

        setTrainingLibrary({ warmups, rondos, drills: mainDrills, ssgs });

        if (warmups.length > 0) setSelectedWarmup(warmups[0]);
        if (rondos.length > 0) setSelectedDrill1(rondos[0]);
        if (mainDrills.length > 0) setSelectedDrill2(mainDrills[0]);
        if (ssgs.length > 0) setSelectedSSG(ssgs[0]);

        const { data: currData } = await supabase.from('season_curriculum').select('*').order('week_number', { ascending: true });

        if (currData && currData.length > 0) {
          const drillMap = new Map(mappedDrills.map(d => [d.id, d]));
          const builtCurriculum = {};

          currData.forEach(row => {
            const w = row.week_number;
            const wUp = drillMap.get(row.warm_up_id);
            const rondo = drillMap.get(row.rondo_id);
            const mainD = drillMap.get(row.main_drill_id);
            const ssg = drillMap.get(row.ssg_id);

            const weekPhases = [
              wUp ? { ...wUp, title: `Phase 1: Warm-Up (${wUp.title})` } : null,
              rondo ? { ...rondo, title: `Phase 2: Rondo (${rondo.title})` } : null,
              mainD ? { ...mainD, title: `Phase 3: Main Drill (${mainD.title})` } : null,
              ssg ? { ...ssg, title: `Phase 4: SSG (${ssg.title})` } : null
            ].filter(Boolean);

            builtCurriculum[w] = {
              theme: `${row.phase_name} -${row.focus_theme}`,
              principle: mainD?.title || 'Tactical Execution',
              question: mainD?.tactical_objective || 'How do we exploit space under pressure?',
              overviewVideoUrl: mainD?.video_url || rondo?.video_url,
              phases: weekPhases
            };
          });

          setSeasonCurriculum(builtCurriculum);
        }
      }

      const { data: rolesData } = await supabase.from('tactical_roles').select('*');
      const [batch1, batch2] = await Promise.all([
        supabase.from('tactical_quizzes').select('*').range(0, 1199),
        supabase.from('tactical_quizzes').select('*').range(1200, 2400)
      ]);

      const quizzesData = [...(batch1.data || []), ...(batch2.data || [])];

      if (rolesData && quizzesData) {
        const builtManual = {};

        const shuffleArray = (arr) => {
          const list = [...arr];
          for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
          }
          return list;
        };

        rolesData.forEach(r => {
          const rawCode = (r.role_code || r.code || '').toUpperCase();

          const roleQuizzes = quizzesData.filter(q => q.role_code === r.role_code).map(q => {
            const rawOptions = [
              { text: q.option_a, isCorrect: q.correct_option === 'A' },
              { text: q.option_b, isCorrect: q.correct_option === 'B' },
              { text: q.option_c, isCorrect: q.correct_option === 'C' }
            ];

            return {
              question: q.question,
              options: shuffleArray(rawOptions),
              explanation: q.explanation,
              tier: (q.tier || '').toLowerCase()
            };
          });
          
          const roleObj = {
            title: r.title || r.name || rawCode,
            inPossession: r.in_possession || '',
            outOfPossession: r.out_of_possession || '',
            transition: r.transition || '',
            creatingSpace: r.creating_space || '',
            quizzes: roleQuizzes
          };
          
          builtManual[rawCode] = roleObj;

          if (rawCode === 'CAM') builtManual['CAM/CF'] = roleObj;
          if (rawCode === 'GK') builtManual['GK/SGK'] = roleObj;
          if (rawCode === 'LB') builtManual['LB/LWB'] = roleObj;
          if (rawCode === 'RB') builtManual['RB/RWB'] = roleObj;
          if (rawCode === 'LW') builtManual['LF/LW/LM'] = roleObj;
          if (rawCode === 'RW') builtManual['RF/RW/RM'] = roleObj;
        });

        builtManual['DEFAULT'] = {
          title: 'Role Assignment Pending',
          inPossession: 'No tactical data found in Supabase.',
          outOfPossession: 'No tactical data found in Supabase.',
          transition: 'No tactical data found in Supabase.',
          creatingSpace: 'No tactical data found in Supabase.',
          quizzes: []
        };

        setTacticalManual(builtManual);
      }
    } catch (err) {
      console.error("Critical Error fetching cloud data:", err);
    }
  };
  async function broadcastEvent(icon, text, explicitMinute = null) {
    if (!activeTeamId) return;
    const min = explicitMinute || `${Math.floor(displaySeconds / 60)}'`;
    const newEvent = { minute: min, icon, message: text, team_id: activeTeamId };
    
    setLiveTicker((prev) => [newEvent, ...(prev || [])]);

    try {
      const { error } = await supabase.from('live_ticker').insert([newEvent]);
      if (error) throw error;
    } catch (err) {
      console.warn("⚠️ Signal drop: Enqueuing event locally to device storage.");
      await enqueueOfflineEvent({ table: 'live_ticker', payload: newEvent });
      const queue = await getOfflineQueue();
      useMatchdayStore.getState().setPendingOfflineCount(queue.length);
    }
  }

  async function fetchLiveTicker(teamId) {
    if (!teamId) return;
    const { data } = await supabase
      .from('live_ticker')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) setLiveTicker(data || []);
  }

  async function fetchMatchHistory(teamId) {
    if (!teamId) return;
    const { data, error } = await supabase
      .from('match_history')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Fetch Match History Error:", error);
    } else if (data) {
      setMatchHistory(data);
    }
  }

  async function fetchSeasonReports(teamId) {
    if (!teamId) return;
    const { data, error } = await supabase
      .from('season_reports')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSeasonReports(data);
    }
  }

  // 🔑 ISOLATED TEAM FETCHING FOR MULTI-TEAM STAFF
  async function fetchUserProfile(userId) {
    setLoading(true);
    const startTime = Date.now();

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile(profileData);
        if (profileData.role === 'coach' || profileData.role === 'assistant' || profileData.role === 'admin') {
          setAppMode('coach');
          setCurrentTab('coachHub');
        }
      }

      // Fetch staff links for this user
      const { data: staffLinks } = await supabase
        .from('team_staff')
        .select('team_id')
        .eq('user_id', userId);

      const linkedTeamIds = (staffLinks || []).map(s => s.team_id);

      let teamQuery = supabase.from('teams').select('*');
      if (linkedTeamIds.length > 0) {
        teamQuery = teamQuery.or(`created_by.eq.${userId},id.in.(${linkedTeamIds.join(',')})`);
      } else {
        teamQuery = teamQuery.eq('created_by', userId);
      }

      const { data: teamsData } = await teamQuery;

      if (teamsData && teamsData.length > 0) {
        setMyTeams(teamsData);
        const resolvedTeamId = activeTeamId && teamsData.some(t => t.id === activeTeamId)
          ? activeTeamId
          : teamsData[0].id;

        setActiveTeamId(resolvedTeamId);
        const activeTeam = teamsData.find(t => t.id === resolvedTeamId);
        if (activeTeam?.age_group) setTeamAgeGroup(activeTeam.age_group);
      } else {
        setMyTeams([]);
      }
    } catch (err) {
      console.error("❌ Critical Error in fetchUserProfile:", err);
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingDelay = Math.max(0, 1000 - elapsedTime);
      setTimeout(() => setLoading(false), remainingDelay);
    }
  }

  async function handleSignOut() {
    setSession(null);
    setProfile(null);
    setMyTeams([]);
    setActiveTeamId(null);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out warning:", err);
    }
  }

  async function handleAuth() {
    Keyboard.dismiss();
    setAuthMessage({ text: '', type: '' });

    if (!email || !password) {
      setAuthMessage({ text: 'Please enter email and password.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setAuthMessage({ text: error.message, type: 'error' });
          setLoading(false);
        } else if (data.user) {
          await supabase.from('profiles').upsert([{
            id: data.user.id,
            email,
            full_name: fullName,
            role_configured: false
          }]);

          if (!data.session) {
            setAuthMessage({ text: 'Account created! Switch to Sign In.', type: 'success' });
            setLoading(false);
          } else {
            await fetchUserProfile(data.user.id);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setAuthMessage({ text: error.message, type: 'error' });
          setLoading(false);
        } else if (data.user) {
          await fetchUserProfile(data.user.id);
        }
      }
    } catch (err) {
      console.error("❌ Auth Error:", err);
      setAuthMessage({ text: err.message || 'Authentication error occurred.', type: 'error' });
      setLoading(false);
    }
  }

  useEffect(() => {
    let initialMount = true;
    fetchCloudData();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id).finally(() => {
          initialMount = false;
        });
      } else {
        setLoading(false);
        initialMount = false;
      }
    }).catch((err) => {
      console.error("Session fetch error:", err);
      setLoading(false);
      initialMount = false;
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        setSession(session);
        return; 
      }

      if (!initialMount) {
        setSession(session);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const offlineSyncInterval = setInterval(async () => {
      const result = await flushOfflineQueue();
      if (result.flushedCount > 0 || result.remainingCount !== undefined) {
        const queue = await getOfflineQueue();
        useMatchdayStore.getState().setPendingOfflineCount(queue.length);
      }
    }, 15000);

    return () => clearInterval(offlineSyncInterval);
  }, []);

  useEffect(() => {
    setQuizState(null);
    setCurrentQuizIdx(0);
    setActiveSubRole(null); 
  }, [activePlayerId, viewingRoleToggle, playerTab]);

  useEffect(() => {
    if (appMode === 'parent' && isAdultTeam && playerTab !== 'overview') {
      setPlayerTab('overview');
    }
  }, [appMode, effectiveAgeGroup, playerTab]);

  useEffect(() => {
    if (activeTeamId) {
      supabase
        .from('teams')
        .select('fa_league_table_url, age_group, logo_url, default_formation')
        .eq('id', activeTeamId)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setFaLeagueUrl(data.fa_league_table_url || '');
            const ageGrp = data.age_group || 'U16';
            setTeamAgeGroup(ageGrp);
            if (data.logo_url) setTeamLogoUrl(data.logo_url || '');

            const is9v9 = String(ageGrp).toUpperCase() === 'U13';
            const teamFmt = data.default_formation || (is9v9 ? '3-3-2' : '4-2-3-1');

            setActiveFormation(teamFmt);
            setMyTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, default_formation: teamFmt, age_group: ageGrp } : t));
          }
        });

      fetchTeamData(session?.user?.id, activeTeamId);
      fetchMatchNotes(activeTeamId);
      fetchLiveTicker(activeTeamId);
      fetchMatchHistory(activeTeamId);
      fetchSeasonReports(activeTeamId);
    }
  }, [activeTeamId]);

  useEffect(() => {
    let interval;
    if ((matchPhase === '1ST HALF' || matchPhase === '2ND HALF') && matchStartTimestamp) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - matchStartTimestamp) / 1000);
        setDisplaySeconds(accumulatedSeconds + elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [matchPhase, matchStartTimestamp, accumulatedSeconds]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getPhaseButtonText = () => {
    if (matchPhase === 'PRE-MATCH') return '⏱ Start 1st Half';
    if (matchPhase === '1ST HALF') return '🛑 End 1st Half';
    if (matchPhase === 'HALF-TIME') return '⏱️ Start 2nd Half';
    if (matchPhase === '2ND HALF') return '🏁 Blow Full Time';
    return '🔄 Reset Match';
  };

  const handleModeSwitch = (mode) => {
    setAppMode(mode);
    setCurrentTab(mode === 'coach' ? 'coachHub' : 'player');
  };
  const handlePhaseChange = () => {
    if (!activeTeamId) return;

    if (matchPhase === 'PRE-MATCH') {
      if (!opponentName.trim()) {
        setIsPreMatchModalOpen(true);
        Alert.alert("Opponent Name Required", "Please enter the opponent team name and select match type before kicking off.");
        return;
      }

      const startersCount = teamSheet.filter(p => p.is_starter && p.available).length;
      if (startersCount < 7) {
        Alert.alert("Cannot Kick Off", `You only have ${startersCount} players on the pitch. You need a minimum of 7 players assigned to the pitch to legally start a match.`);
        return;
      }

      Alert.alert("Start 1st Half", `Kick off against ${opponentName} [${matchType.toUpperCase()} MATCH]?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Start", onPress: async () => {
          setMatchPhase('1ST HALF');
          setAccumulatedSeconds(0);
          setDisplaySeconds(0);
          setMatchStartTimestamp(Date.now());
          
          const newTracker = { ...playerMinutesTracker };
          teamSheet.forEach(p => {
            if (p.is_starter && p.available) newTracker[p.id] = { lastOn: 0, totalSeconds: 0 };
          });
          setPlayerMinutesTracker(newTracker);
          
          await broadcastEvent('⏱️', `1st Half Kick-Off vs ${opponentName} [${matchType.toUpperCase()} MATCH]`, '0\'');
          
          const availablePlayers = teamSheet.filter(p => p.available);
          if (availablePlayers.length > 0) {
            const appUpdates = availablePlayers.map(p => 
              supabase.from('players').update({ apps: (p.apps || 0) + 1 }).eq('id', p.id)
            );
            await Promise.all(appUpdates);
            setTeamSheet(prev => prev.map(p => p.available ? { ...p, apps: (p.apps || 0) + 1 } : p));
          }
        }}
      ]);
    } else if (matchPhase === '1ST HALF') {
      Alert.alert("Half-Time", "Blow the whistle for half-time?", [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: async () => {
          setMatchPhase('HALF-TIME');
          setAccumulatedSeconds(displaySeconds);
          setMatchStartTimestamp(null);
          
          const newTracker = { ...playerMinutesTracker };
          teamSheet.forEach(p => {
            if (p.is_starter && p.available && newTracker[p.id]) {
              newTracker[p.id].totalSeconds += (displaySeconds - newTracker[p.id].lastOn);
            }
          });
          setPlayerMinutesTracker(newTracker);

          await broadcastEvent('🛑', 'Half-Time Whistle');
        }}
      ]);
    } else if (matchPhase === 'HALF-TIME') {
      Alert.alert("Start 2nd Half", "Ready to kick off the second half?", [
        { text: "Cancel", style: "cancel" },
        { text: "Start", onPress: async () => {
          setMatchPhase('2ND HALF');
          setMatchStartTimestamp(Date.now());
          
          const newTracker = { ...playerMinutesTracker };
          teamSheet.forEach(p => {
            if (p.is_starter && p.available) {
              if (!newTracker[p.id]) newTracker[p.id] = { totalSeconds: 0 };
              newTracker[p.id].lastOn = displaySeconds;
            }
          });
          setPlayerMinutesTracker(newTracker);

          await broadcastEvent('⏱️', '2nd Half Kick-Off!');
        }}
      ]);
    } else if (matchPhase === '2ND HALF') {
      Alert.alert("Full Time", "Blow the final whistle? This will save the match report and clear the live ticker for the next game.", [
        { text: "Cancel", style: "cancel" },
        { text: "End Match", style: "destructive", onPress: async () => {
          setMatchPhase('FULL-TIME');
          setAccumulatedSeconds(displaySeconds);
          setMatchStartTimestamp(null);
          
          await broadcastEvent('🏁', 'Full-Time Whistle!');
          
          const { data: votes } = await supabase.from('parent_motm_votes').select('player_id').eq('team_id', activeTeamId);
          if (votes && votes.length > 0) {
            const voteCounts = {};
            let maxVotes = 0;
            let winnerId = null;

            votes.forEach(v => {
              voteCounts[v.player_id] = (voteCounts[v.player_id] || 0) + 1;
              if (voteCounts[v.player_id] > maxVotes) {
                maxVotes = voteCounts[v.player_id];
                winnerId = v.player_id;
              }
            });

            if (winnerId) {
              const winner = (teamSheet || []).find(p => p.id === winnerId);
              if (winner) {
                await adjustMatchStat(winner, 'parent_motm', 1);
                await broadcastEvent('🌟', `FANS' POTM: ${winner.name} (${maxVotes} Votes)`);
              }
            }
          }
          
          let resultStr = 'D';
          if (teamScore > opponentScore) resultStr = 'W';
          if (teamScore < opponentScore) resultStr = 'L';
          
          const matchPayload = {
            team_id: activeTeamId,
            opponent_name: opponentName || 'Opponent',
            match_type: matchType,
            team_score: teamScore,
            opponent_score: opponentScore,
            result: resultStr,
            ticker_events: liveTicker || []
          };

          const { error: insertErr } = await supabase.from('match_history').insert([matchPayload]);
          if (insertErr) {
            console.error("❌ Match History Insert Error:", insertErr);
            Alert.alert("Save Error", `Match report failed to save: ${insertErr.message}`);
          } else {
            await supabase.from('live_ticker').delete().eq('team_id', activeTeamId);
            await supabase.from('parent_motm_votes').delete().eq('team_id', activeTeamId);

            resetMatchState();

            Alert.alert("Match Finalized", "Report saved to Match Archive! Live pitch reset for your next match.");
            fetchMatchHistory(activeTeamId);
          }

          const newTracker = { ...playerMinutesTracker };
          const finalUpdates = [];
          const updatedSheet = [...teamSheet];

          updatedSheet.forEach(p => {
            let totalMinsAdded = 0;
            let currentPosMins = p.position_minutes || {};

            if (p.is_starter && p.available && newTracker[p.id]) {
              newTracker[p.id].totalSeconds += (displaySeconds - newTracker[p.id].lastOn);
            }
            
            if (newTracker[p.id]) {
              totalMinsAdded = Math.floor(newTracker[p.id].totalSeconds / 60);
              const posPlayed = p.matchday_position;
              if (posPlayed && posPlayed !== 'Bench') {
                 currentPosMins[posPlayed] = (currentPosMins[posPlayed] || 0) + totalMinsAdded;
              }
            }
            
            p.total_minutes_played = (p.total_minutes_played || 0) + totalMinsAdded;
            p.position_minutes = currentPosMins;
            p.available = false; 
            
            finalUpdates.push(
              supabase.from('players')
                .update({ 
                  total_minutes_played: p.total_minutes_played, 
                  position_minutes: currentPosMins,
                  available: false 
                })
                .eq('id', p.id)
            );
          });

          await Promise.all(finalUpdates);
          setTeamSheet(updatedSheet);
          setPlayerMinutesTracker({}); 
        }}
      ]);
    } else {
      Alert.alert("Reset Match", "Reset clock, score, and clear live ticker?", [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: async () => {
            resetMatchState();
            setPlayerMinutesTracker({});
            await supabase.from('live_ticker').delete().eq('team_id', activeTeamId);
            await supabase.from('parent_motm_votes').delete().eq('team_id', activeTeamId).not('parent_id', 'is', null);
            
            const rsvpResetUpdates = teamSheet.map(p => supabase.from('players').update({ available: false }).eq('id', p.id));
            await Promise.all(rsvpResetUpdates);
            setTeamSheet(prev => prev.map(p => ({ ...p, available: false })));
        }}
      ]);
    }
  };

  const startNewSeasonFlow = async () => {
    if (seasonResetConfirmText.trim().toUpperCase() !== 'RESET SEASON') {
      Alert.alert("Confirmation Error", "Please type 'RESET SEASON' accurately to proceed.");
      return;
    }

    if (!activeTeamId) return;
    setIsSavingSeason(true);

    try {
      const currentYear = new Date().getFullYear();
      const seasonLabel = `Season ${currentYear - 1}/${currentYear}`;

      const totalMatches = matchHistory.length;
      const wins = matchHistory.filter(m => m.result === 'W').length;
      const draws = matchHistory.filter(m => m.result === 'D').length;
      const losses = matchHistory.filter(m => m.result === 'L').length;
      const goalsFor = matchHistory.reduce((sum, m) => sum + (m.team_score || 0), 0);
      const goalsAgainst = matchHistory.reduce((sum, m) => sum + (m.opponent_score || 0), 0);
      const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

      const isAdult = String(effectiveAgeGroup).toLowerCase().includes('adult');
      const parentAwardTitle = isAdult ? "FPOTS (Fans' Player of the Season)" : "PPOTS (Parents' Player of the Season)";
      const coachAwardTitle = "CPOTS (Coach's Player of the Season)";

      const sortedByGoals = [...teamSheet].sort((a, b) => (b.goals || 0) - (a.goals || 0));
      const sortedByAssists = [...teamSheet].sort((a, b) => (b.assists || 0) - (a.assists || 0));
      const sortedByCoachPotm = [...teamSheet].sort((a, b) => (b.motm || 0) - (a.motm || 0));
      const sortedByParentPotm = [...teamSheet].sort((a, b) => (b.parent_motm || 0) - (a.parent_motm || 0));

      const topScorer = sortedByGoals[0]?.goals > 0 ? `${sortedByGoals[0].name} (${sortedByGoals[0].goals} Goals)` : 'N/A';
      const topAssister = sortedByAssists[0]?.assists > 0 ? `${sortedByAssists[0].name} (${sortedByAssists[0].assists} Assists)` : 'N/A';
      const topCoachPotm = sortedByCoachPotm[0]?.motm > 0 ? `${sortedByCoachPotm[0].name} (${sortedByCoachPotm[0].motm} Awards)` : 'N/A';
      const topParentPotm = sortedByParentPotm[0]?.parent_motm > 0 ? `${sortedByParentPotm[0].name} (${sortedByParentPotm[0].parent_motm} Awards)` : 'N/A';

      let reportText = `🏆 EXECUTIVE SEASON REPORT (${seasonLabel})\nTeam: ${activeTeamObj?.name || 'Squad'} (${effectiveAgeGroup})\nGenerated: ${new Date().toLocaleDateString()}\n\n`;
      reportText += `📊 TEAM RECORD:\n• Matches Played: ${totalMatches}\n• Record: ${wins}W - ${draws}D - ${losses}L (${winRate}% Win Rate)\n• Goals: ${goalsFor} Scored / ${goalsAgainst} Conceded (GD: ${goalsFor - goalsAgainst})\n\n`;
      reportText += `⭐ INDIVIDUAL SEASON HONOURS:\n• Golden Boot: ${topScorer}\n• Playmaker Award: ${topAssister}\n• ${coachAwardTitle}: ${topCoachPotm}\n• ${parentAwardTitle}: ${topParentPotm}\n\n`;
      reportText += `👥 SQUAD MASTER STATS BREAKDOWN:\n`;

      teamSheet.forEach(p => {
        const avgMins = p.apps > 0 ? Math.round((p.total_minutes_played || 0) / p.apps) : 0;
        reportText += `• #${p.squad_number || ''} ${p.name} (${p.position}): ${p.apps || 0} Apps | ${p.total_minutes_played || 0} Mins (${avgMins}m/g) | ${p.goals || 0}G | ${p.assists || 0}A | ${p.saves || 0} Saves | ${p.clean_sheets || 0} CS | ${p.motm || 0} CPOTM | ${p.parent_motm || 0} FPOTM | ${p.training_attended || 0} Trn\n`;
      });

      const { error: archiveErr } = await supabase.from('season_reports').insert([{
        team_id: activeTeamId,
        season_label: seasonLabel,
        report_text: reportText,
        created_at: new Date().toISOString()
      }]);

      if (archiveErr) {
        console.error("❌ Season Vault Save Error:", archiveErr);
      }

      const resetPlayerPromises = teamSheet.map(p => 
        supabase.from('players').update({
          apps: 0,
          goals: 0,
          assists: 0,
          saves: 0,
          clean_sheets: 0,
          yellow_cards: 0,
          red_cards: 0,
          motm: 0,
          parent_motm: 0,
          training_attended: 0,
          total_minutes_played: 0,
          position_minutes: {}
        }).eq('id', p.id)
      );

      await Promise.all([
        ...resetPlayerPromises,
        supabase.from('match_history').delete().eq('team_id', activeTeamId),
        supabase.from('live_ticker').delete().eq('team_id', activeTeamId),
        supabase.from('parent_motm_votes').delete().eq('team_id', activeTeamId)
      ]);

      setIsSeasonResetModalOpen(false);
      setSeasonResetConfirmText('');
      setIsSavingSeason(false);

      fetchTeamData(session?.user?.id, activeTeamId);
      fetchMatchHistory(activeTeamId);
      fetchSeasonReports(activeTeamId);

      Alert.alert("New Season Activated!", "Season summary archived into In-App Vault and all squad stats reset to zero.");

      try {
        await generateSeasonPdfReport({
          teamName: activeTeamObj?.name || 'Tactical Engine Squad',
          ageGroup: effectiveAgeGroup || 'Youth',
          clubLogoUrl: activeTeamObj?.logo_url || teamLogoUrl || null,
          teamSheet,
          matchHistory,
          scoutNotes: scoutNotesInput,
        });
      } catch (shareErr) {
        console.log(shareErr);
      }

    } catch (err) {
      console.error("❌ Season Reset Error:", err);
      setIsSavingSeason(false);
      Alert.alert("Reset Error", err.message);
    }
  };

  const startArchiveGoalEdit = (matchRecord, eventIdx) => {
    setEditingArchiveMatch(matchRecord);
    setEditingArchiveEventIdx(eventIdx);
    setSelectedArchiveScorer(null);
    setArchiveEditStep('scorer');
  };

  const selectArchiveScorer = (player) => {
    setSelectedArchiveScorer(player);
    setArchiveEditStep('assist');
  };

  const finishArchiveGoalEdit = async (assistPlayerOrNone) => {
    if (!editingArchiveMatch || editingArchiveEventIdx === null || !selectedArchiveScorer) return;

    const currentEvents = [...(editingArchiveMatch.ticker_events || [])];
    const targetEvt = currentEvents[editingArchiveEventIdx];

    const oldScorerMatch = targetEvt.message ? targetEvt.message.match(/GOAL!\s+(.*?)\s+⚽/) : null;
    const oldScorerName = oldScorerMatch ? oldScorerMatch[1].trim() : null;

    const oldAssistMatch = targetEvt.message ? targetEvt.message.match(/\(Assist:\s+(.*?)\)/) : null;
    const oldAssistName = oldAssistMatch ? oldAssistMatch[1].trim() : null;
    const newAssistName = (assistPlayerOrNone && assistPlayerOrNone !== 'None') ? assistPlayerOrNone.name : null;

    if (oldScorerName && oldScorerName.toLowerCase() !== selectedArchiveScorer.name.toLowerCase()) {
      const oldPlayer = (teamSheet || []).find(p => p.name.trim().toLowerCase() === oldScorerName.toLowerCase());
      if (oldPlayer) await adjustMatchStat(oldPlayer, 'goals', -1);
      await adjustMatchStat(selectedArchiveScorer, 'goals', 1);
    }

    if (oldAssistName && oldAssistName !== newAssistName) {
      const oldAssistPlayer = (teamSheet || []).find(p => p.name.trim().toLowerCase() === oldAssistName.toLowerCase());
      if (oldAssistPlayer) await adjustMatchStat(oldAssistPlayer, 'assists', -1);
    }
    if (newAssistName && oldAssistName !== newAssistName) {
      await adjustMatchStat(assistPlayerOrNone, 'assists', 1);
    }

    let newMsg = `GOAL! ${selectedArchiveScorer.name} ⚽`;
    if (newAssistName) {
      newMsg += `\n(Assist: ${newAssistName})`;
    }

    currentEvents[editingArchiveEventIdx] = { ...targetEvt, message: newMsg };

    const { error } = await supabase
      .from('match_history')
      .update({ ticker_events: currentEvents })
      .eq('id', editingArchiveMatch.id);

    if (error) {
      Alert.alert("Update Error", error.message);
    } else {
      setMatchHistory(prev => prev.map(m => m.id === editingArchiveMatch.id ? { ...m, ticker_events: currentEvents } : m));
      setArchiveEditStep('none');
      setEditingArchiveMatch(null);
      setEditingArchiveEventIdx(null);
      setSelectedArchiveScorer(null);
      Alert.alert("Event Updated", "Goal scorer, assist provider, and player stats updated!");
      if (session) fetchTeamData(session.user.id, activeTeamId);
    }
  };

  const initGoalFlow = () => {
    const min = `${Math.floor(displaySeconds / 60)}'`;
    setPendingEvent({ minute: min, type: 'goal' });
    setLiveEventMode('goal_scorer');
  };

  const selectGoalScorer = (playerOrOpponent) => {
    setPendingEvent((prev) => ({ ...(prev || {}), scorer: playerOrOpponent }));
    if (playerOrOpponent === 'Opponent') {
      finishGoalFlow('Opponent', 'None');
    } else {
      setLiveEventMode('goal_assist');
    }
  };

  const selectGoalAssist = (playerOrNone) => {
    finishGoalFlow(pendingEvent?.scorer, playerOrNone);
  };

  const finishGoalFlow = async (scorer, assist) => {
    setLiveEventMode('none');
    if (scorer !== 'Opponent' && scorer?.id) await adjustMatchStat(scorer, 'goals', 1);
    if (assist !== 'None' && assist !== 'Opponent' && assist?.id) await adjustMatchStat(assist, 'assists', 1);

    let msg = '';
    if (scorer === 'Opponent') {
      msg = `Goal for ${opponentName || 'Opposition'}! ⚽`;
      setOpponentScore((prev) => prev + 1);
    } else {
      msg = `GOAL! ${scorer?.name || 'Player'} ⚽`;
      if (assist !== 'None' && assist?.name) msg += `\n(Assist: ${assist.name})`;
      setTeamScore((prev) => prev + 1);
    }
    await broadcastEvent('⚽', msg, pendingEvent?.minute);
  };

  const initCardFlow = () => {
    const min = `${Math.floor(displaySeconds / 60)}'`;
    setPendingEvent({ minute: min, type: 'card' });
    setLiveEventMode('card_type');
  };

  const selectCardType = (type) => {
    setPendingEvent((prev) => ({ ...(prev || {}), cardType: type }));
    setLiveEventMode('card_player');
  };

  const finishCardFlow = async (playerOrOpponent) => {
    setLiveEventMode('none');
    const isYellow = pendingEvent?.cardType === 'yellow';
    const icon = isYellow ? '🟨' : '🟥';
    
    if (playerOrOpponent !== 'Opponent' && playerOrOpponent?.id) {
      await adjustMatchStat(playerOrOpponent, isYellow ? 'yellow_cards' : 'red_cards', 1);
    }

    const targetName = playerOrOpponent === 'Opponent' ? (opponentName || 'Opposition') : (playerOrOpponent?.name || 'Player');
    const msg = `${isYellow ? 'Yellow' : 'Red'} Card: ${targetName}`;
    await broadcastEvent(icon, msg, pendingEvent?.minute);
  };

  const initSubFlow = (player) => {
    setActiveLivePlayer(null); 
    setPendingEvent({ minute: `${Math.floor(displaySeconds / 60)}'`, sourcePlayer: player, isSubbingOff: player.is_starter });
    setLiveEventMode('sub_selection');
  };

  const promptSubReason = (targetPlayer) => {
    setLiveEventMode('none');
    setSubReasonModalState({
      visible: true,
      offPlayer: pendingEvent.isSubbingOff ? pendingEvent.sourcePlayer : targetPlayer,
      onPlayer: pendingEvent.isSubbingOff ? targetPlayer : pendingEvent.sourcePlayer
    });
  };

  const finalizeSubWithReason = async (reason) => {
    const { offPlayer, onPlayer } = subReasonModalState;
    setSubReasonModalState({ visible: false, offPlayer: null, onPlayer: null });
    if (!offPlayer || !onPlayer) return;

    const onTargetPos = offPlayer.matchday_position || offPlayer.position || 'DEFAULT';

    const newTracker = { ...playerMinutesTracker };
    if (newTracker[offPlayer.id]) {
       newTracker[offPlayer.id].totalSeconds += (displaySeconds - newTracker[offPlayer.id].lastOn);
    }
    if (!newTracker[onPlayer.id]) {
       newTracker[onPlayer.id] = { totalSeconds: 0 };
    }
    newTracker[onPlayer.id].lastOn = displaySeconds;
    setPlayerMinutesTracker(newTracker);

    setTeamSheet(prev => prev.map(p => {
      if (p.id === offPlayer.id) return { ...p, matchday_position: 'Bench', is_starter: false };
      if (p.id === onPlayer.id) return { ...p, matchday_position: onTargetPos, is_starter: true };
      return p;
    }));

    await supabase.from('players').update({ matchday_position: 'Bench', is_starter: false }).eq('id', offPlayer.id);
    await supabase.from('players').update({ matchday_position: onTargetPos, is_starter: true }).eq('id', onPlayer.id);

    const min = `${Math.floor(displaySeconds / 60)}'`;
    await broadcastEvent('🔄', `Substitution: ${onPlayer.name} ON, ${offPlayer.name} OFF — [Reason: ${reason}]`, min);
  };

  const selectCoachMotm = async (player) => {
    setLiveEventMode('none');
    if (player && player.id) {
      await adjustMatchStat(player, 'motm', 1);
      await broadcastEvent('⭐', `COACH'S POTM: #${player.squad_number || ''} ${player.name}`);
      Alert.alert("POTM Awarded", `${player.name} awarded Coach's Player of the Match!`);
    }
  };

  const selectParentMotm = async (player) => {
    setLiveEventMode('none');
    if (player && player.id && session?.user?.id && activeTeamId) {
      setHasVotedMotm(true);
      setVotedPlayerName(player.name);
      await supabase.from('parent_motm_votes').insert([{ parent_id: session.user.id, player_id: player.id, team_id: activeTeamId }]);
      Alert.alert("Vote Logged", `Your vote for ${player.name} has been securely logged!`);
    }
  };

  const openTafeModal = () => {
    setTafeStep('backline');
    setIsTafeModalOpen(true);
  };

  // ⚡ TAFE ALGORITHM (FULL 29-FORMATION 9v9 & 11v11 SUPPORT)
  const runTafeAlgorithm = (backlineCode) => {
    setTafeBackline(backlineCode);
    
    let category;
    if (is9v9Team) {
      category = formationCategories9v9.find(c => c.title.startsWith(backlineCode));
    } else {
      category = formationCategories.find(c => c.title.startsWith(backlineCode));
    }

    if (!category) {
      Alert.alert("Unavailable", `No formations found for a ${backlineCode}-back system in this age group.`);
      return;
    }
    
    const availableForms = [...category.formations];
    const suggestions = availableForms.slice(0, 3).map((fmt, idx) => {
      let reason = '';
      let logic = '';
      if (idx === 0) { reason = 'Balanced: Best Avg Mins + High Impact'; logic = 'balanced'; }
      else if (idx === 1) { reason = 'Attacking: Solely Highest Impact'; logic = 'impact'; }
      else { reason = 'Stability: Solely Highest Avg Mins'; logic = 'minutes'; }
      return { name: fmt, reason, logic };
    });
    
    const other = availableForms.slice(3);
    setTafeSuggestions(suggestions);
    setTafeOther(other);
    setTafeStep('suggestions');
  };

  const applyTafeFormation = async (formationName, logicType = 'balanced') => {
    setIsTafeModalOpen(false);
    setActiveFormation(formationName);
    
    const layout = formationLayouts[formationName];
    if (!layout) return;

    const mapSlotToProfilePos = (slotCode) => {
      const s = String(slotCode).toUpperCase();
      if (['GK', 'SGK'].includes(s)) return 'GK/SGK';
      if (['CB', 'LCB', 'RCB'].includes(s)) return 'CB';
      if (['LB', 'LWB'].includes(s)) return 'LB/LWB';
      if (['RB', 'RWB'].includes(s)) return 'RB/RWB';
      if (['CDM', 'LDM', 'RDM'].includes(s)) return 'CDM';
      if (['CM', 'LCM', 'RCM'].includes(s)) return 'CM';
      if (['CAM', 'LAM', 'RAM', 'CF'].includes(s)) return 'CAM/CF';
      if (['LW', 'LM', 'LF'].includes(s)) return 'LF/LW/LM';
      if (['RW', 'RM', 'RF'].includes(s)) return 'RF/RW/RM';
      if (['ST', 'LS', 'RS'].includes(s)) return 'ST';
      return 'None';
    };

    const availablePlayers = teamSheet.filter(p => p.available);
    
    const scoredPlayers = availablePlayers.map(p => {
      const impact = (p.goals || 0) + (p.assists || 0);
      const apps = p.apps || 0;
      const posMins = p.position_minutes || {};
      
      const avgPosMins = {};
      Object.keys(posMins).forEach(k => {
          avgPosMins[k] = apps > 0 ? (posMins[k] / apps) : 0;
      });

      return { ...p, impact, avgPosMins, totalApps: apps };
    });
    
    const newSheet = [...teamSheet];
    newSheet.forEach(p => {
      if (p.available) {
        p.is_starter = false;
        p.matchday_position = 'Bench';
      }
    });
    
    const assignedIds = new Set();

    const sortCandidates = (candidates, slotCode) => {
      return candidates.sort((a, b) => {
        const aMins = a.avgPosMins[slotCode] || 0;
        const bMins = b.avgPosMins[slotCode] || 0;

        if (logicType === 'impact') {
           if (b.impact !== a.impact) return b.impact - a.impact;
           if (bMins !== aMins) return bMins - aMins;
        } else if (logicType === 'minutes') {
           if (bMins !== aMins) return bMins - aMins;
           if (b.impact !== a.impact) return b.impact - a.impact;
        } else { 
           const aBal = aMins + (a.impact * 50);
           const bBal = bMins + (b.impact * 50);
           if (bBal !== aBal) return bBal - aBal;
        }
        return a.name.localeCompare(b.name);
      });
    };
    
    layout.forEach(slot => {
      const slotCat = getPosCategory(slot.code);
      const isGkSlot = slot.code === 'GK' || slot.code === 'SGK';
      
      let baseCandidates = scoredPlayers.filter(p => !assignedIds.has(p.id));
      if (isGkSlot) {
         baseCandidates = baseCandidates.filter(p => getPosCategory(p.position) === 'GK' || (p.avgPosMins && (p.avgPosMins['GK'] > 0 || p.avgPosMins['SGK'] > 0)));
      } else {
         baseCandidates = baseCandidates.filter(p => getPosCategory(p.position) !== 'GK' && (!p.avgPosMins || !(p.avgPosMins['GK'] > 0 || p.avgPosMins['SGK'] > 0)));
      }

      let bestMatch = null;

      let matches = baseCandidates.filter(p => (p.avgPosMins[slot.code] || 0) > 0);
      if (matches.length > 0) bestMatch = sortCandidates(matches, slot.code)[0];

      if (!bestMatch && !isGkSlot) {
          const sisterPos = getSisterPositions(slot.code);
          matches = baseCandidates.filter(p => sisterPos.some(sp => (p.avgPosMins[sp] || 0) > 0));
          if (matches.length > 0) {
              matches.sort((a, b) => b.impact - a.impact);
              bestMatch = matches[0];
          }
      }

      if (!bestMatch && !isGkSlot) {
            matches = baseCandidates.filter(p => Object.keys(p.avgPosMins).some(playedPos => getPosCategory(playedPos) === slotCat && p.avgPosMins[playedPos] > 0));
            if (matches.length > 0) {
                matches.sort((a, b) => b.impact - a.impact);
                bestMatch = matches[0];
            }
      }

      if (!bestMatch) {
          const mappedProfile = mapSlotToProfilePos(slot.code);
          matches = baseCandidates.filter(p => p.position === mappedProfile || p.secondary_position === mappedProfile);
          if (matches.length > 0) {
              matches.sort((a, b) => b.impact - a.impact);
              bestMatch = matches[0];
          }
      }

      if (!bestMatch && !isGkSlot) {
          matches = baseCandidates.filter(p => getPosCategory(p.position) === slotCat || getPosCategory(p.secondary_position) === slotCat);
          if (matches.length > 0) {
              matches.sort((a, b) => b.impact - a.impact);
              bestMatch = matches[0];
          }
      }

      if (!bestMatch && !isGkSlot) {
          if (baseCandidates.length > 0) {
              baseCandidates.sort((a, b) => b.impact - a.impact);
              bestMatch = baseCandidates[0];
          }
      }

      if (bestMatch) {
        assignedIds.add(bestMatch.id);
        const sheetPlayer = newSheet.find(p => p.id === bestMatch.id);
        if (sheetPlayer) {
          sheetPlayer.is_starter = true;
          sheetPlayer.matchday_position = slot.code;
        }
      }
    });
    
    setTeamSheet(newSheet);
    
    const autoFillUpdates = newSheet.filter(p => p.available).map(p => 
      supabase.from('players')
        .update({ is_starter: p.is_starter, matchday_position: p.matchday_position })
        .eq('id', p.id)
    );
    
    await Promise.all(autoFillUpdates);
    Alert.alert("TAFE Executed", `Lineup optimized for ${formationName} using ${logicType} logic.`);
  };

  async function createTeamFlow() {
    Keyboard.dismiss();
    if (!teamName) { setAuthMessage({ text: 'Please enter a team name.', type: 'error' }); return; }
    
    const inviteCode = `HEAD-${Math.floor(1000 + Math.random() * 9000)}`;
    const staffCode = `STAF-${Math.floor(1000 + Math.random() * 9000)}`;
    const adminCode = `ADMN-${Math.floor(1000 + Math.random() * 9000)}`;
    const fanCode = `FAN-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error: teamError } = await supabase.from('teams').insert([{ 
      name: teamName, 
      invite_code: inviteCode, 
      staff_code: staffCode, 
      admin_code: adminCode,
      fan_code: fanCode,
      created_by: session.user.id, 
      age_group: teamAgeGroup 
    }]).select();
    
    if (teamError) { setAuthMessage({ text: teamError.message, type: 'error' }); return; }
    
    if (data && data.length > 0) {
      await supabase.from('team_staff').insert([{
        team_id: data[0].id,
        user_id: session.user.id,
        role: selectedCreationRole
      }]);
      setMyTeams(prev => [...prev, data[0]]);
      setActiveTeamId(data[0].id);
    }

    await supabase.from('profiles').upsert({ 
      id: session.user.id, 
      email: session.user.email, 
      role: selectedCreationRole, 
      role_configured: true 
    });

    fetchUserProfile(session.user.id);
  }

  async function createNewTeamFromSidebar() {
    Keyboard.dismiss();
    if (!newTeamName) return;
    const inviteCode = `HEAD-${Math.floor(1000 + Math.random() * 9000)}`;
    const staffCode = `STAF-${Math.floor(1000 + Math.random() * 9000)}`;
    const adminCode = `ADMN-${Math.floor(1000 + Math.random() * 9000)}`;
    const fanCode = `FAN-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data } = await supabase.from('teams').insert([{ 
      name: newTeamName, 
      invite_code: inviteCode, 
      staff_code: staffCode, 
      admin_code: adminCode,
      fan_code: fanCode,
      created_by: session.user.id, 
      age_group: newTeamAgeGroup 
    }]).select();
    
    if (data && data.length > 0) {
      await supabase.from('team_staff').insert([{
        team_id: data[0].id,
        user_id: session.user.id,
        role: 'coach'
      }]);
      setMyTeams(prev => [...prev, data[0]]);
      setActiveTeamId(data[0].id);
      setIsCreateTeamModalOpen(false);
      setNewTeamName('');
    }
  }

  async function linkChildFlow() {
    Keyboard.dismiss();
    if (!familyCodeInput.trim()) {
      setAuthMessage({ text: 'Please enter a valid Join Code provided by your Head Coach.', type: 'error' });
      return;
    }

    const cleanCode = familyCodeInput.trim().toUpperCase();
    setLoading(true);

    try {
      // 1. Head Coach (HEAD-XXXX)
      const { data: headTeam } = await supabase.from('teams').select('*').eq('invite_code', cleanCode).maybeSingle();
      if (headTeam) {
        await supabase.from('team_staff').upsert([{ team_id: headTeam.id, user_id: session.user.id, role: 'coach' }], { onConflict: 'team_id,user_id' });
        await supabase.from('profiles').update({ role: 'coach', role_configured: true }).eq('id', session.user.id);
        setAppMode('coach');
        setActiveTeamId(headTeam.id);
        await fetchUserProfile(session.user.id);
        return;
      }

      // 2. Assistant Coach (STAF-XXXX)
      const { data: staffTeam } = await supabase.from('teams').select('*').eq('staff_code', cleanCode).maybeSingle();
      if (staffTeam) {
        await supabase.from('team_staff').upsert([{ team_id: staffTeam.id, user_id: session.user.id, role: 'assistant' }], { onConflict: 'team_id,user_id' });
        await supabase.from('profiles').update({ role: 'assistant', role_configured: true }).eq('id', session.user.id);
        setAppMode('coach');
        setActiveTeamId(staffTeam.id);
        await fetchUserProfile(session.user.id);
        return;
      }

      // 3. Administrator Code (ADMN-XXXX)
      const { data: adminTeam } = await supabase.from('teams').select('*').eq('admin_code', cleanCode).maybeSingle();
      if (adminTeam) {
        await supabase.from('team_staff').upsert([{ team_id: adminTeam.id, user_id: session.user.id, role: 'admin' }], { onConflict: 'team_id,user_id' });
        await supabase.from('profiles').update({ role: 'admin', role_configured: true }).eq('id', session.user.id);
        setAppMode('coach');
        setActiveTeamId(adminTeam.id);
        await fetchUserProfile(session.user.id);
        return;
      }

      // 4. Player Family Code (FAM-XXXX)
      const { data: player } = await supabase.from('players').select('*').eq('family_code', cleanCode).maybeSingle();
      if (player) {
        await supabase.from('parent_players').insert([{ player_id: player.id, parent_id: session.user.id, is_primary: true }]);
        await supabase.from('profiles').update({ role: 'parent', role_configured: true }).eq('id', session.user.id);
        setMyChildId(player.id);
        if (player.team_id) setActiveTeamId(player.team_id);
        setAppMode('parent');
        await fetchUserProfile(session.user.id);
        return;
      }

      // 5. Team Fan / General Supporter Code (FAN-XXXX)
      const { data: fanTeam } = await supabase.from('teams').select('*').eq('fan_code', cleanCode).maybeSingle();
      if (fanTeam) {
        await supabase.from('profiles').update({ role: 'fan', role_configured: true }).eq('id', session.user.id);
        setActiveTeamId(fanTeam.id);
        setAppMode('parent');
        await fetchUserProfile(session.user.id);
        return;
      }

      setAuthMessage({ text: '❌ Invalid Join Code. Please request a valid code from your Head Coach.', type: 'error' });
    } catch (err) {
      setAuthMessage({ text: 'Error verifying join code. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function addNewPlayer() {
    Keyboard.dismiss();
    if (!newPlayerName || !activeTeamId) return;
    const familyCode = `${newPlayerName.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const { error } = await supabase.from('players').insert([{
      team_id: activeTeamId, name: newPlayerName, squad_number: parseInt(newSquadNumber, 10) || 0, position: newPlayerPosition, secondary_position: newSecondaryPosition, matchday_position: 'Bench', is_starter: false, available: false, family_code: familyCode,
      training_attended: 0, apps: 0, goals: 0, assists: 0, tackles: 0, interceptions: 0, saves: 0, clean_sheets: 0, yellow_cards: 0, red_cards: 0, motm: 0, parent_motm: 0, total_minutes_played: 0,
      footedness: newPlayerFootedness, phys_sprint: 5, phys_accel: 5, phys_stamina: 5, phys_strength: 5, phys_agility: 5, tech_first_touch: 5, tech_dribbling: 5, tech_short_pass: 5, tech_long_pass: 5, tech_shooting_acc: 5, tech_shooting_pow: 5, tech_crossing: 5, tech_tackling: 5, tech_intercept: 5, tech_aerial: 5, tech_positioning: 5,
      gk_shot_stopping: 5, gk_handling: 5, gk_1v1: 5, gk_aerial: 5, gk_sweeping: 5, gk_distribution: 5, tact_awareness: 5, tact_pressing: 5, tact_instructions: 5, tact_decision: 5,
      psych_confidence: 5, psych_aggression: 5, psych_leadership: 5, psych_workrate: 5, psych_composure: 5, notes_weaknesses: '', notes_communication: '', coach_development_notes: '',
      position_minutes: {}
    }]);

    if (!error) {
      setNewPlayerName(''); setNewSquadNumber(''); setNewPlayerPosition('GK/SGK'); setNewSecondaryPosition('None'); setNewPlayerFootedness(3);
      setIsAddPlayerModalOpen(false); setIsSidebarOpen(false);
      if (session) fetchTeamData(session.user.id, activeTeamId);
    }
  }

  async function updateFullPlayerProfile() {
    Keyboard.dismiss();
    if (!editingPlayer || !editingPlayer.id) return;
    const { error } = await supabase.from('players').update(editingPlayer).eq('id', editingPlayer.id);
    if (!error) {
      setEditingPlayer(null);
      if (session) fetchTeamData(session.user.id, activeTeamId);
    }
  }

  const initiateDeletePlayer = (player) => {
    setEditingPlayer(null); 
    setTimeout(() => {
      setPlayerToDelete(player);
      setDeleteConfirmText('');
    }, 350); 
  };

  const finalizeDeletePlayer = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== 'delete') {
      Alert.alert("Error", "Please accurately type 'Delete' to confirm.");
      return;
    }
    
    const playerId = playerToDelete.id;
    const { error } = await supabase.from('players').delete().eq('id', playerId);
    if (!error) {
      setPlayerToDelete(null);
      setDeleteConfirmText('');
      if (session) fetchTeamData(session.user.id, activeTeamId);
    }
  };

  async function removeParentLinkFromPlayer(parentId, playerId, parentEmail) {
    Alert.alert(
      "Revoke Parent Access",
      `Are you sure you want to remove ${parentEmail || 'this user'} from this player's profile?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove Access",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from('parent_players')
              .delete()
              .eq('parent_id', parentId)
              .eq('player_id', playerId);

            if (error) {
              Alert.alert("Error", error.message);
            } else {
              Alert.alert("Access Revoked", "Parent access successfully removed.");
              if (session) fetchTeamData(session.user.id, activeTeamId);
            }
          }
        }
      ]
    );
  }

  const finalizeDeleteTeam = async () => {
    if (deleteTeamConfirmText.trim().toLowerCase() !== 'delete team') {
      Alert.alert("Error", "Please accurately type 'delete team' to confirm.");
      return;
    }
    
    const teamId = teamToDelete.id;

    await Promise.all([
      supabase.from('team_staff').delete().eq('team_id', teamId),
      supabase.from('players').delete().eq('team_id', teamId),
      supabase.from('match_history').delete().eq('team_id', teamId),
      supabase.from('live_ticker').delete().eq('team_id', teamId),
      supabase.from('match_notes').delete().eq('team_id', teamId),
      supabase.from('parent_motm_votes').delete().eq('team_id', teamId),
      supabase.from('season_reports').delete().eq('team_id', teamId)
    ]);

    const { error } = await supabase.from('teams').delete().eq('id', teamId);
    
    if (!error) {
      setTeamToDelete(null);
      setDeleteTeamConfirmText('');
      
      const remainingTeams = myTeams.filter(t => t.id !== teamId);
      setMyTeams(remainingTeams);
      
      if (remainingTeams.length > 0) {
        setActiveTeamId(remainingTeams[0].id);
        if (remainingTeams[0].age_group) setTeamAgeGroup(remainingTeams[0].age_group);
      } else {
        setActiveTeamId(null);
        await supabase.from('profiles').update({ role_configured: false }).eq('id', session.user.id);
        setProfile(prev => prev ? { ...prev, role_configured: false } : null);
        setOnboardingStep('choose_path');
      }
    } else {
      Alert.alert("Deletion Error", error.message);
    }
  };

  async function fetchMatchNotes(teamId) {
    if (!teamId) return;
    const { data } = await supabase.from('match_notes').select('notes').eq('team_id', teamId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (data && data.notes) setScoutNotesInput(data.notes || '');
    else setScoutNotesInput('');
  }

  async function saveMatchNotes() {
    Keyboard.dismiss();
    if (!activeTeamId) return;
    setIsSavingNotes(true);
    await supabase.from('match_notes').insert([{ notes: scoutNotesInput || '', team_id: activeTeamId }]);
    setIsSavingNotes(false);
    setIsSidebarOpen(false);
  }

  async function saveFaLeagueUrl() {
    Keyboard.dismiss();
    if (!activeTeamId) {
      Alert.alert("Error", "No active team selected.");
      return;
    }

    const cleanUrl = faLeagueUrl.trim();

    const { data, error } = await supabase
      .from('teams')
      .update({ fa_league_table_url: cleanUrl })
      .eq('id', activeTeamId)
      .select();

    if (error) {
      console.error("❌ FA Link Save Error:", error);
      Alert.alert("Database Error", error.message);
      return;
    }

    if (!data || data.length === 0) {
      Alert.alert("Save Error", "0 rows updated. Ensure RLS is configured on 'teams'.");
      return;
    }

    setFaLeagueUrl(cleanUrl);
    setMyTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, fa_league_table_url: cleanUrl } : t));
    Alert.alert("Saved!", "FA League Table URL is now permanently saved for this team.");
  }

  async function saveTeamLogoUrl() {
    Keyboard.dismiss();
    if (!activeTeamId) {
      Alert.alert("Error", "No active team selected.");
      return;
    }

    const cleanUrl = teamLogoUrl.trim();

    const { data, error } = await supabase
      .from('teams')
      .update({ logo_url: cleanUrl })
      .eq('id', activeTeamId)
      .select();

    if (error) {
      console.error("❌ Logo URL Save Error:", error);
      Alert.alert("Database Error", error.message);
      return;
    }

    setTeamLogoUrl(cleanUrl);
    setMyTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, logo_url: cleanUrl } : t));
    Alert.alert("Saved!", "Team logo URL updated and saved permanently.");
  }

  async function fetchTeamData(userId, teamId) {
    if (!teamId) return;
    const { data: allPlayers } = await supabase.from('players').select('*').eq('team_id', teamId).order('name', { ascending: true });
    const resolvedPlayers = allPlayers || [];
    setTeamSheet(resolvedPlayers);

    const initialRegister = { __initialized: true };
    resolvedPlayers.forEach(p => { if (p && p.id) initialRegister[p.id] = true; });
    setTrainingRegister(initialRegister);

    const { data: links } = await supabase.from('parent_players').select('player_id').eq('parent_id', userId);
    if (links && links.length > 0) {
      const linkedIds = links.map(l => l.player_id);
      const { data: children } = await supabase.from('players').select('*').in('id', linkedIds).eq('team_id', teamId).order('name', { ascending: true });
      setMyLinkedPlayers(children || []);
      if (children && children.length > 0) setMyChildId(children[0].id);
    } else {
      setMyLinkedPlayers([]);
      setMyChildId(null);
    }
    
    if (resolvedPlayers && resolvedPlayers.length > 0) setActivePlayerId(resolvedPlayers[0].id);
    setIsLoadingSheet(false);
  }

  async function toggleRSVP(player) {
    if (!player || !player.id) return;
    await supabase.from('players').update({ available: !player.available }).eq('id', player.id);
    fetchTeamData(session?.user?.id, activeTeamId);
  }

  async function assignPlayerRole(player, newMatchPos, isStarter) {
    if (!player || !player.id) return;
    const oldPos = player.matchday_position;
    
    await supabase.from('players').update({ matchday_position: newMatchPos, is_starter: isStarter }).eq('id', player.id);
    
    if ((matchPhase === '1ST HALF' || matchPhase === '2ND HALF') && oldPos && oldPos !== newMatchPos) {
      const min = `${Math.floor(displaySeconds / 60)}'`;
      await broadcastEvent('🔁', `TACTICAL SWITCH ${min}: ${player.name} moved from ${oldPos} to ${newMatchPos}`);
    }

    fetchTeamData(session?.user?.id, activeTeamId);
    setLineupAssignPlayer(null);
  }

  async function adjustMatchStat(player, statKey, delta) {
    if (!player || !player.id) return;
    const currentVal = player[statKey] || 0;
    const newVal = Math.max(0, currentVal + delta);
    setTeamSheet(prev => (prev || []).map(p => p && p.id === player.id ? { ...p, [statKey]: newVal } : p));
    await supabase.from('players').update({ [statKey]: newVal }).eq('id', player.id);
  }

  const adjustProfileStat = (statKey, delta) => {
    setEditingPlayer(prev => {
      if (!prev) return null;
      const currentVal = prev[statKey] || 5;
      const newVal = Math.max(1, Math.min(10, currentVal + delta)); 
      return { ...prev, [statKey]: newVal };
    });
  };

  const submitTrainingSession = async () => {
    const updates = (teamSheet || []).map(p => {
      if (p && p.id && (trainingRegister || {})[p.id]) {
        return supabase.from('players').update({ training_attended: (p.training_attended || 0) + 1 }).eq('id', p.id);
      }
      return null;
    });

    await Promise.all(updates);
    Alert.alert("Session Saved", "Training attendance logged for all present players.");
    const resetReg = { __initialized: true };
    (teamSheet || []).forEach(p => { if (p && p.id) resetReg[p.id] = true; });
    setTrainingRegister(resetReg);
    if (session) fetchTeamData(session.user.id, activeTeamId);
  };

  const logLiveSave = async () => {
    if (!activeLivePlayer) return;
    await adjustMatchStat(activeLivePlayer, 'saves', 1);
    await broadcastEvent('🧤', `Great Save by ${activeLivePlayer?.name || 'Player'}`);
    setActiveLivePlayer(null);
  };

  const exportMatchdaySummary = () => {
    const currentTeam = myTeams.find(t => t.id === activeTeamId);
    generateSeasonPdfReport({
      teamName: currentTeam?.name || activeTeamObj?.name || 'Tactical Engine Squad',
      ageGroup: currentTeam?.age_group || effectiveAgeGroup || 'Youth',
      clubLogoUrl: currentTeam?.logo_url || teamLogoUrl || null,
      teamSheet,
      matchHistory,
      scoutNotes: scoutNotesInput,
    });
    setIsSidebarOpen(false);
  };

  const shareCoParentInvite = (childName, code) => {
    const deepLink = Linking.createURL('join', { queryParams: { code } });
    Share.share({
      message: `Hey! Join our team app for ${childName || 'our player'}.\n\n1. Download the app / Expo Go\n2. Tap this link to open directly with your join code: ${deepLink}\n\nOr manually enter Join Code: ${code}`,
    });
  };

  const shareFanInvite = (childName, code) => {
    const deepLink = Linking.createURL('join', { queryParams: { code } });
    Share.share({
      message: `Hey! Join our team app as a Fan to follow live matches and vote for Player of the Match!\n\nTap link to join: ${deepLink}\nOr enter Code: ${code}`,
    });
  };

  const shareStaffInvite = (teamName, code) => {
    const deepLink = Linking.createURL('join', { queryParams: { code } });
    Share.share({
      message: `Hey! Join ${teamName || 'our team'} as Staff / Assistant Coach.\n\nTap link to join: ${deepLink}\nOr enter Staff Code: ${code}`,
    });
  };

  const handleQuizAnswer = (idx, isCorrect) => {
    setQuizState({ answered: true, isCorrect, selectedIdx: idx });
  };
  
  const handleNextQuestion = () => {
    setQuizState(null);
    setCurrentQuizIdx(prev => prev + 1);
  };
  const handleRestartQuiz = () => {
    setQuizState(null);
    setCurrentQuizIdx(0);
  };

  const render1to10Row = (label, statKey) => {
    const val = editingPlayer?.[statKey] ?? 5;
    return (
      <View style={styles.statCounterRow} key={statKey}>
        <Text style={styles.statCounterLabel}>{label}:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <TouchableOpacity style={styles.counterBtn} onPress={() => adjustProfileStat(statKey, -1)}><Text style={styles.counterBtnText}>-</Text></TouchableOpacity>
          <Text style={styles.statValueText}>{val}/10</Text>
          <TouchableOpacity style={styles.counterBtn} onPress={() => adjustProfileStat(statKey, 1)}><Text style={styles.counterBtnText}>+</Text></TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderProfileStatBar = (label, value) => {
    const val = value || 5;
    const percentage = (val / 10) * 100;
    return (
      <View style={{ marginBottom: 10 }} key={label}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 'bold' }}>{label}</Text>
          <Text style={{ color: '#39FF14', fontSize: 12, fontWeight: 'bold' }}>{val}/10</Text>
        </View>
        <View style={{ width: '100%', height: 6, backgroundColor: '#0B0E14', borderRadius: 3, overflow: 'hidden' }}>
          <View style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#39FF14', borderRadius: 3 }} />
        </View>
      </View>
    );
  };

  const renderPosition = (code, label, top, left) => {
    const assignedPlayers = teamSheet.filter(p => p.is_starter && p.matchday_position === code && p.available);
    return (
      <TouchableOpacity 
        key={code} 
        style={[styles.positionContainer, { top, left }]}
        onPress={() => {
          if (appMode === 'coach') {
            if (assignedPlayers.length > 0) setLineupAssignPlayer(assignedPlayers[0]);
            else setLineupAssignPlayer({ matchday_position: code, is_starter: true });
          }
        }}
      >
        <View style={styles.badge}><Text style={styles.badgeText}>{label}</Text></View>
        {assignedPlayers.length === 0 ? (
          <View style={[styles.playerCard, { backgroundColor: 'rgba(11, 14, 20, 0.6)' }]}>
            <Text style={[styles.playerName, { color: '#94a3b8' }]} numberOfLines={1}>Unassigned</Text>
          </View>
        ) : (
          assignedPlayers.map(player => (
            <TouchableOpacity
              key={player.id}
              style={[styles.playerCard, { backgroundColor: '#ffffff', marginBottom: 2 }]}
              onPress={() => { if (appMode === 'coach') setLineupAssignPlayer(player); }}
            >
              <Text style={styles.playerName} numberOfLines={1}>
                #{player.squad_number || ''} {player.name}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </TouchableOpacity>
    );
  };

  const renderDepthPosition = (code, label, top, left) => {
    const matches = teamSheet.filter(p => {
      const rawPos = squadDepthFilter === 'primary' ? p.position : p.secondary_position;
      if (!rawPos || rawPos === 'None') return false;
      const resolved = resolvePosForFormation(rawPos, activeFormation);
      return isPlayerEligibleForSlot(resolved, code) || isPlayerEligibleForSlot(rawPos, code);
    });

    return (
      <View key={code} style={[styles.positionContainer, { top, left }]}>
        <View style={[styles.badge, { backgroundColor: squadDepthFilter === 'primary' ? '#39FF14' : '#3b82f6' }]}>
          <Text style={[styles.badgeText, squadDepthFilter === 'primary' && { color: '#0B0E14' }]}>{label}</Text>
        </View>
        
        {matches.map(p => (
          <TouchableOpacity 
            key={`${squadDepthFilter}-${p.id}`} 
            style={[styles.playerCard, { backgroundColor: squadDepthFilter === 'primary' ? '#39FF14' : '#3b82f6', marginBottom: 2 }]} 
            onPress={() => { if(appMode==='coach') setEditingPlayer(p); }}
          >
            <Text style={[styles.playerName, { color: squadDepthFilter === 'primary' ? '#0B0E14' : '#ffffff' }]} numberOfLines={1}>#{p.squad_number || ''} {p.name}</Text>
          </TouchableOpacity>
        ))}

        {matches.length === 0 && (
          <View style={[styles.playerCard, { backgroundColor: 'rgba(11, 14, 20, 0.6)' }]}>
            <Text style={[styles.playerName, { color: '#64748b' }]}>No Cover</Text>
          </View>
        )}
      </View>
    );
  };

  const SUPABASE_LOGO_URL = 'https://jnogngcywfgitzryooig.supabase.co/storage/v1/object/public/app-assets/Tactical%20Engine%20Logo.png';

  if (loading) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <View style={styles.splashCenterBox}>
          <Image
            source={{ uri: SUPABASE_LOGO_URL }}
            style={styles.splashLogoImage}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#39FF14" style={{ marginTop: 20 }} />
          <Text style={styles.splashLoadingText}>TACTICAL ENGINE LOADING...</Text>
        </View>
      </SafeAreaView>
    );
  }
  // 🔒 LOGIN / SIGN-UP SCREEN
  if (!session) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollAuthContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.authBox}>
              <Text style={styles.authHeaderSub}>Tactical Engine</Text>
              <Text style={styles.authHeaderTitle}>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</Text>

              {authMessage.text ? (
                <Text style={authMessage.type === 'error' ? styles.errorText : styles.successText}>
                  {authMessage.text}
                </Text>
              ) : null}

              {authMode === 'signup' && (
                <>
                  <Text style={styles.inputLabel}>Full Name:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Pep Guardiola"
                    placeholderTextColor="#64748b"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Email Address:</Text>
              <TextInput
                style={styles.input}
                placeholder="coach@example.com"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={styles.inputLabel}>Password:</Text>
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity style={styles.primaryAuthBtn} onPress={handleAuth}>
                <Text style={styles.primaryAuthBtnText}>
                  {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ marginTop: 20 }} 
                onPress={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                  setAuthMessage({ text: '', type: '' });
                }}
              >
                <Text style={styles.switchAuthText}>
                  {authMode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // 🔒 ROLE SELECTION GATE FOR NEW ACCOUNTS
  if (session && profile && !profile.role_configured) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollAuthContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.authBox}>
              <Text style={styles.authHeaderSub}>Welcome to Tactical Engine</Text>
              <Text style={styles.authHeaderTitle}>Select Your Role</Text>

              {onboardingStep === 'choose_path' && (
                <>
                  <TouchableOpacity style={styles.wizardOptionBtn} onPress={() => setOnboardingStep('role_selection')}>
                    <Text style={styles.wizardOptionTitle}>⚽ Create New Team (Head Coach / Staff)</Text>
                    <Text style={styles.wizardOptionSub}>Start a new team, manage tactics, and generate join codes for your staff and parents.</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.wizardOptionBtn, { borderColor: '#3b82f6' }]} onPress={() => setOnboardingStep('parent_notice')}>
                    <Text style={[styles.wizardOptionTitle, { color: '#3b82f6' }]}>🔑 Join Existing Team</Text>
                    <Text style={styles.wizardOptionSub}>Enter a Join Code provided by your Head Coach.</Text>
                  </TouchableOpacity>
                </>
              )}

              {onboardingStep === 'role_selection' && (
                <>
                  <Text style={[styles.inputLabel, { marginBottom: 10, textAlign: 'center' }]}>What is your role on this team?</Text>
                  
                  <TouchableOpacity style={[styles.wizardOptionBtn, selectedCreationRole === 'coach' && { borderColor: '#39FF14' }]} onPress={() => setSelectedCreationRole('coach')}>
                    <Text style={styles.wizardOptionTitle}>👑 Head Coach</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.wizardOptionBtn, selectedCreationRole === 'assistant' && { borderColor: '#39FF14' }]} onPress={() => setSelectedCreationRole('assistant')}>
                    <Text style={styles.wizardOptionTitle}>⚽ Assistant Coach</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.wizardOptionBtn, selectedCreationRole === 'admin' && { borderColor: '#39FF14' }]} onPress={() => setSelectedCreationRole('admin')}>
                    <Text style={styles.wizardOptionTitle}>📋 Team Administrator</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.primaryAuthBtn} onPress={() => setOnboardingStep('coach_setup')}>
                    <Text style={styles.primaryAuthBtnText}>Continue to Team Setup ➔</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ marginTop: 15 }} onPress={() => setOnboardingStep('choose_path')}>
                    <Text style={styles.switchAuthText}>← Back</Text>
                  </TouchableOpacity>
                </>
              )}

              {onboardingStep === 'coach_setup' && (
                <>
                  <Text style={styles.inputLabel}>Team Name:</Text>
                  <TextInput style={styles.input} placeholder="e.g. Marlborough Youth FC" placeholderTextColor="#64748b" value={teamName} onChangeText={setTeamName} />

                  <Text style={styles.inputLabel}>Age Group:</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 15 }}>
                    {ageGroupOptions.map((age) => (
                      <TouchableOpacity key={age} style={[styles.fmtBtn, teamAgeGroup === age && styles.fmtBtnActive]} onPress={() => setTeamAgeGroup(age)}>
                        <Text style={[styles.fmtBtnText, teamAgeGroup === age && styles.fmtBtnTextActive]}>{age}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.primaryAuthBtn} onPress={createTeamFlow}>
                    <Text style={styles.primaryAuthBtnText}>Create Team & Enter App</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ marginTop: 15 }} onPress={() => setOnboardingStep('role_selection')}>
                    <Text style={styles.switchAuthText}>← Back to Role</Text>
                  </TouchableOpacity>
                </>
              )}

              {onboardingStep === 'parent_notice' && (
                <>
                  <View style={{ backgroundColor: '#0B0E14', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#3b82f6', marginBottom: 15 }}>
                    <Text style={{ color: '#ffffff', fontSize: 13, lineHeight: 18, textAlign: 'center' }}>
                      📢 <Text style={{ fontWeight: 'bold', color: '#3b82f6' }}>Notice:</Text> Enter the code provided by your Head Coach.
                    </Text>
                  </View>

                  <Text style={styles.inputLabel}>Join Code:</Text>
                  <TextInput style={[styles.input, familyCodeInput ? { borderColor: '#39FF14', color: '#39FF14', fontWeight: 'bold' } : null]} placeholder="e.g. STAF-1234, ADMN-1234, or FAM-1234" placeholderTextColor="#64748b" value={familyCodeInput} onChangeText={setFamilyCodeInput} autoCapitalize="characters" />

                  <TouchableOpacity style={[styles.primaryAuthBtn, { backgroundColor: '#3b82f6' }]} onPress={linkChildFlow}>
                    <Text style={[styles.primaryAuthBtnText, { color: '#ffffff' }]}>Link Account & Continue</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={{ marginTop: 15 }} onPress={() => setOnboardingStep('choose_path')}>
                    <Text style={styles.switchAuthText}>← Back to Selection</Text>
                  </TouchableOpacity>
                </>
              )}

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      {/* TOP HEADER BAR */}
      <View style={styles.masterToggleBar}>
        <TouchableOpacity style={styles.menuTriggerBtn} onPress={() => setIsSidebarOpen(true)}>
          <Text style={styles.menuTriggerIcon}>☰</Text>
        </TouchableOpacity>

        {/* MODE TOGGLE: EXCLUSIVELY VISIBLE TO SUPERUSER (Darrell.Clarke@me.com) */}
        {isSuperUser ? (
          <View style={styles.toggleCenterGroup}>
            <TouchableOpacity style={[styles.masterToggleBtn, appMode === 'coach' && styles.masterToggleBtnActive]} onPress={() => handleModeSwitch('coach')}>
              <Text style={[styles.masterToggleBtnText, appMode === 'coach' && styles.masterToggleBtnTextActive]}>COACH</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.masterToggleBtn, appMode === 'parent' && styles.masterToggleBtnActive]} onPress={() => handleModeSwitch('parent')}>
              <Text style={[styles.masterToggleBtnText, appMode === 'parent' && styles.masterToggleBtnTextActive]}>
                {isAdultTeam ? 'FAN' : 'PARENT'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.masterToggleBtn, appMode === 'player' && styles.masterToggleBtnActive]} onPress={() => handleModeSwitch('player')}>
              <Text style={[styles.masterToggleBtnText, appMode === 'player' && styles.masterToggleBtnTextActive]}>PLAYER</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>
              {activeTeamObj?.name || 'Tactical Engine'}
            </Text>
            <Text style={{ color: '#39FF14', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
              {profile?.role === 'coach' ? 'Head Coach' : profile?.role === 'assistant' ? 'Assistant Coach' : profile?.role === 'admin' ? 'Team Admin' : profile?.role === 'parent' ? (isAdultTeam ? 'Fan View' : 'Parent View') : 'Player View'}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* MULTI-TEAM HORIZONTAL SELECTOR BAR */}
      {appMode === 'coach' && myTeams.length > 0 && (
        <View style={styles.teamSelectorBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {myTeams.map(t => (
              <TouchableOpacity 
                key={t.id} 
                style={[styles.teamTab, activeTeamId === t.id && styles.teamTabActive]}
                onPress={() => {
                  setActiveTeamId(t.id);
                  const ageGrp = t.age_group || 'U16';
                  setTeamAgeGroup(ageGrp);

                  // ⚡ Instant local formation switch on tap
                  const is9v9 = ['U13'].includes(String(ageGrp).toUpperCase());
                  setActiveFormation(t.default_formation || (is9v9 ? '3-3-2' : '4-2-3-1'));
                }}
              >
                <Text style={[styles.teamTabText, activeTeamId === t.id && styles.teamTabTextActive]}>
                  {t.name} ({t.age_group || 'U16'})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* SCREEN ROUTER VIEWER */}
      <View style={styles.screenViewer}>

        {/* PLAYER & PARENT / FAN PROFILE VIEW */}
        {(currentTab === 'player' || currentTab === 'profiles') && appMode !== 'coach' && (
          <PlayerProfileScreen
            myLinkedPlayers={myLinkedPlayers}
            teamSheet={teamSheet}
            activePlayerId={activePlayerId}
            setActivePlayerId={setActivePlayerId}
            activeFormation={activeFormation}
            appMode={appMode}
            teamAgeGroup={effectiveAgeGroup}
            playerTab={playerTab}
            setPlayerTab={setPlayerTab}
            matchHistory={matchHistory}
            setIsMatchArchiveOpen={setIsMatchArchiveOpen}
            liveTicker={liveTicker}
            fetchLiveTicker={fetchLiveTicker}
            activeTeamId={activeTeamId}
            matchPhase={matchPhase}
            hasVotedMotm={hasVotedMotm}
            votedPlayerName={votedPlayerName}
            setLiveEventMode={setLiveEventMode}
            scoutNotesInput={scoutNotesInput}
            activePlayer={activePlayer}
            shareFanInvite={shareFanInvite}
            shareCoParentInvite={shareCoParentInvite}
            hasSecondaryRole={hasSecondaryRole}
            viewingRoleToggle={viewingRoleToggle}
            setViewingRoleToggle={setViewingRoleToggle}
            isGroupedRole={isGroupedRole}
            subRoleOptions={subRoleOptions}
            activeSubRole={activeSubRole}
            setActiveSubRole={setActiveSubRole}
            setQuizState={setQuizState}
            setCurrentQuizIdx={setCurrentQuizIdx}
            activeTactics={activeTactics}
            currentQuizIdx={currentQuizIdx}
            currentQuizList={currentQuizList}
            currentQuiz={currentQuiz}
            handleQuizAnswer={handleQuizAnswer}
            quizState={quizState}
            handleNextQuestion={handleNextQuestion}
            handleRestartQuiz={handleRestartQuiz}
            renderProfileStatBar={renderProfileStatBar}
            toggleRSVP={toggleRSVP}
            setIsFaWebviewOpen={setIsFaWebviewOpen}
            faLeagueUrl={faLeagueUrl}
          />
        )}

        {/* COACH PROFILES LIST */}
        {currentTab === 'profiles' && appMode === 'coach' && (
          <View style={{ flex: 1 }}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerSub}>Development Center</Text>
                <Text style={styles.headerTitle}>Player Profiles</Text>
              </View>
              <TouchableOpacity style={styles.addPlayerBtn} onPress={() => setIsAddPlayerModalOpen(true)}>
                <Text style={styles.addPlayerBtnText}>➕ Add Player</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
              {(teamSheet || []).map(p => p && (
                <TouchableOpacity key={p.id} style={styles.card} onPress={() => setEditingPlayer(p)}>
                  {/* HEADER ROW: Name on Left, Edit Profile Button on Right */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={[styles.roleTitle, { flex: 1, marginRight: 10 }]} numberOfLines={1}>
                      #{p.squad_number || '0'} {p.name}
                    </Text>
                    <View style={styles.editProfileBtn}>
                      <Text style={styles.editProfileBtnText}>Edit Profile</Text>
                    </View>
                  </View>

                  {/* COMPACT PLAYER SUMMARY BOX */}
                  <View style={{ backgroundColor: '#0B0E14', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44' }}>
                    <Text style={[styles.roleSubTitle, { marginBottom: 4 }]}>
                      Primary: <Text style={{ color: '#39FF14' }}>{p.position || 'TBD'}</Text> | Secondary: <Text style={{ color: '#3b82f6' }}>{p.secondary_position || 'None'}</Text>
                    </Text>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                      <Text style={{ color: '#cbd5e1', fontSize: 11 }}>
                        Apps: <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{p.apps || 0}</Text> | Mins: <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{p.total_minutes_played || 0}'</Text>
                      </Text>
                      <Text style={{ color: '#cbd5e1', fontSize: 11 }}>
                        Goals: <Text style={{ color: '#39FF14', fontWeight: 'bold' }}>{p.goals || 0}</Text> | Assists: <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>{p.assists || 0}</Text>
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* COACH HUB */}
        {currentTab === 'coachHub' && (
          <CoachHubScreen
            matchHistory={matchHistory}
            setIsMatchArchiveOpen={setIsMatchArchiveOpen}
            isRsvpListExpanded={isRsvpListExpanded}
            setIsRsvpListExpanded={setIsRsvpListExpanded}
            teamSheet={teamSheet}
            toggleRSVP={toggleRSVP}
            selectedGameState={selectedGameState}
            setSelectedGameState={setSelectedGameState}
            gameStateTactics={gameStateTactics}
            myLinkedPlayers={myLinkedPlayers}
            myChildId={myChildId}
            setMyChildId={setMyChildId}
            myChild={myChild}
            shareCoParentInvite={shareCoParentInvite}
          />
        )}

        {/* LIVE MATCH (COACH MODE) */}
        {currentTab === 'liveMatch' && (
          <LiveMatchScreen
            appMode={appMode}
            handlePhaseChange={handlePhaseChange}
            getPhaseButtonText={getPhaseButtonText}
            activeTeamObj={activeTeamObj}
            initGoalFlow={initGoalFlow}
            initCardFlow={initCardFlow}
            onPitchPlayers={onPitchPlayers}
            subs={subs}
          />
        )}

        {/* LINEUP SCREEN (ALL MODES) */}
        {currentTab === 'lineup' && (
          <LineupScreen
            activeFormation={activeFormation}
            appMode={appMode}
            lineupViewMode={lineupViewMode}
            setLineupViewMode={setLineupViewMode}
            setIsFormationModalOpen={setIsFormationModalOpen}
            isTafeDisabled={isTafeDisabled}
            openTafeModal={openTafeModal}
            isLoadingSheet={isLoadingSheet}
            squadDepthFilter={squadDepthFilter}
            setSquadDepthFilter={setSquadDepthFilter}
            activeLayout={activeLayout}
            renderDepthPosition={renderDepthPosition}
            renderPosition={renderPosition}
            subs={subs}
            setLineupAssignPlayer={setLineupAssignPlayer}
            getFootednessString={getFootednessString}
            teamSheet={teamSheet}
            setTeamSheet={setTeamSheet}
            currentAvailablePositions={currentAvailablePositions}
          />
        )}

        {/* STATS / TEAM SHEET (ALL MODES) */}
        {currentTab === 'teamSheet' && (
          <TeamSheetScreen
            profile={profile}
            appMode={appMode}
            gkPlayers={gkPlayers}
            outfieldPlayers={outfieldPlayers}
            adjustMatchStat={adjustMatchStat}
          />
        )}

        {/* TRAINING CENTER */}
        {currentTab === 'training' && (
          <TrainingScreen
            activeTeamId={activeTeamId}
            isTrainingRegisterExpanded={isTrainingRegisterExpanded}
            setIsTrainingRegisterExpanded={setIsTrainingRegisterExpanded}
            teamSheet={teamSheet}
            trainingRegister={trainingRegister}
            setTrainingRegister={setTrainingRegister}
            submitTrainingSession={submitTrainingSession}
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
            activeWeekData={activeWeekData}
            openDrillVideo={openDrillVideo}
          />
        )}

        {/* CUSTOM TRAINING PLANNER */}
        {currentTab === 'customTraining' && (
          <CustomTrainingScreen
            activeTeamId={activeTeamId}
            setDrillSelectorMode={setDrillSelectorMode}
            selectedWarmup={selectedWarmup}
            selectedDrill1={selectedDrill1}
            selectedDrill2={selectedDrill2}
            selectedSSG={selectedSSG}
            openDrillVideo={openDrillVideo}
          />
        )}

      </View>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        {(appMode === 'player' || appMode === 'parent') && (
          <>
            <TouchableOpacity style={styles.navButton} onPress={() => setCurrentTab('player')}>
              <Text style={[styles.navIcon, currentTab === 'player' && styles.activeNav]}>⚽</Text>
              <Text style={[styles.navText, currentTab === 'player' && styles.activeNav]}>
                {(appMode === 'parent' && isAdultTeam) ? 'Match Hub' : 'My Profile'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.navButton} onPress={() => setCurrentTab('lineup')}>
              <Text style={[styles.navIcon, currentTab === 'lineup' && styles.activeNav]}>🛡</Text>
              <Text style={[styles.navText, currentTab === 'lineup' && styles.activeNav]}>Lineup</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navButton} onPress={() => setCurrentTab('teamSheet')}>
              <Text style={[styles.navIcon, currentTab === 'teamSheet' && styles.activeNav]}>📊</Text>
              <Text style={[styles.navText, currentTab === 'teamSheet' && styles.activeNav]}>Stats</Text>
            </TouchableOpacity>
          </>
        )}

        {appMode === 'coach' && (
          <>
            <TouchableOpacity style={styles.navButton} onPress={() => setCurrentTab('profiles')}>
              <Text style={[styles.navIcon, currentTab === 'profiles' && styles.activeNav]}>👤</Text>
              <Text style={[styles.navText, currentTab === 'profiles' && styles.activeNav]}>Profiles</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navButton} onPress={() => setCurrentTab('coachHub')}>
              <Text style={[styles.navIcon, currentTab === 'coachHub' && styles.activeNav]}>📋</Text>
              <Text style={[styles.navText, currentTab === 'coachHub' && styles.activeNav]}>Hub</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navButton} onPress={() => setCurrentTab('liveMatch')}>
              <Text style={[styles.navIcon, currentTab === 'liveMatch' && styles.activeNav]}>⏱️</Text>
              <Text style={[styles.navText, currentTab === 'liveMatch' && styles.activeNav]}>Live</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navButton} onPress={() => setCurrentTab('lineup')}>
              <Text style={[styles.navIcon, currentTab === 'lineup' && styles.activeNav]}>🛡️</Text>
              <Text style={[styles.navText, currentTab === 'lineup' && styles.activeNav]}>Lineup</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navButton} onPress={() => setCurrentTab('teamSheet')}>
              <Text style={[styles.navIcon, currentTab === 'teamSheet' && styles.activeNav]}>📊</Text>
              <Text style={[styles.navText, currentTab === 'teamSheet' && styles.activeNav]}>Stats</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* MODALS & OVERLAYS */}
      <Modal visible={isSeasonArchiveOpen} transparent={true} animationType="slide">
        <View style={styles.modalOverlayFull}>
          <SafeAreaView style={{ flex: 1, width: '100%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#2E3A44', backgroundColor: '#0B0E14' }}>
              <Text style={{ color: '#3b82f6', fontSize: 18, fontWeight: 'bold' }}>📁 Season Vault</Text>
              <TouchableOpacity onPress={() => setIsSeasonArchiveOpen(false)} style={{ backgroundColor: '#1A1F26', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 }}>
                <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>

            {viewingSeasonReport ? (
              <ScrollView style={{ flex: 1, backgroundColor: '#0B0E14', padding: 15 }}>
                <TouchableOpacity onPress={() => setViewingSeasonReport(null)} style={{ marginBottom: 15 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 14 }}>← Back to Archives</Text>
                </TouchableOpacity>
                <View style={[styles.card, { borderColor: '#3b82f6' }]}>
                  <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 22 }}>
                    {viewingSeasonReport.report_text}
                  </Text>
                </View>
              </ScrollView>
            ) : (
              <ScrollView style={{ flex: 1, backgroundColor: '#0B0E14', padding: 15 }}>
                {seasonReports.length === 0 ? (
                  <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 40 }}>No archived seasons found for this team.</Text>
                ) : (
                  seasonReports.map(report => (
                    <TouchableOpacity 
                      key={report.id} 
                      style={[styles.card, { borderColor: '#3b82f6' }]}
                      onPress={() => setViewingSeasonReport(report)}
                    >
                      <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 16 }}>{report.season_label}</Text>
                      <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>
                        Archived: {new Date(report.created_at).toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      <MatchArchiveModal
        visible={isMatchArchiveOpen}
        onClose={() => setIsMatchArchiveOpen(false)}
        matchHistory={matchHistory}
        appMode={appMode}
        teamSheet={teamSheet}
        startArchiveGoalEdit={startArchiveGoalEdit}
        archiveEditStep={archiveEditStep}
        selectedArchiveScorer={selectedArchiveScorer}
        selectArchiveScorer={selectArchiveScorer}
        finishArchiveGoalEdit={finishArchiveGoalEdit}
        setArchiveEditStep={setArchiveEditStep}
        setEditingArchiveMatch={setEditingArchiveMatch}
        setEditingArchiveEventIdx={setEditingArchiveEventIdx}
      />

      <SeasonResetModal
        visible={isSeasonResetModalOpen}
        onClose={() => { setIsSeasonResetModalOpen(false); setSeasonResetConfirmText(''); }}
        seasonResetConfirmText={seasonResetConfirmText}
        setSeasonResetConfirmText={setSeasonResetConfirmText}
        startNewSeasonFlow={startNewSeasonFlow}
        isSavingSeason={isSavingSeason}
      />

      <SubReasonModal
        visible={subReasonModalState.visible}
        onClose={() => setSubReasonModalState({ visible: false, offPlayer: null, onPlayer: null })}
        subReasonModalState={subReasonModalState}
        finalizeSubWithReason={finalizeSubWithReason}
      />

      <FormationModal
        visible={isFormationModalOpen}
        onClose={() => setIsFormationModalOpen(false)}
        activeFormation={activeFormation}
        setActiveFormation={setActiveFormation}
        teamSheet={teamSheet}
        setTeamSheet={setTeamSheet}
        ageGroup={activeTeamObj?.age_group}
        activeTeamId={activeTeamId}
        setMyTeams={setMyTeams}
      />

      <TafeModal
        visible={isTafeModalOpen}
        onClose={() => setIsTafeModalOpen(false)}
        tafeStep={tafeStep}
        tafeBackline={tafeBackline}
        tafeSuggestions={tafeSuggestions}
        tafeOther={tafeOther}
        runTafeAlgorithm={runTafeAlgorithm}
        applyTafeFormation={applyTafeFormation}
        is9v9Team={is9v9Team}
      />

      <CreateTeamModal
        visible={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        newTeamName={newTeamName}
        setNewTeamName={setNewTeamName}
        newTeamAgeGroup={newTeamAgeGroup}
        setNewTeamAgeGroup={setNewTeamAgeGroup}
        ageGroupOptions={ageGroupOptions}
        createNewTeamFromSidebar={createNewTeamFromSidebar}
      />

      <StaffManagementModal
        visible={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        activeTeamObj={activeTeamObj}
        currentUserId={session?.user?.id}
        userRole={profile?.role}
        isSuperUser={isSuperUser}
        onTeamUpdated={() => fetchUserProfile(session?.user?.id)}
        shareStaffInvite={shareStaffInvite}
      />

      <InviteModal
        visible={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        appMode={appMode}
        userRole={profile?.role}
        activeTeamObj={activeTeamObj}
        teamSheet={teamSheet}
        teamAgeGroup={effectiveAgeGroup}
        activePlayer={activePlayer}
        shareStaffInvite={shareStaffInvite}
        shareFanInvite={shareFanInvite}
        shareCoParentInvite={shareCoParentInvite}
      />

      {/* COACH NOTES STAGING MODAL */}
      <CoachNotesStagingModal
        visible={isNotesStagingModalOpen}
        onClose={() => setIsNotesStagingModalOpen(false)}
        teamSheet={teamSheet}
        activeTeamId={activeTeamId}
        onNotesPushed={() => fetchTeamData(session?.user?.id, activeTeamId)}
      />

      {/* FA LEAGUE TABLE WEBVIEW MODAL */}
      <Modal visible={isFaWebviewOpen} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0E14' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#2E3A44' }}>
            <Text style={{ color: '#39FF14', fontSize: 18, fontWeight: 'bold' }}>🏆 FA League Table</Text>
            <TouchableOpacity onPress={() => setIsFaWebviewOpen(false)} style={{ backgroundColor: '#1A1F26', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 }}>
              <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
          {faLeagueUrl ? (
            <WebView 
              source={{ uri: faLeagueUrl }} 
              style={{ flex: 1 }}
              injectedJavaScript={`
                const style = document.createElement('style');
                style.innerHTML = 'a, button, input, select, textarea { pointer-events: none !important; cursor: default !important; }';
                document.head.appendChild(style);
                true;
              `}
              onShouldStartLoadWithRequest={(request) => request.url === faLeagueUrl}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <Text style={{ color: '#cbd5e1', textAlign: 'center', fontSize: 15, marginBottom: 15 }}>
                No FA League Table URL set for this team yet.
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* YOUTUBE PLAYER MODAL */}
      <Modal 
        visible={!!activeVideoId} 
        transparent={true} 
        animationType="fade"
        supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      >
        <View style={styles.modalOverlayFull}>
          <View style={[styles.modalBoxFull, { padding: 10, backgroundColor: '#1A1F26' }]}>
            <Text style={styles.modalTitle}>📹 Tactical Video Analysis</Text>
            {activeVideoId && (
              <YoutubePlayer
                height={220}
                play={true}
                videoId={activeVideoId}
                onChangeState={(event: string) => {
                  if (event === "ended") setActiveVideoId(null);
                }}
              />
            )}
            <TouchableOpacity style={[styles.cancelBtn, { marginTop: 15 }]} onPress={() => setActiveVideoId(null)}>
              <Text style={styles.cancelBtnText}>✕ Close Player</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DRILL SELECTOR MODAL */}
      <Modal visible={!!drillSelectorMode} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setDrillSelectorMode(null)} />
          <View style={[styles.modalBox, { maxHeight: '70%' }]}>
            <Text style={styles.modalTitle}>Select Training Phase</Text>
            <ScrollView style={{ width: '100%' }}>
              {(drillSelectorMode === 'warmup' ? trainingLibrary.warmups : drillSelectorMode === 'rondo' ? trainingLibrary.rondos : drillSelectorMode === 'ssg' ? trainingLibrary.ssgs : trainingLibrary.drills).map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.inviteRow} 
                  onPress={() => {
                    if (drillSelectorMode === 'warmup') setSelectedWarmup(item);
                    if (drillSelectorMode === 'rondo') setSelectedDrill1(item);
                    if (drillSelectorMode === 'drill2') setSelectedDrill2(item);
                    if (drillSelectorMode === 'ssg') setSelectedSSG(item);
                    setDrillSelectorMode(null);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inviteName}>{item.category ? `[${item.category}] ` : ''}{item.title}</Text>
                    <Text style={[styles.inviteCodeText, { color: '#94a3b8' }]} numberOfLines={2}>{item.desc || item.description || item.tactical_objective}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setDrillSelectorMode(null)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EVENT LOGGING MODALS */}
      <Modal visible={liveEventMode === 'goal_scorer'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLiveEventMode('none')} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Who Scored? ({pendingEvent?.minute})</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <TouchableOpacity style={[styles.benchBtn, { backgroundColor: '#7f1d1d' }]} onPress={() => selectGoalScorer('Opponent')}><Text style={styles.benchBtnText}>{opponentName || 'Opponent'} Team ⚽</Text></TouchableOpacity>
              {(onPitchPlayers || []).map(p => p && (
                <TouchableOpacity key={p.id} style={styles.liveActionBtnRow} onPress={() => selectGoalScorer(p)}><Text style={styles.liveActionTextRow}>{p.name}</Text></TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={liveEventMode === 'goal_assist'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLiveEventMode('none')} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Who Assisted? ({pendingEvent?.minute})</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <TouchableOpacity style={[styles.benchBtn, { backgroundColor: '#2E3A44' }]} onPress={() => selectGoalAssist('None')}><Text style={styles.benchBtnText}>No Assist</Text></TouchableOpacity>
              {(onPitchPlayers || []).map(p => p && (
                <TouchableOpacity key={p.id} style={styles.liveActionBtnRow} onPress={() => selectGoalAssist(p)}><Text style={styles.liveActionTextRow}>{p.name}</Text></TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={liveEventMode === 'card_type'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLiveEventMode('none')} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Log Disciplinary ({pendingEvent?.minute})</Text>
            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-around' }}>
              <TouchableOpacity style={[styles.liveActionBtn, { borderColor: '#eab308', borderWidth: 2 }]} onPress={() => selectCardType('yellow')}><Text style={styles.liveActionIcon}>🟨</Text><Text style={styles.liveActionText}>Yellow Card</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.liveActionBtn, { borderColor: '#ef4444', borderWidth: 2 }]} onPress={() => selectCardType('red')}><Text style={styles.liveActionIcon}>🟥</Text><Text style={styles.liveActionText}>Red Card</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={liveEventMode === 'card_player'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLiveEventMode('none')} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Who got the {pendingEvent?.cardType === 'yellow' ? 'Yellow' : 'Red'} Card?</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <TouchableOpacity style={[styles.benchBtn, { backgroundColor: '#7f1d1d' }]} onPress={() => finishCardFlow('Opponent')}><Text style={styles.benchBtnText}>{opponentName || 'Opponent'} Team</Text></TouchableOpacity>
              {(teamSheet || []).map(p => p && (
                <TouchableOpacity key={p.id} style={styles.liveActionBtnRow} onPress={() => finishCardFlow(p)}><Text style={styles.liveActionTextRow}>{p.name} {p.is_starter ? '(Pitch)' : '(Bench)'}</Text></TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={liveEventMode === 'coach_motm'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLiveEventMode('none')} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Coach's Player of the Match ⭐</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {(teamSheet || []).map(p => p && (
                <TouchableOpacity key={p.id} style={styles.liveActionBtnRow} onPress={() => selectCoachMotm(p)}><Text style={styles.liveActionTextRow}>#{p.squad_number || ''} {p.name}</Text></TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={liveEventMode === 'parent_motm'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLiveEventMode('none')} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Vote Fans' Player of the Match 🌟</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {(teamSheet || []).map(p => p && (
                <TouchableOpacity key={p.id} style={styles.liveActionBtnRow} onPress={() => selectParentMotm(p)}><Text style={styles.liveActionTextRow}>#{p.squad_number || ''} {p.name}</Text></TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={liveEventMode === 'sub_selection'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLiveEventMode('none')} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {pendingEvent?.isSubbingOff 
                ? `Who is coming ON for ${pendingEvent?.sourcePlayer?.name}?` 
                : `Who is coming OFF for ${pendingEvent?.sourcePlayer?.name}?`}
            </Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {(pendingEvent?.isSubbingOff ? subs : onPitchPlayers).map(p => p && (
                <TouchableOpacity key={p.id} style={styles.liveActionBtnRow} onPress={() => promptSubReason(p)}>
                  <Text style={styles.liveActionTextRow}>#{p.squad_number || ''} {p.name} {p.is_starter ? `(${p.matchday_position})` : ''}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLiveEventMode('none')}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* LINEUP ASSIGNMENT MODAL */}
      <Modal visible={!!lineupAssignPlayer} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLineupAssignPlayer(null)} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Matchday Role: {lineupAssignPlayer?.name || 'Player'}</Text>
            
            <Text style={styles.inputLabel}>Assign Pitch Slot (Starter):</Text>
            <View style={styles.positionGrid}>
              {(currentAvailablePositions || []).map(pos => (
                <TouchableOpacity 
                  key={pos} 
                  style={[styles.gridBtn, lineupAssignPlayer?.matchday_position === pos && lineupAssignPlayer?.is_starter && { backgroundColor: '#39FF14' }]} 
                  onPress={() => assignPlayerRole(lineupAssignPlayer, pos, true)}
                >
                  <Text style={[styles.gridBtnText, lineupAssignPlayer?.matchday_position === pos && lineupAssignPlayer?.is_starter && { color: '#0B0E14' }]}>{pos}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.benchBtn} onPress={() => assignPlayerRole(lineupAssignPlayer, 'Bench', false)}>
              <Text style={styles.benchBtnText}>🔄 Set as Substitute (Bench)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cancelBtn, { marginTop: 15 }]} onPress={() => setLineupAssignPlayer(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ACTIVE LIVE PLAYER QUICK ACTION MODAL */}
      <Modal visible={!!activeLivePlayer && liveEventMode === 'none'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setActiveLivePlayer(null)} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Quick Action: {activeLivePlayer?.name || 'Player'}</Text>
            
            {getPosCategory(activeLivePlayer?.position) === 'GK' && (
              <TouchableOpacity style={[styles.liveActionBtn, { width: '100%', marginBottom: 15 }]} onPress={logLiveSave}>
                <Text style={styles.liveActionIcon}>🧤</Text>
                <Text style={styles.liveActionText}>Log Save</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.liveActionBtn, { width: '100%', borderColor: '#3b82f6', borderWidth: 2 }]} onPress={() => initSubFlow(activeLivePlayer)}>
              <Text style={styles.liveActionIcon}>🔄</Text>
              <Text style={[styles.liveActionText, { color: '#3b82f6' }]}>Substitute Player</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cancelBtn, { marginTop: 15 }]} onPress={() => setActiveLivePlayer(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DELETE TEAM CONFIRMATION MODAL */}
      <Modal visible={!!teamToDelete} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => { setTeamToDelete(null); setDeleteTeamConfirmText(''); }} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Entire Team</Text>
            <Text style={[styles.bulletText, { marginBottom: 15, textAlign: 'center' }]}>
              Type <Text style={{fontWeight: 'bold', color: '#ef4444'}}>delete team</Text> to permanently remove <Text style={{color: '#39FF14', fontWeight: 'bold'}}>{teamToDelete?.name}</Text> and all associated data. This is completely irreversible.
            </Text>
            <TextInput 
              style={[styles.input, { textAlign: 'center', fontWeight: 'bold', fontSize: 18 }]} 
              placeholder="Type delete team" 
              placeholderTextColor="#64748b" 
              value={deleteTeamConfirmText} 
              onChangeText={setDeleteTeamConfirmText} 
              autoCapitalize="none"
            />
            <TouchableOpacity style={[styles.deleteBtn, { opacity: deleteTeamConfirmText.trim().toLowerCase() === 'delete team' ? 1 : 0.5 }]} onPress={finalizeDeleteTeam}>
              <Text style={styles.deleteBtnText}>Confirm Delete Team</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setTeamToDelete(null); setDeleteTeamConfirmText(''); }}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DELETE PLAYER CONFIRMATION MODAL */}
      <Modal visible={!!playerToDelete} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => { setPlayerToDelete(null); setDeleteConfirmText(''); }} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={[styles.bulletText, { marginBottom: 15, textAlign: 'center' }]}>
              Type <Text style={{fontWeight: 'bold', color: '#ef4444'}}>Delete</Text> to permanently remove {playerToDelete?.name} and all their history. This cannot be undone.
            </Text>
            <TextInput 
              style={[styles.input, { textAlign: 'center', fontWeight: 'bold', fontSize: 18 }]} 
              placeholder="Type Delete" 
              placeholderTextColor="#64748b" 
              value={deleteConfirmText} 
              onChangeText={setDeleteConfirmText} 
              autoCapitalize="none"
            />
            <TouchableOpacity style={[styles.deleteBtn, { opacity: deleteConfirmText.trim().toLowerCase() === 'delete' ? 1 : 0.5 }]} onPress={finalizeDeletePlayer}>
              <Text style={styles.deleteBtnText}>Confirm Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setPlayerToDelete(null); setDeleteConfirmText(''); }}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EDIT PLAYER PROFILE MODAL */}
      <Modal visible={!!editingPlayer} transparent={true} animationType="slide">
        <View style={styles.modalOverlayFull}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setEditingPlayer(null)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }} pointerEvents="box-none">
            <View style={[styles.modalBoxFull, { maxHeight: '85%', flexShrink: 1 }]}>
              <ScrollView style={{ flexGrow: 0 }} showsVerticalScrollIndicator={true} keyboardShouldPersistTaps="handled">
                <Text style={styles.modalTitle}>Full Player Profile</Text>
                
                <Text style={styles.inputLabel}>Name & Jersey #:</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput style={[styles.input, { flex: 1 }]} value={editingPlayer?.name || ''} onChangeText={(val) => setEditingPlayer(prev => prev ? { ...prev, name: val } : null)} />
                  <TextInput style={[styles.input, { width: 60, textAlign: 'center' }]} keyboardType="numeric" value={editingPlayer?.squad_number ? String(editingPlayer.squad_number) : ''} onChangeText={(val) => setEditingPlayer(prev => prev ? { ...prev, squad_number: val } : null)} />
                </View>

                <Text style={[styles.inputLabel, { marginTop: 10 }]}>Dominant Foot (Left to Right):</Text>
                <View style={styles.footednessContainer}>
                  <Text style={styles.footLabel}>L</Text>
                  {[1, 2, 3, 4, 5].map(val => (
                    <TouchableOpacity 
                      key={val} 
                      onPress={() => setEditingPlayer(prev => prev ? {...prev, footedness: val} : null)}
                      style={[styles.footDot, editingPlayer?.footedness === val && styles.footDotActive]}
                    />
                  ))}
                  <Text style={styles.footLabel}>R</Text>
                </View>

                <Text style={[styles.inputLabel, { marginTop: 15, color: '#39FF14' }]}>Primary Position (Coach Assigned):</Text>
                <View style={styles.positionGrid}>
                  {(profilePositions || []).map(pos => (
                    <TouchableOpacity key={pos} style={[styles.gridBtn, editingPlayer?.position === pos && { backgroundColor: '#39FF14' }]} onPress={() => setEditingPlayer(prev => prev ? { ...prev, position: pos } : null)}>
                      <Text style={[styles.gridBtnText, editingPlayer?.position === pos && { color: '#0B0E14' }]}>{pos}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { color: '#3b82f6' }]}>Secondary Position (Coach Assigned):</Text>
                <View style={styles.positionGrid}>
                  {(profileSecondaryPositions || []).map(pos => (
                    <TouchableOpacity key={pos} style={[styles.gridBtn, editingPlayer?.secondary_position === pos && { backgroundColor: '#3b82f6' }]} onPress={() => setEditingPlayer(prev => prev ? { ...prev, secondary_position: pos } : null)}>
                      <Text style={styles.gridBtnText}>{pos}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionHeaderModal}>Physical Attributes</Text>
                {getPosCategory(editingPlayer?.position) !== 'GK' && render1to10Row('Sprint Speed', 'phys_sprint')}
                {getPosCategory(editingPlayer?.position) !== 'GK' && render1to10Row('Acceleration', 'phys_accel')}
                {getPosCategory(editingPlayer?.position) !== 'GK' && render1to10Row('Stamina', 'phys_stamina')}
                {render1to10Row('Strength', 'phys_strength')}
                {render1to10Row('Agility & Balance', 'phys_agility')}

                <Text style={styles.sectionHeaderModal}>Technical Abilities</Text>
                {render1to10Row('First Touch', 'tech_first_touch')}
                {render1to10Row('Short Pass', 'tech_short_pass')}
                
                {getPosCategory(editingPlayer?.position) === 'GK' ? (
                  <>
                    {render1to10Row('Shot Stopping', 'gk_shot_stopping')}
                    {render1to10Row('Handling / Catching', 'gk_handling')}
                    {render1to10Row('1v1 / Rushing', 'gk_1v1')}
                    {render1to10Row('Aerial Command', 'gk_aerial')}
                    {render1to10Row('Sweeping', 'gk_sweeping')}
                    {render1to10Row('Distribution', 'gk_distribution')}
                  </>
                ) : (
                  <>
                    {render1to10Row('Dribbling', 'tech_dribbling')}
                    {render1to10Row('Long Pass', 'tech_long_pass')}
                    {render1to10Row('Shooting Accuracy', 'tech_shooting_acc')}
                    {render1to10Row('Shooting Power', 'tech_shooting_pow')}
                    {render1to10Row('Crossing', 'tech_crossing')}
                    {render1to10Row('Tackling', 'tech_tackling')}
                    {render1to10Row('Interceptions', 'tech_intercept')}
                    {render1to10Row('Heading / Aerial', 'tech_aerial')}
                    {render1to10Row('Attacking Position', 'tech_positioning')}
                  </>
                )}

                <Text style={styles.sectionHeaderModal}>Tactical & Psychological</Text>
                {getPosCategory(editingPlayer?.position) !== 'GK' && render1to10Row('Awareness of Space', 'tact_awareness')}
                {getPosCategory(editingPlayer?.position) !== 'GK' && render1to10Row('Pressing Intelligence', 'tact_pressing')}
                {getPosCategory(editingPlayer?.position) !== 'GK' && render1to10Row('Follow Instructions', 'tact_instructions')}
                {getPosCategory(editingPlayer?.position) !== 'GK' && render1to10Row('Workrate', 'psych_workrate')}
                
                {render1to10Row('Decision Making', 'tact_decision')}
                {render1to10Row('Confidence Level', 'psych_confidence')}
                {render1to10Row('Leadership', 'psych_leadership')}
                {render1to10Row('Composure', 'psych_composure')}

                <Text style={styles.sectionHeaderModal}>Observations</Text>
                <Text style={styles.inputLabel}>Weaknesses to Improve:</Text>
                <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} multiline value={editingPlayer?.notes_weaknesses || ''} onChangeText={(val) => setEditingPlayer(prev => prev ? { ...prev, notes_weaknesses: val } : null)} />
                
                <Text style={styles.inputLabel}>Communication (Notes):</Text>
                <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} multiline value={editingPlayer?.notes_communication || ''} onChangeText={(val) => setEditingPlayer(prev => prev ? { ...prev, notes_communication: val } : null)} />

                <Text style={styles.inputLabel}>Generic Notes:</Text>
                <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} multiline value={editingPlayer?.coach_development_notes || ''} onChangeText={(val) => setEditingPlayer(prev => prev ? { ...prev, coach_development_notes: val } : null)} />

                {(profile?.role === 'coach' && appMode === 'coach') ? (
                  <>
                    <Text style={styles.sectionHeaderModal}>Coach-Only Analytics</Text>
                    <Text style={[styles.inputLabel, { color: '#39FF14' }]}>Total Match Minutes Played:</Text>
                    <TextInput 
                      style={styles.input} 
                      keyboardType="numeric" 
                      value={String(editingPlayer?.total_minutes_played || 0)} 
                      onChangeText={(val) => setEditingPlayer(prev => prev ? { ...prev, total_minutes_played: parseInt(val) || 0 } : null)} 
                    />
                  </>
                ) : null}

                <TouchableOpacity style={styles.primaryAuthBtn} onPress={updateFullPlayerProfile}><Text style={styles.primaryAuthBtnText}>Save Profile Updates</Text></TouchableOpacity>
                <TouchableOpacity style={styles.benchBtn} onPress={() => { assignPlayerRole(editingPlayer, 'Bench', false); setEditingPlayer(null); }}><Text style={styles.benchBtnText}>🔄 Drop to Bench</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.deleteBtn, { marginTop: 15, marginBottom: 30 }]} onPress={() => initiateDeletePlayer(editingPlayer)}><Text style={styles.deleteBtnText}>🗑️ Delete Player</Text></TouchableOpacity>
                
                <View style={{ height: 20 }} />
              </ScrollView>
              <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={() => setEditingPlayer(null)}><Text style={styles.cancelBtnText}>Close</Text></TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ADD PLAYER QUICK SETUP MODAL */}
      <Modal visible={isAddPlayerModalOpen} transparent={true} animationType="slide">
        <View style={styles.modalOverlayFull}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsAddPlayerModalOpen(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }} pointerEvents="box-none">
            <View style={[styles.modalBoxFull, { maxHeight: '85%', flexShrink: 1 }]}>
              <ScrollView style={{ flexGrow: 0 }} showsVerticalScrollIndicator={true} keyboardShouldPersistTaps="handled">
                <Text style={styles.modalTitle}>Add Player Quick Setup</Text>
                <TextInput style={styles.input} placeholder="Player Full Name" placeholderTextColor="#64748b" value={newPlayerName} onChangeText={setNewPlayerName} />
                <TextInput style={styles.input} placeholder="Squad Jersey Number (e.g. 10)" placeholderTextColor="#64748b" keyboardType="numeric" value={newSquadNumber} onChangeText={setNewSquadNumber} />
                
                <Text style={[styles.inputLabel, { marginTop: 10 }]}>Dominant Foot (Left to Right):</Text>
                <View style={styles.footednessContainer}>
                  <Text style={styles.footLabel}>L</Text>
                  {[1, 2, 3, 4, 5].map(val => (
                    <TouchableOpacity 
                      key={val} 
                      onPress={() => setNewPlayerFootedness(val)}
                      style={[styles.footDot, newPlayerFootedness === val && styles.footDotActive]}
                    />
                  ))}
                  <Text style={styles.footLabel}>R</Text>
                </View>

                <Text style={[styles.inputLabel, { marginTop: 10 }]}>Primary Position:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {(profilePositions || []).map(pos => (
                    <TouchableOpacity key={pos} style={[styles.fmtBtn, newPlayerPosition === pos && styles.fmtBtnActive]} onPress={() => setNewPlayerPosition(pos)}><Text style={[styles.fmtBtnText, newPlayerPosition === pos && styles.fmtBtnTextActive]}>{pos}</Text></TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.inputLabel}>Secondary Position:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {(profileSecondaryPositions || []).map(pos => (
                    <TouchableOpacity key={pos} style={[styles.fmtBtn, newSecondaryPosition === pos && styles.fmtBtnActive]} onPress={() => setNewSecondaryPosition(pos)}><Text style={[styles.fmtBtnText, newSecondaryPosition === pos && styles.fmtBtnTextActive]}>{pos}</Text></TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.primaryAuthBtn} onPress={addNewPlayer}><Text style={styles.primaryAuthBtnText}>Create Profile</Text></TouchableOpacity>
              </ScrollView>
              <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={() => setIsAddPlayerModalOpen(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* UNIFIED PDF EXPORT MODAL */}
      <Modal
        visible={isPdfExportModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPdfExportModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {pdfExportStep === 'type' ? (
              <>
                <Text style={styles.modalTitle}>📄 EXPORT BRANDED PDF</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 15, textAlign: 'center' }}>Select the report format to generate:</Text>

                <TouchableOpacity
                  style={styles.inviteRow}
                  onPress={() => {
                    setIsPdfExportModalOpen(false);
                    exportMatchdaySummary();
                  }}
                >
                  <View>
                    <Text style={styles.inviteName}>🏆 Full Team Season Report</Text>
                    <Text style={[styles.inviteCodeText, { color: '#64748B', marginTop: 2, fontWeight: 'normal' }]}>Complete team record, honours, squad stats</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.inviteRow}
                  onPress={() => setPdfExportStep('player_select')}
                >
                  <View>
                    <Text style={styles.inviteName}>👤 Individual Player Report</Text>
                    <Text style={[styles.inviteCodeText, { color: '#64748B', marginTop: 2, fontWeight: 'normal' }]}>360° matrix, match stats, and notes</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cancelBtn, { marginTop: 10 }]}
                  onPress={() => setIsPdfExportModalOpen(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={styles.modalTitle}>Select Player</Text>
                  <TouchableOpacity onPress={() => setPdfExportStep('type')}>
                    <Text style={{ color: '#39FF14', fontWeight: 'bold', fontSize: 12 }}>⬅ Back</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 300, width: '100%' }}>
                  {(teamSheet || []).map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.inviteRow}
                      onPress={async () => {
                        setIsPdfExportModalOpen(false);
                        const currentTeam = myTeams.find(t => t.id === activeTeamId);
                        await generatePlayerReportCard({
                          player: p,
                          teamName: currentTeam?.name || activeTeamObj?.name || 'Tactical Engine Squad',
                          ageGroup: currentTeam?.age_group || effectiveAgeGroup || 'Youth',
                          clubLogoUrl: currentTeam?.logo_url || teamLogoUrl || null
                        });
                      }}
                    >
                      <Text style={styles.inviteName}>#{p.squad_number || 0} {p.name}</Text>
                      <Text style={{ color: '#39FF14', fontWeight: 'bold', fontSize: 12 }}>{p.position || 'CM'} ➔</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={[styles.cancelBtn, { marginTop: 10 }]}
                  onPress={() => setIsPdfExportModalOpen(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* COMMAND MENU SIDEBAR DRAWER */}
      <Modal visible={isSidebarOpen} transparent={true} animationType="fade">
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsSidebarOpen(false)} />
          <View style={styles.sidebarDrawer}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>COMMAND MENU</Text>
              <TouchableOpacity style={styles.sidebarCloseTouchable} onPress={() => setIsSidebarOpen(false)}>
                <Text style={styles.sidebarCloseBtnText}>✕ Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1, marginTop: 10 }} keyboardShouldPersistTaps="handled">
              {appMode === 'coach' && (
                <>
                  {/* DEV SEEDING strictly wrapped in isSuperUser */}
                  {__DEV__ && isSuperUser && (
                    <>
                      <TouchableOpacity 
                        style={[styles.sidebarItem, { borderColor: '#3b82f6' }]} 
                        onPress={() => {
                          setIsSidebarOpen(false);
                          seedFullTeamRoster({
                            activeTeamId,
                            activeTeamName: activeTeamObj?.name,
                            fetchTeamData,
                            userId: session?.user?.id,
                            setLoading
                          });
                        }}
                      >
                        <Text style={[styles.sidebarItemText, { color: '#3b82f6' }]}>🧪 Dev: Seed 16-Player Roster</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.sidebarItem, { borderColor: '#eab308' }]} 
                        onPress={() => {
                          setIsSidebarOpen(false);
                          seedSeasonStats({
                            activeTeamId,
                            activeTeamName: activeTeamObj?.name,
                            teamSheet,
                            fetchTeamData,
                            fetchMatchHistory,
                            userId: session?.user?.id,
                            setLoading
                          });
                        }}
                      >
                        <Text style={[styles.sidebarItemText, { color: '#eab308' }]}>🧪 Dev: Seed Full Season Stats</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.sidebarItem, { borderColor: '#a855f7' }]} 
                        onPress={() => {
                          setIsSidebarOpen(false);
                          testOfflineQueueFlow(activeTeamId);
                        }}
                      >
                        <Text style={[styles.sidebarItemText, { color: '#a855f7' }]}>🧪 Dev: Test Offline Queue & Flush</Text>
                      </TouchableOpacity>

                      <View style={{ marginVertical: 8, height: 1, backgroundColor: '#2E3A44' }} />
                    </>
                  )}

                  {/* MANAGE TEAM STAFF BUTTON */}
                  {(profile?.role === 'coach' || profile?.role === 'assistant' || profile?.role === 'admin' || isSuperUser) && (
                    <TouchableOpacity style={[styles.sidebarItem, { borderColor: '#39FF14' }]} onPress={() => { setIsSidebarOpen(false); setIsStaffModalOpen(true); }}>
                      <Text style={[styles.sidebarItemText, { color: '#39FF14' }]}>👥 Manage Team Staff</Text>
                    </TouchableOpacity>
                  )}

                  {/* STAGED PLAYER NOTES CENTER BUTTON */}
                  <TouchableOpacity 
                    style={[styles.sidebarItem, { borderColor: '#39FF14' }]} 
                    onPress={() => { setIsSidebarOpen(false); setIsNotesStagingModalOpen(true); }}
                  >
                    <Text style={[styles.sidebarItemText, { color: '#39FF14' }]}>📝 Staged Player Notes Center</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.sidebarItem, { borderColor: '#39FF14' }]} onPress={() => { setIsSidebarOpen(false); setPdfExportStep('type'); setIsPdfExportModalOpen(true); }}>
                    <Text style={[styles.sidebarItemText, { color: '#39FF14' }]}>📄 Export Branded PDF Report</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.sidebarItem, { borderColor: '#39FF14' }]} onPress={() => { setIsSidebarOpen(false); setCurrentTab('training'); }}>
                    <Text style={[styles.sidebarItemText, { color: '#39FF14' }]}>⚽ Training Center</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.sidebarItem, { borderColor: '#39FF14' }]} onPress={() => { setIsSidebarOpen(false); setCurrentTab('customTraining'); }}>
                    <Text style={[styles.sidebarItemText, { color: '#39FF14' }]}>🎛️ Custom Training Sessions</Text>
                  </TouchableOpacity>

                  <View style={{ marginVertical: 8, height: 1, backgroundColor: '#2E3A44' }} />

                  <TouchableOpacity style={styles.sidebarItem} onPress={() => { setIsSidebarOpen(false); setIsAddPlayerModalOpen(true); }}>
                    <Text style={styles.sidebarItemText}>➕ Add Player to Squad</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sidebarItem} onPress={exportMatchdaySummary}>
                    <Text style={styles.sidebarItemText}>📤 Share Matchday Lineup</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sidebarItem} onPress={() => { setIsSidebarOpen(false); setIsInviteModalOpen(true); }}>
                    <Text style={styles.sidebarItemText}>🔑 Manage Invite Codes</Text>
                  </TouchableOpacity>

                  <View style={{ marginVertical: 8, height: 1, backgroundColor: '#2E3A44' }} />
                </>
              )}

              <TouchableOpacity style={[styles.sidebarItem, { borderColor: '#3b82f6' }]} onPress={() => { setIsSidebarOpen(false); setIsFaWebviewOpen(true); }}>
                <Text style={[styles.sidebarItemText, { color: '#3b82f6' }]}>🏆 FA League Table</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.sidebarItem, { borderColor: '#3b82f6' }]} onPress={() => { setIsSidebarOpen(false); setIsMatchArchiveOpen(true); }}>
                <Text style={[styles.sidebarItemText, { color: '#3b82f6' }]}>📜 Past Match Reports</Text>
              </TouchableOpacity>

              {appMode !== 'coach' && (
                <TouchableOpacity style={styles.sidebarItem} onPress={() => { setIsSidebarOpen(false); setIsInviteModalOpen(true); }}>
                  <Text style={styles.sidebarItemText}>🔑 Share Invite Codes</Text>
                </TouchableOpacity>
              )}

              {appMode === 'coach' && (
                <>
                  <TouchableOpacity style={[styles.sidebarItem, { borderColor: '#3b82f6' }]} onPress={() => { setIsSidebarOpen(false); setIsSeasonArchiveOpen(true); }}>
                    <Text style={[styles.sidebarItemText, { color: '#3b82f6' }]}>📁 Past Season Reports</Text>
                  </TouchableOpacity>

                  <View style={{ marginVertical: 12, height: 1, backgroundColor: '#2E3A44' }} />

                  <Text style={styles.inputLabel}>Team Badge / Logo Image URL:</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Paste Image URL (PNG/JPG)..." 
                    placeholderTextColor="#64748b" 
                    value={teamLogoUrl} 
                    onChangeText={setTeamLogoUrl} 
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={[styles.primaryAuthBtn, { backgroundColor: '#39FF14', marginBottom: 15 }]} onPress={saveTeamLogoUrl}>
                    <Text style={[styles.primaryAuthBtnText, { color: '#0B0E14' }]}>Save Team Logo</Text>
                  </TouchableOpacity>

                  <Text style={styles.inputLabel}>FA League Table Web Link:</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Paste FA Full-Time Table Link..." 
                    placeholderTextColor="#64748b" 
                    value={faLeagueUrl} 
                    onChangeText={setFaLeagueUrl} 
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={[styles.primaryAuthBtn, { backgroundColor: '#3b82f6', marginBottom: 15 }]} onPress={saveFaLeagueUrl}>
                    <Text style={[styles.primaryAuthBtnText, { color: '#FFFFFF' }]}>Save League URL</Text>
                  </TouchableOpacity>

                  <Text style={styles.inputLabel}>Opposition Scouting Notes:</Text>
                  <TextInput 
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                    placeholder="Enter opponent notes..." 
                    placeholderTextColor="#64748b" 
                    multiline 
                    value={scoutNotesInput || ''} 
                    onChangeText={setScoutNotesInput} 
                  />
                  <TouchableOpacity style={styles.primaryAuthBtn} onPress={saveMatchNotes} disabled={isSavingNotes}>
                    <Text style={styles.primaryAuthBtnText}>{isSavingNotes ? "Saving..." : "Publish Notes"}</Text>
                  </TouchableOpacity>

                  <View style={{ marginVertical: 12, height: 1, backgroundColor: '#2E3A44' }} />

                  <TouchableOpacity style={[styles.sidebarItem, { borderColor: '#ef4444' }]} onPress={() => { setIsSidebarOpen(false); setIsSeasonResetModalOpen(true); }}>
                    <Text style={[styles.sidebarItemText, { color: '#ef4444' }]}>🎆 Start New Season</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.sidebarItem, { borderColor: '#39FF14', marginTop: 5 }]} onPress={() => { setIsSidebarOpen(false); setIsCreateTeamModalOpen(true); }}>
                    <Text style={[styles.sidebarItemText, { color: '#39FF14' }]}>➕ Create New Team</Text>
                  </TouchableOpacity>

                  {/* DELETE TEAM STRICTLY HEAD COACH / SUPERUSER */}
                  {(isSuperUser || profile?.role === 'coach') && (
                    <TouchableOpacity style={[styles.sidebarItem, { borderColor: '#ef4444', marginTop: 5, marginBottom: 20 }]} onPress={() => { 
                      setIsSidebarOpen(false); 
                      setTimeout(() => {
                        const currentTeam = myTeams.find(t => t.id === activeTeamId);
                        setTeamToDelete(currentTeam);
                        setDeleteTeamConfirmText('');
                      }, 350); 
                    }}>
                      <Text style={[styles.sidebarItemText, { color: '#ef4444' }]}>🗑️ Delete Current Team</Text>
                    </TouchableOpacity>
                  )}

                  <View style={{ height: 30 }} />
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <StaffManagementModal
        visible={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        activeTeamObj={activeTeamObj}
        currentUserId={session?.user?.id}
        userRole={profile?.role}
        isSuperUser={isSuperUser}
        onTeamUpdated={() => fetchUserProfile(session?.user?.id)}
        shareStaffInvite={shareStaffInvite}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14' },
  splashContainer: { flex: 1, backgroundColor: '#0B0E14', justifyContent: 'center', alignItems: 'center' },
  splashCenterBox: { alignItems: 'center', justifyContent: 'center', width: '90%' },
  splashLogoImage: { width: '100%', height: 220 },
  splashLoadingText: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', letterSpacing: 2, marginTop: 15, textTransform: 'uppercase' },
  screenViewer: { flex: 1 },
  authContainer: { flex: 1, backgroundColor: '#0B0E14' },
  scrollAuthContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  authBox: { backgroundColor: '#1A1F26', width: '100%', padding: 25, borderRadius: 15, borderWidth: 1, borderColor: '#2E3A44' },
  authHeaderSub: { color: '#39FF14', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', marginBottom: 5 },
  authHeaderTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#0B0E14', color: '#ffffff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#2E3A44' },
  inputLabel: { color: '#94a3b8', fontWeight: 'bold', marginBottom: 6, fontSize: 12 },
  primaryAuthBtn: { backgroundColor: '#39FF14', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  primaryAuthBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 15 },
  switchAuthText: { color: '#94a3b8', textAlign: 'center', fontSize: 14 },
  errorText: { color: '#ef4444', fontWeight: 'bold', marginBottom: 15, lineHeight: 20 },
  successText: { color: '#22c55e', fontWeight: 'bold', marginBottom: 15, lineHeight: 20 },
  
  masterToggleBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0B0E14', paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: '#39FF14' },
  menuTriggerBtn: { padding: 5, width: 34, alignItems: 'center' },
  menuTriggerIcon: { color: '#39FF14', fontSize: 24, fontWeight: 'bold' },
  toggleCenterGroup: { flexDirection: 'row', alignItems: 'center' },
  masterToggleBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, marginHorizontal: 3 },
  masterToggleBtnActive: { backgroundColor: '#39FF14' },
  masterToggleBtnText: { color: '#64748b', fontSize: 12, fontWeight: 'bold' },
  masterToggleBtnTextActive: { color: '#0B0E14' },
  signOutBtn: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  signOutBtnText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },

  teamSelectorBar: { backgroundColor: '#1A1F26', borderBottomWidth: 1, borderBottomColor: '#2E3A44', paddingVertical: 8, paddingHorizontal: 10 },
  teamTab: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, backgroundColor: '#0B0E14', marginRight: 10, borderWidth: 1, borderColor: '#2E3A44' },
  teamTabActive: { backgroundColor: '#39FF14', borderColor: '#39FF14' },
  teamTabText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
  teamTabTextActive: { color: '#0B0E14' },

  sidebarOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', flexDirection: 'row' },
  sidebarDrawer: { width: '80%', backgroundColor: '#1A1F26', height: '100%', padding: 20, borderRightWidth: 1, borderRightColor: '#2E3A44', zIndex: 5 },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#2E3A44', paddingBottom: 10 },
  sidebarTitle: { color: '#39FF14', fontSize: 18, fontWeight: 'bold' },
  sidebarCloseTouchable: { backgroundColor: '#0B0E14', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#2E3A44' },
  sidebarCloseBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
  sidebarItem: { backgroundColor: '#0B0E14', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#2E3A44' },
  sidebarItemText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },

  wizardOptionBtn: { backgroundColor: '#1A1F26', padding: 18, borderRadius: 10, borderWidth: 1, borderColor: '#39FF14', marginBottom: 15 },
  wizardOptionTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  wizardOptionSub: { color: '#94a3b8', fontSize: 12, lineHeight: 18 },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1F26', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  headerSub: { color: '#39FF14', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  content: { padding: 15 },
  card: { backgroundColor: '#1A1F26', borderRadius: 10, padding: 15, marginBottom: 15, borderColor: '#2E3A44', borderWidth: 1 },
  roleTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  roleSubTitle: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  editProfileBtn: { backgroundColor: '#0B0E14', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#3b82f6' },
  editProfileBtnText: { color: '#3b82f6', fontSize: 11, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#2E3A44', marginVertical: 10 },
  bulletText: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, lineHeight: 20 },

  addPlayerBtn: { backgroundColor: '#39FF14', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addPlayerBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 13 },
  sectionHeaderModal: { color: '#39FF14', fontSize: 13, fontWeight: 'bold', marginTop: 10, marginBottom: 10, textTransform: 'uppercase', alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#2E3A44', paddingBottom: 4, width: '100%' },

  bottomNav: { flexDirection: 'row', backgroundColor: '#1A1F26', paddingBottom: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2E3A44' },
  navButton: { flex: 1, alignItems: 'center' },
  navIcon: { fontSize: 18, color: '#64748b' },
  navText: { fontSize: 10, color: '#64748b', fontWeight: 'bold', marginTop: 2 },
  activeNav: { color: '#39FF14' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  modalBox: { backgroundColor: '#1A1F26', width: '88%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#2E3A44', zIndex: 5 },
  modalOverlayFull: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalBoxFull: { backgroundColor: '#1A1F26', width: '92%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#2E3A44', zIndex: 5 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  positionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 6, marginBottom: 15 },
  gridBtn: { backgroundColor: '#0B0E14', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, minWidth: '22%', alignItems: 'center', borderWidth: 1, borderColor: '#2E3A44' },
  gridBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 11 },

  inviteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#2E3A44' },
  inviteName: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  inviteCodeText: { color: '#39FF14', fontSize: 12, fontWeight: 'bold', marginTop: 4 },

  footednessContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 15, marginVertical: 10, padding: 10, backgroundColor: '#0B0E14', borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44' },
  footLabel: { color: '#94a3b8', fontWeight: 'bold', fontSize: 12 },
  footDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#2E3A44', backgroundColor: '#1A1F26' },
  footDotActive: { borderColor: '#39FF14', backgroundColor: '#39FF14' },

  statCounterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#2E3A44', width: '100%' },
  statCounterLabel: { color: '#cbd5e1', fontWeight: 'bold', fontSize: 13 },
  counterBtn: { backgroundColor: '#2E3A44', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#64748b' },
  counterBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
  statValueText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14, minWidth: 40, textAlign: 'center' },

  liveActionBtn: { backgroundColor: '#0B0E14', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 10, width: '45%', alignItems: 'center', borderWidth: 1, borderColor: '#2E3A44' },
  liveActionBtnRow: { backgroundColor: '#0B0E14', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#2E3A44', width: '100%', alignItems: 'center' },
  liveActionIcon: { fontSize: 24, marginBottom: 5 },
  liveActionText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  liveActionTextRow: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  
  benchBtn: { backgroundColor: '#ca8a04', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10, marginTop: 25, width: '100%' },
  benchBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  deleteBtn: { backgroundColor: '#7f1d1d', padding: 12, borderRadius: 8, alignItems: 'center', width: '100%' },
  deleteBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94a3b8', fontSize: 14 },

  positionContainer: { 
    position: 'absolute', 
    alignItems: 'center', 
    width: 120, 
    marginLeft: -60, 
    marginTop: -15, 
    zIndex: 10 
  },
  badge: { backgroundColor: '#2E3A44', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  badgeText: { color: '#39FF14', fontSize: 10, fontWeight: 'bold' },
  playerCard: { backgroundColor: '#ffffff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 2 },
  playerName: { color: '#0B0E14', fontSize: 10, fontWeight: 'bold' },
  fmtBtn: { backgroundColor: '#0B0E14', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#2E3A44', minWidth: 50, alignItems: 'center' },
  fmtBtnActive: { backgroundColor: '#39FF14', borderColor: '#39FF14' },
  fmtBtnText: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
  fmtBtnTextActive: { color: '#0B0E14' }
});