/* =========================
   LOCALITY PUBLIC PROFILE PREVIEW
   Option A: signed-in user's own public profile preview
========================= */

const publicProfileLoading = document.getElementById("publicProfileLoading");
const publicProfileEmpty = document.getElementById("publicProfileEmpty");
const publicProfilePage = document.getElementById("publicProfilePage");

const publicBannerImage = document.getElementById("publicBannerImage");
const publicBannerFallback = document.getElementById("publicBannerFallback");
const publicLogoImage = document.getElementById("publicLogoImage");
const publicLogoFallback = document.getElementById("publicLogoFallback");

const publicBusinessName = document.getElementById("publicBusinessName");
const publicMetaLine = document.getElementById("publicMetaLine");
const publicAddressText = document.getElementById("publicAddressText");
const publicWebsiteText = document.getElementById("publicWebsiteText");
const publicEmailText = document.getElementById("publicEmailText");
const publicPhoneText = document.getElementById("publicPhoneText");

const publicRoleChip = document.getElementById("publicRoleChip");
const publicCategoryChip = document.getElementById("publicCategoryChip");
const publicTrustChip = document.getElementById("publicTrustChip");

const publicSummarySection = document.getElementById("publicSummarySection");
const publicShortIntro = document.getElementById("publicShortIntro");

const publicGallerySection = document.getElementById("publicGallerySection");
const publicGalleryStrip = document.getElementById("publicGalleryStrip");
const publicGalleryLeftBtn = document.getElementById("publicGalleryLeftBtn");
const publicGalleryRightBtn = document.getElementById("publicGalleryRightBtn");

const publicOrderingSection = document.getElementById("publicOrderingSection");
const publicOrderingGuidelines = document.getElementById("publicOrderingGuidelines");
const publicAboutSection = document.getElementById("publicAboutSection");
const publicAboutUs = document.getElementById("publicAboutUs");

const publicTeamSection = document.getElementById("publicTeamSection");
const publicTeamTitle = document.getElementById("publicTeamTitle");
const publicTeamGrid = document.getElementById("publicTeamGrid");

const publicCertificationsSection = document.getElementById("publicCertificationsSection");
const publicCertificationsList = document.getElementById("publicCertificationsList");

const publicContactCta = document.getElementById("publicContactCta");

function showState(state) {
  publicProfileLoading?.classList.toggle("hidden", state !== "loading");
  publicProfileEmpty?.classList.toggle("hidden", state !== "empty");
  publicProfilePage?.classList.toggle("hidden", state !== "profile");
}

function getJsonValue(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parseArray(value) {
  const parsed = getJsonValue(value, []);
  return Array.isArray(parsed) ? parsed : [];
}

function formatRole(roles) {
  const roleList = parseArray(roles);

  if (roleList.includes("buyer") && roleList.includes("seller")) {
    return "Buyer / Seller";
  }

  const role = roleList[0] || "seller";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatCategory(categories) {
  const categoryList = parseArray(categories);
  const category = categoryList[0] || "other";

  return category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPhoneForDisplay(phone = "") {
  const digits = String(phone).replace(/\D/g, "");

  if (digits.length !== 10) {
    return phone || "";
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function getAddressForDisplay(profile) {
  const address = getJsonValue(profile.address, {});

  const city = address.city || "";
  const state = address.state || "";

  if (city && state) {
    return `${city}, ${state}`;
  }

  return profile.location_label || "";
}

function setImage(imageElement, fallbackElement, url, altText) {
  if (!imageElement || !fallbackElement) return;

  if (url) {
    imageElement.src = url;
    imageElement.alt = altText || "";
    imageElement.classList.remove("hidden");
    fallbackElement.classList.add("hidden");
  } else {
    imageElement.src = "";
    imageElement.alt = "";
    imageElement.classList.add("hidden");
    fallbackElement.classList.remove("hidden");
  }
}

function setTextOrHideSection(sectionElement, textElement, value) {
  const cleanValue = String(value || "").trim();

  if (!sectionElement || !textElement) return;

  if (cleanValue) {
    textElement.textContent = cleanValue;
    sectionElement.classList.remove("hidden");
  } else {
    textElement.textContent = "";
    sectionElement.classList.add("hidden");
  }
}

function renderIdentity(profile) {
  const businessName = profile.name || "Business name";
  const location = profile.location_label || getAddressForDisplay(profile) || "Local business";
  const role = formatRole(profile.marketplace_roles);
  const category = formatCategory(profile.business_categories);

  document.title = `${businessName} | Locality`;

  if (publicBusinessName) publicBusinessName.textContent = businessName;
  if (publicMetaLine) publicMetaLine.textContent = `${location} • ${category} • ${role}`;

  if (publicRoleChip) publicRoleChip.textContent = role;
  if (publicCategoryChip) publicCategoryChip.textContent = category;

  if (publicTrustChip) {
    publicTrustChip.textContent = profile.profile_setup_completed
      ? "Profile completed"
      : "Profile preview";
  }

  setImage(
    publicBannerImage,
    publicBannerFallback,
    profile.banner_image_url,
    `${businessName} banner image`
  );

  setImage(
    publicLogoImage,
    publicLogoFallback,
    profile.logo_url,
    `${businessName} logo`
  );

  renderContactDetails(profile);
}

function renderContactDetails(profile) {
  const addressText = getAddressForDisplay(profile);
  const websiteText = profile.website || "";
  const emailText = profile.contact_email || "";
  const phoneText = formatPhoneForDisplay(profile.phone || "");

  if (publicAddressText) {
    publicAddressText.textContent = addressText || "Location details";
  }

  if (publicWebsiteText) {
    if (websiteText) {
      const websiteHref = websiteText.startsWith("http")
        ? websiteText
        : `https://${websiteText}`;

      publicWebsiteText.textContent = websiteText.replace(/^https?:\/\//, "");
      publicWebsiteText.href = websiteHref;
      publicWebsiteText.classList.remove("hidden");
    } else {
      publicWebsiteText.classList.add("hidden");
    }
  }

  if (publicEmailText) {
    if (emailText) {
      publicEmailText.textContent = emailText;
      publicEmailText.href = `mailto:${emailText}`;
      publicEmailText.classList.remove("hidden");
    } else {
      publicEmailText.classList.add("hidden");
    }
  }

  if (publicPhoneText) {
    if (phoneText) {
      publicPhoneText.textContent = phoneText;
      publicPhoneText.href = `tel:${String(profile.phone || "").replace(/\D/g, "")}`;
      publicPhoneText.classList.remove("hidden");
    } else {
      publicPhoneText.classList.add("hidden");
    }
  }

  if (publicContactCta) {
    if (emailText) {
      publicContactCta.textContent = "Contact business";
      publicContactCta.href = `mailto:${emailText}`;
      publicContactCta.classList.remove("hidden");
    } else if (websiteText) {
      const websiteHref = websiteText.startsWith("http")
        ? websiteText
        : `https://${websiteText}`;

      publicContactCta.textContent = "Visit website";
      publicContactCta.href = websiteHref;
      publicContactCta.classList.remove("hidden");
      publicContactCta.target = "_blank";
      publicContactCta.rel = "noopener";
    } else {
      publicContactCta.classList.add("hidden");
    }
  }
}

function renderSummary(profile) {
  const summary =
    profile.short_intro ||
    profile.description ||
    "This business has not added a public profile summary yet.";

  if (publicShortIntro) {
    publicShortIntro.textContent = summary;
  }

  publicSummarySection?.classList.remove("hidden");
}

function renderGallery(profile) {
  const images = parseArray(profile.gallery_images);

  if (!publicGalleryStrip || !publicGallerySection) return;

  publicGalleryStrip.innerHTML = "";

  if (!images.length) {
    publicGallerySection.classList.add("hidden");
    return;
  }

  images.forEach((image) => {
    if (!image?.url) return;

    const card = document.createElement("div");
    card.className = "public-gallery-card";

    const img = document.createElement("img");
    img.src = image.url;
    img.alt = image.caption || "Business gallery image";

    function setGalleryCardRatio() {
      if (!img.naturalWidth || !img.naturalHeight) return;

      const ratio = img.naturalWidth / img.naturalHeight;
      const safeRatio = Math.max(0.55, Math.min(ratio, 1.85));

      card.style.setProperty("--public-gallery-card-ratio", safeRatio);
    }

    img.addEventListener("load", setGalleryCardRatio);

    if (img.complete) {
      setGalleryCardRatio();
    }

    card.appendChild(img);

    if (image.caption) {
      const caption = document.createElement("span");
      caption.className = "public-gallery-caption";
      caption.textContent = image.caption;
      card.appendChild(caption);
    }

    publicGalleryStrip.appendChild(card);
  });

  publicGallerySection.classList.toggle(
    "hidden",
    publicGalleryStrip.children.length === 0
  );
}

function renderStorySections(profile) {
  setTextOrHideSection(
    publicOrderingSection,
    publicOrderingGuidelines,
    profile.ordering_guidelines
  );

  setTextOrHideSection(
    publicAboutSection,
    publicAboutUs,
    profile.about_us
  );
}

function renderTeam(profile) {
  const teamMembers = parseArray(profile.team_members);

  if (!publicTeamSection || !publicTeamGrid) return;

  publicTeamGrid.innerHTML = "";

  if (!teamMembers.length) {
    publicTeamSection.classList.add("hidden");
    return;
  }

  if (publicTeamTitle) {
    publicTeamTitle.textContent = profile.name
      ? `Meet the people behind ${profile.name}`
      : "Meet the team";
  }

  teamMembers.forEach((member) => {
    const card = document.createElement("article");
    card.className = "public-team-card";

    const photoFrame = document.createElement("div");
    photoFrame.className = "public-team-photo";

    if (member.photo_url) {
      const photo = document.createElement("img");
      photo.src = member.photo_url;
      photo.alt = member.name ? `${member.name} portrait` : "Team member portrait";
      photoFrame.appendChild(photo);
    } else {
      const placeholder = document.createElement("span");
      placeholder.textContent = "Photo";
      photoFrame.appendChild(placeholder);
    }

    const name = document.createElement("h3");
    name.textContent = member.name || "Team member";

    const role = document.createElement("span");
    role.className = "public-team-role";
    role.textContent = member.role || "Locality contact";

    card.appendChild(photoFrame);
    card.appendChild(name);
    card.appendChild(role);

    if (member.bio) {
      const bio = document.createElement("p");
      bio.className = "public-team-bio";
      bio.textContent = member.bio;
      card.appendChild(bio);
    }

    publicTeamGrid.appendChild(card);
  });

  publicTeamSection.classList.remove("hidden");
}

function renderCertifications(profile) {
  const certifications = parseArray(profile.certifications);

  if (!publicCertificationsSection || !publicCertificationsList) return;

  publicCertificationsList.innerHTML = "";

  if (!certifications.length) {
    publicCertificationsSection.classList.add("hidden");
    return;
  }

  certifications.forEach((certification) => {
    if (!certification?.name) return;

    const badge = document.createElement("span");
    badge.className = "public-certification-badge";
    badge.textContent = certification.name;

    publicCertificationsList.appendChild(badge);
  });

  publicCertificationsSection.classList.toggle(
    "hidden",
    publicCertificationsList.children.length === 0
  );
}

function scrollPublicGallery(direction) {
  if (!publicGalleryStrip) return;

  const scrollAmount = Math.max(360, publicGalleryStrip.clientWidth * 0.72);

  publicGalleryStrip.scrollBy({
    left: direction * scrollAmount,
    behavior: "smooth"
  });
}

async function getProfileForThisPage() {
  if (!window.LocalityAuthService?.getCurrentUser) {
    console.error("LocalityAuthService is not available.");
    return null;
  }

  if (!window.LocalityProfileService?.getMyPrimaryBusinessProfile) {
    console.error("LocalityProfileService is not available.");
    return null;
  }

  const user = await window.LocalityAuthService.getCurrentUser();

  if (!user) {
    window.location.href = "account.html";
    return null;
  }

  const { data, error } =
    await window.LocalityProfileService.getMyPrimaryBusinessProfile();

  if (error) {
    console.error("Unable to load public profile preview:", error);
    return null;
  }

  return data;
}

function renderPublicProfile(profile) {
  renderIdentity(profile);
  renderSummary(profile);
  renderGallery(profile);
  renderStorySections(profile);
  renderTeam(profile);
  renderCertifications(profile);

  showState("profile");
}

async function loadPublicProfilePreview() {
  showState("loading");

  const profile = await getProfileForThisPage();

  if (!profile) {
    showState("empty");
    return;
  }

  renderPublicProfile(profile);
}

publicGalleryLeftBtn?.addEventListener("click", () => {
  scrollPublicGallery(-1);
});

publicGalleryRightBtn?.addEventListener("click", () => {
  scrollPublicGallery(1);
});

document.addEventListener("DOMContentLoaded", loadPublicProfilePreview);
