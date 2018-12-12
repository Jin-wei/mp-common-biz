/**
 * Created by Rina on 7/13/16.
 */

var sysConfig = require('../config/SystemConfig.js');
var serverLogger = require('mp-common-util').serverLogger;

function createLogger(name ){

    return serverLogger.createLogger(name,sysConfig.loggerConfig);
}

///-- Exports

module.exports = {
    createLogger : createLogger
};

