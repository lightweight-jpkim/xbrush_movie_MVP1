/**
 * Model Storage Manager
 * Handles localStorage operations for model registration data
 */

class ModelStorage {
    constructor() {
        this.storageKey = 'xbrush_registered_models';
        this.initStorage();
    }

    /**
     * Initialize storage if it doesn't exist
     */
    initStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    /**
     * Get all models from storage
     */
    getAllModels() {
        try {
            const models = localStorage.getItem(this.storageKey);
            return JSON.parse(models) || [];
        } catch (error) {
            console.error('Error reading models from storage:', error);
            return [];
        }
    }

    /**
     * Get a single model by ID
     */
    getModelById(modelId) {
        const models = this.getAllModels();
        return models.find(model => model.id === modelId);
    }

    /**
     * Save a new model
     */
    saveModel(modelData) {
        try {
            const models = this.getAllModels();
            
            // Generate unique ID if not provided
            if (!modelData.id) {
                modelData.id = `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            
            // Add registration timestamp
            modelData.registrationDate = new Date().toISOString();
            modelData.status = modelData.status || 'pending';
            
            models.push(modelData);
            localStorage.setItem(this.storageKey, JSON.stringify(models));
            
            console.log('Model saved successfully:', modelData.id);
            return modelData.id;
        } catch (error) {
            console.error('Error saving model:', error);
            throw error;
        }
    }

    /**
     * Update an existing model
     */
    updateModel(modelId, updates) {
        try {
            const models = this.getAllModels();
            const index = models.findIndex(model => model.id === modelId);
            
            if (index === -1) {
                throw new Error('Model not found');
            }
            
            models[index] = { ...models[index], ...updates };
            localStorage.setItem(this.storageKey, JSON.stringify(models));
            
            return models[index];
        } catch (error) {
            console.error('Error updating model:', error);
            throw error;
        }
    }

    /**
     * Delete a model
     */
    deleteModel(modelId) {
        try {
            const models = this.getAllModels();
            const filteredModels = models.filter(model => model.id !== modelId);
            
            localStorage.setItem(this.storageKey, JSON.stringify(filteredModels));
            return true;
        } catch (error) {
            console.error('Error deleting model:', error);
            return false;
        }
    }

    /**
     * Get models by status
     */
    getModelsByStatus(status) {
        const models = this.getAllModels();
        return models.filter(model => model.status === status);
    }

    /**
     * Get active models for display
     */
    getActiveModels() {
        return this.getModelsByStatus('active');
    }

    /**
     * Search models by name or intro
     */
    searchModels(query) {
        const models = this.getAllModels();
        const lowerQuery = query.toLowerCase();
        
        return models.filter(model => {
            const name = model.personalInfo?.name?.toLowerCase() || '';
            const intro = model.personalInfo?.intro?.toLowerCase() || '';
            const description = model.personalInfo?.description?.toLowerCase() || '';
            
            return name.includes(lowerQuery) || 
                   intro.includes(lowerQuery) || 
                   description.includes(lowerQuery);
        });
    }

    /**
     * Filter models by categories
     */
    filterByCategories(categories) {
        const models = this.getAllModels();
        
        if (!categories || categories.length === 0) {
            return models;
        }
        
        return models.filter(model => {
            const modelCategories = model.personalInfo?.categories || [];
            return categories.some(cat => modelCategories.includes(cat));
        });
    }

    /**
     * Get storage size info
     */
    getStorageInfo() {
        const models = this.getAllModels();
        const storageString = JSON.stringify(models);
        const sizeInBytes = new Blob([storageString]).size;
        
        return {
            modelCount: models.length,
            sizeInBytes: sizeInBytes,
            sizeInMB: (sizeInBytes / (1024 * 1024)).toFixed(2),
            remainingSpace: ((5 * 1024 * 1024) - sizeInBytes) // Assuming 5MB limit
        };
    }

    /**
     * Export all models as JSON
     */
    exportModels() {
        const models = this.getAllModels();
        const dataStr = JSON.stringify(models, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `xbrush_models_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    /**
     * Import models from JSON file
     */
    importModels(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importedModels = JSON.parse(e.target.result);
                    
                    if (!Array.isArray(importedModels)) {
                        throw new Error('Invalid file format');
                    }
                    
                    // Merge with existing models
                    const existingModels = this.getAllModels();
                    const mergedModels = [...existingModels, ...importedModels];
                    
                    localStorage.setItem(this.storageKey, JSON.stringify(mergedModels));
                    resolve(importedModels.length);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.readAsText(file);
        });
    }
}

// Create global instance
window.modelStorage = new ModelStorage();