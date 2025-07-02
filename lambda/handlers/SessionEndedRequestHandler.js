const Alexa = require('ask-sdk-core');

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log('SessionEndedRequestHandler triggered');
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    
    // Clean up any session-specific data if needed
    // Note: Don't return a response for SessionEndedRequest
    return handlerInput.responseBuilder.getResponse();
  }
};

module.exports = SessionEndedRequestHandler; 