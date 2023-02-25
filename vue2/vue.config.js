const { defineConfig } = require('@vue/cli-service');
const path = require('path');
const basePublicPath = '/test';
/**
 * 开发环境配置
 * */
// 默认配置
const defaultDevServerConf = path.resolve(__dirname, 'dev-server-default.js');
let devServer = require(defaultDevServerConf);
devServer.static = {
  directory: path.resolve(__dirname, 'public/static'),
  publicPath: basePublicPath + '/static',
};

const webpackConfig = defineConfig({
  transpileDependencies: true,
  devServer,
  publicPath: basePublicPath,
  productionSourceMap: true,
  pages: {
    index: {
      entry: ['node_modules/babel-polyfill', 'src/entry/main.js'],
      template: 'public/index.html',
      filename: 'index.html',
      title: '复习',
    },
  },
  css: {
    loaderOptions: {
      sass: {
        sassOptions: { outputStyle: 'expanded' },
      },
    },
  },
  chainWebpack: config => {
    // 开发环境下缓存到硬盘中，加快npm run dev速度
    if (process.env.NODE_ENV === 'development') {
      config.cache({
        type: 'filesystem',
        cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack'),
      });
    }

    /**
     * 别名配置
     * */
    config.resolve.alias.set('@', path.resolve(__dirname, 'src'));

    /**
     * splitChunks配置
     * */
    config.optimization.splitChunks({
      chunks: 'all',
      minSize: 100,
      maxInitialRequests: Infinity,
      cacheGroups: {
        // 第三方组件
        libs: {
          // 指定chunks名称
          name: 'chunk-libs',
          // 符合组的要求就给构建venders
          test: /[\\/]node_modules[\\/]/,
          // priority:优先级：数字越大优先级越高，因为默认值为0，所以自定义的一般是负数形式,决定cacheGroups中相同条件下每个组执行的优先顺序。
          priority: -10,
          // 仅限于最初依赖的第三方
          chunks: 'initial',
        },
        elementUI: {
          // 将elementUI拆分为单个包
          name: 'chunk-elementUI',
          // 重量需要大于libs和app，否则将打包到libs或app中
          priority: -5,
          // 为了适应cnpm
          test: /[\\/]node_modules[\\/]_?element-ui(.*)/,
        },
        components: {
          name: 'chunk-components',
          test: path.resolve(__dirname, 'src/components'),
          minChunks: 2,
          priority: -20,
          // 这个的作用是当前的chunk如果包含了从main里面分离出来的模块，则重用这个模块，这样的问题是会影响chunk的名称。
          reuseExistingChunk: true,
        },
        commons: {
          name: 'chunk-commons',
          test: path.resolve(__dirname, 'src/common'),
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        utils: {
          name: 'chunk-utils',
          test: path.resolve(__dirname, 'src/utils'),
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    });

    // 打包分析analyzer插件
    if (process.env.WEBPACK_ENV_ANALYZER) {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      config.plugin('analyzer').use(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerHost: '127.0.0.1',
          analyzerPort: '8888',
          reportFilename: 'report.html',
          defaultSizes: 'parsed',
          openAnalyzer: true,
          generateStatsFile: false,
          statsFilename: 'stats.json',
          statsOptions: null,
          excludeAssets: null,
          logLevel: 'info',
        })
      );
    }
  },
});

module.exports = webpackConfig;
