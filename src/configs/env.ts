import dotenv from "dotenv";

dotenv.config();

export const env = {
  info: {
    botID: process.env.BOT_ID,
    guildID: "1454446371221536788",
  },
  tokens: {
    discordToken: process.env.DISCORD_TOKEN,
  },
  channelID: {
    reactionRole: process.env.REACTIONROLE_CHANNEL_ID,
    recruitThread: "1454446371221536788",
    recruitNotice: "1461005041409327463",
    memberCount: "1454473598973509697",
  },
  roleID: {
    notifier: process.env.NOTIFIER_ROLE_ID,
    vc: process.env.VC_ROLE_ID,
    bot: "1454099602641780737",
    student: "1454446371221536788",
  },
};
