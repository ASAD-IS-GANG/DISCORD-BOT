import type { Message } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { getLevel, getLevelLeaderboard, xpForLevel } from "../lib/leveling.js";

export async function handleRank(message: Message): Promise<void> {
  const target = message.mentions.users.first() ?? message.author;
  const data = getLevel(target.id);
  const nextLevelXp = xpForLevel(data.level + 1);
  const progress = Math.floor((data.xp / nextLevelXp) * 20);
  const bar = "█".repeat(progress) + "░".repeat(20 - progress);

  const embed = new EmbedBuilder()
    .setTitle(`📊 ${target.username}'s Rank`)
    .setThumbnail(target.displayAvatarURL())
    .setColor(0x5865f2)
    .addFields(
      { name: "🏅 Level",    value: `**${data.level}**`,                                  inline: true },
      { name: "✨ XP",       value: `${data.xp.toLocaleString()} / ${nextLevelXp.toLocaleString()}`, inline: true },
      { name: "📈 Total XP", value: `${data.totalXp.toLocaleString()}`,                   inline: true },
    )
    .setDescription(`\`${bar}\``);
  await message.reply({ embeds: [embed] });
}

export async function handleXPLeaderboard(message: Message): Promise<void> {
  const top = getLevelLeaderboard();
  if (!top.length) { await message.reply("No leveling data yet — start chatting!"); return; }
  const medals = ["🥇", "🥈", "🥉"];
  const lines = await Promise.all(
    top.map(async (e, i) => {
      const user = await message.client.users.fetch(e.userId).catch(() => null);
      const name = user?.username ?? `Unknown`;
      return `${medals[i] ?? `**${i + 1}.**`} ${name} — Level **${e.level}** (${e.totalXp.toLocaleString()} XP)`;
    }),
  );
  const embed = new EmbedBuilder()
    .setTitle("📊 XP Leaderboard")
    .setColor(0x5865f2)
    .setDescription(lines.join("\n"));
  await message.reply({ embeds: [embed] });
}
