import yargs from "yargs";

function getVersion() {
  const version = require("../package.json").version;
  return `v. ${version}`;
}

async function run(): Promise<void> {
  const usage = `Run with your SLACK_TOKEN.
e.g.,) SLACK_TOKEN=xoxb-1234567890 slacker --dryRun=0`;
  yargs
    .version(getVersion())
    .commandDir("cmds", { extensions: ["ts", "js"] })
    .demandCommand()
    .usage(usage)
    .help().argv;
}

export { run };
