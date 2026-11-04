# 💰 Tabunganku - Aplikasi Catatan Keuangan, Pengeluaran & Tabungan

Aplikasi pencatat keuangan modern, ringan, dan dirancang khusus agar nyaman digunakan di **layar HP (Smartphone)** maupun **Laptop/PC**.

---

## ✨ Fitur Utama
1. **Ringkasan Saldo Lengkap**:
   - Total Saldo Bersih, Dana Kas Tersedia, Pemasukan Bulan Ini, Pengeluaran Bulan Ini, dan Total Tabungan.
2. **Riwayat Transaksi & Filter Canggih**:
   - Filter berdasarkan jenis transaksi (Semua, Pemasukan, Pengeluaran, Tabungan).
   - Filter kategori (Makanan, Transportasi, Belanja, Tagihan, Gaji, dll.).
   - Filter tanggal & periode waktu (Hari Ini, Bulan Ini, Bulan Lalu).
   - Pencarian instan (search bar).
3. **Target Tabungan Impian (Savings Goals)**:
   - Buat celengan/target tabungan impian dengan target nominal dan tenggat waktu.
   - Progress bar persentase pencapaian (% tercapai).
   - Tombol setor langsung ke target tabungan.
   - Efek kembang api (confetti) otomatis saat target tabungan 100% tercapai!
4. **Grafik & Analisis Finansial**:
   - Donut Chart alokasi pengeluaran per kategori.
   - Bar Chart tren perbandingan pemasukan vs pengeluaran 6 bulan terakhir.
   - Statistik tingkat tabungan (*savings rate*), rata-rata pengeluaran harian, dan kategori terboros.
5. **Dukungan HP & PWA**:
   - Tampilan responsif mobile-first dengan navigasi bawah (*bottom bar*) dan tombol cepat (*Floating Action Button*).
   - Tombol **"Buka di HP (QR Code)"**: scan langsung dengan kamera HP untuk membukanya di browser HP.
   - Bisa dipasang ke Home Screen HP sebagai aplikasi (*Progressive Web App*).
6. **Cadangan Data (Backup & Restore)**:
   - Tersimpan otomatis di browser tanpa perlu registrasi akun atau server luar.
   - Ekspor laporan ke **Excel / CSV**.
   - Backup seluruh data ke file **JSON** dan pulihkan kapan saja.

---

## 🚀 Cara Menjalankan Aplikasi

### Cara 1: Jalankan dengan 1-Klik (Rekomendasi untuk dibuka di HP & Laptop)
1. Buka folder: `C:\Users\IOT\.gemini\antigravity\scratch\aplikasi-catatan-keuangan`
2. Klik dua kali file **`Jalankan_Aplikasi.bat`** (atau jalankan `python server.py` di terminal).
3. Browser laptop akan otomatis terbuka di `http://localhost:8888`.
4. Untuk membuka di HP:
   - Pastikan HP dan Laptop terhubung ke **Wi-Fi yang sama**.
   - Buka browser di HP (Chrome / Safari) lalu kunjungi link:  
     👉 **`http://10.20.32.179:8888`**  
     *(Atau klik tombol "Buka di HP" di pojok kanan atas aplikasi laptop lalu scan QR Code-nya dengan kamera HP)*.

### Cara 2: Langsung Buka File HTML di Laptop
- Anda juga bisa langsung klik dua kali file **`index.html`** di Windows Explorer untuk membukanya langsung di browser tanpa perlu server apa pun.

---

## 📱 Cara Memasang Jadi Aplikasi di HP (PWA)
1. Buka `http://10.20.32.179:8888` di browser HP Anda.
2. **Android (Chrome)**: Tap menu titik tiga di pojok kanan atas -> pilih **"Tambahkan ke Layar Utama" (Add to Home screen)** / **"Install App"**.
3. **iPhone (Safari)**: Tap tombol Share (ikon kotak dengan panah ke atas) -> pilih **"Add to Home Screen"**.
4. Ikon **Tabunganku** akan muncul di layar utama HP Anda dan dapat dibuka seperti aplikasi pada umumnya!
