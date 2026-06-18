import type { Message, TextChannel } from "discord.js";
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { addWarn, getWarns, clearWarns } from "../lib/warns.js";

function ms(str: string): number | null {
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;
  const n = parseInt(match[1]!);
  const unit = match[2];
  if (unit === "s") return n * 1000;
  if (unit === "m") return n * 60 * 1000;
  if (unit === "h") return n * 3600 * 1000;
  if (unit === "d") return n * 86400 * 1000;
  return null;
}

export async function handleKick(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.KickMembers)) {
    await message.reply("You need **Kick Members** permission."); return;
  }
  const target = message.mentions.members?.first();
  if (!target) { await message.reply("Mention a user.\nUsage: `!kick @user [reason]`"); return; }
  if (!target.kickable) { await message.reply("I can't kick that user."); return; }
  const reason = args.slice(1).join(" ") || "No reason provided";
  await target.kick(reason);
  await message.reply(`👢 **${target.user.tag}** was kicked. Reason: ${reason}`);
}

export async function handleBan(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
    await message.reply("You need **Ban Members** permission."); return;
  }
  const target = message.mentions.members?.first();
  if (!target) { await message.reply("Mention a user.\nUsage: `!ban @user [reason]`"); return; }
  if (!target.bannable) { await message.reply("I can't ban that user."); return; }
  const reason = args.slice(1).join(" ") || "No reason provided";
  await target.ban({ reason });
  await message.reply(`🔨 **${target.user.tag}** was banned. Reason: ${reason}`);
}

export async function handleUnban(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
    await message.reply("You need **Ban Members** permission."); return;
  }
  const userId = args[0];
  if (!userId) { await message.reply("Usage: `!unban <userId>`"); return; }
  try {
    await message.guild?.bans.remove(userId);
    await message.reply(`✅ User \`${userId}\` was unbanned.`);
  } catch {
    await message.reply("Couldn't unban. Make sure the ID is correct.");
  }
}

export async function handleWarn(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
    await message.reply("You need **Manage Messages** permission."); return;
  }
  const target = message.mentions.users.first();
  if (!target) { await message.reply("Mention a user.\nUsage: `!warn @user <reason>`"); return; }
  const reason = args.slice(1).join(" ") || "No reason provided";
  const count = addWarn(target.id, reason, message.author.tag);
  await message.reply(`⚠️ **${target.tag}** has been warned. Total warnings: **${count}**\nReason: ${reason}`);
}

export async function handleWarnings(message: Message): Promise<void> {
  const target = message.mentions.users.first() ?? message.author;
  const warns = getWarns(target.id);
  if (!warns.length) { await message.reply(`✅ **${target.username}** has no warnings.`); return; }
  const embed = new EmbedBuilder()
    .setTitle(`⚠️ Warnings for ${target.username}`)
    .setColor(0xf39c12)
    .setDescription(
      warns.map((w, i) =>
        `**${i + 1}.** ${w.reason}\n— by ${w.moderator} on <t:${Math.floor(w.timestamp / 1000)}:D>`
      ).join("\n\n")
    );
  await message.reply({ embeds: [embed] });
}

export async function handleClearWarn(message: Message): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
    await message.reply("You need **Manage Messages** permission."); return;
  }
  const target = message.mentions.users.first();
  if (!target) { await message.reply("Mention a user.\nUsage: `!clearwarn @user`"); return; }
  clearWarns(target.id);
  await message.reply(`✅ Cleared all warnings for **${target.username}**.`);
}

export async function handleMute(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.MuteMembers)) {
    await message.reply("You need **Mute Members** permission."); return;
  }
  const target = message.mentions.members?.first();
  if (!target) { await message.reply("Mention a user.\nUsage: `!mute @user [duration] [reason]`"); return; }

  const durationStr = args[1];
  const duration = durationStr ? ms(durationStr) : null;
  const reason = args.slice(duration !== null ? 2 : 1).join(" ") || "No reason";

  await target.timeout(duration ?? 10 * 60 * 1000, reason);
  const timeStr = duration ? `for ${durationStr}` : "for 10 minutes";
  await message.reply(`🔇 **${target.user.tag}** has been muted ${timeStr}. Reason: ${reason}`);
}

export async function handleUnmute(message: Message): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.MuteMembers)) {
    await message.reply("You need **Mute Members** permission."); return;
  }
  const target = message.mentions.members?.first();
  if (!target) { await message.reply("Mention a user.\nUsage: `!unmute @user`"); return; }
  await target.timeout(null);
  await message.reply(`🔊 **${target.user.tag}** has been unmuted.`);
}

export async function handleSlowmode(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await message.reply("You need **Manage Channels** permission."); return;
  }
  const seconds = parseInt(args[0] ?? "0", 10);
  if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
    await message.reply("Provide a number between 0 and 21600.\nUsage: `!slowmode <seconds>`"); return;
  }
  await (message.channel as TextChannel).setRateLimitPerUser(seconds);
  await message.reply(seconds === 0 ? "✅ Slowmode disabled." : `✅ Slowmode set to **${seconds}s**.`);
}

export async function handleLock(message: Message): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await message.reply("You need **Manage Channels** permission."); return;
  }
  const ch = message.channel as TextChannel;
  await ch.permissionOverwrites.edit(message.guild!.id, { SendMessages: false });
  await message.reply("🔒 Channel locked.");
}

export async function handleUnlock(message: Message): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await message.reply("You need **Manage Channels** permission."); return;
  }
  const ch = message.channel as TextChannel;
  await ch.permissionOverwrites.edit(message.guild!.id, { SendMessages: true });
  await message.reply("🔓 Channel unlocked.");
}

export async function handlePurge(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
    await message.reply("You need **Manage Messages** permission."); return;
  }
  const amount = parseInt(args[0] ?? "", 10);
  if (isNaN(amount) || amount < 1 || amount > 100) {
    await message.reply("Provide a number between 1 and 100.\nUsage: `!purge <amount>`"); return;
  }
  await message.delete().catch(() => null);
  const deleted = await (message.channel as TextChannel).bulkDelete(amount, true);
  const reply = await message.channel.send(`🗑️ Deleted **${deleted.size}** messages.`);
  setTimeout(() => reply.delete().catch(() => null), 3000);
}
