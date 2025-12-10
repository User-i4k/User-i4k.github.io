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
        this.playerInterpolations = {}; // Smooth movement için interpolation
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
        
        // Render optimizasyonu
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        
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
            const now = performance.now();
            
            // Her oyuncu için interpolation başlat
            Object.keys(players).forEach(playerId => {
                if (playerId === this.playerId) return; // Kendi pozisyonunu atla
                
                const player = players[playerId];
                if (!player || player.x === undefined || player.y === undefined) return;
                
                // Eğer oyuncu yeni geldiyse veya pozisyon değiştiyse
                if (!this.playerInterpolations[playerId]) {
                    this.playerInterpolations[playerId] = {
                        currentX: player.x,
                        currentY: player.y,
                        targetX: player.x,
                        targetY: player.y,
                        lastUpdate: now
                    };
                } else {
                    // Pozisyon değişikliği varsa interpolation başlat
                    const interpolation = this.playerInterpolations[playerId];
                    if (interpolation.targetX !== player.x || interpolation.targetY !== player.y) {
                        interpolation.targetX = player.x;
                        interpolation.targetY = player.y;
                        interpolation.lastUpdate = now;
                    }
                }
            });
            
            // Silinen oyuncuları temizle
            Object.keys(this.playerInterpolations).forEach(playerId => {
                if (!players[playerId] || playerId === this.playerId) {
                    delete this.playerInterpolations[playerId];
                }
            });
            
            // Oyuncu verilerini güncelle
            this.players = players;
        });
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
        
        // Eski cooldown overlay'i kaldır
        const oldOverlay = abilityElement.querySelector('.ability-cooldown');
        if (oldOverlay) {
            oldOverlay.remove();
        }
        
        if (cooldown > now) {
            // Cooldown aktif
            const remaining = ((cooldown - now) / 1000).toFixed(1);
            const progress = 1 - ((cooldown - now) / ability.cooldown);
            
            abilityElement.classList.add('on-cooldown');
            abilityElement.style.cursor = 'not-allowed';
            
            const nameElement = abilityElement.querySelector('.ability-name');
            if (nameElement) {
                nameElement.textContent = remaining + 's';
            }
            
            // Cooldown overlay ekle
            const overlay = document.createElement('div');
            overlay.className = 'ability-cooldown';
            overlay.textContent = remaining;
            abilityElement.appendChild(overlay);
            
            // Cooldown progress (visual)
            const progressBar = document.createElement('div');
            progressBar.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                width: ${progress * 100}%;
                height: 3px;
                background: linear-gradient(90deg, #6366f1, #8b5cf6);
                border-radius: 0 0 12px 12px;
                transition: width 0.1s linear;
            `;
            abilityElement.appendChild(progressBar);
        } else {
            // Hazır
            abilityElement.classList.remove('on-cooldown');
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
        const now = performance.now();
        const deltaTime = Math.min((now - this.lastFrameTime) / 16.67, 2); // Max 2x speed
        this.lastFrameTime = now;
        
        // Hedefe doğru hareket et
        if (this.targetX !== null && this.targetY !== null) {
            const dx = this.targetX - this.currentX;
            const dy = this.targetY - this.currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                let newX = this.currentX + (dx / distance) * this.speed * deltaTime;
                let newY = this.currentY + (dy / distance) * this.speed * deltaTime;
                
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
        
        // Diğer oyuncular için interpolation güncelle
        Object.keys(this.playerInterpolations).forEach(playerId => {
            const interpolation = this.playerInterpolations[playerId];
            const player = this.players[playerId];
            
            if (!player || player.x === undefined || player.y === undefined) {
                delete this.playerInterpolations[playerId];
                return;
            }
            
            // Smooth interpolation (lerp)
            const lerpFactor = 0.15; // Interpolation hızı
            const dx = interpolation.targetX - interpolation.currentX;
            const dy = interpolation.targetY - interpolation.currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0.1) {
                interpolation.currentX += dx * lerpFactor * deltaTime;
                interpolation.currentY += dy * lerpFactor * deltaTime;
            } else {
                interpolation.currentX = interpolation.targetX;
                interpolation.currentY = interpolation.targetY;
            }
        });
        
        // Firebase write throttle (100ms'de bir)
        const timestamp = Date.now();
        if (this.pendingPositionUpdate && (timestamp - this.lastFirebaseWrite) >= this.firebaseWriteInterval) {
            set(this.playerRef, this.pendingPositionUpdate);
            this.lastFirebaseWrite = timestamp;
            this.pendingPositionUpdate = null;
        }
        
        // Cooldown'ları güncelle ve UI'ı güncelle
        Object.keys(this.abilityCooldowns).forEach(key => {
            if (this.abilityCooldowns[key] < timestamp) {
                this.abilityCooldowns[key] = 0;
            }
            this.updateAbilityUI(key);
        });
    }
    
    render() {
        // Canvas'ı temizle (dark mode background)
        this.ctx.fillStyle = '#0a0e27';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Grid çiz
        this.drawGrid();
        
        // Tüm oyuncuları çiz (interpolated pozisyonlarla)
        Object.keys(this.players).forEach(playerId => {
            const player = this.players[playerId];
            if (!player || player.x === undefined || player.y === undefined) return;
            
            // Kendi pozisyonunu kullan
            if (playerId === this.playerId) {
                const renderPlayer = {
                    ...player,
                    x: this.currentX,
                    y: this.currentY
                };
                this.drawPlayer(renderPlayer);
            } else {
                // Diğer oyuncular için interpolated pozisyon kullan
                const interpolation = this.playerInterpolations[playerId];
                if (interpolation) {
                    const renderPlayer = {
                        ...player,
                        x: interpolation.currentX,
                        y: interpolation.currentY
                    };
                    this.drawPlayer(renderPlayer);
                } else {
                    // Interpolation yoksa direkt pozisyonu kullan
                    this.drawPlayer(player);
                }
            }
        });
        
        // Kendi oyuncusunu vurgula
        if (this.players[this.playerId]) {
            this.drawPlayerHighlight({
                x: this.currentX,
                y: this.currentY
            });
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
        
        // Oyuncu gölgesi (daha belirgin)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 3, radius * 0.9, radius * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Glow efekti
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 1.5);
        gradient.addColorStop(0, color + '80');
        gradient.addColorStop(1, color + '00');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Oyuncu çemberi (gradient ile)
        const playerGradient = this.ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
        playerGradient.addColorStop(0, this.lightenColor(color, 20));
        playerGradient.addColorStop(1, color);
        this.ctx.fillStyle = playerGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Oyuncu kenarlığı (daha belirgin)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2.5;
        this.ctx.stroke();
        
        // İç highlight
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Kullanıcı adı
        const username = (player.username || 'Oyuncu').substring(0, 20);
        
        // Metin arka planı (okunabilirlik için)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x - 50, y - radius - 25, 100, 20);
        
        // Metin
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '600 13px Inter, Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(username, x, y - radius - 15);
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.min(255, (num >> 16) + percent);
        const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
        const b = Math.min(255, (num & 0x0000FF) + percent);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
    
    drawPlayerHighlight(player) {
        const x = player.x;
        const y = player.y;
        const radius = 25;
        const time = performance.now() * 0.001;
        
        // Pulsing highlight efekti
        const pulseRadius = radius + Math.sin(time * 3) * 3;
        const pulseAlpha = 0.3 + Math.sin(time * 3) * 0.2;
        
        // Dış glow
        const gradient = this.ctx.createRadialGradient(x, y, radius, x, y, pulseRadius * 1.5);
        gradient.addColorStop(0, `rgba(99, 102, 241, ${pulseAlpha})`);
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseRadius * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Vurgu çemberi
        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.9)';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // İç highlight
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawTarget(x, y) {
        const time = performance.now() * 0.005;
        const pulseSize = 15 + Math.sin(time) * 3;
        
        // Hedef noktası glow
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, pulseSize);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
        gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.3)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hedef noktası
        this.ctx.fillStyle = '#6366f1';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hedef çemberi (pulsing)
        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.9)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Dış çember
        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseSize + 5, 0, Math.PI * 2);
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

