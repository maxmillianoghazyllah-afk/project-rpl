#!/bin/bash
# ==============================================================================
# Skrip Auto-Kiosk Layar Monitor TV Kantin untuk Raspberry Pi / Orange Pi
# Membuka Layar Display Antrean 3 Kolom Fullscreen saat booting tanpa screensaver
# ==============================================================================

# Matikan screen blanking dan screensaver
xset s noblank
xset s off
xset -dpms

# Sembunyikan kursor mouse saat idle
unclutter -idle 0.5 -root &

# Bersihkan sesi chromium crash sebelumnya
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/Default/Preferences
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences

# Buka Chromium dalam mode Kiosk Fullscreen
# URL otomatis mengarah ke Layar Display Monitor Antrean
DISPLAY_URL="https://localhost/kantin/seller/display"

chromium-browser \
  --noerrdialogs \
  --disable-infobars \
  --kiosk \
  --ignore-certificate-errors \
  --check-for-update-interval=31536000 \
  "$DISPLAY_URL"
