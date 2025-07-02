/**
 * FarmService - Core game logic for Voice Farm Game
 * Manages crop planting, watering, growth timers, and harvesting
 */

class FarmService {
  constructor() {
    // In-memory storage for MVP (will be replaced with DynamoDB in Milestone 3)
    this.farms = new Map();
    
    // Crop configuration
    this.cropConfig = {
      tomatoes: { growthTime: 4, xpReward: 10, name: 'tomatoes' },
      carrots: { growthTime: 3, xpReward: 8, name: 'carrots' },
      corn: { growthTime: 6, xpReward: 15, name: 'corn' },
      strawberries: { growthTime: 5, xpReward: 12, name: 'strawberries' },
      lettuce: { growthTime: 2, xpReward: 6, name: 'lettuce' }
    };
  }

  /**
   * Get or create a user's farm
   */
  getFarm(userId) {
    if (!this.farms.has(userId)) {
      this.farms.set(userId, {
        userId: userId,
        crops: [],
        xp: 0,
        level: 1,
        lastVisit: new Date(),
        totalHarvests: 0
      });
    }
    return this.farms.get(userId);
  }

  /**
   * Plant a crop for the user
   */
  async plantCrop(userId, cropType) {
    try {
      const normalizedCrop = cropType.toLowerCase();
      
      // Validate crop type
      if (!this.cropConfig[normalizedCrop]) {
        return {
          success: false,
          message: `I don't know how to grow ${cropType}. Try tomatoes, carrots, corn, strawberries, or lettuce!`
        };
      }

      const farm = this.getFarm(userId);
      const config = this.cropConfig[normalizedCrop];
      
      // Check if user already has too many crops (limit for MVP)
      if (farm.crops.length >= 6) {
        return {
          success: false,
          message: `Your farm is getting full! Try harvesting some crops first before planting more.`
        };
      }

      // Create new crop
      const newCrop = {
        id: Date.now() + Math.random(), // Simple ID for MVP
        type: normalizedCrop,
        plantedAt: new Date(),
        status: 'planted', // planted -> growing -> ready -> harvested
        wateredAt: null,
        readyAt: new Date(Date.now() + (config.growthTime * 60 * 60 * 1000)) // hours to milliseconds
      };

      farm.crops.push(newCrop);
      farm.lastVisit = new Date();

      console.log(`Planted ${normalizedCrop} for user ${userId}`);
      
      return {
        success: true,
        crop: newCrop,
        message: `Successfully planted ${config.name}!`
      };

    } catch (error) {
      console.error('Error planting crop:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble planting that crop. Please try again!'
      };
    }
  }

  /**
   * Water crops for the user
   */
  async waterCrops(userId, specificCrop = null) {
    try {
      const farm = this.getFarm(userId);
      
      if (farm.crops.length === 0) {
        return {
          success: false,
          message: 'NO_CROPS'
        };
      }

      let cropsToWater = farm.crops.filter(crop => crop.status !== 'harvested');
      
      // Filter by specific crop if requested
      if (specificCrop) {
        const normalizedCrop = specificCrop.toLowerCase();
        cropsToWater = cropsToWater.filter(crop => crop.type === normalizedCrop);
        
        if (cropsToWater.length === 0) {
          return {
            success: false,
            message: `I don't see any ${specificCrop} to water. Try checking your farm or planting some first!`
          };
        }
      }

      // Water the crops
      const now = new Date();
      let cropsWatered = 0;
      let nearlyReady = 0;

      cropsToWater.forEach(crop => {
        crop.wateredAt = now;
        crop.status = 'growing';
        cropsWatered++;
        
        // Check if crop is nearly ready (within 1 hour)
        const timeUntilReady = crop.readyAt.getTime() - now.getTime();
        if (timeUntilReady <= 60 * 60 * 1000) { // 1 hour in milliseconds
          nearlyReady++;
        }
      });

      farm.lastVisit = now;

      console.log(`Watered ${cropsWatered} crops for user ${userId}`);

      return {
        success: true,
        cropsWatered: cropsWatered,
        nearlyReady: nearlyReady,
        message: `Successfully watered ${cropsWatered} crops!`
      };

    } catch (error) {
      console.error('Error watering crops:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble watering your crops. Please try again!'
      };
    }
  }

  /**
   * Harvest ready crops
   */
  async harvestCrops(userId, specificCrop = null) {
    try {
      const farm = this.getFarm(userId);
      
      if (farm.crops.length === 0) {
        return {
          success: false,
          message: 'NO_CROPS'
        };
      }

      const now = new Date();
      let cropsToHarvest = farm.crops.filter(crop => 
        crop.status !== 'harvested' && crop.readyAt <= now
      );

      // Filter by specific crop if requested
      if (specificCrop) {
        const normalizedCrop = specificCrop.toLowerCase();
        cropsToHarvest = cropsToHarvest.filter(crop => crop.type === normalizedCrop);
      }

      if (cropsToHarvest.length === 0) {
        const stillGrowing = farm.crops.filter(crop => 
          crop.status !== 'harvested' && crop.readyAt > now
        ).length;
        
        if (stillGrowing > 0) {
          return {
            success: false,
            message: `Your crops aren't ready yet! You have ${stillGrowing} crops still growing. Try checking back later or watering them to help them grow!`
          };
        } else {
          return {
            success: false,
            message: specificCrop ? 
              `I don't see any ready ${specificCrop} to harvest. Try planting and watering some first!` :
              `No crops are ready to harvest yet. Plant some seeds and water them to get started!`
          };
        }
      }

      // Harvest the crops
      let totalXp = 0;
      let harvestedCrops = [];

      cropsToHarvest.forEach(crop => {
        crop.status = 'harvested';
        crop.harvestedAt = now;
        
        const config = this.cropConfig[crop.type];
        if (config) {
          totalXp += config.xpReward;
          harvestedCrops.push({
            type: crop.type,
            xp: config.xpReward
          });
        }
      });

      // Update farm stats
      farm.xp += totalXp;
      farm.totalHarvests += cropsToHarvest.length;
      farm.lastVisit = now;

      // Check for level up
      const newLevel = Math.floor(farm.xp / 50) + 1; // 50 XP per level
      const leveledUp = newLevel > farm.level;
      farm.level = newLevel;

      console.log(`Harvested ${cropsToHarvest.length} crops for user ${userId}, gained ${totalXp} XP`);

      return {
        success: true,
        harvestedCrops: harvestedCrops,
        cropsHarvested: cropsToHarvest.length,
        xpGained: totalXp,
        totalXp: farm.xp,
        level: farm.level,
        leveledUp: leveledUp,
        message: `Successfully harvested ${cropsToHarvest.length} crops!`
      };

    } catch (error) {
      console.error('Error harvesting crops:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble harvesting your crops. Please try again!'
      };
    }
  }

  /**
   * Get farm status
   */
  async getFarmStatus(userId) {
    try {
      const farm = this.getFarm(userId);
      const now = new Date();

      // Categorize crops
      const cropStatus = {
        planted: 0,
        growing: 0,
        ready: 0,
        harvested: 0
      };

      const cropDetails = [];

      farm.crops.forEach(crop => {
        if (crop.status === 'harvested') {
          cropStatus.harvested++;
        } else if (crop.readyAt <= now) {
          cropStatus.ready++;
          cropDetails.push({
            type: crop.type,
            status: 'ready',
            timeReady: 'now'
          });
        } else {
          const timeUntilReady = Math.ceil((crop.readyAt.getTime() - now.getTime()) / (60 * 60 * 1000));
          if (crop.wateredAt) {
            cropStatus.growing++;
            cropDetails.push({
              type: crop.type,
              status: 'growing',
              timeReady: `${timeUntilReady} hours`
            });
          } else {
            cropStatus.planted++;
            cropDetails.push({
              type: crop.type,
              status: 'needs water',
              timeReady: `${timeUntilReady} hours after watering`
            });
          }
        }
      });

      return {
        success: true,
        farm: {
          level: farm.level,
          xp: farm.xp,
          totalHarvests: farm.totalHarvests,
          cropStatus: cropStatus,
          cropDetails: cropDetails
        }
      };

    } catch (error) {
      console.error('Error getting farm status:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble checking your farm. Please try again!'
      };
    }
  }

  /**
   * Get crop growth time in hours
   */
  getCropGrowthTime(cropType) {
    const normalizedCrop = cropType.toLowerCase();
    const config = this.cropConfig[normalizedCrop];
    return config ? config.growthTime : null;
  }

  /**
   * Get available crop types
   */
  getAvailableCrops() {
    return Object.keys(this.cropConfig);
  }
}

// Export singleton instance
module.exports = new FarmService(); 