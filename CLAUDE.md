# Umroh Simulator

Simulator 3D berbasis web (React Three Fiber) untuk belajar urutan manasik umroh dengan cara bermain bebas (free-roam). Proyek portofolio pribadi. Rencana lengkap, keputusan desain, dan fase ada di `docs/PLAN.md`. Baca dulu sebelum mengerjakan fase apa pun.

Bahasa komunikasi dengan pemilik proyek: Indonesia.

## Aturan konten (paling penting)

- Rujukan fiqih tunggal: *Panduan Manasik Haji & Umrah* karya Ustadz Yazid bin Abdul Qadir Jawas rahimahullah. Pemilik proyek yang mengisi konten dari buku itu.
- **Jangan pernah mengarang** teks doa, urutan, hukum, sunnah, atau penjelasan fiqih, termasuk "sebagai contoh" atau dari pengetahuan umum. Gunakan placeholder `TODO: isi dari buku, hal. …` dengan `status: draft`.
- Semua konten manasik hanya ada di `src/content/*.yaml`, tidak pernah di-hardcode di komponen atau engine.
- Engine tidak boleh mengasumsikan doa tertentu per putaran tawaf/sa'i. Doa terikat ke titik pemicu yang ditentukan konten.
- Penjelasan dari buku diparafrasekan + rujukan halaman, bukan disalin panjang.

## Aturan kode

- `src/engine/` adalah TypeScript murni (tanpa React/three) dan setiap perubahan logika di sana harus disertai unit test Vitest.
- Teks UI diambil dari `src/i18n/id.json`, tidak ditulis langsung di JSX (supaya English bisa ditambah nanti).
- Saat menambah dependensi: cek versi terbaru & kompatibilitas (R3F ↔ React ↔ drei ↔ rapier ↔ ecctrl), jangan mengandalkan ingatan.
- Setiap aset 3D/tekstur/audio dicatat di `ASSETS.md` (sumber, lisensi, author). Hanya CC0, CC-BY, atau berbayar dengan lisensi jelas.

## Aturan desain (kesantunan)

- Tidak ada lompat. Collider mencegah pemain menembus Ka'bah atau memanjat struktur, dan kamera tidak bisa masuk ke dalam Ka'bah.
- Avatar & NPC berupa figur tanpa wajah. Tidak ada musik, hanya ambient.
- Mode bermain eksploratif: hanya petunjuk lembut, tanpa skor atau hukuman.

## Anggaran performa

Desktop 60 fps. HP kelas menengah ≥ 30 fps di preset Low/Medium. Unduhan awal scene pertama ≤ ~20 MB. Draw call ≤ ~150 per scene.

## Perintah

Diisi saat Fase 0 (dev, build, test, `check:content`, optimasi aset).

## Debug

Parameter URL dev-only `?scene=haram&step=tawaf&gender=L` untuk lompat ke titik tertentu (dibuat di Fase 2–3).
