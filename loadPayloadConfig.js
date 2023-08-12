const path = require("path");
const swcRegister = require("@swc/register");
const { getTsconfig } = require("get-tsconfig");
const { clientFiles } = require("payload/dist/config/clientFiles");

const tsConfig = getTsconfig();

const loadPayloadConfig = async (configPath) => {
  const swcOptions = {
    sourceMaps: "inline",
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: true,
      },
      paths: undefined,
      baseUrl: undefined,
    },
    module: {
      type: "commonjs",
    },
  };

  clientFiles.forEach((ext) => {
    require.extensions[ext] = () => null;
  });

  if (tsConfig?.config?.compilerOptions?.paths) {
    swcOptions.jsc.paths = tsConfig?.config?.compilerOptions?.paths;

    if (tsConfig?.config?.compilerOptions?.baseUrl) {
      swcOptions.jsc.baseUrl = path.resolve(
        tsConfig?.config?.compilerOptions?.baseUrl
      );
    }
  }

  swcRegister(swcOptions);

  const configPromise = require(configPath);
  let config = await configPromise;
  if (config.default) config = await config.default;
  return config;
};

module.exports = loadPayloadConfig;
