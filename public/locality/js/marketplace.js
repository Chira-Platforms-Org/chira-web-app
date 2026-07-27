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

const marketplaceProductFilters =
  document.getElementById(
    "marketplaceProductFilters"
  );

const marketplaceBusinessRoleFilters =
  document.getElementById(
    "marketplaceBusinessRoleFilters"
  );

const marketplaceBusinessLegend =
  document.getElementById(
    "marketplaceBusinessLegend"
  );

let marketplaceMap = null;
let activeMarkers = [];
let activeMode = "products";
let marketplaceProfiles = [];
let marketplaceProducts = [];

let savedProductIds = new Set();
let savedBusinessIds = new Set();
let basketProductIds = new Set();
let basketQuantitiesByProductId = new Map();

let activeBusinessRole = "all";
let currentBusinessProfileId = null;
let marketplaceIsReady = false;

const SAVED_PRODUCTS_KEY = "locality_saved_products";
const SAVED_BUSINESSES_KEY = "locality_saved_businesses";
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

function getBookmarkOutlineIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4.75h10a1 1 0 0 1 1 1v13.5l-6-3.8-6 3.8V5.75a1 1 0 0 1 1-1Z"></path>
    </svg>
  `;
}

function getBasketOutlineIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 10h10l-1 8H8l-1-8Z"></path>
      <path d="M9 10 12 6l3 4"></path>
      <path d="M10 13.5h4"></path>
    </svg>
  `;
}

function getTrashOutlineIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14"></path>
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"></path>
      <path d="M8 7l.7 11a1 1 0 0 0 1 .94h4.6a1 1 0 0 0 1-.94L16 7"></path>
    </svg>
  `;
}

function getCheckIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5 10 17l9-10"></path>
    </svg>
  `;
}

function bookmarkIconSvg() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4.8c0-.9.7-1.6 1.6-1.6h6.8c.9 0 1.6.7 1.6 1.6v15.4l-5-3.2-5 3.2V4.8Z"></path>
    </svg>
  `;
}

function basketActionIconSvg() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9h14l-1.3 9.2a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8L5 9Z"></path>
      <path d="M8 9c.35-3.4 1.8-5.2 4-5.2S15.65 5.6 16 9"></path>
      <path d="M7.8 12.4h8.4"></path>
    </svg>
  `;
}

function checkIconSvg() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 6.5 9.5 17 4 11.5"></path>
    </svg>
  `;
}

function isSavedProduct(productId) {
  return savedProductIds.has(productId);
}

function isSavedBusiness(businessId) {
  return savedBusinessIds.has(businessId);
}

function isProductInBasket(productId) {
  return basketProductIds.has(productId);
}

function animateActionSuccess(button, finalHtml) {
  if (!button) return;

  button.classList.add("is-confirming");
  button.innerHTML = checkIconSvg();

  window.setTimeout(() => {
    button.classList.remove("is-confirming");
    button.innerHTML = finalHtml;
  }, 1200);
}

function syncLocalSavedFallback() {
  savedProductIds = new Set([
    ...savedProductIds,
    ...getStoredList(SAVED_PRODUCTS_KEY)
  ]);

  savedBusinessIds = new Set([
    ...savedBusinessIds,
    ...getStoredList(SAVED_BUSINESSES_KEY)
  ]);
}

async function loadSourcingState() {
  syncLocalSavedFallback();

  if (!window.LocalitySourcingService) {
    return;
  }

  const user =
    await window.LocalityAuthService?.getCurrentUser?.();

  if (!user) {
    return;
  }

  const [savedResult, basketResult] =
    await Promise.all([
      window.LocalitySourcingService.getSavedNetwork(),
      window.LocalitySourcingService.getBasketItems()
    ]);

  if (!savedResult.error && savedResult.data) {
    savedProductIds = new Set(
      (savedResult.data.savedProducts || [])
        .map((item) => item.product_id)
        .filter(Boolean)
    );

    savedBusinessIds = new Set(
      (savedResult.data.savedBusinesses || [])
        .map((item) => item.business_profile_id)
        .filter(Boolean)
    );
  }

   if (!basketResult.error && basketResult.data) {
     const basketItems =
       basketResult.data.basketItems || [];
   
     basketProductIds = new Set(
       basketItems
         .map((item) => item.product_id)
         .filter(Boolean)
     );
   
     basketQuantitiesByProductId = new Map(
       basketItems
         .filter((item) => item.product_id)
         .map((item) => [
           item.product_id,
           clampQty(
             item.quantity_value ||
             item.quantity ||
             1
           )
         ])
     );
   
     window.LocalityAppShell?.setBasketCount?.(
       basketItems.length || 0
     );
   }
}

function clampQty(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

function buildQtyLinkedControl({
  productId,
  quantity = 1,
  mode = "basket", // "basket" or "trash"
  isActive = false
}) {
  const actionClass =
    mode === "trash"
      ? "qty-link-action qty-link-trash"
      : `qty-link-action ${isActive ? "is-active-basket" : ""}`;

  const wrapperClass =
    mode === "trash"
      ? "qty-link-control is-remove-mode"
      : `qty-link-control ${isActive ? "is-basket-active" : ""}`;

  const iconMarkup =
    mode === "trash" ? getTrashOutlineIcon() : getBasketOutlineIcon();

  return `
    <div class="qty-link-stack" data-product-id="${productId}">
      <span class="qty-link-label">Qty</span>
      <div class="${wrapperClass}" data-role="qty-link-control" data-mode="${mode}">
        <button type="button" class="qty-link-step" data-qty-step="-1" aria-label="Decrease quantity">−</button>
        <div class="qty-link-number-wrap">
          <input
            class="qty-link-number"
            type="number"
            min="1"
            step="1"
            value="${clampQty(quantity)}"
            inputmode="numeric"
            aria-label="Quantity"
          />
        </div>
        <button type="button" class="qty-link-step" data-qty-step="1" aria-label="Increase quantity">+</button>
        <button
          type="button"
          class="${actionClass}"
          data-qty-action="${mode}"
          aria-label="${mode === "trash" ? "Remove from basket" : "Add to basket"}"
        >
          ${iconMarkup}
        </button>
      </div>
    </div>
  `;
}

function runTemporaryCheckState(button) {
  if (!button) return;
  const previous = button.innerHTML;
  button.classList.add("is-checking");
  button.innerHTML = getCheckIcon();

  window.setTimeout(() => {
    button.classList.remove("is-checking");
    button.innerHTML = previous;
  }, 900);
}

function getQtyValueFromControl(container) {
  const input = container?.querySelector(".qty-link-number");
  return clampQty(input?.value || 1);
}

function updateQtyInput(container, nextValue) {
  const input = container?.querySelector(".qty-link-number");
  if (!input) return 1;
  const qty = clampQty(nextValue);
  input.value = qty;
  return qty;
}

async function saveMarketplaceProduct(product, button) {
  if (!product?.id) return;

  if (!window.LocalitySourcingService?.saveProduct) {
    toggleStoredItem(SAVED_PRODUCTS_KEY, product.id);
    return;
  }

  const wasSaved = isSavedProduct(product.id);

  button?.classList.add("is-busy");

  try {
    if (wasSaved) {
      const result =
        await window.LocalitySourcingService.unsaveProduct(product.id);

      if (result.error) {
        console.error("Unable to unsave product:", result.error);
        button?.classList.add("is-error");
        return;
      }

      savedProductIds.delete(product.id);
      button?.classList.remove("is-saved");
      button?.setAttribute("aria-label", "Save product");
      button?.setAttribute("title", "Save product");
      return;
    }

    const result =
      await window.LocalitySourcingService.saveProduct({
        productId: product.id,
        businessProfileId: product.producerId
      });

    if (result.error) {
      console.error("Unable to save product:", result.error);
      button?.classList.add("is-error");
      return;
    }

    savedProductIds.add(product.id);

    if (product.producerId) {
      savedBusinessIds.add(product.producerId);
    }

    button?.classList.add("is-saved");
    button?.setAttribute("aria-label", "Saved product");
    button?.setAttribute("title", "Saved product");

    animateActionSuccess(
      button,
      bookmarkIconSvg()
    );
  } finally {
    button?.classList.remove("is-busy");

    window.setTimeout(() => {
      renderMarketplace();
    }, 900);
  }
}

async function saveMarketplaceBusiness(profile, button) {
  if (!profile?.id) return;

  if (!window.LocalitySourcingService?.saveBusiness) {
    toggleStoredItem(SAVED_BUSINESSES_KEY, profile.id);
    return;
  }

  const wasSaved = isSavedBusiness(profile.id);

  button?.classList.add("is-busy");

  try {
    if (wasSaved) {
      const result =
        await window.LocalitySourcingService.unsaveBusiness(profile.id);

      if (result.error) {
        console.error("Unable to unsave business:", result.error);
        button?.classList.add("is-error");
        return;
      }

      savedBusinessIds.delete(profile.id);
      button?.classList.remove("is-saved");
      return;
    }

    const result =
      await window.LocalitySourcingService.saveBusiness(profile.id);

    if (result.error) {
      console.error("Unable to save business:", result.error);
      button?.classList.add("is-error");
      return;
    }

    savedBusinessIds.add(profile.id);
    button?.classList.add("is-saved");

    animateActionSuccess(
      button,
      bookmarkIconSvg()
    );
  } finally {
    button?.classList.remove("is-busy");

    window.setTimeout(() => {
      renderMarketplace();
    }, 900);
  }
}

async function addMarketplaceProductToBasket(product, button, quantityValue = 1) {
  if (!product?.id) return;

  if (!window.LocalitySourcingService?.addProductToBasket) {
    console.error("LocalitySourcingService.addProductToBasket is unavailable.");
    window.location.href = "account.html";
    return;
  }

  const qty =
    Math.max(
      1,
      Number(quantityValue) || 1
    );

  const orderingStatus =
    getMarketplaceOrderStatus(
      product,
      qty
    );

  if (
    !orderingStatus.canAddToBasket
  ) {
    console.warn(
      "This product is not currently orderable."
    );

    button?.classList.add(
      "is-error"
    );

    return;
  }

  button?.classList.add(
    "is-busy"
  );

  try {
    const result =
      await window.LocalitySourcingService.addProductToBasket({
        productId: product.id,
        businessProfileId: product.producerId,
        quantityValue: qty
      });

    if (result.error) {
      console.error("Unable to add product to basket:", result.error);
      button?.classList.add("is-error");
      return;
    }

    basketProductIds.add(product.id);
    basketQuantitiesByProductId.set(product.id, qty);

    button?.classList.add("is-added");
    button?.classList.add("is-active-basket");

    button
      ?.closest("[data-qty-basket-control]")
      ?.classList.add("is-active-basket");

    animateActionSuccess(
      button,
      basketActionIconSvg()
    );

    const countResult =
      await window.LocalitySourcingService.getBasketCount?.();

    if (!countResult?.error) {
      window.LocalityAppShell?.setBasketCount?.(
        countResult.data || 0
      );
    }

    window.dispatchEvent(
      new CustomEvent("locality:basket-updated")
    );
  } finally {
    button?.classList.remove("is-busy");

    window.setTimeout(() => {
      renderMarketplace();
    }, 900);
  }
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

function parseJsonValue(value, fallback) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parseArray(value) {
  const parsed = parseJsonValue(value, []);
  return Array.isArray(parsed) ? parsed : [];
}

function getProfileRoleInfo(profile = {}) {
  const roles = parseArray(
    profile.marketplace_roles
  ).map((role) =>
    String(role).toLowerCase()
  );

  let canBuy =
    roles.includes("buyer") ||
    roles.includes("buyer_seller");

  let canSell =
    roles.includes("seller") ||
    roles.includes("buyer_seller");

  /*
    Support older static Marketplace profiles that
    do not yet contain marketplace_roles.
  */
  if (!roles.length) {
    const legacyType =
      String(profile.type || "")
        .toLowerCase();

    if (legacyType === "buyer") {
      canBuy = true;
    }

    if (
      legacyType === "farm" ||
      legacyType === "producer" ||
      Array.isArray(profile.productsAvailable)
    ) {
      canSell = true;
    }
  }

  let roleType = "business";

  if (canBuy && canSell) {
    roleType = "both";
  } else if (canSell) {
    roleType = "seller";
  } else if (canBuy) {
    roleType = "buyer";
  }

  return {
    canBuy,
    canSell,
    roleType
  };
}

function profileHasSellerRole(profile = {}) {
  return getProfileRoleInfo(profile).canSell;
}

function getBusinessRoleLabel(profile = {}) {
  const { roleType } =
    getProfileRoleInfo(profile);

  if (roleType === "both") {
    return "Buyer and seller";
  }

  if (roleType === "seller") {
    return "Seller";
  }

  if (roleType === "buyer") {
    return "Business buyer";
  }

  return "Local business";
}

function getBusinessTypeLabel(profile = {}) {
  const category =
    profile.businessCategory ||
    profile.productType ||
    getPrimaryBusinessCategory(profile) ||
    "other";

  return formatCategory(category);
}

function isOwnBusiness(profile = {}) {
  return Boolean(
    currentBusinessProfileId &&
    profile.id === currentBusinessProfileId
  );
}

function isOwnProduct(product = {}) {
  return Boolean(
    currentBusinessProfileId &&
    product.producerId ===
      currentBusinessProfileId
  );
}

function syncCurrentBusinessContext(
  context = {}
) {
  currentBusinessProfileId =
    context.businessProfile?.id || null;

  if (marketplaceIsReady) {
    renderMarketplace();
  }
}

window.addEventListener(
  "locality:app-context-ready",
  (event) => {
    syncCurrentBusinessContext(
      event.detail || {}
    );
  }
);

function getPrimaryBusinessCategory(profile = {}) {
  const categories = parseArray(profile.business_categories);
  return categories[0] || "other";
}

function getProfileDescription(profile = {}) {
  const { canSell, canBuy } =
    getProfileRoleInfo(profile);

  const fallback =
    canBuy && !canSell
      ? "A local business participating in the regional food network."
      : "Local products, partnerships, and pickup opportunities.";

  return (
    profile.short_intro ||
    profile.description ||
    profile.about_us ||
    fallback
  );
}

function getPublicProfileUrl(profile = {}) {
  if (!profile.id) return "public-profile.html";

  return `public-profile.html?id=${encodeURIComponent(profile.id)}`;
}

function getPublicSupplyUrl(profile = {}) {
  if (!profile.id) return "supply.html";

  return `supply.html?id=${encodeURIComponent(profile.id)}`;
}

function getPublicProductPrice(product = {}) {
  const price = String(product.price_display || "").trim();
  const unit = String(product.price_unit || "").trim();

  if (!price) return "Request quote";
  if (!unit) return price;

  const readableUnit =
    unit === "custom"
      ? product.unit_description || "custom unit"
      : unit;

  return `${price} / ${readableUnit}`;
}

function inferPickupTypeFromProduct(product = {}) {
  const text = [
    product.fulfillment_notes,
    product.season_notes,
    product.description
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("deliver")) {
    return "delivery";
  }

  if (
    text.includes("community") ||
    text.includes("drop point") ||
    text.includes("drop-off") ||
    text.includes("drop off")
  ) {
    return "community-drop";
  }

  if (
    text.includes("market") ||
    text.includes("farmers market") ||
    text.includes("farmer's market")
  ) {
    return "market";
  }

  return "farm-stand";
}

function getPublicPickupLabel(product = {}) {
  const fulfillment = String(product.fulfillment_notes || "").trim();

  if (!fulfillment) {
    return "Pickup details available";
  }

  return fulfillment.length > 46
    ? `${fulfillment.slice(0, 43)}...`
    : fulfillment;
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
  const sourceProfiles =
    Array.isArray(
      window.LocalityStaticProfiles
    )
      ? window.LocalityStaticProfiles
      : Array.isArray(window.profiles)
        ? window.profiles
        : [];

  console.log(
    "Loaded marketplace profiles:",
    sourceProfiles.length
  );

  return sourceProfiles.map((profile) => {
    const roleInfo =
      getProfileRoleInfo(profile);

    const normalizedProfile = {
      ...profile,

      id:
        profile.id ||
        slugify(profile.name),

      businessCategory:
        profile.businessCategory ||
        profile.productType ||
        "other",

      canBuy: roleInfo.canBuy,
      canSell: roleInfo.canSell,

      marketplaceRoleType:
        roleInfo.roleType
    };

    normalizedProfile.businessTypeLabel =
      getBusinessTypeLabel(
        normalizedProfile
      );

    normalizedProfile.sellerTypeLabel =
      getProducerTypeLabel(
        normalizedProfile
      );

    return normalizedProfile;
  });
}

function normalizeSupabaseProfile(
  profile = {}
) {
  const category =
    getPrimaryBusinessCategory(profile);

  const roleInfo =
    getProfileRoleInfo(profile);

  const normalizedProfile = {
    ...profile,

    id: profile.id,

    name:
      profile.name ||
      "Local business",

    type:
      roleInfo.roleType === "buyer"
        ? "buyer"
        : "business",

    businessCategory: category,
    productType: category,

    businessTypeLabel:
      formatCategory(category),

    canBuy: roleInfo.canBuy,
    canSell: roleInfo.canSell,

    marketplaceRoleType:
      roleInfo.roleType,

    product:
      getProfileDescription(profile),

    description:
      getProfileDescription(profile),

    location:
      profile.location_label ||
      "Local area",

    lat: Number(profile.latitude),
    lng: Number(profile.longitude),

    logo_url:
      profile.logo_url || "",

    banner_image_url:
      profile.banner_image_url || "",

    productsAvailable: []
  };

  normalizedProfile.sellerTypeLabel =
    getProducerTypeLabel(
      normalizedProfile
    );

  normalizedProfile.organic =
    parseArray(
      profile.certifications
    ).some((certification) => {
      const name =
        typeof certification === "string"
          ? certification
          : certification?.name;

      return String(name || "")
        .toLowerCase()
        .includes("organic");
    });

  return normalizedProfile;
}

function normalizeSupabaseProduct(product = {}, producer = {}) {
  const category =
    product.category ||
    producer.productType ||
    "specialty";

  return {
    id: product.id,

    name: product.name || "Local product",
    category,

    description: product.description || "",
    image_url: product.image_url || "",

    price: getPublicProductPrice(product),
    note: product.availability_status || "Availability available",

    minimumOrder:
      product.minimum_order || "",

    priceUnit:
      product.price_unit || "",

    unitDescription:
      product.unit_description || "",

    orderMode:
      window.LocalityOrderingRules
        ?.normalizeOrderMode(
          product.order_mode
        ) || "buy_now",

    buyNowLimit:
      product.buy_now_limit === null ||
      product.buy_now_limit === undefined ||
      product.buy_now_limit === ""
        ? null
        : Number(product.buy_now_limit),

    buyNowLimitUnit:
      product.buy_now_limit_unit ||
      product.price_unit ||
      "",

    requestThresholdNote:
      product.request_threshold_note || "",

    seasonNotes:
      product.season_notes || "",

    fulfillmentNotes:
      product.fulfillment_notes || "",

    featured: Boolean(product.featured),
    organic: Boolean(producer.organic),

    producerId: producer.id,
    producerName: producer.name,
    producerLocation: producer.location,
    producerTypeLabel: producer.sellerTypeLabel,

    pickupLabel: getPublicPickupLabel(product),
    pickupType: inferPickupTypeFromProduct(product),

    lat: producer.lat,
    lng: producer.lng,

    sourceProfile: producer,
    sourceProduct: product
  };
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
  const profileMethod =
    window.LocalityProfileService?.getPublicMarketplaceProfiles;

  const productMethod =
    window.LocalityProductService?.getPublicMarketplaceProducts;

  if (!profileMethod || !productMethod) {
    console.warn(
      "Public marketplace services are unavailable. Using static fallback data."
    );

    marketplaceProfiles = normalizeStaticProfiles();
    marketplaceProducts =
      normalizeStaticProducts(marketplaceProfiles);

    return {
      source: "static-fallback",
      error: null
    };
  }

  const [profileResult, productResult] =
    await Promise.all([
      profileMethod(),
      productMethod()
    ]);

  if (profileResult.error || productResult.error) {
    console.error(
      "Public profile query failed:",
      profileResult.error
    );

    console.error(
      "Public product query failed:",
      productResult.error
    );

    throw (
      profileResult.error ||
      productResult.error ||
      new Error("Marketplace query failed.")
    );
  }

const normalizedProfiles =
  (profileResult.data || [])
    .map(normalizeSupabaseProfile)
      .filter((profile) => {
        return (
          profile.id &&
          Number.isFinite(profile.lat) &&
          Number.isFinite(profile.lng)
        );
      });

  const producerById = new Map(
    normalizedProfiles.map((profile) => [
      profile.id,
      profile
    ])
  );

  const normalizedProducts =
    (productResult.data || [])
      .map((product) => {
        const producer = producerById.get(
          product.business_profile_id
        );

        if (!producer) return null;

        return normalizeSupabaseProduct(
          product,
          producer
        );
      })
      .filter(Boolean);

  normalizedProducts.forEach((product) => {
    const producer = producerById.get(
      product.producerId
    );

    if (!producer) return;

    producer.productsAvailable.push({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      note: product.note,
      description: product.description,
      image_url: product.image_url,
      organic: product.organic
    });
  });

  marketplaceProfiles = normalizedProfiles;
  marketplaceProducts = normalizedProducts;

  console.log(
    "Loaded Supabase marketplace profiles:",
    marketplaceProfiles.length
  );

  console.log(
    "Loaded Supabase marketplace products:",
    marketplaceProducts.length
  );

  return {
    source: "supabase",
    error: null
  };
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

function businessMatchesSearch(
  profile = {}
) {
  const search = getSearchValue();

  if (!search) return true;

  const searchableText = [
    profile.name,
    profile.location,
    profile.product,
    profile.description,
    profile.productType,
    profile.businessCategory,
    profile.businessTypeLabel,
    getBusinessRoleLabel(profile),

    ...(profile.productsAvailable || [])
      .map((item) => item.name)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(search);
}

function businessMatchesFilters(
  profile = {}
) {
  if (!businessMatchesSearch(profile)) {
    return false;
  }

  const roleType =
    profile.marketplaceRoleType ||
    getProfileRoleInfo(profile).roleType;

  return (
    activeBusinessRole === "all" ||
    roleType === activeBusinessRole
  );
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

function getVisibleBusinesses() {
  return marketplaceProfiles
    .filter(businessMatchesFilters)
    .slice(0, 60);
}

function getVisibleRoutineBusinesses() {
  return marketplaceProfiles
    .filter(profileHasSellerRole)
    .filter(businessMatchesSearch)
    .slice(0, 40);
}

function setMode(mode) {
  activeMode = mode;

  document
    .querySelectorAll(
      "[data-marketplace-mode]"
    )
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.marketplaceMode ===
          mode
      );
    });

  marketplaceProductFilters
    ?.classList.toggle(
      "hidden",
      mode !== "products"
    );

  marketplaceBusinessRoleFilters
    ?.classList.toggle(
      "hidden",
      mode !== "businesses"
    );

  marketplaceBusinessLegend
    ?.classList.toggle(
      "hidden",
      mode !== "businesses"
    );

  renderMarketplace();
}

function setBusinessRole(role) {
  activeBusinessRole =
    role || "all";

  document
    .querySelectorAll(
      "[data-business-role]"
    )
    .forEach((button) => {
      const isActive =
        button.dataset.businessRole ===
        activeBusinessRole;

      button.classList.toggle(
        "active",
        isActive
      );

      button.setAttribute(
        "aria-pressed",
        String(isActive)
      );
    });

  renderMarketplace();
}

function getMarketplaceOrderStatus(
  product,
  quantity = 1
) {
  if (
    window.LocalityOrderingRules
      ?.getProductOrderStatus
  ) {
    return window.LocalityOrderingRules
      .getProductOrderStatus(
        product,
        quantity,
        product.producerName ||
        "this business"
      );
  }

  return {
    tone: "buy-now",
    compactLabel: "Buy now",
    title: "Buy now",
    description:
      "This product can be ordered immediately.",
    sellerNote: "",
    canAddToBasket: true,
    requiresRequest: false
  };
}

function escapeMarketplaceOrderText(
  value = ""
) {
  return window.LocalityOrderingRules
    ?.escapeHtml
    ? window.LocalityOrderingRules
        .escapeHtml(value)
    : String(value);
}

function buildMarketplaceOrderStatusMarkup(
  status
) {
  return `
    <div
      class="buyer-order-status is-${
        status.tone
      }"
      data-marketplace-order-status
      title="${escapeMarketplaceOrderText(
        status.description
      )}"
      aria-live="polite"
    >
      <span
        class="buyer-order-status-dot"
        aria-hidden="true"
      ></span>

      <strong>
        ${escapeMarketplaceOrderText(
          status.compactLabel
        )}
      </strong>
    </div>
  `;
}

function buildMarketplaceOrderDetailMarkup(
  status
) {
  return `
    <div
      class="buyer-order-detail is-${
        status.tone
      }"
      data-marketplace-order-detail
    >
      <span class="buyer-order-detail-eyebrow">
        Ordering
      </span>

      <strong>
        ${escapeMarketplaceOrderText(
          status.title
        )}
      </strong>

      <p>
        ${escapeMarketplaceOrderText(
          status.description
        )}
      </p>

      ${
        status.sellerNote
          ? `
            <small>
              Seller note:
              ${escapeMarketplaceOrderText(
                status.sellerNote
              )}
            </small>
          `
          : ""
      }
    </div>
  `;
}

function applyMarketplaceOrderPresentation(
  card,
  product,
  quantity
) {
  const status =
    getMarketplaceOrderStatus(
      product,
      quantity
    );

  const statusElement =
    card.querySelector(
      "[data-marketplace-order-status]"
    );

  if (!statusElement) {
    return;
  }

  statusElement.className =
    `buyer-order-status is-${status.tone}`;

  statusElement.title =
    status.description;

  const statusText =
    statusElement.querySelector("strong");

  if (statusText) {
    statusText.textContent =
      status.compactLabel;
  }
}

function createProductCard(product) {
   const saved =
      isSavedProduct(product.id);
    
   const inBasket =
      isProductInBasket(product.id);
   
   const basketQty =
     basketQuantitiesByProductId?.get(product.id) || 1;
   
   const ownListing =
     isOwnProduct(product);

   const orderStatus =
     getMarketplaceOrderStatus(
       product,
       basketQty
     );

  const card =
    document.createElement("article");

  card.className =
    `marketplace-result-card product-result-card${
      ownListing ? " is-own-result" : ""
    }`;

  card.innerHTML = `
    <div
      class="result-image ${getCategoryGroup(
        product.category
      )}"
    >
      ${
        product.image_url
          ? `
            <img
              src="${product.image_url}"
              alt="${
                product.name ||
                "Local product"
              }"
              loading="lazy"
            />
          `
          : ""
      }
    </div>

    <div class="result-content">
      <div class="result-topline">
        <div class="result-label-stack">
          <span class="result-type-pill">
            ${formatCategory(
              product.category
            )}
          </span>

          ${
            ownListing
              ? `
                <span class="ownership-badge">
                  Your listing
                </span>
              `
              : ""
          }
        </div>

         ${
           ownListing
             ? ""
             : `
          <div class="marketplace-action-cluster">
            <div
              class="marketplace-order-stack ${
                orderStatus.canAddToBasket
                  ? ""
                  : "is-disabled"
              }"
            >
              ${
                orderStatus.canAddToBasket
                  ? buildQtyLinkedControl({
                      productId:
                        product.id,

                      quantity:
                        basketQty,

                      mode:
                        "basket",

                      isActive:
                        inBasket
                    })
                  : ""
              }

              ${buildMarketplaceOrderStatusMarkup(
                orderStatus
              )}
            </div>
          
            <button
              type="button"
              class="marketplace-icon-btn save-action ${
                saved
                  ? "is-active-save is-saved"
                  : ""
              }"
              aria-label="${
                saved
                  ? "Saved product"
                  : "Save product"
              }"
              aria-pressed="${
                saved
                  ? "true"
                  : "false"
              }"
              title="${
                saved
                  ? "Saved product"
                  : "Save product"
              }"
            >
              ${bookmarkIconSvg()}
            </button>
          </div>
             `
         }
        
      </div>

      <div>
        <h3>${product.name}</h3>

        <p>
          ${product.producerName}
          ·
          ${product.producerTypeLabel}
        </p>
      </div>

      <div class="result-meta-row">
        <span>${product.price}</span>
        <span>${product.note}</span>
        <span>${product.pickupLabel}</span>
      </div>

      <div class="result-actions">
        ${
          ownListing
            ? `
              <a
                href="supply-builder.html"
                class="primary-result-action"
              >
                Manage listing
              </a>

              <a
                href="${getPublicSupplyUrl(
                  product.sourceProfile || {}
                )}"
                target="_blank"
                rel="noopener"
                class="secondary-result-action"
              >
                View public supply
              </a>
            `

              <button
                type="button"
                class="gold-result-action"
                data-action="add-routine"
              >
                Remind me
              </button>

              <button
                type="button"
                class="secondary-result-action"
                data-action="view-business"
              >
                View business
              </button>
            `
        }
      </div>
    </div>
  `;

   card.addEventListener(
     "click",
     (event) => {
       if (
         event.target.closest(
           'a, button, input, select, textarea, .qty-link-stack, [data-role="qty-link-control"]'
         )
       ) {
         return;
       }
   
       openPreviewForProduct(product);
     }
   );

card
  .querySelector(".save-action")
  ?.addEventListener(
    "click",
    async (event) => {
      event.stopPropagation();

      await saveMarketplaceProduct(
        product,
        event.currentTarget
      );
    }
  );

const qtyStack =
  card.querySelector(".qty-link-stack");

qtyStack?.addEventListener(
  "click",
  async (event) => {
    event.stopPropagation();

    const inputClick =
      event.target.closest(".qty-link-number");

    if (inputClick) {
      return;
    }

    event.preventDefault();

    const control =
      event.currentTarget.querySelector(
        '[data-role="qty-link-control"]'
      );

    const input =
      control?.querySelector(".qty-link-number");

    const stepButton =
      event.target.closest("[data-qty-step]");

    const basketButton =
      event.target.closest(
        '[data-qty-action="basket"]'
      );

    if (!control || !input) return;

    const currentQty =
      clampQty(input.value);

    if (stepButton) {
      const step =
        Number(stepButton.dataset.qtyStep || 0);

      const nextQty =
        updateQtyInput(
          control,
          currentQty + step
        );

      basketQuantitiesByProductId.set(
        product.id,
        nextQty
      );

      applyMarketplaceOrderPresentation(
        card,
        product,
        nextQty
      );

      return;

    if (basketButton) {
      await addMarketplaceProductToBasket(
        product,
        basketButton,
        clampQty(input.value)
      );
    }
  }
);

qtyStack?.addEventListener(
  "input",
  (event) => {
    event.stopPropagation();

    const input =
      event.target.closest(".qty-link-number");

    if (!input) return;

    const qty =
      clampQty(input.value);

    basketQuantitiesByProductId.set(
      product.id,
      qty
    );

    applyMarketplaceOrderPresentation(
      card,
      product,
      qty
    );
  }
);

qtyStack?.addEventListener(
  "change",
  (event) => {
    event.stopPropagation();

    const input =
      event.target.closest(".qty-link-number");

    if (!input) return;

    const qty =
      clampQty(input.value);

    input.value = String(qty);

    basketQuantitiesByProductId.set(
      product.id,
      qty
    );

    applyMarketplaceOrderPresentation(
      card,
      product,
      qty
    );
  }
);
   
  card
    .querySelector(
      '[data-action="add-routine"]'
    )
    ?.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        toggleStoredItem(
          ROUTINE_KEY,
          getCategoryGroup(
            product.category
          )
        );

        const button =
          event.currentTarget;

        button.textContent =
          "Reminder added";

        button.classList.add(
          "is-added"
        );

        setTimeout(() => {
          button.textContent =
            "Remind me";
        }, 1400);
      }
    );

  card
    .querySelector(
      '[data-action="view-business"]'
    )
    ?.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        openPreviewForBusiness(
          product.sourceProfile
        );
      }
    );

  return card;
}

function createBusinessCard(profile) {
  const saved =
    isSavedBusiness(profile.id);

  const ownBusiness =
    isOwnBusiness(profile);

  const roleInfo =
    getProfileRoleInfo(profile);

  const listedProducts =
    profile.productsAvailable || [];

  const roleClass =
    `is-role-${roleInfo.roleType}`;

  const card =
    document.createElement("article");

  card.className =
    `marketplace-result-card producer-card business-card ${
      roleClass
    }${
      ownBusiness
        ? " is-own-result"
        : ""
    }`;

  card.innerHTML = `
    <div class="producer-card-header">
      <div class="producer-logo">
        ${getProducerLogoHtml(profile)}
      </div>

      <div>
        <div class="business-card-labels">
          <span
            class="result-type-pill ${roleClass}"
          >
            ${getBusinessRoleLabel(profile)}
          </span>

          ${
            ownBusiness
              ? `
                <span class="ownership-badge">
                  Your business
                </span>
              `
              : ""
          }
        </div>

        <h3>${profile.name}</h3>

        <p>
          ${getBusinessTypeLabel(profile)}
          ·
          ${profile.location}
        </p>
      </div>

      ${
        ownBusiness
          ? ""
          : `
            <button
              type="button"
              class="save-action ${
                saved ? "is-saved" : ""
              }"
              aria-label="${saved ? "Saved business" : "Save business"}"
              title="${saved ? "Saved business" : "Save business"}"
            >
              ${bookmarkIconSvg()}
            </button>
          `
      }
    </div>

    <p>
      ${
        profile.description ||
        profile.product ||
        "A local business in the Locality network."
      }
    </p>

    <div class="producer-tags">
      <span>
        ${getBusinessTypeLabel(profile)}
      </span>

      <span>
        ${getBusinessRoleLabel(profile)}
      </span>

      ${
        roleInfo.canSell
          ? `
            <span>
              ${listedProducts.length}
              ${
                listedProducts.length === 1
                  ? "public product"
                  : "public products"
              }
            </span>
          `
          : `
            <span>
              Local sourcing profile
            </span>
          `
      }
    </div>

      <div class="result-actions">
        ${
          ownListing
            ? `
              <a
                href="supply-builder.html"
                class="primary-result-action"
              >
                Manage listing
              </a>

              <a
                href="${getPublicSupplyUrl(
                  product.sourceProfile || {}
                )}"
                target="_blank"
                rel="noopener"
                class="secondary-result-action"
              >
                View public supply
              </a>
            `
            : `
              <button
                type="button"
                class="gold-result-action"
                data-action="add-routine"
              >
                Remind me
              </button>

              <button
                type="button"
                class="secondary-result-action"
                data-action="view-business"
              >
                View business
              </button>
            `
        }
      </div>
  `;

  card.addEventListener(
    "click",
    (event) => {
      if (
        event.target.closest("a, button")
      ) {
        return;
      }

      openPreviewForBusiness(profile);
    }
  );

   card
     .querySelector('[data-action="save-business"]')
     ?.addEventListener(
       "click",
       async (event) => {
         event.stopPropagation();
   
         await saveMarketplaceBusiness(
           profile,
           event.currentTarget
         );
       }
     );
   
   card
     .querySelector(".producer-card-header .save-action")
     ?.addEventListener(
       "click",
       async (event) => {
         event.stopPropagation();
   
         await saveMarketplaceBusiness(
           profile,
           event.currentTarget
         );
       }
     );

  card
    .querySelector(
      '[data-action="see-products"]'
    )
    ?.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        if (marketplaceSearchInput) {
          marketplaceSearchInput.value =
            profile.name;
        }

        if (marketplaceCategoryFilter) {
          marketplaceCategoryFilter.value =
            "all";
        }

        if (marketplacePickupFilter) {
          marketplacePickupFilter.value =
            "all";
        }

        setMode("products");
      }
    );

  return card;
}

function renderMarketplaceLoading() {
  if (!marketplaceResultsList) return;

  resultsKicker.textContent = "Marketplace";
  resultsTitle.textContent = "Loading nearby listings";
  resultsCount.textContent = "Loading";

  marketplaceResultsList.innerHTML = `
    <div class="marketplace-state-card">
      <strong>Loading public products and businesses...</strong>
      <span>
        Locality is checking current marketplace availability.
      </span>
    </div>
  `;
}

function renderMarketplaceError(error) {
  if (!marketplaceResultsList) return;

  resultsKicker.textContent = "Marketplace";
  resultsTitle.textContent = "Marketplace unavailable";
  resultsCount.textContent = "Error";

  marketplaceResultsList.innerHTML = `
    <div class="marketplace-state-card is-error">
      <strong>We could not load marketplace listings.</strong>
      <span>
        Refresh the page or check the Supabase read policies.
      </span>
      ${
        error?.message
          ? `<small>${String(error.message)}</small>`
          : ""
      }
    </div>
  `;
}

function renderNoMarketplaceResults(
  mode = activeMode
) {
  if (!marketplaceResultsList) return;

  const message =
    mode === "businesses"
      ? "Try changing the business role or clearing the Marketplace search."
      : "Try clearing the search or changing the category and pickup filters.";

  marketplaceResultsList.innerHTML = `
    <div class="marketplace-state-card">
      <strong>
        No results match this view.
      </strong>

      <span>
        ${message}
      </span>
    </div>
  `;
}

function renderMarketplace() {
  if (!marketplaceResultsList) return;

  marketplaceResultsList.innerHTML = "";

  const isRoutine =
    activeMode === "routine";

  routineBuilderPanel
    ?.classList.toggle(
      "hidden",
      !isRoutine
    );

  if (activeMode === "products") {
    const products =
      getVisibleProducts();

    resultsKicker.textContent =
      "Products";

    resultsTitle.textContent =
      "Fresh listings near you";

    resultsCount.textContent =
      `${products.length} results`;

    mapFloatingTitle.textContent =
      "Product availability near you";

    if (!products.length) {
      renderNoMarketplaceResults(
        "products"
      );

      renderMarkers([], "products");
      return;
    }

    products.forEach((product) => {
      marketplaceResultsList.appendChild(
        createProductCard(product)
      );
    });

    renderMarkers(
      products,
      "products"
    );

    return;
  }

  if (activeMode === "businesses") {
    const businesses =
      getVisibleBusinesses();

    resultsKicker.textContent =
      "Businesses";

    resultsTitle.textContent =
      "Local food businesses near you";

    resultsCount.textContent =
      `${businesses.length} results`;

    mapFloatingTitle.textContent =
      "Buyers and sellers near you";

    if (!businesses.length) {
      renderNoMarketplaceResults(
        "businesses"
      );

      renderMarkers(
        [],
        "businesses"
      );

      return;
    }

    businesses.forEach((business) => {
      marketplaceResultsList.appendChild(
        createBusinessCard(business)
      );
    });

    renderMarkers(
      businesses,
      "businesses"
    );

    return;
  }

  const routineBusinesses =
    getVisibleRoutineBusinesses();

  resultsKicker.textContent =
    "Routine";

  resultsTitle.textContent =
    "Set up soft reminders";

  resultsCount.textContent =
    "No automatic orders";

  mapFloatingTitle.textContent =
    "Routine-friendly sellers";

  marketplaceResultsList.innerHTML = `
    <article class="routine-explainer-card">
      <span>
        How routines work
      </span>

      <strong>
        Routines help you repeat local buying
        without committing to automatic orders.
      </strong>

      <p>
        Choose staples you buy often. Locality can
        help you remember pickup windows, follow
        relevant businesses, and find fresh
        availability when it comes back around.
      </p>

      <div class="routine-meaning-grid">
        <div>
          <strong>Save</strong>

          <small>
            Bookmark a product or business for later.
          </small>
        </div>

        <div>
          <strong>Routine</strong>

          <small>
            Tell Locality this is something you buy
            regularly.
          </small>
        </div>

        <div>
          <strong>Reserve</strong>

          <small>
            Select quantities before placing an order or sending a request.
          </small>
        </div>
      </div>
    </article>
  `;

  renderMarkers(
    routineBusinesses,
    "businesses"
  );
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
  let pinClass = "business-both-pin";

  if (mode === "products") {
    pinClass = "product-pin";
  } else {
    const roleType =
      item.marketplaceRoleType ||
      getProfileRoleInfo(item).roleType;

    if (roleType === "buyer") {
      pinClass = "business-buyer-pin";
    } else if (roleType === "seller") {
      pinClass = "business-seller-pin";
    } else {
      pinClass = "business-both-pin";
    }
  }

  const ownResult =
    mode === "products"
      ? isOwnProduct(item)
      : isOwnBusiness(item);

  const glyph =
    mode === "products"
      ? "●"
      : item.iconVariant
        ? getProfileGlyph(
            item.iconVariant
          )
        : "●";

  return L.divIcon({
    className: "",

    html: `
      <div class="pin-wrap">
        <div
          class="locality-pin ${pinClass}${
            ownResult
              ? " is-own-pin"
              : ""
          }"
        >
          <span class="pin-glyph">
            ${glyph}
          </span>
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
     
        <h3>${item.name}</h3>
        <div class="profile-meta">${item.producerName}</div>
        <p>${item.price} · ${item.pickupLabel}</p>
      </div>
    `;
  }

return `
  <div class="profile-popup">
    <h3>
      ${item.name}
      ${
        isOwnBusiness(item)
          ? " · Your business"
          : ""
      }
    </h3>

    <div class="profile-meta">
      ${getBusinessTypeLabel(item)}
      ·
      ${item.location}
    </div>

    <p>
      ${getBusinessRoleLabel(item)}
    </p>
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
        openPreviewForBusiness(item);
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
  const business =
    product.sourceProfile ||
    marketplaceProfiles.find(
      (profile) =>
        profile.id ===
        product.producerId
    );

  const ownListing =
    isOwnProduct(product);

  const previewQuantity =
    basketQuantitiesByProductId
      .get(product.id) || 1;

  const orderStatus =
    getMarketplaceOrderStatus(
      product,
      previewQuantity
    );

  previewPanelContent.innerHTML = `
    <article class="preview-hero-card">
      <div class="preview-cover">
        ${
          product.image_url
            ? `
              <img
                src="${product.image_url}"
                alt="${
                  product.name ||
                  "Local product"
                }"
              />
            `
            : ""
        }
      </div>

      <div class="preview-body">
        <div class="preview-logo">
          ${getProducerLogoHtml(
            business || {}
          )}
        </div>

        <div>
          <div class="business-card-labels">
            <span class="result-type-pill">
              ${formatCategory(
                product.category
              )}
            </span>

            ${
              ownListing
                ? `
                  <span class="ownership-badge">
                    Your listing
                  </span>
                `
                : ""
            }
          </div>

          <h2>${product.name}</h2>

          <p>
            ${product.producerName}
            ·
            ${product.producerTypeLabel}
          </p>
        </div>

        <div class="preview-chip-row">
          <span>${product.price}</span>
          <span>${product.note}</span>
          <span>${product.pickupLabel}</span>

          ${
            product.organic
              ? "<span>Organic</span>"
              : ""
          }
        </div>

        ${
          ownListing
            ? ""
            : buildMarketplaceOrderDetailMarkup(
                orderStatus
              )
        }

        <p>
          ${
            ownListing
              ? "This is one of your public Marketplace listings."
              : "Save this product or add it to a soft routine so Locality can help you remember when similar goods are available."
          }
        </p>

        <div class="preview-action-grid">
          ${
            ownListing
              ? `
                <a
                  href="supply-builder.html"
                  class="preview-action-primary"
                >
                  Manage listing
                </a>

                <a
                  href="${getPublicSupplyUrl(
                    business || {}
                  )}"
                  target="_blank"
                  rel="noopener"
                  class="preview-action-secondary"
                >
                  View public supply
                </a>
              `
               : `
                ${
                  orderStatus.canAddToBasket
                    ? `
                      <button
                        type="button"
                        class="preview-action-primary basket-action"
                        data-preview-add-basket
                      >
                        Add to basket
                      </button>
                    `
                    : ""
                }
                
                <button
               
               <button
                 type="button"
                 class="preview-action-gold save-action ${
                   isStored(
                     SAVED_PRODUCTS_KEY,
                     product.id
                   )
                     ? "is-saved"
                     : ""
                 }"
                 data-preview-save-product
               >
                 ${
                   isStored(
                     SAVED_PRODUCTS_KEY,
                     product.id
                   )
                     ? "Saved"
                     : "Save product"
                 }
               </button>
               
               <button
                 type="button"
                 class="preview-action-gold"
                 data-preview-routine
               >
                 Add ${formatCategory(
                   getCategoryGroup(
                     product.category
                   )
                 )} to routine
               </button>
               
               <button
                 type="button"
                 class="preview-action-secondary"
                 data-preview-business
               >
                 View business
               </button>
              `
          }
        </div>
      </div>
    </article>
  `;

   previewPanelContent
     .querySelector(
       "[data-preview-save-product]"
     )
     ?.addEventListener(
       "click",
       async (event) => {
         event.stopPropagation();
   
         await saveMarketplaceProduct(
           product,
           event.currentTarget
         );
       }
     );

   previewPanelContent
     .querySelector(
       "[data-preview-add-basket]"
     )
     ?.addEventListener(
       "click",
       async (event) => {
         event.stopPropagation();
   
         await addMarketplaceProductToBasket(
           product,
           event.currentTarget,
           previewQuantity
         );
       }
     );

  previewPanelContent
    .querySelector(
      "[data-preview-routine]"
    )
    ?.addEventListener(
      "click",
      () => {
        toggleStoredItem(
          ROUTINE_KEY,
          getCategoryGroup(
            product.category
          )
        );
      }
    );

  previewPanelContent
    .querySelector(
      "[data-preview-business]"
    )
    ?.addEventListener(
      "click",
      () => {
        if (business) {
          openPreviewForBusiness(
            business
          );
        }
      }
    );

  openPreviewPanel();
}

function openPreviewForBusiness(profile) {
  const saved =
    isSavedBusiness(profile.id);

  const ownBusiness =
    isOwnBusiness(profile);

  const roleInfo =
    getProfileRoleInfo(profile);

  const products =
    (profile.productsAvailable || [])
      .slice(0, 5);

  previewPanelContent.innerHTML = `
    <article class="preview-hero-card">
      <div class="preview-cover">
        ${
          profile.banner_image_url
            ? `
              <img
                src="${profile.banner_image_url}"
                alt="${profile.name} banner"
              />
            `
            : ""
        }
      </div>

      <div class="preview-body">
        <div class="preview-logo">
          ${getProducerLogoHtml(profile)}
        </div>

        <div>
          <div class="business-card-labels">
            <span
              class="result-type-pill is-role-${
                roleInfo.roleType
              }"
            >
              ${getBusinessRoleLabel(profile)}
            </span>

            ${
              ownBusiness
                ? `
                  <span class="ownership-badge">
                    Your business
                  </span>
                `
                : ""
            }
          </div>

          <h2>${profile.name}</h2>

          <p>
            ${getBusinessTypeLabel(profile)}
            ·
            ${profile.location}
          </p>
        </div>

        <p>
          ${
            profile.description ||
            profile.product ||
            "A local business in the Locality network."
          }
        </p>

        <div class="preview-chip-row">
          <span>
            ${getBusinessRoleLabel(profile)}
          </span>

          <span>
            ${getBusinessTypeLabel(profile)}
          </span>

          ${
            roleInfo.canSell
              ? `
                <span>
                  ${products.length}
                  ${
                    products.length === 1
                      ? "listed product"
                      : "listed products"
                  }
                </span>
              `
              : `
                <span>
                  Local sourcing profile
                </span>
              `
          }

          ${
            profile.organic
              ? "<span>Organic</span>"
              : ""
          }
        </div>

        <div class="preview-action-grid">
          ${
            ownBusiness
              ? `
                <a
                  href="profile-builder.html"
                  class="preview-action-primary"
                >
                  Edit profile
                </a>

                ${
                  roleInfo.canSell
                    ? `
                      <a
                        href="supply-builder.html"
                        class="preview-action-gold"
                      >
                        Manage products
                      </a>
                    `
                    : ""
                }

                <a
                  href="${getPublicProfileUrl(
                    profile
                  )}"
                  target="_blank"
                  rel="noopener"
                  class="preview-action-secondary"
                >
                  Open public profile
                </a>
              `
              : `
                <a
                  href="coming-soon.html"
                  class="preview-action-primary"
                >
                  Message
                </a>

                <button
                  type="button"
                  class="preview-action-gold"
                  data-preview-save-business
                >
                  ${
                    saved
                      ? "Saved"
                      : "Save business"
                  }
                </button>

                ${
                  roleInfo.canSell &&
                  products.length
                    ? `
                      <button
                        type="button"
                        class="preview-action-gold"
                        data-preview-products
                      >
                        See products
                      </button>
                    `
                    : ""
                }

                <a
                  href="${getPublicProfileUrl(
                    profile
                  )}"
                  target="_blank"
                  rel="noopener"
                  class="preview-action-secondary"
                >
                  Open full profile
                </a>
              `
          }
        </div>

        ${
          roleInfo.canSell
            ? `
              <div>
                <p class="marketplace-kicker green">
                  Available products
                </p>

                <div class="preview-product-list">
                  ${
                    products.length
                      ? products
                          .map(
                            (product) => `
                              <div class="preview-product-row">
                                <strong>
                                  ${product.name}
                                </strong>

                                <span>
                                  ${
                                    product.price ||
                                    "Request quote"
                                  }
                                </span>
                              </div>
                            `
                          )
                          .join("")
                      : `
                        <div class="preview-product-row">
                          <strong>
                            No public products yet
                          </strong>

                          <span>
                            Check back soon
                          </span>
                        </div>
                      `
                  }
                </div>
              </div>
            `
            : ""
        }
      </div>
    </article>
  `;

   previewPanel
     .querySelector("[data-preview-save-business]")
     ?.addEventListener(
       "click",
       async (event) => {
         event.stopPropagation();
   
         await saveMarketplaceBusiness(
           profile,
           event.currentTarget
         );
       }
     );

  previewPanelContent
    .querySelector(
      "[data-preview-products]"
    )
    ?.addEventListener(
      "click",
      () => {
        if (marketplaceSearchInput) {
          marketplaceSearchInput.value =
            profile.name;
        }

        if (marketplaceCategoryFilter) {
          marketplaceCategoryFilter.value =
            "all";
        }

        if (marketplacePickupFilter) {
          marketplacePickupFilter.value =
            "all";
        }

        closePreviewPanel();
        setMode("products");
      }
    );

  openPreviewPanel();
}

function attachEventListeners() {
  document.querySelectorAll("[data-marketplace-mode]").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.marketplaceMode));
  });

   document
     .querySelectorAll(
       "[data-business-role]"
     )
     .forEach((button) => {
       button.addEventListener(
         "click",
         () => {
           setBusinessRole(
             button.dataset.businessRole
           );
         }
       );
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
  try {
    initializeMap();
    attachEventListeners();
    renderMarketplaceLoading();

    await loadMarketplaceData();
    await loadSourcingState();

     marketplaceIsReady = true;

      syncCurrentBusinessContext(
        window.LocalityAppShell
          ?.getContext?.() || {}
      );

    const params =
      new URLSearchParams(window.location.search);

    const category = params.get("category");
    const view = params.get("view");

    if (category && marketplaceCategoryFilter) {
      const categoryExists =
        [...marketplaceCategoryFilter.options].some(
          (option) => option.value === category
        );

      if (categoryExists) {
        marketplaceCategoryFilter.value = category;
      }
    }

   if (
     view === "farms" ||
     view === "producers" ||
     view === "businesses"
   ) {
     activeMode = "businesses";
   }

    if (view === "routine") {
      activeMode = "routine";
    }

    setMode(activeMode);

    window.setTimeout(() => {
      marketplaceMap?.invalidateSize();
    }, 120);
  } catch (error) {
    console.error(
      "Marketplace initialization failed:",
      error
    );

    renderMarketplaceError(error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeMarketplace
  );
} else {
  initializeMarketplace();
}
