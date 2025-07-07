// 🔓 UnlockSystem.js - Advanced Progression and Unlock Management

class UnlockSystem {
    constructor(cropManager, resourceManager) {
        this.cropManager = cropManager;
        this.resourceManager = resourceManager;
        
        // Unlock conditions and requirements
        this.unlockConditions = {
            level: {},
            achievements: {},
            special: {}
        };
        
        // Achievement tracking
        this.achievements = new Map();
        this.progressTracking = new Map();
        
        // Unlock notifications
        this.notificationQueue = [];
        this.onUnlockCallbacks = [];
        
        this.initializeUnlockConditions();
        this.initializeAchievements();
    }
    
    // === INITIALIZATION ===
    
    initializeUnlockConditions() {
        // Level-based unlocks (existing system)
        this.unlockConditions.level = {
            1: ['wheat', 'tomatoes', 'carrots', 'lettuce'],  // Starter crops
            2: ['strawberries'],                              // Sweet profit
            3: ['corn'],                                      // Staple crop
            4: ['sunflowers'],                                // Decorative value
            5: ['pumpkins']                                   // Premium crop
        };
        
        // Achievement-based unlocks
        this.unlockConditions.achievements = {
            'green_thumb': {
                description: 'Harvest 100 crops total',
                reward: 'masterGardener',
                requirement: { type: 'harvest_count', value: 100 }
            },
            'efficient_farmer': {
                description: 'Earn 1000 coins in profit',
                reward: 'speedSeeds',
                requirement: { type: 'total_profit', value: 1000 }
            },
            'crop_master': {
                description: 'Grow all available crop types',
                reward: 'rarityBonus',
                requirement: { type: 'unique_crops', value: 8 }
            },
            'speed_demon': {
                description: 'Harvest 10 crops in under 2 minutes',
                reward: 'quickGrowth',
                requirement: { type: 'speed_harvest', value: 10, timeLimit: 120000 }
            }
        };
        
        // Special unlock conditions
        this.unlockConditions.special = {
            'golden_seeds': {
                description: 'Plant 50 crops without any failing',
                reward: 'goldenVariant',
                requirement: { type: 'perfect_streak', value: 50 }
            },
            'night_farmer': {
                description: 'Farm for 30 minutes continuously',
                reward: 'moonlightCrops',
                requirement: { type: 'continuous_play', value: 1800000 } // 30 minutes
            }
        };
    }
    
    initializeAchievements() {
        // Initialize progress tracking for achievements
        this.progressTracking.set('harvest_count', 0);
        this.progressTracking.set('total_profit', 0);
        this.progressTracking.set('unique_crops', new Set());
        this.progressTracking.set('speed_harvest', { count: 0, startTime: null, active: false });
        this.progressTracking.set('perfect_streak', 0);
        this.progressTracking.set('continuous_play', { startTime: Date.now(), lastAction: Date.now() });
        
        // Load saved progress
        this.loadProgress();
    }
    
    // === UNLOCK CHECKING ===
    
    checkUnlocks(playerLevel, forceCheck = false) {
        const unlocked = [];
        
        // Check level-based unlocks
        const levelUnlocks = this.checkLevelUnlocks(playerLevel);
        unlocked.push(...levelUnlocks);
        
        // Check achievement unlocks
        const achievementUnlocks = this.checkAchievementUnlocks();
        unlocked.push(...achievementUnlocks);
        
        // Check special unlocks
        const specialUnlocks = this.checkSpecialUnlocks();
        unlocked.push(...specialUnlocks);
        
        // Process unlocks
        if (unlocked.length > 0) {
            this.processUnlocks(unlocked);
        }
        
        return unlocked;
    }
    
    checkLevelUnlocks(playerLevel) {
        const unlocked = [];
        const levelCrops = this.unlockConditions.level[playerLevel] || [];
        
        levelCrops.forEach(cropId => {
            if (!this.isCropUnlocked(cropId)) {
                unlocked.push({
                    type: 'crop',
                    id: cropId,
                    name: this.cropManager.getCropDefinition(cropId)?.name || cropId,
                    source: 'level',
                    level: playerLevel
                });
            }
        });
        
        return unlocked;
    }
    
    checkAchievementUnlocks() {
        const unlocked = [];
        
        Object.entries(this.unlockConditions.achievements).forEach(([achievementId, achievement]) => {
            if (!this.achievements.has(achievementId) && this.isAchievementCompleted(achievement)) {
                this.achievements.set(achievementId, {
                    completedAt: Date.now(),
                    ...achievement
                });
                
                unlocked.push({
                    type: 'achievement',
                    id: achievementId,
                    name: achievement.description,
                    reward: achievement.reward,
                    source: 'achievement'
                });
            }
        });
        
        return unlocked;
    }
    
    checkSpecialUnlocks() {
        const unlocked = [];
        
        Object.entries(this.unlockConditions.special).forEach(([specialId, special]) => {
            if (!this.achievements.has(specialId) && this.isSpecialConditionMet(special)) {
                this.achievements.set(specialId, {
                    completedAt: Date.now(),
                    ...special
                });
                
                unlocked.push({
                    type: 'special',
                    id: specialId,
                    name: special.description,
                    reward: special.reward,
                    source: 'special'
                });
            }
        });
        
        return unlocked;
    }
    
    // === ACHIEVEMENT VALIDATION ===
    
    isAchievementCompleted(achievement) {
        const req = achievement.requirement;
        
        switch (req.type) {
            case 'harvest_count':
                return this.progressTracking.get('harvest_count') >= req.value;
                
            case 'total_profit':
                return this.progressTracking.get('total_profit') >= req.value;
                
            case 'unique_crops':
                return this.progressTracking.get('unique_crops').size >= req.value;
                
            case 'speed_harvest':
                const speedData = this.progressTracking.get('speed_harvest');
                return speedData.count >= req.value && 
                       speedData.active &&
                       (Date.now() - speedData.startTime) <= req.timeLimit;
                       
            default:
                return false;
        }
    }
    
    isSpecialConditionMet(special) {
        const req = special.requirement;
        
        switch (req.type) {
            case 'perfect_streak':
                return this.progressTracking.get('perfect_streak') >= req.value;
                
            case 'continuous_play':
                const playData = this.progressTracking.get('continuous_play');
                const playTime = playData.lastAction - playData.startTime;
                return playTime >= req.value;
                
            default:
                return false;
        }
    }
    
    // === PROGRESS TRACKING ===
    
    trackHarvest(cropType, profit) {
        // Update harvest count
        const currentCount = this.progressTracking.get('harvest_count');
        this.progressTracking.set('harvest_count', currentCount + 1);
        
        // Update total profit
        const currentProfit = this.progressTracking.get('total_profit');
        this.progressTracking.set('total_profit', currentProfit + profit);
        
        // Update unique crops
        const uniqueCrops = this.progressTracking.get('unique_crops');
        uniqueCrops.add(cropType);
        
        // Update speed harvest tracking
        this.updateSpeedHarvest();
        
        // Update continuous play
        this.updateContinuousPlay();
        
        // Save progress
        this.saveProgress();
        
        // Check for new unlocks
        this.checkUnlocks(this.resourceManager.getResource('level'));
    }
    
    trackPlanting(cropType, success) {
        if (success) {
            // Update perfect streak
            const currentStreak = this.progressTracking.get('perfect_streak');
            this.progressTracking.set('perfect_streak', currentStreak + 1);
        } else {
            // Reset perfect streak
            this.progressTracking.set('perfect_streak', 0);
        }
        
        // Update continuous play
        this.updateContinuousPlay();
        
        this.saveProgress();
    }
    
    updateSpeedHarvest() {
        const speedData = this.progressTracking.get('speed_harvest');
        const now = Date.now();
        
        if (!speedData.active) {
            // Start new speed harvest window
            speedData.startTime = now;
            speedData.count = 1;
            speedData.active = true;
        } else {
            // Check if still within time limit
            if (now - speedData.startTime <= 120000) { // 2 minutes
                speedData.count++;
            } else {
                // Time expired, restart
                speedData.startTime = now;
                speedData.count = 1;
            }
        }
        
        this.progressTracking.set('speed_harvest', speedData);
    }
    
    updateContinuousPlay() {
        const playData = this.progressTracking.get('continuous_play');
        const now = Date.now();
        
        // If more than 5 minutes of inactivity, reset
        if (now - playData.lastAction > 300000) { // 5 minutes
            playData.startTime = now;
        }
        
        playData.lastAction = now;
        this.progressTracking.set('continuous_play', playData);
    }
    
    // === UNLOCK PROCESSING ===
    
    processUnlocks(unlocks) {
        unlocks.forEach(unlock => {
            // Add to notification queue
            this.notificationQueue.push({
                ...unlock,
                timestamp: Date.now(),
                shown: false
            });
            
            // Apply unlock effects
            this.applyUnlockEffects(unlock);
            
            // Trigger callbacks
            this.onUnlockCallbacks.forEach(callback => {
                try {
                    callback(unlock);
                } catch (error) {
                    console.error('Unlock callback error:', error);
                }
            });
        });
        
        // Save unlocks
        this.saveProgress();
    }
    
    applyUnlockEffects(unlock) {
        switch (unlock.type) {
            case 'crop':
                // Crop is automatically available through level system
                break;
                
            case 'achievement':
            case 'special':
                // Apply reward effects
                this.applyReward(unlock.reward);
                break;
        }
    }
    
    applyReward(rewardId) {
        switch (rewardId) {
            case 'masterGardener':
                // 10% XP bonus for future harvests
                this.addPermanentBonus('xp_multiplier', 1.1);
                break;
                
            case 'speedSeeds':
                // 20% faster growth for all crops
                this.addPermanentBonus('growth_speed', 0.8);
                break;
                
            case 'rarityBonus':
                // Higher chance of bonus rewards
                this.addPermanentBonus('bonus_chance', 0.15);
                break;
                
            case 'quickGrowth':
                // Next 10 crops grow 50% faster
                this.addTemporaryBonus('quick_growth', { remaining: 10, multiplier: 0.5 });
                break;
                
            case 'goldenVariant':
                // Unlock golden crop variants (cosmetic)
                this.addPermanentBonus('golden_crops', true);
                break;
                
            case 'moonlightCrops':
                // Unlock special night-time crop variants
                this.addPermanentBonus('moonlight_crops', true);
                break;
        }
    }
    
    // === BONUS SYSTEM ===
    
    addPermanentBonus(type, value) {
        const bonuses = this.getStoredBonuses();
        bonuses.permanent[type] = value;
        localStorage.setItem('unlockBonuses', JSON.stringify(bonuses));
    }
    
    addTemporaryBonus(type, data) {
        const bonuses = this.getStoredBonuses();
        bonuses.temporary[type] = { ...data, addedAt: Date.now() };
        localStorage.setItem('unlockBonuses', JSON.stringify(bonuses));
    }
    
    getStoredBonuses() {
        const stored = localStorage.getItem('unlockBonuses');
        return stored ? JSON.parse(stored) : { permanent: {}, temporary: {} };
    }
    
    getActiveBonus(type) {
        const bonuses = this.getStoredBonuses();
        
        // Check permanent bonuses
        if (bonuses.permanent[type] !== undefined) {
            return bonuses.permanent[type];
        }
        
        // Check temporary bonuses
        if (bonuses.temporary[type] !== undefined) {
            const temp = bonuses.temporary[type];
            if (temp.remaining > 0) {
                return temp.multiplier || temp.value;
            }
        }
        
        return null;
    }
    
    consumeTemporaryBonus(type) {
        const bonuses = this.getStoredBonuses();
        if (bonuses.temporary[type] && bonuses.temporary[type].remaining > 0) {
            bonuses.temporary[type].remaining--;
            localStorage.setItem('unlockBonuses', JSON.stringify(bonuses));
            return true;
        }
        return false;
    }
    
    // === UTILITY METHODS ===
    
    isCropUnlocked(cropId) {
        const crop = this.cropManager.getCropDefinition(cropId);
        if (!crop) return false;
        
        const playerLevel = this.resourceManager.getResource('level');
        return playerLevel >= crop.unlockLevel;
    }
    
    getUnlockedCrops() {
        const playerLevel = this.resourceManager.getResource('level');
        return this.cropManager.getCropsForLevel(playerLevel);
    }
    
    getNextUnlocks(playerLevel) {
        const nextLevel = playerLevel + 1;
        const nextCrops = this.unlockConditions.level[nextLevel] || [];
        
        return {
            level: nextLevel,
            crops: nextCrops.map(cropId => ({
                id: cropId,
                name: this.cropManager.getCropDefinition(cropId)?.name || cropId,
                description: this.cropManager.getCropDefinition(cropId)?.description || ''
            }))
        };
    }
    
    getProgressSummary() {
        return {
            harvests: this.progressTracking.get('harvest_count'),
            profit: this.progressTracking.get('total_profit'),
            uniqueCrops: this.progressTracking.get('unique_crops').size,
            achievements: this.achievements.size,
            perfectStreak: this.progressTracking.get('perfect_streak'),
            activeBonuses: this.getActiveBonuses()
        };
    }
    
    getActiveBonuses() {
        const bonuses = this.getStoredBonuses();
        const active = {};
        
        // Add permanent bonuses
        Object.entries(bonuses.permanent).forEach(([type, value]) => {
            active[type] = { value, type: 'permanent' };
        });
        
        // Add active temporary bonuses
        Object.entries(bonuses.temporary).forEach(([type, data]) => {
            if (data.remaining > 0) {
                active[type] = { value: data.multiplier || data.value, type: 'temporary', remaining: data.remaining };
            }
        });
        
        return active;
    }
    
    // === NOTIFICATIONS ===
    
    getUnreadNotifications() {
        return this.notificationQueue.filter(n => !n.shown);
    }
    
    markNotificationRead(index) {
        if (this.notificationQueue[index]) {
            this.notificationQueue[index].shown = true;
        }
    }
    
    clearAllNotifications() {
        this.notificationQueue = [];
    }
    
    onUnlock(callback) {
        this.onUnlockCallbacks.push(callback);
    }
    
    // === PERSISTENCE ===
    
    saveProgress() {
        const data = {
            progress: Object.fromEntries(this.progressTracking.entries()),
            achievements: Object.fromEntries(this.achievements.entries()),
            notifications: this.notificationQueue,
            version: '1.0'
        };
        
        // Convert Sets to Arrays for JSON storage
        if (data.progress.unique_crops instanceof Set) {
            data.progress.unique_crops = Array.from(data.progress.unique_crops);
        }
        
        localStorage.setItem('unlockProgress', JSON.stringify(data));
    }
    
    loadProgress() {
        const stored = localStorage.getItem('unlockProgress');
        if (!stored) return;
        
        try {
            const data = JSON.parse(stored);
            
            // Restore progress tracking
            Object.entries(data.progress || {}).forEach(([key, value]) => {
                if (key === 'unique_crops' && Array.isArray(value)) {
                    this.progressTracking.set(key, new Set(value));
                } else {
                    this.progressTracking.set(key, value);
                }
            });
            
            // Restore achievements
            this.achievements = new Map(Object.entries(data.achievements || {}));
            
            // Restore notifications
            this.notificationQueue = data.notifications || [];
            
        } catch (error) {
            console.error('Failed to load unlock progress:', error);
        }
    }
    
    // === PUBLIC API ===
    
    reset() {
        this.progressTracking.clear();
        this.achievements.clear();
        this.notificationQueue = [];
        localStorage.removeItem('unlockProgress');
        localStorage.removeItem('unlockBonuses');
        this.initializeAchievements();
    }
    
    exportData() {
        return {
            progress: Object.fromEntries(this.progressTracking.entries()),
            achievements: Object.fromEntries(this.achievements.entries()),
            bonuses: this.getStoredBonuses(),
            timestamp: Date.now()
        };
    }
}

// Auto-initialize for global access
window.UnlockSystem = UnlockSystem;
console.log('🔓 UnlockSystem loaded');