const Alexa = require('ask-sdk-core');

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error('Error Handler triggered');
    console.error('Error details:', error);
    
    const errorMessages = [
      "Oh no! Something went wrong in your farm. Let me try to help you again. What would you like to do?",
      "Oops! I had a little trouble there. Your farm is still safe! What would you like to do next?",
      "Sorry about that! There was a small hiccup, but your crops are still growing! How can I help you?",
      "My apologies! Something didn't work quite right. Your farm is fine though! What would you like to try?"
    ];
    
    const randomErrorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    
    const reprompt = "You can try planting crops, watering them, harvesting what's ready, or checking your farm status.";

    return handlerInput.responseBuilder
      .speak(randomErrorMessage)
      .reprompt(reprompt)
      .withShouldEndSession(false)
      .getResponse();
  }
};

module.exports = ErrorHandler; 