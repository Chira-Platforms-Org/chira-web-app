const workspace = document.getElementById("studioWorkspace");
const cards = document.querySelectorAll(".contract-card");

const emptyCanvas = document.getElementById("emptyCanvas");
const viewMode = document.getElementById("viewMode");
const editMode = document.getElementById("editMode");

const newContractBtn = document.getElementById("newContractBtn");
const openReviewModal = document.getElementById("openReviewModal");
const reviewModal = document.getElementById("finalReviewModal");
const closeReviewModal = document.getElementById("closeReviewModal");
const keepEditingBtn = document.getElementById("keepEditingBtn");

function setState(state) {
  workspace.classList.remove("state-stream", "state-view", "state-edit", "state-new");
  workspace.classList.add(`state-${state}`);

  emptyCanvas.classList.add("hidden");
  viewMode.classList.add("hidden");
  editMode.classList.add("hidden");

  if (state === "stream") {
    emptyCanvas.classList.remove("hidden");
  }

  if (state === "view") {
    viewMode.classList.remove("hidden");
  }

  if (state === "edit" || state === "new") {
    editMode.classList.remove("hidden");
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

      if (action === "view") setState("view");
      if (action === "edit") setState("edit");
      if (action === "message") alert("Messaging workspace placeholder");
    });
  });
});

document.querySelectorAll("[data-open-edit]").forEach((button) => {
  button.addEventListener("click", () => setState("edit"));
});

newContractBtn?.addEventListener("click", () => {
  cards.forEach((item) => item.classList.remove("selected"));
  setState("new");
});

document.querySelectorAll(".product-row").forEach((row) => {
  row.addEventListener("click", () => {
    document.querySelectorAll(".product-row").forEach((item) => item.classList.remove("active"));
    row.classList.add("active");
  });
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

setState("stream");
