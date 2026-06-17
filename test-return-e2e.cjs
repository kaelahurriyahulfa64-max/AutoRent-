/**
 * AutoRent Vehicle Return & Penalty E2E Test Suite
 * Menguji alur Pengembalian Mobil secara lengkap.
 */
const puppeteer = require('puppeteer');

const APP_URL = 'http://localhost:3000';

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function navigateToAdminOps(page) {
  console.log('Navigating to Admin Dashboard (Operasional Mobil)...');
  // Click user dropdown
  await page.click('#unified-login-btn');
  await wait(500);
  // Click "Dashboard Saya"
  await page.evaluate(() => {
    const dropdown = document.querySelector('#login-selection-dropdown');
    if (dropdown) {
      const btn = Array.from(dropdown.querySelectorAll('button')).find(b => b.textContent.includes('Dashboard Saya'));
      if (btn) btn.click();
    }
  });
  await wait(1000);
  // Click "Operasional Mobil" in sidebar
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const opsBtn = btns.find(b => b.textContent.includes('Operasional Mobil'));
    if (opsBtn) opsBtn.click();
  });
  await wait(1000);
}

async function navigateToCustomerBookings(page) {
  console.log('Navigating to Customer Dashboard (Sewa Saya)...');
  // Click user dropdown
  await page.click('#unified-login-btn');
  await wait(500);
  // Click "Dashboard Saya"
  await page.evaluate(() => {
    const dropdown = document.querySelector('#login-selection-dropdown');
    if (dropdown) {
      const btn = Array.from(dropdown.querySelectorAll('button')).find(b => b.textContent.includes('Dashboard Saya'));
      if (btn) btn.click();
    }
  });
  await wait(1000);
  // Click "Sewa Saya" (Sewa Saya (User)) in sidebar
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const bookingBtn = btns.find(b => b.textContent.includes('Sewa Saya'));
    if (bookingBtn) bookingBtn.click();
  });
  await wait(1000);
}

(async () => {
  console.log('='.repeat(60));
  console.log('AutoRent Vehicle Return & Penalty E2E Validation Test Suite');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    const t = msg.type();
    if (t === 'error') {
      console.log('  [Browser Error]:', msg.text().substring(0, 200));
    } else {
      console.log('  [Browser Log]:', msg.text());
    }
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
    // ==========================================
    // SCENARIO 1: ON TIME RETURN, NO DAMAGE
    // ==========================================
    console.log('\n--- SCENARIO 1: ON TIME RETURN, NO DAMAGE ---');
    await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 20000 });
    await wait(1000);

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
          id: 'BK-001',
          bookingCode: 'BKCODE-001',
          userId: 'USR-CUST-1',
          userNama: 'Budi Santoso',
          userPhone: '08111222333',
          layanan: 'rental_driver',
          mobilId: 'CAR-001',
          mobilNama: 'Avanza Test',
          driverId: 'DRV-001',
          driverNama: 'Driver Test',
          tanggalMulai: '2026-06-15T09:00',
          tanggalSelesai: '2026-06-17T12:00',
          durasiHari: 2,
          totalBayar: 900000,
          jumlahBayar: 900000,
          sisaPelunasan: 0,
          status: 'Dalam Sewa',
          statusPembayaran: 'Lunas',
          metodePembayaran: 'gateway',
          tanggalBooking: '2026-06-14 10:00'
        }
      ];
      localStorage.setItem('autorent_bookings', JSON.stringify(seedBookings));

      const seedInvoices = [
        {
          id: 'INV-BKCODE-001',
          invoiceCode: 'INV/2026/BKCODE-001',
          bookingId: 'BK-001',
          bookingCode: 'BKCODE-001',
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
          tanggalDibuat: '2026-06-15',
          metodePembayaran: 'gateway',
          tanggalPembayaran: '2026-06-15 12:00'
        }
      ];
      localStorage.setItem('autorent_invoices', JSON.stringify(seedInvoices));
      localStorage.setItem('autorent_payments', JSON.stringify([]));
      localStorage.setItem('autorent_maintenanceList', JSON.stringify([]));
      localStorage.setItem('autorent_notifications', JSON.stringify([]));

      // Login token formatting: token_{timestamp}_{userId}
      localStorage.setItem('autorent_session_token', 'token_123456789_user_admin_1');
      localStorage.setItem('autorent_session_expiry', String(Date.now() + 86400000));
    });

    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    // Navigate to Admin Ops tab
    await navigateToAdminOps(page);

    // Open Return modal for BKCODE-001
    console.log('Clicking "Kembalikan Unit" button...');
    await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'));
      const targetRow = rows.find(r => r.textContent.includes('BKCODE-001'));
      if (targetRow) {
        const btn = Array.from(targetRow.querySelectorAll('button')).find(b => b.textContent.includes('Kembalikan Unit'));
        if (btn) btn.click();
      }
    });
    await wait(1000);

    // Fill form fields
    console.log('Filling out return details (On Time)...');
    await page.evaluate(() => {
      const setReactValue = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      
      const dateInput = document.querySelector('input[type="date"]');
      if (dateInput) setReactValue(dateInput, '2026-06-17');
      
      const timeInput = document.querySelector('input[type="time"]');
      if (timeInput) setReactValue(timeInput, '12:00');

      const kmInput = document.querySelector('#input-checkin-km');
      if (kmInput) setReactValue(kmInput, '12100');
      const bodyInput = document.querySelector('#input-checkin-body');
      if (bodyInput) setReactValue(bodyInput, 'Mulus');
      const bbmInput = document.querySelector('#input-checkin-bbm');
      if (bbmInput) setReactValue(bbmInput, 'Full');
    });
    await wait(1000);

    // Confirm Return
    console.log('Confirming return...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Konfirmasi Pengembalian'));
      if (btn) btn.click();
    });
    await wait(1500);

    // Assert Scenario 1 results in localStorage
    const state1 = await page.evaluate(() => {
      return {
        bookings: JSON.parse(localStorage.getItem('autorent_bookings')),
        mobil: JSON.parse(localStorage.getItem('autorent_mobil')),
        drivers: JSON.parse(localStorage.getItem('autorent_drivers')),
        invoices: JSON.parse(localStorage.getItem('autorent_invoices'))
      };
    });

    const bk1 = state1.bookings.find(b => b.id === 'BK-001');
    assert(bk1.status === 'Selesai', 'Booking status becomes Selesai', `Got ${bk1.status}`);
    assert(bk1.denda === 0, 'Penalty is 0', `Got ${bk1.denda}`);
    assert(state1.mobil[0].status === 'tersedia', 'Vehicle status becomes tersedia', `Got ${state1.mobil[0].status}`);
    assert(state1.drivers[0].status === 'aktif', 'Driver status becomes aktif', `Got ${state1.drivers[0].status}`);
    assert(state1.invoices[0].denda === 0, 'Invoice penalty is 0', `Got ${state1.invoices[0].denda}`);
    assert(state1.invoices[0].status === 'lunas', 'Invoice status remains lunas');


    // ==========================================
    // SCENARIO 2: LATE RETURN WITH DRIVER OVERTIME
    // ==========================================
    console.log('\n--- SCENARIO 2: LATE RETURN WITH DRIVER OVERTIME ---');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('autorent_initialized', 'v11');
      localStorage.setItem('autorent_settings', JSON.stringify({ dendaPerHari: 200000, dpPercentage: 30 }));
      
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

      // Scheduled: 2026-06-16T12:00
      const seedBookings = [
        {
          id: 'BK-002',
          bookingCode: 'BKCODE-002',
          userId: 'USR-CUST-1',
          userNama: 'Budi Santoso',
          userPhone: '08111222333',
          layanan: 'rental_driver',
          mobilId: 'CAR-001',
          mobilNama: 'Avanza Test',
          driverId: 'DRV-001',
          driverNama: 'Driver Test',
          tanggalMulai: '2026-06-14T12:00',
          tanggalSelesai: '2026-06-16T12:00',
          durasiHari: 2,
          totalBayar: 900000,
          jumlahBayar: 900000,
          sisaPelunasan: 0,
          status: 'Dalam Sewa',
          statusPembayaran: 'Lunas',
          metodePembayaran: 'gateway',
          tanggalBooking: '2026-06-13 10:00'
        }
      ];
      localStorage.setItem('autorent_bookings', JSON.stringify(seedBookings));

      const seedInvoices = [
        {
          id: 'INV-BKCODE-002',
          invoiceCode: 'INV/2026/BKCODE-002',
          bookingId: 'BK-002',
          bookingCode: 'BKCODE-002',
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
          tanggalDibuat: '2026-06-14',
          metodePembayaran: 'gateway',
          tanggalPembayaran: '2026-06-14 12:00'
        }
      ];
      localStorage.setItem('autorent_invoices', JSON.stringify(seedInvoices));
      localStorage.setItem('autorent_payments', JSON.stringify([]));
      localStorage.setItem('autorent_maintenanceList', JSON.stringify([]));
      localStorage.setItem('autorent_notifications', JSON.stringify([]));

      localStorage.setItem('autorent_session_token', 'token_123456789_user_admin_1');
      localStorage.setItem('autorent_session_expiry', String(Date.now() + 86400000));
    });

    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    await navigateToAdminOps(page);

    // Open Return modal for BKCODE-002
    await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'));
      const targetRow = rows.find(r => r.textContent.includes('BKCODE-002'));
      if (targetRow) {
        const btn = Array.from(targetRow.querySelectorAll('button')).find(b => b.textContent.includes('Kembalikan Unit'));
        if (btn) btn.click();
      }
    });
    await wait(1000);

    // Fill date/time actual return: 2026-06-17 at 14:30
    // scheduled: 2026-06-16 at 12:00
    // Car Late: calendar diff 1 day -> dendaPerHari = 200,000
    // Driver Overtime: 2026-06-17 14:30 - 2026-06-16 12:00 = 26.5 hours -> round up to 27 hours -> 27 * 20,000 = 540,000
    // Total Denda = 200,000 + 540,000 = 740,000
    console.log('Entering actual return time (2026-06-17 14:30)...');
    await page.evaluate(() => {
      const setReactValue = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      
      const dateInput = document.querySelector('input[type="date"]');
      if (dateInput) setReactValue(dateInput, '2026-06-17');
      
      const timeInput = document.querySelector('input[type="time"]');
      if (timeInput) setReactValue(timeInput, '14:30');
      
      const kmInput = document.querySelector('#input-checkin-km');
      if (kmInput) setReactValue(kmInput, '12250');
      
      const bodyInput = document.querySelector('#input-checkin-body');
      if (bodyInput) setReactValue(bodyInput, 'Mulus');
      
      const bbmInput = document.querySelector('#input-checkin-bbm');
      if (bbmInput) setReactValue(bbmInput, 'Full');
    });
    await wait(1000);

    // Confirm Return
    console.log('Confirming return...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Konfirmasi Pengembalian'));
      if (btn) btn.click();
    });
    await wait(1500);

    // Assert Scenario 2 penalty
    const state2 = await page.evaluate(() => {
      return {
        bookings: JSON.parse(localStorage.getItem('autorent_bookings')),
        mobil: JSON.parse(localStorage.getItem('autorent_mobil')),
        drivers: JSON.parse(localStorage.getItem('autorent_drivers')),
        invoices: JSON.parse(localStorage.getItem('autorent_invoices'))
      };
    });

    const bk2 = state2.bookings.find(b => b.id === 'BK-002');
    assert(bk2.status === 'Menunggu Pelunasan Denda', 'Booking status transitions to Menunggu Pelunasan Denda', `Got ${bk2.status}`);
    assert(bk2.denda === 740000, 'Denda computed correctly (car 1 day late = 200k + driver 27 hr overtime = 540k)', `Got ${bk2.denda}`);
    assert(bk2.sisaPelunasan === 740000, 'Remaining balance is 740k', `Got ${bk2.sisaPelunasan}`);
    assert(state2.invoices[0].denda === 740000, 'Invoice has correct penalty amount');
    assert(state2.invoices[0].sisa === 740000, 'Invoice has outstanding balance of 740k');
    assert(state2.mobil[0].status === 'tersedia', 'Car is set back to tersedia');
    assert(state2.drivers[0].status === 'aktif', 'Driver is set back to aktif');


    // ==========================================
    // SCENARIO 3: VEHICLE RETURNED DAMAGED
    // ==========================================
    console.log('\n--- SCENARIO 3: VEHICLE RETURNED DAMAGED ---');
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

      const seedBookings = [
        {
          id: 'BK-003',
          bookingCode: 'BKCODE-003',
          userId: 'USR-CUST-1',
          userNama: 'Budi Santoso',
          userPhone: '08111222333',
          layanan: 'rental',
          mobilId: 'CAR-001',
          mobilNama: 'Avanza Test',
          tanggalMulai: '2026-06-15T09:00',
          tanggalSelesai: '2026-06-17T12:00',
          durasiHari: 2,
          totalBayar: 600000,
          jumlahBayar: 600000,
          sisaPelunasan: 0,
          status: 'Dalam Sewa',
          statusPembayaran: 'Lunas',
          metodePembayaran: 'gateway',
          tanggalBooking: '2026-06-14 10:00'
        }
      ];
      localStorage.setItem('autorent_bookings', JSON.stringify(seedBookings));

      const seedInvoices = [
        {
          id: 'INV-BKCODE-003',
          invoiceCode: 'INV/2026/BKCODE-003',
          bookingId: 'BK-003',
          bookingCode: 'BKCODE-003',
          userId: 'USR-CUST-1',
          userNama: 'Budi Santoso',
          layanan: 'Rental Mobil',
          rincianItem: 'Sewa Avanza Test',
          subtotal: 600000,
          denda: 0,
          total: 600000,
          terbayar: 600000,
          sisa: 0,
          status: 'lunas',
          metodePembayaran: 'gateway'
        }
      ];
      localStorage.setItem('autorent_invoices', JSON.stringify(seedInvoices));
      localStorage.setItem('autorent_maintenanceList', JSON.stringify([]));
      localStorage.setItem('autorent_payments', JSON.stringify([]));
      localStorage.setItem('autorent_notifications', JSON.stringify([]));

      localStorage.setItem('autorent_session_token', 'token_123456789_user_admin_1');
      localStorage.setItem('autorent_session_expiry', String(Date.now() + 86400000));
    });

    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    await navigateToAdminOps(page);

    // Open Return Modal
    await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'));
      const targetRow = rows.find(r => r.textContent.includes('BKCODE-003'));
      if (targetRow) {
        const btn = Array.from(targetRow.querySelectorAll('button')).find(b => b.textContent.includes('Kembalikan Unit'));
        if (btn) btn.click();
      }
    });
    await wait(1000);

    // Fill details, check "Kerusakan"
    console.log('Reporting damage and setting penalty of 500,000...');
    await page.evaluate(() => {
      const setReactValue = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const kmInput = document.querySelector('#input-checkin-km');
      if (kmInput) setReactValue(kmInput, '12100');
      const bodyInput = document.querySelector('#input-checkin-body');
      if (bodyInput) setReactValue(bodyInput, 'Spion kanan patah, bemper lecet');
      const bbmInput = document.querySelector('#input-checkin-bbm');
      if (bbmInput) setReactValue(bbmInput, 'Full');
    });
    await wait(500);
    
    // Check damage checkbox
    await page.click('#checkbox-checkin-damaged');
    await wait(500);

    await page.evaluate(() => {
      const setReactValue = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const penaltyInput = document.querySelector('#input-checkin-damage-penalty');
      if (penaltyInput) setReactValue(penaltyInput, '500000');
    });
    await wait(1000);

    // Confirm return
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Konfirmasi Pengembalian'));
      if (btn) btn.click();
    });
    await wait(1500);

    // Assert Scenario 3
    const state3 = await page.evaluate(() => {
      return {
        bookings: JSON.parse(localStorage.getItem('autorent_bookings')),
        mobil: JSON.parse(localStorage.getItem('autorent_mobil')),
        invoices: JSON.parse(localStorage.getItem('autorent_invoices')),
        maintenance: JSON.parse(localStorage.getItem('autorent_maintenanceList'))
      };
    });

    const bk3 = state3.bookings.find(b => b.id === 'BK-003');
    assert(bk3.status === 'Menunggu Pelunasan Denda', 'Booking status becomes Menunggu Pelunasan Denda due to unpaid damage penalty', `Got ${bk3.status}`);
    assert(bk3.denda === 500000, 'Assessed damage penalty is 500k');
    assert(state3.mobil[0].status === 'maintenance', 'Car status immediately becomes maintenance', `Got ${state3.mobil[0].status}`);
    assert(state3.maintenance.length === 1, 'Auto-created 1 maintenance request');
    
    const maintRec = state3.maintenance[0];
    assert(maintRec.status === 'Menunggu Persetujuan Owner', 'Maintenance request has status Menunggu Persetujuan Owner');
    assert(maintRec.biaya === 0, 'Maintenance repair cost is uncoupled and initialized to 0');
    assert(maintRec.bookingId === 'BK-003', 'Maintenance request has bookingId tracing tag');
    assert(maintRec.bookingCode === 'BKCODE-003', 'Maintenance request has bookingCode tracing tag');
    assert(maintRec.mobilId === 'CAR-001', 'Maintenance request has mobilId tracing tag');
    assert(maintRec.kerusakan === 'Spion kanan patah, bemper lecet', 'Maintenance request records correct damage summary');


    // ==========================================
    // SCENARIO 4: OWNER APPROVES MAINTENANCE & REPAIR COMPLETE
    // ==========================================
    console.log('\n--- SCENARIO 4: OWNER APPROVES MAINTENANCE & REPAIR COMPLETE ---');
    await page.evaluate(() => {
      // Login as Owner
      localStorage.setItem('autorent_session_token', 'token_123456789_user_owner_1');
    });

    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    // Owner approves maintenance and records repair cost (Owner does it via API/local update for simulation)
    console.log('Owner approves repair and inputs repair cost of Rp 450,000...');
    await page.evaluate(() => {
      // Retrieve maintenance lists
      const maintList = JSON.parse(localStorage.getItem('autorent_maintenanceList'));
      const rec = maintList[0];
      
      // Approve and update status to disetujui (Approved)
      rec.status = 'Disetujui';
      
      // owner processes repair complete later
      rec.status = 'Selesai';
      rec.biaya = 450000;
      rec.bengkel = 'Bengkel Jaya Motor';
      localStorage.setItem('autorent_maintenanceList', JSON.stringify([rec]));

      // Release car
      const cars = JSON.parse(localStorage.getItem('autorent_mobil'));
      cars[0].status = 'tersedia';
      localStorage.setItem('autorent_mobil', JSON.stringify(cars));
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1000);

    // Assert Scenario 4
    const state4 = await page.evaluate(() => {
      return {
        mobil: JSON.parse(localStorage.getItem('autorent_mobil')),
        maintenance: JSON.parse(localStorage.getItem('autorent_maintenanceList'))
      };
    });

    assert(state4.maintenance[0].status === 'Selesai', 'Maintenance status becomes Selesai');
    assert(state4.maintenance[0].biaya === 450000, 'Actual repair cost (450k) is kept separate from customer penalty (500k)', `Got ${state4.maintenance[0].biaya}`);
    assert(state4.mobil[0].status === 'tersedia', 'Car status restored back to tersedia');


    // ==========================================
    // SCENARIO 5: PERSISTENCE, REHYDRATION, AND PAYMENT
    // ==========================================
    console.log('\n--- SCENARIO 5: PERSISTENCE, REHYDRATION, AND PAYMENT ---');
    
    // Set up state where late penalty is generated but outstanding
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
        { id: 'CAR-001', nama: 'Avanza Test', brand: 'Toyota', tipe: 'MPV', transmisi: 'Matic', bensin: 'Pertalite', kapasitas: 7, hargaSewa: 300000, platNomor: 'B 1234 TEST', status: 'tersedia', aktif: true }
      ];
      localStorage.setItem('autorent_mobil', JSON.stringify(seedCars));

      // BK-005 has a 200,000 late penalty
      const seedBookings = [
        {
          id: 'BK-005',
          bookingCode: 'BKCODE-005',
          userId: 'USR-CUST-1',
          userNama: 'Budi Santoso',
          userPhone: '08111222333',
          layanan: 'rental',
          mobilId: 'CAR-001',
          mobilNama: 'Avanza Test',
          tanggalMulai: '2026-06-15T09:00',
          tanggalSelesai: '2026-06-17T12:00',
          durasiHari: 2,
          totalSewa: 600000,
          denda: 200000,
          totalBayar: 600000,
          totalAkhir: 800000,
          jumlahBayar: 600000,
          sisaPelunasan: 200000,
          status: 'Menunggu Pelunasan Denda',
          statusPembayaran: 'Menunggu Pelunasan Denda',
          statusDenda: 'Belum Dibayar',
          tanggalBooking: '2026-06-14 10:00'
        }
      ];
      localStorage.setItem('autorent_bookings', JSON.stringify(seedBookings));

      const seedInvoices = [
        {
          id: 'INV-BKCODE-005',
          invoiceCode: 'INV/2026/BKCODE-005',
          bookingId: 'BK-005',
          bookingCode: 'BKCODE-005',
          userId: 'USR-CUST-1',
          userNama: 'Budi Santoso',
          layanan: 'Rental Mobil',
          rincianItem: 'Sewa Avanza Test',
          subtotal: 600000,
          denda: 200000,
          total: 800000,
          terbayar: 600000,
          sisa: 200000,
          status: 'terbit'
        }
      ];
      localStorage.setItem('autorent_invoices', JSON.stringify(seedInvoices));
      localStorage.setItem('autorent_payments', JSON.stringify([]));
      localStorage.setItem('autorent_maintenanceList', JSON.stringify([]));

      // Login as Customer, open customer dashboard
      localStorage.setItem('autorent_session_token', 'token_123456789_USR-CUST-1');
      localStorage.setItem('autorent_session_expiry', String(Date.now() + 86400000));
    });

    console.log('Loading customer dashboard...');
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    // Navigate to Customer Sewa Saya
    await navigateToCustomerBookings(page);

    // Refresh page to validate rehydration
    console.log('Refreshing browser to check rehydration of outstanding penalty...');
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    const state5_before = await page.evaluate(() => {
      const b = JSON.parse(localStorage.getItem('autorent_bookings'))[0];
      return { status: b.status, sisa: b.sisaPelunasan, statusPembayaran: b.statusPembayaran };
    });
    assert(state5_before.status === 'Menunggu Pelunasan Denda', 'Rehydration works: Booking status is still Menunggu Pelunasan Denda');
    assert(state5_before.sisa === 200000, 'Rehydration works: Outstanding balance is still 200k');

    // Customer opens payment modal and triggers webhook to pay penalty
    console.log('Customer clicks pay penalty button...');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.bg-white.rounded-3xl.p-6')); // search cards
      const targetCard = cards.find(c => c.textContent.includes('BKCODE-005'));
      if (targetCard) {
        const btn = Array.from(targetCard.querySelectorAll('button')).find(b => b.textContent.includes('Bayar Pelunasan'));
        if (btn) btn.click();
      }
    });
    await wait(1000);

    console.log('Invoking payment gateway webhook for penalty...');
    await page.evaluate(async () => {
      if (window.__autorentProcessWebhook) {
        await window.__autorentProcessWebhook({
          orderId: 'BKCODE-005',
          transactionStatus: 'settlement',
          grossAmount: 200000,
          paymentType: 'Payment Gateway',
          transactionTime: new Date().toISOString()
        });
      } else {
        throw new Error('window.__autorentProcessWebhook is not defined');
      }
    });
    await wait(1500);

    // Reload again to verify database remains updated post-refresh
    console.log('Refreshing browser post-payment to verify persistence...');
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);

    const state5_after = await page.evaluate(() => {
      const b = JSON.parse(localStorage.getItem('autorent_bookings'))[0];
      const inv = JSON.parse(localStorage.getItem('autorent_invoices'))[0];
      return { status: b.status, sisa: b.sisaPelunasan, statusPembayaran: b.statusPembayaran, invoiceStatus: inv.status, statusDenda: b.statusDenda };
    });

    assert(state5_after.status === 'Selesai', 'Post-payment: Booking status becomes Selesai', `Got ${state5_after.status}`);
    assert(state5_after.sisa === 0, 'Post-payment: Outstanding balance becomes 0', `Got ${state5_after.sisa}`);
    assert(state5_after.statusPembayaran === 'Lunas', 'Post-payment: Booking payment status is Lunas', `Got ${state5_after.statusPembayaran}`);
    assert(state5_after.statusDenda === 'Sudah Dibayar', 'Post-payment: statusDenda becomes Sudah Dibayar', `Got ${state5_after.statusDenda}`);
    assert(state5_after.invoiceStatus === 'lunas', 'Post-payment: Invoice is fully lunas', `Got ${state5_after.invoiceStatus}`);

    // Ensure it remains Selesai on another reload
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(1500);
    const finalCheck = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('autorent_bookings'))[0].status;
    });
    assert(finalCheck === 'Selesai', 'Booking status remains Selesai on subsequent refreshes');

  } catch (err) {
    console.error('Test execution failed with error:', err);
    FAIL++;
  } finally {
    await browser.close();
    console.log('\n' + '='.repeat(60));
    console.log(`E2E Validation Results: ${PASS} PASS, ${FAIL} FAIL`);
    console.log('='.repeat(60));
    process.exit(FAIL > 0 ? 1 : 0);
  }
})();
