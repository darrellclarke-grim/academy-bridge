export const profilePositions = [
  'GK/SGK', 'CB', 'LB/LWB', 'RB/RWB', 'CDM', 'CM', 'CAM/CF', 'LF/LW/LM', 'RF/RW/RM', 'ST'
];

export const profileSecondaryPositions = [
  ...profilePositions.filter(p => !p.includes('GK')), 'None'
];

export const ageGroupOptions = ['U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'Adult'];