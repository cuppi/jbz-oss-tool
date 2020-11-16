/* eslint-disable */
const OSS = require('ali-oss').Wrapper;
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const buckets = require('./config').buckets;
const region = require('./config').region;
const accessKeyId = require('./config').accessKeyId;
const accessKeySecret = require('./config').accessKeySecret;
const ossDirectory = require('./config').ossDirectory;

let ossManager = null;

class OssManager{
    constructor (){
        let client = new OSS({
            region: region,
            accessKeyId: accessKeyId,
            accessKeySecret: accessKeySecret
        });
        client.useBucket(buckets);
        this.client = client;
    }

    static defaultManager(){
        if (!ossManager){
            ossManager = new OssManager()
        }
        return ossManager;
    }

    uploadFile (savePath, filePath, fileName) {
        savePath = ossDirectory + savePath;
        return new Promise((resolve, reject) => {
            this.client.put(savePath, filePath).then(val => {
                let protocol = val.url.substr(0, 5);
                if (/https+/.test(protocol) === -1){
                    val.url.replace('http', 'https');
                }
                resolve({fileName, filePath, savePath: val.name, accessUrl: val.url});
            }, error => {
                reject(error);
            })
        });
    }

    mapFileTree(fileTree, map){
        map(fileTree);
        if (fileTree.childs){
            fileTree.childs.map(file => {
                this.mapFileTree(file, map);
            });
        }
    }

    doUploadByTree(basePath, fileTree){
        return new Promise((resolve, reject) => {
            let promiseMetaList = [];
            this.mapFileTree(fileTree, (file) => {
                let savePath = path.relative(basePath, file.path).replace(/\\/g, '/');
                if (!file.childs){
                    promiseMetaList.push({savePath, filePath: file.path, fileName: file.name})
                }
            })
            let ossFileList = [];
            let recycleUpload = (progressIndex) => {
                if (progressIndex >= promiseMetaList.length){
                    resolve(ossFileList);
                    return;
                }
                let cm = promiseMetaList[progressIndex];
                this.uploadFile(cm.savePath, cm.filePath, cm.fileName).then(data => {
                    console.log(chalk.green(`文件上传成功: ${cm.fileName}`));
                    ossFileList.push(data)
                    recycleUpload(progressIndex + 1);
                }, error => {
                    console.log(chalk.red(`文件上传失败: ${cm.fileName}`));
                    reject(error);
                });
            }
            recycleUpload(0);
        })
    }
}

module.exports = OssManager;

/* eslint-enable */
