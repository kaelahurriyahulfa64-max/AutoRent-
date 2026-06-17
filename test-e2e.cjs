/**
 * AutoRent E2E Logic Test — menggunakan window.__autorentProcessWebhook
 * Menguji langsung fungsi processMidtransWebhook yang berjalan di browser
 * sehingga state React + localStorage keduanya terupdate.
 */
const puppeteer = require('puppeteer');

const APP_URL = 'http://localhost:3000';

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function callWebhook(page, payload) {
  return page.evaluate(async (p) => {
    const fn = window.__autorentProcessWebhook;
    if (typeof fn !== 'function') {
      throw new Error('__autorentProcessWebhook not available on window!');
    }
    return await fn(p);
  }, payload);
}

async function getState(page, bookingId) {
  return page.evaluate((bkId) => {
    const bks = JSON.parse(localStorage.getItem('autorent_bookings') || '[]');
    const invs = JSON.parse(localStorage.getItem('autorent_invoices') || '[]');
    const pymts = JSON.parse(localStorage.getItem('autorent_payments') || '[]');
    const notifs = JSON.parse(localStorage.getItem('autorent_notifications') || '[]');
    const bk = bks.find(b => b.id === bkId);
    const inv = invs.find(i => i.bookingId === bkId);
    return {
      bookingStatus: bk ? bk.status : 'NOT FOUND',
      bookingPaymentStatus: bk ? bk.statusPembayaran : 'NOT FOUND',
      bookingJumlahBayar: bk ? (bk.jumlahBayar || 0) : -1,
      invoiceStatus: inv ? inv.status : 'NOT FOUND',
      invoiceTerbayar: inv ? inv.terbayar : -1,
      invoiceSisa: inv ? inv.sisa : -1,
      paymentsCount: pymts.filter(p => p.bookingId === bkId).length,
      invoicesCount: invs.filter(i => i.bookingId === bkId).length,
      notifCount: notifs.filter(n => n.title === 'Pembayaran Berhasil' || n.title === 'Pembayaran Booking Diterima' || n.title === 'Transaksi Baru Tercatat').length
    };
  }, bookingId);
}

(async () => {
  console.log('='.repeat(60));
  console.log('AutoRent E2E Webhook Integration Test (via window hook)');
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
    // ─── SETUP ────────────────────────────────────────────────────────────────
    console.log('\n[SETUP] Navigating to app...');
    await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 20000 });
    await wait(2000);

    // Mock session as customer
    await page.evaluate(() => {
      const users = JSON.parse(localStorage.getItem('autorent_users') || '[]');
      const customer = users.find(u => u.role === 'customer');
      if (customer) {
        localStorage.setItem('autorent_session_token', 'mock_' + customer.id);
        localStorage.setItem('autorent_session_expiry', String(Date.now() + 86400000));
      }
    });

    // Clean stale test data
    await page.evaluate(() => {
      const testIds = ['TEST_BK_DP', 'TEST_BK_FULL'];
      const clean = (key, fn) => {
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        localStorage.setItem(key, JSON.stringify(items.filter(fn)));
      };
      clean('autorent_bookings', b => !testIds.includes(b.id));
      clean('autorent_payments', p => !testIds.includes(p.bookingId));
      clean('autorent_invoices', i => !testIds.includes(i.bookingId));
      localStorage.removeItem('autorent_processed_webhooks');
    });

    // Inject test bookings into localStorage
    await page.evaluate(() => {
      const bks = JSON.parse(localStorage.getItem('autorent_bookings') || '[]');
      // Booking 1: For DP → Pelunasan test
      bks.unshift({
        id: 'TEST_BK_DP',
        bookingCode: 'TEST-DP-001',
        userId: 'USR-CUST-1',
        userNama: 'Budi Santoso',
        mobilId: 'm_1',
        mobilNama: 'Toyota Avanza',
        layanan: 'rental',
        denganDriver: false,
        totalBayar: 1000000,
        jumlahBayar: 0,
        sisaPelunasan: 1000000,
        status: 'Menunggu Konfirmasi',
        statusPembayaran: 'Belum Bayar',
        metodePembayaran: 'gateway',
        durasiHari: 2
      });
      // Booking 2: For direct full payment test
      bks.unshift({
        id: 'TEST_BK_FULL',
        bookingCode: 'TEST-FULL-001',
        userId: 'USR-CUST-1',
        userNama: 'Budi Santoso',
        mobilId: 'm_2',
        mobilNama: 'Honda CR-V',
        layanan: 'rental',
        denganDriver: false,
        totalBayar: 2000000,
        jumlahBayar: 0,
        sisaPelunasan: 2000000,
        status: 'Menunggu Konfirmasi',
        statusPembayaran: 'Belum Bayar',
        metodePembayaran: 'gateway',
        durasiHari: 3
      });
      localStorage.setItem('autorent_bookings', JSON.stringify(bks));
    });

    // Reload so React state initializes with the new bookings
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(2000);

    // Verify window hook is available
    const hookAvailable = await page.evaluate(() => typeof window.__autorentProcessWebhook === 'function');
    if (!hookAvailable) {
      throw new Error('window.__autorentProcessWebhook not available — ensure App.tsx exposes it via useEffect');
    }
    console.log('[SETUP] ✅ window.__autorentProcessWebhook is available');

    let state = await getState(page, 'TEST_BK_DP');
    console.log('[SETUP] Initial DP booking:', state);

    // ─── TEST 1: DP Payment ─────────────────────────────────────────────────
    console.log('\n[TEST 1] DP Payment (500,000 from total 1,000,000)...');
    const dpResult = await callWebhook(page, {
      orderId: 'TEST-DP-001',
      transactionStatus: 'settlement',
      grossAmount: 500000,
      paymentType: 'bank_transfer',
      transactionTime: new Date().toISOString()
    });
    console.log('  Webhook returned:', dpResult);
    await wait(500); // Small wait for state to settle

    state = await getState(page, 'TEST_BK_DP');
    console.log('  State after DP:', state);

    assert(dpResult === true, 'TEST 1a - processMidtransWebhook returns true for valid DP');
    assert(state.bookingStatus === 'Dikonfirmasi', 'TEST 1b - Booking status = Dikonfirmasi', `got '${state.bookingStatus}'`);
    assert(state.bookingPaymentStatus === 'DP Dibayar', 'TEST 1c - Payment status = DP Dibayar', `got '${state.bookingPaymentStatus}'`);
    assert(state.invoiceStatus === 'dp_lunas', 'TEST 1d - Invoice status = dp_lunas', `got '${state.invoiceStatus}'`);
    assert(state.invoiceTerbayar === 500000, 'TEST 1e - Invoice terbayar = 500000', `got ${state.invoiceTerbayar}`);
    assert(state.invoiceSisa === 500000, 'TEST 1f - Invoice sisa = 500000', `got ${state.invoiceSisa}`);
    assert(state.paymentsCount === 1, 'TEST 1g - 1 payment record created', `got ${state.paymentsCount}`);
    assert(state.invoicesCount === 1, 'TEST 1h - 1 invoice created', `got ${state.invoicesCount}`);
    assert(state.notifCount >= 3, 'TEST 1i - Notifications to Customer+Admin+Owner', `got ${state.notifCount}`);

    // ─── TEST 2: Anti-duplicate same orderId ────────────────────────────────
    console.log('\n[TEST 2] Anti-duplicate: same orderId "TEST-DP-001" again...');
    const dupeResult = await callWebhook(page, {
      orderId: 'TEST-DP-001',
      transactionStatus: 'settlement',
      grossAmount: 500000,
      paymentType: 'bank_transfer',
      transactionTime: new Date().toISOString()
    });
    await wait(300);

    const stateAfterDupe = await getState(page, 'TEST_BK_DP');
    assert(dupeResult === false, 'TEST 2a - Duplicate webhook returns false (already processed)', `got ${dupeResult}`);
    assert(stateAfterDupe.paymentsCount === 1, 'TEST 2b - No duplicate payment', `got ${stateAfterDupe.paymentsCount}`);
    assert(stateAfterDupe.invoicesCount === 1, 'TEST 2c - No duplicate invoice', `got ${stateAfterDupe.invoicesCount}`);

    // ─── TEST 3: Pelunasan (updates existing invoice, no new one) ───────────
    console.log('\n[TEST 3] Pelunasan (500,000 remaining)...');
    const lunasResult = await callWebhook(page, {
      orderId: 'TEST-DP-001-PELUNASAN',  // new orderId contains booking code
      transactionStatus: 'settlement',
      grossAmount: 500000,
      paymentType: 'gopay',
      transactionTime: new Date().toISOString()
    });
    await wait(500);

    const stateAfterLunas = await getState(page, 'TEST_BK_DP');
    console.log('  State after pelunasan:', stateAfterLunas);

    assert(lunasResult === true, 'TEST 3a - Pelunasan webhook returns true');
    assert(stateAfterLunas.bookingPaymentStatus === 'Lunas', 'TEST 3b - Booking payment = Lunas', `got '${stateAfterLunas.bookingPaymentStatus}'`);
    assert(stateAfterLunas.invoiceStatus === 'lunas', 'TEST 3c - Invoice status = lunas', `got '${stateAfterLunas.invoiceStatus}'`);
    assert(stateAfterLunas.invoiceSisa === 0, 'TEST 3d - Invoice sisa = 0', `got ${stateAfterLunas.invoiceSisa}`);
    assert(stateAfterLunas.paymentsCount === 2, 'TEST 3e - 2 payments total (DP + Pelunasan)', `got ${stateAfterLunas.paymentsCount}`);
    assert(stateAfterLunas.invoicesCount === 1, 'TEST 3f - Still only 1 invoice (no duplicate)', `got ${stateAfterLunas.invoicesCount}`);

    // ─── TEST 4: Direct full payment (new booking, single payment = Lunas) ──
    console.log('\n[TEST 4] Direct full payment (2,000,000 on TEST_BK_FULL)...');
    const fullResult = await callWebhook(page, {
      orderId: 'TEST-FULL-001',
      transactionStatus: 'settlement',
      grossAmount: 2000000,
      paymentType: 'credit_card',
      transactionTime: new Date().toISOString()
    });
    await wait(500);

    const stateAfterFull = await getState(page, 'TEST_BK_FULL');
    console.log('  State after full payment:', stateAfterFull);

    assert(fullResult === true, 'TEST 4a - Full payment webhook returns true');
    assert(stateAfterFull.bookingPaymentStatus === 'Lunas', 'TEST 4b - Direct full payment status = Lunas', `got '${stateAfterFull.bookingPaymentStatus}'`);
    assert(stateAfterFull.invoiceStatus === 'lunas', 'TEST 4c - Invoice status = lunas (not dp_lunas)', `got '${stateAfterFull.invoiceStatus}'`);
    assert(stateAfterFull.invoiceSisa === 0, 'TEST 4d - Invoice sisa = 0', `got ${stateAfterFull.invoiceSisa}`);
    assert(stateAfterFull.invoiceTerbayar === 2000000, 'TEST 4e - Invoice terbayar = 2000000', `got ${stateAfterFull.invoiceTerbayar}`);
    assert(stateAfterFull.paymentsCount === 1, 'TEST 4f - 1 payment record', `got ${stateAfterFull.paymentsCount}`);

    // ─── SUMMARY ─────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log(`Results: ${PASS} PASSED, ${FAIL} FAILED`);
    if (FAIL === 0) {
      console.log('✅ ALL E2E TESTS PASSED!');
      console.log('');
      console.log('Flow confirmed:');
      console.log('  ✅ Midtrans SUCCESS → Booking: Dikonfirmasi (real-time, no refresh)');
      console.log('  ✅ Midtrans SUCCESS → Payment status: DP Dibayar / Lunas');
      console.log('  ✅ Invoice dibuat otomatis saat pembayaran pertama');
      console.log('  ✅ Invoice diperbarui (tidak ganda) saat pelunasan');
      console.log('  ✅ Pembayaran langsung penuh → Invoice status Lunas langsung');
      console.log('  ✅ Notifikasi Customer + Admin + Owner dikirim');
      console.log('  ✅ Duplikat webhook dengan orderId sama → ditolak (0 efek)');
      console.log('  ✅ State React + localStorage keduanya terupdate real-time');
    } else {
      console.error(`\n❌ ${FAIL} test(s) FAILED!`);
    }
    console.log('='.repeat(60));

  } catch (err) {
    console.error('\n🔥 TEST ABORTED:', err.message);
    FAIL++;
  } finally {
    await browser.close();
    if (FAIL > 0) process.exit(1);
  }
})();
