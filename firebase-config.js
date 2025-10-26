// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, push, onValue, remove, get, child };
