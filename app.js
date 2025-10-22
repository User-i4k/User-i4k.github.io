// app.js

// Firebase yapılandırma dosyasını içe aktar
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onChildAdded } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase yapılandırma ayarları
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
const analytics = getAnalytics(app);

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Oda listesi
const chatRooms = ['Genel', 'Oyun Sohbeti'];

// DOM elemanları
const roomList = document.getElementById('room-list');
const messageInput = document.getElementById('message-input');
const messageList = document.getElementById('message-list');
const logoutButton = document.getElementById('logout-button');

// Kullanıcı adı kontrolü
window.onload = function() {
    const username = localStorage.getItem('username');
    if (!username) {
        const name = prompt("Kullanıcı adınızı girin:");
        localStorage.setItem('username', name);
        signInAnonymously(auth)
            .catch((error) => {
                console.error("Oturum açma hatası:", error);
            });
    } else {
        signInAnonymously(auth)
            .catch((error) => {
                console.error("Oturum açma hatası:", error);
            });
    }
    loadChatRooms();
};

// Oda listesini yükle
function loadChatRooms() {
    chatRooms.forEach(room => {
        const roomItem = document.createElement('li');
        roomItem.textContent = room;
        roomItem.onclick = () => loadChatRoom(room);
        roomList.appendChild(roomItem);
    });
}

// Belirli bir odayı yükle
function loadChatRoom(room) {
    const messagesRef = ref(database, 'messages/' + room);
    onChildAdded(messagesRef, (data) => {
        const message = data.val();
        const messageItem = document.createElement('li');
        messageItem.textContent = `${message.username}: ${message.text}`;
        messageList.appendChild(messageItem);
    });

    // Mesaj gönderme
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const messageText = messageInput.value;
            const username = localStorage.getItem('username');
            set(ref(database, 'messages/' + room + '/' + Date.now()), {
                username: username,
                text: messageText
            });
            messageInput.value = '';
        }
    });
}

// Çıkış yapma
logoutButton.onclick = function() {
    localStorage.removeItem('username');
    window.location.reload();
};
