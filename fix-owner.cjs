const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardOwner.tsx', 'utf8');

content = content.replace(
  "import { Booking, Invoice, Pembayaran, Mobil, Driver, User, Review, Refund } from '../types';",
  "import { Booking, Invoice, Pembayaran, Mobil, Driver, User, Review, Refund, MaintenanceRecord } from '../types';"
);

content = content.replace(
  "  refunds: Refund[];",
  "  refunds: Refund[];\n  maintenanceList: MaintenanceRecord[];\n  onUpdateMaintenanceList: (list: MaintenanceRecord[]) => void;"
);

content = content.replace(
  "  refunds,\n  onAddNotification,",
  "  refunds,\n  maintenanceList,\n  onUpdateMaintenanceList,\n  onAddNotification,"
);

fs.writeFileSync('src/components/DashboardOwner.tsx', content);
console.log('Fixed DashboardOwner.tsx props');
