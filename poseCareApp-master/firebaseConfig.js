// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // Firestore kullanacaksan
import { getAuth } from 'firebase/auth'; // Kullanýcý oturumu açma için



// Firebase'i baţlat
const app = initializeApp(firebaseConfig);

// Firestore ve Auth instance'larýný al
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
