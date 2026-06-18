import type { Message, Guild, TextChannel } from "discord.js";
import { ChannelType, PermissionFlagsBits } from "discord.js";

export async function handleCreateChannels(
  message: Message,
  args: string[],
): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await message.reply("You need the **Manage Channels** permission to use this command.");
    return;
  }

  if (!message.guild) {
    await message.reply("This command can only be used in a server.");
    return;
  }

  const count = parseInt(args[0] ?? "", 10);
  if (isNaN(count) || count < 1 || count > 50) {
    await message.reply("Please provide a number between 1 and 50.\nUsage: `!createchannels <count> [channel-name]`");
    return;
  }

  const baseName = args.slice(1).join("-").toLowerCase().replace(/\s+/g, "-") || "channel";

  const guild: Guild = message.guild;
  const statusMsg = await message.reply(`Creating ${count} channel(s)... please wait.`);

  const createResults = await Promise.allSettled(
    Array.from({ length: count }, (_, i) =>
      guild.channels.create({
        name: `${baseName}-${i + 1}`,
        type: ChannelType.GuildText,
      }),
    ),
  );

  const created = createResults
    .filter((r): r is PromiseFulfilledResult<TextChannel> => r.status === "fulfilled")
    .map((r) => r.value as TextChannel);

  const failedCount = createResults.filter((r) => r.status === "rejected").length;

  await Promise.allSettled(
    created.map((ch) => ch.send(`@everyone Welcome to ${ch}!`)),
  );

  let summary = `Done! Created **${created.length}** channel(s) and pinged @everyone in each.`;
  if (failedCount > 0) {
    summary += `\n⚠️ Failed to create **${failedCount}** channel(s) (server limit or missing permissions).`;
  }

  await statusMsg.edit(summary);
}
