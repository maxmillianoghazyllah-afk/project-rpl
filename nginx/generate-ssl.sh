#!/bin/bash
# Skrip Generator Self-Signed SSL Certificate untuk Deployment IP Address
# Cocok untuk VPS (Ubuntu/Debian) dan SBC (Raspberry Pi / Orange Pi)

SSL_DIR="./nginx/ssl"
mkdir -p "$SSL_DIR"

echo "🔐 Menghasilkan sertifikat SSL mandiri (Self-Signed) untuk IP / Domain..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$SSL_DIR/kantin.key" \
  -out "$SSL_DIR/kantin.crt" \
  -subj "/C=ID/ST=Jawa Barat/L=Bandung/O=KantinQueue/OU=IT/CN=kantin.local"

chmod 600 "$SSL_DIR/kantin.key"
chmod 644 "$SSL_DIR/kantin.crt"

echo "✅ Sertifikat SSL berhasil dibuat:"
echo "   - Private Key: $SSL_DIR/kantin.key"
echo "   - Certificate: $SSL_DIR/kantin.crt"
