// 🌾 FarmGrid.js - Farm Grid Management System

class FarmGrid {
    constructor(gridElement, cropConfig) {
        this.gridElement = gridElement;
        this.cropConfig = cropConfig;
        this.plots = [];
        this.size = 64; // 8x8 grid
        this.onPlotAction = null;
        this.onMessage = null;
        
        this.initialize();
    }
    
    initialize() {
        this.createGrid();
        this.setupEventListeners();
    }
    
    createGrid() {
        this.gridElement.innerHTML = '';
        this.plots = [];
        
        for (let i = 0; i < this.size; i++) {
            const plotElement = document.createElement('div');
            const row = Math.floor(i / 8);
            const col = i % 8;
            
            // Check if this is in the center 4x4 grid (rows 2-5, cols 2-5)
            const isStartingPlot = (row >= 2 && row <= 5 && col >= 2 && col <= 5);
            
            if (isStartingPlot) {
                plotElement.className = 'farm-plot empty';
                plotElement.dataset.plotIndex = i;
                plotElement.innerHTML = '';
            } else {
                plotElement.className = 'farm-plot locked';
                plotElement.dataset.plotIndex = i;
                plotElement.innerHTML = `
                    <div class="lock-icon">🔒</div>
                    <div class="price-tag">$100</div>
                `;
            }
            
            const plot = new Plot(i, plotElement, this.cropConfig);
            plot.onPlotClick = (index, state) => this.handlePlotClick(index, state);
            plot.isLocked = !isStartingPlot;
            
            this.plots.push(plot);
            this.gridElement.appendChild(plotElement);
        }
    }
    
    setupEventListeners() {
        // Additional grid-level event listeners can be added here
    }
    
    handlePlotClick(plotIndex, plotState) {
        if (this.onPlotAction) {
            this.onPlotAction(plotIndex, plotState);
        }
    }
    
    purchasePlot(plotIndex) {
        if (plotIndex < 0 || plotIndex >= this.plots.length) return false;
        
        const plot = this.plots[plotIndex];
        if (!plot.isLocked) return false;
        
        // Unlock the plot
        plot.isLocked = false;
        plot.element.className = 'farm-plot empty';
        plot.element.innerHTML = '';
        
        if (this.onMessage) {
            this.onMessage('Plot purchased! 🏞️ Ready for farming!', 'purchase');
        }
        
        return true;
    }
    
    plantCrop(plotIndex, cropType) {
        if (plotIndex < 0 || plotIndex >= this.plots.length) return false;
        
        const plot = this.plots[plotIndex];
        
        // Check if plot is locked
        if (plot.isLocked) {
            if (this.onMessage) {
                this.onMessage('This plot is locked! Purchase it for $100 to start farming!', 'error');
            }
            return false;
        }
        
        const success = plot.plant(cropType);
        
        if (success && this.onMessage) {
            const config = this.cropConfig[cropType];
            this.onMessage(`Planted ${config.name}! 🌱 Water it to help it grow!`, 'plant');
        }
        
        return success;
    }
    
    waterCrop(plotIndex) {
        if (plotIndex < 0 || plotIndex >= this.plots.length) return false;
        
        const plot = this.plots[plotIndex];
        const success = plot.water();
        
        if (success && this.onMessage) {
            const config = this.cropConfig[plot.getCropType()];
            this.onMessage(`Watered your ${config.name}! 💧 It's growing beautifully!`, 'water');
        }
        
        return success;
    }
    
    harvestCrop(plotIndex) {
        if (plotIndex < 0 || plotIndex >= this.plots.length) return null;
        
        const plot = this.plots[plotIndex];
        const result = plot.harvest();
        
        if (result && this.onMessage) {
            this.onMessage(`Harvested ${result.name}! 🌾 Gained ${result.xp} XP!`, 'harvest');
        }
        
        return result;
    }
    
    clearPlot(plotIndex) {
        if (plotIndex < 0 || plotIndex >= this.plots.length) return false;
        
        return this.plots[plotIndex].clear();
    }
    
    waterAllCrops() {
        let wateredCount = 0;
        
        this.plots.forEach(plot => {
            if (plot.needsWater() || plot.isGrowing()) {
                if (plot.water()) {
                    wateredCount++;
                }
            }
        });
        
        if (wateredCount > 0 && this.onMessage) {
            this.onMessage(`Watered ${wateredCount} crops! 💧 Your farm is thriving!`, 'water');
        } else if (wateredCount === 0 && this.onMessage) {
            this.onMessage(`No crops need watering right now! Plant some seeds first! 🌱`, 'water');
        }
        
        return wateredCount;
    }
    
    harvestAllCrops() {
        let harvestedCount = 0;
        let totalXP = 0;
        
        this.plots.forEach(plot => {
            if (plot.isReady()) {
                const result = plot.harvest();
                if (result) {
                    harvestedCount++;
                    totalXP += result.xp;
                }
            }
        });
        
        if (harvestedCount > 0 && this.onMessage) {
            this.onMessage(`Harvested ${harvestedCount} crops! 🌾 Gained ${totalXP} XP!`, 'harvest');
        } else if (harvestedCount === 0 && this.onMessage) {
            this.onMessage(`No crops are ready to harvest yet! Be patient! ⏰`, 'harvest');
        }
        
        return { count: harvestedCount, xp: totalXP };
    }
    
    clearHarvestedCrops() {
        let clearedCount = 0;
        
        this.plots.forEach(plot => {
            if (plot.isHarvested()) {
                if (plot.clear()) {
                    clearedCount++;
                }
            }
        });
        
        if (clearedCount > 0 && this.onMessage) {
            this.onMessage(`Cleared ${clearedCount} harvested plots! Ready for new crops! 🧹`, 'harvest');
        } else if (clearedCount === 0 && this.onMessage) {
            this.onMessage(`No harvested crops to clear! 🧹`, 'harvest');
        }
        
        return clearedCount;
    }
    
    clearAllPlots() {
        let clearedCount = 0;
        
        this.plots.forEach(plot => {
            if (plot.state !== 'empty') {
                plot.crop = null;
                plot.state = 'empty';
                plot.updateDisplay();
                clearedCount++;
            }
        });
        
        return clearedCount;
    }
    
    updateGrowth() {
        let readyCount = 0;
        
        this.plots.forEach(plot => {
            if (plot.checkGrowth()) {
                readyCount++;
            }
        });
        
        if (readyCount > 0 && this.onMessage) {
            this.onMessage(`Some crops are ready to harvest! 🌾 Click them or use "Harvest All"!`, 'harvest');
        }
        
        return readyCount;
    }
    
    updateTimers() {
        this.plots.forEach(plot => {
            if (plot.isGrowing()) {
                plot.updateDisplay();
            }
        });
    }
    
    getPlotCount(state) {
        return this.plots.filter(plot => {
            switch (state) {
                case 'empty': return plot.isEmpty();
                case 'planted': return plot.needsWater();
                case 'growing': return plot.isGrowing();
                case 'ready': return plot.isReady();
                case 'harvested': return plot.isHarvested();
                default: return false;
            }
        }).length;
    }
    
    getReadyPlots() {
        return this.plots.filter(plot => plot.isReady());
    }
    
    getGrowingPlots() {
        return this.plots.filter(plot => plot.isGrowing());
    }
    
    getEmptyPlots() {
        return this.plots.filter(plot => plot.isEmpty());
    }
    
    getAllPlotData() {
        return this.plots.map(plot => plot.getPlotData());
    }
    
    restoreFromData(plotsData) {
        if (!plotsData || plotsData.length !== this.plots.length) {
            return false;
        }
        
        plotsData.forEach((plotData, index) => {
            if (index < this.plots.length) {
                this.plots[index].restoreFromData(plotData);
            }
        });
        
        return true;
    }
    
    reset() {
        this.plots.forEach((plot, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            
            // Check if this is in the center 4x4 grid (rows 2-5, cols 2-5)
            const isStartingPlot = (row >= 2 && row <= 5 && col >= 2 && col <= 5);
            
            plot.clear();
            
            if (isStartingPlot) {
                // Keep starting plots unlocked
                plot.isLocked = false;
                plot.element.className = 'farm-plot empty';
                plot.element.innerHTML = '';
            } else {
                // Lock all other plots
                plot.isLocked = true;
                plot.element.className = 'farm-plot locked';
                plot.element.innerHTML = `
                    <div class="lock-icon">🔒</div>
                    <div class="price-tag">$100</div>
                `;
            }
            
            plot.updateDisplay();
        });
    }
    
    getGridStats() {
        return {
            total: this.size,
            empty: this.getPlotCount('empty'),
            planted: this.getPlotCount('planted'),
            growing: this.getPlotCount('growing'),
            ready: this.getPlotCount('ready'),
            harvested: this.getPlotCount('harvested')
        };
    }
    
    getNextReadyTime() {
        const growingPlots = this.getGrowingPlots();
        if (growingPlots.length === 0) return null;
        
        const times = growingPlots.map(plot => plot.getTimeRemaining());
        return Math.min(...times);
    }
    
    setPlotActionHandler(handler) {
        this.onPlotAction = handler;
    }
    
    setMessageHandler(handler) {
        this.onMessage = handler;
    }
}