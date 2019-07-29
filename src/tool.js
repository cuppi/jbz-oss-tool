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

module.exports = {
    safe_get_file_from_root,
    safe_get_file_from_node_modules
}
