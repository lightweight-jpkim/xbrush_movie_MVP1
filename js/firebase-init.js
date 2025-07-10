/**
 * Firebase Initialization Manager
 * Ensures Firebase is properly initialized before use
 */

window.firebaseReady = new Promise((resolve, reject) => {
    let checkCount = 0;
    const maxChecks = 50; // 5 seconds timeout
    
    function checkFirebase() {
        checkCount++;
        
        // Check if Firebase is loaded
        if (window.firebase && window.firebase.apps && window.firebase.apps.length > 0) {
            // Check if Firestore and Storage are available
            if (window.firebaseDB && window.firebaseStorage) {
                console.log('Firebase fully initialized');
                resolve(true);
                return;
            }
        }
        
        if (checkCount >= maxChecks) {
            console.error('Firebase initialization timeout');
            reject(new Error('Firebase initialization timeout'));
            return;
        }
        
        // Check again in 100ms
        setTimeout(checkFirebase, 100);
    }
    
    // Start checking after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkFirebase);
    } else {
        checkFirebase();
    }
});

// Enhanced storage adapter that waits for Firebase
class FirebaseAwareModelStorage {
    constructor() {
        this.localAdapter = window.modelStorage;
        this.firebaseAdapter = null;
        this.ready = this.init();
    }
    
    async init() {
        try {
            await window.firebaseReady;
            if (window.firebaseModelStorage) {
                this.firebaseAdapter = window.firebaseModelStorage;
                console.log('Using Firebase for model storage');
                return true;
            }
        } catch (error) {
            console.warn('Firebase not available, using localStorage:', error);
        }
        return false;
    }
    
    async ensureReady() {
        await this.ready;
    }
    
    async saveModel(modelData) {
        await this.ensureReady();
        if (this.firebaseAdapter) {
            try {
                return await this.firebaseAdapter.saveModel(modelData);
            } catch (error) {
                console.error('Firebase save failed:', error);
            }
        }
        return this.localAdapter.saveModel(modelData);
    }
    
    async getModel(id) {
        await this.ensureReady();
        if (this.firebaseAdapter) {
            try {
                return await this.firebaseAdapter.getModel(id);
            } catch (error) {
                console.error('Firebase get failed:', error);
            }
        }
        return this.localAdapter.getModel(id);
    }
    
    async getAllModels() {
        await this.ensureReady();
        if (this.firebaseAdapter) {
            try {
                return await this.firebaseAdapter.getAllModels();
            } catch (error) {
                console.error('Firebase getAllModels failed:', error);
            }
        }
        return this.localAdapter.getAllModels();
    }
    
    async getActiveModels() {
        await this.ensureReady();
        if (this.firebaseAdapter) {
            try {
                return await this.firebaseAdapter.getActiveModels();
            } catch (error) {
                console.error('Firebase getActiveModels failed:', error);
            }
        }
        return this.localAdapter.getActiveModels();
    }
    
    async updateModel(id, updates) {
        await this.ensureReady();
        if (this.firebaseAdapter) {
            try {
                return await this.firebaseAdapter.updateModel(id, updates);
            } catch (error) {
                console.error('Firebase update failed:', error);
            }
        }
        return this.localAdapter.updateModel(id, updates);
    }
    
    async deleteModel(id) {
        await this.ensureReady();
        if (this.firebaseAdapter) {
            try {
                return await this.firebaseAdapter.deleteModel(id);
            } catch (error) {
                console.error('Firebase delete failed:', error);
            }
        }
        return this.localAdapter.deleteModel(id);
    }
}

// Replace the global modelStorage with Firebase-aware version
window.addEventListener('DOMContentLoaded', () => {
    const firebaseAwareStorage = new FirebaseAwareModelStorage();
    
    // Override window.modelStorage with async-aware methods
    window.modelStorage = {
        saveModel: (data) => firebaseAwareStorage.saveModel(data),
        getModel: (id) => firebaseAwareStorage.getModel(id),
        getAllModels: () => firebaseAwareStorage.getAllModels(),
        getActiveModels: () => firebaseAwareStorage.getActiveModels(),
        getPendingModels: () => firebaseAwareStorage.getPendingModels ? firebaseAwareStorage.getPendingModels() : [],
        updateModel: (id, updates) => firebaseAwareStorage.updateModel(id, updates),
        deleteModel: (id) => firebaseAwareStorage.deleteModel(id),
        searchModels: (query) => firebaseAwareStorage.searchModels ? firebaseAwareStorage.searchModels(query) : []
    };
    
    console.log('Firebase-aware model storage initialized');
});