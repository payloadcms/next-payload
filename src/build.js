const path = require('path');
const swcRegister = require('@swc/register');
const copyRecursiveSync = require('./utilities/copyRecursiveSync');
const build = require('payload/dist/bin/build');
const loadConfig = require('payload/dist/config/load');

swcRegister({
  sourceMaps: 'inline',
  jsc: {
    parser: {
      syntax: 'typescript',
      tsx: true,
    },
  },
  module: {
    type: 'commonjs',
  },
});

module.exports = async () => {
  const config = await loadConfig();
  await build();
  copyRecursiveSync(config.admin.buildPath, path.resolve(process.cwd(), `./public${config.routes.admin}`))
  process.exit(0)
}
