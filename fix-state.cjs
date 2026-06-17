const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');

content = content.replace(
  /const \[walkInMetodeBayar, setWalkInMetodeBayar\] = useState\w*<[^>]+>\('[^']+'\);/,
  `const [walkInMetodeBayar, setWalkInMetodeBayar] = useState<'Transfer' | 'QRIS' | 'Cash'>('Transfer');
  const [walkInJenisPembayaran, setWalkInJenisPembayaran] = useState<'lunas' | 'dp'>('lunas');
  const [walkInDPNominal, setWalkInDPNominal] = useState<number>(0);`
);

fs.writeFileSync('src/components/DashboardAdmin.tsx', content);
