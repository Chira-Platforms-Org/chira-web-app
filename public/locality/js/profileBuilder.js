/* =========================
   LOCALITY PROFILE BUILDER
========================= */

const builderSaveDraftBtn = document.getElementById("builderSaveDraftBtn");
const builderFinishBtn = document.getElementById("builderFinishBtn");
const builderStatusText = document.getElementById("builderStatusText");

const builderCompletionPercent = document.getElementById("builderCompletionPercent");
const builderCompletionBar = document.getElementById("builderCompletionBar");
const builderCompletionList = document.getElementById("builderCompletionList");

const profileBusinessName = document.getElementById("profileBusinessName");
const profileMetaLine = document.getElementById("profileMetaLine");
const profileRoleChip = document.getElementById("profileRoleChip");
const profileCategoryChip = document.getElementById("profileCategoryChip");
const profileContactChip = document.getElementById("profileContactChip");

const profileContactLine = document.getElementById("profileContactLine");
const profileAddressText = document.getElementById("profileAddressText");
const profileWebsiteText = document.getElementById("profileWebsiteText");
const profileEmailText = document.getElementById("profileEmailText");
const profilePhoneText = document.getElementById("profilePhoneText");
const teamSectionTitle = document.getElementById("teamSectionTitle");

const logoUploadBtn = document.getElementById("logoUploadBtn");
const bannerUploadBtn = document.getElementById("bannerUploadBtn");
const galleryUploadBtn = document.getElementById("galleryUploadBtn");

const logoFileInput = document.getElementById("logoFileInput");
const bannerFileInput = document.getElementById("bannerFileInput");
const galleryFileInput = document.getElementById("galleryFileInput");

const logoPreviewImage = document.getElementById("logoPreviewImage");
const bannerPreviewImage = document.getElementById("bannerPreviewImage");
const logoPlaceholder = document.getElementById("logoPlaceholder");
const bannerPlaceholder = document.getElementById("bannerPlaceholder");
const galleryPreviewGrid = document.getElementById("galleryPreviewGrid");

const shortIntroInput = document.getElementById("shortIntroInput");
const aboutUsInput = document.getElementById("aboutUsInput");
const orderingGuidelinesInput = document.getElementById("orderingGuidelinesInput");

const shortIntroDisplay = document.getElementById("shortIntroDisplay");
const aboutUsDisplay = document.getElementById("aboutUsDisplay");
const orderingGuidelinesDisplay = document.getElementById("orderingGuidelinesDisplay");

const shortIntroCount = document.getElementById("shortIntroCount");
const aboutUsCount = document.getElementById("aboutUsCount");
const orderingGuidelinesCount = document.getElementById("orderingGuidelinesCount");

const addTeamMemberBtn = document.getElementById("addTeamMemberBtn");
const teamPreviewGrid = document.getElementById("teamPreviewGrid");

const teamMemberModal = document.getElementById("teamMemberModal");
const closeTeamMemberModalBtn = document.getElementById("closeTeamMemberModalBtn");
const cancelTeamMemberBtn = document.getElementById("cancelTeamMemberBtn");
const saveTeamMemberBtn = document.getElementById("saveTeamMemberBtn");

const teamMemberModalTitle = document.getElementById("teamMemberModalTitle");
const removeTeamMemberBtn = document.getElementById("removeTeamMemberBtn");

const teamPhotoUploadBtn = document.getElementById("teamPhotoUploadBtn");
const teamPhotoFileInput = document.getElementById("teamPhotoFileInput");
const teamPhotoPreview = document.getElementById("teamPhotoPreview");
const teamPhotoPlaceholder = document.getElementById("teamPhotoPlaceholder");

const teamMemberNameInput = document.getElementById("teamMemberNameInput");
const teamMemberRoleInput = document.getElementById("teamMemberRoleInput");
const teamMemberBioInput = document.getElementById("teamMemberBioInput");
const teamMemberModalStatus = document.getElementById("teamMemberModalStatus");

let teamMembers = [];
let pendingTeamPhoto = null;
let editingTeamMemberIndex = null;

const certificationsDisplayBtn = document.getElementById("certificationsDisplayBtn");
const certificationsEditorShell = document.getElementById("certificationsEditorShell");
const certificationsBadgeDisplay = document.getElementById("certificationsBadgeDisplay");
const cancelCertificationsEditBtn = document.getElementById("cancelCertificationsEditBtn");
const saveCertificationsDraftBtn = document.getElementById("saveCertificationsDraftBtn");
const markCertificationsCompleteBtn = document.getElementById("markCertificationsCompleteBtn");

const customCertificationInput = document.getElementById("customCertificationInput");
const addCustomCertificationBtn = document.getElementById("addCustomCertificationBtn");
const selectedCertificationsList = document.getElementById("selectedCertificationsList");
const profileVisibilityInput = document.getElementById("profileVisibilityInput");

let currentUser = null;
let currentProfile = null;
let profileGalleryImages = [];
let customCertifications = [];
let profileSectionStatus = {};

function setBuilderStatus(message) {
  if (builderStatusText) builderStatusText.textContent = message;
}

function getCleanValue(input) {
  return input?.value?.trim() || "";
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
  return getJsonValue(value, []);
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
    .replace("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function setImagePreview(imageElement, placeholderElement, url) {
  if (!imageElement || !url) return;

  imageElement.src = url;
  imageElement.classList.remove("hidden");

  if (placeholderElement) {
    placeholderElement.classList.add("hidden");
  }
}

function getSectionStatus(sectionKey) {
  return profileSectionStatus?.[sectionKey]?.status || "missing";
}

function setSectionStatus(sectionKey, status) {
  profileSectionStatus = {
    ...profileSectionStatus,
    [sectionKey]: {
      status,
      updated_at: new Date().toISOString()
    }
  };

  renderSectionStatus();
}

function markDraftIfHasValue(sectionKey, input) {
  const value = getCleanValue(input);

  if (!value) {
    setSectionStatus(sectionKey, "missing");
    return;
  }

  if (getSectionStatus(sectionKey) !== "complete") {
    setSectionStatus(sectionKey, "draft");
  }
}

function getSelectedCertifications() {
  const checkedCertifications = Array.from(
    document.querySelectorAll(".certification-option:checked")
  ).map((input) => ({
    name: input.value,
    type: "certification_or_practice",
    self_reported: true,
    verified: false,
    source: "profile_builder"
  }));

  const customItems = customCertifications.map((name) => ({
    name,
    type: "custom",
    self_reported: true,
    verified: false,
    source: "profile_builder"
  }));

  return [...checkedCertifications, ...customItems];
}

function renderSelectedCertifications() {
  const certs = getSelectedCertifications();

  if (selectedCertificationsList) {
    selectedCertificationsList.innerHTML = "";

    certs.forEach((cert) => {
      const chip = document.createElement("span");
      chip.textContent = cert.name;
      selectedCertificationsList.appendChild(chip);
    });
  }

  renderCertificationsDisplay(certs);

  if (certs.length) {
    if (getSectionStatus("certifications") !== "complete") {
      setSectionStatus("certifications", "draft");
    }
  } else {
    setSectionStatus("certifications", "missing");
  }
}

function renderCertificationsDisplay(certs = getSelectedCertifications()) {
  if (!certificationsBadgeDisplay) return;

  certificationsBadgeDisplay.innerHTML = "";

  if (!certs.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "certifications-empty-state";

    const title = document.createElement("strong");
    title.textContent = "Add certifications or practices";

    const description = document.createElement("span");
    description.textContent =
      "Share relevant standards, practices, or credentials that help buyers understand how you work.";

    emptyState.appendChild(title);
    emptyState.appendChild(description);
    certificationsBadgeDisplay.appendChild(emptyState);

    return;
  }

  certs.forEach((cert) => {
    const badge = document.createElement("span");
    badge.className = "certification-display-badge self-reported";
    badge.textContent = cert.name;
    certificationsBadgeDisplay.appendChild(badge);
  });
}

function renderGalleryPreview() {
  if (!galleryPreviewGrid || !galleryUploadBtn) return;

  galleryPreviewGrid
    .querySelectorAll(".gallery-image-card")
    .forEach((card) => card.remove());

  const ghostTiles = galleryPreviewGrid.querySelectorAll(".gallery-ghost-tile");

  const hasImages = profileGalleryImages.length > 0;

  galleryPreviewGrid.classList.toggle("gallery-empty-state", !hasImages);

  ghostTiles.forEach((tile) => {
    tile.classList.toggle("hidden", hasImages);
  });

  profileGalleryImages.forEach((image) => {
    const card = document.createElement("div");
    card.className = "gallery-image-card";

    const img = document.createElement("img");
    img.src = image.url;
    img.alt = image.caption || "Business gallery image";

    card.appendChild(img);
    galleryPreviewGrid.insertBefore(card, galleryUploadBtn);
  });

  setSectionStatus("gallery", hasImages ? "complete" : "missing");
}

function resetTeamMemberModal() {
  pendingTeamPhoto = null;
  editingTeamMemberIndex = null;

  if (teamMemberModalTitle) {
    teamMemberModalTitle.textContent = "Add a team member";
  }

  if (saveTeamMemberBtn) {
    saveTeamMemberBtn.textContent = "Save team member";
  }

  if (removeTeamMemberBtn) {
    removeTeamMemberBtn.classList.add("hidden");
  }

  if (teamMemberNameInput) teamMemberNameInput.value = "";
  if (teamMemberRoleInput) teamMemberRoleInput.value = "";
  if (teamMemberBioInput) teamMemberBioInput.value = "";

  if (teamPhotoPreview) {
    teamPhotoPreview.src = "";
    teamPhotoPreview.classList.add("hidden");
  }

  if (teamPhotoPlaceholder) {
    teamPhotoPlaceholder.classList.remove("hidden");
  }

  if (teamMemberModalStatus) {
    teamMemberModalStatus.textContent =
      "Team members are optional, but they help buyers connect with real people.";
  }
}

function openTeamMemberModal() {
  resetTeamMemberModal();

  if (!teamMemberModal) return;

  teamMemberModal.classList.remove("hidden");
  teamMemberModal.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    teamMemberNameInput?.focus();
  }, 50);
}

function openEditTeamMemberModal(index) {
  const member = teamMembers[index];

  if (!member || !teamMemberModal) return;

  editingTeamMemberIndex = index;
  pendingTeamPhoto = member.photo_url || null;

  if (teamMemberModalTitle) {
    teamMemberModalTitle.textContent = "Edit team member";
  }

  if (saveTeamMemberBtn) {
    saveTeamMemberBtn.textContent = "Save changes";
  }

  if (removeTeamMemberBtn) {
    removeTeamMemberBtn.classList.remove("hidden");
  }

  if (teamMemberNameInput) teamMemberNameInput.value = member.name || "";
  if (teamMemberRoleInput) teamMemberRoleInput.value = member.role || "";
  if (teamMemberBioInput) teamMemberBioInput.value = member.bio || "";

  if (teamPhotoPreview && member.photo_url) {
    teamPhotoPreview.src = member.photo_url;
    teamPhotoPreview.classList.remove("hidden");
  } else if (teamPhotoPreview) {
    teamPhotoPreview.src = "";
    teamPhotoPreview.classList.add("hidden");
  }

  if (teamPhotoPlaceholder) {
    teamPhotoPlaceholder.classList.toggle("hidden", Boolean(member.photo_url));
  }

  if (teamMemberModalStatus) {
    teamMemberModalStatus.textContent =
      "Update this team member’s public profile details.";
  }

  teamMemberModal.classList.remove("hidden");
  teamMemberModal.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    teamMemberNameInput?.focus();
  }, 50);
}

function closeTeamMemberModal() {
  if (!teamMemberModal) return;

  teamMemberModal.classList.add("hidden");
  teamMemberModal.setAttribute("aria-hidden", "true");
}
function renderTeamMembers() {
  if (!teamPreviewGrid || !addTeamMemberBtn) return;

  teamPreviewGrid
    .querySelectorAll(".team-member-card")
    .forEach((card) => card.remove());

  const ghostCards = teamPreviewGrid.querySelectorAll(".team-ghost-card");
  const hasTeamMembers = teamMembers.length > 0;

  ghostCards.forEach((card) => {
    card.classList.toggle("hidden", hasTeamMembers);
  });

  teamMembers.forEach((member, index) => {
    const card = document.createElement("div");
    card.className = "team-member-card";

   const editBtn = document.createElement("button");
   editBtn.type = "button";
   editBtn.className = "team-member-edit-btn";
   editBtn.textContent = "Edit";
   editBtn.addEventListener("click", () => {
     openEditTeamMemberModal(index);
   });
   
   const removeBtn = document.createElement("button");
   removeBtn.type = "button";
   removeBtn.className = "team-member-remove-btn";
   removeBtn.textContent = "Remove";
   removeBtn.addEventListener("click", async () => {
     const shouldRemove = confirm("Remove this team member from your profile?");
   
     if (!shouldRemove) return;
   
     teamMembers.splice(index, 1);
     renderTeamMembers();
     await saveProfile(false);
   });

   const photoFrame = document.createElement("div");
   photoFrame.className = "team-member-photo-frame";
   
   if (member.photo_url) {
     const photo = document.createElement("img");
     photo.src = member.photo_url;
     photo.alt = member.name ? `${member.name} portrait` : "Team member portrait";
     photoFrame.appendChild(photo);
   } else {
     const placeholder = document.createElement("div");
     placeholder.className = "team-member-photo-placeholder";
     placeholder.textContent = "Photo";
     photoFrame.appendChild(placeholder);
   }

   const name = document.createElement("h3");
   name.className = "team-member-name";
   name.textContent = member.name || "Team member";

    const role = document.createElement("span");
    role.className = "team-member-role";
    role.textContent = member.role || "Locality contact";

    const bio = document.createElement("p");
    bio.className = "team-member-bio";
    bio.textContent = member.bio || "";

    card.appendChild(editBtn);
    card.appendChild(removeBtn);
    card.appendChild(photoFrame);
    card.appendChild(name);
    card.appendChild(role);

    if (member.bio) {
      card.appendChild(bio);
    }

    teamPreviewGrid.insertBefore(card, addTeamMemberBtn);
  });

  const status = teamMembers.length ? "complete" : "missing";
  setSectionStatus("team_members", status);
}

function updateCharacterCount(input, counter, max) {
  if (!input || !counter) return;
  counter.textContent = `${input.value.length} / ${max}`;
}

const sectionConfig = {
  short_intro: {
    input: () => shortIntroInput,
    display: () => shortIntroDisplay,
    placeholder: "Add a short introduction that helps buyers quickly understand what you offer, who you serve, and what makes your business a good local sourcing partner."
  },
  about_us: {
    input: () => aboutUsInput,
    display: () => aboutUsDisplay,
    placeholder: "Tell buyers your story, how you work, what you care about, and the kinds of local sourcing relationships you want to build."
  },
  ordering_guidelines: {
    input: () => orderingGuidelinesInput,
    display: () => orderingGuidelinesDisplay,
    placeholder: "Add practical details that help buyers understand how to order from you, including minimums, lead times, pickup or delivery options, packaging, recurring orders, or seasonal expectations."
  }
};

function getSectionElement(sectionKey) {
  return document.querySelector(`.editable-profile-section[data-section-key="${sectionKey}"]`);
}

function getSectionEditor(sectionKey) {
  return document.querySelector(`[data-editor-section="${sectionKey}"]`);
}

function getSectionDisplayShell(sectionKey) {
  return document.querySelector(`[data-edit-section="${sectionKey}"]`);
}

function renderTextSectionDisplay(sectionKey) {
  const config = sectionConfig[sectionKey];

  if (!config) return;

  const input = config.input();
  const display = config.display();

  if (!input || !display) return;

  const value = getCleanValue(input);

  if (value) {
    display.textContent = value;
    display.classList.remove("empty");
  } else {
    display.textContent = config.placeholder;
    display.classList.add("empty");
  }
}

function renderAllTextSectionDisplays() {
  Object.keys(sectionConfig).forEach(renderTextSectionDisplay);
}

function openSectionEditor(sectionKey) {
  const sectionElement = getSectionElement(sectionKey);
  const editor = getSectionEditor(sectionKey);
  const displayShell = getSectionDisplayShell(sectionKey);
  const input = sectionConfig[sectionKey]?.input();

  if (!sectionElement || !editor || !displayShell || !input) return;

  sectionElement.dataset.editing = "true";
  editor.classList.remove("hidden");
  displayShell.classList.add("is-editing");

  setTimeout(() => {
    input.focus();
  }, 50);
}

function closeSectionEditor(sectionKey, shouldMarkDraft = true) {
  const sectionElement = getSectionElement(sectionKey);
  const editor = getSectionEditor(sectionKey);
  const displayShell = getSectionDisplayShell(sectionKey);
  const input = sectionConfig[sectionKey]?.input();

  if (!sectionElement || !editor || !displayShell || !input) return;

  if (shouldMarkDraft && getCleanValue(input)) {
    markDraftIfHasValue(sectionKey, input);
  }

  renderTextSectionDisplay(sectionKey);

  sectionElement.dataset.editing = "false";
  editor.classList.add("hidden");
  displayShell.classList.remove("is-editing");
}

function openCertificationsEditor() {
  const section = document.querySelector(".editable-certifications-section");

  section?.setAttribute("data-editing", "true");
  certificationsEditorShell?.classList.remove("hidden");

  setTimeout(() => {
    customCertificationInput?.focus();
  }, 50);
}

function closeCertificationsEditor() {
  const section = document.querySelector(".editable-certifications-section");

  section?.setAttribute("data-editing", "false");
  certificationsEditorShell?.classList.add("hidden");
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

function renderHeroContactDetails() {
  if (!currentProfile) return;

  const addressText = getAddressForDisplay(currentProfile);
  const websiteText = currentProfile.website || "";
  const emailText = currentProfile.contact_email || "";
  const phoneText = formatPhoneForDisplay(currentProfile.phone || "");

  if (profileAddressText) {
    profileAddressText.textContent = addressText || "Location details";
    profileAddressText.classList.toggle("muted-empty", !addressText);
  }

  if (profileWebsiteText) {
    profileWebsiteText.textContent = websiteText ? websiteText.replace(/^https?:\/\//, "") : "Website";
    profileWebsiteText.classList.toggle("muted-empty", !websiteText);
  }

  if (profileEmailText) {
    profileEmailText.textContent = emailText || "Email";
    profileEmailText.classList.toggle("muted-empty", !emailText);
  }

  if (profilePhoneText) {
    profilePhoneText.textContent = phoneText || "Phone";
    profilePhoneText.classList.toggle("muted-empty", !phoneText);
  }
}

function renderIdentity() {
  if (!currentProfile) return;

  const businessName = currentProfile.name || "Your business name";
  const location = currentProfile.location_label || "Your location";
  const role = formatRole(currentProfile.marketplace_roles);
  const category = formatCategory(currentProfile.business_categories);

  if (profileBusinessName) profileBusinessName.textContent = businessName;
  if (profileMetaLine) profileMetaLine.textContent = `${location} • ${category} • ${role}`;
  if (profileRoleChip) profileRoleChip.textContent = role;
  if (profileCategoryChip) profileCategoryChip.textContent = category;

  if (profileContactChip) {
    const hasContact = Boolean(
      currentProfile.contact_email ||
      currentProfile.phone ||
      currentProfile.website
    );

    profileContactChip.textContent = hasContact
      ? "Contact details added"
      : "Add public contact details";
  }

  renderHeroContactDetails();

  if (teamSectionTitle) {
    teamSectionTitle.textContent = currentProfile.name
      ? `Meet the people behind ${currentProfile.name}`
      : "Meet the team";
  }
}

function renderSectionStatus() {
  const trackedSections = [
     "logo",
     "banner",
     "short_intro",
     "gallery",
     "about_us",
     "team_members",
     "certifications",
     "ordering_guidelines"
   ];

  const completedSections = trackedSections.filter(
    (sectionKey) => getSectionStatus(sectionKey) === "complete"
  );

  const completionPercent = Math.round(
    (completedSections.length / trackedSections.length) * 100
  );

  if (builderCompletionPercent) {
    builderCompletionPercent.textContent = `${completionPercent}%`;
  }

  if (builderCompletionBar) {
    builderCompletionBar.style.width = `${completionPercent}%`;
  }

  trackedSections.forEach((sectionKey) => {
    const status = getSectionStatus(sectionKey);

    document
      .querySelectorAll(`[data-status-pill="${sectionKey}"]`)
      .forEach((pill) => {
        pill.textContent =
          status === "complete"
            ? "Complete"
            : status === "draft"
              ? "Draft"
              : "Missing";

        pill.dataset.status = status;
      });

    const listItem = builderCompletionList?.querySelector(
      `[data-completion-key="${sectionKey}"]`
    );

    if (listItem) {
      listItem.dataset.status = status;
    }
  });

  return completionPercent;
}

function hydrateBuilder(profile) {
  currentProfile = profile;

  profileSectionStatus = getJsonValue(profile.profile_section_status, {});
  profileGalleryImages = getJsonValue(profile.gallery_images, []);
  teamMembers = getJsonValue(profile.team_members, []);

  if (profile.logo_url) {
    setImagePreview(logoPreviewImage, logoPlaceholder, profile.logo_url);
    if (getSectionStatus("logo") === "missing") setSectionStatus("logo", "complete");
  }

  if (profile.banner_image_url) {
    setImagePreview(bannerPreviewImage, bannerPlaceholder, profile.banner_image_url);
    if (getSectionStatus("banner") === "missing") setSectionStatus("banner", "complete");
  }

  if (shortIntroInput) shortIntroInput.value = profile.short_intro || profile.description || "";
  if (aboutUsInput) aboutUsInput.value = profile.about_us || "";
  if (orderingGuidelinesInput) orderingGuidelinesInput.value = profile.ordering_guidelines || "";
  if (profileVisibilityInput) profileVisibilityInput.value = profile.profile_visibility || "draft";

  if (getCleanValue(shortIntroInput) && getSectionStatus("short_intro") === "missing") {
    setSectionStatus("short_intro", "draft");
  }

  if (getCleanValue(aboutUsInput) && getSectionStatus("about_us") === "missing") {
    setSectionStatus("about_us", "draft");
  }

  if (getCleanValue(orderingGuidelinesInput) && getSectionStatus("ordering_guidelines") === "missing") {
    setSectionStatus("ordering_guidelines", "draft");
  }

  const certifications = getJsonValue(profile.certifications, []);

  document.querySelectorAll(".certification-option").forEach((checkbox) => {
    checkbox.checked = certifications.some((cert) => cert.name === checkbox.value);
  });

  customCertifications = certifications
    .filter((cert) => cert.type === "custom")
    .map((cert) => cert.name);

  renderIdentity();
  renderGalleryPreview();
  renderTeamMembers();
  renderSelectedCertifications();
  closeCertificationsEditor();
  updateCharacterCount(shortIntroInput, shortIntroCount, 500);
  updateCharacterCount(aboutUsInput, aboutUsCount, 2000);
  updateCharacterCount(orderingGuidelinesInput, orderingGuidelinesCount, 1500);
  renderSectionStatus();
  renderAllTextSectionDisplays();

   Object.keys(sectionConfig).forEach((sectionKey) => {
     closeSectionEditor(sectionKey, false);
   });
}

function buildProfilePayload(markComplete = false) {
  const completionScore = renderSectionStatus();

  return {
    logo_url: logoPreviewImage?.src && !logoPreviewImage.classList.contains("hidden")
      ? logoPreviewImage.src
      : currentProfile.logo_url,

    banner_image_url: bannerPreviewImage?.src && !bannerPreviewImage.classList.contains("hidden")
      ? bannerPreviewImage.src
      : currentProfile.banner_image_url,

    description: getCleanValue(shortIntroInput),
    short_intro: getCleanValue(shortIntroInput),
    about_us: getCleanValue(aboutUsInput),
    gallery_images: profileGalleryImages,
    team_members: teamMembers,
    certifications: getSelectedCertifications(),
    ordering_guidelines: getCleanValue(orderingGuidelinesInput),

    profile_visibility: profileVisibilityInput?.value || "draft",
    profile_section_status: profileSectionStatus,
    profile_completion_score: completionScore,
    profile_setup_completed: markComplete,
    profile_last_edited_at: new Date().toISOString(),

    onboarding_step: markComplete ? "profile_created" : "profile_builder_draft",
    onboarding_completed: markComplete ? true : currentProfile.onboarding_completed || false,
    updated_at: new Date().toISOString()
  };
}

async function saveProfile(markComplete = false) {
  if (!currentProfile?.id) {
    alert("No business profile found.");
    return null;
  }

  const payload = buildProfilePayload(markComplete);

  const { data, error } = await window.LocalityProfileService.updateBusinessProfile(
    currentProfile.id,
    payload
  );

  if (error) {
    console.error("Unable to save profile:", error);
    alert(error.message || error || "Unable to save profile.");
    return null;
  }

  currentProfile = data;
  hydrateBuilder(data);

  setBuilderStatus(markComplete ? "Profile finished." : "Draft saved.");

  return data;
}

async function handleProfileMediaUpload(file, mediaType) {
  if (!currentProfile?.id) {
    alert("No business profile found.");
    return null;
  }

  if (!window.LocalityProfileMediaService?.uploadBusinessProfileMedia) {
    alert("Profile media upload service is not available.");
    return null;
  }

  setBuilderStatus("Uploading image...");

  const { data, error } =
    await window.LocalityProfileMediaService.uploadBusinessProfileMedia({
      file,
      businessProfileId: currentProfile.id,
      mediaType
    });

  if (error) {
    console.error("Upload error:", error);
    alert(error.message || error || "Unable to upload image.");
    setBuilderStatus("Upload failed.");
    return null;
  }

  setBuilderStatus("Image uploaded.");
  return data;
}

async function loadProfileBuilder() {
  currentUser = await window.LocalityAuthService.getCurrentUser();

  if (!currentUser) {
    window.location.href = "account.html";
    return;
  }

  const { data: profile, error } =
    await window.LocalityProfileService.getMyPrimaryBusinessProfile();

  if (error) {
    console.error("Unable to load business profile:", error);
    setBuilderStatus("Unable to load your profile.");
    return;
  }

  if (!profile) {
    window.location.href = "signup.html";
    return;
  }

  hydrateBuilder(profile);
  setBuilderStatus("Profile draft loaded.");
}

logoUploadBtn?.addEventListener("click", () => logoFileInput?.click());
bannerUploadBtn?.addEventListener("click", () => bannerFileInput?.click());
galleryUploadBtn?.addEventListener("click", () => galleryFileInput?.click());

logoFileInput?.addEventListener("change", async () => {
  const file = logoFileInput.files?.[0];
  if (!file) return;

  const uploaded = await handleProfileMediaUpload(file, "logo");
  if (!uploaded?.url) return;

  setImagePreview(logoPreviewImage, logoPlaceholder, uploaded.url);
  setSectionStatus("logo", "complete");
  await saveProfile(false);
});

bannerFileInput?.addEventListener("change", async () => {
  const file = bannerFileInput.files?.[0];
  if (!file) return;

  const uploaded = await handleProfileMediaUpload(file, "banner");
  if (!uploaded?.url) return;

  setImagePreview(bannerPreviewImage, bannerPlaceholder, uploaded.url);
  setSectionStatus("banner", "complete");
  await saveProfile(false);
});

galleryFileInput?.addEventListener("change", async () => {
  const files = Array.from(galleryFileInput.files || []);
  if (!files.length) return;

  for (const file of files) {
    const uploaded = await handleProfileMediaUpload(file, "gallery");

    if (uploaded?.url) {
      profileGalleryImages.push({
        url: uploaded.url,
        path: uploaded.path,
        caption: "",
        sort_order: profileGalleryImages.length + 1,
        uploaded_at: uploaded.uploaded_at
      });
    }
  }

  renderGalleryPreview();
  await saveProfile(false);
});

[shortIntroInput, aboutUsInput, orderingGuidelinesInput].forEach((input) => {
  input?.addEventListener("input", () => {
    updateCharacterCount(shortIntroInput, shortIntroCount, 500);
    updateCharacterCount(aboutUsInput, aboutUsCount, 2000);
    updateCharacterCount(orderingGuidelinesInput, orderingGuidelinesCount, 1500);

    if (input === shortIntroInput) {
      markDraftIfHasValue("short_intro", shortIntroInput);
      renderTextSectionDisplay("short_intro");
    }

    if (input === aboutUsInput) {
      markDraftIfHasValue("about_us", aboutUsInput);
      renderTextSectionDisplay("about_us");
    }

    if (input === orderingGuidelinesInput) {
      markDraftIfHasValue("ordering_guidelines", orderingGuidelinesInput);
      renderTextSectionDisplay("ordering_guidelines");
    }
  });
});

document.querySelectorAll("[data-edit-section]").forEach((button) => {
  button.addEventListener("click", () => {
    const sectionKey = button.dataset.editSection;
    openSectionEditor(sectionKey);
  });
});

document.querySelectorAll(".cancel-section-edit").forEach((button) => {
  button.addEventListener("click", () => {
    const sectionKey = button.dataset.sectionKey;
    closeSectionEditor(sectionKey, false);
  });
});

document.querySelectorAll(".save-section-draft").forEach((button) => {
  button.addEventListener("click", async () => {
    const sectionKey = button.dataset.sectionKey;
    const input = sectionConfig[sectionKey]?.input();

    if (input && getCleanValue(input)) {
      setSectionStatus(sectionKey, "draft");
    } else {
      setSectionStatus(sectionKey, "missing");
    }

    closeSectionEditor(sectionKey, false);
    await saveProfile(false);
  });
});

document.querySelectorAll(".mark-section-complete").forEach((button) => {
  button.addEventListener("click", async () => {
    const sectionKey = button.dataset.sectionKey;

    const inputMap = {
      short_intro: shortIntroInput,
      about_us: aboutUsInput,
      ordering_guidelines: orderingGuidelinesInput
    };

    const relatedInput = inputMap[sectionKey];

    if (relatedInput && !getCleanValue(relatedInput)) {
      alert("Add content before marking this section complete.");
      return;
    }

    setSectionStatus(sectionKey, "complete");
    closeSectionEditor(sectionKey, false);
    await saveProfile(false);
  });
});

addTeamMemberBtn?.addEventListener("click", openTeamMemberModal);
closeTeamMemberModalBtn?.addEventListener("click", () => {
  closeTeamMemberModal();
  resetTeamMemberModal();
});

cancelTeamMemberBtn?.addEventListener("click", () => {
  closeTeamMemberModal();
  resetTeamMemberModal();
});

teamMemberModal?.addEventListener("click", (event) => {
  if (event.target === teamMemberModal) {
    closeTeamMemberModal();
    resetTeamMemberModal();
  }
});

teamPhotoUploadBtn?.addEventListener("click", () => {
  teamPhotoFileInput?.click();
});

teamPhotoFileInput?.addEventListener("change", async () => {
  const file = teamPhotoFileInput.files?.[0];

  if (!file) return;

  const uploaded = await handleProfileMediaUpload(file, "team");

  if (!uploaded?.url) return;

  pendingTeamPhoto = uploaded.url;

  if (teamPhotoPreview) {
    teamPhotoPreview.src = uploaded.url;
    teamPhotoPreview.classList.remove("hidden");
  }

  if (teamPhotoPlaceholder) {
    teamPhotoPlaceholder.classList.add("hidden");
  }
});

saveTeamMemberBtn?.addEventListener("click", async () => {
  const name = getCleanValue(teamMemberNameInput);
  const role = getCleanValue(teamMemberRoleInput);
  const bio = getCleanValue(teamMemberBioInput);

  if (!name) {
    if (teamMemberModalStatus) {
      teamMemberModalStatus.textContent = "Please add a name before saving this team member.";
    }
    return;
  }

  const teamMemberPayload = {
    name,
    role,
    bio,
    photo_url: pendingTeamPhoto,
    updated_at: new Date().toISOString()
  };

  if (editingTeamMemberIndex !== null) {
    const existingMember = teamMembers[editingTeamMemberIndex];

    teamMembers[editingTeamMemberIndex] = {
      ...existingMember,
      ...teamMemberPayload
    };
  } else {
    if (teamMembers.length >= 6) {
      if (teamMemberModalStatus) {
        teamMemberModalStatus.textContent = "You can add up to 6 team members for now.";
      }
      return;
    }

    teamMembers.push({
      ...teamMemberPayload,
      sort_order: teamMembers.length + 1,
      created_at: new Date().toISOString()
    });
  }

  renderTeamMembers();
  closeTeamMemberModal();
  resetTeamMemberModal();

  await saveProfile(false);
});

removeTeamMemberBtn?.addEventListener("click", async () => {
  if (editingTeamMemberIndex === null) return;

  const shouldRemove = confirm("Remove this team member from your profile?");

  if (!shouldRemove) return;

  teamMembers.splice(editingTeamMemberIndex, 1);

  renderTeamMembers();
  closeTeamMemberModal();
  resetTeamMemberModal();

  await saveProfile(false);
});

certificationsDisplayBtn?.addEventListener("click", () => {
  openCertificationsEditor();
});

cancelCertificationsEditBtn?.addEventListener("click", () => {
  closeCertificationsEditor();
  renderSelectedCertifications();
});

saveCertificationsDraftBtn?.addEventListener("click", async () => {
  const certs = getSelectedCertifications();

  setSectionStatus("certifications", certs.length ? "draft" : "missing");
  renderCertificationsDisplay(certs);
  closeCertificationsEditor();

  await saveProfile(false);
});

markCertificationsCompleteBtn?.addEventListener("click", async () => {
  const certs = getSelectedCertifications();

  if (!certs.length) {
    alert("Add at least one certification or practice before marking this section complete.");
    return;
  }

  setSectionStatus("certifications", "complete");
  renderCertificationsDisplay(certs);
  closeCertificationsEditor();

  await saveProfile(false);
});

document.querySelectorAll(".certification-option").forEach((checkbox) => {
  checkbox.addEventListener("change", renderSelectedCertifications);
});

addCustomCertificationBtn?.addEventListener("click", () => {
  const value = getCleanValue(customCertificationInput);

  if (!value) {
    alert("Enter a certification, standard, or practice first.");
    return;
  }

  if (!customCertifications.includes(value)) {
    customCertifications.push(value);
  }

  customCertificationInput.value = "";
  renderSelectedCertifications();
});

builderSaveDraftBtn?.addEventListener("click", async () => {
  await saveProfile(false);
});

builderFinishBtn?.addEventListener("click", async () => {
  const shortIntro = getCleanValue(shortIntroInput);
  const aboutUs = getCleanValue(aboutUsInput);

  if (!shortIntro) {
    alert("Please add a short intro before finishing your profile.");
    return;
  }

  if (!aboutUs) {
    alert("Please add an About us section before finishing your profile.");
    return;
  }

  if (getSectionStatus("short_intro") !== "complete") {
    setSectionStatus("short_intro", "complete");
  }

  if (getSectionStatus("about_us") !== "complete") {
    setSectionStatus("about_us", "complete");
  }

  const savedProfile = await saveProfile(true);

  if (savedProfile) {
    window.location.href = "supplier.html";
  }
});

loadProfileBuilder();
