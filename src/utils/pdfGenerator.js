import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

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

    // Light-theme offline vector fallbacks
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

    // Calculate Team Record Analytics
    const totalMatches = matchHistory.length;
    const wins = matchHistory.filter(m => m.result === 'W').length;
    const draws = matchHistory.filter(m => m.result === 'D').length;
    const losses = matchHistory.filter(m => m.result === 'L').length;
    const goalsFor = matchHistory.reduce((sum, m) => sum + (m.team_score || 0), 0);
    const goalsAgainst = matchHistory.reduce((sum, m) => sum + (m.opponent_score || 0), 0);
    const goalDiff = goalsFor - goalsAgainst;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    // Calculate Individual Season Honours
    const sortedByGoals = [...teamSheet].sort((a, b) => (b.goals || 0) - (a.goals || 0));
    const sortedByAssists = [...teamSheet].sort((a, b) => (b.assists || 0) - (a.assists || 0));
    const sortedByPotm = [...teamSheet].sort((a, b) => ((b.motm || 0) + (b.parent_motm || 0)) - ((a.motm || 0) + (a.parent_motm || 0)));

    const topScorer = sortedByGoals[0]?.goals > 0 
      ? `${sortedByGoals[0].name} (${sortedByGoals[0].goals} Goals)` 
      : 'N/A';
    
    const topAssister = sortedByAssists[0]?.assists > 0 
      ? `${sortedByAssists[0].name} (${sortedByAssists[0].assists} Assists)` 
      : 'N/A';
    
    const topPotm = sortedByPotm[0] && ((sortedByPotm[0].motm || 0) + (sortedByPotm[0].parent_motm || 0) > 0)
      ? `${sortedByPotm[0].name} (${(sortedByPotm[0].motm || 0) + (sortedByPotm[0].parent_motm || 0)} Total Awards)` 
      : 'N/A';

    // Render squad rows with master stats
    const playerRowsHtml = (teamSheet || []).map((p, idx) => {
      const totalMins = p.total_minutes_played || 0;
      const avgMins = p.apps > 0 ? Math.round(totalMins / p.apps) : 0;
      const totalPotm = (p.motm || 0) + (p.parent_motm || 0);

      return `
        <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
          <td class="stat-green" style="padding: 7px 8px; font-weight: bold; text-align: center;">#${p.squad_number || '-'}</td>
          <td class="text-primary" style="padding: 7px 8px; font-weight: bold;">${p.name || 'Player'}</td>
          <td class="pos-text" style="padding: 7px 8px; text-align: center;">${p.position || 'N/A'}</td>
          <td class="text-primary" style="padding: 7px 8px; text-align: center;">${p.apps || 0}</td>
          <td class="text-sub" style="padding: 7px 8px; text-align: center;">${totalMins}m (${avgMins}m/g)</td>
          <td class="stat-green" style="padding: 7px 8px; text-align: center; font-weight: bold;">${p.goals || 0}</td>
          <td class="text-primary" style="padding: 7px 8px; text-align: center;">${p.assists || 0}</td>
          <td class="text-primary" style="padding: 7px 8px; text-align: center;">${totalPotm}</td>
        </tr>
      `;
    }).join('');

    // Render match history rows
    const matchRowsHtml = (matchHistory || []).map((m, idx) => `
      <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
        <td class="text-sub" style="padding: 7px 8px;">${m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Season Match'}</td>
        <td class="text-primary" style="padding: 7px 8px; font-weight: bold;">vs ${m.opponent_name || m.opponent || 'Opponent'}</td>
        <td class="stat-green" style="padding: 7px 8px; font-weight: bold; text-align: center;">${m.team_score ?? 0} - ${m.opponent_score ?? 0}</td>
        <td class="text-primary" style="padding: 7px 8px; text-align: center;">${m.result || 'D'} (${m.match_type || 'Match'})</td>
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
            * {
              box-sizing: border-box;
            }
            
            body {
              background-color: #FFFFFF;
              color: #0F172A;
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .header-table {
              width: 100%;
              border-bottom: 3px solid #15803D;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .team-title {
              font-size: 24px;
              font-weight: 800;
              color: #0F172A;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 0;
            }
            .team-sub {
              font-size: 11px;
              color: #15803D;
              font-weight: bold;
              text-transform: uppercase;
              margin-top: 4px;
            }
            .card {
              background-color: #F8FAFC;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 12px 14px;
              margin-bottom: 16px;
            }
            .page-break {
              page-break-before: always !important;
              break-before: page !important;
            }
            .card-title {
              color: #15803D;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            .honours-grid {
              display: table;
              width: 100%;
              margin-bottom: 4px;
            }
            .honours-col {
              display: table-cell;
              width: 33.33%;
              vertical-align: top;
              padding-right: 10px;
            }
            .honour-label {
              font-size: 10px;
              font-weight: bold;
              color: #64748B;
              text-transform: uppercase;
            }
            .honour-value {
              font-size: 12px;
              font-weight: bold;
              color: #0F172A;
              margin-top: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            th {
              background-color: #E2E8F0;
              color: #0F172A;
              text-align: left;
              padding: 8px 10px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .row-even { background-color: #FFFFFF; border-bottom: 1px solid #E2E8F0; }
            .row-odd { background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
            .text-primary { color: #0F172A; }
            .text-sub { color: #64748B; }
            .pos-text { color: #334155; font-weight: bold; }
            .stat-green { color: #15803D; }

            .header-logo-cell {
              text-align: right;
              vertical-align: middle;
              width: 120px;
            }
            .header-logo {
              max-width: 110px;
              max-height: 50px;
              width: auto;
              height: auto;
              object-fit: contain;
              border-radius: 4px;
            }
            .footer {
              margin-top: 30px;
              border-top: 1px solid #E2E8F0;
              padding-top: 15px;
              text-align: center;
            }
            .footer-logo {
              max-width: 220px;
              max-height: 38px;
              width: auto;
              height: auto;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <!-- HEADER -->
          <table class="header-table">
            <tr>
              <td style="vertical-align: middle;">
                <h1 class="team-title">${teamName}</h1>
                <div class="team-sub">${ageGroup} AGE GROUP • EXECUTIVE SEASON PERFORMANCE REPORT</div>
              </td>
              <td class="header-logo-cell">
                ${headerLogoHtml}
              </td>
            </tr>
          </table>

          <!-- TEAM RECORD SUMMARY -->
          <div class="card">
            <div class="card-title">📊 TEAM RECORD & PERFORMANCE SUMMARY</div>
            <div class="honours-grid">
              <div class="honours-col">
                <div class="honour-label">Matches Played</div>
                <div class="honour-value">${totalMatches} Games</div>
              </div>
              <div class="honours-col">
                <div class="honour-label">Season Record</div>
                <div class="honour-value" style="color: #15803D;">${wins}W - ${draws}D - ${losses}L (${winRate}% Win Rate)</div>
              </div>
              <div class="honours-col">
                <div class="honour-label">Goals (GD)</div>
                <div class="honour-value">${goalsFor} Scored / ${goalsAgainst} Conceded (${goalDiff > 0 ? '+' : ''}${goalDiff})</div>
              </div>
            </div>
          </div>

          <!-- INDIVIDUAL HONOURS -->
          <div class="card">
            <div class="card-title">⭐ INDIVIDUAL SEASON HONOURS</div>
            <div class="honours-grid">
              <div class="honours-col">
                <div class="honour-label">🏆 Golden Boot</div>
                <div class="honour-value">${topScorer}</div>
              </div>
              <div class="honours-col">
                <div class="honour-label">🅰️ Playmaker Award</div>
                <div class="honour-value">${topAssister}</div>
              </div>
              <div class="honours-col">
                <div class="honour-label">🌟 Overall POTM Leader</div>
                <div class="honour-value">${topPotm}</div>
              </div>
            </div>
          </div>

          ${scoutNotes ? `
            <div class="card">
              <div class="card-title">HEAD COACH SEASON REVIEW</div>
              <p class="text-primary" style="font-size: 11px; line-height: 1.4; margin: 0;">${scoutNotes}</p>
            </div>
          ` : ''}

          <!-- SQUAD MASTER ANALYTICS -->
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
                ${playerRowsHtml.length > 0 ? playerRowsHtml : '<tr><td colspan="8" class="text-sub" style="padding:8px; text-align:center;">No player data available.</td></tr>'}
              </tbody>
            </table>
          </div>

          <!-- PAGE 2: MATCH ARCHIVE & FOOTER -->
          <div class="card page-break">
            <div class="card-title">SEASON MATCH ARCHIVE</div>
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

          <div class="footer">
            ${footerLogoHtml}
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