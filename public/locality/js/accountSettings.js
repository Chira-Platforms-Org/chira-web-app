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

const settingsEditLocationBtn =
  document.getElementById("settingsEditLocationBtn");

const settingsFulfillmentOther =
  document.getElementById("settingsFulfillmentOther");

const settingsUnsavedModal =
  document.getElementById("settingsUnsavedModal");

const settingsUnsavedList =
  document.getElementById("settingsUnsavedList");

const settingsStayBtn =
  document.getElementById("settingsStayBtn");

const settingsSaveAndLeaveBtn =
  document.getElementById("settingsSaveAndLeaveBtn");

const settingsLeaveWithoutSavingBtn =
  document.getElementById("settingsLeaveWithoutSavingBtn");

const settingsLoginEmail =
  document.getElementById("settingsLoginEmail");

const settingsLogoutBtn =
  document.getElementById("settingsLogoutBtn");

let currentUser = null;
let currentBusinessProfile = null;
let settingsMap = null;

let settingsSavedMarker = null;
let settingsServiceCircle = null;
let locationEditMode = false;

let dirtySections = new Set();
let pendingNavigationHref = null;
let isProgrammaticRender = false;

const SETTINGS_SECTION_LABELS = {
  "business-details": "Business details",
  "marketplace-visibility": "Marketplace visibility",
  "map-service-area": "Map & service area"
};


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

function formatAddressForInput(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return [
      value.street,
      value.address,
      value.city,
      value.state,
      value.zip,
      value.postal_code
    ]
      .filter(Boolean)
      .join(", ");
  }

  return String(value);
}

function getCheckedFulfillmentMethods() {
  return [
    ...document.querySelectorAll(
      'input[name="settingsFulfillmentMethods"]:checked'
    )
  ].map((input) => input.value);
}

function setCheckedFulfillmentMethods(methods = []) {
  const normalized = Array.isArray(methods)
    ? methods
    : [];

  document
    .querySelectorAll(
      'input[name="settingsFulfillmentMethods"]'
    )
    .forEach((input) => {
      input.checked =
        normalized.includes(input.value);
    });
}

function formatSavedTime() {
  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
  ).format(new Date());
}

function getSectionActions(sectionKey) {
  return document.querySelector(
    `[data-settings-actions="${sectionKey}"]`
  );
}

function getSectionSaveState(sectionKey) {
  return document.querySelector(
    `[data-save-state="${sectionKey}"]`
  );
}

function getSectionNav(sectionKey) {
  return document.querySelector(
    `[data-settings-nav="${sectionKey}"]`
  );
}

function setSectionDirty(sectionKey, dirty = true) {
  if (isProgrammaticRender) return;

  const section =
    document.getElementById(sectionKey);

  const actions =
    getSectionActions(sectionKey);

  const state =
    getSectionSaveState(sectionKey);

  if (dirty) {
    dirtySections.add(sectionKey);

    section?.classList.add("has-unsaved");
    getSectionNav(sectionKey)
      ?.classList.add("has-unsaved");

    if (actions) {
      actions.hidden = false;
    }

    const button =
      actions?.querySelector(
        'button[type="submit"]'
      );

    if (button) {
      button.hidden = false;
    }

    if (state) {
      state.hidden = false;
      state.classList.add("is-unsaved");
      state.classList.remove("is-saved");
      state.textContent = "Unsaved changes";
    }

    return;
  }

  dirtySections.delete(sectionKey);

  section?.classList.remove("has-unsaved");
  getSectionNav(sectionKey)
    ?.classList.remove("has-unsaved");
}

function markSectionSaved(sectionKey) {
  const actions =
    getSectionActions(sectionKey);

  const state =
    getSectionSaveState(sectionKey);

  const button =
    actions?.querySelector(
      'button[type="submit"]'
    );

  setSectionDirty(sectionKey, false);

  if (actions) {
    actions.hidden = false;
  }

  if (button) {
    button.hidden = true;
  }

  if (state) {
    state.hidden = false;
    state.classList.remove("is-unsaved");
    state.classList.add("is-saved");
    state.textContent =
      `✓ Saved on ${formatSavedTime()}`;
  }
}

function getDirtySectionLabels() {
  return [...dirtySections].map(
    (key) =>
      SETTINGS_SECTION_LABELS[key] || key
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
      locationEditMode
        ? `Selected pin: ${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`
        : currentBusinessProfile?.location_confirmed
          ? "Saved business map location"
          : "Location has not been confirmed yet.";
  }
}

function getServiceRadiusMeters() {
  const miles =
    Number(settingsServiceRadius?.value) ||
    Number(currentBusinessProfile?.service_radius_miles) ||
    25;

  return miles * 1609.344;
}

function clearMapLocationLayers() {
  if (settingsSavedMarker) {
    settingsMap?.removeLayer(settingsSavedMarker);
    settingsSavedMarker = null;
  }

  if (settingsServiceCircle) {
    settingsMap?.removeLayer(settingsServiceCircle);
    settingsServiceCircle = null;
  }
}

function renderServiceAreaCircle(center) {
  if (!settingsMap || !center) return;

  if (settingsServiceCircle) {
    settingsMap.removeLayer(settingsServiceCircle);
    settingsServiceCircle = null;
  }

  settingsServiceCircle = window.L.circle(
    [center.lat, center.lng],
    {
      radius: getServiceRadiusMeters(),
      color: "#08c464",
      weight: 1,
      opacity: 0.35,
      fillColor: "#08c464",
      fillOpacity: 0.08
    }
  ).addTo(settingsMap);
}

function renderSavedLocationLayers(profile = {}) {
  if (
    !settingsMap ||
    !window.LocalityMarketplaceVisibility
      ?.hasValidCoordinates?.(profile)
  ) {
    return;
  }

  clearMapLocationLayers();

  const lat =
    Number(profile.latitude);

  const lng =
    Number(profile.longitude);

  settingsSavedMarker = window.L.marker(
    [lat, lng],
    {
      interactive: false,
      icon: window.L.divIcon({
        className: "",
        html: `
          <div class="settings-saved-map-pin">
            <span></span>
          </div>
        `,
        iconSize: [42, 58],
        iconAnchor: [21, 58]
      })
    }
  ).addTo(settingsMap);

  renderServiceAreaCircle({
    lat,
    lng
  });
}

function setLocationEditMode(enabled) {
  locationEditMode = enabled;

  const mapWrap =
    settingsLocationMapElement?.closest(
      ".settings-map-wrap"
    );

  mapWrap?.classList.toggle(
    "is-editing",
    enabled
  );

  document
    .querySelector(".settings-fixed-map-pin")
    ?.toggleAttribute(
      "hidden",
      !enabled
    );

  if (settingsEditLocationBtn) {
    settingsEditLocationBtn.textContent =
      enabled
        ? "Editing map pin"
        : "Edit map pin";
  }

  if (enabled) {
    clearMapLocationLayers();

    const lat =
      Number(currentBusinessProfile?.latitude) ||
      33.4484;

    const lng =
      Number(currentBusinessProfile?.longitude) ||
      -112.074;

    settingsMap?.setView([lat, lng], 13);
    setSectionDirty("map-service-area", true);
    updateCoordinatePreview();
    return;
  }

  renderSavedLocationLayers(
    currentBusinessProfile
  );
  updateCoordinatePreview();
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
     formatAddressForInput(profile.address);
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

   setCheckedFulfillmentMethods(
     profile.fulfillment_methods || []
   );
   
   if (settingsFulfillmentOther) {
     settingsFulfillmentOther.value =
       profile.fulfillment_other || "";
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

   settingsMap.on("move", () => {
     if (locationEditMode) {
       updateCoordinatePreview();
     }
   });
   
   settingsMap.on("moveend", () => {
     if (locationEditMode) {
       updateCoordinatePreview();
     }
   });

  window.setTimeout(() => {
   settingsMap?.invalidateSize();
   renderSavedLocationLayers(profile);
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
     "Business details saved.",
     "business-details"
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
     "Marketplace visibility settings saved.",
     "marketplace-visibility"
   );
}

async function saveLocationSettings(event) {
  event.preventDefault();

  const hasSavedCoordinates =
    window.LocalityMarketplaceVisibility
      ?.hasValidCoordinates?.(
        currentBusinessProfile
      );

  const center = locationEditMode
    ? getMapCenter()
    : hasSavedCoordinates
      ? {
          lat: Number(currentBusinessProfile.latitude),
          lng: Number(currentBusinessProfile.longitude)
        }
      : getMapCenter();

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
        settingsLocationNotes?.value.trim() || "",
      fulfillment_methods:
        getCheckedFulfillmentMethods(),
      fulfillment_other:
        settingsFulfillmentOther?.value.trim() || ""
   };

   await saveProfileUpdates(
     updates,
     "Map, service area, and fulfillment options saved.",
     "map-service-area"
   );
   
   setLocationEditMode(false);
}

async function saveProfileUpdates(
  updates,
  successMessage,
  sectionKey = null
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

  if (sectionKey) {
  markSectionSaved(sectionKey);
  }

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

function setupDirtyTracking() {
  [
    {
      form: businessDetailsForm,
      section: "business-details"
    },
    {
      form: marketplaceVisibilityForm,
      section: "marketplace-visibility"
    },
    {
      form: locationSettingsForm,
      section: "map-service-area"
    }
  ].forEach(({ form, section }) => {
    form?.addEventListener("input", () =>
      setSectionDirty(section, true)
    );

    form?.addEventListener("change", () =>
      setSectionDirty(section, true)
    );
  });
}

function showUnsavedModal(href) {
  pendingNavigationHref = href;

  if (settingsUnsavedList) {
    settingsUnsavedList.innerHTML =
      getDirtySectionLabels()
        .map((label) => `<li>${label}</li>`)
        .join("");
  }

  settingsUnsavedModal.hidden = false;
}

function hideUnsavedModal() {
  settingsUnsavedModal.hidden = true;
  pendingNavigationHref = null;
}

async function saveDirtySections() {
  const sections =
    [...dirtySections];

  for (const section of sections) {
    if (section === "business-details") {
      await saveBusinessDetails({
        preventDefault() {}
      });
    }

    if (section === "marketplace-visibility") {
      await saveMarketplaceVisibility({
        preventDefault() {}
      });
    }

    if (section === "map-service-area") {
      await saveLocationSettings({
        preventDefault() {}
      });
    }
  }
}

function setupLeaveProtection() {
  window.addEventListener(
    "beforeunload",
    (event) => {
      if (!dirtySections.size) return;

      event.preventDefault();
      event.returnValue = "";
    }
  );

  document.addEventListener(
    "click",
    (event) => {
      const link =
        event.target.closest("a[href]");

      if (!link || !dirtySections.size) {
        return;
      }

      const href =
        link.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        link.target === "_blank"
      ) {
        return;
      }

      event.preventDefault();
      showUnsavedModal(link.href);
    }
  );

  settingsStayBtn?.addEventListener(
    "click",
    hideUnsavedModal
  );

  settingsLeaveWithoutSavingBtn
    ?.addEventListener(
      "click",
      () => {
        const href = pendingNavigationHref;
        hideUnsavedModal();

        if (href) {
          window.location.href = href;
        }
      }
    );

  settingsSaveAndLeaveBtn
    ?.addEventListener(
      "click",
      async () => {
        const href = pendingNavigationHref;

        await saveDirtySections();

        hideUnsavedModal();

        if (href) {
          window.location.href = href;
        }
      }
    );
}

function clearSectionSaveState(sectionKey) {
  const actions =
    getSectionActions(sectionKey);

  const state =
    getSectionSaveState(sectionKey);

  const button =
    actions?.querySelector(
      'button[type="submit"]'
    );

  setSectionDirty(sectionKey, false);

  if (actions) {
    actions.hidden = true;
  }

  if (button) {
    button.hidden = false;
  }

  if (state) {
    state.hidden = true;
    state.classList.remove(
      "is-unsaved",
      "is-saved"
    );
    state.textContent = "";
  }
}

function resetSectionChanges(sectionKey) {
  if (!currentBusinessProfile) return;

  isProgrammaticRender = true;

  if (sectionKey === "business-details") {
    renderBusinessDetails(currentBusinessProfile);
  }

  if (sectionKey === "marketplace-visibility") {
    renderBusinessDetails(currentBusinessProfile);
    renderMarketplaceVisibility(
      currentBusinessProfile
    );
  }

  if (sectionKey === "map-service-area") {
    renderBusinessDetails(currentBusinessProfile);
    setLocationEditMode(false);
  }

  isProgrammaticRender = false;

  clearSectionSaveState(sectionKey);
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

  settingsEditLocationBtn?.addEventListener(
  "click",
  () => {
    setLocationEditMode(true);
  }
);

   settingsServiceRadius?.addEventListener(
     "change",
     () => {
       setSectionDirty("map-service-area", true);
     }
   );
   document
  .querySelectorAll("[data-cancel-section]")
  .forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        resetSectionChanges(
          button.dataset.cancelSection
        );
      }
    );
  });
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
   
   isProgrammaticRender = true;
   
   renderSidebar(currentBusinessProfile);
   renderBusinessDetails(currentBusinessProfile);
   renderMarketplaceVisibility(
     currentBusinessProfile
   );
   
   isProgrammaticRender = false;
   
   initSettingsMap(currentBusinessProfile);
   
   setSettingsStatus("");
}

function initializeAccountSettings() {
  setupSectionNavigation();
  attachSettingsEvents();
  setupDirtyTracking();
  setupLeaveProtection();
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
