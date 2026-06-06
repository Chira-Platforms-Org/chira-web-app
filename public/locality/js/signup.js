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
const websiteInput = document.getElementById("websiteInput");
const socialLinkInput = document.getElementById("socialLinkInput");
const businessDescriptionInput = document.getElementById("businessDescriptionInput");
const profileVisibilityInput = document.getElementById("profileVisibilityInput");

let createdUser = null;

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

function formatUSPhone(value) {
  const digits = getPhoneDigits(value);

  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  if (!digits) return "";

  if (digits.length <= 3) {
    return `+1 (${area}`;
  }

  if (digits.length <= 6) {
    return `+1 (${area}) ${prefix}`;
  }

  return `+1 (${area}) ${prefix}-${line}`;
}

function attachPhoneFormatter(input) {
  if (!input) return;

  input.addEventListener("input", () => {
    input.value = formatUSPhone(input.value);
    input.setSelectionRange(input.value.length, input.value.length);
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

attachPhoneFormatter(personalPhoneInput);
attachPhoneFormatter(businessPhoneInput);

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

  const { data, error } = await window.LocalityAuthService.signUpWithEmail(
    email,
    password
  );

  if (error) {
    setStatus(signupStatus, error.message || "Unable to create account.", "error");
    return;
  }

  createdUser = data?.user || await window.LocalityAuthService.getCurrentUser();

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

  setStatus(signupStatus, "Account created. Continue with your business profile.", "success");
  setStep(2);
});

businessStep?.addEventListener("submit", (event) => {
  event.preventDefault();

  const businessName = getCleanValue(businessNameInput);
  const businessEmail = getCleanValue(businessEmailInput);
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
    alert("Please enter either a personal phone number or a business phone number.");
    return;
  }

  if (personalPhoneDigits && personalPhoneDigits.length !== 10) {
    alert("Please enter a valid personal phone number.");
    return;
  }

  if (businessPhoneDigits && businessPhoneDigits.length !== 10) {
    alert("Please enter a valid business phone number.");
    return;
  }

  setStep(3);
});

locationStep?.addEventListener("submit", (event) => {
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
    owner_user_id: user.id,
    name: businessName,

    marketplace_roles: getMarketplaceRoles(marketplaceRole),
    business_categories: [businessCategory],
    specialties: [],

    logo_url: getCleanValue(logoUrlInput) || null,
    banner_image_url: getCleanValue(bannerImageUrlInput) || null,

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

  const { data, error } = await window.LocalitySupabase
    .from("business_profiles")
    .insert(businessProfile)
    .select()
    .single();

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

setStep(1);
