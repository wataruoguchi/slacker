import { NodeSlackerClient } from "../NodeSlackerClient";
import { user, channel } from "../typing";

export async function inviteAllMembers(
  channels: channel[],
  users: user[],
  channelName: string,
  isDryRun = true
) {
  const nodeSlackerClient = this as NodeSlackerClient;
  if (channelName.length === 0) {
    console.log("No channel name given. Use `channelName`");
    return;
  }
  const [channel] = channels.filter(
    (channel: channel) => channel.name === channelName
  );
  if (!channel) {
    console.log(`No channel found: ${channelName}`);
    return;
  }
  const ok = await inviteUsersToChannel.call(
    nodeSlackerClient,
    channel,
    users.filter((user) => !user.is_bot),
    isDryRun
  );
  if (ok) {
    console.log(`All members have been invited to ${channelName}`);
  } else {
    console.log(`Failed on inviting users to ${channelName}`);
  }
}

async function inviteUsersToChannel(
  channel: channel,
  users: user[],
  isDryRun = true
): Promise<boolean> {
  const nodeSlackerClient = this as NodeSlackerClient;
  // This is a POST request. It should guarded by `isDryRun`.
  if (isDryRun) return true;
  const { ok } = await nodeSlackerClient.conversations.invite({
    channel: channel.id,
    users: users.map((user) => user.id).join(","),
  });
  return ok;
}
