const Alexa = require('ask-sdk-core');
const FarmService = require('../services/FarmService');

const PlantCropIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlantCropIntent';
  },
  async handle(handlerInput) {
    console.log('PlantCropIntentHandler triggered');
    
    const slots = Alexa.getSlot(handlerInput.requestEnvelope, 'CropType');
    const cropType = slots ? slots.value : null;
    
    if (!cropType) {
      const speakOutput = `
        What would you like to plant? You can choose from tomatoes, carrots, 
        corn, strawberries, or lettuce. Just say something like "plant tomatoes".
      `;
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .withShouldEndSession(false)
        .getResponse();
    }
    
    try {
      // Get user ID for farm data
      const userId = handlerInput.requestEnvelope.session.user.userId;
      
      // Plant the crop using FarmService
      const result = await FarmService.plantCrop(userId, cropType);
      
      let speakOutput;
      if (result.success) {
        // Generate enthusiastic planting response
        const plantingResponses = [
          `Perfect! I've planted ${cropType} in your farm! 🌱 You can almost see the little seeds nestled in the rich, dark soil. They'll need some water to grow big and strong!`,
          `Wonderful choice! Your ${cropType} seeds are now planted! 🌱 I can already imagine how beautiful they'll look when they sprout. Don't forget to water them!`,
          `Excellent! ${cropType} planted successfully! 🌱 The soil looks perfect for growing. Your farm is going to be so lovely! Try watering them next.`,
          `Great job! I've carefully planted your ${cropType} seeds! 🌱 They're tucked in nice and cozy in the soil. Water them when you're ready!`
        ];
        
        speakOutput = plantingResponses[Math.floor(Math.random() * plantingResponses.length)];
        
        // Add growth time info
        const growthTime = FarmService.getCropGrowthTime(cropType);
        if (growthTime) {
          speakOutput += ` Your ${cropType} will be ready to harvest in about ${growthTime} hours.`;
        }
        
        speakOutput += ` What would you like to do next? You can water your crops, plant something else, or check your farm!`;
        
      } else {
        speakOutput = result.message || `I had trouble planting ${cropType}. Please try again!`;
      }
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("What would you like to do next? You can plant more crops, water them, or check your farm.")
        .withShouldEndSession(false)
        .getResponse();
        
    } catch (error) {
      console.error('Error in PlantCropIntentHandler:', error);
      
      const errorMessage = `
        Oh no! I had trouble planting your ${cropType}. 
        Let me try that again. What would you like to plant?
      `;
      
      return handlerInput.responseBuilder
        .speak(errorMessage)
        .reprompt("What would you like to plant? You can try tomatoes, carrots, corn, strawberries, or lettuce.")
        .withShouldEndSession(false)
        .getResponse();
    }
  }
};

module.exports = PlantCropIntentHandler; 