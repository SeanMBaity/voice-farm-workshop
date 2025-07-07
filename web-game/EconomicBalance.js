// 💰 EconomicBalance.js - Advanced Economic Balance System

class EconomicBalance {
    constructor(cropManager, resourceManager) {
        this.cropManager = cropManager;
        this.resourceManager = resourceManager;
        
        // Economic constants for balance calculations
        this.constants = {
            IDEAL_PROFIT_MARGIN: 0.6, // 60% profit margin is ideal
            MIN_PROFIT_MARGIN: 0.2,   // 20% minimum profit margin
            MAX_PROFIT_MARGIN: 2.0,   // 200% maximum profit margin
            RISK_FACTOR_WEIGHT: 0.3,  // How much growth time affects risk
            RARITY_MULTIPLIERS: {
                common: 1.0,
                uncommon: 1.2,
                rare: 1.5,
                epic: 2.0,
                legendary: 3.0
            }
        };
        
        this.balanceHistory = [];
        this.recommendations = [];
    }
    
    // === CORE BALANCE ANALYSIS ===
    
    analyzeAllCrops() {
        const crops = this.cropManager.getAllCrops();
        const analysis = {
            timestamp: Date.now(),
            crops: {},
            summary: {},
            recommendations: []
        };
        
        crops.forEach(crop => {
            analysis.crops[crop.id] = this.analyzeCrop(crop);
        });
        
        analysis.summary = this.generateSummary(analysis.crops);
        analysis.recommendations = this.generateRecommendations(analysis.crops);
        
        this.balanceHistory.push(analysis);
        return analysis;
    }
    
    analyzeCrop(crop) {
        const baseProfit = crop.sellPrice - crop.seedCost;
        const profitMargin = baseProfit / crop.seedCost;
        const timeEfficiency = baseProfit / (crop.growthTime / 1000); // Profit per second
        const riskFactor = this.calculateRiskFactor(crop);
        const balanceScore = this.calculateBalanceScore(crop);
        
        return {
            id: crop.id,
            name: crop.name,
            rarity: crop.rarity,
            unlockLevel: crop.unlockLevel,
            
            // Economic metrics
            seedCost: crop.seedCost,
            sellPrice: crop.sellPrice,
            baseProfit: baseProfit,
            profitMargin: profitMargin,
            
            // Efficiency metrics
            growthTimeSeconds: crop.growthTime / 1000,
            timeEfficiency: timeEfficiency,
            profitPerMinute: timeEfficiency * 60,
            
            // Balance metrics
            riskFactor: riskFactor,
            balanceScore: balanceScore,
            
            // Strategic analysis
            strategy: this.determineStrategy(crop),
            competitiveness: this.calculateCompetitiveness(crop),
            
            // Recommendations
            isBalanced: this.isBalanced(crop),
            adjustmentNeeded: this.getAdjustmentRecommendation(crop)
        };
    }
    
    calculateRiskFactor(crop) {
        // Longer growth time = higher risk
        const timeRisk = (crop.growthTime / 1000) / 30; // Normalized to 30 seconds max
        
        // Higher seed cost = higher risk  
        const costRisk = crop.seedCost / 25; // Normalized to 25 coins max
        
        // Rarity affects risk/reward
        const rarityRisk = this.constants.RARITY_MULTIPLIERS[crop.rarity] - 1;
        
        return Math.min(1.0, (timeRisk + costRisk + rarityRisk) / 3);
    }
    
    calculateBalanceScore(crop) {
        const profitMargin = (crop.sellPrice - crop.seedCost) / crop.seedCost;
        const timeEfficiency = (crop.sellPrice - crop.seedCost) / (crop.growthTime / 1000);
        const riskAdjustedReturn = profitMargin / (1 + this.calculateRiskFactor(crop));
        
        // Balance score considers profit, efficiency, and risk
        const baseScore = (profitMargin * 0.4 + timeEfficiency * 0.4 + riskAdjustedReturn * 0.2);
        
        // Adjust for rarity expectations
        const rarityMultiplier = this.constants.RARITY_MULTIPLIERS[crop.rarity];
        const rarityAdjustedScore = baseScore / rarityMultiplier;
        
        return Math.max(0, Math.min(10, rarityAdjustedScore * 10));
    }
    
    determineStrategy(crop) {
        const profitMargin = (crop.sellPrice - crop.seedCost) / crop.seedCost;
        const timeEfficiency = (crop.sellPrice - crop.seedCost) / (crop.growthTime / 1000);
        
        if (timeEfficiency > 0.8 && profitMargin > 0.5) return 'aggressive-growth';
        if (timeEfficiency > 0.5) return 'quick-turnover';
        if (profitMargin > 1.0) return 'high-margin';
        if (crop.seedCost <= 5) return 'low-risk';
        if (crop.rarity !== 'common') return 'specialty';
        return 'balanced';
    }
    
    calculateCompetitiveness(crop) {
        const allCrops = this.cropManager.getAllCrops();
        const sameLevelCrops = allCrops.filter(c => c.unlockLevel === crop.unlockLevel);
        
        if (sameLevelCrops.length <= 1) return 1.0;
        
        const cropEfficiency = (crop.sellPrice - crop.seedCost) / (crop.growthTime / 1000);
        const avgEfficiency = sameLevelCrops.reduce((sum, c) => 
            sum + ((c.sellPrice - c.seedCost) / (c.growthTime / 1000)), 0) / sameLevelCrops.length;
        
        return Math.max(0, Math.min(2, cropEfficiency / avgEfficiency));
    }
    
    isBalanced(crop) {
        const profitMargin = (crop.sellPrice - crop.seedCost) / crop.seedCost;
        return profitMargin >= this.constants.MIN_PROFIT_MARGIN && 
               profitMargin <= this.constants.MAX_PROFIT_MARGIN;
    }
    
    getAdjustmentRecommendation(crop) {
        const profitMargin = (crop.sellPrice - crop.seedCost) / crop.seedCost;
        const balanceScore = this.calculateBalanceScore(crop);
        
        if (balanceScore >= 7) return null; // Well balanced
        
        if (profitMargin < this.constants.MIN_PROFIT_MARGIN) {
            return {
                type: 'increase_profit',
                suggestion: 'Increase sell price or decrease seed cost',
                priority: 'high'
            };
        }
        
        if (profitMargin > this.constants.MAX_PROFIT_MARGIN) {
            return {
                type: 'reduce_profit',
                suggestion: 'Decrease sell price or increase seed cost',
                priority: 'medium'
            };
        }
        
        const timeEfficiency = (crop.sellPrice - crop.seedCost) / (crop.growthTime / 1000);
        if (timeEfficiency < 0.3) {
            return {
                type: 'improve_efficiency',
                suggestion: 'Reduce growth time or increase profit',
                priority: 'medium'
            };
        }
        
        return {
            type: 'minor_adjustment',
            suggestion: 'Fine-tune based on player feedback',
            priority: 'low'
        };
    }
    
    // === SUMMARY AND RECOMMENDATIONS ===
    
    generateSummary(cropAnalysis) {
        const crops = Object.values(cropAnalysis);
        
        return {
            totalCrops: crops.length,
            averageBalanceScore: crops.reduce((sum, c) => sum + c.balanceScore, 0) / crops.length,
            balancedCrops: crops.filter(c => c.isBalanced).length,
            needsAdjustment: crops.filter(c => c.adjustmentNeeded).length,
            
            // Economic metrics
            averageProfitMargin: crops.reduce((sum, c) => sum + c.profitMargin, 0) / crops.length,
            averageTimeEfficiency: crops.reduce((sum, c) => sum + c.timeEfficiency, 0) / crops.length,
            
            // Strategic diversity
            strategies: this.getStrategyDistribution(crops),
            rarityDistribution: this.getRarityDistribution(crops),
            
            // Competitive analysis
            mostCompetitive: crops.reduce((best, c) => c.competitiveness > best.competitiveness ? c : best),
            leastCompetitive: crops.reduce((worst, c) => c.competitiveness < worst.competitiveness ? c : worst)
        };
    }
    
    generateRecommendations(cropAnalysis) {
        const crops = Object.values(cropAnalysis);
        const recommendations = [];
        
        // High priority issues
        const unbalancedCrops = crops.filter(c => !c.isBalanced);
        if (unbalancedCrops.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'balance',
                title: 'Unbalanced Crops Detected',
                description: `${unbalancedCrops.length} crops need balance adjustments`,
                crops: unbalancedCrops.map(c => c.id),
                action: 'Review profit margins and adjust pricing'
            });
        }
        
        // Strategy diversity
        const strategies = this.getStrategyDistribution(crops);
        if (Object.keys(strategies).length < 3) {
            recommendations.push({
                priority: 'medium',
                category: 'diversity',
                title: 'Limited Strategic Diversity',
                description: 'Consider adding crops with different strategic profiles',
                action: 'Add crops that fill missing strategy niches'
            });
        }
        
        // Competitiveness issues
        const lowCompetitiveness = crops.filter(c => c.competitiveness < 0.7);
        if (lowCompetitiveness.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'competitiveness',
                title: 'Low Competitive Crops',
                description: `${lowCompetitiveness.length} crops are not competitive at their unlock level`,
                crops: lowCompetitiveness.map(c => c.id),
                action: 'Improve these crops or adjust unlock requirements'
            });
        }
        
        // Progression gaps
        const levelGaps = this.findProgressionGaps(crops);
        if (levelGaps.length > 0) {
            recommendations.push({
                priority: 'low',
                category: 'progression',
                title: 'Progression Gaps Found',
                description: 'Some levels have no crop unlocks',
                gaps: levelGaps,
                action: 'Consider adding crops at these levels or adjusting unlock levels'
            });
        }
        
        return recommendations;
    }
    
    // === UTILITY METHODS ===
    
    getStrategyDistribution(crops) {
        const distribution = {};
        crops.forEach(crop => {
            distribution[crop.strategy] = (distribution[crop.strategy] || 0) + 1;
        });
        return distribution;
    }
    
    getRarityDistribution(crops) {
        const distribution = {};
        crops.forEach(crop => {
            distribution[crop.rarity] = (distribution[crop.rarity] || 0) + 1;
        });
        return distribution;
    }
    
    findProgressionGaps(crops) {
        const unlockLevels = [...new Set(crops.map(c => c.unlockLevel))].sort((a, b) => a - b);
        const gaps = [];
        
        for (let i = 1; i < unlockLevels.length; i++) {
            const current = unlockLevels[i - 1];
            const next = unlockLevels[i];
            
            if (next - current > 1) {
                for (let level = current + 1; level < next; level++) {
                    gaps.push(level);
                }
            }
        }
        
        return gaps;
    }
    
    // === SIMULATION AND TESTING ===
    
    simulatePlayerProgression(startingMoney = 50, levels = 5) {
        const simulation = {
            startingMoney,
            levels: [],
            totalTime: 0,
            finalMoney: startingMoney
        };
        
        let currentMoney = startingMoney;
        let currentLevel = 1;
        
        for (let level = 1; level <= levels; level++) {
            const availableCrops = this.cropManager.getCropsForLevel(level);
            const bestCrop = this.findOptimalCrop(availableCrops, currentMoney);
            
            if (bestCrop) {
                const cycles = Math.floor(currentMoney / bestCrop.seedCost);
                const profit = cycles * (bestCrop.sellPrice - bestCrop.seedCost);
                const time = bestCrop.growthTime;
                
                currentMoney += profit;
                simulation.totalTime += time;
                
                simulation.levels.push({
                    level,
                    crop: bestCrop.id,
                    cycles,
                    profit,
                    time,
                    moneyAfter: currentMoney
                });
            }
        }
        
        simulation.finalMoney = currentMoney;
        return simulation;
    }
    
    findOptimalCrop(crops, availableMoney) {
        const affordableCrops = crops.filter(crop => crop.seedCost <= availableMoney);
        if (affordableCrops.length === 0) return null;
        
        // Find crop with best profit per time ratio
        return affordableCrops.reduce((best, crop) => {
            const efficiency = (crop.sellPrice - crop.seedCost) / (crop.growthTime / 1000);
            const bestEfficiency = (best.sellPrice - best.seedCost) / (best.growthTime / 1000);
            return efficiency > bestEfficiency ? crop : best;
        });
    }
    
    // === REPORTING ===
    
    generateBalanceReport() {
        const analysis = this.analyzeAllCrops();
        
        return {
            timestamp: new Date().toISOString(),
            summary: analysis.summary,
            recommendations: analysis.recommendations,
            cropDetails: analysis.crops,
            
            // Quick metrics
            overallHealth: this.calculateOverallHealth(analysis),
            priorityActions: analysis.recommendations.filter(r => r.priority === 'high'),
            
            // Historical comparison
            trend: this.calculateTrend(),
            
            // Export data
            exportData: {
                crops: Object.values(analysis.crops).map(c => ({
                    id: c.id,
                    balanceScore: c.balanceScore,
                    profitMargin: c.profitMargin,
                    timeEfficiency: c.timeEfficiency,
                    competitiveness: c.competitiveness
                }))
            }
        };
    }
    
    calculateOverallHealth(analysis) {
        const avgBalance = analysis.summary.averageBalanceScore;
        const balancedRatio = analysis.summary.balancedCrops / analysis.summary.totalCrops;
        const adjustmentRatio = 1 - (analysis.summary.needsAdjustment / analysis.summary.totalCrops);
        
        const health = (avgBalance * 0.4 + balancedRatio * 10 * 0.4 + adjustmentRatio * 10 * 0.2);
        
        if (health >= 8) return 'excellent';
        if (health >= 6) return 'good';
        if (health >= 4) return 'fair';
        return 'needs-improvement';
    }
    
    calculateTrend() {
        if (this.balanceHistory.length < 2) return 'insufficient-data';
        
        const current = this.balanceHistory[this.balanceHistory.length - 1];
        const previous = this.balanceHistory[this.balanceHistory.length - 2];
        
        const currentHealth = current.summary.averageBalanceScore;
        const previousHealth = previous.summary.averageBalanceScore;
        
        const change = currentHealth - previousHealth;
        
        if (Math.abs(change) < 0.1) return 'stable';
        return change > 0 ? 'improving' : 'declining';
    }
    
    // === PUBLIC API ===
    
    getQuickStats() {
        const crops = this.cropManager.getAllCrops();
        return {
            totalCrops: crops.length,
            commonCrops: crops.filter(c => c.rarity === 'common').length,
            rareCrops: crops.filter(c => c.rarity !== 'common').length,
            avgProfitMargin: crops.reduce((sum, c) => sum + ((c.sellPrice - c.seedCost) / c.seedCost), 0) / crops.length,
            fastestGrowth: Math.min(...crops.map(c => c.growthTime)),
            slowestGrowth: Math.max(...crops.map(c => c.growthTime)),
            cheapestCrop: Math.min(...crops.map(c => c.seedCost)),
            mostExpensive: Math.max(...crops.map(c => c.seedCost))
        };
    }
    
    exportBalanceData() {
        const analysis = this.analyzeAllCrops();
        return {
            timestamp: Date.now(),
            version: '1.0',
            data: analysis,
            statistics: this.getQuickStats()
        };
    }
}

// Auto-initialize for global access
window.EconomicBalance = EconomicBalance;
console.log('💰 EconomicBalance loaded');