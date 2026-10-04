import fs from 'fs';
import path from 'path';

const files = [
  'deliverables/Univerza_Tukdaeng_User_Manual.html',
  'deliverables/Univerza_Tukdaeng_User_Manual.pdf',
  'deliverables/manual-previews/page-1.png',
  'deliverables/manual-previews/page-3.png',
  'deliverables/manual-previews/page-4.png'
];

let out = '';
for (const f of files) {
  if (fs.existsSync(f)) {
    const stat = fs.statSync(f);
    out += `${f}: mtime = ${stat.mtime.toISOString()}, size = ${stat.size} bytes\n`;
  } else {
    out += `${f}: NOT FOUND\n`;
  }
}

fs.writeFileSync('deliverables/times-check.txt', out, 'utf8');
console.log('Done checking times');
