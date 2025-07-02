const Alexa = require('ask-sdk-core');
const FarmService = require('../services/FarmService');

const HarvestCropsIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HarvestCropsIntent';
  },
  async handle(handlerInput) {
    console.log('HarvestCropsIntentHandler triggered');
    
    const slots = Alexa.getSlot(handlerInput.requestEnvelope, 'CropType');
    const specificCrop = slots ? slots.value : null;
    
    try {
      // Get user ID for farm data
      const userId = handlerInput.requestEnvelope.session.user.userId;
      
      // Harvest crops using FarmService
      const result = await FarmService.harvestCrops(userId, specificCrop);
      
      let speakOutput;
      if (result.success) {
        // Add harvest sound effect (SSML audio)
        const harvestSounds = [
          '<audio src="https://voice-farm-assets.s3.amazonaws.com/audio/harvest1.mp3"/>',
          '<audio src="https://voice-farm-assets.s3.amazonaws.com/audio/harvest2.mp3"/>',
          '<audio src="https://voice-farm-assets.s3.amazonaws.com/audio/harvest3.mp3"/>'
        ];
        
        const randomHarvestSound = harvestSounds[Math.floor(Math.random() * harvestSounds.length)];
        
        // Generate celebratory harvest responses
        const harvestResponses = [
          `${randomHarvestSound} Fantastic! What a beautiful harvest! 🌾 Look at these gorgeous crops you've grown! Your hard work really paid off!`,
          `${randomHarvestSound} Wonderful! Your crops are perfect! 🌾 I'm so proud of what you've accomplished in your farm! These look absolutely delicious!`,
          `${randomHarvestSound} Amazing harvest! 🌾 Your crops are ripe, fresh, and ready! You're becoming such a skilled farmer!`,
          `${randomHarvestSound} Perfect timing! 🌾 These crops are at their peak! Your patience and care have created something beautiful!`
        ];
        
        let baseResponse = harvestResponses[Math.floor(Math.random() * harvestResponses.length)];
        
        // Add specific harvest details
        if (result.cropsHarvested === 1) {
          const cropType = result.harvestedCrops[0].type;
          baseResponse += ` You harvested 1 beautiful ${cropType}!`;
        } else {
          baseResponse += ` You harvested ${result.cropsHarvested} wonderful crops!`;
        }
        
        // Add XP information
        if (result.xpGained > 0) {
          baseResponse += ` You earned ${result.xpGained} experience points!`;
          
          if (result.leveledUp) {
            baseResponse += ` 🎉 Congratulations! You've reached level ${result.level}! Your farming skills are really growing!`;
          } else {
            baseResponse += ` You're now at level ${result.level} with ${result.totalXp} total experience points!`;
          }
        }
        
        // Encourage continued play
        const encouragements = [
          " Why don't you plant some new crops to keep your farm growing?",
          " Your farm has room for more crops! What would you like to plant next?",
          " You could plant some new seeds or check what else is growing!",
          " How about planting something new? You have so many options!"
        ];
        
        baseResponse += encouragements[Math.floor(Math.random() * encouragements.length)];
        speakOutput = baseResponse;
        
      } else {
        // Handle different failure scenarios
        if (result.message === 'NO_CROPS') {
          speakOutput = `
            Your farm is empty! You'll need to plant some seeds first, then water them and wait for them to grow. 
            Try saying "plant tomatoes" to get started!
          `;
        } else if (result.message.includes("aren't ready yet")) {
          speakOutput = result.message + ` 
            In the meantime, you could plant more crops or water the ones you have to help them grow faster!
          `;
        } else {
          speakOutput = result.message || `I had trouble harvesting your crops. Please try again!`;
        }
      }
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("What would you like to do next? You can plant new crops, water them, or check your farm status!")
        .withShouldEndSession(false)
        .getResponse();
        
    } catch (error) {
      console.error('Error in HarvestCropsIntentHandler:', error);
      
      const errorMessage = `
        Oh no! I had trouble harvesting your crops. 
        Let me try that again. Would you like to harvest your crops?
      `;
      
      return handlerInput.responseBuilder
        .speak(errorMessage)
        .reprompt("You can try harvesting again, or check your farm to see what's ready!")
        .withShouldEndSession(false)
        .getResponse();
    }
  }
};

module.exports = HarvestCropsIntentHandler; 