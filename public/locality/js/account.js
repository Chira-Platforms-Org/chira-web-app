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
  if (!signInSubmit) return;

  signInSubmit.disabled = isLoading;
  signInSubmit.textContent = isLoading ? "Signing in..." : "Sign in";
}

async function routeAfterSignIn() {
  const { data: profile, error } =
    await window.LocalityProfileService.getMyPrimaryBusinessProfile();

  if (error) {
    console.warn("Profile lookup error:", error);
  }

if (profile?.onboarding_completed === true) {
  window.location.href = "supplier.html";
} else {
  window.location.href = "signup.html";
}

signInForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = signInEmail?.value.trim();
  const password = signInPassword?.value;

  if (!email || !password) {
    setStatus("Enter your email and password first.", "error");
    return;
  }

  setLoading(true);
  setStatus("Checking your account...");

  const { error } = await window.LocalityAuthService.signInWithEmail(
    email,
    password
  );

  if (error) {
    setLoading(false);
    setStatus(error.message || "Sign in failed.", "error");
    console.error(error);
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

  setStatus("Sending password reset email...");

  const { error } = await window.LocalityAuthService.resetPasswordForEmail(email);

  if (error) {
    setStatus(error.message || "Unable to send reset email.", "error");
    console.error(error);
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
