var twilio = require('twilio');

exports.validateTwilioSignature = function(config, logger) {
  return function(request, response, next) {
    if (!config.security.twilio.validate) {
      next();
      return;
    }

    logger.info('Checking Twilio signature');
    if (twilio.validateExpressRequest(request, config.security.twilio.authToken)) {
      logger.info('Twilio signature validated successfully');
      next();
      return;
    }
    
    var message = 'Unauthorized: Twilio signature check failed: url=' + request.url + ', method=' + request.method + ', remote-addr: ' + request.ip;
    logger.warn(message);
    response.send(401, message);
  };
};

