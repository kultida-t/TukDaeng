import fs from 'fs';
import vm from 'vm';

const html = fs.readFileSync('C:/Users/Admin/Desktop/TukDaeng/Prototypes/bo-prototype.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const code = scriptMatch[1];

// stub minimal browser APIs
const stubEl = { innerHTML: '', textContent: '', value: '', querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {}, setAttribute: () => {}, getAttribute: () => null, classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => false } };
const window = { addEventListener: () => {}, matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }), localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }, location: { reload: () => {} }, setInterval: () => 0, setTimeout: () => 0, clearTimeout: () => {}, clearInterval: () => {} };
const document = {
  querySelector: () => stubEl,
  querySelectorAll: () => [],
  getElementById: () => stubEl,
  body: { classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => false }, dataset: {} },
  createElement: () => stubEl,
  addEventListener: () => {},
};
const ctx = { window, document, console, setTimeout, setInterval, clearTimeout, clearInterval, Date, Math, JSON, Array, Object, String, Number, Boolean, RegExp, Map, Set, parseInt, parseFloat, isNaN, encodeURIComponent, decodeURIComponent };
vm.createContext(ctx);
vm.runInContext(code, ctx);

// Extract alerts array directly from source (lines 13396-13407)
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
console.log('Total alerts:', alerts.length);

// Status
const statuses = [...new Set(alerts.map(a => a.status))];
console.log('\n=== Status filter options ===');
console.log('Data values:', statuses);
console.log('Filter options: ["", "Active", "User Disabled", "Deleted"]');
console.log('Match:', statuses.every(s => ['Active','User Disabled','Deleted'].includes(s)));

// Notification
const notifs = [...new Set(alerts.map(a => a.notificationEnabled))];
console.log('\n=== Notification filter options ===');
console.log('Data values:', notifs);
console.log('Filter options: on=true, off=false');
console.log('Has true:', notifs.includes(true), 'Has false:', notifs.includes(false));

// Trigger history
const triggers = [...new Set(alerts.map(a => a.triggerCount))];
console.log('\n=== Trigger history filter ===');
console.log('triggerCount values:', triggers);
console.log('Has >0:', alerts.some(a => a.triggerCount > 0), 'Has =0:', alerts.some(a => a.triggerCount === 0));

// Zero match
const matches = [...new Set(alerts.map(a => a.matchCount))];
console.log('\n=== Zero match filter ===');
console.log('matchCount values:', matches);
console.log('Has =0:', alerts.some(a => a.matchCount === 0), 'Has >0:', alerts.some(a => a.matchCount > 0));

// Last triggered
const lastTriggered = alerts.map(a => a.lastTriggered).filter(Boolean);
console.log('\n=== Last triggered date range ===');
console.log('Has lastTriggered:', lastTriggered.length, 'Null:', alerts.length - lastTriggered.length);
console.log('Sample dates:', lastTriggered.slice(0, 3));

// Sort options
console.log('\n=== Sort options ===');
console.log('updated values sample:', alerts.slice(0,3).map(a => a.updated));
console.log('created values sample:', alerts.slice(0,3).map(a => a.created));
console.log('triggerCount values:', triggers);
console.log('lastTriggered values:', alerts.slice(0,3).map(a => a.lastTriggered));
console.log('name values:', alerts.slice(0,3).map(a => a.name));
