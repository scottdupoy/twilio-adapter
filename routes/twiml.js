
exports.incomingCall = function() {
    return function(request, response) {
    console.log('hit router function');
    response.render('twiml/incoming-initial-response', {});
    };
};
