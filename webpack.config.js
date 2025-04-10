const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
    assetModuleFilename: 'assets/[name][hash][ext]',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(png|jpg|jpeg|tif|mp4|gif|svg)$/i,
        type: "asset/resource",
        generator: {
            filename: 'assets/[name][hash][ext]' // Custom folder structure (assets/)
          }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    }),
    new CopyPlugin({
        patterns: [
            { from: "assets/**/*", to: "./[path][name][ext]", context: "src" },
        ],
    }),
  ],
  mode: "production"
};