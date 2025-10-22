// app.js

// Firebase yapılandırma dosyasını içe aktar
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onChildAdded } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase yapılandırma ayarları
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DB_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

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