import { Client, GatewayIntentBits } from "discord.js";
import { Command } from "./types/command";
import { Actions } from "./types/action";
import { handleVcJoin } from "./handlers/events/vc/join";
import { handleVcLeave } from "./handlers/events/vc/leave";
import { handleVcLogger } from "./handlers/events/vc/logger";
import { updateMemberCount, firstJob } from "./jobs/updateMemberCount";
import { loadCommands, loadActions, loadEvents } from "./utils/loader";
import checkReactionRoleMessage from "./jobs/checkReactionRoleMessage";
import { env } from "./configs/env";
import { runtimeConfig } from "./configs/runtimeConfig";
import { runSafely } from "./utils/safe";
import { commandRegister } from "./utils/register";

// 実行環境に応じてファイルタイプとディレクトリを決定
const FILE_TYPE: string = process.argv[2] === "js" ? ".js" : ".ts";
const IS_PRODUCTION = FILE_TYPE === ".js";
const BASE_DIR = IS_PRODUCTION ? "./dist" : "./src";

const CLIENT_INTENTS: GatewayIntentBits[] = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
];

let commands: { [key: string]: Command } = {};
let actions: Actions = { button: {}, modal: {} };

commands = loadCommands(BASE_DIR, FILE_TYPE);
actions = loadActions(BASE_DIR, FILE_TYPE);
loadEvents(BASE_DIR + "/handlers", FILE_TYPE);

console.log("Registering commands...");

const client = new Client({
  intents: CLIENT_INTENTS,
});

module.exports = client;
module.exports = commands;
module.exports = actions;

client.once("clientReady", async () => {
  console.log(`Logged in as ${client.user?.tag}`);

  await runSafely("Registering commands", async () => {
    commandRegister();
  });

  console.log("");
  console.log("Bot is ready!");
  console.log("");

  await runSafely("Initial member fetch", () => firstJob(client));
  await runSafely("Initial member count update", () =>
    updateMemberCount(client),
  );

  await runSafely("Reaction role message check", async () => {
    const result = await checkReactionRoleMessage(client);
    if (!result) {
      console.error("This channel can't send msg");
      return;
    }
    runtimeConfig.reactionRoleMessageId = result;
  });

  await runSafely("Setting bot activity", async () => {
    client.user?.setActivity("with Discord.js", { type: 0 });
  });
});

client.on("voiceStateUpdate", handleVcLogger);
client.on("voiceStateUpdate", handleVcJoin);
client.on("voiceStateUpdate", handleVcLeave);

export { FILE_TYPE, client, commands, actions };
client.login(env.tokens.discordToken).catch((error) => {
  console.error("[ERROR] Failed to login Discord client:", error);
});
