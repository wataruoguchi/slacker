const nock = require("nock");
import { LogLevel } from "slacker-core";
import { NodeSlackerClient } from "../NodeSlackerClient";
import { channel } from "../typing";
import { archiveChannels } from "./archiveChannels";
const conversationsHistory = require("../../mock/responses/conversations.history.json");

const channels: channel[] = [
  {
    id: "1",
    name: "foo",
    name_normalized: "foo",
    is_archived: false,
    is_general: false,
    is_private: false,
  },
  {
    id: "2",
    name: "bar",
    name_normalized: "bar",
    is_archived: false,
    is_general: false,
    is_private: false,
  },
];

describe("archiveChannels", () => {
  let nodeSlackerClient: NodeSlackerClient;
  let scope;

  beforeEach(() => {
    scope = nock("https://slack.com");
    nodeSlackerClient = new NodeSlackerClient("xoxb-faketoken1234", {
      logLevel: LogLevel.ERROR,
    });
  });

  test("It archives channels.", async () => {
    scope
      .persist()
      .post(/api\/conversations\.history/)
      .reply(200, conversationsHistory);
    const [resultForChannel1, resultForChannel2] = await archiveChannels.call(
      nodeSlackerClient,
      channels
    );
    expect(resultForChannel1).toBe(true);
    expect(resultForChannel2).toBe(true);
  });
});
