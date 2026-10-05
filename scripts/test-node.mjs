import fs from 'fs';
console.log('NODE IS WORKING!');
fs.writeFileSync('deliverables/test-output.txt', 'HELLO FROM NODE ' + new Date().toISOString());
console.log('FILE WRITTEN SUCCESSFULLY');
