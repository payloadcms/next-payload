const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");
const {
  getBaseConfig,
} = require("@payloadcms/bundler-webpack/dist/configs/base");
const path = require("path");
const loadPayloadConfig = require("./loadPayloadConfig");
const mockModulePath = path.resolve(__dirname, "./mocks/emptyModule.js");
const mockNamedExportsPath = path.resolve(__dirname, "./mocks/emptyExports.js");
const customCSSMockPath = path.resolve(__dirname, "./mocks/custom.css");

const withPayload = async (config, paths) => {
  const {
    cssPath,
    payloadPath,
    configPath,
    adminRoute: adminRouteArg = "/admin",
  } = paths || {};

  let payloadConfig = await loadPayloadConfig(configPath);
  payloadConfig = {
    ...payloadConfig,
    admin: {
      ...payloadConfig.admin,
      css: cssPath || customCSSMockPath,
    },
    paths: {
      ...payloadConfig.paths,
      rawConfig: configPath,
    },
  };
  const payloadWebpackConfig = getBaseConfig(payloadConfig);

  const configRequiresSharp = Boolean(
    payloadConfig.collections.find(({ upload }) => {
      if (typeof upload === "object" && upload !== null) {
        if (upload.imageSizes || upload.resizeOptions || upload.formatOptions) {
          return true;
        }
      }
      return false;
    })
  );

  const outputFileTracingExcludes = {
    "**/*": [
      "node_modules/@swc/core-linux-x64-gnu",
      "node_modules/@swc/core-linux-x64-musl",
      "node_modules/@swc/core-darwin-x64",
      "node_modules/@swc/core",
      "node_modules/@swc/wasm",
      "node_modules/webpack/**/*",
      ...(config.experimental &&
      config.experimental.outputFileTracingExcludes &&
      config.experimental.outputFileTracingExcludes["**/*"]
        ? config.experimental.outputFileTracingExcludes["**/*"]
        : []),
    ],
    ...(config.experimental && config.experimental.outputFileTracingExcludes
      ? config.experimental.outputFileTracingExcludes
      : {}),
  };

  if (!configRequiresSharp) {
    outputFileTracingExcludes["**/*"].push("node_modules/sharp/**/*");
  }

  return {
    ...config,
    experimental: {
      ...config.experimental,
      outputFileTracingExcludes,
    },
    webpack: (webpackConfig, webpackOptions) => {
      const { isServer } = webpackOptions;
      const incomingWebpackConfig =
        typeof config.webpack === "function"
          ? config.webpack(webpackConfig, webpackOptions)
          : webpackConfig;

      incomingWebpackConfig.module.rules.push({
        oneOf: [
          {
            test: /node_modules[\\\/]payload[\\\/].*\.(?:ico|gif|png|jpg|jpeg|woff(2)?|eot|ttf|otf|svg)/,
            type: "asset/resource",
          },
        ],
      });

      const aliases = {
        ...incomingWebpackConfig.resolve.alias,
        "@payloadcms/next-payload/getPayload":
          payloadPath ||
          path.resolve(process.cwd(), "./payload/payloadClient.ts"),
        ...payloadWebpackConfig.resolve.alias,
      };

      if (!isServer) {
        aliases["@payloadcms/db-mongodb"] = mockNamedExportsPath;
        aliases["@payloadcms/db-postgres"] = mockNamedExportsPath;
      }

      let newWebpackConfig = {
        ...incomingWebpackConfig,
        plugins: [
          ...(incomingWebpackConfig.plugins || []),
          new FilterWarningsPlugin({
            exclude: [/Critical dependency/, /require.extensions/],
          }),
        ],
        resolve: {
          ...incomingWebpackConfig.resolve,
          alias: aliases,
        },
      };

      if (!configRequiresSharp) {
        newWebpackConfig.resolve.alias.sharp = mockModulePath;
      }

      if (typeof payloadConfig.admin.webpack === "function") {
        return payloadConfig.admin.webpack(newWebpackConfig);
      }

      return newWebpackConfig;
    },
    transpilePackages: [
      ...(config.transpilePackages || []),
      "@payloadcms/next-payload",
      "payload",
      "mongoose",
    ],
    rewrites: async () => {
      let userRewrites = config.rewrites;

      if (typeof config.rewrites === "function") {
        userRewrites = await config.rewrites();
      }

      const adminRoute = adminRouteArg.split("/").filter(Boolean).join("/");
      const payloadAdminRewrite = {
        source: `/${adminRoute}/:path*`,
        destination: `/${adminRoute}`,
      };

      if (Array.isArray(userRewrites)) {
        return [...userRewrites, payloadAdminRewrite];
      }

      if (userRewrites) {
        return {
          ...userRewrites,
          afterFiles: [...(userRewrites.afterFiles || []), payloadAdminRewrite],
        };
      }

      return [payloadAdminRewrite];
    },
  };
};

module.exports = withPayload;
