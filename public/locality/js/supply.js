/* =========================
   LOCALITY SUPPLY PAGE
   Buyer-facing preview for the signed-in user's business.
========================= */

const productGrid = document.getElementById("productGrid");
const supplyStatusText = document.getElementById("supplyStatusText");

const supplyBusinessLogo = document.getElementById("supplyBusinessLogo");
const supplyBusinessName = document.getElementById("supplyBusinessName");
const supplyBusinessMeta = document.getElementById("supplyBusinessMeta");
const supplyBusinessIntro = document.getElementById("supplyBusinessIntro");

const productSearchInput = document.getElementById("productSearchInput");
const productCategoryFilter = document.getElementById("productCategoryFilter");
const productAvailabilityFilter = document.getElementById("productAvailabilityFilter");
const productSortSelect = document.getElementById("productSortSelect");
const resetProductViewBtn = document.getElementById("resetProductViewBtn");

const categories = [
  "Produce",
  "Fruit",
  "Herbs",
  "Dairy",
  "Eggs",
  "Meat",
  "Flowers",
  "Prepared goods",
  "Other"
];

const availabilityOptions = [
  "Available now",
  "Limited availability",
  "Seasonal",
  "Coming soon",
  "Sold out",
  "Contract only",
  "Quote only"
];

let currentProfile = null;
let products = [];
let expandedProductId = null;

function setSupplyStatus(message) {
  if (supplyStatusText) {
    supplyStatusText.textContent = message;
  }
}

function getBusinessRoles(profile) {
  const roles = Array.isArray(profile?.marketplace_roles)
    ? profile.marketplace_roles
    : [];

  return roles
    .map((role) => {
      if (role === "buyer_seller") return "Buyer / Seller";
      if (role === "seller") return "Seller";
      if (role === "buyer") return "Buyer";
      return String(role || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    })
    .filter(Boolean);
}

function getBusinessCategories(profile) {
  const categoriesValue = Array.isArray(profile?.business_categories)
    ? profile.business_categories
    : [];

  return categoriesValue
    .map((category) => {
      if (category === "farm") return "Farm";
      return String(category || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    })
    .filter(Boolean);
}

function getBusinessLocation(profile) {
  return profile?.location_label || profile?.address || "";
}

function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "?";

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function renderBusinessHeader(profile) {
  if (!profile) return;

  const name = profile.name || "Your business";
  const location = getBusinessLocation(profile);
  const roles = getBusinessRoles(profile);
  const businessCategories = getBusinessCategories(profile);
  const metaParts = [location, ...businessCategories, ...roles].filter(Boolean);

  if (supplyBusinessName) {
    supplyBusinessName.textContent = name;
  }

  if (supplyBusinessMeta) {
    supplyBusinessMeta.textContent = metaParts.length
      ? metaParts.join(" • ")
      : "Supply & Products";
  }

  if (supplyBusinessIntro) {
    supplyBusinessIntro.textContent =
      profile.short_intro ||
      "Browse available products, seasonal items, and ordering details from this business.";
  }

  if (supplyBusinessLogo) {
    supplyBusinessLogo.innerHTML = "";

    if (profile.logo_url) {
      const logo = document.createElement("img");
      logo.src = profile.logo_url;
      logo.alt = `${name} logo`;
      supplyBusinessLogo.appendChild(logo);
    } else {
      const initials = document.createElement("span");
      initials.textContent = getInitials(name);
      supplyBusinessLogo.appendChild(initials);
    }
  }
}

function normalizeProduct(product = {}, index = 0) {
  return {
    id: product.id,
    name: product.name || "",
    category: product.category || "Other",
    description: product.description || "",
    image_url: product.image_url || "",
    price_display: product.price_display || "",
    price_unit: product.price_unit || "",
    unit_description: product.unit_description || "",
    minimum_order: product.minimum_order || "",
    availability_status: product.availability_status || "",
    season_notes: product.season_notes || "",
    fulfillment_notes: product.fulfillment_notes || "",
    featured: Boolean(product.featured),
    visibility: product.visibility || "draft",
    sort_order: Number.isFinite(Number(product.sort_order))
      ? Number(product.sort_order)
      : index,
    created_at: product.created_at || null
  };
}

function getUnitLabel(unit) {
  if (!unit) return "unit";
  if (unit === "custom") return "custom unit";
  return unit;
}

function getProductsInCustomOrder(list = products) {
  return [...list].sort((a, b) => {
    const orderA = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : 0;
    const orderB = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : 0;

    if (orderA !== orderB) return orderA - orderB;

    return new Date(a.created_at || 0) - new Date(b.created_at || 0);
  });
}

function refreshFilterOptions() {
  if (!productCategoryFilter || !productAvailabilityFilter) return;

  const selectedCategory = productCategoryFilter.value || "all";
  const selectedAvailability = productAvailabilityFilter.value || "all";

  const productCategories = [...new Set(products.map((product) => product.category).filter(Boolean))];
  const productAvailability = [...new Set(products.map((product) => product.availability_status).filter(Boolean))];

  productCategoryFilter.innerHTML = `<option value="all">All categories</option>`;
  productAvailabilityFilter.innerHTML = `<option value="all">All availability</option>`;

  [...new Set([...categories, ...productCategories])].forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    productCategoryFilter.appendChild(option);
  });

  [...new Set([...availabilityOptions, ...productAvailability])].forEach((availability) => {
    const option = document.createElement("option");
    option.value = availability;
    option.textContent = availability;
    productAvailabilityFilter.appendChild(option);
  });

  productCategoryFilter.value = [...productCategoryFilter.options].some((option) => option.value === selectedCategory)
    ? selectedCategory
    : "all";

  productAvailabilityFilter.value = [...productAvailabilityFilter.options].some((option) => option.value === selectedAvailability)
    ? selectedAvailability
    : "all";
}

function getVisibleProducts() {
  const searchValue = (productSearchInput?.value || "").trim().toLowerCase();
  const selectedCategory = productCategoryFilter?.value || "all";
  const selectedAvailability = productAvailabilityFilter?.value || "all";
  const sortMode = productSortSelect?.value || "custom";

  let visibleProducts = [...products];

  if (searchValue) {
    visibleProducts = visibleProducts.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.description,
        product.price_display,
        product.price_unit,
        product.unit_description,
        product.minimum_order,
        product.availability_status,
        product.season_notes,
        product.fulfillment_notes
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchValue);
    });
  }

  if (selectedCategory !== "all") {
    visibleProducts = visibleProducts.filter((product) => product.category === selectedCategory);
  }

  if (selectedAvailability !== "all") {
    visibleProducts = visibleProducts.filter((product) => product.availability_status === selectedAvailability);
  }

  if (sortMode === "featured") {
    visibleProducts.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
  } else if (sortMode === "name") {
    visibleProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortMode === "newest") {
    visibleProducts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  } else {
    visibleProducts = getProductsInCustomOrder(visibleProducts);
  }

  return visibleProducts;
}

function createMetaItem(label, value) {
  const item = document.createElement("div");
  item.className = "product-meta-item";

  const labelElement = document.createElement("span");
  labelElement.textContent = label;

  const valueElement = document.createElement("strong");
  valueElement.textContent = value || "Not set";

  item.appendChild(labelElement);
  item.appendChild(valueElement);

  return item;
}

function renderProductImage(product) {
  const frame = document.createElement("div");
  frame.className = "product-image-frame";

  const badgeRow = document.createElement("div");
  badgeRow.className = "product-badge-row";

  const availabilityBadge = document.createElement("span");
  availabilityBadge.className = "product-badge";
  availabilityBadge.textContent = product.availability_status || "Availability";
  badgeRow.appendChild(availabilityBadge);

  if (product.image_url) {
   const image = document.createElement("img");
   image.src = product.image_url;
   image.alt = `${product.name || "Product"} image`;
   image.loading = "eager";
   image.decoding = "async";
   image.fetchPriority = "high";
  } else {
    const placeholder = document.createElement("span");
    placeholder.textContent = product.category || "Product";
    frame.appendChild(placeholder);
  }

  frame.appendChild(badgeRow);

  return frame;
}

function createDetailBlock(label, value) {
  const block = document.createElement("div");
  block.className = "product-detail-block";

  const labelElement = document.createElement("span");
  labelElement.textContent = label;

  const text = document.createElement("p");
  text.textContent = value || "Not provided yet.";

  block.appendChild(labelElement);
  block.appendChild(text);

  return block;
}

function getExpandIconSvg(isExpanded) {
  if (isExpanded) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9.2 4.2v4.6H4.6V6.8h2.2L3.8 3.8 5.2 2.4l3 3V4.2h1Zm5.6 0h1v1.2l3-3 1.4 1.4-3 3h2.2v2h-4.6V4.2ZM4.6 15.2h4.6v4.6h-1v-1.2l-3 3-1.4-1.4 3-3H4.6v-2Zm10.2 0h4.6v2h-2.2l3 3-1.4 1.4-3-3v1.2h-1v-4.6Z" />
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.2 9.2h-1V3.2h6v1H5.9l4.4 4.4-1.4 1.4L4.2 5.3v3.9Zm15.6 0h-1V5.3l-4.7 4.7-1.4-1.4 4.4-4.4h-3.3v-1h6v6ZM9.2 20.8h-6v-6h1v3.3l4.7-4.7 1.4 1.4-4.4 4.4h3.3v1Zm11.6 0h-6v-1h3.3l-4.4-4.4 1.4-1.4 4.7 4.7v-3.3h1v6Z" />
    </svg>
  `;
}

function toggleProductExpansion(productId) {
  expandedProductId = expandedProductId === productId ? null : productId;
  renderProducts();

  const selectedCard = productGrid?.querySelector(`[data-product-id="${productId}"]`);

  if (selectedCard && expandedProductId === productId) {
    selectedCard.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }
}

function renderProductCard(product) {
  const isExpanded = expandedProductId === product.id;

  const card = document.createElement("article");
  card.className = `product-card${product.featured ? " is-featured-card" : ""}${isExpanded ? " expanded" : ""}`;
  card.dataset.productId = product.id;

   const expandButton = document.createElement("button");
   expandButton.type = "button";
   expandButton.className = "product-expand-toggle";
   expandButton.title = isExpanded ? "Minimize product details" : "Expand product details";
   expandButton.setAttribute(
     "aria-label",
     isExpanded ? "Minimize product details" : "Expand product details"
   );
   expandButton.innerHTML = getExpandIconSvg(isExpanded);
   expandButton.addEventListener("click", (event) => {
     event.stopPropagation();
     toggleProductExpansion(product.id);
   });

card.appendChild(expandButton);

  card.appendChild(renderProductImage(product));

  const body = document.createElement("div");
  body.className = "product-card-body";

  const heading = document.createElement("div");
  heading.className = "product-card-heading";

  const title = document.createElement("h3");
  title.textContent = product.name || "Unnamed product";

  const description = document.createElement("p");
  description.textContent = product.description || "Product details will appear here.";

  heading.appendChild(title);
  heading.appendChild(description);

  const metaGrid = document.createElement("div");
  metaGrid.className = "product-meta-grid";

  metaGrid.appendChild(
    createMetaItem(
      "Price",
      product.price_display
        ? `${product.price_display} / ${getUnitLabel(product.price_unit)}`
        : "Not set"
    )
  );

  metaGrid.appendChild(createMetaItem("Minimum", product.minimum_order || "Not set"));
  metaGrid.appendChild(createMetaItem("Availability", product.availability_status || "Not set"));
  metaGrid.appendChild(createMetaItem("Category", product.category || "Product"));

  body.appendChild(heading);
  body.appendChild(metaGrid);

  if (product.unit_description) {
    const unitClarity = document.createElement("div");
    unitClarity.className = "unit-clarity";
    unitClarity.textContent = product.unit_description;
    body.appendChild(unitClarity);
  }

  const expandedDetails = document.createElement("div");
  expandedDetails.className = "product-expanded-details";

  expandedDetails.appendChild(createDetailBlock("Timing", product.season_notes));
  expandedDetails.appendChild(createDetailBlock("Fulfillment", product.fulfillment_notes));

  const actions = document.createElement("div");
  actions.className = "product-public-actions";

  const requestLink = document.createElement("a");
  requestLink.href = "coming-soon.html";
  requestLink.className = "primary";
  requestLink.textContent = "Request quote";
  requestLink.addEventListener("click", (event) => event.stopPropagation());

  const messageLink = document.createElement("a");
  messageLink.href = "coming-soon.html";
  messageLink.textContent = "Message business";
  messageLink.addEventListener("click", (event) => event.stopPropagation());

  const saveLink = document.createElement("a");
  saveLink.href = "coming-soon.html";
  saveLink.textContent = "Save product";
  saveLink.addEventListener("click", (event) => event.stopPropagation());

  actions.appendChild(requestLink);
  actions.appendChild(messageLink);
  actions.appendChild(saveLink);

  expandedDetails.appendChild(actions);
  body.appendChild(expandedDetails);

  card.appendChild(body);

card.addEventListener("click", (event) => {
  if (event.target.closest("a, button")) return;

  toggleProductExpansion(product.id);
});

  return card;
}

function renderNoProductsCard(message = "No products are available yet.") {
  const card = document.createElement("div");
  card.className = "no-products-card";

  const title = document.createElement("strong");
  title.textContent = message;

  const description = document.createElement("span");
  description.textContent =
    "Products marked public in the Supply Builder will appear here for buyers to review.";

  card.appendChild(title);
  card.appendChild(description);

  return card;
}

function getCurrentProductColumnCount() {
  if (window.matchMedia("(max-width: 760px)").matches) return 1;
  if (window.matchMedia("(max-width: 980px)").matches) return 2;
  return 3;
}

function placeExpandedProductAtRowStart(list = []) {
  if (!expandedProductId) return list;

  const currentIndex = list.findIndex((product) => product.id === expandedProductId);

  if (currentIndex < 0) {
    expandedProductId = null;
    return list;
  }

  const columnCount = getCurrentProductColumnCount();
  const rowStartIndex = Math.floor(currentIndex / columnCount) * columnCount;

  if (currentIndex === rowStartIndex) {
    return list;
  }

  const reorderedProducts = [...list];
  const [expandedProduct] = reorderedProducts.splice(currentIndex, 1);

  reorderedProducts.splice(rowStartIndex, 0, expandedProduct);

  return reorderedProducts;
}

function renderProducts() {
  if (!productGrid) return;

  productGrid.innerHTML = "";

  if (!products.length) {
    productGrid.appendChild(renderNoProductsCard());
    return;
  }

  let visibleProducts = getVisibleProducts();

  if (!visibleProducts.length) {
    productGrid.appendChild(renderNoProductsCard("No products match this view."));
    return;
  }

visibleProducts = placeExpandedProductAtRowStart(visibleProducts);

  visibleProducts.forEach((product) => {
    productGrid.appendChild(renderProductCard(product));
  });
}

function resetProductView() {
  if (productSearchInput) productSearchInput.value = "";
  if (productCategoryFilter) productCategoryFilter.value = "all";
  if (productAvailabilityFilter) productAvailabilityFilter.value = "all";
  if (productSortSelect) productSortSelect.value = "custom";

  expandedProductId = null;
  renderProducts();
}

async function loadSupplyPage() {
  if (
    !window.LocalityProfileService ||
    !window.LocalityProductService
  ) {
    setSupplyStatus(
      "Unable to load services. Check script order."
    );

    return;
  }

  const params =
    new URLSearchParams(window.location.search);

  const publicProfileId = params.get("id");

  setSupplyStatus("Loading business profile...");

  const profileResult = publicProfileId
    ? await window.LocalityProfileService
        .getPublicBusinessProfileById(publicProfileId)
    : await window.LocalityProfileService
        .getMyPrimaryBusinessProfile();

  if (
    profileResult.error ||
    !profileResult.data
  ) {
    console.error(
      "Profile load error:",
      profileResult.error
    );

    setSupplyStatus(
      publicProfileId
        ? "This public business profile is unavailable."
        : "No business profile found. Please finish your business profile first."
    );

    return;
  }

  currentProfile = profileResult.data;
  renderBusinessHeader(currentProfile);

  setSupplyStatus("Loading products...");

  const productResult = publicProfileId
    ? await window.LocalityProductService
        .getPublicProductsForBusinessProfile(
          currentProfile.id
        )
    : await window.LocalityProductService
        .getProductsForBusinessProfile(
          currentProfile.id
        );

  if (productResult.error) {
    console.error(
      "Product load error:",
      productResult.error
    );

    setSupplyStatus("Unable to load products.");
    return;
  }

  products = (productResult.data || [])
    .map(normalizeProduct)
    .filter(
      (product) =>
        product.visibility === "public"
    );

  products =
    getProductsInCustomOrder(products);

  refreshFilterOptions();
  renderProducts();

  setSupplyStatus(
    products.length
      ? "Click a product card to view more details."
      : "No public products are available yet."
  );
}

window.addEventListener("resize", () => {
  if (expandedProductId) {
    renderProducts();
  }
});

productSearchInput?.addEventListener("input", renderProducts);
productCategoryFilter?.addEventListener("change", renderProducts);
productAvailabilityFilter?.addEventListener("change", renderProducts);
productSortSelect?.addEventListener("change", renderProducts);
resetProductViewBtn?.addEventListener("click", resetProductView);

loadSupplyPage();
