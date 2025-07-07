// 🌾 Voice Farm Game - Web Edition JavaScript

class VoiceFarmGame {
    constructor() {
        this.selectedCrop = 'tomatoes';
        this.farm = {
            plots: Array(25).fill(null), // 5x5 grid
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
        const farmGrid = document.getElementById('farm-grid');
        farmGrid.innerHTML = '';
        
        for (let i = 0; i < 25; i++) {
            const plot = document.createElement('div');
            plot.className = 'farm-plot empty';
            plot.dataset.plotIndex = i;
            plot.innerHTML = '<div class="crop-icon">🌱</div>';
            
            plot.addEventListener('click', () => this.handlePlotClick(i));
            farmGrid.appendChild(plot);
        }
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
    
    handlePlotClick(plotIndex) {
        const plot = this.farm.plots[plotIndex];
        
        if (!plot) {
            // Empty plot - plant crop
            this.plantCrop(plotIndex);
        } else if (plot.status === 'planted' || plot.status === 'growing') {
            // Water individual crop
            this.waterCrop(plotIndex);
        } else if (plot.status === 'ready') {
            // Harvest ready crop
            this.harvestCrop(plotIndex);
        }
    }
    
    plantCrop(plotIndex) {
        const cropType = this.selectedCrop;
        const config = this.cropConfig[cropType];
        
        const crop = {
            type: cropType,
            status: 'planted',
            plantedAt: Date.now(),
            wateredAt: null,
            readyAt: Date.now() + config.growthTime
        };
        
        this.farm.plots[plotIndex] = crop;
        this.playSound('plant');
        this.addMessage(`Planted ${config.name}! 🌱 Water it to help it grow!`, 'plant');
        this.updatePlotDisplay(plotIndex);
        this.saveGameState();
    }
    
    waterCrop(plotIndex) {
        const crop = this.farm.plots[plotIndex];
        if (!crop || crop.status === 'ready' || crop.status === 'harvested') return;
        
        crop.wateredAt = Date.now();
        crop.status = 'growing';
        
        this.playSound('water');
        this.addMessage(`Watered your ${this.cropConfig[crop.type].name}! 💧 It's growing beautifully!`, 'water');
        this.updatePlotDisplay(plotIndex);
        this.saveGameState();
    }
    
    waterAllCrops() {
        let wateredCount = 0;
        
        this.farm.plots.forEach((crop, index) => {
            if (crop && (crop.status === 'planted' || crop.status === 'growing')) {
                crop.wateredAt = Date.now();
                crop.status = 'growing';
                this.updatePlotDisplay(index);
                wateredCount++;
            }
        });
        
        if (wateredCount > 0) {
            this.playSound('water');
            this.addMessage(`Watered ${wateredCount} crops! 💧 Your farm is thriving!`, 'water');
            this.saveGameState();
        } else {
            this.addMessage(`No crops need watering right now! Plant some seeds first! 🌱`, 'water');
        }
    }
    
    harvestCrop(plotIndex) {
        const crop = this.farm.plots[plotIndex];
        if (!crop || crop.status !== 'ready') return;
        
        const config = this.cropConfig[crop.type];
        crop.status = 'harvested';
        
        // Award XP
        this.farm.xp += config.xpReward;
        this.farm.totalHarvests++;
        
        // Check for level up
        const newLevel = Math.floor(this.farm.xp / 50) + 1;
        const leveledUp = newLevel > this.farm.level;
        this.farm.level = newLevel;
        
        this.playSound('harvest');
        this.addMessage(`Harvested ${config.name}! 🌾 Gained ${config.xpReward} XP!`, 'harvest');
        
        if (leveledUp) {
            this.playSound('levelup');
            this.addMessage(`🎉 Level up! You're now level ${this.farm.level}! 🎉`, 'levelup');
        }
        
        this.updatePlotDisplay(plotIndex);
        this.updateUI();
        this.saveGameState();
    }
    
    harvestAllCrops() {
        let harvestedCount = 0;
        let totalXP = 0;
        
        this.farm.plots.forEach((crop, index) => {
            if (crop && crop.status === 'ready') {
                const config = this.cropConfig[crop.type];
                crop.status = 'harvested';
                totalXP += config.xpReward;
                harvestedCount++;
                this.updatePlotDisplay(index);
            }
        });
        
        if (harvestedCount > 0) {
            const oldLevel = this.farm.level;
            this.farm.xp += totalXP;
            this.farm.totalHarvests += harvestedCount;
            this.farm.level = Math.floor(this.farm.xp / 50) + 1;
            
            this.playSound('harvest');
            this.addMessage(`Harvested ${harvestedCount} crops! 🌾 Gained ${totalXP} XP!`, 'harvest');
            
            if (this.farm.level > oldLevel) {
                this.playSound('levelup');
                this.addMessage(`🎉 Level up! You're now level ${this.farm.level}! 🎉`, 'levelup');
            }
            
            this.updateUI();
            this.saveGameState();
        } else {
            this.addMessage(`No crops are ready to harvest yet! Be patient! ⏰`, 'harvest');
        }
    }
    
    clearHarvestedCrops() {
        let clearedCount = 0;
        
        this.farm.plots.forEach((crop, index) => {
            if (crop && crop.status === 'harvested') {
                this.farm.plots[index] = null;
                this.updatePlotDisplay(index);
                clearedCount++;
            }
        });
        
        if (clearedCount > 0) {
            this.addMessage(`Cleared ${clearedCount} harvested plots! Ready for new crops! 🧹`, 'harvest');
            this.saveGameState();
        } else {
            this.addMessage(`No harvested crops to clear! 🧹`, 'harvest');
        }
    }
    
    updatePlotDisplay(plotIndex) {
        const plotElement = document.querySelector(`[data-plot-index="${plotIndex}"]`);
        const crop = this.farm.plots[plotIndex];
        
        if (!crop) {
            // Empty plot
            plotElement.className = 'farm-plot empty';
            plotElement.innerHTML = '<div class="crop-icon">🌱</div>';
        } else {
            const config = this.cropConfig[crop.type];
            let icon, className, timer = '';
            
            switch (crop.status) {
                case 'planted':
                    icon = config.plantedIcon;
                    className = 'farm-plot planted';
                    timer = 'Needs water';
                    break;
                case 'growing':
                    icon = config.growingIcon;
                    className = 'farm-plot growing';
                    const timeLeft = Math.max(0, crop.readyAt - Date.now());
                    timer = timeLeft > 0 ? `${Math.ceil(timeLeft / 1000)}s` : 'Ready!';
                    break;
                case 'ready':
                    icon = config.icon;
                    className = 'farm-plot ready';
                    timer = 'Ready!';
                    break;
                case 'harvested':
                    icon = '✅';
                    className = 'farm-plot harvested';
                    timer = 'Harvested';
                    break;
            }
            
            plotElement.className = className;
            plotElement.innerHTML = `
                <div class="crop-icon">${icon}</div>
                <div class="crop-timer">${timer}</div>
            `;
        }
    }
    
    updateUI() {
        document.getElementById('player-level').textContent = this.farm.level;
        document.getElementById('player-xp').textContent = this.farm.xp;
        document.getElementById('total-harvests').textContent = this.farm.totalHarvests;
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
            let updated = false;
            
            this.farm.plots.forEach((crop, index) => {
                if (crop && crop.status === 'growing' && Date.now() >= crop.readyAt) {
                    crop.status = 'ready';
                    this.updatePlotDisplay(index);
                    updated = true;
                }
            });
            
            // Update timers for growing crops
            this.farm.plots.forEach((crop, index) => {
                if (crop && crop.status === 'growing') {
                    this.updatePlotDisplay(index);
                }
            });
            
            if (updated) {
                this.addMessage(`Some crops are ready to harvest! 🌾 Click them or use "Harvest All"!`, 'harvest');
            }
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
            farm: this.farm,
            selectedCrop: this.selectedCrop
        };
        localStorage.setItem('voiceFarmGame', JSON.stringify(gameState));
    }
    
    loadGameState() {
        const saved = localStorage.getItem('voiceFarmGame');
        if (saved) {
            try {
                const gameState = JSON.parse(saved);
                this.farm = { ...this.farm, ...gameState.farm };
                this.selectedCrop = gameState.selectedCrop || 'tomatoes';
                
                // Update UI
                this.updateUI();
                this.farm.plots.forEach((_, index) => this.updatePlotDisplay(index));
                
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
        this.farm = {
            plots: Array(25).fill(null),
            level: 1,
            xp: 0,
            totalHarvests: 0
        };
        this.selectedCrop = 'tomatoes';
        localStorage.removeItem('voiceFarmGame');
        
        this.updateUI();
        this.farm.plots.forEach((_, index) => this.updatePlotDisplay(index));
        
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