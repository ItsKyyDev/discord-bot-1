const fs = require('fs');
const { Client, GatewayIntentBits, Partials, PermissionsBitField, ActivityType } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.GuildMember]
});

const PREFIX = '.';
const CONFIG_FILE = 'config.json';

// Konfigurasi akses, hanya id yang ada di list yang dapat mengakses command yang terdapat di bot
const allowedUserIDs = ['ur id'];
const allowedRoleIDs = ['ur role id'];

// Load 
let config = {};
if (fs.existsSync(CONFIG_FILE)) {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE));
} else {
    config = { welcome: {}, autorole: {}, status: { type: 'LISTENING', message: 'Admin Tools | .menu' } };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// cek apakah user memiliki otoritas 
function isAuthorized(member) {
    if (allowedUserIDs.includes(member.id)) return true;
    return member.roles.cache.some(role => allowedRoleIDs.includes(role.id));
}

function saveConfig() {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// 📥 Command handler
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (!isAuthorized(message.member)) {
        return message.reply('🚫 Kamu tidak memiliki izin untuk menggunakan perintah ini.');
    }

    // .setnick @user newname
    if (command === 'setnick') {
        const target = message.mentions.members.first();
        const newNick = args.slice(1).join(' ');
        if (!target || !newNick) {
            return message.reply('❗ Format: .setnick @user NamaBaru');
        }
        try {
            await target.setNickname(newNick);
            message.reply(`✅ Nickname ${target.user.tag} diubah jadi **${newNick}**`);
        } catch (err) {
            console.error(err);
            message.reply('❌ Gagal mengganti nickname. Bot mungkin tidak punya izin.');
        }
    }

    // .addrole @user @role
    if (command === 'addrole') {
        const target = message.mentions.members.first();
        const role = message.mentions.roles.first();

        if (!target || !role) {
            return message.reply('❗ Format: .addrole @user @role');
        }

        try {
            await target.roles.add(role);
            message.reply(`✅ Role **${role.name}** ditambahkan ke ${target.user.tag}`);
        } catch (err) {
            console.error(err);
            message.reply('❌ Gagal menambahkan role. Cek posisi role dan izin bot.');
        }
    }

    // .removerole @user @role
    if (command === 'removerole') {
        const target = message.mentions.members.first();
        const role = message.mentions.roles.first();

        if (!target || !role) {
            return message.reply('❗ Format: .removerole @user @role');
        }

        try {
            await target.roles.remove(role);
            message.reply(`✅ Role **${role.name}** dihapus dari ${target.user.tag}`);
        } catch (err) {
            console.error(err);
            message.reply('❌ Gagal menghapus role. Cek posisi role dan izin bot.');
        }
    }

    // .setwelcome #channel
    if (command === 'setwelcome') {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply('❗ Format: .setwelcome #channel');
        config.welcome[message.guild.id] = channel.id;
        saveConfig();
        message.reply(`✅ Channel welcome diatur ke <#${channel.id}>`);
    }

    // .setautorole @role
    if (command === 'setautorole') {
        const role = message.mentions.roles.first();
        if (!role) return message.reply('❗ Format: .setautorole @role');
        config.autorole[message.guild.id] = role.id;
        saveConfig();
        message.reply(`✅ Auto role diatur ke **${role.name}**`);
    }

    // .clear
    if (command === 'clear') {
        try {
            const clone = await message.channel.clone();
            await message.channel.delete();
            clone.send('✅ Channel berhasil direset.');
        } catch (err) {
            console.error(err);
            message.reply('❌ Gagal reset channel. Cek izin bot.');
        }
    }

    // .delete / hapus sekalian dengan .delete nya
    if (command === 'delete') {
        if (!message.reference) return message.reply('❗ Gunakan perintah ini sebagai reply ke pesan yang ingin dihapus.');
        try {
            const msg = await message.channel.messages.fetch(message.reference.messageId);
            await msg.delete();
            await message.delete();
        } catch (err) {
            console.error(err);
            message.reply('❌ Tidak dapat menghapus pesan.');
        }
    }

    // .setstatus <tipe> | <pesan>
    if (command === 'setstatus') {
        const raw = args.join(' ').split('|');
        if (raw.length !== 2) return message.reply('❗ Format: .setstatus <tipe> | <pesan>');

        const typeStr = raw[0].trim().toUpperCase();
        const msg = raw[1].trim();

        const typeMap = {
            PLAYING: ActivityType.Playing,
            LISTENING: ActivityType.Listening,
            WATCHING: ActivityType.Watching,
            COMPETING: ActivityType.Competing
        };

        const activityType = typeMap[typeStr];
        if (!activityType) return message.reply('❗ Tipe tidak valid. Gunakan: playing, listening, watching, competing');

        try {
            client.user.setActivity(msg, { type: activityType });
            config.status = { type: typeStr, message: msg };
            saveConfig();
            message.reply(`✅ Status bot diatur ke: ${typeStr} ${msg}`);
        } catch (err) {
            console.error(err);
            message.reply('❌ Gagal mengubah status.');
        }
    }

    // .menu / kalian bisa mengubahnya untuk menyesuaikan dengan bot kalian ndog
    if (command === 'menu') {
        message.reply(`
📘 *Admin Commands:*
- \`.setnick @user NamaBaru\` → Ganti nickname
- \`.addrole @user @role\` → Tambah role ke user
- \`.removerole @user @role\` → Hapus role dari user
- \`.setwelcome #channel\` → Atur channel welcome
- \`.setautorole @role\` → Atur role otomatis untuk member baru
- \`.clear\` → Reset channel dan hapus semua pesan
- \`.delete\` (reply) → Hapus pesan yang direply dan perintahnya juga
- \`.setstatus <tipe> | <pesan>\` → Ubah status bot

🔐 Hanya <@fill with ur id> dan role <@&fill with ur role id> yang bisa menggunakan command ini.
Chat <@fill with ur id> jika ingin memiliki role <@&fill with ur role id>.
        `);
    }
});

// ketika ada ndog nya member join
client.on('guildMemberAdd', async (member) => {
    const guildId = member.guild.id;

    // Welcome message
    const welcomeChannelId = config.welcome[guildId];
    if (welcomeChannelId) {
        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (channel) {
            channel.send(`👋 Selamat datang, <@${member.id}> di **${member.guild.name}**!`);
        }
    }

    // Auto role saat join ke server
    const autoRoleId = config.autorole[guildId];
    if (autoRoleId) {
        const role = member.guild.roles.cache.get(autoRoleId);
        if (role) {
            try {
                await member.roles.add(role);
                console.log(`✅ Berhasil memberi role ke ${member.user.tag}`);
            } catch (err) {
                console.error(`❌ Gagal memberi role ke ${member.user.tag}`, err);
            }
        }
    }
});

// Login
client.once('ready', () => {
    console.log(`✅ Bot aktif sebagai ${client.user.tag}`);
    const status = config.status || { type: 'LISTENING', message: 'Admin Tools | .menu' };
    const typeMap = {
        PLAYING: ActivityType.Playing,
        LISTENING: ActivityType.Listening,
        WATCHING: ActivityType.Watching,
        COMPETING: ActivityType.Competing
    };
    client.user.setActivity(status.message, { type: typeMap[status.type] || ActivityType.Listening });
});

client.login('fill_your_token_here');
