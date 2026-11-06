// n8n Code node: "Build short summary"
// Builds the short Telegram summary. Replace PASTE_YOUR_GOOGLE_SHEET_LINK_HERE with your Sheet link.
// Mode: Run Once for All Items | Language: JavaScript

const d = $('Build report data').first().json;
const h = d.health, c = d.counts;

// Count each scope-change request once (same request can appear in two meetings)
const seen = new Set();
d.items.filter(i => i.type === 'Scope Change').forEach(i => {
  const m = String(i.description).match(/\b[A-Z][a-z]+[A-Z][A-Za-z]*\b/);
  seen.add(m ? m[0].toLowerCase() : String(i.description).toLowerCase());
});

const short = (t, n) => t.length > n ? t.slice(0, n) + '...' : t;
const top = d.items
  .filter(i => i.severity === 'High')
  .slice(0, 3)
  .map(i => '- ' + short(String(i.description), 140) + ' (' + i.owner + ')');

const lines = [
  'BrightMart CRM Rollout - Weekly Status',
  'Report date: ' + h.report_date,
  'Status: ' + String(h.rag_status).toUpperCase(),
  '',
  'PROGRESS',
  '- Actual ' + h.actual_complete + ' vs planned ' + h.planned_complete + ' (' + h.schedule_variance + ')',
  '- Overdue tasks: ' + h.overdue_tasks + ' (critical: ' + h.critical_overdue_tasks + ', longest: ' + h.max_days_overdue + ' days)',
  '',
  'LOGS FROM MEETINGS',
  '- Actions: ' + c.actions_total + ' (no owner: ' + c.actions_without_owner + ', unclear date: ' + c.actions_with_unclear_date + ')',
  '- Risks: ' + c.risks + ' | Issues: ' + c.issues + ' | Decisions: ' + c.decisions,
  '- High severity: ' + c.high_severity_items,
  '- Scope changes awaiting approval: ' + seen.size,
  ''
];
if (top.length) { lines.push('TOP HIGH-SEVERITY ITEMS'); lines.push(...top); lines.push(''); }
lines.push('Full report (Weekly Report tab):');
lines.push('PASTE_YOUR_GOOGLE_SHEET_LINK_HERE');
lines.push('Draft - pending project manager review.');

return [{ json: { short_text: lines.join('\n') } }];