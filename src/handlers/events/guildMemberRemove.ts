import { client } from "./../../index";
import { updateMemberCount } from "../../jobs/updateMemberCount";

export default async function guildMemberRemove() {
  await updateMemberCount(client);
}
