/* =========================
   LOCALITY SIGN-IN PAGE
========================= */

const signInForm = document.getElementById("signInForm");
const signInEmail = document.getElementById("signInEmail");
const signInPassword = document.getElementById("signInPassword");
const signInSubmit = document.getElementById("signInSubmit");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const authStatus = document.getElementById("authStatus");

function setStatus(message, type = "neutral") {
  if (!authStatus) return;

  authStatus.textContent = message;
  authStatus.dataset.status = type;
}

function setLoading(isLoading) {
  if (signInSubmit) {
    signInSubmit.disabled = isLoading;
    signInSubmit.textContent = isLoading ? "Signing in..." : "Sign in";
  }

  if (signInEmail) signInEmail.disabled = isLoading;
  if (signInPassword) signInPassword.disabled = isLoading;
}

function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.details) return error.details;
  return fallback;
}

async function getSignedInUserProfile(userId) {
  if (!window.LocalitySupabase || !userId) {
    return { data: null, error: "Missing Supabase client or user id." };
  }

  return await window.LocalitySupabase
    .from("user_profiles")
    .select(
      "id, full_name, locality_account_type, onboarding_completed, onboarding_step, buyer_display_name"
    )
    .eq("id", userId)
    .maybeSingle();
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

function profileHasSellerRole(profile) {
  const roles = parseArray(profile?.marketplace_roles);

  return (
    roles.includes("seller") ||
    roles.includes("buyer_seller") ||
    roles.includes("buyer / seller")
  );
}

function getBusinessProfileRoute(profile) {
  if (!profile) {
    return "signup.html";
  }

  const onboardingStep = profile.onboarding_step || "";
  const onboardingCompleted = profile.onboarding_completed === true;
  const profileSetupCompleted = profile.profile_setup_completed === true;
  const supplySetupCompleted = profile.supply_setup_completed === true;
  const isSeller = profileHasSellerRole(profile);

  if (
    onboardingStep === "profile_builder_started" ||
    onboardingStep === "profile_builder_draft" ||
    !profileSetupCompleted
  ) {
    return "profile-builder.html?setup=1";
  }

  if (isSeller && !supplySetupCompleted && !onboardingCompleted) {
    return "supply-builder.html?setup=1";
  }

  if (onboardingCompleted || profileSetupCompleted) {
    return "supplier.html";
  }

  return "signup.html";
}

async function routeAfterSignIn() {
  if (!window.LocalityAuthService?.getCurrentUser) {
    setStatus("Auth service is unavailable. Please refresh and try again.", "error");
    setLoading(false);
    return;
  }

  const user = await window.LocalityAuthService.getCurrentUser();

  if (!user) {
    setStatus("Signed in, but the session could not be loaded. Please refresh and try again.", "error");
    setLoading(false);
    return;
  }

  const { data: userProfile, error: userProfileError } = await getSignedInUserProfile(user.id);

  if (userProfileError) {
    console.warn("User profile lookup error:", userProfileError);
  }

  if (userProfile?.locality_account_type === "personal_buyer") {
    window.location.href = "my-locality.html";
    return;
  }

  if (!window.LocalityProfileService?.getMyPrimaryBusinessProfile) {
    setStatus("Profile service is unavailable. Please refresh and try again.", "error");
    setLoading(false);
    return;
  }

  const { data: businessProfile, error: businessProfileError } =
    await window.LocalityProfileService.getMyPrimaryBusinessProfile();

  if (businessProfileError) {
    console.warn("Business profile lookup error:", businessProfileError);
  }

  window.location.href = getBusinessProfileRoute(businessProfile);
}

signInForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = signInEmail?.value.trim();
  const password = signInPassword?.value;

  if (!email || !password) {
    setStatus("Enter your email and password first.", "error");
    return;
  }

  if (!window.LocalityAuthService?.signInWithEmail) {
    setStatus("Auth service is unavailable. Please refresh and try again.", "error");
    return;
  }

  setLoading(true);
  setStatus("Checking your account...");

  const { error } = await window.LocalityAuthService.signInWithEmail(email, password);

  if (error) {
    setLoading(false);
    setStatus(getErrorMessage(error, "Sign in failed."), "error");
    console.error("Sign in error:", error);
    return;
  }

  setStatus("Signed in. Opening your workspace...", "success");
  await routeAfterSignIn();
});

forgotPasswordBtn?.addEventListener("click", async () => {
  const email = signInEmail?.value.trim();

  if (!email) {
    setStatus("Enter your email first, then click forgot password.", "error");
    return;
  }

  if (!window.LocalityAuthService?.resetPasswordForEmail) {
    setStatus("Auth service is unavailable. Please refresh and try again.", "error");
    return;
  }

  setStatus("Sending password reset email...");

  const { error } = await window.LocalityAuthService.resetPasswordForEmail(email);

  if (error) {
    setStatus(getErrorMessage(error, "Unable to send reset email."), "error");
    console.error("Password reset error:", error);
    return;
  }

  setStatus("Password reset email sent. Check your inbox.", "success");
});

const signInPasswordToggle = document.querySelector(
  '[data-password-target="signInPassword"]'
);

signInPasswordToggle?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

  const input = document.getElementById("signInPassword");

  if (!input) {
    console.warn("signInPassword input not found.");
    return;
  }

  const shouldShow = input.type === "password";

  input.type = shouldShow ? "text" : "password";
  signInPasswordToggle.textContent = shouldShow ? "Hide" : "Show";
});
