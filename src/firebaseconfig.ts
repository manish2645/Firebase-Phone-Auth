// Import the functions you need from the SDKs you need
import { getApps, initializeApp, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDZgdCpEAkVk6bNoObdStXFot-SAB02AEs",
    authDomain: "travelesimconnect.firebaseapp.com",
    projectId: "travelesimconnect",
    storageBucket: "travelesimconnect.appspot.com",
    messagingSenderId: "481664715976",
    appId: "1:481664715976:web:90eddb049de9dde4dde9fd",
    measurementId: "G-P2ZXZ2HTSZ"
  };

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();

export { auth };