import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { firebaseConfig } from './config.js';

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Kullanıcı adı formunu dinle
document.getElementById('usernameForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('usernameInput').value.trim();
    
    if (username.length < 3) {
        alert('Kullanıcı adı en az 3 karakter olmalıdır!');
        return;
    }
    
    if (username.length > 20) {
        alert('Kullanıcı adı en fazla 20 karakter olabilir!');
        return;
    }
    
    try {
        // Kullanıcı adını sanitize et (XSS koruması)
        const sanitizedUsername = username
            .replace(/[<>]/g, '') // HTML tag karakterlerini temizle
            .trim()
            .substring(0, 20); // Maksimum uzunluk
        
        // Anonim giriş yap
        await signInAnonymously(auth);
        
        // Auth başarılı olduktan sonra localStorage'a kaydet
        try {
            localStorage.setItem('mobaGameUsername', sanitizedUsername);
        } catch (storageError) {
            // LocalStorage dolu olabilir, yine de devam et
            console.warn('LocalStorage yazılamadı:', storageError);
        }
        
        // Oyun sayfasına yönlendir
        window.location.href = 'game.html';
    } catch (error) {
        console.error('Giriş hatası:', error);
        alert('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
});

