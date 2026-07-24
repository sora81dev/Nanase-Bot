import type { GuildMember, PartialGuildMember } from "discord.js";

import { client } from "../..";
import { updateMemberCount } from "../../jobs/updateMemberCount";

client.on("guildMemberUpdate", handler);

async function handler(
  oldMember: GuildMember | PartialGuildMember,
  newMember: GuildMember | PartialGuildMember,
) {
  console.log("[INFO]  Detect guildMemberUpdate");
  console.log("-> NEW MEMBER");
  console.log(
    `   -> hasStudentRole: ${newMember.roles.cache.has("1454446371221536788")}`,
  );
  console.log("-> OLD MEMBER");
  console.log(
    `   -> hasStudentRole: ${oldMember.roles.cache.has("1454446371221536788")}`,
  );

  //　学生ロールの付与、剥奪を検知して学生数カウントを更新
  if (
    (!oldMember.roles.cache.has("1454446371221536788") &&
      newMember.roles.cache.has("1454446371221536788")) ||
    (oldMember.roles.cache.has("1454446371221536788") &&
      !newMember.roles.cache.has("1454446371221536788"))
  ) {
    await updateMemberCount();
  }
}
