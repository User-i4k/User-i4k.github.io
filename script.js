// ============================================================
// BLISS WAFFLE — script.js
// ============================================================

const SHEET_CSV_URL = ''; // Google Sheets CSV URL — işletmeci'den alınınca ekle
const WA_NUMBER = '905462953461';

let menuData = null;
let counts = {};

// ── 1. VERİ YÜKLEME ─────────────────────────────────────────
// Öncelik sırası: Google Sheets CSV → inline window.BLISS_MENU → fetch menu.json
async function loadMenu() {
  // 1. Google Sheets CSV (ileride etkinleştirmek için URL ekle)
  if (SHEET_CSV_URL) {
    try {
      const res = await fetch(SHEET_CSV_URL);
      if (!res.ok) throw new Error('CSV fetch failed');
      menuData = parseCSV(await res.text());
      return;
    } catch (e) {
      console.warn('Google Sheets yüklenemedi, fallback kullanılıyor.', e.message);
    }
  }
  // 2. Inline embed (file:// protokolü için — HTML'den enjekte edilir)
  if (window.BLISS_MENU) {
    menuData = window.BLISS_MENU;
    return;
  }
  // 3. Fetch fallback (Netlify/sunucu ortamı için)
  try {
    const res = await fetch('menu.json');
    menuData = await res.json();
  } catch (e) {
    console.error('menu.json yüklenemedi:', e);
  }
}

function parseCSV(csv) {
  // Beklenen sütunlar: id, isim, icindekiler(;ile ayrılmış), fiyat, kategori
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
  const rows = lines.slice(1).map(line => {
    const vals = line.match(/(".*?"|[^,\n]+)(?=,|\n|$)/g) || [];
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim().replace(/^"|"$/g, ''); });
    return obj;
  });
  const catMap = {};
  rows.forEach(r => {
    const cat = r.kategori || 'Diğer';
    if (!catMap[cat]) catMap[cat] = [];
    catMap[cat].push({ id: r.id, isim: r.isim, icindekiler: r.icindekiler ? r.icindekiler.split(';').map(s => s.trim()) : [], fiyat: r.fiyat });
  });
  return { kategoriler: Object.entries(catMap).map(([k, v]) => ({ kategori: k, urunler: v })) };
}

// ── 2. SİPARİŞ PANELİ & UX LOGIC ───────────────────────────────────────
function initOrderPanel() {
  const container = document.getElementById('order-panel-content');
  const catBar = document.getElementById('category-bar');
  const liveSearch = document.getElementById('live-search');
  const filterChips = document.querySelectorAll('.ux-chip');
  if (!container || !menuData) return;

  container.innerHTML = '';
  counts = {};

  const allCategories = [];
  const emojiMap = {
    'Waffles': '🧇',
    'Tatlılar': '🍰',
    'Kahveler (Sıcak)': '☕',
    'Kahveler (Soğuk)': '🧊',
    'İçecekler': '🥤',
    'Dondurma': '🍦',
    'Kahveler': '☕'
  };

  menuData.kategoriler.forEach((cat, idx) => {
    const e = emojiMap[cat.kategori] || '✨';
    allCategories.push({ ...cat, kategori: `${e} ${cat.kategori}`, id: `cat-${idx}` });
  });

  // Render Category Bar
  if (catBar) {
    catBar.innerHTML = allCategories.map(cat =>
      `<button class="airy-cat-btn" data-target="${cat.id}">${cat.kategori}</button>`
    ).join('');

    const btnAll = document.getElementById('btn-all');
    const allCatBtns = Array.from(catBar.querySelectorAll('.airy-cat-btn'));
    if (btnAll) allCatBtns.unshift(btnAll);

    // Filter Logic for cat links (Tab Switcher)
    allCatBtns.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');

        // Remove active class from all
        allCatBtns.forEach(btn => btn.classList.remove('active'));
        link.classList.add('active');

        // Show/Hide sections logic instead of scroll
        const allSections = document.querySelectorAll('.airy-cat-section');
        allSections.forEach(sec => {
          if (targetId === 'cat-all' || sec.id === targetId) {
            sec.style.display = 'block';
          } else {
            sec.style.display = 'none';
          }
        });
      });
    });
  }

  // Render Products
  allCategories.forEach(cat => {
    const sec = document.createElement('div');
    sec.className = 'airy-cat-section';
    sec.id = cat.id;
    sec.innerHTML = `<div class="airy-cat-title">${cat.kategori}</div><div class="airy-items-wrap" data-cat></div>`;
    const items = sec.querySelector('[data-cat]');

    cat.urunler.forEach(u => {
      if (counts[u.id] === undefined) counts[u.id] = 0;
      const el = document.createElement('div');
      el.className = 'airy-item';
      el.setAttribute('data-name', u.isim.toLocaleLowerCase('tr-TR'));
      el.setAttribute('data-ings', (u.icindekiler || []).join(' ').toLocaleLowerCase('tr-TR'));
      el.setAttribute('data-category', cat.kategori.toLocaleLowerCase('tr-TR'));

      const ingsHtml = u.icindekiler && u.icindekiler.length ?
        `<div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.5); margin-top: 6px; line-height: 1.4;">
           ${u.icindekiler.join(', ')}
         </div>` : '';

      el.innerHTML = `
        <div class="airy-item-top">
          <div class="airy-item-content">
            <div class="airy-item-name">${u.isim}</div>
            <div class="airy-item-price">${u.fiyat} ₺</div>
          </div>
          <div class="airy-counter">
            <button class="airy-count-btn" data-id="${u.id}" aria-label="Azalt">−</button>
            <span class="airy-count-val cnt-${u.id}">0</span>
            <button class="airy-count-btn plus-btn" data-id="${u.id}" aria-label="Artır">+</button>
          </div>
        </div>
        ${ingsHtml}
      `;
      items.appendChild(el);
    });
    container.appendChild(sec);
  });

  // Event Delegation for counters
  document.body.addEventListener('click', e => {
    const btn = e.target.closest('.airy-count-btn');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('plus-btn')) counts[id]++;
    else counts[id] = Math.max(0, counts[id] - 1);

    // Sync all counters for same product (popular & regular category)
    document.querySelectorAll(`.cnt-${id}`).forEach(el => el.textContent = counts[id]);

    document.querySelectorAll(`[data-id="${id}"]`).forEach(b => {
      const itemCard = b.closest('.airy-item');
      if (itemCard) {
        if (counts[id] > 0) itemCard.classList.add('is-selected');
        else itemCard.classList.remove('is-selected');
      }
    });
    updateSummary();
  });

  // Live Search Logic
  if (liveSearch) {
    liveSearch.addEventListener('input', (e) => {
      filterMenu(e.target.value.toLocaleLowerCase('tr-TR'), '');

      // If search is cleared, click active tab to restore layout state
      if (e.target.value.trim() === '') {
        const activeTab = document.querySelector('.airy-cat-btn.active');
        if (activeTab) activeTab.click();
      }
    });
  }

  // Filter Chips Logic (Deprecated in Airy mode, but keeping code so it doesn't break if exists)
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Toggle active state
      if (chip.classList.contains('active') && chip.getAttribute('data-filter') !== 'all') {
        chip.classList.remove('active');
        document.querySelector('.ux-chip[data-filter="all"]').classList.add('active');
      } else {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      }

      const activeChip = Array.from(filterChips).find(c => c.classList.contains('active'));
      const q = liveSearch ? liveSearch.value.toLowerCase() : '';
      if (!activeChip || activeChip.getAttribute('data-filter') === 'all') {
        filterMenu(q, '');
      } else {
        const fName = activeChip.getAttribute('data-filter');
        const fCat = activeChip.getAttribute('data-category');
        const fCustom = activeChip.getAttribute('data-custom');
        filterMenu(q, { fName, fCat, fCustom });
      }
    });
  });

  updateSummary();
}

function filterMenu(query, chipFilter) {
  const sections = document.querySelectorAll('.airy-cat-section');
  sections.forEach(sec => {
    let hasMatch = false;

    const items = sec.querySelectorAll('.airy-item');
    items.forEach(item => {
      const name = item.getAttribute('data-name') || '';

      // Normalize Function for perfect Turkish search (e.g. 'c' matches 'ç')
      const normalize = (str) => str.toLocaleLowerCase('tr-TR')
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');

      const normQuery = normalize(query);
      const normName = normalize(name);

      let matchesQuery = normQuery === '' || normName.includes(normQuery);

      if (matchesQuery) {
        item.style.display = 'flex';
        hasMatch = true;
      } else {
        item.style.display = 'none';
      }
    });

    // Hide section entirely if no items match
    if (!hasMatch) sec.style.display = 'none';
    else sec.style.display = 'block';
  });
}

function getSelected() {
  if (!menuData) return [];
  const outMap = {};
  menuData.kategoriler.forEach(cat => cat.urunler.forEach(u => {
    if (counts[u.id] > 0) {
      outMap[u.id] = { id: u.id, isim: u.isim, adet: counts[u.id], fiyat: parseInt(u.fiyat) || 0 };
    }
  }));
  return Object.values(outMap);
}

function updateSummary() {
  const sel = getSelected();
  const floatingCart = document.getElementById('floating-cart');
  const fcCount = document.getElementById('fc-count');
  const fcTotal = document.getElementById('fc-total');

  if (!floatingCart) return;

  const total = sel.reduce((sum, s) => sum + s.fiyat * s.adet, 0);
  const count = sel.reduce((sum, s) => sum + s.adet, 0);

  if (sel.length === 0) {
    floatingCart.classList.add('hidden');
    closeCartDrawer();
  } else {
    floatingCart.classList.remove('hidden');
    fcCount.textContent = `🛒 ${count} Ürün`;
    fcTotal.textContent = `${total} ₺`;
  }

  // Update Drawer UI
  renderDrawerItems(sel, total);
}

function renderDrawerItems(sel, total) {
  const drawerItems = document.getElementById('drawer-items');
  const drawerTotalWrap = document.getElementById('drawer-total-wrap');
  const sendBtn = document.getElementById('send-whatsapp');
  if (!drawerItems) return;

  if (sel.length === 0) {
    drawerItems.innerHTML = '<div style="color:var(--text-muted); padding:20px 0; text-align:center;">Sepetiniz boş.</div>';
    drawerTotalWrap.innerHTML = '';
    if (sendBtn) sendBtn.disabled = true;
  } else {
    drawerItems.innerHTML = sel.map(s => `
      <div class="airy-drawer-item">
        <div class="airy-drawer-item-info" style="flex:1;">
            <span class="airy-drawer-item-name">${s.isim}</span>
            <div class="airy-drawer-item-total" style="margin-top:4px;">${s.fiyat * s.adet} ₺</div>
        </div>
        <div class="airy-counter" style="background: rgba(255,255,255,0.05); border-radius: 100px; padding: 4px; gap: 8px;">
            <button class="airy-count-btn" data-id="${s.id}" style="width:32px; height:32px; font-size:1.1rem;">−</button>
            <span class="airy-count-val cnt-${s.id}">${s.adet}</span>
            <button class="airy-count-btn plus-btn" data-id="${s.id}" style="width:32px; height:32px; font-size:1.1rem;">+</button>
        </div>
      </div>
    `).join('');
    drawerTotalWrap.innerHTML = `<span>Toplam Tutar</span><span>${total} ₺</span>`;
    if (sendBtn) sendBtn.disabled = false;
  }
}

function openCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay) {
    overlay.classList.remove('hidden');
    drawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay) {
    overlay.classList.add('hidden');
    drawer.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function sendWhatsApp() {
  const sel = getSelected();
  if (!sel.length) return;
  const lines = sel.map(s => `- ${s.isim} x${s.adet}`).join('\n');
  const total = sel.reduce((sum, s) => sum + s.fiyat * s.adet, 0);
  const addressEl = document.getElementById('delivery-address');
  const address = addressEl ? addressEl.value.trim() : '';
  const msg = `Merhaba, Bliss Waffle'dan sipariş vermek istiyorum:\n${lines}\nAdres: ${address || '(lütfen adresinizi belirtin)'}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ── 3. MENÜ SAYFASI ─────────────────────────────────────────
const CAT_ICONS = { 'Waffles': '🧇', 'Tatlılar': '🍮', 'İçecekler': '🥤', 'Dondurma': '🍦', 'Kahveler': '☕' };

function initMenuPage() {
  const container = document.getElementById('menu-page-content');
  if (!container || !menuData) return;
  container.innerHTML = '';

  menuData.kategoriler.forEach(cat => {
    const sec = document.createElement('section');
    sec.className = 'menu-section';
    const icon = CAT_ICONS[cat.kategori] || '🍴';
    sec.innerHTML = `
      <div class="menu-cat-header">
        <span class="menu-cat-icon">${icon}</span>
        <h2 class="menu-cat-name">${cat.kategori}</h2>
      </div>
      <div class="menu-grid"></div>`;
    const grid = sec.querySelector('.menu-grid');

    cat.urunler.forEach(u => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      const ings = u.icindekiler && u.icindekiler.length
        ? `<div class="ingredients">${u.icindekiler.map(i => `<span class="ing-tag">${i}</span>`).join('')}</div>` : '';
      const oldP = u.eski_fiyat ? `<span class="menu-card-old">${u.eski_fiyat} ₺</span>` : '';
      card.innerHTML = `
        <div class="menu-card-img" style="background-image: url('images/products/${u.id || 'placeholder'}.webp');">
          <div class="menu-card-placeholder">🧇</div>
        </div>
        <div class="menu-card-content">
          <div class="menu-card-head">
            <h3 class="menu-card-name">${u.isim}</h3>
            <div class="menu-card-price-wrap">${oldP}<div class="menu-card-price">${u.fiyat} ₺</div></div>
          </div>
          ${ings}
        </div>`;
      grid.appendChild(card);
    });
    container.appendChild(sec);
  });
}

// ── 4. SIDEBAR ───────────────────────────────────────────────
function initSidebar() {
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('sidebar-overlay');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('sidebar-close');
  if (!hamburger || !sidebar) return;

  const open = () => { hamburger.classList.add('open'); overlay.classList.add('open'); sidebar.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { hamburger.classList.remove('open'); overlay.classList.remove('open'); sidebar.classList.remove('open'); document.body.style.overflow = ''; };

  hamburger.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
  overlay.addEventListener('click', close);
  if (closeBtn) closeBtn.addEventListener('click', close);
}
// ── 5. GETİR CİHAZ ALGILAMA (MOBIL APP / MASAÜSTÜ WEB) ───────
function initGetirLinks() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const mobileUrl = 'https://getir.com/restaurant=67fad3a84752f6dc59171927&ownerService=2/';
  const desktopUrl = 'https://getir.com/yemek/restoran/bliss-waffle-sultanbeyli-mehmet-akif-mah-sultanbeyli-istanbul/';

  document.querySelectorAll('a').forEach(link => {
    if (link.href && link.href.includes('getir.com')) {
      link.href = isMobile ? mobileUrl : desktopUrl;
      if (!isMobile) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    }
  });
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initSidebar();
  initGetirLinks();

  const sendBtn = document.getElementById('send-whatsapp');
  if (sendBtn) sendBtn.addEventListener('click', sendWhatsApp);

  const drawerCloseBtn = document.getElementById('close-drawer');
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeCartDrawer);

  const floatingCart = document.getElementById('floating-cart');
  if (floatingCart) floatingCart.addEventListener('click', openCartDrawer);

  const cartOverlay = document.getElementById('cart-drawer-overlay');
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  await loadMenu();

  if (document.getElementById('order-panel-content')) initOrderPanel();
  if (document.getElementById('menu-page-content')) initMenuPage();
});
