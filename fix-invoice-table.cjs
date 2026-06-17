const fs = require('fs');

let adminContent = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');

// Remove from Admin Invoice Table Headers
adminContent = adminContent.replace(
  /<th className="py-3 px-4 text-right">Sudah Dibayar<\/th>\s*<th className="py-3 px-4 text-right">Sisa Tagihan<\/th>\s*<th className="py-3 px-4">Status<\/th>/g,
  '<th className="py-3 px-4">Status</th>'
);

// Remove from Admin Invoice Table Row
adminContent = adminContent.replace(
  /<td className="py-3 px-4 font-mono font-bold text-emerald-600 text-right">\s*Rp \{inv\.jumlahBayar\.toLocaleString\('id-ID'\)\}\s*<\/td>\s*<td className="py-3 px-4 font-mono font-bold text-rose-600 text-right">\s*Rp \{remaining\.toLocaleString\('id-ID'\)\}\s*<\/td>/g,
  ''
);

fs.writeFileSync('src/components/DashboardAdmin.tsx', adminContent);
console.log('Fixed admin invoice table');
