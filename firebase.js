// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6UDwZBwRJxPJjVo5NkoXUitBZ93jaqMc",
  authDomain: "kayraokulu.firebaseapp.com",
  databaseURL: "https://kayraokulu-default-rtdb.firebaseio.com",
  projectId: "kayraokulu",
  storageBucket: "kayraokulu.firebasestorage.app",
  messagingSenderId: "1057965536521",
  appId: "1:1057965536521:web:67d1bd5c0b0a76950a0fd8",
  measurementId: "G-2TKESSQH6K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Realtime Database referansı
const database = firebase.database();
