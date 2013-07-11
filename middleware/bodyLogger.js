
var fs = require('fs');

exports.log = function(logFile) {
    return function(request, response, next) {
        file = fs.createWriteStream(logFile, { 'flags': 'a' });
        file.on('error', next);
        file.on('close', next);
        file.write('request received: ' + new Date().toJSON() + '\r\n');
        file.write('request.url: ' + request.url + '\r\n');
        file.write('request.method: ' + request.method + '\r\n');
        file.write('request.body:\r\n');
        file.write(JSON.stringify(request.body) + '\r\n');
        file.write('\r\n');
        file.end();
    };
};
