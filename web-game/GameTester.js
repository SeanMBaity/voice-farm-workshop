// 🧪 GameTester.js - Comprehensive Game Testing System

class GameTester {
    constructor(game) {
        this.game = game;
        this.testResults = [];
        this.isRunning = false;
        this.currentTest = null;
        
        // Test configuration
        this.testSpeed = 100; // ms between test actions
        this.maxTestTime = 30000; // 30 seconds max per test
        
        // Performance tracking
        this.performanceMetrics = {
            frameRates: [],
            updateTimes: [],
            memoryUsage: [],
            errors: []
        };
        
        console.log('🧪 GameTester initialized');
    }
    
    // Main test runner
    async runAllTests() {
        if (this.isRunning) {
            console.warn('🧪 Tests already running');
            return;
        }
        
        this.isRunning = true;
        this.testResults = [];
        
        console.log('🧪 Starting comprehensive game tests...');
        
        const tests = [
            { name: 'Basic UI Elements', fn: () => this.testBasicUI() },
            { name: 'Crop Management Flow', fn: () => this.testCropFlow() },
            { name: 'Resource Management', fn: () => this.testResourceManagement() },
            { name: 'Save/Load System', fn: () => this.testSaveLoad() },
            { name: 'Timer System', fn: () => this.testTimerSystem() },
            { name: 'Keyboard Shortcuts', fn: () => this.testKeyboardShortcuts() },
            { name: 'Mobile Interface', fn: () => this.testMobileInterface() },
            { name: 'Performance Metrics', fn: () => this.testPerformance() },
            { name: 'Error Handling', fn: () => this.testErrorHandling() }
        ];
        
        for (const test of tests) {
            try {
                this.currentTest = test.name;
                console.log(`🧪 Running test: ${test.name}`);
                
                const startTime = performance.now();
                await this.runWithTimeout(test.fn(), this.maxTestTime);
                const duration = performance.now() - startTime;
                
                this.testResults.push({
                    name: test.name,
                    status: 'PASS',
                    duration: Math.round(duration),
                    details: null
                });
                
                console.log(`✅ ${test.name} - PASSED (${Math.round(duration)}ms)`);
                
            } catch (error) {
                this.testResults.push({
                    name: test.name,
                    status: 'FAIL',
                    duration: 0,
                    details: error.message
                });
                
                console.error(`❌ ${test.name} - FAILED: ${error.message}`);
            }
            
            // Small delay between tests
            await this.sleep(200);
        }
        
        this.isRunning = false;
        this.currentTest = null;
        
        this.generateTestReport();
    }
    
    // Individual test methods
    async testBasicUI() {
        // Test that all essential UI elements exist
        const requiredElements = [
            '#player-money',
            '#player-level', 
            '#player-xp',
            '#total-harvests',
            '#farm-grid',
            '#crop-buttons-container',
            '#water-all-btn',
            '#harvest-all-btn',
            '#clear-farm-btn',
            '#save-game-btn',
            '#game-messages'
        ];
        
        for (const selector of requiredElements) {
            const element = document.querySelector(selector);
            if (!element) {
                throw new Error(`Required element not found: ${selector}`);
            }
        }
        
        // Test that farm grid has correct number of plots
        const farmPlots = document.querySelectorAll('.farm-plot');
        if (farmPlots.length !== 25) {
            throw new Error(`Expected 25 farm plots, found ${farmPlots.length}`);
        }
        
        // Test that crop buttons are generated
        const cropButtons = document.querySelectorAll('.crop-btn');
        if (cropButtons.length === 0) {
            throw new Error('No crop buttons found');
        }
    }
    
    async testCropFlow() {
        // Test complete crop lifecycle: plant -> water -> harvest
        const initialMoney = this.game.resourceManager.getResource('money');
        
        // Find an empty plot
        const emptyPlot = document.querySelector('.farm-plot.empty');
        if (!emptyPlot) {
            throw new Error('No empty plots available');
        }
        
        // Select wheat crop (should be affordable)
        const wheatButton = document.querySelector('[data-crop="wheat"]');
        if (!wheatButton) {
            throw new Error('Wheat crop button not found');
        }
        
        // Plant crop
        wheatButton.click();
        await this.sleep(this.testSpeed);
        
        emptyPlot.click();
        await this.sleep(this.testSpeed);
        
        // Check that money was deducted
        const moneyAfterPlant = this.game.resourceManager.getResource('money');
        if (moneyAfterPlant >= initialMoney) {
            throw new Error('Money was not deducted after planting');
        }
        
        // Check plot state changed
        if (emptyPlot.classList.contains('empty')) {
            throw new Error('Plot should no longer be empty after planting');
        }
        
        // Water the crop
        emptyPlot.click();
        await this.sleep(this.testSpeed);
        
        // Wait for crop to grow (wheat now grows in 15 seconds)
        await this.sleep(16000);
        
        // Harvest the crop
        emptyPlot.click();
        await this.sleep(this.testSpeed);
        
        // Check that money increased
        const finalMoney = this.game.resourceManager.getResource('money');
        if (finalMoney <= moneyAfterPlant) {
            throw new Error('Money did not increase after harvest');
        }
    }
    
    async testResourceManagement() {
        const initialStats = {
            money: this.game.resourceManager.getResource('money'),
            level: this.game.resourceManager.getResource('level'),
            xp: this.game.resourceManager.getResource('xp'),
            harvests: this.game.resourceManager.getResource('totalHarvests')
        };
        
        // Test resource addition
        this.game.resourceManager.addResource('money', 100, 'test');
        const newMoney = this.game.resourceManager.getResource('money');
        if (newMoney !== initialStats.money + 100) {
            throw new Error('Money addition failed');
        }
        
        // Test resource spending
        const success = this.game.resourceManager.spendResource('money', 50, 'test');
        if (!success) {
            throw new Error('Failed to spend money');
        }
        
        const moneyAfterSpend = this.game.resourceManager.getResource('money');
        if (moneyAfterSpend !== newMoney - 50) {
            throw new Error('Money spending calculation incorrect');
        }
        
        // Test XP and leveling
        this.game.resourceManager.addResource('xp', 100, 'test');
        const newXP = this.game.resourceManager.getResource('xp');
        if (newXP < initialStats.xp + 100) {
            throw new Error('XP addition failed');
        }
    }
    
    async testSaveLoad() {
        // Get current game state
        const beforeSave = {
            money: this.game.resourceManager.getResource('money'),
            level: this.game.resourceManager.getResource('level'),
            xp: this.game.resourceManager.getResource('xp'),
            selectedCrop: this.game.selectedCrop
        };
        
        // Perform save
        await this.game.saveGameState(true);
        await this.sleep(500);
        
        // Modify game state
        this.game.resourceManager.addResource('money', 999, 'test');
        this.game.selectedCrop = 'corn';
        
        // Load saved state
        await this.game.loadGameState();
        await this.sleep(500);
        
        // Verify state was restored
        const afterLoad = {
            money: this.game.resourceManager.getResource('money'),
            level: this.game.resourceManager.getResource('level'),
            xp: this.game.resourceManager.getResource('xp'),
            selectedCrop: this.game.selectedCrop
        };
        
        if (Math.abs(afterLoad.money - beforeSave.money) > 50) { // Allow some variance for auto-saves
            throw new Error('Money not properly restored from save');
        }
        
        if (afterLoad.level !== beforeSave.level) {
            throw new Error('Level not properly restored from save');
        }
    }
    
    async testTimerSystem() {
        const timerManager = this.game.timerManager;
        
        // Test timer creation
        const testTimer = timerManager.createTimer('test-timer', 'countdown', {
            duration: 1000,
            onComplete: () => {}
        });
        
        if (!testTimer) {
            throw new Error('Failed to create timer');
        }
        
        // Test timer exists
        if (!timerManager.hasTimer('test-timer')) {
            throw new Error('Timer not found after creation');
        }
        
        // Test timer completion
        await this.sleep(1200);
        
        const completedTimer = timerManager.getTimer('test-timer');
        if (completedTimer && !completedTimer.isCompleted) {
            throw new Error('Timer should have completed');
        }
        
        // Test timer export/import
        const exportData = timerManager.exportTimers();
        if (!exportData || !exportData.timers) {
            throw new Error('Timer export failed');
        }
        
        timerManager.clearAllTimers();
        timerManager.importTimers(exportData);
        
        // Test cleanup
        timerManager.removeTimer('test-timer');
    }
    
    async testKeyboardShortcuts() {
        // Test crop selection shortcuts (1-5)
        const event1 = new KeyboardEvent('keydown', { key: '1' });
        document.dispatchEvent(event1);
        await this.sleep(this.testSpeed);
        
        if (this.game.selectedCrop !== 'wheat') {
            throw new Error('Keyboard shortcut 1 should select wheat');
        }
        
        const event2 = new KeyboardEvent('keydown', { key: '2' });
        document.dispatchEvent(event2);
        await this.sleep(this.testSpeed);
        
        if (this.game.selectedCrop !== 'tomatoes') {
            throw new Error('Keyboard shortcut 2 should select tomatoes');
        }
        
        // Test action shortcuts
        const waterEvent = new KeyboardEvent('keydown', { key: 'w' });
        document.dispatchEvent(waterEvent);
        await this.sleep(this.testSpeed);
        
        const harvestEvent = new KeyboardEvent('keydown', { key: 'h' });
        document.dispatchEvent(harvestEvent);
        await this.sleep(this.testSpeed);
        
        // No errors means shortcuts are working
    }
    
    async testMobileInterface() {
        // Test touch events on mobile
        if ('ontouchstart' in window) {
            const farmPlot = document.querySelector('.farm-plot');
            if (farmPlot) {
                const touchEvent = new TouchEvent('touchstart', {
                    touches: [new Touch({
                        identifier: 0,
                        target: farmPlot,
                        clientX: 100,
                        clientY: 100
                    })]
                });
                farmPlot.dispatchEvent(touchEvent);
                await this.sleep(this.testSpeed);
            }
        }
        
        // Test responsive layout
        const gameHeader = document.querySelector('.game-header');
        const computedStyle = window.getComputedStyle(gameHeader);
        
        if (!computedStyle.display || computedStyle.display === 'none') {
            throw new Error('Game header not visible');
        }
        
        // Test viewport meta tag
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            throw new Error('Viewport meta tag missing for mobile optimization');
        }
    }
    
    async testPerformance() {
        const startTime = performance.now();
        const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // Simulate intensive operations
        for (let i = 0; i < 100; i++) {
            this.game.farmGrid.updateGrowth();
            this.game.farmGrid.updateTimers();
            await this.sleep(1);
        }
        
        const endTime = performance.now();
        const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        const duration = endTime - startTime;
        const memoryIncrease = endMemory - startMemory;
        
        // Performance thresholds
        if (duration > 5000) { // 5 seconds for 100 updates is too slow
            throw new Error(`Performance test too slow: ${duration}ms`);
        }
        
        if (memoryIncrease > 10 * 1024 * 1024) { // 10MB increase is concerning
            throw new Error(`Memory usage increased too much: ${memoryIncrease} bytes`);
        }
        
        this.performanceMetrics.updateTimes.push(duration);
        this.performanceMetrics.memoryUsage.push(memoryIncrease);
    }
    
    async testErrorHandling() {
        // Test invalid operations
        try {
            // Try to plant without money
            const originalMoney = this.game.resourceManager.getResource('money');
            this.game.resourceManager.spendResource('money', originalMoney + 1000, 'test');
            
            const expensiveCrop = document.querySelector('[data-crop="pumpkins"]');
            if (expensiveCrop) {
                expensiveCrop.click();
                
                const emptyPlot = document.querySelector('.farm-plot.empty');
                if (emptyPlot) {
                    emptyPlot.click(); // This should fail gracefully
                }
            }
            
        } catch (error) {
            // Errors should be handled gracefully, not thrown
            throw new Error('Game should handle errors gracefully, not throw');
        }
        
        // Test invalid save data
        try {
            localStorage.setItem('voiceFarmGame', 'invalid json');
            await this.game.loadGameState();
            // Should not throw, should handle gracefully
        } catch (error) {
            throw new Error('Game should handle corrupt save data gracefully');
        }
    }
    
    // Utility methods
    async runWithTimeout(promise, timeout) {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Test timeout')), timeout)
            )
        ]);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Test reporting
    generateTestReport() {
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const total = this.testResults.length;
        
        console.log('\n🧪 === GAME TEST REPORT ===');
        console.log(`📊 Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${(passed / total * 100).toFixed(1)}%`);
        
        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(test => {
                    console.log(`  • ${test.name}: ${test.details}`);
                });
        }
        
        console.log('\n⏱️ Performance Summary:');
        if (this.performanceMetrics.updateTimes.length > 0) {
            const avgUpdate = this.performanceMetrics.updateTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.updateTimes.length;
            console.log(`  • Average Update Time: ${avgUpdate.toFixed(2)}ms`);
        }
        
        console.log('\n🧪 Testing Complete!');
        
        return {
            passed,
            failed,
            total,
            successRate: passed / total * 100,
            details: this.testResults,
            performance: this.performanceMetrics
        };
    }
    
    // Public API for manual testing
    async testSingle(testName) {
        const testMap = {
            'ui': () => this.testBasicUI(),
            'crop': () => this.testCropFlow(),
            'resources': () => this.testResourceManagement(),
            'save': () => this.testSaveLoad(),
            'timers': () => this.testTimerSystem(),
            'keyboard': () => this.testKeyboardShortcuts(),
            'mobile': () => this.testMobileInterface(),
            'performance': () => this.testPerformance(),
            'errors': () => this.testErrorHandling()
        };
        
        const testFn = testMap[testName.toLowerCase()];
        if (!testFn) {
            console.error(`Unknown test: ${testName}`);
            return;
        }
        
        try {
            console.log(`🧪 Running single test: ${testName}`);
            const startTime = performance.now();
            await testFn();
            const duration = performance.now() - startTime;
            console.log(`✅ ${testName} - PASSED (${Math.round(duration)}ms)`);
        } catch (error) {
            console.error(`❌ ${testName} - FAILED: ${error.message}`);
        }
    }
    
    // Continuous monitoring
    startMonitoring() {
        setInterval(() => {
            this.checkForErrors();
            this.monitorPerformance();
        }, 5000);
    }
    
    checkForErrors() {
        // Check for JavaScript errors
        if (window.onerror || window.addEventListener) {
            window.addEventListener('error', (event) => {
                this.performanceMetrics.errors.push({
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    timestamp: Date.now()
                });
            });
        }
    }
    
    monitorPerformance() {
        if (performance.memory) {
            this.performanceMetrics.memoryUsage.push(performance.memory.usedJSHeapSize);
            
            // Clean up old data
            if (this.performanceMetrics.memoryUsage.length > 100) {
                this.performanceMetrics.memoryUsage = this.performanceMetrics.memoryUsage.slice(-50);
            }
        }
    }
}

// Global testing functions
window.runGameTests = function() {
    if (window.voiceFarmGame && window.voiceFarmGame.timerManager) {
        const tester = new GameTester(window.voiceFarmGame);
        return tester.runAllTests();
    } else {
        console.error('Game not fully initialized. Wait for game to load.');
    }
};

window.testGame = function(testName) {
    if (window.voiceFarmGame) {
        const tester = new GameTester(window.voiceFarmGame);
        return tester.testSingle(testName);
    } else {
        console.error('Game not initialized');
    }
};

console.log('🧪 GameTester loaded. Run runGameTests() to test the game.');