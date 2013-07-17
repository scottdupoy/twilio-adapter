
// not storing credentials in the config at present, passing in via query
//var twilio = require('twilio')(config.twilio.accountSid, config.twilio.authToken);

exports.call = function() {
    return function(request, response) {
        console.log('INITIATING CALL:');        
        console.log('  HOST:            ' + request.body.Host);
        console.log('  STATUS-CALLBACK: ' + request.body.StatusCallback);
        console.log('  FROM:            ' + request.body.From);
        console.log('  TO:              ' + request.body.To);
        console.log('  TYPE:            ' + request.body.Type);
        console.log('  DATA:            ' + request.body.Data);
        console.log('  ACCOUNT SID:     ' + request.body.AccountSid);
        console.log('  AUTH TOKEN:      ' + request.body.AuthToken);
        
        var callback = request.body.Host + '/twiml/handler/contacted/' + request.body.Type + '/' + request.body.Data;
        console.log('  CALLBACK:        ' + callback);
        
        var twilio = require('twilio')(request.body.AccountSid, request.body.AuthToken);
        twilio.makeCall({
            url: callback,
            method: 'POST',
            to: request.body.To,
            from: request.body.From,
            statusCallback: request.body.StatusCallback,
            statusCallbackMethod: 'POST'
         }, function(errResponse, callResponse) {
            var message = '';
            if (errResponse) {
                message = 'ERROR INITIATING CALL: ' + JSON.stringify(errResponse);
            }
            else {
                message = 'CALL TO ' + request.body.To + ' INITIATED SUCCESSFULLY';
            }
            console.log('CALL INITIATION RESULT: ' + message);
            response.end(message);
        });
    };
}
