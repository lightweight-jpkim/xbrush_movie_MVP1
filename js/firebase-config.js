/**
 * Firebase Configuration and Initialization
 * For xBrush MovieMaker MVP
 */

// Function to initialize Firebase when SDK is ready
function initializeFirebaseServices() {
    // Check if Firebase SDK is loaded
    if (!window.firebase) {
        console.log('Waiting for Firebase SDK...');
        setTimeout(initializeFirebaseServices, 100);
        return;
    }

    console.log('Firebase SDK detected, initializing...');

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCsQzvoYysNkHcxR4NztCdqTVkD_HgtJEU",
        authDomain: "xbrush-moviemaker-mvp.firebaseapp.com",
        projectId: "xbrush-moviemaker-mvp",
        storageBucket: "xbrush-moviemaker-mvp.firebasestorage.app",
        messagingSenderId: "138732810619",
        appId: "1:138732810619:web:a35c938d2d3b2880db4dde"
    };

    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase app initialized');

        // Initialize Firestore
        const db = firebase.firestore();
        window.firebaseDB = db;
        console.log('Firestore initialized');

        // Initialize Storage for images
        const storage = firebase.storage();
        window.firebaseStorage = storage;
        console.log('Storage initialized');

        // Initialize Auth
        const auth = firebase.auth();
        window.firebaseAuth = auth;
        console.log('Auth initialized');

        // Enable Firestore offline persistence
        db.enablePersistence()
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
                } else if (err.code === 'unimplemented') {
                    console.warn('The current browser does not support offline persistence');
                }
            });

        // Initialize anonymous authentication (commented out until enabled in Firebase Console)
        // Uncomment after enabling Anonymous auth in Firebase Console
        /*
        auth.signInAnonymously()
            .then(() => {
                console.log('Anonymous authentication successful');
            })
            .catch((error) => {
                console.error('Authentication error:', error);
                // Continue without auth for now
            });
        */
        console.log('Skipping authentication for now - enable Anonymous auth in Firebase Console');

        // Monitor auth state
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('User authenticated:', user.uid);
                window.firebaseUser = user;
            } else {
                console.log('User not authenticated');
                window.firebaseUser = null;
            }
        });

        console.log('Firebase initialized successfully');
        
        // Trigger event to notify other scripts
        window.dispatchEvent(new Event('firebaseReady'));
        
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
}

// Start initialization
initializeFirebaseServices();