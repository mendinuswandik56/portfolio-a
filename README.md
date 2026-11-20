# Aplannymw Portfolio

Portfolio React + Vite dengan Firebase Authentication, Firestore, dan Cloudinary.

## 1. Persiapan

1. Install Node.js versi 20 atau lebih baru.
2. Buka terminal pada folder proyek.
3. Jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`, lalu isi nilai konfigurasi Firebase dari Firebase Console.
5. Jalankan `npm run dev` untuk melihat website secara lokal.
6. Jalankan `npm run build` untuk membuat versi produksi.

## 2. Firebase

- Aktifkan **Authentication > Sign-in method > Email/Password**.
- Buat akun admin dengan email `mendinuswandik918@gmail.com`.
- Pada Authentication > Settings > Authorized domains, pastikan `meskowan.github.io` ditambahkan (dan `localhost` untuk pengembangan lokal).
- Buat Firestore Database.
- Salin isi `firestore.rules` ke menu Firestore Database > Rules, lalu terbitkan.
- Isi variabel `VITE_FIREBASE_*` pada file `.env`.

Aturan Firestore mengizinkan semua pengunjung membaca daftar proyek, tetapi hanya email admin yang ditentukan yang dapat menambah, mengubah, dan menghapus dokumen proyek. Jika email admin diubah, ubah juga email pada `firestore.rules` agar tetap sama dengan `VITE_ADMIN_EMAIL`.

## 3. Cloudinary

Kode menggunakan cloud name `ew3vk9zg` dan unsigned upload preset `aplannymw_unsigned`. Pastikan preset tersebut masih aktif di akun Cloudinary dan batasi format serta ukuran unggahan dari pengaturan preset.

## 4. Foto profil

Letakkan foto profil bernama `profile.jpg` di folder `public/`. Kode saat ini merujuk ke `/portfolio-aplannymw/profile.jpg`.

## 5. GitHub Pages

Workflow tersedia di `.github/workflows/deploy.yml` dan berjalan saat push ke branch `main`.

Tambahkan repository secrets berikut pada GitHub: Settings > Secrets and variables > Actions:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_ADMIN_EMAIL` (isi `mendinuswandik918@gmail.com`)

Lalu buka Settings > Pages dan pilih **GitHub Actions** sebagai Build and deployment source.

### Penting: alamat GitHub Pages

Konfigurasi Vite saat ini menggunakan `base: '/portfolio-aplannymw/'`, mengikuti URL portfolio yang tertulis pada kode. Jika repository dipublikasikan pada alamat `https://meskowan.github.io/` (tanpa subfolder), ubah menjadi `base: '/'` dan ubah `PROFILE_IMAGE` pada `src/main.jsx` menjadi `/profile.jpg`. Jika URL sebenarnya memakai subfolder lain, samakan nilai `base` dan path foto profil dengan subfolder tersebut.

## Catatan keamanan

Jangan pernah memasukkan Firebase Admin SDK private key, service-account JSON, password, atau secret server ke aplikasi frontend. Variabel `VITE_*` akan tertanam ke bundle browser; Firebase web config bukan tempat menyimpan password. Keamanan data harus ditegakkan melalui Firebase Security Rules.
