const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const path = require('path');
const mockModulePath = path.resolve(__dirname, './mocks/emptyModule.js');
const customCSSMockPath = path.resolve(__dirname, './mocks/custom.css'); 

const withPayload = (config, paths) => {
  const { configPath, cssPath, payloadPath } = paths;

  return {
    ...config,
    webpack: (webpackConfig, webpackOptions) => {
      const incomingWebpackConfig = typeof config.webpack === 'function' ? config.webpack(webpackConfig, webpackOptions) : webpackConfig;

      incomingWebpackConfig.module.rules.push({
        issuer: /pages[\\/]admin/,
        layer: 'payload-admin',
      })

      incomingWebpackConfig.module.rules.push({
        oneOf: [
          {
            test: /\.(?:ico|gif|png|jpg|jpeg|woff(2)?|eot|ttf|otf|svg)$/i,
            type: 'asset/resource',
          },
        ],
      })

      if (!webpackOptions.isServer) {
        incomingWebpackConfig.module.rules.push({
          test: /\.(scss|css)/,
          sideEffects: true,
          issuerLayer: 'payload-admin',
          // include: [
          //   path.resolve(__dirname, 'node_modules/payload'),
          //   path.resolve(__dirname, 'payload'),
          //   path.resolve(__dirname, 'node_modules/react-datepicker'),
          // ],
          use: [
            require.resolve('style-loader'),
            {
              loader: require.resolve('css-loader'),
              options: {
                modules: true,
                url: (url) => (!url.startsWith('/')),
              },
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                postcssOptions: {
                  plugins: [require.resolve('postcss-preset-env')],
                },
              },
            },
            require.resolve('sass-loader'),
          ],
        });
      }

      return {
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
    },
    rewrites: async () => {
      const incomingRewrites = typeof config.rewrites === 'function' ? await config.rewrites() : config.rewrites;
      const resultingRewrites = [ ...incomingRewrites || [] ]

      if (process.env.NODE_ENV === 'production') {
        resultingRewrites.push({
          "source": "/admin",
          "destination": "/admin/index.html"
        })

        resultingRewrites.push({
          "source": "/admin/:path*",
          "destination": "/admin/index.html"
        })
      }

      return resultingRewrites;
    },
    transpilePackages: [
      ...config.transpilePackages || [],
      'payload',
      'mongoose'
    ]
  }
}

module.exports = withPayload