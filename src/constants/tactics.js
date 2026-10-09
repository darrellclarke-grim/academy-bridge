// ==========================================
// FORMATION CATEGORIES (FOR MODAL SELECTION)
// ==========================================

export const formationCategories = [
  {
    title: '4-at-the-Back',
    formations: ['4-2-3-1', '4-3-3 (Holding)', '4-3-3 (Attacking)', '4-3-3 (Flat)', '4-4-2 (Flat)', '4-4-2 (Diamond)', '4-1-4-1', '4-5-1', '4-3-2-1', '4-2-2-2']
  },
  {
    title: '3-at-the-Back',
    formations: ['3-4-3 (Flat)', '3-4-2-1', '3-5-2 (Flat)', '3-1-4-2', '3-2-4-1']
  },
  {
    title: '5-at-the-Back',
    formations: ['5-3-2', '5-4-1', '5-2-3']
  }
];

export const formationCategories9v9 = [
  {
    title: '9v9 Standard Systems',
    formations: ['3-3-2', '3-2-3', '3-1-3-1', '4-3-1', '3-4-1', '2-3-3']
  }
];

// ==========================================
// 11v11 FORMATION LAYOUTS
// ==========================================

export const formationLayouts11v11 = {
  '4-2-3-1': [
    { code: 'ST', label: 'ST', top: '8%', left: '50%' },
    { code: 'LW', label: 'LW', top: '22%', left: '20%' },
    { code: 'CAM', label: 'CAM', top: '22%', left: '50%' },
    { code: 'RW', label: 'RW', top: '22%', left: '80%' },
    { code: 'LCM', label: 'LCM', top: '42%', left: '35%' },
    { code: 'RCM', label: 'RCM', top: '42%', left: '65%' },
    { code: 'LB', label: 'LB', top: '65%', left: '15%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '35%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '65%' },
    { code: 'RB', label: 'RB', top: '65%', left: '85%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '4-3-3 (Holding)': [
    { code: 'ST', label: 'ST', top: '8%', left: '50%' },
    { code: 'LW', label: 'LW', top: '22%', left: '20%' },
    { code: 'RW', label: 'RW', top: '22%', left: '80%' },
    { code: 'LCM', label: 'LCM', top: '38%', left: '35%' },
    { code: 'RCM', label: 'RCM', top: '38%', left: '65%' },
    { code: 'CDM', label: 'CDM', top: '52%', left: '50%' },
    { code: 'LB', label: 'LB', top: '65%', left: '15%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '35%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '65%' },
    { code: 'RB', label: 'RB', top: '65%', left: '85%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '4-3-3 (Attacking)': [
    { code: 'ST', label: 'ST', top: '8%', left: '50%' },
    { code: 'LW', label: 'LW', top: '22%', left: '20%' },
    { code: 'RW', label: 'RW', top: '22%', left: '80%' },
    { code: 'CAM', label: 'CAM', top: '30%', left: '50%' },
    { code: 'LCM', label: 'LCM', top: '45%', left: '35%' },
    { code: 'RCM', label: 'RCM', top: '45%', left: '65%' },
    { code: 'LB', label: 'LB', top: '65%', left: '15%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '35%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '65%' },
    { code: 'RB', label: 'RB', top: '65%', left: '85%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '4-3-3 (Flat)': [
    { code: 'ST', label: 'ST', top: '8%', left: '50%' },
    { code: 'LW', label: 'LW', top: '22%', left: '20%' },
    { code: 'RW', label: 'RW', top: '22%', left: '80%' },
    { code: 'LCM', label: 'LCM', top: '42%', left: '25%' },
    { code: 'CM', label: 'CM', top: '42%', left: '50%' },
    { code: 'RCM', label: 'RCM', top: '42%', left: '75%' },
    { code: 'LB', label: 'LB', top: '65%', left: '15%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '35%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '65%' },
    { code: 'RB', label: 'RB', top: '65%', left: '85%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '4-4-2 (Flat)': [
    { code: 'LS', label: 'LS', top: '12%', left: '35%' },
    { code: 'RS', label: 'RS', top: '12%', left: '65%' },
    { code: 'LM', label: 'LM', top: '38%', left: '15%' },
    { code: 'LCM', label: 'LCM', top: '42%', left: '38%' },
    { code: 'RCM', label: 'RCM', top: '42%', left: '62%' },
    { code: 'RM', label: 'RM', top: '38%', left: '85%' },
    { code: 'LB', label: 'LB', top: '65%', left: '15%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '35%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '65%' },
    { code: 'RB', label: 'RB', top: '65%', left: '85%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '4-4-2 (Diamond)': [
    { code: 'LS', label: 'LS', top: '12%', left: '35%' },
    { code: 'RS', label: 'RS', top: '12%', left: '65%' },
    { code: 'CAM', label: 'CAM', top: '28%', left: '50%' },
    { code: 'LCM', label: 'LCM', top: '42%', left: '30%' },
    { code: 'RCM', label: 'RCM', top: '42%', left: '70%' },
    { code: 'CDM', label: 'CDM', top: '55%', left: '50%' },
    { code: 'LB', label: 'LB', top: '65%', left: '15%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '35%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '65%' },
    { code: 'RB', label: 'RB', top: '65%', left: '85%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '4-1-4-1': [
    { code: 'ST', label: 'ST', top: '8%', left: '50%' },
    { code: 'LM', label: 'LM', top: '35%', left: '15%' },
    { code: 'LCM', label: 'LCM', top: '35%', left: '35%' },
    { code: 'RCM', label: 'RCM', top: '35%', left: '65%' },
    { code: 'RM', label: 'RM', top: '35%', left: '85%' },
    { code: 'CDM', label: 'CDM', top: '52%', left: '50%' },
    { code: 'LB', label: 'LB', top: '65%', left: '15%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '35%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '65%' },
    { code: 'RB', label: 'RB', top: '65%', left: '85%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '4-5-1': [
    { code: 'ST', label: 'ST', top: '10%', left: '50%' },
    { code: 'LM', label: 'LM', top: '45%', left: '15%' },
    { code: 'LCM', label: 'LCM', top: '45%', left: '35%' },
    { code: 'CM', label: 'CM', top: '45%', left: '50%' },
    { code: 'RCM', label: 'RCM', top: '45%', left: '65%' },
    { code: 'RM', label: 'RM', top: '45%', left: '85%' },
    { code: 'LB', label: 'LB', top: '65%', left: '15%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '35%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '65%' },
    { code: 'RB', label: 'RB', top: '65%', left: '85%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '4-3-2-1': [
    { code: 'ST', label: 'ST', top: '8%', left: '50%' },
    { code: 'LAM', label: 'LAM', top: '25%', left: '35%' },
    { code: 'RAM', label: 'RAM', top: '25%', left: '65%' },
    { code: 'LCM', label: 'LCM', top: '45%', left: '25%' },
    { code: 'CM', label: 'CM', top: '45%', left: '50%' },
    { code: 'RCM', label: 'RCM', top: '45%', left: '75%' },
    { code: 'LB', label: 'LB', top: '65%', left: '15%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '35%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '65%' },
    { code: 'RB', label: 'RB', top: '65%', left: '85%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '4-2-2-2': [
    { code: 'LS', label: 'LS', top: '12%', left: '35%' },
    { code: 'RS', label: 'RS', top: '12%', left: '65%' },
    { code: 'LAM', label: 'LAM', top: '30%', left: '25%' },
    { code: 'RAM', label: 'RAM', top: '30%', left: '75%' },
    { code: 'LDM', label: 'LDM', top: '50%', left: '35%' },
    { code: 'RDM', label: 'RDM', top: '50%', left: '65%' },
    { code: 'LB', label: 'LB', top: '65%', left: '15%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '35%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '65%' },
    { code: 'RB', label: 'RB', top: '65%', left: '85%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '3-4-3 (Flat)': [
    { code: 'ST', label: 'ST', top: '10%', left: '50%' },
    { code: 'LF', label: 'LF', top: '20%', left: '25%' },
    { code: 'RF', label: 'RF', top: '20%', left: '75%' },
    { code: 'LCM', label: 'LCM', top: '40%', left: '35%' },
    { code: 'RCM', label: 'RCM', top: '40%', left: '65%' },
    { code: 'LWB', label: 'LWB', top: '50%', left: '12%' },
    { code: 'RWB', label: 'RWB', top: '50%', left: '88%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '25%' },
    { code: 'CB', label: 'CB', top: '72%', left: '50%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '75%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '3-4-2-1': [
    { code: 'ST', label: 'ST', top: '10%', left: '50%' },
    { code: 'LAM', label: 'LAM', top: '25%', left: '35%' },
    { code: 'RAM', label: 'RAM', top: '25%', left: '65%' },
    { code: 'LWB', label: 'LWB', top: '45%', left: '12%' },
    { code: 'LCM', label: 'LCM', top: '45%', left: '35%' },
    { code: 'RCM', label: 'RCM', top: '45%', left: '65%' },
    { code: 'RWB', label: 'RWB', top: '45%', left: '88%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '25%' },
    { code: 'CB', label: 'CB', top: '72%', left: '50%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '75%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '3-5-2 (Flat)': [
    { code: 'LS', label: 'LS', top: '10%', left: '35%' },
    { code: 'RS', label: 'RS', top: '10%', left: '65%' },
    { code: 'CAM', label: 'CAM', top: '25%', left: '50%' },
    { code: 'LCM', label: 'LCM', top: '40%', left: '32%' },
    { code: 'RCM', label: 'RCM', top: '40%', left: '68%' },
    { code: 'LWB', label: 'LWB', top: '50%', left: '12%' },
    { code: 'RWB', label: 'RWB', top: '50%', left: '88%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '25%' },
    { code: 'CB', label: 'CB', top: '72%', left: '50%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '75%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '3-1-4-2': [
    { code: 'LS', label: 'LS', top: '10%', left: '35%' },
    { code: 'RS', label: 'RS', top: '10%', left: '65%' },
    { code: 'LWB', label: 'LWB', top: '38%', left: '12%' },
    { code: 'LCM', label: 'LCM', top: '38%', left: '35%' },
    { code: 'RCM', label: 'RCM', top: '38%', left: '65%' },
    { code: 'RWB', label: 'RWB', top: '38%', left: '88%' },
    { code: 'CDM', label: 'CDM', top: '52%', left: '50%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '25%' },
    { code: 'CB', label: 'CB', top: '72%', left: '50%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '75%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '3-2-4-1': [
    { code: 'ST', label: 'ST', top: '10%', left: '50%' },
    { code: 'LW', label: 'LW', top: '25%', left: '15%' },
    { code: 'LAM', label: 'LAM', top: '25%', left: '35%' },
    { code: 'RAM', label: 'RAM', top: '25%', left: '65%' },
    { code: 'RW', label: 'RW', top: '25%', left: '85%' },
    { code: 'LDM', label: 'LDM', top: '45%', left: '35%' },
    { code: 'RDM', label: 'RDM', top: '45%', left: '65%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '25%' },
    { code: 'CB', label: 'CB', top: '72%', left: '50%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '75%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '5-3-2': [
    { code: 'LS', label: 'LS', top: '12%', left: '35%' },
    { code: 'RS', label: 'RS', top: '12%', left: '65%' },
    { code: 'LCM', label: 'LCM', top: '45%', left: '25%' },
    { code: 'CM', label: 'CM', top: '45%', left: '50%' },
    { code: 'RCM', label: 'RCM', top: '45%', left: '75%' },
    { code: 'LWB', label: 'LWB', top: '65%', left: '12%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '28%' },
    { code: 'CB', label: 'CB', top: '72%', left: '50%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '72%' },
    { code: 'RWB', label: 'RWB', top: '65%', left: '88%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '5-4-1': [
    { code: 'ST', label: 'ST', top: '12%', left: '50%' },
    { code: 'LM', label: 'LM', top: '45%', left: '15%' },
    { code: 'LCM', label: 'LCM', top: '45%', left: '35%' },
    { code: 'RCM', label: 'RCM', top: '45%', left: '65%' },
    { code: 'RM', label: 'RM', top: '45%', left: '85%' },
    { code: 'LWB', label: 'LWB', top: '65%', left: '12%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '28%' },
    { code: 'CB', label: 'CB', top: '72%', left: '50%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '72%' },
    { code: 'RWB', label: 'RWB', top: '65%', left: '88%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '5-2-3': [
    { code: 'LF', label: 'LF', top: '15%', left: '25%' },
    { code: 'ST', label: 'ST', top: '12%', left: '50%' },
    { code: 'RF', label: 'RF', top: '15%', left: '75%' },
    { code: 'LCM', label: 'LCM', top: '45%', left: '35%' },
    { code: 'RCM', label: 'RCM', top: '45%', left: '65%' },
    { code: 'LWB', label: 'LWB', top: '65%', left: '12%' },
    { code: 'LCB', label: 'LCB', top: '70%', left: '28%' },
    { code: 'CB', label: 'CB', top: '72%', left: '50%' },
    { code: 'RCB', label: 'RCB', top: '70%', left: '72%' },
    { code: 'RWB', label: 'RWB', top: '65%', left: '88%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ]
};

// ==========================================
// 9v9 FORMATION LAYOUTS
// ==========================================

export const formationLayouts9v9 = {
  '3-3-2': [
    { code: 'LS', label: 'ST', top: '18%', left: '35%' },
    { code: 'RS', label: 'ST', top: '18%', left: '65%' },
    { code: 'LM', label: 'LM', top: '46%', left: '20%' },
    { code: 'CM', label: 'CM', top: '46%', left: '50%' },
    { code: 'RM', label: 'RM', top: '46%', left: '80%' },
    { code: 'LB', label: 'LB', top: '70%', left: '20%' },
    { code: 'CB', label: 'CB', top: '72%', left: '50%' },
    { code: 'RB', label: 'RB', top: '70%', left: '80%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '3-2-3': [
    { code: 'LW', label: 'LW', top: '22%', left: '18%' },
    { code: 'ST', label: 'ST', top: '18%', left: '50%' },
    { code: 'RW', label: 'RW', top: '22%', left: '82%' },
    { code: 'LCM', label: 'DM', top: '50%', left: '35%' },
    { code: 'RCM', label: 'DM', top: '50%', left: '65%' },
    { code: 'LB', label: 'LB', top: '70%', left: '20%' },
    { code: 'CB', label: 'CB', top: '72%', left: '50%' },
    { code: 'RB', label: 'RB', top: '70%', left: '80%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '3-1-3-1': [
    { code: 'ST', label: 'ST', top: '18%', left: '50%' },
    { code: 'LM', label: 'LM', top: '36%', left: '20%' },
    { code: 'CAM', label: 'AM', top: '36%', left: '50%' },
    { code: 'RM', label: 'RM', top: '36%', left: '80%' },
    { code: 'CDM', label: 'DM', top: '54%', left: '50%' },
    { code: 'LB', label: 'LB', top: '72%', left: '22%' },
    { code: 'CB', label: 'CB', top: '72%', left: '50%' },
    { code: 'RB', label: 'RB', top: '72%', left: '78%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '4-3-1': [
    { code: 'ST', label: 'ST', top: '18%', left: '50%' },
    { code: 'LM', label: 'LM', top: '46%', left: '22%' },
    { code: 'CM', label: 'CM', top: '46%', left: '50%' },
    { code: 'RM', label: 'RM', top: '46%', left: '78%' },
    { code: 'LB', label: 'LB', top: '70%', left: '15%' },
    { code: 'LCB', label: 'CB', top: '72%', left: '38%' },
    { code: 'RCB', label: 'CB', top: '72%', left: '62%' },
    { code: 'RB', label: 'RB', top: '70%', left: '85%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '3-4-1': [
    { code: 'ST', label: 'ST', top: '18%', left: '50%' },
    { code: 'LWB', label: 'LM', top: '46%', left: '15%' },
    { code: 'LCM', label: 'CM', top: '46%', left: '38%' },
    { code: 'RCM', label: 'CM', top: '46%', left: '62%' },
    { code: 'RWB', label: 'RM', top: '46%', left: '85%' },
    { code: 'LCB', label: 'CB', top: '72%', left: '25%' },
    { code: 'CB', label: 'CB', top: '72%', left: '50%' },
    { code: 'RCB', label: 'CB', top: '72%', left: '75%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ],
  '2-3-3': [
    { code: 'LW', label: 'LW', top: '20%', left: '20%' },
    { code: 'ST', label: 'ST', top: '18%', left: '50%' },
    { code: 'RW', label: 'RW', top: '20%', left: '80%' },
    { code: 'LM', label: 'LM', top: '48%', left: '20%' },
    { code: 'CM', label: 'CM', top: '48%', left: '50%' },
    { code: 'RM', label: 'RM', top: '48%', left: '80%' },
    { code: 'LCB', label: 'CB', top: '72%', left: '35%' },
    { code: 'RCB', label: 'CB', top: '72%', left: '65%' },
    { code: 'GK', label: 'GK', top: '88%', left: '50%' }
  ]
};

// Unified export so looking up any layout key continues to work
export const formationLayouts = {
  ...formationLayouts11v11,
  ...formationLayouts9v9
};

// ==========================================
// GAME STATE TACTICS
// ==========================================

export const gameStateTactics = {
  leading: { title: 'PROTECT & CONTROL (Leading)', instructions: '• Controlled possession: Make the opponent chase.\n• Manage match tempo and select forward moments intelligently.', shout: '"Value the ball! Keep our central protection locked!"' },
  level: { title: 'BALANCED PATIENCE (Level)', instructions: '• Maintain structural balance between lines.\n• Recognize when to accelerate attack vs reset play.', shout: '"See early, decide early! Keep trusting the connections!"' },
  losing: { title: 'CONTROLLED URGENCY (Losing)', instructions: '• Increase urgency in movement and vertical passing.\n• Higher collective pressing when triggers occur.', shout: '"Brave on the ball! First look forward!"' }
};