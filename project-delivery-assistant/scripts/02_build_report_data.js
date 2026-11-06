// n8n Code node: "Build report data"
// Reads the summary, actions and risks tabs and bundles them into one package for the report.
// Mode: Run Once for All Items | Language: JavaScript

const sum = {};
$('Get_summary').all().forEach(r => { sum[r.json['Metric']] = r.json['Value']; });

const pct = x => (Math.round(Number(x) * 1000) / 10) + '%';
const pts = x => (Math.round(Number(x) * 1000) / 10) + ' pts';

const health = {
  report_date: sum['Report date'],
  total_tasks: sum['Total tasks'],
  actual_complete: pct(sum['Actual % complete']),
  planned_complete: pct(sum['Planned % complete']),
  schedule_variance: pts(sum['Schedule variance (pts)']),
  overdue_tasks: sum['Overdue tasks'],
  critical_overdue_tasks: sum['Critical overdue tasks'],
  max_days_overdue: sum['Max days overdue'],
  rag_status: sum['RAG status']
};

const actions = $('Get_actions_log').all().map(r => ({
  id: r.json['Action ID'],
  meeting: r.json['Source Meeting'],
  description: r.json['Description'],
  owner: r.json['Owner'] || 'UNASSIGNED',
  due_date: r.json['Due Date'] || '',
  due_text: r.json['Due Date Raw Text'] || '',
  flag: r.json['Flag']
}));

const items = $('Get_risks_log').all().map(r => ({
  id: r.json['Item ID'],
  meeting: r.json['Source Meeting'],
  type: r.json['Type'],
  description: r.json['Description'],
  severity: r.json['Severity'] || '',
  owner: r.json['Owner'] || 'UNASSIGNED',
  mitigation: r.json['Mitigation'] || '',
  flag: r.json['Flag']
}));

const count = (arr, fn) => arr.filter(fn).length;
const counts = {
  actions_total: actions.length,
  actions_without_owner: count(actions, a => a.owner === 'UNASSIGNED'),
  actions_with_unclear_date: count(actions, a => /DATE_UNCLEAR/.test(a.flag)),
  risks: count(items, i => i.type === 'Risk'),
  issues: count(items, i => i.type === 'Issue'),
  decisions: count(items, i => i.type === 'Decision'),
  scope_changes_pending: count(items, i => i.type === 'Scope Change'),
  high_severity_items: count(items, i => i.severity === 'High'),
  conflicting_info_items: count(items, i => /CONFLICTING_INFO/.test(i.flag))
};

const package_json = { health, counts, actions, items };
return [{ json: { ...package_json, package_text: JSON.stringify(package_json) } }];