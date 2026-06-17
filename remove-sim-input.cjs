const fs = require('fs');

const file = 'd:/remix_-autorent/src/components/LoginRegisterPage.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find and remove state declaration
const stateIndex = lines.findIndex(line => line.includes('const [registerSim, setRegisterSim] = useState('));
if (stateIndex !== -1) {
  lines.splice(stateIndex, 1);
  console.log('Removed state declaration');
}

// Find and remove object property assignment
const propIndex = lines.findIndex(line => line.includes('sim: registerSim.trim() || undefined'));
if (propIndex !== -1) {
  lines.splice(propIndex, 1);
  console.log('Removed property assignment');
}

// Find and remove state reset
const resetIndex = lines.findIndex(line => line.includes('setRegisterSim(\'\');'));
if (resetIndex !== -1) {
  lines.splice(resetIndex, 1);
  console.log('Removed state reset');
}

// Find and remove input block
const labelIndex = lines.findIndex(line => line.includes('>No SIM</label>'));
if (labelIndex !== -1) {
  const blockStart = labelIndex - 1; // <div className="space-y-1">
  let blockEnd = labelIndex;
  while (!lines[blockEnd].includes('</div>')) {
    blockEnd++;
  }
  lines.splice(blockStart, blockEnd - blockStart + 1);
  console.log('Removed input block');
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Done');
