const fs = require('fs');

const dataFile = 'd:/remix_-autorent/src/data.ts';
let content = fs.readFileSync(dataFile, 'utf8');

// Fix the syntax errors caused by previous script
content = content.replace(/export const INITIAL_BOOKINGS: Booking\[\n/g, 'export const INITIAL_BOOKINGS: Booking[] = [\n');
content = content.replace(/export const INITIAL_PAYMENTS: Pembayaran\[\n/g, 'export const INITIAL_PAYMENTS: Pembayaran[] = [\n');
content = content.replace(/export const INITIAL_INVOICES: Invoice\[\n/g, 'export const INITIAL_INVOICES: Invoice[] = [\n');
content = content.replace(/export const INITIAL_MAINTENANCE: MaintenanceRecord\[\n/g, 'export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [\n');
content = content.replace(/export const INITIAL_REFUNDS: Refund\[\n/g, 'export const INITIAL_REFUNDS: Refund[] = [\n');
content = content.replace(/export const INITIAL_NOTIFICATIONS: AppNotification\[\n/g, 'export const INITIAL_NOTIFICATIONS: AppNotification[] = [\n');

// Update to v11 just in case
content = content.replace(/'autorent_initialized', 'v10'/g, "'autorent_initialized', 'v11'");
content = content.replace(/'autorent_initialized' === 'v10'/g, "'autorent_initialized' === 'v11'");
content = content.replace(/'v10'/g, "'v11'"); 

fs.writeFileSync(dataFile, content);

console.log('Fixed syntax errors and bumped to v11!');
