@echo off
REM Generator SSL Certificate Mandiri (Windows)
if not exist nginx\ssl mkdir nginx\ssl
echo 🔐 Menghasilkan sertifikat SSL mandiri...
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx\ssl\kantin.key -out nginx\ssl\kantin.crt -subj "/C=ID/ST=Jawa Barat/L=Bandung/O=KantinQueue/OU=IT/CN=kantin.local"
echo ✅ Sertifikat SSL berhasil dibuat di nginx\ssl\
