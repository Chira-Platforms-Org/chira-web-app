/* =========================
   LOCALITY SIGNUP / ONBOARDING
========================= */

const accountStep = document.getElementById("accountStep");
const businessStep = document.getElementById("businessStep");
const completionStep = document.getElementById("completionStep");

const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupStatus = document.getElementById("signupStatus");

const businessNameInput = document.getElementById("businessNameInput");
const marketplaceRoleInput = document.getElementById("marketplaceRoleInput");
const businessCategoryInput = document.getElementById("businessCategoryInput");
const locationLabelInput = document.getElementById("locationLabelInput");
const productFocusInput = document.getElementById("productFocusInput");
const businessDescriptionInput = document.getElementById("businessDescriptionInput");
const profileSummaryText = document.getElementById("profileSummaryText");

const createAccountSubmit = document.getElementById("createAccountSubmit");
const createProfileSubmit = document.getElementById("createProfileSubmit");

const progressSteps = document.querySelectorAll("[data-step-indicator]");

function setSignupStatus(message, type = "neutral") {
  if (!signupStatus) return;

  signupStatus.textContent = message;
  signupStatus.dataset.status = type;
}

function setStep(stepNumber) {
  accountStep?.classList.toggle("active", stepNumber === 1);
  businessStep?.classList.toggle("active", stepNumber === 2);
  completionStep?.classList.toggle("active", stepNumber === 3);

  progressSteps.forEach((step) => {
    const indicator = Number(step.dataset.stepIndicator);
    step.classList.toggle("active", indicator === stepNumber);
    step.classList.toggle("complete", indicator < stepNumber);
  });
}

function getMarketplaceRolesFromInput(value) {
  if (value === "buyer_seller") {
    return ["buyer", "seller"];
  }

  return [value];
}

function setAccountLoading(isLoading) {
  if (!createAccountSubmit) return;

  createAccountSubmit.disabled = isLoading;
  createAccountSubmit.textContent = isLoading
    ? "Creating account..."
    : "Continue to business setup";
}

function setProfileLoading(isLoading) {
  if (!createProfileSubmit) return;

  createProfileSubmit.disabled = isLoading;
  createProfileSubmit.textContent = isLoading
    ? "Creating workspace..."
    : "Create workspace";
}

async function checkExistingSession() {
  const user = await window.LocalityAuthService?.getCurrentUser?.();

  if (!user) return;

  const { data: profile } =
    await window.LocalityProfileService.getMyPrimaryBusinessProfile();

  if (profile) {
    renderCompletion(profile);
  } else {
    setStep(2);
  }
}

function renderCompletion(profile) {
  if (profileSummaryText && profile) {
    const roles = profile.marketplace_roles?.join(" + ") || "Locality member";
    const category = profile.business_categories?.join(", ") || "Business profile";

    profileSummaryText.textContent =
      `${profile.name} is set up as ${roles} · ${category} · ${profile.location_label || "Location pending"}.`;
  }

  setStep(3);
}

accountStep?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = signupEmail?.value.trim();
  const password = signupPassword?.value;

  if (!email || !password) {
    setSignupStatus("Enter your email and password first.", "error");
    return;
  }

  setAccountLoading(true);
  setSignupStatus("Creating your account...");

  const { data, error } = await window.LocalityAuthService.signUpWithEmail(
    email,
    password
  );

  if (error) {
    setAccountLoading(false);
    setSignupStatus(error.message || "Account creation failed.", "error");
    console.error(error);
    return;
  }

  console.log("Signup result:", data);
  setSignupStatus("Account created. Now set up your business profile.", "success");
  setAccountLoading(false);
  setStep(2);
});

businessStep?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = businessNameInput?.value.trim();

  if (!name) {
    setSignupStatus("Business name is required.", "error");
    return;
  }

  setProfileLoading(true);
  setSignupStatus("Creating your business workspace...");

  const roleValue = marketplaceRoleInput?.value;
  const categoryValue = businessCategoryInput?.value;

  const { data, error } = await window.LocalityProfileService.createBusinessProfile({
    name,
    marketplace_roles: getMarketplaceRolesFromInput(roleValue),
    business_categories: [categoryValue],
    specialties: [],
    description: businessDescriptionInput?.value.trim() || "",
    location_label: locationLabelInput?.value.trim() || "",
    product_focus: productFocusInput?.value.trim() || "",
    status: "active"
  });

  if (error) {
    setProfileLoading(false);
    setSignupStatus(error.message || "Business profile creation failed.", "error");
    console.error(error);
    return;
  }

  setProfileLoading(false);
  setSignupStatus("Workspace created.", "success");
  renderCompletion(data);
});

setStep(1);
checkExistingSession();
