// ═══════════════════════════════════════════════
//  عطور الجنوب — Southern Perfumes
//  script.js  |  All website logic
// ═══════════════════════════════════════════════

// ── CONFIG ──
const WHATSAPP_NUMBER = "201141910181";
const FACEBOOK_URL    = "https://www.facebook.com/people/%D8%B9%D8%B7%D9%88%D8%B1-%D8%A7%D9%84%D8%AC%D9%86%D9%88%D8%A8/100094129415952/";

const WA_BASE = `https://wa.me/${WHATSAPP_NUMBER}?text=`;

// ── STATE ──
let allProducts   = [];
let activeCategory = "الكل";
let searchQuery    = "";

// ══════════════════════════════════════════════
//  LAZY LOADING OBSERVER
// ══════════════════════════════════════════════
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const img = entry.target;

    // load image
    img.src = img.dataset.src;

    img.onload = () => {
      img.classList.add("loaded");
    };

    img.onerror = () => {
      const fallback = img.parentElement.querySelector(".card-emoji-fallback");
      if (fallback) fallback.style.display = "flex";
      img.style.display = "none";
    };

    observer.unobserve(img);
  });
}, {
  rootMargin: "100px"
});

// ══════════════════════════════════════════════
//  LOAD PRODUCTS
// ══════════════════════════════════════════════
fetch("products.json")
  .then(res => {
    if (!res.ok) throw new Error("Could not load products.json");
    return res.json();
  })
  .then(data => {
    allProducts = data;
    buildCategoryButtons(data);
    renderProducts(data);
  })
  .catch(err => {
    console.error("Error loading products:", err);
    document.getElementById("productsGrid").innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <p>تعذّر تحميل المنتجات</p>
      </div>`;
  });

// ══════════════════════════════════════════════
//  CATEGORY BUTTONS
// ══════════════════════════════════════════════
function buildCategoryButtons(products) {
  const bar = document.getElementById("categoriesBar");

  const uniqueCategories = ["الكل", ...new Set(products.map(p => p.category))];

  bar.innerHTML = uniqueCategories.map((cat, i) => `
    <button class="cat-btn ${i === 0 ? "active" : ""}" data-cat="${cat}">
      ${cat}
    </button>
  `).join("");

  bar.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      bar.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      activeCategory = this.dataset.cat;
      applyFilters();
    });
  });
}

// ══════════════════════════════════════════════
//  FILTER
// ══════════════════════════════════════════════
function applyFilters() {
  let filtered = allProducts;

  if (activeCategory !== "الكل") {
    filtered = filtered.filter(p => p.category === activeCategory);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q) ||
      (p.desc || "").toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  renderProducts(filtered);
}

// ══════════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════════
function renderProducts(products) {
  const grid    = document.getElementById("productsGrid");
  const countEl = document.getElementById("resultCount");

  countEl.textContent = products.length ? `${products.length} عطر` : "";

  if (!products.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="icon">🔍</div>
        <p>لا توجد نتائج</p>
      </div>`;
    return;
  }

  grid.innerHTML = products.map((p, i) => {
    const waMsg  = encodeURIComponent(`السلام عليكم، أريد الاستفسار عن: ${p.name} 🌹`);
    const waLink = WA_BASE + waMsg;

    const visual = p.image
      ? `
        <div class="img-placeholder"></div>

        <img 
          data-src="${p.image}" 
          alt="${p.name}" 
          class="card-img lazy-img"
        />

        <div class="card-emoji-fallback" style="display:none">
          ${p.emoji || "🧴"}
        </div>
      `
      : `<div class="card-emoji-fallback">${p.emoji || "🧴"}</div>`;

    return `
      <div class="product-card" style="animation-delay:${i * 0.06}s">
        <div class="card-topline"></div>
        <div class="card-visual">${visual}</div>

        <div class="card-body">
          <div class="card-cat">${p.category}</div>
          <div class="card-name">${p.name}</div>
          ${p.brand ? `<div class="card-brand">${p.brand}</div>` : ""}
          ${p.desc  ? `<div class="card-desc">${p.desc}</div>`   : ""}

          <div class="card-footer">
            <div class="card-actions">
              <a class="card-wa" href="${waLink}" target="_blank">استفسر</a>
            </div>

            <div class="card-price-wrap">
              <div class="card-price">${p.price || ""}</div>
              <div class="card-size">${p.size || ""}</div>
            </div>
          </div>
        </div>
      </div>`;
  }).join("");

  // 👇 مهم جداً: ربط الصور بالـ observer بعد الرندر
  document.querySelectorAll(".lazy-img").forEach(img => {
    imageObserver.observe(img);
  });
}

// ══════════════════════════════════════════════
//  SEARCH
// ══════════════════════════════════════════════
document.getElementById("searchInput").addEventListener("input", function () {
  searchQuery = this.value.trim();
  applyFilters();
});

// ══════════════════════════════════════════════
//  SOCIAL LINKS
// ══════════════════════════════════════════════
function setSocialLinks() {
  const waDefault = WA_BASE + encodeURIComponent("السلام عليكم");

  document.querySelectorAll(".js-wa-link").forEach(el => el.href = waDefault);
  document.querySelectorAll(".js-fb-link").forEach(el => el.href = FACEBOOK_URL);
}
setSocialLinks();
