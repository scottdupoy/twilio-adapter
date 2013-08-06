
var logger = require('../utils/logger');

exports.handleIncomingCall = function(keys) {
    return function(request, response) {
        logger.info('broker call: new incoming call from: ' + request.body.From + ', CallSid: ' + request.body.CallSid);
        response.render('twiml/broker/initial-response', { brokerConnect: keys.brokerConnect, brokerMessage: keys.brokerMessage, extraMessage: '' });
    };
};

exports.handleChoice = function(keys, generateGuid, publishNewBrokerCallWaiting) {
    return function(request, response) {
        if (request.body.Digits && request.body.Digits == keys.brokerConnect) {
            var conferenceRoomId = 'conference-' + generateGuid();
            logger.info('broker call: broker has chosen to connect to handler, from: ' + request.body.From + ', conferenceRoomId: ' + conferenceRoomId + ', CallSid: ' + request.body.CallSid);
            publishNewBrokerCallWaiting(request.body.CallSid, conferenceRoomId);
            response.render('twiml/broker/connecting-to-handler', { conferenceRoomId: conferenceRoomId });            
        }
        else if (request.body.Digits && request.body.Digits == keys.brokerMessage) {
            logger.info('broker call: broker has chosen to chosen to leave a message (prompting to record), from: ' + request.body.From + ', CallSid: ' + request.body.CallSid);
            response.render('twiml/broker/leave-a-message');
        }
        else {
            logger.info('broker call: broker has made an invalid choice, asking to choose again, from: ' + request.body.From + ', CallSid: ' + request.body.CallSid);
            response.render('twiml/broker/initial-response', { brokerConnect: keys.brokerConnect, brokerMessage: keys.brokerMessage, extraMessage: 'Unrecognised response, please try again. ' });
        }        
    }
};

exports.handleMessage = function(publishNewBrokerMessage) {
    return function(request, response) {
        publishNewBrokerMessage(request.body.CallSid, request.body.RecordingUrl);
        logger.info('broker call: broker has left a message, duration: ' + request.body.RecordingDuration + ', url: ' + request.body.RecordingUrl + ', from: ' + request.body.From + ', CallSid: ' + request.body.CallSid);
        if (request.body.CallStatus && request.body.CallStatus == "in-progress") {
            // either timedout or broker pressed a key to complete message.  need to hang-up either way.
            logger.info('broker call: broker still on line after leaving message, saying good bye and hanging up, from: ' + request.body.From + ', CallSid: ' + request.body.CallSid);
            response.render('twiml/hang-up', { message: 'Your message will be forwarded to a handler. Good bye.' });
        }
        else {
            // broker hung-up to complete message
            logger.info('broker call: broker hung up to end message, from: ' + request.body.From + ', CallSid: ' + request.body.CallSid);
            response.end();
        }
    };
};
