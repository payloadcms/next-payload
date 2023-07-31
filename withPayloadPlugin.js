const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");
const path = require("path");
const loadPayloadConfig = require("./loadPayloadConfig");
const mockModulePath = path.resolve(__dirname, "./mocks/emptyModule.js");
const customCSSMockPath = path.resolve(__dirname, "./mocks/custom.css");

const withPayload = async (config, paths) => {
  const { cssPath, payloadPath, configPath } = paths || {};

  const payloadConfig = await loadPayloadConfig(configPath);

  const configRequiresSharp = payloadConfig.collections.find(({ upload }) => {
    if (typeof upload === "object" && upload !== null) {
      if (upload.imageSizes || upload.resizeOptions || upload.formatOptions) {
        return true;
      }
    }
    return false;
  });

  const outputFileTracingExcludes = {
    "**/*": [
      "node_modules/@swc/core-linux-x64-gnu",
      "node_modules/@swc/core-linux-x64-musl",
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
      appDir: true,
      outputFileTracingExcludes,
      serverComponentsExternalPackages: [
        ...(config?.experimental?.serverComponentsExternalPackages || []),
        "mongoose",
        "payload",
      ],
    },
    webpack: (webpackConfig, webpackOptions) => {
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
          alias: {
            ...incomingWebpackConfig.resolve.alias,
            "@payloadcms/next-payload/getPayload":
              payloadPath ||
              path.resolve(process.cwd(), "./payload/payloadClient.ts"),
            "payload-config": configPath,
            payload$: mockModulePath,
            "payload-user-css": cssPath || customCSSMockPath,
            [path.resolve(process.cwd(), "./node_modules/payload/dist/bundlers/webpack/bundler.js")]: mockModulePath,
          },
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

      const payloadAdminRewrite = {
        source: "/admin/:path*",
        destination: "/admin",
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
