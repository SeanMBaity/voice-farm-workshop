// ✨ UIPolish.js - Final UI Enhancements and Polish

class UIPolish {
    constructor(game) {
        this.game = game;
        this.animations = new Map();
        this.soundEffects = new Map();
        this.particles = [];
        this.isInitialized = false;
        
        // Polish configuration
        this.config = {
            enableParticles: true,
            enableAnimations: true,
            enableSoundEffects: false, // Disabled for demo
            enableTooltips: true,
            enableProgressBars: true,
            animationSpeed: 'normal', // slow, normal, fast
            particleCount: 10
        };
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        this.setupAnimations();
        this.setupTooltips();
        this.setupProgressBars();
        this.setupVisualEffects();
        this.setupAccessibility();
        this.setupKeyboardNavigation();
        
        this.isInitialized = true;
        console.log('✨ UIPolish initialized');
    }
    
    setupAnimations() {
        // Add loading animations
        this.addLoadingSpinner();
        
        // Add hover animations for buttons
        this.enhanceButtonAnimations();
        
        // Add plot interaction animations
        this.enhancePlotAnimations();
        
        // Add resource counter animations
        this.enhanceResourceAnimations();
    }
    
    addLoadingSpinner() {
        const style = document.createElement('style');
        style.textContent = `
            .loading-spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #228B22;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-left: 10px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .fade-in {
                animation: fadeIn 0.5s ease-in;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .scale-in {
                animation: scaleIn 0.3s ease-out;
            }
            
            @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            .slide-in-right {
                animation: slideInRight 0.4s ease-out;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .bounce-in {
                animation: bounceIn 0.6s ease-out;
            }
            
            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .shake {
                animation: shake 0.5s ease-in-out;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            .pulse-success {
                animation: pulseSuccess 0.6s ease-in-out;
            }
            
            @keyframes pulseSuccess {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 139, 34, 0.7); }
                70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(34, 139, 34, 0); }
                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 139, 34, 0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    enhanceButtonAnimations() {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRippleEffect(e.target, e);
                e.target.classList.add('scale-in');
                setTimeout(() => e.target.classList.remove('scale-in'), 300);
            });
        });
    }
    
    enhancePlotAnimations() {
        // Enhanced plot hover effects
        const style = document.createElement('style');
        style.textContent = `
            .farm-plot {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .farm-plot:hover {
                transform: translateY(-5px) scale(1.05);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                z-index: 10;
            }
            
            .farm-plot.planted {
                animation: plantGrow 0.8s ease-out;
            }
            
            @keyframes plantGrow {
                0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
                50% { transform: scale(1.2) rotate(5deg); }
                100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            
            .farm-plot.watered {
                animation: waterSplash 0.6s ease-out;
            }
            
            @keyframes waterSplash {
                0% { background-color: inherit; }
                50% { background-color: rgba(135, 206, 235, 0.3); transform: scale(1.1); }
                100% { background-color: inherit; transform: scale(1); }
            }
            
            .farm-plot.harvested {
                animation: harvestPop 0.5s ease-out;
            }
            
            @keyframes harvestPop {
                0% { transform: scale(1); }
                50% { transform: scale(1.3) rotate(15deg); }
                100% { transform: scale(1) rotate(0deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    enhanceResourceAnimations() {
        // Animate resource changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const target = mutation.target.nodeType === Node.TEXT_NODE ? 
                        mutation.target.parentElement : mutation.target;
                    
                    if (target && target.classList.contains('stat-value')) {
                        this.animateResourceChange(target);
                    }
                }
            });
        });
        
        document.querySelectorAll('.stat-value').forEach(element => {
            observer.observe(element, { 
                childList: true, 
                characterData: true, 
                subtree: true 
            });
        });
    }
    
    animateResourceChange(element) {
        element.classList.add('pulse-success');
        setTimeout(() => element.classList.remove('pulse-success'), 600);
        
        // Add floating number effect
        const value = element.textContent;
        const rect = element.getBoundingClientRect();
        this.createFloatingNumber(rect.left, rect.top, `+${value}`, '#228B22');
    }
    
    setupTooltips() {
        if (!this.config.enableTooltips) return;
        
        // Add tooltip styles
        const style = document.createElement('style');
        style.textContent = `
            .tooltip {
                position: absolute;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                pointer-events: none;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
                max-width: 200px;
                text-align: center;
            }
            
            .tooltip.show {
                opacity: 1;
            }
            
            .tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -5px;
                border: 5px solid transparent;
                border-top-color: rgba(0, 0, 0, 0.9);
            }
        `;
        document.head.appendChild(style);
        
        // Add tooltips to interactive elements
        this.addTooltip('.crop-btn', 'Click to select this crop for planting');
        this.addTooltip('#water-all-btn', 'Water all planted crops at once');
        this.addTooltip('#harvest-all-btn', 'Harvest all ready crops at once');
        this.addTooltip('#clear-farm-btn', 'Clear all harvested plots');
        this.addTooltip('#save-game-btn', 'Manually save your game progress');
        this.addTooltip('.farm-plot.empty', 'Click to plant selected crop');
        this.addTooltip('.farm-plot.planted', 'Click to water this crop');
        this.addTooltip('.farm-plot.ready', 'Click to harvest this crop');
    }
    
    addTooltip(selector, text) {
        document.querySelectorAll(selector).forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltip = this.createTooltip(text);
                const rect = e.target.getBoundingClientRect();
                
                tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
                tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
                
                setTimeout(() => tooltip.classList.add('show'), 10);
            });
            
            element.addEventListener('mouseleave', () => {
                document.querySelectorAll('.tooltip').forEach(t => t.remove());
            });
        });
    }
    
    createTooltip(text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
        return tooltip;
    }
    
    setupProgressBars() {
        if (!this.config.enableProgressBars) return;
        
        // Add XP progress bar
        this.addXPProgressBar();
        
        // Add crop growth progress indicators
        this.addCropProgressIndicators();
    }
    
    addXPProgressBar() {
        const xpContainer = document.querySelector('#player-xp').parentElement;
        const progressBar = document.createElement('div');
        progressBar.className = 'xp-progress-container';
        progressBar.innerHTML = `
            <div class="xp-progress-bar">
                <div class="xp-progress-fill"></div>
            </div>
            <div class="xp-progress-text"></div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .xp-progress-container {
                margin-top: 5px;
            }
            
            .xp-progress-bar {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 3px;
                overflow: hidden;
            }
            
            .xp-progress-fill {
                height: 100%;
                background: linear-gradient(45deg, #228B22, #32CD32);
                border-radius: 3px;
                transition: width 0.5s ease;
                width: 0%;
            }
            
            .xp-progress-text {
                font-size: 10px;
                color: #666;
                text-align: center;
                margin-top: 2px;
            }
        `;
        document.head.appendChild(style);
        
        xpContainer.appendChild(progressBar);
        
        // Update progress bar
        this.updateXPProgressBar();
    }
    
    updateXPProgressBar() {
        const progress = this.game.resourceManager.getXPProgress();
        const progressFill = document.querySelector('.xp-progress-fill');
        const progressText = document.querySelector('.xp-progress-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${progress.percentage}%`;
            progressText.textContent = `${progress.current}/${progress.max} XP to next level`;
        }
    }
    
    addCropProgressIndicators() {
        // This will be called when plots are updated
        setInterval(() => {
            document.querySelectorAll('.farm-plot.growing').forEach(plot => {
                this.updateCropProgress(plot);
            });
        }, 1000);
    }
    
    updateCropProgress(plotElement) {
        const plotIndex = parseInt(plotElement.dataset.plotIndex);
        const farmGrid = this.game.farmGrid;
        const plot = farmGrid.plots[plotIndex];
        
        if (plot && plot.isGrowing()) {
            const timeRemaining = plot.getTimeRemaining();
            const cropType = plot.getCropType();
            const crop = this.game.cropManager.getCropDefinition(cropType);
            
            if (crop) {
                const progress = ((crop.growthTime - timeRemaining) / crop.growthTime) * 100;
                
                let progressBar = plotElement.querySelector('.crop-progress');
                if (!progressBar) {
                    progressBar = document.createElement('div');
                    progressBar.className = 'crop-progress';
                    progressBar.innerHTML = '<div class="crop-progress-fill"></div>';
                    plotElement.appendChild(progressBar);
                    
                    // Add styles if not already added
                    if (!document.querySelector('#crop-progress-styles')) {
                        const style = document.createElement('style');
                        style.id = 'crop-progress-styles';
                        style.textContent = `
                            .crop-progress {
                                position: absolute;
                                bottom: 2px;
                                left: 4px;
                                right: 4px;
                                height: 3px;
                                background: rgba(255, 255, 255, 0.3);
                                border-radius: 2px;
                                overflow: hidden;
                            }
                            
                            .crop-progress-fill {
                                height: 100%;
                                background: linear-gradient(45deg, #32CD32, #228B22);
                                border-radius: 2px;
                                transition: width 0.3s ease;
                                width: 0%;
                            }
                        `;
                        document.head.appendChild(style);
                    }
                }
                
                const progressFill = progressBar.querySelector('.crop-progress-fill');
                if (progressFill) {
                    progressFill.style.width = `${Math.max(0, Math.min(100, progress))}%`;
                }
            }
        }
    }
    
    setupVisualEffects() {
        if (!this.config.enableParticles) return;
        
        // Create particle container
        const particleContainer = document.createElement('div');
        particleContainer.id = 'particle-container';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999;
        `;
        document.body.appendChild(particleContainer);
        
        // Start particle animation loop
        this.startParticleLoop();
    }
    
    createParticleEffect(x, y, type = 'success') {
        if (!this.config.enableParticles) return;
        
        const colors = {
            success: ['#228B22', '#32CD32', '#90EE90'],
            water: ['#87CEEB', '#4682B4', '#1E90FF'],
            harvest: ['#FFD700', '#FFA500', '#FF8C00'],
            plant: ['#8FBC8F', '#228B22', '#32CD32']
        };
        
        const particleColors = colors[type] || colors.success;
        
        for (let i = 0; i < this.config.particleCount; i++) {
            this.createParticle(x, y, particleColors[Math.floor(Math.random() * particleColors.length)]);
        }
    }
    
    createParticle(x, y, color) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: ${color};
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
        `;
        
        const container = document.getElementById('particle-container');
        if (container) {
            container.appendChild(particle);
            
            // Animate particle
            const angle = Math.random() * Math.PI * 2;
            const velocity = 50 + Math.random() * 100;
            const gravity = 200;
            const lifetime = 1000 + Math.random() * 500;
            
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = elapsed / lifetime;
                
                if (progress >= 1) {
                    particle.remove();
                    return;
                }
                
                const newX = x + Math.cos(angle) * velocity * (elapsed / 1000);
                const newY = y + Math.sin(angle) * velocity * (elapsed / 1000) + 0.5 * gravity * Math.pow(elapsed / 1000, 2);
                
                particle.style.left = `${newX}px`;
                particle.style.top = `${newY}px`;
                particle.style.opacity = 1 - progress;
                
                requestAnimationFrame(animate);
            };
            
            requestAnimationFrame(animate);
        }
    }
    
    startParticleLoop() {
        // Clean up old particles periodically
        setInterval(() => {
            const container = document.getElementById('particle-container');
            if (container && container.children.length > 100) {
                // Remove oldest particles
                const children = Array.from(container.children);
                children.slice(0, 50).forEach(child => child.remove());
            }
        }, 5000);
    }
    
    createFloatingNumber(x, y, text, color = '#228B22') {
        const element = document.createElement('div');
        element.textContent = text;
        element.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-weight: bold;
            font-size: 14px;
            pointer-events: none;
            z-index: 1000;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        `;
        
        document.body.appendChild(element);
        
        // Animate upward float
        element.animate([
            { transform: 'translateY(0px)', opacity: 1 },
            { transform: 'translateY(-30px)', opacity: 0 }
        ], {
            duration: 1500,
            easing: 'ease-out'
        }).onfinish = () => element.remove();
    }
    
    createRippleEffect(element, event) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            transform: scale(0);
            z-index: 1;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        ripple.animate([
            { transform: 'scale(0)', opacity: 1 },
            { transform: 'scale(2)', opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => ripple.remove();
    }
    
    setupAccessibility() {
        // Add ARIA labels
        document.querySelectorAll('.farm-plot').forEach((plot, index) => {
            plot.setAttribute('role', 'button');
            plot.setAttribute('aria-label', `Farm plot ${index + 1}`);
            plot.setAttribute('tabindex', '0');
        });
        
        document.querySelectorAll('.crop-btn').forEach(btn => {
            btn.setAttribute('role', 'button');
            const cropName = btn.textContent.split('\n')[0];
            btn.setAttribute('aria-label', `Select ${cropName} for planting`);
        });
        
        // Add focus indicators
        const style = document.createElement('style');
        style.textContent = `
            .farm-plot:focus {
                outline: 3px solid #4A90E2;
                outline-offset: 2px;
            }
            
            .crop-btn:focus {
                outline: 3px solid #4A90E2;
                outline-offset: 2px;
            }
            
            button:focus {
                outline: 3px solid #4A90E2;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                // Ensure proper tab order
                this.handleTabNavigation(e);
            } else if (e.key === 'Enter' || e.key === ' ') {
                // Activate focused element
                if (document.activeElement.classList.contains('farm-plot') || 
                    document.activeElement.classList.contains('crop-btn')) {
                    e.preventDefault();
                    document.activeElement.click();
                }
            }
        });
    }
    
    handleTabNavigation(event) {
        // Custom tab order: crop buttons -> farm plots -> action buttons
        const tabbableElements = [
            ...document.querySelectorAll('.crop-btn'),
            ...document.querySelectorAll('.farm-plot'),
            ...document.querySelectorAll('.action-btn')
        ].filter(el => !el.disabled && !el.classList.contains('disabled'));
        
        const currentIndex = tabbableElements.indexOf(document.activeElement);
        
        if (event.shiftKey) {
            // Shift+Tab (backward)
            const nextIndex = currentIndex <= 0 ? tabbableElements.length - 1 : currentIndex - 1;
            tabbableElements[nextIndex].focus();
        } else {
            // Tab (forward)
            const nextIndex = currentIndex >= tabbableElements.length - 1 ? 0 : currentIndex + 1;
            tabbableElements[nextIndex].focus();
        }
        
        event.preventDefault();
    }
    
    // Public API for triggering effects
    triggerPlantEffect(plotElement) {
        plotElement.classList.add('planted');
        const rect = plotElement.getBoundingClientRect();
        this.createParticleEffect(
            rect.left + rect.width / 2, 
            rect.top + rect.height / 2, 
            'plant'
        );
    }
    
    triggerWaterEffect(plotElement) {
        plotElement.classList.add('watered');
        setTimeout(() => plotElement.classList.remove('watered'), 600);
        
        const rect = plotElement.getBoundingClientRect();
        this.createParticleEffect(
            rect.left + rect.width / 2, 
            rect.top + rect.height / 2, 
            'water'
        );
    }
    
    triggerHarvestEffect(plotElement, value) {
        plotElement.classList.add('harvested');
        setTimeout(() => plotElement.classList.remove('harvested'), 500);
        
        const rect = plotElement.getBoundingClientRect();
        this.createParticleEffect(
            rect.left + rect.width / 2, 
            rect.top + rect.height / 2, 
            'harvest'
        );
        
        this.createFloatingNumber(
            rect.left + rect.width / 2, 
            rect.top, 
            `+${value} coins`, 
            '#FFD700'
        );
    }
    
    triggerLevelUpEffect() {
        // Screen flash effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
            pointer-events: none;
            z-index: 999;
        `;
        
        document.body.appendChild(flash);
        
        flash.animate([
            { opacity: 0 },
            { opacity: 1 },
            { opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-in-out'
        }).onfinish = () => flash.remove();
        
        // Update XP progress bar
        setTimeout(() => this.updateXPProgressBar(), 100);
    }
    
    // Utility methods
    enableFeature(feature) {
        this.config[feature] = true;
        console.log(`✨ UIPolish: ${feature} enabled`);
    }
    
    disableFeature(feature) {
        this.config[feature] = false;
        console.log(`✨ UIPolish: ${feature} disabled`);
    }
    
    setAnimationSpeed(speed) {
        this.config.animationSpeed = speed;
        const multiplier = speed === 'slow' ? 2 : speed === 'fast' ? 0.5 : 1;
        
        document.documentElement.style.setProperty('--animation-speed', `${multiplier}`);
    }
    
    destroy() {
        // Clean up
        document.getElementById('particle-container')?.remove();
        document.querySelectorAll('.tooltip').forEach(t => t.remove());
        console.log('✨ UIPolish destroyed');
    }
}

// Auto-initialize when game is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.voiceFarmGame) {
            window.uiPolish = new UIPolish(window.voiceFarmGame);
            console.log('✨ UIPolish auto-initialized');
        }
    }, 1000);
});

console.log('✨ UIPolish loaded');