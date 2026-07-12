/* =========================
   LOCALITY BUSINESS CENTER
========================= */

const bcPageStatus = document.getElementById("bcPageStatus");

const bcBusinessLogoImage =
  document.getElementById("bcBusinessLogoImage");

const bcBusinessLogoFallback =
  document.getElementById("bcBusinessLogoFallback");

const bcBusinessName =
  document.getElementById("bcBusinessName");

const bcBusinessMeta =
  document.getElementById("bcBusinessMeta");

const bcVisibilityChip =
  document.getElementById("bcVisibilityChip");

const bcRoleChip =
  document.getElementById("bcRoleChip");

const bcLocationChip =
  document.getElementById("bcLocationChip");

const bcAccountToggle =
  document.getElementById("bcAccountToggle");

const bcAccountMenu =
  document.getElementById("bcAccountMenu");

const bcAccountName =
  document.getElementById("bcAccountName");

const bcAccountLogoImage =
  document.getElementById("bcAccountLogoImage");

const bcAccountInitials =
  document.getElementById("bcAccountInitials");

const bcSignOutBtn =
  document.getElementById("bcSignOutBtn");

const bcAttentionList =
  document.getElementById("bcAttentionList");

const bcProductsCard =
  document.getElementById("bcProductsCard");

const sellerWorkspace =
  document.getElementById("sellerWorkspace");

const buyerWorkspace =
  document.getElementById("buyerWorkspace");

const bcSourcingJump =
  document.getElementById("bcSourcingJump");

const bcBuyerWorkspaceTitle =
  document.getElementById(
    "bcBuyerWorkspaceTitle"
  );

const bcBuyerWorkspaceDescription =
  document.getElementById(
    "bcBuyerWorkspaceDescription"
  );

const bcPurchasingPerformanceCard =
  document.getElementById(
    "bcPurchasingPerformanceCard"
  );

const bcPrimaryPerformanceTitle =
  document.getElementById(
    "bcPrimaryPerformanceTitle"
  );

const bcPrimaryPerformanceDescription =
  document.getElementById(
    "bcPrimaryPerformanceDescription"
  );

const bcPrimaryMetricOneLabel =
  document.getElementById(
    "bcPrimaryMetricOneLabel"
  );

const bcPrimaryMetricTwoLabel =
  document.getElementById(
    "bcPrimaryMetricTwoLabel"
  );

const bcPrimaryMetricThreeLabel =
  document.getElementById(
    "bcPrimaryMetricThreeLabel"
  );

const bcSourcingMapElement =
  document.getElementById("bcSourcingMap");

const bcNearbyBusinessCount =
  document.getElementById(
    "bcNearbyBusinessCount"
  );

let bcSourcingMapInstance = null;

const bcProductList =
  document.getElementById("bcProductList");

const bcProductSummary =
  document.getElementById("bcProductSummary");

const bcProfileScore =
  document.getElementById("bcProfileScore");

const bcProfileProgressBar =
  document.getElementById("bcProfileProgressBar");

const bcProfileVisibility =
  document.getElementById("bcProfileVisibility");

const bcProfileLocation =
  document.getElementById("bcProfileLocation");

const bcPublicProductCount =
  document.getElementById("bcPublicProductCount");

const bcDraftProductCount =
  document.getElementById("bcDraftProductCount");

const bcMessageRecipient =
  document.getElementById("bcMessageRecipient");

const bcMessageDraft =
  document.getElementById("bcMessageDraft");

const bcSaveMessageDraft =
  document.getElementById("bcSaveMessageDraft");

const bcDraftStatus =
  document.getElementById("bcDraftStatus");

const bcToast =
  document.getElementById("bcToast");

let currentUser = null;
let currentBusinessProfile = null;
let currentProducts = [];

function setPageStatus(message, type = "neutral") {
  if (!bcPageStatus) return;

  bcPageStatus.textContent = message;
  bcPageStatus.classList.toggle(
    "is-error",
    type === "error"
  );

  bcPageStatus.hidden = !message;
}

function parseArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return entities[character];
    }
  );
}

function getSafeImageUrl(value = "") {
  if (!value) return "";

  try {
    const url = new URL(value, window.location.origin);

    if (
      url.protocol === "http:" ||
      url.protocol === "https:"
    ) {
      return url.href;
    }
  } catch {
    return "";
  }

  return "";
}

function getInitials(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "LC"
  );
}

function formatRoleLabel(roles = []) {
  const isSeller =
    roles.includes("seller") ||
    roles.includes("buyer_seller");

  if (isSeller) {
    return "Buyer and seller";
  }

  return "Business buyer";
}

function formatCategory(value = "") {
  return String(value || "Business")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getBusinessCapabilities(profile = {}) {
  const roles = parseArray(
    profile.marketplace_roles
  );

  return {
    canBuy: true,

    canSell:
      roles.includes("seller") ||
      roles.includes("buyer_seller")
  };
}

function applyWorkspaceCapabilities(profile = {}) {
  const { canSell } =
    getBusinessCapabilities(profile);

  document.body.dataset.workspaceMode =
    canSell
      ? "seller-primary"
      : "buyer-only";

  if (sellerWorkspace) {
    sellerWorkspace.hidden = !canSell;
  }

  if (buyerWorkspace) {
    buyerWorkspace.hidden = false;

    buyerWorkspace.classList.toggle(
      "is-secondary",
      canSell
    );

    buyerWorkspace.classList.toggle(
      "is-primary",
      !canSell
    );
  }

  if (bcSourcingJump) {
    bcSourcingJump.hidden = !canSell;
  }

  document
    .querySelectorAll("[data-seller-only]")
    .forEach((element) => {
      element.hidden = !canSell;
    });

  if (bcPurchasingPerformanceCard) {
    /*
      Dual-role businesses see a separate purchasing
      overview below their seller workspace.

      Buyer-only businesses already receive purchasing
      performance in the main overview card.
    */
    bcPurchasingPerformanceCard.hidden =
      !canSell;
  }

  if (bcPrimaryPerformanceTitle) {
    bcPrimaryPerformanceTitle.textContent =
      canSell
        ? "Sales performance"
        : "Purchasing overview";
  }

  if (bcPrimaryPerformanceDescription) {
    bcPrimaryPerformanceDescription.textContent =
      canSell
        ? "Quick sales, order, and payment performance over the selected period."
        : "Quick purchasing, supplier, and delivery performance over the selected period.";
  }

  if (bcPrimaryMetricOneLabel) {
    bcPrimaryMetricOneLabel.textContent =
      canSell
        ? "Sales value"
        : "Total spend";
  }

  if (bcPrimaryMetricTwoLabel) {
    bcPrimaryMetricTwoLabel.textContent =
      canSell
        ? "Incoming orders"
        : "Purchase orders";
  }

  if (bcPrimaryMetricThreeLabel) {
    bcPrimaryMetricThreeLabel.textContent =
      canSell
        ? "Payments received"
        : "Deliveries received";
  }

  if (bcBuyerWorkspaceTitle) {
    bcBuyerWorkspaceTitle.textContent =
      canSell
        ? "Buying & sourcing"
        : "Your business sourcing workspace";
  }

  if (bcBuyerWorkspaceDescription) {
    bcBuyerWorkspaceDescription.textContent =
      canSell
        ? "Find suppliers, manage purchases, and coordinate incoming goods."
        : "Find local businesses and products, manage purchases, and coordinate incoming goods.";
  }
}

function showToast(message) {
  if (!bcToast) return;

  bcToast.textContent = message;
  bcToast.hidden = false;

  window.clearTimeout(showToast.timeoutId);

  showToast.timeoutId = window.setTimeout(() => {
    bcToast.hidden = true;
  }, 2600);
}

function renderLogo(profile) {
  const name = profile?.name || "Locality business";
  const initials = getInitials(name);
  const logoUrl = getSafeImageUrl(profile?.logo_url);

  if (bcBusinessLogoFallback) {
    bcBusinessLogoFallback.textContent = initials;
  }

  if (bcAccountInitials) {
    bcAccountInitials.textContent = initials;
  }

  if (!logoUrl) {
    bcBusinessLogoImage?.setAttribute("hidden", "");
    bcAccountLogoImage?.setAttribute("hidden", "");

    bcBusinessLogoFallback?.removeAttribute("hidden");
    bcAccountInitials?.removeAttribute("hidden");

    return;
  }

  if (bcBusinessLogoImage) {
    bcBusinessLogoImage.src = logoUrl;
    bcBusinessLogoImage.alt = `${name} logo`;
    bcBusinessLogoImage.removeAttribute("hidden");
    bcBusinessLogoFallback?.setAttribute(
      "hidden",
      ""
    );

    bcBusinessLogoImage.addEventListener(
      "error",
      () => {
        bcBusinessLogoImage.setAttribute(
          "hidden",
          ""
        );

        bcBusinessLogoFallback?.removeAttribute(
          "hidden"
        );
      },
      { once: true }
    );
  }

  if (bcAccountLogoImage) {
    bcAccountLogoImage.src = logoUrl;
    bcAccountLogoImage.alt = `${name} logo`;
    bcAccountLogoImage.removeAttribute("hidden");
    bcAccountInitials?.setAttribute("hidden", "");

    bcAccountLogoImage.addEventListener(
      "error",
      () => {
        bcAccountLogoImage.setAttribute(
          "hidden",
          ""
        );

        bcAccountInitials?.removeAttribute(
          "hidden"
        );
      },
      { once: true }
    );
  }
}

function renderBusinessIdentity(profile) {
  const roles = parseArray(
    profile.marketplace_roles
  );

  const categories = parseArray(
    profile.business_categories
  );

  const roleLabel = formatRoleLabel(roles);

  const categoryLabel = formatCategory(
    categories[0] || "business"
  );

  const visibility =
    profile.profile_visibility || "draft";

  const location =
    profile.location_label || "Location not set";

  if (bcBusinessName) {
    bcBusinessName.textContent =
      profile.name || "Your business";
  }

  if (bcBusinessMeta) {
    bcBusinessMeta.textContent =
      `${location} · ${categoryLabel}`;
  }

  if (bcAccountName) {
    bcAccountName.textContent =
      profile.name || "Business account";
  }

  if (bcRoleChip) {
    bcRoleChip.textContent = roleLabel;
  }

  if (bcVisibilityChip) {
    const isPublic = visibility === "public";

    bcVisibilityChip.textContent = isPublic
      ? "Public in Marketplace"
      : "Draft profile";

    bcVisibilityChip.classList.toggle(
      "is-public",
      isPublic
    );

    bcVisibilityChip.classList.toggle(
      "is-warning",
      !isPublic
    );
  }

  if (bcLocationChip) {
  const isConfirmed =
    profile.location_confirmed === true;

  bcLocationChip.textContent = isConfirmed
    ? "Location confirmed"
    : "Location needs confirmation";

  bcLocationChip.classList.toggle(
    "is-warning",
    !isConfirmed
  );
}

renderLogo(profile);
applyWorkspaceCapabilities(profile);
}

function getPublicProducts() {
  return currentProducts.filter(
    (product) =>
      product.visibility === "public"
  );
}

function getDraftProducts() {
  return currentProducts.filter(
    (product) =>
      product.visibility !== "public"
  );
}

function renderProducts() {
  const publicProducts = getPublicProducts();
  const draftProducts = getDraftProducts();

  if (bcPublicProductCount) {
    bcPublicProductCount.textContent =
      String(publicProducts.length);
  }

  if (bcDraftProductCount) {
    bcDraftProductCount.textContent =
      String(draftProducts.length);
  }

  if (bcProductSummary) {
    bcProductSummary.textContent =
      `${publicProducts.length} public · ${draftProducts.length} draft`;
  }

  if (!bcProductList) return;

  if (!currentProducts.length) {
    bcProductList.innerHTML = `
      <div class="bc-empty-state">
        <strong>No products created yet</strong>
        <span>
          Add your first product to begin building your public supply page.
        </span>
      </div>
    `;

    return;
  }

  const sortedProducts = [
    ...currentProducts
  ].sort((productA, productB) => {
    if (
      productA.visibility !==
      productB.visibility
    ) {
      return productA.visibility === "public"
        ? -1
        : 1;
    }

    return (
      Number(productA.sort_order || 0) -
      Number(productB.sort_order || 0)
    );
  });

  bcProductList.innerHTML =
    sortedProducts
      .slice(0, 4)
      .map((product) => {
        const imageUrl =
          getSafeImageUrl(product.image_url);

        const category =
          formatCategory(product.category);

        const isPublic =
          product.visibility === "public";

        return `
          <div class="bc-product-row">
            <div class="bc-product-image">
              ${
                imageUrl
                  ? `
                    <img
                      src="${escapeHtml(imageUrl)}"
                      alt="${escapeHtml(
                        product.name || "Product"
                      )}"
                    />
                  `
                  : escapeHtml(category)
              }
            </div>

            <div>
              <strong>
                ${escapeHtml(
                  product.name ||
                    "Unnamed product"
                )}
              </strong>

              <small>
                ${escapeHtml(
                  product.availability_status ||
                    category
                )}
              </small>
            </div>

            <span class="bc-product-state ${
              isPublic ? "" : "is-draft"
            }">
              ${isPublic ? "Public" : "Draft"}
            </span>
          </div>
        `;
      })
      .join("");
}

function renderProfileStatus(profile) {
  const score = Number(
    profile.profile_completion_score || 0
  );

  if (bcProfileScore) {
    bcProfileScore.textContent =
      `${score}% complete`;
  }

  if (bcProfileProgressBar) {
    bcProfileProgressBar.style.width =
      `${Math.max(
        0,
        Math.min(score, 100)
      )}%`;
  }

  if (bcProfileVisibility) {
    bcProfileVisibility.textContent =
      profile.profile_visibility === "public"
        ? "Public"
        : "Draft";
  }

  if (bcProfileLocation) {
    bcProfileLocation.textContent =
      profile.location_confirmed === true
        ? "Confirmed"
        : "Needs confirmation";
  }
}

function buildAttentionItems(profile) {
  const items = [];

  const publicProducts = getPublicProducts();
  const roles = parseArray(
    profile.marketplace_roles
  );

  const isSeller =
    roles.includes("seller") ||
    roles.includes("buyer_seller");

  if (profile.profile_visibility !== "public") {
    items.push({
      type: "warning",
      title: "Profile is still a draft",
      detail:
        "Publish the profile when it is ready to appear in Marketplace."
    });
  }

  if (profile.location_confirmed !== true) {
    items.push({
      type: "warning",
      title: "Confirm the business location",
      detail:
        "A confirmed map location helps buyers find your business."
    });
  }

  const score = Number(
    profile.profile_completion_score || 0
  );

  if (score < 80) {
    items.push({
      type: "warning",
      title: `Profile is ${score}% complete`,
      detail:
        "Complete the remaining profile sections to strengthen your public presence."
    });
  }

  if (isSeller && !publicProducts.length) {
    items.push({
      type: "danger",
      title: "No public products",
      detail:
        "Publish at least one product so buyers can discover current supply."
    });
  }

  if (!items.length) {
    items.push({
      type: "success",
      title: "Your business presence looks ready",
      detail:
        "No immediate profile or product issues were detected."
    });
  }

  return items;
}

function renderAttention(profile) {
  if (!bcAttentionList) return;

  const items = buildAttentionItems(profile);

  bcAttentionList.innerHTML = items
    .map(
      (item) => `
        <div class="bc-attention-item is-${item.type}">
          <span class="bc-attention-dot"></span>

          <div>
            <strong>
              ${escapeHtml(item.title)}
            </strong>

            <span>
              ${escapeHtml(item.detail)}
            </span>
          </div>
        </div>
      `
    )
    .join("");
}

function getMessageDraftKey() {
  if (!currentUser || !currentBusinessProfile) {
    return null;
  }

  return [
    "locality-business-message-draft",
    currentUser.id,
    currentBusinessProfile.id
  ].join(":");
}

function restoreMessageDraft() {
  const key = getMessageDraftKey();

  if (!key) return;

  try {
    const savedDraft = JSON.parse(
      localStorage.getItem(key)
    );

    if (!savedDraft) return;

    if (bcMessageRecipient) {
      bcMessageRecipient.value =
        savedDraft.recipient || "";
    }

    if (bcMessageDraft) {
      bcMessageDraft.value =
        savedDraft.message || "";
    }

    if (bcDraftStatus) {
      bcDraftStatus.textContent =
        "A locally saved draft was restored.";
    }
  } catch {
    // Ignore malformed local drafts.
  }
}

function saveMessageDraft() {
  const key = getMessageDraftKey();

  if (!key) {
    showToast(
      "Business information is still loading."
    );
    return;
  }

  const recipient =
    bcMessageRecipient?.value.trim() || "";

  const message =
    bcMessageDraft?.value.trim() || "";

  if (!recipient && !message) {
    if (bcDraftStatus) {
      bcDraftStatus.textContent =
        "Enter a recipient or message first.";
    }

    return;
  }

  localStorage.setItem(
    key,
    JSON.stringify({
      recipient,
      message,
      savedAt: new Date().toISOString()
    })
  );

  if (bcDraftStatus) {
    bcDraftStatus.textContent =
      "Draft saved on this device.";
  }

  showToast("Message draft saved.");
}

function toggleAccountMenu() {
  if (!bcAccountMenu || !bcAccountToggle) {
    return;
  }

  const willOpen = bcAccountMenu.hidden;

  bcAccountMenu.hidden = !willOpen;

  bcAccountToggle.setAttribute(
    "aria-expanded",
    String(willOpen)
  );
}

function closeAccountMenu() {
  if (!bcAccountMenu || !bcAccountToggle) {
    return;
  }

  bcAccountMenu.hidden = true;

  bcAccountToggle.setAttribute(
    "aria-expanded",
    "false"
  );
}

async function handleSignOut() {
  if (!window.LocalityAuthService?.signOut) {
    showToast("Sign-out service is unavailable.");
    return;
  }

  const { error } =
    await window.LocalityAuthService.signOut();

  if (error) {
    console.error("Sign-out error:", error);
    showToast("Unable to sign out.");
    return;
  }

  window.location.href = "index.html";
}

function hasValidCoordinates(profile = {}) {
  return (
    Number.isFinite(Number(profile.latitude)) &&
    Number.isFinite(Number(profile.longitude))
  );
}

function calculateDistanceMiles(
  latitudeOne,
  longitudeOne,
  latitudeTwo,
  longitudeTwo
) {
  const earthRadiusMiles = 3958.8;

  const toRadians = (value) =>
    (Number(value) * Math.PI) / 180;

  const latitudeDifference =
    toRadians(latitudeTwo - latitudeOne);

  const longitudeDifference =
    toRadians(longitudeTwo - longitudeOne);

  const firstLatitude =
    toRadians(latitudeOne);

  const secondLatitude =
    toRadians(latitudeTwo);

  const calculation =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    2 *
    earthRadiusMiles *
    Math.asin(Math.sqrt(calculation))
  );
}

async function initializeSourcingMap(profile) {
  if (
    !bcSourcingMapElement ||
    !window.L
  ) {
    return;
  }

  if (bcSourcingMapInstance) {
    bcSourcingMapInstance.remove();
    bcSourcingMapInstance = null;
  }

  const hasBusinessLocation =
    hasValidCoordinates(profile);

  const businessLatitude =
    hasBusinessLocation
      ? Number(profile.latitude)
      : 33.4484;

  const businessLongitude =
    hasBusinessLocation
      ? Number(profile.longitude)
      : -112.074;

  bcSourcingMapInstance = window.L.map(
    bcSourcingMapElement,
    {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false,
      attributionControl: true
    }
  ).setView(
    [businessLatitude, businessLongitude],
    hasBusinessLocation ? 10 : 9
  );

  window.L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 18,
      attribution:
        "&copy; OpenStreetMap contributors"
    }
  ).addTo(bcSourcingMapInstance);

  const visibleCoordinates = [];

  if (hasBusinessLocation) {
    window.L.circleMarker(
      [businessLatitude, businessLongitude],
      {
        radius: 9,
        color: "#ffffff",
        weight: 4,
        fillColor: "#08c464",
        fillOpacity: 1
      }
    )
      .addTo(bcSourcingMapInstance)
      .bindTooltip(
        `${profile.name || "Your business"} · Your location`
      );

    visibleCoordinates.push([
      businessLatitude,
      businessLongitude
    ]);
  }

  let nearbyProfiles = [];

  const publicProfileMethod =
    window.LocalityProfileService
      ?.getPublicMarketplaceProfiles;

  if (publicProfileMethod) {
    const { data, error } =
      await publicProfileMethod();

    if (error) {
      console.warn(
        "Unable to load nearby businesses:",
        error
      );
    } else {
      nearbyProfiles = (data || [])
        .filter((candidate) => {
          if (
            candidate.id === profile.id ||
            !hasValidCoordinates(candidate)
          ) {
            return false;
          }

          if (!hasBusinessLocation) {
            return true;
          }

          const distance =
            calculateDistanceMiles(
              businessLatitude,
              businessLongitude,
              Number(candidate.latitude),
              Number(candidate.longitude)
            );

          return distance <= 50;
        })
        .slice(0, 25);
    }
  }

  nearbyProfiles.forEach((candidate) => {
    const latitude =
      Number(candidate.latitude);

    const longitude =
      Number(candidate.longitude);

    window.L.circleMarker(
      [latitude, longitude],
      {
        radius: 6,
        color: "#ffffff",
        weight: 3,
        fillColor: "#d69a22",
        fillOpacity: 0.94
      }
    )
      .addTo(bcSourcingMapInstance)
      .bindTooltip(
        candidate.name || "Local business"
      );

    visibleCoordinates.push([
      latitude,
      longitude
    ]);
  });

  if (bcNearbyBusinessCount) {
    if (!hasBusinessLocation) {
      bcNearbyBusinessCount.textContent =
        "Confirm your location to see nearby businesses.";
    } else {
      bcNearbyBusinessCount.textContent =
        `${nearbyProfiles.length} public ${
          nearbyProfiles.length === 1
            ? "business"
            : "businesses"
        } within approximately 50 miles`;
    }
  }

  if (visibleCoordinates.length > 1) {
    bcSourcingMapInstance.fitBounds(
      visibleCoordinates,
      {
        padding: [28, 28],
        maxZoom: 11
      }
    );
  }

  window.setTimeout(() => {
    bcSourcingMapInstance?.invalidateSize();
  }, 150);
}

function attachBusinessCenterEvents() {
  bcAccountToggle?.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
      toggleAccountMenu();
    }
  );

  bcAccountMenu?.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
    }
  );

  document.addEventListener(
    "click",
    closeAccountMenu
  );

  bcSignOutBtn?.addEventListener(
    "click",
    handleSignOut
  );

  bcSaveMessageDraft?.addEventListener(
    "click",
    saveMessageDraft
  );

  document
  .querySelectorAll(
    "[data-performance-period]"
  )
  .forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        document
          .querySelectorAll(
            "[data-performance-period]"
          )
          .forEach((periodButton) => {
            periodButton.classList.remove(
              "is-active"
            );
          });

        button.classList.add("is-active");

        showToast(
          "Performance periods will connect after Orders and Payments are built."
        );
      }
    );
  });

  document
    .querySelectorAll(
      "[data-business-coming-soon]"
    )
    .forEach((element) => {
      element.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          showToast(
            element.dataset
              .businessComingSoon ||
              "This tool is being prepared."
          );
        }
      );
    });
}

async function loadBusinessCenter() {
  setPageStatus(
    "Loading your business workspace..."
  );

  if (
    !window.LocalityAuthService
      ?.getCurrentUser ||
    !window.LocalityProfileService
      ?.getMyPrimaryBusinessProfile ||
    !window.LocalityProductService
      ?.getProductsForBusinessProfile
  ) {
    setPageStatus(
      "Required Locality services are unavailable. Check the page script order.",
      "error"
    );

    return;
  }

  currentUser =
    await window.LocalityAuthService
      .getCurrentUser();

  if (!currentUser) {
    window.location.href = "account.html";
    return;
  }

  const profileResult =
    await window.LocalityProfileService
      .getMyPrimaryBusinessProfile();

  if (
    profileResult.error ||
    !profileResult.data
  ) {
    console.error(
      "Business profile load error:",
      profileResult.error
    );

    window.location.href = "signup.html";
    return;
  }

  currentBusinessProfile =
    profileResult.data;

  const productResult =
    await window.LocalityProductService
      .getProductsForBusinessProfile(
        currentBusinessProfile.id
      );

  if (productResult.error) {
    console.error(
      "Business products load error:",
      productResult.error
    );

    currentProducts = [];
  } else {
    currentProducts =
      productResult.data || [];
  }

  renderBusinessIdentity(
    currentBusinessProfile
  );

  renderProducts();

  renderProfileStatus(
    currentBusinessProfile
  );

  renderAttention(
    currentBusinessProfile
  );

  await initializeSourcingMap(
  currentBusinessProfile
  );

  restoreMessageDraft();

  setPageStatus("");
}

function initializeBusinessCenter() {
  attachBusinessCenterEvents();
  loadBusinessCenter();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeBusinessCenter
  );
} else {
  initializeBusinessCenter();
}
