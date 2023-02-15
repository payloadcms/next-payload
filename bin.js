#!/usr/bin/env node
const build = require('./build');
const addEndpoints = require('./addEndpoints');
const scriptIndex = args._.findIndex((x) => x === 'add');
const script = scriptIndex === -1 ? args._[0] : args._[scriptIndex];

switch (script.toLowerCase()) {
  case 'add': {
    addEndpoints();
    break;
  }
  
  case 'build': {
    build();
    break;
  }

  default:
    console.log(`Unknown script "${script}".`);
    break;
}