// 💾 StorageManager.js - Robust Save/Load System

class StorageManager {
    constructor(options = {}) {
        this.storageKey = options.storageKey || 'voiceFarmGame';
        this.autoSaveInterval = options.autoSaveInterval || 30000; // 30 seconds
        this.maxBackups = options.maxBackups || 5;
        this.compressionEnabled = options.compression !== false;
        
        // Auto-save state
        this.autoSaveTimer = null;
        this.isAutoSaveEnabled = false;
        this.lastSaveTime = 0;
        this.saveInProgress = false;
        
        // Callbacks
        this.onSave = null;
        this.onLoad = null;
        this.onAutoSave = null;
        this.onError = null;
        
        // Storage stats
        this.stats = {
            totalSaves: 0,
            totalLoads: 0,
            autoSaves: 0,
            manualSaves: 0,
            saveErrors: 0,
            loadErrors: 0,
            lastSaveSize: 0,
            totalStorageUsed: 0
        };
        
        // Data validation schema
        this.validationSchema = {
            version: { type: 'string', required: true },
            timestamp: { type: 'number', required: true },
            gameData: { type: 'object', required: true }
        };
        
        console.log('💾 StorageManager initialized');
        this.updateStorageStats();
    }
    
    // Auto-save functionality
    enableAutoSave() {
        if (this.isAutoSaveEnabled) return;
        
        this.isAutoSaveEnabled = true;
        this.autoSaveTimer = setInterval(() => {
            this.performAutoSave();
        }, this.autoSaveInterval);
        
        console.log(`💾 Auto-save enabled (${this.autoSaveInterval / 1000}s interval)`);
    }
    
    disableAutoSave() {
        this.isAutoSaveEnabled = false;
        
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
        
        console.log('💾 Auto-save disabled');
    }
    
    async performAutoSave() {
        if (this.saveInProgress) {
            console.log('💾 Skipping auto-save (save in progress)');
            return;
        }
        
        try {
            const gameData = this.gatherGameData();
            if (!gameData) {
                console.log('💾 Skipping auto-save (no data to save)');
                return;
            }
            
            await this.save(gameData, { isAutoSave: true });
            this.stats.autoSaves++;
            
            if (this.onAutoSave) {
                this.onAutoSave(gameData);
            }
            
            console.log('💾 Auto-save completed');
        } catch (error) {
            console.error('💾 Auto-save failed:', error);
            this.handleError('autosave', error);
        }
    }
    
    // Core save/load functionality
    async save(gameData, options = {}) {
        if (this.saveInProgress && !options.force) {
            throw new Error('Save already in progress');
        }
        
        this.saveInProgress = true;
        const saveStart = performance.now();
        
        try {
            // Validate data
            const validationResult = this.validateGameData(gameData);
            if (!validationResult.valid) {
                throw new Error(`Invalid game data: ${validationResult.errors.join(', ')}`);
            }
            
            // Create save package
            const savePackage = this.createSavePackage(gameData, options);
            
            // Create backup if this is a manual save
            if (!options.isAutoSave) {
                await this.createBackup();
            }
            
            // Compress if enabled
            let serializedData = JSON.stringify(savePackage);
            if (this.compressionEnabled) {
                serializedData = this.compressData(serializedData);
            }
            
            // Save to storage
            await this.writeToStorage(this.storageKey, serializedData);
            
            // Update stats
            this.stats.totalSaves++;
            this.stats.lastSaveSize = serializedData.length;
            this.lastSaveTime = Date.now();
            
            if (options.isAutoSave) {
                this.stats.autoSaves++;
            } else {
                this.stats.manualSaves++;
            }
            
            this.updateStorageStats();
            
            const saveTime = performance.now() - saveStart;
            console.log(`💾 Save completed in ${saveTime.toFixed(2)}ms (${serializedData.length} bytes)`);
            
            if (this.onSave) {
                this.onSave(savePackage, options);
            }
            
            return savePackage;
            
        } catch (error) {
            this.stats.saveErrors++;
            console.error('💾 Save failed:', error);
            this.handleError('save', error);
            throw error;
            
        } finally {
            this.saveInProgress = false;
        }
    }
    
    async load(options = {}) {
        const loadStart = performance.now();
        
        try {
            // Read from storage
            const serializedData = await this.readFromStorage(this.storageKey);
            if (!serializedData) {
                console.log('💾 No save data found');
                return null;
            }
            
            // Decompress if needed
            let dataString = serializedData;
            if (this.compressionEnabled && this.isCompressed(serializedData)) {
                dataString = this.decompressData(serializedData);
            }
            
            // Parse data
            let savePackage;
            try {
                savePackage = JSON.parse(dataString);
            } catch (parseError) {
                throw new Error(`Failed to parse save data: ${parseError.message}`);
            }
            
            // Validate save package
            const validationResult = this.validateSavePackage(savePackage);
            if (!validationResult.valid) {
                throw new Error(`Invalid save package: ${validationResult.errors.join(', ')}`);
            }
            
            // Check version compatibility
            const migrationResult = await this.migrateSaveData(savePackage);
            if (migrationResult) {
                savePackage = migrationResult;
                console.log(`💾 Save data migrated from v${savePackage.version} to current version`);
            }
            
            // Update stats
            this.stats.totalLoads++;
            this.updateStorageStats();
            
            const loadTime = performance.now() - loadStart;
            console.log(`💾 Load completed in ${loadTime.toFixed(2)}ms`);
            
            if (this.onLoad) {
                this.onLoad(savePackage, options);
            }
            
            return savePackage;
            
        } catch (error) {
            this.stats.loadErrors++;
            console.error('💾 Load failed:', error);
            this.handleError('load', error);
            
            // Try loading backup
            if (!options.skipBackup) {
                console.log('💾 Attempting to load from backup...');
                return await this.loadFromBackup();
            }
            
            throw error;
        }
    }
    
    // Backup system
    async createBackup() {
        try {
            const currentData = await this.readFromStorage(this.storageKey);
            if (!currentData) return;
            
            const backupKey = `${this.storageKey}_backup_${Date.now()}`;
            await this.writeToStorage(backupKey, currentData);
            
            // Clean up old backups
            await this.cleanupOldBackups();
            
            console.log(`💾 Backup created: ${backupKey}`);
        } catch (error) {
            console.error('💾 Backup creation failed:', error);
        }
    }
    
    async loadFromBackup() {
        try {
            const backups = await this.getBackupList();
            if (backups.length === 0) {
                throw new Error('No backups available');
            }
            
            // Try loading from most recent backup
            const mostRecentBackup = backups[0];
            const backupData = await this.readFromStorage(mostRecentBackup);
            
            if (backupData) {
                console.log(`💾 Loaded from backup: ${mostRecentBackup}`);
                return JSON.parse(this.isCompressed(backupData) ? this.decompressData(backupData) : backupData);
            }
            
            throw new Error('Backup data is corrupted');
            
        } catch (error) {
            console.error('💾 Backup load failed:', error);
            throw error;
        }
    }
    
    async getBackupList() {
        const keys = await this.getAllStorageKeys();
        return keys
            .filter(key => key.startsWith(`${this.storageKey}_backup_`))
            .sort((a, b) => {
                const timestampA = parseInt(a.split('_').pop());
                const timestampB = parseInt(b.split('_').pop());
                return timestampB - timestampA; // Most recent first
            });
    }
    
    async cleanupOldBackups() {
        const backups = await this.getBackupList();
        
        if (backups.length > this.maxBackups) {
            const backupsToDelete = backups.slice(this.maxBackups);
            
            for (const backup of backupsToDelete) {
                await this.removeFromStorage(backup);
                console.log(`💾 Removed old backup: ${backup}`);
            }
        }
    }
    
    // Data validation
    validateGameData(gameData) {
        const errors = [];
        
        if (!gameData || typeof gameData !== 'object') {
            errors.push('Game data must be an object');
            return { valid: false, errors };
        }
        
        // Add specific validation rules here
        if (gameData.resources && typeof gameData.resources !== 'object') {
            errors.push('Resources must be an object');
        }
        
        if (gameData.farmData && !Array.isArray(gameData.farmData)) {
            errors.push('Farm data must be an array');
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    validateSavePackage(savePackage) {
        const errors = [];
        
        for (const [field, rules] of Object.entries(this.validationSchema)) {
            if (rules.required && !(field in savePackage)) {
                errors.push(`Required field missing: ${field}`);
                continue;
            }
            
            if (field in savePackage && typeof savePackage[field] !== rules.type) {
                errors.push(`Field ${field} must be of type ${rules.type}`);
            }
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    // Data migration
    async migrateSaveData(savePackage) {
        const currentVersion = '3.0';
        
        if (savePackage.version === currentVersion) {
            return null; // No migration needed
        }
        
        console.log(`💾 Migrating save data from v${savePackage.version} to v${currentVersion}`);
        
        // Migration logic for different versions
        if (!savePackage.version || savePackage.version === '1.0') {
            // Migrate from v1.0 to current
            savePackage = this.migrateFromV1(savePackage);
        }
        
        if (savePackage.version === '2.0') {
            // Migrate from v2.0 to current
            savePackage = this.migrateFromV2(savePackage);
        }
        
        savePackage.version = currentVersion;
        return savePackage;
    }
    
    migrateFromV1(saveData) {
        // Example migration from old format
        if (saveData.playerStats) {
            saveData.gameData = {
                resources: {
                    resources: {
                        money: 50,
                        level: saveData.playerStats.level || 1,
                        xp: saveData.playerStats.xp || 0,
                        totalHarvests: saveData.playerStats.totalHarvests || 0
                    }
                },
                selectedCrop: saveData.selectedCrop || 'wheat',
                farmData: saveData.farmData || []
            };
            delete saveData.playerStats;
        }
        
        saveData.version = '2.0';
        return saveData;
    }
    
    migrateFromV2(saveData) {
        // Example migration from v2.0
        if (saveData.gameData && !saveData.gameData.version) {
            saveData.gameData.version = '3.0';
        }
        
        saveData.version = '3.0';
        return saveData;
    }
    
    // Storage utilities
    createSavePackage(gameData, options = {}) {
        return {
            version: '3.0',
            timestamp: Date.now(),
            gameData,
            metadata: {
                isAutoSave: options.isAutoSave || false,
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                saveCount: this.stats.totalSaves + 1
            }
        };
    }
    
    async writeToStorage(key, data) {
        try {
            localStorage.setItem(key, data);
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                // Storage quota exceeded, try to free up space
                await this.freeUpStorage();
                localStorage.setItem(key, data); // Retry
            } else {
                throw error;
            }
        }
    }
    
    async readFromStorage(key) {
        return localStorage.getItem(key);
    }
    
    async removeFromStorage(key) {
        localStorage.removeItem(key);
    }
    
    async getAllStorageKeys() {
        return Object.keys(localStorage);
    }
    
    async freeUpStorage() {
        console.log('💾 Storage quota exceeded, cleaning up...');
        
        // Remove old backups beyond the limit
        const backups = await this.getBackupList();
        if (backups.length > 2) {
            const backupsToDelete = backups.slice(2);
            for (const backup of backupsToDelete) {
                await this.removeFromStorage(backup);
                console.log(`💾 Removed backup to free space: ${backup}`);
            }
        }
        
        // Remove other game data if needed
        const allKeys = await this.getAllStorageKeys();
        const gameKeys = allKeys.filter(key => key.startsWith(this.storageKey) && !key.includes('_backup_'));
        
        // Keep only the main save and one backup
        for (const key of gameKeys.slice(1)) {
            await this.removeFromStorage(key);
            console.log(`💾 Removed old save to free space: ${key}`);
        }
    }
    
    // Compression utilities (simple base64 encoding for demo)
    compressData(data) {
        try {
            return 'COMPRESSED:' + btoa(data);
        } catch (error) {
            console.warn('💾 Compression failed, saving uncompressed');
            return data;
        }
    }
    
    decompressData(data) {
        try {
            if (this.isCompressed(data)) {
                return atob(data.substring(11)); // Remove 'COMPRESSED:' prefix
            }
            return data;
        } catch (error) {
            console.warn('💾 Decompression failed, treating as uncompressed');
            return data;
        }
    }
    
    isCompressed(data) {
        return typeof data === 'string' && data.startsWith('COMPRESSED:');
    }
    
    // Stats and monitoring
    updateStorageStats() {
        try {
            let totalSize = 0;
            const keys = Object.keys(localStorage);
            
            for (const key of keys) {
                if (key.startsWith(this.storageKey)) {
                    totalSize += localStorage.getItem(key).length;
                }
            }
            
            this.stats.totalStorageUsed = totalSize;
        } catch (error) {
            console.warn('💾 Failed to update storage stats:', error);
        }
    }
    
    getStats() {
        return {
            ...this.stats,
            isAutoSaveEnabled: this.isAutoSaveEnabled,
            autoSaveInterval: this.autoSaveInterval,
            lastSaveTime: this.lastSaveTime,
            saveInProgress: this.saveInProgress,
            maxBackups: this.maxBackups,
            compressionEnabled: this.compressionEnabled
        };
    }
    
    // Utility methods
    gatherGameData() {
        // This will be overridden by the game to provide actual data
        if (window.voiceFarmGame) {
            const game = window.voiceFarmGame;
            return {
                resources: game.resourceManager.exportData(),
                selectedCrop: game.selectedCrop,
                farmData: game.farmGrid.getAllPlotData(),
                timers: game.timerManager ? game.timerManager.exportTimers() : null
            };
        }
        return null;
    }
    
    handleError(operation, error) {
        console.error(`💾 Storage ${operation} error:`, error);
        
        if (this.onError) {
            this.onError(operation, error);
        }
    }
    
    // Event handlers
    setSaveHandler(handler) {
        this.onSave = handler;
    }
    
    setLoadHandler(handler) {
        this.onLoad = handler;
    }
    
    setAutoSaveHandler(handler) {
        this.onAutoSave = handler;
    }
    
    setErrorHandler(handler) {
        this.onError = handler;
    }
    
    // Cleanup
    destroy() {
        this.disableAutoSave();
        console.log('💾 StorageManager destroyed');
    }
    
    // Export/Import for external backup systems
    async exportAllData() {
        const data = await this.load();
        const backups = await this.getBackupList();
        
        return {
            currentSave: data,
            backups: await Promise.all(
                backups.map(async (key) => ({
                    key,
                    data: JSON.parse(await this.readFromStorage(key))
                }))
            ),
            stats: this.getStats()
        };
    }
    
    async importAllData(exportData) {
        if (exportData.currentSave) {
            await this.save(exportData.currentSave.gameData, { force: true });
        }
        
        if (exportData.backups) {
            for (const backup of exportData.backups) {
                await this.writeToStorage(backup.key, JSON.stringify(backup.data));
            }
        }
        
        console.log('💾 Import completed');
    }
}