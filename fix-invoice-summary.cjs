const fs = require('fs');

// UPDATE DashboardCustomer.tsx
const custFile = 'd:/remix_-autorent/src/components/DashboardCustomer.tsx';
let custContent = fs.readFileSync(custFile, 'utf8');

const custTarget = `<div className="flex justify-between items-center text-slate-900 font-black text-sm pt-1">
                          <span>Total Tagihan Akhir:</span>
                          <span className="font-mono text-blue-600">Rp {totalVal.toLocaleString('id-ID')}</span>
                        </div>`;

const custReplace = `<div className="flex justify-between items-center text-slate-900 font-black text-sm pt-2">
                          <span>Total:</span>
                          <span className="font-mono text-blue-600">Rp {totalVal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 font-semibold text-sm pt-1">
                          <span>Pembayaran Diterima:</span>
                          <span className="font-mono text-emerald-600">Rp {terbayarVal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-rose-700 font-black text-sm pt-1 mt-1 border-t border-slate-100">
                          <span>Sisa Tagihan:</span>
                          <span className="font-mono">Rp {sisaVal.toLocaleString('id-ID')}</span>
                        </div>`;

custContent = custContent.replace(custTarget, custReplace);
fs.writeFileSync(custFile, custContent);


// UPDATE DashboardAdmin.tsx
const adminFile = 'd:/remix_-autorent/src/components/DashboardAdmin.tsx';
let adminContent = fs.readFileSync(adminFile, 'utf8');

const adminTarget = `<div className="flex justify-between items-center text-slate-900 font-black text-sm pt-1">
                              <span>Total Tagihan:</span>
                              <span className="font-mono text-blue-600">Rp {selectedInvoice.total.toLocaleString('id-ID')}</span>
                            </div>`;

const adminReplace = `<div className="flex justify-between items-center text-slate-900 font-black text-sm pt-2">
                              <span>Total:</span>
                              <span className="font-mono text-blue-600">Rp {selectedInvoice.total.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 font-semibold text-sm pt-1">
                              <span>Pembayaran Diterima:</span>
                              <span className="font-mono text-emerald-600">Rp {(selectedInvoice.terbayar || 0).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center text-rose-700 font-black text-sm pt-1 mt-1 border-t border-slate-100">
                              <span>Sisa Tagihan:</span>
                              <span className="font-mono">Rp {(Math.max(0, selectedInvoice.total - (selectedInvoice.terbayar || 0))).toLocaleString('id-ID')}</span>
                            </div>`;

adminContent = adminContent.replace(adminTarget, adminReplace);
fs.writeFileSync(adminFile, adminContent);

console.log('Invoice summaries updated');
