/**
 * Created by cuppi on 2017/10/20.
 */

const path = require('path');
const user_config = require(path.resolve(__dirname, '../../', '.jbz.oss.config.js'));
const default_config = {
    replaceInterceptor: (path, from, to) => {
        return to;
    }
}

const config = Object.assign({}, default_config, user_config);
module.exports = config;

