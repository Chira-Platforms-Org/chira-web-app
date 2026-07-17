/* =========================
   LOCALITY ACCOUNT SETTINGS
========================= */

const settingsPageStatus =
  document.getElementById("settingsPageStatus");

const settingsSidebarLogo =
  document.getElementById("settingsSidebarLogo");

const settingsSidebarInitials =
  document.getElementById("settingsSidebarInitials");

const settingsSidebarName =
  document.getElementById("settingsSidebarName");

const settingsSidebarMeta =
  document.getElementById("settingsSidebarMeta");

const businessDetailsForm =
  document.getElementById("businessDetailsForm");

const marketplaceVisibilityForm =
  document.getElementById("marketplaceVisibilityForm");

const locationSettingsForm =
  document.getElementById("locationSettingsForm");

const settingsBusinessName =
  document.getElementById("settingsBusinessName");

const settingsLocationLabel =
  document.getElementById("settingsLocationLabel");

const settingsBusinessCategory =
  document.getElementById("settingsBusinessCategory");

const settingsWebsite =
  document.getElementById("settingsWebsite");

const settingsContactEmail =
  document.getElementById("settingsContactEmail");

const settingsPhone =
  document.getElementById("settingsPhone");

const settingsAddress =
  document.getElementById("settingsAddress");

const settingsShortIntro =
  document.getElementById("settingsShortIntro");

const settingsCanSell =
  document.getElementById("settingsCanSell");

const settingsMarketplaceStatus =
  document.getElementById("settingsMarketplaceStatus");

const settingsVisibilityChecklist =
  document.getElementById("settingsVisibilityChecklist");

const settingsSupplierOutreach =
  document.getElementById("settingsSupplierOutreach");

const settingsLocationMapElement =
  document.getElementById("settingsLocationMap");

const settingsCoordinatePreview =
  document.getElementById("settingsCoordinatePreview");

const settingsMapLocationLabel =
  document.getElementById("settingsMapLocationLabel");

const settingsServiceRadius =
  document.getElementById("settingsServiceRadius");

const settingsAddressVisibility =
  document.getElementById("settingsAddressVisibility");

const settingsLocationNotes =
  document.getElementById("settingsLocationNotes");

const settingsResetMapBtn =
  document.getElementById("settingsResetMapBtn");

const settingsLoginEmail =
  document.getElementById("settingsLoginEmail");

const settingsLogoutBtn =
  document.getElementById("settingsLogoutBtn");

let currentUser = null;
let currentBusinessProfile = null;
let settingsMap = null;

function setSettingsStatus(
  message,
  type = "neutral"
) {
  if (!settingsPageStatus) return;

  settingsPageStatus.textContent = message;
  settingsPageStatus.hidden = !message;

  settingsPageStatus.classList.toggle(
    "is-error",
    type === "error"
  );
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

function getInitials(name = "") {
  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return (
    words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "LC"
  );
}

function getSafeImageUrl(value = "") {
  if (!value) return "";

  try {
    const url = new URL(
      value,
      window.location.origin
    );

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

function formatCategory(value = "") {
  return String(value || "Business")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function hasSellerRole(profile = {}) {
  const roles = parseArray(
    profile.marketplace_roles
  );

  return (
    roles.includes("seller") ||
    roles.includes("buyer_seller")
  );
}

function getMarketplaceStatus(profile = {}) {
  return window.LocalityMarketplaceVisibility
    ?.getStatus
    ? window.LocalityMarketplaceVisibility.getStatus(
        profile
      )
    : {
        label: "Checking status",
        visible: false,
        tone: "neutral",
        detail: ""
      };
}

function getVisibilityRequirements(profile = {}) {
  return window.LocalityMarketplaceVisibility
    ?.getRequirements
    ? window.LocalityMarketplaceVisibility.getRequirements(
        profile
      )
    : [];
}

function getMapCenter() {
  if (settingsMap) {
    return settingsMap.getCenter();
  }

  if (
    window.LocalityMarketplaceVisibility
      ?.hasValidCoordinates?.(
        currentBusinessProfile
      )
  ) {
    return {
      lat: Number(currentBusinessProfile.latitude),
      lng: Number(currentBusinessProfile.longitude)
    };
  }

  return {
    lat: 33.4484,
    lng: -112.074
  };
}

function updateCoordinatePreview() {
  const center = getMapCenter();

  if (settingsCoordinatePreview) {
    settingsCoordinatePreview.textContent =
      `Selected pin: ${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`;
  }
}

function renderSidebar(profile = {}) {
  const name =
    profile.name || "Business account";

  const category =
    formatCategory(
      parseArray(
        profile.business_categories
      )[0] || "business"
    );

  if (settingsSidebarName) {
    settingsSidebarName.textContent = name;
  }

  if (settingsSidebarMeta) {
    settingsSidebarMeta.textContent =
      `${profile.location_label || "Location not set"} · ${category}`;
  }

  if (settingsSidebarInitials) {
    settingsSidebarInitials.textContent =
      getInitials(name);
  }

  const logoUrl =
    getSafeImageUrl(profile.logo_url);

  if (!logoUrl || !settingsSidebarLogo) {
    settingsSidebarLogo?.setAttribute(
      "hidden",
      ""
    );

    settingsSidebarInitials
      ?.removeAttribute("hidden");

    return;
  }

  settingsSidebarLogo.src = logoUrl;
  settingsSidebarLogo.alt = `${name} logo`;
  settingsSidebarLogo.removeAttribute(
    "hidden"
  );

  settingsSidebarInitials?.setAttribute(
    "hidden",
    ""
  );
}

function renderBusinessDetails(profile = {}) {
  const categories =
    parseArray(profile.business_categories);

  if (settingsBusinessName) {
    settingsBusinessName.value =
      profile.name || "";
  }

  if (settingsLocationLabel) {
    settingsLocationLabel.value =
      profile.location_label || "";
  }

  if (settingsMapLocationLabel) {
    settingsMapLocationLabel.value =
      profile.location_label || "";
  }

  if (settingsBusinessCategory) {
    settingsBusinessCategory.value =
      categories[0] || "other";
  }

  if (settingsWebsite) {
    settingsWebsite.value =
      profile.website || "";
  }

  if (settingsContactEmail) {
    settingsContactEmail.value =
      profile.contact_email || "";
  }

  if (settingsPhone) {
    settingsPhone.value =
      profile.phone || "";
  }

  if (settingsAddress) {
    settingsAddress.value =
      profile.address || "";
  }

  if (settingsShortIntro) {
    settingsShortIntro.value =
      profile.short_intro ||
      profile.description ||
      "";
  }

  if (settingsCanSell) {
    settingsCanSell.checked =
      hasSellerRole(profile);
  }

  const visibility =
    profile.profile_visibility || "draft";

  document
    .querySelectorAll(
      'input[name="settingsProfileVisibility"]'
    )
    .forEach((input) => {
      input.checked =
        input.value === visibility;
    });

  if (settingsSupplierOutreach) {
    settingsSupplierOutreach.checked =
      profile.supplier_outreach_enabled !== false;
  }

  if (settingsServiceRadius) {
    settingsServiceRadius.value =
      String(
        profile.service_radius_miles || 25
      );
  }

  if (settingsAddressVisibility) {
    settingsAddressVisibility.value =
      profile.address_visibility ||
      "area_only";
  }

  if (settingsLocationNotes) {
    settingsLocationNotes.value =
      profile.location_notes || "";
  }

  if (settingsLoginEmail) {
    settingsLoginEmail.textContent =
      currentUser?.email || "Unavailable";
  }
}

function renderMarketplaceVisibility(profile = {}) {
  const status =
    getMarketplaceStatus(profile);

  if (settingsMarketplaceStatus) {
    settingsMarketplaceStatus.textContent =
      status.label;

    settingsMarketplaceStatus.classList.toggle(
      "is-success",
      status.tone === "success"
    );

    settingsMarketplaceStatus.classList.toggle(
      "is-warning",
      status.tone === "warning"
    );

    settingsMarketplaceStatus.classList.toggle(
      "is-danger",
      status.tone === "danger"
    );
  }

  if (settingsVisibilityChecklist) {
    settingsVisibilityChecklist.innerHTML =
      getVisibilityRequirements(profile)
        .map(
          (requirement) => `
            <div
              class="settings-requirement-row ${
                requirement.met
                  ? "is-complete"
                  : ""
              }"
            >
              ${requirement.label}
            </div>
          `
        )
        .join("");
  }
}

function initSettingsMap(profile = {}) {
  if (
    !settingsLocationMapElement ||
    !window.L
  ) {
    return;
  }

  if (settingsMap) {
    settingsMap.remove();
    settingsMap = null;
  }

  const hasCoordinates =
    window.LocalityMarketplaceVisibility
      ?.hasValidCoordinates?.(profile);

  const startLat =
    hasCoordinates
      ? Number(profile.latitude)
      : 33.4484;

  const startLng =
    hasCoordinates
      ? Number(profile.longitude)
      : -112.074;

  settingsMap = window.L.map(
    settingsLocationMapElement,
    {
      zoomControl: true,
      attributionControl: true
    }
  ).setView(
    [startLat, startLng],
    hasCoordinates ? 13 : 10
  );

  window.L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        "&copy; OpenStreetMap contributors"
    }
  ).addTo(settingsMap);

  settingsMap.on(
    "move",
    updateCoordinatePreview
  );

  settingsMap.on(
    "moveend",
    updateCoordinatePreview
  );

  window.setTimeout(() => {
    settingsMap?.invalidateSize();
    updateCoordinatePreview();
  }, 150);
}

async function saveBusinessDetails(event) {
  event.preventDefault();

  const canSell =
    settingsCanSell?.checked === true;

  const updates = {
    name:
      settingsBusinessName?.value.trim() || "",
    location_label:
      settingsLocationLabel?.value.trim() || "",
    business_categories: [
      settingsBusinessCategory?.value || "other"
    ],
    marketplace_roles: canSell
      ? ["buyer_seller"]
      : ["buyer"],
    website:
      settingsWebsite?.value.trim() || "",
    contact_email:
      settingsContactEmail?.value.trim() || "",
    phone:
      settingsPhone?.value.trim() || "",
    address:
      settingsAddress?.value.trim() || "",
    short_intro:
      settingsShortIntro?.value.trim() || ""
  };

  await saveProfileUpdates(
    updates,
    "Business details saved."
  );
}

async function saveMarketplaceVisibility(event) {
  event.preventDefault();

  const visibilityInput =
    document.querySelector(
      'input[name="settingsProfileVisibility"]:checked'
    );

  const updates = {
    profile_visibility:
      visibilityInput?.value || "draft",
    supplier_outreach_enabled:
      settingsSupplierOutreach?.checked !== false
  };

  await saveProfileUpdates(
    updates,
    "Marketplace visibility settings saved."
  );
}

async function saveLocationSettings(event) {
  event.preventDefault();

  const center = getMapCenter();

  const updates = {
    latitude: center.lat,
    longitude: center.lng,
    location_confirmed: true,
    location_confirmed_at:
      new Date().toISOString(),
    location_label:
      settingsMapLocationLabel?.value.trim() ||
      settingsLocationLabel?.value.trim() ||
      currentBusinessProfile.location_label ||
      "",
    service_radius_miles:
      Number(settingsServiceRadius?.value) || 25,
    address_visibility:
      settingsAddressVisibility?.value ||
      "area_only",
    location_notes:
      settingsLocationNotes?.value.trim() || ""
  };

  await saveProfileUpdates(
    updates,
    "Location confirmed and saved."
  );
}

async function saveProfileUpdates(
  updates,
  successMessage
) {
  if (
    !currentBusinessProfile ||
    !window.LocalityProfileService
      ?.updateBusinessProfile
  ) {
    setSettingsStatus(
      "Business profile is not ready yet.",
      "error"
    );
    return;
  }

  setSettingsStatus("Saving changes...");

  const { data, error } =
    await window.LocalityProfileService
      .updateBusinessProfile(
        currentBusinessProfile.id,
        updates
      );

  if (error) {
    console.error(
      "Account settings save error:",
      error
    );

    setSettingsStatus(
      "Unable to save changes. Check the console for details.",
      "error"
    );

    return;
  }

  currentBusinessProfile =
    data || {
      ...currentBusinessProfile,
      ...updates
    };

  renderSidebar(currentBusinessProfile);
  renderBusinessDetails(currentBusinessProfile);
  renderMarketplaceVisibility(
    currentBusinessProfile
  );

  setSettingsStatus(successMessage);
}

function setupSectionNavigation() {
  const navItems = [
    ...document.querySelectorAll(
      "[data-settings-nav]"
    )
  ];

  const sections = [
    ...document.querySelectorAll(
      "[data-settings-section]"
    )
  ];

  navItems.forEach((item) => {
    item.addEventListener(
      "click",
      (event) => {
        event.preventDefault();

        const id =
          item.dataset.settingsNav;

        document
          .getElementById(id)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
      }
    );
  });

  const observer =
    new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio -
              a.intersectionRatio
          )[0];

        if (!visibleEntry) return;

        const id =
          visibleEntry.target.id;

        navItems.forEach((item) => {
          item.classList.toggle(
            "is-active",
            item.dataset.settingsNav === id
          );
        });
      },
      {
        root: null,
        threshold: [0.2, 0.45, 0.7],
        rootMargin: "-18% 0px -60% 0px"
      }
    );

  sections.forEach((section) =>
    observer.observe(section)
  );
}

async function handleLogout() {
  const { error } =
    await window.LocalityAuthService.signOut();

  if (error) {
    setSettingsStatus(
      "Unable to log out.",
      "error"
    );

    return;
  }

  window.location.href = "index.html";
}

function attachSettingsEvents() {
  businessDetailsForm?.addEventListener(
    "submit",
    saveBusinessDetails
  );

  marketplaceVisibilityForm
    ?.addEventListener(
      "submit",
      saveMarketplaceVisibility
    );

  locationSettingsForm?.addEventListener(
    "submit",
    saveLocationSettings
  );

  settingsResetMapBtn?.addEventListener(
    "click",
    () => {
      const lat =
        Number(currentBusinessProfile?.latitude) ||
        33.4484;

      const lng =
        Number(currentBusinessProfile?.longitude) ||
        -112.074;

      settingsMap?.setView([lat, lng], 13);
    }
  );

  settingsLogoutBtn?.addEventListener(
    "click",
    handleLogout
  );
}

async function loadAccountSettings() {
  setSettingsStatus(
    "Loading account settings..."
  );

  if (
    !window.LocalityAuthService
      ?.getCurrentUser ||
    !window.LocalityProfileService
      ?.getMyPrimaryBusinessProfile
  ) {
    setSettingsStatus(
      "Required Locality services are unavailable.",
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
      "Unable to load account settings profile:",
      profileResult.error
    );

    window.location.href = "signup.html";
    return;
  }

  currentBusinessProfile =
    profileResult.data;

  renderSidebar(currentBusinessProfile);
  renderBusinessDetails(currentBusinessProfile);
  renderMarketplaceVisibility(
    currentBusinessProfile
  );
  initSettingsMap(currentBusinessProfile);

  setSettingsStatus("");
}

function initializeAccountSettings() {
  setupSectionNavigation();
  attachSettingsEvents();
  loadAccountSettings();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeAccountSettings
  );
} else {
  initializeAccountSettings();
}
