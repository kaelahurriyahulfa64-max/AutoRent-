const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const demoFunction = `
  const handleGenerateDemoDenda = () => {
    handleTriggerActionLoading();
    
    // Create customer Andi Saputra if not exists
    let localUsers = [...users];
    let customerAndi = localUsers.find(u => u.name === 'Andi Saputra');
    if (!customerAndi) {
      customerAndi = {
        id: 'user_demo_' + Date.now(),
        name: 'Andi Saputra',
        email: 'andi.saputra@demo.com',
        phone: '081234567890',
        role: 'customer',
        password: 'password123',
        status: 'aktif'
      };
      localUsers.push(customerAndi);
      setUsers(localUsers);
    }

    const demoBookings: Booking[] = [];
    const generatedInvoices: Invoice[] = [];
    const pushNotifications: AppNotification[] = [];

    // Generate 10 late bookings
    const now = new Date();
    const delays = [2, 4, 6, 12, 24, 48, 6, 12, 2, 24]; // hours late
    
    // Pick first available car (Toyota Avanza ideally)
    const car = cars.find(c => c.nama.includes('Avanza')) || cars[0];

    for (let i = 0; i < 10; i++) {
      const delayHours = delays[i];
      const statusDendaValue = i % 2 === 0 ? 'Belum Dibayar' : 'Sudah Dibayar';
      
      const scheduleEnd = new Date(now.getTime() - (delayHours * 60 * 60 * 1000));
      const actualReturn = new Date();
      const dendaAmount = delayHours * 50000;
      
      const bookingId = "bk_late_" + Date.now() + "_" + i;
      const bookingCode = "BR-00" + (100 + i);

      demoBookings.push({
        id: bookingId,
        bookingCode: bookingCode,
        userId: customerAndi.id,
        userNama: customerAndi.name,
        mobilId: car.id,
        mobilNama: car.nama,
        mobilFoto: car.foto,
        mobilPlat: car.platNomor,
        tanggalMulai: new Date(scheduleEnd.getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString().replace('T', ' ').substring(0, 16),
        tanggalSelesai: scheduleEnd.toISOString().replace('T', ' ').substring(0, 16),
        durasiHari: 2,
        layanan: 'rental',
        totalBayar: car.harga * 2,
        jumlahBayar: car.harga * 2,
        sisaPelunasan: 0,
        statusPembayaran: 'Lunas',
        status: 'Terlambat',
        tanggalKembaliAktual: actualReturn.toISOString().replace('T', ' ').substring(0, 16),
        denda: dendaAmount,
        statusDenda: statusDendaValue,
        tanggalBooking: new Date(scheduleEnd.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString().replace('T', ' ').substring(0, 16)
      });

      generatedInvoices.push({
        id: "inv_late_" + Date.now() + "_" + i,
        bookingId: bookingId,
        invoiceCode: "INV/" + new Date().getFullYear() + "/" + Date.now().toString().slice(-6) + i,
        bookingCode: bookingCode,
        userId: customerAndi.id,
        userNama: customerAndi.name,
        layanan: 'rental',
        rincianItem: car.nama + " (2 Hari)",
        subtotal: car.harga * 2,
        denda: dendaAmount,
        biayaTambahan: 0,
        total: (car.harga * 2) + dendaAmount,
        totalAkhir: (car.harga * 2) + dendaAmount,
        terbayar: statusDendaValue === 'Sudah Dibayar' ? ((car.harga * 2) + dendaAmount) : (car.harga * 2),
        sisa: statusDendaValue === 'Sudah Dibayar' ? 0 : dendaAmount,
        status: statusDendaValue === 'Sudah Dibayar' ? 'lunas' : 'dp_lunas',
        tanggalMulai: new Date(scheduleEnd.getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
        tanggalSelesai: scheduleEnd.toISOString(),
        tanggalInvoice: new Date().toISOString()
      });

      // Admin notification
      pushNotifications.push({
        id: "nt_late_" + Date.now() + "_" + i,
        userId: 'admin', // assuming admin receives this
        title: 'Keterlambatan Kendaraan',
        message: \`Booking \${bookingCode} terlambat dikembalikan \${delayHours} jam.\`,
        type: 'warning',
        read: false,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });
    }

    setBookings(prev => [...demoBookings, ...prev]);
    setInvoices(prev => [...generatedInvoices, ...prev]);
    setNotifications(prev => [...pushNotifications, ...prev]);
    
    showToast('10 Data Demo Denda Keterlambatan berhasil ditambahkan!', 'success');
  };
`;

if (!content.includes('handleGenerateDemoDenda')) {
  content = content.replace(
    /\/\/ Cek apakah ada booking yang tertunda karena belum login/,
    demoFunction + '\n\n  // Cek apakah ada booking yang tertunda karena belum login'
  );
  
  // Now pass it down to Navbar and DashboardAdmin
  content = content.replace(
    /cart=\{cart\}\n\s*customerActiveSubTab=\{customerActiveSubTab\}\n\s*setCustomerActiveSubTab=\{setCustomerActiveSubTab\}/,
    `cart={cart}\n            customerActiveSubTab={customerActiveSubTab}\n            setCustomerActiveSubTab={setCustomerActiveSubTab}\n            onGenerateDemoDenda={handleGenerateDemoDenda}`
  );
  
  fs.writeFileSync('src/App.tsx', content);
  console.log('Injected handleGenerateDemoDenda to App.tsx');
} else {
  console.log('Already exists');
}
