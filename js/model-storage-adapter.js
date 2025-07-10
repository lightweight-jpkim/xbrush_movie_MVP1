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
        if (this.useFirebase) {
            try {
                return await this.firebaseStorage.saveModel(modelData);
            } catch (error) {
                console.error('Firebase save failed, falling back to localStorage:', error);
                return this.localStorage.saveModel(modelData);
            }
        } else {
            return this.localStorage.saveModel(modelData);
        }
    }

    /**
     * Get a model by ID
     */
    async getModel(id) {
        if (this.useFirebase) {
            try {
                const model = await this.firebaseStorage.getModel(id);
                return model || this.localStorage.getModel(id);
            } catch (error) {
                console.error('Firebase get failed, falling back to localStorage:', error);
                return this.localStorage.getModel(id);
            }
        } else {
            return this.localStorage.getModel(id);
        }
    }

    /**
     * Get all models
     */
    async getAllModels() {
        if (this.useFirebase) {
            try {
                const firebaseModels = await this.firebaseStorage.getAllModels();
                // Also get localStorage models for migration
                const localModels = this.localStorage.getAllModels();
                
                // Merge and deduplicate
                const modelMap = new Map();
                firebaseModels.forEach(model => modelMap.set(model.id, model));
                localModels.forEach(model => {
                    if (!modelMap.has(model.id)) {
                        modelMap.set(model.id, model);
                        // Migrate to Firebase in background
                        this.migrateToFirebase(model);
                    }
                });
                
                return Array.from(modelMap.values());
            } catch (error) {
                console.error('Firebase getAllModels failed, falling back to localStorage:', error);
                return this.localStorage.getAllModels();
            }
        } else {
            return this.localStorage.getAllModels();
        }
    }

    /**
     * Get active models
     */
    async getActiveModels() {
        if (this.useFirebase) {
            try {
                const firebaseModels = await this.firebaseStorage.getActiveModels();
                // Also check localStorage for any not yet migrated
                const localModels = this.localStorage.getActiveModels();
                
                // Merge and deduplicate
                const modelMap = new Map();
                firebaseModels.forEach(model => modelMap.set(model.id, model));
                localModels.forEach(model => {
                    if (!modelMap.has(model.id)) {
                        modelMap.set(model.id, model);
                        // Migrate to Firebase in background
                        this.migrateToFirebase(model);
                    }
                });
                
                return Array.from(modelMap.values());
            } catch (error) {
                console.error('Firebase getActiveModels failed, falling back to localStorage:', error);
                return this.localStorage.getActiveModels();
            }
        } else {
            return this.localStorage.getActiveModels();
        }
    }

    /**
     * Get pending models
     */
    async getPendingModels() {
        if (this.useFirebase) {
            try {
                return await this.firebaseStorage.getPendingModels();
            } catch (error) {
                console.error('Firebase getPendingModels failed, falling back to localStorage:', error);
                return this.localStorage.getPendingModels();
            }
        } else {
            return this.localStorage.getPendingModels();
        }
    }

    /**
     * Update a model
     */
    async updateModel(id, updates) {
        if (this.useFirebase) {
            try {
                const success = await this.firebaseStorage.updateModel(id, updates);
                // Also update localStorage for consistency
                this.localStorage.updateModel(id, updates);
                return success;
            } catch (error) {
                console.error('Firebase update failed, falling back to localStorage:', error);
                return this.localStorage.updateModel(id, updates);
            }
        } else {
            return this.localStorage.updateModel(id, updates);
        }
    }

    /**
     * Delete a model
     */
    async deleteModel(id) {
        if (this.useFirebase) {
            try {
                const success = await this.firebaseStorage.deleteModel(id);
                // Also delete from localStorage
                this.localStorage.deleteModel(id);
                return success;
            } catch (error) {
                console.error('Firebase delete failed, falling back to localStorage:', error);
                return this.localStorage.deleteModel(id);
            }
        } else {
            return this.localStorage.deleteModel(id);
        }
    }

    /**
     * Search models
     */
    async searchModels(query) {
        if (this.useFirebase) {
            try {
                return await this.firebaseStorage.searchModels(query);
            } catch (error) {
                console.error('Firebase search failed, falling back to localStorage:', error);
                return this.localStorage.searchModels(query);
            }
        } else {
            return this.localStorage.searchModels(query);
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