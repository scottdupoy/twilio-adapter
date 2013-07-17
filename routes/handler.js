
var logger = require('../utils/logger');

exports.handleContacted = function(keys) {
    return function(request, response) {       
        var type = request.params.type;
        var data = request.params.data;
        logger.info('handler-contact: handler has picked up, to: ' + request.body.To + ', type: ' + type + ', data: ' + data + ' , CallSid: ' + request.body.CallSid);
        if (!type || !data) {
            logger.error('missing type or data: ' + request.url);
            response.render('twiml/hang-up', { message: 'Sorry, contact reasons are missing. Good bye.' });
            return;
        }            
        // alert special case for query string encoding extra message
        var message = request.query["message"];
        if (message) {
            logger.info('handler-contact: alert message part of querystring: ' + message);
            data = data + '?message=' + encodeURIComponent(message);
        }
        renderHandlerChoice(response, type, data, message, keys, '');
    };
};

exports.handleChoice = function(keys, publishHandlerAccepted, publishHandlerRejected) {
    return function(request, response) {
        var type = request.params.type;
        var data = request.params.data;
        logger.info('handler-contact: handling choice, to: ' + request.body.To + ', type: ' + type + ', data: ' + data + ' , CallSid: ' + request.body.CallSid);
        if (!type || !data) {
            logger.error('missing type or data: ' + request.url);
            response.render('twiml/hang-up', { message: 'Sorry, invalid response. Good bye.' });
            return;
        }

        if (request.body.Digits && request.body.Digits == keys.handlerAccept) {
            logger.info('handler-contact: accepted, to: ' + request.body.To + ', type: ' + type + ', data: ' + data + ' , CallSid: ' + request.body.CallSid);
            publishHandlerAccepted(request.body.CallSid, request.body.To);
            handlerAccepted(request, response, type, data);
        }
        else if (request.body.Digits && request.body.Digits == keys.handlerReject) {
            logger.info('handler-contact: rejected, to: ' + request.body.To + ', type: ' + type + ', data: ' + data + ' , CallSid: ' + request.body.CallSid);
            publishHandlerRejected(request.body.CallSid, request.body.To);
            response.render('twiml/hang-up', { message: 'Rejected. The system will contact the next handler.' });
        }
        else {
            logger.info('handler-contact: invalid choice, trying again, to: ' + request.body.To + ', type: ' + type + ', data: ' + data + ' , CallSid: ' + request.body.CallSid);
            var query = require('url').parse(request.url).query;
            if (query) {
                data += '?' + query;
            }
            renderHandlerChoice(response, type, data, request.query["message"], keys, 'Unrecognised response, please try again. ');
        }
    };
};

exports.handleReplayBrokerMessage = function() {
    return function(request, response) {
        logger.info('handler-contact: replaying broker message');
        if (!request.body.Digits || request.body.Digits == 'hangup' || !request.params.data) {
            logger.error('unexpected response in replay-broker-message');
            response.render('/twiml/hang-up', 'Unrecognised response. Good bye.');       
            return;
        }
        response.render('twiml/handler/replay-broker-message', {
            messageUrl: 'http://api.twilio.com/2010-04-01/Accounts/' + request.body.AccountSid + '/Recordings/' + request.params.data,
            data: request.params.data
        });
    };
};

function renderHandlerChoice(response, type, data, alertMessage, keys, messagePrefix) {    
    var parameters = {
        handlerAccept: keys.handlerAccept,
        handlerReject: keys.handlerReject,
        type: type,
        data: data
    };
    
    switch (type) {
    
        case "alert":
            parameters["message"] = messagePrefix + 'An Altis alert has occurred.';
            if (alertMessage) {
                parameters["message"] += ' ' + alertMessage + '.';
            }
            response.render('twiml/handler/contacted', parameters);
            break;
            
        case "connect":
            parameters["message"] = messagePrefix + 'An Altis broker is waiting to speak with a handler.'; 
            response.render('twiml/handler/contacted', parameters);
            break;

        case "message":
            parameters["message"] = messagePrefix + 'An Altis broker has left a message.'; 
            response.render('twiml/handler/contacted', parameters);
            break;
            
        default:
            logger.error('unknown contact reason has been used, hanging up: type: ' + type);
            response.render('twiml/hang-up', { message: 'Sorry, unknown contact type has been used. Good bye.' });
            
    }
}

function handlerAccepted(request, response, type, data) {
    switch (type) {
        
        case "alert":
            logger.info('handler-contact: confirming accept and hanging up, to: ' + request.body.To + ', type: ' + type + ', data: ' + data + ' , CallSid: ' + request.body.CallSid);
            response.render('twiml/handler/accepted-alert');
            break;
            
        case "connect":
            logger.info('handler-contact: connecting to conference: ' + data + ', to: ' + request.body.To + ', type: ' + type + ', data: ' + data + ' , CallSid: ' + request.body.CallSid);
            response.render('twiml/handler/accepted-broker-connection', { conferenceRoomId: data });
            break;
        
        case "message":
            logger.info('handler-contact: playing message: ' + data + ', to: ' + request.body.To + ', type: ' + type + ', data: ' + data + ' , CallSid: ' + request.body.CallSid);
            response.render('twiml/handler/accepted-broker-message', {
                messageUrl: 'http://api.twilio.com/2010-04-01/Accounts/' + request.body.AccountSid + '/Recordings/' + data,
                data: data
            });
            break;
        
        default:
            response.render('twiml/hang-up', { message: 'Sorry, you have accepted an alert for an unknown contact type. Ignoring. Good bye.' });
        
    }
}


