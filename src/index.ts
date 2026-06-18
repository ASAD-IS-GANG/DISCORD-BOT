import {
  Client,
  GatewayIntentBits,
  Events,
  PermissionFlagsBits,
  type Message,
} from "discord.js";
import pino from "pino";
import { addXP, xpForLevel } from "./lib/leveling.js";
import { handleJoke } from "./commands/joke.js";
import { handleCreateChannels } from "./commands/createChannels.js";
import { handleNuke } from "./commands/nuke.js";
import { handleSetup } from "./commands/setup.js";
import {
  handleBalance, handleDaily, handleWork, handleCoinflip,
  handleSlots, handleDice, handleRob, handleGive, handleLeaderboard,
} from "./commands/gambling.js";
import {
  handleFish, handleHunt, handleCrime, handleBeg, handleShop, handleBuy,
} from "./commands/economy-extra.js";
import { handleRank, handleXPLeaderboard } from "./commands/leveling.js";
import {
  handleKick, handleBan, handleUnban, handleWarn, handleWarnings,
  handleClearWarn, handleMute, handleUnmute, handleSlowmode,
  handleLock, handleUnlock, handlePurge,
} from "./commands/moderation.js";
import {
  handle8Ball, handleRPS, handleShip, handleRate, handleChoose,
  handleReverse, handleMock, handleTruth, handleDare, handleWYR,
  handleRoast, handleCompliment, handlePoll, handleGiveaway,
  handleMeme, handleCat, handleDog,
} from "./commands/fun.js";
import {
  handleServerInfo, handleUserInfo, handleAvatar, handlePing, handleBotInfo,
} from "./commands/info.js";
import { handleTicket, handleTicketButton } from "./commands/tickets.js";
import { handleSay, handleEmbedsay, handleAnnounce } from "./commands/say.js";

const logger = pino({ level: "info" });
const PREFIX = "!";

const token = process.env["DISCORD_TOKEN"];
if (!token) {
  logger.error("DISCORD_TOKEN environment variable is required but not set.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  logger.info({ tag: readyClient.user.tag }, "Bot is online!");
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) return;

  // XP on every message (not just commands)
  if (message.guild) {
    const { leveled, newLevel } = addXP(message.author.id, Math.floor(Math.random() * 15) + 5);
    if (leveled) {
      await message.channel
        .send(`🎉 Congrats ${message.author}! You leveled up to **Level ${newLevel}**! (${xpForLevel(newLevel + 1)} XP to next level)`)
        .catch(() => null);
    }
  }

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();
  if (!command) return;

  switch (command) {

    // ── FUN ──────────────────────────────────────────────
    case "joke":        await handleJoke(message); break;
    case "8ball":       await handle8Ball(message, args); break;
    case "rps":         await handleRPS(message, args); break;
    case "ship":        await handleShip(message); break;
    case "rate":        await handleRate(message, args); break;
    case "choose":      await handleChoose(message, args); break;
    case "reverse":     await handleReverse(message, args); break;
    case "mock":        await handleMock(message, args); break;
    case "truth":       await handleTruth(message); break;
    case "dare":        await handleDare(message); break;
    case "wyr":         await handleWYR(message); break;
    case "roast":       await handleRoast(message); break;
    case "compliment":  await handleCompliment(message); break;
    case "poll":        await handlePoll(message, args); break;
    case "giveaway":    await handleGiveaway(message, args); break;
    case "meme":        await handleMeme(message); break;
    case "cat":         await handleCat(message); break;
    case "dog":         await handleDog(message); break;

    // ── ECONOMY / GAMBLING ────────────────────────────────
    case "balance":
    case "bal":
    case "wallet":      await handleBalance(message, args); break;
    case "daily":       await handleDaily(message); break;
    case "work":        await handleWork(message); break;
    case "coinflip":
    case "cf":          await handleCoinflip(message, args); break;
    case "slots":
    case "slot":        await handleSlots(message, args); break;
    case "dice":
    case "roll":        await handleDice(message, args); break;
    case "rob":         await handleRob(message); break;
    case "give":
    case "pay":         await handleGive(message, args); break;
    case "leaderboard":
    case "lb":
    case "top":         await handleLeaderboard(message); break;
    case "fish":        await handleFish(message); break;
    case "hunt":        await handleHunt(message); break;
    case "crime":       await handleCrime(message); break;
    case "beg":         await handleBeg(message); break;
    case "shop":        await handleShop(message); break;
    case "buy":         await handleBuy(message, args); break;

    // ── LEVELING ──────────────────────────────────────────
    case "rank":
    case "level":       await handleRank(message); break;
    case "xplb":
    case "xlb":         await handleXPLeaderboard(message); break;

    // ── MODERATION ────────────────────────────────────────
    case "kick":        await handleKick(message, args); break;
    case "ban":         await handleBan(message, args); break;
    case "unban":       await handleUnban(message, args); break;
    case "warn":        await handleWarn(message, args); break;
    case "warnings":    await handleWarnings(message); break;
    case "clearwarn":   await handleClearWarn(message); break;
    case "mute":        await handleMute(message, args); break;
    case "unmute":      await handleUnmute(message); break;
    case "slowmode":    await handleSlowmode(message, args); break;
    case "lock":        await handleLock(message); break;
    case "unlock":      await handleUnlock(message); break;
    case "purge":
    case "clear":       await handlePurge(message, args); break;

    // ── SERVER TOOLS ──────────────────────────────────────
    case "setup":       await handleSetup(message, args); break;
    case "nuke":        await handleNuke(message); break;
    case "createchannels": await handleCreateChannels(message, args); break;

    case "deletechannels":
    case "deleteallchannels": {
      if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
        await message.reply("You need **Administrator** permission to delete all channels.");
        break;
      }
      const confirm = await message.reply("⚠️ This will **delete every channel** in the server. Reply `yes` within 10 seconds to confirm.");
      const collected = await message.channel
        .awaitMessages({ filter: (m) => m.author.id === message.author.id && m.content.toLowerCase() === "yes", max: 1, time: 10_000 })
        .catch(() => null);
      await confirm.delete().catch(() => null);
      if (!collected || collected.size === 0) { await message.channel.send("❌ Cancelled."); break; }
      await Promise.allSettled(message.guild!.channels.cache.map((c) => c.delete().catch(() => null)));
      break;
    }

    // ── TICKETS ───────────────────────────────────────────
    case "ticket":      await handleTicket(message, args); break;

    // ── SAY / ANNOUNCE ────────────────────────────────────
    case "say":         await handleSay(message, args); break;
    case "embedsay":    await handleEmbedsay(message, args); break;
    case "announce":    await handleAnnounce(message, args); break;

    // ── INFO ──────────────────────────────────────────────
    case "serverinfo":
    case "si":          await handleServerInfo(message); break;
    case "userinfo":
    case "ui":          await handleUserInfo(message); break;
    case "avatar":
    case "av":          await handleAvatar(message); break;
    case "ping":        await handlePing(message); break;
    case "botinfo":
    case "bot":         await handleBotInfo(message); break;

    // ── INVITE ────────────────────────────────────────────
    case "invite": {
      const url = client.generateInvite({
        scopes: ["bot"],
        permissions: [
          PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ViewChannel,  PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.MentionEveryone, PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.KickMembers,  PermissionFlagsBits.BanMembers,
          PermissionFlagsBits.ManageRoles,  PermissionFlagsBits.MuteMembers,
          PermissionFlagsBits.ModerateMembers,
        ],
      });
      await message.reply(`🔗 Invite me:\n${url}`);
      break;
    }

    // ── HELP ──────────────────────────────────────────────
    case "help":
      await message.reply([
        "**🎉 Fun**",
        "`!joke` `!meme` `!cat` `!dog` `!8ball <q>` `!rps <choice>` `!ship @u1 @u2`",
        "`!rate <thing>` `!choose a|b|c` `!reverse <text>` `!mock <text>`",
        "`!truth` `!dare` `!wyr` `!roast [@user]` `!compliment [@user]`",
        "`!poll <q>` `!giveaway <prize>`",
        "",
        "**🎰 Economy & Gambling**",
        "`!bal [@user]` `!daily` `!work` `!beg` `!crime`",
        "`!fish` `!hunt` `!shop` `!buy <item>`",
        "`!cf <bet> <heads|tails>` `!slots <bet>` `!dice <bet>`",
        "`!rob @user` `!give @user <amt>` `!lb`",
        "",
        "**📊 Leveling**",
        "`!rank [@user]` `!xlb` — XP is earned by chatting!",
        "",
        "**🛡️ Moderation** *(staff only)*",
        "`!kick` `!ban` `!unban <id>` `!mute @u [10m]` `!unmute @u`",
        "`!warn @u <reason>` `!warnings [@u]` `!clearwarn @u`",
        "`!purge <amt>` `!slowmode <sec>` `!lock` `!unlock`",
        "",
        "**🎫 Tickets**",
        "`!ticket` — open a new ticket",
        "`!ticket close` — close current ticket",
        "`!ticket add @user` — add someone to ticket *(staff)*",
        "`!ticket remove @user` — remove someone *(staff)*",
        "`!ticket setup` — post ticket panel embed *(admin)*",
        "",
        "**📣 Say / Announce** *(mod/admin)*",
        "`!say <text>` or `!say #ch <text>` — bot says your message",
        "`!embedsay <title> | <desc>` — bot says it in an embed",
        "`!announce <text>` — @everyone announcement embed",
        "",
        "**🛠️ Server Tools** *(admin only)*",
        "`!setup` `!setup middleman` `!nuke` `!createchannels <n> [name]`",
        "",
        "**ℹ️ Info**",
        "`!ping` `!botinfo` `!serverinfo` `!userinfo [@u]` `!avatar [@u]` `!invite`",
      ].join("\n"));
      break;

    default:
      await message.reply(`Unknown command \`${command}\`. Type \`!help\` to see all commands.`);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  await handleTicketButton(interaction).catch((err) => logger.error({ err }, "Ticket button error"));
});

client.on("error", (err) => { logger.error({ err }, "Discord client error"); });
process.on("unhandledRejection", (err) => { logger.error({ err }, "Unhandled rejection"); });

client.login(token).catch((err) => {
  logger.error({ err }, "Failed to log in to Discord");
  process.exit(1);
});
