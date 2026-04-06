import type { GuildMember } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

export default async function addReactionRole(
  member: GuildMember,
  emoji: string,
): Promise<void> {
  const notifierRole = process.env["NOTIFIER_ROLE_ID"]!;
  const VCRole = process.env["VC_ROLE_ID"]!;

  console.log(`[INFO]  : addReactionRole Called`);

  if (!member || !emoji) return;

  if (emoji === "🔔") {
    await member.roles.add(notifierRole);
    console.log(`[INFO]  : addReactionRole <BELL>}`);
    return;
  } else if (emoji === "🔉") {
    await member.roles.add(VCRole);
    console.log(`[INFO]  : addReactionRole <SOUND>`);
  }
}
