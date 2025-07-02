const { handler } = require('../lambda/index');

// Mock Alexa request for testing
const createMockRequest = (type, intentName = null, slots = {}) => {
  const request = {
    version: '1.0',
    session: {
      new: true,
      sessionId: 'test-session-id',
      application: { applicationId: 'test-app-id' },
      user: { userId: 'test-user-id' }
    },
    context: {
      System: {
        application: { applicationId: 'test-app-id' },
        user: { userId: 'test-user-id' }
      }
    },
    request: {
      type: type,
      requestId: 'test-request-id',
      timestamp: new Date().toISOString(),
      locale: 'en-US'
    }
  };

  if (intentName) {
    request.request.intent = {
      name: intentName,
      slots: slots
    };
  }

  return request;
};

describe('Voice Farm Game Skill', () => {
  
  test('Launch Request should return welcome message', async () => {
    const mockRequest = createMockRequest('LaunchRequest');
    
    const response = await handler(mockRequest);
    
    expect(response.response.outputSpeech.ssml).toContain('Welcome to Voice Farm');
    expect(response.response.shouldEndSession).toBe(false);
  });

  test('Plant Crop Intent should plant tomatoes', async () => {
    const slots = {
      CropType: { name: 'CropType', value: 'tomatoes' }
    };
    const mockRequest = createMockRequest('IntentRequest', 'PlantCropIntent', slots);
    
    const response = await handler(mockRequest);
    
    expect(response.response.outputSpeech.ssml).toContain('planted');
    expect(response.response.outputSpeech.ssml).toContain('tomatoes');
    expect(response.response.shouldEndSession).toBe(false);
  });

  test('Water Crops Intent should water crops', async () => {
    // First plant a crop
    const plantSlots = {
      CropType: { name: 'CropType', value: 'carrots' }
    };
    const plantRequest = createMockRequest('IntentRequest', 'PlantCropIntent', plantSlots);
    await handler(plantRequest);
    
    // Then water the crops
    const waterRequest = createMockRequest('IntentRequest', 'WaterCropsIntent');
    const response = await handler(waterRequest);
    
    expect(response.response.outputSpeech.ssml).toContain('water');
    expect(response.response.shouldEndSession).toBe(false);
  });

  test('Check Farm Intent should return farm status', async () => {
    const mockRequest = createMockRequest('IntentRequest', 'CheckFarmIntent');
    
    const response = await handler(mockRequest);
    
    expect(response.response.outputSpeech.ssml).toContain('farm');
    expect(response.response.outputSpeech.ssml).toContain('level');
    expect(response.response.shouldEndSession).toBe(false);
  });

  test('Help Intent should return help information', async () => {
    const mockRequest = createMockRequest('IntentRequest', 'GetHelpIntent');
    
    const response = await handler(mockRequest);
    
    expect(response.response.outputSpeech.ssml).toContain('Voice Farm');
    expect(response.response.outputSpeech.ssml).toContain('plant');
    expect(response.response.shouldEndSession).toBe(false);
  });

  test('Stop Intent should end session', async () => {
    const mockRequest = createMockRequest('IntentRequest', 'AMAZON.StopIntent');
    
    const response = await handler(mockRequest);
    
    expect(response.response.outputSpeech.ssml).toContain('farm');
    expect(response.response.shouldEndSession).toBe(true);
  });

});

console.log('🌾 Voice Farm Game - Test Suite Ready!');
console.log('Run "npm test" to execute all tests.'); 