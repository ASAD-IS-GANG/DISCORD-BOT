import type { Message } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { getUser, addBalance, setBalance } from "../lib/economy.js";

const COIN = "🪙";

const FISH_CATCHES = [
  { name: "🐟 Common Fish",   min: 50,   max: 150  },
  { name: "🐠 Tropical Fish", min: 100,  max: 300  },
  { name: "🦈 Shark",         min: 500,  max: 1000 },
  { name: "🐡 Pufferfish",    min: 75,   max: 200  },
  { name: "🦑 Squid",         min: 200,  max: 500  },
  { name: "🪸 Treasure",      min: 1000, max: 2000 },
];

const HUNT_CATCHES = [
  { name: "🐇 Rabbit",   min: 50,  max: 150 },
  { name: "🦊 Fox",      min: 100, max: 300 },
  { name: "🦌 Deer",     min: 200, max: 500 },
  { name: "🐗 Boar",     min: 300, max: 700 },
  { name: "🐻 Bear",     min: 500, max: 1200 },
];

const CRIME_JOBS = [
  "robbed a convenience store", "hacked into a database",
  "pickpocketed someone", "sold counterfeit tickets",
  "ran an illegal lemonade stand",
];

const SHOP_ITEMS = [
  { id: "shield",    name: "🛡️ Rob Shield",    price: 2000,  desc: "Protects you from the next rob attempt." },
  { id: "fishpole",  name: "🎣 Golden Fishing Rod", price: 5000, desc: "Doubles your fishing earnings." },
  { id: "rifle",     name: "🔫 Hunting Rifle", price: 5000,  desc: "Doubles your hunting earnings." },
  { id: "booster",   name: "⚡ XP Booster",    price: 3000,  desc: "2x XP for 1 hour." },
  { id: "lucky",     name: "🍀 Lucky Charm",   price: 4000,  desc: "Increases gambling win rate by 10%." },
];

const COOLDOWNS: Record<string, Record<string, number>> = {};

function checkCooldown(userId: string, action: string, cooldownMs: number): number {
  const now = Date.now();
  const key = `${userId}:${action}`;
  const last = COOLDOWNS[key]?.[action] ?? 0;
  const remaining = cooldownMs - (now - last);
  if (remaining > 0) return remaining;
  if (!COOLDOWNS[key]) COOLDOWNS[key] = {};
  COOLDOWNS[key]![action] = now;
  return 0;
}

function formatMs(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export async function handleFish(message: Message): Promise<void> {
  const cd = checkCooldown(message.author.id, "fish", 30_000);
  if (cd > 0) { await message.reply(`⏰ Wait **${formatMs(cd)}** before fishing again.`); return; }

  const catch_ = FISH_CATCHES[Math.floor(Math.random() * FISH_CATCHES.length)]!;
  const earned = Math.floor(Math.random() * (catch_.max - catch_.min) + catch_.min);
  const newBal = addBalance(message.author.id, earned);
  const embed = new EmbedBuilder()
    .setTitle("🎣 Fishing")
    .setColor(0x3498db)
    .setDescription(`You caught a **${catch_.name}** and earned **${earned.toLocaleString()}** ${COIN}!\n💰 Balance: **${newBal.toLocaleString()}**`);
  await message.reply({ embeds: [embed] });
}

export async function handleHunt(message: Message): Promise<void> {
  const cd = checkCooldown(message.author.id, "hunt", 30_000);
  if (cd > 0) { await message.reply(`⏰ Wait **${formatMs(cd)}** before hunting again.`); return; }

  const animal = HUNT_CATCHES[Math.floor(Math.random() * HUNT_CATCHES.length)]!;
  const earned = Math.floor(Math.random() * (animal.max - animal.min) + animal.min);
  const newBal = addBalance(message.author.id, earned);
  const embed = new EmbedBuilder()
    .setTitle("🏹 Hunting")
    .setColor(0x27ae60)
    .setDescription(`You hunted a **${animal.name}** and earned **${earned.toLocaleString()}** ${COIN}!\n💰 Balance: **${newBal.toLocaleString()}**`);
  await message.reply({ embeds: [embed] });
}

export async function handleCrime(message: Message): Promise<void> {
  const cd = checkCooldown(message.author.id, "crime", 60_000);
  if (cd > 0) { await message.reply(`⏰ Wait **${formatMs(cd)}** before committing another crime.`); return; }

  const success = Math.random() < 0.6;
  const job = CRIME_JOBS[Math.floor(Math.random() * CRIME_JOBS.length)]!;

  if (success) {
    const earned = Math.floor(Math.random() * 500) + 200;
    const newBal = addBalance(message.author.id, earned);
    const embed = new EmbedBuilder()
      .setTitle("🦹 Crime Successful!")
      .setColor(0x2ecc71)
      .setDescription(`You ${job} and got away with **${earned.toLocaleString()}** ${COIN}!\n💰 Balance: **${newBal.toLocaleString()}**`);
    await message.reply({ embeds: [embed] });
  } else {
    const fine = Math.floor(Math.random() * 300) + 100;
    const newBal = addBalance(message.author.id, -fine);
    const embed = new EmbedBuilder()
      .setTitle("👮 Busted!")
      .setColor(0xe74c3c)
      .setDescription(`You tried to ${job} but got caught!\nFined **${fine.toLocaleString()}** ${COIN}.\n💰 Balance: **${newBal.toLocaleString()}**`);
    await message.reply({ embeds: [embed] });
  }
}

export async function handleBeg(message: Message): Promise<void> {
  const cd = checkCooldown(message.author.id, "beg", 30_000);
  if (cd > 0) { await message.reply(`⏰ Wait **${formatMs(cd)}** before begging again.`); return; }

  const success = Math.random() < 0.7;
  if (success) {
    const earned = Math.floor(Math.random() * 100) + 10;
    const newBal = addBalance(message.author.id, earned);
    await message.reply(`🙏 Someone felt sorry and gave you **${earned}** ${COIN}!\n💰 Balance: **${newBal.toLocaleString()}**`);
  } else {
    await message.reply("😔 Nobody gave you anything... try again later.");
  }
}

export async function handleDeposit(message: Message, args: string[]): Promise<void> {
  const user = getUser(message.author.id);
  const amount = args[0] === "all" ? user.balance : parseInt(args[0] ?? "", 10);
  if (isNaN(amount) || amount <= 0) { await message.reply("Usage: `!deposit <amount|all>`"); return; }
  if (amount > user.balance) { await message.reply(`You only have **${user.balance.toLocaleString()}** coins.`); return; }
  addBalance(message.author.id, -amount);
  user.bank = (user.bank ?? 0) + amount;
  const { writeFileSync, readFileSync, mkdirSync, existsSync } = await import("fs");
  const { join, dirname } = await import("path");
  const { fileURLToPath } = await import("url");
  await message.reply(`🏦 Deposited **${amount.toLocaleString()}** ${COIN} to your bank.`);
}

export async function handleShop(message: Message): Promise<void> {
  const embed = new EmbedBuilder()
    .setTitle("🛒 Item Shop")
    .setColor(0xf1c40f)
    .setDescription("Use `!buy <item name>` to purchase an item.")
    .addFields(
      SHOP_ITEMS.map((item) => ({
        name: `${item.name} — **${item.price.toLocaleString()}** ${COIN}`,
        value: item.desc,
      }))
    );
  await message.reply({ embeds: [embed] });
}

export async function handleBuy(message: Message, args: string[]): Promise<void> {
  const query = args.join(" ").toLowerCase();
  const item = SHOP_ITEMS.find((i) => i.id === query || i.name.toLowerCase().includes(query));
  if (!item) { await message.reply(`Item not found. Use \`!shop\` to see available items.`); return; }
  const user = getUser(message.author.id);
  if (user.balance < item.price) {
    await message.reply(`You need **${item.price.toLocaleString()}** ${COIN} but only have **${user.balance.toLocaleString()}**.`); return;
  }
  addBalance(message.author.id, -item.price);
  await message.reply(`✅ You bought **${item.name}**! ${item.desc}`);
}
