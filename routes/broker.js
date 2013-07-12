
exports.handleIncomingCall = function(keys) {
    return function(request, response) {
        console.log('INCOMING CALL');
        response.render('twiml/broker/initial-response', { brokerConnect: keys.brokerConnect, brokerMessage: keys.brokerMessage});
    };
};

exports.handleChoice = function(keys) {
    return function(request, response) {
        if (request.body.Digits && request.body.Digits == keys.brokerConnect) {
            console.log('BROKER CHOICE: CONNECT TO HANDLER');
            response.render('twiml/broker/connecting-to-handler');
        }
        else if (request.body.Digits && request.body.Digits == keys.brokerMessage) {
            console.log('BROKER CHOICE: LEAVING A MESSAGE');
            response.render('twiml/broker/leave-a-message');
        }
        else {
            console.log('BROKER CHOICE: INVALID DIGIT');
            response.render('twiml/hang-up', { message: 'Invalid option, good bye.' });
        }        
    }
};

exports.handleMessage = function(keys) {
    return function(request, response) {        
        console.log('BROKER MESSAGE: MESSAGE DURATION = ' + request.body.RecordingDuration + ' SECONDS - TODO: IGNORE IF TO SHORT');
        if (request.body.CallStatus && request.body.CallStatus == "in-progress") {
            // either timedout or broker pressed a key to complete message.  need to hang-up either way.
            console.log('BROKER MESSAGE: BROKER STILL ON LINE - HANGING UP');
            response.render('twiml/hang-up', { message: 'Your message will be forwarded to a handler. Good bye.' });
        }
        else {
            // broker hung-up to complete message
            console.log('BROKER MESSAGE: BROKER HUNG UP TO COMPLETE MESSAGE');
            response.end();
        }
    };
};

