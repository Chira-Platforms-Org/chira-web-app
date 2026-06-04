/* =========================
   LOCALITY ACCOUNT SETUP PAGE
========================= */

const accountEmail = document.getElementById("accountEmail");
const accountPassword = document.getElementById("accountPassword");

const createAccountBtn = document.getElementById("createAccountBtn");
const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");

const authStatus = document.getElementById("authStatus");

const profileSetupCard = document.getElementById("profileSetupCard");
const profileSummaryCard = document.getElementById("profileSummaryCard");
const profileSummaryText = document.getElementById("profileSummaryText");

const businessNameInput = document.getElementById("businessNameInput");
const marketplaceRoleInput = document.getElementById("marketplaceRoleInput");
const businessCategoryInput = document.getElementById("businessCategoryInput");
const locationLabelInput = document.getElementById("locationLabelInput");
const productFocusInput = document.getElementById("productFocusInput");
const businessDescriptionInput = document.getElementById("businessDescriptionInput");
const createProfileBtn = document.getElementById("createProfileBtn");

function setStatus(message, type = "neutral") {
  if (!authStatus) return;

  authStatus.textContent = message;
  authStatus.dataset.status = type;
}

function getMarketplaceRolesFromInput(value) {
  if (value === "buyer_seller") {
    return ["buyer", "seller"];
  }

  return [value];
}

function renderSignedOutState() {
  setStatus("Not signed in yet.");
  profileSetupCard?.classList.add("hidden");
  profileSummaryCard?.classList.add("hidden");
}

function renderProfileSummary(profile) {
  if (!profile) return;

  if (profileSummaryText) {
    const roles = profile.marketplace_roles?.join(" + ") || "role pending";
    const categories = profile.business_categories?.join(", ") || "category pending";

    profileSummaryText.textContent =
      `${profile.name} · ${roles} · ${categories} · ${profile.location_label || "Location pending"}`;
  }

  profileSetupCard?.classList.add("hidden");
  profileSummaryCard?.classList.remove("hidden");
}

async function refreshAccountState() {
  const user = await window.LocalityAuthService?.getCurrentUser?.();

  if (!user) {
    renderSignedOutState();
    return;
  }

  setStatus(`Signed in as ${user.email}`, "success");

  const { data: profile, error } =
    await window.LocalityProfileService.getMyPrimaryBusinessProfile();

  if (error) {
    console.warn("Profile lookup error:", error);
  }

  if (profile) {
    renderProfileSummary(profile);
  } else {
    profileSetupCard?.classList.remove("hidden");
    profileSummaryCard?.classList.add("hidden");
  }
}

createAccountBtn?.addEventListener("click", async () => {
  const email = accountEmail?.value.trim();
  const password = accountPassword?.value;

  if (!email || !password) {
    setStatus("Enter an email and password first.", "error");
    return;
  }

  setStatus("Creating account...");

  const { data, error } = await window.LocalityAuthService.signUpWithEmail(
    email,
    password
  );

  if (error) {
    setStatus(error.message || "Account creation failed.", "error");
    console.error(error);
    return;
  }

  setStatus("Account created. Checking session...", "success");
  console.log("Signup result:", data);

  await refreshAccountState();
});

signInBtn?.addEventListener("click", async () => {
  const email = accountEmail?.value.trim();
  const password = accountPassword?.value;

  if (!email || !password) {
    setStatus("Enter an email and password first.", "error");
    return;
  }

  setStatus("Signing in...");

  const { data, error } = await window.LocalityAuthService.signInWithEmail(
    email,
    password
  );

  if (error) {
    setStatus(error.message || "Sign in failed.", "error");
    console.error(error);
    return;
  }

  setStatus("Signed in.", "success");
  console.log("Sign in result:", data);

  await refreshAccountState();
});

signOutBtn?.addEventListener("click", async () => {
  await window.LocalityAuthService.signOut();

  accountPassword.value = "";
  renderSignedOutState();
});

createProfileBtn?.addEventListener("click", async () => {
  const name = businessNameInput?.value.trim();
  const roleValue = marketplaceRoleInput?.value;
  const categoryValue = businessCategoryInput?.value;

  if (!name) {
    setStatus("Business name is required.", "error");
    return;
  }

  setStatus("Creating business profile...");

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
    setStatus(error.message || "Profile creation failed.", "error");
    console.error(error);
    return;
  }

  setStatus("Business profile created.", "success");
  renderProfileSummary(data);
});

refreshAccountState();
