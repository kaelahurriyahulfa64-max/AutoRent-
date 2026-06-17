const fs = require('fs');

// 1. Update data.ts
let dataContent = fs.readFileSync('src/data.ts', 'utf8');

const mockReviews = `export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    userId: 'USR-CUST-1',
    userNama: 'Budi Santoso',
    targetId: 'm1',
    targetNama: 'Honda Civic RS',
    tipe: 'mobil',
    rating: 5,
    ulasan: 'Mobilnya sangat bersih dan wangi. Mesinnya juga responsif. Pelayanan AutoRent sangat memuaskan!',
    tanggal: '2026-06-10T14:30:00Z'
  },
  {
    id: 'rev_2',
    userId: 'USR-CUST-2',
    userNama: 'Siti Nurhaliza',
    targetId: 'm2',
    targetNama: 'Toyota Innova Zenix',
    tipe: 'mobil',
    rating: 4,
    ulasan: 'Cocok banget buat liburan keluarga. Kapasitas luas dan nyaman. Proses bookingnya juga gampang.',
    tanggal: '2026-06-12T09:15:00Z'
  },
  {
    id: 'rev_3',
    userId: 'USR-CUST-3',
    userNama: 'Andi Saputra',
    targetId: 'd1',
    targetNama: 'Slamet',
    tipe: 'driver',
    rating: 5,
    ulasan: 'Pak Slamet sangat ramah dan hafal jalanan kota. Mengemudinya sangat aman dan nyaman.',
    tanggal: '2026-06-14T16:45:00Z'
  },
  {
    id: 'rev_4',
    userId: 'USR-CUST-4',
    userNama: 'Kaela Hurriyah Ulfa',
    targetId: 'm3',
    targetNama: 'Porsche Macan',
    tipe: 'mobil',
    rating: 5,
    ulasan: 'Pengalaman premium yang luar biasa. Mobil dalam kondisi sempurna saat diserahterimakan.',
    tanggal: '2026-06-15T11:20:00Z'
  }
];`;

dataContent = dataContent.replace(/export const INITIAL_REVIEWS: Review\[\] = \[\];/, mockReviews);
fs.writeFileSync('src/data.ts', dataContent);

// 2. Update App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

appContent = appContent.replace(
  /const \[reviews, setReviews\] = useState<Review\[\]>\(\(\) => getStoredState\('reviews', INITIAL_REVIEWS\)\);/,
  `const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = getStoredState('reviews', INITIAL_REVIEWS);
    return stored.length > 0 ? stored : INITIAL_REVIEWS;
  });`
);

// We should also replace the generic \`const list = getStoredState('reviews', INITIAL_REVIEWS);\` if any.
// Actually, App.tsx has:
// setReviews(getStoredState('reviews', INITIAL_REVIEWS));
// in the \`syncState\` handler.
appContent = appContent.replace(
  /setReviews\(getStoredState\('reviews', INITIAL_REVIEWS\)\);/,
  `const storedReviews = getStoredState('reviews', INITIAL_REVIEWS);
      setReviews(storedReviews.length > 0 ? storedReviews : INITIAL_REVIEWS);`
);

fs.writeFileSync('src/App.tsx', appContent);
console.log('Added mock reviews');
