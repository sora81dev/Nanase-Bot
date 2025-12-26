import { Command } from "./types/command";
import { Action, Actions } from "./types/action";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env" });

// 実行環境に応じてファイルタイプとディレクトリを決定
const FILE_TYPE: string = process.argv[2] === "js" ? ".js" : ".ts";
const IS_PRODUCTION = FILE_TYPE === ".js";
const BASE_DIR = IS_PRODUCTION ? "./dist" : "./src";

const commands: { [key: string]: Command } = {};
const actions: Actions = { button: {}, modal: {} };


console.log("FileType: ", FILE_TYPE);
console.log("Base Directory: ", BASE_DIR);
console.log("Fetching command...");

const commandFiles = fs.readdirSync(`${BASE_DIR}/commands`).filter((file) => file.endsWith(FILE_TYPE));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`) as Command;
    console.warn(`  Load: ${command.data.name}`);
    commands[command.data.name] = command;
}
console.log("End load command");
console.log("");

console.log("Fetching handlers...");

const folders = fs.readdirSync(`${BASE_DIR}/handlers`);
for (const folder of folders) {
    const actionFiles = fs.readdirSync(`${BASE_DIR}/handlers/${folder}`).filter((file) => file.endsWith(FILE_TYPE));
    console.log(`  Handler Type: ${folder}`);

    for (const file of actionFiles) {
        const path = `./handlers/${folder}/${file}`;
        const action = require(path) as Action<any>;
        console.warn(`    Load: ${action.data.actionName}`);

        actions[folder][action.data.actionName] = action;
    }

    console.log(`  End load ${folder} handlers`);
    console.log("")
}
console.log("End load handlers");
console.log("");

console.log("Registering commands...");


const client = new Client({
    intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
});

export { FILE_TYPE, client, commands, actions };
client.login(process.env.DISCORD_TOKEN);