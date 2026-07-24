import type {
  Interaction,
  CacheType,
  ModalSubmitInteraction,
  ButtonInteraction,
} from "discord.js";
import type { Command, ButtonCommand, ModalCommand } from "../../types/command";
import type { Action } from "../../types/action";

import { client, commands, actions } from "../..";
import logAndSendError from "../../utils/logAndSendError";

client.on("interactionCreate", handler);

async function handler(interaction: Interaction<CacheType>) {
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
}
