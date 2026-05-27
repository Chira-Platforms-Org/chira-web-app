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
const openReviewModal = document.getElementById("openReviewModal");
const closeReviewModal = document.getElementById("closeReviewModal");
const keepEditingBtn = document.getElementById("keepEditingBtn");

function hideAllCanvasModes() {
  emptyMode.classList.add("hidden");
  viewMode.classList.add("hidden");
  editMode.classList.add("hidden");
}

function setWorkspaceState(state) {
  workspace.classList.remove("state-stream", "state-view", "state-edit", "state-new");
  workspace.classList.add(`state-${state}`);

  hideAllCanvasModes();

  if (state === "stream") {
    emptyMode.classList.remove("hidden");
    streamMode.classList.remove("hidden");
    contextMode.classList.add("hidden");
  }

  if (state === "view") {
    viewMode.classList.remove("hidden");
    streamMode.classList.add("hidden");
    contextMode.classList.remove("hidden");
  }

  if (state === "edit" || state === "new") {
    editMode.classList.remove("hidden");
    streamMode.classList.add("hidden");
    contextMode.classList.remove("hidden");
  }

  if (state === "new") {
    editorEyebrow.textContent = "New Contract";
    editorTitle.textContent = "Draft a new supply agreement";
    editorSubtitle.textContent = "Start by selecting a recipient, then add products and structured terms.";
    recipientSelect.classList.remove("hidden");

    contextTitle.textContent = "Select recipient";
    contextSubtitle.textContent = "Choose the buyer this agreement will be sent to.";
  }

  if (state === "edit") {
    editorEyebrow.textContent = "Counteroffer Workspace";
    editorTitle.textContent = "Edit structured terms";
    editorSubtitle.textContent = "Only the active product row expands into editable controls.";
    recipientSelect.classList.add("hidden");

    contextTitle.textContent = "Roosevelt Row Market";
    contextSubtitle.textContent = "Buyer counteroffer under review.";
  }
}

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

newContractBtn.addEventListener("click", () => {
  cards.forEach((item) => item.classList.remove("selected"));
  setWorkspaceState("new");
});

document.querySelectorAll("[data-recipient]").forEach((button) => {
  button.addEventListener("click", () => {
    contextTitle.textContent = button.dataset.recipient;
    contextSubtitle.textContent = "Recipient selected for this draft agreement.";
  });
});

function activateProductRows() {
  document.querySelectorAll(".product-row").forEach((row) => {
    row.addEventListener("click", () => {
      document.querySelectorAll(".product-row").forEach((item) => item.classList.remove("active"));
      row.classList.add("active");
    });
  });

  document.querySelectorAll(".remove-row-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const row = button.closest(".product-row");
      if (document.querySelectorAll(".product-row").length > 1) {
        row.remove();
      }
    });
  });
}

addProductRow.addEventListener("click", () => {
  const row = document.createElement("div");
  row.className = "product-row active";

  document.querySelectorAll(".product-row").forEach((item) => item.classList.remove("active"));

  row.innerHTML = `
    <div class="product-summary">
      <strong>Red Cabbage</strong>
      <span>50 lb · $1.90/lb · Weekly</span>
      <button class="remove-row-btn">Remove</button>
    </div>

    <div class="product-fields">
      <label>
        Product
        <select>
          <option>Red Cabbage</option>
          <option>Rainbow Carrots</option>
          <option>Heirloom Tomatoes</option>
          <option>Fresh Herbs</option>
        </select>
      </label>

      <label>
        Quantity
        <div class="split-field">
          <input type="number" value="50" />
          <select>
            <option>lb</option>
            <option>oz</option>
            <option>kg</option>
            <option>crate</option>
            <option>case</option>
          </select>
        </div>
      </label>

      <label>
        Price
        <div class="price-field">
          <span>$</span>
          <input type="number" step="0.01" value="1.90" />
          <small>per</small>
          <select>
            <option>lb</option>
            <option>crate</option>
            <option>case</option>
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
});

openReviewModal?.addEventListener("click", () => {
  reviewModal.classList.add("active");
});

function closeReview() {
  reviewModal.classList.remove("active");
}

closeReviewModal?.addEventListener("click", closeReview);
keepEditingBtn?.addEventListener("click", closeReview);

reviewModal?.addEventListener("click", (event) => {
  if (event.target === reviewModal) closeReview();
});

activateProductRows();
setWorkspaceState("stream");
