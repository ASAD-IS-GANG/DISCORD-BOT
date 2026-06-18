import type { Message } from "discord.js";
import {
  ChannelType,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type Guild,
  type CategoryChannel,
  type TextChannel,
  type Role,
} from "discord.js";

const ROLES = [
  { name: "👑 Owner",       color: 0xf1c40f, hoist: true,  mentionable: false, perms: [PermissionFlagsBits.Administrator] },
  { name: "⚙️ Admin",       color: 0xe74c3c, hoist: true,  mentionable: true,  perms: [PermissionFlagsBits.Administrator] },
  { name: "🛡️ Moderator",   color: 0x3498db, hoist: true,  mentionable: true,  perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.KickMembers, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ViewChannel] },
  { name: "🎖️ Senior Mod",  color: 0x9b59b6, hoist: true,  mentionable: true,  perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ViewChannel] },
  { name: "⭐ VIP",         color: 0xf39c12, hoist: true,  mentionable: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
  { name: "🥇 Level 3",     color: 0xe67e22, hoist: false, mentionable: false, perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
  { name: "🥈 Level 2",     color: 0x95a5a6, hoist: false, mentionable: false, perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
  { name: "🥉 Level 1",     color: 0x7f8c8d, hoist: false, mentionable: false, perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
  { name: "✅ Member",      color: 0x2ecc71, hoist: false, mentionable: false, perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] },
  { name: "🤖 Bot",         color: 0x979c9f, hoist: true,  mentionable: false, perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
  { name: "👀 Muted",       color: 0x2c2f33, hoist: false, mentionable: false, perms: [] },
];

interface ChannelDef {
  name: string;
  topic?: string;
  staffOnly?: boolean;
  slowmode?: number;
  nsfw?: boolean;
}

interface CategoryDef {
  category: string;
  channels: ChannelDef[];
}

const TEXT_STRUCTURE: CategoryDef[] = [
  {
    category: "📋 ── INFORMATION ──",
    channels: [
      { name: "📜・rules",           topic: "Read and follow the server rules." },
      { name: "📢・announcements",   topic: "Official server announcements.", staffOnly: true },
      { name: "👋・welcome",         topic: "Welcome new members!", staffOnly: true },
      { name: "🗺️・server-guide",    topic: "A full guide to navigating the server." },
      { name: "🔔・updates",         topic: "Bot and server updates.", staffOnly: true },
      { name: "🤝・partnerships",    topic: "Partner servers and communities.", staffOnly: true },
    ],
  },
  {
    category: "🌐 ── GENERAL ──",
    channels: [
      { name: "💬・general",         topic: "General chat for everyone." },
      { name: "👋・introductions",   topic: "Introduce yourself to the community!" },
      { name: "🤣・memes",           topic: "Post your best memes." },
      { name: "📸・media",           topic: "Share images and videos." },
      { name: "😂・funny",           topic: "Share funny moments." },
      { name: "🎨・art",             topic: "Share your artwork and creations." },
    ],
  },
  {
    category: "🤖 ── BOTS ──",
    channels: [
      { name: "🤖・bot-commands",    topic: "Use all bot commands here.", slowmode: 3 },
      { name: "🎰・gambling",        topic: "Use economy and gambling bot commands.", slowmode: 5 },
      { name: "🎵・music-commands",  topic: "Use music bot commands here." },
      { name: "📊・leveling",        topic: "Check your level and leaderboard." },
    ],
  },
  {
    category: "🎮 ── GAMING ──",
    channels: [
      { name: "🎮・gaming-general",   topic: "General gaming chat." },
      { name: "🏆・game-clips",       topic: "Share your best gaming clips." },
      { name: "🔍・looking-for-game", topic: "Find players to game with." },
      { name: "📰・gaming-news",      topic: "Latest gaming news and releases." },
      { name: "🎲・minecraft",        topic: "Minecraft discussion." },
      { name: "🔫・fps-games",        topic: "FPS games discussion." },
      { name: "⚔️・rpg-games",        topic: "RPG games discussion." },
    ],
  },
  {
    category: "🎵 ── MUSIC ──",
    channels: [
      { name: "🎧・now-playing",     topic: "What are you listening to?" },
      { name: "🎤・song-requests",   topic: "Request songs to be played." },
      { name: "🎼・music-share",     topic: "Share your favourite music." },
      { name: "🎹・producers",       topic: "Music producers and beatmakers." },
    ],
  },
  {
    category: "💼 ── COMMUNITY ──",
    channels: [
      { name: "💡・suggestions",     topic: "Suggest new server features.", slowmode: 30 },
      { name: "🐛・bug-reports",     topic: "Report bugs or issues.", slowmode: 30 },
      { name: "📣・self-promo",      topic: "Promote your work here.", slowmode: 300 },
      { name: "🛒・marketplace",     topic: "Buy and sell items." },
      { name: "🗳️・polls",           topic: "Vote on server polls.", staffOnly: true },
      { name: "🏅・giveaways",       topic: "Giveaway announcements.", staffOnly: true },
    ],
  },
  {
    category: "🛠️ ── STAFF ONLY ──",
    channels: [
      { name: "👮・staff-chat",        topic: "Internal staff discussion.", staffOnly: true },
      { name: "📝・mod-logs",          topic: "Moderation action logs.", staffOnly: true },
      { name: "📊・staff-updates",     topic: "Staff announcements.", staffOnly: true },
      { name: "🗒️・action-log",        topic: "Server action log.", staffOnly: true },
      { name: "📬・reports",           topic: "Member reports inbox.", staffOnly: true },
      { name: "⚙️・bot-config",        topic: "Bot configuration channel.", staffOnly: true },
    ],
  },
];

const VOICE_STRUCTURE = [
  {
    category: "🔊 ── VOICE CHANNELS ──",
    channels: ["🔊 General 1", "🔊 General 2", "🎮 Gaming 1", "🎮 Gaming 2", "🎵 Music", "🎬 Watch Together", "📚 Study / Work", "💤 AFK"],
  },
  {
    category: "⭐ ── VIP LOUNGE ──",
    channels: ["💎 VIP Lounge", "🌟 VIP Gaming"],
  },
  {
    category: "🛠️ ── STAFF VOICE ──",
    channels: ["🛡️ Staff Meeting", "🔒 Admin Room", "👁️ Surveillance"],
  },
];

export async function handleSetup(message: Message, args: string[] = []): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    await message.reply("You need **Administrator** permission to run `!setup`.");
    return;
  }

  const preset = args[0]?.toLowerCase();
  const PRESETS: Record<string, (m: Message) => Promise<void>> = {
    middleman: handleMiddlemanSetup,
    gaming:    handleGamingSetup,
    crypto:    handleCryptoSetup,
    anime:     handleAnimeSetup,
    youtube:   handleYouTubeSetup,
    minecraft: handleMinecraftSetup,
  };

  if (preset === "list" || preset === "help") {
    await message.reply(
      "**📋 Available Setup Presets:**\n\n" +
      "`!setup` — General community server\n" +
      "`!setup middleman` — Middleman / escrow service server\n" +
      "`!setup gaming` — Gaming community server\n" +
      "`!setup crypto` — Crypto & trading server\n" +
      "`!setup anime` — Anime community server\n" +
      "`!setup youtube` — YouTube / content creator server\n" +
      "`!setup minecraft` — Minecraft server\n\n" +
      "⚠️ Each preset **deletes all existing channels** and rebuilds from scratch.",
    );
    return;
  }

  if (preset && PRESETS[preset]) {
    await PRESETS[preset]!(message);
    return;
  }

  if (preset) {
    await message.reply(`❌ Unknown preset \`${preset}\`. Use \`!setup list\` to see all presets.`);
    return;
  }

  const guild: Guild = message.guild!;
  const botMember = guild.members.me;

  if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await message.reply(
      "⚠️ I'm missing the **Manage Roles** permission, or my role isn't high enough in the role list.\n\n" +
      "**To fix:** Go to Server Settings → Roles → drag my role to the **top** of the list, then try again."
    );
    return;
  }

  const statusMsg = await message.reply("⚙️ Building your professional server... this may take a moment!");

  await Promise.allSettled(
    guild.channels.cache.map((c) => c.delete().catch(() => null)),
  );

  const roleResults = await Promise.allSettled(
    ROLES.map((r) =>
      guild.roles.create({
        name: r.name,
        color: r.color,
        hoist: r.hoist,
        mentionable: r.mentionable,
        permissions: new PermissionsBitField(r.perms),
      }),
    ),
  );

  const roles: Record<string, Role> = {};
  roleResults.forEach((result, i) => {
    if (result.status === "fulfilled") {
      roles[ROLES[i]!.name] = result.value as Role;
    }
  });

  const staffRole  = roles["🛡️ Moderator"];
  const everyoneId = guild.id;
  const botId      = botMember.id;

  const textCategoryResults = await Promise.allSettled(
    TEXT_STRUCTURE.map((s) =>
      guild.channels.create({ name: s.category, type: ChannelType.GuildCategory }),
    ),
  );

  const allTextChannels = await Promise.allSettled(
    TEXT_STRUCTURE.flatMap((s, i) => {
      const catResult = textCategoryResults[i];
      const parent = catResult?.status === "fulfilled"
        ? (catResult.value as CategoryChannel).id
        : undefined;

      return s.channels.map((ch) => {
        const staffOverwrites = [
          { id: everyoneId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: botId,      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
          ...(staffRole ? [{ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : []),
        ];

        return guild.channels.create({
          name: ch.name,
          type: ChannelType.GuildText,
          topic: ch.topic,
          parent,
          rateLimitPerUser: ch.slowmode ?? 0,
          nsfw: ch.nsfw ?? false,
          permissionOverwrites: ch.staffOnly ? staffOverwrites : [],
        });
      });
    }),
  );

  const voiceCategoryResults = await Promise.allSettled(
    VOICE_STRUCTURE.map((s) =>
      guild.channels.create({ name: s.category, type: ChannelType.GuildCategory }),
    ),
  );

  await Promise.allSettled(
    VOICE_STRUCTURE.flatMap((s, i) => {
      const catResult = voiceCategoryResults[i];
      const parent = catResult?.status === "fulfilled"
        ? (catResult.value as CategoryChannel).id
        : undefined;
      return s.channels.map((name) =>
        guild.channels.create({ name, type: ChannelType.GuildVoice, parent }),
      );
    }),
  );

  const freshChannels = guild.channels.cache;

  const findChannel = (keyword: string) =>
    freshChannels.find(
      (c) => c.name.toLowerCase().includes(keyword) && c.type === ChannelType.GuildText,
    ) as TextChannel | undefined;

  const announcements  = findChannel("announcements");
  const rules          = findChannel("rules");
  const guide          = findChannel("server-guide");
  const createTicket   = findChannel("create-ticket");

  const textCount  = allTextChannels.filter((r) => r.status === "fulfilled").length;
  const voiceCount = VOICE_STRUCTURE.flatMap((s) => s.channels).length;
  const roleCount  = Object.keys(roles).length;

  await Promise.allSettled([
    announcements?.send({
      content: "@everyone",
      embeds: [
        new EmbedBuilder()
          .setTitle(`🎉 Welcome to ${guild.name}!`)
          .setDescription(
            "The server has been fully set up and is ready to go!\n\n" +
            "📜 Read **#rules** before chatting\n" +
            "🗺️ Check **#server-guide** to learn your way around\n" +
            "👋 Say hi in **#general** and introduce yourself\n" +
            "🎮 Gamers head to the **Gaming** section\n" +
            "🎵 Music lovers check the **Music** section\n\n" +
            "*React to get your Member role in #welcome!*"
          )
          .setColor(0x5865f2)
          .setThumbnail(guild.iconURL())
          .setFooter({ text: `Set up by ${message.author.tag}` })
          .setTimestamp(),
      ],
    }).catch(() => null),

    rules?.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("📜 Server Rules")
          .setDescription("Breaking rules may result in a **mute, kick, or ban**.")
          .setColor(0xe74c3c)
          .addFields(
            { name: "1️⃣ Be Respectful",        value: "No harassment, hate speech, discrimination, or bullying of any kind." },
            { name: "2️⃣ No Spam",              value: "No spamming messages, emojis, mentions, or links." },
            { name: "3️⃣ No NSFW Content",      value: "Keep all content safe for everyone — no explicit or adult material." },
            { name: "4️⃣ No Self-Promotion",    value: "No advertising other servers or products without staff approval." },
            { name: "5️⃣ No Doxxing / Privacy", value: "Do not share personal information about others without consent." },
            { name: "6️⃣ English Only",         value: "Please use English in public channels so everyone can follow along." },
            { name: "7️⃣ No Drama",             value: "Keep arguments out of public channels. Use DMs or contact staff." },
            { name: "8️⃣ Follow Discord ToS",   value: "Follow Discord's Terms of Service at all times: https://discord.com/terms" },
          )
          .setFooter({ text: "Last updated by " + message.author.tag }),
      ],
    }).catch(() => null),

    guide?.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("🗺️ Server Guide")
          .setColor(0x2ecc71)
          .addFields(
            { name: "📋 Information",  value: "Rules, announcements, and all server info." },
            { name: "🌐 General",      value: "Chat, memes, media, art, and introductions." },
            { name: "🤖 Bots",        value: "All bot commands, leveling, economy, and music." },
            { name: "🎮 Gaming",       value: "Gaming chat, clips, LFG, and game-specific channels." },
            { name: "🎵 Music",        value: "Song requests, sharing, and music production." },
            { name: "💼 Community",    value: "Suggestions, bug reports, self-promo, giveaways & polls." },
            { name: "🔊 Voice",        value: "General VCs, Gaming, Music, Watch Together, Study & AFK." },
            { name: "⭐ VIP Lounge",   value: "Exclusive voice channels for VIP members." },
          )
          .setFooter({ text: "Need help? Open a ticket or DM a Moderator." }),
      ],
    }).catch(() => null),
  ]);

  await statusMsg.edit(
    `✅ **Server setup complete!**\n\n` +
    `🎭 **${roleCount}** roles created\n` +
    `💬 **${textCount}** text channels created\n` +
    `🔊 **${voiceCount}** voice channels created\n\n` +
    (roleCount < ROLES.length
      ? `⚠️ Some roles failed — make sure my role is **dragged to the top** of the role list in Server Settings → Roles.`
      : ""),
  ).catch(() => null);
}

// ─────────────────────────────────────────────────────────────
//  MIDDLEMAN SETUP
// ─────────────────────────────────────────────────────────────

const MM_ROLES = [
  { name: "👑 Owner",               color: 0xf1c40f, hoist: true,  perms: [PermissionFlagsBits.Administrator] },
  { name: "⚙️ Admin",               color: 0xe74c3c, hoist: true,  perms: [PermissionFlagsBits.Administrator] },
  { name: "⭐ Trusted Middleman",   color: 0x9b59b6, hoist: true,  perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels] },
  { name: "🤝 Middleman",           color: 0x3498db, hoist: true,  perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels] },
  { name: "🔰 Junior Middleman",    color: 0x1abc9c, hoist: true,  perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ViewChannel] },
  { name: "✅ Vouched",             color: 0x2ecc71, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
  { name: "👤 Member",              color: 0x95a5a6, hoist: false, perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
  { name: "🚨 Scammer",             color: 0xe74c3c, hoist: true,  perms: [] },
  { name: "👀 Muted",               color: 0x2c2f33, hoist: false, perms: [] },
];

const MM_TEXT: CategoryDef[] = [
  {
    category: "📋 ── INFORMATION ──",
    channels: [
      { name: "📜・rules",              topic: "Read before using our services." },
      { name: "📢・announcements",      topic: "Service announcements.", staffOnly: true },
      { name: "❓・how-it-works",       topic: "Step-by-step guide to using our middleman service." },
      { name: "💰・pricing",            topic: "Middleman fees and pricing." },
      { name: "📋・faq",                topic: "Frequently asked questions." },
      { name: "🤝・our-middlemen",      topic: "Meet our trusted middlemen.", staffOnly: true },
    ],
  },
  {
    category: "🤝 ── MIDDLEMAN SERVICE ──",
    channels: [
      { name: "📩・request-mm",         topic: "Request a middleman for your deal here.", slowmode: 10 },
      { name: "🟢・available-mms",      topic: "See which middlemen are currently available.", staffOnly: true },
      { name: "📊・service-status",     topic: "Current service status and wait times.", staffOnly: true },
      { name: "💼・deal-room-info",     topic: "Info about how deal rooms work." },
    ],
  },
  {
    category: "✅ ── VOUCHES & REPUTATION ──",
    channels: [
      { name: "⭐・vouch-here",         topic: "Leave a vouch after a successful deal.", slowmode: 30 },
      { name: "📜・all-vouches",        topic: "Verified vouches only.", staffOnly: true },
      { name: "🏆・rep-leaderboard",   topic: "Top middlemen by reputation.", staffOnly: true },
      { name: "🔍・vouch-format",       topic: "How to correctly format a vouch." },
    ],
  },
  {
    category: "⚠️ ── SCAM REPORTS ──",
    channels: [
      { name: "🚨・report-scammer",    topic: "Report a scammer with proof.", slowmode: 60 },
      { name: "📋・scammer-list",      topic: "Verified scammer list.", staffOnly: true },
      { name: "🔒・report-format",     topic: "How to format a scam report." },
    ],
  },
  {
    category: "⚖️ ── DISPUTES ──",
    channels: [
      { name: "📩・open-dispute",      topic: "Open a dispute with proof.", slowmode: 30 },
      { name: "📋・dispute-rules",     topic: "Rules for opening a dispute." },
      { name: "🔒・dispute-logs",      topic: "Resolved dispute logs.", staffOnly: true },
    ],
  },
  {
    category: "💬 ── GENERAL ──",
    channels: [
      { name: "💬・general",           topic: "General chat." },
      { name: "🤝・trade-chat",        topic: "Trading discussion." },
      { name: "📣・looking-for-buyer", topic: "Post if you're looking for a buyer.", slowmode: 30 },
      { name: "📣・looking-for-seller",topic: "Post if you're looking for a seller.", slowmode: 30 },
      { name: "💡・suggestions",       topic: "Suggest improvements.", slowmode: 60 },
    ],
  },
  {
    category: "🛠️ ── STAFF ONLY ──",
    channels: [
      { name: "👮・mm-chat",           topic: "Internal middleman discussion.", staffOnly: true },
      { name: "📝・mm-logs",           topic: "Deal and action logs.", staffOnly: true },
      { name: "📋・active-deals",      topic: "Currently active deals.", staffOnly: true },
      { name: "✅・completed-deals",   topic: "Completed deals log.", staffOnly: true },
      { name: "📬・reports-inbox",     topic: "Incoming reports inbox.", staffOnly: true },
      { name: "⚙️・bot-config",        topic: "Bot configuration.", staffOnly: true },
    ],
  },
];

const MM_VOICE = [
  {
    category: "🔊 ── VOICE ──",
    channels: ["🔊 General", "🤝 Deal Room 1", "🤝 Deal Room 2", "🤝 Deal Room 3", "💤 AFK"],
  },
  {
    category: "🛠️ ── STAFF VOICE ──",
    channels: ["🛡️ Staff Meeting", "🔒 MM Private Room"],
  },
];

async function handleMiddlemanSetup(message: Message): Promise<void> {
  const guild: Guild = message.guild!;
  const botMember = guild.members.me;

  if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await message.reply(
      "⚠️ I need **Manage Roles** permission and my role must be at the **top** of the role list.\nGo to Server Settings → Roles → drag my role to the top, then try again.",
    );
    return;
  }

  const statusMsg = await message.reply("🤝 Building your **Middleman server**... please wait!");

  const [, roleResults] = await Promise.all([
    Promise.allSettled(guild.channels.cache.map((c) => c.delete().catch(() => null))),
    Promise.allSettled(
      MM_ROLES.map((r) =>
        guild.roles.create({
          name: r.name,
          color: r.color,
          hoist: r.hoist,
          permissions: new PermissionsBitField(r.perms),
        }),
      ),
    ),
  ]);

  const roles: Record<string, Role> = {};
  roleResults.forEach((res, i) => {
    if (res.status === "fulfilled") roles[MM_ROLES[i]!.name] = res.value as Role;
  });

  const mmRole   = roles["🤝 Middleman"];
  const botId    = botMember.id;
  const everyoneId = guild.id;

  const catResults = await Promise.allSettled(
    MM_TEXT.map((s) => guild.channels.create({ name: s.category, type: ChannelType.GuildCategory })),
  );

  const allTextChannels = await Promise.allSettled(
    MM_TEXT.flatMap((s, i) => {
      const parent = catResults[i]?.status === "fulfilled"
        ? (catResults[i]!.value as CategoryChannel).id
        : undefined;

      return s.channels.map((ch) =>
        guild.channels.create({
          name: ch.name,
          type: ChannelType.GuildText,
          topic: ch.topic,
          parent,
          rateLimitPerUser: ch.slowmode ?? 0,
          permissionOverwrites: ch.staffOnly
            ? [
                { id: everyoneId, deny: [PermissionFlagsBits.ViewChannel] },
                { id: botId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                ...(mmRole ? [{ id: mmRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : []),
              ]
            : [],
        }),
      );
    }),
  );

  const voiceCatResults = await Promise.allSettled(
    MM_VOICE.map((s) => guild.channels.create({ name: s.category, type: ChannelType.GuildCategory })),
  );

  await Promise.allSettled(
    MM_VOICE.flatMap((s, i) => {
      const parent = voiceCatResults[i]?.status === "fulfilled"
        ? (voiceCatResults[i]!.value as CategoryChannel).id
        : undefined;
      return s.channels.map((name) =>
        guild.channels.create({ name, type: ChannelType.GuildVoice, parent }),
      );
    }),
  );

  const freshChannels = guild.channels.cache;
  const findCh = (kw: string) =>
    freshChannels.find((c) => c.name.includes(kw) && c.type === ChannelType.GuildText) as TextChannel | undefined;

  const announcements = findCh("announcements");
  const rules         = findCh("rules");
  const howItWorks    = findCh("how-it-works");
  const pricing       = findCh("pricing");
  const vouchFormat   = findCh("vouch-format");

  await Promise.allSettled([
    announcements?.send({
      content: "@everyone",
      embeds: [
        new EmbedBuilder()
          .setTitle("🤝 Welcome to the Middleman Service!")
          .setDescription(
            "We provide **safe, trusted middleman services** for all your deals.\n\n" +
            "📜 Read **#rules** before anything\n" +
            "❓ Check **#how-it-works** to understand the process\n" +
            "💰 See **#pricing** for our fees\n" +
            "📩 Go to **#request-mm** when you're ready for a deal\n" +
            "⭐ Leave a **#vouch-here** after your deal\n\n" +
            "*All deals are logged. Scammers will be blacklisted.*"
          )
          .setColor(0x3498db)
          .setFooter({ text: `Set up by ${message.author.tag}` })
          .setTimestamp(),
      ],
    }).catch(() => null),

    rules?.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("📜 Middleman Service Rules")
          .setColor(0xe74c3c)
          .addFields(
            { name: "1️⃣ No Scamming",         value: "Any attempt to scam will result in a **permanent ban** and public blacklist." },
            { name: "2️⃣ Use Official MM Only", value: "Only use middlemen with the **🤝 Middleman** role. Impersonators will be banned." },
            { name: "3️⃣ No Rushing",           value: "Do not rush your middleman. Take your time to verify everything." },
            { name: "4️⃣ Screenshot Everything",value: "Always screenshot your deal for proof in case of a dispute." },
            { name: "5️⃣ No Chargebacks",       value: "Initiating a chargeback on a completed deal is considered a scam." },
            { name: "6️⃣ Disputes",             value: "Open a ticket in **#open-dispute** with full proof. No proof = no case." },
            { name: "7️⃣ Be Respectful",        value: "Treat everyone with respect. No harassment or toxicity." },
            { name: "8️⃣ English Only",         value: "All deal communications must be in English." },
          )
          .setFooter({ text: "Breaking rules = ban + blacklist" }),
      ],
    }).catch(() => null),

    howItWorks?.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("❓ How the Middleman Service Works")
          .setColor(0x2ecc71)
          .setDescription("Our middleman holds the deal safe so **both parties are protected**.")
          .addFields(
            { name: "**Step 1️⃣**", value: "Go to **#request-mm** and post your deal details (what, how much, platform)." },
            { name: "**Step 2️⃣**", value: "A middleman will contact you and open a **private deal room**." },
            { name: "**Step 3️⃣**", value: "**Buyer** sends payment to the middleman. We verify receipt." },
            { name: "**Step 4️⃣**", value: "**Seller** delivers the item/service. We verify delivery." },
            { name: "**Step 5️⃣**", value: "Middleman releases payment to the seller. Deal complete! ✅" },
            { name: "**Step 6️⃣**", value: "Leave a vouch in **#vouch-here** so others know you're trusted." },
          )
          .setFooter({ text: "Any issues? Open a ticket in #open-dispute" }),
      ],
    }).catch(() => null),

    pricing?.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("💰 Middleman Pricing")
          .setColor(0xf1c40f)
          .setDescription("Our fees are kept **low and fair** to protect both parties.")
          .addFields(
            { name: "🔹 Under $50",    value: "**Free** — No fee for small deals." },
            { name: "🔹 $50 – $200",   value: "**$2** flat fee." },
            { name: "🔹 $200 – $500",  value: "**$5** flat fee." },
            { name: "🔹 $500 – $1000", value: "**$10** flat fee." },
            { name: "🔹 $1000+",       value: "**1%** of deal value." },
            { name: "📝 Notes",        value: "Fees are paid by the **buyer** unless otherwise agreed.\nCustom pricing available for large or complex deals — ask a middleman." },
          )
          .setFooter({ text: "Prices subject to change. Always confirm with your MM." }),
      ],
    }).catch(() => null),

    vouchFormat?.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("⭐ How to Vouch")
          .setColor(0x9b59b6)
          .setDescription("Copy and paste the format below when leaving a vouch.")
          .addFields(
            { name: "📋 Vouch Format", value: "```\n✅ VOUCH\nMiddleman: @tag\nDeal: (what was traded)\nAmount: $X\nNotes: smooth, fast, trusted!\n```" },
            { name: "⚠️ Rules", value: "• Only vouch for real deals\n• Fake vouches = ban\n• Tag the correct middleman" },
          ),
      ],
    }).catch(() => null),
  ]);

  const textCount = allTextChannels.filter((r) => r.status === "fulfilled").length;
  const roleCount = Object.keys(roles).length;

  await statusMsg.edit(
    `✅ **Middleman server is ready!**\n\n` +
    `🎭 **${roleCount}** roles created\n` +
    `💬 **${textCount}** text channels created\n` +
    `🔊 **${MM_VOICE.flatMap((s) => s.channels).length}** voice channels created\n\n` +
    `📌 Remember to drag my role to the **top** of the role list if roles failed.\n` +
    `📌 Assign the **🤝 Middleman** role to your trusted team members.`,
  ).catch(() => null);
}

// ─────────────────────────────────────────────────────────────
//  SHARED PRESET RUNNER
// ─────────────────────────────────────────────────────────────

interface PresetConfig {
  label: string;
  color: number;
  roles: { name: string; color: number; hoist: boolean; perms: bigint[] }[];
  text: CategoryDef[];
  voice: { category: string; channels: string[] }[];
  welcomeTitle: string;
  welcomeBody: string;
  extraNote?: string;
}

async function runPreset(message: Message, cfg: PresetConfig): Promise<void> {
  const guild = message.guild!;
  const botMember = guild.members.me!;

  if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await message.reply("⚠️ I need **Manage Roles** permission and my role dragged to the **top** of the role list.");
    return;
  }

  const statusMsg = await message.reply(`⚙️ Building your **${cfg.label}** server… please wait!`);

  const [, roleResults] = await Promise.all([
    Promise.allSettled(guild.channels.cache.map((c) => c.delete().catch(() => null))),
    Promise.allSettled(
      cfg.roles.map((r) =>
        guild.roles.create({
          name: r.name,
          color: r.color,
          hoist: r.hoist,
          permissions: new PermissionsBitField(r.perms),
        }),
      ),
    ),
  ]);

  const roles: Record<string, Role> = {};
  roleResults.forEach((res, i) => {
    if (res.status === "fulfilled") roles[cfg.roles[i]!.name] = res.value as Role;
  });

  const staffRoleEntry = cfg.roles.find((r) => r.perms.includes(PermissionFlagsBits.ManageMessages));
  const staffRole = staffRoleEntry ? roles[staffRoleEntry.name] : undefined;
  const botId = botMember.id;
  const everyoneId = guild.id;

  const catResults = await Promise.allSettled(
    cfg.text.map((s) => guild.channels.create({ name: s.category, type: ChannelType.GuildCategory })),
  );

  const allText = await Promise.allSettled(
    cfg.text.flatMap((s, i) => {
      const parent = catResults[i]?.status === "fulfilled"
        ? (catResults[i]!.value as CategoryChannel).id
        : undefined;
      return s.channels.map((ch) =>
        guild.channels.create({
          name: ch.name,
          type: ChannelType.GuildText,
          topic: ch.topic,
          parent,
          rateLimitPerUser: ch.slowmode ?? 0,
          permissionOverwrites: ch.staffOnly
            ? [
                { id: everyoneId, deny: [PermissionFlagsBits.ViewChannel] },
                { id: botId,      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                ...(staffRole ? [{ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : []),
              ]
            : [],
        }),
      );
    }),
  );

  const voiceCats = await Promise.allSettled(
    cfg.voice.map((s) => guild.channels.create({ name: s.category, type: ChannelType.GuildCategory })),
  );
  await Promise.allSettled(
    cfg.voice.flatMap((s, i) => {
      const parent = voiceCats[i]?.status === "fulfilled"
        ? (voiceCats[i]!.value as CategoryChannel).id
        : undefined;
      return s.channels.map((name) =>
        guild.channels.create({ name, type: ChannelType.GuildVoice, parent }),
      );
    }),
  );

  const freshChannels = guild.channels.cache;
  const findCh = (kw: string) =>
    freshChannels.find((c) => c.name.includes(kw) && c.type === ChannelType.GuildText) as TextChannel | undefined;

  const announcements = findCh("announcements");
  const rules = findCh("rules");
  const textCount = allText.filter((r) => r.status === "fulfilled").length;
  const voiceCount = cfg.voice.flatMap((s) => s.channels).length;
  const roleCount = Object.keys(roles).length;

  await Promise.allSettled([
    announcements?.send({
      content: "@everyone",
      embeds: [
        new EmbedBuilder()
          .setTitle(cfg.welcomeTitle)
          .setDescription(cfg.welcomeBody)
          .setColor(cfg.color)
          .setFooter({ text: `Set up by ${message.author.tag}` })
          .setTimestamp(),
      ],
    }).catch(() => null),
    rules?.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("📜 Server Rules")
          .setDescription("Breaking rules may result in a **mute, kick, or ban**.")
          .setColor(0xe74c3c)
          .addFields(
            { name: "1️⃣ Be Respectful",     value: "No harassment, hate speech, or bullying." },
            { name: "2️⃣ No Spam",           value: "No spamming messages, emojis, or links." },
            { name: "3️⃣ No NSFW",           value: "Keep content safe and appropriate." },
            { name: "4️⃣ No Advertising",    value: "No promoting other servers without permission." },
            { name: "5️⃣ Follow Discord ToS",value: "https://discord.com/terms" },
          )
          .setFooter({ text: "Follow the rules and have fun!" }),
      ],
    }).catch(() => null),
  ]);

  await statusMsg.edit(
    `✅ **${cfg.label} server is ready!**\n\n` +
    `🎭 **${roleCount}** roles created\n` +
    `💬 **${textCount}** text channels created\n` +
    `🔊 **${voiceCount}** voice channels created\n\n` +
    (cfg.extraNote ?? "") +
    (roleCount < cfg.roles.length ? "\n⚠️ Some roles failed — drag my role to the **top** of the role list." : ""),
  ).catch(() => null);
}

// ─────────────────────────────────────────────────────────────
//  GAMING PRESET
// ─────────────────────────────────────────────────────────────

async function handleGamingSetup(message: Message): Promise<void> {
  await runPreset(message, {
    label: "Gaming Community",
    color: 0x57f287,
    roles: [
      { name: "👑 Owner",         color: 0xf1c40f, hoist: true,  perms: [PermissionFlagsBits.Administrator] },
      { name: "⚙️ Admin",         color: 0xe74c3c, hoist: true,  perms: [PermissionFlagsBits.Administrator] },
      { name: "🛡️ Moderator",     color: 0x3498db, hoist: true,  perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.KickMembers, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ViewChannel] },
      { name: "🎮 Pro Gamer",     color: 0x9b59b6, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "🏆 Veteran",       color: 0xe67e22, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "⭐ VIP",           color: 0xf39c12, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "🎯 Member",        color: 0x95a5a6, hoist: false, perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "👀 Muted",         color: 0x2c2f33, hoist: false, perms: [] },
    ],
    text: [
      {
        category: "📋 ── INFORMATION ──",
        channels: [
          { name: "📜・rules",            topic: "Server rules." },
          { name: "📢・announcements",    topic: "Server announcements.", staffOnly: true },
          { name: "🔔・updates",          topic: "Game and server updates.", staffOnly: true },
          { name: "🎮・server-guide",     topic: "Navigate the server." },
        ],
      },
      {
        category: "🌐 ── GENERAL ──",
        channels: [
          { name: "💬・general",          topic: "General chat." },
          { name: "🤣・memes",            topic: "Gaming memes." },
          { name: "📸・clips",            topic: "Share your best clips." },
          { name: "🏆・flex",             topic: "Flex your wins and stats.", slowmode: 10 },
          { name: "😂・funny-moments",    topic: "Funny gaming moments." },
        ],
      },
      {
        category: "🎮 ── GAMES ──",
        channels: [
          { name: "🔫・fps-general",      topic: "FPS games chat." },
          { name: "⚔️・battle-royale",    topic: "Battle royale discussion." },
          { name: "🏎️・racing",           topic: "Racing games." },
          { name: "⚔️・rpg-mmorpg",       topic: "RPG and MMORPG." },
          { name: "🃏・card-strategy",    topic: "Card and strategy games." },
          { name: "📱・mobile-gaming",    topic: "Mobile games." },
          { name: "⚽・sports-games",     topic: "FIFA, NBA 2K, etc." },
          { name: "🎲・other-games",      topic: "Everything else." },
        ],
      },
      {
        category: "🔍 ── FIND PLAYERS ──",
        channels: [
          { name: "🔍・lfg-general",      topic: "Looking for group.", slowmode: 15 },
          { name: "🔫・lfg-fps",          topic: "LFG for FPS games.", slowmode: 15 },
          { name: "⚔️・lfg-rpg",          topic: "LFG for RPG games.", slowmode: 15 },
          { name: "📢・server-recruiting",topic: "Recruiting for clans and teams.", slowmode: 60 },
        ],
      },
      {
        category: "🤖 ── BOTS ──",
        channels: [
          { name: "🤖・bot-commands",     topic: "Bot commands.", slowmode: 3 },
          { name: "🎰・economy",          topic: "Economy commands.", slowmode: 5 },
          { name: "📊・leveling",         topic: "Check your rank." },
        ],
      },
      {
        category: "🏆 ── TOURNAMENTS ──",
        channels: [
          { name: "🏆・announcements",    topic: "Tournament announcements.", staffOnly: true },
          { name: "📋・brackets",         topic: "Tournament brackets.", staffOnly: true },
          { name: "✍️・sign-ups",         topic: "Sign up for tournaments.", slowmode: 30 },
          { name: "🎉・results",          topic: "Match results.", staffOnly: true },
        ],
      },
      {
        category: "🛠️ ── STAFF ONLY ──",
        channels: [
          { name: "👮・staff-chat",       topic: "Staff discussion.", staffOnly: true },
          { name: "📝・mod-logs",         topic: "Mod logs.", staffOnly: true },
          { name: "📬・reports",          topic: "Reports inbox.", staffOnly: true },
        ],
      },
    ],
    voice: [
      {
        category: "🔊 ── VOICE ──",
        channels: ["🎮 General 1", "🎮 General 2", "🎮 General 3", "🏆 Competitive", "📺 Streaming", "💤 AFK"],
      },
      {
        category: "🔫 ── FPS VOICE ──",
        channels: ["🔫 FPS Squad 1", "🔫 FPS Squad 2", "🔫 FPS Squad 3"],
      },
      {
        category: "🛠️ ── STAFF VOICE ──",
        channels: ["🛡️ Staff Meeting", "🔒 Admin Only"],
      },
    ],
    welcomeTitle: "🎮 Welcome to the Gaming Server!",
    welcomeBody:
      "Get ready to game! 🕹️\n\n" +
      "📜 Check **#rules** first\n" +
      "🔍 Find teammates in **#lfg-general**\n" +
      "🏆 Join tournaments in **#sign-ups**\n" +
      "📸 Share your best **#clips**\n\n" +
      "*GGs only. Let's get it!*",
  });
}

// ─────────────────────────────────────────────────────────────
//  CRYPTO PRESET
// ─────────────────────────────────────────────────────────────

async function handleCryptoSetup(message: Message): Promise<void> {
  await runPreset(message, {
    label: "Crypto & Trading",
    color: 0xf1c40f,
    roles: [
      { name: "👑 Owner",         color: 0xf1c40f, hoist: true,  perms: [PermissionFlagsBits.Administrator] },
      { name: "⚙️ Admin",         color: 0xe74c3c, hoist: true,  perms: [PermissionFlagsBits.Administrator] },
      { name: "🛡️ Moderator",     color: 0x3498db, hoist: true,  perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.KickMembers, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ViewChannel] },
      { name: "📈 Whale",         color: 0xf1c40f, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "💎 Diamond Hands", color: 0x9b59b6, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "🥇 Verified Trader",color: 0xe67e22, hoist: true, perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "👤 Member",        color: 0x95a5a6, hoist: false, perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "👀 Muted",         color: 0x2c2f33, hoist: false, perms: [] },
    ],
    text: [
      {
        category: "📋 ── INFORMATION ──",
        channels: [
          { name: "📜・rules",            topic: "Server rules. Read before trading." },
          { name: "📢・announcements",    topic: "Market and server announcements.", staffOnly: true },
          { name: "⚠️・disclaimer",       topic: "Not financial advice." },
          { name: "🔔・updates",          topic: "Market and server updates.", staffOnly: true },
        ],
      },
      {
        category: "📊 ── MARKETS ──",
        channels: [
          { name: "💬・general-trading",  topic: "General trading discussion." },
          { name: "₿・bitcoin",           topic: "Bitcoin discussion." },
          { name: "🔷・ethereum",         topic: "Ethereum discussion." },
          { name: "🪙・altcoins",         topic: "Altcoin discussion." },
          { name: "💹・defi",             topic: "DeFi protocols and yields." },
          { name: "🖼️・nfts",             topic: "NFT projects and discussion." },
          { name: "🎮・gamefi",           topic: "GameFi and play-to-earn." },
        ],
      },
      {
        category: "📈 ── TRADING ──",
        channels: [
          { name: "🚀・signals",          topic: "Trading signals. Not financial advice.", slowmode: 30 },
          { name: "📊・charts",           topic: "Share charts and analysis.", slowmode: 10 },
          { name: "💡・strategies",       topic: "Trading strategies discussion." },
          { name: "📰・news",             topic: "Crypto news.", slowmode: 10 },
          { name: "🔍・research",         topic: "Project research and DD." },
          { name: "🤑・gains",            topic: "Share your gains.", slowmode: 30 },
          { name: "😭・losses",           topic: "Vent your losses here.", slowmode: 30 },
        ],
      },
      {
        category: "💼 ── MARKETPLACE ──",
        channels: [
          { name: "🛒・buy-sell",         topic: "Buy and sell crypto.", slowmode: 30 },
          { name: "💱・p2p-trading",      topic: "Peer to peer trades.", slowmode: 30 },
          { name: "📣・shill-zone",       topic: "Shill your bags here.", slowmode: 60 },
        ],
      },
      {
        category: "🤖 ── BOTS ──",
        channels: [
          { name: "🤖・bot-commands",     topic: "Bot commands.", slowmode: 3 },
          { name: "📊・price-tracker",    topic: "Track coin prices." },
        ],
      },
      {
        category: "🛠️ ── STAFF ONLY ──",
        channels: [
          { name: "👮・staff-chat",       topic: "Staff discussion.", staffOnly: true },
          { name: "📝・mod-logs",         topic: "Mod logs.", staffOnly: true },
          { name: "📬・reports",          topic: "Reports inbox.", staffOnly: true },
        ],
      },
    ],
    voice: [
      {
        category: "🔊 ── VOICE ──",
        channels: ["📊 Trading Lounge", "💬 General", "🐋 Whale Room", "💤 AFK"],
      },
      {
        category: "🛠️ ── STAFF VOICE ──",
        channels: ["🛡️ Staff Meeting", "🔒 Admin Only"],
      },
    ],
    welcomeTitle: "📈 Welcome to the Crypto Server!",
    welcomeBody:
      "WAGMI! 🚀\n\n" +
      "📜 Read **#rules** and **#disclaimer** first\n" +
      "₿ Discuss Bitcoin in **#bitcoin**\n" +
      "📊 Share charts in **#charts**\n" +
      "🚀 Check **#signals** for trade ideas\n\n" +
      "*Not financial advice. DYOR always.*",
    extraNote: "📌 Not financial advice — always do your own research.\n",
  });
}

// ─────────────────────────────────────────────────────────────
//  ANIME PRESET
// ─────────────────────────────────────────────────────────────

async function handleAnimeSetup(message: Message): Promise<void> {
  await runPreset(message, {
    label: "Anime Community",
    color: 0xff6b9d,
    roles: [
      { name: "👑 Owner",         color: 0xf1c40f, hoist: true,  perms: [PermissionFlagsBits.Administrator] },
      { name: "⚙️ Admin",         color: 0xe74c3c, hoist: true,  perms: [PermissionFlagsBits.Administrator] },
      { name: "🛡️ Moderator",     color: 0x3498db, hoist: true,  perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.KickMembers, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ViewChannel] },
      { name: "🌸 Senpai",        color: 0xff6b9d, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "⭐ Weeb Elite",    color: 0x9b59b6, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "🎌 Otaku",         color: 0xe67e22, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "👤 Member",        color: 0x95a5a6, hoist: false, perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "👀 Muted",         color: 0x2c2f33, hoist: false, perms: [] },
    ],
    text: [
      {
        category: "📋 ── INFORMATION ──",
        channels: [
          { name: "📜・rules",            topic: "Server rules." },
          { name: "📢・announcements",    topic: "Server announcements.", staffOnly: true },
          { name: "🔔・new-episodes",     topic: "New episode alerts.", staffOnly: true },
          { name: "🗺️・server-guide",     topic: "How the server works." },
        ],
      },
      {
        category: "🌐 ── GENERAL ──",
        channels: [
          { name: "💬・general",          topic: "General chat." },
          { name: "👋・introductions",    topic: "Introduce yourself and your top 3 anime!" },
          { name: "🤣・memes",            topic: "Anime memes." },
          { name: "🎨・fan-art",          topic: "Share your anime fan art.", slowmode: 10 },
          { name: "📸・cosplay",          topic: "Cosplay photos.", slowmode: 15 },
        ],
      },
      {
        category: "🎌 ── ANIME ──",
        channels: [
          { name: "📺・currently-airing", topic: "Discuss airing anime. Spoiler tags please!", slowmode: 5 },
          { name: "🏆・recommendations",  topic: "Recommend anime to others." },
          { name: "💬・anime-discussion", topic: "General anime discussion." },
          { name: "⚔️・shounen",          topic: "Shounen anime." },
          { name: "💕・romance-isekai",   topic: "Romance and isekai." },
          { name: "😱・horror-thriller",  topic: "Dark and horror anime." },
          { name: "🔞・ecchi-zone",       topic: "18+ ecchi content.", nsfw: true },
        ],
      },
      {
        category: "📚 ── MANGA ──",
        channels: [
          { name: "📚・manga-discussion", topic: "General manga discussion." },
          { name: "📖・recommendations",  topic: "Manga recommendations.", slowmode: 15 },
          { name: "✍️・manhwa-manhua",    topic: "Korean and Chinese comics." },
        ],
      },
      {
        category: "🎮 ── GAMES & MEDIA ──",
        channels: [
          { name: "🎮・anime-games",      topic: "Anime-based games." },
          { name: "🎵・anime-music",      topic: "Openings, endings and OSTs." },
          { name: "🎙️・voice-actors",     topic: "VA appreciation." },
          { name: "🏅・waifu-husbando",   topic: "Rate and debate waifus and husbandos.", slowmode: 10 },
        ],
      },
      {
        category: "🤖 ── BOTS ──",
        channels: [
          { name: "🤖・bot-commands",     topic: "Bot commands.", slowmode: 3 },
          { name: "📊・leveling",         topic: "Check your rank." },
        ],
      },
      {
        category: "🛠️ ── STAFF ONLY ──",
        channels: [
          { name: "👮・staff-chat",       topic: "Staff discussion.", staffOnly: true },
          { name: "📝・mod-logs",         topic: "Mod logs.", staffOnly: true },
          { name: "📬・reports",          topic: "Reports inbox.", staffOnly: true },
        ],
      },
    ],
    voice: [
      {
        category: "🔊 ── VOICE ──",
        channels: ["🎌 General", "📺 Watch Party", "🎵 Music", "💤 AFK"],
      },
      {
        category: "🛠️ ── STAFF VOICE ──",
        channels: ["🛡️ Staff Meeting", "🔒 Admin Only"],
      },
    ],
    welcomeTitle: "🌸 Welcome to the Anime Server!",
    welcomeBody:
      "Irasshaimase! 🎌\n\n" +
      "📜 Read **#rules** first\n" +
      "👋 Introduce yourself and your top anime in **#introductions**\n" +
      "📺 Discuss currently airing shows in **#currently-airing**\n" +
      "🏆 Get recommendations in **#recommendations**\n" +
      "🎨 Share your fan art in **#fan-art**\n\n" +
      "*Welcome to the family, fellow weeb!*",
  });
}

// ─────────────────────────────────────────────────────────────
//  YOUTUBE / CONTENT CREATOR PRESET
// ─────────────────────────────────────────────────────────────

async function handleYouTubeSetup(message: Message): Promise<void> {
  await runPreset(message, {
    label: "YouTube & Content Creator",
    color: 0xff0000,
    roles: [
      { name: "👑 Owner",           color: 0xf1c40f, hoist: true,  perms: [PermissionFlagsBits.Administrator] },
      { name: "⚙️ Admin",           color: 0xe74c3c, hoist: true,  perms: [PermissionFlagsBits.Administrator] },
      { name: "🛡️ Moderator",       color: 0x3498db, hoist: true,  perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.KickMembers, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ViewChannel] },
      { name: "🎬 Content Creator", color: 0xff0000, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "💎 Diamond Sub",     color: 0x9b59b6, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "⭐ VIP Sub",         color: 0xf39c12, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "🔔 Subscriber",      color: 0xe67e22, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "👤 Member",          color: 0x95a5a6, hoist: false, perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "👀 Muted",           color: 0x2c2f33, hoist: false, perms: [] },
    ],
    text: [
      {
        category: "📋 ── INFORMATION ──",
        channels: [
          { name: "📜・rules",              topic: "Server rules." },
          { name: "📢・announcements",      topic: "Video and server announcements.", staffOnly: true },
          { name: "🎬・new-videos",         topic: "New video alerts.", staffOnly: true },
          { name: "🔴・live-alerts",        topic: "Stream and live alerts.", staffOnly: true },
          { name: "🗺️・server-guide",       topic: "Navigate the server." },
        ],
      },
      {
        category: "🌐 ── GENERAL ──",
        channels: [
          { name: "💬・general",            topic: "General chat." },
          { name: "👋・introductions",      topic: "Introduce yourself!" },
          { name: "🤣・memes",              topic: "Memes and funny content." },
          { name: "💡・suggestions",        topic: "Suggest video ideas.", slowmode: 60 },
          { name: "📸・fan-art",            topic: "Fan art for the channel.", slowmode: 15 },
        ],
      },
      {
        category: "📺 ── CONTENT ──",
        channels: [
          { name: "🎬・video-discussion",   topic: "Discuss latest videos." },
          { name: "🔴・stream-chat",        topic: "Chat during streams." },
          { name: "🎬・behind-the-scenes",  topic: "Behind the scenes content.", staffOnly: true },
          { name: "🗳️・polls",              topic: "Vote on content ideas.", staffOnly: true },
          { name: "📊・feedback",           topic: "Give feedback on content.", slowmode: 30 },
        ],
      },
      {
        category: "🎨 ── CREATOR ZONE ──",
        channels: [
          { name: "📣・self-promo",         topic: "Promote your channel here.", slowmode: 300 },
          { name: "🤝・collab-requests",    topic: "Looking for collabs.", slowmode: 60 },
          { name: "💡・creator-tips",       topic: "Tips for growing your channel." },
          { name: "🛠️・editing-help",       topic: "Video editing help and resources." },
          { name: "🎵・music-production",   topic: "Music and audio for creators." },
          { name: "📸・thumbnail-feedback", topic: "Get feedback on thumbnails.", slowmode: 30 },
        ],
      },
      {
        category: "🤖 ── BOTS ──",
        channels: [
          { name: "🤖・bot-commands",       topic: "Bot commands.", slowmode: 3 },
          { name: "📊・leveling",           topic: "Check your rank." },
        ],
      },
      {
        category: "🛠️ ── STAFF ONLY ──",
        channels: [
          { name: "👮・staff-chat",         topic: "Staff discussion.", staffOnly: true },
          { name: "📝・mod-logs",           topic: "Mod logs.", staffOnly: true },
          { name: "🎬・production-chat",    topic: "Video production planning.", staffOnly: true },
        ],
      },
    ],
    voice: [
      {
        category: "🔊 ── VOICE ──",
        channels: ["🎬 Creator Lounge", "💬 General", "🔴 Live Stream Prep", "💤 AFK"],
      },
      {
        category: "🛠️ ── STAFF VOICE ──",
        channels: ["🛡️ Staff Meeting", "🎬 Recording Room", "🔒 Admin Only"],
      },
    ],
    welcomeTitle: "🎬 Welcome to the Creator Server!",
    welcomeBody:
      "Smash that like button! 🔔\n\n" +
      "📢 Check **#new-videos** for the latest uploads\n" +
      "💡 Drop video ideas in **#suggestions**\n" +
      "📣 Promote your channel in **#self-promo**\n" +
      "🤝 Find collab partners in **#collab-requests**\n\n" +
      "*Subscribe and hit the bell!* 🎬",
  });
}

// ─────────────────────────────────────────────────────────────
//  MINECRAFT PRESET
// ─────────────────────────────────────────────────────────────

async function handleMinecraftSetup(message: Message): Promise<void> {
  await runPreset(message, {
    label: "Minecraft Server",
    color: 0x5dac22,
    roles: [
      { name: "👑 Owner",         color: 0xf1c40f, hoist: true,  perms: [PermissionFlagsBits.Administrator] },
      { name: "⚙️ Admin",         color: 0xe74c3c, hoist: true,  perms: [PermissionFlagsBits.Administrator] },
      { name: "🛡️ Moderator",     color: 0x3498db, hoist: true,  perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.KickMembers, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ViewChannel] },
      { name: "⛏️ Builder",       color: 0xe67e22, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "🌿 Veteran",       color: 0x5dac22, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "💎 Diamond",       color: 0x9b59b6, hoist: true,  perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "⚙️ Iron",          color: 0x95a5a6, hoist: false, perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "🪵 Newcomer",      color: 0x7d5a3c, hoist: false, perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
      { name: "👀 Muted",         color: 0x2c2f33, hoist: false, perms: [] },
    ],
    text: [
      {
        category: "📋 ── INFORMATION ──",
        channels: [
          { name: "📜・rules",              topic: "Server rules. Read before playing." },
          { name: "📢・announcements",      topic: "Server announcements.", staffOnly: true },
          { name: "🌐・server-ip",          topic: "Server IP and connection info.", staffOnly: true },
          { name: "🔔・updates",            topic: "Server and game updates.", staffOnly: true },
          { name: "🗺️・server-guide",       topic: "Getting started on the server." },
        ],
      },
      {
        category: "🌐 ── GENERAL ──",
        channels: [
          { name: "💬・general",            topic: "General chat." },
          { name: "👋・introductions",      topic: "Introduce yourself and your IGN!" },
          { name: "🤣・memes",              topic: "Minecraft memes." },
          { name: "📸・screenshots",        topic: "Share your builds and screenshots.", slowmode: 10 },
          { name: "🏆・flex-builds",        topic: "Show off your best builds.", slowmode: 15 },
        ],
      },
      {
        category: "⛏️ ── GAMEPLAY ──",
        channels: [
          { name: "💬・gameplay-chat",      topic: "Talk about gameplay, strats, and more." },
          { name: "🏗️・building",           topic: "Building tips and showcases." },
          { name: "⚔️・pvp",               topic: "PvP discussion and tips." },
          { name: "🌾・survival",           topic: "Survival mode tips." },
          { name: "🔧・redstone",           topic: "Redstone contraptions and help." },
          { name: "🏪・economy-trading",    topic: "In-game trading.", slowmode: 15 },
          { name: "🗺️・seeds-coords",       topic: "Share seeds and coordinates." },
          { name: "❓・help",               topic: "Ask for gameplay help.", slowmode: 5 },
        ],
      },
      {
        category: "🎮 ── GAME MODES ──",
        channels: [
          { name: "🏝️・skyblock",           topic: "Skyblock chat." },
          { name: "🏰・factions",           topic: "Factions chat." },
          { name: "🎯・minigames",          topic: "Minigames discussion." },
          { name: "🗺️・creative",           topic: "Creative mode builds." },
        ],
      },
      {
        category: "🤖 ── BOTS ──",
        channels: [
          { name: "🤖・bot-commands",       topic: "Bot commands.", slowmode: 3 },
          { name: "📊・leveling",           topic: "Check your rank." },
        ],
      },
      {
        category: "🛠️ ── STAFF ONLY ──",
        channels: [
          { name: "👮・staff-chat",         topic: "Staff discussion.", staffOnly: true },
          { name: "📝・mod-logs",           topic: "Mod logs.", staffOnly: true },
          { name: "⚙️・server-config",      topic: "Server settings and config.", staffOnly: true },
          { name: "📬・player-reports",     topic: "Player reports inbox.", staffOnly: true },
        ],
      },
    ],
    voice: [
      {
        category: "🔊 ── VOICE ──",
        channels: ["⛏️ Mining Party", "🏗️ Build Together", "⚔️ PvP Squad", "🌿 Chill", "💤 AFK"],
      },
      {
        category: "🎮 ── GAME VOICE ──",
        channels: ["🏝️ Skyblock VC", "🏰 Factions VC", "🎯 Minigames VC"],
      },
      {
        category: "🛠️ ── STAFF VOICE ──",
        channels: ["🛡️ Staff Meeting", "🔒 Admin Only"],
      },
    ],
    welcomeTitle: "⛏️ Welcome to the Minecraft Server!",
    welcomeBody:
      "Welcome, adventurer! ⛏️\n\n" +
      "🌐 Get the server IP in **#server-ip**\n" +
      "📜 Read **#rules** before joining\n" +
      "👋 Introduce yourself in **#introductions**\n" +
      "📸 Share builds in **#screenshots**\n" +
      "❓ Need help? Ask in **#help**\n\n" +
      "*Happy mining!* 💎",
    extraNote: "📌 Remember to post your server IP in **#server-ip**!\n",
  });
}
