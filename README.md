# BLISS WAFFLE CAFE - Website

Bliss Waffle Cafe'nin mobil uyumlu ve animasyonlu websitesi.

## Özellikler

- 📱 **Mobile-First Tasarım**: Telefonlar için özel tasarlanmış
- 🌙 **Karanlık Mod**: Açık/Kapalı mod geçişi localStorage ile kaydediliyor
- ☰ **Hamburger Menü**: Sol üst köşede mobil menü
- 🗺️ **Google Map Entegrasyonu**: Konumun harita görünümü
- 📞 **WhatsApp Entegrasyonu**: Doğrudan WhatsApp iletişimi
- 🎨 **Smooth Animasyonlar**: Sayfa geçişleri ve etkileşimler
- ♿ **Erişilebilirlik**: Standart erişilebilirlik özellikleri
- 🚀 **Hızlı Yükleme**: Statik HTML/CSS/JS

## Sayfalar

- **Anasayfa** (`index.html`) - Hoş gelişin sayfası ve lokasyon
- **Hakkımızda** (`about.html`) - Kafe bilgileri
- **İletişim** (`contact.html`) - İletişim seçenekleri
- **404 Hata** (`404.html`) - Sayfa bulunamadı

## Tasarım

### Renkler
- Ana Renk: `#f5576c` (Kırmızı)
- İkincil Renk: `#f093fb` (Pembe)
- Vurgu Rengi: `#ffd89b` (Sarı)

### Font
- Segoe UI, Tahoma, Geneva, Verdana, Sans-serif

### Responsive Breakpoints
- Mobile: 320px - 480px
- Tablet: 481px - 768px
- Desktop: 769px+

## GitHub Pages Kurulumu

### 1. Repository Nasıl Oluşturulur

```bash
# Yerel olarak git initialize edin
git init

# Tüm dosyaları staged'e ekleyin
git add .

# İlk commit yapın
git commit -m "Initial commit: Bliss Waffle website"

# GitHub'da yeni repository oluşturun
# https://github.com/new

# Lokal repo'yı uzak repo'ya bağlayın
git remote add origin https://github.com/USERNAME/blisswaffle.git
git branch -M main
git push -u origin main