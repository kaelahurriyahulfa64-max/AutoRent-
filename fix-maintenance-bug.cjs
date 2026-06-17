const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("setStoredState('maintenanceList', maintenanceList);")) {
  content = content.replace(
    /useEffect\(\(\) => \{\s*setStoredState\('reviews', reviews\);\s*\}, \[reviews\]\);/,
    `useEffect(() => {
    setStoredState('reviews', reviews);
  }, [reviews]);

  useEffect(() => {
    setStoredState('maintenanceList', maintenanceList);
  }, [maintenanceList]);`
  );
  
  fs.writeFileSync('src/App.tsx', content);
  console.log('Added useEffect for maintenanceList in App.tsx');
} else {
  console.log('useEffect already exists');
}
