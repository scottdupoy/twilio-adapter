
var logger = require('../utils/logger');

exports.handleStatusCallback = function(publishCallEnded) {
    return function(request, response) {
        logger.info('status callback: CallSid: ' + request.body.CallSid + ', From: ' + request.body.From + ', To: ' + request.body.To + ', Direction: ' + request.body.Direction + ', CallStatus: ' + request.body.CallStatus);
        var status = request.body.CallStatus;
        if (status && (status == 'completed' || status == 'busy' || status == 'failed' || status == 'no-answer' || status == 'canceled')) {
            logger.info('status callback: CallSid: ' + request.body.CallSid + ', CallStatus == "' + status + '" so publishing call ended event');
            publishCallEnded(
                request.body.CallSid,
                request.body.From,
                request.body.To,
                request.body.Direction,
                request.body.CallStatus);
        }
        response.end();
    }
};
