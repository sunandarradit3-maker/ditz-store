#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  printf '\n.env sudah ada. Demi keamanan script tidak menimpa file lama.\n'
  printf 'Kalau mau buat ulang: mv .env .env.backup lalu jalankan script ini lagi.\n\n'
  exit 1
fi

command -v openssl >/dev/null 2>&1 || {
  echo 'openssl belum terpasang. Jalankan: apt install -y openssl'
  exit 1
}

printf '\n=== DiTz Store .env Setup ===\n'
read -r -p 'SUPABASE_URL: ' SUPABASE_URL
read -r -s -p 'SUPABASE_SERVICE_ROLE_KEY (tidak tampil): ' SUPABASE_SERVICE_ROLE_KEY
printf '\n'
read -r -p 'ADMIN_USERNAME [admin]: ' ADMIN_USERNAME
ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
read -r -s -p 'ADMIN_PASSWORD sementara (tidak tampil): ' ADMIN_PASSWORD
printf '\n'
read -r -p 'Nomor WhatsApp format 628xxxx: ' NEXT_PUBLIC_WHATSAPP_NUMBER
read -r -p 'Nama toko [DiTz Store]: ' NEXT_PUBLIC_STORE_NAME
NEXT_PUBLIC_STORE_NAME=${NEXT_PUBLIC_STORE_NAME:-DiTz Store}

if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_SERVICE_ROLE_KEY" || -z "$ADMIN_PASSWORD" ]]; then
  echo 'SUPABASE_URL, SERVICE_ROLE_KEY, dan ADMIN_PASSWORD wajib diisi.'
  exit 1
fi

SESSION_SECRET=$(openssl rand -hex 48)

cat > .env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SESSION_SECRET=$SESSION_SECRET
ADMIN_USERNAME=$ADMIN_USERNAME
ADMIN_PASSWORD=$ADMIN_PASSWORD
NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER
NEXT_PUBLIC_STORE_NAME=$NEXT_PUBLIC_STORE_NAME
EOF

chmod 600 .env

printf '\n.env berhasil dibuat dengan permission 600.\n'
printf 'Secret tidak dipush ke GitHub karena .env sudah di-ignore.\n'
printf 'Selanjutnya jalankan:\n  npm install\n  npm run build\n  npm start\n\n'
