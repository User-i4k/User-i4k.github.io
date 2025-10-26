# MOBA Arena - Çok Oyunculu Web Oyunu

Real-time çok oyunculu MOBA tarzı web oyunu. Firebase Realtime Database kullanarak anında hareketli oyuncularla etkileşim kurun.

## 🎮 Özellikler

- **Gerçek Zamanlı Multiplayer:** Tüm oyuncular aynı anda hareket eder
- **Anonim Giriş:** Firebase Anonymous Authentication
- **Skor Sistemi:** Tüm skorlar veritabanına kaydedilir
- **Yetenek Sistemi:** Q, W, E, R tuşları ile özel yetenekler
- **Sağ Tıklama Hareketi:** Sağ tıklama ile oyuncu hareket eder
- **Admin Paneli:** Kullanıcı yönetimi ve yasaklama sistemi
- **LocalStorage:** Tekrar girişlerde bilgiler korunur
- **Banned Kontrolü:** Yasaklı kullanıcılar oyuna giremez

## 🚀 Kurulum

### 1. Firebase Projesi Oluşturun

1. [Firebase Console](https://console.firebase.google.com/) gidin
2. Yeni bir proje oluşturun
3. Realtime Database'i etkinleştirin
4. Authentication'da Anonymous sign-in'i etkinleştirin

### 2. Firebase Yapılandırması

`firebase-config.js` dosyasını düzenleyin ve Firebase yapılandırma bilgilerinizi ekleyin:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "YOUR_DATABASE_URL"
};
```

### 3. Firebase Security Rules

Firebase Console'da Realtime Database > Rules sekmesine gidin ve `database-rules.json` dosyasındaki kuralları yapıştırın.

### 4. Admin Paneli Giriş Bilgileri

`admin.html` dosyasındaki admin giriş bilgilerini değiştirin:

```javascript
const ADMIN_CREDENTIALS = {
    username: 'admin',      // Kendi kullanıcı adınızı girin
    password: 'admin123'    // Kendi şifrenizi girin
};
```

## 📁 Dosya Yapısı

```
website/
├── index.html              # Giriş sayfası
├── game.html               # Oyun sayfası
├── admin.html              # Admin paneli
├── firebase-config.js      # Firebase yapılandırması
├── guard.js                # Sayfa koruma
├── database-rules.json     # Firebase güvenlik kuralları
└── README.md               # Bu dosya
```

## 🎯 Kullanım

### Oyuncu İçin

1. `index.html` sayfasını açın
2. 3-20 karakter arası bir kullanıcı adı girin
3. "Oyuna Gir" butonuna tıklayın
4. `game.html` sayfasında:
   - **Sağ tıklama:** Hareket etmek için
   - **Q tuşu:** 35 hasar (5s cooldown)
   - **W tuşu:** 50 hasar (7s cooldown)
   - **E tuşu:** 45 hasar (6s cooldown)
   - **R tuşu:** 100 hasar - ULTİ (30s cooldown)
5. Çıkış yapmak için "Çıkış Yap" butonuna tıklayın

### Admin İçin

1. `admin.html` sayfasını açın
2. Admin kullanıcı adı ve şifre ile giriş yapın
3. Kullanıcı listesini görüntüleyin
4. Kullanıcıları yasaklayın, yasağı kaldırın veya oyundan atın

## 🛠️ Teknik Detaylar

### Veritabanı Yapısı

```javascript
users/
  {uid}/
    username: string
    score: number
    kills: number
    deaths: number
    level: number
    banned: boolean
    joinedAt: timestamp

game/
  players/
    {uid}/
      x: number
      y: number
      color: string
      hp: number
      username: string
  abilities/
    {uid}/
      key: string (Q/W/E/R)
      x: number
      y: number
      timestamp: number
```

### Özellikler

- **Real-time Updates:** Firebase Realtime Database ile anında güncellemeler
- **Movement System:** Sağ tıklama ile hedefe doğru hareket
- **Ability Cooldowns:** Her yetenek için farklı bekleme süreleri
- **Player Visualization:** Her oyuncu farklı renkte bir nokta ile gösterilir
- **Auto-disconnect:** Çıkış yapıldığında hem localStorage hem veritabanından silinir

## 🔒 Güvenlik

- Anonymous authentication zorunludur
- Kullanıcılar sadece kendi verilerini değiştirebilir (admin hariç)
- Yasaklı kullanıcılar oyuna giremez
- Guard.js ile sayfa koruması
- Banned kontrolü her işlemde yapılır

## 📝 Notlar

- İlk kurulumda Firebase yapılandırma bilgilerini eklemeyi unutmayın
- Admin şifresini güvenli bir şekilde değiştirin
- Firebase Realtime Database rules'ları mutlaka uygulayın
- Tüm oyuncular aynı harita üzerinde görünür
- Hareket yumuşak bir animasyon ile gerçekleşir

## 🐛 Bilinen Sorunlar

- Çok fazla oyuncu olduğunda performans düşebilir
- Tarayıcıda Developer Tools açıkken bazı hatalar oluşabilir

## 📄 Lisans

Bu proje eğitim amaçlıdır.

