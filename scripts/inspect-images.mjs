import fs from 'fs';
const buf = fs.readFileSync('deliverables/appstore-screenshots/screenshot_1.png');
console.log('PNG width:', buf.readUInt32BE(16), 'height:', buf.readUInt32BE(20));
