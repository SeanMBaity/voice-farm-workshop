const Alexa = require('ask-sdk-core');
const FarmService = require('../services/FarmService');

const CheckFarmIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckFarmIntent';
  },
  async handle(handlerInput) {
    console.log('CheckFarmIntentHandler triggered');
    
    try {
      // Get user ID for farm data
      const userId = handlerInput.requestEnvelope.session.user.userId;
      
      // Get farm status using FarmService
      const result = await FarmService.getFarmStatus(userId);
      
      let speakOutput;
      if (result.success) {
        const farm = result.farm;
        
        // Start with farm overview
        let farmReport = `
          Welcome to your cozy farm! 🌾 You're level ${farm.level} with ${farm.xp} experience points. 
          You've harvested ${farm.totalHarvests} crops so far! 
        `;
        
        // Check if farm is empty
        if (farm.cropDetails.length === 0) {
          farmReport += `
            Your farm is ready for planting! You can grow tomatoes, carrots, corn, strawberries, or lettuce. 
            Just say "plant tomatoes" or any crop you'd like to start with. 
            What would you like to plant first?
          `;
        } else {
          farmReport += ` Here's what's happening on your farm: `;
          
          // Group crops by status for better reporting
          const readyCrops = farm.cropDetails.filter(crop => crop.status === 'ready');
          const growingCrops = farm.cropDetails.filter(crop => crop.status === 'growing');
          const needsWaterCrops = farm.cropDetails.filter(crop => crop.status === 'needs water');
          
          // Report ready crops first (most important)
          if (readyCrops.length > 0) {
            farmReport += ` 🎉 Great news! You have ${readyCrops.length} ${readyCrops.length === 1 ? 'crop' : 'crops'} ready to harvest: `;
            const readyTypes = readyCrops.map(crop => crop.type).join(', ');
            farmReport += `${readyTypes}. Say "harvest my crops" to collect them! `;
          }
          
          // Report growing crops
          if (growingCrops.length > 0) {
            farmReport += ` 🌱 You have ${growingCrops.length} ${growingCrops.length === 1 ? 'crop' : 'crops'} growing nicely: `;
            const growingDetails = growingCrops.map(crop => 
              `${crop.type} (ready in ${crop.timeReady})`
            ).join(', ');
            farmReport += `${growingDetails}. `;
          }
          
          // Report crops that need water
          if (needsWaterCrops.length > 0) {
            farmReport += ` 💧 You have ${needsWaterCrops.length} ${needsWaterCrops.length === 1 ? 'crop that needs' : 'crops that need'} water: `;
            const needsWaterTypes = needsWaterCrops.map(crop => crop.type).join(', ');
            farmReport += `${needsWaterTypes}. Say "water my crops" to help them grow! `;
          }
          
          // Suggest next actions
          if (readyCrops.length > 0) {
            farmReport += ` I recommend harvesting your ready crops first!`;
          } else if (needsWaterCrops.length > 0) {
            farmReport += ` Your crops are waiting for water to grow big and strong!`;
          } else if (farm.cropDetails.length < 6) {
            farmReport += ` You have room for more crops! What would you like to plant next?`;
          } else {
            farmReport += ` Your farm is full and thriving! Check back later to harvest more crops!`;
          }
        }
        
        speakOutput = farmReport;
        
      } else {
        speakOutput = result.message || `I had trouble checking your farm. Please try again!`;
      }
      
      const reprompt = result.success && result.farm && result.farm.cropDetails && result.farm.cropDetails.length > 0 ?
        "What would you like to do? You can harvest ready crops, water growing crops, or plant new ones!" :
        "What would you like to plant first? You can choose tomatoes, carrots, corn, strawberries, or lettuce!";
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(reprompt)
        .withShouldEndSession(false)
        .getResponse();
        
    } catch (error) {
      console.error('Error in CheckFarmIntentHandler:', error);
      
      const errorMessage = `
        Oh no! I had trouble checking your farm status. 
        Let me try that again. Would you like me to check your farm?
      `;
      
      return handlerInput.responseBuilder
        .speak(errorMessage)
        .reprompt("You can ask me to check your farm, or try planting some crops to get started!")
        .withShouldEndSession(false)
        .getResponse();
    }
  }
};

module.exports = CheckFarmIntentHandler; 