const buyerWelcomeTitle = document.getElementById("buyerWelcomeTitle");
const buyerWelcomeText = document.getElementById("buyerWelcomeText");
const buyerLocationLabel = document.getElementById("buyerLocationLabel");
const buyerRadiusLabel = document.getElementById("buyerRadiusLabel");

function getFirstName(name = "") {
  const cleanName = String(name || "").trim();

  if (!cleanName) return "there";

  return cleanName.split(/\s+/)[0];
}

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
  const firstName = getFirstName(displayName);
  const location = data?.buyer_location_label || "Set your location";
  const radius = data?.buyer_radius_miles || 25;

  if (buyerWelcomeTitle) {
    buyerWelcomeTitle.textContent = `Your local food week, ${firstName}.`;
  }

  if (buyerWelcomeText) {
    buyerWelcomeText.textContent =
      "See what is fresh nearby, follow trusted farms, reserve limited goods, and build local food into your normal routine.";
  }

  if (buyerLocationLabel) {
    buyerLocationLabel.textContent = location;
  }

  if (buyerRadiusLabel) {
    buyerRadiusLabel.textContent = `${radius} mile discovery radius`;
  }
}

loadMyLocality();
