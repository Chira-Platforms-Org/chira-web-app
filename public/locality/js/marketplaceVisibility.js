/* =========================
   LOCALITY MARKETPLACE VISIBILITY
========================= */

(function () {
  function hasValidCoordinates(profile = {}) {
    return (
      Number.isFinite(Number(profile.latitude)) &&
      Number.isFinite(Number(profile.longitude))
    );
  }

  function isActiveProfile(profile = {}) {
    return (
      !profile.status ||
      profile.status === "active"
    );
  }

  function getStatus(profile = {}) {
    const isPublished =
      profile.profile_visibility === "public";

    const isActive =
      isActiveProfile(profile);

    const hasCoordinates =
      hasValidCoordinates(profile);

    const locationConfirmed =
      profile.location_confirmed === true;

    if (!isPublished) {
      return {
        status: "draft",
        label: "Draft profile",
        detail:
          "Publish this profile before it can appear in Marketplace.",
        tone: "neutral",
        visible: false
      };
    }

    if (!isActive) {
      return {
        status: "inactive",
        label: "Profile inactive",
        detail:
          "Reactivate this business profile before it can appear in Marketplace.",
        tone: "warning",
        visible: false
      };
    }

    if (!hasCoordinates) {
      return {
        status: "missing-location",
        label: "Location needed",
        detail:
          "Add a map location before this business can appear in Marketplace.",
        tone: "warning",
        visible: false
      };
    }

    if (!locationConfirmed) {
      return {
        status: "location-unconfirmed",
        label: "Location needs confirmation",
        detail:
          "Confirm the map pin before this business can appear in Marketplace.",
        tone: "warning",
        visible: false
      };
    }

    return {
      status: "visible",
      label: "Public in Marketplace",
      detail:
        "This business is public, active, mapped, and visible in Marketplace.",
      tone: "success",
      visible: true
    };
  }

  function getRequirements(profile = {}) {
    return [
      {
        key: "published",
        label: "Profile set to public",
        met:
          profile.profile_visibility === "public"
      },
      {
        key: "active",
        label: "Business profile active",
        met: isActiveProfile(profile)
      },
      {
        key: "coordinates",
        label: "Map coordinates saved",
        met: hasValidCoordinates(profile)
      },
      {
        key: "location-confirmed",
        label: "Location confirmed",
        met:
          profile.location_confirmed === true
      }
    ];
  }

  window.LocalityMarketplaceVisibility = {
    hasValidCoordinates,
    getStatus,
    getRequirements
  };
})();
