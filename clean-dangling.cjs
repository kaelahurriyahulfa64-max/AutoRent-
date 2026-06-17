const fs = require('fs');

const dataFile = 'd:/remix_-autorent/src/data.ts';
let content = fs.readFileSync(dataFile, 'utf8');

// The pattern is:
// ] = [
//   ...
// ];
// We want to replace "] = [\n anything until ];" with "];"

let changed = true;
while (changed) {
  const idx = content.indexOf('] = [');
  if (idx === -1) {
    changed = false;
    break;
  }
  
  const endIdx = content.indexOf('];', idx);
  if (endIdx !== -1) {
    content = content.substring(0, idx) + '];' + content.substring(endIdx + 2);
  } else {
    // Should not happen, but just break to prevent infinite loop
    changed = false;
  }
}

fs.writeFileSync(dataFile, content);
console.log('Dangling old arrays cleaned up!');
