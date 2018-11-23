[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/cuppi/postcss-ketchup.svg
[ci]:      https://travis-ci.org/cuppi/postcss-ketchup
[CSS]:     https://developer.mozilla.org/zh-CN/docs/Web/CSS
[Icon]:    http://i-film-beta.oss-cn-shanghai.aliyuncs.com/framework/postcss-ketchup/ketch-icon.png
[postcss-loader]: https://github.com/postcss/postcss-loader
# JBZ-OSS-TOOL [![Build Status][ci-img]][ci]
jbz-oss-tool 是一个基于vue-cli2 或 3 的工具, 由金保证公司内部使用, 其主要任务
为打包vue项目并将打包好的资源文件按照目录结构上传到阿里云并将项目内部引用路径同步修改。

## 开始
第一件事当然是安装依赖，如果使用yarn:
```bash
yarn add jbz-oss-tool --dev
```
或者npm:
```bash
npm install jbz-oss-tool --save-dev
```


## 用法

### 配置
配置方法很简单.
你可以创建一个.jbz.oss.config.js文件在项目的根目录下，并且修改package.json如
下所示：
```json
{
  "scripts": {
    "smart-build-beta": "jbz-oss-build beta",
    "smart-build-pro": "jbz-oss-build pro"
  }
}
```
> 提示: beta参数及pro参数分别代表测试打包环境及生产打包环境，也是打包脚本需要处理的参数。

### .jbz.oss.config.js
| 参数 | 说明 | 默认配置 |
|--------|:-----:|----|
|region         | oss区域          |-|
|accessKeyId    | oss密钥id          |-|
|accessKeySecret| oss密钥secret      |-|
|projectPath    | 本地环境最外层目录   | path.resolve(__dirname, './')|
|buildToolPath  | 打包js脚本路径      |-|
|buildToolScript| 打包js命令          |-|
|vueCliVersion  | 使用的vue版本       | 2|
|betaBuildPath  | 测试环境打包目标路径 | path.resolve(__dirname, './dist_beta')|
|betaIndexPath  | 测试环境入口html路径 | path.resolve(betaBuildPath, './index.html')|
|proBuildPath   | 生产环境打包目标路径 | path.resolve(__dirname, './dist_pro')|
|proIndexPath   | 生产环境入口html路径 | path.resolve(proBuildPath, './index.html')|
|ossDirectory   | oss上传路径基地址    | path.basename(projectPath) + '/'|
> 注意: 该文件应该被git忽略，默认配置需要手动粘贴到配置文件中，当buildToolPath及buildToolScript
同时设置时将使用buildToolPath配置，当时用vueCliVersion为3时将忽略buildToolPath及buildToolScript配置
并使用vue-cli3提供的打包命令进行打包。
