// 💰 ResourceManager.js - Comprehensive Resource Management System

class ResourceManager {
    constructor(initialResources = {}) {
        this.resources = {
            money: initialResources.money || 50, // Starting money
            xp: initialResources.xp || 0,
            level: initialResources.level || 1,
            totalHarvests: initialResources.totalHarvests || 0,
            totalSpent: initialResources.totalSpent || 0,
            totalEarned: initialResources.totalEarned || 0,
            ...initialResources
        };
        
        this.xpThresholds = this.calculateXPThresholds();
        this.levelBenefits = this.defineLevelBenefits();
        this.onResourceChange = null;
        this.onLevelUp = null;
        
        this.transactionHistory = [];
        this.maxHistoryLength = 100;
    }
    
    calculateXPThresholds() {
        const thresholds = [0]; // Level 1 starts at 0 XP
        
        for (let level = 2; level <= 50; level++) {
            // Exponential growth: each level requires more XP
            const xpNeeded = Math.floor(50 * Math.pow(1.2, level - 2));
            thresholds.push(thresholds[level - 2] + xpNeeded);
        }
        
        return thresholds;
    }
    
    defineLevelBenefits() {
        return {
            2: { type: 'crop_unlock', data: { crops: ['strawberries'] }, message: 'Strawberries unlocked!' },
            3: { type: 'crop_unlock', data: { crops: ['corn'] }, message: 'Corn unlocked!' },
            4: { type: 'crop_unlock', data: { crops: ['sunflowers'] }, message: 'Sunflowers unlocked!' },
            5: { type: 'crop_unlock', data: { crops: ['pumpkins'] }, message: 'Pumpkins unlocked!' },
            6: { type: 'bonus_money', data: { amount: 100 }, message: 'Bonus: +100 coins!' },
            8: { type: 'efficiency_boost', data: { type: 'growth_speed', multiplier: 1.1 }, message: 'Crops grow 10% faster!' },
            10: { type: 'bonus_money', data: { amount: 200 }, message: 'Bonus: +200 coins!' },
            12: { type: 'harvest_bonus', data: { multiplier: 1.1 }, message: 'Harvest value increased by 10%!' },
            15: { type: 'bonus_money', data: { amount: 500 }, message: 'Bonus: +500 coins!' },
            20: { type: 'efficiency_boost', data: { type: 'growth_speed', multiplier: 1.2 }, message: 'Crops grow 20% faster!' }
        };
    }
    
    getResource(resourceType) {
        return this.resources[resourceType] || 0;
    }
    
    setResource(resourceType, amount) {
        const oldValue = this.resources[resourceType] || 0;
        this.resources[resourceType] = Math.max(0, amount);
        
        this.triggerResourceChange(resourceType, oldValue, this.resources[resourceType]);
        return this.resources[resourceType];
    }
    
    addResource(resourceType, amount, source = 'unknown') {
        if (amount <= 0) return false;
        
        const oldValue = this.resources[resourceType] || 0;
        this.resources[resourceType] = oldValue + amount;
        
        // Record transaction
        this.recordTransaction({
            type: 'add',
            resource: resourceType,
            amount: amount,
            source: source,
            timestamp: Date.now(),
            balanceAfter: this.resources[resourceType]
        });
        
        this.triggerResourceChange(resourceType, oldValue, this.resources[resourceType]);
        
        // Special handling for XP to check for level ups
        if (resourceType === 'xp') {
            this.checkLevelUp();
        }
        
        return true;
    }
    
    spendResource(resourceType, amount, purpose = 'unknown') {
        if (amount <= 0) return false;
        
        const currentAmount = this.resources[resourceType] || 0;
        if (currentAmount < amount) {
            return false; // Insufficient resources
        }
        
        const oldValue = currentAmount;
        this.resources[resourceType] = currentAmount - amount;
        
        // Record transaction
        this.recordTransaction({
            type: 'spend',
            resource: resourceType,
            amount: amount,
            purpose: purpose,
            timestamp: Date.now(),
            balanceAfter: this.resources[resourceType]
        });
        
        // Track total spending for money
        if (resourceType === 'money') {
            this.resources.totalSpent = (this.resources.totalSpent || 0) + amount;
        }
        
        this.triggerResourceChange(resourceType, oldValue, this.resources[resourceType]);
        return true;
    }
    
    canAfford(resourceType, amount) {
        return (this.resources[resourceType] || 0) >= amount;
    }
    
    checkLevelUp() {
        const currentXP = this.resources.xp;
        const currentLevel = this.resources.level;
        const newLevel = this.calculateLevelFromXP(currentXP);
        
        if (newLevel > currentLevel) {
            const oldLevel = currentLevel;
            this.resources.level = newLevel;
            
            // Apply level benefits
            for (let level = oldLevel + 1; level <= newLevel; level++) {
                this.applyLevelBenefit(level);
            }
            
            this.triggerLevelUp(oldLevel, newLevel);
            return newLevel - oldLevel; // Return levels gained
        }
        
        return 0;
    }
    
    calculateLevelFromXP(xp) {
        for (let i = this.xpThresholds.length - 1; i >= 0; i--) {
            if (xp >= this.xpThresholds[i]) {
                return i + 1;
            }
        }
        return 1;
    }
    
    getXPForNextLevel() {
        const currentLevel = this.resources.level;
        if (currentLevel >= this.xpThresholds.length) {
            return null; // Max level reached
        }
        
        const nextLevelXP = this.xpThresholds[currentLevel];
        const currentXP = this.resources.xp;
        return nextLevelXP - currentXP;
    }
    
    getXPProgress() {
        const currentLevel = this.resources.level;
        const currentXP = this.resources.xp;
        
        if (currentLevel >= this.xpThresholds.length) {
            return { current: currentXP, max: currentXP, percentage: 100 };
        }
        
        const levelStartXP = this.xpThresholds[currentLevel - 1];
        const levelEndXP = this.xpThresholds[currentLevel];
        const progressXP = currentXP - levelStartXP;
        const totalXPNeeded = levelEndXP - levelStartXP;
        
        return {
            current: progressXP,
            max: totalXPNeeded,
            percentage: Math.floor((progressXP / totalXPNeeded) * 100)
        };
    }
    
    applyLevelBenefit(level) {
        const benefit = this.levelBenefits[level];
        if (!benefit) return null;
        
        switch (benefit.type) {
            case 'bonus_money':
                this.addResource('money', benefit.data.amount, `level_${level}_bonus`);
                break;
            case 'crop_unlock':
                // This will be handled by the game logic
                break;
            case 'efficiency_boost':
            case 'harvest_bonus':
                // These are passive benefits that affect game mechanics
                break;
        }
        
        return benefit;
    }
    
    getLevelBenefit(level) {
        return this.levelBenefits[level] || null;
    }
    
    getNextLevelBenefit() {
        const currentLevel = this.resources.level;
        for (let level = currentLevel + 1; level <= 50; level++) {
            if (this.levelBenefits[level]) {
                return { level, benefit: this.levelBenefits[level] };
            }
        }
        return null;
    }
    
    recordTransaction(transaction) {
        this.transactionHistory.unshift(transaction);
        
        // Keep history size manageable
        if (this.transactionHistory.length > this.maxHistoryLength) {
            this.transactionHistory = this.transactionHistory.slice(0, this.maxHistoryLength);
        }
    }
    
    getTransactionHistory(limit = 10) {
        return this.transactionHistory.slice(0, limit);
    }
    
    getResourceStats() {
        return {
            resources: { ...this.resources },
            level: {
                current: this.resources.level,
                xpProgress: this.getXPProgress(),
                xpToNext: this.getXPForNextLevel(),
                nextBenefit: this.getNextLevelBenefit()
            },
            economics: {
                totalSpent: this.resources.totalSpent || 0,
                totalEarned: this.resources.totalEarned || 0,
                netProfit: (this.resources.totalEarned || 0) - (this.resources.totalSpent || 0),
                efficiency: this.calculateEfficiency()
            }
        };
    }
    
    calculateEfficiency() {
        const totalSpent = this.resources.totalSpent || 0;
        const totalEarned = this.resources.totalEarned || 0;
        
        if (totalSpent === 0) return totalEarned > 0 ? 100 : 0;
        
        return Math.floor((totalEarned / totalSpent) * 100);
    }
    
    triggerResourceChange(resourceType, oldValue, newValue) {
        if (this.onResourceChange) {
            this.onResourceChange(resourceType, oldValue, newValue);
        }
    }
    
    triggerLevelUp(oldLevel, newLevel) {
        if (this.onLevelUp) {
            this.onLevelUp(oldLevel, newLevel, this.getLevelBenefit(newLevel));
        }
    }
    
    setResourceChangeHandler(handler) {
        this.onResourceChange = handler;
    }
    
    setLevelUpHandler(handler) {
        this.onLevelUp = handler;
    }
    
    exportData() {
        return {
            resources: { ...this.resources },
            transactionHistory: [...this.transactionHistory]
        };
    }
    
    importData(data) {
        if (data.resources) {
            this.resources = { ...this.resources, ...data.resources };
        }
        
        if (data.transactionHistory) {
            this.transactionHistory = [...data.transactionHistory];
        }
        
        // Validate level matches XP
        const calculatedLevel = this.calculateLevelFromXP(this.resources.xp);
        if (calculatedLevel !== this.resources.level) {
            this.resources.level = calculatedLevel;
        }
    }
    
    reset() {
        this.resources = {
            money: 50,
            xp: 0,
            level: 1,
            totalHarvests: 0,
            totalSpent: 0,
            totalEarned: 0
        };
        this.transactionHistory = [];
    }
    
    // Economy simulation for testing/balancing
    simulateEconomy(actions) {
        const simulation = {
            starting: { ...this.resources },
            actions: [],
            ending: null
        };
        
        for (const action of actions) {
            const before = { ...this.resources };
            
            let result = false;
            if (action.type === 'spend' && this.canAfford(action.resource, action.amount)) {
                result = this.spendResource(action.resource, action.amount, action.purpose);
            } else if (action.type === 'add') {
                result = this.addResource(action.resource, action.amount, action.source);
            }
            
            simulation.actions.push({
                ...action,
                before,
                after: { ...this.resources },
                success: result
            });
        }
        
        simulation.ending = { ...this.resources };
        return simulation;
    }
}