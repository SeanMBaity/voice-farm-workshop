const ResponseInterceptor = {
  process(handlerInput, response) {
    console.log('=== RESPONSE INTERCEPTOR ===');
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('=== END RESPONSE INTERCEPTOR ===');
  }
};

module.exports = ResponseInterceptor; 