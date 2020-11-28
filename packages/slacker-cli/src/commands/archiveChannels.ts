import { WebAPICallOptions, PaginatePredicate } from "slacker-core";
import { NodeSlackerClient } from "../NodeSlackerClient";
import { channel, message } from "../typing";

export async function archiveChannels(
  channels: channel[],
  daysToArchive: number = 31,
  isDryRun = true
): Promise<boolean[]> {
  const nodeSlackerClient = this as NodeSlackerClient;
  const currentEpoch = Date.now() / 1000;
  const oneMonthEpoch = daysToArchive * 24 * 60 * 60; // 31 days. It does not need to be accurate.

  return await Promise.all(
    channels.map(async (channel: channel) => {
      const lastWorthwhileMessage = await getLastWorthwhileMessage.call(
        nodeSlackerClient,
        channel
      );
      if (lastWorthwhileMessage && lastWorthwhileMessage.ts && oneMonthEpoch) {
        if (currentEpoch - lastWorthwhileMessage.ts > oneMonthEpoch) {
          const result = await archiveChannel.call(
            nodeSlackerClient,
            channel,
            isDryRun
          );
          console.log(
            `Archiving '${channel.name}' - ${result ? "succeeded" : "failed"}.`
          );
          return true;
        }
        return false;
      } else {
        console.log(`${channel.name} has no conversations.`);
        return false;
      }
    })
  );
}

async function archiveChannel(
  channel: channel,
  isDryRun: boolean
): Promise<boolean> {
  const nodeSlackerClient = this as NodeSlackerClient;
  // This is a POST request. It should guarded by `isDryRun`.
  if (isDryRun) return true;
  const { ok } = await nodeSlackerClient.conversations.archive({
    channel: channel.id,
  });
  return ok;
}

async function getLastWorthwhileMessage(
  channel: channel
): Promise<message | null> {
  const nodeSlackerClient = this as NodeSlackerClient;
  const defaultOptions: WebAPICallOptions = {
    limit: 5,
  };

  /**
   * Ignore the message that has no `subtype` - It tends to be a message from bots.
   * Filter out "<This bot> has joined the channel".
   * @param message
   */
  function messageFilter(message: any) {
    return !message.subtype && message.ts;
  }

  /**
   * Break when there's a message that doesn't have `subtype`.
   */
  const breakCondition: PaginatePredicate = function (page) {
    return (
      page.messages &&
      Array.isArray(page.messages) &&
      page.messages.filter(messageFilter).length > 0
    );
  };

  const { list } = await nodeSlackerClient.fetchList(
    "conversations.history",
    {
      ...defaultOptions,
      channel: channel.id,
    },
    breakCondition
  );
  const lastMessages = list;

  const lastWorthwhileMessages = lastMessages.filter(messageFilter);
  return lastWorthwhileMessages.length
    ? lastWorthwhileMessages.slice(-1)[0]
    : null;
}
