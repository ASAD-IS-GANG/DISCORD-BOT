import type { Message } from "discord.js";
import { EmbedBuilder } from "discord.js";

export async function handleServerInfo(message: Message): Promise<void> {
  const guild = message.guild;
  if (!guild) return;
  const embed = new EmbedBuilder()
    .setTitle(guild.name)
    .setThumbnail(guild.iconURL())
    .setColor(0x5865f2)
    .addFields(
      { name: "👑 Owner",     value: `<@${guild.ownerId}>`,         inline: true },
      { name: "👥 Members",   value: `${guild.memberCount}`,         inline: true },
      { name: "💬 Channels",  value: `${guild.channels.cache.size}`, inline: true },
      { name: "🎭 Roles",     value: `${guild.roles.cache.size}`,    inline: true },
      { name: "😀 Emojis",    value: `${guild.emojis.cache.size}`,   inline: true },
      { name: "🌍 Region",    value: guild.preferredLocale,          inline: true },
      { name: "📅 Created",   value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
      { name: "💎 Boosts",    value: `${guild.premiumSubscriptionCount ?? 0}`, inline: true },
    )
    .setFooter({ text: `ID: ${guild.id}` });
  await message.reply({ embeds: [embed] });
}

export async function handleUserInfo(message: Message): Promise<void> {
  const target = message.mentions.members?.first() ?? message.member;
  if (!target) return;
  const user = target.user;
  const embed = new EmbedBuilder()
    .setTitle(user.tag)
    .setThumbnail(user.displayAvatarURL())
    .setColor(0x5865f2)
    .addFields(
      { name: "🆔 ID",              value: user.id,              inline: true },
      { name: "🤖 Bot",             value: user.bot ? "Yes" : "No", inline: true },
      { name: "📅 Account Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
      { name: "📥 Joined Server",   value: target.joinedTimestamp ? `<t:${Math.floor(target.joinedTimestamp / 1000)}:D>` : "Unknown", inline: true },
      { name: "🎭 Top Role",        value: `${target.roles.highest}`, inline: true },
      { name: "🎨 Roles",           value: target.roles.cache.filter((r) => r.name !== "@everyone").map((r) => `${r}`).join(", ") || "None" },
    )
    .setFooter({ text: `Requested by ${message.author.tag}` });
  await message.reply({ embeds: [embed] });
}

export async function handleAvatar(message: Message): Promise<void> {
  const target = message.mentions.users.first() ?? message.author;
  const embed = new EmbedBuilder()
    .setTitle(`🖼️ ${target.username}'s Avatar`)
    .setImage(target.displayAvatarURL({ size: 512 }))
    .setColor(0x5865f2);
  await message.reply({ embeds: [embed] });
}

export async function handlePing(message: Message): Promise<void> {
  const sent = await message.reply("🏓 Pinging...");
  const latency = sent.createdTimestamp - message.createdTimestamp;
  const wsLatency = message.client.ws.ping;
  await sent.edit(
    `🏓 **Pong!**\n📡 Message Latency: **${latency}ms**\n💙 API Latency: **${wsLatency}ms**`
  );
}

export async function handleBotInfo(message: Message): Promise<void> {
  const client = message.client;
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);
  const embed = new EmbedBuilder()
    .setTitle(`🤖 ${client.user!.username}`)
    .setThumbnail(client.user!.displayAvatarURL())
    .setColor(0x5865f2)
    .addFields(
      { name: "📡 Ping",     value: `${client.ws.ping}ms`,                 inline: true },
      { name: "⏰ Uptime",   value: `${h}h ${m}m ${s}s`,                   inline: true },
      { name: "🌐 Servers",  value: `${client.guilds.cache.size}`,          inline: true },
      { name: "👥 Users",    value: `${client.users.cache.size}`,           inline: true },
      { name: "🟢 Status",   value: "Online",                               inline: true },
      { name: "📅 Created",  value: `<t:${Math.floor(client.user!.createdTimestamp / 1000)}:D>`, inline: true },
    )
    .setFooter({ text: "Built with discord.js v14" });
  await message.reply({ embeds: [embed] });
}
