const fs = require('fs');

// 1. types.ts
let typesContent = fs.readFileSync('src/types.ts', 'utf8');

typesContent = typesContent.replace(
  /export interface SystemSettings \{([\s\S]*?)midtransServerKey\?: string;/g,
  `export interface SystemSettings {$1midtransServerKey?: string;\n  dendaPerHari?: number;`
);

typesContent = typesContent.replace(
  /statusDenda\?: string;/g,
  `statusDenda?: 'none' | 'Belum Dibayar' | 'Sudah Dibayar';`
);

typesContent = typesContent.replace(
  /\| 'Aktif' \| 'Terlambat';/,
  "| 'Aktif' | 'Terlambat' | 'Tepat Waktu';"
);
// Wait, my previous revert script removed "Terlambat", let's be safe and just replace 'Aktif'
typesContent = typesContent.replace(
  /\| 'Aktif';/,
  "| 'Aktif' | 'Tepat Waktu' | 'Terlambat';"
);

fs.writeFileSync('src/types.ts', typesContent);

// 2. App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  /const \[settings, setSettings\] = useState<SystemSettings>\(\{([\s\S]*?)promoAktif: 'LIBURAN2026',([\s\S]*?)midtransServerKey: 'REDACTED_KEY'([\s\S]*?)\}\);/g,
  `const [settings, setSettings] = useState<SystemSettings>({$1promoAktif: 'LIBURAN2026',$2midtransServerKey: 'REDACTED_KEY',$3dendaPerHari: 200000\n  });`
);

// If the previous replace failed because it didn't match perfectly, let's do a simpler one
if (!appContent.includes('dendaPerHari: 200000')) {
  appContent = appContent.replace(
    /midtransServerKey: 'REDACTED_KEY'\n\s*\}\);/,
    `midtransServerKey: 'REDACTED_KEY',\n    dendaPerHari: 200000\n  });`
  );
}

fs.writeFileSync('src/App.tsx', appContent);

console.log('Modified types.ts and App.tsx');
