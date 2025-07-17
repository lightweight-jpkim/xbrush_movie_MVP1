/**
 * Application Configuration
 * Centralized configuration for xBrush MovieMaker MVP
 */

window.AppConfig = {
    // Firebase Configuration
    getFirebaseConfig: function() {
        return {
            apiKey: "AIzaSyCsQzvoYysNkHcxR4NztCdqTVkD_HgtJEU",
            authDomain: "xbrush-moviemaker-mvp.firebaseapp.com",
            projectId: "xbrush-moviemaker-mvp",
            storageBucket: "xbrush-moviemaker-mvp.firebasestorage.app",
            messagingSenderId: "138732810619",
            appId: "1:138732810619:web:a35c938d2d3b2880db4dde"
        };
    },
    
    // Application Settings
    appName: "xBrush MovieMaker",
    version: "1.0.0",
    
    // API Endpoints (if any)
    api: {
        baseUrl: "",
    },
    
    // Feature Flags
    features: {
        enableFirebase: true,
        enableLocalStorage: true,
        enableAnonymousAuth: false,
        debugMode: false
    },
    
    // Helper function to check if a feature is enabled
    isFeatureEnabled: function(featureName) {
        return this.features[featureName] || false;
    }
};

console.log('AppConfig loaded');