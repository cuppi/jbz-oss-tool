/**
 * Created by cuppi on 2017/10/20.
 */

const path = require('path');
const {safe_get_file_from_root} = require('./tool');
const user_config = require(safe_get_file_from_root('.jbz.oss.config.js'));
const default_config = {
  vueCliVersion: 2,
  replaceInterceptor: (path, from, to) => {
    return to;
  }
}

const config = Object.assign({}, default_config, user_config);
module.exports = config;

