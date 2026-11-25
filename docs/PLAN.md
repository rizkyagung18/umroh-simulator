# Plan: Umroh Simulator 3D (Web)

## Konteks

Aplikasi 3D interaktif berbasis web untuk mempelajari urutan manasik umroh secara visual: pemain berjalan sendiri di Masjidil Haram, miqat, dan Madinah, lalu mengerjakan tiap langkah di tempat yang benar. Proyek ini untuk portofolio pribadi dan dikerjakan santai tanpa deadline, per fase, lewat Claude Code CLI. Proyek baru, belum ada kode (folder target: `~/Documents/umroh-simulator/`).

Rujukan fiqih: **Panduan Manasik Haji & Umrah karya Ustadz Yazid bin Abdul Qadir Jawas rahimahullah**. Konten (urutan, doa, sunnah, penjelasan) disusun oleh pemilik proyek dari buku tersebut. Kode tidak boleh mengarang konten fiqih.

## Keputusan dari interview

| Aspek | Keputusan |
|---|---|
| Platform | Web browser, desktop + HP (WASD/mouse dan joystick virtual) |
| Gaya main | Free-roam eksploratif. Panduan lembut, tanpa skor, tidak ada "game over" |
| Cakupan | Rukun & wajib umroh, adab masuk Masjidil Haram, ziarah Madinah |
| Rute | Pemain memilih: **A** Madinah → miqat Bir Ali → Makkah, atau **B** pesawat (miqat di udara) → Makkah → Madinah |
| Karakter | Pilih laki-laki/perempuan. Sunnah khusus laki-laki (idhtiba', raml, lari kecil di lampu hijau) dan cara tahallul menyesuaikan |
| Visual | Semi-realistis, dengan graybox lebih dulu dan art pass belakangan |
| Manusia | Figur tanpa wajah (avatar & NPC), kamera orang ketiga |
| Kerumunan | Sepi, sekitar 10–30 NPC |
| Skala | Dipadatkan. Ka'bah ukuran asli, mataf & Mas'a dipersingkat (Safa–Marwah ±80 m, angka awal yang disetel saat playtest) |
| Doa | Teks Arab + transliterasi + terjemahan, tanpa audio |
| Audio | Ambient tanpa musik (riuh jamaah, langkah, talbiyah jamaah di miqat) |
| Bahasa | UI Indonesia, struktur i18n siap ditambah English |
| Fitur pendamping | Peta mini + penanda tujuan, info landmark |
| Aset 3D | Campuran: landmark utama dimodelkan di Blender, props/tekstur dari sumber berlisensi jelas (Poly Haven CC0, Sketchfab CC-BY) |
| Skill pemilik | Paham React/TS |

**Di luar cakupan (sengaja):** detail persiapan ihram (mandi, dll.), jurnal manasik, simpan progres, skor/achievement, kerumunan padat, audio doa, multiplayer, backend/login.

## Stack teknologi

- **Vite + React + TypeScript**: dasar aplikasi
- **three + @react-three/fiber + @react-three/drei**: rendering 3D, loader GLTF, `Detailed` (LOD), `PerformanceMonitor`, `AdaptiveDpr`
- **@react-three/rapier**: fisika & collider, sensor zona
- **ecctrl**: character controller orang ketiga dan `EcctrlJoystick` untuk HP. Lompat dimatikan.
- **zustand**: state game & settings (settings disimpan di localStorage)
- **zod + yaml**: skema & parsing konten manasik (`import raw from '*.yaml?raw'` lalu `yaml.parse` dan validasi zod)
- **Tailwind CSS**: HUD & menu
- **@fontsource/amiri** (atau Noto Naskh Arabic): font Arab yang di-self-host
- **Vitest**: unit test engine. Dev-only: **r3f-perf**, **leva**
- **@gltf-transform/cli**: optimasi aset (meshopt + KTX2/WebP, resize tekstur)
- Deploy: **Vercel** (preview per push)

> Saat instalasi, Claude Code wajib mengecek versi terbaru tiap paket dan kompatibilitasnya (R3F ↔ React ↔ drei ↔ rapier ↔ ecctrl). Jangan mengandalkan ingatan.

## Arsitektur

```
umroh-simulator/
├─ CLAUDE.md                 # aturan proyek untuk Claude Code
├─ ASSETS.md                 # log setiap aset: sumber, lisensi, author (wajib untuk CC-BY)
├─ docs/PLAN.md              # salinan plan ini
├─ assets-src/               # .blend & tekstur mentah (Git LFS / di luar repo)
├─ public/models/            # GLB hasil optimasi
├─ public/maps/              # gambar peta mini per scene (pre-render top-down)
├─ scripts/
│  ├─ optimize-assets.ts     # pipeline gltf-transform
│  └─ check-content.ts       # validasi YAML + daftar konten berstatus draft
└─ src/
   ├─ engine/                # TypeScript MURNI, tanpa React/three → mudah di-unit-test
   │  ├─ manasik.ts          # mesin langkah: langkah aktif, syarat selesai, langkah berikutnya
   │  ├─ tawaf.ts            # penghitung putaran (akumulasi sudut di sekitar Ka'bah)
   │  ├─ sai.ts              # penghitung perjalanan Safa↔Marwah
   │  ├─ routes.ts           # urutan scene per rute A/B
   │  └─ *.test.ts
   ├─ content/               # DIISI PEMILIK PROYEK
   │  ├─ schema.ts           # skema zod
   │  ├─ steps.yaml          # langkah manasik
   │  ├─ doa.yaml            # teks doa
   │  ├─ landmarks.yaml      # info landmark
   │  └─ routes.yaml
   ├─ i18n/id.json           # teks UI (en.json menyusul)
   ├─ store/                 # zustand: gameStore, settingsStore
   ├─ scenes/                # dimuat lazy per scene
   │  ├─ MasjidilHaram/
   │  ├─ MiqatBirAli/
   │  ├─ Pesawat/
   │  └─ MasjidNabawi/
   ├─ game/                  # Player, Zone (sensor), Landmark, NpcWalker, ObjectiveMarker
   └─ ui/                    # Menu, HUD, StepCard, HintToast, DoaCard, Minimap, LandmarkPanel, Settings
```

### Mesin manasik (`src/engine`)
- Langkah didefinisikan di `steps.yaml`. Setiap langkah punya `id`, `scene`, `gender` (semua/L/P), `trigger` (masuk zona, interaksi, tracker selesai), `hint`, `doa[]`, `landmark` tujuan, `rujukan` (halaman buku), dan `status` (`draft`/`verified`).
- **Engine tidak mengasumsikan doa tertentu per putaran.** Doa dipasang di titik pemicu (garis Hajar Aswad, busur Rukun Yamani→Hajar Aswad, Safa, Marwah, lampu hijau, dan seterusnya), dan isinya sepenuhnya ditentukan konten.
- **Tawaf tracker:** sudut pemain terhadap pusat Ka'bah dihitung dengan `atan2` lalu di-unwrap. Satu putaran sah jika akumulasi sudut ≥ 2π dengan arah Ka'bah di kiri (berlawanan jarum jam dilihat dari atas, tanda arahnya dikunci lewat unit test), dimulai dan diakhiri di garis Hajar Aswad. Jika pemain masuk zona **Hijr Ismail**, putaran itu tidak dihitung dan muncul petunjuk. Arah terbalik juga memunculkan petunjuk. Putaran 1–3 untuk laki-laki memunculkan petunjuk raml (tombol sprint).
- **Sa'i tracker:** perjalanan dihitung dari pergantian masuk zona Safa ↔ Marwah, dimulai di Safa dan berakhir di Marwah pada perjalanan ke-7. Untuk laki-laki, zona lampu hijau memunculkan petunjuk lari kecil.
- Semua bersifat **panduan lembut**: tidak ada hukuman. Penghitung hanya mencerminkan yang sah, dan petunjuk menjelaskan sebabnya.

### Alur scene
- **Menu:** pilih gender → pilih rute → tutorial kontrol singkat.
- **Rute A:** Masjid Nabawi → transisi (layar teks perjalanan) → Miqat Bir Ali (ganti ihram, niat, talbiyah) → transisi → Masjidil Haram.
- **Rute B:** Kabin pesawat (pengumuman melewati miqat, niat, talbiyah) → transisi → Masjidil Haram → transisi → Masjid Nabawi.
- **Masjidil Haram:** adab masuk (kaki kanan, doa masuk) → melihat Ka'bah → Tawaf 7 putaran → shalat di belakang Maqam Ibrahim → Zamzam → Sa'i 7 kali → Tahallul (area cukur: L memilih cukur/potong, P memotong ujung rambut) → layar ringkasan "umroh selesai".
- **Masjid Nabawi:** adab masuk, shalat, Raudhah, titik salam di area makam. Isi seluruhnya dari konten. Masjid Quba opsional di akhir.
- Transisi antar kota berupa layar 2D, bukan scene 3D, untuk menekan scope.

### Kesantunan (aturan desain)
Tidak ada lompat. Collider mencegah menembus Ka'bah atau memanjat struktur. Figur tanpa wajah. Tanpa musik. Kamera tidak bisa masuk ke dalam Ka'bah. Kaligrafi kiswah memakai tekstur yang bersih dan akurat.

### Debug untuk pengembangan
Parameter URL `?scene=haram&step=tawaf&gender=L` langsung melompat ke titik tertentu (dev only). Ini penting untuk testing tanpa mengulang dari awal.

## Alur kerja konten (oleh pemilik proyek)
1. Claude Code membuat kerangka YAML lengkap (semua id langkah, doa, landmark) berisi placeholder `TODO: isi dari buku, hal. …` dan `status: draft`.
2. Pemilik mengisi teks Arab, transliterasi, terjemahan, penjelasan singkat, dan **halaman rujukan**.
3. Penjelasan **diparafrasekan** dan disertai rujukan halaman, bukan disalin panjang dari buku (hak cipta). Teks doa (dari hadits) boleh ditulis utuh.
4. `npm run check:content` memvalidasi skema dan mendaftar entri yang masih `draft`. Di mode dev, konten draft tampil dengan badge **DRAFT**. Syarat rilis: tidak ada lagi entri draft.

## Fase pengerjaan

Setiap fase menghasilkan versi yang bisa dimainkan dan di-deploy. Prinsipnya **graybox dulu, art pass belakangan**, supaya gameplay tidak menunggu aset.

**Fase 0: Fondasi**
Setup Vite/React/TS, dependensi, Tailwind, Vitest, ESLint/Prettier, git + GitHub + Vercel, `CLAUDE.md`, `ASSETS.md`. Isinya scene kosong: lantai + kapsul pemain yang bisa berjalan (WASD + joystick HP), tanpa lompat.
*Selesai jika:* URL Vercel bisa dibuka dan pemain bisa berjalan di laptop & HP.

**Fase 1: Graybox Masjidil Haram**
Blockout dari primitive dengan skala dipadatkan: Ka'bah (penanda sudut Hajar Aswad & Rukun Yamani, Multazam), Hijr Ismail, Maqam Ibrahim, mataf, pintu masuk, titik Zamzam, Mas'a (Safa, Marwah, lampu hijau), area cukur. Ditambah collider, kamera orang ketiga, sprint, dan peta mini (pre-render top-down + titik pemain).
*Selesai jika:* bisa berjalan dari pintu → mataf → Mas'a → area cukur di HP.

**Fase 2: Mesin manasik (Makkah)**
Skema konten + kerangka YAML, `manasik.ts`, `tawaf.ts`, `sai.ts` beserta unit test, sensor zona, HUD (kartu langkah, petunjuk, kartu doa dengan font Arab), penanda tujuan 3D + di peta mini, efek pilihan gender, layar ringkasan.
*Selesai jika:* umroh penuh (adab masuk → tahallul) bisa dimainkan di graybox dengan konten placeholder, dan semua test lulus.

**Fase 3: Menu, rute & miqat**
Menu gender/rute, `routes.ts`, scene graybox Miqat Bir Ali dan Kabin Pesawat (ganti ihram, niat, talbiyah), layar transisi, pemuatan scene secara lazy.
*Selesai jika:* rute A & B bisa dimainkan sampai tahallul (Madinah masih placeholder).

**Fase 4: Madinah & info landmark**
Graybox Masjid Nabawi (plaza payung, pintu, interior sederhana, Raudhah, titik salam). Sistem info landmark (dekati → tombol "Info" → panel) untuk semua scene, beserta `landmarks.yaml`.
*Selesai jika:* kedua rute lengkap end-to-end.

**Fase 5: Art pass semi-realistis**
Pipeline Blender → GLB → `optimize-assets` (meshopt, KTX2/WebP, tekstur maksimal 2K desktop / 1K HP) → LOD. Urutan penggantian: Ka'bah → Maqam Ibrahim & Hijr Ismail → lantai mataf & serambi → Mas'a → Masjid Nabawi → miqat & kabin. Pencahayaan: HDRI (Poly Haven) + lightmap/AO yang di-bake di Blender untuk bangunan statis. Bayangan dinamis & post-processing hanya di preset High. Avatar tanpa wajah dengan varian pakaian L/P + kondisi idhtiba', NPC sepi (10–30) berjalan di jalur tawaf & Mas'a. Preset kualitas Low/Medium/High otomatis via `PerformanceMonitor`. Semua aset tercatat di `ASSETS.md`.
*Selesai jika:* anggaran performa (di bawah) terpenuhi.

**Fase 6: Polish & rilis portofolio**
Audio ambient (CC0 atau rekaman sendiri, dicatat di `ASSETS.md`), tutorial kontrol, settings (kualitas, peta mini on/off, volume, ukuran teks doa), cek kontras & aksesibilitas, kerangka `en.json`, review konten sampai semua `verified`, halaman kredit, deploy produksi, README portofolio dengan screenshot/GIF.

## Anggaran performa
- Desktop: 60 fps. HP kelas menengah: ≥ 30 fps di preset Low/Medium.
- Unduhan awal scene pertama di HP: ≤ ~20 MB. Scene lain dimuat saat dibutuhkan.
- Draw call ≤ ~150 per scene (gunakan instancing & penggabungan mesh statis).

## Risiko & mitigasi
| Risiko | Mitigasi |
|---|---|
| Aset semi-realistis jadi hambatan terbesar | Graybox-first. Gameplay tidak bergantung pada aset, dan art pass dikerjakan bertahap per landmark |
| Berat di HP | Anggaran performa, LOD, KTX2, lightmap yang di-bake, preset kualitas |
| Akurasi fiqih | Konten terpisah dari kode, Claude dilarang mengarang, status `draft`/`verified`, rujukan halaman |
| Hak cipta buku & aset | Parafrase + rujukan, `ASSETS.md`, hanya lisensi CC0/CC-BY/berbayar yang jelas |
| Scope melebar (2 rute + Madinah) | Fase berurutan. Madinah & rute B baru dikerjakan setelah inti Makkah jalan |

## Verifikasi
- **Unit test (Vitest)** untuk `engine/`: putaran tawaf (arah benar/salah, melewati Hijr Ismail, mulai bukan dari Hajar Aswad), hitungan sa'i (mulai dari Marwah, bolak-balik), urutan langkah per gender & per rute. `npm test` harus hijau di setiap fase.
- **`npm run check:content`**: skema valid, daftar entri draft.
- **Playtest manual per fase** sesuai kriteria "Selesai jika" di atas, di Chrome desktop dan di HP Android/iPhone nyata (lewat URL preview Vercel).
- **Performa:** r3f-perf (fps, draw call) di desktop & HP, ukuran bundle/aset dicek dari network tab, dan Lighthouse untuk waktu muat.
- Shortcut debug `?scene=&step=` dipakai untuk menguji langkah tertentu dengan cepat.

## Serah terima ke Claude Code CLI
1. Setelah plan disetujui: buat `~/Documents/umroh-simulator/`, simpan plan ini sebagai `docs/PLAN.md`, dan buat `CLAUDE.md` awal (tujuan, stack, perintah, aturan: engine murni + test, konten hanya dari YAML, **jangan mengarang doa/hukum, gunakan placeholder TODO**, catat setiap aset di `ASSETS.md`, tanpa lompat/musik, figur tanpa wajah, anggaran performa).
2. Di CLI, kerjakan satu fase per sesi. Contoh prompt pembuka:
   - `Baca docs/PLAN.md dan CLAUDE.md. Kerjakan Fase 0. Mulai dengan plan mode.`
   - `Lanjut Fase 2 sesuai docs/PLAN.md. Buat kerangka YAML konten dengan placeholder saja, jangan isi teks doa.`
3. Di akhir tiap fase: jalankan test, playtest di HP, commit, lalu centang fase di `docs/PLAN.md`.
