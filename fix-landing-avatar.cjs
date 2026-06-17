const fs = require('fs');

let content = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

// Import ProfileAvatar
if (!content.includes('ProfileAvatar')) {
  content = content.replace(
    /import { MapPin/,
    `import { ProfileAvatar } from './ProfileAvatar';\nimport { MapPin`
  );
}

// Replace the hardcoded testimonials mapping with the real reviews mapping if available,
// OR just replace the <img> tag in the testimonials mapping with ProfileAvatar.
// Since the prompt asks to remove customer profile photos and change to initials, 
// I will just replace the <img> with <ProfileAvatar> in the testimonials loop.
// Let's replace: <img src={testi.img} alt={testi.name} className="w-12 h-12 rounded-full object-cover shadow-sm"/>
// with: <ProfileAvatar name={testi.name} className="w-12 h-12 text-sm shadow-sm" />

content = content.replace(
  /<img src=\{testi\.img\} alt=\{testi\.name\} className="w-12 h-12 rounded-full object-cover shadow-sm"\/>/,
  `<ProfileAvatar name={testi.name} className="w-12 h-12 text-sm shadow-sm" />`
);

// We should also replace the hardcoded testimonials array to use the actual reviews if we want it to be dynamic!
// The user previously said "tambahkan beberapa data review dari customer buat di katalog, landing page maupun di daftar admin".
// So I will make LandingPage use `reviews` instead of `testimonials`.
// Let's check how the map is called: `{testimonials.map((testi, idx) => (`
// I'll replace it with:
// `{(reviews && reviews.length > 0 ? reviews.slice(0,3).map(r => ({ name: r.userNama, review: r.ulasan, rating: r.rating })) : testimonials).map((testi, idx) => (`
content = content.replace(
  /\{testimonials\.map\(\(testi, idx\) => \(/,
  `{(reviews && reviews.length > 0 ? reviews.slice(0,3).map(r => ({ name: r.userNama, review: r.ulasan, rating: r.rating })) : testimonials).map((testi, idx) => (`
);

fs.writeFileSync('src/components/LandingPage.tsx', content);
console.log('Fixed LandingPage');
