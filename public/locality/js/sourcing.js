/* =========================
   LOCALITY SOURCING PAGE
========================= */

const sourcingTabs =
  document.querySelectorAll("[data-sourcing-tab]");

const sourcingWorkspace =
  document.querySelector(".sourcing-workspace");

const savedPanel =
  document.getElementById("savedPanel");

const basketPanel =
  document.getElementById("basketPanel");

const agreementsPanel =
  document.getElementById("agreementsPanel");

const sourcingSearchInput =
  document.getElementById("sourcingSearchInput");

const sourcingCategoryFilter =
  document.getElementById("sourcingCategoryFilter");

const sourcingRefreshBtn =
  document.getElementById("sourcingRefreshBtn");

const savedNetworkList =
  document.getElementById("savedNetworkList");

const basketList =
  document.getElementById("basketList");

const clearBasketBtn =
  document.getElementById("clearBasketBtn");

const basketPreviewRail =
  document.getElementById("basketPreviewRail");

const sourcingProductModal =
  document.getElementById("sourcingProductModal");

const sourcingModalContent =
  document.getElementById("sourcingModalContent");

let activeTab = "saved";

let savedData = {
  savedBusinesses: [],
  savedProducts: [],
  businesses: [],
  products: []
};

let basketData = {
  basketItems: [],
  businesses: [],
  products: []
};

function escapeHtml(value = "") {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getInitials(name = "") {
  return (
    String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "LC"
  );
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

function formatCategory(value = "") {
  return String(value || "Other")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getLocation(profile = {}) {
  if (profile?.location_label) return profile.location_label;

  if (profile?.address && typeof profile.address === "object") {
    const city = profile.address.city || "";
    const state = profile.address.state || "";

    if (city && state) return `${city}, ${state}`;
  }

  return "Local service area";
}

function getBusinessById(id, data = savedData) {
  return data.businesses.find(
    (business) => business.id === id
  );
}

function getProductById(id, data = savedData) {
  return data.products.find(
    (product) => product.id === id
  );
}

function getProductPrice(product = {}) {
  if (product.price_display && product.price_unit) {
    return `${product.price_display} / ${product.price_unit}`;
  }

  return (
    product.price_display ||
    product.price_unit ||
    product.unit_description ||
    "Request quote"
  );
}

function parseMoney(value = "") {
  const match = String(value || "").match(/[\d.]+/);

  if (!match) return null;

  const number = Number(match[0]);

  return Number.isFinite(number) ? number : null;
}

function formatMoney(value) {
  if (!Number.isFinite(value)) return "Request pricing";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function businessLogoHtml(profile = {}, className = "") {
  const name = profile?.name || "Locality business";

  if (profile?.logo_url) {
    return `
      <div class="${className}">
        <img src="${escapeHtml(profile.logo_url)}" alt="${escapeHtml(name)} logo" />
      </div>
    `;
  }

  return `
    <div class="${className}">
      <span>${escapeHtml(getInitials(name))}</span>
    </div>
  `;
}

function getCurrentSearch() {
  return String(sourcingSearchInput?.value || "")
    .trim()
    .toLowerCase();
}

function getCurrentCategory() {
  return sourcingCategoryFilter?.value || "all";
}

function getSavedProductRowsForBusiness(businessId) {
  return savedData.savedProducts
    .map((savedProduct) => {
      const product =
        getProductById(savedProduct.product_id);

      return {
        savedProduct,
        product
      };
    })
    .filter(({ product, savedProduct }) => {
      const productBusinessId =
        product?.business_profile_id ||
        savedProduct.business_profile_id;

      return productBusinessId === businessId;
    });
}

function getSavedBusinessIds() {
  return [
    ...new Set([
      ...savedData.savedBusinesses.map(
        (row) => row.business_profile_id
      ),
      ...savedData.savedProducts.map(
        (row) => row.business_profile_id
      ),
      ...savedData.products.map(
        (product) => product.business_profile_id
      )
    ].filter(Boolean))
  ];
}

function getFilteredSavedBusinessGroups() {
  const search = getCurrentSearch();
  const category = getCurrentCategory();

  return getSavedBusinessIds()
    .map((businessId) => {
      const business =
        getBusinessById(businessId);

      const productRows =
        getSavedProductRowsForBusiness(businessId);

      return {
        business,
        businessId,
        productRows
      };
    })
    .filter(({ business, productRows }) => {
      if (!business && !productRows.length) return false;

      const categoryMatches =
        category === "all" ||
        productRows.some(
          ({ product }) =>
            product?.category === category
        ) ||
        getPrimaryCategory(business) === category;

      if (!categoryMatches) return false;

      if (!search) return true;

      const businessText = [
        business?.name,
        business?.location_label,
        getPrimaryCategory(business)
      ]
        .join(" ")
        .toLowerCase();

      const productText = productRows
        .map(({ product }) =>
          [
            product?.name,
            product?.category,
            product?.description,
            product?.availability_status
          ].join(" ")
        )
        .join(" ")
        .toLowerCase();

      return (
        businessText.includes(search) ||
        productText.includes(search)
      );
    });
}

function refreshCategoryFilter() {
  if (!sourcingCategoryFilter) return;

  const current = sourcingCategoryFilter.value || "all";

  const categories = [
    ...new Set([
      ...savedData.products.map(
        (product) => product.category
      ),
      ...basketData.products.map(
        (product) => product.category
      ),
      ...savedData.businesses.map(getPrimaryCategory),
      ...basketData.businesses.map(getPrimaryCategory)
    ].filter(Boolean))
  ].sort((a, b) => a.localeCompare(b));

  sourcingCategoryFilter.innerHTML =
    `<option value="all">All categories</option>`;

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = formatCategory(category);
    sourcingCategoryFilter.appendChild(option);
  });

  sourcingCategoryFilter.value =
    [...sourcingCategoryFilter.options].some(
      (option) => option.value === current
    )
      ? current
      : "all";
}

function setActiveTab(tabName, updateUrl = true) {
  activeTab = ["saved", "basket", "agreements"].includes(tabName)
    ? tabName
    : "saved";

  sourcingTabs.forEach((tab) => {
    const isActive =
      tab.dataset.sourcingTab === activeTab;

    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  if (savedPanel) {
    savedPanel.hidden = activeTab !== "saved";
  }

  if (basketPanel) {
    basketPanel.hidden = activeTab !== "basket";
  }

  if (agreementsPanel) {
    agreementsPanel.hidden = activeTab !== "agreements";
  }

  sourcingWorkspace?.classList.toggle(
    "is-basket-active",
    activeTab === "basket"
  );

  renderBasketPreviewRail();

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", activeTab);
    window.history.replaceState({}, "", url);
  }
}

function renderSavedNetwork() {
  if (!savedNetworkList) return;

  const groups = getFilteredSavedBusinessGroups();

  if (!groups.length) {
    savedNetworkList.innerHTML = `
      <div class="sourcing-empty-card">
        No saved businesses or products match this view yet. Save a business or product from the marketplace to start building your local sourcing network.
      </div>
    `;

    return;
  }

  savedNetworkList.innerHTML = groups
    .map(({ business, businessId, productRows }) => {
      const name =
        business?.name || "Saved business";

      const rowsHtml =
        productRows.length
          ? productRows
              .filter(({ product }) => Boolean(product))
              .map(({ product }) => {
                return `
                  <div class="saved-product-row" data-product-id="${escapeHtml(product.id)}">
                    <div class="saved-product-main">
                      <strong>${escapeHtml(product.name || "Saved product")}</strong>
                      <span>${escapeHtml(product.description || product.availability_status || "Saved product")}</span>
                    </div>

                    <span class="saved-product-meta">
                      ${escapeHtml(formatCategory(product.category))}
                    </span>

                    <span class="saved-product-meta">
                      ${escapeHtml(getProductPrice(product))}
                    </span>

                    <input
                      class="saved-product-qty"
                      type="number"
                      min="1"
                      value="1"
                      aria-label="Quantity for ${escapeHtml(product.name || "product")}"
                    />

                    <div class="saved-product-actions">
                      <button
                        type="button"
                        class="primary"
                        data-add-saved-product-to-basket="${escapeHtml(product.id)}"
                        data-business-id="${escapeHtml(product.business_profile_id || businessId)}"
                      >
                        Add
                      </button>

                      <button
                        type="button"
                        data-view-product="${escapeHtml(product.id)}"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        class="danger"
                        data-unsave-product="${escapeHtml(product.id)}"
                      >
                        Unsave
                      </button>
                    </div>
                  </div>
                `;
              })
              .join("")
          : `
            <div class="sourcing-empty-card">
              This business is saved, but no products are saved under it yet.
            </div>
          `;

      return `
        <article class="saved-business-panel" data-business-id="${escapeHtml(businessId)}">
          <header class="saved-business-header">
            ${businessLogoHtml(
              business || { name },
              "saved-business-logo"
            )}

            <div class="saved-business-copy">
              <h3>${escapeHtml(name)}</h3>
              <p>
                ${escapeHtml(getLocation(business))}
                ·
                ${escapeHtml(formatCategory(getPrimaryCategory(business)))}
                ·
                ${productRows.length} saved ${productRows.length === 1 ? "product" : "products"}
              </p>
            </div>

            <div class="saved-business-actions">
              <a href="public-profile.html?id=${encodeURIComponent(businessId)}">
                View profile
              </a>

              <a class="primary" href="supply.html?id=${encodeURIComponent(businessId)}">
                Browse products
              </a>

              <button
                type="button"
                class="danger"
                data-unsave-business="${escapeHtml(businessId)}"
              >
                Unsave
              </button>
            </div>
          </header>

          <div class="saved-product-list">
            ${rowsHtml}
          </div>
        </article>
      `;
    })
    .join("");
}

function getBasketGroups() {
  const search = getCurrentSearch();
  const category = getCurrentCategory();

  const groupsMap = new Map();

  basketData.basketItems.forEach((item) => {
    const product =
      getProductById(item.product_id, basketData);

    if (!product) return;

    const businessId =
      item.business_profile_id ||
      product.business_profile_id;

    if (!groupsMap.has(businessId)) {
      groupsMap.set(businessId, {
        businessId,
        business: getBusinessById(businessId, basketData),
        items: []
      });
    }

    groupsMap.get(businessId).items.push({
      item,
      product
    });
  });

  return [...groupsMap.values()]
    .map((group) => {
      const filteredItems = group.items.filter(
        ({ product }) => {
          const categoryMatches =
            category === "all" ||
            product.category === category;

          if (!categoryMatches) return false;

          if (!search) return true;

          const text = [
            product.name,
            product.category,
            product.description,
            group.business?.name,
            group.business?.location_label
          ]
            .join(" ")
            .toLowerCase();

          return text.includes(search);
        }
      );

      return {
        ...group,
        items: filteredItems
      };
    })
    .filter((group) => group.items.length);
}

function getBasketGroupSubtotal(group) {
  let hasAnyPrice = false;

  const total = group.items.reduce(
    (sum, { item, product }) => {
      const price = parseMoney(product.price_display);

      if (!Number.isFinite(price)) return sum;

      hasAnyPrice = true;

      return (
        sum +
        price * (Number(item.quantity_value) || 1)
      );
    },
    0
  );

  return hasAnyPrice ? total : null;
}

function getBasketTotal() {
  let total = 0;
  let hasTotal = false;

  getBasketGroups().forEach((group) => {
    const subtotal = getBasketGroupSubtotal(group);

    if (Number.isFinite(subtotal)) {
      hasTotal = true;
      total += subtotal;
    }
  });

  return {
    total,
    hasTotal
  };
}

function renderBasket() {
  if (!basketList) return;

  const groups = getBasketGroups();

  if (!groups.length) {
    basketList.innerHTML = `
      <div class="sourcing-empty-card">
        Your basket is empty. Add products from saved items or from a business’s Supply & Products page.
      </div>
    `;

    window.LocalityAppShell?.setBasketCount?.(0);
    renderBasketPreviewRail();
    return;
  }

  let basketTotal = 0;
  let hasBasketTotal = false;

  const groupsHtml = groups
    .map((group) => {
      const business =
        group.business || {
          name: "Locality business"
        };

      const subtotal =
        getBasketGroupSubtotal(group);

      if (Number.isFinite(subtotal)) {
        hasBasketTotal = true;
        basketTotal += subtotal;
      }

      const rowsHtml = group.items
        .map(({ item, product }) => {
          return `
            <div class="basket-row" data-basket-item-id="${escapeHtml(item.id)}">
              <div class="basket-product-main">
                <strong>${escapeHtml(product.name || "Basket item")}</strong>
                <span>${escapeHtml(product.description || product.availability_status || "Product in basket")}</span>
              </div>

              <span class="basket-product-meta">
                ${escapeHtml(formatCategory(product.category))}
              </span>

              <span class="basket-product-meta">
                ${escapeHtml(getProductPrice(product))}
              </span>

              <input
                class="basket-qty-input"
                type="number"
                min="1"
                value="${escapeHtml(item.quantity_value || 1)}"
                aria-label="Quantity for ${escapeHtml(product.name || "product")}"
              />

              <div class="basket-row-actions">
                <button
                  type="button"
                  data-update-basket-item="${escapeHtml(item.id)}"
                >
                  Update
                </button>

                <button
                  type="button"
                  data-view-basket-product="${escapeHtml(product.id)}"
                >
                  View
                </button>

                <button
                  type="button"
                  class="danger"
                  data-remove-basket-item="${escapeHtml(item.id)}"
                >
                  Remove
                </button>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <article class="basket-business-panel">
          <header class="basket-business-header">
            ${businessLogoHtml(business, "basket-business-logo")}

            <div class="basket-business-copy">
              <h3>${escapeHtml(business.name || "Locality business")}</h3>
              <p>
                ${escapeHtml(getLocation(business))}
                ·
                ${group.items.length} ${group.items.length === 1 ? "item" : "items"}
              </p>
            </div>

            <div class="basket-business-actions">
              <button type="button" class="primary" data-request-business="${escapeHtml(group.businessId)}">
                Request from this business
              </button>
            </div>
          </header>

          <div class="basket-product-list">
            ${rowsHtml}
          </div>

          <footer class="basket-business-footer">
            <strong>Business subtotal</strong>
            <span>${Number.isFinite(subtotal) ? formatMoney(subtotal) : "Request pricing"}</span>
          </footer>
        </article>
      `;
    })
    .join("");

  basketList.innerHTML = `
    ${groupsHtml}

    <footer class="basket-total-footer">
      <div>
        <strong>Basket total</strong>
        <p>
          Seller confirmation is still required before any order is final.
        </p>
      </div>

      <div>
        <strong>
          ${hasBasketTotal ? formatMoney(basketTotal) : "Request pricing"}
        </strong>

        <button type="button" data-request-all-basket>
          Request all items
        </button>
      </div>
    </footer>
  `;

  window.LocalityAppShell?.setBasketCount?.(
    basketData.basketItems.length
  );

  renderBasketPreviewRail();
}

function renderBasketPreviewRail() {
  if (!basketPreviewRail) return;

  if (activeTab === "basket") {
    basketPreviewRail.innerHTML = "";
    return;
  }

  const basketItems =
    basketData.basketItems.slice(0, 5);

  const { total, hasTotal } =
    getBasketTotal();

  const itemsHtml = basketItems.length
    ? basketItems
        .map((item) => {
          const product =
            getProductById(item.product_id, basketData);

          return `
            <div class="basket-preview-item">
              <strong>${escapeHtml(product?.name || "Basket item")}</strong>
              <span>${escapeHtml(item.quantity_value || 1)} · ${escapeHtml(getProductPrice(product || {}))}</span>
            </div>
          `;
        })
        .join("")
    : `
      <div class="basket-preview-empty">
        Basket is empty
      </div>
    `;

  basketPreviewRail.innerHTML = `
    <article class="basket-preview-card">
      <button
        type="button"
        class="basket-preview-open"
        data-open-basket-tab
      >
        <span>${basketData.basketItems.length}</span>
        <strong>Basket</strong>
      </button>

      <div class="basket-preview-items">
        ${itemsHtml}
      </div>

      <footer class="basket-preview-total">
        <span>Total</span>
        <strong>${hasTotal ? formatMoney(total) : "—"}</strong>
      </footer>
    </article>
  `;
}

function openProductModal(productId, data = savedData) {
  const product =
    getProductById(productId, data);

  if (!product || !sourcingProductModal || !sourcingModalContent) {
    return;
  }

  const business =
    getBusinessById(
      product.business_profile_id,
      data
    ) ||
    getBusinessById(
      product.business_profile_id,
      savedData
    ) ||
    getBusinessById(
      product.business_profile_id,
      basketData
    );

  const imageHtml = product.image_url
    ? `
      <div class="sourcing-modal-media">
        <img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name || "Product")} image" />
      </div>
    `
    : `
      <div class="sourcing-modal-media"></div>
    `;

  sourcingModalContent.innerHTML = `
    ${imageHtml}

    <div class="sourcing-modal-body">
      <p class="sourcing-kicker">Product details</p>

      <h3 id="sourcingModalTitle">
        ${escapeHtml(product.name || "Local product")}
      </h3>

      <p>
        ${escapeHtml(product.description || "No product description has been added yet.")}
      </p>

      <div class="sourcing-modal-meta">
        <div>
          <span>Business</span>
          <strong>${escapeHtml(business?.name || "Locality business")}</strong>
        </div>

        <div>
          <span>Price</span>
          <strong>${escapeHtml(getProductPrice(product))}</strong>
        </div>

        <div>
          <span>Category</span>
          <strong>${escapeHtml(formatCategory(product.category))}</strong>
        </div>

        <div>
          <span>Availability</span>
          <strong>${escapeHtml(product.availability_status || "Available")}</strong>
        </div>
      </div>

      <p>
        ${escapeHtml(product.fulfillment_notes || product.season_notes || "")}
      </p>

      <div class="sourcing-modal-actions">
        <button
          type="button"
          class="primary"
          data-modal-add-basket="${escapeHtml(product.id)}"
          data-business-id="${escapeHtml(product.business_profile_id)}"
        >
          Add to basket
        </button>

        <button
          type="button"
          data-modal-save-product="${escapeHtml(product.id)}"
          data-business-id="${escapeHtml(product.business_profile_id)}"
        >
          Save product
        </button>

        <a href="supply.html?id=${encodeURIComponent(product.business_profile_id)}">
          View supply page
        </a>
      </div>
    </div>
  `;

  sourcingProductModal.hidden = false;
}

function closeProductModal() {
  if (sourcingProductModal) {
    sourcingProductModal.hidden = true;
  }

  if (sourcingModalContent) {
    sourcingModalContent.innerHTML = "";
  }
}

async function loadSourcingData() {
  const service = window.LocalitySourcingService;

  if (!service) {
    savedNetworkList.innerHTML = `
      <div class="sourcing-empty-card">
        Sourcing service is unavailable. Check script order.
      </div>
    `;

    return;
  }

  const user =
    await window.LocalityAuthService?.getCurrentUser?.();

  if (!user) {
    window.location.href = "account.html";
    return;
  }

  const [savedResult, basketResult] =
    await Promise.all([
      service.getSavedNetwork(),
      service.getBasketItems()
    ]);

  if (savedResult.error) {
    console.error("Saved network error:", savedResult.error);
  }

  if (basketResult.error) {
    console.error("Basket error:", basketResult.error);
  }

  savedData =
    savedResult.data || savedData;

  basketData =
    basketResult.data || basketData;

  refreshCategoryFilter();
  renderSavedNetwork();
  renderBasket();
  renderBasketPreviewRail();

  service.emitBasketUpdated?.();
}

async function handleSavedAction(event) {
  const addButton =
    event.target.closest("[data-add-saved-product-to-basket]");

  const viewButton =
    event.target.closest("[data-view-product]");

  const unsaveProductButton =
    event.target.closest("[data-unsave-product]");

  const unsaveBusinessButton =
    event.target.closest("[data-unsave-business]");

  if (addButton) {
    const row =
      addButton.closest(".saved-product-row");

    const qty =
      Number(row?.querySelector(".saved-product-qty")?.value) || 1;

    addButton.textContent = "Adding...";

    const result =
      await window.LocalitySourcingService.addProductToBasket({
        productId: addButton.dataset.addSavedProductToBasket,
        businessProfileId: addButton.dataset.businessId,
        quantityValue: qty
      });

    addButton.textContent =
      result.error ? "Try again" : "Added";

    await loadSourcingData();
    return;
  }

  if (viewButton) {
    openProductModal(viewButton.dataset.viewProduct, savedData);
    return;
  }

  if (unsaveProductButton) {
    await window.LocalitySourcingService.unsaveProduct(
      unsaveProductButton.dataset.unsaveProduct
    );

    await loadSourcingData();
    return;
  }

  if (unsaveBusinessButton) {
    await window.LocalitySourcingService.unsaveBusiness(
      unsaveBusinessButton.dataset.unsaveBusiness
    );

    await loadSourcingData();
  }
}

async function handleBasketAction(event) {
  const updateButton =
    event.target.closest("[data-update-basket-item]");

  const removeButton =
    event.target.closest("[data-remove-basket-item]");

  const viewButton =
    event.target.closest("[data-view-basket-product]");

  const requestBusiness =
    event.target.closest("[data-request-business]");

  const requestAll =
    event.target.closest("[data-request-all-basket]");

  if (updateButton) {
    const row =
      updateButton.closest(".basket-row");

    const qty =
      Number(row?.querySelector(".basket-qty-input")?.value) || 1;

    updateButton.textContent = "Saving...";

    const result =
      await window.LocalitySourcingService.updateBasketItem(
        updateButton.dataset.updateBasketItem,
        {
          quantityValue: qty
        }
      );

    updateButton.textContent =
      result.error ? "Try again" : "Saved";

    await loadSourcingData();
    return;
  }

  if (removeButton) {
    await window.LocalitySourcingService.removeBasketItem(
      removeButton.dataset.removeBasketItem
    );

    await loadSourcingData();
    return;
  }

  if (viewButton) {
    openProductModal(
      viewButton.dataset.viewBasketProduct,
      basketData
    );

    return;
  }

  if (requestBusiness) {
    window.alert(
      "Order requests will connect here once checkout and seller confirmation are ready."
    );

    return;
  }

  if (requestAll) {
    window.alert(
      "Request all will eventually create separate seller requests grouped by business."
    );
  }
}

async function handleModalAction(event) {
  const addButton =
    event.target.closest("[data-modal-add-basket]");

  const saveButton =
    event.target.closest("[data-modal-save-product]");

  if (addButton) {
    addButton.textContent = "Adding...";

    const result =
      await window.LocalitySourcingService.addProductToBasket({
        productId: addButton.dataset.modalAddBasket,
        businessProfileId: addButton.dataset.businessId,
        quantityValue: 1
      });

    addButton.textContent =
      result.error ? "Try again" : "Added";

    await loadSourcingData();
    return;
  }

  if (saveButton) {
    saveButton.textContent = "Saving...";

    const result =
      await window.LocalitySourcingService.saveProduct({
        productId: saveButton.dataset.modalSaveProduct,
        businessProfileId: saveButton.dataset.businessId
      });

    saveButton.textContent =
      result.error ? "Try again" : "Saved";

    await loadSourcingData();
  }
}

function attachSourcingEvents() {
  sourcingTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveTab(tab.dataset.sourcingTab);
    });
  });

  basketPreviewRail?.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-basket-tab]")) {
      setActiveTab("basket");
    }
  });

  sourcingSearchInput?.addEventListener("input", () => {
    renderSavedNetwork();
    renderBasket();
    renderBasketPreviewRail();
  });

  sourcingCategoryFilter?.addEventListener("change", () => {
    renderSavedNetwork();
    renderBasket();
    renderBasketPreviewRail();
  });

  sourcingRefreshBtn?.addEventListener("click", loadSourcingData);

  savedNetworkList?.addEventListener("click", handleSavedAction);
  basketList?.addEventListener("click", handleBasketAction);

  clearBasketBtn?.addEventListener("click", async () => {
    const confirmed = window.confirm(
      "Clear all items from your basket?"
    );

    if (!confirmed) return;

    await window.LocalitySourcingService.clearBasket();
    await loadSourcingData();
  });

  sourcingProductModal?.addEventListener("click", async (event) => {
    if (event.target.closest("[data-close-sourcing-modal]")) {
      closeProductModal();
      return;
    }

    await handleModalAction(event);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProductModal();
    }
  });
}

function initializeSourcingPage() {
  const params =
    new URLSearchParams(window.location.search);

  setActiveTab(params.get("tab") || "saved", false);
  attachSourcingEvents();
  loadSourcingData();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeSourcingPage
  );
} else {
  initializeSourcingPage();
}
