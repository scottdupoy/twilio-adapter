var winston = require('winston');
var path = require('path');
var config = require(path.join(__dirname, '..', 'config.yaml')).logger;

var transports = new Array();

if (config.file && config.file.enabled) {
    transports.push(
        new winston.transports.File(
            {
                filename: config.file.path,
                json: false,
                timestamp: true,
                level: config.file.level
            }
        )
    );
}

if (config.console && config.console.enabled) {
    transports.push(
        new winston.transports.Console(
            {
                json: false,
                timestamp: true,
                colorize: true,
                level: config.console.level,                
            }
        )
    );
}

var logger = new (winston.Logger)({ transports: transports });

module.exports = logger;
