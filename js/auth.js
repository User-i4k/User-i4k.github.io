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
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        // Loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading"></span> Giriş yapılıyor...';
        
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
        
        // Başarılı animasyon
        submitButton.innerHTML = '✓ Başarılı!';
        submitButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        // Kısa bir gecikme sonra yönlendir
        setTimeout(() => {
            window.location.href = 'game.html';
        }, 500);
    } catch (error) {
        console.error('Giriş hatası:', error);
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        submitButton.classList.add('shake');
        setTimeout(() => submitButton.classList.remove('shake'), 300);
        alert('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
});

