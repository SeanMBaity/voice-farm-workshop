// ⏰ TimerManager.js - Advanced Game Timing System

class TimerManager {
    constructor() {
        this.timers = new Map();
        this.intervals = new Map();
        this.isActive = true;
        this.lastUpdate = Date.now();
        this.updateInterval = 1000; // Default 1 second
        this.mainInterval = null;
        
        // Track browser visibility
        this.isVisible = !document.hidden;
        this.setupVisibilityHandlers();
        
        // Performance monitoring
        this.stats = {
            totalUpdates: 0,
            averageUpdateTime: 0,
            maxUpdateTime: 0,
            lastUpdateDuration: 0
        };
        
        // Callbacks
        this.onTick = null;
        this.onVisibilityChange = null;
        this.onOfflineProgress = null;
        
        console.log('⏰ TimerManager initialized');
    }
    
    setupVisibilityHandlers() {
        document.addEventListener('visibilitychange', () => {
            const wasVisible = this.isVisible;
            this.isVisible = !document.hidden;
            
            if (!wasVisible && this.isVisible) {
                // Tab became visible - calculate offline progress
                this.handleTabVisible();
            } else if (wasVisible && !this.isVisible) {
                // Tab became hidden
                this.handleTabHidden();
            }
            
            if (this.onVisibilityChange) {
                this.onVisibilityChange(this.isVisible, wasVisible);
            }
        });
        
        // Handle page focus/blur for additional reliability
        window.addEventListener('focus', () => {
            if (!this.isVisible) {
                this.isVisible = true;
                this.handleTabVisible();
            }
        });
        
        window.addEventListener('blur', () => {
            this.handleTabHidden();
        });
    }
    
    handleTabVisible() {
        const now = Date.now();
        const offlineTime = now - this.lastUpdate;
        
        console.log(`⏰ Tab visible after ${Math.floor(offlineTime / 1000)}s offline`);
        
        if (offlineTime > 5000) { // More than 5 seconds offline
            this.calculateOfflineProgress(offlineTime);
        }
        
        this.lastUpdate = now;
        this.resume();
    }
    
    handleTabHidden() {
        console.log('⏰ Tab hidden, pausing active timers');
        this.lastUpdate = Date.now();
        // Don't pause - let timers continue in background
    }
    
    calculateOfflineProgress(offlineTime) {
        if (this.onOfflineProgress) {
            this.onOfflineProgress(offlineTime);
        }
        
        // Update all existing timers with offline progress
        for (const [id, timer] of this.timers) {
            if (timer.type === 'countdown' && timer.isActive) {
                timer.elapsed += offlineTime;
                
                if (timer.elapsed >= timer.duration) {
                    // Timer completed while offline
                    timer.elapsed = timer.duration;
                    timer.isActive = false;
                    timer.isCompleted = true;
                    
                    if (timer.onComplete) {
                        try {
                            timer.onComplete(timer);
                        } catch (error) {
                            console.error(`Timer ${id} completion callback failed:`, error);
                        }
                    }
                }
            }
        }
    }
    
    start() {
        if (this.mainInterval) {
            this.stop();
        }
        
        this.isActive = true;
        this.lastUpdate = Date.now();
        
        this.mainInterval = setInterval(() => {
            this.update();
        }, this.updateInterval);
        
        console.log('⏰ TimerManager started');
    }
    
    stop() {
        this.isActive = false;
        
        if (this.mainInterval) {
            clearInterval(this.mainInterval);
            this.mainInterval = null;
        }
        
        // Clear all individual intervals
        for (const interval of this.intervals.values()) {
            clearInterval(interval);
        }
        this.intervals.clear();
        
        console.log('⏰ TimerManager stopped');
    }
    
    pause() {
        this.isActive = false;
        console.log('⏰ TimerManager paused');
    }
    
    resume() {
        this.isActive = true;
        this.lastUpdate = Date.now();
        console.log('⏰ TimerManager resumed');
    }
    
    update() {
        if (!this.isActive) return;
        
        const updateStart = performance.now();
        const now = Date.now();
        const deltaTime = now - this.lastUpdate;
        
        // Update all active timers
        let completedTimers = [];
        
        for (const [id, timer] of this.timers) {
            if (timer.isActive) {
                this.updateTimer(timer, deltaTime);
                
                if (timer.isCompleted) {
                    completedTimers.push(id);
                }
            }
        }
        
        // Clean up completed timers
        for (const id of completedTimers) {
            const timer = this.timers.get(id);
            if (timer.autoRemove) {
                this.removeTimer(id);
            }
        }
        
        // Call main tick callback
        if (this.onTick) {
            this.onTick(deltaTime, now);
        }
        
        this.lastUpdate = now;
        
        // Update performance stats
        const updateDuration = performance.now() - updateStart;
        this.updateStats(updateDuration);
    }
    
    updateTimer(timer, deltaTime) {
        switch (timer.type) {
            case 'countdown':
                timer.elapsed += deltaTime;
                timer.remaining = Math.max(0, timer.duration - timer.elapsed);
                
                if (timer.elapsed >= timer.duration && !timer.isCompleted) {
                    timer.isCompleted = true;
                    timer.isActive = false;
                    
                    if (timer.onComplete) {
                        try {
                            timer.onComplete(timer);
                        } catch (error) {
                            console.error(`Timer ${timer.id} completion callback failed:`, error);
                        }
                    }
                }
                break;
                
            case 'interval':
                timer.elapsed += deltaTime;
                
                if (timer.elapsed >= timer.interval) {
                    timer.elapsed = 0;
                    timer.ticks++;
                    
                    if (timer.onTick) {
                        try {
                            timer.onTick(timer);
                        } catch (error) {
                            console.error(`Timer ${timer.id} tick callback failed:`, error);
                        }
                    }
                    
                    if (timer.maxTicks && timer.ticks >= timer.maxTicks) {
                        timer.isCompleted = true;
                        timer.isActive = false;
                        
                        if (timer.onComplete) {
                            try {
                                timer.onComplete(timer);
                            } catch (error) {
                                console.error(`Timer ${timer.id} completion callback failed:`, error);
                            }
                        }
                    }
                }
                break;
                
            case 'stopwatch':
                timer.elapsed += deltaTime;
                break;
        }
        
        // Call update callback
        if (timer.onUpdate && timer.isActive) {
            try {
                timer.onUpdate(timer, deltaTime);
            } catch (error) {
                console.error(`Timer ${timer.id} update callback failed:`, error);
            }
        }
    }
    
    createTimer(id, type, options = {}) {
        if (this.timers.has(id)) {
            console.warn(`Timer ${id} already exists, removing old timer`);
            this.removeTimer(id);
        }
        
        const timer = {
            id,
            type,
            createdAt: Date.now(),
            elapsed: 0,
            isActive: true,
            isCompleted: false,
            autoRemove: options.autoRemove !== false,
            ...options
        };
        
        switch (type) {
            case 'countdown':
                timer.duration = options.duration || 1000;
                timer.remaining = timer.duration;
                break;
                
            case 'interval':
                timer.interval = options.interval || 1000;
                timer.ticks = 0;
                timer.maxTicks = options.maxTicks || null;
                break;
                
            case 'stopwatch':
                // No additional setup needed
                break;
                
            default:
                throw new Error(`Unknown timer type: ${type}`);
        }
        
        this.timers.set(id, timer);
        console.log(`⏰ Created ${type} timer: ${id}`);
        
        return timer;
    }
    
    removeTimer(id) {
        const timer = this.timers.get(id);
        if (timer) {
            timer.isActive = false;
            this.timers.delete(id);
            console.log(`⏰ Removed timer: ${id}`);
            return true;
        }
        return false;
    }
    
    getTimer(id) {
        return this.timers.get(id);
    }
    
    hasTimer(id) {
        return this.timers.has(id);
    }
    
    pauseTimer(id) {
        const timer = this.timers.get(id);
        if (timer) {
            timer.isActive = false;
            return true;
        }
        return false;
    }
    
    resumeTimer(id) {
        const timer = this.timers.get(id);
        if (timer && !timer.isCompleted) {
            timer.isActive = true;
            return true;
        }
        return false;
    }
    
    resetTimer(id) {
        const timer = this.timers.get(id);
        if (timer) {
            timer.elapsed = 0;
            timer.isCompleted = false;
            timer.isActive = true;
            
            if (timer.type === 'countdown') {
                timer.remaining = timer.duration;
            } else if (timer.type === 'interval') {
                timer.ticks = 0;
            }
            
            return true;
        }
        return false;
    }
    
    getActiveTimers() {
        return Array.from(this.timers.values()).filter(timer => timer.isActive);
    }
    
    getCompletedTimers() {
        return Array.from(this.timers.values()).filter(timer => timer.isCompleted);
    }
    
    getAllTimers() {
        return Array.from(this.timers.values());
    }
    
    clearCompletedTimers() {
        const completed = this.getCompletedTimers();
        for (const timer of completed) {
            this.removeTimer(timer.id);
        }
        return completed.length;
    }
    
    clearAllTimers() {
        const count = this.timers.size;
        this.timers.clear();
        console.log(`⏰ Cleared ${count} timers`);
        return count;
    }
    
    updateStats(updateDuration) {
        this.stats.totalUpdates++;
        this.stats.lastUpdateDuration = updateDuration;
        this.stats.maxUpdateTime = Math.max(this.stats.maxUpdateTime, updateDuration);
        
        // Calculate rolling average
        const alpha = 0.1; // Smoothing factor
        this.stats.averageUpdateTime = this.stats.averageUpdateTime * (1 - alpha) + updateDuration * alpha;
    }
    
    getStats() {
        return {
            ...this.stats,
            activeTimers: this.getActiveTimers().length,
            totalTimers: this.timers.size,
            isActive: this.isActive,
            isVisible: this.isVisible,
            updateInterval: this.updateInterval
        };
    }
    
    // Convenience methods for common timer patterns
    setTimeout(callback, delay, id = null) {
        const timerId = id || `timeout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return this.createTimer(timerId, 'countdown', {
            duration: delay,
            onComplete: callback,
            autoRemove: true
        });
    }
    
    setInterval(callback, interval, maxTicks = null, id = null) {
        const timerId = id || `interval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return this.createTimer(timerId, 'interval', {
            interval,
            maxTicks,
            onTick: callback,
            autoRemove: maxTicks ? true : false
        });
    }
    
    createStopwatch(id = null) {
        const timerId = id || `stopwatch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return this.createTimer(timerId, 'stopwatch', {
            autoRemove: false
        });
    }
    
    // Event handlers
    setTickHandler(handler) {
        this.onTick = handler;
    }
    
    setVisibilityHandler(handler) {
        this.onVisibilityChange = handler;
    }
    
    setOfflineProgressHandler(handler) {
        this.onOfflineProgress = handler;
    }
    
    // Export/import for persistence
    exportTimers() {
        const timerData = [];
        
        for (const timer of this.timers.values()) {
            timerData.push({
                id: timer.id,
                type: timer.type,
                elapsed: timer.elapsed,
                createdAt: timer.createdAt,
                isActive: timer.isActive,
                isCompleted: timer.isCompleted,
                duration: timer.duration,
                interval: timer.interval,
                maxTicks: timer.maxTicks,
                ticks: timer.ticks || 0
            });
        }
        
        return {
            timers: timerData,
            lastUpdate: this.lastUpdate,
            stats: this.stats
        };
    }
    
    importTimers(data) {
        if (!data || !data.timers) return false;
        
        this.clearAllTimers();
        
        const now = Date.now();
        const offlineTime = now - (data.lastUpdate || now);
        
        for (const timerData of data.timers) {
            const timer = {
                ...timerData,
                onComplete: null,
                onTick: null,
                onUpdate: null,
                autoRemove: false
            };
            
            // Apply offline progress
            if (timer.isActive && !timer.isCompleted && offlineTime > 0) {
                timer.elapsed += offlineTime;
                
                if (timer.type === 'countdown' && timer.elapsed >= timer.duration) {
                    timer.elapsed = timer.duration;
                    timer.isCompleted = true;
                    timer.isActive = false;
                }
            }
            
            this.timers.set(timer.id, timer);
        }
        
        if (data.stats) {
            this.stats = { ...this.stats, ...data.stats };
        }
        
        console.log(`⏰ Imported ${data.timers.length} timers with ${Math.floor(offlineTime / 1000)}s offline progress`);
        return true;
    }
}