
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
        console.log('  CALLBACK:    ' + callback);
        
        var twilio = require('twilio')(request.body.accountsid, request.body.authtoken);
        twilio.makecall({
            url: callback,
            to: request.body.to,
            from: request.body.from,
            status_callback: request.body.StatusCallback,
            status_callback_method: 'POST'
         }, function(errresponse, callresponse) {
            var message = '';
            if (errresponse) {
                message = 'error initiating call: ' + json.stringify(errresponse);
            }
            else {
                message = 'call to ' + request.body.to + ' initiated successfully';
            }
            console.log('call initiation result: ' + message);
            response.end(message);
         });
    }    
}
