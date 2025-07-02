const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    console.log('LaunchRequestHandler triggered');
    
    const welcomeMessage = `
      Welcome to Voice Farm! 🌾 
      I'm so excited you're here! In your cozy virtual farm, you can plant seeds, 
      water your crops, and harvest them when they're ready. 
      
      To get started, try saying "plant tomatoes" or "plant carrots". 
      You can also say "check my farm" to see what's growing. 
      
      What would you like to do first?
    `;
    
    const repromp = `
      You can say things like "plant tomatoes", "water my crops", 
      or "check my farm". What would you like to do?
    `;

    return handlerInput.responseBuilder
      .speak(welcomeMessage)
      .reprompt(repromp)
      .withShouldEndSession(false)
      .getResponse();
  }
};

module.exports = LaunchRequestHandler; 