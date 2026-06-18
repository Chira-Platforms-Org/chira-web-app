/* =========================
   LOCALITY SUPPLY BUILDER
   Supabase-backed product builder.
========================= */

const productGrid = document.getElementById("productGrid");

const supplyStatusText = document.getElementById("supplyStatusText");
const supplyCompletionPercent = document.getElementById("supplyCompletionPercent");
const supplyCompletionBar = document.getElementById("supplyCompletionBar");
const supplyCompletionList = document.getElementById("supplyCompletionList");

const saveSupplyDraftBtn = document.getElementById("saveSupplyDraftBtn");
const finishSupplySetupBtn = document.getElementById("finishSupplySetupBtn");
const resetProductViewBtn = document.getElementById("resetProductViewBtn");

const supplyMiniBanner = document.getElementById("supplyMiniBanner");
const supplyBusinessLogo = document.getElementById("supplyBusinessLogo");
const supplyBusinessName = document.getElementById("supplyBusinessName");
const supplyBusinessMeta = document.getElementById("supplyBusinessMeta");
const supplyBusinessIntro = document.getElementById("supplyBusinessIntro");

const productSearchInput = document.getElementById("productSearchInput");
const productCategoryFilter = document.getElementById("productCategoryFilter");
const productAvailabilityFilter = document.getElementById("productAvailabilityFilter");
const productSortSelect = document.getElementById("productSortSelect");

const productEditorModal = document.getElementById("productEditorModal");
const productEditorMount = document.getElementById("productEditorMount");

const supplyModeSwitch = document.getElementById("supplyModeSwitch");
const supplyBackToProfileBtn = document.getElementById("supplyBackToProfileBtn");
const supplySetupCompleteModal = document.getElementById("supplySetupCompleteModal");

const supplyBuilderUrlParams = new URLSearchParams(window.location.search);
const isSupplySetupMode =
  supplyBuilderUrlParams.get("setup") === "1" ||
  supplyBuilderUrlParams.get("mode") === "setup";

function applySupplyBuilderMode() {
  document.body.classList.toggle("setup-mode", isSupplySetupMode);
  document.body.classList.toggle("editor-mode", !isSupplySetupMode);

  if (finishSupplySetupBtn) {
    finishSupplySetupBtn.textContent = isSupplySetupMode
      ? "Finish setup"
      : "Save changes";
  }

  if (saveSupplyDraftBtn) {
    saveSupplyDraftBtn.textContent = isSupplySetupMode
      ? "Save draft"
      : "Save";
  }

  if (supplyBackToProfileBtn) {
    supplyBackToProfileBtn.href = isSupplySetupMode
      ? "profile-builder.html?setup=1"
      : "profile-builder.html";
  }

  if (supplyModeSwitch) {
    supplyModeSwitch.href = "supply.html";
  }
}

function openSupplySetupCompleteModal() {
  if (!supplySetupCompleteModal) {
    window.location.href = "supplier.html";
    return;
  }

  supplySetupCompleteModal.classList.remove("hidden");
  supplySetupCompleteModal.setAttribute("aria-hidden", "false");
}

const ambiguousUnits = new Set([
  "case",
  "box",
  "crate",
  "bag",
  "flat",
  "pallet",
  "custom"
]);

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
let editingProductId = null;
let isCreatingProduct = false;
let isSaving = false;

let pendingProductImageFile = null;
let pendingProductImagePreviewUrl = null;

function setSupplyStatus(message) {
  if (supplyStatusText) {
    supplyStatusText.textContent = message;
  }
}

function getCleanValue(input) {
  return input?.value?.trim() || "";
}

function unitNeedsDescription(unit) {
  return ambiguousUnits.has(unit);
}

function getUnitLabel(unit) {
  if (!unit) return "unit";
  if (unit === "custom") return "custom unit";
  return unit;
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
      : "Supply & Products setup";
  }

  if (supplyBusinessIntro) {
    supplyBusinessIntro.textContent =
      "Add products, clarify units, and decide how buyers will understand your available supply.";
  }

  if (supplyMiniBanner && profile.banner_image_url) {
    supplyMiniBanner.style.backgroundImage =
      `linear-gradient(90deg, rgba(12, 33, 66, 0.56), rgba(12, 33, 66, 0.08)), url("${profile.banner_image_url}")`;
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
    business_profile_id: product.business_profile_id || currentProfile?.id || "",
    name: product.name || "",
    category: product.category || "Other",
    description: product.description || "",
    image_url: product.image_url || "",
    price_display: product.price_display || "",
    price_unit: product.price_unit || "lb",
    unit_description: product.unit_description || "",
    minimum_order: product.minimum_order || "",
    availability_status: product.availability_status || "Available now",
    season_notes: product.season_notes || "",
    fulfillment_notes: product.fulfillment_notes || "",
    featured: Boolean(product.featured),
    visibility: product.visibility || "draft",
    sort_order: Number.isFinite(Number(product.sort_order))
      ? Number(product.sort_order)
      : index,
    created_at: product.created_at || null,
    updated_at: product.updated_at || null
  };
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
  } else if (sortMode === "public") {
    visibleProducts.sort((a, b) => {
      const aPublic = a.visibility === "public" ? 1 : 0;
      const bPublic = b.visibility === "public" ? 1 : 0;

      return bPublic - aPublic || a.name.localeCompare(b.name);
    });
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

  const rightBadges = document.createElement("div");
  rightBadges.style.display = "flex";
  rightBadges.style.gap = "8px";
  rightBadges.style.flexWrap = "wrap";
  rightBadges.style.justifyContent = "flex-end";

  if (product.visibility === "draft") {
    const draftBadge = document.createElement("span");
    draftBadge.className = "product-badge draft";
    draftBadge.textContent = "Draft";
    rightBadges.appendChild(draftBadge);
  }

  if (product.visibility === "hidden") {
    const hiddenBadge = document.createElement("span");
    hiddenBadge.className = "product-badge hidden-product";
    hiddenBadge.textContent = "Hidden";
    rightBadges.appendChild(hiddenBadge);
  }

  if (product.featured) {
    const featuredBadge = document.createElement("span");
    featuredBadge.className = "product-badge featured";
    featuredBadge.textContent = "Featured";
    rightBadges.appendChild(featuredBadge);
  }

  badgeRow.appendChild(rightBadges);

  if (product.image_url) {
    const image = document.createElement("img");
    image.src = product.image_url;
    image.alt = `${product.name || "Product"} image`;
    frame.appendChild(image);
  } else {
    const placeholder = document.createElement("span");
    placeholder.textContent = product.category || "Product";
    frame.appendChild(placeholder);
  }

  frame.appendChild(badgeRow);

  return frame;
}

function getProductIconSvg(iconName) {
  const icons = {
    edit: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20h4.2L19.1 9.1c.6-.6.9-1.3.9-2.1s-.3-1.5-.9-2.1l-.1-.1c-.6-.6-1.3-.9-2.1-.9s-1.5.3-2.1.9L4 15.8V20Zm2-2v-1.4l7.8-7.8 1.4 1.4L7.4 18H6Zm10.6-9.2-1.4-1.4 1-1c.2-.2.4-.3.7-.3.3 0 .5.1.7.3l.1.1c.2.2.3.4.3.7 0 .3-.1.5-.3.7l-1.1.9Z" />
      </svg>
    `,
    star: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 2.7 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3L12 17.1l-5.6 3 1.1-6.3-4.6-4.5 6.3-.9L12 2.7Z" />
      </svg>
    `,
    arrowLeft: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10.8 19.3 3.5 12l7.3-7.3 1.4 1.4L7.3 11H21v2H7.3l4.9 4.9-1.4 1.4Z" />
      </svg>
    `,
    arrowRight: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m13.2 19.3-1.4-1.4 4.9-4.9H3v-2h13.7l-4.9-4.9 1.4-1.4 7.3 7.3-7.3 7.3Z" />
      </svg>
    `,
    trash: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 21c-.6 0-1.1-.2-1.4-.6C5.2 20.1 5 19.6 5 19V7H4V5h5V4c0-.6.2-1.1.6-1.4C9.9 2.2 10.4 2 11 2h2c.6 0 1.1.2 1.4.6.4.3.6.8.6 1.4v1h5v2h-1v12c0 .6-.2 1.1-.6 1.4-.3.4-.8.6-1.4.6H7ZM17 7H7v12h10V7Zm-6 10h2V9h-2v8Zm-3 0h2V9H8v8Zm6 0h2V9h-2v8Zm-3-12h2V4h-2v1Z" />
      </svg>
    `
  };

  return icons[iconName] || "";
}

function createProductIconButton(iconName, label, extraClass = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `product-icon-btn ${extraClass}`.trim();
  button.title = label;
  button.setAttribute("aria-label", label);
  button.innerHTML = getProductIconSvg(iconName);

  return button;
}


function renderProductCard(product) {
  const card = document.createElement("article");
  card.className = `product-card${product.featured ? " is-featured-card" : ""}`;
  card.dataset.productId = product.id;

  card.appendChild(renderProductImage(product));

  const body = document.createElement("div");
  body.className = "product-card-body";

  const heading = document.createElement("div");
  heading.className = "product-card-heading";

  const title = document.createElement("h3");
  title.textContent = product.name || "Unnamed product";

  const description = document.createElement("p");
  description.textContent = product.description || "Add a description to help buyers understand this product.";

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
  metaGrid.appendChild(createMetaItem("Visibility", product.visibility || "draft"));

  body.appendChild(heading);
  body.appendChild(metaGrid);

  if (product.unit_description) {
    const unitClarity = document.createElement("div");
    unitClarity.className = "unit-clarity";
    unitClarity.textContent = product.unit_description;
    body.appendChild(unitClarity);
  } else if (unitNeedsDescription(product.price_unit)) {
    const unitClarity = document.createElement("div");
    unitClarity.className = "unit-clarity warning";
    unitClarity.textContent = "Unit meaning needed — explain what this unit contains.";
    body.appendChild(unitClarity);
  }

  const actions = document.createElement("div");
  actions.className = "product-card-actions";

   const editButton = createProductIconButton("edit", "Edit product");
   editButton.addEventListener("click", () => startEditingProduct(product.id));
   
   const moveEarlierButton = createProductIconButton("arrowLeft", "Move earlier");
   moveEarlierButton.disabled = !canMoveProduct(product.id, -1);
   moveEarlierButton.addEventListener("click", () => moveProduct(product.id, -1));
   
   const moveLaterButton = createProductIconButton("arrowRight", "Move later");
   moveLaterButton.disabled = !canMoveProduct(product.id, 1);
   moveLaterButton.addEventListener("click", () => moveProduct(product.id, 1));
   
   const featureButton = createProductIconButton(
     "star",
     product.featured ? "Remove featured status" : "Feature on profile",
     product.featured ? "is-featured" : ""
   );
   featureButton.addEventListener("click", () => toggleFeatured(product.id));
   
   const deleteButton = createProductIconButton("trash", "Remove product", "danger");
   deleteButton.addEventListener("click", () => deleteProduct(product.id));
   
   actions.appendChild(editButton);
   actions.appendChild(moveEarlierButton);
   actions.appendChild(moveLaterButton);
   actions.appendChild(featureButton);
   actions.appendChild(deleteButton);

  body.appendChild(actions);
  card.appendChild(body);

  return card;
}

function renderAddProductCard() {
  if (isCreatingProduct) {
    return renderProductEditor(null);
  }

  const card = document.createElement("button");
  card.type = "button";
  card.className = "product-add-card";
  card.addEventListener("click", startCreatingProduct);

  const icon = document.createElement("div");
  icon.className = "product-add-icon";
  icon.textContent = "+";

  const title = document.createElement("strong");
  title.textContent = "Add product";

  const description = document.createElement("span");
  description.textContent =
    "Create a product card with pricing, unit size, availability, and fulfillment details.";

  card.appendChild(icon);
  card.appendChild(title);
  card.appendChild(description);

  return card;
}

function renderNoMatchingProductsCard() {
  const card = document.createElement("div");
  card.className = "no-products-card";

  const title = document.createElement("strong");
  title.textContent = "No products match this view";

  const description = document.createElement("span");
  description.textContent = "Try clearing your filters, changing your search, or adding a new product.";

  card.appendChild(title);
  card.appendChild(description);

  return card;
}

function createSelectOptions(values, selectedValue) {
  return values
    .map((value) => {
      const selected = value === selectedValue ? "selected" : "";
      return `<option value="${value}" ${selected}>${value}</option>`;
    })
    .join("");
}

function renderProductEditor(product) {
  const isEdit = Boolean(product?.id);
  const card = document.createElement("article");
  card.className = "product-editor-card";
  card.dataset.editorFor = isEdit ? product.id : "new";

  card.innerHTML = `
   <div class="product-editor-heading">
     <div>
       <h3>${isEdit ? "Edit product" : "Add a new product"}</h3>
       <p>${isEdit ? "Update how this product appears on your Supply & Products page." : "Fill out the details buyers need, then save this product to your supply catalog."}</p>
     </div>
   
     <button type="button" class="product-editor-close" data-action="close-editor" aria-label="Close">
       ×
     </button>
   </div>

    <form class="product-form">
      <section class="product-form-section">
        <h4>Product basics</h4>

        <div class="form-grid two-columns">
          <label class="form-field">
            Product name
            <input name="name" type="text" placeholder="Rainbow carrots" maxlength="120" required />
          </label>

          <label class="form-field">
            Category
            <select name="category">
              ${createSelectOptions(categories, product?.category || "Produce")}
            </select>
          </label>
        </div>

        <label class="form-field">
          Short description
          <textarea name="description" maxlength="700" placeholder="Briefly describe quality, variety, growing approach, best uses, or what makes this product worth noting."></textarea>
        </label>

         <div class="product-photo-upload-row">
           <button type="button" class="product-photo-upload-btn" data-action="upload-product-image">
             <img class="product-photo-preview hidden" alt="" />
             <span>Add product photo</span>
           </button>
         
           <input name="image_file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" />
           <input name="image_url" type="hidden" />
         
           <div class="product-photo-help">
             <strong>Product photo</strong>
             <p>A clear product, harvest, packaging, or display photo helps buyers understand what they are looking at.</p>
           </div>
         </div>
      </section>

      <section class="product-form-section">
        <h4>Pricing and units</h4>

        <div class="form-grid three-columns">
          <label class="form-field">
            Price display
            <input name="price_display" type="text" placeholder="$20" maxlength="40" />
          </label>

          <label class="form-field">
            Price unit
            <select name="price_unit">
              <option value="lb">per lb</option>
              <option value="oz">per oz</option>
              <option value="kg">per kg</option>
              <option value="gallon">per gallon</option>
              <option value="liter">per liter</option>
              <option value="each">per each</option>
              <option value="dozen">per dozen</option>
              <option value="bunch">per bunch</option>
              <option value="case">per case</option>
              <option value="box">per box</option>
              <option value="crate">per crate</option>
              <option value="bag">per bag</option>
              <option value="flat">per flat</option>
              <option value="pallet">per pallet</option>
              <option value="custom">custom unit</option>
            </select>
          </label>

          <label class="form-field">
            Minimum order
            <input name="minimum_order" type="text" placeholder="4 cases" maxlength="80" />
          </label>
        </div>

        <label class="form-field unit-description-field">
          Explain this unit
          <input name="unit_description" type="text" placeholder="Example: 1 case = 5 lbs, 1 box = 12 bunches, or 1 crate = approx. 20 lbs" maxlength="140" />
          <span class="field-note">Required for custom or ambiguous units like case, box, crate, bag, flat, pallet, or custom.</span>
        </label>
      </section>

      <section class="product-form-section">
        <h4>Availability and fulfillment</h4>

        <div class="form-grid two-columns">
          <label class="form-field">
            Availability status
            <select name="availability_status">
              ${createSelectOptions(availabilityOptions, product?.availability_status || "Available now")}
            </select>
          </label>

          <label class="form-field">
            Seasonal or timing notes
            <input name="season_notes" type="text" placeholder="March–June, weekly harvest, preorder for fall..." maxlength="140" />
          </label>
        </div>

        <label class="form-field">
          Fulfillment notes
          <textarea name="fulfillment_notes" maxlength="700" placeholder="Pickup, delivery route, lead time, packaging, cold storage, advance notice, or other buying details."></textarea>
        </label>
      </section>

      <section class="product-form-section">
        <h4>Visibility</h4>

        <div class="form-grid two-columns">
          <label class="toggle-field">
            <input name="featured" type="checkbox" />
            <span>
              <strong>Feature on profile</strong>
              <small>Featured products can later feed your profile preview and receive a buyer-facing badge.</small>
            </span>
          </label>

          <label class="form-field">
            Product visibility
            <select name="visibility">
              <option value="public">Public</option>
              <option value="draft">Draft</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
        </div>
      </section>

      <p class="editor-status">Products save directly to your Locality supply catalog.</p>

      <div class="editor-actions">
        ${isEdit ? `<button type="button" class="supply-danger-btn" data-action="delete">Remove product</button>` : ""}
        <button type="button" class="supply-secondary-btn" data-action="cancel">Cancel</button>
        <button type="submit" class="supply-primary-btn">${isEdit ? "Save changes" : "Save product"}</button>
      </div>
    </form>
  `;

  const form = card.querySelector("form");
  const status = card.querySelector(".editor-status");

  const fields = {
    name: form.elements.name,
    category: form.elements.category,
    description: form.elements.description,
    image_url: form.elements.image_url,
    image_file: form.elements.image_file,
    price_display: form.elements.price_display,
    price_unit: form.elements.price_unit,
    minimum_order: form.elements.minimum_order,
    unit_description: form.elements.unit_description,
    availability_status: form.elements.availability_status,
    season_notes: form.elements.season_notes,
    fulfillment_notes: form.elements.fulfillment_notes,
    featured: form.elements.featured,
    visibility: form.elements.visibility
  };

  fields.name.value = product?.name || "";
  fields.category.value = product?.category || "Produce";
  fields.description.value = product?.description || "";
  fields.image_url.value = product?.image_url || "";
      const photoUploadBtn = form.querySelector('[data-action="upload-product-image"]');
      const photoPreview = form.querySelector(".product-photo-preview");
      
      if (product?.image_url && photoPreview && photoUploadBtn) {
        photoPreview.src = product.image_url;
        photoPreview.classList.remove("hidden");
        photoUploadBtn.classList.add("has-image");
      }
      
      photoUploadBtn?.addEventListener("click", () => {
        fields.image_file.click();
      });
      
      fields.image_file?.addEventListener("change", () => {
        const file = fields.image_file.files?.[0];
      
        if (!file) return;
      
        pendingProductImageFile = file;
      
        if (pendingProductImagePreviewUrl) {
          URL.revokeObjectURL(pendingProductImagePreviewUrl);
        }
      
        pendingProductImagePreviewUrl = URL.createObjectURL(file);
      
        if (photoPreview && photoUploadBtn) {
          photoPreview.src = pendingProductImagePreviewUrl;
          photoPreview.classList.remove("hidden");
          photoUploadBtn.classList.add("has-image");
        }
      }); 
  fields.price_display.value = product?.price_display || "";
  fields.price_unit.value = product?.price_unit || "lb";
  fields.minimum_order.value = product?.minimum_order || "";
  fields.unit_description.value = product?.unit_description || "";
  fields.availability_status.value = product?.availability_status || "Available now";
  fields.season_notes.value = product?.season_notes || "";
  fields.fulfillment_notes.value = product?.fulfillment_notes || "";
  fields.featured.checked = Boolean(product?.featured);
  fields.visibility.value = product?.visibility || "draft";

  updateUnitRequirementForForm(form);

  fields.price_unit.addEventListener("change", () => {
    updateUnitRequirementForForm(form);
  });

  form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveProductFromForm(form, product, status);
});

card
  .querySelector('[data-action="close-editor"]')
  ?.addEventListener("click", cancelEditing);

form.querySelector('[data-action="cancel"]')?.addEventListener("click", cancelEditing);

form.querySelector('[data-action="delete"]')?.addEventListener("click", async () => {
  await deleteProduct(product.id);
});

  setTimeout(() => {
    fields.name.focus();
  }, 50);

  return card;
}

function updateUnitRequirementForForm(form) {
  const unitSelect = form.elements.price_unit;
  const unitDescriptionInput = form.elements.unit_description;
  const unitDescriptionField = unitDescriptionInput.closest(".unit-description-field");
  const isRequired = unitNeedsDescription(unitSelect.value);

  unitDescriptionField.classList.toggle("is-required", isRequired);
  unitDescriptionInput.required = isRequired;
}

function buildPayloadFromForm(form, existingProduct = null) {
  const fields = form.elements;
  const maxSortOrder = products.reduce((max, product) => Math.max(max, Number(product.sort_order) || 0), -1);

  return {
    business_profile_id: currentProfile.id,
    name: fields.name.value.trim(),
    category: fields.category.value,
    description: fields.description.value.trim(),
    image_url: fields.image_url.value.trim(),
    price_display: fields.price_display.value.trim(),
    price_unit: fields.price_unit.value,
    unit_description: fields.unit_description.value.trim(),
    minimum_order: fields.minimum_order.value.trim(),
    availability_status: fields.availability_status.value,
    season_notes: fields.season_notes.value.trim(),
    fulfillment_notes: fields.fulfillment_notes.value.trim(),
    featured: fields.featured.checked,
    visibility: fields.visibility.value,
    sort_order: existingProduct?.sort_order ?? maxSortOrder + 1
  };
}

function getProductErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.details) return error.details;
  return fallback;
}

async function saveProductFromForm(form, existingProduct, statusElement) {
  if (isSaving) return;

  const payload = buildPayloadFromForm(form, existingProduct);

  if (!payload.name) {
    statusElement.textContent = "Please add a product name before saving.";
    form.elements.name.focus();
    return;
  }

  if (unitNeedsDescription(payload.price_unit) && !payload.unit_description) {
    statusElement.textContent =
      "Please explain what this unit means so buyers understand exactly what they are ordering.";
    form.elements.unit_description.focus();
    return;
  }

  isSaving = true;
  statusElement.textContent = "Saving product...";

   if (pendingProductImageFile) {
  if (!window.LocalityProfileMediaService?.uploadBusinessProfileMedia) {
    statusElement.textContent = "Image upload service is unavailable. Please check script order.";
    isSaving = false;
    return;
  }

  statusElement.textContent = "Uploading product photo...";

  const uploadResult = await window.LocalityProfileMediaService.uploadBusinessProfileMedia({
    file: pendingProductImageFile,
    businessProfileId: currentProfile.id,
    mediaType: "products"
  });

  if (uploadResult.error) {
    console.error("Product image upload error:", uploadResult.error);
    statusElement.textContent = getProductErrorMessage(uploadResult.error, "Unable to upload product photo.");
    isSaving = false;
    return;
  }

  payload.image_url = uploadResult.data.url;
}

  let result;

  if (existingProduct?.id) {
    result = await window.LocalityProductService.updateProduct(existingProduct.id, payload);
  } else {
    result = await window.LocalityProductService.createProduct(payload);
  }

  isSaving = false;

if (result.error) {
  console.error("Product save error:", result.error);
  statusElement.textContent = getProductErrorMessage(result.error, "Unable to save this product. Please try again.");
  return;
}

  const savedProduct = normalizeProduct(result.data);

  if (existingProduct?.id) {
    products = products.map((product) =>
      product.id === savedProduct.id ? savedProduct : product
    );
  } else {
    products.push(savedProduct);
  }

  products = getProductsInCustomOrder(products).map((product, index) => ({
    ...product,
    sort_order: index
  }));

  await persistProductOrder();

   editingProductId = null;
   isCreatingProduct = false;
   
   closeProductEditorModal();
   refreshFilterOptions();
   renderProducts();
   updateSupplyReadiness();
   setSupplyStatus("Product saved.");
}

function openProductEditorModal(product = null) {
  if (!productEditorModal || !productEditorMount) return;

  pendingProductImageFile = null;

  if (pendingProductImagePreviewUrl) {
    URL.revokeObjectURL(pendingProductImagePreviewUrl);
    pendingProductImagePreviewUrl = null;
  }

  productEditorMount.innerHTML = "";
  productEditorMount.appendChild(renderProductEditor(product));

  productEditorModal.classList.remove("hidden");
  productEditorModal.setAttribute("aria-hidden", "false");
}

function closeProductEditorModal() {
  if (!productEditorModal || !productEditorMount) return;

  productEditorModal.classList.add("hidden");
  productEditorModal.setAttribute("aria-hidden", "true");
  productEditorMount.innerHTML = "";

  pendingProductImageFile = null;

  if (pendingProductImagePreviewUrl) {
    URL.revokeObjectURL(pendingProductImagePreviewUrl);
    pendingProductImagePreviewUrl = null;
  }
}

function startCreatingProduct() {
  editingProductId = null;
  isCreatingProduct = true;
  openProductEditorModal(null);
}

function startEditingProduct(productId) {
  const product = products.find((item) => item.id === productId);

  if (!product) return;

  editingProductId = productId;
  isCreatingProduct = false;
  openProductEditorModal(product);
}

function cancelEditing() {
  editingProductId = null;
  isCreatingProduct = false;
  closeProductEditorModal();
  renderProducts();
}

async function deleteProduct(productId) {
  const product = products.find((item) => item.id === productId);

  if (!product) return;

  const confirmed = confirm(`Remove "${product.name}" from your supply catalog?`);

  if (!confirmed) return;

  setSupplyStatus("Removing product...");

  const result = await window.LocalityProductService.deleteProduct(productId);

  if (result.error) {
    console.error("Product delete error:", result.error);
    setSupplyStatus("Unable to remove product. Please try again.");
    return;
  }

  products = products.filter((item) => item.id !== productId);
  products = getProductsInCustomOrder(products).map((item, index) => ({
    ...item,
    sort_order: index
  }));

  await persistProductOrder();

  editingProductId = null;
  isCreatingProduct = false;

  refreshFilterOptions();
  renderProducts();
  updateSupplyReadiness();
  setSupplyStatus("Product removed.");
}

function getProductIndex(productId) {
  const orderedProducts = getProductsInCustomOrder(products);
  return orderedProducts.findIndex((product) => product.id === productId);
}

function canMoveProduct(productId, direction) {
  if ((productSortSelect?.value || "custom") !== "custom") return false;

  const index = getProductIndex(productId);

  if (index < 0) return false;
  if (direction < 0) return index > 0;
  if (direction > 0) return index < products.length - 1;

  return false;
}

async function moveProduct(productId, direction) {
  if (!canMoveProduct(productId, direction)) return;

  const orderedProducts = getProductsInCustomOrder(products);
  const currentIndex = orderedProducts.findIndex((product) => product.id === productId);
  const newIndex = currentIndex + direction;

  const [movedProduct] = orderedProducts.splice(currentIndex, 1);
  orderedProducts.splice(newIndex, 0, movedProduct);

  products = orderedProducts.map((product, index) => ({
    ...product,
    sort_order: index
  }));

  renderProducts();
  setSupplyStatus("Saving product order...");

  const result = await persistProductOrder();

  if (result?.error) {
    setSupplyStatus("Unable to save product order. Please try again.");
    return;
  }

  setSupplyStatus("Product order saved.");
}

async function toggleFeatured(productId) {
  const product = products.find((item) => item.id === productId);

  if (!product) return;

  const updates = {
    ...product,
    featured: !product.featured
  };

  setSupplyStatus("Updating featured product...");

  const result = await window.LocalityProductService.updateProduct(productId, updates);

  if (result.error) {
    console.error("Feature toggle error:", result.error);
    setSupplyStatus("Unable to update featured status.");
    return;
  }

  products = products.map((item) =>
    item.id === productId ? normalizeProduct(result.data) : item
  );

  renderProducts();
  updateSupplyReadiness();
  setSupplyStatus(updates.featured ? "Product featured." : "Product unfeatured.");
}

async function persistProductOrder() {
  const orderedProducts = getProductsInCustomOrder(products).map((product, index) => ({
    ...product,
    sort_order: index
  }));

  products = orderedProducts;

  if (!window.LocalityProductService?.reorderProducts) {
    return { data: null, error: "Product service is unavailable." };
  }

  return await window.LocalityProductService.reorderProducts(orderedProducts);
}

function renderProducts() {
  if (!productGrid) return;

  productGrid.innerHTML = "";

  const visibleProducts = getVisibleProducts();

  if (!products.length) {
    productGrid.appendChild(renderAddProductCard());
    return;
  }

  if (!visibleProducts.length) {
    productGrid.appendChild(renderNoMatchingProductsCard());
    productGrid.appendChild(renderAddProductCard());
    return;
  }

visibleProducts.forEach((product) => {
  productGrid.appendChild(renderProductCard(product));
});

productGrid.appendChild(renderAddProductCard());
}

function setReadinessStatus(key, status) {
  const item = supplyCompletionList?.querySelector(`[data-supply-key="${key}"]`);

  if (item) {
    item.dataset.status = status;
  }
}

function updateSupplyReadiness() {
  const hasProducts = products.length > 0;
  const hasPricing = products.some((product) => product.price_display);
  const hasClearUnits = products.every((product) => {
    if (!unitNeedsDescription(product.price_unit)) return true;
    return Boolean(product.unit_description);
  });
  const hasAvailability = products.some((product) => product.availability_status);
  const hasFulfillment = products.some((product) => product.fulfillment_notes);
  const hasFeatured = products.some((product) => product.featured);

  const checks = {
    products: hasProducts,
    pricing: hasPricing,
    units: hasProducts && hasClearUnits,
    availability: hasAvailability,
    fulfillment: hasFulfillment,
    featured: hasFeatured
  };

  Object.entries(checks).forEach(([key, complete]) => {
    setReadinessStatus(key, complete ? "complete" : "missing");
  });

  const completedCount = Object.values(checks).filter(Boolean).length;
  const completionPercent = Math.round((completedCount / Object.keys(checks).length) * 100);

  if (supplyCompletionPercent) {
    supplyCompletionPercent.textContent = `${completionPercent}%`;
  }

  if (supplyCompletionBar) {
    supplyCompletionBar.style.width = `${completionPercent}%`;
  }

  return completionPercent;
}

async function saveSupplyDraft() {
  setSupplyStatus("Saving supply draft...");

  const result = await persistProductOrder();

  if (result?.error) {
    setSupplyStatus("Unable to save supply draft. Please try again.");
    return;
  }

  setSupplyStatus("Supply draft saved.");
}

async function finishSupplySetup() {
  await saveSupplyDraft();

  if (!isSupplySetupMode) {
    setSupplyStatus("Supply changes saved.");
    return;
  }

  if (!products.length) {
    const continueWithoutProducts = confirm(
      "You have not added any products yet. Finish setup anyway? You can come back later from your workspace."
    );

    if (!continueWithoutProducts) return;
  }

  if (currentProfile?.id && window.LocalityProfileService?.updateBusinessProfile) {
    const { error } = await window.LocalityProfileService.updateBusinessProfile(
      currentProfile.id,
      {
        supply_setup_completed: true,
        onboarding_completed: true,
        onboarding_step: "setup_completed",
        updated_at: new Date().toISOString()
      }
    );

    if (error) {
      console.error("Unable to mark setup complete:", error);
      setSupplyStatus("Products saved, but setup completion could not be marked. You can still continue.");
    }
  }

  openSupplySetupCompleteModal();
}

function resetProductView() {
  if (productSearchInput) productSearchInput.value = "";
  if (productCategoryFilter) productCategoryFilter.value = "all";
  if (productAvailabilityFilter) productAvailabilityFilter.value = "all";
  if (productSortSelect) productSortSelect.value = "custom";

  renderProducts();
}

async function loadSupplyBuilder() {
  if (!window.LocalityProfileService || !window.LocalityProductService) {
    setSupplyStatus("Missing profile or product services. Check script order.");
    return;
  }

  setSupplyStatus("Loading your business profile...");

  const profileResult = await window.LocalityProfileService.getMyPrimaryBusinessProfile();

  if (profileResult.error || !profileResult.data) {
    console.error("Profile load error:", profileResult.error);
    setSupplyStatus("No business profile found. Please finish your business profile first.");
    return;
  }

  currentProfile = profileResult.data;
  renderBusinessHeader(currentProfile);

  setSupplyStatus("Loading products...");

  const productResult = await window.LocalityProductService.getProductsForBusinessProfile(currentProfile.id);

  if (productResult.error) {
  console.error("Product load error:", productResult.error);

  products = [];
  refreshFilterOptions();
  renderProducts();
  updateSupplyReadiness();

  setSupplyStatus("Unable to load saved products. You can still view the builder, but saving may not work until the product table or policies are fixed.");
  return;
}
  products = (productResult.data || [])
    .map(normalizeProduct)
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
    .map((product, index) => ({
      ...product,
      sort_order: Number.isFinite(Number(product.sort_order)) ? Number(product.sort_order) : index
    }));

  refreshFilterOptions();
  renderProducts();
  updateSupplyReadiness();

  setSupplyStatus(products.length ? "Supply draft loaded." : "Add your first product to begin.");
}

productEditorModal?.addEventListener("click", (event) => {
  if (event.target === productEditorModal) {
    cancelEditing();
  }
});

productSearchInput?.addEventListener("input", renderProducts);
productCategoryFilter?.addEventListener("change", renderProducts);
productAvailabilityFilter?.addEventListener("change", renderProducts);
productSortSelect?.addEventListener("change", renderProducts);

resetProductViewBtn?.addEventListener("click", resetProductView);
saveSupplyDraftBtn?.addEventListener("click", saveSupplyDraft);
finishSupplySetupBtn?.addEventListener("click", finishSupplySetup);

applySupplyBuilderMode();
loadSupplyBuilder();
