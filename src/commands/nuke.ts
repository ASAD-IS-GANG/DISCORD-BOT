import type { Message, TextChannel, VoiceChannel } from "discord.js";
import { ChannelType, PermissionFlagsBits } from "discord.js";

interface SavedChannel {
  name: string;
  type: ChannelType;
  position: number;
  parentId: string | null;
}

export async function handleNuke(message: Message): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    await message.reply("You need **Administrator** permission to use this command.");
    return;
  }

  const guild = message.guild;
  if (!guild) return;

  const confirm = await message.reply(
    "⚠️ **WARNING:** This will delete ALL channels and recreate them.\nReply with `yes` within 10 seconds to confirm.",
  );

  const filter = (m: Message) =>
    m.author.id === message.author.id && m.content.toLowerCase() === "yes";

  const collected = await message.channel
    .awaitMessages({ filter, max: 1, time: 10_000 })
    .catch(() => null);

  await confirm.delete().catch(() => null);

  if (!collected || collected.size === 0) {
    await message.channel.send("❌ Nuke cancelled.");
    return;
  }

  const savedChannels: SavedChannel[] = guild.channels.cache
    .filter(
      (c) =>
        c.type === ChannelType.GuildText ||
        c.type === ChannelType.GuildVoice ||
        c.type === ChannelType.GuildCategory,
    )
    .map((c) => ({
      name: c.name,
      type: c.type,
      position: c.position,
      parentId:
        c.type !== ChannelType.GuildCategory
          ? (c as TextChannel | VoiceChannel).parentId
          : null,
    }))
    .sort((a, b) => a.position - b.position);

  await Promise.allSettled(
    guild.channels.cache.map((c) => c.delete().catch(() => null)),
  );

  const categoryMap = new Map<string, string>();

  const categories = savedChannels.filter(
    (c) => c.type === ChannelType.GuildCategory,
  );
  const others = savedChannels.filter(
    (c) => c.type !== ChannelType.GuildCategory,
  );

  await Promise.allSettled(
    categories.map(async (c) => {
      const created = await guild.channels.create({
        name: c.name,
        type: ChannelType.GuildCategory,
      });
      categoryMap.set(c.name, created.id);
    }),
  );

  const newChannels = await Promise.allSettled(
    others.map((c) =>
      guild.channels.create({
        name: c.name,
        type: c.type as ChannelType.GuildText | ChannelType.GuildVoice,
        parent: c.parentId ? categoryMap.get(
          savedChannels.find((s) => s.type === ChannelType.GuildCategory && s.position < c.position)?.name ?? "",
        ) : undefined,
      }),
    ),
  );

  const textChannels = newChannels
    .filter(
      (r): r is PromiseFulfilledResult<TextChannel> =>
        r.status === "fulfilled" &&
        (r.value as TextChannel).type === ChannelType.GuildText,
    )
    .map((r) => r.value as TextChannel);

  await Promise.allSettled(
    textChannels.map((ch) =>
      ch.send(`@everyone 💣 Server has been nuked and reset by <@${message.author.id}>!`),
    ),
  );
}
