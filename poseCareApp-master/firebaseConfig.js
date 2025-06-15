// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // Firestore kullanacaksan
import { getAuth } from 'firebase/auth'; // Kullanýcý oturumu açma için

const firebaseConfig = {
    apiKey: "AIzaSyAcleNvMQ3zIqK9c-PQu01VLK-IH6997ds",
    authDomain: "posecare-73e3a.firebaseapp.com",
    projectId: "posecare-73e3a",
    storageBucket: "posecare-73e3a.appspot.com",
    messagingSenderId: "1082483442368",
    appId: "1:1082483442368:web:2814970ef9d6c5280a6325",
};

// Firebase'i baþlat
const app = initializeApp(firebaseConfig);

// Firestore ve Auth instance'larýný al
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
