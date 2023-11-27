#!/usr/bin/env node
const minimist = require("minimist");

const args = minimist(process.argv.slice(2));
const scriptIndex = args._.findIndex((x) => x === "install");
const script = scriptIndex === -1 ? args._[0] : args._[scriptIndex];

switch (script.toLowerCase()) {
  case "install": {
    require("./install")();
    break;
  }

  default:
    console.log(`Unknown script "${script}".`);
    break;
}
