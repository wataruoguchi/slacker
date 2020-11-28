import { NodeSlackerClient, LogLevel } from "../../NodeSlackerClient";
import { inviteAllMembers } from "../../commands";

exports.command = "inviteAllMembers <channelName> [isDryRun]";
exports.aliases = ["i"];
exports.desc =
  "Invite all members in the workspace into the <channelName>. The channel has to exist. You can run this once for a channel.";
exports.builder = {
  isDryRun: { default: 1, choices: [1, 0] },
};
exports.handler = async function (argv) {
  console.log("inviteAllMembers", argv);
  const token: string | undefined = process.env.SLACK_TOKEN;
  if (!token) {
    throw new Error("SLACK_TOKEN is required.");
  }

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

  // Fetch the list of users.
  const users = await slackerClientNode.getList("users.list");

  await inviteAllMembers.call(
    slackerClientNode,
    channels,
    users,
    argv.channelName,
    argv.isDryRun === 1
  );

  // Finalize
  slackerClientNode.save();
};
