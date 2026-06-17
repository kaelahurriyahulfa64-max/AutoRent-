const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');

// Fix missing Clock import
if (!content.includes('Clock,')) {
  content = content.replace(
    /import \{ AlertCircle,/,
    `import { AlertCircle, Clock,`
  );
  if (!content.includes('Clock,')) {
     content = content.replace(/import \{/, `import { Clock,`)
  }
}

// Fix missing onGenerateDemoDenda destructuring
// I will just add it directly before onAddNotification.
content = content.replace(
  /onUpdateReviews,\s+onAddNotification,/,
  `onUpdateReviews,
    onGenerateDemoDenda,
    onAddNotification,`
);

fs.writeFileSync('src/components/DashboardAdmin.tsx', content);
console.log('Fixed DashboardAdmin.tsx again');
