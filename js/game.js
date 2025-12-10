import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase, ref, onValue, set, onDisconnect, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { firebaseConfig } from './config.js';
import { GameEngine } from './gameEngine.js';

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// LocalStorage kontrolü - sayfa yüklendiğinde kontrol et
let username = null;

// DOM elementleri
let characterSelect, gameContainer, characterCards, playerNameSpan, playerCharacterSpan;

window.addEventListener('DOMContentLoaded', () => {
    // DOM elementlerini al
    characterSelect = document.getElementById('characterSelect');
    gameContainer = document.getElementById('gameContainer');
    characterCards = document.querySelectorAll('.character-card');
    playerNameSpan = document.getElementById('playerName');
    playerCharacterSpan = document.getElementById('playerCharacter');
    
    // Önce auth durumunu kontrol et
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Auth yok, localStorage'ı temizle ve yönlendir
            localStorage.removeItem('mobaGameUsername');
            alert('Lütfen önce kullanıcı adınızı girin!');
            window.location.href = 'index.html';
            return;
        }
        
        // Auth var, localStorage'ı kontrol et
        username = localStorage.getItem('mobaGameUsername');
        if (!username) {
            // LocalStorage yok ama auth var (farklı cihazdan giriş)
            // Kullanıcıdan tekrar iste veya auth'tan al
            alert('Kullanıcı adı bulunamadı. Lütfen tekrar giriş yapın.');
            localStorage.removeItem('mobaGameUsername');
            window.location.href = 'index.html';
            return;
        }
        
        // Her iki kontrol de geçti, karakter seçim ekranını göster
        characterSelect.style.display = 'flex';
        
        // Karakter seçim event listener'larını ekle
        setupCharacterSelection();
    });
});

// Karakter tanımları
const characterTypes = {
    warrior: {
        name: 'Savaşçı',
        color: '#e74c3c',
        abilities: {
            Q: { name: 'Keskin Kılıç', cooldown: 3000 },
            W: { name: 'Saldırı Hızı', cooldown: 5000 },
            E: { name: 'Sıçrama', cooldown: 4000 },
            R: { name: 'Öfke', cooldown: 10000 }
        }
    },
    mage: {
        name: 'Büyücü',
        color: '#9b59b6',
        abilities: {
            Q: { name: 'Ateş Topu', cooldown: 2500 },
            W: { name: 'Buz Duvarı', cooldown: 6000 },
            E: { name: 'Işınlanma', cooldown: 8000 },
            R: { name: 'Meteor Yağmuru', cooldown: 12000 }
        }
    },
    tank: {
        name: 'Tank',
        color: '#3498db',
        abilities: {
            Q: { name: 'Kalkan Vuruşu', cooldown: 4000 },
            W: { name: 'Savunma Modu', cooldown: 6000 },
            E: { name: 'Çekme', cooldown: 5000 },
            R: { name: 'Zırh Patlaması', cooldown: 15000 }
        }
    },
    marksman: {
        name: 'Nişancı',
        color: '#f39c12',
        abilities: {
            Q: { name: 'Hızlı Ok', cooldown: 2000 },
            W: { name: 'Kelebek Adım', cooldown: 4000 },
            E: { name: 'Tuzak', cooldown: 6000 },
            R: { name: 'Keskin Nişan', cooldown: 9000 }
        }
    }
};

let selectedCharacter = null;
let gameEngine = null;
let playerRef = null;

// Karakter seçimi
function setupCharacterSelection() {
    characterCards.forEach(card => {
        card.addEventListener('click', () => {
            if (!username) {
                alert('Kullanıcı adı bulunamadı!');
                window.location.href = 'index.html';
                return;
            }
            
            // Seçim animasyonu
            characterCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            selectedCharacter = card.dataset.character;
            const character = characterTypes[selectedCharacter];
            
            // UI güncelle
            playerNameSpan.textContent = `Oyuncu: ${username}`;
            playerCharacterSpan.textContent = `Karakter: ${character.name}`;
            
            // Yetenek isimlerini göster
            document.getElementById('abilityQName').textContent = character.abilities.Q.name;
            document.getElementById('abilityWName').textContent = character.abilities.W.name;
            document.getElementById('abilityEName').textContent = character.abilities.E.name;
            document.getElementById('abilityRName').textContent = character.abilities.R.name;
            
            // Fade out animasyonu
            characterSelect.style.opacity = '0';
            characterSelect.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                characterSelect.style.display = 'none';
                gameContainer.classList.remove('hidden');
                gameContainer.style.opacity = '0';
                gameContainer.style.transition = 'opacity 0.5s ease';
                
                // Fade in animasyonu
                setTimeout(() => {
                    gameContainer.style.opacity = '1';
                }, 50);
                
                // Oyunu başlat
                initializeGame();
            }, 500);
        });
        
        // Hover efekti
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-12px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('selected')) {
                card.style.transform = '';
            }
        });
    });
}

// Oyunu başlat
function initializeGame() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Firebase'de oyuncu verisini oluştur
            playerRef = ref(database, `players/${user.uid}`);
            
            // Canvas boyutuna göre başlangıç pozisyonu
            const canvas = document.getElementById('gameCanvas');
            const startX = Math.random() * (canvas.width - 200) + 100;
            const startY = Math.random() * (canvas.height - 200) + 100;
            
            const initialData = {
                username: username,
                character: selectedCharacter,
                x: startX,
                y: startY,
                color: characterTypes[selectedCharacter].color,
                timestamp: serverTimestamp()
            };
            
            set(playerRef, initialData);
            
            // Bağlantı kesildiğinde oyuncuyu sil
            onDisconnect(playerRef).remove();
            
            // Oyun motorunu başlat
            gameEngine = new GameEngine(
                document.getElementById('gameCanvas'),
                user.uid,
                username,
                selectedCharacter,
                characterTypes[selectedCharacter],
                playerRef,
                database
            );
            
            gameEngine.start();
            
            // Çıkış butonu event listener
            document.getElementById('exitButton').addEventListener('click', () => {
                if (confirm('Oyundan çıkmak istediğinize emin misiniz?')) {
                    // Firebase'den oyuncuyu sil
                    if (playerRef) {
                        set(playerRef, null);
                    }
                    // LocalStorage'ı temizle
                    localStorage.removeItem('mobaGameUsername');
                    // Ana sayfaya yönlendir
                    window.location.href = 'index.html';
                }
            });
        } else {
            alert('Kimlik doğrulama hatası!');
            window.location.href = 'index.html';
        }
    });
}

