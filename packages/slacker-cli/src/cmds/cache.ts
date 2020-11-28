import { NodeSlackerClient, LogLevel } from "../NodeSlackerClient";

exports.command = "cache [keyToBust]";
exports.desc =
  "Bust cache by key. List cache keys and stored date (unix timestamp) if no key is set.";
exports.builder = {
  keyToBust: {
    default: false,
  },
};
exports.handler = function (argv) {
  const token: string | undefined = process.env.SLACK_TOKEN;
  if (!token) {
    throw new Error("SLACK_TOKEN is required.");
  }

  const slackerClientNode = new NodeSlackerClient(token, {
    logLevel: LogLevel.ERROR,
  });

  if (argv.keyToBust) {
    slackerClientNode.cacheManager.bustCache(argv.keyToBust);
    slackerClientNode.save();
  }

  // Display the cache catalogue.
  console.log(slackerClientNode.cacheManager.getCacheDates());
};
