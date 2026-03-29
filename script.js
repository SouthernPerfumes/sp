// ═══════════════════════════════════════════════
//  عطور الجنوب — Southern Perfumes
//  script.js  |  All website logic
// ═══════════════════════════════════════════════

// ── CONFIG — Change these to your real details ──
const WHATSAPP_NUMBER = "201141910181"; // Egypt +20, then number without 0
const FACEBOOK_URL    = "https://www.facebook.com/people/%D8%B9%D8%B7%D9%88%D8%B1-%D8%A7%D9%84%D8%AC%D9%86%D9%88%D8%A8/100094129415952/";
// ────────────────────────────────────────────────

const WA_BASE = `https://wa.me/${WHATSAPP_NUMBER}?text=`;

// ── STATE ──
let allProducts   = [];   // all products loaded from JSON
let activeCategory = "الكل";
let searchQuery    = "";

// ══════════════════════════════════════════════
//  1. LOAD products.json on page start
// ══════════════════════════════════════════════
fetch("products.json")
  .then(res => {
    if (!res.ok) throw new Error("Could not load products.json");
    return res.json();
  })
  .then(data => {
    allProducts = data;
    buildCategoryButtons(data); // auto-build category buttons from the JSON
    renderProducts(data);
  })
  .catch(err => {
    console.error("Error loading products:", err);
    document.getElementById("productsGrid").innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <p>تعذّر تحميل المنتجات. تأكد من رفع ملف products.json بجانب index.html</p>
      </div>`;
  });

// ══════════════════════════════════════════════
//  2. BUILD CATEGORY BUTTONS from JSON data
//     (no need to manually update HTML when you add new categories)
// ══════════════════════════════════════════════
function buildCategoryButtons(products) {
  const bar = document.getElementById("categoriesBar");

  // Get unique categories from the data
  const uniqueCategories = ["الكل", ...new Set(products.map(p => p.category))];

  bar.innerHTML = uniqueCategories.map((cat, i) => `
    <button class="cat-btn ${i === 0 ? "active" : ""}" data-cat="${cat}">
      ${cat}
    </button>
  `).join("");

  // Re-attach click listeners after rebuilding
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
//  3. FILTER — search + category combined
// ══════════════════════════════════════════════
function applyFilters() {
  let filtered = allProducts;

  // Filter by category
  if (activeCategory !== "الكل") {
    filtered = filtered.filter(p => p.category === activeCategory);
  }

  // Filter by search query
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q)        ||
      (p.brand  || "").toLowerCase().includes(q) ||
      (p.desc   || "").toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  renderProducts(filtered);
}

// ══════════════════════════════════════════════
//  4. RENDER PRODUCTS to the page
// ══════════════════════════════════════════════
function renderProducts(products) {
  const grid       = document.getElementById("productsGrid");
  const countEl    = document.getElementById("resultCount");

  countEl.textContent = products.length > 0 ? `${products.length} عطر` : "";

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="icon">🔍</div>
        <p>لا توجد نتائج. جرّب البحث بكلمة مختلفة.</p>
      </div>`;
    return;
  }

  grid.innerHTML = products.map((p, i) => {
    const waMsg  = encodeURIComponent(`السلام عليكم، أريد الاستفسار عن: ${p.name} 🌹`);
    const waLink = WA_BASE + waMsg;

    // Use image if provided AND exists, otherwise fall back to emoji
    const visual = p.image
      ? `<img
           src="${p.image}"
           alt="${p.name}"
           class="card-img"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
         />
         <div class="card-emoji-fallback" style="display:none">${p.emoji || "🧴"}</div>`
      : `<div class="card-emoji-fallback">${p.emoji || "🧴"}</div>`;

    return `
      <div class="product-card" style="animation-delay:${i * 0.06}s" data-id="${p.id}">
        <div class="card-topline"></div>
        <div class="card-visual">
          ${visual}
        </div>
        <div class="card-body">
          <div class="card-cat">${p.category}</div>
          <div class="card-name">${p.name}</div>
          ${p.brand ? `<div class="card-brand">${p.brand}</div>` : ""}
          ${p.desc  ? `<div class="card-desc">${p.desc}</div>`   : ""}
          <div class="card-footer">
            <div class="card-actions">
              <a class="card-wa" href="${waLink}" target="_blank">
                <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                استفسر
              </a>
            </div>
            <div class="card-price-wrap">
              <div class="card-price">${p.price || ""}</div>
              <div class="card-size">${p.size  || ""}</div>
            </div>
          </div>
        </div>
      </div>`;
  }).join("");
}

// ══════════════════════════════════════════════
//  5. SEARCH INPUT listener
// ══════════════════════════════════════════════
document.getElementById("searchInput").addEventListener("input", function () {
  searchQuery = this.value.trim();
  applyFilters();
});

// ══════════════════════════════════════════════
//  6. SET SOCIAL LINKS everywhere on the page
// ══════════════════════════════════════════════
function setSocialLinks() {
  const waDefault = WA_BASE + encodeURIComponent("السلام عليكم، أريد الاستفسار عن أحد العطور 🌹");

  document.querySelectorAll(".js-wa-link").forEach(el => {
    el.href = waDefault;
  });
  document.querySelectorAll(".js-fb-link").forEach(el => {
    el.href = FACEBOOK_URL;
  });
}
setSocialLinks();

// ══════════════════════════════════════════════
//  7. MODAL — Add New Product
// ══════════════════════════════════════════════
const overlay    = document.getElementById("modalOverlay");
const emojiPrev  = document.getElementById("emojiPreview");

// Open
document.getElementById("fabBtn").addEventListener("click", () => {
  overlay.classList.add("open");
});

// Close
document.getElementById("modalClose").addEventListener("click", closeModal);
overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

function closeModal() {
  overlay.classList.remove("open");
}

// Emoji live preview
document.getElementById("fEmoji").addEventListener("input", function () {
  emojiPrev.textContent = this.value.trim() || "🧴";
});

// ── SAVE (adds to allProducts in memory + re-renders) ──
document.getElementById("saveBtn").addEventListener("click", () => {
  const name = document.getElementById("fName").value.trim();
  if (!name) { alert("الرجاء إدخال اسم العطر"); return; }

  const newProduct = {
    id:       Date.now(),
    name,
    brand:    document.getElementById("fBrand").value.trim()    || "عطور الجنوب",
    category: document.getElementById("fCategory").value,
    price:    document.getElementById("fPrice").value.trim()    || "اتصل للسعر",
    size:     document.getElementById("fSize").value.trim()     || "—",
    desc:     document.getElementById("fDesc").value.trim()     || "",
    emoji:    document.getElementById("fEmoji").value.trim()    || "🧴",
    image:    document.getElementById("fImage").value.trim()    || null,
  };

  // Add to the top of the list
  allProducts.unshift(newProduct);

  // Rebuild category buttons in case new category was added
  buildCategoryButtons(allProducts);

  // Reset filters and re-render
  searchQuery    = "";
  activeCategory = "الكل";
  document.getElementById("searchInput").value = "";

  // Reset form fields
  ["fName","fBrand","fPrice","fSize","fDesc","fEmoji","fImage"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("fCategory").selectedIndex = 0;
  emojiPrev.textContent = "🧴";

  closeModal();
  applyFilters();

  // Tip: remind user to add to products.json for permanent save
  console.info(
    "✅ Product added in memory.\n" +
    "📝 To save permanently, add this to products.json:\n" +
    JSON.stringify(newProduct, null, 2)
  );
});
