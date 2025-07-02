const Alexa = require('ask-sdk-core');
const FarmService = require('../services/FarmService');

const WaterCropsIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WaterCropsIntent';
  },
  async handle(handlerInput) {
    console.log('WaterCropsIntentHandler triggered');
    
    const slots = Alexa.getSlot(handlerInput.requestEnvelope, 'CropType');
    const specificCrop = slots ? slots.value : null;
    
    try {
      // Get user ID for farm data
      const userId = handlerInput.requestEnvelope.session.user.userId;
      
      // Water crops using FarmService
      const result = await FarmService.waterCrops(userId, specificCrop);
      
      let speakOutput;
      if (result.success) {
        // Add water sound effect (SSML audio)
        const waterSounds = [
          '<audio src="https://voice-farm-assets.s3.amazonaws.com/audio/water1.mp3"/>',
          '<audio src="https://voice-farm-assets.s3.amazonaws.com/audio/water2.mp3"/>',
          '<audio src="https://voice-farm-assets.s3.amazonaws.com/audio/water3.mp3"/>'
        ];
        
        const randomWaterSound = waterSounds[Math.floor(Math.random() * waterSounds.length)];
        
        // Generate enthusiastic watering responses
        const wateringResponses = [
          `${randomWaterSound} Ahh, perfect! Your crops are getting a lovely drink of fresh water! 💧 I can almost see them perking up already. The soil looks so rich and nourished!`,
          `${randomWaterSound} Beautiful! The water is soaking into the soil just right! 💧 Your plants are going to be so happy and healthy. You're such a caring farmer!`,
          `${randomWaterSound} Wonderful watering! 💧 The droplets are glistening on the leaves like little diamonds. Your crops are thriving under your care!`,
          `${randomWaterSound} Perfect timing! 💧 Your plants were getting a bit thirsty, and now they're getting exactly what they need. Great job taking care of your farm!`
        ];
        
        let baseResponse = wateringResponses[Math.floor(Math.random() * wateringResponses.length)];
        
        // Add specific information about what was watered
        if (specificCrop && result.cropsWatered > 0) {
          baseResponse += ` Your ${specificCrop} ${result.cropsWatered === 1 ? 'is' : 'are'} looking particularly happy!`;
        } else if (result.cropsWatered > 0) {
          baseResponse += ` I watered ${result.cropsWatered} ${result.cropsWatered === 1 ? 'crop' : 'crops'} for you!`;
        }
        
        // Add growth encouragement
        if (result.nearlyReady > 0) {
          baseResponse += ` Some of your crops are almost ready to harvest!`;
        }
        
        speakOutput = baseResponse + ` What would you like to do next? You can check your farm, plant more crops, or harvest what's ready!`;
        
      } else {
        // Handle different failure scenarios
        if (result.message === 'NO_CROPS') {
          speakOutput = `
            I don't see any crops to water yet! You'll need to plant some seeds first. 
            Try saying "plant tomatoes" or "plant carrots" to get started with your farm!
          `;
        } else {
          speakOutput = result.message || `I had trouble watering your crops. Please try again!`;
        }
      }
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("What would you like to do next? You can plant crops, water them, check your farm, or harvest what's ready.")
        .withShouldEndSession(false)
        .getResponse();
        
    } catch (error) {
      console.error('Error in WaterCropsIntentHandler:', error);
      
      const errorMessage = `
        Oh no! I had trouble watering your crops. 
        Let me try that again. Would you like to water your crops?
      `;
      
      return handlerInput.responseBuilder
        .speak(errorMessage)
        .reprompt("You can try watering your crops again, or plant some new ones if you haven't yet!")
        .withShouldEndSession(false)
        .getResponse();
    }
  }
};

module.exports = WaterCropsIntentHandler; 