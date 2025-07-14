// Standalone Firebase Initialization for Database Tools
// This file can be used when config.js is not available

(function() {
    // Direct Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBaCw-ZaZRm7bLSrGX4p5IwZFqDxLINctE",
        authDomain: "xbrush-moviemaker-mvp.firebaseapp.com",
        projectId: "xbrush-moviemaker-mvp",
        storageBucket: "xbrush-moviemaker-mvp.appspot.com",
        messagingSenderId: "41892013651",
        appId: "1:41892013651:web:d13c1ad40b7ffe96c09d93",
        measurementId: "G-FZ4NMZQB7Y"
    };

    // Initialize Firebase if not already initialized
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized (standalone)');
    } else {
        console.log('Firebase already initialized');
    }

    // Initialize services
    window.firebaseDB = firebase.firestore();
    window.firebaseAuth = firebase.auth();
    window.firebaseStorage = firebase.storage();

    // Sign in anonymously for database access
    firebase.auth().signInAnonymously()
        .then(() => {
            console.log('Anonymous auth successful');
        })
        .catch((error) => {
            console.warn('Anonymous auth failed:', error.message);
            // Continue anyway - auth might not be required
        });

    // Dispatch ready event
    window.dispatchEvent(new Event('firebaseReady'));
})();