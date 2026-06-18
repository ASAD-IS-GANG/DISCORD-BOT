import type { Message, Interaction, ButtonInteraction, Guild, GuildMember } from "discord.js";
import {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type TextChannel,
} from "discord.js";

const TICKET_PREFIX = "ticket-";
const SUPPORT_ROLE_NAMES = [
  "Admin", "Moderator", "Staff", "Support", "Middleman",
  "⚙️ Admin", "🛡️ Moderator", "⭐ Trusted Middleman", "🤝 Middleman",
];

function getSupportRoleIdFromGuild(guild: Guild): string | null {
  for (const name of SUPPORT_ROLE_NAMES) {
    const role = guild.roles.cache.find((r) =>
      r.name.toLowerCase().includes(name.toLowerCase()),
    );
    if (role) return role.id;
  }
  return null;
}

function isStaff(member: GuildMember): boolean {
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.permissions.has(PermissionFlagsBits.ManageChannels) ||
    member.roles.cache.some((r) =>
      SUPPORT_ROLE_NAMES.some((n) => r.name.toLowerCase().includes(n.toLowerCase())),
    )
  );
}

// ─── Core ticket creation (shared by command + button) ─────────────────────
async function createTicket(
  guild: Guild,
  user: { id: string; tag: string; toString: () => string },
  member: GuildMember,
  reply: (msg: string) => Promise<unknown>,
): Promise<void> {
  const botId = guild.members.me!.id;
  const safeName = user.tag.split("#")[0]!.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || user.id.slice(-8);
  const ticketName = `${TICKET_PREFIX}${safeName}`;

  const existing = guild.channels.cache.find((c) => c.name === ticketName);
  if (existing) {
    await reply(`❌ You already have an open ticket: <#${existing.id}>`);
    return;
  }

  const supportRoleId = getSupportRoleIdFromGuild(guild);

  let ticketCat = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes("ticket"),
  );
  if (!ticketCat) {
    ticketCat = await guild.channels.create({
      name: "🎫 ── TICKETS ──",
      type: ChannelType.GuildCategory,
    });
  }

  const overwrites: Parameters<typeof guild.channels.create>[0]["permissionOverwrites"] = [
    { id: guild.id,  deny:  [PermissionFlagsBits.ViewChannel] },
    { id: user.id,   allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
    { id: botId,     allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.EmbedLinks] },
  ];
  if (supportRoleId) {
    overwrites.push({
      id: supportRoleId,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages],
    });
  }

  const channel = (await guild.channels.create({
    name: ticketName,
    type: ChannelType.GuildText,
    topic: `Ticket opened by ${user.tag} (${user.id}) | !ticket close to close`,
    parent: ticketCat.id,
    permissionOverwrites: overwrites,
  })) as TextChannel;

  const embed = new EmbedBuilder()
    .setTitle("🎫 Support Ticket")
    .setDescription(
      `Welcome <@${user.id}>! 👋\n\n` +
      `A staff member will be with you shortly.\n\n` +
      `📝 **Please describe your issue in detail:**\n` +
      `• What happened?\n` +
      `• Any screenshots or proof?\n` +
      `• What do you need help with?\n\n` +
      `Click **🔒 Close Ticket** below when your issue is resolved.`,
    )
    .setColor(0x5865f2)
    .addFields(
      { name: "👤 Opened by", value: `<@${user.id}>`, inline: true },
      { name: "📅 Opened at", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
    )
    .setFooter({ text: "Only you and staff can see this ticket." })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("🔒 Close Ticket")
      .setStyle(ButtonStyle.Danger),
  );

  await channel.send({
    content: `<@${user.id}>${supportRoleId ? ` <@&${supportRoleId}>` : ""}`,
    embeds: [embed],
    components: [row],
  });

  await reply(`✅ Your ticket has been created: <#${channel.id}>`);
}

// ─── Close ticket (shared by command + button) ──────────────────────────────
async function closeTicket(
  channel: TextChannel,
  closerTag: string,
  reply: (msg: object) => Promise<unknown>,
): Promise<void> {
  if (!channel.name.startsWith(TICKET_PREFIX)) {
    await reply({ content: "❌ This can only be used inside a ticket channel.", flags: 64 });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("🔒 Ticket Closing")
    .setDescription(`Closed by **${closerTag}**.\nThis channel will be deleted in **5 seconds**.`)
    .setColor(0xe74c3c)
    .setTimestamp();

  await reply({ embeds: [embed] });
  setTimeout(() => channel.delete("Ticket closed").catch(() => null), 5000);
}

// ─── !ticket [subcommand] ───────────────────────────────────────────────────
export async function handleTicket(message: Message, args: string[]): Promise<void> {
  const sub = args[0]?.toLowerCase();
  const guild = message.guild!;
  const member = message.member!;

  if (sub === "close") {
    await closeTicket(
      message.channel as TextChannel,
      message.author.tag,
      (msg) => message.reply(msg as string),
    );
    return;
  }

  if (sub === "add") {
    await addUser(message);
    return;
  }

  if (sub === "remove") {
    await removeUser(message);
    return;
  }

  if (sub === "setup" || sub === "panel") {
    await postTicketPanel(message);
    return;
  }

  await createTicket(
    guild,
    message.author,
    member,
    (msg) => message.reply(msg),
  );
}

async function addUser(message: Message): Promise<void> {
  const ch = message.channel as TextChannel;
  if (!ch.name.startsWith(TICKET_PREFIX)) { await message.reply("❌ Use this inside a ticket."); return; }
  if (!isStaff(message.member!)) { await message.reply("❌ Staff only."); return; }
  const target = message.mentions.members?.first();
  if (!target) { await message.reply("❌ Mention a user: `!ticket add @user`"); return; }
  await ch.permissionOverwrites.edit(target.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
  await message.reply(`✅ Added **${target.user.tag}** to the ticket.`);
}

async function removeUser(message: Message): Promise<void> {
  const ch = message.channel as TextChannel;
  if (!ch.name.startsWith(TICKET_PREFIX)) { await message.reply("❌ Use this inside a ticket."); return; }
  if (!isStaff(message.member!)) { await message.reply("❌ Staff only."); return; }
  const target = message.mentions.members?.first();
  if (!target) { await message.reply("❌ Mention a user: `!ticket remove @user`"); return; }
  await ch.permissionOverwrites.edit(target.id, { ViewChannel: false, SendMessages: false });
  await message.reply(`✅ Removed **${target.user.tag}** from the ticket.`);
}

async function postTicketPanel(message: Message): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    await message.reply("❌ You need **Administrator** permission.");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("🎫 Support Tickets")
    .setDescription(
      "Need help from the team? Click the button below to open a **private ticket**.\n\n" +
      "📌 **Before opening:**\n" +
      "› Read the rules and FAQ first\n" +
      "› Have any screenshots or proof ready\n" +
      "› Be clear about your issue\n\n" +
      "✅ A staff member will respond as soon as possible.\n" +
      "⚠️ Abusing the ticket system will result in a ban.",
    )
    .setColor(0x5865f2)
    .setFooter({ text: "One ticket per user at a time." })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("🎫 Open a Ticket")
      .setStyle(ButtonStyle.Primary),
  );

  await message.channel.send({ embeds: [embed], components: [row] });
  await message.delete().catch(() => null);
}

// ─── Button interaction handler ─────────────────────────────────────────────
export async function handleTicketButton(interaction: Interaction): Promise<void> {
  if (!interaction.isButton()) return;

  const btn = interaction as ButtonInteraction;
  const guild = btn.guild;
  if (!guild) return;

  if (btn.customId === "open_ticket") {
    await btn.deferReply({ ephemeral: true });

    const member = btn.member as GuildMember;

    await createTicket(
      guild,
      btn.user,
      member,
      async (msg) => btn.editReply(msg),
    );
    return;
  }

  if (btn.customId === "close_ticket") {
    const channel = btn.channel as TextChannel;
    const closerMember = btn.member as GuildMember;

    if (!channel.name.startsWith(TICKET_PREFIX)) {
      await btn.reply({ content: "❌ Not a ticket channel.", ephemeral: true });
      return;
    }

    const isOwner = channel.topic?.includes(btn.user.id);
    if (!isStaff(closerMember) && !isOwner) {
      await btn.reply({ content: "❌ Only staff or the ticket owner can close this.", ephemeral: true });
      return;
    }

    await closeTicket(channel, btn.user.tag, (msg) => btn.reply(msg));
  }
}
