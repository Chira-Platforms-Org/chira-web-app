/* =========================
   LOCALITY SIGNUP FLOW
   Account -> Business -> Profile -> Workspace
========================= */

const accountStep = document.getElementById("accountStep");
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

const locationStep = document.getElementById("locationStep");
const streetAddressInput = document.getElementById("streetAddressInput");
const addressLine2Input = document.getElementById("addressLine2Input");
const cityInput = document.getElementById("cityInput");
const stateInput = document.getElementById("stateInput");
const zipInput = document.getElementById("zipInput");
const countryInput = document.getElementById("countryInput");

const logoUrlInput = document.getElementById("logoUrlInput");
const bannerImageUrlInput = document.getElementById("bannerImageUrlInput");
const socialLinkInput = document.getElementById("socialLinkInput");
const businessDescriptionInput = document.getElementById("businessDescriptionInput");
const profileVisibilityInput = document.getElementById("profileVisibilityInput");

let createdUser = null;

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

  if (activeBusinessProfileId) {
    const { data, error } = await window.LocalitySupabase
      .from("business_profiles")
      .update(payload)
      .eq("id", activeBusinessProfileId)
      .select()
      .single();

    return { data, error };
  }

  const existingDraft = await findIncompleteBusinessProfile(user.id);

  if (existingDraft?.id) {
    setActiveBusinessProfileId(existingDraft.id);

    const { data, error } = await window.LocalitySupabase
      .from("business_profiles")
      .update(payload)
      .eq("id", existingDraft.id)
      .select()
      .single();

    return { data, error };
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

async function resumeOnboardingIfNeeded() {
  const user = await window.LocalityAuthService.getCurrentUser();

  if (!user) {
    setStep(1);
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
    setStep(3);
  } else if (stepName === "location") {
    setStep(4);
  } else if (stepName === "profile_created") {
    setStep(4);
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
    notification_preferences: buildNotificationPreferences(),
    updated_at: new Date().toISOString()
  });

   prefillBusinessContactFromAccount();
   setStatus(signupStatus, "Account created. Continue with your business profile.", "success");
   setStep(2);
});

businessStep?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const businessName = getCleanValue(businessNameInput);
  const businessEmail = getCleanValue(businessEmailInput);
  const marketplaceRole = marketplaceRoleInput?.value || "seller";
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

  setStep(3);
});

locationStep?.addEventListener("submit", async (event) => {
  event.preventDefault();

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

  setStep(4);
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
   const marketplaceRole = marketplaceRoleInput?.value || "seller";
   const businessCategory = businessCategoryInput?.value || "other";
   const address = buildAddressPayload();
   const locationLabel = formatLocationLabel(address);
   const productFocus = getCleanValue(productFocusInput);
   const description = getCleanValue(businessDescriptionInput);
   
   const personalPhoneDigits = getPhoneDigits(personalPhoneInput?.value);
   const businessPhoneDigits = getPhoneDigits(businessPhoneInput?.value);
   const businessEmail = getCleanValue(businessEmailInput);
   
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

  const profileVisibility = profileVisibilityInput?.value || "draft";

  const businessProfile = {
    name: businessName,

    marketplace_roles: getMarketplaceRoles(marketplaceRole),
    business_categories: [businessCategory],
    specialties: [],

   logo_url: normalizeUrl(logoUrlInput?.value),
   banner_image_url: normalizeUrl(bannerImageUrlInput?.value),

   contact_name: getCleanValue(fullNameInput),
   contact_email: businessEmail || getCleanValue(signupEmail),
   phone: businessPhoneDigits || null,
   website: normalizeUrl(websiteInput?.value),
   social_link: normalizeUrl(socialLinkInput?.value),
   
   description,
   location_label: locationLabel,
   address,
   product_focus: productFocus,
   
   public_contact_settings: {
     show_business_email: Boolean(businessEmail),
     show_business_phone: Boolean(businessPhoneDigits),
     show_personal_phone: false
   },

    profile_visibility: profileVisibility,
    onboarding_step: "profile_created",
    onboarding_completed: true,
    status: "active",
    updated_at: new Date().toISOString()
  };

   const { data, error } = await saveBusinessProfileProgress(
     "profile_created",
     businessProfile
   );

  if (error) {
    console.error("Unable to create business profile:", error);
    alert(error.message || "Unable to create business profile.");
    return;
  }

  if (profileSummaryText) {
    const roleLabel =
      marketplaceRole === "buyer_seller"
        ? "buyer and seller"
        : marketplaceRole;

    profileSummaryText.textContent =
      `${data.name} is set up as a ${roleLabel} profile in ${data.location_label}. You can add products, listings, pricing, and availability next.`;
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

setStep(1);
