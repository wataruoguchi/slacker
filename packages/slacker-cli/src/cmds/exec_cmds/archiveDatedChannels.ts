import { NodeSlackerClient, LogLevel } from "../../NodeSlackerClient";
import { archiveChannels } from "../../commands";

exports.command = "archiveDatedChannels <dayToArchive> [isDryRun]";
exports.aliases = ["a"];
exports.desc =
  "Archive channels that have no activities in last <dayToArchive> days.";
exports.builder = {
  isDryRun: { default: 1, choices: [1, 0] },
};
exports.handler = async function (argv) {
  console.log("archiveDatedChannels", argv);
  const token: string | undefined = process.env.SLACK_TOKEN;
  if (!token) {
    throw new Error("SLACK_TOKEN is required.");
  }
  if (typeof argv.dayToArchive !== "number")
    throw new Error(
      `dayToArchive is a number, not ${typeof argv.dayToArchive}`
    );

  const slackerClientNode = new NodeSlackerClient(token, {
    logLevel: LogLevel.ERROR,
  });

  // Fetch the list of channels (conversations).
  const channels = await slackerClientNode.getList("conversations.list", {
    types: "public_channel",
    exclude_archived: true,
  });

  // Let the bot join all the channels.
  for (const channel of channels) {
    const channelId: string = `${channel.id}`;
    await slackerClientNode.conversations.join({ channel: channelId });
  }

  await archiveChannels.call(
    slackerClientNode,
    channels,
    argv.daysToArchive,
    argv.isDryRun === 1
  );

  // Finalize
  slackerClientNode.save();
};
