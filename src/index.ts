import {
  Client,
  GatewayIntentBits,
  ModalSubmitInteraction,
  ButtonInteraction,
  Interaction,
  CacheType,
} from "discord.js";
import { Command, ModalCommand, ButtonCommand } from "./types/command";
import { Action, Actions } from "./types/action";
import { handleVcJoin } from "./handlers/events/vc/join";
import { handleVcLeave } from "./handlers/events/vc/leave";
import { handleVcLogger } from "./handlers/events/vc/logger";
import { updateMemberCount, firstJob } from "./jobs/updateMemberCount";
import { loadCommands, loadActions, loadEvents } from "./utils/loader";
import checkReactionRoleMessage from "./jobs/checkReactionRoleMessage";
import { env } from "./configs/env";
import { runtimeConfig } from "./configs/runtimeConfig";
import { runSafely } from "./utils/safe";

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

client.once("clientReady", async () => {
  console.log(`Logged in as ${client.user?.tag}`);

  await runSafely("Registering commands", async () => {
    const data: Record<string, any>[] = new Array();

    for (const commandName in commands) {
      console.warn(`  Registering command: ${commandName}`);
      data.push(commands[commandName].data);
    }

    await client.application?.commands.set(data as any);

    console.log("Commands registered successfully!");
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

function logAndSendError(interaction: any, message: string, err?: any) {
  console.error(err);
  return (async () => {
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: message,
          ephemeral: true,
        } as any);
      } else if (typeof interaction.reply === "function") {
        await interaction.reply({ content: message, ephemeral: true } as any);
      }
    } catch (e) {
      console.error("Failed to send error message to interaction", e);
    }
  })();
}

client.on("interactionCreate", async (interaction: Interaction<CacheType>) => {
  try {
    // コマンド
    if (interaction.isCommand()) {
      const { commandName } = interaction;
      const command: Command | undefined = commands[commandName];
      if (!command) {
        console.error(`Command ${commandName} not found`);
        await interaction.followUp("This command does not exist!");
        return;
      }

      const flags = command.data.flags || 0;
      if (command.data.defer != false) await interaction.deferReply({ flags });

      console.log(`Executing command: ${commandName}`);
      await command.execute(interaction as any);
      return;
    }

    // ボタン
    if (interaction.isButton()) {
      const { customId } = interaction;
      let command: ButtonCommand;
      try {
        const parsed = JSON.parse(customId);
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          typeof parsed.action !== "string"
        ) {
          console.error(`Invalid button customId format: ${customId}`);
          await interaction.deferUpdate();
          return;
        }
        command = parsed as ButtonCommand;
      } catch {
        console.error(`Failed to parse button customId: ${customId}`);
        await interaction.deferUpdate();
        return;
      }
      const actionName = command.action;
      const action: Action<ButtonInteraction> | undefined =
        actions.button[actionName];
      if (!action) {
        console.error(`Action ${actionName} not found`);
        await interaction.followUp("This action does not exist!");
        return;
      }

      const flags = action.data.flags || 0;
      if (action.data.defer) await interaction.deferReply({ flags });

      console.log(`Executing action: ${actionName}`);
      await action.execute(interaction as ButtonInteraction);
      return;
    }

    // モーダル
    if (interaction.isModalSubmit()) {
      const { customId } = interaction;
      let command: ModalCommand;
      try {
        const parsed = JSON.parse(customId);
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          typeof parsed.action !== "string"
        ) {
          console.error(`Invalid modal customId format: ${customId}`);
          await interaction.reply({
            content: "invalid request",
            ephemeral: true,
          });
          return;
        }
        command = parsed as ModalCommand;
      } catch {
        console.error(`Failed to parse modal customId: ${customId}`);
        await interaction.reply({
          content: "invalid request",
          ephemeral: true,
        });
        return;
      }
      const actionName = command.action;
      const action: Action<ModalSubmitInteraction> | undefined =
        actions.modal[actionName];
      if (!action) {
        console.error(`Action ${actionName} not found`);
        await interaction.followUp("This action does not exist!");
        return;
      }

      const flags: number = action.data.flags || 0;
      if (action.data.defer) await interaction.deferReply({ flags });

      console.log(`Executing action: ${actionName}`);
      await action.execute(interaction as ModalSubmitInteraction);
      return;
    }
  } catch (error) {
    await logAndSendError(
      interaction,
      "There was an error while executing this interaction!",
      error,
    );
  }
});

client.on("voiceStateUpdate", handleVcLogger);
client.on("voiceStateUpdate", handleVcJoin);
client.on("voiceStateUpdate", handleVcLeave);

export { FILE_TYPE, client, commands, actions };
client.login(env.tokens.discordToken).catch((error) => {
  console.error("[ERROR] Failed to login Discord client:", error);
});
