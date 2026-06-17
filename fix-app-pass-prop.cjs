const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove from Navbar if it's there
content = content.replace(
  /onGenerateDemoDenda=\{handleGenerateDemoDenda\}/,
  ""
);

// Add to DashboardAdmin
content = content.replace(
  /onUpdateReviews=\{setReviews\}/,
  "onUpdateReviews={setReviews}\n                    onGenerateDemoDenda={handleGenerateDemoDenda}"
);

fs.writeFileSync('src/App.tsx', content);
console.log('Passed onGenerateDemoDenda to DashboardAdmin');
