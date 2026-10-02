import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const generateSeasonPdfReport = async ({
  teamName = 'Tactical Engine Academy',
  ageGroup = 'U14',
  clubLogoUrl = null,
  teamSheet = [],
  matchHistory = [],
  scoutNotes = '',
}) => {
  // Graceful Fallback Logos
  const defaultHeaderLogo = 'https://i.ibb.co/L8vJ9Wf/Tactical-Engine-Logo.png';
  const footerCreditLogo = 'https://i.ibb.co/f4R9d7v/In-app-Footer-credit-Logo.png';

  const headerLogoToUse = clubLogoUrl || defaultHeaderLogo;

  // Render squad rows
  const playerRowsHtml = (teamSheet || []).map((p, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#1A1F26' : '#0B0E14'}; border-bottom: 1px solid #2E3A44;">
      <td style="padding: 10px; color: #39FF14; font-weight: bold; text-align: center;">#${p.squad_number || '-'}</td>
      <td style="padding: 10px; color: #FFFFFF; font-weight: bold;">${p.name}</td>
      <td style="padding: 10px; color: #94A3B8; text-align: center;">${p.position || 'N/A'}</td>
      <td style="padding: 10px; color: #FFFFFF; text-align: center;">${p.apps || 0}</td>
      <td style="padding: 10px; color: #39FF14; text-align: center; font-weight: bold;">${p.goals || 0}</td>
      <td style="padding: 10px; color: #FFFFFF; text-align: center;">${p.assists || 0}</td>
      <td style="padding: 10px; color: #FFFFFF; text-align: center;">${p.motm || 0}</td>
    </tr>
  `).join('');

  // Render match history rows
  const matchRowsHtml = (matchHistory || []).map((m, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#1A1F26' : '#0B0E14'}; border-bottom: 1px solid #2E3A44;">
      <td style="padding: 10px; color: #94A3B8;">${m.date || 'Season Match'}</td>
      <td style="padding: 10px; color: #FFFFFF; font-weight: bold;">vs ${m.opponent || 'Opponent'}</td>
      <td style="padding: 10px; color: #39FF14; font-weight: bold; text-align: center;">${m.team_score ?? 0} - ${m.opponent_score ?? 0}</td>
      <td style="padding: 10px; color: #FFFFFF; text-align: center;">${m.match_type || 'League'}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Season Tactical Report</title>
        <style>
          body {
            background-color: #0B0E14;
            color: #FFFFFF;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 30px;
          }
          .header-table {
            width: 100%;
            border-bottom: 2px solid #39FF14;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .team-title {
            font-size: 26px;
            font-weight: 800;
            color: #FFFFFF;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0;
          }
          .team-sub {
            font-size: 13px;
            color: #39FF14;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 4px;
          }
          .card {
            background-color: #1A1F26;
            border: 1px solid #2E3A44;
            border-radius: 8px;
            padding: 18px;
            margin-bottom: 20px;
          }
          .card-title {
            color: #39FF14;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th {
            background-color: #2E3A44;
            color: #39FF14;
            text-align: left;
            padding: 10px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #2E3A44;
            padding-top: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <!-- HEADER WITH DUAL BRANDING -->
        <table class="header-table">
          <tr>
            <td style="vertical-align: middle;">
              <h1 class="team-title">${teamName}</h1>
              <div class="team-sub">${ageGroup} AGE GROUP • EXECUTIVE SEASON PERFORMANCE REPORT</div>
            </td>
            <td style="text-align: right; vertical-align: middle; width: 140px;">
              <img src="${headerLogoToUse}" style="max-width: 120px; max-height: 60px; object-fit: contain;" alt="Club Crest" />
            </td>
          </tr>
        </table>

        <!-- SCOUTING & TACTICAL NOTES -->
        ${scoutNotes ? `
          <div class="card">
            <div class="card-title">HEAD COACH TACTICAL SUMMARY</div>
            <p style="color: #CBD5E1; font-size: 13px; line-height: 1.6; margin: 0;">${scoutNotes}</p>
          </div>
        ` : ''}

        <!-- SQUAD PERFORMANCE TABLE -->
        <div class="card">
          <div class="card-title">SQUAD PLAYER ANALYTICS</div>
          <table>
            <thead>
              <tr>
                <th style="text-align: center;">NO</th>
                <th>PLAYER</th>
                <th style="text-align: center;">POS</th>
                <th style="text-align: center;">APPS</th>
                <th style="text-align: center;">GOALS</th>
                <th style="text-align: center;">ASSISTS</th>
                <th style="text-align: center;">POTM</th>
              </tr>
            </thead>
            <tbody>
              ${playerRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- MATCH HISTORY -->
        <div class="card">
          <div class="card-title">SEASON MATCH ARCHIVE</div>
          <table>
            <thead>
              <tr>
                <th>DATE</th>
                <th>OPPONENT</th>
                <th style="text-align: center;">SCORE</th>
                <th style="text-align: center;">TYPE</th>
              </tr>
            </thead>
            <tbody>
              ${matchRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- FOOTER BRANDING -->
        <div class="footer">
          <img src="${footerCreditLogo}" style="height: 35px; object-fit: contain;" alt="Powered by Tactical Engine" />
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch (error) {
    console.error('❌ Failed to generate or share PDF report:', error);
  }
};