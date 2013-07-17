
exports.handleIncomingCall = function(keys) {
    return function(request, response) {
        console.log('INCOMING CALL');
        response.render('twiml/broker/initial-response', { brokerConnect: keys.brokerConnect, brokerMessage: keys.brokerMessage, extraMessage: '' });
    };
};

exports.handleChoice = function(keys, generateGuid, publishNewBrokerCallWaiting) {
    return function(request, response) {
        if (request.body.Digits && request.body.Digits == keys.brokerConnect) {
            console.log('BROKER CHOICE: CONNECT TO HANDLER');
            var conferenceRoomId = 'conference-' + generateGuid();
            publishNewBrokerCallWaiting(request.body.CallSid, conferenceRoomId);
            response.render('twiml/broker/connecting-to-handler', { conferenceRoomId: conferenceRoomId });            
        }
        else if (request.body.Digits && request.body.Digits == keys.brokerMessage) {
            console.log('BROKER CHOICE: LEAVING A MESSAGE');
            response.render('twiml/broker/leave-a-message');
        }
        else {
            console.log('BROKER CHOICE: INVALID DIGIT, TRYING AGAIN');
            response.render('twiml/broker/initial-response', { brokerConnect: keys.brokerConnect, brokerMessage: keys.brokerMessage, extraMessage: 'Unrecognised response, please try again. ' });
        }        
    }
};

exports.handleMessage = function(publishNewBrokerMessage) {
    return function(request, response) {
        publishNewBrokerMessage(request.body.CallSid, request.body.RecordingUrl);
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

