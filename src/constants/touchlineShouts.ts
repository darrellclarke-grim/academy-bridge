export interface TouchlineShout {
  id: string;
  category: 'POSITION' | 'GAME_STATE';
  roleTag: string; // e.g. "GK", "DEF", "MID", "ATT", "ALL"
  title: string;
  cue: string;
}

export const TOUCHLINE_SHOUTS: TouchlineShout[] = [
  // Defensive Unit
  { id: 'cb-1', category: 'POSITION', roleTag: 'CB', title: 'No Bounce', cue: "Don't let it bounce! Attack it!" },
  { id: 'cb-2', category: 'POSITION', roleTag: 'CB', title: 'Drop & Protect', cue: 'Drop off together, protect the space behind!' },
  { id: 'cb-3', category: 'POSITION', roleTag: 'CB', title: 'Step Up', cue: 'Step up and squeeze the line!' },
  { id: 'fb-1', category: 'POSITION', roleTag: 'RB/LB', title: 'Overlap', cue: 'Overlap the winger, give an option!' },
  { id: 'fb-2', category: 'POSITION', roleTag: 'RB/LB', title: 'Show Wide', cue: "Show them down the line, don't let them turn inside!" },
  { id: 'fb-3', category: 'POSITION', roleTag: 'RB/LB', title: 'Tuck In', cue: 'Tuck in tight on the weak side!' },

  // Midfield
  { id: 'mid-1', category: 'POSITION', roleTag: 'CM', title: 'Scan Early', cue: 'Scan your shoulder before receiving!' },
  { id: 'mid-2', category: 'POSITION', roleTag: 'CM', title: 'Lock 2nd Ball', cue: 'Lock down the second ball!' },
  { id: 'mid-3', category: 'POSITION', roleTag: 'CM', title: 'Switch Play', cue: 'Switch it to the far side, plenty of room!' },
  { id: 'mid-4', category: 'POSITION', roleTag: 'CM', title: 'Press Tight', cue: "Apply pressure, don't let them turn!" },

  // Attacking Unit
  { id: 'w-1', category: 'POSITION', roleTag: 'WINGER', title: 'Hold Width', cue: 'Hold your width, pull their full-back out!' },
  { id: 'w-2', category: 'POSITION', roleTag: 'WINGER', title: 'Back Post', cue: 'Attack the back post on the cross!' },
  { id: 'st-1', category: 'POSITION', roleTag: 'ST', title: 'Off Shoulder', cue: "Play off the defender's shoulder!" },
  { id: 'st-2', category: 'POSITION', roleTag: 'ST', title: 'Hold Up', cue: 'Hold it up and bring the midfielders in!' },
  { id: 'st-3', category: 'POSITION', roleTag: 'ST', title: 'Near Post', cue: 'First to the near post!' },

  // Whole Team Game-State
  { id: 'team-1', category: 'GAME_STATE', roleTag: 'TEAM', title: 'Help Defend', cue: 'Everyone get back behind the ball!' },
  { id: 'team-2', category: 'GAME_STATE', roleTag: 'TEAM', title: 'Win 50/50s', cue: 'Be strong in the challenge, win the 50/50s!' },
  { id: 'team-3', category: 'GAME_STATE', roleTag: 'TEAM', title: '5-Sec Press', cue: 'Counter-press! 5-second reaction!' },
  { id: 'team-4', category: 'GAME_STATE', roleTag: 'TEAM', title: 'Manage Game', cue: 'Keep possession, slow the tempo down!' },
];