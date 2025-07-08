// 🌱 Plot.js - Individual Farm Plot Management

class Plot {
    constructor(index, element, cropConfig) {
        this.index = index;
        this.element = element;
        this.cropConfig = cropConfig;
        this.crop = null;
        this.state = 'empty';
        this.isLocked = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.element.addEventListener('click', () => this.handleClick());
        this.element.addEventListener('mouseenter', () => this.handleHover(true));
        this.element.addEventListener('mouseleave', () => this.handleHover(false));
    }
    
    handleClick() {
        if (this.onPlotClick) {
            this.onPlotClick(this.index, this.isLocked ? 'locked' : this.state);
        }
    }
    
    handleHover(isHovering) {
        if (isHovering) {
            this.element.style.transform = 'translateY(-3px) scale(1.02)';
            this.element.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
            this.element.style.zIndex = '1';
            
            // Add visual hint based on current state
            this.showActionHint();
        } else {
            this.element.style.transform = '';
            this.element.style.boxShadow = '';
            this.element.style.zIndex = '';
            
            // Remove visual hint
            this.hideActionHint();
        }
    }
    
    showActionHint() {
        // Add a subtle visual indicator of what action can be performed
        let hintText = '';
        switch (this.state) {
            case 'empty':
                hintText = 'Click to plant';
                break;
            case 'planted':
                hintText = 'Click to water';
                break;
            case 'growing':
                hintText = 'Growing...';
                break;
            case 'ready':
                hintText = 'Click to harvest';
                break;
        }
        
        if (hintText && !this.element.querySelector('.action-hint')) {
            const hint = document.createElement('div');
            hint.className = 'action-hint';
            hint.textContent = hintText;
            hint.style.cssText = `
                position: absolute;
                top: -25px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 0.7rem;
                white-space: nowrap;
                pointer-events: none;
                opacity: 0;
                animation: fadeInHint 0.3s ease forwards;
            `;
            this.element.appendChild(hint);
        }
    }
    
    hideActionHint() {
        const hint = this.element.querySelector('.action-hint');
        if (hint) {
            hint.remove();
        }
    }
    
    plant(cropType) {
        if (this.state !== 'empty' || this.isLocked) return false;
        
        const config = this.cropConfig[cropType];
        if (!config) return false;
        
        this.crop = {
            type: cropType,
            status: 'planted',
            plantedAt: Date.now(),
            wateredAt: null,
            readyAt: Date.now() + config.growthTime
        };
        
        this.state = 'planted';
        this.updateDisplay();
        return true;
    }
    
    water() {
        if (!this.crop || this.crop.status === 'ready' || this.crop.status === 'harvested') {
            return false;
        }
        
        // Beautiful water animation - blue splash effect
        this.element.style.backgroundColor = '#87CEEB';
        this.element.style.border = '3px solid #4169E1';
        this.element.style.boxShadow = '0 0 20px #87CEEB';
        this.element.style.transform = 'scale(1.1)';
        this.element.style.transition = 'all 0.3s ease';
        
        // Add water droplet text
        const waterText = document.createElement('div');
        waterText.innerHTML = '💧';
        waterText.style.position = 'absolute';
        waterText.style.top = '50%';
        waterText.style.left = '50%';
        waterText.style.transform = 'translate(-50%, -50%)';
        waterText.style.fontSize = '20px';
        waterText.style.zIndex = '1000';
        waterText.style.pointerEvents = 'none';
        waterText.style.animation = 'bounce 0.6s ease-in-out';
        
        this.element.appendChild(waterText);
        
        // Reset after animation
        setTimeout(() => {
            this.element.style.backgroundColor = '';
            this.element.style.border = '';
            this.element.style.boxShadow = '';
            this.element.style.transform = '';
            this.element.style.transition = '';
            if (waterText.parentNode) {
                waterText.parentNode.removeChild(waterText);
            }
            this.updateDisplay();
        }, 800);
        
        this.crop.wateredAt = Date.now();
        this.crop.status = 'growing';
        this.state = 'growing';
        this.updateDisplay();
        return true;
    }
    
    harvest() {
        if (!this.crop || this.crop.status !== 'ready') return null;
        
        const config = this.cropConfig[this.crop.type];
        const harvestResult = {
            type: this.crop.type,
            xp: config.xpReward,
            name: config.name
        };
        
        // Auto-clear the plot after harvesting
        this.crop = null;
        this.state = 'empty';
        this.updateDisplay();
        
        return harvestResult;
    }
    
    clear() {
        this.crop = null;
        this.state = 'empty';
        // Don't change isLocked status - that's handled by the grid reset
        this.updateDisplay();
        return true;
    }
    
    checkGrowth() {
        if (!this.crop || this.crop.status !== 'growing') return false;
        
        if (Date.now() >= this.crop.readyAt) {
            this.crop.status = 'ready';
            this.state = 'ready';
            this.updateDisplay();
            return true;
        }
        
        return false;
    }
    
    updateDisplay() {
        if (this.isLocked) {
            // Don't update display for locked plots - they're handled by the grid
            return;
        }
        
        if (!this.crop) {
            this.element.className = 'farm-plot empty';
            this.element.innerHTML = '';
            return;
        }
        
        const config = this.cropConfig[this.crop.type];
        let icon, className, timer = '';
        
        switch (this.crop.status) {
            case 'planted':
                icon = config.plantedIcon;
                className = 'farm-plot planted';
                timer = '';
                break;
            case 'growing':
                icon = config.growingIcon;
                className = 'farm-plot growing';
                const timeLeft = Math.max(0, this.crop.readyAt - Date.now());
                timer = timeLeft > 0 ? `${Math.ceil(timeLeft / 1000)}s` : 'Ready!';
                break;
            case 'ready':
                icon = config.icon;
                className = 'farm-plot ready';
                timer = 'Ready!';
                break;
        }
        
        this.element.className = className;
        this.element.innerHTML = `
            <div class="crop-icon">${icon}</div>
            ${timer ? `<div class="crop-timer">${timer}</div>` : ''}
        `;
    }
    
    getTimeRemaining() {
        if (!this.crop || this.crop.status !== 'growing') return 0;
        return Math.max(0, this.crop.readyAt - Date.now());
    }
    
    isReady() {
        return this.crop && this.crop.status === 'ready';
    }
    
    isEmpty() {
        return this.state === 'empty';
    }
    
    isHarvested() {
        return this.state === 'harvested';
    }
    
    needsWater() {
        return this.crop && this.crop.status === 'planted';
    }
    
    isGrowing() {
        return this.crop && this.crop.status === 'growing';
    }
    
    getCropType() {
        return this.crop ? this.crop.type : null;
    }
    
    getPlotData() {
        return {
            index: this.index,
            state: this.state,
            crop: this.crop ? { ...this.crop } : null
        };
    }
    
    restoreFromData(plotData) {
        if (!plotData.crop) {
            this.clear();
            return;
        }
        
        this.crop = { ...plotData.crop };
        this.state = plotData.state;
        this.updateDisplay();
    }
}