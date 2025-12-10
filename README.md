# 🎮 Moba Game - 2D Multiplayer Prototip

Firebase Realtime Database kullanarak geliştirilmiş basit bir 2D multiplayer oyun prototipi.

## 🚀 Özellikler

- **Anonim Firebase Authentication** - Kullanıcılar anonim olarak giriş yapar
- **LocalStorage ile Kullanıcı Adı** - Kullanıcı adı tarayıcıda saklanır
- **4 Farklı Karakter Tipi**:
  - ⚔️ Savaşçı (Warrior) - Yüksek saldırı
  - 🔮 Büyücü (Mage) - Güçlü büyüler
  - 🛡️ Tank - Yüksek dayanıklılık
  - 🏹 Nişancı (Marksman) - Uzun menzil
- **Gerçek Zamanlı Multiplayer** - Firebase Realtime Database ile senkronize
- **Basit Kontroller**:
  - 🖱️ Sağ tık ile hareket
  - ⌨️ Q, W, E, R tuşları ile yetenekler

## 📋 Gereksinimler

- Modern bir web tarayıcısı
- Firebase projesi (ücretsiz)

## 🛠️ Kurulum

1. **Firebase Projesi Oluşturma**:
   - [Firebase Console](https://console.firebase.google.com/)'a gidin
   - Yeni bir proje oluşturun
   - Realtime Database'i etkinleştirin (Test modunda başlayabilirsiniz)
   - Authentication'ı etkinleştirin ve "Anonymous" sağlayıcısını açın

2. **Firebase Yapılandırması**:
   - `js/config.example.js` dosyasını `js/config.js` olarak kopyalayın
   - `js/config.js` dosyasını açın
   - Firebase projenizin yapılandırma bilgilerini ekleyin:
     ```javascript
     export const firebaseConfig = {
         apiKey: "YOUR_API_KEY",
         authDomain: "YOUR_AUTH_DOMAIN",
         databaseURL: "YOUR_DATABASE_URL",
         projectId: "YOUR_PROJECT_ID",
         storageBucket: "YOUR_STORAGE_BUCKET",
         messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
         appId: "YOUR_APP_ID"
     };
     ```
   - **Not**: `config.js` dosyası `.gitignore`'da olduğu için GitHub'a yüklenmeyecektir (güvenlik için)

3. **Projeyi Çalıştırma**:
   - Basit bir HTTP sunucusu kullanarak projeyi çalıştırın:
     ```bash
     # Python ile
     python -m http.server 8000
     
     # Node.js ile (http-server)
     npx http-server
     
     # VS Code Live Server extension
     ```
   - Tarayıcıda `http://localhost:8000` adresine gidin

## 🎮 Nasıl Oynanır

1. İlk girişte kullanıcı adınızı girin (3-20 karakter arası)
2. Karakter seçim ekranından bir karakter seçin
3. Oyun alanında sağ tık ile hareket edin
4. Q, W, E, R tuşları ile yeteneklerinizi kullanın

## 📁 Proje Yapısı

```
MobaGame/
├── index.html          # Giriş sayfası (kullanıcı adı)
├── game.html           # Oyun sayfası (karakter seçimi + oyun)
├── styles.css          # Stil dosyası
├── js/
│   ├── config.js       # Firebase yapılandırması
│   ├── auth.js         # Kimlik doğrulama
│   ├── game.js         # Oyun mantığı
│   └── gameEngine.js   # Oyun motoru
└── README.md           # Bu dosya
```

## 🔒 Güvenlik Notları

- Firebase Realtime Database kurallarınızı yapılandırın
- `database.rules.json` dosyasındaki kuralları Firebase Console'da uygulayın
- Test modunda başlayabilirsiniz, ancak production için kuralları sıkılaştırın
- Kurallar şunları içerir:
  - Sadece authenticated kullanıcılar yazabilir
  - Kullanıcılar sadece kendi verilerini yazabilir
  - Username, pozisyon ve karakter validasyonu
  - XSS koruması için username sanitization

## 🚧 Gelecek Geliştirmeler

- [ ] Item sistemi
- [ ] Altın/para sistemi
- [ ] Can puanları ve savaş mekaniği
- [ ] Daha gelişmiş yetenek efektleri
- [ ] Minimap
- [ ] Sohbet sistemi
- [ ] Oyun istatistikleri

## 📝 Lisans

Bu proje eğitim amaçlıdır ve açık kaynak kodludur.

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen pull request gönderin.

---

**Not**: Bu bir prototiptir ve geliştirme aşamasındadır. Minimum sistem gereksinimleri ile çalışacak şekilde optimize edilmiştir.

