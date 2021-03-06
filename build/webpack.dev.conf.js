'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

// 获取景点信息json
const express = require('express')
const app = express()
var scenicdata = require('../src/assets/data/2017-nation-Beauty-spot-GeoJson.json')
var apiRoutes = express.Router()
app.use('/api', apiRoutes)


let wind_data = require('../src/assets/data/wind-global.json') // 获取风向信息json
let nature_2016_protect = require('../src/assets/data/nature_2016_protect.json') // 2016年5A景区
let nation_2016_geology = require('../src/assets/data/nation_2016_geology.json') // 2016国家地质公园
let nation_2016_woods = require('../src/assets/data/nation_2016_woods.json') // 2016年国家森林公园

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    disableHostCheck: true,
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    },
    // 获取景点信息json
    before(app) {
      app.get('/api/scenicdata', (req, res) => {
        res.json({
          errno: 0,
          data: scenicdata
        })
      })
      app.get('/api/winddata', (req, res) => {
        res.json({
          errno: 0,
          data: wind_data
        })
      })
      app.get('/api/nation_2016_geology', (req, res) => {
        res.json({
          errno: 0,
          data: nation_2016_geology
        })
      })
      app.get('/api/nation_2016_woods', (req, res) => {
        res.json({
          errno: 0,
          data: nation_2016_woods
        })
      })
      app.get('/api/nature_2016_protect', (req, res) => {
        res.json({
          errno: 0,
          data: nature_2016_protect
        })
      })
    }
    },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
