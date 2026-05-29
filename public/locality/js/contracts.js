const workspace = document.getElementById("studioWorkspace");

const streamMode = document.getElementById("streamMode");
const contextMode = document.getElementById("contextMode");

const emptyMode = document.getElementById("emptyMode");
const viewMode = document.getElementById("viewMode");
const editMode = document.getElementById("editMode");

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

const reviewModal = document.getElementById("finalReviewModal");
const closeReviewModal = document.getElementById("closeReviewModal");
const keepEditingBtn = document.getElementById("keepEditingBtn");

const networkMode = document.getElementById("networkMode");
const snapshotMode = document.getElementById("snapshotMode");
const workPanelMode = document.getElementById("workPanelMode");
const dealFitTab = document.getElementById("dealFitTab");
const productsTab = document.getElementById("productsTab");

let businessRows = [];
let selectedBusinessKey = null;
let selectedBusinessName = null;
const networkSearchInput = document.getElementById("networkSearchInput");
const startDraftFromBusiness = document.getElementById("startDraftFromBusiness");
const networkListView = document.getElementById("networkListView");
const businessProfileView = document.getElementById("businessProfileView");
const backToNetwork = document.getElementById("backToNetwork");

const profileData = Array.isArray(profiles) ? profiles : [];

function renderBusinessList(filter = "all", searchTerm = "") {
  const businessList = document.getElementById("businessList");
  if (!businessList) return;

  const normalizedSearch = searchTerm.toLowerCase();

  const visibleProfiles = profileData.filter((profile) => {
    const role = profile.type === "farm" ? "supplier" : "buyer";
    const matchesFilter = filter === "all" || filter === role;

    const searchableText = [
      profile.name,
      profile.type,
      profile.product,
      profile.location,
      profile.productType,
      profile.description,
      profile.demandNeed
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
      const logoClass = profile.type === "farm" ? "green-logo" : "";

      return `
        <button class="business-row ${index === 0 ? "selected" : ""}" 
                data-business="${key}" 
                data-type="${profile.type === "farm" ? "supplier" : "buyer"}">
          <span class="business-logo small-logo ${logoClass}">
            ${getProfileInitials(profile)}
          </span>
          <div>
            <strong>${profile.name}</strong>
            <small>${role} · ${profile.location || "Phoenix region"} · ${profile.product || "Local network profile"}</small>
          </div>
        </button>
      `;
    })
    .join("");

  businessRows = document.querySelectorAll(".business-row");

  businessRows.forEach((row) => {
    row.addEventListener("click", () => {
      businessRows.forEach((item) => item.classList.remove("selected"));
      row.classList.add("selected");
      updateBusinessPreview(row.dataset.business);
    });
  });
}

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

function getProfileRole(profile) {
  return profile.type === "farm" ? "Supplier" : "Buyer";
}

function getProfileFocus(profile) {
  if (profile.type === "farm") {
    return profile.product || profile.productType || "Local supply";
  }

  return profile.demandNeed || profile.product || "Local sourcing";
}

function getProfileActivity(profile) {
  if (profile.type === "farm") {
    const count = profile.productsAvailable?.length || 0;
    return count > 0 ? `${count} listed items` : "Supplier profile";
  }

  return profile.orderFrequency || "Buyer profile";
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
  const match = priceString.match(/\$?([\d.]+)\s*\/?\s*([a-zA-Z]+)?/);

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
  }

  setWorkspaceState("new");
  showRightMode("work");
  showRightTab("products");

  if (profile) {
    contextTitle.textContent = profile.name;
    contextSubtitle.textContent = "Recipient selected for this draft agreement.";
    renderProfileProducts(profile);
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

startDraftFromBusiness?.addEventListener("click", () => {
  cards.forEach((item) => item.classList.remove("selected"));
  beginContractForSelectedBusiness();
});

document.querySelectorAll("[data-recipient]").forEach((button) => {
  button.addEventListener("click", () => {
    contextTitle.textContent = button.dataset.recipient;
    contextSubtitle.textContent = "Recipient selected for this draft agreement.";
  });
});

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

businessRows.forEach((row) => {
  row.addEventListener("click", () => {
    businessRows.forEach((item) => item.classList.remove("selected"));
    row.classList.add("selected");
    updateBusinessPreview(row.dataset.business);
  });
});

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
    profile.productsAvailable ||
    profile.availableProducts ||
    profile.products ||
    profile.listings ||
    []
  );
}

function renderProfileProducts(profile) {
  const productLists = document.querySelectorAll(".profile-product-list");
  if (!productLists.length || !profile) return;

  const products = getProfileProducts(profile);

  const productHTML = products.length
    ? products
        .map((product) => {
          const parsed = parsePrice(product.price || product.listedPrice || product.unitPrice || "");

          const productName =
            product.name ||
            product.product ||
            product.label ||
            "Listed product";

          const productPrice =
            product.price ||
            product.listedPrice ||
            product.unitPrice ||
            "Price not listed";

          const productNote =
            product.note ||
            product.status ||
            product.availability ||
            "Available";

          return `
            <button class="profile-product"
                    data-product="${productName}"
                    data-price="${parsed.amount}"
                    data-unit="${parsed.unit}">
              <div>
                <strong>${productName}</strong>
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

  productList.innerHTML = products
    .slice(0, 8)
    .map((product) => {
      const parsed = parsePrice(product.price);

      return `
        <button class="profile-product"
                data-product="${product.name}"
                data-price="${parsed.amount}"
                data-unit="${parsed.unit}">
          <div>
            <strong>${product.name}</strong>
            <span>${product.price} · ${product.note || "Available"}</span>
          </div>
          <em>Add</em>
        </button>
      `;
    })
    .join("");

  attachProfileProductListeners();
}

function attachProfileProductListeners() {
  document.querySelectorAll(".profile-product").forEach((button) => {
    button.addEventListener("click", () => {
      createProductRow(
        button.dataset.product,
        button.dataset.price,
        button.dataset.unit
      );

      if (!selectedBusinessName && selectedBusinessKey) {
        const profile = getProfileByKey(selectedBusinessKey);
        selectedBusinessName = profile?.name || null;
      }

      setWorkspaceState("new");
      showRightMode("work");
      showRightTab("products");
    });
  });
}

function createProductRow(product = "Red Cabbage", price = "1.90", unit = "lb") {
  setEmptyProductState(false);
  const row = document.createElement("div");
  row.className = "product-row active";

  document.querySelectorAll(".product-row").forEach((item) => item.classList.remove("active"));

  row.innerHTML = `
    <div class="product-summary">
      <strong>${product}</strong>
      <span>50 ${unit} · $${price}/${unit} · Weekly</span>
      <button class="remove-row-btn" type="button">Remove</button>
    </div>

    <div class="product-fields">
      <label>
        Product
        <select>
          <option ${product === "Rainbow Carrots" ? "selected" : ""}>Rainbow Carrots</option>
          <option ${product === "Red Cabbage" ? "selected" : ""}>Red Cabbage</option>
          <option ${product === "Fresh Herbs" ? "selected" : ""}>Fresh Herbs</option>
          <option ${product === "Heirloom Tomatoes" ? "selected" : ""}>Heirloom Tomatoes</option>
        </select>
      </label>

      <label>
        Quantity
        <div class="split-field">
          <input type="number" value="50" />
          <select>
            <option ${unit === "lb" ? "selected" : ""}>lb</option>
            <option ${unit === "oz" ? "selected" : ""}>oz</option>
            <option ${unit === "kg" ? "selected" : ""}>kg</option>
            <option ${unit === "crate" ? "selected" : ""}>crate</option>
            <option ${unit === "case" ? "selected" : ""}>case</option>
            <option ${unit === "bundle" ? "selected" : ""}>bundle</option>
          </select>
        </div>
      </label>

      <label>
        Price
        <div class="price-field">
          <span>$</span>
          <input type="number" step="0.01" value="${price}" />
          <small>per</small>
          <select>
            <option ${unit === "lb" ? "selected" : ""}>lb</option>
            <option ${unit === "crate" ? "selected" : ""}>crate</option>
            <option ${unit === "case" ? "selected" : ""}>case</option>
            <option ${unit === "bundle" ? "selected" : ""}>bundle</option>
          </select>
        </div>
      </label>

      <label>
        Cadence
        <select>
          <option>Weekly</option>
          <option>Bi-weekly</option>
          <option>Monthly</option>
          <option>One-time</option>
        </select>
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
  createProductRow();
});

document.querySelectorAll(".profile-product").forEach((button) => {
  button.addEventListener("click", () => {
    createProductRow(
      button.dataset.product,
      button.dataset.price,
      button.dataset.unit
    );
  });
});

document.addEventListener("click", (event) => {
  if (event.target?.id === "openReviewModal") {
    reviewModal?.classList.add("active");
  }
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
