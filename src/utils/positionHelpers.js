export const getFootednessString = (val) => {
  switch(val) {
    case 1: return '🥾 LF';
    case 2: return '🥾 BFL';
    case 3: return '🥾 BF';
    case 4: return '🥾 BFR';
    case 5: return '🥾 RF';
    default: return '🥾 BF';
  }
};

export const getPosCategory = (pos) => {
  if (!pos) return 'FWD';
  const p = String(pos).toUpperCase();
  if (p.includes('GK') || p.includes('SGK')) return 'GK';
  if (['CB', 'LCB', 'RCB', 'LB', 'RB', 'LWB', 'RWB', 'LB/LWB', 'RB/RWB'].some(x => p.includes(x))) return 'DEF';
  if (['LCM', 'RCM', 'CM', 'CDM', 'CAM', 'LM', 'RM', 'LAM', 'RAM', 'LDM', 'RDM', 'CAM/CF', 'CF'].some(x => p.includes(x))) return 'MID';
  return 'FWD';
};

export const resolvePosForFormation = (pos, formation) => {
  if (!pos || pos === 'None') return '';
  const p = String(pos).toUpperCase();
  const fmt = String(formation);
  // Added '4-3-1' to 4-at-the-back checking
  const isFourBack = ['4-3-1', '4-2-3-1', '4-3-3 (Holding)', '4-3-3 (Attacking)', '4-3-3 (Flat)', '4-4-2 (Flat)', '4-4-2 (Diamond)', '4-1-4-1', '4-5-1', '4-3-2-1', '4-2-2-2'].includes(fmt);

  if (p.includes('RB/RWB') || p === 'RB' || p === 'RWB') {
    return isFourBack ? 'RB' : 'RWB';
  }
  if (p.includes('LB/LWB') || p === 'LB' || p === 'LWB') {
    return isFourBack ? 'LB' : 'LWB';
  }
  if (p.includes('LF/LW/LM') || p === 'LF' || p === 'LW' || p === 'LM') {
    if (fmt.includes('3-4-3') || fmt.includes('5-2-3')) return 'LF';
    if (fmt.includes('4-4-2') || fmt.includes('5-4-1')) return 'LM';
    return 'LW';
  }
  if (p.includes('RF/RW/RM') || p === 'RF' || p === 'RW' || p === 'RM') {
    if (fmt.includes('3-4-3') || fmt.includes('5-2-3')) return 'RF';
    if (fmt.includes('4-4-2') || fmt.includes('5-4-1')) return 'RM';
    return 'RW';
  }
  if (p.includes('CAM/CF') || p === 'CAM' || p === 'CF') return 'CAM';
  if (p.includes('GK/SGK') || p === 'GK' || p === 'SGK') return 'GK';
  return p;
};

export const getSisterPositions = (pos) => {
  if (!pos) return [];
  const p = String(pos).toUpperCase();
  if (['GK', 'SGK', 'GK/SGK'].some(x => p.includes(x))) return ['GK', 'SGK'];
  if (['LW', 'LM', 'LF', 'LF/LW/LM'].some(x => p.includes(x))) return ['LW', 'LM', 'LF'];
  if (['RW', 'RM', 'RF', 'RF/RW/RM'].some(x => p.includes(x))) return ['RW', 'RM', 'RF'];
  if (['CM', 'LCM', 'RCM', 'CAM', 'CDM', 'LAM', 'RAM', 'LDM', 'RDM', 'CF', 'CAM/CF'].some(x => p.includes(x))) return ['CM', 'LCM', 'RCM', 'CAM', 'CDM', 'LAM', 'RAM', 'LDM', 'RDM', 'CF'];
  if (['CB', 'LCB', 'RCB'].some(x => p.includes(x))) return ['CB', 'LCB', 'RCB'];
  if (['LB', 'LWB', 'LB/LWB'].some(x => p.includes(x))) return ['LB', 'LWB'];
  if (['RB', 'RWB', 'RB/RWB'].some(x => p.includes(x))) return ['RB', 'RWB'];
  if (['ST', 'LS', 'RS'].some(x => p.includes(x))) return ['ST', 'LS', 'RS'];
  return [];
};

export const getSubRoleOptions = (roleCode) => {
  if (!roleCode || roleCode === 'None') return [];
  const upper = String(roleCode).toUpperCase();
  if (upper.includes('/')) return upper.split('/');
  if (['GK', 'SGK'].includes(upper)) return ['GK', 'SGK'];
  if (['CAM', 'CF'].includes(upper)) return ['CAM', 'CF'];
  if (['LB', 'LWB'].includes(upper)) return ['LB', 'LWB'];
  if (['RB', 'RWB'].includes(upper)) return ['RB', 'RWB'];
  if (['LW', 'LM', 'LF'].includes(upper)) return ['LF', 'LW', 'LM'];
  if (['RW', 'RM', 'RF'].includes(upper)) return ['RF', 'RW', 'RM'];
  return [upper];
};

export const isPlayerEligibleForSlot = (playerPos, slotCode) => {
  if (!playerPos || playerPos === 'None') return false;
  const s = String(slotCode).toUpperCase();
  const tokens = String(playerPos).toUpperCase().split('/').map(t => t.trim());

  if (tokens.includes(s)) return true;
  if ((s === 'GK' || s === 'SGK') && tokens.some(t => t === 'GK' || t === 'SGK')) return true;
  if (['CB', 'LCB', 'RCB'].includes(s) && tokens.includes('CB')) return true;
  if (['LB', 'LWB'].includes(s) && tokens.some(t => t === 'LB' || t === 'LWB')) return true;
  if (['RB', 'RWB'].includes(s) && tokens.some(t => t === 'RB' || t === 'RWB')) return true;
  if (['CM', 'LCM', 'RCM'].includes(s) && tokens.some(t => t === 'CM' || t === 'CDM')) return true;
  if (['CAM', 'LAM', 'RAM'].includes(s) && tokens.some(t => t === 'CAM' || t === 'CF')) return true;
  if (['LW', 'LM', 'LF'].includes(s) && tokens.some(t => t === 'LW' || t === 'LM' || t === 'LF')) return true;
  if (['RW', 'RM', 'RF'].includes(s) && tokens.some(t => t === 'RW' || t === 'RM' || t === 'RF')) return true;
  if (['ST', 'LS', 'RS'].includes(s) && tokens.some(t => t === 'ST' || t === 'LS' || t === 'RS' || t === 'CF')) return true;

  return false;
};

export const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};