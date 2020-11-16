const path = require('path');
const fs = require('fs');

function safe_get_file_from_root(sub_path) {
    let file_path = path.resolve(__dirname, '../../../', sub_path);
    if (!fs.existsSync(file_path)){
        file_path = path.resolve(process.cwd(), sub_path);
    }
    if (!fs.existsSync(file_path)){
        return false;
    }
    return file_path;
}

function safe_get_file_from_node_modules(sub_path) {
    let file_path = path.resolve(__dirname, '../../', sub_path);
    if (!fs.existsSync(file_path)){
        file_path = path.resolve(process.cwd(), './node_modules', sub_path);
    }
    if (!fs.existsSync(file_path)){
        return false;
    }
    return file_path;
}

function log(message, mode='verbose') {
    const {log_debug} = global;
    if (!log_debug){
        return;
    }
    if (mode === 'verbose'){
        console.log(chalk.cyan(`verbose: ${message}`));
    }
    if (mode === 'error'){
        console.log(chalk.bgRed(`error: ${message}`));
    }
}

/**
 * 执行命令
 * @param command 命令
 * @param args 参数
 * @param options 配置项
 * @param mark 配置项
 * @returns {Promise}
 * @private
 */
function _doCommand(command, args, options, mark) {
    let {ignore_error, stderr_is_ok} = {
        ignore_error: false,
        stderr_is_ok: (err) => false,
        ...mark
    }
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
            log(s.toString())
            process.stdout.write(`${s.toString()}`);
        });

        h.stderr.on('data', (err) => {
            log(err.toString(), 'error')
            if (!ignore_error){
                success = stderr_is_ok(err.toString());
            }
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

module.exports = {
    safe_get_file_from_root,
    safe_get_file_from_node_modules,
    log,
}
