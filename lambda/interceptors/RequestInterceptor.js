const RequestInterceptor = {
  process(handlerInput) {
    console.log('=== REQUEST INTERCEPTOR ===');
    console.log('Request Type:', handlerInput.requestEnvelope.request.type);
    
    if (handlerInput.requestEnvelope.request.type === 'IntentRequest') {
      console.log('Intent Name:', handlerInput.requestEnvelope.request.intent.name);
      console.log('Intent Slots:', JSON.stringify(handlerInput.requestEnvelope.request.intent.slots, null, 2));
    }
    
    console.log('Session ID:', handlerInput.requestEnvelope.session.sessionId);
    console.log('User ID:', handlerInput.requestEnvelope.session.user.userId);
    console.log('Full Request:', JSON.stringify(handlerInput.requestEnvelope, null, 2));
    console.log('=== END REQUEST INTERCEPTOR ===');
  }
};

module.exports = RequestInterceptor; 