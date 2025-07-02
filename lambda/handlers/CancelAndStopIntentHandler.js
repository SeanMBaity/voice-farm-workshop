const Alexa = require('ask-sdk-core');

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
          || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    console.log('CancelAndStopIntentHandler triggered');
    
    const goodbyeMessages = [
      "Thanks for visiting your farm! 🌾 Your crops will keep growing while you're away. Come back soon to check on them!",
      "Goodbye, farmer! 🌾 Your plants will be waiting for you. Don't forget to water them when you return!",
      "See you later! 🌾 Your farm is in good hands. Come back anytime to tend to your crops!",
      "Happy farming! 🌾 Your crops are growing beautifully. Visit again soon to harvest them!"
    ];
    
    const randomGoodbye = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];

    return handlerInput.responseBuilder
      .speak(randomGoodbye)
      .withShouldEndSession(true)
      .getResponse();
  }
};

module.exports = CancelAndStopIntentHandler; 