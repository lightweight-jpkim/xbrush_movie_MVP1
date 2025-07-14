/**
 * Model Storage Adapter
 * Provides a unified interface that works with both localStorage and Firebase
 * This allows gradual migration without breaking existing code
 */

class ModelStorageAdapter {
    constructor() {
        // Initialize for Firebase only
        this.useFirebase = false;
        this.firebaseStorage = null;
        this.initializationPromise = null;
        
        // Start Firebase initialization immediately
        this.initializationPromise = this.initializeFirebase();
        
        console.log('Model Storage Adapter initialized. Connecting to Firebase...');
    }
    
    async initializeFirebase() {
        // Wait for Firebase to initialize with retries
        let retries = 10;
        while (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if Firebase itself is loaded
            if (!window.firebase) {
                console.log('Model Storage Adapter: Firebase SDK not loaded yet...');
                retries--;
                continue;
            }
            
            // Check if our Firebase services are initialized
            if (window.firebaseModelStorage && window.firebaseDB) {
                this.firebaseStorage = window.firebaseModelStorage;
                this.useFirebase = true;
                console.log('Model Storage Adapter: Successfully connected to Firebase');
                return;
            }
            
            console.log(`Model Storage Adapter: Waiting for Firebase services... (${retries} retries left)`);
            console.log('Firebase status:', {
                firebase: !!window.firebase,
                firebaseDB: !!window.firebaseDB,
                firebaseModelStorage: !!window.firebaseModelStorage,
                firebaseAuth: !!window.firebaseAuth
            });
            retries--;
        }
        
        console.error('Model Storage Adapter: Firebase failed to initialize after 10 seconds');
        console.error('Final status:', {
            firebase: !!window.firebase,
            firebaseDB: !!window.firebaseDB,
            firebaseModelStorage: !!window.firebaseModelStorage
        });
        throw new Error('Firebase initialization failed. Please check your internet connection.');
    }

    /**
     * Ensure Firebase is initialized before operations
     */
    async ensureInitialized() {
        if (!this.useFirebase && this.initializationPromise) {
            await this.initializationPromise;
        }
        if (!this.useFirebase) {
            throw new Error('Firebase not initialized. Please check your internet connection and refresh the page.');
        }
    }

    /**
     * Save a model
     */
    async saveModel(modelData) {
        await this.ensureInitialized();
        
        try {
            return await this.firebaseStorage.saveModel(modelData);
        } catch (error) {
            console.error('Firebase save failed:', error);
            throw new Error('Failed to save model to Firebase. Please check your internet connection.');
        }
    }

    /**
     * Get a model by ID
     */
    async getModel(id) {
        await this.ensureInitialized();
        
        try {
            return await this.firebaseStorage.getModel(id);
        } catch (error) {
            console.error('Firebase get failed:', error);
            throw new Error('Failed to get model from Firebase. Please check your internet connection.');
        }
    }

    /**
     * Get all models
     */
    async getAllModels() {
        await this.ensureInitialized();
        
        try {
            const firebaseModels = await this.firebaseStorage.getAllModels();
            
            // One-time migration check on first load
            if (!this.migrationChecked) {
                this.migrationChecked = true;
                this.checkAndMigrateLocalData();
            }
            
            return firebaseModels;
        } catch (error) {
            console.error('Firebase getAllModels failed:', error);
            throw new Error('Failed to get models from Firebase. Please check your internet connection.');
        }
    }

    /**
     * Get active models
     */
    async getActiveModels() {
        await this.ensureInitialized();
        
        try {
            return await this.firebaseStorage.getActiveModels();
        } catch (error) {
            console.error('Firebase getActiveModels failed:', error);
            throw new Error('Failed to get active models from Firebase. Please check your internet connection.');
        }
    }

    /**
     * Get pending models
     */
    async getPendingModels() {
        await this.ensureInitialized();
        
        try {
            return await this.firebaseStorage.getPendingModels();
        } catch (error) {
            console.error('Firebase getPendingModels failed:', error);
            throw new Error('Failed to get pending models from Firebase. Please check your internet connection.');
        }
    }

    /**
     * Update a model
     */
    async updateModel(id, updates) {
        await this.ensureInitialized();
        
        try {
            return await this.firebaseStorage.updateModel(id, updates);
        } catch (error) {
            console.error('Firebase update failed:', error);
            throw new Error('Failed to update model in Firebase. Please check your internet connection.');
        }
    }

    /**
     * Delete a model
     */
    async deleteModel(id) {
        await this.ensureInitialized();
        
        try {
            return await this.firebaseStorage.deleteModel(id);
        } catch (error) {
            console.error('Firebase delete failed:', error);
            throw new Error('Failed to delete model from Firebase. Please check your internet connection.');
        }
    }

    /**
     * Search models
     */
    async searchModels(query) {
        await this.ensureInitialized();
        
        try {
            return await this.firebaseStorage.searchModels(query);
        } catch (error) {
            console.error('Firebase search failed:', error);
            throw new Error('Failed to search models in Firebase. Please check your internet connection.');
        }
    }

    /**
     * Update model tier (premium status)
     */
    async updateModelTier(modelId, tierData) {
        await this.ensureInitialized();
        
        try {
            const updates = {
                tier: tierData.tier,
                premiumBadge: tierData.badgeText || this.getDefaultBadge(tierData.tier),
                premiumStartDate: new Date().toISOString(),
                premiumEndDate: tierData.duration > 0 
                    ? new Date(Date.now() + tierData.duration * 30 * 24 * 60 * 60 * 1000).toISOString()
                    : null,
                sortPriority: parseInt(tierData.sortPriority) || 1000
            };
            
            return await this.firebaseStorage.updateModel(modelId, updates);
        } catch (error) {
            console.error('Failed to update model tier:', error);
            throw new Error('Failed to update model tier. Please check your internet connection.');
        }
    }
    
    /**
     * Get default badge for tier
     */
    getDefaultBadge(tier) {
        const badges = {
            premium: '⭐ 프리미엄 모델',
            vip: '💎 VIP 모델',
            basic: ''
        };
        return badges[tier] || '';
    }

    /**
     * Check and migrate local data on first load
     */
    async checkAndMigrateLocalData() {
        try {
            const localData = localStorage.getItem('xbrush_registered_models');
            if (localData) {
                const localModels = JSON.parse(localData);
                if (localModels.length > 0) {
                    console.log(`Found ${localModels.length} models in localStorage. Starting migration...`);
                    
                    // Show migration notification to user
                    if (window.showMigrationNotification) {
                        window.showMigrationNotification();
                    }
                    
                    // Migrate each model
                    for (const model of localModels) {
                        try {
                            await this.firebaseStorage.saveModel(model);
                            console.log(`Migrated model: ${model.id}`);
                        } catch (error) {
                            console.error(`Failed to migrate model ${model.id}:`, error);
                        }
                    }
                    
                    // Clear localStorage after successful migration
                    localStorage.removeItem('xbrush_registered_models');
                    console.log('Migration complete. Local storage cleared.');
                }
            }
        } catch (error) {
            console.error('Error checking local data for migration:', error);
        }
    }

    /**
     * Migrate a model to Firebase
     */
    async migrateToFirebase(model) {
        if (!this.useFirebase) return;
        
        try {
            console.log('Migrating model to Firebase:', model.id);
            await this.firebaseStorage.saveModel(model);
        } catch (error) {
            console.error('Failed to migrate model to Firebase:', error);
        }
    }

    /**
     * Migrate all localStorage models to Firebase
     */
    async migrateAllToFirebase() {
        if (!this.useFirebase) {
            console.log('Firebase not available for migration');
            return;
        }
        
        try {
            const localModels = this.localStorage.getAllModels();
            console.log(`Migrating ${localModels.length} models to Firebase...`);
            
            for (const model of localModels) {
                await this.migrateToFirebase(model);
            }
            
            console.log('Migration complete!');
            return true;
        } catch (error) {
            console.error('Migration failed:', error);
            return false;
        }
    }
}

// Create global instance after Firebase is ready
function initializeModelStorageAdapter() {
    console.log('Creating ModelStorageAdapter instance...');
    window.modelStorageAdapter = new ModelStorageAdapter();
    
    // For backward compatibility, override the global modelStorage
    window.modelStorage = {
        saveModel: (data) => window.modelStorageAdapter.saveModel(data),
        getModel: (id) => window.modelStorageAdapter.getModel(id),
        getAllModels: () => window.modelStorageAdapter.getAllModels(),
        getActiveModels: () => window.modelStorageAdapter.getActiveModels(),
        getPendingModels: () => window.modelStorageAdapter.getPendingModels(),
        updateModel: (id, updates) => window.modelStorageAdapter.updateModel(id, updates),
        deleteModel: (id) => window.modelStorageAdapter.deleteModel(id),
        searchModels: (query) => window.modelStorageAdapter.searchModels(query)
    };
}

// Initialize immediately (adapter will wait for Firebase internally)
initializeModelStorageAdapter();