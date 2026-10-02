import { create } from 'zustand';

export const useMatchdayStore = create((set, get) => ({
  // Match Clock & Phase
  matchPhase: 'PRE-MATCH',
  matchType: 'League',
  opponentName: '',
  teamScore: 0,
  opponentScore: 0,
  displaySeconds: 0,
  accumulatedSeconds: 0,
  matchStartTimestamp: null,

  // Live Ticker & Events
  liveTicker: [],
  activeLivePlayer: null,
  liveEventMode: 'none',
  pendingEvent: {},

  // Offline Sync State
  pendingOfflineCount: 0,

  // Setters
  setMatchPhase: (phase) => set({ matchPhase: phase }),
  setMatchType: (type) => set({ matchType: type }),
  setOpponentName: (name) => set({ opponentName: name }),
  setTeamScore: (score) => set((state) => ({ teamScore: typeof score === 'function' ? score(state.teamScore) : score })),
  setOpponentScore: (score) => set((state) => ({ opponentScore: typeof score === 'function' ? score(state.opponentScore) : score })),
  setDisplaySeconds: (seconds) => set({ displaySeconds: seconds }),
  setAccumulatedSeconds: (seconds) => set({ accumulatedSeconds: seconds }),
  setMatchStartTimestamp: (ts) => set({ matchStartTimestamp: ts }),
  setLiveTicker: (ticker) => set((state) => ({ liveTicker: typeof ticker === 'function' ? ticker(state.liveTicker) : ticker })),
  setActiveLivePlayer: (player) => set({ activeLivePlayer: player }),
  setLiveEventMode: (mode) => set({ liveEventMode: mode }),
  setPendingEvent: (event) => set((state) => ({ pendingEvent: typeof event === 'function' ? event(state.pendingEvent) : event })),
  setPendingOfflineCount: (count) => set({ pendingOfflineCount: count }),

  // Reset Match State
  resetMatchState: () => set({
    matchPhase: 'PRE-MATCH',
    displaySeconds: 0,
    accumulatedSeconds: 0,
    matchStartTimestamp: null,
    teamScore: 0,
    opponentScore: 0,
    opponentName: '',
    liveTicker: [],
    liveEventMode: 'none',
    pendingEvent: {},
    pendingOfflineCount: 0
  })
}));