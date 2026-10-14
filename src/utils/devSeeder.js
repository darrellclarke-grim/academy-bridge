import { Alert } from 'react-native';
import { supabase } from '../supabase';
import { enqueueOfflineEvent, flushOfflineQueue, getOfflineQueue } from './offlineQueue';
import { getPosCategory } from './positionHelpers';

// Helper to generate a random integer between min and max (inclusive)
const randAttr = (min = 4, max = 9) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Dev Tool: Seeds a balanced 16-player roster into Supabase for the active team.
 */
export const seedFullTeamRoster = async ({
  activeTeamId,
  activeTeamName = 'this team',
  fetchTeamData,
  userId,
  setLoading
}) => {
  if (!activeTeamId) {
    Alert.alert("Error", "Please select or create a team first.");
    return;
  }

  Alert.alert(
    "⚡ Seed Full Roster",
    `Populate a balanced 16-player squad for ${activeTeamName}?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Generate Roster",
        onPress: async () => {
          if (setLoading) setLoading(true);
          try {
            const mockRoster = [
              { name: 'Oliver Taylor', num: 1, pos: 'GK/SGK', sec: 'None', foot: 4 },
              { name: 'Jack Davies', num: 2, pos: 'RB/RWB', sec: 'CB', foot: 5 },
              { name: 'Harry Wilson', num: 3, pos: 'LB/LWB', sec: 'LM', foot: 1 },
              { name: 'Charlie Evans', num: 4, pos: 'CB', sec: 'CDM', foot: 4 },
              { name: 'Jacob Thomas', num: 5, pos: 'CB', sec: 'RB/RWB', foot: 4 },
              { name: 'George Roberts', num: 6, pos: 'CDM', sec: 'CM', foot: 3 },
              { name: 'Ethan Johnson', num: 7, pos: 'RF/RW/RM', sec: 'CAM/CF', foot: 5 },
              { name: 'Noah Wright', num: 8, pos: 'CM', sec: 'CAM/CF', foot: 4 },
              { name: 'Leo Smith', num: 9, pos: 'ST', sec: 'CAM/CF', foot: 4 },
              { name: 'Oscar Hughes', num: 10, pos: 'CAM/CF', sec: 'LF/LW/LM', foot: 2 },
              { name: 'Archie Green', num: 11, pos: 'LF/LW/LM', sec: 'ST', foot: 1 },
              { name: 'Finley Hall', num: 12, pos: 'CB', sec: 'LB/LWB', foot: 2 },
              { name: 'Arthur Lewis', num: 14, pos: 'CM', sec: 'CDM', foot: 4 },
              { name: 'Freddie Clarke', num: 15, pos: 'RF/RW/RM', sec: 'RB/RWB', foot: 5 },
              { name: 'Albie Jackson', num: 16, pos: 'ST', sec: 'RF/RW/RM', foot: 4 },
              { name: 'Lucas Wood', num: 22, pos: 'GK/SGK', sec: 'None', foot: 4 },
            ];

            const playerRecords = mockRoster.map((p) => {
              const timeSuffix = Date.now().toString().slice(-3);
              const randSuffix = Math.floor(100 + Math.random() * 900);
              const famCode = `${p.name.substring(0, 3).toUpperCase()}-${timeSuffix}${randSuffix}`;
              const isGk = getPosCategory(p.pos) === 'GK' || p.pos === 'GK/SGK';

              return {
                team_id: activeTeamId,
                name: p.name,
                squad_number: p.num,
                position: p.pos,
                secondary_position: p.sec,
                matchday_position: 'Bench',
                is_starter: false,
                available: false,
                family_code: famCode,
                footedness: p.foot,
                apps: 0, goals: 0, assists: 0, tackles: 0, interceptions: 0, saves: 0, clean_sheets: 0, yellow_cards: 0, red_cards: 0, motm: 0, parent_motm: 0, total_minutes_played: 0,

                phys_sprint: randAttr(4, 9),
                phys_accel: randAttr(4, 9),
                phys_stamina: randAttr(4, 9),
                phys_strength: randAttr(4, 9),
                phys_agility: randAttr(4, 9),

                tech_first_touch: randAttr(4, 9),
                tech_dribbling: randAttr(4, 9),
                tech_short_pass: randAttr(4, 9),
                tech_long_pass: randAttr(4, 9),
                tech_shooting_acc: randAttr(4, 9),
                tech_shooting_pow: randAttr(4, 9),
                tech_crossing: randAttr(4, 9),
                tech_tackling: randAttr(4, 9),
                tech_intercept: randAttr(4, 9),
                tech_aerial: randAttr(4, 9),
                tech_positioning: randAttr(4, 9),

                gk_shot_stopping: isGk ? randAttr(6, 9) : randAttr(2, 4),
                gk_handling: isGk ? randAttr(6, 9) : randAttr(2, 4),
                gk_1v1: isGk ? randAttr(6, 9) : randAttr(2, 4),
                gk_aerial: isGk ? randAttr(6, 9) : randAttr(2, 4),
                gk_sweeping: isGk ? randAttr(6, 9) : randAttr(2, 4),
                gk_distribution: isGk ? randAttr(6, 9) : randAttr(2, 4),

                tact_awareness: randAttr(4, 9),
                tact_pressing: randAttr(4, 9),
                tact_instructions: randAttr(4, 9),
                tact_decision: randAttr(4, 9),
                psych_confidence: randAttr(4, 9),
                psych_aggression: randAttr(4, 9),
                psych_leadership: randAttr(4, 9),
                psych_workrate: randAttr(4, 9),
                psych_composure: randAttr(4, 9),

                notes_weaknesses: '',
                notes_communication: '',
                coach_development_notes: '',
                position_minutes: {}
              };
            });

            const { error } = await supabase.from('players').insert(playerRecords);
            if (error) throw error;

            if (fetchTeamData) await fetchTeamData(userId, activeTeamId);
            if (setLoading) setLoading(false);
            Alert.alert("Roster Populated ⚽", "16 balanced player profiles with randomized attributes generated for this team!");
          } catch (err) {
            if (setLoading) setLoading(false);
            console.error(err);
            Alert.alert("Roster Seed Error", err.message);
          }
        }
      }
    ]
  );
};

/**
 * Dev Tool: Seeds realistic season stats & 20 match history records with weekly date spacing into Supabase.
 */
export const seedSeasonStats = async ({
  activeTeamId,
  activeTeamName = 'this team',
  teamSheet = [],
  fetchTeamData,
  fetchMatchHistory,
  userId,
  setLoading
}) => {
  if (!activeTeamId || (teamSheet || []).length === 0) {
    Alert.alert("Error", "Please select a team with players first.");
    return;
  }

  Alert.alert(
    "⚡ Seed Season Data",
    `Populate full season stats and 20 match reports for ${activeTeamName}?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Populate Stats",
        onPress: async () => {
          if (setLoading) setLoading(true);
          try {
            const playerUpdates = teamSheet.map((p, idx) => {
              const category = getPosCategory(p.position);
              let apps = 22 + (idx % 4);
              let goals = 0;
              let assists = 0;
              let saves = 0;
              let cleanSheets = 0;
              let yellows = idx % 3 === 0 ? 2 : idx % 5 === 0 ? 1 : 0;
              let reds = idx === 3 ? 1 : 0;
              let motm = idx % 4 === 0 ? 3 : 1;
              let parentMotm = idx % 3 === 0 ? 4 : 1;
              let training = 20 + (idx % 5);
              let totalMins = apps * 80;

              if (category === 'GK') {
                saves = 68 + (idx * 5);
                cleanSheets = 9;
                goals = 0;
                assists = 1;
                motm = 3;
                parentMotm = 2;
              } else if (category === 'ST' || p.position === 'ST') {
                goals = 16 + (idx % 5);
                assists = 6 + (idx % 3);
                motm = 5;
                parentMotm = 6;
              } else if (['LW', 'RW', 'CAM', 'LF/LW/LM', 'RF/RW/RM', 'CAM/CF'].includes(p.position)) {
                goals = 8 + (idx % 4);
                assists = 11 + (idx % 5);
                motm = 4;
                parentMotm = 3;
              } else if (['CM', 'CDM'].includes(p.position)) {
                goals = 4 + (idx % 3);
                assists = 8 + (idx % 4);
                motm = 3;
                parentMotm = 3;
              } else {
                goals = 2;
                assists = 4;
                cleanSheets = 9;
              }

              const posMins = {};
              if (p.position && p.position !== 'None') {
                posMins[p.position] = Math.floor(totalMins * 0.85);
              }
              if (p.secondary_position && p.secondary_position !== 'None') {
                posMins[p.secondary_position] = Math.floor(totalMins * 0.15);
              }

              return supabase
                .from('players')
                .update({
                  apps,
                  goals,
                  assists,
                  saves,
                  clean_sheets: cleanSheets,
                  yellow_cards: yellows,
                  red_cards: reds,
                  motm,
                  parent_motm: parentMotm,
                  training_attended: training,
                  total_minutes_played: totalMins,
                  position_minutes: posMins
                })
                .eq('id', p.id);
            });

            const opponents = [
              'Redhill Youth', 'Guildford City', 'Woking Town', 'Farnham Utd',
              'Epsom Eagles', 'Leatherhead FC', 'Staines Town', 'Dorking Wanderers',
              'Walton Athletic', 'Camberley Town', 'Wokingham Youth', 'Godalming FC',
              'Haslemere Town', 'Reigate FC', 'Chertsey Town', 'Cobham FC',
              'Egham Town', 'Horley Town', 'Ashford Youth', 'Sutton Common'
            ];

            const matchRecords = opponents.map((opp, i) => {
              const results = ['W', 'W', 'W', 'D', 'W', 'L', 'W', 'W', 'D', 'W', 'W', 'L', 'W', 'W', 'W', 'D', 'W', 'W', 'L', 'W'];
              const res = results[i];
              let teamScore = res === 'W' ? 3 : res === 'D' ? 1 : 0;
              let oppScore = res === 'W' ? 1 : res === 'D' ? 1 : 2;

              // Generate weekly past dates (i = 0 is today, i = 1 is 7 days ago, etc.)
              const matchDate = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);

              return {
                team_id: activeTeamId,
                opponent_name: opp,
                match_type: i % 4 === 0 ? 'cup' : 'league',
                team_score: teamScore,
                opponent_score: oppScore,
                result: res,
                created_at: matchDate.toISOString(),
                ticker_events: [
                  { minute: "12'", icon: "⚽", message: `GOAL! ${teamSheet[i % teamSheet.length]?.name || 'Striker'} ⚽` },
                  { minute: "34'", icon: "🟨", message: `Yellow Card: ${opp}` },
                  { minute: "68'", icon: "⚽", message: `GOAL! ${teamSheet[(i + 1) % teamSheet.length]?.name || 'Winger'} ⚽` }
                ]
              };
            });

            await supabase.from('match_history').delete().eq('team_id', activeTeamId);
            await supabase.from('match_history').insert(matchRecords);
            await Promise.all(playerUpdates);

            if (fetchTeamData) await fetchTeamData(userId, activeTeamId);
            if (fetchMatchHistory) await fetchMatchHistory(activeTeamId);

            if (setLoading) setLoading(false);
            Alert.alert("Success ⚽", "Full season statistics and 20 dated match reports populated!");
          } catch (err) {
            if (setLoading) setLoading(false);
            console.error(err);
            Alert.alert("Error", err.message);
          }
        }
      }
    ]
  );
};

/**
 * Dev Tool: Simulates logging a live match event while offline and manually flushing it.
 */
export const testOfflineQueueFlow = async (activeTeamId) => {
  if (!activeTeamId) {
    Alert.alert("Error", "Please select an active team first.");
    return;
  }

  const mockPayload = {
    table: 'live_ticker',
    payload: {
      team_id: activeTeamId,
      minute: "45'+2",
      icon: "⚽",
      message: "GOAL! (Offline Queue Test Event) ⚽"
    }
  };

  await enqueueOfflineEvent(mockPayload);
  const queueAfterEnqueue = await getOfflineQueue();

  Alert.alert(
    "🧪 Offline Event Queued",
    `Event enqueued locally! Current offline queue count: ${queueAfterEnqueue.length}.\n\nWould you like to flush the queue to Supabase now?`,
    [
      { text: "Keep Queued", style: "cancel" },
      {
        text: "Flush Queue Now",
        onPress: async () => {
          const result = await flushOfflineQueue();
          
          setTimeout(() => {
            Alert.alert(
              "⚡ Queue Flushed",
              `Flushed: ${result.flushedCount} event(s).\nRemaining in local queue: ${result.remainingCount} event(s).`
            );
          }, 350);
        }
      }
    ]
  );
};