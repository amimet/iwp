import { defineConfig } from 'umi';
import path from 'path';

export default defineConfig({
  hash: true,
  //devtool: 'eval',
  dva: { immer: true },
  targets: { ie: 11 },
  ignoreMomentLocale: true,
  nodeModulesTransform: {
    type: 'none',
  },
  alias: {
    globals: path.resolve(__dirname, './globals'),
    theme: path.resolve(__dirname, './src/theme'),
    locales: path.resolve(__dirname, './src/locales'),
    core: path.resolve(__dirname, './src/core'),
    config: path.resolve(__dirname, './config'),
    pages: path.resolve(__dirname, './src/pages'),
    components: path.resolve(__dirname, './src/components'),
    models: path.resolve(__dirname, './src/models'),
    node_modules: path.resolve(__dirname, './node_modules')
  },
  extraBabelPresets: ['@lingui/babel-preset-react'],
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'lodash',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
      'lodash',
    ],
  ],
})