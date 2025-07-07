// 🌾 Voice Farm Game - Web Edition JavaScript

class VoiceFarmGame {
    constructor() {
        this.selectedCrop = 'wheat'; // Start with wheat as per requirements
        
        // Initialize new management systems
        this.cropManager = new CropManager();
        this.resourceManager = new ResourceManager();
        this.timerManager = new TimerManager();
        this.storageManager = new StorageManager({
            storageKey: 'voiceFarmGame',
            autoSaveInterval: 30000, // 30 seconds
            maxBackups: 3
        });
        this.farmGrid = null;
        
        this.sounds = {
            plant: null,
            water: null,
            harvest: null,
            levelup: null,
            purchase: null,
            sell: null
        };
        
        this.init();
    }
    
    init() {
        this.setupManagers();
        this.createFarmGrid();
        this.setupEventListeners();
        this.setupMobileOptimizations();
        this.updateUI();
        this.startAdvancedGameLoop();
        this.loadSounds();
        
        // Load saved game state
        this.loadGameState();
        
        // Initialize testing capabilities
        this.initializeTestingCapabilities();
        
        console.log('🌾 Voice Farm Game initialized!');
    }
    
    setupManagers() {
        // Set up TimerManager
        this.timerManager.setTickHandler((deltaTime, now) => {
            this.onGameTick(deltaTime, now);
        });
        
        this.timerManager.setVisibilityHandler((isVisible, wasVisible) => {
            this.onVisibilityChange(isVisible, wasVisible);
        });
        
        this.timerManager.setOfflineProgressHandler((offlineTime) => {
            this.onOfflineProgress(offlineTime);
        });
        
        // Set up StorageManager
        this.storageManager.gatherGameData = () => {
            return {
                resources: this.resourceManager.exportData(),
                selectedCrop: this.selectedCrop,
                farmData: this.farmGrid ? this.farmGrid.getAllPlotData() : [],
                timers: this.timerManager.exportTimers(),
                version: '3.0'
            };
        };
        
        this.storageManager.setAutoSaveHandler((gameData) => {
            this.addMessage('Game auto-saved 💾', 'system');
        });
        
        this.storageManager.setErrorHandler((operation, error) => {
            this.addMessage(`Save/load error: ${error.message}`, 'error');
        });
        
        // Start the systems
        this.timerManager.start();
        this.storageManager.enableAutoSave();
    }
    
    createFarmGrid() {
        const farmGridElement = document.getElementById('farm-grid');
        const cropConfig = this.getCropConfigForFarmGrid();
        this.farmGrid = new FarmGrid(farmGridElement, cropConfig);
        
        // Set up event handlers
        this.farmGrid.setPlotActionHandler((plotIndex, plotState) => {
            this.handlePlotClick(plotIndex, plotState);
        });
        
        this.farmGrid.setMessageHandler((message, type) => {
            this.addMessage(message, type);
        });
    }
    
    getCropConfigForFarmGrid() {
        // Convert CropManager format to FarmGrid format
        const crops = this.cropManager.getAllCrops();
        const config = {};
        
        crops.forEach(crop => {
            config[crop.id] = {
                icon: crop.readyIcon,
                growthTime: crop.growthTime,
                xpReward: crop.xpReward,
                name: crop.name,
                plantedIcon: crop.plantedIcon,
                growingIcon: crop.growingIcon
            };
        });
        
        return config;
    }
    
    setupEventListeners() {
        // Set up resource manager handlers
        this.resourceManager.setResourceChangeHandler((resourceType, oldValue, newValue) => {
            this.updateResourceDisplay(resourceType, newValue);
            this.updateCropButtonStates();
        });
        
        this.resourceManager.setLevelUpHandler((oldLevel, newLevel, benefit) => {
            this.handleLevelUp(oldLevel, newLevel, benefit);
        });
        
        // Create dynamic crop buttons
        this.createCropButtons();
        
        // Action buttons
        document.getElementById('water-all-btn').addEventListener('click', () => this.waterAllCrops());
        document.getElementById('harvest-all-btn').addEventListener('click', () => this.harvestAllCrops());
        document.getElementById('clear-farm-btn').addEventListener('click', () => this.clearHarvestedCrops());
        document.getElementById('save-game-btn').addEventListener('click', () => this.saveGameState(true));
    }
    
    setupMobileOptimizations() {
        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTouchDevice = 'ontouchstart' in window;
        
        if (isMobile || isTouchDevice) {
            // Add mobile-specific class
            document.body.classList.add('mobile-device');
            
            // Disable context menu on long press
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
            
            // Add touch feedback
            document.addEventListener('touchstart', (e) => {
                if (e.target.classList.contains('farm-plot') || 
                    e.target.classList.contains('crop-btn') ||
                    e.target.classList.contains('action-btn')) {
                    e.target.style.transform = 'scale(0.95)';
                }
            });
            
            document.addEventListener('touchend', (e) => {
                if (e.target.classList.contains('farm-plot') || 
                    e.target.classList.contains('crop-btn') ||
                    e.target.classList.contains('action-btn')) {
                    setTimeout(() => {
                        e.target.style.transform = '';
                    }, 150);
                }
            });
            
            // Prevent zoom on double tap
            let lastTouchEnd = 0;
            document.addEventListener('touchend', (e) => {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
            
            // Add haptic feedback if available
            if ('vibrate' in navigator) {
                document.addEventListener('touchstart', (e) => {
                    if (e.target.classList.contains('farm-plot')) {
                        navigator.vibrate(50); // Short vibration
                    }
                });
            }
            
            // Optimize message display for mobile
            const messageArea = document.querySelector('.message-area');
            if (messageArea) {
                messageArea.style.position = 'sticky';
                messageArea.style.bottom = '0';
                messageArea.style.zIndex = '100';
            }
            
            console.log('📱 Mobile optimizations enabled');
        }
    }
    
    createCropButtons() {
        const container = document.getElementById('crop-buttons-container');
        const playerLevel = this.resourceManager.getResource('level');
        const availableCrops = this.cropManager.getCropsForLevel(playerLevel);
        
        container.innerHTML = '';
        
        availableCrops.forEach(crop => {
            const button = document.createElement('button');
            button.className = 'crop-btn';
            button.dataset.crop = crop.id;
            
            const canAfford = this.resourceManager.canAfford('money', crop.seedCost);
            const profit = this.cropManager.calculateProfit(crop.id);
            const growthTimeDisplay = (crop.growthTime / 1000).toFixed(0);
            
            button.innerHTML = `
                ${crop.icon} ${crop.name}<br>
                <small>💰${crop.seedCost} • ${growthTimeDisplay}s • ${crop.xpReward} XP</small><br>
                <small class="profit">Profit: +${profit}</small>
            `;
            
            if (!canAfford) {
                button.classList.add('disabled');
                button.title = `Insufficient funds. Need ${crop.seedCost} coins.`;
            }
            
            button.addEventListener('click', () => {
                if (!canAfford) {
                    this.addMessage(`Not enough money to buy ${crop.name} seeds! Need ${crop.seedCost} coins.`, 'error');
                    return;
                }
                
                document.querySelectorAll('.crop-btn').forEach(b => b.classList.remove('selected'));
                button.classList.add('selected');
                this.selectedCrop = crop.id;
                this.addMessage(`Selected ${crop.name} for planting! 🌱 Cost: ${crop.seedCost} coins`, 'plant');
            });
            
            container.appendChild(button);
        });
        
        // Select wheat by default
        const wheatButton = container.querySelector('[data-crop="wheat"]');
        if (wheatButton && !wheatButton.classList.contains('disabled')) {
            wheatButton.classList.add('selected');
        }
    }
    
    updateCropButtonStates() {
        document.querySelectorAll('.crop-btn').forEach(btn => {
            const cropId = btn.dataset.crop;
            const crop = this.cropManager.getCropDefinition(cropId);
            const canAfford = this.resourceManager.canAfford('money', crop.seedCost);
            
            btn.classList.toggle('disabled', !canAfford);
            btn.title = canAfford ? '' : `Insufficient funds. Need ${crop.seedCost} coins.`;
        });
    }
    
    handlePlotClick(plotIndex, plotState) {
        if (plotState === 'empty') {
            // Empty plot - plant crop
            this.plantCrop(plotIndex);
        } else if (plotState === 'planted' || plotState === 'growing') {
            // Water individual crop
            this.waterCrop(plotIndex);
        } else if (plotState === 'ready') {
            // Harvest ready crop
            this.harvestCrop(plotIndex);
        }
    }
    
    plantCrop(plotIndex) {
        const crop = this.cropManager.getCropDefinition(this.selectedCrop);
        if (!crop) {
            this.addMessage(`Invalid crop selected!`, 'error');
            return;
        }
        
        // Check if player can afford seeds
        if (!this.resourceManager.canAfford('money', crop.seedCost)) {
            this.addMessage(`Not enough money to buy ${crop.name} seeds! Need ${crop.seedCost} coins.`, 'error');
            return;
        }
        
        // Attempt to plant
        const success = this.farmGrid.plantCrop(plotIndex, this.selectedCrop);
        
        if (success) {
            // Deduct seed cost
            this.resourceManager.spendResource('money', crop.seedCost, `${crop.name}_seeds`);
            this.playSound('plant');
            this.addMessage(`Planted ${crop.name}! 🌱 Spent ${crop.seedCost} coins on seeds.`, 'plant');
            this.saveGameState(false); // Auto-save
        }
    }
    
    waterCrop(plotIndex) {
        const success = this.farmGrid.waterCrop(plotIndex);
        
        if (success) {
            this.playSound('water');
            this.saveGameState(false); // Auto-save
        }
    }
    
    waterAllCrops() {
        const wateredCount = this.farmGrid.waterAllCrops();
        
        if (wateredCount > 0) {
            this.playSound('water');
            this.saveGameState(false); // Auto-save
        }
    }
    
    harvestCrop(plotIndex) {
        const result = this.farmGrid.harvestCrop(plotIndex);
        
        if (result) {
            const crop = this.cropManager.getCropDefinition(result.type);
            if (crop) {
                // Award money from selling the harvest
                this.resourceManager.addResource('money', crop.sellPrice, `${crop.name}_harvest`);
                this.resourceManager.resources.totalEarned = (this.resourceManager.resources.totalEarned || 0) + crop.sellPrice;
                
                // Award XP
                this.resourceManager.addResource('xp', result.xp, `${crop.name}_harvest`);
                this.resourceManager.addResource('totalHarvests', 1, 'harvest');
                
                this.playSound('harvest');
                this.addMessage(`Harvested ${crop.name}! 🌾 Earned ${crop.sellPrice} coins and ${result.xp} XP!`, 'harvest');
                this.saveGameState(false); // Auto-save
            }
        }
    }
    
    harvestAllCrops() {
        const readyPlots = this.farmGrid.getReadyPlots();
        
        if (readyPlots.length === 0) {
            this.addMessage(`No crops are ready to harvest yet! Be patient! ⏰`, 'harvest');
            return;
        }
        
        let totalMoney = 0;
        let totalXP = 0;
        let harvestedCount = 0;
        
        // Calculate total earnings before harvesting
        readyPlots.forEach(plot => {
            const cropType = plot.getCropType();
            const crop = this.cropManager.getCropDefinition(cropType);
            if (crop) {
                totalMoney += crop.sellPrice;
                totalXP += crop.xpReward;
                harvestedCount++;
            }
        });
        
        // Perform the harvest
        const result = this.farmGrid.harvestAllCrops();
        
        if (result.count > 0) {
            // Award resources
            this.resourceManager.addResource('money', totalMoney, 'mass_harvest');
            this.resourceManager.resources.totalEarned = (this.resourceManager.resources.totalEarned || 0) + totalMoney;
            this.resourceManager.addResource('xp', totalXP, 'mass_harvest');
            this.resourceManager.addResource('totalHarvests', harvestedCount, 'mass_harvest');
            
            this.playSound('harvest');
            this.addMessage(`Harvested ${harvestedCount} crops! 🌾 Earned ${totalMoney} coins and ${totalXP} XP!`, 'harvest');
            this.saveGameState(false); // Auto-save
        }
    }
    
    clearHarvestedCrops() {
        const clearedCount = this.farmGrid.clearAllPlots();
        
        if (clearedCount > 0) {
            this.addMessage(`Cleared ${clearedCount} plots! 🧹`, 'system');
            this.saveGameState(false); // Auto-save
        } else {
            this.addMessage('No plots to clear! 🧹', 'system');
        }
    }
    
    
    updateUI() {
        // Update all resource displays
        this.updateResourceDisplay('money', this.resourceManager.getResource('money'));
        this.updateResourceDisplay('level', this.resourceManager.getResource('level'));
        this.updateResourceDisplay('xp', this.resourceManager.getResource('xp'));
        this.updateResourceDisplay('totalHarvests', this.resourceManager.getResource('totalHarvests'));
    }
    
    updateResourceDisplay(resourceType, value) {
        const elementId = resourceType === 'totalHarvests' ? 'total-harvests' : `player-${resourceType}`;
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
            
            // Add animation for money changes
            if (resourceType === 'money') {
                element.classList.add('updated');
                setTimeout(() => element.classList.remove('updated'), 500);
            }
        }
    }
    
    handleLevelUp(oldLevel, newLevel, benefit) {
        this.playSound('levelup');
        this.addMessage(`🎉 Level up! You're now level ${newLevel}! 🎉`, 'levelup');
        
        if (benefit) {
            this.addMessage(`🎁 ${benefit.message}`, 'levelup');
            
            // If new crops were unlocked, recreate crop buttons
            if (benefit.type === 'crop_unlock') {
                this.createCropButtons();
            }
        }
        
        // Check if player unlocked new crops at this level
        const newCrops = this.cropManager.getCropsUnlockedAtLevel(newLevel);
        if (newCrops.length > 0) {
            const cropNames = newCrops.map(crop => crop.name).join(', ');
            this.addMessage(`🌱 New crops unlocked: ${cropNames}!`, 'levelup');
            this.createCropButtons();
        }
    }
    
    addMessage(text, type = 'welcome') {
        const messagesContainer = document.getElementById('game-messages');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        messagesContainer.appendChild(message);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Remove old messages to prevent overflow
        const messages = messagesContainer.children;
        if (messages.length > 10) {
            messagesContainer.removeChild(messages[0]);
        }
    }
    
    startAdvancedGameLoop() {
        // The TimerManager now handles the main game loop
        // We just need to start it (already done in setupManagers)
        console.log('⏰ Advanced game loop started with TimerManager');
    }
    
    onGameTick(deltaTime, now) {
        // This is called every second by the TimerManager
        this.farmGrid.updateGrowth();
        this.farmGrid.updateTimers();
    }
    
    onVisibilityChange(isVisible, wasVisible) {
        if (!wasVisible && isVisible) {
            this.addMessage('Welcome back! Your farm continued growing! 🌱', 'system');
        } else if (wasVisible && !isVisible) {
            this.addMessage('Farm will continue growing while you\'re away! 🌾', 'system');
        }
    }
    
    onOfflineProgress(offlineTime) {
        const offlineMinutes = Math.floor(offlineTime / 60000);
        if (offlineMinutes > 1) {
            this.addMessage(`You were away for ${offlineMinutes} minutes. Your crops kept growing! 🕐`, 'system');
        }
        
        // The TimerManager automatically handles offline progress for crop timers
        // We just need to update the display
        setTimeout(() => {
            this.farmGrid.updateGrowth();
            this.farmGrid.updateTimers();
        }, 100);
    }
    
    loadSounds() {
        // Initialize audio elements (silent for demo, but structure is ready)
        this.sounds.plant = document.getElementById('plant-sound');
        this.sounds.water = document.getElementById('water-sound');
        this.sounds.harvest = document.getElementById('harvest-sound');
        this.sounds.levelup = document.getElementById('levelup-sound');
    }
    
    playSound(soundType) {
        // For demo, we'll just log the sound
        // In a full implementation, you'd play actual audio files
        console.log(`🔊 Playing ${soundType} sound`);
        
        // Uncomment this when you have actual sound files:
        // if (this.sounds[soundType]) {
        //     this.sounds[soundType].currentTime = 0;
        //     this.sounds[soundType].play().catch(e => console.log('Audio play failed:', e));
        // }
    }
    
    async saveGameState(isManual = true) {
        try {
            const gameData = {
                resources: this.resourceManager.exportData(),
                selectedCrop: this.selectedCrop,
                farmData: this.farmGrid.getAllPlotData(),
                timers: this.timerManager.exportTimers(),
                version: '3.0'
            };
            
            await this.storageManager.save(gameData, { isAutoSave: !isManual });
            
            if (isManual) {
                this.addMessage('Game saved successfully! 💾', 'system');
            }
            
        } catch (error) {
            console.error('Failed to save game:', error);
            this.addMessage('Failed to save game! 😞', 'error');
        }
    }
    
    async loadGameState() {
        try {
            const savePackage = await this.storageManager.load();
            
            if (savePackage && savePackage.gameData) {
                const gameData = savePackage.gameData;
                
                // Import resource data
                if (gameData.resources) {
                    this.resourceManager.importData(gameData.resources);
                }
                
                this.selectedCrop = gameData.selectedCrop || 'wheat';
                
                // Restore farm data
                if (gameData.farmData) {
                    this.farmGrid.restoreFromData(gameData.farmData);
                }
                
                // Restore timers
                if (gameData.timers) {
                    this.timerManager.importTimers(gameData.timers);
                }
                
                // Update UI and crop buttons
                this.updateUI();
                this.createCropButtons();
                
                // Select the saved crop
                setTimeout(() => {
                    document.querySelectorAll('.crop-btn').forEach(btn => {
                        btn.classList.toggle('selected', btn.dataset.crop === this.selectedCrop);
                    });
                }, 100);
                
                const timeAway = Date.now() - savePackage.timestamp;
                const minutesAway = Math.floor(timeAway / 60000);
                
                if (minutesAway > 5) {
                    this.addMessage(`Welcome back! You were away for ${minutesAway} minutes. Your farm kept growing! 🌾`, 'welcome');
                } else {
                    this.addMessage(`Welcome back! Your farm has been restored! 🌾`, 'welcome');
                }
                
            } else {
                this.addMessage(`Welcome to your new farm! Start by planting some wheat! 🌱`, 'welcome');
            }
            
        } catch (error) {
            console.error('Failed to load game state:', error);
            this.addMessage(`Failed to load save data. Starting fresh! 🌱`, 'error');
        }
    }
    
    async resetGame() {
        // Stop auto-save during reset
        this.storageManager.disableAutoSave();
        
        this.resourceManager.reset();
        this.timerManager.clearAllTimers();
        this.selectedCrop = 'wheat';
        
        // Clear storage
        localStorage.removeItem('voiceFarmGame');
        
        this.farmGrid.reset();
        this.updateUI();
        this.createCropButtons();
        
        setTimeout(() => {
            document.querySelectorAll('.crop-btn').forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.crop === 'wheat');
            });
        }, 100);
        
        // Re-enable auto-save
        this.storageManager.enableAutoSave();
        
        this.addMessage(`Farm reset! Start your cozy farming journey! 🌱`, 'welcome');
    }
    
    initializeTestingCapabilities() {
        // Auto-run basic validation on initialization
        setTimeout(() => {
            this.runBasicValidation();
        }, 2000); // Wait 2 seconds for everything to load
        
        // Add global testing functions
        window.runGameTests = () => {
            if (window.GameTester) {
                const tester = new GameTester(this);
                return tester.runAllTests();
            } else {
                console.error('GameTester not available');
            }
        };
        
        window.testGamePerformance = () => {
            this.runPerformanceTest();
        };
        
        window.validateGameState = () => {
            this.runBasicValidation();
        };
    }
    
    runBasicValidation() {
        const validation = {
            timestamp: new Date().toISOString(),
            tests: [],
            passed: 0,
            failed: 0
        };
        
        // Test 1: Core managers are initialized
        const managers = ['cropManager', 'resourceManager', 'timerManager', 'storageManager', 'farmGrid'];
        managers.forEach(manager => {
            if (this[manager]) {
                validation.tests.push({ name: `${manager} initialized`, status: 'PASS' });
                validation.passed++;
            } else {
                validation.tests.push({ name: `${manager} initialized`, status: 'FAIL' });
                validation.failed++;
            }
        });
        
        // Test 2: DOM elements exist
        const requiredElements = ['player-money', 'player-level', 'farm-grid', 'game-messages'];
        requiredElements.forEach(id => {
            if (document.getElementById(id)) {
                validation.tests.push({ name: `Element ${id} exists`, status: 'PASS' });
                validation.passed++;
            } else {
                validation.tests.push({ name: `Element ${id} exists`, status: 'FAIL' });
                validation.failed++;
            }
        });
        
        // Test 3: Game state is valid
        const resources = this.resourceManager.getResource('money');
        if (typeof resources === 'number' && resources >= 0) {
            validation.tests.push({ name: 'Valid resource state', status: 'PASS' });
            validation.passed++;
        } else {
            validation.tests.push({ name: 'Valid resource state', status: 'FAIL' });
            validation.failed++;
        }
        
        console.log('🧪 Basic Game Validation Results:', validation);
        
        const successRate = (validation.passed / (validation.passed + validation.failed)) * 100;
        if (successRate >= 90) {
            this.addMessage(`✅ Game validation passed (${successRate.toFixed(1)}%)`, 'system');
        } else {
            this.addMessage(`⚠️ Game validation issues detected (${successRate.toFixed(1)}%)`, 'error');
        }
        
        return validation;
    }
    
    runPerformanceTest() {
        const startTime = performance.now();
        const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // Simulate game operations
        let operations = 0;
        for (let i = 0; i < 1000; i++) {
            this.farmGrid.updateGrowth();
            this.updateUI();
            operations++;
        }
        
        const endTime = performance.now();
        const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        const results = {
            operations,
            duration: endTime - startTime,
            memoryIncrease: endMemory - startMemory,
            operationsPerSecond: operations / ((endTime - startTime) / 1000)
        };
        
        console.log('📈 Performance Test Results:', results);
        
        if (results.duration < 100) {
            this.addMessage(`🚀 Performance test passed (${results.duration.toFixed(2)}ms)`, 'system');
        } else {
            this.addMessage(`⚠️ Performance concerns (${results.duration.toFixed(2)}ms)`, 'error');
        }
        
        return results;
    }
}

// 🎮 KeyboardShortcutManager - Comprehensive Keyboard Controls
class KeyboardShortcutManager {
    constructor(game) {
        this.game = game;
        this.shortcuts = new Map();
        this.isEnabled = true;
        this.showHelpModal = false;
        
        this.defineShortcuts();
    }
    
    defineShortcuts() {
        // Crop selection shortcuts (1-8 for all crops)
        this.shortcuts.set('1', { action: () => this.selectCrop('wheat'), description: 'Select Wheat' });
        this.shortcuts.set('2', { action: () => this.selectCrop('tomatoes'), description: 'Select Tomatoes' });
        this.shortcuts.set('3', { action: () => this.selectCrop('carrots'), description: 'Select Carrots' });
        this.shortcuts.set('4', { action: () => this.selectCrop('strawberries'), description: 'Select Strawberries' });
        this.shortcuts.set('5', { action: () => this.selectCrop('corn'), description: 'Select Corn' });
        this.shortcuts.set('6', { action: () => this.selectCrop('lettuce'), description: 'Select Lettuce' });
        this.shortcuts.set('7', { action: () => this.selectCrop('sunflowers'), description: 'Select Sunflowers' });
        this.shortcuts.set('8', { action: () => this.selectCrop('pumpkins'), description: 'Select Pumpkins' });
        
        // Action shortcuts
        this.shortcuts.set('w', { action: () => this.game.waterAllCrops(), description: 'Water All Crops' });
        this.shortcuts.set('h', { action: () => this.game.harvestAllCrops(), description: 'Harvest All Crops' });
        this.shortcuts.set('c', { action: () => this.game.clearHarvestedCrops(), description: 'Clear All Plots' });
        this.shortcuts.set('s', { action: () => this.game.saveGameState(true), description: 'Save Game' });
        
        // Navigation shortcuts
        this.shortcuts.set('ArrowUp', { action: () => this.navigatePlots('up'), description: 'Navigate Up' });
        this.shortcuts.set('ArrowDown', { action: () => this.navigatePlots('down'), description: 'Navigate Down' });
        this.shortcuts.set('ArrowLeft', { action: () => this.navigatePlots('left'), description: 'Navigate Left' });
        this.shortcuts.set('ArrowRight', { action: () => this.navigatePlots('right'), description: 'Navigate Right' });
        this.shortcuts.set(' ', { action: () => this.activateSelectedPlot(), description: 'Activate Selected Plot' });
        
        // Quick actions
        this.shortcuts.set('p', { action: () => this.quickPlant(), description: 'Quick Plant on Empty Plots' });
        this.shortcuts.set('a', { action: () => this.selectAllPlots(), description: 'Select All Plots' });
        this.shortcuts.set('Escape', { action: () => this.clearSelection(), description: 'Clear Selection' });
        
        // Debug and testing (Ctrl combinations)
        this.shortcuts.set('ctrl+t', { action: () => this.runQuickTest(), description: 'Run Quick Test' });
        this.shortcuts.set('ctrl+d', { action: () => this.toggleDebugMode(), description: 'Toggle Debug Mode' });
        this.shortcuts.set('ctrl+r', { action: () => this.game.resetGame(), description: 'Reset Game' });
        
        // Help
        this.shortcuts.set('?', { action: () => this.showKeyboardHelp(), description: 'Show Keyboard Help' });
        this.shortcuts.set('F1', { action: () => this.showKeyboardHelp(), description: 'Show Keyboard Help' });
    }
    
    init() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        document.addEventListener('keyup', (e) => this.handleKeyup(e));
        
        // Initialize plot navigation
        this.selectedPlotIndex = 0;
        this.highlightSelectedPlot();
        
        console.log('🎮 KeyboardShortcutManager initialized');
    }
    
    handleKeydown(e) {
        if (!this.isEnabled) return;
        
        // Handle special key combinations
        let keyCombo = '';
        if (e.ctrlKey) keyCombo += 'ctrl+';
        if (e.shiftKey) keyCombo += 'shift+';
        if (e.altKey) keyCombo += 'alt+';
        keyCombo += e.key.toLowerCase();
        
        // Check for exact match first
        const shortcut = this.shortcuts.get(keyCombo) || this.shortcuts.get(e.key);
        
        if (shortcut) {
            e.preventDefault();
            try {
                shortcut.action();
                this.showKeyPress(e.key);
            } catch (error) {
                console.error('Keyboard shortcut error:', error);
            }
        }
    }
    
    handleKeyup(e) {
        // Handle any key release actions if needed
    }
    
    selectCrop(cropId) {
        const availableCrops = this.game.cropManager.getCropsForLevel(
            this.game.resourceManager.getResource('level')
        );
        
        const crop = availableCrops.find(c => c.id === cropId);
        if (crop && this.game.resourceManager.canAfford('money', crop.seedCost)) {
            this.game.selectedCrop = cropId;
            
            // Update UI
            document.querySelectorAll('.crop-btn').forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.crop === cropId);
            });
            
            this.game.addMessage(`Selected ${crop.name}! 🌱`, 'plant');
        } else if (crop) {
            this.game.addMessage(`Cannot afford ${crop.name} seeds! Need ${crop.seedCost} coins.`, 'error');
        } else {
            this.game.addMessage(`${cropId} not available at your level!`, 'error');
        }
    }
    
    navigatePlots(direction) {
        const gridSize = 5; // 5x5 grid
        const totalPlots = 25;
        
        let newIndex = this.selectedPlotIndex;
        
        switch (direction) {
            case 'up':
                newIndex = this.selectedPlotIndex - gridSize;
                if (newIndex < 0) newIndex = this.selectedPlotIndex + (gridSize * (gridSize - 1));
                break;
            case 'down':
                newIndex = this.selectedPlotIndex + gridSize;
                if (newIndex >= totalPlots) newIndex = this.selectedPlotIndex - (gridSize * (gridSize - 1));
                break;
            case 'left':
                newIndex = this.selectedPlotIndex - 1;
                if (newIndex < 0 || Math.floor(newIndex / gridSize) !== Math.floor(this.selectedPlotIndex / gridSize)) {
                    newIndex = this.selectedPlotIndex + (gridSize - 1);
                }
                break;
            case 'right':
                newIndex = this.selectedPlotIndex + 1;
                if (newIndex >= totalPlots || Math.floor(newIndex / gridSize) !== Math.floor(this.selectedPlotIndex / gridSize)) {
                    newIndex = this.selectedPlotIndex - (gridSize - 1);
                }
                break;
        }
        
        this.selectedPlotIndex = newIndex;
        this.highlightSelectedPlot();
    }
    
    highlightSelectedPlot() {
        // Remove previous highlights
        document.querySelectorAll('.farm-plot').forEach(plot => {
            plot.classList.remove('keyboard-selected');
        });
        
        // Add highlight to selected plot
        const selectedPlot = document.querySelector(`[data-plot-index="${this.selectedPlotIndex}"]`);
        if (selectedPlot) {
            selectedPlot.classList.add('keyboard-selected');
            selectedPlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Add CSS for highlighting if not already added
        if (!document.querySelector('#keyboard-highlight-styles')) {
            const style = document.createElement('style');
            style.id = 'keyboard-highlight-styles';
            style.textContent = `
                .farm-plot.keyboard-selected {
                    outline: 3px solid #4A90E2;
                    outline-offset: 2px;
                    animation: keyboardPulse 1s ease-in-out infinite alternate;
                }
                
                @keyframes keyboardPulse {
                    from { outline-color: #4A90E2; }
                    to { outline-color: #7BB3F0; }
                }
                
                .key-press-indicator {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 10px 15px;
                    border-radius: 8px;
                    font-family: monospace;
                    font-size: 14px;
                    z-index: 1000;
                    animation: keyPressShow 0.8s ease-out;
                }
                
                @keyframes keyPressShow {
                    0% { opacity: 0; transform: translateY(-20px) scale(0.8); }
                    30% { opacity: 1; transform: translateY(0) scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    activateSelectedPlot() {
        const selectedPlot = document.querySelector(`[data-plot-index="${this.selectedPlotIndex}"]`);
        if (selectedPlot) {
            selectedPlot.click();
            this.showKeyPress('SPACE');
        }
    }
    
    quickPlant() {
        const emptyPlots = document.querySelectorAll('.farm-plot.empty');
        let planted = 0;
        
        emptyPlots.forEach(plot => {
            if (planted < 5) { // Limit to 5 for quick planting
                plot.click();
                planted++;
            }
        });
        
        if (planted > 0) {
            this.game.addMessage(`Quick planted ${planted} crops! 🌱`, 'plant');
        } else {
            this.game.addMessage('No empty plots available for quick planting!', 'error');
        }
    }
    
    selectAllPlots() {
        // Visual selection of all plots (for potential future batch operations)
        document.querySelectorAll('.farm-plot').forEach(plot => {
            plot.classList.add('keyboard-selected');
        });
        
        setTimeout(() => {
            document.querySelectorAll('.farm-plot').forEach(plot => {
                plot.classList.remove('keyboard-selected');
            });
            this.highlightSelectedPlot(); // Restore single selection
        }, 1000);
        
        this.game.addMessage('All plots selected! 📋', 'system');
    }
    
    clearSelection() {
        document.querySelectorAll('.farm-plot').forEach(plot => {
            plot.classList.remove('keyboard-selected');
        });
        this.game.addMessage('Selection cleared! ❌', 'system');
    }
    
    runQuickTest() {
        if (window.runGameTests) {
            this.game.addMessage('Running quick tests... 🧪', 'system');
            window.runGameTests();
        } else {
            this.game.addMessage('GameTester not available!', 'error');
        }
    }
    
    toggleDebugMode() {
        const debugInfo = document.getElementById('debug-info');
        
        if (debugInfo) {
            debugInfo.remove();
            this.game.addMessage('Debug mode disabled 🔧', 'system');
        } else {
            this.createDebugPanel();
            this.game.addMessage('Debug mode enabled 🔧', 'system');
        }
    }
    
    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-info';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
            max-width: 300px;
            max-height: 400px;
            overflow-y: auto;
        `;
        
        document.body.appendChild(panel);
        
        // Update debug info every second
        const updateDebugInfo = () => {
            if (document.getElementById('debug-info')) {
                const stats = this.game.resourceManager.getResourceStats();
                const timerStats = this.game.timerManager.getStats();
                const storageStats = this.game.storageManager.getStats();
                
                panel.innerHTML = `
                    <h4 style="color: #00ff00; margin: 0 0 10px 0;">🔧 Debug Info</h4>
                    <div><strong>Resources:</strong></div>
                    <div>Money: ${stats.resources.money}</div>
                    <div>Level: ${stats.resources.level}</div>
                    <div>XP: ${stats.resources.xp}</div>
                    <div>Harvests: ${stats.resources.totalHarvests}</div>
                    
                    <div style="margin-top: 10px;"><strong>Timers:</strong></div>
                    <div>Active: ${timerStats.activeTimers}</div>
                    <div>Total: ${timerStats.totalTimers}</div>
                    <div>Avg Update: ${timerStats.averageUpdateTime.toFixed(2)}ms</div>
                    
                    <div style="margin-top: 10px;"><strong>Storage:</strong></div>
                    <div>Total Saves: ${storageStats.totalSaves}</div>
                    <div>Auto Saves: ${storageStats.autoSaves}</div>
                    <div>Storage Used: ${(storageStats.totalStorageUsed / 1024).toFixed(1)}KB</div>
                    
                    <div style="margin-top: 10px;"><strong>Performance:</strong></div>
                    <div>FPS: ${Math.round(1000 / 16)} (estimated)</div>
                    <div>Memory: ${performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A'}</div>
                `;
                
                setTimeout(updateDebugInfo, 1000);
            }
        };
        
        updateDebugInfo();
    }
    
    showKeyPress(key) {
        // Remove existing indicator
        const existing = document.querySelector('.key-press-indicator');
        if (existing) existing.remove();
        
        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'key-press-indicator';
        indicator.textContent = `Key: ${key.toUpperCase()}`;
        
        document.body.appendChild(indicator);
        
        // Remove after animation
        setTimeout(() => indicator.remove(), 800);
    }
    
    showKeyboardHelp() {
        const helpModal = document.createElement('div');
        helpModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        const helpContent = document.createElement('div');
        helpContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            font-family: 'Nunito', sans-serif;
        `;
        
        helpContent.innerHTML = `
            <h2 style="margin-top: 0; color: #228B22;">🎮 Keyboard Shortcuts</h2>
            
            <h3>🌱 Crop Selection</h3>
            <div style="margin-bottom: 15px;">
                <strong>1-8:</strong> Select crops (Wheat, Tomatoes, Carrots, Strawberries, Corn, Lettuce, Sunflowers, Pumpkins)
            </div>
            
            <h3>🚀 Quick Actions</h3>
            <div style="margin-bottom: 15px;">
                <strong>W:</strong> Water all crops<br>
                <strong>H:</strong> Harvest all ready crops<br>
                <strong>C:</strong> Clear all plots<br>
                <strong>S:</strong> Save game<br>
                <strong>P:</strong> Quick plant on empty plots
            </div>
            
            <h3>🧭 Navigation</h3>
            <div style="margin-bottom: 15px;">
                <strong>Arrow Keys:</strong> Navigate between plots<br>
                <strong>Space:</strong> Activate selected plot<br>
                <strong>A:</strong> Select all plots<br>
                <strong>Escape:</strong> Clear selection
            </div>
            
            <h3>🔧 Advanced</h3>
            <div style="margin-bottom: 15px;">
                <strong>Ctrl+T:</strong> Run quick tests<br>
                <strong>Ctrl+D:</strong> Toggle debug mode<br>
                <strong>Ctrl+R:</strong> Reset game<br>
                <strong>F1 or ?:</strong> Show this help
            </div>
            
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: #228B22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 20px;">
                Close (ESC)
            </button>
        `;
        
        helpModal.appendChild(helpContent);
        document.body.appendChild(helpModal);
        
        // Close on escape or click outside
        const closeModal = (e) => {
            if (e.key === 'Escape' || e.target === helpModal) {
                helpModal.remove();
                document.removeEventListener('keydown', closeModal);
            }
        };
        
        document.addEventListener('keydown', closeModal);
        helpModal.addEventListener('click', closeModal);
    }
    
    enable() {
        this.isEnabled = true;
        console.log('🎮 Keyboard shortcuts enabled');
    }
    
    disable() {
        this.isEnabled = false;
        console.log('🎮 Keyboard shortcuts disabled');
    }
    
    destroy() {
        this.isEnabled = false;
        document.getElementById('debug-info')?.remove();
        document.querySelectorAll('.key-press-indicator').forEach(el => el.remove());
        console.log('🎮 KeyboardShortcutManager destroyed');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.voiceFarmGame = new VoiceFarmGame();
    
    // Enhanced keyboard shortcuts system
    const keyboardHandler = new KeyboardShortcutManager(window.voiceFarmGame);
    keyboardHandler.init();
    
    console.log('🎮 Keyboard shortcuts:');
    console.log('1-5: Select crops | W: Water all | H: Harvest all | C: Clear | Ctrl+R: Reset');
});

// Add a reset button for development
document.addEventListener('DOMContentLoaded', () => {
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '🔄 Reset Game';
    resetBtn.className = 'action-btn clear-btn';
    resetBtn.style.marginTop = '10px';
    resetBtn.onclick = () => {
        if (confirm('Reset your entire farm? This cannot be undone!')) {
            window.voiceFarmGame.resetGame();
        }
    };
    
    document.querySelector('.action-buttons').appendChild(resetBtn);
}); 