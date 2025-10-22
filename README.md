# Realtime Chat + Game Hub

## Proje Hakkında
Realtime Chat + Game Hub, kullanıcıların anonim olarak giriş yapabileceği ve gerçek zamanlı sohbet edebileceği bir uygulamadır. Ayrıca, oyun alanı için bir altyapı sunmaktadır. Uygulama, Firebase Realtime Database ve Anonymous Auth kullanarak geliştirilmiştir.

## Dosya Yapısı
- **index.html**: Uygulamanın ana sayfasıdır. Kullanıcıların giriş yapabileceği, oda listesinin gösterileceği ve mesajların gönderileceği alanları içerir. Mobil uyumlu bir tasarım ile oluşturulmuştur.
  
- **game.html**: Oyun alanını temsil eder. Şu anda sadece "Oyun alanı yakında" mesajını gösterir.

- **app.js**: Uygulamanın ana JavaScript dosyasıdır. Sayfa yüklendiğinde localStorage'da kullanıcı adı kontrolü yapar, yoksa kullanıcıdan bir isim ister. Firebase ile anonim oturum açma işlemlerini gerçekleştirir ve mesaj gönderme/alma olaylarını dinler. Oda mantığını destekler.

- **firebase.js**: Firebase yapılandırma ayarlarını içeren dosyadır. Firebase Realtime Database ve Anonymous Auth için gerekli ayarların yapılacağı yerdir. İçinde bir yapılandırma şablonu bulunmaktadır.

- **styles.css**: Uygulamanın stil dosyasıdır. Basit ve sade bir tasarım için gerekli stilleri içerir. Chat baloncukları, giriş kutusu ve buton stilleri tanımlıdır.

## Kurulum Talimatları
1. **Firebase Hesabı Oluşturun**: Firebase konsoluna gidin ve yeni bir proje oluşturun.
2. **Realtime Database ve Anonymous Auth Aktif Edin**: Proje ayarlarından Realtime Database ve Anonymous Auth özelliklerini etkinleştirin.
3. **firebase.js Dosyasını Düzenleyin**: Aşağıdaki yapılandırma ayarlarını kendi Firebase projenizle doldurun:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       databaseURL: "YOUR_DB_URL",
       projectId: "YOUR_PROJECT_ID",
       // Diğer gerekli ayarlar
   };
   ```
4. **Proje Dosyalarını İndirin**: Bu dosyaları yerel makinenize indirin veya bir sunucuya yükleyin.
5. **Tarayıcıda Açın**: `index.html` dosyasını tarayıcınızda açarak uygulamayı başlatın.

## Kullanım
- Uygulamayı açtığınızda, kullanıcı adınızı girmeniz istenecektir. Bu ad, localStorage'a kaydedilecektir.
- Oda listesinden bir odaya tıklayarak sohbet etmeye başlayabilirsiniz.
- "Çıkış Yap" butonuna tıklayarak oturumunuzu sıfırlayabilirsiniz.

## Katkıda Bulunanlar
- [Adınız] - Proje Geliştiricisi

## Lisans
Bu proje MIT Lisansı altında lisanslanmıştır.