import type { GuildMember } from "discord.js";
import { env } from "../../configs/env";

export default async function addReactionRole(
  member: GuildMember,
  emoji: string,
): Promise<void> {
  console.log(`[INFO]  : addReactionRole Called`);

  if (!member || !emoji) return;

  if (emoji === "🔔") {
    if (!env.roleID.notifier) {
      console.error("NOTIFIER_ROLE_ID is not set");
      return;
    }

    await member.roles.add(env.roleID.notifier);
    console.log(`[INFO]  : addReactionRole <NOTIFIER>}`);
    return;
  } else if (emoji === "🔉") {
    if (!env.roleID.vc) {
      console.error("VC_ROLE_ID is not set");
      return;
    }

    await member.roles.add(env.roleID.vc);
    console.log(`[INFO]  : addReactionRole <VC>`);
  }
}
