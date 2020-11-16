#!/usr/bin/env node
/* eslint-disable */

const {src, dest} = require('gulp');
const path = require('path');
const {spawn} = require('child_process');
const cowsay = require('cowsay');
const os = require('os');
const fs = require('fs');
const chalk = require('chalk');
const replace = require('gulp-replace');

const {safe_get_file_from_root, safe_get_file_from_node_modules, log} = require('../src/tool');
let user_config_path = safe_get_file_from_root('.jbz.oss.config.js');
if (!user_config_path){
    console.log('没有找到配置文件, 请确认是否创建配置文件');
    return;
}

const config = require('../src/config');
const OssManager = require('../src/oss-manager');
const projectPath = config.projectPath;
const buildToolPath = config.buildToolPath;
const buildToolScript = config.buildToolScript;
const vueCliVersion = config.vueCliVersion;

const args = process.argv.splice(2) || [];
global.log_debug = args.indexOf('--log_debug') !== -1;
const env = args[0] || '';
const buildPath = env === 'pro' ? config.proBuildPath : config.betaBuildPath;
const indexPath = env === 'pro' ? config.proIndexPath : config.betaIndexPath;


/**
 * 进行自定义打包
 * @param type 打包生产环境
 * @returns {Promise}
 */
async function cpBuild (type) {
    return new Promise((resolve, reject) => {
        if (vueCliVersion === 3){
            console.log(chalk.green('将使用vue-cli3方式进行打包'));
            let vueCliService = os.platform() === 'win32' ? safe_get_file_from_node_modules('./.bin/vue-cli-service.cmd') :
                safe_get_file_from_node_modules('./.bin/vue-cli-service')
            _doCommand(vueCliService, ['build'], {
                cmd: {cwd: projectPath},
                env: {
                    ...process.env,
                    ...{
                        VUE_BUILD_MODE: type,
                        JBZ_OSS_CONFIG: JSON.stringify(config)
                    }
                }
            }, {
                stderr_is_ok: err => err.indexOf('Building for production') !== -1
            }).then(() => {
                resolve()
            }, () => {
                reject()
            })
            return;
        }
        if (buildToolPath){
            console.log(chalk.green(`buildToolPath 存在 - 执行：node ${buildToolPath} ${type}`));
            if (/.*\.js$/.test(buildToolPath)){
                _doCommand('node', [buildToolPath, type], {cwd: projectPath}).then(() => {
                    resolve();
                }, () => {
                    reject();
                })
            } else {
                reject(new Error(`buildToolPath 必须为js文件`));
            }
        } else if (buildToolScript){
            console.log(chalk.green(`buildToolScript 存在 - 执行：npm run ${buildToolScript} ${type}`));
            _doCommand('npm', ['run', buildToolScript, type], {cwd: projectPath}).then(() => {
                resolve();
            }, () => {
                reject();
            })
        } else {
            reject(new Error(`请提供 buildToolPath 或 buildToolScript, 如果使用vue-cli3 请使用设置vueCliVersion为3`));
        }
    })
}

/**
 * 上传OSS文件
 */
async function smartUploadOss () {
    console.log(chalk.green('开始阿里云上传...'));
    return new Promise((resolve, reject) => {
        let fileTree = fileTreeFromDirectory(path.resolve(__dirname, buildPath));
        if (!fileTree){
            reject(new Error('没有找到打包文件路径: ' + path.resolve(__dirname, buildPath)))
        }
        OssManager.defaultManager().doUploadByTree(buildPath, fileTree).then(fileList => {
            console.log(chalk.green('阿里云上传成功'));
            let rs = [];
            fileList.map(val => {
                rs.push({from: path.relative(buildPath, val.filePath).replace(/\\/g, '/'), to: val.accessUrl})
            })
            console.log(chalk.yellow('当前配置不进行自动替换 index.html 相关资源路径, 请确保打包工具根路径正确配置...'));
            resolve();
        }, error => {
            reject(error);
        });
    })
}

/**
 * 遍历项目目录
 * @param directoryPath 目录路径
 * @returns {{name: *, path: *, childs: Array}}
 */
function fileTreeFromDirectory (directoryPath) {
    let fileTree = {name: path.basename(directoryPath), path: directoryPath, childs: []};
    if (!fs.existsSync(directoryPath)){
        return null;
    }
    let menu = fs.readdirSync(directoryPath)
    menu.forEach((ele) => {
        let info = fs.statSync(path.resolve(directoryPath, ele))
        if(info.isDirectory()){
            fileTree.childs.push(fileTreeFromDirectory(path.resolve(directoryPath, ele)));
        } else {
            fileTree.childs.push({name: ele, path: path.resolve(directoryPath, ele), childs: null});
        }
    })
    return fileTree;
}


// (async function run_command() {
//     try {
//         if (!env){
//             throw new Error('\n未设置环境, 请默认打包方式\n');
//         }
//         try {
//             await cpBuild(env || '');
//             await smartUploadOss();
//             console.log(cowsay.say({
//                 text: chalk.green('oss依赖打包完成')
//             }));
//         } catch (e) {
//             throw new Error(`oss依赖打包失败 ${e || ''}`)
//         }
//     } catch (e) {
//         console.log(cowsay.say({
//             text: chalk.red(e.message)
//         }));
//         process.exit(1);
//     }
// })();


function streamTask() {
    return src('*.js')
        .pipe(dest('output'));
}

exports.default = streamTask;

/* eslint-enable */
