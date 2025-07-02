const Alexa = require('ask-sdk-core');

const GetHelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetHelpIntent'
          || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent');
  },
  handle(handlerInput) {
    console.log('GetHelpIntentHandler triggered');
    
    const helpMessage = `
      Welcome to Voice Farm! 🌾 Here's how to play your cozy farming game:
      
      To PLANT crops, say "plant tomatoes" or "plant carrots". You can grow tomatoes, carrots, corn, strawberries, or lettuce.
      
      To WATER your crops, say "water my crops" or "water my tomatoes". This helps them grow faster!
      
      To HARVEST ready crops, say "harvest my crops" or "harvest my carrots". You'll earn experience points!
      
      To CHECK your farm, say "check my farm" or "how is my farm" to see what's growing.
      
      Your crops take real time to grow - lettuce takes 2 hours, carrots take 3 hours, tomatoes take 4 hours, strawberries take 5 hours, and corn takes 6 hours.
      
      The more you harvest, the more experience you gain and the higher your farming level becomes!
      
      What would you like to do? You can start by planting your first crop!
    `;
    
    const reprompt = `
      Try saying "plant tomatoes" to get started, or "check my farm" to see what's already growing. 
      What would you like to do?
    `;

    return handlerInput.responseBuilder
      .speak(helpMessage)
      .reprompt(reprompt)
      .withShouldEndSession(false)
      .getResponse();
  }
};

module.exports = GetHelpIntentHandler; 