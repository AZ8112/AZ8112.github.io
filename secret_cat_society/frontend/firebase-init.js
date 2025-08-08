// firebase-init.js

// Check that firebaseConfig is defined (make sure firebase-config.js is loaded before this)
if (typeof firebaseConfig === 'undefined') {
    console.error("firebaseConfig is not defined. Did you load firebase-config.js before this?");
} else {
    // Initialize Firebase only if it hasn't been already
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully.");
    } else {
        console.log("Firebase already initialized.");
    }

    window.db = firebase.firestore();
}
