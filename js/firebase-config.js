/**
 * Firebase Configuration and Initialization
 * For xBrush MovieMaker MVP
 */

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsQzvoYysNkHcxR4NztCdqTVkD_HgtJEU",
  authDomain: "xbrush-moviemaker-mvp.firebaseapp.com",
  projectId: "xbrush-moviemaker-mvp",
  storageBucket: "xbrush-moviemaker-mvp.firebasestorage.app",
  messagingSenderId: "138732810619",
  appId: "1:138732810619:web:a35c938d2d3b2880db4dde"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Initialize Storage for images
const storage = firebase.storage();

// Initialize Auth
const auth = firebase.auth();

// Enable Firestore offline persistence
db.enablePersistence()
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support offline persistence');
        }
    });

// Initialize anonymous authentication
auth.signInAnonymously()
    .then(() => {
        console.log('Anonymous authentication successful');
    })
    .catch((error) => {
        console.error('Authentication error:', error);
        // Continue without auth for now
    });

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

// Export for use in other files
window.firebaseDB = db;
window.firebaseStorage = storage;
window.firebaseAuth = auth;

console.log('Firebase initialized successfully');