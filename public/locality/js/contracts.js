/* =========================
   LOCALITY CONTRACT WORKSPACE
========================= */

const workspace = document.getElementById("contractWorkspace");
const panels = document.querySelectorAll(".contract-panel");
const orderCards = document.querySelectorAll(".order-card");

const contractTitle = document.getElementById("contractTitle");

const reviewModal = document.getElementById("contractReviewModal");
const openReviewModal = document.getElementById("openReviewModal");
const closeReviewModal = document.getElementById("closeReviewModal");
const closeReviewModalAlt = document.getElementById("closeReviewModalAlt");

const demoOrders = {
  arcadia: "Arcadia Table proposal",
  mesa: "Mesa Fresh Market order",
  roosevelt: "Roosevelt Row request",
  scottsdale: "Scottsdale Grocer contract"
};

function setWorkspaceFocus(panelName) {
  if (!workspace) return;

  workspace.classList.remove("focus-orders", "focus-builder", "focus-intelligence");
  workspace.classList.add(`focus-${panelName}`);

  panels.forEach((panel) => {
    panel.classList.toggle("active-focus", panel.dataset.panel === panelName);
  });
}

panels.forEach((panel) => {
  panel.addEventListener("click", () => {
    setWorkspaceFocus(panel.dataset.panel);
  });
});

orderCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    event.stopPropagation();

    orderCards.forEach((item) => item.classList.remove("active"));
    card.classList.add("active");

    const orderKey = card.dataset.order;
    if (contractTitle && demoOrders[orderKey]) {
      contractTitle.textContent = demoOrders[orderKey];
    }

    setWorkspaceFocus("builder");
  });
});

openReviewModal?.addEventListener("click", () => {
  reviewModal?.classList.add("active");
});

function closeReview() {
  reviewModal?.classList.remove("active");
}

closeReviewModal?.addEventListener("click", closeReview);
closeReviewModalAlt?.addEventListener("click", closeReview);

reviewModal?.addEventListener("click", (event) => {
  if (event.target === reviewModal) {
    closeReview();
  }
});
