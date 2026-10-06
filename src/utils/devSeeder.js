import { Alert } from 'react-native';
import { supabase } from '../supabase';
import { getPosCategory } from './positionHelpers';

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

            const playerRecords = mockRoster.map(p => {
              const famCode = `${p.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
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
                phys_sprint: 6, phys_accel: 6, phys_stamina: 6, phys_strength: 6, phys_agility: 6,
                tech_first_touch: 6, tech_dribbling: 6, tech_short_pass: 6, tech_long_pass: 6, tech_shooting_acc: 6, tech_shooting_pow: 6, tech_crossing: 6, tech_tackling: 6, tech_intercept: 6, tech_aerial: 6, tech_positioning: 6,
                gk_shot_stopping: 6, gk_handling: 6, gk_1v1: 6, gk_aerial: 6, gk_sweeping: 6, gk_distribution: 6,
                tact_awareness: 6, tact_pressing: 6, tact_instructions: 6, tact_decision: 6,
                psych_confidence: 6, psych_aggression: 6, psych_leadership: 6, psych_workrate: 6, psych_composure: 6,
                notes_weaknesses: '', notes_communication: '', coach_development_notes: '',
                position_minutes: {}
              };
            });

            const { error } = await supabase.from('players').insert(playerRecords);
            if (error) throw error;

            if (fetchTeamData) await fetchTeamData(userId, activeTeamId);
            if (setLoading) setLoading(false);
            Alert.alert("Roster Populated ⚽", "16 balanced player profiles generated for this team!");
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
 * Dev Tool: Seeds realistic season stats & 20 match history records into Supabase.
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
            // 1. Update Player Stats
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

            // 2. Generate 20 Match Records
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

              return {
                team_id: activeTeamId,
                opponent_name: opp,
                match_type: i % 4 === 0 ? 'cup' : 'league',
                team_score: teamScore,
                opponent_score: oppScore,
                result: res,
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
            Alert.alert("Success ⚽", "Full season statistics and 20 match reports populated!");
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