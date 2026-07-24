import type { ThreadChannel } from "discord.js";

import { client } from "../..";
import { runSafely } from "../../utils/safe";
import noticeNewRecruit from "../../jobs/noticeNewRecruit";
import { env } from "../../configs/env";

client.on("threadCreate", handler);

async function handler(thread: ThreadChannel) {
  if (thread.parentId === env.channelID.recruitThread) {
    console.log("[noticeNewRecruit] Detect new Recruit");
    await runSafely("Notice new recruit thread", () =>
      noticeNewRecruit(thread),
    );
  }
}
