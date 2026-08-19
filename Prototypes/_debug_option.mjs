import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, 'bo-prototype.html'), 'utf8');

const m = html.match(/const optionMasterGroups = (\[[\s\S]*?\]);/);
if (!m) {
  console.log('optionMasterGroups not found');
  process.exit(1);
}

let groups;
try {
  groups = eval(m[1]);
} catch (e) {
  console.log('eval error:', e.message);
  process.exit(1);
}

console.log('Groups:', groups.length);
let totalOptions = 0;
let totalActive = 0;
let totalInactive = 0;
for (const g of groups) {
  const opts = g.options.length;
  const active = g.options.filter(o => o.is_active).length;
  const inactive = opts - active;
  totalOptions += opts;
  totalActive += active;
  totalInactive += inactive;
  console.log(`  - ${g.group_id} | ${g.group} | multi=${g.allows_multi_select} | options=${opts} active=${active} inactive=${inactive}`);
}
console.log('Total options:', totalOptions);
console.log('Total active:', totalActive);
console.log('Total inactive:', totalInactive);
