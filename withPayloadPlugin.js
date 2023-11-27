const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");
const path = require("path");
const loadPayloadConfig = require("./loadPayloadConfig");
const mockModulePath = path.resolve(__dirname, "./mocks/emptyModule.js");
const customCSSMockPath = path.resolve(__dirname, "./mocks/custom.css");

async function checkFileExists(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

const withPayload = async (config, paths) => {
  const {
    cssPath,
    payloadPath,
    configPath,
    adminRoute: adminRouteArg = "/admin",
  } = paths || {};

  let payloadConfig = await loadPayloadConfig(configPath);

  let cssFilePath = customCSSMockPath;

  if (cssPath) {
    if (await checkFileExists(cssPath)) {
      cssFilePath = cssPath;
    } else {
      console.warn(
        `WARNING(withPayload): Custom CSS file not found at ${cssPath}. Please update your next.config.js file.`
      );
    }
  }

  payloadConfig = {
    ...payloadConfig,
    admin: {
      ...payloadConfig.admin,
      css: cssFilePath,
    },
    paths: {
      ...payloadConfig.paths,
      rawConfig: configPath,
    },
  };

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
      "drizzle-kit",
      "drizzle-kit/utils",
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

      let alias = {
        ...incomingWebpackConfig.resolve.alias,
        "payload-config": configPath,
        "payload-user-css": cssFilePath,
        payload$: mockModulePath,
        "@payloadcms/bundler-webpack": path.resolve(
          __dirname,
          "../bundler-webpack/dist/mocks/emptyModule.js"
        ),
        "@payloadcms/next-payload/getPayload":
          payloadPath ||
          path.resolve(process.cwd(), "./payload/payloadClient.ts"),
      };

      if (!isServer) {
        alias["@payloadcms/db-postgres"] = path.resolve(
          __dirname,
          "./mocks/db-postgres.js"
        );

        alias["@payloadcms/db-mongodb"] = path.resolve(
          __dirname,
          "./mocks/db-mongodb.js"
        );
      }

      let newWebpackConfig = {
        ...incomingWebpackConfig,
        externals: [
          ...(incomingWebpackConfig.externals || []),
          {
            "@swc/core": "@swc/core",
            "drizzle-kit": "drizzle-kit",
            "drizzle-kit/utils": "drizzle-kit/utils",
            "pg-native": "pg-native",
            mongoose: "mongoose",
          },
        ],
        plugins: [
          ...(incomingWebpackConfig.plugins || []),
          new FilterWarningsPlugin({
            exclude: [/Critical dependency/, /require.extensions/],
          }),
        ],
        resolve: {
          ...incomingWebpackConfig.resolve,
          alias,
        },
      };

      if (!configRequiresSharp) {
        newWebpackConfig.resolve.alias.sharp = mockModulePath;
      }

      if (typeof payloadConfig.admin.webpack === "function" && !isServer) {
        return payloadConfig.admin.webpack(newWebpackConfig);
      }

      return newWebpackConfig;
    },
    transpilePackages: [
      ...(config.transpilePackages || []),
      "@payloadcms/next-payload",
      "payload",
      "@payloadcms/richtext-slate",
      "@payloadcms/richtext-lexical",
      "@payloadcms/plugin-cloud-storage",
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
