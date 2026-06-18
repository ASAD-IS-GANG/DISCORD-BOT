import type { Message } from "discord.js";
import { PermissionFlagsBits, EmbedBuilder, type TextChannel } from "discord.js";

export async function handleSay(message: Message, args: string[]): Promise<void> {
  if (
    !message.member?.permissions.has(PermissionFlagsBits.ManageMessages) &&
    !message.member?.permissions.has(PermissionFlagsBits.Administrator)
  ) {
    await message.reply("❌ You need **Manage Messages** permission to use `!say`.");
    return;
  }

  if (!args.length) {
    await message.reply("❌ Usage: `!say <message>` or `!say #channel <message>`");
    return;
  }

  let targetChannel: TextChannel = message.channel as TextChannel;
  let textStart = 0;

  const mentionedChannel = message.mentions.channels.first() as TextChannel | undefined;
  if (mentionedChannel) {
    targetChannel = mentionedChannel;
    textStart = 1;
  }

  const text = args.slice(textStart).join(" ").trim();
  if (!text) {
    await message.reply("❌ Please provide a message to say.");
    return;
  }

  await targetChannel.send(text);
  if (targetChannel.id !== message.channel.id) {
    await message.reply(`✅ Message sent to <#${targetChannel.id}>.`);
  }
  await message.delete().catch(() => null);
}

export async function handleEmbedsay(message: Message, args: string[]): Promise<void> {
  if (
    !message.member?.permissions.has(PermissionFlagsBits.ManageMessages) &&
    !message.member?.permissions.has(PermissionFlagsBits.Administrator)
  ) {
    await message.reply("❌ You need **Manage Messages** permission to use `!embedsay`.");
    return;
  }

  if (!args.length) {
    await message.reply(
      "❌ Usage: `!embedsay <title> | <description>`\n" +
      "Example: `!embedsay Welcome! | Thanks for joining our server.`"
    );
    return;
  }

  let targetChannel: TextChannel = message.channel as TextChannel;
  let textStart = 0;

  const mentionedChannel = message.mentions.channels.first() as TextChannel | undefined;
  if (mentionedChannel) {
    targetChannel = mentionedChannel;
    textStart = 1;
  }

  const fullText = args.slice(textStart).join(" ");
  const parts = fullText.split("|").map((p) => p.trim());
  const title = parts[0] ?? "";
  const description = parts[1] ?? parts[0] ?? "";

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTimestamp();

  if (parts.length >= 2) {
    embed.setTitle(title).setDescription(description);
  } else {
    embed.setDescription(description);
  }

  await targetChannel.send({ embeds: [embed] });
  if (targetChannel.id !== message.channel.id) {
    await message.reply(`✅ Embed sent to <#${targetChannel.id}>.`);
  }
  await message.delete().catch(() => null);
}

export async function handleAnnounce(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    await message.reply("❌ You need **Administrator** permission to use `!announce`.");
    return;
  }

  if (!args.length) {
    await message.reply("❌ Usage: `!announce <message>` or `!announce #channel <message>`");
    return;
  }

  let targetChannel: TextChannel = message.channel as TextChannel;
  let textStart = 0;

  const mentionedChannel = message.mentions.channels.first() as TextChannel | undefined;
  if (mentionedChannel) {
    targetChannel = mentionedChannel;
    textStart = 1;
  }

  const text = args.slice(textStart).join(" ").trim();
  if (!text) {
    await message.reply("❌ Please provide an announcement message.");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("📢 Announcement")
    .setDescription(text)
    .setColor(0xe74c3c)
    .setFooter({ text: `Announced by ${message.author.tag}` })
    .setTimestamp();

  await targetChannel.send({ content: "@everyone", embeds: [embed] });
  if (targetChannel.id !== message.channel.id) {
    await message.reply(`✅ Announcement sent to <#${targetChannel.id}>.`);
  }
  await message.delete().catch(() => null);
}
