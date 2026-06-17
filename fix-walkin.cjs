const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');

// Add states for walk-in DP
content = content.replace(
  /const \[walkInMetodeBayar, setWalkInMetodeBayar\] = useState<'gateway' \| 'manual'>\('manual'\);/,
  `const [walkInMetodeBayar, setWalkInMetodeBayar] = useState<'gateway' | 'manual'>('manual');
  const [walkInJenisPembayaran, setWalkInJenisPembayaran] = useState<'lunas' | 'dp'>('lunas');
  const [walkInDPNominal, setWalkInDPNominal] = useState<number>(0);`
);

// Update handleWalkInSubmit logic
content = content.replace(
  /const totalBayar = totalMobil \+ totalDriver;\s*\/\/ Buat User Guest \(Walk-in\)/,
  `const totalBayar = totalMobil + totalDriver;
  
      let jumlahBayarAwal = totalBayar;
      let statusPemb = 'Lunas';
      
      if (walkInJenisPembayaran === 'dp') {
        jumlahBayarAwal = walkInDPNominal > 0 ? walkInDPNominal : totalBayar * (settings.dpPercentage / 100);
        statusPemb = 'DP Dibayar';
      }
  
      // Buat User Guest (Walk-in)`
);

// Update newBooking in handleWalkInSubmit
content = content.replace(
  /jumlahBayar: totalBayar,\s*statusPembayaran: 'Lunas',\s*status: 'Aktif',/,
  `jumlahBayar: jumlahBayarAwal,
        statusPembayaran: statusPemb as any,
        status: 'Menunggu Pengambilan',`
);

// Update status armada/driver in handleWalkInSubmit
content = content.replace(
  /\/\/ Update Status Armada\/Driver\s*if \(mobil\) \{\s*const updatedCars = allCars\.map\(c => c\.id === mobil\.id \? \{ \.\.\.c, status: 'disewa' as 'disewa' \} : c\);\s*onUpdateCars\(updatedCars\);\s*\}\s*if \(driver\) \{\s*const updatedDrivers = allDrivers\.map\(d => d\.id === driver\.id \? \{ \.\.\.d, status: 'booking' as 'booking' \} : d\);\s*onUpdateDrivers\(updatedDrivers\);\s*\}/,
  `// Note: Mobil/Driver status is NOT automatically set to 'disewa' yet, because they need to go through Serah Terima (Handover) first just like Booking Online.`
);

// Update newInvoice in handleWalkInSubmit
content = content.replace(
  /total: totalBayar,\s*status: 'Lunas',\s*keterangan: `Pembayaran \$\{walkInMetodeBayar\} \(Walk-in\)`/,
  `total: totalBayar,
        status: statusPemb as any,
        keterangan: \`Pembayaran \${walkInJenisPembayaran === 'dp' ? 'DP' : 'Lunas'} \${walkInMetodeBayar} (Walk-in)\`,
        subtotal: totalBayar,
        denda: 0`
);

// Update newPayment in handleWalkInSubmit
content = content.replace(
  /jumlah: totalBayar,\s*metode: walkInMetodeBayar,\s*status: 'disetujui',\s*tanggalBayar: new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\],\s*tipeBayar: 'lunas'/,
  `jumlah: jumlahBayarAwal,
        metode: walkInMetodeBayar,
        status: 'disetujui',
        tanggalBayar: new Date().toISOString().split('T')[0],
        tipeBayar: walkInJenisPembayaran === 'dp' ? 'dp' : 'pelunasan'`
);

// Update the Walk-In Reset Form to also reset new states
content = content.replace(
  /setWalkInMetodeBayar\('manual'\);/,
  `setWalkInMetodeBayar('manual');
      setWalkInJenisPembayaran('lunas');
      setWalkInDPNominal(0);`
);

fs.writeFileSync('src/components/DashboardAdmin.tsx', content);
console.log('Fixed handleWalkInSubmit');
