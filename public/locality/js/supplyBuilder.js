/* =========================
   LOCALITY SUPPLY BUILDER
   Front-end prototype state only
========================= */

const productGrid = document.getElementById("productGrid");
const emptyProductState = document.getElementById("emptyProductState");

const openAddProductBtn = document.getElementById("openAddProductBtn");
const openAddProductBtnSecondary = document.getElementById("openAddProductBtnSecondary");
const emptyAddProductBtn = document.getElementById("emptyAddProductBtn");
const collapseAllProductsBtn = document.getElementById("collapseAllProductsBtn");

const saveSupplyDraftBtn = document.getElementById("saveSupplyDraftBtn");
const finishSupplySetupBtn = document.getElementById("finishSupplySetupBtn");
const supplyStatusText = document.getElementById("supplyStatusText");

const supplyCompletionPercent = document.getElementById("supplyCompletionPercent");
const supplyCompletionBar = document.getElementById("supplyCompletionBar");
const supplyCompletionList = document.getElementById("supplyCompletionList");

const productModal = document.getElementById("productModal");
const closeProductModalBtn = document.getElementById("closeProductModalBtn");
const cancelProductBtn = document.getElementById("cancelProductBtn");
const deleteProductBtn = document.getElementById("deleteProductBtn");
const productForm = document.getElementById("productForm");
const productModalTitle = document.getElementById("productModalTitle");
const productModalStatus = document.getElementById("productModalStatus");

const productNameInput = document.getElementById("productNameInput");
const productCategoryInput = document.getElementById("productCategoryInput");
const productDescriptionInput = document.getElementById("productDescriptionInput");
const productImageInput = document.getElementById("productImageInput");

const productPriceInput = document.getElementById("productPriceInput");
const productUnitInput = document.getElementById("productUnitInput");
const productMinimumInput = document.getElementById("productMinimumInput");
const unitDescriptionField = document.getElementById("unitDescriptionField");
const productUnitDescriptionInput = document.getElementById("productUnitDescriptionInput");

const productAvailabilityInput = document.getElementById("productAvailabilityInput");
const productSeasonInput = document.getElementById("productSeasonInput");
const productFulfillmentInput = document.getElementById("productFulfillmentInput");

const productFeaturedInput = document.getElementById("productFeaturedInput");
const productVisibilityInput = document.getElementById("productVisibilityInput");

const ambiguousUnits = new Set([
  "case",
  "box",
  "crate",
  "bag",
  "flat",
  "pallet",
  "custom"
]);

let products = [
  {
    id: "sample-rainbow-carrots",
    name: "Rainbow carrots",
    category: "Produce",
    description:
      "Colorful carrots grown for restaurants, markets, and buyers looking for a visually distinct seasonal item.",
    image_url: "",
    price_display: "$20",
    price_unit: "case",
    unit_description: "1 case = approx. 5 lbs",
    minimum_order: "4 cases",
    availability_status: "Available now",
    season_notes: "Weekly harvest during spring and early summer.",
    fulfillment_notes:
      "Pickup available with 48 hours notice. Local delivery may be available for recurring orders.",
    featured: true,
    visibility: "public"
  },
  {
    id: "sample-mixed-greens",
    name: "Mixed greens",
    category: "Produce",
    description:
      "Fresh mixed greens suited for cafés, restaurants, market boxes, and small grocery displays.",
    image_url: "",
    price_display: "$8",
    price_unit: "lb",
    unit_description: "",
    minimum_order: "10 lbs",
    availability_status: "Limited availability",
    season_notes: "Best availability early spring and fall.",
    fulfillment_notes:
      "Packed cold. Please plan pickup or delivery quickly after harvest.",
    featured: false,
    visibility: "public"
  },
  {
    id: "sample-basil",
    name: "Fresh basil",
    category: "Herbs",
    description:
      "Aromatic basil for kitchens, specialty grocery, prepared foods, and seasonal menu use.",
    image_url: "",
    price_display: "Quote required",
    price_unit: "bunch",
    unit_description: "1 bunch = approx. 3 oz",
    minimum_order: "12 bunches",
    availability_status: "Seasonal",
    season_notes: "Summer availability, weather dependent.",
    fulfillment_notes:
      "Best ordered close to use date. Can be bundled with other herb orders.",
    featured: false,
    visibility: "draft"
  }
];

let expandedProductId = products[0]?.id || null;
let editingProductId = null;

function setSupplyStatus(message) {
  if (supplyStatusText) {
    supplyStatusText.textContent = message;
  }
}

function getCleanValue(input) {
  return input?.value?.trim() || "";
}

function getSelectedProductUnitLabel(unit) {
  if (!unit) return "unit";
  if (unit === "custom") return "custom unit";
  return unit;
}

function unitNeedsDescription(unit) {
  return ambiguousUnits.has(unit);
}

function updateUnitDescriptionRequirement() {
  const unit = productUnitInput?.value || "";
  const isRequired = unitNeedsDescription(unit);

  unitDescriptionField?.classList.toggle("is-required", isRequired);

  if (productUnitDescriptionInput) {
    productUnitDescriptionInput.required = isRequired;
  }
}

function buildProductPayload() {
  return {
    id: editingProductId || `product-${Date.now()}`,
    name: getCleanValue(productNameInput),
    category: productCategoryInput?.value || "Other",
    description: getCleanValue(productDescriptionInput),
    image_url: getCleanValue(productImageInput),
    price_display: getCleanValue(productPriceInput),
    price_unit: productUnitInput?.value || "lb",
    unit_description: getCleanValue(productUnitDescriptionInput),
    minimum_order: getCleanValue(productMinimumInput),
    availability_status: productAvailabilityInput?.value || "Available now",
    season_notes: getCleanValue(productSeasonInput),
    fulfillment_notes: getCleanValue(productFulfillmentInput),
    featured: Boolean(productFeaturedInput?.checked),
    visibility: productVisibilityInput?.value || "public",
    updated_at: new Date().toISOString()
  };
}

function resetProductForm() {
  editingProductId = null;

  if (productModalTitle) productModalTitle.textContent = "Add product";
  if (productModalStatus) productModalStatus.textContent = "Products are saved locally in this first version.";
  if (deleteProductBtn) deleteProductBtn.classList.add("hidden");

  productForm?.reset();

  if (productCategoryInput) productCategoryInput.value = "Produce";
  if (productUnitInput) productUnitInput.value = "lb";
  if (productAvailabilityInput) productAvailabilityInput.value = "Available now";
  if (productVisibilityInput) productVisibilityInput.value = "public";

  updateUnitDescriptionRequirement();
}

function openProductModal(productId = null) {
  resetProductForm();

  const product = products.find((item) => item.id === productId);

  if (product) {
    editingProductId = product.id;

    if (productModalTitle) productModalTitle.textContent = "Edit product";
    if (deleteProductBtn) deleteProductBtn.classList.remove("hidden");

    if (productNameInput) productNameInput.value = product.name || "";
    if (productCategoryInput) productCategoryInput.value = product.category || "Other";
    if (productDescriptionInput) productDescriptionInput.value = product.description || "";
    if (productImageInput) productImageInput.value = product.image_url || "";

    if (productPriceInput) productPriceInput.value = product.price_display || "";
    if (productUnitInput) productUnitInput.value = product.price_unit || "lb";
    if (productMinimumInput) productMinimumInput.value = product.minimum_order || "";
    if (productUnitDescriptionInput) productUnitDescriptionInput.value = product.unit_description || "";

    if (productAvailabilityInput) productAvailabilityInput.value = product.availability_status || "Available now";
    if (productSeasonInput) productSeasonInput.value = product.season_notes || "";
    if (productFulfillmentInput) productFulfillmentInput.value = product.fulfillment_notes || "";

    if (productFeaturedInput) productFeaturedInput.checked = Boolean(product.featured);
    if (productVisibilityInput) productVisibilityInput.value = product.visibility || "public";

    updateUnitDescriptionRequirement();
  }

  productModal?.classList.remove("hidden");
  productModal?.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    productNameInput?.focus();
  }, 50);
}

function closeProductModal() {
  productModal?.classList.add("hidden");
  productModal?.setAttribute("aria-hidden", "true");
}

function saveProduct(event) {
  event.preventDefault();

  const payload = buildProductPayload();

  if (!payload.name) {
    if (productModalStatus) {
      productModalStatus.textContent = "Please add a product name before saving.";
    }
    return;
  }

  if (unitNeedsDescription(payload.price_unit) && !payload.unit_description) {
    if (productModalStatus) {
      productModalStatus.textContent =
        "Please explain what this unit means so buyers understand exactly what they are ordering.";
    }

    productUnitDescriptionInput?.focus();
    return;
  }

  if (editingProductId) {
    products = products.map((product) =>
      product.id === editingProductId
        ? { ...product, ...payload }
        : product
    );
  } else {
    products.push({
      ...payload,
      created_at: new Date().toISOString()
    });

    expandedProductId = payload.id;
  }

  sortProducts();
  renderProducts();
  updateSupplyReadiness();
  closeProductModal();
  setSupplyStatus("Product saved locally. Supabase saving comes next.");
}

function deleteCurrentProduct() {
  if (!editingProductId) return;

  const shouldDelete = confirm("Remove this product from your supply page?");

  if (!shouldDelete) return;

  products = products.filter((product) => product.id !== editingProductId);

  if (expandedProductId === editingProductId) {
    expandedProductId = products[0]?.id || null;
  }

  renderProducts();
  updateSupplyReadiness();
  closeProductModal();
  setSupplyStatus("Product removed.");
}

function toggleFeatured(productId) {
  products = products.map((product) =>
    product.id === productId
      ? { ...product, featured: !product.featured }
      : product
  );

  sortProducts();
  renderProducts();
  updateSupplyReadiness();
}

function sortProducts() {
  products.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.name.localeCompare(b.name);
  });
}

function getAvailabilityClass(status = "") {
  return status
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function renderProductImage(product) {
  const frame = document.createElement("div");
  frame.className = "product-image-frame";

  const badgeRow = document.createElement("div");
  badgeRow.className = "product-badge-row";

  const availabilityBadge = document.createElement("span");
  availabilityBadge.className = `product-badge availability-${getAvailabilityClass(product.availability_status)}`;
  availabilityBadge.textContent = product.availability_status || "Availability";

  badgeRow.appendChild(availabilityBadge);

  if (product.featured) {
    const featuredBadge = document.createElement("span");
    featuredBadge.className = "product-badge featured";
    featuredBadge.textContent = "Featured";
    badgeRow.appendChild(featuredBadge);
  }

  if (product.image_url) {
    const image = document.createElement("img");
    image.src = product.image_url;
    image.alt = product.name ? `${product.name} product image` : "Product image";
    frame.appendChild(image);
  } else {
    const placeholder = document.createElement("span");
    placeholder.textContent = product.category || "Product";
    frame.appendChild(placeholder);
  }

  frame.appendChild(badgeRow);

  return frame;
}

function renderProductCard(product) {
  const isExpanded = product.id === expandedProductId;

  const card = document.createElement("article");
  card.className = `product-card${isExpanded ? " expanded" : ""}`;
  card.dataset.productId = product.id;

  card.appendChild(renderProductImage(product));

  const body = document.createElement("div");
  body.className = "product-card-body";

  const heading = document.createElement("div");
  heading.className = "product-card-heading";

  const title = document.createElement("h3");
  title.textContent = product.name || "Unnamed product";

  const description = document.createElement("p");
  description.textContent =
    product.description || "Add a short product description to help buyers understand this item.";

  heading.appendChild(title);
  heading.appendChild(description);

  const metaGrid = document.createElement("div");
  metaGrid.className = "product-meta-grid";

  const priceMeta = createMetaItem(
    "Price",
    product.price_display
      ? `${product.price_display} / ${getSelectedProductUnitLabel(product.price_unit)}`
      : "Price not set"
  );

  const minMeta = createMetaItem("Minimum", product.minimum_order || "Minimum not set");
  const availabilityMeta = createMetaItem("Availability", product.availability_status || "Not set");
  const visibilityMeta = createMetaItem("Visibility", product.visibility || "Draft");

  metaGrid.appendChild(priceMeta);
  metaGrid.appendChild(minMeta);
  metaGrid.appendChild(availabilityMeta);
  metaGrid.appendChild(visibilityMeta);

  body.appendChild(heading);
  body.appendChild(metaGrid);

  if (product.unit_description) {
    const unitClarity = document.createElement("div");
    unitClarity.className = "unit-clarity";
    unitClarity.textContent = product.unit_description;
    body.appendChild(unitClarity);
  } else if (unitNeedsDescription(product.price_unit)) {
    const unitClarity = document.createElement("div");
    unitClarity.className = "unit-clarity";
    unitClarity.textContent = "Unit meaning needed — explain what this unit contains.";
    body.appendChild(unitClarity);
  }

  const expandedDetails = document.createElement("div");
  expandedDetails.className = "product-expanded-details";

  expandedDetails.appendChild(
    createDetailBlock("Timing", product.season_notes || "No timing notes added yet.")
  );

  expandedDetails.appendChild(
    createDetailBlock("Fulfillment", product.fulfillment_notes || "No pickup, delivery, or fulfillment notes added yet.")
  );

  const actions = document.createElement("div");
  actions.className = "product-card-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.textContent = "Edit product";
  editBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    openProductModal(product.id);
  });

  const featureBtn = document.createElement("button");
  featureBtn.type = "button";
  featureBtn.className = `feature-toggle${product.featured ? " is-featured" : ""}`;
  featureBtn.textContent = product.featured ? "Featured" : "Feature on profile";
  featureBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleFeatured(product.id);
  });

  const quoteLink = document.createElement("a");
  quoteLink.href = "coming-soon.html";
  quoteLink.textContent = "Request flow preview";
  quoteLink.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  actions.appendChild(editBtn);
  actions.appendChild(featureBtn);
  actions.appendChild(quoteLink);

  expandedDetails.appendChild(actions);

  body.appendChild(expandedDetails);
  card.appendChild(body);

  card.addEventListener("click", () => {
    expandedProductId = isExpanded ? null : product.id;
    renderProducts();
  });

  return card;
}

function createMetaItem(label, value) {
  const item = document.createElement("div");
  item.className = "product-meta-item";

  const labelElement = document.createElement("span");
  labelElement.textContent = label;

  const valueElement = document.createElement("strong");
  valueElement.textContent = value;

  item.appendChild(labelElement);
  item.appendChild(valueElement);

  return item;
}

function createDetailBlock(label, value) {
  const block = document.createElement("div");
  block.className = "product-detail-block";

  const labelElement = document.createElement("span");
  labelElement.textContent = label;

  const text = document.createElement("p");
  text.textContent = value;

  block.appendChild(labelElement);
  block.appendChild(text);

  return block;
}

function renderProducts() {
  if (!productGrid || !emptyProductState) return;

  productGrid.innerHTML = "";

  if (!products.length) {
    productGrid.classList.add("hidden");
    emptyProductState.classList.remove("hidden");
    return;
  }

  productGrid.classList.remove("hidden");
  emptyProductState.classList.add("hidden");

  products.forEach((product) => {
    productGrid.appendChild(renderProductCard(product));
  });
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

function saveSupplyDraft() {
  console.log("Supply draft payload:", products);
  setSupplyStatus("Supply draft saved locally for this prototype.");
}

function finishSupplySetup() {
  saveSupplyDraft();
  alert("Supply setup is saved locally for now. Supabase product saving comes next.");
}

openAddProductBtn?.addEventListener("click", () => openProductModal());
openAddProductBtnSecondary?.addEventListener("click", () => openProductModal());
emptyAddProductBtn?.addEventListener("click", () => openProductModal());

collapseAllProductsBtn?.addEventListener("click", () => {
  expandedProductId = null;
  renderProducts();
});

closeProductModalBtn?.addEventListener("click", closeProductModal);
cancelProductBtn?.addEventListener("click", closeProductModal);

productModal?.addEventListener("click", (event) => {
  if (event.target === productModal) {
    closeProductModal();
  }
});

productForm?.addEventListener("submit", saveProduct);
deleteProductBtn?.addEventListener("click", deleteCurrentProduct);

productUnitInput?.addEventListener("change", updateUnitDescriptionRequirement);

saveSupplyDraftBtn?.addEventListener("click", saveSupplyDraft);
finishSupplySetupBtn?.addEventListener("click", finishSupplySetup);

sortProducts();
renderProducts();
updateSupplyReadiness();
updateUnitDescriptionRequirement();
