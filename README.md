# File Compressor
Project untuk mengompres berbagai jenis file agar ukuran file menjadi lebih kecil.
Project ini masih dalam tahap pengembangan dan dibuat untuk belajar membuat project menggunakan GitHub sekaligus belajar tentang bagaimana proses kompresi file bekerja.

## Tentang Project
File Compressor nantinya akan menjadi sebuah aplikasi yang dapat digunakan untuk mengurangi ukuran file tanpa harus menggunakan banyak aplikasi berbeda. Pengguna dapat memasukkan file, memilih tingkat kompresi yang diinginkan, lalu mendapatkan file hasil kompresi. Project ini ditujukan untuk penggunaan sederhana seperti mengurangi ukuran foto, video, audio, GIF, dan beberapa jenis file lainnya.

## File yang ingin didukung
Beberapa format file yang direncanakan untuk didukung:
- JPG / JPEG
- PNG
- WebP
- GIF
- MP4
- MP3
- WAV
- OGG
- dan format lainnya
Dukungan untuk setiap format akan ditambahkan secara bertahap selama project dikembangkan.

## Fitur yang ingin dibuat
- Kompres file
- Mengubah format file
- Mengompres beberapa file sekaligus
- Melihat ukuran file sebelum dikompres
- Melihat ukuran file setelah dikompres
- Melihat berapa banyak ukuran file yang berhasil dikurangi
- Memilih tingkat kualitas kompresi
- Memilih lokasi penyimpanan file hasil kompresi

## Cara Kerja
Secara sederhana, prosesnya akan seperti ini:
1. Pengguna memilih file.
2. Program mendeteksi jenis file tersebut.
3. Program menentukan metode kompresi yang sesuai.
4. Pengguna memilih tingkat kompresi atau kualitas.
5. File diproses.
6. Program membuat file hasil kompresi.
7. Ukuran file sebelum dan sesudah kompresi ditampilkan.
Contoh:
```text
File asli:
video.mp4
Ukuran: 100 MB

        ↓
    Kompresi

File hasil:
video_compressed.mp4
Ukuran: 40 MB

Ukuran berkurang: 60 MB
