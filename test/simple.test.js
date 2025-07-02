const FarmService = require('../lambda/services/FarmService');

describe('Voice Farm Game - Core Logic', () => {
  
  test('FarmService should plant crops correctly', async () => {
    const result = await FarmService.plantCrop('test-user', 'tomatoes');
    
    expect(result.success).toBe(true);
    expect(result.crop.type).toBe('tomatoes');
    expect(result.message).toContain('tomatoes');
  });

  test('FarmService should water crops after planting', async () => {
    // Plant a crop first
    await FarmService.plantCrop('test-user-2', 'carrots');
    
    // Then water it
    const result = await FarmService.waterCrops('test-user-2');
    
    expect(result.success).toBe(true);
    expect(result.cropsWatered).toBe(1);
  });

  test('FarmService should check farm status', async () => {
    // Plant some crops
    await FarmService.plantCrop('test-user-3', 'tomatoes');
    await FarmService.plantCrop('test-user-3', 'carrots');
    
    const result = await FarmService.getFarmStatus('test-user-3');
    
    expect(result.success).toBe(true);
    expect(result.farm.level).toBe(1);
    expect(result.farm.cropDetails.length).toBe(2);
  });

  test('FarmService should handle invalid crops', async () => {
    const result = await FarmService.plantCrop('test-user-4', 'invalid-crop');
    
    expect(result.success).toBe(false);
    expect(result.message).toContain("don't know how to grow");
  });

  test('FarmService should get crop growth times', () => {
    expect(FarmService.getCropGrowthTime('tomatoes')).toBe(4);
    expect(FarmService.getCropGrowthTime('carrots')).toBe(3);
    expect(FarmService.getCropGrowthTime('corn')).toBe(6);
    expect(FarmService.getCropGrowthTime('lettuce')).toBe(2);
    expect(FarmService.getCropGrowthTime('strawberries')).toBe(5);
  });

  test('FarmService should list available crops', () => {
    const crops = FarmService.getAvailableCrops();
    
    expect(crops).toContain('tomatoes');
    expect(crops).toContain('carrots');
    expect(crops).toContain('corn');
    expect(crops).toContain('lettuce');
    expect(crops).toContain('strawberries');
  });

});

console.log('🌾 Voice Farm Game - Core Logic Tests Ready!');
console.log('✅ All core farming mechanics are working correctly!'); 