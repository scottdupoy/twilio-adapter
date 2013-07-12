
exports.handleHandlerContacted = function(keys) {
    return function(request, response) {    
        console.log('HANDLER CONTACTED');        
        var type = request.params.type;
        var data = request.params.data;
        if (!type || !data) {
            console.log('ERROR: MISSING TYPE OR DATA');
            response.render('twiml/hang-up', { message: 'Sorry, contact reasons are missing. Good bye.' });
            return;
        }
                
        console.log('  type: ' + type);
        console.log('  data: ' + data);
        
        var parameters = {
            handlerAccept: keys.handlerAccept,
            handlerReject: keys.handlerReject,
            type: type,
            data: data
        };
        
        if (type == "alert") {
            console.log('TODO: NEED TO ADD ALERT MESSAGE');
            parameters["message"] = 'An Altis alert has occurred. Message goes here.'; 
            response.render('twiml/handler/accept', parameters);
        }
        else if (type == "connect") {
            parameters["message"] = 'An Altis broker is waiting to speak with a handler.'; 
            response.render('twiml/handler/accept', parameters);
        }
        else if (type == "message") {
            parameters["message"] = 'An Altis broker has left a message.'; 
            response.render('twiml/handler/accept', parameters);
        }
        else {
            console.log('ERROR: UNKNOWN CONTACT REASON HAS BEEN USED');
            response.render('twiml/hang-up', { message: 'Sorry, unknown contact reason has been used. Good bye.' });
        }        
    };
};
