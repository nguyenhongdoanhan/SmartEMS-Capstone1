/**
 * Audit icon Ionicons dùng trong code vs glyphmap thực tế của @expo/vector-icons.
 * Chạy: node scripts/check-icons-g4.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ICONS = [
  'search', 'close-circle', 'cloud-offline-outline', 'search-outline',
  'warning-outline', 'medical', 'call', 'navigate-outline', 'time-outline',
  'information-circle-outline', 'location-outline', 'chevron-forward',
  'medkit-outline', 'business-outline', 'notifications-outline', 'home',
  'home-outline', 'person', 'person-outline',
];

const glyphmapPath = path.join(ROOT, 'node_modules', '@expo/vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'glyphmaps', 'Ionicons.json');
const glyphmap = JSON.parse(fs.readFileSync(glyphmapPath, 'utf8'));

let fail = 0;
for (const name of ICONS) {
  const ok = glyphmap[name] !== undefined;
  if (!ok) fail += 1;
  console.log(`${ok ? 'OK ' : 'MISSING'}  ${name}`);
}
console.log(fail === 0 ? 'ALL OK' : `${fail} icon(s) MISSING`);
process.exit(fail === 0 ? 0 : 1);
