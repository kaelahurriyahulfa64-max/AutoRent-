const fs = require('fs');

let adminContent = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');

// Fix the Clock import
adminContent = adminContent.replace(
  /import \{ Clock,\s*(Booking|Mobil|Driver)/g,
  `import { $1` // Revert accidental types import
);
if (!adminContent.includes('import { AlertCircle, Clock,')) {
  adminContent = adminContent.replace(
    /import \{ AlertCircle,([^}]*)\} from 'lucide-react';/,
    `import { AlertCircle, Clock, $1} from 'lucide-react';`
  );
}

fs.writeFileSync('src/components/DashboardAdmin.tsx', adminContent);

let customerContent = fs.readFileSync('src/components/DashboardCustomer.tsx', 'utf8');
customerContent = customerContent.replace(
  /statusDenda: dendaAuto > 0 \? 'Sudah Dibayar' : 'none'/g,
  "statusDenda: (dendaAuto > 0 ? 'Sudah Dibayar' : 'none') as 'Sudah Dibayar' | 'none'"
);

fs.writeFileSync('src/components/DashboardCustomer.tsx', customerContent);
console.log('Fixed TS errors again');
