import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { formatUkDate, getCurrentFootballSeason } from './dateHelpers';

const fetchBase64Image = async (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
};

// ==========================================
// 1. EXECUTIVE SEASON PDF REPORT
// ==========================================

export const generateSeasonPdfReport = async ({
  teamName = 'Tactical Engine Squad',
  ageGroup = 'Youth',
  clubLogoUrl = null,
  teamSheet = [],
  matchHistory = [],
  scoutNotes = '',
}) => {
  try {
    const DEFAULT_HEADER_LOGO_URL = 'https://jnogngcywfgitzryooig.supabase.co/storage/v1/object/public/app-assets/Tactical%20Engine%20Logo.png';
    const FOOTER_CREDIT_LOGO_URL = 'https://jnogngcywfgitzryooig.supabase.co/storage/v1/object/public/app-assets/In%20app%20Footer%20credit%20Logo.png';

    const fallbackHeaderSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="120" height="36">
        <rect width="200" height="60" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
        <path d="M25 15 L40 15 L45 30 L40 45 L25 45 L20 30 Z" fill="none" stroke="#15803D" stroke-width="2.5"/>
        <circle cx="32.5" cy="30" r="4" fill="#15803D"/>
        <text x="56" y="28" fill="#0F172A" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="bold" letter-spacing="1">TACTICAL</text>
        <text x="56" y="44" fill="#15803D" font-family="Helvetica, Arial, sans-serif" font-size="12" font-weight="bold" letter-spacing="2">ENGINE</text>
      </svg>
    `;

    const fallbackFooterSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 40" width="220" height="30">
        <rect width="300" height="40" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
        <circle cx="20" cy="20" r="6" fill="none" stroke="#15803D" stroke-width="2"/>
        <circle cx="20" cy="20" r="2" fill="#15803D"/>
        <text x="36" y="24" fill="#475569" font-family="Helvetica, Arial, sans-serif" font-size="10" font-weight="bold" letter-spacing="1">POWERED BY <tspan fill="#15803D">TACTICAL ENGINE</tspan></text>
      </svg>
    `;

    let headerLogoBase64 = null;
    if (clubLogoUrl && typeof clubLogoUrl === 'string' && clubLogoUrl.trim().startsWith('http')) {
      headerLogoBase64 = await fetchBase64Image(clubLogoUrl.trim());
    }
    if (!headerLogoBase64) {
      headerLogoBase64 = await fetchBase64Image(DEFAULT_HEADER_LOGO_URL);
    }

    const footerLogoBase64 = await fetchBase64Image(FOOTER_CREDIT_LOGO_URL);

    const headerLogoHtml = headerLogoBase64
      ? `<img src="${headerLogoBase64}" class="header-logo" alt="Club Crest" />`
      : fallbackHeaderSvg;

    const footerLogoHtml = footerLogoBase64
      ? `<img src="${footerLogoBase64}" class="footer-logo" alt="Powered by Tactical Engine" />`
      : fallbackFooterSvg;

    // Dynamic Season Label and UK Date
    const currentSeason = getCurrentFootballSeason();
    const generatedDate = formatUkDate();

    // Team Record Analytics
    const totalMatches = matchHistory.length;
    const wins = matchHistory.filter(m => m.result === 'W').length;
    const draws = matchHistory.filter(m => m.result === 'D').length;
    const losses = matchHistory.filter(m => m.result === 'L').length;
    const goalsFor = matchHistory.reduce((sum, m) => sum + (m.team_score || 0), 0);
    const goalsAgainst = matchHistory.reduce((sum, m) => sum + (m.opponent_score || 0), 0);
    const goalDiff = goalsFor - goalsAgainst;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    const isAdult = String(ageGroup || '').toLowerCase().includes('adult');
    const coachAwardTitle = "CPOTS";
    const parentAwardTitle = isAdult ? "FPOTS" : "PPOTS";

    // Leaderboards
    const sortedByGoals = [...teamSheet].sort((a, b) => (b.goals || 0) - (a.goals || 0));
    const sortedByAssists = [...teamSheet].sort((a, b) => (b.assists || 0) - (a.assists || 0));
    const sortedByCoachPotm = [...teamSheet].sort((a, b) => (b.motm || 0) - (a.motm || 0));
    const sortedByParentPotm = [...teamSheet].sort((a, b) => (b.parent_motm || 0) - (a.parent_motm || 0));

    const topScorer = sortedByGoals[0]?.goals > 0 
      ? `${sortedByGoals[0].name} (${sortedByGoals[0].goals} Goals)` 
      : 'N/A';
    
    const topAssister = sortedByAssists[0]?.assists > 0 
      ? `${sortedByAssists[0].name} (${sortedByAssists[0].assists} Assists)` 
      : 'N/A';

    const topCoachPotm = sortedByCoachPotm[0] && (sortedByCoachPotm[0].motm || 0) > 0
      ? `${sortedByCoachPotm[0].name} (${sortedByCoachPotm[0].motm} Awards)`
      : 'N/A';

    const topParentPotm = sortedByParentPotm[0] && (sortedByParentPotm[0].parent_motm || 0) > 0
      ? `${sortedByParentPotm[0].name} (${sortedByParentPotm[0].parent_motm} Awards)`
      : 'N/A';

    const playerRowsHtml = (teamSheet || []).map((p, idx) => {
      const totalMins = p.total_minutes_played || 0;
      const avgMins = p.apps > 0 ? Math.round(totalMins / p.apps) : 0;
      const totalPotm = (p.motm || 0) + (p.parent_motm || 0);

      return `
        <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
          <td class="stat-green" style="padding: 5px 6px; font-weight: bold; text-align: center;">#${p.squad_number || '-'}</td>
          <td class="text-primary" style="padding: 5px 6px; font-weight: bold;">${p.name || 'Player'}</td>
          <td class="pos-text" style="padding: 5px 6px; text-align: center;">${p.position || 'N/A'}</td>
          <td class="text-primary" style="padding: 5px 6px; text-align: center;">${p.apps || 0}</td>
          <td class="text-sub" style="padding: 5px 6px; text-align: center;">${totalMins}m (${avgMins}m/g)</td>
          <td class="stat-green" style="padding: 5px 6px; text-align: center; font-weight: bold;">${p.goals || 0}</td>
          <td class="text-primary" style="padding: 5px 6px; text-align: center;">${p.assists || 0}</td>
          <td class="text-primary" style="padding: 5px 6px; text-align: center;">${totalPotm}</td>
        </tr>
      `;
    }).join('');

    const matchRowsHtml = (matchHistory || []).map((m, idx) => `
      <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
        <td class="text-sub" style="padding: 6px 8px;">${m.created_at ? formatUkDate(new Date(m.created_at)) : 'Season Match'}</td>
        <td class="text-primary" style="padding: 6px 8px; font-weight: bold;">vs ${m.opponent_name || m.opponent || 'Opponent'}</td>
        <td class="stat-green" style="padding: 6px 8px; font-weight: bold; text-align: center;">${m.team_score ?? 0} - ${m.opponent_score ?? 0}</td>
        <td class="text-primary" style="padding: 6px 8px; text-align: center;">${m.result || 'D'} (${m.match_type || 'Match'})</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Executive Season Report</title>
          <style>
            * { box-sizing: border-box; }
            body { background-color: #FFFFFF; color: #0F172A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 18px 22px; }
            .header-table { width: 100%; border-bottom: 3px solid #15803D; padding-bottom: 8px; margin-bottom: 12px; }
            .team-title { font-size: 22px; font-weight: 800; color: #0F172A; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
            .team-sub { font-size: 10.5px; color: #15803D; font-weight: bold; text-transform: uppercase; margin-top: 3px; }
            .card { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 12px; margin-bottom: 11px; }
            .page-break { page-break-before: always !important; break-before: page !important; }
            .card-title { color: #15803D; font-size: 11.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
            .honours-grid { display: table; width: 100%; margin-bottom: 2px; }
            .honours-col { display: table-cell; width: 25%; vertical-align: top; padding-right: 6px; }
            .honour-label { font-size: 8.5px; font-weight: bold; color: #64748B; text-transform: uppercase; }
            .honour-value { font-size: 10.5px; font-weight: bold; color: #0F172A; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
            th { background-color: #E2E8F0; color: #0F172A; text-align: left; padding: 6px 8px; font-weight: bold; text-transform: uppercase; }
            .row-even { background-color: #FFFFFF; border-bottom: 1px solid #E2E8F0; }
            .row-odd { background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
            .text-primary { color: #0F172A; }
            .text-sub { color: #64748B; }
            .pos-text { color: #334155; font-weight: bold; }
            .stat-green { color: #15803D; }
            .header-logo-cell { text-align: right; vertical-align: middle; width: 120px; }
            .header-logo { max-width: 110px; max-height: 44px; width: auto; height: auto; object-fit: contain; border-radius: 4px; }
            .footer { margin-top: 14px; border-top: 1px solid #E2E8F0; padding-top: 8px; text-align: center; }
            .footer-tag { font-size: 9.5px; color: #64748B; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
            .footer-logo { max-width: 200px; max-height: 28px; width: auto; height: auto; object-fit: contain; display: inline-block; }
          </style>
        </head>
        <body>
          <!-- ================= PAGE 1: SQUAD OVERVIEW & STATS ================= -->
          <table class="header-table">
            <tr>
              <td style="vertical-align: middle;">
                <h1 class="team-title">${teamName}</h1>
                <div class="team-sub">${ageGroup} AGE GROUP • ${currentSeason.toUpperCase()} • REPORTED: ${generatedDate}</div>
              </td>
              <td class="header-logo-cell">${headerLogoHtml}</td>
            </tr>
          </table>

          <div class="card">
            <div class="card-title">📊 TEAM RECORD & PERFORMANCE SUMMARY</div>
            <div class="honours-grid">
              <div class="honours-col" style="width: 33.33%;">
                <div class="honour-label">Matches Played</div>
                <div class="honour-value">${totalMatches} Games</div>
              </div>
              <div class="honours-col" style="width: 33.33%;">
                <div class="honour-label">Season Record</div>
                <div class="honour-value" style="color: #15803D;">${wins}W - ${draws}D - ${losses}L (${winRate}% Win Rate)</div>
              </div>
              <div class="honours-col" style="width: 33.33%;">
                <div class="honour-label">Goals (GD)</div>
                <div class="honour-value">${goalsFor} Scored / ${goalsAgainst} Conceded (${goalDiff > 0 ? '+' : ''}${goalDiff})</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">⭐ INDIVIDUAL SEASON HONOURS</div>
            <div class="honours-grid">
              <div class="honours-col">
                <div class="honour-label">🏆 Golden Boot</div>
                <div class="honour-value">${topScorer}</div>
              </div>
              <div class="honours-col">
                <div class="honour-label">🅰️ Playmaker</div>
                <div class="honour-value">${topAssister}</div>
              </div>
              <div class="honours-col">
                <div class="honour-label">⭐ ${coachAwardTitle} (Coach)</div>
                <div class="honour-value">${topCoachPotm}</div>
              </div>
              <div class="honours-col">
                <div class="honour-label">🌟 ${parentAwardTitle} (${isAdult ? 'Fans' : 'Parents'})</div>
                <div class="honour-value">${topParentPotm}</div>
              </div>
            </div>
          </div>

          ${scoutNotes ? `
            <div class="card">
              <div class="card-title">HEAD COACH SEASON REVIEW</div>
              <p class="text-primary" style="font-size: 10px; line-height: 1.35; margin: 0;">${scoutNotes}</p>
            </div>
          ` : ''}

          <div class="card">
            <div class="card-title">👥 SQUAD MASTER STATS BREAKDOWN</div>
            <table>
              <thead>
                <tr>
                  <th style="text-align: center;">NO</th>
                  <th>PLAYER</th>
                  <th style="text-align: center;">POS</th>
                  <th style="text-align: center;">APPS</th>
                  <th style="text-align: center;">MINS</th>
                  <th style="text-align: center;">GOALS</th>
                  <th style="text-align: center;">ASSISTS</th>
                  <th style="text-align: center;">POTM</th>
                </tr>
              </thead>
              <tbody>
                ${playerRowsHtml.length > 0 ? playerRowsHtml : '<tr><td colspan="8" class="text-sub" style="padding:6px; text-align:center;">No player data available.</td></tr>'}
              </tbody>
            </table>
          </div>

          <!-- PAGE 1 FOOTER -->
          <div class="footer">
            <div class="footer-tag">${teamName} • ${currentSeason}</div>
            <div>${footerLogoHtml}</div>
          </div>

          <!-- ================= PAGE 2: SEASON MATCH ARCHIVE ================= -->
          <table class="header-table page-break">
            <tr>
              <td style="vertical-align: middle;">
                <h1 class="team-title">${teamName}</h1>
                <div class="team-sub">${ageGroup} AGE GROUP • ${currentSeason.toUpperCase()} • SEASON MATCH ARCHIVE</div>
              </td>
              <td class="header-logo-cell">${headerLogoHtml}</td>
            </tr>
          </table>

          <div class="card">
            <div class="card-title">SEASON MATCH ARCHIVE & RESULTS RECORD</div>
            <table>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>OPPONENT</th>
                  <th style="text-align: center;">SCORE</th>
                  <th style="text-align: center;">RESULT & TYPE</th>
                </tr>
              </thead>
              <tbody>
                ${matchRowsHtml.length > 0 ? matchRowsHtml : '<tr><td colspan="4" class="text-sub" style="padding:8px; text-align:center;">No match history recorded yet.</td></tr>'}
              </tbody>
            </table>
          </div>

          <!-- PAGE 2 FOOTER -->
          <div class="footer">
            <div class="footer-tag">${teamName} • ${currentSeason}</div>
            <div>${footerLogoHtml}</div>
          </div>
        </body>
      </html>
    `;

    if (Platform.OS === 'web') {
      await Print.printAsync({ html: htmlContent });
    } else {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        await Print.printAsync({ uri });
      }
    }
  } catch (error) {
    console.error('❌ Failed to generate or share PDF report:', error);
    Alert.alert("PDF Export Error", error?.message || 'Could not generate or open PDF report.');
  }
};

// ==========================================
// 2. INDIVIDUAL PLAYER REPORT CARD PDF
// ==========================================

export const generatePlayerReportCard = async ({
  player = {},
  teamName = 'Academy Team',
  ageGroup = 'Youth',
  clubLogoUrl = null,
}) => {
  try {
    const DEFAULT_HEADER_LOGO_URL = 'https://jnogngcywfgitzryooig.supabase.co/storage/v1/object/public/app-assets/Tactical%20Engine%20Logo.png';
    const FOOTER_CREDIT_LOGO_URL = 'https://jnogngcywfgitzryooig.supabase.co/storage/v1/object/public/app-assets/In%20app%20Footer%20credit%20Logo.png';

    const fallbackHeaderSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="120" height="36">
        <rect width="200" height="60" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
        <path d="M25 15 L40 15 L45 30 L40 45 L25 45 L20 30 Z" fill="none" stroke="#15803D" stroke-width="2.5"/>
        <circle cx="32.5" cy="30" r="4" fill="#15803D"/>
        <text x="56" y="28" fill="#0F172A" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="bold" letter-spacing="1">TACTICAL</text>
        <text x="56" y="44" fill="#15803D" font-family="Helvetica, Arial, sans-serif" font-size="12" font-weight="bold" letter-spacing="2">ENGINE</text>
      </svg>
    `;

    const fallbackFooterSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 40" width="220" height="30">
        <rect width="300" height="40" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
        <circle cx="20" cy="20" r="6" fill="none" stroke="#15803D" stroke-width="2"/>
        <circle cx="20" cy="20" r="2" fill="#15803D"/>
        <text x="36" y="24" fill="#475569" font-family="Helvetica, Arial, sans-serif" font-size="10" font-weight="bold" letter-spacing="1">POWERED BY <tspan fill="#15803D">TACTICAL ENGINE</tspan></text>
      </svg>
    `;

    let headerLogoBase64 = null;
    if (clubLogoUrl && typeof clubLogoUrl === 'string' && clubLogoUrl.trim().startsWith('http')) {
      headerLogoBase64 = await fetchBase64Image(clubLogoUrl.trim());
    }
    if (!headerLogoBase64) {
      headerLogoBase64 = await fetchBase64Image(DEFAULT_HEADER_LOGO_URL);
    }

    const footerLogoBase64 = await fetchBase64Image(FOOTER_CREDIT_LOGO_URL);

    const headerLogoHtml = headerLogoBase64
      ? `<img src="${headerLogoBase64}" class="header-logo" alt="Club Crest" />`
      : fallbackHeaderSvg;

    const footerLogoHtml = footerLogoBase64
      ? `<img src="${footerLogoBase64}" class="footer-logo" alt="Powered by Tactical Engine" />`
      : fallbackFooterSvg;

    // Dynamic Season Label and UK Date
    const currentSeason = getCurrentFootballSeason();
    const generatedDate = formatUkDate();

    // ⚡ DYNAMIC STAT CALCULATIONS FROM REAL SUPABASE 1-10 FIELDS (Scaled to 0-100%)
    const calcAvgScaled = (arr) => {
      const valid = arr.filter(v => typeof v === 'number' && !isNaN(v));
      if (valid.length === 0) return 50;
      const sum = valid.reduce((a, b) => a + b, 0);
      return Math.round((sum / valid.length) * 10);
    };

    const isGk = String(player.position || '').toUpperCase().includes('GK');

    const phys = calcAvgScaled([
      player.phys_sprint,
      player.phys_accel,
      player.phys_stamina,
      player.phys_strength,
      player.phys_agility,
    ]);

    const tech = isGk
      ? calcAvgScaled([
          player.gk_shot_stopping,
          player.gk_handling,
          player.gk_1v1,
          player.gk_aerial,
          player.gk_sweeping,
          player.gk_distribution,
        ])
      : calcAvgScaled([
          player.tech_first_touch,
          player.tech_short_pass,
          player.tech_dribbling,
          player.tech_shooting_acc,
          player.tech_shooting_pow,
          player.tech_crossing,
          player.tech_tackling,
          player.tech_intercept,
          player.tech_aerial,
          player.tech_positioning,
        ]);

    const tact = calcAvgScaled([
      player.tact_awareness,
      player.tact_pressing,
      player.tact_instructions,
      player.tact_decision,
    ]);

    const ment = calcAvgScaled([
      player.psych_confidence,
      player.psych_aggression,
      player.psych_leadership,
      player.psych_workrate,
      player.psych_composure,
    ]);

    const overall = Math.round((tech + tact + phys + ment) / 4);

    // Performance Metrics
    const totalMins = player.total_minutes_played || 0;
    const apps = player.apps || 0;
    const totalPotm = (player.motm || 0) + (player.parent_motm || 0);

    // Dynamic Notes
    const hasWeaknessNotes = Boolean(player.notes_weaknesses);
    const hasCommNotes = Boolean(player.notes_communication);
    const hasGeneralNotes = Boolean(player.coach_development_notes || player.notes_notes || player.notes);

    const hasAnyNotes = hasWeaknessNotes || hasCommNotes || hasGeneralNotes;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Player Development Report Card</title>
          <style>
            * { box-sizing: border-box; }
            body { background-color: #FFFFFF; color: #0F172A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 20px 24px; }
            .header-table { width: 100%; border-bottom: 3px solid #15803D; padding-bottom: 8px; margin-bottom: 14px; }
            .title { font-size: 20px; font-weight: 800; color: #0F172A; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
            .subtitle { font-size: 10.5px; color: #15803D; font-weight: bold; text-transform: uppercase; margin-top: 3px; }
            .header-logo-cell { text-align: right; vertical-align: middle; width: 120px; }
            .header-logo { max-width: 110px; max-height: 44px; width: auto; height: auto; object-fit: contain; border-radius: 4px; }
            .player-card { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
            .player-name { font-size: 18px; font-weight: bold; color: #0F172A; }
            .player-meta { font-size: 11px; color: #15803D; font-weight: bold; margin-top: 3px; }
            .ovr-badge { background-color: #15803D; color: #FFFFFF; font-size: 20px; font-weight: 900; width: 48px; height: 48px; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
            .card { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; margin-bottom: 14px; }
            .card-title { color: #15803D; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
            .metrics-grid { display: table; width: 100%; }
            .metric-col { display: table-cell; width: 20%; text-align: center; }
            .metric-label { font-size: 8.5px; font-weight: bold; color: #64748B; text-transform: uppercase; }
            .metric-val { font-size: 14px; font-weight: bold; color: #0F172A; margin-top: 2px; }
            .matrix-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .stat-box { background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; }
            .stat-label { font-size: 9.5px; color: #64748B; text-transform: uppercase; font-weight: bold; }
            .stat-val { font-size: 15px; font-weight: bold; color: #15803D; margin-top: 3px; }
            .bar-bg { background-color: #E2E8F0; height: 6px; border-radius: 3px; margin-top: 6px; overflow: hidden; }
            .bar-fill { background-color: #15803D; height: 100%; }
            .note-header { font-size: 9.5px; color: #15803D; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
            .notes-text { font-size: 10.5px; color: #334155; line-height: 1.45; margin: 0 0 8px 0; }
            .footer { margin-top: 14px; border-top: 1px solid #E2E8F0; padding-top: 8px; text-align: center; }
            .footer-tag { font-size: 9.5px; color: #64748B; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
            .footer-logo { max-width: 200px; max-height: 28px; width: auto; height: auto; object-fit: contain; display: inline-block; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="vertical-align: middle;">
                <h1 class="title">Player Development Report</h1>
                <div class="subtitle">${teamName} • ${ageGroup} AGE GROUP • ${currentSeason.toUpperCase()} • REPORTED: ${generatedDate}</div>
              </td>
              <td class="header-logo-cell">${headerLogoHtml}</td>
            </tr>
          </table>

          <div class="player-card">
            <div>
              <div class="player-name">${player.name || player.fullName || 'Player'} #${player.squad_number || player.number || ''}</div>
              <div class="player-meta">Primary Position: ${player.position || player.primaryPosition || 'Utility'}</div>
            </div>
            <div class="ovr-badge">${overall}</div>
          </div>

          <div class="card">
            <div class="card-title">⚽ MATCH PERFORMANCE SUMMARY</div>
            <div class="metrics-grid">
              <div class="metric-col">
                <div class="metric-label">Appearances</div>
                <div class="metric-val">${apps}</div>
              </div>
              <div class="metric-col">
                <div class="metric-label">Minutes Played</div>
                <div class="metric-val">${totalMins}m</div>
              </div>
              <div class="metric-col">
                <div class="metric-label">Goals</div>
                <div class="metric-val" style="color:#15803D;">${player.goals || 0}</div>
              </div>
              <div class="metric-col">
                <div class="metric-label">Assists</div>
                <div class="metric-val">${player.assists || 0}</div>
              </div>
              <div class="metric-col">
                <div class="metric-label">POTM Awards</div>
                <div class="metric-val" style="color:#15803D;">${totalPotm}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">🎯 360° ATTRIBUTE RATING MATRIX</div>
            <div class="matrix-grid">
              <div class="stat-box">
                <div class="stat-label">Technical Quality</div>
                <div class="stat-val">${tech} / 100</div>
                <div class="bar-bg"><div class="bar-fill" style="width: ${tech}%;"></div></div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Tactical Awareness</div>
                <div class="stat-val">${tact} / 100</div>
                <div class="bar-bg"><div class="bar-fill" style="width: ${tact}%;"></div></div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Physical Performance</div>
                <div class="stat-val">${phys} / 100</div>
                <div class="bar-bg"><div class="bar-fill" style="width: ${phys}%;"></div></div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Mental Resilience</div>
                <div class="stat-val">${ment} / 100</div>
                <div class="bar-bg"><div class="bar-fill" style="width: ${ment}%;"></div></div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">📝 HEAD COACH DEVELOPMENT NOTES</div>
            ${
              hasAnyNotes
                ? `
                  ${hasWeaknessNotes ? `<div class="note-header">🎯 Areas for Improvement</div><p class="notes-text">${player.notes_weaknesses}</p>` : ''}
                  ${hasCommNotes ? `<div class="note-header">🗣️ Communication & Leadership</div><p class="notes-text">${player.notes_communication}</p>` : ''}
                  ${hasGeneralNotes ? `<div class="note-header">📝 General Observations</div><p class="notes-text">${player.coach_development_notes || player.notes_notes || player.notes}</p>` : ''}
                `
                : `<p class="notes-text" style="color: #64748B; font-style: italic;">No notes recorded.</p>`
            }
          </div>

          <!-- FOOTER -->
          <div class="footer">
            <div class="footer-tag">${player.name || 'Player'} #${player.squad_number || ''} • ${teamName} • ${currentSeason}</div>
            <div>${footerLogoHtml}</div>
          </div>
        </body>
      </html>
    `;

    if (Platform.OS === 'web') {
      await Print.printAsync({ html: htmlContent });
    } else {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        await Print.printAsync({ uri });
      }
    }
  } catch (error) {
    console.error('❌ Failed to generate or share player PDF report:', error);
    Alert.alert("PDF Export Error", error?.message || 'Could not generate or open player report card.');
  }
};