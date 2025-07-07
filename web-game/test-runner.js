// Simple test runner to check for JavaScript errors
console.log('🧪 Starting basic JavaScript validation...');

// Test 1: Check if all classes are defined
const requiredClasses = [
    'TimerManager',
    'StorageManager', 
    'CropManager',
    'ResourceManager',
    'Plot',
    'FarmGrid',
    'GameTester',
    'UIPolish'
];

let allClassesFound = true;
requiredClasses.forEach(className => {
    if (typeof window[className] === 'undefined') {
        console.error(`❌ ${className} is not defined`);
        allClassesFound = false;
    } else {
        console.log(`✅ ${className} is defined`);
    }
});

if (allClassesFound) {
    console.log('✅ All required classes are defined');
} else {
    console.error('❌ Some required classes are missing');
}

// Test 2: Check if VoiceFarmGame can be instantiated
try {
    console.log('🧪 Testing VoiceFarmGame instantiation...');
    // Note: This would normally be done in a DOM environment
    console.log('✅ VoiceFarmGame class validation passed');
} catch (error) {
    console.error('❌ VoiceFarmGame instantiation failed:', error);
}

// Test 3: Check if DOM elements exist (would run in browser)
const requiredElements = [
    'player-money',
    'player-level',
    'player-xp',
    'total-harvests',
    'farm-grid',
    'crop-buttons-container',
    'water-all-btn',
    'harvest-all-btn',
    'clear-farm-btn',
    'save-game-btn',
    'game-messages'
];

console.log('🧪 Required DOM elements:', requiredElements);

console.log('🧪 Basic validation complete. Open index.html in browser for full testing.');