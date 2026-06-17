const fs = require('fs');

// Remove from DashboardCustomer.tsx
const custFile = 'd:/remix_-autorent/src/components/DashboardCustomer.tsx';
let custContent = fs.readFileSync(custFile, 'utf8');
const custTarget = `<div className="flex justify-between items-center">
                          <span>Subtotal Sewa Mobil:</span>
                          <span className="font-mono text-slate-850">Rp {subtotalVal.toLocaleString('id-ID')}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span>Biaya Driver (jika ada):</span>
                          <span className="font-mono text-slate-850">Rp 0</span>
                        </div>

                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span>Denda Keterlambatan:</span>
                          <span className={\`font-mono \${dendaVal > 0 ? 'text-red-650 font-bold' : 'text-slate-400'}\`}>
                            Rp {dendaVal.toLocaleString('id-ID')}
                          </span>
                        </div>`;
custContent = custContent.replace(custTarget, '');
fs.writeFileSync(custFile, custContent);

// Remove from DashboardAdmin.tsx
const adminFile = 'd:/remix_-autorent/src/components/DashboardAdmin.tsx';
let adminContent = fs.readFileSync(adminFile, 'utf8');
const adminTarget = `<div className="flex justify-between items-center">
                              <span>Subtotal Sewa Mobil:</span>
                              <span className="font-mono text-slate-850">Rp {selectedInvoice.subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span>Biaya Driver (jika ada):</span>
                              <span className="font-mono text-slate-850">Rp 0</span>
                            </div>

                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                              <span>Denda Keterlambatan:</span>
                              <span className={\`font-mono \${selectedInvoice.denda > 0 ? 'text-red-650 font-bold' : 'text-slate-400'}\`}>
                                Rp {selectedInvoice.denda.toLocaleString('id-ID')}
                              </span>
                            </div>`;
adminContent = adminContent.replace(adminTarget, '');
fs.writeFileSync(adminFile, adminContent);

console.log('Done removing detailed lines');
