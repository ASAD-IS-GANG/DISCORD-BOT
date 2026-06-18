import type { Message, TextChannel } from "discord.js";
import { PermissionFlagsBits } from "discord.js";

export async function handlePurge(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
    await message.reply("You need the **Manage Messages** permission.");
    return;
  }

  const amount = parseInt(args[0] ?? "", 10);
  if (isNaN(amount) || amount < 1 || amount > 100) {
    await message.reply("Please provide a number between 1 and 100.\nUsage: `!purge <amount>`");
    return;
  }

  await message.delete().catch(() => null);
  const deleted = await (message.channel as TextChannel).bulkDelete(amount, true);
  const reply = await message.channel.send(`🗑️ Deleted **${deleted.size}** message(s).`);
  setTimeout(() => reply.delete().catch(() => null), 3000);
}
