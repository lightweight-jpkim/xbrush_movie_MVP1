/**
 * Application Configuration
 * Centralized configuration for xBrush MovieMaker MVP
 */

window.AppConfig = {
    // Firebase Configuration
    getFirebaseConfig: function() {
        return {
            apiKey: "AIzaSyDKEEwYE0xq_Pb4RXyEjxD4N4ahXQT9DF0",
            authDomain: "xbrush-48b47.firebaseapp.com",
            projectId: "xbrush-48b47",
            storageBucket: "xbrush-48b47.appspot.com",
            messagingSenderId: "613805779826",
            appId: "1:613805779826:web:6a693cf4240b2cc0c3326f"
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