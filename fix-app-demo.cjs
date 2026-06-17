const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const demoFunction = `  const handleGenerateDemoDenda = () => {
    // Generate 10 late bookings based on the requirements
    const lateDurations = [2, 4, 6, 12, 24, 48, 2, 4, 6, 12];
    const newBookings = [...bookings];
    let addedCount = 0;
    
    // find cars
    const availableCars = cars.filter(c => c.status === 'tersedia');
    
    const generatedBookings = [];
    const generatedInvoices = [];

    const customer = users.find(u => u.role === 'customer') || { id: 'usr-1', name: 'Andi Saputra', phone: '0812345678' };
    
    for(let i=0; i<10; i++) {
      const durationHours = lateDurations[i];
      const car = availableCars[i % availableCars.length] || cars[0];
      const bookingId = "bk_late_" + Date.now() + "_" + i;
      const bookingCode = "BR-" + (1000 + i);
      
      const denda = durationHours * 50000;
      const statusDenda = i % 2 === 0 ? 'Belum Dibayar' : 'Sudah Dibayar';
      
      const now = new Date();
      
      // Target schedule was durationHours ago
      const scheduleEnd = new Date(now.getTime() - (durationHours * 60 * 60 * 1000));
      // Actual return is now
      const actualReturn = now;

      generatedBookings.push({
        id: bookingId,
        bookingCode,
        userId: customer.id,
        userNama: customer.name,
        userPhone: customer.phone,
        layanan: 'rental',
        mobilId: car.id,
        mobilNama: car.nama,
        tanggalMulai: new Date(scheduleEnd.getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString().substring(0, 10),
        tanggalSelesai: scheduleEnd.toISOString().substring(0, 10),
        tanggalKembaliAktual: actualReturn.toISOString().substring(0, 10),
        jamKembaliAktual: actualReturn.toTimeString().substring(0, 5),
        durasiHari: 2,
        denganDriver: false,
        totalSewa: car.harga * 2,
        denda: denda,
        statusDenda: statusDenda,
        totalBayar: (car.harga * 2) + (statusDenda === 'Sudah Dibayar' ? denda : 0),
        jumlahBayar: (car.harga * 2) + (statusDenda === 'Sudah Dibayar' ? denda : 0),
        status: 'Terlambat',
        tanggalBooking: new Date(scheduleEnd.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString()
      });

      generatedInvoices.push({
        id: "inv_late_" + Date.now() + "_" + i,
        bookingId: bookingId,
        invoiceNumber: "INV-" + bookingCode,
        tanggalMulai: new Date(scheduleEnd.getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString().substring(0, 10),
        tanggalSelesai: scheduleEnd.toISOString().substring(0, 10),
        subtotalRental: car.harga * 2,
        biayaDriver: 0,
        biayaTambahan: denda,
        totalTagihan: (car.harga * 2) + denda,
        status: statusDenda === 'Sudah Dibayar' ? 'Lunas' : 'Belum Lunas'
      });
      
      handleAddNotification({
        userId: 'user_admin_1',
        title: 'Pengembalian Terlambat',
        message: "Booking " + bookingCode + " terlambat dikembalikan " + durationHours + " jam.",
        type: 'warning'
      });
    }

    setBookings([...bookings, ...generatedBookings]);
    setInvoices([...invoices, ...generatedInvoices]);
    alert('Data Denda Keterlambatan berhasil digenerate!');
  };`;

content = content.replace(
  /const handleUpdateSettings = \(newSettings: SystemSettings\) => \{/,
  demoFunction + "\n\n  const handleUpdateSettings = (newSettings: SystemSettings) => {"
);

content = content.replace(
  /onUpdateReviews=\{setReviews\}\n\s*\/>/,
  "onUpdateReviews={setReviews}\n                    onGenerateDemoDenda={handleGenerateDemoDenda}\n                  />"
);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated');
