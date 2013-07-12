
// not storing credentials in the config at present, passing in via query
//var twilio = require('twilio')(config.twilio.accountSid, config.twilio.authToken);

exports.call = function() {
    return function(request, response) {
        console.log('INITIATING CALL:');        
        console.log('  HOST:        ' + request.body.Host);
        console.log('  FROM:        ' + request.body.From);
        console.log('  TO:          ' + request.body.To);
        console.log('  ACCOUNT SID: ' + request.body.AccountSid);
        console.log('  AUTH TOKEN:  ' + request.body.AuthToken);
        
        var callback = request.body.Host + '/twiml/handler-contacted?holy=toast';
        console.log('  CALLBACK:    ' + callback);
        
        var twilio = require('twilio')(request.body.AccountSid, request.body.AuthToken);
        twilio.makeCall({
            url: callback,
            to: request.body.to,
            from: request.body.from
         }, function(err, call) {
            console.log('    callback invoked');
            console.log('      err:  ' + JSON.stringify({ err: err }));
            console.log('      call: ' + JSON.stringify({ call: call }));
            response.end('called: ' + request.body.to);        
        });
    }    
}

/*



// Download the Node helper library from twilio.com/docs/node/install
// These vars are your accountSid and authToken from twilio.com/user/account
var client = require('twilio')(accountSid, authToken);
 
client.calls.create({
    url: "http://demo.twilio.com/docs/voice.xml",
    to: "+14155551212",
    from: "+14158675309"
}, function(err, call) {
    process.stdout.write(call.sid);
});
*/