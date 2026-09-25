const fs = require('fs');
const glob = require('glob'); // Note: we can use fs directly to walk
const { execSync } = require('child_process');

const files = execSync('grep -rlE "FlightStatusEnum|SeatStatusEnum" src test', { encoding: 'utf8' }).trim().split('\n');

for (const file of files) {
  if (!file) continue;
  let content = fs.readFileSync(file, 'utf8');
  // Replace imports from domain/enums to @domain
  content = content.replace(/from '.*\/domain\/enums\/(flight-status|seat-status)\.enum\.js';/g, "from '@domain/index.js';");
  content = content.replace(/from '@flights\/domain\/enums\/(flight-status|seat-status)\.enum\.js';/g, "from '@domain/index.js';");
  content = content.replace(/from '.*?@flights\/domain\/enums\/(flight-status|seat-status)\.enum\.js';/g, "from '@domain/index.js';");
  
  // also fix standard imports in frontend which don't have .js
  content = content.replace(/from '.*\/enums\/domain\.enums';/g, "from '@domain/index';");
  content = content.replace(/from '@core\/enums\/domain\.enums';/g, "from '@domain/index';");

  fs.writeFileSync(file, content);
}
console.log("Backend done");
