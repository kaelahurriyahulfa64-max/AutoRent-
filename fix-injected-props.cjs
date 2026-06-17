const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix Booking object in handleGenerateDemoDenda
content = content.replace(/mobilFoto: car\.foto,\n\s*mobilPlat: car\.platNomor,/g, '');

// Fix Invoice object in handleGenerateDemoDenda
content = content.replace(/tanggalMulai: new Date.*,\n\s*tanggalSelesai: scheduleEnd.*,\n\s*tanggalInvoice: new Date\(\)\.toISOString\(\)/g, 'tanggalDibuat: new Date().toISOString().substring(0, 10)');

// Remove onGenerateDemoDenda from DashboardCustomer
content = content.replace(
  /<DashboardCustomer([^>]*?)onGenerateDemoDenda=\{handleGenerateDemoDenda\}([^>]*?)>/g,
  '<DashboardCustomer$1$2>'
);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed TS errors in injected function');
