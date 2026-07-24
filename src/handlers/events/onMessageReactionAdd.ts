import type {
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
} from "discord.js";

import addReactionRole from "../../services/reactionRole/addReactionRole";
import { runtimeConfig } from "../../configs/runtimeConfig";
import { client } from "../..";

client.on("onMessageReactionAdd", handler);

async function handler(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
) {
  const message = reaction.message;
  const member = message?.guild?.members.resolve(user.id);

  console.log("[INFO]  messageReactionAdded");
  console.log(`   -> message: ${message.content?.toString()}`);
  console.log(`   -> member : ${member?.displayName}`);

  if (!member || !reaction.emoji.name) return;

  console.log(`   -> react  : ${reaction.emoji.name}`);

  // ReactionRole: ロール付与
  if (message.id === runtimeConfig.reactionRoleMessageId) {
    try {
      await addReactionRole(member, reaction.emoji.name);
    } catch (e) {
      console.error(e);
    }
  }
}
