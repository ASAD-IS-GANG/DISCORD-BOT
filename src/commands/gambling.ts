import type { Message } from "discord.js";
import { EmbedBuilder } from "discord.js";
import {
  getUser,
  addBalance,
  setBalance,
  setLastDaily,
  setLastWork,
  getLeaderboard,
} from "../lib/economy.js";

const COIN = "🪙";
const DAILY_AMOUNT = 1000;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;
const WORK_COOLDOWN = 60 * 60 * 1000;
const STARTING_BALANCE = 500;

const WORK_RESPONSES = [
  "you delivered pizzas", "you walked dogs", "you fixed computers",
  "you drove for Uber", "you flipped burgers", "you mowed lawns",
  "you tutored students", "you washed cars", "you did freelance design",
  "you wrote code all night",
];

const SLOT_EMOJIS = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "7️⃣"];

function parseBet(arg: string | undefined, balance: number): number | null {
  if (!arg) return null;
  if (arg === "all" || arg === "max") return balance;
  if (arg === "half") return Math.floor(balance / 2);
  const n = parseInt(arg, 10);
  if (isNaN(n) || n <= 0) return null;
  return n;
}

function formatMs(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export async function handleBalance(message: Message, args: string[]): Promise<void> {
  const target = message.mentions.users.first() ?? message.author;
  const user = getUser(target.id);
  const embed = new EmbedBuilder()
    .setTitle(`${COIN} ${target.username}'s Wallet`)
    .setThumbnail(target.displayAvatarURL())
    .setColor(0xf1c40f)
    .addFields(
      { name: "💰 Balance",    value: `**${user.balance.toLocaleString()}** coins`, inline: true },
      { name: "📈 Total Won",  value: `${user.totalWon.toLocaleString()} coins`,    inline: true },
      { name: "📉 Total Lost", value: `${user.totalLost.toLocaleString()} coins`,   inline: true },
    );
  await message.reply({ embeds: [embed] });
}

export async function handleDaily(message: Message): Promise<void> {
  const user = getUser(message.author.id);
  const now = Date.now();
  const remaining = DAILY_COOLDOWN - (now - user.lastDaily);

  if (remaining > 0) {
    await message.reply(`⏰ You already claimed your daily! Come back in **${formatMs(remaining)}**.`);
    return;
  }

  setLastDaily(message.author.id);
  const newBal = addBalance(message.author.id, DAILY_AMOUNT);
  const embed = new EmbedBuilder()
    .setTitle("🎁 Daily Reward!")
    .setColor(0x2ecc71)
    .setDescription(`You claimed your daily **${DAILY_AMOUNT.toLocaleString()}** ${COIN} coins!\n💰 New balance: **${newBal.toLocaleString()}** coins`);
  await message.reply({ embeds: [embed] });
}

export async function handleWork(message: Message): Promise<void> {
  const user = getUser(message.author.id);
  const now = Date.now();
  const remaining = WORK_COOLDOWN - (now - user.lastWork);

  if (remaining > 0) {
    await message.reply(`⏰ You're tired! Rest for **${formatMs(remaining)}** before working again.`);
    return;
  }

  const earned = Math.floor(Math.random() * 300) + 100;
  const job = WORK_RESPONSES[Math.floor(Math.random() * WORK_RESPONSES.length)];
  setLastWork(message.author.id);
  const newBal = addBalance(message.author.id, earned);
  const embed = new EmbedBuilder()
    .setTitle("💼 Work Complete!")
    .setColor(0x3498db)
    .setDescription(`You ${job} and earned **${earned}** ${COIN} coins!\n💰 Balance: **${newBal.toLocaleString()}** coins`);
  await message.reply({ embeds: [embed] });
}

export async function handleCoinflip(message: Message, args: string[]): Promise<void> {
  const user = getUser(message.author.id);
  const bet = parseBet(args[0], user.balance);
  const choice = args[1]?.toLowerCase();

  if (!bet || bet > user.balance) {
    await message.reply(`Invalid bet. You have **${user.balance.toLocaleString()}** coins.\nUsage: \`!coinflip <amount|all|half> <heads|tails>\``);
    return;
  }
  if (choice !== "heads" && choice !== "tails") {
    await message.reply("Choose **heads** or **tails**.\nUsage: `!coinflip <amount> <heads|tails>`");
    return;
  }

  const result = Math.random() < 0.5 ? "heads" : "tails";
  const won = result === choice;
  const newBal = addBalance(message.author.id, won ? bet : -bet);

  const embed = new EmbedBuilder()
    .setTitle(won ? "🟢 You Won!" : "🔴 You Lost!")
    .setColor(won ? 0x2ecc71 : 0xe74c3c)
    .setDescription(
      `The coin landed on **${result}** ${result === "heads" ? "🪙" : "🔵"}\n` +
      `You chose **${choice}** — ${won ? `won **+${bet.toLocaleString()}**` : `lost **-${bet.toLocaleString()}**`} coins\n` +
      `💰 Balance: **${newBal.toLocaleString()}** coins`
    );
  await message.reply({ embeds: [embed] });
}

export async function handleSlots(message: Message, args: string[]): Promise<void> {
  const user = getUser(message.author.id);
  const bet = parseBet(args[0], user.balance);

  if (!bet || bet > user.balance) {
    await message.reply(`Invalid bet. You have **${user.balance.toLocaleString()}** coins.\nUsage: \`!slots <amount|all|half>\``);
    return;
  }

  const spin = () => SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)]!;
  const reels = [spin(), spin(), spin()];
  const display = `[ ${reels.join(" | ")} ]`;

  let multiplier = 0;
  let result = "";

  if (reels[0] === "💎" && reels[1] === "💎" && reels[2] === "💎") {
    multiplier = 10; result = "💎 JACKPOT! 💎";
  } else if (reels[0] === "7️⃣" && reels[1] === "7️⃣" && reels[2] === "7️⃣") {
    multiplier = 7; result = "7️⃣ TRIPLE 7s! 7️⃣";
  } else if (reels[0] === reels[1] && reels[1] === reels[2]) {
    multiplier = 3; result = "⭐ Three of a Kind!";
  } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
    multiplier = 1.5; result = "✨ Two of a Kind!";
  } else {
    multiplier = 0; result = "❌ No Match";
  }

  const won = multiplier > 0;
  const payout = won ? Math.floor(bet * multiplier) - bet : -bet;
  const newBal = addBalance(message.author.id, payout);

  const embed = new EmbedBuilder()
    .setTitle("🎰 Slot Machine")
    .setColor(won ? 0xf1c40f : 0xe74c3c)
    .setDescription(
      `**${display}**\n\n` +
      `${result}\n` +
      `${won ? `Won **+${Math.abs(payout).toLocaleString()}** coins (${multiplier}x)` : `Lost **-${bet.toLocaleString()}** coins`}\n` +
      `💰 Balance: **${newBal.toLocaleString()}** coins`
    )
    .setFooter({ text: "💎=10x | 7️⃣=7x | 3-match=3x | 2-match=1.5x" });
  await message.reply({ embeds: [embed] });
}

export async function handleDice(message: Message, args: string[]): Promise<void> {
  const user = getUser(message.author.id);
  const bet = parseBet(args[0], user.balance);

  if (!bet || bet > user.balance) {
    await message.reply(`Invalid bet. You have **${user.balance.toLocaleString()}** coins.\nUsage: \`!dice <amount|all|half>\``);
    return;
  }

  const playerRoll = Math.floor(Math.random() * 6) + 1;
  const botRoll    = Math.floor(Math.random() * 6) + 1;
  const won = playerRoll > botRoll;
  const tie = playerRoll === botRoll;

  const newBal = tie ? user.balance : addBalance(message.author.id, won ? bet : -bet);
  const embed = new EmbedBuilder()
    .setTitle("🎲 Dice Roll")
    .setColor(tie ? 0xf39c12 : won ? 0x2ecc71 : 0xe74c3c)
    .setDescription(
      `You rolled: **${playerRoll}** 🎲\nBot rolled: **${botRoll}** 🎲\n\n` +
      `${tie ? "🤝 It's a **tie!** No coins lost." : won ? `🟢 You win **+${bet.toLocaleString()}** coins!` : `🔴 You lose **-${bet.toLocaleString()}** coins.`}\n` +
      `💰 Balance: **${newBal.toLocaleString()}** coins`
    );
  await message.reply({ embeds: [embed] });
}

export async function handleRob(message: Message): Promise<void> {
  const target = message.mentions.members?.first();
  if (!target || target.user.bot) {
    await message.reply("Mention a valid user to rob.\nUsage: `!rob @user`");
    return;
  }
  if (target.id === message.author.id) {
    await message.reply("You can't rob yourself! 😂");
    return;
  }

  const robber = getUser(message.author.id);
  const victim = getUser(target.id);

  if (victim.balance < 100) {
    await message.reply(`${target.user.username} is broke — not worth robbing!`);
    return;
  }

  const success = Math.random() < 0.45;
  if (success) {
    const stolen = Math.floor(victim.balance * (Math.random() * 0.3 + 0.1));
    addBalance(target.id, -stolen);
    const newBal = addBalance(message.author.id, stolen);
    const embed = new EmbedBuilder()
      .setTitle("🦹 Successful Robbery!")
      .setColor(0x2ecc71)
      .setDescription(`You robbed **${stolen.toLocaleString()}** coins from ${target}!\n💰 Your balance: **${newBal.toLocaleString()}** coins`);
    await message.reply({ embeds: [embed] });
  } else {
    const fine = Math.floor(robber.balance * 0.2);
    const newBal = addBalance(message.author.id, -fine);
    const embed = new EmbedBuilder()
      .setTitle("👮 Caught Red-Handed!")
      .setColor(0xe74c3c)
      .setDescription(`You failed the robbery and paid a **${fine.toLocaleString()}** coin fine!\n💰 Your balance: **${newBal.toLocaleString()}** coins`);
    await message.reply({ embeds: [embed] });
  }
}

export async function handleGive(message: Message, args: string[]): Promise<void> {
  const target = message.mentions.users.first();
  if (!target || target.bot) {
    await message.reply("Mention a valid user to give coins to.\nUsage: `!give @user <amount>`");
    return;
  }
  const giver = getUser(message.author.id);
  const amount = parseBet(args[1], giver.balance);
  if (!amount || amount > giver.balance) {
    await message.reply(`Invalid amount. You have **${giver.balance.toLocaleString()}** coins.`);
    return;
  }
  addBalance(message.author.id, -amount);
  const newRecipientBal = addBalance(target.id, amount);
  await message.reply(`✅ You gave **${amount.toLocaleString()}** ${COIN} coins to ${target}!\nThey now have **${newRecipientBal.toLocaleString()}** coins.`);
}

export async function handleLeaderboard(message: Message): Promise<void> {
  const top = getLeaderboard();
  if (top.length === 0) {
    await message.reply("No economy data yet — play some games first!");
    return;
  }

  const medals = ["🥇", "🥈", "🥉"];
  const lines = await Promise.all(
    top.map(async (entry, i) => {
      const user = await message.client.users.fetch(entry.userId).catch(() => null);
      const name = user?.username ?? `Unknown (${entry.userId})`;
      return `${medals[i] ?? `**${i + 1}.**`} ${name} — **${entry.balance.toLocaleString()}** coins`;
    }),
  );

  const embed = new EmbedBuilder()
    .setTitle("🏆 Richest Members")
    .setColor(0xf1c40f)
    .setDescription(lines.join("\n"))
    .setFooter({ text: `Requested by ${message.author.tag}` });
  await message.reply({ embeds: [embed] });
}
