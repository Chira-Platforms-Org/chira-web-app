/* =========================
   LOCALITY SIGNUP FLOW
   Account -> Business -> Profile -> Workspace
========================= */

const accountStep = document.getElementById("accountStep");
const accountTypeStep = document.getElementById("accountTypeStep");
const accountTypeChoiceButtons = document.querySelectorAll("[data-account-type-choice]");
const businessStep = document.getElementById("businessStep");
const profileStep = document.getElementById("profileStep");
const completionStep = document.getElementById("completionStep");

const signupStatus = document.getElementById("signupStatus");
const profileSummaryText = document.getElementById("profileSummaryText");

const resumeDraftOpenBtn = document.getElementById("resumeDraftOpenBtn");
const resumeDraftModal = document.getElementById("resumeDraftModal");
const resumeDraftCloseBtn = document.getElementById("resumeDraftCloseBtn");
const resumeDraftEmail = document.getElementById("resumeDraftEmail");
const resumeDraftPassword = document.getElementById("resumeDraftPassword");
const resumeDraftSubmitBtn = document.getElementById("resumeDraftSubmitBtn");
const resumeDraftStatus = document.getElementById("resumeDraftStatus");

const fullNameInput = document.getElementById("fullNameInput");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");

const personalPhoneInput = document.getElementById("personalPhoneInput");

const notifyDirectContacts = document.getElementById("notifyDirectContacts");
const notifyProfileInteractions = document.getElementById("notifyProfileInteractions");
const notifyOperationalReminders = document.getElementById("notifyOperationalReminders");
const notifyLocalityUpdates = document.getElementById("notifyLocalityUpdates");

const businessNameInput = document.getElementById("businessNameInput");
const businessEmailInput = document.getElementById("businessEmailInput");
const businessPhoneInput = document.getElementById("businessPhoneInput");
const marketplaceRoleInput = document.getElementById("marketplaceRoleInput");
const businessCategoryInput = document.getElementById("businessCategoryInput");
const websiteInput = document.getElementById("websiteInput");
const productFocusInput = document.getElementById("productFocusInput");

const personalBuyerModeInput = document.getElementById("personalBuyerModeInput");
const businessFieldsShell = document.getElementById("businessFieldsShell");
const businessStepHelperText = document.getElementById("businessStepHelperText");
const businessSetupSubmit = document.getElementById("businessSetupSubmit");
const enterWorkspaceLink = document.getElementById("enterWorkspaceLink");

const locationStep = document.getElementById("locationStep");
const streetAddressInput = document.getElementById("streetAddressInput");
const addressLine2Input = document.getElementById("addressLine2Input");
const cityInput = document.getElementById("cityInput");
const stateInput = document.getElementById("stateInput");
const zipInput = document.getElementById("zipInput");
const countryInput = document.getElementById("countryInput");
const locationStepTitle = document.getElementById("locationStepTitle");
const locationStepHelperText = document.getElementById("locationStepHelperText");
const locationBackBtn = document.getElementById("locationBackBtn");
const locationSetupSubmit = document.getElementById("locationSetupSubmit");
const secondaryCompletionLink = document.getElementById("secondaryCompletionLink");

const logoUrlInput = document.getElementById("logoUrlInput");
const bannerImageUrlInput = document.getElementById("bannerImageUrlInput");
const socialLinkInput = document.getElementById("socialLinkInput");
const businessDescriptionInput = document.getElementById("businessDescriptionInput");
const profileVisibilityInput = document.getElementById("profileVisibilityInput");

const logoFileInput = document.getElementById("logoFileInput");
const bannerFileInput = document.getElementById("bannerFileInput");
const galleryFileInput = document.getElementById("galleryFileInput");

const logoUploadBtn = document.getElementById("logoUploadBtn");
const bannerUploadBtn = document.getElementById("bannerUploadBtn");
const galleryUploadBtn = document.getElementById("galleryUploadBtn");

const logoPreviewImage = document.getElementById("logoPreviewImage");
const bannerPreviewImage = document.getElementById("bannerPreviewImage");
const logoPlaceholder = document.getElementById("logoPlaceholder");
const bannerPlaceholder = document.getElementById("bannerPlaceholder");
const galleryPreviewGrid = document.getElementById("galleryPreviewGrid");

const builderBusinessName = document.getElementById("builderBusinessName");
const builderBusinessMeta = document.getElementById("builderBusinessMeta");
const builderRoleChip = document.getElementById("builderRoleChip");
const builderCategoryChip = document.getElementById("builderCategoryChip");
const builderContactChip = document.getElementById("builderContactChip");

const shortIntroInput = document.getElementById("shortIntroInput");
const aboutUsInput = document.getElementById("aboutUsInput");
const orderingGuidelinesInput = document.getElementById("orderingGuidelinesInput");
const farmingPracticesInput = document.getElementById("farmingPracticesInput");

const shortIntroCount = document.getElementById("shortIntroCount");
const aboutUsCount = document.getElementById("aboutUsCount");
const orderingGuidelinesCount = document.getElementById("orderingGuidelinesCount");
const farmingPracticesCount = document.getElementById("farmingPracticesCount");

const customCertificationInput = document.getElementById("customCertificationInput");
const addCustomCertificationBtn = document.getElementById("addCustomCertificationBtn");
const selectedCertificationsList = document.getElementById("selectedCertificationsList");

const saveProfileDraftBtn = document.getElementById("saveProfileDraftBtn");
const profileBuilderStatus = document.getElementById("profileBuilderStatus");
const profileCompletionPercent = document.getElementById("profileCompletionPercent");
const profileCompletionBar = document.getElementById("profileCompletionBar");
const profileCompletionList = document.getElementById("profileCompletionList");

let profileGalleryImages = [];
let customCertifications = [];
let profileSectionStatus = {};

let createdUser = null;

const ONBOARDING_ACCOUNT_PATH_KEY = "locality_onboarding_account_path";
let selectedAccountPath = localStorage.getItem(ONBOARDING_ACCOUNT_PATH_KEY) || null;

const startProfileBuilderBtn = document.getElementById("startProfileBuilderBtn");
const skipProfileBuilderBtn = document.getElementById("skipProfileBuilderBtn");
const ONBOARDING_PROFILE_ID_KEY = "locality_onboarding_business_profile_id";
let activeBusinessProfileId = localStorage.getItem(ONBOARDING_PROFILE_ID_KEY) || null;

function setStep(stepNumber) {
  document.querySelectorAll(".signup-step").forEach((step) => {
    step.classList.toggle("active", step.dataset.step === String(stepNumber));
  });

  document.querySelectorAll("[data-step-indicator]").forEach((indicator) => {
    const indicatorStep = Number(indicator.dataset.stepIndicator);

    indicator.classList.toggle("active", indicatorStep === stepNumber);
    indicator.classList.toggle("complete", indicatorStep < stepNumber);
  });
}

function setStatus(element, message, status = "default") {
  if (!element) return;

  element.textContent = message;

  if (status === "default") {
    element.removeAttribute("data-status");
  } else {
    element.dataset.status = status;
  }
}

function getMarketplaceRoles(value) {
  if (value === "buyer_seller") return ["buyer", "seller"];
  return [value];
}

function getCleanValue(input) {
  return input?.value?.trim() || "";
}

function setAccountPath(path) {
  selectedAccountPath = path;

  if (path) {
    localStorage.setItem(ONBOARDING_ACCOUNT_PATH_KEY, path);
  } else {
    localStorage.removeItem(ONBOARDING_ACCOUNT_PATH_KEY);
  }

  applyLocationStepMode();
}

function isPrivateBuyerPath() {
  return selectedAccountPath === "personal_buyer";
}

function getBusinessAccountTypeFromRole(role) {
  if (role === "buyer") return "business_buyer";
  if (role === "buyer_seller") return "business_buyer_seller";
  return "business_seller";
}

function applyLocationStepMode() {
  const privateBuyer = isPrivateBuyerPath();

  if (locationStepTitle) {
    locationStepTitle.textContent = privateBuyer
      ? "Where should we show local food near you?"
      : "Confirm your business location";
  }

  if (locationStepHelperText) {
    locationStepHelperText.textContent = privateBuyer
      ? "Add your general location so Locality can show nearby farms, markets, products, and local food options. You can update this anytime."
      : "Locality uses your location to place your business in the regional network and help nearby buyers understand where you operate.";
  }

  if (locationBackBtn) {
    locationBackBtn.dataset.backStep = privateBuyer ? "2" : "3";
    locationBackBtn.textContent = privateBuyer ? "Back to account type" : "Back to business";
  }

  if (locationSetupSubmit) {
    locationSetupSubmit.textContent = privateBuyer
      ? "Finish setup"
      : "Continue";
  }

  if (streetAddressInput) {
    streetAddressInput.placeholder = privateBuyer
      ? "Street address optional for now"
      : "123 Main Street";
  }
}

function setCompletionForPrivateBuyer(displayName) {
  if (profileSummaryText) {
    profileSummaryText.textContent =
      `${displayName || "Your"} Locality account is ready. You can explore local products, save farms, manage orders, and update your preferences from My Locality.`;
  }

  if (enterWorkspaceLink) {
    enterWorkspaceLink.href = "my-locality.html";
    enterWorkspaceLink.textContent = "Go to My Locality";
  }

  if (secondaryCompletionLink) {
    secondaryCompletionLink.href = "map.html";
    secondaryCompletionLink.textContent = "Explore marketplace";
  }
}

async function updateUserProfile(updates = {}) {
  const user = await getSignedInUserOrRedirect();

  if (!user) {
    return { data: null, error: "No authenticated user." };
  }

  const { data, error } = await window.LocalitySupabase
    .from("user_profiles")
    .upsert({
      id: user.id,
      ...updates,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  return { data, error };
}

async function savePrivateBuyerLocation() {
  const user = await getSignedInUserOrRedirect();

  if (!user) {
    return { data: null, error: "No authenticated user." };
  }

  const address = buildAddressPayload();
  const locationLabel = formatLocationLabel(address);

  if (!address.city) {
    return { data: null, error: "Please enter your city." };
  }

  if (!address.state || address.state.length !== 2) {
    return { data: null, error: "Please enter a valid 2-letter state abbreviation." };
  }

  if (!address.zip_code || !/^\d{5}(-\d{4})?$/.test(address.zip_code)) {
    return { data: null, error: "Please enter a valid ZIP code." };
  }

  const displayName = getCleanValue(fullNameInput) || user.email || "Locality buyer";

  const { data, error } = await window.LocalitySupabase
    .from("user_profiles")
    .upsert({
      id: user.id,
      full_name: displayName,
      buyer_display_name: displayName,
      phone: getPhoneDigits(personalPhoneInput?.value) || null,
      locality_account_type: "personal_buyer",
      buyer_location_label: locationLabel,
      buyer_city: address.city,
      buyer_state: address.state,
      buyer_zip_code: address.zip_code,
      buyer_address: address,
      buyer_radius_miles: 25,
      buyer_interests: [],
      onboarding_completed: true,
      onboarding_step: "personal_buyer_ready",
      notification_preferences: buildNotificationPreferences(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  return { data, error };
}

function isPersonalBuyerMode() {
  return Boolean(personalBuyerModeInput?.checked);
}

function applyPersonalBuyerMode() {
  const personalMode = isPersonalBuyerMode();

  businessFieldsShell?.classList.toggle("is-disabled", personalMode);

  businessFieldsShell
    ?.querySelectorAll("input, select, textarea")
    .forEach((field) => {
      field.disabled = personalMode;
    });

  if (businessStepHelperText) {
    businessStepHelperText.textContent = personalMode
      ? "You can skip business setup for now. Locality will create a simple personal buyer account so you can explore local goods nearby."
      : "If you represent a farm, restaurant, market, grocer, institution, or food business, complete the business details below. If you are buying personally, check the box above.";
  }

  if (businessSetupSubmit) {
    businessSetupSubmit.textContent = personalMode
      ? "Continue as personal buyer"
      : "Continue to location";
  }
}

function setCompletionForPersonalBuyer(displayName) {
  if (profileSummaryText) {
    profileSummaryText.textContent =
      `${displayName || "Your"} personal buyer account is ready. You can start exploring local farms, products, and markets.`;
  }

  if (enterWorkspaceLink) {
    enterWorkspaceLink.href = "map.html";
    enterWorkspaceLink.textContent = "Start exploring";
  }
}

async function savePersonalBuyerProfile() {
  const user = await getSignedInUserOrRedirect();

  if (!user) {
    return { data: null, error: "No authenticated user." };
  }

  const displayName = getCleanValue(fullNameInput) || user.email || "Locality buyer";

  const { data, error } = await window.LocalitySupabase
    .from("user_profiles")
    .upsert({
      id: user.id,
      full_name: displayName,
      buyer_display_name: displayName,
      phone: getPhoneDigits(personalPhoneInput?.value) || null,
      locality_account_type: "personal_buyer",
      buyer_interests: [],
      buyer_radius_miles: 25,
      onboarding_completed: true,
      onboarding_step: "personal_buyer_ready",
      notification_preferences: buildNotificationPreferences(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  return { data, error };
}

function getPhoneDigits(value) {
  let digits = String(value || "").replace(/\D/g, "");

  if (digits.length > 10 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

function getPhoneInputs(groupName) {
  return {
    area: document.getElementById(`${groupName}PhoneArea`),
    prefix: document.getElementById(`${groupName}PhonePrefix`),
    line: document.getElementById(`${groupName}PhoneLine`),
    hidden: document.getElementById(`${groupName}PhoneInput`)
  };
}

function syncSegmentedPhone(groupName) {
  const { area, prefix, line, hidden } = getPhoneInputs(groupName);

  if (!hidden) return "";

  const digits = [
    area?.value || "",
    prefix?.value || "",
    line?.value || ""
  ].join("").replace(/\D/g, "").slice(0, 10);

  hidden.value = digits;

  return digits;
}

function fillSegmentedPhone(groupName, value) {
  const digits = getPhoneDigits(value);
  const { area, prefix, line, hidden } = getPhoneInputs(groupName);

  if (area) area.value = digits.slice(0, 3);
  if (prefix) prefix.value = digits.slice(3, 6);
  if (line) line.value = digits.slice(6, 10);
  if (hidden) hidden.value = digits;

  if (digits.length < 3) {
    area?.focus();
  } else if (digits.length < 6) {
    prefix?.focus();
  } else {
    line?.focus();
  }
}

function attachSegmentedPhoneFormatter(groupName) {
  const { area, prefix, line } = getPhoneInputs(groupName);

  const segments = [
    { input: area, max: 3 },
    { input: prefix, max: 3 },
    { input: line, max: 4 }
  ].filter((segment) => segment.input);

  segments.forEach((segment, index) => {
    segment.input.addEventListener("input", () => {
      const combinedDigits = segments
        .map((item) => item.input.value)
        .join("")
        .replace(/\D/g, "");

      fillSegmentedPhone(groupName, combinedDigits);

      const nextSegment = segments[index + 1];

      if (segment.input.value.length >= segment.max && nextSegment) {
        nextSegment.input.focus();
      }

      syncSegmentedPhone(groupName);
    });

    segment.input.addEventListener("keydown", (event) => {
      const previousSegment = segments[index - 1];

      if (event.key === "Backspace" && !segment.input.value && previousSegment) {
        previousSegment.input.focus();
        previousSegment.input.setSelectionRange(
          previousSegment.input.value.length,
          previousSegment.input.value.length
        );
      }
    });

    segment.input.addEventListener("paste", (event) => {
      event.preventDefault();

      const pastedText = event.clipboardData.getData("text");
      fillSegmentedPhone(groupName, pastedText);
      syncSegmentedPhone(groupName);
    });
  });
}

function normalizeUrl(value) {
  const trimmed = value?.trim();

  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function getJsonValue(value, fallback) {
  if (!value) return fallback;

  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function setImagePreview(imageElement, placeholderElement, url) {
  if (!imageElement || !url) return;

  imageElement.src = url;
  imageElement.classList.remove("hidden");

  if (placeholderElement) {
    placeholderElement.classList.add("hidden");
  }
}

function getSectionStatus(sectionKey) {
  return profileSectionStatus?.[sectionKey]?.status || "missing";
}

function setSectionStatus(sectionKey, status) {
  profileSectionStatus = {
    ...profileSectionStatus,
    [sectionKey]: {
      status,
      updated_at: new Date().toISOString()
    }
  };

  renderSectionStatus();
}

function markDraftIfHasValue(sectionKey, input) {
  const value = getCleanValue(input);

  if (!value) {
    setSectionStatus(sectionKey, "missing");
    return;
  }

  if (getSectionStatus(sectionKey) !== "complete") {
    setSectionStatus(sectionKey, "draft");
  }
}

function getSelectedCertifications() {
  const checkedCertifications = Array.from(
    document.querySelectorAll(".certification-option:checked")
  ).map((input) => ({
    name: input.value,
    type: "certification_or_practice",
    self_reported: true,
    verified: false,
    source: "profile_builder"
  }));

  const customItems = customCertifications.map((name) => ({
    name,
    type: "custom",
    self_reported: true,
    verified: false,
    source: "profile_builder"
  }));

  return [...checkedCertifications, ...customItems];
}

function renderSelectedCertifications() {
  if (!selectedCertificationsList) return;

  const certs = getSelectedCertifications();

  selectedCertificationsList.innerHTML = "";

  certs.forEach((cert) => {
    const chip = document.createElement("span");
    chip.textContent = cert.name;
    selectedCertificationsList.appendChild(chip);
  });

  if (certs.length) {
    setSectionStatus("certifications", "complete");
  } else {
    setSectionStatus("certifications", "missing");
  }
}

function renderGalleryPreview() {
  if (!galleryPreviewGrid || !galleryUploadBtn) return;

  const existingCards = galleryPreviewGrid.querySelectorAll(".gallery-image-card");
  existingCards.forEach((card) => card.remove());

  profileGalleryImages.forEach((image) => {
    const card = document.createElement("div");
    card.className = "gallery-image-card";

    const img = document.createElement("img");
    img.src = image.url;
    img.alt = image.caption || "Business gallery image";

    card.appendChild(img);
    galleryPreviewGrid.insertBefore(card, galleryUploadBtn);
  });

  if (profileGalleryImages.length) {
    setSectionStatus("gallery", "complete");
  } else {
    setSectionStatus("gallery", "missing");
  }
}

function updateCharacterCount(input, counter, max) {
  if (!input || !counter) return;

  counter.textContent = `${input.value.length} / ${max}`;
}

function renderBuilderIdentity() {
  const businessName = getCleanValue(businessNameInput) || "Your business name";
  const address = buildAddressPayload();
  const locationLabel = formatLocationLabel(address) || "Your location";
  const marketplaceRole = marketplaceRoleInput?.value || "seller";
  const businessCategory = businessCategoryInput?.value || "other";
  const businessEmail = getCleanValue(businessEmailInput);
  const businessPhone = getPhoneDigits(businessPhoneInput?.value);
  const website = getCleanValue(websiteInput);

  if (builderBusinessName) {
    builderBusinessName.textContent = businessName;
  }

  if (builderBusinessMeta) {
    builderBusinessMeta.textContent = `${locationLabel} • ${businessCategory.replace("-", " ")} • ${marketplaceRole.replace("_", " / ")}`;
  }

  if (builderRoleChip) {
    builderRoleChip.textContent =
      marketplaceRole === "buyer_seller"
        ? "Buyer / Seller"
        : marketplaceRole.charAt(0).toUpperCase() + marketplaceRole.slice(1);
  }

  if (builderCategoryChip) {
    builderCategoryChip.textContent = businessCategory.replace("-", " ");
  }

  if (builderContactChip) {
    const hasContact = Boolean(businessEmail || businessPhone || website);
    builderContactChip.textContent = hasContact
      ? "Contact details added"
      : "Add public contact details";
  }
}

function renderSectionStatus() {
  const trackedSections = [
    "logo",
    "banner",
    "short_intro",
    "gallery",
    "about_us",
    "certifications",
    "ordering_guidelines"
  ];

  const completedSections = trackedSections.filter(
    (sectionKey) => getSectionStatus(sectionKey) === "complete"
  );

  const completionPercent = Math.round(
    (completedSections.length / trackedSections.length) * 100
  );

  if (profileCompletionPercent) {
    profileCompletionPercent.textContent = `${completionPercent}%`;
  }

  if (profileCompletionBar) {
    profileCompletionBar.style.width = `${completionPercent}%`;
  }

  trackedSections.forEach((sectionKey) => {
    const status = getSectionStatus(sectionKey);

    document
      .querySelectorAll(`[data-status-pill="${sectionKey}"]`)
      .forEach((pill) => {
        pill.textContent =
          status === "complete"
            ? "Complete"
            : status === "draft"
              ? "Draft"
              : "Missing";

        pill.dataset.status = status;
      });

    const listItem = profileCompletionList?.querySelector(
      `[data-completion-key="${sectionKey}"]`
    );

    if (listItem) {
      listItem.dataset.status = status;
    }
  });
}

function initializeProfileBuilderFields() {
  renderBuilderIdentity();

  updateCharacterCount(shortIntroInput, shortIntroCount, 500);
  updateCharacterCount(aboutUsInput, aboutUsCount, 2000);
  updateCharacterCount(orderingGuidelinesInput, orderingGuidelinesCount, 1500);
  updateCharacterCount(farmingPracticesInput, farmingPracticesCount, 1500);

  if (logoUrlInput?.value) {
    setImagePreview(logoPreviewImage, logoPlaceholder, logoUrlInput.value);
    setSectionStatus("logo", "complete");
  }

  if (bannerImageUrlInput?.value) {
    setImagePreview(bannerPreviewImage, bannerPlaceholder, bannerImageUrlInput.value);
    setSectionStatus("banner", "complete");
  }

  if (getCleanValue(shortIntroInput)) {
    setSectionStatus("short_intro", "draft");
  }

  if (getCleanValue(aboutUsInput)) {
    setSectionStatus("about_us", "draft");
  }

  if (getCleanValue(orderingGuidelinesInput)) {
    setSectionStatus("ordering_guidelines", "draft");
  }

  renderGalleryPreview();
  renderSelectedCertifications();
  renderSectionStatus();
}


function buildNotificationPreferences() {
  return {
    direct_contacts: Boolean(notifyDirectContacts?.checked),
    profile_interactions: Boolean(notifyProfileInteractions?.checked),
    operational_reminders: Boolean(notifyOperationalReminders?.checked),
    locality_updates: Boolean(notifyLocalityUpdates?.checked)
  };
}

attachSegmentedPhoneFormatter("personal");
attachSegmentedPhoneFormatter("business");

function buildAddressPayload() {
  return {
    street_address: getCleanValue(streetAddressInput),
    address_line_2: getCleanValue(addressLine2Input),
    city: getCleanValue(cityInput),
    state: getCleanValue(stateInput).toUpperCase(),
    zip_code: getCleanValue(zipInput),
    country: "United States"
  };
}

function formatLocationLabel(address) {
  const city = address.city;
  const state = address.state;

  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;

  return "";
}

function prefillBusinessContactFromAccount() {
  const accountEmail = getCleanValue(signupEmail);
  const businessEmail = getCleanValue(businessEmailInput);

  if (businessEmailInput && accountEmail && !businessEmail) {
    businessEmailInput.value = accountEmail;
  }

  const accountPhoneDigits = getPhoneDigits(personalPhoneInput?.value);
  const businessPhoneDigits = getPhoneDigits(businessPhoneInput?.value);

  if (accountPhoneDigits && !businessPhoneDigits) {
    fillSegmentedPhone("business", accountPhoneDigits);
    syncSegmentedPhone("business");
  }
}

function setActiveBusinessProfileId(id) {
  activeBusinessProfileId = id || null;

  if (activeBusinessProfileId) {
    localStorage.setItem(ONBOARDING_PROFILE_ID_KEY, activeBusinessProfileId);
  } else {
    localStorage.removeItem(ONBOARDING_PROFILE_ID_KEY);
  }
}

function parseJsonLike(value, fallback) {
  if (!value) return fallback;

  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getRoleSelectValue(roles = []) {
  const roleList = Array.isArray(roles) ? roles : parseJsonLike(roles, []);

  if (roleList.includes("buyer") && roleList.includes("seller")) {
    return "buyer_seller";
  }

  return roleList[0] || "seller";
}

function hydrateBusinessProfileFields(profile) {
  if (!profile) return;

  if (businessNameInput && profile.name) {
    businessNameInput.value = profile.name;
  }

  if (businessEmailInput && profile.contact_email) {
    businessEmailInput.value = profile.contact_email;
  }

  if (profile.phone) {
    fillSegmentedPhone("business", profile.phone);
    syncSegmentedPhone("business");
  }

  if (marketplaceRoleInput) {
    marketplaceRoleInput.value = getRoleSelectValue(profile.marketplace_roles);
  }

  const categories = parseJsonLike(profile.business_categories, []);
  if (businessCategoryInput && categories?.[0]) {
    businessCategoryInput.value = categories[0];
  }

  if (websiteInput && profile.website) {
    websiteInput.value = profile.website;
  }

  if (productFocusInput && profile.product_focus) {
    productFocusInput.value = profile.product_focus;
  }

  const address = parseJsonLike(profile.address, {});

  if (streetAddressInput && address.street_address) {
    streetAddressInput.value = address.street_address;
  }

  if (addressLine2Input && address.address_line_2) {
    addressLine2Input.value = address.address_line_2;
  }

  if (cityInput && address.city) {
    cityInput.value = address.city;
  }

  if (stateInput && address.state) {
    stateInput.value = address.state;
  }

  if (zipInput && address.zip_code) {
    zipInput.value = address.zip_code;
  }

  if (logoUrlInput && profile.logo_url) {
    logoUrlInput.value = profile.logo_url;
  }

  if (bannerImageUrlInput && profile.banner_image_url) {
    bannerImageUrlInput.value = profile.banner_image_url;
  }

  if (socialLinkInput && profile.social_link) {
    socialLinkInput.value = profile.social_link;
  }

  if (businessDescriptionInput && profile.description) {
    businessDescriptionInput.value = profile.description;
  }

  if (profileVisibilityInput && profile.profile_visibility) {
    profileVisibilityInput.value = profile.profile_visibility;
  }

  if (shortIntroInput && profile.short_intro) {
    shortIntroInput.value = profile.short_intro;
  }

  if (aboutUsInput && profile.about_us) {
    aboutUsInput.value = profile.about_us;
  }

  if (orderingGuidelinesInput && profile.ordering_guidelines) {
    orderingGuidelinesInput.value = profile.ordering_guidelines;
  }

  if (farmingPracticesInput && profile.farming_practices) {
    farmingPracticesInput.value = profile.farming_practices;
  }

  profileGalleryImages = getJsonValue(profile.gallery_images, []);
  profileSectionStatus = getJsonValue(profile.profile_section_status, {});

  const certifications = getJsonValue(profile.certifications, []);

  document.querySelectorAll(".certification-option").forEach((checkbox) => {
    checkbox.checked = certifications.some((cert) => cert.name === checkbox.value);
  });

  customCertifications = certifications
    .filter((cert) => cert.type === "custom")
    .map((cert) => cert.name);

  if (profile.logo_url) {
    logoUrlInput.value = profile.logo_url;
    setImagePreview(logoPreviewImage, logoPlaceholder, profile.logo_url);
  }

  if (profile.banner_image_url) {
    bannerImageUrlInput.value = profile.banner_image_url;
    setImagePreview(bannerPreviewImage, bannerPlaceholder, profile.banner_image_url);
  }

  renderGalleryPreview();
  renderSelectedCertifications();
  initializeProfileBuilderFields();
}

async function getSignedInUserOrRedirect() {
  const user = createdUser || await window.LocalityAuthService.getCurrentUser();

  if (!user) {
    setStatus(signupStatus, "Please create or sign in to your account first.", "error");
    setStep(1);
    return null;
  }

  createdUser = user;
  return user;
}

async function findIncompleteBusinessProfile(userId) {
  const { data, error } = await window.LocalitySupabase
    .from("business_profiles")
    .select("*")
    .eq("owner_user_id", userId)
    .eq("onboarding_completed", false)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.warn("Unable to look up incomplete business profile:", error);
    return null;
  }

  return data?.[0] || null;
}

async function saveBusinessProfileProgress(stepName, updates = {}) {
  const user = await getSignedInUserOrRedirect();

  if (!user) {
    return { data: null, error: "No authenticated user." };
  }

  const payload = {
    ...updates,
    onboarding_step: stepName,
    updated_at: new Date().toISOString()
  };

  async function updateExistingProfile(profileId) {
    return await window.LocalitySupabase
      .from("business_profiles")
      .update(payload)
      .eq("id", profileId)
      .eq("owner_user_id", user.id)
      .select()
      .maybeSingle();
  }

  if (activeBusinessProfileId) {
    const { data, error } = await updateExistingProfile(activeBusinessProfileId);

    if (error) {
      console.warn("Stored onboarding profile could not be updated:", error);
      setActiveBusinessProfileId(null);
    } else if (data?.id) {
      return { data, error: null };
    } else {
      console.warn("Stored onboarding profile was not found for this user. Clearing stale profile id.");
      setActiveBusinessProfileId(null);
    }
  }

  const existingDraft = await findIncompleteBusinessProfile(user.id);

  if (existingDraft?.id) {
    setActiveBusinessProfileId(existingDraft.id);

    const { data, error } = await updateExistingProfile(existingDraft.id);

    if (error) {
      return { data: null, error };
    }

    if (data?.id) {
      return { data, error: null };
    }

    setActiveBusinessProfileId(null);
  }

  const { data, error } = await window.LocalitySupabase
    .from("business_profiles")
    .insert({
      owner_user_id: user.id,
      profile_visibility: "draft",
      onboarding_completed: false,
      status: "active",
      ...payload
    })
    .select()
    .single();

  if (data?.id) {
    setActiveBusinessProfileId(data.id);
  }

  return { data, error };
}

personalBuyerModeInput?.addEventListener("change", applyPersonalBuyerMode);
applyPersonalBuyerMode();

accountTypeChoiceButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const choice = button.dataset.accountTypeChoice;

    if (choice === "personal_buyer") {
      setAccountPath("personal_buyer");

      const { error } = await updateUserProfile({
        locality_account_type: "personal_buyer",
        onboarding_completed: false,
        onboarding_step: "buyer_location"
      });

      if (error) {
        console.error("Unable to save account type:", error);
        alert(error.message || "Unable to save your account type.");
        return;
      }

      setStep(4);
      return;
    }

    setAccountPath("business");

    const { error } = await updateUserProfile({
      locality_account_type: "business_seller",
      onboarding_completed: false,
      onboarding_step: "business_identity"
    });

    if (error) {
      console.error("Unable to save account type:", error);
      alert(error.message || "Unable to save your account type.");
      return;
    }

    prefillBusinessContactFromAccount();
    setStep(3);
  });
});

async function resumeOnboardingIfNeeded() {
  const user = await window.LocalityAuthService.getCurrentUser();

  if (!user) {
    setStep(1);
    return;
  }

  createdUser = user;

   const { data: userProfile, error: userProfileError } = await window.LocalitySupabase
  .from("user_profiles")
  .select("full_name, locality_account_type, onboarding_completed, onboarding_step, buyer_display_name")
  .eq("id", user.id)
  .maybeSingle();

if (!userProfileError && userProfile?.locality_account_type === "personal_buyer") {
  setAccountPath("personal_buyer");

  if (userProfile.onboarding_completed === true) {
    setCompletionForPrivateBuyer(userProfile.buyer_display_name || userProfile.full_name);
    setStep(6);
    return;
  }

  setStep(4);
  return;
}

  const { data, error } = await window.LocalitySupabase
    .from("business_profiles")
    .select("*")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.warn("Unable to check onboarding progress:", error);
    setStep(1);
    return;
  }

  const profile = data?.[0];

  if (!profile) {
    prefillBusinessContactFromAccount();
    setStatus(signupStatus, "You are signed in. Continue with your business profile.", "success");
    setStep(2);
    return;
  }

  setActiveBusinessProfileId(profile.id);
  hydrateBusinessProfileFields(profile);

  if (profile.onboarding_completed === true) {
    if (profileSummaryText) {
      profileSummaryText.textContent =
        `${profile.name || "Your business"} is already set up. You can enter your workspace or continue editing later.`;
    }

    setStep(5);
    return;
  }

  const stepName = profile.onboarding_step;

   if (stepName === "business_identity") {
     setAccountPath("business");
     setStep(3);
   } else if (stepName === "location") {
     setAccountPath("business");
     setStep(4);
   } else if (stepName === "profile_created") {
     setAccountPath("business");
     setStep(5);
   } else {
     setStep(2);
   }

  setStatus(signupStatus, "Welcome back. We restored your setup progress.", "success");
}

accountStep?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fullName = getCleanValue(fullNameInput);
  const email = getCleanValue(signupEmail);
  const password = signupPassword?.value || "";
  const confirmPassword = confirmPasswordInput?.value || "";

  if (!fullName) {
    setStatus(signupStatus, "Please enter your full name.", "error");
    return;
  }

  if (!email || !password || !confirmPassword) {
    setStatus(signupStatus, "Please enter your email, password, and confirmation password.", "error");
    return;
  }

  if (password.length < 6) {
    setStatus(signupStatus, "Password must be at least 6 characters.", "error");
    return;
  }

  if (password !== confirmPassword) {
    setStatus(signupStatus, "Passwords do not match.", "error");
    return;
  }

  setStatus(signupStatus, "Creating your account...", "default");

   let signUpResult = await window.LocalityAuthService.signUpWithEmail(
     email,
     password
   );
   
   if (signUpResult.error) {
     const message = signUpResult.error.message || "";
   
     const alreadyExists =
       message.toLowerCase().includes("already") ||
       message.toLowerCase().includes("registered") ||
       message.toLowerCase().includes("exists");
   
     if (!alreadyExists) {
       setStatus(signupStatus, message || "Unable to create account.", "error");
       return;
     }
   
     setStatus(signupStatus, "Account already exists. Signing you in to continue setup...", "default");
   
     const signInResult = await window.LocalityAuthService.signInWithEmail(
       email,
       password
     );
   
     if (signInResult.error) {
       setStatus(
         signupStatus,
         "This account already exists. Sign in with the correct password to continue setup.",
         "error"
       );
       return;
     }
   
     createdUser = signInResult.data?.user || await window.LocalityAuthService.getCurrentUser();
   } else {
     createdUser = signUpResult.data?.user || await window.LocalityAuthService.getCurrentUser();
   }

  if (!createdUser) {
    setStatus(signupStatus, "Account created, but no active user session was found. Try signing in.", "error");
    return;
  }

   await window.LocalitySupabase
     .from("user_profiles")
     .upsert({
       id: createdUser.id,
       full_name: fullName,
       phone: getPhoneDigits(personalPhoneInput?.value) || null,
       locality_account_type: "pending",
       onboarding_completed: false,
       onboarding_step: "account_created",
       notification_preferences: buildNotificationPreferences(),
       updated_at: new Date().toISOString()
     });

   prefillBusinessContactFromAccount();
   setStatus(signupStatus, "Account created. Choose how you want to use Locality.", "success");
   setStep(2);
});

businessStep?.addEventListener("submit", async (event) => {
  event.preventDefault();

if (isPersonalBuyerMode()) {
  const { data, error } = await savePersonalBuyerProfile();

  if (error) {
    console.error("Unable to save personal buyer profile:", error);
    alert(error.message || "Unable to continue as a personal buyer.");
    return;
  }

  setCompletionForPersonalBuyer(data?.buyer_display_name || data?.full_name || getCleanValue(fullNameInput));
  setStep(5);
  return;
}

  const businessName = getCleanValue(businessNameInput);
  const businessEmail = getCleanValue(businessEmailInput);
  const marketplaceRole = marketplaceRoleInput?.value || "seller";
  const businessAccountType = getBusinessAccountTypeFromRole(marketplaceRole);
  const businessCategory = businessCategoryInput?.value || "other";

  const personalPhoneDigits = getPhoneDigits(personalPhoneInput?.value);
  const businessPhoneDigits = getPhoneDigits(businessPhoneInput?.value);

  if (!businessName) {
    alert("Please enter your business name.");
    return;
  }

  if (businessEmail && !businessEmail.includes("@")) {
    alert("Please enter a valid business email or leave it blank.");
    return;
  }

  if (!personalPhoneDigits && !businessPhoneDigits) {
    alert("Please enter either an account phone number or a business phone number.");
    return;
  }

  if (personalPhoneDigits && personalPhoneDigits.length !== 10) {
    alert("Please enter a valid account phone number.");
    return;
  }

  if (businessPhoneDigits && businessPhoneDigits.length !== 10) {
    alert("Please enter a valid business phone number.");
    return;
  }

  const { data, error } = await saveBusinessProfileProgress("business_identity", {
    name: businessName,
    marketplace_roles: getMarketplaceRoles(marketplaceRole),
    business_categories: [businessCategory],
    specialties: [],

    contact_name: getCleanValue(fullNameInput),
    contact_email: businessEmail || getCleanValue(signupEmail),
    phone: businessPhoneDigits || null,
    website: normalizeUrl(websiteInput?.value),

    product_focus: getCleanValue(productFocusInput),
    profile_visibility: "draft",
    onboarding_completed: false,
    status: "active",

    public_contact_settings: {
      show_business_email: Boolean(businessEmail),
      show_business_phone: Boolean(businessPhoneDigits),
      show_personal_phone: false
    }
  });

  if (error) {
    console.error("Unable to save business setup:", error);
    alert(error.message || "Unable to save your business setup.");
    return;
  }

  if (data?.id) {
  setActiveBusinessProfileId(data.id);
   }
   
   const { error: userProfileUpdateError } = await updateUserProfile({
     locality_account_type: businessAccountType,
     onboarding_completed: false,
     onboarding_step: "location"
   });
   
   if (userProfileUpdateError) {
     console.error("Unable to update user account type:", userProfileUpdateError);
     alert(userProfileUpdateError.message || "Unable to save your account type.");
     return;
   }
   
   setAccountPath("business");
   setStep(4);
});

locationStep?.addEventListener("submit", async (event) => {
  event.preventDefault();

   if (isPrivateBuyerPath()) {
     const { data, error } = await savePrivateBuyerLocation();
   
     if (error) {
       alert(error.message || error || "Unable to save your location.");
       return;
     }
   
     setCompletionForPrivateBuyer(data?.buyer_display_name || data?.full_name || getCleanValue(fullNameInput));
     setActiveBusinessProfileId(null);
     setStep(6);
     return;
   }

  const address = buildAddressPayload();

  if (!address.street_address) {
    alert("Please enter your street address.");
    return;
  }

  if (!address.city) {
    alert("Please enter your city.");
    return;
  }

  if (!address.state || address.state.length !== 2) {
    alert("Please enter a valid 2-letter state abbreviation.");
    return;
  }

  if (!address.zip_code || !/^\d{5}(-\d{4})?$/.test(address.zip_code)) {
    alert("Please enter a valid ZIP code.");
    return;
  }

  const locationLabel = formatLocationLabel(address);

  const { data, error } = await saveBusinessProfileProgress("location", {
    address,
    location_label: locationLabel,
    coordinates: {}
  });

  if (error) {
    console.error("Unable to save location:", error);
    alert(error.message || "Unable to save your location.");
    return;
  }

  if (data?.id) {
    setActiveBusinessProfileId(data.id);
  }

  setStep(5);
});

profileStep?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const user = createdUser || await window.LocalityAuthService.getCurrentUser();

  if (!user) {
    alert("Please create or sign in to your account first.");
    setStep(1);
    return;
  }

  const businessName = getCleanValue(businessNameInput);
  const address = buildAddressPayload();
  const locationLabel = formatLocationLabel(address);

  if (!businessName) {
    alert("Please complete the required business details.");
    setStep(2);
    return;
  }

  if (!locationLabel) {
    alert("Please complete the required location details.");
    setStep(3);
    return;
  }

  const { data, error } = await saveBusinessProfileProgress("profile_builder_started", {
    onboarding_completed: false,
    profile_setup_completed: false,
    profile_visibility: "draft",
    profile_last_edited_at: new Date().toISOString()
  });

  if (error) {
    console.error("Unable to start profile builder:", error);
    alert(error.message || "Unable to start profile builder.");
    return;
  }

  if (data?.id) {
    setActiveBusinessProfileId(data.id);
  }

  window.location.href = "profile-builder.html?setup=1";
});

skipProfileBuilderBtn?.addEventListener("click", async () => {
  const user = createdUser || await window.LocalityAuthService.getCurrentUser();

  if (!user) {
    alert("Please create or sign in to your account first.");
    setStep(1);
    return;
  }

  const businessName = getCleanValue(businessNameInput);
  const address = buildAddressPayload();
  const locationLabel = formatLocationLabel(address);

  if (!businessName) {
    alert("Please complete the required business details.");
    setStep(2);
    return;
  }

  if (!locationLabel) {
    alert("Please complete the required location details.");
    setStep(3);
    return;
  }

  const { data, error } = await saveBusinessProfileProgress("profile_skipped", {
    onboarding_completed: true,
    profile_setup_completed: false,
    profile_visibility: "draft",
    profile_completion_score: 0,
    profile_last_edited_at: new Date().toISOString()
  });

  if (error) {
    console.error("Unable to skip profile builder:", error);
    alert(error.message || "Unable to skip profile setup.");
    return;
  }

  if (profileSummaryText) {
    profileSummaryText.textContent =
      `${data?.name || "Your business"} workspace is ready. Your public profile is saved as a draft and can be finished later.`;
  }

  setStep(5);
});

document.querySelectorAll(".signup-back-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const backStep = Number(button.dataset.backStep);

    if (!backStep) return;

    setStep(backStep);
  });
});

function openResumeDraftModal() {
  if (!resumeDraftModal) return;

  resumeDraftModal.classList.remove("hidden");
  resumeDraftModal.setAttribute("aria-hidden", "false");
  resumeDraftEmail?.focus();
}

function closeResumeDraftModal() {
  if (!resumeDraftModal) return;

  resumeDraftModal.classList.add("hidden");
  resumeDraftModal.setAttribute("aria-hidden", "true");
}

function setResumeDraftStatus(message, status = "default") {
  if (!resumeDraftStatus) return;

  resumeDraftStatus.textContent = message;

  if (status === "default") {
    resumeDraftStatus.removeAttribute("data-status");
  } else {
    resumeDraftStatus.dataset.status = status;
  }
}

async function resumeDraftFromModal() {
  const email = getCleanValue(resumeDraftEmail);
  const password = resumeDraftPassword?.value || "";

  if (!email || !password) {
    setResumeDraftStatus("Enter your email and password to resume setup.", "error");
    return;
  }

  setResumeDraftStatus("Checking your draft...", "default");

  const signInResult = await window.LocalityAuthService.signInWithEmail(email, password);

  if (signInResult.error) {
    setResumeDraftStatus(
      signInResult.error.message || "Unable to sign in with those details.",
      "error"
    );
    return;
  }

  const user = signInResult.data?.user || await window.LocalityAuthService.getCurrentUser();

  if (!user) {
    setResumeDraftStatus("Signed in, but no active user session was found.", "error");
    return;
  }

  createdUser = user;

  const { data, error } = await window.LocalitySupabase
    .from("business_profiles")
    .select("*")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Unable to find setup draft:", error);
    setResumeDraftStatus(error.message || "Unable to find your setup draft.", "error");
    return;
  }

  const profile = data?.[0];

  if (!profile) {
    closeResumeDraftModal();
    prefillBusinessContactFromAccount();
    setStatus(signupStatus, "Signed in. Continue with your business profile.", "success");
    setStep(2);
    return;
  }

  if (profile.onboarding_completed === true) {
    setResumeDraftStatus(
      "This profile is already complete. Please sign in to access your workspace.",
      "error"
    );

    setTimeout(() => {
      window.location.href = "account.html";
    }, 1400);

    return;
  }

  setActiveBusinessProfileId(profile.id);
  hydrateBusinessProfileFields(profile);
  closeResumeDraftModal();

  if (profile.onboarding_step === "business_identity") {
    setStep(3);
  } else if (profile.onboarding_step === "location") {
    setStep(4);
  } else if (profile.onboarding_step === "profile_created") {
    setStep(4);
  } else {
    setStep(2);
  }

  setStatus(signupStatus, "Welcome back. We restored your setup draft.", "success");
}

resumeDraftOpenBtn?.addEventListener("click", openResumeDraftModal);
resumeDraftCloseBtn?.addEventListener("click", closeResumeDraftModal);
resumeDraftSubmitBtn?.addEventListener("click", resumeDraftFromModal);

resumeDraftModal?.addEventListener("click", (event) => {
  if (event.target === resumeDraftModal) {
    closeResumeDraftModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeResumeDraftModal();
  }
});


function buildProfileBuilderPayload(markOnboardingComplete = true) {
  const marketplaceRole = marketplaceRoleInput?.value || "seller";
  const businessCategory = businessCategoryInput?.value || "other";
  const address = buildAddressPayload();
  const locationLabel = formatLocationLabel(address);
  const personalPhoneDigits = getPhoneDigits(personalPhoneInput?.value);
  const businessPhoneDigits = getPhoneDigits(businessPhoneInput?.value);
  const businessEmail = getCleanValue(businessEmailInput);

  const shortIntro = getCleanValue(shortIntroInput);
  const aboutUs = getCleanValue(aboutUsInput);

  businessDescriptionInput.value = shortIntro;

  return {
    name: getCleanValue(businessNameInput),
    marketplace_roles: getMarketplaceRoles(marketplaceRole),
    business_categories: [businessCategory],
    specialties: [],

    logo_url: logoUrlInput?.value || null,
    banner_image_url: bannerImageUrlInput?.value || null,

    contact_name: getCleanValue(fullNameInput),
    contact_email: businessEmail || getCleanValue(signupEmail),
    phone: businessPhoneDigits || personalPhoneDigits || null,
    website: normalizeUrl(websiteInput?.value),
    social_link: normalizeUrl(socialLinkInput?.value),

    description: shortIntro,
    short_intro: shortIntro,
    about_us: aboutUs,

    gallery_images: profileGalleryImages,
    certifications: getSelectedCertifications(),
    ordering_guidelines: getCleanValue(orderingGuidelinesInput),
    farming_practices: getCleanValue(farmingPracticesInput),
    seasonality_notes: "",

    location_label: locationLabel,
    address,
    product_focus: getCleanValue(productFocusInput),

    public_contact_settings: {
      show_business_email: Boolean(businessEmail),
      show_business_phone: Boolean(businessPhoneDigits),
      show_personal_phone: false
    },

    profile_section_status: profileSectionStatus,
    profile_visibility: profileVisibilityInput?.value || "draft",
    onboarding_step: markOnboardingComplete ? "profile_created" : "profile_builder_draft",
    onboarding_completed: Boolean(markOnboardingComplete),
    status: "active",
    updated_at: new Date().toISOString()
  };
}

async function handleProfileMediaUpload(file, mediaType) {
  const user = createdUser || await window.LocalityAuthService.getCurrentUser();

  if (!user) {
    alert("Please sign in before uploading images.");
    return null;
  }

  if (!activeBusinessProfileId) {
    alert("Please complete the business setup step before uploading images.");
    setStep(2);
    return null;
  }

  if (!window.LocalityProfileMediaService?.uploadBusinessProfileMedia) {
    alert("Profile media upload service is not available.");
    return null;
  }

  if (profileBuilderStatus) {
    profileBuilderStatus.textContent = "Uploading image...";
  }

  const { data, error } =
    await window.LocalityProfileMediaService.uploadBusinessProfileMedia({
      file,
      businessProfileId: activeBusinessProfileId,
      mediaType
    });

  if (error) {
    console.error("Upload error:", error);
    alert(error.message || error || "Unable to upload image.");
    if (profileBuilderStatus) profileBuilderStatus.textContent = "Draft profile";
    return null;
  }

  if (profileBuilderStatus) {
    profileBuilderStatus.textContent = "Image uploaded";
  }

  return data;
}

logoUploadBtn?.addEventListener("click", () => {
  logoFileInput?.click();
});

bannerUploadBtn?.addEventListener("click", () => {
  bannerFileInput?.click();
});

galleryUploadBtn?.addEventListener("click", () => {
  galleryFileInput?.click();
});

logoFileInput?.addEventListener("change", async () => {
  const file = logoFileInput.files?.[0];
  if (!file) return;

  const uploaded = await handleProfileMediaUpload(file, "logo");
  if (!uploaded?.url) return;

  logoUrlInput.value = uploaded.url;
  setImagePreview(logoPreviewImage, logoPlaceholder, uploaded.url);
  setSectionStatus("logo", "complete");
});

bannerFileInput?.addEventListener("change", async () => {
  const file = bannerFileInput.files?.[0];
  if (!file) return;

  const uploaded = await handleProfileMediaUpload(file, "banner");
  if (!uploaded?.url) return;

  bannerImageUrlInput.value = uploaded.url;
  setImagePreview(bannerPreviewImage, bannerPlaceholder, uploaded.url);
  setSectionStatus("banner", "complete");
});

galleryFileInput?.addEventListener("change", async () => {
  const files = Array.from(galleryFileInput.files || []);
  if (!files.length) return;

  for (const file of files) {
    const uploaded = await handleProfileMediaUpload(file, "gallery");

    if (uploaded?.url) {
      profileGalleryImages.push({
        url: uploaded.url,
        path: uploaded.path,
        caption: "",
        sort_order: profileGalleryImages.length + 1,
        uploaded_at: uploaded.uploaded_at
      });
    }
  }

  renderGalleryPreview();
});

[shortIntroInput, aboutUsInput, orderingGuidelinesInput, farmingPracticesInput].forEach((input) => {
  input?.addEventListener("input", () => {
    updateCharacterCount(shortIntroInput, shortIntroCount, 500);
    updateCharacterCount(aboutUsInput, aboutUsCount, 2000);
    updateCharacterCount(orderingGuidelinesInput, orderingGuidelinesCount, 1500);
    updateCharacterCount(farmingPracticesInput, farmingPracticesCount, 1500);

    if (input === shortIntroInput) markDraftIfHasValue("short_intro", shortIntroInput);
    if (input === aboutUsInput) markDraftIfHasValue("about_us", aboutUsInput);
    if (input === orderingGuidelinesInput) markDraftIfHasValue("ordering_guidelines", orderingGuidelinesInput);
    if (input === farmingPracticesInput) markDraftIfHasValue("farming_practices", farmingPracticesInput);
  });
});

document.querySelectorAll(".mark-section-complete").forEach((button) => {
  button.addEventListener("click", () => {
    const sectionKey = button.dataset.sectionKey;
    let relatedInput = null;

    if (sectionKey === "short_intro") relatedInput = shortIntroInput;
    if (sectionKey === "about_us") relatedInput = aboutUsInput;
    if (sectionKey === "ordering_guidelines") relatedInput = orderingGuidelinesInput;
    if (sectionKey === "farming_practices") relatedInput = farmingPracticesInput;

    if (relatedInput && !getCleanValue(relatedInput)) {
      alert("Add content before marking this section complete.");
      return;
    }

    setSectionStatus(sectionKey, "complete");
  });
});

document.querySelectorAll(".certification-option").forEach((checkbox) => {
  checkbox.addEventListener("change", renderSelectedCertifications);
});

addCustomCertificationBtn?.addEventListener("click", () => {
  const value = getCleanValue(customCertificationInput);

  if (!value) {
    alert("Enter a certification or practice first.");
    return;
  }

  if (!customCertifications.includes(value)) {
    customCertifications.push(value);
  }

  customCertificationInput.value = "";
  renderSelectedCertifications();
});

saveProfileDraftBtn?.addEventListener("click", async () => {
  const draftPayload = buildProfileBuilderPayload(false);

  const { error } = await saveBusinessProfileProgress("profile_builder_draft", draftPayload);

  if (error) {
    console.error("Unable to save profile draft:", error);
    alert(error.message || "Unable to save profile draft.");
    return;
  }

  if (profileBuilderStatus) {
    profileBuilderStatus.textContent = "Draft saved";
  }
});

function handlePasswordToggleClick(event) {
  const button = event.target.closest(".password-toggle");

  if (!button) return;

  event.preventDefault();
  event.stopPropagation();

  const targetId = button.getAttribute("data-password-target");
  const input = document.getElementById(targetId);

  if (!input) {
    console.warn("Password toggle target not found:", targetId);
    return;
  }

  const shouldShow = input.type === "password";

  input.type = shouldShow ? "text" : "password";
  button.textContent = shouldShow ? "Hide" : "Show";
}

document.addEventListener("click", handlePasswordToggleClick);

setStep(1);
