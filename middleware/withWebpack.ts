import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import history from 'connect-history-api-fallback';
import path from 'path';
import getWebpackDevConfig from 'payload/dist/webpack/getDevConfig';
import { SanitizedConfig } from 'payload/dist/config/types';

let cached = global._payloadWebpack;

if (!cached) {
  // eslint-disable-next-line no-multi-assign
  cached = global._payloadWebpack = { compiler: null, webpackConfig: null };
}

export const getCompiler = (config: SanitizedConfig): {
  compiler: webpack.Compiler,
  webpackConfig: webpack.Configuration
} => {
  if (cached.compiler && cached.webpackConfig) {
    return cached;
  } else {
    const webpackDevConfig = getWebpackDevConfig(config);
    cached.webpackConfig = webpackDevConfig;
    cached.compiler = webpack(webpackDevConfig)
  }

  return cached;
};

const withWebpack = (handler) => (req, res) => {
  const { compiler, webpackConfig } = getCompiler({
    ...req.payload.config,
    admin: {
      ...req.payload.config.admin,
      indexHTML: path.resolve(process.cwd(), './node_modules/payload/dist/admin/index.html')
    }
  });

  history()(req, res, () => {
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output ? webpackConfig.output.publicPath : ''
    })(req, res, () => {
      webpackHotMiddleware(compiler)(req, res, () => {
        handler(req, res)
      })
    })
  })
}

export default withWebpack