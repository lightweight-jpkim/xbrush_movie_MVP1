/**
 * Model Storage Adapter
 * Provides a unified interface that works with both localStorage and Firebase
 * This allows gradual migration without breaking existing code
 */

class ModelStorageAdapter {
    constructor() {
        // Initialize with localStorage first
        this.useFirebase = false;
        this.localStorage = window.modelStorage;
        this.firebaseStorage = null;
        
        // Try to initialize Firebase after a delay
        this.initializeFirebase();
        
        console.log('Model Storage Adapter initialized. Starting with localStorage');
    }
    
    async initializeFirebase() {
        // Wait a bit for Firebase to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (window.firebaseModelStorage && window.firebaseDB) {
            this.firebaseStorage = window.firebaseModelStorage;
            this.useFirebase = true;
            console.log('Model Storage Adapter: Switched to Firebase');
        } else {
            console.log('Model Storage Adapter: Firebase not available, continuing with localStorage');
        }
    }

    /**
     * Save a model
     */
    async saveModel(modelData) {
        if (!this.useFirebase) {
            throw new Error('Firebase not initialized. Please check your internet connection and refresh the page.');
        }
        
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
        if (!this.useFirebase) {
            throw new Error('Firebase not initialized. Please check your internet connection and refresh the page.');
        }
        
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
        if (!this.useFirebase) {
            throw new Error('Firebase not initialized. Please check your internet connection and refresh the page.');
        }
        
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
        if (!this.useFirebase) {
            throw new Error('Firebase not initialized. Please check your internet connection and refresh the page.');
        }
        
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
        if (!this.useFirebase) {
            throw new Error('Firebase not initialized. Please check your internet connection and refresh the page.');
        }
        
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
        if (!this.useFirebase) {
            throw new Error('Firebase not initialized. Please check your internet connection and refresh the page.');
        }
        
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
        if (!this.useFirebase) {
            throw new Error('Firebase not initialized. Please check your internet connection and refresh the page.');
        }
        
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
        if (!this.useFirebase) {
            throw new Error('Firebase not initialized. Please check your internet connection and refresh the page.');
        }
        
        try {
            return await this.firebaseStorage.searchModels(query);
        } catch (error) {
            console.error('Firebase search failed:', error);
            throw new Error('Failed to search models in Firebase. Please check your internet connection.');
        }
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

// Create global instance
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