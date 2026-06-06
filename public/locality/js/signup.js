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

const businessNameInput = document.getElementById("businessNameInput");
const marketplaceRoleInput = document.getElementById("marketplaceRoleInput");
const businessCategoryInput = document.getElementById("businessCategoryInput");
const locationLabelInput = document.getElementById("locationLabelInput");
const productFocusInput = document.getElementById("productFocusInput");

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
      updated_at: new Date().toISOString()
    });

  setStatus(signupStatus, "Account created. Continue with your business profile.", "success");
  setStep(2);
});

businessStep?.addEventListener("submit", (event) => {
  event.preventDefault();

  const businessName = getCleanValue(businessNameInput);
  const locationLabel = getCleanValue(locationLabelInput);

  if (!businessName) {
    alert("Please enter your business name.");
    return;
  }

  if (!locationLabel) {
    alert("Please enter your business location.");
    return;
  }

  setStep(3);
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
  const locationLabel = getCleanValue(locationLabelInput);
  const productFocus = getCleanValue(productFocusInput);
  const description = getCleanValue(businessDescriptionInput);

  if (!businessName || !locationLabel) {
    alert("Please complete the required business details.");
    setStep(2);
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
    contact_email: getCleanValue(signupEmail),
    website: getCleanValue(websiteInput) || null,
    social_link: getCleanValue(socialLinkInput) || null,

    description,
    location_label: locationLabel,
    product_focus: productFocus,

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

  setStep(4);
});

setStep(1);
