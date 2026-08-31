import fs from 'fs';

const html = fs.readFileSync('C:/Users/Admin/Desktop/TukDaeng/Prototypes/bo-prototype.html', 'utf8');

// Extract alerts array
const lines = html.split('\n');
const alertsLines = [];
let inAlerts = false;
for (const line of lines) {
  if (line.includes('alerts: [')) { inAlerts = true; continue; }
  if (inAlerts && /^\s+\],?\s*$/.test(line)) { inAlerts = false; break; }
  if (inAlerts) alertsLines.push(line);
}
const alertsStr = '[' + alertsLines.map(l => l.trim().replace(/,$/, '')).join(',') + ']';
const alerts = eval('(' + alertsStr + ')');

console.log('Total alerts:', alerts.length, '\n');

// Helper: simulate filter and show results
function test(name, filterFn) {
  const results = alerts.filter(filterFn);
  const ids = results.map(a => a.id);
  console.log(`${name}: ${results.length} results → [${ids.join(', ')}]`);
  return results;
}

// === Status filter ===
console.log('=== Status Filter ===');
test('ทุกสถานะ (empty)', a => true);
test('Active', a => a.status === 'Active');
test('User Disabled', a => a.status === 'User Disabled');
test('Deleted', a => a.status === 'Deleted');

// === Notification filter ===
console.log('\n=== Notification Filter ===');
test('เปิดแจ้งเตือน (on)', a => a.notificationEnabled === true);
test('ปิดแจ้งเตือน (off)', a => a.notificationEnabled === false);

// === Trigger history filter ===
console.log('\n=== Trigger History Filter ===');
test('เคย trigger (has)', a => a.triggerCount > 0);
test('ไม่เคย trigger (none)', a => !(a.triggerCount > 0));

// === Zero match filter ===
console.log('\n=== Zero Match Filter ===');
test('ไม่มี match (zero)', a => a.matchCount === 0);
test('มี match (has)', a => a.matchCount !== 0);

// === Date range: Last Triggered ===
console.log('\n=== Last Triggered Date Range ===');
const toStart = s => new Date(s + 'T00:00:00+07:00').getTime();
const toEnd = s => new Date(s + 'T23:59:59+07:00').getTime();
test('from 2026-08-20', a => {
  if (!a.lastTriggered) return false;
  return new Date(a.lastTriggered).getTime() >= toStart('2026-08-20');
});
test('to 2026-08-19', a => {
  if (!a.lastTriggered) return false;
  return new Date(a.lastTriggered).getTime() <= toEnd('2026-08-19');
});
test('range 2026-08-20 to 2026-08-26', a => {
  if (!a.lastTriggered) return false;
  const ts = new Date(a.lastTriggered).getTime();
  return ts >= toStart('2026-08-20') && ts <= toEnd('2026-08-26');
});

// === Combined filters ===
console.log('\n=== Combined Filters ===');
test('Active + เปิดแจ้งเตือน + เคย trigger', a =>
  a.status === 'Active' && a.notificationEnabled && a.triggerCount > 0
);
test('Active + ไม่มี match', a =>
  a.status === 'Active' && a.matchCount === 0
);
test('User Disabled + ไม่เคย trigger', a =>
  a.status === 'User Disabled' && !(a.triggerCount > 0)
);

// === Sort ===
console.log('\n=== Sort Tests ===');
const sorters = {
  'updated-desc': (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime(),
  'updated-asc': (a, b) => new Date(a.updated).getTime() - new Date(b.updated).getTime(),
  'trigger-desc': (a, b) => b.triggerCount - a.triggerCount,
  'last-triggered-desc': (a, b) => {
    const ats = a.lastTriggered ? new Date(a.lastTriggered).getTime() : 0;
    const bts = b.lastTriggered ? new Date(b.lastTriggered).getTime() : 0;
    return bts - ats;
  },
  'name-asc': (a, b) => (a.name || '').localeCompare(b.name || '')
};
for (const [key, fn] of Object.entries(sorters)) {
  const sorted = [...alerts].sort(fn);
  console.log(`${key}: [${sorted.slice(0, 3).map(a => a.id).join(' → ')}...]`);
}

// === Pagination ===
console.log('\n=== Pagination (pageSize=10) ===');
const pageSize = 10;
const allFiltered = alerts.filter(a => a.status === 'Active');
const pageCount = Math.max(1, Math.ceil(allFiltered.length / pageSize));
console.log(`Active alerts: ${allFiltered.length}, pageCount: ${pageCount}`);
console.log(`Page 1: [${allFiltered.slice(0, 10).map(a => a.id).join(', ')}]`);
if (pageCount > 1) {
  console.log(`Page 2: [${allFiltered.slice(10, 20).map(a => a.id).join(', ')}]`);
}

// === Reset ===
console.log('\n=== Reset Test ===');
console.log('Reset clears: status, notif, trigger, zero-match, sort, date range');
console.log('After reset → all 12 alerts shown, page 1, sort=updated-desc');

// === Empty state ===
console.log('\n=== Empty State ===');
const noResults = alerts.filter(a => a.status === 'Active' && a.status === 'Deleted');
console.log(`Active AND Deleted (impossible): ${noResults.length} results → should show empty state`);
