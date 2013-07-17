
logger = require('../utils/logger');

exports.log = function(logFile) {
    return function(request, response, next) {
        logger.debug('request received: body: ' + JSON.stringify(request.body));
        next();
    };
};
