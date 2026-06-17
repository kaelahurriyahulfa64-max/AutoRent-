const fs = require('fs');
const file = 'd:/remix_-autorent/src/components/DashboardAdmin.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  '<option value="QRIS">QRIS Dinamis</option>',
  '<option value="QRIS">QRIS Dinamis</option>\n                        <option value="Cash">Cash / Tunai</option>'
);
fs.writeFileSync(file, content);
console.log('Fixed Cash option');
