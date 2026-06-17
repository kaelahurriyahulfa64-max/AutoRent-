const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  useEffect(() => {
    setStoredState('maintenanceList', maintenanceList);
  }, [maintenanceList]);`;

const replacementStr = `  useEffect(() => {
    setStoredState('maintenanceList', maintenanceList);
  }, [maintenanceList]);

  useEffect(() => {
    setStoredState('cart', cart);
  }, [cart]);`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Fixed cart bug.');
} else {
  console.log('Target string not found.');
}
