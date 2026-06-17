const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the generatedInvoices logic to match Invoice type
content = content.replace(
  /generatedInvoices\.push\(\{\s*id: "inv_late_" \+ Date\.now\(\) \+ "_" \+ i,\s*bookingId: bookingId,\s*invoiceNumber: "INV-" \+ bookingCode,\s*tanggalMulai: new Date\(scheduleEnd\.getTime\(\) - \(2 \* 24 \* 60 \* 60 \* 1000\)\)\.toISOString\(\)\.substring\(0, 10\),\s*tanggalSelesai: scheduleEnd\.toISOString\(\)\.substring\(0, 10\),\s*subtotalRental: car\.harga \* 2,\s*biayaDriver: 0,\s*biayaTambahan: denda,\s*totalTagihan: \(car\.harga \* 2\) \+ denda,\s*status: statusDenda === 'Sudah Dibayar' \? 'Lunas' : 'Belum Lunas'\s*\}\);/g,
  `generatedInvoices.push({
        id: "inv_late_" + Date.now() + "_" + i,
        bookingId: bookingId,
        invoiceCode: "INV/" + new Date().getFullYear() + "/" + Date.now().toString().slice(-6),
        bookingCode: bookingCode,
        userId: customer.id,
        userNama: customer.name,
        layanan: 'rental',
        rincianItem: car.nama + " (2 Hari)",
        subtotal: car.harga * 2,
        denda: denda,
        biayaTambahan: 0,
        total: (car.harga * 2) + denda,
        totalAkhir: (car.harga * 2) + denda,
        terbayar: statusDenda === 'Sudah Dibayar' ? ((car.harga * 2) + denda) : (car.harga * 2),
        sisa: statusDenda === 'Sudah Dibayar' ? 0 : denda,
        status: statusDenda === 'Sudah Dibayar' ? 'lunas' : 'dp_lunas',
        tanggalMulai: new Date(scheduleEnd.getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
        tanggalSelesai: scheduleEnd.toISOString(),
        tanggalInvoice: new Date().toISOString()
      });`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed Invoice fields in App.tsx');
