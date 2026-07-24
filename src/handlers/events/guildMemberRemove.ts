import { client } from "./../../index";
import { updateMemberCount } from "../../jobs/updateMemberCount";

client.on("guildMemberRemove", handler);

async function handler() {
  await updateMemberCount(client);
}
