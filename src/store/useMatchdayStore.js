import { create } from 'zustand';

// Default state template for each team
const getDefaultTeamState = () => ({
  matchPhase: 'PRE-MATCH',
  matchType: 'League',
  opponentName: '',
  teamScore: 0,
  opponentScore: 0,
  displaySeconds: 0,
  accumulatedSeconds: 0,
  matchStartTimestamp: null,
  liveTicker: [],
  activeLivePlayer: null,
  liveEventMode: 'none',
  pendingEvent: {},
  disqualifiedPlayerIds: [], // Red cards (permanent dismissal)
  sinBins: [], // Blue cards: [{ playerId, playerName, squadNumber, returnSeconds, durationMinutes }]
});

export const useMatchdayStore = create((set, get) => ({
  // Current active team ID
  activeTeamId: null,

  // Isolated state dictionary: { [teamId]: teamMatchState }
  teamMatches: {},

  // Active Team's Match State (Mirrored for instant top-level access)
  matchPhase: 'PRE-MATCH',
  matchType: 'League',
  opponentName: '',
  teamScore: 0,
  opponentScore: 0,
  displaySeconds: 0,
  accumulatedSeconds: 0,
  matchStartTimestamp: null,
  liveTicker: [],
  activeLivePlayer: null,
  liveEventMode: 'none',
  pendingEvent: {},
  disqualifiedPlayerIds: [],
  sinBins: [],

  // Offline Sync State
  pendingOfflineCount: 0,

  // 🔄 SWITCH ACTIVE TEAM (ISOLATES DATA BETWEEN SQUADS)
  setActiveTeamId: (teamId) => {
    if (!teamId) return;
    const state = get();
    if (state.activeTeamId === teamId) return;

    // 1. Snapshot current active team's state into the dictionary
    const currentTeamId = state.activeTeamId;
    const updatedMatches = { ...state.teamMatches };

    if (currentTeamId) {
      updatedMatches[currentTeamId] = {
        matchPhase: state.matchPhase,
        matchType: state.matchType,
        opponentName: state.opponentName,
        teamScore: state.teamScore,
        opponentScore: state.opponentScore,
        displaySeconds: state.displaySeconds,
        accumulatedSeconds: state.accumulatedSeconds,
        matchStartTimestamp: state.matchStartTimestamp,
        liveTicker: state.liveTicker,
        activeLivePlayer: state.activeLivePlayer,
        liveEventMode: state.liveEventMode,
        pendingEvent: state.pendingEvent,
        disqualifiedPlayerIds: state.disqualifiedPlayerIds || [],
        sinBins: state.sinBins || [],
      };
    }

    // 2. Retrieve or initialize the target team's state
    const targetState = updatedMatches[teamId] || getDefaultTeamState();
    updatedMatches[teamId] = targetState;

    // 3. Mount target team's state to top-level store
    set({
      activeTeamId: teamId,
      teamMatches: updatedMatches,
      matchPhase: targetState.matchPhase,
      matchType: targetState.matchType,
      opponentName: targetState.opponentName,
      teamScore: targetState.teamScore,
      opponentScore: targetState.opponentScore,
      displaySeconds: targetState.displaySeconds,
      accumulatedSeconds: targetState.accumulatedSeconds,
      matchStartTimestamp: targetState.matchStartTimestamp,
      liveTicker: targetState.liveTicker,
      activeLivePlayer: targetState.activeLivePlayer,
      liveEventMode: targetState.liveEventMode,
      pendingEvent: targetState.pendingEvent,
      disqualifiedPlayerIds: targetState.disqualifiedPlayerIds || [],
      sinBins: targetState.sinBins || [],
    });
  },

  // Helper to sync changes to both active top-level and dictionary
  _updateTeamProperty: (key, value) => {
    set((state) => {
      const activeId = state.activeTeamId;
      const resolvedValue = typeof value === 'function' ? value(state[key]) : value;
      const updatedMatches = { ...state.teamMatches };

      if (activeId) {
        updatedMatches[activeId] = {
          ...(updatedMatches[activeId] || getDefaultTeamState()),
          [key]: resolvedValue,
        };
      }

      return {
        [key]: resolvedValue,
        teamMatches: updatedMatches,
      };
    });
  },

  // Setters
  setMatchPhase: (phase) => get()._updateTeamProperty('matchPhase', phase),
  setMatchType: (type) => get()._updateTeamProperty('matchType', type),
  setOpponentName: (name) => get()._updateTeamProperty('opponentName', name),
  setTeamScore: (score) => get()._updateTeamProperty('teamScore', score),
  setOpponentScore: (score) => get()._updateTeamProperty('opponentScore', score),
  setDisplaySeconds: (seconds) => get()._updateTeamProperty('displaySeconds', seconds),
  setAccumulatedSeconds: (seconds) => get()._updateTeamProperty('accumulatedSeconds', seconds),
  setMatchStartTimestamp: (ts) => get()._updateTeamProperty('matchStartTimestamp', ts),
  setLiveTicker: (ticker) => get()._updateTeamProperty('liveTicker', ticker),
  setActiveLivePlayer: (player) => get()._updateTeamProperty('activeLivePlayer', player),
  setLiveEventMode: (mode) => get()._updateTeamProperty('liveEventMode', mode),
  setPendingEvent: (event) => get()._updateTeamProperty('pendingEvent', event),
  setPendingOfflineCount: (count) => set({ pendingOfflineCount: count }),

  // 🟥 RED CARD (PERMANENT DISMISSAL) HANDLERS
  addRedCard: (playerId) => {
    set((state) => {
      const currentList = state.disqualifiedPlayerIds || [];
      if (currentList.includes(playerId)) return state;
      const updated = [...currentList, playerId];
      get()._updateTeamProperty('disqualifiedPlayerIds', updated);
      return { disqualifiedPlayerIds: updated };
    });
  },

  // 🟦 BLUE CARD (SIN BIN) HANDLERS
  addSinBin: (sinBinObj) => {
    set((state) => {
      const currentList = state.sinBins || [];
      const updated = [...currentList.filter((s) => s.playerId !== sinBinObj.playerId), sinBinObj];
      get()._updateTeamProperty('sinBins', updated);
      return { sinBins: updated };
    });
  },

  removeSinBin: (playerId) => {
    set((state) => {
      const currentList = state.sinBins || [];
      const updated = currentList.filter((s) => s.playerId !== playerId);
      get()._updateTeamProperty('sinBins', updated);
      return { sinBins: updated };
    });
  },

  // 🔄 RESET MATCH (SCOPED STRICTLY TO THE ACTIVE TEAM)
  resetMatchState: () => {
    const state = get();
    const activeId = state.activeTeamId;
    const freshState = getDefaultTeamState();

    set((s) => {
      const updatedMatches = { ...s.teamMatches };
      if (activeId) {
        updatedMatches[activeId] = freshState;
      }
      return {
        ...freshState,
        teamMatches: updatedMatches,
      };
    });
  },
}));