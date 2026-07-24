import type { GuildMember } from "discord.js";
import { addRoleSafely } from "../../utils/safe";
import { client } from "../..";
import { env } from "../../configs/env";

client.on("guildMemberAdd", handler);

async function handler(member: GuildMember) {
  const time = Date.now();
  const date = new Date(time);

  if (member.user.bot) {
    // BOTロールを付与
    await addRoleSafely(member, env.roleID.bot, "bot");
  }

  // 年に応じたロールを付与
  if (date.getFullYear() == 2025) {
    await addRoleSafely(member, "1454661774576980090", "2025 student");
  } else if (date.getFullYear() == 2026) {
    await addRoleSafely(member, "1455864840630308925", "2026 student");
  }
}
