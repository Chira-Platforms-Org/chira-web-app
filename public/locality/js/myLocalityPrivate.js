/* =========================
   PRIVATE BUYER MY LOCALITY
========================= */

const buyerWelcomeTitle =
  document.getElementById("buyerWelcomeTitle");

const buyerWelcomeText =
  document.getElementById("buyerWelcomeText");

const buyerLocationLabel =
  document.getElementById("buyerLocationLabel");

const buyerRadiusLabel =
  document.getElementById("buyerRadiusLabel");

const buyerFreshCount =
  document.getElementById("buyerFreshCount");

const buyerBusinessCount =
  document.getElementById("buyerBusinessCount");

const freshCarouselTrack =
  document.getElementById("freshCarouselTrack");

const freshCarouselPrev =
  document.getElementById("freshCarouselPrev");

const freshCarouselNext =
  document.getElementById("freshCarouselNext");

const freshCarouselToggle =
  document.getElementById("freshCarouselToggle");

const recommendedBusinessList =
  document.getElementById("recommendedBusinessList");

let publicProducts = [];
let publicBusinesses = [];
let featuredCards = [];

let carouselIndex = 0;
let carouselPaused = false;
let carouselTimer = null;

function getFirstName(name = "") {
  const cleanName =
    String(name || "").trim();

  if (!cleanName) return "there";

  return cleanName.split(/\s+/)[0];
}

function getBuyerDisplayName(
  userProfile = {},
  user = {}
) {
  return (
    userProfile.buyer_display_name ||
    userProfile.full_name ||
    user.email?.split("@")[0] ||
    "there"
  );
}

function getBuyerLocationLabel(userProfile = {}) {
  return (
    userProfile.buyer_location_label ||
    [
      userProfile.buyer_city,
      userProfile.buyer_state
    ]
      .filter(Boolean)
      .join(", ") ||
    "Set your location"
  );
}

function escapeHtml(value = "") {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(value = "") {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function normalizeRoleLabel(profile = {}) {
  const roles =
    parseArray(profile.marketplace_roles);

  const hasSeller =
    roles.includes("seller") ||
    roles.includes("supplier");

  const hasBuyer =
    roles.includes("buyer");

  if (hasBuyer && hasSeller) return "Buyer and seller";
  if (hasSeller) return "Seller";
  if (hasBuyer) return "Buyer";

  return "Local business";
}

function getPrimaryCategory(profile = {}) {
  const categories =
    parseArray(profile.business_categories);

  return (
    categories[0] ||
    profile.business_type ||
    profile.category ||
    "Local food business"
  );
}

function getBusinessDescription(profile = {}) {
  return (
    profile.short_intro ||
    profile.description ||
    profile.about_us ||
    "Explore this local food business on Locality."
  );
}

function getBusinessImage(profile = {}) {
  const gallery =
    parseArray(profile.gallery_images);

  return (
    profile.banner_image_url ||
    gallery[0] ||
    profile.logo_url ||
    ""
  );
}

function getProductBusiness(product = {}) {
  return publicBusinesses.find(
    (business) =>
      business.id === product.business_profile_id
  );
}

function getProductImage(product = {}) {
  return product.image_url || "";
}

function getProductPrice(product = {}) {
  return (
    product.price_display ||
    product.price_unit ||
    product.unit_description ||
    ""
  );
}

function getProductAvailability(product = {}) {
  return (
    product.availability_status ||
    product.season_notes ||
    "Available"
  );
}

function getPublicProfileUrl(profile = {}) {
  if (!profile.id) return "map.html?view=businesses";
  return `public-profile.html?id=${encodeURIComponent(profile.id)}`;
}

function getPublicSupplyUrl(profile = {}) {
  if (!profile.id) return "map.html?view=products";
  return `supply.html?id=${encodeURIComponent(profile.id)}`;
}

function getProductSearchUrl(product = {}) {
  const query =
    product.name ||
    product.category ||
    "local food";

  return `map.html?search=${encodeURIComponent(query)}`;
}

function getFallbackImageClass(type = "") {
  if (type === "business") return "business";

  return "product";
}

function buildFeaturedCards() {
  const productCards =
    publicProducts
      .slice(0, 8)
      .map((product) => {
        const business =
          getProductBusiness(product);

        return {
          type: "product",
          id: `product-${product.id}`,
          imageUrl: getProductImage(product),
          imageClass: getFallbackImageClass("product"),
          label: "Product",
          badge: getProductAvailability(product),
          title: product.name || "Local product",
          subtitle:
            product.description ||
            product.fulfillment_notes ||
            "Available from a nearby Locality business.",
          metaOne:
            business?.name ||
            "Locality business",
          metaTwo:
            getProductPrice(product) ||
            product.category ||
            "Fresh listing",
          primaryText: "View listing",
          primaryUrl: getProductSearchUrl(product),
          secondaryText: business
            ? "View business"
            : "Browse products",
          secondaryUrl: business
            ? getPublicProfileUrl(business)
            : "map.html?view=products"
        };
      });

  const businessCards =
    publicBusinesses
      .slice(0, 8)
      .map((business) => {
        return {
          type: "business",
          id: `business-${business.id}`,
          imageUrl: getBusinessImage(business),
          imageClass: getFallbackImageClass("business"),
          label: normalizeRoleLabel(business),
          badge: getPrimaryCategory(business),
          title: business.name || "Local business",
          subtitle: getBusinessDescription(business),
          metaOne:
            business.location_label ||
            business.city ||
            "Local service area",
          metaTwo:
            normalizeRoleLabel(business),
          primaryText: "View profile",
          primaryUrl: getPublicProfileUrl(business),
          secondaryText: "Browse products",
          secondaryUrl: getPublicSupplyUrl(business)
        };
      });

  const mixed = [];

  const maxLength =
    Math.max(productCards.length, businessCards.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (productCards[index]) {
      mixed.push(productCards[index]);
    }

    if (businessCards[index]) {
      mixed.push(businessCards[index]);
    }
  }

  return mixed;
}

function getVisibleCarouselCards() {
  if (!featuredCards.length) return [];

  const cards = [];

  for (let offset = 0; offset < 3; offset += 1) {
    const card =
      featuredCards[
        (carouselIndex + offset) %
          featuredCards.length
      ];

    if (card && !cards.some((item) => item.id === card.id)) {
      cards.push(card);
    }
  }

  return cards;
}

function createFeaturedCard(card = {}, index = 0) {
  const article =
    document.createElement("article");

  article.className =
    index === 0
      ? "fresh-card featured mixed-feature-card"
      : "fresh-card mixed-feature-card";

  const imageHtml = card.imageUrl
    ? `<img src="${escapeHtml(card.imageUrl)}" alt="${escapeHtml(card.title)}" loading="lazy" />`
    : `<div class="fresh-image ${escapeHtml(card.imageClass)}"></div>`;

  article.innerHTML = `
    <div class="fresh-card-media">
      ${imageHtml}
      <span class="feature-type-pill">${escapeHtml(card.label)}</span>
    </div>

    <div class="fresh-card-body">
      <span class="availability-pill">${escapeHtml(card.badge)}</span>

      <h3>${escapeHtml(card.title)}</h3>

      <p>${escapeHtml(card.subtitle)}</p>

      <div class="fresh-meta-row">
        <span>${escapeHtml(card.metaOne)}</span>
        <span>${escapeHtml(card.metaTwo)}</span>
      </div>

      <div class="fresh-actions">
        <a href="${escapeHtml(card.primaryUrl)}" class="mini-primary">
          ${escapeHtml(card.primaryText)}
        </a>

        <a href="${escapeHtml(card.secondaryUrl)}" class="mini-secondary">
          ${escapeHtml(card.secondaryText)}
        </a>
      </div>
    </div>
  `;

  return article;
}

function renderFreshCarousel() {
  if (!freshCarouselTrack) return;

  freshCarouselTrack.innerHTML = "";

  if (!featuredCards.length) {
    freshCarouselTrack.innerHTML = `
      <div class="locality-empty-state">
        No public products or businesses are available yet. Once nearby businesses publish listings, they will appear here.
      </div>
    `;

    return;
  }

  const visibleCards =
    getVisibleCarouselCards();

  visibleCards.forEach((card, index) => {
    freshCarouselTrack.appendChild(
      createFeaturedCard(card, index)
    );
  });
}

function stopCarouselTimer() {
  if (carouselTimer) {
    window.clearInterval(carouselTimer);
    carouselTimer = null;
  }
}

function startCarouselTimer() {
  stopCarouselTimer();

  if (carouselPaused || featuredCards.length <= 3) {
    return;
  }

  carouselTimer = window.setInterval(() => {
    carouselIndex =
      (carouselIndex + 3) % featuredCards.length;

    renderFreshCarousel();
  }, 10000);
}

function resetCarouselTimer() {
  stopCarouselTimer();
  startCarouselTimer();
}

function moveCarousel(direction = 1) {
  if (!featuredCards.length) return;

  carouselIndex =
    (carouselIndex + direction + featuredCards.length) %
    featuredCards.length;

  renderFreshCarousel();
  resetCarouselTimer();
}

function setCarouselPaused(paused) {
  carouselPaused = paused;

  if (freshCarouselToggle) {
    freshCarouselToggle.textContent = paused ? "▶" : "❚❚";
    freshCarouselToggle.setAttribute(
      "aria-pressed",
      paused ? "true" : "false"
    );

    freshCarouselToggle.setAttribute(
      "aria-label",
      paused
        ? "Resume featured carousel"
        : "Pause featured carousel"
    );
  }

  if (paused) {
    stopCarouselTimer();
  } else {
    startCarouselTimer();
  }
}

function renderRecommendedBusinesses() {
  if (!recommendedBusinessList) return;

  recommendedBusinessList.innerHTML = "";

  const recommended =
    publicBusinesses.slice(0, 4);

  if (!recommended.length) {
    recommendedBusinessList.innerHTML = `
      <div class="locality-empty-state compact">
        Recommended businesses will appear here as more public profiles are added.
      </div>
    `;

    return;
  }

  recommended.forEach((business) => {
    const link =
      document.createElement("a");

    link.href = getPublicProfileUrl(business);
    link.className = "farm-mini-row";

    link.innerHTML = `
      <span></span>

      <div>
        <strong>${escapeHtml(business.name || "Local business")}</strong>
        <small>
          ${escapeHtml(getPrimaryCategory(business))}
          ·
          ${escapeHtml(business.location_label || "Local area")}
        </small>
      </div>
    `;

    recommendedBusinessList.appendChild(link);
  });
}

function renderPrivateBuyerDashboard({
  user,
  userProfile
}) {
  const displayName =
    getBuyerDisplayName(userProfile, user);

  const firstName =
    getFirstName(displayName);

  const location =
    getBuyerLocationLabel(userProfile);

  const radius =
    Number(userProfile.buyer_radius_miles || 25);

  if (buyerWelcomeTitle) {
    buyerWelcomeTitle.textContent =
      `Your local food week, ${firstName}.`;
  }

  if (buyerWelcomeText) {
    buyerWelcomeText.textContent =
      "Explore fresh local products, pickup windows, saved businesses, and updates from nearby food producers.";
  }

  if (buyerLocationLabel) {
    buyerLocationLabel.textContent =
      location;
  }

  if (buyerRadiusLabel) {
    buyerRadiusLabel.textContent =
      `${radius} mile discovery radius`;
  }

  if (buyerFreshCount) {
    buyerFreshCount.textContent =
      String(publicProducts.length);
  }

  if (buyerBusinessCount) {
    buyerBusinessCount.textContent =
      String(publicBusinesses.length);
  }

  featuredCards = buildFeaturedCards();
  carouselIndex = 0;

  renderFreshCarousel();
  renderRecommendedBusinesses();
  startCarouselTimer();
}

async function loadPublicMarketplaceData() {
  const productService =
    window.LocalityProductService;

  const profileService =
    window.LocalityProfileService;

  const [productsResult, businessesResult] =
    await Promise.all([
      productService?.getPublicMarketplaceProducts
        ? productService.getPublicMarketplaceProducts()
        : { data: [], error: null },

      profileService?.getPublicMarketplaceProfiles
        ? profileService.getPublicMarketplaceProfiles()
        : { data: [], error: null }
    ]);

  if (productsResult?.error) {
    console.warn(
      "Unable to load public products:",
      productsResult.error
    );
  }

  if (businessesResult?.error) {
    console.warn(
      "Unable to load public businesses:",
      businessesResult.error
    );
  }

  publicProducts =
    Array.isArray(productsResult?.data)
      ? productsResult.data
      : [];

  publicBusinesses =
    Array.isArray(businessesResult?.data)
      ? businessesResult.data
      : [];
}

async function loadPrivateBuyerDashboard() {
  if (
    !window.LocalityAuthService?.getCurrentUser ||
    !window.LocalitySupabase
  ) {
    return;
  }

  const user =
    await window.LocalityAuthService.getCurrentUser();

  if (!user) {
    window.location.replace("account.html");
    return;
  }

  /*
    Guardrail: if a business account directly visits
    my-locality-private.html, send it back through the
    stable business workspace route.
  */
  if (
    window.LocalityProfileService
      ?.getMyPrimaryBusinessProfile
  ) {
    const businessResult =
      await window.LocalityProfileService
        .getMyPrimaryBusinessProfile();

    if (businessResult.data) {
      window.location.replace("supplier.html");
      return;
    }
  }

  const [{ data, error }] =
    await Promise.all([
      window.LocalitySupabase
        .from("user_profiles")
        .select(
          [
            "full_name",
            "buyer_display_name",
            "buyer_location_label",
            "buyer_city",
            "buyer_state",
            "buyer_zip_code",
            "buyer_radius_miles",
            "buyer_interests",
            "locality_account_type"
          ].join(", ")
        )
        .eq("id", user.id)
        .maybeSingle(),

      loadPublicMarketplaceData()
    ]);

  if (error) {
    console.warn(
      "Unable to load private buyer profile:",
      error
    );
  }

  renderPrivateBuyerDashboard({
    user,
    userProfile: data || {}
  });
}

function attachCarouselEvents() {
  freshCarouselPrev?.addEventListener("click", () => {
    moveCarousel(-3);
  });

  freshCarouselNext?.addEventListener("click", () => {
    moveCarousel(3);
  });

  freshCarouselToggle?.addEventListener("click", () => {
    setCarouselPaused(!carouselPaused);
  });

  freshCarouselTrack?.addEventListener("pointerenter", () => {
    stopCarouselTimer();
  });

  freshCarouselTrack?.addEventListener("pointerleave", () => {
    startCarouselTimer();
  });

  freshCarouselTrack?.addEventListener("focusin", () => {
    stopCarouselTimer();
  });

  freshCarouselTrack?.addEventListener("focusout", () => {
    startCarouselTimer();
  });
}

function initializePrivateBuyerPage() {
  attachCarouselEvents();
  loadPrivateBuyerDashboard();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializePrivateBuyerPage
  );
} else {
  initializePrivateBuyerPage();
}
