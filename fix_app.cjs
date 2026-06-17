const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                  onUpdateSettings={setSettings}`;

const fixCode = `                  onUpdateSettings={setSettings}
                  allUsers={users}
                  onUpdateUsers={setUsers}
                  reviews={reviews}
                  onUpdateReviews={setReviews}
                  refunds={refunds}
                  onUpdateRefunds={handleUpdateRefunds}
                  onShowToast={showToast}
                  onShowConfirm={showConfirm}
                />
              )}

              {/* 9. OWNER DASHBOARD */}
              {activeTab === 'dashboard-owner' && (
                <DashboardOwner
                  bookings={bookings}
                  invoices={invoices}
                  payments={payments}
                  allCars={cars}
                  allDrivers={drivers}
                  onAddNotification={handleAddNotification}
                  activeTab={ownerActiveTab}
                  setActiveTab={setOwnerActiveTab}
                  allUsers={users}
                  onUpdateUsers={setUsers}
                  onUpdateCars={setCars}
                  onUpdateDrivers={setDrivers}
                  onUpdateBookings={handleUpdateBookings}
                  reviews={reviews}
                  onUpdateReviews={setReviews}
                  refunds={refunds}
                  onUpdateRefunds={handleUpdateRefunds}
                  onShowToast={showToast}
                  onShowConfirm={showConfirm}
                  onGenerateDemoData={handleGenerateDemoData}
                />
              )}

              </PageSkeletonWrapper>
            </main>

          </div> {/* End Main Content Window */}
        </div> {/* End flex-grow layout container */}

        {/* Geometric Footer */}
        <footer className="mt-auto px-8 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest shrink-0 hidden md:flex">
          <div className="flex flex-wrap gap-6 items-center">
            <span>v2.1.0 Build Stable</span>
            <span className="text-slate-300">|</span>
            <span>AutoRent Indonesia</span>
            <span className="text-slate-300">|</span>
            <span>📞 Hotline: 0800-1234-567</span>
            <span className="text-slate-300">|</span>
            <span>⏰ 08.00–22.00 WIB</span>
          </div>
          <div className="flex gap-5 items-center">
            <span className="cursor-pointer hover:text-blue-600 hover:underline transition-colors" onClick={() => setActiveTab('landing')}>Beranda</span>
            <span className="cursor-pointer hover:text-blue-600 hover:underline transition-colors" onClick={() => setActiveTab('rental')}>Rental Mobil</span>
            <span className="cursor-pointer hover:text-blue-600 hover:underline transition-colors" onClick={() => setActiveTab('driver')}>Driver</span>
            <span className="text-slate-300 font-normal normal-case">© 2026 AutoRent Corp</span>
          </div>
        </footer>

      </div>
    );
  };`;

const idx = code.indexOf(target);
if (idx !== -1) {
  const endIdx = code.indexOf('  return (', idx);
  const part1 = code.slice(0, idx);
  const part2 = code.slice(endIdx);
  const newCode = part1 + fixCode + '\n\n\n\n' + part2;
  fs.writeFileSync('src/App.tsx', newCode, 'utf8');
  console.log('Fixed');
} else {
  console.log('Target not found');
}
