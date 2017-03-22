// 文件hash缓存
// 参考：
// 1. https://webpack.js.org/guides/caching/
// 2. https://github.com/soundcloud/chunk-manifest-webpack-plugin/issues/5

// TODO：
// 1. build生成的文件中，除了改动的文件被修改了，不知道为什么vendors.js.map文件也被修改了？？？
// 2. 对css添加hash缓存，不管css有没有被修改，每次build都会被重新打包？？？

var glob = require('glob')
var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var ChunkManifestPlugin = require('chunk-manifest-webpack-plugin')
var WebpackChunkHash = require("webpack-chunk-hash")

// 获取当前分支版本号，分支格式为`daily/x.y.z`
var execSync = require('child_process').execSync
var gitBranch = execSync(`git symbolic-ref --short HEAD`).toString().trim()
var gitVersion = gitBranch.split('/')[1] || '0.0.1'

// 配置项目cdn地址
var cdnPath = '//g.alicdn.com/mm/sem-bp/' + gitVersion + '/'

var BUILD_PATH = path.resolve(__dirname, 'build')

var isDEV = process.env.NODE_ENV === 'development'

// 获取入口js文件
var entries = getEntry('./app/pages/**/*.js')
var chunks = Object.keys(entries)

module.exports = {
  entry: entries,
  output: {
    path: BUILD_PATH,
    publicPath: isDEV ? '/build/' : cdnPath,
    filename: isDEV ? '[name].js' : '[name].[chunkhash:5].js',
    chunkFilename: isDEV ? '[id].js' : '[id].[chunkhash:5].js'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        enforce: 'pre',
        test: /.vue$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loaders: 'vue-loader',
        options: {
          postcss: [require('postcss-cssnext')()],
          loaders: {
            css: ExtractTextPlugin.extract({
              fallback: 'vue-style-loader',
              use: [
                {
                  loader: 'css-loader',
                  options: {
                    sourceMap: isDEV ? true : false,
                    minimize: !isDEV
                  }
                }, 
                'less-loader'
              ]
            })
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: isDEV ? true : false,
                minimize: !isDEV
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: function() {
                  return [
                    require('autoprefixer')
                  ]
                }
              }
            },
            'less-loader'
          ]
        })
      }
    ]
  },
  devtool: '#inline-source-map',
  devServer: {
    contentBase: __dirname,
    compress: true
  },
  resolve: {
    extensions: ['.vue', '.js'],
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true
    }),
    new webpack.ProvidePlugin({
      $: 'webpack-zepto'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['vendors', 'manifest'],
      chunks: chunks,
      minChunks: chunks.length
    })
  ]
}

// 获取html页面文件
var pages = getEntry('./app/pages/**/*.html')
for (var pathname in pages) {

  // 配置生成的 html 文件，定义路径等
  var conf = {
    filename: pages[pathname].substring(pages[pathname].lastIndexOf(pathname)), // html 文件输出路径
    template: pages[pathname], // 模板路径
    inject: true,              // js 插入位置
    minify: {
      removeComments: true
    }
  }
  if (pathname in module.exports.entry) {
    conf.chunks = ['vendors', pathname]

    // 发现.vue文件中写入JavaScript代码后，导致index在前，vendors在后
    // 保证被插入的js中vendors始终在index前面
    conf.chunksSortMode = function(a, b) {
      return a.names[0] > b.names[0] ? -1 : (a.names[0] < b.names[0] ? 1 : 0)
    }
  }

  module.exports.plugins.push(new HtmlWebpackPlugin(conf))
}

// 生产环境
if (!isDEV) {
  module.exports.devtool = '#source-map'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      comments: false,
      compress: {
        warnings: false,
        drop_console: true,
      }
    }),
    new webpack.HashedModuleIdsPlugin(),
    new WebpackChunkHash(),
    new ChunkManifestPlugin({
      filename: '../manifest.json',
      manifestVariable: 'webpackManifest'
    }),
    new CleanWebpackPlugin(['build'])
  ])
}

function getEntry(globPath) {
  var entries = {}, basename, tmp, pathname

  glob.sync(globPath).forEach(function (entry) {
    basename = path.basename(entry, path.extname(entry))
    tmp = entry.split('/').splice(-2)
    pathname = tmp.splice(0, 1) + '/' + basename // 正确输出 js 和 html 的路径
    entries[pathname] = entry
  })
  return entries
}
