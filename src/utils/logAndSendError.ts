export default function logAndSendError(
  interaction: any,
  message: string,
  err?: any,
) {
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
