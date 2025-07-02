const Alexa = require('ask-sdk-core');

// Import handlers
const LaunchRequestHandler = require('./handlers/LaunchRequestHandler');
const PlantCropIntentHandler = require('./handlers/PlantCropIntentHandler');
const WaterCropsIntentHandler = require('./handlers/WaterCropsIntentHandler');
const HarvestCropsIntentHandler = require('./handlers/HarvestCropsIntentHandler');
const CheckFarmIntentHandler = require('./handlers/CheckFarmIntentHandler');
const GetHelpIntentHandler = require('./handlers/GetHelpIntentHandler');
const CancelAndStopIntentHandler = require('./handlers/CancelAndStopIntentHandler');
const SessionEndedRequestHandler = require('./handlers/SessionEndedRequestHandler');
const ErrorHandler = require('./handlers/ErrorHandler');

// Import interceptors
const RequestInterceptor = require('./interceptors/RequestInterceptor');
const ResponseInterceptor = require('./interceptors/ResponseInterceptor');

// Import services
const FarmService = require('./services/FarmService');

/**
 * Voice Farm Game - Alexa Skill
 * A cozy farming game where users plant, water, and harvest crops using voice commands
 */

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    PlantCropIntentHandler,
    WaterCropsIntentHandler,
    HarvestCropsIntentHandler,
    CheckFarmIntentHandler,
    GetHelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(RequestInterceptor)
  .addResponseInterceptors(ResponseInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('voice-farm-game/1.0')
  .lambda(); 