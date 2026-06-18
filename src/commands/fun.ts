import type { Message } from "discord.js";
import { EmbedBuilder } from "discord.js";

const MAGIC_8_BALL = [
  "✅ It is certain.", "✅ It is decidedly so.", "✅ Without a doubt.",
  "✅ Yes, definitely.", "✅ You may rely on it.", "✅ As I see it, yes.",
  "✅ Most likely.", "✅ Outlook good.", "✅ Yes.", "✅ Signs point to yes.",
  "🤷 Reply hazy, try again.", "🤷 Ask again later.", "🤷 Better not tell you now.",
  "🤷 Cannot predict now.", "🤷 Concentrate and ask again.",
  "❌ Don't count on it.", "❌ My reply is no.", "❌ My sources say no.",
  "❌ Outlook not so good.", "❌ Very doubtful.",
];

const TRUTHS = [
  "What is your biggest fear?", "What's the most embarrassing thing you've done?",
  "Who do you have a crush on?", "What's your biggest secret?",
  "Have you ever lied to a friend?", "What's the worst thing you've ever done?",
  "Who is your least favourite person here?", "What's something you've never told anyone?",
  "Have you ever cheated on a test?", "What's your most embarrassing moment?",
];

const DARES = [
  "Send a voice message saying 'I love chicken nuggets'.",
  "Change your nickname to 'Potato' for 10 minutes.",
  "Type the alphabet backwards.",
  "Tell a joke in the next message.",
  "DM a random person 'you dropped this 👑'.",
  "Speak in only rhymes for the next 5 minutes.",
  "Write a 2-sentence love story.",
  "Send your best impression of a cat.",
  "Send a message using only emojis.",
  "Try to say 'She sells sea shells' 3 times fast.",
];

const WYR = [
  "Would you rather be invisible or be able to fly?",
  "Would you rather have unlimited money or unlimited knowledge?",
  "Would you rather live without music or without TV?",
  "Would you rather be famous or be best friends with someone famous?",
  "Would you rather be able to speak all languages or play all instruments?",
  "Would you rather fight 100 duck-sized horses or 1 horse-sized duck?",
  "Would you rather have no internet for a week or no food for 3 days?",
  "Would you rather always be 10 minutes late or always be 20 minutes early?",
];

const ROASTS = [
  "You're the human equivalent of a participation trophy.",
  "I'd agree with you but then we'd both be wrong.",
  "I'm not saying I hate you, but I would unplug your life support to charge my phone.",
  "You're like a cloud — when you disappear, it's a beautiful day.",
  "If brains were gas, you wouldn't have enough to power a go-kart around a Cheerio.",
];

const COMPLIMENTS = [
  "You light up every room you walk into! ✨",
  "You have an amazing sense of humour! 😄",
  "You're a genuinely kind person and people are lucky to know you! 💙",
  "Your creativity is truly inspiring! 🎨",
  "You make the world a better place just by being in it! 🌍",
];

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export async function handle8Ball(message: Message, args: string[]): Promise<void> {
  if (!args.length) { await message.reply("Ask me a question! Usage: `!8ball <question>`"); return; }
  const answer = random(MAGIC_8_BALL);
  const embed = new EmbedBuilder()
    .setTitle("🎱 Magic 8-Ball")
    .setColor(0x2c2f33)
    .addFields(
      { name: "❓ Question", value: args.join(" ") },
      { name: "🎱 Answer",   value: answer },
    );
  await message.reply({ embeds: [embed] });
}

export async function handleRPS(message: Message, args: string[]): Promise<void> {
  const choices = ["rock", "paper", "scissors"];
  const userChoice = args[0]?.toLowerCase();
  if (!choices.includes(userChoice ?? "")) {
    await message.reply("Choose **rock**, **paper**, or **scissors**.\nUsage: `!rps <choice>`");
    return;
  }
  const botChoice = random(choices);
  const emojis: Record<string, string> = { rock: "🪨", paper: "📄", scissors: "✂️" };
  let result = "";
  if (userChoice === botChoice) result = "🤝 It's a tie!";
  else if (
    (userChoice === "rock" && botChoice === "scissors") ||
    (userChoice === "scissors" && botChoice === "paper") ||
    (userChoice === "paper" && botChoice === "rock")
  ) result = "🟢 You win!";
  else result = "🔴 Bot wins!";

  const embed = new EmbedBuilder()
    .setTitle("✂️ Rock Paper Scissors")
    .setColor(0x5865f2)
    .setDescription(`You: ${emojis[userChoice!]} **${userChoice}**\nBot: ${emojis[botChoice]} **${botChoice}**\n\n${result}`);
  await message.reply({ embeds: [embed] });
}

export async function handleShip(message: Message): Promise<void> {
  const users = message.mentions.users;
  if (users.size < 2) {
    await message.reply("Mention two users to ship!\nUsage: `!ship @user1 @user2`");
    return;
  }
  const [u1, u2] = users.first(2);
  const percent = Math.floor(Math.random() * 101);
  const bar = "█".repeat(Math.floor(percent / 10)) + "░".repeat(10 - Math.floor(percent / 10));
  const comment = percent >= 80 ? "💘 Perfect match!" : percent >= 60 ? "💕 Pretty good!" : percent >= 40 ? "💛 There's potential!" : percent >= 20 ? "😬 It's complicated..." : "💔 Not meant to be.";
  const embed = new EmbedBuilder()
    .setTitle("💘 Love Calculator")
    .setColor(0xff69b4)
    .setDescription(`**${u1!.username}** ❤️ **${u2!.username}**\n\n\`${bar}\` **${percent}%**\n\n${comment}`);
  await message.reply({ embeds: [embed] });
}

export async function handleRate(message: Message, args: string[]): Promise<void> {
  if (!args.length) { await message.reply("What should I rate? Usage: `!rate <thing>`"); return; }
  const thing = args.join(" ");
  const score = Math.floor(Math.random() * 11);
  const stars = "⭐".repeat(score) + "✩".repeat(10 - score);
  await message.reply(`**${thing}**\n${stars} **${score}/10**`);
}

export async function handleChoose(message: Message, args: string[]): Promise<void> {
  const options = args.join(" ").split("|").map(o => o.trim()).filter(Boolean);
  if (options.length < 2) { await message.reply("Give me at least 2 options!\nUsage: `!choose option1 | option2 | option3`"); return; }
  await message.reply(`🎲 I choose: **${random(options)}**`);
}

export async function handleReverse(message: Message, args: string[]): Promise<void> {
  if (!args.length) { await message.reply("Usage: `!reverse <text>`"); return; }
  await message.reply(args.join(" ").split("").reverse().join(""));
}

export async function handleMock(message: Message, args: string[]): Promise<void> {
  if (!args.length) { await message.reply("Usage: `!mock <text>`"); return; }
  const mocked = args.join(" ").split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join("");
  await message.reply(mocked);
}

export async function handleTruth(message: Message): Promise<void> {
  await message.reply(`🤔 **Truth:** ${random(TRUTHS)}`);
}

export async function handleDare(message: Message): Promise<void> {
  await message.reply(`😈 **Dare:** ${random(DARES)}`);
}

export async function handleWYR(message: Message): Promise<void> {
  await message.reply(`🤷 ${random(WYR)}`);
}

export async function handleRoast(message: Message): Promise<void> {
  const target = message.mentions.users.first() ?? message.author;
  await message.reply(`🔥 ${target}, ${random(ROASTS)}`);
}

export async function handleCompliment(message: Message): Promise<void> {
  const target = message.mentions.users.first() ?? message.author;
  await message.reply(`💙 ${target}, ${random(COMPLIMENTS)}`);
}

export async function handlePoll(message: Message, args: string[]): Promise<void> {
  if (!args.length) { await message.reply("Usage: `!poll <question>`"); return; }
  const question = args.join(" ");
  const embed = new EmbedBuilder()
    .setTitle("📊 Poll")
    .setDescription(`**${question}**`)
    .setColor(0x5865f2)
    .setFooter({ text: `Poll by ${message.author.tag}` });
  const msg = await message.channel.send({ embeds: [embed] });
  await msg.react("👍");
  await msg.react("👎");
  await message.delete().catch(() => null);
}

export async function handleGiveaway(message: Message, args: string[]): Promise<void> {
  if (!args.length) { await message.reply("Usage: `!giveaway <prize>`"); return; }
  const prize = args.join(" ");
  const embed = new EmbedBuilder()
    .setTitle("🎉 GIVEAWAY!")
    .setDescription(`**Prize:** ${prize}\n\nReact with 🎉 to enter!\n\nHosted by ${message.author}`)
    .setColor(0xf1c40f)
    .setFooter({ text: "Good luck to all participants!" })
    .setTimestamp();
  const msg = await message.channel.send({ embeds: [embed] });
  await msg.react("🎉");
}

export async function handleMeme(message: Message): Promise<void> {
  try {
    const res = await fetch("https://meme-api.com/gimme");
    if (!res.ok) throw new Error("API error");
    const data = await res.json() as { title: string; url: string; subreddit: string; ups: number };
    const embed = new EmbedBuilder()
      .setTitle(data.title)
      .setImage(data.url)
      .setColor(0xff4500)
      .setFooter({ text: `r/${data.subreddit} • 👍 ${data.ups}` });
    await message.reply({ embeds: [embed] });
  } catch {
    await message.reply("Couldn't fetch a meme right now, try again!");
  }
}

export async function handleCat(message: Message): Promise<void> {
  try {
    const res = await fetch("https://api.thecatapi.com/v1/images/search");
    const [data] = await res.json() as Array<{ url: string }>;
    const embed = new EmbedBuilder().setTitle("🐱 Random Cat!").setImage(data!.url).setColor(0xffa500);
    await message.reply({ embeds: [embed] });
  } catch {
    await message.reply("No cats found 😢");
  }
}

export async function handleDog(message: Message): Promise<void> {
  try {
    const res = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await res.json() as { message: string };
    const embed = new EmbedBuilder().setTitle("🐶 Random Dog!").setImage(data.message).setColor(0x8B4513);
    await message.reply({ embeds: [embed] });
  } catch {
    await message.reply("No dogs found 😢");
  }
}
