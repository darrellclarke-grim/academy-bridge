import { createClient } from '@supabase/supabase-js';

// Database connection details
const supabaseUrl = 'https://jnogngcywfgitzryooig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impub2duZ2N5d2ZnaXR6cnlvb2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MjM1NzAsImV4cCI6MjEwNTI5OTU3MH0.kf52QmdOa4hxMMf1ABIWlKMrBCC828_rZMfbMGubtec';

// This creates the engine that the rest of your app will use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// API HELPER FUNCTIONS
// ==========================================

// 1. Save Full Match to History
export async function saveMatchToHistory(matchData: {
  team_id: string;
  opponent_name: string;
  match_type: 'League' | 'Cup';
  our_score: number;
  opponent_score: number;
  ticker_events: any[];
  played_date: string;
}) {
  const { data, error } = await supabase
    .from('match_history')
    .insert([matchData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 2. Stat Delta Reconciliation Engine for Editing Historical Events
export async function reconcileMatchEvent(params: {
  matchId: string;
  eventId: string;
  eventType: 'GOAL' | 'ASSIST' | 'YELLOW' | 'RED';
  oldPlayerId?: string | null;
  newPlayerId?: string | null;
  newText: string;
}) {
  const { matchId, eventId, eventType, oldPlayerId, newPlayerId, newText } = params;

  // A. Decrement stat for old player if applicable
  if (oldPlayerId && oldPlayerId !== newPlayerId) {
    const column = eventType === 'GOAL' ? 'goals' : eventType === 'ASSIST' ? 'assists' : 'cards';
    const { data: oldPlayer } = await supabase
      .from('players')
      .select(column)
      .eq('id', oldPlayerId)
      .single();

    if (oldPlayer) {
      const currentVal = (oldPlayer as any)[column] || 0;
      await supabase
        .from('players')
        .update({ [column]: Math.max(0, currentVal - 1) })
        .eq('id', oldPlayerId);
    }
  }

  // B. Increment stat for new player if applicable
  if (newPlayerId && oldPlayerId !== newPlayerId) {
    const column = eventType === 'GOAL' ? 'goals' : eventType === 'ASSIST' ? 'assists' : 'cards';
    const { data: newPlayer } = await supabase
      .from('players')
      .select(column)
      .eq('id', newPlayerId)
      .single();

    if (newPlayer) {
      const currentVal = (newPlayer as any)[column] || 0;
      await supabase
        .from('players')
        .update({ [column]: currentVal + 1 })
        .eq('id', newPlayerId);
    }
  }

  // C. Update the event text in live_ticker / match_history
  await supabase
    .from('live_ticker')
    .update({ event_text: newText, player_id: newPlayerId })
    .eq('id', eventId);
}

// 3. Save Team FA League Table URL
export async function updateTeamFaUrl(teamId: string, faUrl: string) {
  const { error } = await supabase
    .from('teams')
    .update({ fa_league_table_url: faUrl })
    .eq('id', teamId);

  if (error) throw error;
}