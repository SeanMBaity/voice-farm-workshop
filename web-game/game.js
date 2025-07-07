// 🌾 Voice Farm Game - Web Edition JavaScript

class VoiceFarmGame {
    constructor() {
        this.selectedCrop = 'tomatoes';
        this.playerStats = {
            level: 1,
            xp: 0,
            totalHarvests: 0
        };
        
        this.cropConfig = {
            tomatoes: { 
                icon: '🍅', 
                growthTime: 4000, // 4 seconds for demo (was 4 hours)
                xpReward: 10, 
                name: 'Tomatoes',
                plantedIcon: '🌱',
                growingIcon: '🌿'
            },
            carrots: { 
                icon: '🥕', 
                growthTime: 3000, // 3 seconds for demo
                xpReward: 8, 
                name: 'Carrots',
                plantedIcon: '🌱',
                growingIcon: '🌿'
            },
            corn: { 
                icon: '🌽', 
                growthTime: 6000, // 6 seconds for demo
                xpReward: 15, 
                name: 'Corn',
                plantedIcon: '🌱',
                growingIcon: '🌿'
            },
            strawberries: { 
                icon: '🍓', 
                growthTime: 5000, // 5 seconds for demo
                xpReward: 12, 
                name: 'Strawberries',
                plantedIcon: '🌱',
                growingIcon: '🌿'
            },
            lettuce: { 
                icon: '🥬', 
                growthTime: 2000, // 2 seconds for demo
                xpReward: 6, 
                name: 'Lettuce',
                plantedIcon: '🌱',
                growingIcon: '🌿'
            }
        };
        
        this.sounds = {
            plant: null,
            water: null,
            harvest: null,
            levelup: null
        };
        
        this.farmGrid = null;
        
        this.init();
    }
    
    init() {
        this.createFarmGrid();
        this.setupEventListeners();
        this.updateUI();
        this.startGameLoop();
        this.loadSounds();
        
        // Load saved game state
        this.loadGameState();
        
        console.log('🌾 Voice Farm Game initialized!');
    }
    
    createFarmGrid() {
        const farmGridElement = document.getElementById('farm-grid');
        this.farmGrid = new FarmGrid(farmGridElement, this.cropConfig);
        
        // Set up event handlers
        this.farmGrid.setPlotActionHandler((plotIndex, plotState) => {
            this.handlePlotClick(plotIndex, plotState);
        });
        
        this.farmGrid.setMessageHandler((message, type) => {
            this.addMessage(message, type);
        });
    }
    
    setupEventListeners() {
        // Crop selection buttons
        document.querySelectorAll('.crop-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.crop-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedCrop = btn.dataset.crop;
                this.addMessage(`Selected ${this.cropConfig[this.selectedCrop].name} for planting! 🌱`, 'plant');
            });
        });
        
        // Action buttons
        document.getElementById('water-all-btn').addEventListener('click', () => this.waterAllCrops());
        document.getElementById('harvest-all-btn').addEventListener('click', () => this.harvestAllCrops());
        document.getElementById('clear-farm-btn').addEventListener('click', () => this.clearHarvestedCrops());
        
        // Select tomatoes by default
        document.querySelector('.crop-btn[data-crop="tomatoes"]').classList.add('selected');
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
        const success = this.farmGrid.plantCrop(plotIndex, this.selectedCrop);
        
        if (success) {
            this.playSound('plant');
            this.saveGameState();
        }
    }
    
    waterCrop(plotIndex) {
        const success = this.farmGrid.waterCrop(plotIndex);
        
        if (success) {
            this.playSound('water');
            this.saveGameState();
        }
    }
    
    waterAllCrops() {
        const wateredCount = this.farmGrid.waterAllCrops();
        
        if (wateredCount > 0) {
            this.playSound('water');
            this.saveGameState();
        }
    }
    
    harvestCrop(plotIndex) {
        const result = this.farmGrid.harvestCrop(plotIndex);
        
        if (result) {
            // Award XP
            this.playerStats.xp += result.xp;
            this.playerStats.totalHarvests++;
            
            // Check for level up
            const newLevel = Math.floor(this.playerStats.xp / 50) + 1;
            const leveledUp = newLevel > this.playerStats.level;
            this.playerStats.level = newLevel;
            
            this.playSound('harvest');
            
            if (leveledUp) {
                this.playSound('levelup');
                this.addMessage(`🎉 Level up! You're now level ${this.playerStats.level}! 🎉`, 'levelup');
            }
            
            this.updateUI();
            this.saveGameState();
        }
    }
    
    harvestAllCrops() {
        const result = this.farmGrid.harvestAllCrops();
        
        if (result.count > 0) {
            const oldLevel = this.playerStats.level;
            this.playerStats.xp += result.xp;
            this.playerStats.totalHarvests += result.count;
            this.playerStats.level = Math.floor(this.playerStats.xp / 50) + 1;
            
            this.playSound('harvest');
            
            if (this.playerStats.level > oldLevel) {
                this.playSound('levelup');
                this.addMessage(`🎉 Level up! You're now level ${this.playerStats.level}! 🎉`, 'levelup');
            }
            
            this.updateUI();
            this.saveGameState();
        }
    }
    
    clearHarvestedCrops() {
        const clearedCount = this.farmGrid.clearHarvestedCrops();
        
        if (clearedCount > 0) {
            this.saveGameState();
        }
    }
    
    
    updateUI() {
        document.getElementById('player-level').textContent = this.playerStats.level;
        document.getElementById('player-xp').textContent = this.playerStats.xp;
        document.getElementById('total-harvests').textContent = this.playerStats.totalHarvests;
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
    
    startGameLoop() {
        setInterval(() => {
            // Update crop growth and timers
            this.farmGrid.updateGrowth();
            this.farmGrid.updateTimers();
        }, 1000); // Update every second
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
    
    saveGameState() {
        const gameState = {
            playerStats: this.playerStats,
            selectedCrop: this.selectedCrop,
            farmData: this.farmGrid.getAllPlotData()
        };
        localStorage.setItem('voiceFarmGame', JSON.stringify(gameState));
    }
    
    loadGameState() {
        const saved = localStorage.getItem('voiceFarmGame');
        if (saved) {
            try {
                const gameState = JSON.parse(saved);
                this.playerStats = { ...this.playerStats, ...gameState.playerStats };
                this.selectedCrop = gameState.selectedCrop || 'tomatoes';
                
                // Restore farm data
                if (gameState.farmData) {
                    this.farmGrid.restoreFromData(gameState.farmData);
                }
                
                // Update UI
                this.updateUI();
                
                // Select the saved crop
                document.querySelectorAll('.crop-btn').forEach(btn => {
                    btn.classList.toggle('selected', btn.dataset.crop === this.selectedCrop);
                });
                
                this.addMessage(`Welcome back! Your farm has been restored! 🌾`, 'welcome');
            } catch (e) {
                console.error('Failed to load game state:', e);
            }
        }
    }
    
    resetGame() {
        this.playerStats = {
            level: 1,
            xp: 0,
            totalHarvests: 0
        };
        this.selectedCrop = 'tomatoes';
        localStorage.removeItem('voiceFarmGame');
        
        this.farmGrid.reset();
        this.updateUI();
        
        document.querySelectorAll('.crop-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.crop === 'tomatoes');
        });
        
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