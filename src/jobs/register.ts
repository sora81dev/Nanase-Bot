import { client, commands } from "..";

export async function commandRegister() {
  const data: Record<string, any>[] = new Array();

  for (const commandName in commands) {
    console.warn(`  Registering command: ${commandName}`);
    data.push(commands[commandName].data);
  }

  await client.application?.commands.set(data as any);

  console.log("Commands registered successfully!");
}
