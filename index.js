const { Client, GatewayIntentBits, Partials, ChannelType, ButtonBuilder, ButtonStyle, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require("discord.js");
const config = require("./config.js");
const kasaconfig = require('./kasaconfig.json');
const moment = require("moment")
const fs = require('fs');
moment.locale("tr")

const client = new Client({
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.ThreadMember,
  ],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
});

module.exports = client;

require("./events/message.js")
require("./events/ready.js")



client.login(config.token).catch(e => {
  console.log("The Bot Token You Entered Into Your Project Is Incorrect Or Your Bot's INTENTS Are OFF!")
})

const gunlukKullanimlar = {};

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Botların mesajları işlememesi için kontrol
  if (!message.guild) return; // Özel mesajları işlememesi için kontrol

  const komut = message.content.toLowerCase().split(' ');

  if (komut[0] === '!kasaac') {
    // Geçerli bir kasa komutu girilmediyse kullanıcıya hata mesajı gönderin
    if (!komut[1]) {
      return message.channel.send('Kasa türü belirtmediniz. Örneğin: `!kasaac vipkasa`');
    }

    // Kasa türünü kullanıcının girdiği komuta göre belirleyin
    const kasaTuru = komut[1].toLowerCase();
    const kasa = kasaconfig.kasalar.find(kasa => kasa.isim.toLowerCase() === kasaTuru);

    // Kasa türü geçerli değilse hata mesajı gönderin
    if (!kasa) {
      return message.channel.send('Geçerli bir kasa türü belirtmediniz. Örneğin: `!kasaac vipkasa`');
    }

    // Rol kontrolü ekleyin
    const requiredRoleID = kasa.rolID;
    const requiredRole = message.guild.roles.cache.get(requiredRoleID);

    if (!requiredRole) {
      return message.channel.send('Bu komutu kullanmak için gerekli rol bulunamadı. Lütfen ayarlarınızı kontrol edin.');
    }

    if (!message.member.roles.cache.has(requiredRole.id)) {
      return message.channel.send('Bu komutu kullanmak için gerekli role sahip değilsiniz.');
    }

    // Günlük kullanım kontrolü
    if (kasa.gunlukKullanim) {
      const gunlukKullanimKey = `${message.author.id}-${kasa.isim}`;
      if (gunlukKullanimlar[gunlukKullanimKey]) {
        return message.channel.send('Bu kasa günlük olarak yalnızca bir kez açılabilir.');
      }
      gunlukKullanimlar[gunlukKullanimKey] = true;

      // 24 saat sonra kullanımın sıfırlanması
      setTimeout(() => {
        delete gunlukKullanimlar[gunlukKullanimKey];
      }, 24 * 60 * 60 * 1000);
    }

    // Kasa mesajlarını dosyadan oku
    try {
      const kasaMesajlar = fs.readFileSync(kasa.mesajlarDosya, 'utf8').split('\n');
      const rastgeleMesaj = kasaMesajlar[Math.floor(Math.random() * kasaMesajlar.length)];

      // Kasa mesajını kullanıcıya DM yoluyla gönder
      await message.author.send(rastgeleMesaj);
      message.channel.send(`${kasa.isim} açıldı ve bir mesaj aldınız!`);
    } catch (err) {
      message.channel.send(`${kasa.isim} dosyası bulunamadı veya okunamadı. Lütfen dosya adını ve içeriği kontrol edin.`);
      console.error(err);
    }
  }
});