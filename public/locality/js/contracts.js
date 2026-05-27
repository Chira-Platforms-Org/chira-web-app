const contractItems = document.querySelectorAll(".contract-item");
const canvasMode = document.getElementById("canvasMode");
const canvasTitle = document.getElementById("canvasTitle");
const canvasSubtitle = document.getElementById("canvasSubtitle");
const newContractBtn = document.getElementById("newContractBtn");
const addProductBtn = document.getElementById("addProductBtn");
const productRows = document.getElementById("productRows");

const reviewModal = document.getElementById("finalReviewModal");
const openReviewModal = document.getElementById("openReviewModal");
const closeReviewModal = document.getElementById("closeReviewModal");
const keepEditingBtn = document.getElementById("keepEditingBtn");

const contractStates = {
  roosevelt: {
    mode: "Needs review",
    title: "Roosevelt Row Market counteroffer",
    subtitle: "Review changed terms, adjust your response, or message the buyer with a contract reference."
  },
  arcadia: {
    mode: "Pending response",
    title: "Arcadia Table proposal",
    subtitle: "Your proposal is waiting for buyer review. You can still revise or message before acceptance."
  },
  mesa: {
    mode: "Draft",
    title: "Mesa Fresh Market draft",
    subtitle: "Continue building this draft before sending it for review."
  },
  scottsdale: {
    mode: "Accepted",
    title: "Scottsdale Grocer agreement",
    subtitle: "This contract has been accepted and is ready to connect with fulfillment operations."
  },
  cancelled: {
    mode: "Closed",
    title: "Arcadia Table cancelled proposal",
    subtitle: "This proposal was cancelled and is available for reference only."
  }
};

contractItems.forEach((item) => {
  item.addEventListener("click", () => {
    contractItems.forEach((card) => card.classList.remove("active"));
    item.classList.add("active");

    const state = contractStates[item.dataset.contract];
    if (!state) return;

    canvasMode.textContent = state.mode;
    canvasTitle.textContent = state.title;
    canvasSubtitle.textContent = state.subtitle;
  });
});

newContractBtn?.addEventListener("click", () => {
  contractItems.forEach((card) => card.classList.remove("active"));

  canvasMode.textContent = "New proposal";
  canvasTitle.textContent = "Draft a new supply agreement";
  canvasSubtitle.textContent =
    "Start by selecting a buyer, then add structured products, quantities, cadence, and delivery terms.";
});

addProductBtn?.addEventListener("click", () => {
  const row = document.createElement("div");
  row.className = "product-contract-row";
  row.innerHTML = `
    <label>
      Product
      <select>
        <option>Red Cabbage</option>
        <option>Rainbow Carrots</option>
        <option>Heirloom Tomatoes</option>
        <option>Black Tuscan Kale</option>
      </select>
    </label>

    <label>
      Quantity
      <div class="split-input">
        <input value="50" />
        <select>
          <option>lb</option>
          <option>oz</option>
          <option>kg</option>
          <option>g</option>
          <option>crate</option>
          <option>case</option>
          <option>custom</option>
        </select>
      </div>
    </label>

    <label>
      Price
      <div class="price-input">
        <span>$</span>
        <input value="1.90" />
        <small>per</small>
        <select>
          <option>lb</option>
          <option>crate</option>
          <option>case</option>
          <option>unit</option>
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
  `;

  productRows.appendChild(row);
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
