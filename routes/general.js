
exports.handleStatusCallback = function(publishCallEnded) {
    return function(request, response) {
        console.log('STATUS CALLBACK');
        publishCallEnded(
            request.body.CallSid,
            request.body.From,
            request.body.To,
            request.body.Direction,
            request.body.CallStatus);
        response.end();
    }
};
