import { container, DefinePlugin } from 'webpack';

export default {
  output: {
    publicPath: 'http://localhost:4200/',
    uniqueName: 'app-shell',
    scriptType: 'text/javascript',
  },
  optimization: {
    runtimeChunk: false,
  },
  plugins: [
    new container.ModuleFederationPlugin({
      shared: {
        '@angular/core': { eager: true, singleton: true },
        '@angular/common': { eager: true, singleton: true },
        '@angular/router': { eager: true, singleton: true },
        vue: {
          eager: true,
          singleton: true,
        },
        react: {
          eager: true,
          singleton: true,
        },
        'react-dom/client': {
          eager: true,
          singleton: true,
        },
      },
    }),
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    }),
  ],
};
