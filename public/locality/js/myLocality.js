const buyerWelcomeTitle = document.getElementById("buyerWelcomeTitle");
const buyerWelcomeText = document.getElementById("buyerWelcomeText");
const buyerLocationLabel = document.getElementById("buyerLocationLabel");
const buyerRadiusLabel = document.getElementById("buyerRadiusLabel");

async function loadMyLocality() {
  if (!window.LocalityAuthService?.getCurrentUser || !window.LocalitySupabase) {
    return;
  }

  const user = await window.LocalityAuthService.getCurrentUser();

  if (!user) {
    window.location.href = "account.html";
    return;
  }

  const { data, error } = await window.LocalitySupabase
    .from("user_profiles")
    .select("full_name, buyer_display_name, buyer_location_label, buyer_radius_miles, locality_account_type")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("Unable to load My Locality profile:", error);
  }

  const displayName = data?.buyer_display_name || data?.full_name || "there";
  const location = data?.buyer_location_label || "Set your location";
  const radius = data?.buyer_radius_miles || 25;

  if (buyerWelcomeTitle) {
    buyerWelcomeTitle.textContent = `Welcome, ${displayName}.`;
  }

  if (buyerWelcomeText) {
    buyerWelcomeText.textContent =
      "Discover local food nearby, save farms and products you care about, and keep future orders organized in one simple place.";
  }

  if (buyerLocationLabel) {
    buyerLocationLabel.textContent = location;
  }

  if (buyerRadiusLabel) {
    buyerRadiusLabel.textContent = `${radius} mile discovery radius`;
  }
}

loadMyLocality();
