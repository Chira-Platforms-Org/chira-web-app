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
  if (!selectedCertificationsList) return;

  const certs = getSelectedCertifications();

  selectedCertificationsList.innerHTML = "";

  certs.forEach((cert) => {
    const chip = document.createElement("span");
    chip.textContent = cert.name;
    selectedCertificationsList.appendChild(chip);
  });

  setSectionStatus("certifications", certs.length ? "complete" : "missing");
}

function renderGalleryPreview() {
  if (!galleryPreviewGrid || !galleryUploadBtn) return;

  galleryPreviewGrid
    .querySelectorAll(".gallery-image-card")
    .forEach((card) => card.remove());

  profileGalleryImages.forEach((image) => {
    const card = document.createElement("div");
    card.className = "gallery-image-card";

    const img = document.createElement("img");
    img.src = image.url;
    img.alt = image.caption || "Business gallery image";

    card.appendChild(img);
    galleryPreviewGrid.insertBefore(card, galleryUploadBtn);
  });

  setSectionStatus("gallery", profileGalleryImages.length ? "complete" : "missing");
}

function updateCharacterCount(input, counter, max) {
  if (!input || !counter) return;
  counter.textContent = `${input.value.length} / ${max}`;
}

const sectionConfig = {
  short_intro: {
    input: () => shortIntroInput,
    display: () => shortIntroDisplay,
    placeholder: "Add 3–5 sentences about what your business offers and who you serve."
  },
  about_us: {
    input: () => aboutUsInput,
    display: () => aboutUsDisplay,
    placeholder: "Tell buyers about your story, practices, values, and the relationships you want to build through Locality."
  },
  ordering_guidelines: {
    input: () => orderingGuidelinesInput,
    display: () => orderingGuidelinesDisplay,
    placeholder: "Add minimum orders, lead time, pickup, delivery, packaging, or recurring order notes."
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
}

function renderSectionStatus() {
  const trackedSections = [
    "logo",
    "banner",
    "short_intro",
    "gallery",
    "about_us",
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
  renderSelectedCertifications();
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

document.querySelectorAll(".certification-option").forEach((checkbox) => {
  checkbox.addEventListener("change", renderSelectedCertifications);
});

addCustomCertificationBtn?.addEventListener("click", () => {
  const value = getCleanValue(customCertificationInput);

  if (!value) {
    alert("Enter a certification or practice first.");
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
