
exports.incomingCall = function() {
    return function(request, response) {
    console.log('INCOMING CALL');
    response.render('twiml/incoming-initial-response', {});
    };
};

exports.handleBrokerChoice = function() {
    return function(request, response) {
        console.log('BROKER HAS MADE CHOICE');
        var message = 'No choice, hanging up.';
        if (request.body.Digits) {
            message = 'You pressed ' + request.body.Digits + '. Hanging up';
        }
        response.render('twiml/hang-up', { message: message });
    }
};
