// app.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js';

// Firebase ayarları
const firebaseConfig = {
  apiKey: "AIzaSyBxGSxaTj0J3lhnyQrwC9hDGs7-tKq600c",
  authDomain: "okul-sohbet-794d0.firebaseapp.com",
  databaseURL: "https://okul-sohbet-794d0-default-rtdb.firebaseio.com",
  projectId: "okul-sohbet-794d0",
  storageBucket: "okul-sohbet-794d0.firebasestorage.app",
  messagingSenderId: "849190115812",
  appId: "1:849190115812:web:70e78485af056296720ff1"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Diğer dosyaların kullanabilmesi için dışa aktar
export { db };
