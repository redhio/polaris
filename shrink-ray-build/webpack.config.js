const path = require('path');
const webpack = require('webpack');
const {
  svgOptions: svgOptimizationOptions,
} = require('@redhio/images/optimize');
const postcssRedhio = require('postcss-redhio');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

const ICON_PATH_REGEX = /icons\//;
const IMAGE_PATH_REGEX = /\.(jpe?g|png|gif|svg)$/;

module.exports = {
  target: 'web',
  devtool: 'eval',
  entry: [
    '@redhio/polaris/styles/global.scss',
    path.join(__dirname, 'index.tsx'),
  ],
  output: {
    filename: 'build/bundle.js',
    publicPath: '/assets/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      '@redhio/polaris': path.resolve(__dirname, '..', 'src'),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: path.resolve(
        __dirname,
        'build/bundle-analysis/report.html',
      ),
      generateStatsFile: true,
      statsFilename: path.resolve(
        __dirname,
        'build/bundle-analysis/stats.json',
      ),
      openAnalyzer: false,
    }),
  ],
  module: {
    loaders: [
      {
        test(resource) {
          return ICON_PATH_REGEX.test(resource) && resource.endsWith('.svg');
        },
        use: [
          {
            loader: '@redhio/images/icon-loader',
          },
          {
            loader: 'image-webpack-loader',
            options: {
              svgo: svgOptimizationOptions(),
            },
          },
        ],
      },
      {
        test(resource) {
          return (
            IMAGE_PATH_REGEX.test(resource) && !ICON_PATH_REGEX.test(resource)
          );
        },
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              emitFile: true,
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              silent: true,
              useBabel: true,
              useCache: true,
              useTranspileModule: true,
              transpileOnly: true,
              cacheDirectory: path.resolve(__dirname, '.cache', 'typescript'),
              babelOptions: {
                babelrc: false,
                presets: [
                  ['redhio/web', {modules: false}],
                  ['redhio/react', {hot: true}],
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            query: {
              sourceMap: false,
              modules: true,
              importLoaders: 1,
              localIdentName: '[name]-[local]_[hash:base64:5]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => postcssRedhio(),
              sourceMap: false,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false,
              includePaths: [path.resolve(__dirname, '..', 'src', 'styles')],
            },
          },
          {
            loader: 'sass-resources-loader',
            options: {
              resources: [
                path.resolve(
                  __dirname,
                  '..',
                  'src',
                  'styles',
                  'foundation.scss',
                ),
                path.resolve(__dirname, '..', 'src', 'styles', 'shared.scss'),
              ],
            },
          },
        ],
      },
    ],
  },
};
