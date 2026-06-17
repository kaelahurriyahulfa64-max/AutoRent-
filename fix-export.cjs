const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardOwner.tsx', 'utf8');

// 1. Update handlers
const oldHandlers = `  // Download Action Handlers
  const handleDownloadPDF = (title: string) => {
    onShowToast('Laporan berhasil diunduh.', 'success');
  };`;

const newHandlers = `  // Download Action Handlers
  const handleDownloadPDF = (title: string) => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(\`<html><head><title>\${title}</title></head><body style="padding: 20px; font-family: sans-serif;"><h2>\${title}</h2><p>Laporan diekspor pada \${new Date().toLocaleString('id-ID')}</p><br/>\`);
      win.document.write('Laporan Lengkap. Anda bisa menekan tombol cetak (Ctrl+P) untuk menyimpan sebagai PDF.');
      win.document.write('</body></html>');
      win.document.close();
      win.print();
    }
    onShowToast('Laporan berhasil diunduh.', 'success');
  };

  const handleDownloadExcel = (title: string) => {
    const csvContent = "Tanggal,Keterangan,Pemasukan,Pengeluaran\\n" + 
      new Date().toLocaleDateString('id-ID') + ",Export " + title + ",0,0\\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", \`\${title.replace(/\\s+/g, '_')}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Laporan Excel berhasil diunduh.', 'success');
  };`;

content = content.replace(oldHandlers, newHandlers);

// 2. Add Excel Button to main dashboard header
content = content.replace(
  /<button onClick=\{\(\) => handleDownloadPDF\('Laporan Keuangan Eksekutif'\)\} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-sm border-none">\s*<Download className="w-4 h-4" \/> Export PDF\s*<\/button>/,
  `<div className="flex gap-2">
              <button onClick={() => handleDownloadExcel('Laporan_Keuangan_Eksekutif')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-sm border-none">
                <Download className="w-4 h-4" /> Export Excel
              </button>
              <button onClick={() => handleDownloadPDF('Laporan Keuangan Eksekutif')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-sm border-none">
                <Download className="w-4 h-4" /> Export PDF
              </button>
            </div>`
);

fs.writeFileSync('src/components/DashboardOwner.tsx', content);
console.log('Fixed Export Buttons');
