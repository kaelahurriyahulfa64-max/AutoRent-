const fs = require('fs');

let adminContent = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');

if (!adminContent.includes('Clock,')) {
  adminContent = adminContent.replace(
    /import \{\s*Plus,/,
    `import {\n  Clock, Plus,`
  );
}

fs.writeFileSync('src/components/DashboardAdmin.tsx', adminContent);
console.log('Fixed lucide import');
