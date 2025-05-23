# PM2 - Manajemen Proses Node.js

PM2 adalah process manager untuk aplikasi Node.js yang memungkinkan Anda menjalankan, memonitor, dan mengelola aplikasi di production dengan mudah.

## Instalasi PM2

Jalankan perintah berikut untuk menginstal PM2 secara global:

```bash
npm install -g pm2
```

## Menjalankan Aplikasi dengan PM2

Misal Anda ingin menjalankan file `start.js`:

```bash
pm run build         # Jika aplikasi Anda perlu dibuild terlebih dahulu
pm install           # Pastikan semua dependensi sudah terpasang
pm start             # Atau jalankan script start jika ada

# Atau langsung dengan PM2
pm2 start start.js   # Menjalankan start.js dengan PM2
```

## Contoh Perintah PM2 Lainnya

- Melihat daftar aplikasi yang dijalankan:
  ```bash
  pm2 list
  ```
- Melihat log aplikasi:
  ```bash
  pm2 logs
  ```
- Menghentikan aplikasi:
  ```bash
  pm2 stop start
  ```
- Merestart aplikasi:
  ```bash
  pm2 restart start
  ```
- Menghapus aplikasi dari PM2:
  ```bash
  pm2 delete start
  ```

## Monitoring Melalui pm2.io

1. Daftar akun di [https://pm2.io/](https://pm2.io/)
2. Jalankan perintah berikut di terminal untuk menghubungkan PM2 dengan dashboard pm2.io:
   ```bash
   pm2 link
   ```
   Ikuti instruksi yang diberikan (masukkan public dan secret key dari dashboard pm2.io).
3. Setelah terhubung, Anda dapat memonitor aplikasi Anda secara real-time melalui dashboard pm2.io.

## Dokumentasi Resmi

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [PM2 Monitoring (pm2.io)](https://pm2.io/)
