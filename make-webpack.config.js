'use strict';

var path = require('path'),
    webpack = require("webpack");


module.exports = function(options) {
  var devtool = '#source-map';

  var resolve = {
    root: [path.join(__dirname, "bower_components")],
    extensions: ['', '.js', '.jsx']
  };

  var plugins = [
      new webpack.ResolverPlugin(
        [new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])],
        ["normal", "loader"]
      ),
      new webpack.ProvidePlugin({
          $: "jquery/dist/jquery.min",
          jQuery: "jquery/dist/jquery.min",
          "windows.jQuery": "jquery/dist/jquery.min",
          _: "underscore",
          React: 'react'
      })
  ];

  var loaders = [
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
      { test: /\.jsx?$/, loaders: options.hotModule ? ['react-hot', 'jsx?harmony'] : ['jsx?harmony'], exclude: /node_modules/ },
      { test: /\Modernizr.js$/, loader: 'imports?this=>global' },
    ];

  var entry = {
        all: [
          "./app/assets/javascript/default"
        ]
  };

  var output = {
    path: __dirname + '/dist/assets/javascript/',
    filename: "[name].bundle.js",
    publicPath: '/assets/javascript/',
    chunkFilename: "[id].bundle.js"
  };

  if (options.minimize) {
    plugins.push(
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production")
        }
      }),
      new webpack.NoErrorsPlugin()
    );
  };

  if (options.hotModule) {
    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("development")
        }
      }),
      new webpack.NoErrorsPlugin()
    );

    entry.all.push(
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server'
    );
  };

  return {
    devtool: devtool,
    resolve: resolve,
    plugins: plugins,
    module: {
      loaders: loaders
    },
    entry: entry,
    output: output
  };
}