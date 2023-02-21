const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const path = require('path');
const loadPayloadConfig = require('./loadPayloadConfig');
const mockModulePath = path.resolve(__dirname, './mocks/emptyModule.js');
const customCSSMockPath = path.resolve(__dirname, './mocks/custom.css'); 

const withPayload = async (config, paths) => {
  const { configPath, cssPath, payloadPath } = paths;

  const payloadConfig = await loadPayloadConfig(configPath);

  return {
    ...config,
    experimental: {
      ...config.experimental,
      appDir: true,
    },
    webpack: (webpackConfig, webpackOptions) => {
      const incomingWebpackConfig = typeof config.webpack === 'function' ? config.webpack(webpackConfig, webpackOptions) : webpackConfig;

      incomingWebpackConfig.module.rules.push({
        oneOf: [
          {
            test: /\.(?:ico|gif|png|jpg|jpeg|woff(2)?|eot|ttf|otf|svg)$/i,
            type: 'asset/resource',
          },
        ],
      })

      let newWebpackConfig = {
        ...incomingWebpackConfig,
        plugins: [
          ...incomingWebpackConfig.plugins || [],
          new FilterWarningsPlugin({
            exclude: [/Critical dependency/, /require.extensions/]
          })
        ],
        resolve: {
          ...incomingWebpackConfig.resolve,
          alias: {
            ...incomingWebpackConfig.resolve.alias,
            '@payloadcms/next-payload/getPayload': payloadPath || path.resolve(process.cwd(), './payload.ts'),
            'payload-config': configPath,
            payload$: mockModulePath,
            'payload-user-css': cssPath || customCSSMockPath,
          }
        }
      }

      if (typeof payloadConfig.admin.webpack === 'function') {
        return payloadConfig.admin.webpack(newWebpackConfig);
      }

      return newWebpackConfig;
    },
    transpilePackages: [
      ...config.transpilePackages || [],
      'payload',
      'mongoose'
    ]
  }
}

module.exports = withPayload