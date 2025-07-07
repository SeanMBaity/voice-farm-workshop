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
        this.updateUI();
        this.startAdvancedGameLoop();
        this.loadSounds();
        
        // Load saved game state
        this.loadGameState();
        
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
        const clearedCount = this.farmGrid.clearHarvestedCrops();
        
        if (clearedCount > 0) {
            this.saveGameState(false); // Auto-save
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
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.voiceFarmGame = new VoiceFarmGame();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        const game = window.voiceFarmGame;
        
        switch (e.key) {
            case '1': game.selectedCrop = 'tomatoes'; break;
            case '2': game.selectedCrop = 'carrots'; break;
            case '3': game.selectedCrop = 'corn'; break;
            case '4': game.selectedCrop = 'strawberries'; break;
            case '5': game.selectedCrop = 'lettuce'; break;
            case 'w': game.waterAllCrops(); break;
            case 'h': game.harvestAllCrops(); break;
            case 'c': game.clearHarvestedCrops(); break;
            case 'r': if (e.ctrlKey) { e.preventDefault(); game.resetGame(); } break;
        }
        
        // Update selected crop button
        if (['1', '2', '3', '4', '5'].includes(e.key)) {
            const crops = ['tomatoes', 'carrots', 'corn', 'strawberries', 'lettuce'];
            const cropIndex = parseInt(e.key) - 1;
            document.querySelectorAll('.crop-btn').forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.crop === crops[cropIndex]);
            });
            game.addMessage(`Selected ${game.cropConfig[crops[cropIndex]].name}! 🌱`, 'plant');
        }
    });
    
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