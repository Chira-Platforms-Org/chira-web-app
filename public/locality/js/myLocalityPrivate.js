/* =========================
   PRIVATE BUYER MY LOCALITY
========================= */

const buyerWelcomeTitle =
  document.getElementById("buyerWelcomeTitle");

const buyerWelcomeText =
  document.getElementById("buyerWelcomeText");

const buyerLocationLabel =
  document.getElementById("buyerLocationLabel");

const buyerRadiusLabel =
  document.getElementById("buyerRadiusLabel");

function getFirstName(name = "") {
  const cleanName =
    String(name || "").trim();

  if (!cleanName) return "there";

  return cleanName.split(/\s+/)[0];
}

function getBuyerDisplayName(
  userProfile = {},
  user = {}
) {
  return (
    userProfile.buyer_display_name ||
    userProfile.full_name ||
    user.email?.split("@")[0] ||
    "there"
  );
}

function getBuyerLocationLabel(userProfile = {}) {
  return (
    userProfile.buyer_location_label ||
    [
      userProfile.buyer_city,
      userProfile.buyer_state
    ]
      .filter(Boolean)
      .join(", ") ||
    "Set your location"
  );
}

function renderPrivateBuyerDashboard({
  user,
  userProfile
}) {
  const displayName =
    getBuyerDisplayName(userProfile, user);

  const firstName =
    getFirstName(displayName);

  const location =
    getBuyerLocationLabel(userProfile);

  const radius =
    Number(
      userProfile.buyer_radius_miles || 25
    );

  if (buyerWelcomeTitle) {
    buyerWelcomeTitle.textContent =
      `Your local food week, ${firstName}.`;
  }

  if (buyerWelcomeText) {
    buyerWelcomeText.textContent =
      "Discover nearby products, follow trusted local food businesses, save favorites, and build local food into your normal routine.";
  }

  if (buyerLocationLabel) {
    buyerLocationLabel.textContent =
      location;
  }

  if (buyerRadiusLabel) {
    buyerRadiusLabel.textContent =
      `${radius} mile discovery radius`;
  }
}

async function loadPrivateBuyerDashboard() {
  if (
    !window.LocalityAuthService
      ?.getCurrentUser ||
    !window.LocalitySupabase
  ) {
    return;
  }

  const user =
    await window.LocalityAuthService
      .getCurrentUser();

  if (!user) {
    window.location.replace("account.html");
    return;
  }

  /*
    Guardrail: if a business account directly visits
    /my-locality/private, send it back through the
    universal router.
  */
  if (
    window.LocalityProfileService
      ?.getMyPrimaryBusinessProfile
  ) {
    const businessResult =
      await window.LocalityProfileService
        .getMyPrimaryBusinessProfile();

    if (businessResult.data) {
      window.location.replace(
        "/my-locality/business"
      );

      return;
    }
  }

  const { data, error } =
    await window.LocalitySupabase
      .from("user_profiles")
      .select(
        [
          "full_name",
          "buyer_display_name",
          "buyer_location_label",
          "buyer_city",
          "buyer_state",
          "buyer_zip_code",
          "buyer_radius_miles",
          "buyer_interests",
          "locality_account_type"
        ].join(", ")
      )
      .eq("id", user.id)
      .maybeSingle();

  if (error) {
    console.warn(
      "Unable to load private buyer profile:",
      error
    );
  }

  renderPrivateBuyerDashboard({
    user,
    userProfile: data || {}
  });
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    loadPrivateBuyerDashboard
  );
} else {
  loadPrivateBuyerDashboard();
}
