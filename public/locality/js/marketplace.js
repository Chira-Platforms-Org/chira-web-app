/* =========================
   LOCALITY MARKETPLACE V2
   Split-view local food routine marketplace
========================= */

const marketplaceSearchInput = document.getElementById("marketplaceSearchInput");
const marketplaceCategoryFilter = document.getElementById("marketplaceCategoryFilter");
const marketplacePickupFilter = document.getElementById("marketplacePickupFilter");
const marketplaceResultsList = document.getElementById("marketplaceResultsList");
const resultsTitle = document.getElementById("resultsTitle");
const resultsKicker = document.getElementById("resultsKicker");
const resultsCount = document.getElementById("resultsCount");
const routineBuilderPanel = document.getElementById("routineBuilderPanel");
const previewPanel = document.getElementById("marketplacePreviewPanel");
const previewPanelContent = document.getElementById("previewPanelContent");
const previewBackBtn = document.getElementById("previewBackBtn");
const mapFloatingTitle = document.getElementById("mapFloatingTitle");

let marketplaceMap = null;
let activeMarkers = [];
let activeMode = "products";
let marketplaceProfiles = [];
let marketplaceProducts = [];

const SAVED_PRODUCTS_KEY = "locality_saved_products";
const FOLLOWED_PRODUCERS_KEY = "locality_followed_producers";
const ROUTINE_KEY = "locality_routine_categories";

const pickupOptions = [
  "farm-stand",
  "market",
  "community-drop",
  "delivery"
];

function getStoredList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function setStoredList(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function toggleStoredItem(key, id) {
  const existing = getStoredList(key);
  const next = existing.includes(id)
    ? existing.filter((item) => item !== id)
    : [...existing, id];

  setStoredList(key, next);
  renderMarketplace();
}

function isStored(key, id) {
  return getStoredList(key).includes(id);
}

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatCategory(category = "") {
  return String(category || "specialty")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getProducerTypeLabel(profile = {}) {
  const category = String(profile.businessCategory || profile.productType || "").toLowerCase();

  if (category.includes("bakery")) return "Bakery";
  if (category.includes("butcher") || category.includes("meat")) return "Butcher / producer";
  if (category.includes("dairy")) return "Dairy producer";
  if (profile.type === "farm") return "Farm / producer";
  if (profile.type === "buyer") return "Buyer / business";

  return "Food producer";
}

function isSellerProfile(profile = {}) {
  return profile.type === "farm" || Array.isArray(profile.productsAvailable);
}

function getProducerInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "LC";
}

function getProducerLogoHtml(profile = {}) {
  if (profile.logo) {
    return `<img src="images/logos/${profile.logo}" alt="${profile.name} logo">`;
  }

  if (profile.logo_url) {
    return `<img src="${profile.logo_url}" alt="${profile.name} logo">`;
  }

  return getProducerInitials(profile.name);
}

function getPickupLabel(product = {}, producer = {}) {
  if (product.pickupLabel) return product.pickupLabel;
  if (producer.pickupLabel) return producer.pickupLabel;

  const category = product.category || producer.productType;

  if (category === "dairy" || category === "eggs") return "Saturday pickup";
  if (category === "vegetables" || category === "produce" || category === "leafy-greens") return "Farm stand pickup";
  if (category === "beef" || category === "meat") return "Preorder pickup";

  return "Pickup window available";
}

function getPickupType(product = {}, producer = {}) {
  if (product.pickupType) return product.pickupType;
  if (producer.pickupType) return producer.pickupType;

  const category = product.category || producer.productType;

  if (category === "dairy") return "community-drop";
  if (category === "eggs") return "farm-stand";
  if (category === "beef" || category === "meat") return "market";

  return pickupOptions[Math.abs(slugify(`${producer.name}-${product.name}`).length) % pickupOptions.length];
}

function normalizeStaticProfiles() {
  const sourceProfiles = Array.isArray(window.LocalityStaticProfiles)
    ? window.LocalityStaticProfiles
    : Array.isArray(window.profiles)
      ? window.profiles
      : [];

  console.log("Loaded marketplace profiles:", sourceProfiles.length);

  return sourceProfiles.map((profile) => ({
    ...profile,
    id: profile.id || slugify(profile.name),
    businessCategory: profile.businessCategory || profile.productType,
    sellerTypeLabel: getProducerTypeLabel(profile)
  }));
}

function normalizeStaticProducts(profileList = []) {
  return profileList
    .filter(isSellerProfile)
    .flatMap((profile) => {
      const products = Array.isArray(profile.productsAvailable) ? profile.productsAvailable : [];

      return products.map((product, index) => {
        const category = product.category || profile.productType || "specialty";
        const id = `${profile.id}-${slugify(product.name)}-${index}`;

        return {
          id,
          name: product.name || "Local product",
          category,
          price: product.price || "Request quote",
          note: product.note || "Available",
          organic: product.organic ?? profile.organic,
          producerId: profile.id,
          producerName: profile.name,
          producerLocation: profile.location,
          producerTypeLabel: getProducerTypeLabel(profile),
          pickupLabel: getPickupLabel(product, profile),
          pickupType: getPickupType(product, profile),
          lat: profile.lat,
          lng: profile.lng,
          sourceProfile: profile
        };
      });
    });
}

/*
  Backend wiring note:
  This function currently uses data/profiles.js for the redesign.
  Next pass can replace this with:
  - public business_profiles where profile_visibility = public
  - public business_products where visibility = public
  - latitude/longitude from business_profiles
*/
async function loadMarketplaceData() {
  marketplaceProfiles = normalizeStaticProfiles();
  marketplaceProducts = normalizeStaticProducts(marketplaceProfiles);
}

function getSearchValue() {
  return (marketplaceSearchInput?.value || "").trim().toLowerCase();
}

function getSelectedCategory() {
  return marketplaceCategoryFilter?.value || "all";
}

function getSelectedPickup() {
  return marketplacePickupFilter?.value || "all";
}

function productMatchesFilters(product) {
  const search = getSearchValue();
  const category = getSelectedCategory();
  const pickup = getSelectedPickup();

  const searchableText = [
    product.name,
    product.category,
    product.producerName,
    product.producerLocation,
    product.note,
    product.pickupLabel,
    product.producerTypeLabel
  ].join(" ").toLowerCase();

  const categoryGroup = getCategoryGroup(product.category);

  return (
    (!search || searchableText.includes(search)) &&
    (category === "all" || product.category === category || categoryGroup === category) &&
    (pickup === "all" || product.pickupType === pickup)
  );
}

function producerMatchesFilters(profile) {
  const search = getSearchValue();
  const category = getSelectedCategory();
  const pickup = getSelectedPickup();

  const searchableText = [
    profile.name,
    profile.location,
    profile.product,
    profile.productType,
    profile.sellerTypeLabel,
    ...(profile.productsAvailable || []).map((item) => item.name)
  ].join(" ").toLowerCase();

  const hasCategory = category === "all" ||
    profile.productType === category ||
    (profile.productsAvailable || []).some((product) => {
      const group = getCategoryGroup(product.category);
      return product.category === category || group === category;
    });

  const hasPickup = pickup === "all" || pickupOptions.includes(pickup);

  return (!search || searchableText.includes(search)) && hasCategory && hasPickup;
}

function getCategoryGroup(category = "") {
  const value = String(category).toLowerCase();

  if (["vegetables", "leafy-greens", "root-vegetables", "herbs", "citrus"].includes(value)) return "produce";
  if (["beef", "pork", "poultry"].includes(value)) return "meat";
  if (["grains", "rice", "bakery"].includes(value)) return "bakery";

  return value;
}

function getVisibleProducts() {
  return marketplaceProducts.filter(productMatchesFilters).slice(0, 60);
}

function getVisibleProducers() {
  return marketplaceProfiles.filter(isSellerProfile).filter(producerMatchesFilters).slice(0, 40);
}

function setMode(mode) {
  activeMode = mode;

  document.querySelectorAll("[data-marketplace-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.marketplaceMode === mode);
  });

  renderMarketplace();
}

function createProductCard(product) {
  const saved = isStored(SAVED_PRODUCTS_KEY, product.id);

  const card = document.createElement("article");
  card.className = "marketplace-result-card product-result-card";
  card.innerHTML = `
    <div class="result-image ${getCategoryGroup(product.category)}"></div>

    <div class="result-content">
      <div class="result-topline">
        <span class="result-type-pill">${formatCategory(product.category)}</span>
        <button type="button" class="save-action ${saved ? "is-saved" : ""}" aria-label="Save product" title="Save product">
          ★
        </button>
      </div>

      <div>
        <h3>${product.name}</h3>
        <p>${product.producerName} · ${product.producerTypeLabel}</p>
      </div>

      <div class="result-meta-row">
        <span>${product.price}</span>
        <span>${product.note}</span>
        <span>${product.pickupLabel}</span>
      </div>

      <div class="result-actions">
        <a href="coming-soon.html" class="primary-result-action">Reserve</a>
        <button type="button" class="gold-result-action" data-action="add-routine">
          Remind me
        </button>
        <button type="button" class="secondary-result-action" data-action="view-producer">
          View producer
        </button>
      </div>
    </div>
  `;

  card.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;
    openPreviewForProduct(product);
  });

  card.querySelector(".save-action")?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleStoredItem(SAVED_PRODUCTS_KEY, product.id);
  });

   card.querySelector('[data-action="add-routine"]')?.addEventListener("click", (event) => {
     event.stopPropagation();
   
     toggleStoredItem(ROUTINE_KEY, getCategoryGroup(product.category));
   
     const button = event.currentTarget;
     button.textContent = "Reminder added";
     button.classList.add("is-added");
   
     setTimeout(() => {
       button.textContent = "Remind me";
     }, 1400);
   });

  card.querySelector('[data-action="view-producer"]')?.addEventListener("click", (event) => {
    event.stopPropagation();
    openPreviewForProducer(product.sourceProfile);
  });

  return card;
}

function createProducerCard(profile) {
  const followed = isStored(FOLLOWED_PRODUCERS_KEY, profile.id);
  const listedProducts = profile.productsAvailable || [];

  const card = document.createElement("article");
  card.className = "marketplace-result-card producer-card";
  card.innerHTML = `
    <div class="producer-card-header">
      <div class="producer-logo">${getProducerLogoHtml(profile)}</div>

      <div>
        <span class="result-type-pill">${getProducerTypeLabel(profile)}</span>
        <h3>${profile.name}</h3>
        <p>${profile.location}</p>
      </div>

      <button type="button" class="save-action ${followed ? "is-saved" : ""}" aria-label="Follow producer" title="Follow producer">
        ★
      </button>
    </div>

    <p>${profile.product || "Local products and pickup options."}</p>

    <div class="producer-tags">
      <span>${listedProducts.length} listed items</span>
      <span>${profile.availability || "Weekly availability"}</span>
      <span>${profile.deliveryRadius || "Regional pickup"}</span>
    </div>

    <div class="result-actions">
      <button type="button" class="primary-result-action" data-action="see-products">
        See products
      </button>
      <button type="button" class="gold-result-action" data-action="follow">
        ${followed ? "Following" : "Follow producer"}
      </button>
      <a href="public-profile.html" target="_blank" rel="noopener" class="secondary-result-action">
        Full profile
      </a>
    </div>
  `;

  card.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;
    openPreviewForProducer(profile);
  });

  card.querySelector(".save-action")?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleStoredItem(FOLLOWED_PRODUCERS_KEY, profile.id);
  });

  card.querySelector('[data-action="follow"]')?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleStoredItem(FOLLOWED_PRODUCERS_KEY, profile.id);
  });

  card.querySelector('[data-action="see-products"]')?.addEventListener("click", (event) => {
    event.stopPropagation();
    activeMode = "products";
    marketplaceCategoryFilter.value = profile.productType || "all";
    setMode("products");
  });

  return card;
}

function renderMarketplace() {
  if (!marketplaceResultsList) return;

  marketplaceResultsList.innerHTML = "";

  const isRoutine = activeMode === "routine";

  routineBuilderPanel?.classList.toggle("hidden", !isRoutine);

  if (activeMode === "products") {
    const products = getVisibleProducts();

    resultsKicker.textContent = "Products";
    resultsTitle.textContent = "Fresh listings near you";
    resultsCount.textContent = `${products.length} results`;
    mapFloatingTitle.textContent = "Product availability near you";

    products.forEach((product) => marketplaceResultsList.appendChild(createProductCard(product)));
    renderMarkers(products, "products");
    return;
  }

  if (activeMode === "producers") {
    const producers = getVisibleProducers();

    resultsKicker.textContent = "Producers";
    resultsTitle.textContent = "Farms and food producers";
    resultsCount.textContent = `${producers.length} results`;
    mapFloatingTitle.textContent = "Producers near you";

    producers.forEach((producer) => marketplaceResultsList.appendChild(createProducerCard(producer)));
    renderMarkers(producers, "producers");
    return;
  }

   const producers = getVisibleProducers();
   
   resultsKicker.textContent = "Routine";
   resultsTitle.textContent = "Set up soft reminders";
   resultsCount.textContent = "No automatic orders";
   mapFloatingTitle.textContent = "Routine-friendly producers";
   
   marketplaceResultsList.innerHTML = `
     <article class="routine-explainer-card">
       <span>How routines work</span>
       <strong>Routines help you repeat local buying without committing to automatic orders.</strong>
       <p>
         Choose staples you buy often. Locality can help you remember pickup windows,
         follow relevant producers, and find fresh availability when it comes back around.
       </p>
   
       <div class="routine-meaning-grid">
         <div>
           <strong>Save</strong>
           <small>Bookmark a product or producer for later.</small>
         </div>
   
         <div>
           <strong>Routine</strong>
           <small>Tell Locality this is something you buy regularly.</small>
         </div>
   
         <div>
           <strong>Reserve</strong>
           <small>Actively request or hold available goods.</small>
         </div>
       </div>
     </article>
   `;
   
      renderMarkers(producers, "producers");
}

function initializeMap() {
  const mapElement = document.getElementById("localityMap");

  if (!mapElement || !window.L) return;

  marketplaceMap = L.map("localityMap", {
    zoomControl: false
  }).setView([33.45, -111.95], 9);

  L.control.zoom({
    position: "bottomright"
  }).addTo(marketplaceMap);

  L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19
  }).addTo(marketplaceMap);
}

function getMarkerIcon(item, mode) {
  const pinClass = mode === "products"
    ? "product-pin"
    : item.type === "buyer"
      ? "buyer-pin"
      : "producer-pin";

  const glyph = mode === "products"
    ? "●"
    : item.iconVariant
      ? getProfileGlyph(item.iconVariant)
      : "●";

  return L.divIcon({
    className: "",
    html: `
      <div class="pin-wrap">
        <div class="locality-pin ${pinClass}">
          <span class="pin-glyph">${glyph}</span>
        </div>
      </div>
    `,
    iconSize: [58, 66],
    iconAnchor: [29, 58],
    popupAnchor: [0, -52]
  });
}

function getProfileGlyph(variant) {
  const icons = {
    leaf: "❦",
    sun: "◉",
    field: "≋",
    sprout: "◜",
    barn: "⌂",
    orchard: "✿",
    market: "▣",
    basket: "◫",
    store: "⌑",
    kitchen: "◌",
    table: "⬒",
    hall: "◈",
    restaurant: "◫",
    chef: "◍",
    cactus: "✦"
  };

  return icons[variant] || "●";
}

function getTooltipContent(item, mode) {
  if (mode === "products") {
    return `
      <div class="profile-popup">
        <h3>${item.name}</h3>
        <div class="profile-meta">${item.producerName}</div>
        <p>${item.price} · ${item.pickupLabel}</p>
      </div>
    `;
  }

  return `
    <div class="profile-popup">
      <h3>${item.name}</h3>
      <div class="profile-meta">${item.location}</div>
      <p>${item.product || getProducerTypeLabel(item)}</p>
    </div>
  `;
}

function renderMarkers(items, mode) {
  if (!marketplaceMap) return;

  activeMarkers.forEach((marker) => marketplaceMap.removeLayer(marker));
  activeMarkers = [];

  items.forEach((item) => {
    if (!Number.isFinite(Number(item.lat)) || !Number.isFinite(Number(item.lng))) return;

    const marker = L.marker([item.lat, item.lng], {
      icon: getMarkerIcon(item, mode)
    }).addTo(marketplaceMap);

    marker.bindTooltip(getTooltipContent(item, mode), {
      permanent: false,
      direction: "top",
      offset: [0, -44],
      className: "profile-hover-card"
    });

    marker.on("click", () => {
      if (mode === "products") {
        openPreviewForProduct(item);
      } else {
        openPreviewForProducer(item);
      }
    });

    marker.on("mouseover", function () {
      this.openTooltip();
    });

    marker.on("mouseout", function () {
      this.closeTooltip();
    });

    activeMarkers.push(marker);
  });

  if (activeMarkers.length) {
    const group = L.featureGroup(activeMarkers);
    marketplaceMap.fitBounds(group.getBounds().pad(0.16), {
      maxZoom: 10
    });
  }
}

function openPreviewPanel() {
  previewPanel?.classList.add("active");
  previewPanel?.setAttribute("aria-hidden", "false");
}

function closePreviewPanel() {
  previewPanel?.classList.remove("active");
  previewPanel?.setAttribute("aria-hidden", "true");
}

function openPreviewForProduct(product) {
  const producer = product.sourceProfile || marketplaceProfiles.find((profile) => profile.id === product.producerId);

  previewPanelContent.innerHTML = `
    <article class="preview-hero-card">
      <div class="preview-cover"></div>

      <div class="preview-body">
        <div class="preview-logo">${getProducerLogoHtml(producer || {})}</div>

        <div>
          <span class="result-type-pill">${formatCategory(product.category)}</span>
          <h2>${product.name}</h2>
          <p>${product.producerName} · ${product.producerTypeLabel}</p>
        </div>

        <div class="preview-chip-row">
          <span>${product.price}</span>
          <span>${product.note}</span>
          <span>${product.pickupLabel}</span>
          ${product.organic ? "<span>Organic</span>" : ""}
        </div>

        <p>
          Save this product or add it to a soft routine so Locality can help you remember when similar local goods are available nearby.
        </p>

        <div class="preview-action-grid">
          <a href="coming-soon.html" class="preview-action-primary">Reserve</a>
          <button type="button" class="preview-action-gold" data-preview-save>
            ${isStored(SAVED_PRODUCTS_KEY, product.id) ? "Saved" : "Save product"}
          </button>
          <button type="button" class="preview-action-gold" data-preview-routine>
            Add ${formatCategory(getCategoryGroup(product.category))} to routine
          </button>
          <button type="button" class="preview-action-secondary" data-preview-producer>
            View producer
          </button>
        </div>
      </div>
    </article>
  `;

  previewPanelContent.querySelector("[data-preview-save]")?.addEventListener("click", () => {
    toggleStoredItem(SAVED_PRODUCTS_KEY, product.id);
    openPreviewForProduct(product);
  });

  previewPanelContent.querySelector("[data-preview-routine]")?.addEventListener("click", () => {
    toggleStoredItem(ROUTINE_KEY, getCategoryGroup(product.category));
  });

  previewPanelContent.querySelector("[data-preview-producer]")?.addEventListener("click", () => {
    if (producer) openPreviewForProducer(producer);
  });

  openPreviewPanel();
}

function openPreviewForProducer(profile) {
  const followed = isStored(FOLLOWED_PRODUCERS_KEY, profile.id);
  const products = (profile.productsAvailable || []).slice(0, 5);

  previewPanelContent.innerHTML = `
    <article class="preview-hero-card">
      <div class="preview-cover"></div>

      <div class="preview-body">
        <div class="preview-logo">${getProducerLogoHtml(profile)}</div>

        <div>
          <span class="result-type-pill">${getProducerTypeLabel(profile)}</span>
          <h2>${profile.name}</h2>
          <p>${profile.location}</p>
        </div>

        <p>${profile.description || profile.product || "Local products, pickup options, and recurring availability."}</p>

        <div class="preview-chip-row">
          <span>${products.length} listed items</span>
          <span>${profile.availability || "Weekly availability"}</span>
          <span>${profile.deliveryRadius || "Regional pickup"}</span>
          ${profile.organic ? "<span>Organic</span>" : ""}
        </div>

        <div class="preview-action-grid">
          <button type="button" class="preview-action-gold" data-preview-follow>
            ${followed ? "Following" : "Follow producer"}
          </button>
          <button type="button" class="preview-action-primary" data-preview-products>
            See products
          </button>
          <a href="public-profile.html" target="_blank" rel="noopener" class="preview-action-secondary">
            Open full profile
          </a>
        </div>

        <div>
          <p class="marketplace-kicker green">Available products</p>
          <div class="preview-product-list">
            ${
              products.length
                ? products.map((product) => `
                  <div class="preview-product-row">
                    <strong>${product.name}</strong>
                    <span>${product.price || "Request quote"}</span>
                  </div>
                `).join("")
                : `
                  <div class="preview-product-row">
                    <strong>No public products yet</strong>
                    <span>Check back soon</span>
                  </div>
                `
            }
          </div>
        </div>
      </div>
    </article>
  `;

  previewPanelContent.querySelector("[data-preview-follow]")?.addEventListener("click", () => {
    toggleStoredItem(FOLLOWED_PRODUCERS_KEY, profile.id);
    openPreviewForProducer(profile);
  });

  previewPanelContent.querySelector("[data-preview-products]")?.addEventListener("click", () => {
    activeMode = "products";
    marketplaceCategoryFilter.value = profile.productType || "all";
    closePreviewPanel();
    setMode("products");
  });

  openPreviewPanel();
}

function attachEventListeners() {
  document.querySelectorAll("[data-marketplace-mode]").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.marketplaceMode));
  });

  marketplaceSearchInput?.addEventListener("input", renderMarketplace);
  marketplaceCategoryFilter?.addEventListener("change", renderMarketplace);
  marketplacePickupFilter?.addEventListener("change", renderMarketplace);

  document.querySelectorAll("[data-quick-category]").forEach((button) => {
    button.addEventListener("click", () => {
      marketplaceCategoryFilter.value = button.dataset.quickCategory;
      setMode("products");
    });
  });

  document.querySelectorAll("[data-routine-category]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleStoredItem(ROUTINE_KEY, button.dataset.routineCategory);
      marketplaceCategoryFilter.value = button.dataset.routineCategory;
      setMode("products");
    });
  });

  previewBackBtn?.addEventListener("click", closePreviewPanel);
}

async function initializeMarketplace() {
  initializeMap();
  attachEventListeners();
  await loadMarketplaceData();

  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const view = params.get("view");

  if (category && marketplaceCategoryFilter) {
    marketplaceCategoryFilter.value = category;
  }

  if (view === "farms" || view === "producers") {
    activeMode = "producers";
  }

  if (view === "routine") {
    activeMode = "routine";
  }

  setMode(activeMode);
}

initializeMarketplace();
