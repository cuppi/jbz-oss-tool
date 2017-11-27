/**
 * Created by cuppi on 2017/10/16.
 */
/* eslint-disable */
const oss_path = 'http://sandbox.hehe.com/js/';
const gulp = require('gulp');
const path = require('path')
const spawn = require('child_process').spawn;

const chalk = require('chalk')
const fs = require('fs');
const replace = require('gulp-replace');
const OssManager = require('./oss-manager');
const minimist = require('minimist');

const projectPath = require('./config').projectPath;
const buildToolPath = require('./config').buildToolPath;
const betaBuildPath = require('./config').betaBuildPath;
const betaIndexPath = require('./config').betaIndexPath;

/**
 * 执行命令
 * @param command 命令
 * @param args 参数
 * @param options 配置项
 * @returns {Promise}
 * @private
 */
function _doCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    let h = spawn(command, args, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout, stderr);
      }
    })
    console.log('\n');
    let success = true;
    h.stdout.on('data', function (s) {
      process.stdout.write(`${s.toString()}`);
    });

    h.stderr.on('data', (err) => {
      success = false;
      process.stdout.write(`stderr: ${err}`);
    });

    h.stdout.on('end', function () {
      if (success){
        resolve();
      } else {
        reject();
      }
    });
  })
}

/**
 * 进行自定义打包
 * @param type 打包生产环境
 * @returns {Promise}
 */
function cpBuild (type) {
  return new Promise((resolve, reject) => {
    console.log('node ' + buildToolPath + ' ' + type);
    _doCommand('node', [buildToolPath, type], {cwd: projectPath}).then(() => {
      resolve();
    }, () => {
      reject();
    })
  })
}

/**
 * 上传OSS文件
 */
function smartUploadOss () {
  console.log(chalk.green('开始阿里云上传...'));
  return new Promise((resolve, reject) => {
    let fileTree = fileTreeFromDirectory(path.resolve(__dirname, betaBuildPath));
    OssManager.defaultManager().doUploadByTree(fileTree).then(fileList => {
      console.log(chalk.green('阿里云上传成功'));
      let rs = [];
      fileList.map(val => {
        rs.push({from: path.relative(betaBuildPath, val.filePath), to: val.accessUrl})
      })
      replacePathInIndex(rs);
      resolve();
    }, error => {
      reject(error);
    });
  })
}

/**
 * 替换index.html文件中的Url
 * @param replaceList
 */
function replacePathInIndex(replaceList) {
  console.log(chalk.green('开始index.html同步...'));
  let filmPipe = gulp.src([betaIndexPath]);
  replaceList.forEach(rs => {
    filmPipe = filmPipe.pipe(replace(new RegExp('(.\/)*' + rs.from, 'g'), rs.to))
  });
  filmPipe.pipe(gulp.dest(betaBuildPath));
  console.log(chalk.green('index.html同步完成'));
}

/**
 * 遍历项目目录
 * @param directoryPath 目录路径
 * @returns {{name: *, path: *, childs: Array}}
 */
function fileTreeFromDirectory (directoryPath) {
  let fileTree = {name: path.basename(directoryPath), path: directoryPath, childs: []};
  let menu = fs.readdirSync(directoryPath)
  if(!menu){
    return;
  }
  menu.forEach((ele) => {
    let info = fs.statSync(directoryPath + '/' + ele)
    if(info.isDirectory()){
      fileTree.childs.push(fileTreeFromDirectory(directoryPath + '/' + ele));
    } else {
      fileTree.childs.push({name: ele, path: directoryPath + '/' + ele, childs: null});
    }
  })
  return fileTree;
}

cpBuild(process.argv[2]).then(() => {
  smartUploadOss().then(() => {
    console.log(chalk.green('oss依赖打包完成'));
  });
}, error => {
  console.log(chalk.red(`oss依赖打包失败: ${error}`));
});

/* eslint-enable */
