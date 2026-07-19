/* =========================
   MY LOCALITY ROLE ROUTER

   /my-locality decides where the user belongs:
   - Private buyer → /my-locality/private
   - Business user → /my-locality/business
   - Signed out → account.html
========================= */

const routerStatus =
  document.getElementById("myLocalityRouterStatus");

function setRouterStatus(message) {
  if (routerStatus) {
    routerStatus.textContent = message;
  }
}

function routeTo(path) {
  window.location.replace(path);
}

async function getUserProfile(userId) {
  if (!window.LocalitySupabase || !userId) {
    return {
      data: null,
      error: "Supabase is unavailable."
    };
  }

  return await window.LocalitySupabase
    .from("user_profiles")
    .select(
      [
        "full_name",
        "buyer_display_name",
        "locality_account_type",
        "onboarding_completed",
        "onboarding_step"
      ].join(", ")
    )
    .eq("id", userId)
    .maybeSingle();
}

async function getBusinessProfile() {
  if (
    !window.LocalityProfileService
      ?.getMyPrimaryBusinessProfile
  ) {
    return {
      data: null,
      error: null
    };
  }

  return await window.LocalityProfileService
    .getMyPrimaryBusinessProfile();
}

function isBusinessAccountType(userProfile = {}) {
  const accountType =
    String(
      userProfile.locality_account_type || ""
    ).toLowerCase();

  return [
    "business",
    "business_account",
    "business_buyer",
    "business_seller",
    "buyer_seller"
  ].includes(accountType);
}

async function routeMyLocality() {
  try {
    setRouterStatus(
      "Checking whether you are signed in..."
    );

    if (
      !window.LocalityAuthService
        ?.getCurrentUser ||
      !window.LocalitySupabase
    ) {
      setRouterStatus(
        "Locality services are unavailable. Please refresh the page."
      );

      return;
    }

    const user =
      await window.LocalityAuthService
        .getCurrentUser();

    if (!user) {
      routeTo("account.html");
      return;
    }

    setRouterStatus(
      "Loading your Locality account..."
    );

    const [
      userProfileResult,
      businessProfileResult
    ] = await Promise.all([
      getUserProfile(user.id),
      getBusinessProfile()
    ]);

    if (userProfileResult.error) {
      console.warn(
        "Unable to load user profile:",
        userProfileResult.error
      );
    }

    if (businessProfileResult.error) {
      console.warn(
        "Unable to load business profile:",
        businessProfileResult.error
      );
    }

    const userProfile =
      userProfileResult.data || {};

    const businessProfile =
      businessProfileResult.data || null;

    /*
      Any account with a business profile belongs
      in the business workspace, including:
      - business buyer
      - seller
      - buyer & seller
    */
    if (businessProfile) {
      setRouterStatus(
        "Opening your business workspace..."
      );

      routeTo("/my-locality/business");
      return;
    }

    /*
      If the user chose business signup but has no
      business profile yet, send them back into setup.
    */
    if (isBusinessAccountType(userProfile)) {
      setRouterStatus(
        "Continuing your business setup..."
      );

      routeTo("signup.html");
      return;
    }

    setRouterStatus(
      "Opening your personal Locality workspace..."
    );

    routeTo("/my-locality/private");
  } catch (error) {
    console.error(
      "Unable to route My Locality:",
      error
    );

    setRouterStatus(
      "Something went wrong while opening My Locality. Please refresh the page."
    );
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    routeMyLocality
  );
} else {
  routeMyLocality();
}
