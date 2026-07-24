import type { ThreadChannel } from "discord.js";

import { client } from "../..";
import { runSafely } from "../../utils/safe";
import noticeNewRecruit from "../../jobs/noticeNewRecruit";

client.on("threadCreate", handler);

async function handler(thread: ThreadChannel) {
  if (thread.parentId === "1454093291325886658") {
    console.log("[noticeNewRecruit] Detect new Recruit");
    await runSafely("Notice new recruit thread", () =>
      noticeNewRecruit(client, thread),
    );
  }
}
