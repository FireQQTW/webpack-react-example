'use strict';

var path = require('path'),
    webpack = require("webpack"),
    AngularPlugin = require('angular-webpack-plugin');

module.exports = {
  devtool: '#inline-source-map',
  resolve: {
        root: [path.join(__dirname, "bower_components")]
  },
  plugins: [
      new webpack.ResolverPlugin(
        [new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])],
        ["normal", "loader"]
      ),
      new webpack.ProvidePlugin({
          $: "jquery",
          jQuery: "jquery",
          "windows.jQuery": "jquery",
          _: "underscore",
          ngRoute: 'angular-route',
          // angular: 'imports?this=>window!angular',
      }),
      new AngularPlugin()
  ],
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.scss$/, loader: "style!css!sass?outputStyle=expanded" },
      { test: /\.gif$/, loader: 'url?limit=150000&mimetype=image/gif' },
      { test: /\.png$/, loader: 'url?limit=150000&mimetype=image/png' },
      { test: /\.jpg$/, loader: 'file' },
      { test: /\.json$/, loader: 'json' },
      { test: /\.svg$/, loader: 'url?mimetype=image/svg+xml' },
      { test: /\.woff2?$/, loader: 'url?mimetype=application/font-woff' },
      { test: /\.eot$/, loader: 'url?mimetype=application/font-woff' },
      { test: /\.ttf$/, loader: 'url?mimetype=application/font-woff' },
      { test: /\.jsx/, loader: 'jsx?harmony' },
      { test: /\Modernizr.js$/, loader: 'imports?this=>global' },
    ]
  },
  entry: {
        all: "./app/assets/javascript/default",
  },
  output: {
    path: __dirname + '/dist/assets/javascript',
    filename: "[name].bundle.js",
    chunkFilename: "[id].bundle.js"
  },
  debug: true,
  watch: true,
  watchDelay: 200,
}