import type { GuildMember, PartialGuildMember } from "discord.js";

import { client } from "../..";
import { updateMemberCount } from "../../jobs/updateMemberCount";
import { env } from "../../configs/env";

client.on("guildMemberUpdate", handler);

async function handler(
  oldMember: GuildMember | PartialGuildMember,
  newMember: GuildMember | PartialGuildMember,
) {
  console.log("[INFO]  Detect guildMemberUpdate");
  console.log("-> NEW MEMBER");
  console.log(
    `   -> hasStudentRole: ${newMember.roles.cache.has(env.roleID.student)}`,
  );
  console.log("-> OLD MEMBER");
  console.log(
    `   -> hasStudentRole: ${oldMember.roles.cache.has(env.roleID.student)}`,
  );

  //　学生ロールの付与、剥奪を検知して学生数カウントを更新
  if (
    (!oldMember.roles.cache.has(env.roleID.student) &&
      newMember.roles.cache.has(env.roleID.student)) ||
    (oldMember.roles.cache.has(env.roleID.student) &&
      !newMember.roles.cache.has(env.roleID.student))
  ) {
    await updateMemberCount();
  }
}
