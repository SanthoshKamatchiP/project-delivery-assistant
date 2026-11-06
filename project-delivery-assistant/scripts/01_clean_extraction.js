// n8n Code node: "Code in JavaScript"
// Parses Gemini JSON for every transcript, flags missing owners, marks scope changes as not approved.
// Mode: Run Once for All Items | Language: JavaScript

const v = x => (x === null || x === undefined) ? '' : x;
const loggedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
const num = n => String(n + 1).padStart(2, '0');

function scopeNote(type, desc) {
  const d = v(desc);
  if (type === 'Scope Change' && !/not\s+(yet\s+)?approved/i.test(d)) {
    return d + ' [Not approved - decision pending]';
  }
  return d;
}

function fixFlag(flag, owner, isAction) {
  let f = String(flag || 'NONE').split(',').map(s => s.trim()).filter(s => s && s !== 'NONE' && s !== 'OWNER_MISSING');
  if (isAction && !owner) f.push('OWNER_MISSING');
  return f.length ? f.join(', ') : 'NONE';
}

const rows = [];

for (const item of $input.all()) {
  const raw = item.json;
  const parts = raw.content?.parts ?? [];
  let text = parts.map(p => p.text ?? '').join('') || raw.text || raw.output || '';
  text = text.replace(/```json|```/g, '').trim();
  text = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  const data = JSON.parse(text);

  (data.actions || []).forEach((a, i) => rows.push({ json: {
    kind: 'action',
    id: `A-${data.meeting_date}-${num(i)}`,
    source_meeting: v(data.meeting_name),
    meeting_date: v(data.meeting_date),
    description: v(a.description),
    owner: v(a.owner),
    due_date: v(a.due_date),
    due_date_raw_text: v(a.due_date_raw_text),
    flag: fixFlag(a.flag, a.owner, true),
    source_quote: v(a.source_quote),
    status: 'Open',
    logged_at: loggedAt
  }}));

  (data.items || []).forEach((it, i) => rows.push({ json: {
    kind: 'item',
    id: `R-${data.meeting_date}-${num(i)}`,
    source_meeting: v(data.meeting_name),
    type: v(it.type),
    description: scopeNote(it.type, it.description),
    severity: v(it.severity),
    mitigation: v(it.mitigation),
    owner: v(it.owner),
    flag: fixFlag(it.flag, it.owner, false),
    source_quote: v(it.source_quote),
    logged_at: loggedAt
  }}));
}

return rows;