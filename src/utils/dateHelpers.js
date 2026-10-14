/**
 * Calculates official football season string (e.g. "Season 26/27").
 * Cutoff: August 1st.
 * - Aug 2026 to Jul 2027 => Season 26/27
 * - Aug 2027 to Jul 2028 => Season 27/28
 */
export function getCurrentFootballSeason(targetDate = new Date()) {
  const date = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed: 7 is August

  let startYear;
  let endYear;

  if (month >= 7) {
    // August - December
    startYear = year;
    endYear = year + 1;
  } else {
    // January - July
    startYear = year - 1;
    endYear = year;
  }

  const startStr = String(startYear).slice(-2);
  const endStr = String(endYear).slice(-2);
  return `Season ${startStr}/${endStr}`;
}

/**
 * Formats date into UK standard: DD/MM/YYYY
 */
export function formatUkDate(targetDate = new Date()) {
  const date = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Formats date with time: DD/MM/YYYY HH:MM
 */
export function formatUkDateTime(targetDate = new Date()) {
  const date = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const dateStr = formatUkDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${mins}`;
}

/**
 * Promotes a team's age category to the next bracket upon season rollover.
 * Robust regex parser: handles "U13", "Under 13", "U13s", "U-13", etc.
 * U7 -> U8 -> ... -> U18 -> Adult
 */
export function getNextAgeGroup(currentAge = 'U13') {
  if (!currentAge) return 'U14';
  const clean = String(currentAge).trim().toUpperCase();

  if (clean.includes('ADULT')) return 'Adult';

  // Extract digits (e.g., 13 from U13, Under 13, U-13, U13s)
  const match = clean.match(/(?:U|UNDER\s*|-)?\s*(\d{1,2})/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num < 18) {
      return `U${num + 1}`;
    }
    return 'Adult';
  }

  return currentAge;
}

/**
 * Automatically advances any age bracket embedded in the team's display name
 * e.g., "Panthers U13" -> "Panthers U14"
 *       "Marlow Panthers (U13)" -> "Marlow Panthers (U14)"
 *       "Redhill Under 13s" -> "Redhill Under 14s"
 */
export function promoteTeamName(teamName, oldAge, newAge) {
  if (!teamName) return teamName;

  const oldMatch = String(oldAge || '').match(/\d+/);
  const newMatch = String(newAge || '').match(/\d+/);

  if (!oldMatch || !newMatch) return teamName;

  const oldNum = oldMatch[0];
  const newNum = newMatch[0];

  let updated = teamName;
  // 1. Replace (U13) -> (U14)
  updated = updated.replace(new RegExp(`\\(U\\s*${oldNum}\\)`, 'gi'), `(U${newNum})`);
  // 2. Replace U13 or U13s or U-13 -> U14
  updated = updated.replace(new RegExp(`\\bU[- ]?${oldNum}(s)?\\b`, 'gi'), `U${newNum}$1`);
  // 3. Replace Under 13 or Under-13 or Under 13s -> Under 14
  updated = updated.replace(new RegExp(`\\bUnder[- ]?${oldNum}(s)?\\b`, 'gi'), `Under ${newNum}$1`);

  return updated;
}