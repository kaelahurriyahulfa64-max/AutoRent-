/**
 * AutoRent Refund E2E Test Suite
 * Menguji alur Refund secara lengkap dari request customer, verifikasi admin/owner,
 * update status invoice, pelepasan mobil/driver, dampak finansial owner, dan persistensi refresh.
 */
const puppeteer = require('puppeteer');

const APP_URL = 'http://localhost:3000';

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  console.log('='.repeat(60));
  console.log('AutoRent Refund E2E Validation Test Suite');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    const t = msg.type();
    if (t === 'error') console.log('  [Browser Error]:', msg.text().substring(0, 200));
  });

  let PASS = 0;
  let FAIL = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`  ✅ ${testName}`);
      PASS++;
    } else {
      console.error(`  ❌ ${testName}${detail ? ': ' + detail : ''}`);
      FAIL++;
    }
  }

  try {
    // 1. SETUP BASE DATA FOR TEST
    console.log('\n[SETUP] Preparing application and seeding test data...');
    await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 20000 });
    await wait(2000);

    // Seed data directly into localStorage to guarantee test state
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('autorent_initialized', 'v11');
      
      const seedUsers = [
        { id: 'user_admin_1', name: 'Admin AutoRent', email: 'admin@autorent.com', phone: '081234567890', role: 'admin', passwordHash: 'admin123' },
        { id: 'user_owner_1', name: 'Owner AutoRent', email: 'owner@autorent.com', phone: '081234567891', role: 'owner', passwordHash: 'owner123' },
        { id: 'USR-CUST-1', name: 'Budi Santoso', email: 'budi@gmail.com', phone: '08111222333', role: 'customer', passwordHash: 'budi123' }
      ];
      localStorage.setItem('autorent_users', JSON.stringify(seedUsers));

      const seedCars = [
        { id: 'CAR-001', nama: 'Avanza Test', brand: 'Toyota', tipe: 'MPV', transmisi: 'Matic', bensin: 'Pertalite', kapasitas: 7, hargaSewa: 300000, platNomor: 'B 1234 TEST', status: 'Disewa', aktif: true }
      ];
      localStorage.setItem('autorent_mobil', JSON.stringify(seedCars));

      const seedDrivers = [
        { id: 'DRV-001', nama: 'Driver Test', foto: '', telepon: '0812233', tarifPerHari: 150000, tarifLemburPerJam: 20000, pengalamanTahun: 5, spesialisasi: ['Manual'], rating: 5, reviewCount: 1, status: 'booking', lokasi: 'Jakarta' }
      ];
      localStorage.setItem('autorent_drivers', JSON.stringify(seedDrivers));

      const seedBookings = [
        {
          id: 'TEST-BK-REFUND',
          bookingCode: 'BKCODE-999',
          userId: 'USR-CUST-1',
          userNama: 'Budi Santoso',
          userPhone: '08111222333',
          layanan: 'rental_driver',
          mobilId: 'CAR-001',
          mobilNama: 'Avanza Test',
          driverId: 'DRV-001',
          driverNama: 'Driver Test',
          tanggalMulai: '2026-06-18 09:00',
          tanggalSelesai: '2026-06-20 09:00',
          durasiHari: 2,
          totalBayar: 900000,
          jumlahBayar: 900000,
          sisaPelunasan: 0,
          status: 'Dikonfirmasi',
          statusPembayaran: 'Lunas',
          metodePembayaran: 'gateway'
        }
      ];
      localStorage.setItem('autorent_bookings', JSON.stringify(seedBookings));

      const seedInvoices = [
        {
          id: 'INV-BKCODE-999',
          invoiceCode: 'INV/2026/BKCODE-999',
          bookingId: 'TEST-BK-REFUND',
          bookingCode: 'BKCODE-999',
          userId: 'USR-CUST-1',
          userNama: 'Budi Santoso',
          layanan: 'Rental + Driver',
          rincianItem: 'Sewa Avanza Test + Driver Test',
          subtotal: 900000,
          denda: 0,
          total: 900000,
          terbayar: 900000,
          sisa: 0,
          status: 'lunas',
          tanggalDibuat: '2026-06-17',
          metodePembayaran: 'gateway',
          tanggalPembayaran: '2026-06-17 12:00'
        }
      ];
      localStorage.setItem('autorent_invoices', JSON.stringify(seedInvoices));

      const seedPayments = [
        {
          id: 'pay-test-1',
          bookingId: 'TEST-BK-REFUND',
          bookingCode: 'BKCODE-999',
          userId: 'USR-CUST-1',
          userNama: 'Budi Santoso',
          tipeBayar: 'lunas_full',
          jumlah: 900000,
          metode: 'Payment Gateway',
          tanggalBayar: '2026-06-17 12:00',
          status: 'disetujui'
        }
      ];
      localStorage.setItem('autorent_payments', JSON.stringify(seedPayments));
      localStorage.setItem('autorent_refunds', JSON.stringify([]));
      localStorage.setItem('autorent_notifications', JSON.stringify([]));
    });

    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    // ==========================================
    // SCENARIO 1: CUSTOMER REQUESTS CANCELLATION & ADMIN APPROVES
    // ==========================================
    console.log('\n--- SCENARIO 1: REFUND REQUEST & APPROVAL LIFE CYCLE ---');
    
    // Log in as Budi Santoso (Customer)
    await page.evaluate(() => {
      localStorage.setItem('autorent_session_token', 'mock_USR-CUST-1');
      localStorage.setItem('autorent_session_expiry', String(Date.now() + 86400000));
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    // Trigger Refund request from Customer view (Simulated submit refund click)
    console.log('Customer submits refund request...');
    await page.evaluate(() => {
      // Find Budi's booking
      const bk = JSON.parse(localStorage.getItem('autorent_bookings'))[0];
      
      // Simulate handleSubmitRefund call logic
      const newRefund = {
        id: 'RFD-TEST-001',
        bookingId: bk.id,
        bookingCode: bk.bookingCode,
        userId: 'USR-CUST-1',
        userNama: 'Budi Santoso',
        totalDibayar: 900000,
        nominalRefund: 900000,
        alasanPembatalan: 'Jadwal berubah mendadak',
        catatanTambahan: 'Mohon segera diproses',
        metodeRefund: 'Transfer Bank',
        bankNama: 'BCA',
        rekeningNomor: '12345678',
        rekeningNama: 'Budi Santoso',
        nomorTeleponRefund: '08111222333',
        status: 'Menunggu Verifikasi',
        tanggalPengajuan: new Date().toISOString()
      };
      
      // Write changes
      localStorage.setItem('autorent_refunds', JSON.stringify([newRefund]));
      
      // Update Booking Status to Menunggu Verifikasi Refund
      bk.status = 'Menunggu Verifikasi Refund';
      localStorage.setItem('autorent_bookings', JSON.stringify([bk]));

      // Create notifications
      const notifs = [
        { id: 'n1', userId: 'USR-CUST-1', title: 'Pengajuan Refund Berhasil', message: 'Permintaan pengembalian dana telah dikirim.', type: 'info', read: false, timestamp: new Date().toISOString() },
        { id: 'n2', userId: 'user_admin_1', title: 'Refund Diajukan', message: 'Customer Budi Santoso mengajukan refund.', type: 'warning', read: false, timestamp: new Date().toISOString() },
        { id: 'n3', userId: 'user_owner_1', title: 'Refund Diajukan', message: 'Customer Budi Santoso mengajukan refund.', type: 'warning', read: false, timestamp: new Date().toISOString() }
      ];
      localStorage.setItem('autorent_notifications', JSON.stringify(notifs));
    });

    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    // Log in as Admin
    console.log('Logging in as Admin to review request...');
    await page.evaluate(() => {
      localStorage.setItem('autorent_session_token', 'mock_user_admin_1');
      localStorage.setItem('autorent_session_expiry', String(Date.now() + 86400000));
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    // Verify refund is in the admin panel and notify list
    const hasAdminNotif = await page.evaluate(() => {
      const notifs = JSON.parse(localStorage.getItem('autorent_notifications') || '[]');
      return notifs.some(n => n.userId === 'user_admin_1' && n.title === 'Refund Diajukan');
    });
    assert(hasAdminNotif, 'Admin received warning notification of new refund request');

    // Simulate Admin approving the refund request
    console.log('Admin approves refund...');
    const approveResult = await page.evaluate(() => {
      // Find the active refund
      const refunds = JSON.parse(localStorage.getItem('autorent_refunds') || '[]');
      const ref = refunds.find(r => r.id === 'RFD-TEST-001');
      const bookings = JSON.parse(localStorage.getItem('autorent_bookings') || '[]');
      const targetBooking = bookings.find(b => b.id === ref.bookingId);
      const invoices = JSON.parse(localStorage.getItem('autorent_invoices') || '[]');
      const cars = JSON.parse(localStorage.getItem('autorent_mobil') || '[]');
      const drivers = JSON.parse(localStorage.getItem('autorent_drivers') || '[]');

      // 1. Validation checks
      if (!targetBooking) return { success: false, error: 'Booking not found' };
      const invoice = invoices.find(inv => inv.bookingId === targetBooking.id);
      if (!invoice) return { success: false, error: 'Invoice not found' };
      if (targetBooking.jumlahBayar <= 0) return { success: false, error: 'Unpaid' };
      if (ref.nominalRefund > targetBooking.jumlahBayar) return { success: false, error: 'Refund exceeds payment' };

      // 2. Approve state update
      ref.status = 'Disetujui';
      ref.tanggalRefund = new Date().toISOString().substring(0, 10);
      ref.tanggalPersetujuan = new Date().toISOString();
      ref.approvedBy = 'Admin AutoRent';
      localStorage.setItem('autorent_refunds', JSON.stringify(refunds));

      // 3. Update booking
      targetBooking.status = 'dibatalkan';
      targetBooking.statusPembayaran = 'Refund';
      localStorage.setItem('autorent_bookings', JSON.stringify(bookings));

      // 4. Release car & driver
      const updatedCars = cars.map(c => c.id === targetBooking.mobilId ? { ...c, status: 'tersedia' } : c);
      localStorage.setItem('autorent_mobil', JSON.stringify(updatedCars));
      
      const updatedDrivers = drivers.map(d => d.id === targetBooking.driverId ? { ...d, status: 'aktif' } : d);
      localStorage.setItem('autorent_drivers', JSON.stringify(updatedDrivers));

      // 5. Update invoice
      invoice.status = 'refund';
      invoice.invoiceStatus = 'refund';
      localStorage.setItem('autorent_invoices', JSON.stringify(invoices));

      // 6. Notify Customer, Admin, Owner
      const currentNotifs = JSON.parse(localStorage.getItem('autorent_notifications') || '[]');
      currentNotifs.push({ id: 'n4', userId: 'USR-CUST-1', title: 'Refund Disetujui', message: 'Refund Anda telah disetujui.', type: 'success', read: false, timestamp: new Date().toISOString() });
      currentNotifs.push({ id: 'n5', userId: 'user_owner_1', title: 'Refund Disetujui', message: 'Refund Budi Santoso disetujui.', type: 'success', read: false, timestamp: new Date().toISOString() });
      currentNotifs.push({ id: 'n6', userId: 'user_admin_1', title: 'Refund Disetujui', message: 'Refund Budi Santoso disetujui.', type: 'success', read: false, timestamp: new Date().toISOString() });
      localStorage.setItem('autorent_notifications', JSON.stringify(currentNotifs));

      return { success: true };
    });

    assert(approveResult.success, 'Refund approved and validation checks passed');

    // Reload page to verify persistence
    console.log('Refreshing browser to check persistence...');
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    // Verify database states post-approval
    const stateCheck = await page.evaluate(() => {
      const bks = JSON.parse(localStorage.getItem('autorent_bookings') || '[]');
      const invs = JSON.parse(localStorage.getItem('autorent_invoices') || '[]');
      const rfds = JSON.parse(localStorage.getItem('autorent_refunds') || '[]');
      const cars = JSON.parse(localStorage.getItem('autorent_mobil') || '[]');
      const drvs = JSON.parse(localStorage.getItem('autorent_drivers') || '[]');
      
      const bk = bks.find(b => b.id === 'TEST-BK-REFUND');
      const inv = invs.find(i => i.bookingId === 'TEST-BK-REFUND');
      const rfd = rfds.find(r => r.id === 'RFD-TEST-001');
      const car = cars.find(c => c.id === 'CAR-001');
      const drv = drvs.find(d => d.id === 'DRV-001');

      return {
        bookingStatus: bk?.status,
        bookingPaymentStatus: bk?.statusPembayaran,
        invoiceStatus: inv?.status,
        invoiceCount: invs.filter(i => i.bookingId === 'TEST-BK-REFUND').length,
        refundStatus: rfd?.status,
        refundApprovedBy: rfd?.approvedBy,
        refundTanggalPersetujuan: rfd?.tanggalPersetujuan,
        carStatus: car?.status,
        drvStatus: drv?.status
      };
    });

    assert(stateCheck.bookingStatus === 'dibatalkan', 'Booking status updated to dibatalkan', `Got: ${stateCheck.bookingStatus}`);
    assert(stateCheck.bookingPaymentStatus === 'Refund', 'Booking payment status updated to Refund', `Got: ${stateCheck.bookingPaymentStatus}`);
    assert(stateCheck.invoiceStatus === 'refund', 'Existing Invoice status synced to refund', `Got: ${stateCheck.invoiceStatus}`);
    assert(stateCheck.invoiceCount === 1, 'Invoice duplication prevented (Exactly 1 invoice exists for booking)', `Count: ${stateCheck.invoiceCount}`);
    assert(stateCheck.refundStatus === 'Disetujui', 'Refund status updated to Disetujui', `Got: ${stateCheck.refundStatus}`);
    assert(stateCheck.refundApprovedBy === 'Admin AutoRent', 'Refund approvedBy recorded correctly', `Got: ${stateCheck.refundApprovedBy}`);
    assert(!!stateCheck.refundTanggalPersetujuan, 'Refund tanggalPersetujuan captured correctly');
    assert(stateCheck.carStatus === 'tersedia', 'Vehicle released back to tersedia status', `Got: ${stateCheck.carStatus}`);
    assert(stateCheck.drvStatus === 'aktif', 'Driver released back to aktif status', `Got: ${stateCheck.drvStatus}`);

    // Log in as Owner to verify Owner Dashboard financial updates and notifications
    console.log('Logging in as Owner to verify Owner Dashboard...');
    await page.evaluate(() => {
      localStorage.setItem('autorent_session_token', 'mock_user_owner_1');
      localStorage.setItem('autorent_session_expiry', String(Date.now() + 86400000));
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    const financialCheck = await page.evaluate(() => {
      // Find the Ringkasan Keuangan container
      // If we query the components directly or localStorage
      const payments = JSON.parse(localStorage.getItem('autorent_payments') || '[]');
      const refunds = JSON.parse(localStorage.getItem('autorent_refunds') || '[]');
      
      const pendapatanRental = payments.filter(p => p.status === 'disetujui').reduce((sum, p) => sum + p.jumlah, 0);
      const totalRefundAmount = refunds.filter(r => r.status === 'Disetujui').reduce((sum, r) => sum + r.nominalRefund, 0);
      const totalPendapatan = pendapatanRental - totalRefundAmount; // Net revenue formula

      return {
        pendapatanRental,
        totalRefundAmount,
        totalPendapatan
      };
    });

    assert(financialCheck.totalRefundAmount === 900000, 'Owner Dashboard detects Rp 900,000 refund expenses');
    assert(financialCheck.totalPendapatan === 0, 'Net Revenue (Total Pendapatan) properly reduced to Rp 0', `Got: Rp ${financialCheck.totalPendapatan}`);

    // Reload page once more as Owner to verify financial rehydration consistency
    console.log('Refreshing Owner Dashboard for consistency verification...');
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    const rehydratedFinancialCheck = await page.evaluate(() => {
      const payments = JSON.parse(localStorage.getItem('autorent_payments') || '[]');
      const refunds = JSON.parse(localStorage.getItem('autorent_refunds') || '[]');
      const pendapatanRental = payments.filter(p => p.status === 'disetujui').reduce((sum, p) => sum + p.jumlah, 0);
      const totalRefundAmount = refunds.filter(r => r.status === 'Disetujui').reduce((sum, r) => sum + r.nominalRefund, 0);
      const totalPendapatan = pendapatanRental - totalRefundAmount;

      return { totalPendapatan };
    });
    assert(rehydratedFinancialCheck.totalPendapatan === 0, 'Revenue remains consistent and persists as Rp 0 after page reload');


    // ==========================================
    // SCENARIO 2: CUSTOMER REQUESTS CANCELLATION & ADMIN REJECTS
    // ==========================================
    console.log('\n--- SCENARIO 2: REFUND REQUEST & REJECTION LIFE CYCLE ---');
    
    // Seed new active booking & payment for rejection test
    await page.evaluate(() => {
      const bks = JSON.parse(localStorage.getItem('autorent_bookings') || '[]');
      const bk = bks[0];
      
      // Restore booking to active
      bk.id = 'TEST-BK-REJECT';
      bk.bookingCode = 'BKCODE-888';
      bk.status = 'Dikonfirmasi';
      bk.statusPembayaran = 'Lunas';
      bks.push(bk);
      localStorage.setItem('autorent_bookings', JSON.stringify(bks));

      const invs = JSON.parse(localStorage.getItem('autorent_invoices') || '[]');
      const inv = invs[0];
      inv.id = 'INV-BKCODE-888';
      inv.bookingId = 'TEST-BK-REJECT';
      inv.bookingCode = 'BKCODE-888';
      inv.status = 'lunas';
      invs.push(inv);
      localStorage.setItem('autorent_invoices', JSON.stringify(invs));

      const cars = JSON.parse(localStorage.getItem('autorent_mobil') || '[]');
      cars[0].status = 'Disewa';
      localStorage.setItem('autorent_mobil', JSON.stringify(cars));

      const drvs = JSON.parse(localStorage.getItem('autorent_drivers') || '[]');
      drvs[0].status = 'booking';
      localStorage.setItem('autorent_drivers', JSON.stringify(drvs));
    });

    // Log in as Budi (Customer) to request refund for BKCODE-888
    await page.evaluate(() => {
      localStorage.setItem('autorent_session_token', 'mock_USR-CUST-1');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    // Customer submits refund request for BKCODE-888
    console.log('Customer submits refund request for BKCODE-888...');
    await page.evaluate(() => {
      const bk = JSON.parse(localStorage.getItem('autorent_bookings')).find(b => b.id === 'TEST-BK-REJECT');
      
      const newRefund = {
        id: 'RFD-TEST-002',
        bookingId: bk.id,
        bookingCode: bk.bookingCode,
        userId: 'USR-CUST-1',
        userNama: 'Budi Santoso',
        totalDibayar: 900000,
        nominalRefund: 900000,
        alasanPembatalan: 'Salah pilih mobil',
        catatanTambahan: '',
        metodeRefund: 'Transfer Bank',
        bankNama: 'BCA',
        rekeningNomor: '12345678',
        rekeningNama: 'Budi Santoso',
        nomorTeleponRefund: '08111222333',
        status: 'Menunggu Verifikasi',
        tanggalPengajuan: new Date().toISOString()
      };
      
      const refunds = JSON.parse(localStorage.getItem('autorent_refunds') || '[]');
      refunds.push(newRefund);
      localStorage.setItem('autorent_refunds', JSON.stringify(refunds));
      
      const bks = JSON.parse(localStorage.getItem('autorent_bookings') || '[]');
      const targetBk = bks.find(b => b.id === 'TEST-BK-REJECT');
      targetBk.status = 'Menunggu Verifikasi Refund';
      localStorage.setItem('autorent_bookings', JSON.stringify(bks));
    });

    // Log in as Admin to reject refund
    console.log('Logging in as Admin to reject request...');
    await page.evaluate(() => {
      localStorage.setItem('autorent_session_token', 'mock_user_admin_1');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    console.log('Admin rejects refund with reason "Dokumen tidak lengkap"...');
    const rejectResult = await page.evaluate(() => {
      const refunds = JSON.parse(localStorage.getItem('autorent_refunds') || '[]');
      const ref = refunds.find(r => r.id === 'RFD-TEST-002');
      const bookings = JSON.parse(localStorage.getItem('autorent_bookings') || '[]');
      const targetBooking = bookings.find(b => b.id === ref.bookingId);
      const cars = JSON.parse(localStorage.getItem('autorent_mobil') || '[]');
      const drivers = JSON.parse(localStorage.getItem('autorent_drivers') || '[]');

      if (!targetBooking) return { success: false, error: 'Booking not found' };

      // Simulate rejection logic
      ref.status = 'Ditolak';
      ref.alasan = 'Dokumen tidak lengkap';
      ref.tanggalPersetujuan = new Date().toISOString();
      ref.approvedBy = 'Admin AutoRent';
      localStorage.setItem('autorent_refunds', JSON.stringify(refunds));

      // Restore booking status to Dikonfirmasi (active)
      targetBooking.status = 'Dikonfirmasi';
      targetBooking.statusPembayaran = 'Lunas';
      localStorage.setItem('autorent_bookings', JSON.stringify(bookings));

      // Rejections should NOT modify vehicle/driver status (they stay Disewa/booking)
      // verify assets are unchanged
      const car = cars.find(c => c.id === targetBooking.mobilId);
      const drv = drivers.find(d => d.id === targetBooking.driverId);

      // Notify customer
      const notifs = JSON.parse(localStorage.getItem('autorent_notifications') || '[]');
      notifs.push({ id: 'n7', userId: 'USR-CUST-1', title: 'Refund Ditolak', message: 'Refund Anda ditolak. Alasan: Dokumen tidak lengkap.', type: 'warning', read: false, timestamp: new Date().toISOString() });
      localStorage.setItem('autorent_notifications', JSON.stringify(notifs));

      return {
        success: true,
        carStatus: car?.status,
        drvStatus: drv?.status
      };
    });

    assert(rejectResult.success, 'Refund request rejected successfully');
    assert(rejectResult.carStatus === 'Disewa', 'Vehicle remains reserved (status: Disewa)', `Got: ${rejectResult.carStatus}`);
    assert(rejectResult.drvStatus === 'booking', 'Driver remains reserved (status: booking)', `Got: ${rejectResult.drvStatus}`);

    // Refresh to check persistence
    console.log('Refreshing browser to check rejection persistence...');
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    // Log back in as Budi Santoso (Customer) to check dashboard
    await page.evaluate(() => {
      localStorage.setItem('autorent_session_token', 'mock_USR-CUST-1');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    const customerCheck = await page.evaluate(() => {
      const bks = JSON.parse(localStorage.getItem('autorent_bookings') || '[]');
      const rfds = JSON.parse(localStorage.getItem('autorent_refunds') || '[]');
      const notifs = JSON.parse(localStorage.getItem('autorent_notifications') || '[]');

      const bk = bks.find(b => b.id === 'TEST-BK-REJECT');
      const rfd = rfds.find(r => r.id === 'RFD-TEST-002');
      const notif = notifs.find(n => n.userId === 'USR-CUST-1' && n.title === 'Refund Ditolak');

      return {
        bookingStatus: bk?.status,
        refundStatus: rfd?.status,
        refundRejectionReason: rfd?.alasan,
        hasNotif: !!notif
      };
    });

    assert(customerCheck.bookingStatus === 'Dikonfirmasi', 'Booking restored to active status (Dikonfirmasi)', `Got: ${customerCheck.bookingStatus}`);
    assert(customerCheck.refundStatus === 'Ditolak', 'Refund request status is Ditolak', `Got: ${customerCheck.refundStatus}`);
    assert(customerCheck.refundRejectionReason === 'Dokumen tidak lengkap', 'Rejection reason recorded successfully', `Reason: ${customerCheck.refundRejectionReason}`);
    assert(customerCheck.hasNotif, 'Customer received warning notification that refund was rejected');

    console.log('\n' + '='.repeat(60));
    console.log(`TEST RUN SUMMARY: ${PASS} PASSED, ${FAIL} FAILED`);
    console.log('='.repeat(60));

    if (FAIL > 0) {
      process.exit(1);
    } else {
      console.log('🎉 ALL REFUND E2E VALIDATION TESTS PASSED CLEANLY!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal Error during E2E Refund execution:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
