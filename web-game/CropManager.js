// 🌾 CropManager.js - Comprehensive Crop Management System

class CropManager {
    constructor() {
        this.cropDefinitions = {
            wheat: {
                id: 'wheat',
                name: 'Wheat',
                icon: '🌾',
                plantedIcon: '🌱',
                growingIcon: '🌿',
                readyIcon: '🌾',
                description: 'A hearty grain crop perfect for beginners',
                seedCost: 5,
                sellPrice: 12,
                xpReward: 8,
                growthTime: 15000, // 15 seconds for demo (5 hours in real game)
                waterNeeded: true,
                rarity: 'common',
                unlockLevel: 1
            },
            tomatoes: {
                id: 'tomatoes',
                name: 'Tomatoes',
                icon: '🍅',
                plantedIcon: '🌱',
                growingIcon: '🌿',
                readyIcon: '🍅',
                description: 'Juicy red tomatoes that sell well at market',
                seedCost: 8,
                sellPrice: 18,
                xpReward: 10,
                growthTime: 12000, // 12 seconds for demo
                waterNeeded: true,
                rarity: 'common',
                unlockLevel: 1
            },
            carrots: {
                id: 'carrots',
                name: 'Carrots',
                icon: '🥕',
                plantedIcon: '🌱',
                growingIcon: '🌿',
                readyIcon: '🥕',
                description: 'Crunchy orange vegetables rich in vitamins',
                seedCost: 6,
                sellPrice: 14,
                xpReward: 8,
                growthTime: 9000, // 9 seconds for demo
                waterNeeded: true,
                rarity: 'common',
                unlockLevel: 1
            },
            corn: {
                id: 'corn',
                name: 'Corn',
                icon: '🌽',
                plantedIcon: '🌱',
                growingIcon: '🌿',
                readyIcon: '🌽',
                description: 'Golden corn with excellent profit margins',
                seedCost: 12,
                sellPrice: 25,
                xpReward: 15,
                growthTime: 18000, // 18 seconds for demo
                waterNeeded: true,
                rarity: 'uncommon',
                unlockLevel: 3
            },
            strawberries: {
                id: 'strawberries',
                name: 'Strawberries',
                icon: '🍓',
                plantedIcon: '🌱',
                growingIcon: '🌿',
                readyIcon: '🍓',
                description: 'Sweet berries that command premium prices',
                seedCost: 15,
                sellPrice: 30,
                xpReward: 12,
                growthTime: 15000, // 15 seconds for demo
                waterNeeded: true,
                rarity: 'uncommon',
                unlockLevel: 2
            },
            lettuce: {
                id: 'lettuce',
                name: 'Lettuce',
                icon: '🥬',
                plantedIcon: '🌱',
                growingIcon: '🌿',
                readyIcon: '🥬',
                description: 'Fast-growing leafy greens for quick profits',
                seedCost: 3,
                sellPrice: 8,
                xpReward: 6,
                growthTime: 6000, // 6 seconds for demo
                waterNeeded: true,
                rarity: 'common',
                unlockLevel: 1
            },
            pumpkins: {
                id: 'pumpkins',
                name: 'Pumpkins',
                icon: '🎃',
                plantedIcon: '🌱',
                growingIcon: '🌿',
                readyIcon: '🎃',
                description: 'Large orange gourds with seasonal demand',
                seedCost: 20,
                sellPrice: 45,
                xpReward: 20,
                growthTime: 24000, // 24 seconds for demo
                waterNeeded: true,
                rarity: 'rare',
                unlockLevel: 5
            },
            sunflowers: {
                id: 'sunflowers',
                name: 'Sunflowers',
                icon: '🌻',
                plantedIcon: '🌱',
                growingIcon: '🌿',
                readyIcon: '🌻',
                description: 'Beautiful flowers that brighten any farm',
                seedCost: 10,
                sellPrice: 22,
                xpReward: 14,
                growthTime: 21000, // 21 seconds for demo
                waterNeeded: true,
                rarity: 'uncommon',
                unlockLevel: 4
            }
        };
        
        this.rarityColors = {
            common: '#90EE90',     // Light green
            uncommon: '#87CEEB',   // Sky blue
            rare: '#DDA0DD',       // Plum
            epic: '#FFD700',       // Gold
            legendary: '#FF69B4'   // Hot pink
        };
    }
    
    getCropDefinition(cropId) {
        return this.cropDefinitions[cropId] || null;
    }
    
    getAllCrops() {
        return Object.values(this.cropDefinitions);
    }
    
    getCropsForLevel(playerLevel) {
        return Object.values(this.cropDefinitions).filter(crop => 
            crop.unlockLevel <= playerLevel
        );
    }
    
    getCropsByRarity(rarity) {
        return Object.values(this.cropDefinitions).filter(crop => 
            crop.rarity === rarity
        );
    }
    
    calculateProfit(cropId) {
        const crop = this.getCropDefinition(cropId);
        if (!crop) return 0;
        return crop.sellPrice - crop.seedCost;
    }
    
    calculateProfitMargin(cropId) {
        const crop = this.getCropDefinition(cropId);
        if (!crop || crop.seedCost === 0) return 0;
        return ((crop.sellPrice - crop.seedCost) / crop.seedCost * 100).toFixed(1);
    }
    
    getGrowthTimeInMinutes(cropId) {
        const crop = this.getCropDefinition(cropId);
        if (!crop) return 0;
        return (crop.growthTime / 60000).toFixed(1); // Convert to minutes for display
    }
    
    isUnlocked(cropId, playerLevel) {
        const crop = this.getCropDefinition(cropId);
        return crop && crop.unlockLevel <= playerLevel;
    }
    
    getNextUnlockLevel(playerLevel) {
        const lockedCrops = Object.values(this.cropDefinitions).filter(crop => 
            crop.unlockLevel > playerLevel
        );
        
        if (lockedCrops.length === 0) return null;
        
        return Math.min(...lockedCrops.map(crop => crop.unlockLevel));
    }
    
    getCropsUnlockedAtLevel(level) {
        return Object.values(this.cropDefinitions).filter(crop => 
            crop.unlockLevel === level
        );
    }
    
    validateCropData(cropData) {
        const requiredFields = ['id', 'name', 'icon', 'seedCost', 'sellPrice', 'xpReward', 'growthTime'];
        
        for (const field of requiredFields) {
            if (!(field in cropData)) {
                return { valid: false, error: `Missing required field: ${field}` };
            }
        }
        
        if (cropData.seedCost < 0 || cropData.sellPrice < 0 || cropData.xpReward < 0) {
            return { valid: false, error: 'Costs, prices, and rewards must be non-negative' };
        }
        
        if (cropData.growthTime <= 0) {
            return { valid: false, error: 'Growth time must be positive' };
        }
        
        return { valid: true };
    }
    
    addCustomCrop(cropData) {
        const validation = this.validateCropData(cropData);
        if (!validation.valid) {
            throw new Error(`Invalid crop data: ${validation.error}`);
        }
        
        // Set defaults for optional fields
        const defaults = {
            plantedIcon: '🌱',
            growingIcon: '🌿',
            readyIcon: cropData.icon,
            description: `A custom ${cropData.name.toLowerCase()} crop`,
            waterNeeded: true,
            rarity: 'common',
            unlockLevel: 1
        };
        
        this.cropDefinitions[cropData.id] = { ...defaults, ...cropData };
        return true;
    }
    
    removeCrop(cropId) {
        if (this.cropDefinitions[cropId]) {
            delete this.cropDefinitions[cropId];
            return true;
        }
        return false;
    }
    
    getCropStats() {
        const crops = Object.values(this.cropDefinitions);
        
        return {
            totalCrops: crops.length,
            byRarity: {
                common: crops.filter(c => c.rarity === 'common').length,
                uncommon: crops.filter(c => c.rarity === 'uncommon').length,
                rare: crops.filter(c => c.rarity === 'rare').length,
                epic: crops.filter(c => c.rarity === 'epic').length,
                legendary: crops.filter(c => c.rarity === 'legendary').length
            },
            avgSeedCost: (crops.reduce((sum, c) => sum + c.seedCost, 0) / crops.length).toFixed(1),
            avgSellPrice: (crops.reduce((sum, c) => sum + c.sellPrice, 0) / crops.length).toFixed(1),
            avgProfit: (crops.reduce((sum, c) => sum + (c.sellPrice - c.seedCost), 0) / crops.length).toFixed(1),
            avgGrowthTime: (crops.reduce((sum, c) => sum + c.growthTime, 0) / crops.length / 1000).toFixed(1) + 's'
        };
    }
    
    exportCropData() {
        return JSON.stringify(this.cropDefinitions, null, 2);
    }
    
    importCropData(jsonData) {
        try {
            const importedCrops = JSON.parse(jsonData);
            
            // Validate each crop
            for (const [cropId, cropData] of Object.entries(importedCrops)) {
                const validation = this.validateCropData({ id: cropId, ...cropData });
                if (!validation.valid) {
                    throw new Error(`Invalid crop ${cropId}: ${validation.error}`);
                }
            }
            
            this.cropDefinitions = importedCrops;
            return true;
        } catch (error) {
            console.error('Failed to import crop data:', error);
            return false;
        }
    }
}