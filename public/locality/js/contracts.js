const workspace = document.getElementById("studioWorkspace");

const streamMode = document.getElementById("streamMode");
const contextMode = document.getElementById("contextMode");

const emptyMode = document.getElementById("emptyMode");
const viewMode = document.getElementById("viewMode");
const editMode = document.getElementById("editMode");

const editorEyebrow = document.getElementById("editorEyebrow");
const editorTitle = document.getElementById("editorTitle");
const editorSubtitle = document.getElementById("editorSubtitle");
const recipientSelect = document.getElementById("recipientSelect");

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

const businessRows = document.querySelectorAll(".business-row");
const networkSearchInput = document.getElementById("networkSearchInput");
const startDraftFromBusiness = document.getElementById("startDraftFromBusiness");
const networkListView = document.getElementById("networkListView");
const businessProfileView = document.getElementById("businessProfileView");
const backToNetwork = document.getElementById("backToNetwork");

const businessData = {
  roosevelt: {
    logo: "RR",
    type: "Buyer profile",
    name: "Roosevelt Row Market",
    meta: "Phoenix, AZ · recurring produce buyer",
    activity: "Weekly sourcing",
    focus: "Restaurants",
    note: "Often requests carrots, leafy greens, herbs, and seasonal vegetables."
  },
  mesaVerde: {
    logo: "MV",
    type: "Supplier profile",
    name: "Mesa Verde Organics",
    meta: "East Mesa, AZ · microgreens, lettuce, herbs",
    activity: "20 listed items",
    focus: "Organic produce",
    note: "Known for microgreens, lettuce, herbs, and reliable weekly availability."
  },
  arcadia: {
    logo: "AT",
    type: "Buyer profile",
    name: "Arcadia Table",
    meta: "Phoenix, AZ · restaurant group",
    activity: "Sample orders",
    focus: "Fresh herbs",
    note: "Frequently tests smaller seasonal orders before recurring agreements."
  },
  queenCreek: {
    logo: "QC",
    type: "Supplier profile",
    name: "Queen Creek Harvest",
    meta: "Queen Creek, AZ · carrots, cabbage, herbs",
    activity: "14 listed items",
    focus: "Seasonal supply",
    note: "Strong fit for carrots, cabbage, fresh herbs, and regional delivery."
  }
};

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

function setWorkspaceState(state) {
  workspace.classList.remove("state-stream", "state-view", "state-edit", "state-new");
  workspace.classList.add(`state-${state}`);

  hideAllCanvasModes();

  if (state === "stream") {
    emptyMode?.classList.remove("hidden");
    streamMode?.classList.remove("hidden");
    contextMode?.classList.add("hidden");
    showRightMode("network");
  }

  if (state === "view") {
    viewMode?.classList.remove("hidden");
    streamMode?.classList.add("hidden");
    contextMode?.classList.remove("hidden");
    showRightMode("snapshot");

    contextTitle.textContent = "Roosevelt Row Market";
    contextSubtitle.textContent = "Buyer counteroffer under review.";
  }

  if (state === "edit" || state === "new") {
    editMode?.classList.remove("hidden");
    streamMode?.classList.add("hidden");
    contextMode?.classList.remove("hidden");
    showRightMode("work");

    showRightTab("fit");
  }

  if (state === "new") {
    editorEyebrow.textContent = "New Contract";
    editorTitle.textContent = "Draft a new supply agreement";
    editorSubtitle.textContent = "Select a recipient, then add listed products and structured terms.";
    recipientSelect?.classList.remove("hidden");

    contextTitle.textContent = "Select recipient";
    contextSubtitle.textContent = "Choose the buyer this agreement will be sent to.";
  }

  if (state === "edit") {
    editorEyebrow.textContent = "Counteroffer Workspace";
    editorTitle.textContent = "Edit structured terms";
    editorSubtitle.textContent = "Use listed products and structured fields to keep the agreement clean.";
    recipientSelect?.classList.add("hidden");

    contextTitle.textContent = "Roosevelt Row Market";
    contextSubtitle.textContent = "Buyer counteroffer under review.";
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
  setWorkspaceState("stream");

  networkMode?.classList.remove("finder-pulse");
  void networkMode?.offsetWidth;
  networkMode?.classList.add("finder-pulse");
});

startDraftFromBusiness?.addEventListener("click", () => {
  cards.forEach((item) => item.classList.remove("selected"));
  setWorkspaceState("new");
  showRightTab("products");
});

document.querySelectorAll("[data-recipient]").forEach((button) => {
  button.addEventListener("click", () => {
    contextTitle.textContent = button.dataset.recipient;
    contextSubtitle.textContent = "Recipient selected for this draft agreement.";
  });
});

function updateBusinessPreview(key) {
  const business = businessData[key];
  if (!business) return;

  document.getElementById("previewLogo").textContent = business.logo;
  document.getElementById("previewType").textContent = business.type;
  document.getElementById("previewName").textContent = business.name;
  document.getElementById("previewMeta").textContent = business.meta;
  document.getElementById("previewActivity").textContent = business.activity;
  document.getElementById("previewFocus").textContent = business.focus;
  document.getElementById("previewNote").textContent = business.note;

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

document.querySelectorAll("[data-network-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-network-filter]").forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    const filter = button.dataset.networkFilter;

    businessRows.forEach((row) => {
      const visible = filter === "all" || row.dataset.type === filter;
      row.style.display = visible ? "grid" : "none";
    });
  });
});

networkSearchInput?.addEventListener("input", () => {
  const searchTerm = networkSearchInput.value.toLowerCase();

  businessRows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "grid" : "none";
  });
});

function createProductRow(product = "Red Cabbage", price = "1.90", unit = "lb") {
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

activateProductRows();
setWorkspaceState("stream");
networkListView?.classList.remove("hidden");
businessProfileView?.classList.add("hidden");
