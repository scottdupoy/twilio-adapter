
exports.incomingCall = function(keys) {
    return function(request, response) {
        console.log('INCOMING CALL');
        response.render('twiml/incoming-initial-response', { brokerConnect: keys.brokerConnect, brokerMessage: keys.brokerMessage});
    };
};

exports.handleBrokerChoice = function(keys) {
    return function(request, response) {
        if (request.body.Digits && request.body.Digits == keys.brokerConnect) {
            console.log('BROKER CHOICE: CONNECT TO HANDLER');
            response.render('twiml/connecting-to-handler');
        }
        else if (request.body.Digits && request.body.Digits == keys.brokerMessage) {
            console.log('BROKER CHOICE: LEAVING A MESSAGE');
            response.render('twiml/leave-a-message');
        }
        else {
            console.log('BROKER CHOICE: INVALID DIGIT');
            response.render('twiml/hang-up', { message: 'Invalid option, good bye.' });
        }        
    }
};

exports.statusCallback = function() {
    return function(request, response) {
        console.log('STATUS CALLBACK');
        response.end();
    }
};

exports.handleBrokerMessage = function(keys) {
    return function(request, response) {
        console.log('BROKER MESSAGE RECORDED');
        response.render('twiml/hang-up', { message: 'Your message will be forwarded to a handler. Good bye.' });
    };
};
