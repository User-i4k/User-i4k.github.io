import { ref, onValue, set, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

export class GameEngine {
    constructor(canvas, playerId, username, characterType, characterData, playerRef, database) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.playerId = playerId;
        this.username = username;
        this.characterType = characterType;
        this.characterData = characterData;
        this.playerRef = playerRef;
        this.database = database;
        
        // Canvas boyutunu ayarla
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Oyun durumu
        this.players = {};
        this.targetX = null;
        this.targetY = null;
        this.currentX = 0;
        this.currentY = 0;
        this.speed = 3;
        
        // Firebase write throttle (100ms = 10 write/saniye)
        this.lastFirebaseWrite = 0;
        this.firebaseWriteInterval = 100; // ms
        this.pendingPositionUpdate = null;
        
        // Yetenek cooldown'ları
        this.abilityCooldowns = {
            Q: 0,
            W: 0,
            E: 0,
            R: 0
        };
        
        // Grid cache (performans için)
        this.gridCache = null;
        
        // Event listener'lar
        this.setupEventListeners();
        
        // Firebase dinleyicileri
        this.setupFirebaseListeners();
    }
    
    resizeCanvas() {
        const oldWidth = this.canvas.width;
        const oldHeight = this.canvas.height;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Grid cache'i sıfırla (yeni boyut için)
        this.gridCache = null;
        
        // Pozisyonu normalize et (canvas dışına çıkmışsa)
        if (this.currentX > this.canvas.width) {
            this.currentX = this.canvas.width - 50;
        }
        if (this.currentY > this.canvas.height) {
            this.currentY = this.canvas.height - 50;
        }
        if (this.currentX < 0) {
            this.currentX = 50;
        }
        if (this.currentY < 0) {
            this.currentY = 50;
        }
    }
    
    setupEventListeners() {
        // Sağ tık ile hareket
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Canvas sınırları içinde kontrol et
            if (x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height) {
                this.targetX = x;
                this.targetY = y;
            }
        });
        
        // Klavye tuşları
        document.addEventListener('keydown', (e) => {
            const key = e.key.toUpperCase();
            if (['Q', 'W', 'E', 'R'].includes(key)) {
                this.useAbility(key);
            }
        });
    }
    
    setupFirebaseListeners() {
        // Tüm oyuncuları dinle (sadece diğer oyuncular)
        const playersRef = ref(this.database, 'players');
        onValue(playersRef, (snapshot) => {
            const players = snapshot.val() || {};
            // Kendi pozisyonunu local'den al, Firebase'den alma
            this.players = players;
        });
        
        // NOT: Kendi pozisyonunu Firebase'den dinleme - local olarak tutuyoruz
        // Bu gereksiz read işlemini önler
    }
    
    useAbility(key) {
        const ability = this.characterData.abilities[key];
        if (!ability) return;
        
        const now = Date.now();
        if (this.abilityCooldowns[key] > now) {
            // Cooldown'da
            return;
        }
        
        // Yeteneği kullan
        this.abilityCooldowns[key] = now + ability.cooldown;
        
        // Yetenek efektini göster (basit animasyon)
        this.showAbilityEffect(key);
        
        console.log(`${ability.name} kullanıldı!`);
    }
    
    showAbilityEffect(key) {
        // Basit bir efekt gösterimi (ileride geliştirilebilir)
        const effect = {
            x: this.currentX,
            y: this.currentY,
            type: key,
            time: Date.now()
        };
        
        // Geçici olarak efekt göster (200ms)
        setTimeout(() => {
            // Efekt animasyonu burada yapılabilir
        }, 200);
    }
    
    updateAbilityUI(key) {
        const abilityElement = document.getElementById(`ability${key}`);
        if (!abilityElement) return;
        
        const now = Date.now();
        const cooldown = this.abilityCooldowns[key];
        const ability = this.characterData.abilities[key];
        
        if (cooldown > now) {
            // Cooldown aktif
            const remaining = ((cooldown - now) / 1000).toFixed(1);
            abilityElement.style.opacity = '0.5';
            abilityElement.style.cursor = 'not-allowed';
            const nameElement = abilityElement.querySelector('.ability-name');
            if (nameElement) {
                nameElement.textContent = `${ability.name} (${remaining}s)`;
            }
        } else {
            // Hazır
            abilityElement.style.opacity = '1';
            abilityElement.style.cursor = 'pointer';
            const nameElement = abilityElement.querySelector('.ability-name');
            if (nameElement) {
                nameElement.textContent = ability.name;
            }
        }
    }
    
    checkCollision(newX, newY, radius) {
        // Diğer oyuncularla collision kontrolü
        for (const [playerId, player] of Object.entries(this.players)) {
            if (playerId === this.playerId) continue; // Kendi kendisiyle collision yok
            
            if (player.x !== undefined && player.y !== undefined) {
                const dx = newX - player.x;
                const dy = newY - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = radius * 2; // İki oyuncunun radius'u
                
                if (distance < minDistance) {
                    // Collision var, pozisyonu ayarla
                    if (distance > 0) {
                        const overlap = minDistance - distance;
                        const angle = Math.atan2(dy, dx);
                        newX += Math.cos(angle) * overlap * 0.5;
                        newY += Math.sin(angle) * overlap * 0.5;
                    } else {
                        // Aynı pozisyonda, rastgele bir yöne it
                        const angle = Math.random() * Math.PI * 2;
                        newX += Math.cos(angle) * radius;
                        newY += Math.sin(angle) * radius;
                    }
                }
            }
        }
        return { x: newX, y: newY };
    }
    
    update() {
        // Hedefe doğru hareket et
        if (this.targetX !== null && this.targetY !== null) {
            const dx = this.targetX - this.currentX;
            const dy = this.targetY - this.currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                let newX = this.currentX + (dx / distance) * this.speed;
                let newY = this.currentY + (dy / distance) * this.speed;
                
                // Canvas sınırları kontrolü
                const radius = 20;
                newX = Math.max(radius, Math.min(this.canvas.width - radius, newX));
                newY = Math.max(radius, Math.min(this.canvas.height - radius, newY));
                
                // Collision kontrolü
                const collisionResult = this.checkCollision(newX, newY, radius);
                this.currentX = collisionResult.x;
                this.currentY = collisionResult.y;
                
                // Canvas sınırlarını tekrar kontrol et (collision sonrası)
                this.currentX = Math.max(radius, Math.min(this.canvas.width - radius, this.currentX));
                this.currentY = Math.max(radius, Math.min(this.canvas.height - radius, this.currentY));
                
                // Pozisyon değişti, Firebase'e yazılacak
                this.pendingPositionUpdate = {
                    username: this.username,
                    character: this.characterType,
                    x: this.currentX,
                    y: this.currentY,
                    color: this.characterData.color,
                    timestamp: serverTimestamp()
                };
            } else {
                this.targetX = null;
                this.targetY = null;
            }
        }
        
        // Firebase write throttle (100ms'de bir)
        const now = Date.now();
        if (this.pendingPositionUpdate && (now - this.lastFirebaseWrite) >= this.firebaseWriteInterval) {
            set(this.playerRef, this.pendingPositionUpdate);
            this.lastFirebaseWrite = now;
            this.pendingPositionUpdate = null;
        }
        
        // Cooldown'ları güncelle ve UI'ı güncelle
        Object.keys(this.abilityCooldowns).forEach(key => {
            if (this.abilityCooldowns[key] < now) {
                this.abilityCooldowns[key] = 0;
            }
            this.updateAbilityUI(key);
        });
    }
    
    render() {
        // Canvas'ı temizle
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Grid çiz (opsiyonel)
        this.drawGrid();
        
        // Tüm oyuncuları çiz
        Object.values(this.players).forEach(player => {
            if (player.x !== undefined && player.y !== undefined) {
                this.drawPlayer(player);
            }
        });
        
        // Kendi oyuncusunu vurgula
        if (this.players[this.playerId]) {
            this.drawPlayerHighlight(this.players[this.playerId]);
        }
        
        // Hedef noktasını göster
        if (this.targetX !== null && this.targetY !== null) {
            this.drawTarget(this.targetX, this.targetY);
        }
    }
    
    drawGrid() {
        // Grid cache kontrolü (performans optimizasyonu)
        if (!this.gridCache || 
            this.gridCache.width !== this.canvas.width || 
            this.gridCache.height !== this.canvas.height) {
            
            // Grid'i bir kere çiz ve cache'le
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            tempCtx.lineWidth = 1;
            
            const gridSize = 50;
            for (let x = 0; x < this.canvas.width; x += gridSize) {
                tempCtx.beginPath();
                tempCtx.moveTo(x, 0);
                tempCtx.lineTo(x, this.canvas.height);
                tempCtx.stroke();
            }
            
            for (let y = 0; y < this.canvas.height; y += gridSize) {
                tempCtx.beginPath();
                tempCtx.moveTo(0, y);
                tempCtx.lineTo(this.canvas.width, y);
                tempCtx.stroke();
            }
            
            this.gridCache = {
                canvas: tempCanvas,
                width: this.canvas.width,
                height: this.canvas.height
            };
        }
        
        // Cache'den çiz
        this.ctx.drawImage(this.gridCache.canvas, 0, 0);
    }
    
    drawPlayer(player) {
        const x = player.x;
        const y = player.y;
        const color = player.color || '#ffffff';
        const radius = 20;
        
        // Viewport culling (ekran dışındaki oyuncuları çizme)
        const margin = radius + 10;
        if (x < -margin || x > this.canvas.width + margin || 
            y < -margin || y > this.canvas.height + margin) {
            return;
        }
        
        // Oyuncu gölgesi
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x, y + 2, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Oyuncu çemberi
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Oyuncu kenarlığı
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Kullanıcı adı (XSS koruması için textContent kullanılıyor, canvas'ta otomatik escape edilir)
        const username = (player.username || 'Oyuncu').substring(0, 20); // Maksimum uzunluk
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(username, x, y - radius - 5);
        
        // Metin gölgesi
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 4;
        this.ctx.fillText(username, x, y - radius - 5);
        this.ctx.shadowBlur = 0;
    }
    
    drawPlayerHighlight(player) {
        const x = player.x;
        const y = player.y;
        const radius = 25;
        
        // Vurgu çemberi
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawTarget(x, y) {
        // Hedef noktası
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hedef çemberi
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    start() {
        this.gameLoop();
    }
}

