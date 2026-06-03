const workspace = document.getElementById("studioWorkspace");

const streamMode = document.getElementById("streamMode");
const contextMode = document.getElementById("contextMode");

const emptyMode = document.getElementById("emptyMode");
const viewMode = document.getElementById("viewMode");
const editMode = document.getElementById("editMode");
const demoSessionName = document.getElementById("demoSessionName");

const editorEyebrow = document.getElementById("editorEyebrow");
const editorTitle = document.getElementById("editorTitle");
const editorSubtitle = document.getElementById("editorSubtitle");
const blankContractGuidance = document.getElementById("blankContractGuidance");

const contextTitle = document.getElementById("contextTitle");
const contextSubtitle = document.getElementById("contextSubtitle");

const cards = document.querySelectorAll(".contract-card");
const newContractBtn = document.getElementById("newContractBtn");

const addProductRow = document.getElementById("addProductRow");
const productEditor = document.getElementById("productEditor");

const customClauseList = document.getElementById("customClauseList");
const addCustomClauseBtn = document.getElementById("addCustomClauseBtn");

const reviewModal = document.getElementById("finalReviewModal");
const closeReviewModal = document.getElementById("closeReviewModal");
const keepEditingBtn = document.getElementById("keepEditingBtn");

const saveDraftBtn = document.getElementById("saveDraftBtn");

let activeDraftId = null;

const networkMode = document.getElementById("networkMode");
const snapshotMode = document.getElementById("snapshotMode");
const workPanelMode = document.getElementById("workPanelMode");
const dealFitTab = document.getElementById("dealFitTab");
const productsTab = document.getElementById("productsTab");

let businessRows = [];
let selectedBusinessKey = null;
let selectedBusinessName = null;
let selectedAgreementTemplate = "flexible";

const agreementTemplateLabels = {
  fixed: "Fixed quantity",
  flexible: "Flexible ordering",
  seasonal: "Seasonal availability"
};

function setAgreementTemplate(template = "flexible") {
  selectedAgreementTemplate = template;

  document.querySelectorAll("[data-template-card]").forEach((card) => {
    card.classList.toggle("active", card.dataset.templateCard === template);
  });

  const label = document.getElementById("builderTemplateLabel");
  if (label) {
    label.textContent = agreementTemplateLabels[template] || "Flexible ordering";
  }

  if (editorSubtitle) {
    if (template === "fixed") {
      editorSubtitle.textContent =
        "Build a fixed quantity agreement with set recurring purchase commitments.";
    }

    if (template === "flexible") {
      editorSubtitle.textContent =
        "Build a flexible ordering agreement where buyers order changing quantities under agreed prices, minimums, and rules.";
    }

    if (template === "seasonal") {
      editorSubtitle.textContent =
        "Build an availability-based agreement for seasonal products and harvest-dependent supply.";
    }
  }
}
const networkSearchInput = document.getElementById("networkSearchInput");
const startDraftFromBusiness = document.getElementById("startDraftFromBusiness");
const networkListView = document.getElementById("networkListView");
const businessProfileView = document.getElementById("businessProfileView");
const backToNetwork = document.getElementById("backToNetwork");

const profileData =
  window.LocalityDataService?.getMarketplaceProfiles?.() ||
  (Array.isArray(profiles) ? profiles : []);

function renderBusinessList(filter = "all", searchTerm = "") {
  const businessList = document.getElementById("businessList");
  if (!businessList) return;

  const normalizedSearch = searchTerm.toLowerCase();

  const visibleProfiles = profileData.filter((profile) => {
  const roles = profile.marketplaceRoles || [];

  const isSeller =
    roles.includes("seller") ||
    profile.type === "supplier" ||
    profile.raw?.type === "farm";

  const isBuyer =
    roles.includes("buyer") ||
    profile.type === "buyer";

  const matchesFilter =
    filter === "all" ||
    (filter === "supplier" && isSeller) ||
    (filter === "buyer" && isBuyer);

  const searchableText = [
    profile.name,
    profile.type,
    profile.businessSubtype,
    profile.businessCategories?.join(" "),
    profile.specialties?.join(" "),
    profile.marketplaceRoles?.join(" "),
    profile.productFocus,
    profile.locationLabel,
    profile.productCategories?.join(" "),
    profile.description,
    profile.raw?.product,
    profile.raw?.location,
    profile.raw?.productType,
    profile.raw?.demandNeed
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return matchesFilter && searchableText.includes(normalizedSearch);
});

  businessList.innerHTML = visibleProfiles
    .map((profile, index) => {
      const key = slugifyProfileName(profile.name);
      const role = getProfileRole(profile);

      const primaryCategory =
        profile.specialties?.[0] ||
        profile.businessCategories?.[0] ||
        profile.businessSubtype ||
        "other";

      const categoryLabel = formatBusinessCategory(primaryCategory);
      
      const isSeller =
        profile.marketplaceRoles?.includes("seller") ||
        profile.type === "supplier" ||
        profile.raw?.type === "farm";
      
      const logoClass = isSeller ? "green-logo" : "";
      
      return `
        <button class="business-row ${index === 0 ? "selected" : ""}" 
                data-business="${key}" 
                data-type="${isSeller ? "supplier" : "buyer"}">
          <span class="business-logo small-logo ${logoClass}">
            ${getProfileInitials(profile)}
          </span>
          <div>
            <strong>${profile.name}</strong>
            <small>
              ${categoryLabel} · ${role} · ${profile.locationLabel || profile.raw?.location || "Phoenix region"}
            </small>
          </div>
        </button>
      `;
          })
          .join("");

  businessRows = document.querySelectorAll(".business-row");
}

const businessListEl = document.getElementById("businessList");

businessListEl?.addEventListener("click", (event) => {
  const row = event.target.closest(".business-row");
  if (!row) return;

  document.querySelectorAll(".business-row").forEach((item) => {
    item.classList.remove("selected");
  });

  row.classList.add("selected");
  updateBusinessPreview(row.dataset.business);
});
  
function slugifyProfileName(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getProfileInitials(profile) {
  if (profile.logoInitials) return profile.logoInitials;

  return profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatBusinessCategory(category = "") {
  const labels = {
    farm: "Farm",
    processor: "Processor",
    distributor: "Distributor",
    restaurant: "Restaurant",
    store: "Store",
    institution: "Institution",
    "food-hub": "Food Hub",
    other: "Other"
  };

  return labels[category] || "Business";
}

function formatMarketplaceRoles(roles = []) {
  if (!Array.isArray(roles) || roles.length === 0) {
    return "Network profile";
  }

  const hasBuyer = roles.includes("buyer");
  const hasSeller = roles.includes("seller");

  if (hasBuyer && hasSeller) return "Buyer + Seller";
  if (hasSeller) return "Seller";
  if (hasBuyer) return "Buyer";

  return "Network profile";
}

function getProfileRole(profile) {
  return formatMarketplaceRoles(profile.marketplaceRoles);
}

function getProfileFocus(profile) {
  if (profile.type === "supplier") {
    return profile.productFocus || profile.raw?.product || "Local supply";
  }

  return profile.raw?.demandNeed || profile.productFocus || "Local sourcing";
}

function getProfileActivity(profile) {
  if (profile.type === "supplier") {
    const count = profile.productListings?.length || 0;
    return count > 0 ? `${count} listed items` : "Supplier profile";
  }

  return profile.orderFrequency || profile.raw?.orderFrequency || "Buyer profile";
}

function getProfileNote(profile) {
  return (
    profile.featuredInsight ||
    profile.description ||
    `${profile.name} is active in the Locality regional network.`
  );
}

function getProfileByKey(key) {
  return profileData.find((profile) => slugifyProfileName(profile.name) === key);
}

function parsePrice(priceString = "") {
  const clean = String(priceString).replace("Suggested:", "").trim();

  const match = clean.match(/\$?\s*([\d.]+)\s*\/\s*([a-zA-Z]+)?/);

  return {
    amount: match?.[1] || "",
    unit: match?.[2] || "unit"
  };
}

function hideAllCanvasModes() {
  emptyMode?.classList.add("hidden");
  viewMode?.classList.add("hidden");
  editMode?.classList.add("hidden");
}

function showRightMode(mode) {
  networkMode?.classList.add("hidden");
  snapshotMode?.classList.add("hidden");
  workPanelMode?.classList.add("hidden");

  if (mode === "network") networkMode?.classList.remove("hidden");
  if (mode === "snapshot") snapshotMode?.classList.remove("hidden");
  if (mode === "work") workPanelMode?.classList.remove("hidden");
}

function clearProductRows() {
  const rows = productEditor?.querySelectorAll(".product-row") || [];
  rows.forEach((row) => row.remove());
}

function setEmptyProductState(isEmpty = true) {
  if (!productEditor) return;

  productEditor.classList.toggle("is-empty", isEmpty);

  let emptyMessage = productEditor.querySelector(".empty-product-message");

  if (isEmpty) {
    if (!emptyMessage) {
      emptyMessage = document.createElement("div");
      emptyMessage.className = "empty-product-message";
      emptyMessage.innerHTML = `
        <strong>No products added yet</strong>
        <span>
          Select a business from the Locality Network, then add listed products into this agreement.
        </span>
      `;
    }

    productEditor.prepend(emptyMessage);

    if (addProductRow) {
      addProductRow.style.display = "inline-flex";
    }
  }

  if (!isEmpty && emptyMessage) {
    emptyMessage.remove();

    if (addProductRow) {
      addProductRow.style.display = "inline-flex";
    }
  }
}

function setWorkspaceState(state) {
  workspace?.classList.remove("state-stream", "state-view", "state-edit", "state-new");
  workspace?.classList.add(`state-${state}`);
  updateDraftButtonLanguage(state);

  hideAllCanvasModes();

  if (state === "stream") {
    emptyMode?.classList.remove("hidden");
    streamMode?.classList.remove("hidden");
    contextMode?.classList.add("hidden");
    showRightMode("network");
    return;
  }

  if (state === "view") {
    viewMode?.classList.remove("hidden");
    streamMode?.classList.add("hidden");
    contextMode?.classList.remove("hidden");
    showRightMode("snapshot");

    contextTitle.textContent = "Roosevelt Row Market";
    contextSubtitle.textContent = "Buyer counteroffer under review.";
    return;
  }

  if (state === "edit") {
    editMode?.classList.remove("hidden");
    streamMode?.classList.add("hidden");
    contextMode?.classList.remove("hidden");
    showRightMode("work");
    showRightTab("fit");

    editorEyebrow.textContent = "Counteroffer Workspace";
    editorTitle.textContent = "Edit structured terms";
    editorSubtitle.textContent = "Use listed products and structured fields to keep the agreement clean.";

    blankContractGuidance?.classList.add("hidden");
    setEmptyProductState(false);

    contextTitle.textContent = "Roosevelt Row Market";
    contextSubtitle.textContent = "Buyer counteroffer under review.";
    return;
  }

  if (state === "new") {
    editMode?.classList.remove("hidden");
    streamMode?.classList.add("hidden");
    contextMode?.classList.remove("hidden");

    editorEyebrow.textContent = "New Contract";
    editorTitle.textContent = selectedBusinessName
      ? `Draft agreement for ${selectedBusinessName}`
      : "Draft a new supply agreement";

    editorSubtitle.textContent = selectedBusinessName
      ? "Add listed products and structured terms before review."
      : "Start by finding a business in the Locality Network.";

    blankContractGuidance?.classList.toggle("hidden", Boolean(selectedBusinessName));

    contextTitle.textContent = selectedBusinessName || "Select recipient";
    contextSubtitle.textContent = selectedBusinessName
      ? "Recipient selected for this draft agreement."
      : "Use the Locality Network to select the buyer this agreement will be sent to.";

    setAgreementTemplate(selectedAgreementTemplate || "flexible");

    return;
  }
}

function beginBlankContractFlow() {
  selectedBusinessKey = null;
  selectedBusinessName = null;

  setWorkspaceState("new");

  clearProductRows();
  setEmptyProductState(true);

  showRightMode("network");

  networkListView?.classList.remove("hidden");
  businessProfileView?.classList.add("hidden");

  contextTitle.textContent = "Select recipient";
  contextSubtitle.textContent = "Search the Locality Network to choose who this agreement will be sent to.";

  networkSearchInput?.focus();

  networkMode?.classList.remove("finder-focus");
  void networkMode?.offsetWidth;
  networkMode?.classList.add("finder-focus");
}

function beginContractForSelectedBusiness() {
  const profile = selectedBusinessKey ? getProfileByKey(selectedBusinessKey) : null;

  clearProductRows();
  setEmptyProductState(true);

  if (profile) {
    selectedBusinessName = profile.name;
    renderProfileProducts(profile);
  }

  setWorkspaceState("new");
  showRightMode("work");
  showRightTab("products");

  if (profile) {
    contextTitle.textContent = profile.name;
    contextSubtitle.textContent = "Recipient selected for this draft agreement.";
  }
}


function showRightTab(tab) {
  document.querySelectorAll("[data-right-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.rightTab === tab);
  });

  dealFitTab?.classList.toggle("hidden", tab !== "fit");
  productsTab?.classList.toggle("hidden", tab !== "products");
}

document.querySelectorAll("[data-right-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    showRightTab(button.dataset.rightTab);
  });
});

document.addEventListener("click", (event) => {
  const templateCard = event.target.closest("[data-template-card]");
  if (!templateCard) return;

  setAgreementTemplate(templateCard.dataset.templateCard);
});

document.addEventListener("click", (event) => {
  const card = event.target.closest(".contract-card");
  if (!card) return;

  // Do not override button clicks inside the card
  if (event.target.closest("button")) return;

  document.querySelectorAll(".contract-card").forEach((item) => {
    item.classList.remove("selected");
  });

  card.classList.add("selected");
});

cards.forEach((card) => {
  card.addEventListener("click", () => {
    cards.forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");
  });

  card.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      cards.forEach((item) => item.classList.remove("selected"));
      card.classList.add("selected");

      const action = button.dataset.action;

      if (action === "view") setWorkspaceState("view");
      if (action === "edit") setWorkspaceState("edit");
      if (action === "message") alert("Messaging workspace placeholder");
    });
  });
});

document.querySelectorAll("[data-open-edit]").forEach((button) => {
  button.addEventListener("click", () => setWorkspaceState("edit"));
});

document.querySelectorAll("[data-back-stream]").forEach((button) => {
  button.addEventListener("click", () => setWorkspaceState("stream"));
});

newContractBtn?.addEventListener("click", () => {
  cards.forEach((item) => item.classList.remove("selected"));
  beginBlankContractFlow();
});

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-start-draft]")) {
    cards.forEach((item) => item.classList.remove("selected"));
    beginContractForSelectedBusiness();
  }
});

document.querySelectorAll("[data-recipient]").forEach((button) => {
  button.addEventListener("click", () => {
    contextTitle.textContent = button.dataset.recipient;
    contextSubtitle.textContent = "Recipient selected for this draft agreement.";
  });
});

function updateDraftButtonLanguage(state = "stream") {
  const isSelectingRecipient = state === "new" || state === "edit";

  document.querySelectorAll("[data-start-draft]").forEach((button) => {
    button.textContent = isSelectingRecipient
      ? "Select recipient"
      : "Create contract draft";
  });
}

function updateBusinessPreview(key) {
  const profile = getProfileByKey(key);
  if (!profile) return;

  selectedBusinessKey = key;
  selectedBusinessName = profile.name;

  const role = getProfileRole(profile);
  const initials = getProfileInitials(profile);

  document.getElementById("previewLogo").textContent = initials;
  document.getElementById("previewType").textContent = `${role} profile`;
  document.getElementById("previewName").textContent = profile.name;
  document.getElementById("previewMeta").textContent = `${profile.location || "Phoenix region"} · ${profile.product || "Local network profile"}`;
  document.getElementById("previewActivity").textContent = getProfileActivity(profile);
  document.getElementById("previewFocus").textContent = getProfileFocus(profile);
  document.getElementById("previewNote").textContent = getProfileNote(profile);

  renderProfileProducts(profile);

  networkListView?.classList.add("hidden");
  businessProfileView?.classList.remove("hidden");
}

backToNetwork?.addEventListener("click", () => {
  businessProfileView?.classList.add("hidden");
  networkListView?.classList.remove("hidden");
});

 let activeNetworkFilter = "all";

document.querySelectorAll("[data-network-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-network-filter]").forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    activeNetworkFilter = button.dataset.networkFilter;

    renderBusinessList(activeNetworkFilter, networkSearchInput?.value || "");
  });
});

networkSearchInput?.addEventListener("input", () => {
  renderBusinessList(activeNetworkFilter, networkSearchInput.value);
});

function getProfileProducts(profile) {
  return (
    profile.productListings ||
    profile.productsAvailable ||
    profile.availableProducts ||
    profile.products ||
    profile.listings ||
    []
  );
}

function renderDemoSessionBadge() {
  const currentUser = window.LocalityDataService?.getCurrentDemoUser?.();

  if (demoSessionName) {
    demoSessionName.textContent =
      currentUser?.businessName ||
      currentUser?.fullName ||
      "Demo profile";
  }
}

document.addEventListener("click", (event) => {
  const logoutButton = event.target.closest("[data-demo-logout]");
  if (!logoutButton) return;

  window.LocalityDataService?.clearCurrentDemoUser?.();
  window.location.href = "login.html";
});

renderDemoSessionBadge();


function renderProfileProducts(profile) {
  const productLists = document.querySelectorAll(".profile-product-list");
  if (!productLists.length || !profile) return;

  const products = getProfileProducts(profile);

  const productHTML = products.length
    ? products
        .map((product) => {
          const parsed = {
  amount:
    product.priceAmount !== null && product.priceAmount !== undefined
      ? String(product.priceAmount)
      : parsePrice(product.price || product.listedPrice || product.unitPrice || "").amount,

  unit:
    product.priceUnit ||
    parsePrice(product.price || product.listedPrice || product.unitPrice || "").unit
};

        const productName =
            product.name ||
            product.product ||
            product.label ||
            "Listed product";

        const productPrice =
            product.priceDisplay ||
            product.price ||
            product.listedPrice ||
            product.unitPrice ||
            "Price not listed";

        const productNote =
            product.availabilityNote ||
            product.note ||
            product.status ||
            product.availability ||
            "Available";

            const isOrganic = Boolean(product.organic);
          const badge = isOrganic
            ? `<span class="organic-badge">Organic</span>`
            : `<span class="conventional-badge">Conventional</span>`;

          return `
            <button class="profile-product"
                    data-product="${productName}"
                    data-price="${parsed.amount}"
                    data-unit="${parsed.unit}"
                    data-organic="${isOrganic}">
              <div>
                <strong>${productName} ${badge}</strong>
                <span>${productPrice} · ${productNote}</span>
              </div>
              <em>Add</em>
            </button>
          `;
        })
        .join("")
    : `
      <div class="empty-products-note">
        <strong>No listed products yet</strong>
        <span>This profile does not currently include listed product pricing.</span>
      </div>
    `;

  productLists.forEach((list) => {
    list.innerHTML = productHTML;
  });

  attachProfileProductListeners();
}

function attachProfileProductListeners() {
  // Product buttons are rendered dynamically from profiles.js.
  // Their clicks are handled by the delegated listener below.
}

function renumberCustomClauses() {
  const cards = document.querySelectorAll(".custom-clause-card");

  cards.forEach((card, index) => {
    const label = card.querySelector(".custom-clause-head strong");
    const removeBtn = card.querySelector(".remove-custom-clause");

    if (label) label.textContent = `Custom clause ${index + 1}`;

    if (removeBtn) {
      removeBtn.classList.toggle("hidden", cards.length === 1);
    }
  });
}

function createCustomClauseCard() {
  if (!customClauseList) return;

  const card = document.createElement("div");
  card.className = "custom-clause-card";

  card.innerHTML = `
    <div class="custom-clause-head">
      <strong>Custom clause</strong>
      <button type="button" class="remove-custom-clause">Remove</button>
    </div>

    <label>
      Clause title
      <input
        class="custom-clause-title"
        type="text"
        placeholder="Example: Packaging return"
      />
    </label>

    <label>
      Clause text
      <textarea
        class="custom-clause-text"
        placeholder="Example: Buyer shall return reusable crates within seven days of delivery."
      ></textarea>
    </label>
  `;

  customClauseList.appendChild(card);
  renumberCustomClauses();
}

function getCustomClauses() {
  return Array.from(document.querySelectorAll(".custom-clause-card"))
    .map((card) => {
      const title = card.querySelector(".custom-clause-title")?.value.trim() || "";
      const text = card.querySelector(".custom-clause-text")?.value.trim() || "";

      return { title, text };
    })
    .filter((clause) => clause.title || clause.text);
}

addCustomClauseBtn?.addEventListener("click", createCustomClauseCard);

customClauseList?.addEventListener("click", (event) => {
  const removeBtn = event.target.closest(".remove-custom-clause");
  if (!removeBtn) return;

  const card = removeBtn.closest(".custom-clause-card");
  card?.remove();

  renumberCustomClauses();
});

renumberCustomClauses();



function createProductRow(product = "Listed product", price = "0.00", unit = "lb", organic = false) {
  setEmptyProductState(false);

  const row = document.createElement("div");
  row.className = "product-row active";
  row.dataset.product = product;
  row.dataset.price = price;
  row.dataset.unit = unit;
  row.dataset.organic = organic ? "true" : "false";

  document.querySelectorAll(".product-row").forEach((item) => {
    item.classList.remove("active");
  });

  const badge = organic
    ? `<span class="organic-badge">Organic</span>`
    : `<span class="conventional-badge">Conventional</span>`;

  row.innerHTML = `
    <div class="product-summary">
      <div>
        <strong>${product} ${badge}</strong>
        <span>Min 25 ${unit}/order · $${price}/${unit} · Buyer-selected quantities</span>
      </div>
      <button class="remove-row-btn" type="button">Remove</button>
    </div>

    <div class="product-fields flexible-product-fields">
      <label>
        Product
        <select class="product-select">
          <option selected>${product}</option>
          <option>Rainbow Carrots</option>
          <option>Red Cabbage</option>
          <option>Fresh Herbs</option>
          <option>Heirloom Tomatoes</option>
        </select>
      </label>

      <label>
        Minimum order
        <div class="split-field">
          <input class="quantity-input" type="number" value="25" />
          <select class="unit-select">
            <option ${unit === "lb" ? "selected" : ""}>lb</option>
            <option ${unit === "oz" ? "selected" : ""}>oz</option>
            <option ${unit === "kg" ? "selected" : ""}>kg</option>
            <option ${unit === "crate" ? "selected" : ""}>crate</option>
            <option ${unit === "case" ? "selected" : ""}>case</option>
            <option ${unit === "bundle" ? "selected" : ""}>bundle</option>
            <option ${unit === "each" ? "selected" : ""}>each</option>
          </select>
        </div>
      </label>

      <label>
        Price
        <div class="price-field">
          <span>$</span>
          <input class="price-input" type="number" step="0.01" value="${price}" />
          <small>per</small>
          <select class="price-unit-select">
            <option ${unit === "lb" ? "selected" : ""}>lb</option>
            <option ${unit === "oz" ? "selected" : ""}>oz</option>
            <option ${unit === "kg" ? "selected" : ""}>kg</option>
            <option ${unit === "crate" ? "selected" : ""}>crate</option>
            <option ${unit === "case" ? "selected" : ""}>case</option>
            <option ${unit === "bundle" ? "selected" : ""}>bundle</option>
            <option ${unit === "each" ? "selected" : ""}>each</option>
          </select>
        </div>
      </label>

      <label>
        Ordering model
        <select class="ordering-model-select">
          <option selected>Buyer-selected quantity</option>
          <option>Fixed recurring quantity</option>
          <option>Seller availability-based</option>
        </select>
      </label>

      <label class="wide-field">
        Product specifications
        <textarea class="specifications-input" placeholder="Example: Fresh, market-grade, washed, packed in reusable crates.">Fresh, market-grade, packed for local delivery.</textarea>
      </label>
    </div>
  `;

  productEditor.insertBefore(row, addProductRow);
  activateProductRows();
}

function activateProductRows() {
  document.querySelectorAll(".product-row").forEach((row) => {
    row.onclick = () => {
      document.querySelectorAll(".product-row").forEach((item) => item.classList.remove("active"));
      row.classList.add("active");
    };
  });

  document.querySelectorAll(".remove-row-btn").forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();

      const row = button.closest(".product-row");

      if (document.querySelectorAll(".product-row").length > 1) {
        row.remove();
      }
    };
  });
}

addProductRow?.addEventListener("click", () => {
  createProductRow("New product", "0.00", "lb", false);
});


document.addEventListener("click", (event) => {
  if (event.target.id === "openReviewModal") {
    openContractReviewTab();
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".profile-product");
  if (!button) return;

  const product = button.dataset.product || "Listed product";
  const price = button.dataset.price || "0.00";
  const unit = button.dataset.unit || "unit";
  const organic = button.dataset.organic === "true";

  createProductRow(product, price, unit, organic);

  const addLabel = button.querySelector("em");
  const originalLabel = addLabel?.textContent || "Add";

  button.classList.remove("just-added", "add-click-pop");
  void button.offsetWidth;
  button.classList.add("just-added", "add-click-pop");

  if (addLabel) {
    addLabel.textContent = "✓ Added";
  }

  window.setTimeout(() => {
    button.classList.remove("add-click-pop");
  }, 320);

  window.setTimeout(() => {
    button.classList.remove("just-added");

    if (addLabel) {
      addLabel.textContent = originalLabel;
    }
  }, 1300);

  if (!selectedBusinessName && selectedBusinessKey) {
    const profile = getProfileByKey(selectedBusinessKey);
    selectedBusinessName = profile?.name || null;
  }

  setAgreementTemplate("flexible");
  setWorkspaceState("new");
  showRightMode("work");
  showRightTab("products");
});

function closeReview() {
  reviewModal?.classList.remove("active");
}

closeReviewModal?.addEventListener("click", closeReview);
keepEditingBtn?.addEventListener("click", closeReview);

reviewModal?.addEventListener("click", (event) => {
  if (event.target === reviewModal) closeReview();
});

renderBusinessList();
activateProductRows();
setWorkspaceState("stream");
networkListView?.classList.remove("hidden");
businessProfileView?.classList.add("hidden");

window.addEventListener("load", () => {
  const loadingScreen = document.getElementById("contractLoadingScreen");

  setTimeout(() => {
    loadingScreen?.classList.add("hidden");
    document.body.classList.add("studio-loaded");
  }, 2400);
});

function renderSavedDraftCards() {
  const drafts = window.LocalityDataService?.getContractDrafts?.() || [];

  drafts.forEach((draft) => {
    addSavedDraftCard(draft);
  });
}

renderSavedDraftCards();

const reviewWaitingOverlay = document.getElementById("reviewWaitingOverlay");
const dismissReviewWaiting = document.getElementById("dismissReviewWaiting");
const reopenReviewTab = document.getElementById("reopenReviewTab");

function getBuilderProducts() {
  const rows = document.querySelectorAll(".product-row");

  return Array.from(rows)
    .map((row) => {
      const productSelect = row.querySelector(".product-select");
      const quantityInput = row.querySelector(".quantity-input");
      const unitSelect = row.querySelector(".unit-select");
      const priceInput = row.querySelector(".price-input");
      const priceUnitSelect = row.querySelector(".price-unit-select");
      const orderingModelSelect = row.querySelector(".ordering-model-select");
      const specificationsInput = row.querySelector(".specifications-input");

      const productName =
        productSelect?.value?.trim() ||
        row.dataset.product ||
        "Selected product";

      const quantity = quantityInput?.value || "25";
      const unit = unitSelect?.value || row.dataset.unit || "lb";
      const price = priceInput?.value || row.dataset.price || "0.00";
      const priceUnit = priceUnitSelect?.value || unit;

      const orderingModel =
        orderingModelSelect?.value || "Buyer-selected quantity";

      const specifications =
        specificationsInput?.value?.trim() ||
        "Fresh, market-grade product covered by this agreement.";

      const isOrganic =
        row.dataset.organic === "true" ||
        Boolean(row.querySelector(".organic-badge"));

      return {
        name: productName,
        status: isOrganic ? "Organic" : "Conventional",
        unitPrice: `$${price} / ${priceUnit}`,
        minimumOrder: `${quantity} ${unit} / order`,
        orderingModel,
        specifications
      };
    })
    .filter((product) => {
      return (
        product.name &&
        product.name !== "New product" &&
        product.name !== "Selected product"
      );
    });
}

function getFieldValue(selector, fallback = "") {
  const field = document.querySelector(selector);
  const value = field?.value?.trim();

  return value || fallback;
}

function simplifyNotice(value = "48 hours before delivery") {
  return String(value)
    .replace(" before delivery", "")
    .trim();
}

function simplifyPaymentMethod(value = "Paid through Locality") {
  if (value === "Paid through Locality") return "through Locality";
  if (value === "Invoice outside platform") return "outside the Locality platform";
  return `by ${value}`;
}

function getOrderingRules() {
  const orderNoticeRaw = getFieldValue(
    ".order-notice-select",
    "48 hours before delivery"
  );

  const substitutionRaw = getFieldValue(
    ".substitution-rule-select",
    "Require buyer approval"
  );

  const substitutionMap = {
    "Require buyer approval": "Buyer approval",
    "Allow similar substitutions": "similar substitutions",
    "No substitutions allowed": "no substitutions"
  };

  return {
    buyerQuantityControl: getFieldValue(
      ".buyer-quantity-control-select",
      "Buyer chooses quantities per order"
    ),
    minimumTotalOrder: `$${getFieldValue(".minimum-total-order-input", "100")} minimum order`,
    orderNotice: simplifyNotice(orderNoticeRaw),
    orderingFrequency: getFieldValue(
      ".ordering-frequency-select",
      "Weekly ordering allowed"
    ),
    substitutionRule: substitutionMap[substitutionRaw] || substitutionRaw,
    partialFulfillment: getFieldValue(
      ".partial-fulfillment-select",
      "Allowed with notice"
    )
  };
}

function getFulfillmentTerms() {
  const deliveryDays = getFieldValue(".delivery-days-select", "Tuesday / Thursday");
  const deliveryWindow = getFieldValue(".delivery-window-select", "8 AM – 11 AM");

  return {
    fulfillmentMethod: getFieldValue(
      ".fulfillment-method-select",
      "Supplier delivery"
    ),
    deliveryDays,
    deliveryWindow,
    combinedDeliveryWindow: `${deliveryDays}, ${deliveryWindow}`,
    receivingLocation: getFieldValue(
      ".receiving-location-input",
      "Buyer receiving location"
    ),
    fulfillmentNotes: getFieldValue(".fulfillment-notes-input", "")
  };
}

function getPaymentTerms() {
  return {
    paymentTerms: getFieldValue(".payment-terms-select", "Net 15"),
    paymentMethodRaw: getFieldValue(".payment-method-select", "Paid through Locality"),
    paymentMethod: simplifyPaymentMethod(
      getFieldValue(".payment-method-select", "Paid through Locality")
    ),
    latePaymentRule: getFieldValue(
      ".late-payment-rule-select",
      "Future deliveries may pause until payment is resolved"
    )
  };
}

function getStandardTerms() {
  return {
    inspectionWindow: "48 hours",
    cancellationNotice: "14 days written notice",
    governingLaw: "Arizona",
    localityFeeNote:
      "Seller-paid Locality platform fees are governed by the applicable Locality seller agreement, platform terms, or fee schedule. Locality is not a party to this Buyer-Seller Agreement unless expressly stated in a separate written agreement."
  };
}



// Build Contract Draft content for backend

function buildContractDraft() {
  const orderingRules = getOrderingRules();
  const fulfillmentTerms = getFulfillmentTerms();
  const paymentTerms = getPaymentTerms();
  const standardTerms = getStandardTerms();

  return {
    id:
      activeDraftId ||
      window.LocalityDataService?.createId?.("LOC-DRAFT") ||
      `LOC-DRAFT-${Date.now()}`,

    contractId: "LOC-2026-0041",
    status: "draft",
    agreementType: selectedAgreementTemplate || "flexible",

    parties: {
      sellerName: selectedBusinessName || "Queen Creek Harvest",
      buyerName: "Roosevelt Row Market"
    },

    products: getBuilderProducts(),

    orderingRules: {
      buyerQuantityControl: orderingRules.buyerQuantityControl,
      minimumTotalOrder: orderingRules.minimumTotalOrder,
      orderNotice: orderingRules.orderNotice,
      orderingFrequency: orderingRules.orderingFrequency,
      substitutionRule: orderingRules.substitutionRule,
      partialFulfillment: orderingRules.partialFulfillment
    },

    fulfillment: {
      fulfillmentMethod: fulfillmentTerms.fulfillmentMethod,
      deliveryDays: fulfillmentTerms.deliveryDays,
      deliveryWindow: fulfillmentTerms.deliveryWindow,
      combinedDeliveryWindow: fulfillmentTerms.combinedDeliveryWindow,
      receivingLocation: fulfillmentTerms.receivingLocation,
      fulfillmentNotes: fulfillmentTerms.fulfillmentNotes
    },

    payment: {
      paymentTerms: paymentTerms.paymentTerms,
      paymentMethod: paymentTerms.paymentMethod,
      paymentMethodRaw: paymentTerms.paymentMethodRaw,
      latePaymentRule: paymentTerms.latePaymentRule
    },

    standardTerms: {
      inspectionWindow: standardTerms.inspectionWindow,
      cancellationNotice: standardTerms.cancellationNotice,
      governingLaw: standardTerms.governingLaw,
      localityFeeNote: standardTerms.localityFeeNote
    },

    customClauses: getCustomClauses(),

    metadata: {
      source: "contract-studio",
      version: 1
    },

    timestamps: {
      createdAt: "",
      updatedAt: ""
    }
  };
}

function createReviewPayloadFromDraft(draft) {
  return {

    draftId: draft.id,
    createdAt: draft.timestamps?.createdAt || new Date().toISOString(),
    updatedAt: draft.timestamps?.updatedAt || new Date().toISOString(),
    agreementDate: formatContractDate(draft.timestamps?.createdAt || draft.timestamps?.updatedAt),
    lastEdited: formatLastEdited(draft.timestamps?.updatedAt),
    
    contractId: draft.contractId || "LOC-2026-0041",
    agreementType: draft.agreementType || "flexible",

    sellerName: draft.parties?.sellerName || "Queen Creek Harvest",
    buyerName: draft.parties?.buyerName || "Roosevelt Row Market",

    buyerQuantityControl:
      draft.orderingRules?.buyerQuantityControl ||
      "Buyer chooses quantities per order",
    minimumTotalOrder:
      draft.orderingRules?.minimumTotalOrder || "$100 minimum order",
    orderNotice: draft.orderingRules?.orderNotice || "48 hours",
    orderingFrequency:
      draft.orderingRules?.orderingFrequency || "Weekly ordering allowed",
    substitutionRule: draft.orderingRules?.substitutionRule || "Buyer approval",
    partialFulfillment:
      draft.orderingRules?.partialFulfillment || "Allowed with notice",

    fulfillmentMethod:
      draft.fulfillment?.fulfillmentMethod || "Supplier delivery",
    deliveryDays: draft.fulfillment?.deliveryDays || "Tuesday / Thursday",
    deliveryWindow:
      draft.fulfillment?.combinedDeliveryWindow ||
      "Tuesday / Thursday, 8 AM – 11 AM",
    deliveryWindowOnly:
      draft.fulfillment?.deliveryWindow || "8 AM – 11 AM",
    receivingLocation:
      draft.fulfillment?.receivingLocation || "Buyer receiving location",
    fulfillmentNotes: draft.fulfillment?.fulfillmentNotes || "",

    paymentTerms: draft.payment?.paymentTerms || "Net 15",
    paymentMethod: draft.payment?.paymentMethod || "through Locality",
    paymentMethodRaw: draft.payment?.paymentMethodRaw || "Paid through Locality",
    latePaymentRule:
      draft.payment?.latePaymentRule ||
      "Future deliveries may pause until payment is resolved",

    inspectionWindow: draft.standardTerms?.inspectionWindow || "48 hours",
    cancellationNotice:
      draft.standardTerms?.cancellationNotice || "14 days written notice",
    governingLaw: draft.standardTerms?.governingLaw || "Arizona",
    localityFeeNote:
      draft.standardTerms?.localityFeeNote ||
      "Seller-paid Locality platform fees are governed by the applicable Locality seller agreement, platform terms, or fee schedule. Locality is not a party to this Buyer-Seller Agreement unless expressly stated in a separate written agreement.",

    customClauses: draft.customClauses || [],
    products: draft.products || []
  };
}

function formatLastEdited(timestamp) {
  if (!timestamp) return "Last edited just now";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Last edited just now";
  }

  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Last edited just now";
  if (diffMinutes < 60) {
    return `Last edited ${diffMinutes} min ago`;
  }
  if (diffHours < 24) {
    return `Last edited ${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
  }
  if (diffDays < 7) {
    return `Last edited ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return `Last edited ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  })}`;
}

function formatContractDate(timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function addSavedDraftCard(draft) {
  const feed = document.querySelector(".contract-feed");
  if (!feed || !draft) return;

  const existing = document.getElementById(`savedDraftCard-${draft.id}`);
  existing?.remove();

  const lastEditedText = formatLastEdited(draft.timestamps?.updatedAt);
  const sellerName = draft.parties?.sellerName || "Selected business";
  const productCount = draft.products?.length || 0;
  const paymentTerms = draft.payment?.paymentTerms || "Payment terms pending";
  const fulfillmentMethod =
    draft.fulfillment?.fulfillmentMethod || "Fulfillment pending";

  const card = document.createElement("article");
  card.className = "contract-card";
  card.id = `savedDraftCard-${draft.id}`;
  card.dataset.savedDraftId = draft.id;

  card.innerHTML = `
    <div class="status-marker draft"></div>

    <div class="contract-card-main">
      <span class="status-label draft">Saved draft</span>
      <h3>${sellerName}</h3>
      <p>Draft agreement saved locally.</p>
      <small>${productCount} product${productCount === 1 ? "" : "s"} · ${paymentTerms} · ${fulfillmentMethod} · ${lastEditedText}</small>
    </div>

    <div class="contract-card-meta">Draft</div>

    <div class="contract-actions">
      <button data-action="edit-saved-draft" type="button">Edit</button>
      <button data-action="review-saved-draft" type="button">Review</button>
      <button data-action="delete-saved-draft" type="button">Delete</button>
    </div>
  `;

  feed.prepend(card);
}

function setFieldValue(selector, value) {
  const field = document.querySelector(selector);
  if (!field || value === undefined || value === null) return;

  field.value = value;
}

function clearProductRows() {
  const productEditor = document.getElementById("productEditor");
  if (!productEditor) return;

  productEditor.querySelectorAll(".product-row").forEach((row) => {
    row.remove();
  });
}

function loadDraftIntoBuilder(draft) {
  if (!draft) return;

  activeDraftId = draft.id;

  selectedAgreementTemplate = draft.agreementType || "flexible";
  selectedBusinessName = draft.parties?.sellerName || null;

  setAgreementTemplate(selectedAgreementTemplate || "flexible");

  // Ordering rules
  setFieldValue(
    ".buyer-quantity-control-select",
    draft.orderingRules?.buyerQuantityControl
  );

  const minimumOrderValue =
    draft.orderingRules?.minimumTotalOrder?.match(/\d+/)?.[0] || "";

  setFieldValue(".minimum-total-order-input", minimumOrderValue);
  setFieldValue(".ordering-frequency-select", draft.orderingRules?.orderingFrequency);
  setFieldValue(".partial-fulfillment-select", draft.orderingRules?.partialFulfillment);

  // These need conversion because the saved/review version is simplified.
  const noticeValue = draft.orderingRules?.orderNotice
    ? `${draft.orderingRules.orderNotice} before delivery`
    : "";

  setFieldValue(".order-notice-select", noticeValue);

  const substitutionReverseMap = {
    "Buyer approval": "Require buyer approval",
    "similar substitutions": "Allow similar substitutions",
    "no substitutions": "No substitutions allowed"
  };

  setFieldValue(
    ".substitution-rule-select",
    substitutionReverseMap[draft.orderingRules?.substitutionRule] ||
      draft.orderingRules?.substitutionRule
  );

  // Fulfillment
  setFieldValue(".fulfillment-method-select", draft.fulfillment?.fulfillmentMethod);
  setFieldValue(".delivery-days-select", draft.fulfillment?.deliveryDays);
  setFieldValue(".delivery-window-select", draft.fulfillment?.deliveryWindow);
  setFieldValue(".receiving-location-input", draft.fulfillment?.receivingLocation);
  setFieldValue(".fulfillment-notes-input", draft.fulfillment?.fulfillmentNotes);

  // Payment
  setFieldValue(".payment-terms-select", draft.payment?.paymentTerms);
  setFieldValue(".payment-method-select", draft.payment?.paymentMethodRaw);
  setFieldValue(".late-payment-rule-select", draft.payment?.latePaymentRule);

  // Products
  clearProductRows();

  if (Array.isArray(draft.products) && draft.products.length) {
    draft.products.forEach((product) => {
      const name = product.name || "Listed product";

      const price =
        product.price ||
        product.unitPrice?.replace("$", "")?.split("/")[0]?.trim() ||
        "0.00";

      const unit =
        product.unit ||
        product.unitPrice?.split("/")?.[1]?.trim() ||
        "lb";

      const organic =
        product.status?.toLowerCase?.().includes("organic") ||
        product.organic === true;

      createProductRow(name, price, unit, organic);

      const lastRow = document.querySelector(".product-row:last-of-type");

      if (lastRow) {
        const quantityValue =
          product.minimumOrder?.match(/\d+/)?.[0] ||
          product.quantity ||
          "25";

        const minimumUnit =
          product.minimumOrder?.split(" ")?.[1] ||
          product.unit ||
          unit;

        lastRow.querySelector(".quantity-input").value = quantityValue;
        lastRow.querySelector(".unit-select").value = minimumUnit;
        lastRow.querySelector(".price-unit-select").value = unit;

        if (product.orderingModel) {
          lastRow.querySelector(".ordering-model-select").value =
            product.orderingModel;
        }

        if (product.specifications) {
          lastRow.querySelector(".specifications-input").value =
            product.specifications;
        }
      }
    });
  }

  // Custom clauses
  const customClauseList = document.getElementById("customClauseList");

  if (customClauseList) {
    customClauseList.innerHTML = "";

    const clauses = Array.isArray(draft.customClauses)
      ? draft.customClauses
      : [];

    if (clauses.length) {
      clauses.forEach((clause, index) => {
        const card = document.createElement("div");
        card.className = "custom-clause-card";

        card.innerHTML = `
          <div class="custom-clause-head">
            <strong>Custom clause ${index + 1}</strong>
            <button type="button" class="remove-custom-clause ${
              index === 0 ? "hidden" : ""
            }">Remove</button>
          </div>

          <label>
            Clause title
            <input
              class="custom-clause-title"
              type="text"
              placeholder="Example: Crop substitutions"
              value="${clause.title || ""}"
            />
          </label>

          <label>
            Clause text
            <textarea
              class="custom-clause-text"
              placeholder="Example: Buyer may request crop substitutions only if approved in writing by Seller before fulfillment."
            >${clause.text || ""}</textarea>
          </label>
        `;

        customClauseList.appendChild(card);
      });
    }
  }

  setWorkspaceState("new");
  showRightMode("work");
  showRightTab("products");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function openContractReviewTab() {
  const draft = buildContractDraft();

  const savedDraft = window.LocalityDataService?.saveContractDraft
    ? window.LocalityDataService.saveContractDraft(draft)
    : draft;

  activeDraftId = savedDraft.id;

  const reviewPayload = createReviewPayloadFromDraft(savedDraft);

  sessionStorage.setItem(
    "localityContractReviewPayload",
    JSON.stringify(reviewPayload)
  );

  const reviewWindow = window.open("contract-review.html", "_blank");

  document.body.classList.add("review-tab-open");

  if (reviewWindow) {
    reviewWindow.focus();
  }
}

function addSubmittedAgreementCard() {
  const feed = document.querySelector(".contract-feed");
  if (!feed) return;

  const existing = document.getElementById("submittedAgreementCard");
  existing?.remove();

  const card = document.createElement("article");
  card.className = "contract-card submitted-agreement-card submitted-highlight";
  card.id = "submittedAgreementCard";

  card.innerHTML = `
    <div class="submitted-card-header">
      <div class="submitted-card-status">
        <span class="submitted-card-dot"></span>
        <span>Sent for review</span>
      </div>
      <strong>Sent</strong>
    </div>

    <div class="submitted-card-body">
      <div>
        <h3>Queen Creek Harvest</h3>
        <p>Flexible ordering agreement submitted.</p>
        <small>2 products · Net 15 · Supplier delivery</small>
      </div>
    </div>

    <div class="submitted-card-actions">
      <button type="button">View</button>
      <button type="button">Message</button>
    </div>
  `;

  feed.prepend(card);

  setTimeout(() => {
    card.classList.remove("submitted-highlight");
  }, 5200);
}

dismissReviewWaiting?.addEventListener("click", () => {
  document.body.classList.remove("review-tab-open");
});

reopenReviewTab?.addEventListener("click", () => {
  openContractReviewTab();
});

document.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const savedDraftCard = actionButton.closest("[data-saved-draft-id]");
  if (!savedDraftCard) return;

  event.stopPropagation();

  const draftId = savedDraftCard.dataset.savedDraftId;
  const draft = window.LocalityDataService?.getContractDraft?.(draftId);

  if (!draft) {
    alert("Saved draft could not be found.");
    return;
  }

  activeDraftId = draft.id;
  window.LocalityDataService?.setCurrentContractDraftId?.(draft.id);

  if (actionButton.dataset.action === "edit-saved-draft") {
  loadDraftIntoBuilder(draft);
  return;
}

  if (actionButton.dataset.action === "review-saved-draft") {
    const reviewPayload = createReviewPayloadFromDraft(draft);

    sessionStorage.setItem(
      "localityContractReviewPayload",
      JSON.stringify(reviewPayload)
    );

    window.open("contract-review.html", "_blank");
    return;
  }

  if (actionButton.dataset.action === "delete-saved-draft") {
    const shouldDelete = window.confirm(
      `Delete saved draft for ${draft.parties?.sellerName || "this business"}?`
    );

    if (!shouldDelete) return;

    window.LocalityDataService?.deleteContractDraft?.(draft.id);

    if (activeDraftId === draft.id) {
      activeDraftId = null;
    }

    savedDraftCard.remove();

    alert("Draft deleted.");
  }
});

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;

  const messageType = event.data?.type;

  if (messageType === "locality-review-return-edit") {
    document.body.classList.remove("review-tab-open");
  }

  if (messageType === "locality-contract-submitted") {
    document.body.classList.remove("review-tab-open");
  }

  if (messageType === "locality-contract-close-after-submit") {
    document.body.classList.remove("review-tab-open");
    sessionStorage.setItem("localitySubmittedAgreement", "true");
    window.location.href = "contracts.html?submitted=1";
  }
});

saveDraftBtn?.addEventListener("click", () => {
  const draft = buildContractDraft();

  const savedDraft = window.LocalityDataService.saveContractDraft(draft);
  activeDraftId = savedDraft.id;

  addSavedDraftCard(savedDraft);

  alert("Draft saved locally. It will stay after refresh.");
});

window.addEventListener("load", () => {
  const submitted =
    new URLSearchParams(window.location.search).get("submitted") === "1" ||
    sessionStorage.getItem("localitySubmittedAgreement") === "true";

  if (!submitted) return;

  sessionStorage.removeItem("localitySubmittedAgreement");

  setWorkspaceState("stream");

  setTimeout(() => {
    addSubmittedAgreementCard();

    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
  }, 2850);
});

document.addEventListener("click", (event) => {
  if (event.target.closest("#dismissReviewWaiting")) {
    document.body.classList.remove("review-tab-open");
  }

  if (event.target.closest("#reopenReviewTab")) {
    openContractReviewTab();
  }
});
