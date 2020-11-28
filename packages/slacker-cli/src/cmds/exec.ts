exports.command = "exec <command>";
exports.aliases = ["e"];
exports.desc = "Execute a Slacker command.";
exports.builder = function (yargs) {
  return yargs.commandDir("exec_cmds", { extensions: ["ts", "js"] });
};
exports.handler = function () {};
