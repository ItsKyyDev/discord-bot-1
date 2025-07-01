# 🤖 Discord Admin Tools Bot by ItsKyyDev

Bot Discord ini dikembangkan oleh **ItsKyyDev** dengan bantuan ChatGPT dan referensi open source lainnya.  
Anda bebas menggunakan, memodifikasi, dan mengembangkan bot ini sesuai kebutuhan Anda.

---

## 🚀 Fitur Utama

| Perintah | Deskripsi |
|----------|-----------|
| `.setnick @user NamaBaru` | Mengganti nickname user. |
| `.addrole @user @role` | Menambahkan role ke user. |
| `.removerole @user @role` | Menghapus role dari user. |
| `.setwelcome #channel` | Mengatur channel sambutan untuk member baru. |
| `.setautorole @role` | Memberikan role otomatis saat member join. |
| `.clear` | Menghapus semua pesan dalam channel. |
| `.delete (reply)` | Menghapus pesan yang di-reply. |
| `.setstatus <tipe> <pesan>` | Mengatur status bot (Playing, Watching, Listening). |
| `.menu` | Menampilkan daftar perintah admin. |

---

## 🔐 Hak Akses Perintah

Hanya **user tertentu** dan **role tertentu** yang diizinkan menjalankan perintah admin.  
Silakan sesuaikan `allowedUserIDs` dan `allowedRoleIDs` di file konfigurasi bot.

---

## 📫 Kontak
Nama: ItsKyyDev
📧 Email: itskyy.dev@gmail.com

🌐 GitHub: https://github.com/ItsKyyDev

---

## 🛠️ Cara Instalasi & Menjalankan

```bash
git clone https://github.com/ItsKyyDev/admin-discord-bot.git
cd admin-discord-bot
npm install
node index.js
