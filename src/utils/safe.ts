import type { GuildMember } from "discord.js";

export async function runSafely(label: string, task: () => Promise<void>) {
  try {
    await task();
  } catch (error) {
    console.error(`[ERROR] ${label}:`, error);
  }
}

export async function addRoleSafely(
  member: GuildMember,
  roleId: string,
  label: string,
) {
  try {
    await member.roles.add(roleId);
  } catch (error) {
    console.error(`[ERROR] Failed to add ${label} role (${roleId}):`, error);
  }
}
