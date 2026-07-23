/* =========================
   LOCALITY PROFILE BUILDER
========================= */

const builderSaveDraftBtn = document.getElementById("builderSaveDraftBtn");
const builderFinishBtn = document.getElementById("builderFinishBtn");
const builderStatusText = document.getElementById("builderStatusText");

const profileSetupModal = document.getElementById("profileSetupModal");
const closeProfileSetupModalBtn = document.getElementById("closeProfileSetupModalBtn");
const cancelProfileSetupBtn = document.getElementById("cancelProfileSetupBtn");
const confirmProfileSetupBtn = document.getElementById("confirmProfileSetupBtn");
const profileSetupConfirmStep = document.getElementById("profileSetupConfirmStep");
const profileSetupNextStep = document.getElementById("profileSetupNextStep");
const profileSetupModalStatus = document.getElementById("profileSetupModalStatus");

const builderCompletionPercent = document.getElementById("builderCompletionPercent");
const builderCompletionBar = document.getElementById("builderCompletionBar");
const builderCompletionList = document.getElementById("builderCompletionList");

const profileBusinessName = document.getElementById("profileBusinessName");
const profileMetaLine = document.getElementById("profileMetaLine");
const profileRoleChip = document.getElementById("profileRoleChip");
const profileCategoryChip = document.getElementById("profileCategoryChip");
const profileContactChip = document.getElementById("profileContactChip");

const profileProductPreviewSection = document.getElementById("profileProductPreviewSection");
const profileProductPreviewTitle = document.getElementById("profileProductPreviewTitle");
const profileProductPreviewPill = document.getElementById("profileProductPreviewPill");
const profileProductPreviewDescription = document.getElementById("profileProductPreviewDescription");
const profileProductPreviewRow = document.getElementById("profileProductPreviewRow");
const profileProductPreviewCta = document.getElementById("profileProductPreviewCta");

const profileContactLine = document.getElementById("profileContactLine");
const profileAddressText = document.getElementById("profileAddressText");
const profileWebsiteText = document.getElementById("profileWebsiteText");
const profileEmailText = document.getElementById("profileEmailText");
const profilePhoneText = document.getElementById("profilePhoneText");
const teamSectionTitle = document.getElementById("teamSectionTitle");

const logoUploadBtn = document.getElementById("logoUploadBtn");
const bannerUploadBtn = document.getElementById("bannerUploadBtn");
const galleryUploadBtn = document.getElementById("galleryUploadBtn");

const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const logoFileInput = document.getElementById("logoFileInput");
const bannerFileInput = document.getElementById("bannerFileInput");
const galleryFileInput = document.getElementById("galleryFileInput");

const logoPreviewImage = document.getElementById("logoPreviewImage");
const bannerPreviewImage = document.getElementById("bannerPreviewImage");
const logoPlaceholder = document.getElementById("logoPlaceholder");
const bannerPlaceholder = document.getElementById("bannerPlaceholder");
const galleryPreviewGrid = document.getElementById("galleryPreviewGrid");

const manageGalleryBtn = document.getElementById("manageGalleryBtn");
const galleryInlineManageBtn = document.getElementById("galleryInlineManageBtn");
const galleryManagerModal = document.getElementById("galleryManagerModal");
const closeGalleryManagerModalBtn = document.getElementById("closeGalleryManagerModalBtn");
const cancelGalleryManagerBtn = document.getElementById("cancelGalleryManagerBtn");
const saveGalleryManagerBtn = document.getElementById("saveGalleryManagerBtn");

const galleryAddImagesBtn = document.getElementById("galleryAddImagesBtn");
const galleryReplaceFileInput = document.getElementById("galleryReplaceFileInput");

const galleryManagerGrid = document.getElementById("galleryManagerGrid");
const galleryImageCountLabel = document.getElementById("galleryImageCountLabel");
const selectedGalleryOrderLabel = document.getElementById("selectedGalleryOrderLabel");
const selectedGalleryPreview = document.getElementById("selectedGalleryPreview");
const galleryCaptionInput = document.getElementById("galleryCaptionInput");
const galleryManagerStatus = document.getElementById("galleryManagerStatus");

const galleryScrollLeftBtn = document.getElementById("galleryScrollLeftBtn");
const galleryScrollRightBtn = document.getElementById("galleryScrollRightBtn");

const moveGalleryLeftBtn = document.getElementById("moveGalleryLeftBtn");
const moveGalleryRightBtn = document.getElementById("moveGalleryRightBtn");
const replaceGalleryImageBtn = document.getElementById("replaceGalleryImageBtn");
const removeGalleryImageBtn = document.getElementById("removeGalleryImageBtn");

const MAX_GALLERY_IMAGES = 8;

let galleryWorkingImages = [];
let selectedGalleryIndex = null;

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

const profileModeSwitch = document.getElementById("profileModeSwitch");
const profileSupplyTab = document.getElementById("profileSupplyTab");
const profileSupplyTabSubtext = document.getElementById("profileSupplyTabSubtext");
const profileSupplyTabBadge = document.getElementById("profileSupplyTabBadge");
const profileSetupSupplyChoice = document.getElementById("profileSetupSupplyChoice");
const profileSetupSkipChoice = document.getElementById("profileSetupSkipChoice");

const profileBuilderUrlParams = new URLSearchParams(window.location.search);
const isProfileSetupMode =
  profileBuilderUrlParams.get("setup") === "1" ||
  profileBuilderUrlParams.get("mode") === "setup";


function initializeBuilderAccountMenu() {
  const accountMenu = document.querySelector(".builder-account-menu");
  const accountBtn = document.querySelector(".builder-account-btn");
  const accountDropdown = document.querySelector(".builder-account-dropdown");
  const accountName = document.querySelector(".builder-account-name");
  const accountAvatar = document.querySelector(".builder-account-avatar");
  const logoutBtn = document.querySelector(".builder-account-logout");

  if (!accountMenu || !accountBtn || !accountDropdown) return;

  const closeMenu = () => {
    accountDropdown.hidden = true;
    accountBtn.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    accountDropdown.hidden = false;
    accountBtn.setAttribute("aria-expanded", "true");
  };

  accountBtn.addEventListener("click", (event) => {
    event.stopPropagation();

    if (accountDropdown.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!accountMenu.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  logoutBtn?.addEventListener("click", async () => {
    if (window.LocalityAuthService?.signOut) {
      await window.LocalityAuthService.signOut();
    }

    window.location.href = "account.html";
  });

  window.addEventListener("locality:builder-account-ready", (event) => {
    const detail = event.detail || {};
    const name = detail.name || "Account";
    const logoUrl = detail.logoUrl || "";

    if (accountName) {
      accountName.textContent = name;
    }

    if (accountAvatar) {
      if (logoUrl) {
        accountAvatar.innerHTML = `<img src="${logoUrl}" alt="" />`;
      } else {
        const initials = name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase())
          .join("") || "LC";

        accountAvatar.textContent = initials;
      }
    }
  });
}

function withProfileSetupParam(url) {
  return isProfileSetupMode ? `${url}?setup=1` : url;
}

function applyProfileBuilderMode() {
  document.body.classList.toggle("setup-mode", isProfileSetupMode);
  document.body.classList.toggle("editor-mode", !isProfileSetupMode);

  if (builderFinishBtn) {
    builderFinishBtn.textContent = isProfileSetupMode
      ? "Save & Continue Setup"
      : "Save changes";
  }

  if (profileModeSwitch) {
    profileModeSwitch.href = "public-profile.html";
  }

  if (profileSupplyTab) {
    if (isProfileSetupMode) {
      profileSupplyTab.href = "#";
      profileSupplyTab.classList.add("disabled");
      profileSupplyTab.setAttribute("aria-disabled", "true");
    } else {
      profileSupplyTab.href = "supply-builder.html";
      profileSupplyTab.classList.remove("disabled");
      profileSupplyTab.removeAttribute("aria-disabled");
    }
  }

  if (profileSupplyTabSubtext) {
    profileSupplyTabSubtext.textContent = isProfileSetupMode
      ? "Set up after completing your profile"
      : "Products, pricing, and availability";
  }

  if (profileSupplyTabBadge) {
    profileSupplyTabBadge.classList.toggle("hidden", !isProfileSetupMode);
    profileSupplyTabBadge.textContent = "Next step";
  }

  if (profileSetupSupplyChoice) {
    profileSetupSupplyChoice.href = withProfileSetupParam("supply-builder.html");
  }

  if (profileSetupSkipChoice) {
    profileSetupSkipChoice.href = "supplier.html";
  }
}

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

function getInitials(name = "") {
  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "LC";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function fillBuilderAccountButton(profile = null, user = null) {
  const accountMenus = document.querySelectorAll(".builder-account-menu");

  if (!accountMenus.length) return;

  const displayName =
    profile?.name ||
    user?.email ||
    "Account";

  const logoUrl =
    profile?.logo_url ||
    "";

  const initials = getInitials(displayName);

  accountMenus.forEach((menu) => {
    const avatar = menu.querySelector(".builder-account-avatar");
    const name = menu.querySelector(".builder-account-name");

    if (name) {
      name.textContent = displayName;
    }

    if (avatar) {
      avatar.innerHTML = "";

      if (logoUrl) {
        const image = document.createElement("img");
        image.src = logoUrl;
        image.alt = `${displayName} logo`;
        avatar.appendChild(image);
        avatar.classList.add("has-image");
      } else {
        avatar.textContent = initials;
        avatar.classList.remove("has-image");
      }
    }
  });
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

function validateProfileImageFile(file) {
  if (!file) return false;

  if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

    alert(
      `This image is ${sizeMb} MB. Locality currently supports images up to 5 MB. Try exporting it as a smaller JPG or compressed PNG.`
    );

    return false;
  }

  return true;
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
      
      function setGalleryCardRatio() {
        if (!img.naturalWidth || !img.naturalHeight) return;
      
        const ratio = img.naturalWidth / img.naturalHeight;
        const safeRatio = Math.max(0.55, Math.min(ratio, 1.85));
      
        card.style.setProperty("--gallery-card-ratio", safeRatio);
      }

img.addEventListener("load", setGalleryCardRatio);

if (img.complete) {
  setGalleryCardRatio();
}

card.appendChild(img);
galleryPreviewGrid.insertBefore(card, galleryUploadBtn);
  });

  setSectionStatus("gallery", hasImages ? "complete" : "missing");
}

function cloneGalleryImages(images = []) {
  return images.map((image, index) => ({
    id: image.id || crypto.randomUUID?.() || `gallery-${Date.now()}-${index}`,
    url: image.url,
    caption: image.caption || image.title || "",
    sort_order: index + 1,
    uploaded_at: image.uploaded_at || image.created_at || new Date().toISOString()
  }));
}

function openGalleryManagerModal() {
  galleryWorkingImages = cloneGalleryImages(profileGalleryImages);
  selectedGalleryIndex = galleryWorkingImages.length ? 0 : null;

  renderGalleryManager();

  galleryManagerModal?.classList.remove("hidden");
  galleryManagerModal?.setAttribute("aria-hidden", "false");
}

function closeGalleryManagerModal() {
  galleryManagerModal?.classList.add("hidden");
  galleryManagerModal?.setAttribute("aria-hidden", "true");

  galleryWorkingImages = [];
  selectedGalleryIndex = null;
}

function setGalleryManagerStatus(message) {
  if (galleryManagerStatus) {
    galleryManagerStatus.textContent = message;
  }
}

function renderGalleryManager() {
  if (!galleryManagerGrid) return;

  galleryManagerGrid.innerHTML = "";

  if (galleryImageCountLabel) {
    galleryImageCountLabel.textContent = `${galleryWorkingImages.length} / ${MAX_GALLERY_IMAGES} photos`;
  }

  for (let index = 0; index < MAX_GALLERY_IMAGES; index += 1) {
    const image = galleryWorkingImages[index];

    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "gallery-manager-tile";

    if (image) {
      tile.classList.toggle("is-selected", selectedGalleryIndex === index);

      const img = document.createElement("img");
      img.src = image.url;
      img.alt = image.caption || `Gallery photo ${index + 1}`;

      const orderBadge = document.createElement("span");
      orderBadge.className = "gallery-manager-order-badge";
      orderBadge.textContent = index + 1;

      tile.appendChild(img);
      tile.appendChild(orderBadge);

      if (image.caption) {
        const captionBadge = document.createElement("span");
        captionBadge.className = "gallery-manager-caption-badge";
        captionBadge.textContent = image.caption;
        tile.appendChild(captionBadge);
      }

      tile.addEventListener("click", () => {
        selectedGalleryIndex = index;
        renderGalleryManager();
      });
    } else {
      tile.classList.add("is-empty");
      tile.textContent = "+ Add photo";

      tile.addEventListener("click", () => {
        galleryFileInput?.click();
      });
    }

    galleryManagerGrid.appendChild(tile);
  }

  renderSelectedGalleryPanel();
}

function renderSelectedGalleryPanel() {
  const selectedImage =
    selectedGalleryIndex !== null ? galleryWorkingImages[selectedGalleryIndex] : null;

  if (selectedGalleryOrderLabel) {
    selectedGalleryOrderLabel.textContent = selectedImage
      ? `Photo ${selectedGalleryIndex + 1}`
      : "None selected";
  }

  if (selectedGalleryPreview) {
    selectedGalleryPreview.innerHTML = "";

    if (selectedImage) {
      const img = document.createElement("img");
      img.src = selectedImage.url;
      img.alt = selectedImage.caption || "Selected gallery photo";
      selectedGalleryPreview.appendChild(img);
    } else {
      const empty = document.createElement("span");
      empty.textContent = "Select a photo to manage it.";
      selectedGalleryPreview.appendChild(empty);
    }
  }

  if (galleryCaptionInput) {
    galleryCaptionInput.value = selectedImage?.caption || "";
    galleryCaptionInput.disabled = !selectedImage;
  }

  const hasSelected = Boolean(selectedImage);

  [moveGalleryLeftBtn, moveGalleryRightBtn, replaceGalleryImageBtn, removeGalleryImageBtn].forEach((button) => {
    if (button) button.disabled = !hasSelected;
  });
}

async function addGalleryFiles(files) {
  const incomingFiles = Array.from(files || []);

  if (!incomingFiles.length) return;

  const remainingSlots = MAX_GALLERY_IMAGES - galleryWorkingImages.length;

  if (remainingSlots <= 0) {
    setGalleryManagerStatus(`You can add up to ${MAX_GALLERY_IMAGES} gallery photos for now.`);
    return;
  }

  const filesToUpload = incomingFiles
  .filter(validateProfileImageFile)
  .slice(0, remainingSlots);

  setGalleryManagerStatus("Uploading gallery photos...");

  for (const file of filesToUpload) {
    const uploaded = await handleProfileMediaUpload(file, "gallery");

    if (uploaded?.url) {
      galleryWorkingImages.push({
        id: crypto.randomUUID?.() || `gallery-${Date.now()}-${Math.random()}`,
        url: uploaded.url,
        caption: "",
        sort_order: galleryWorkingImages.length + 1,
        uploaded_at: new Date().toISOString()
      });
    }
  }

  selectedGalleryIndex = galleryWorkingImages.length ? galleryWorkingImages.length - 1 : null;

  setGalleryManagerStatus("Photos added. Review the order, captions, or save your gallery.");
  renderGalleryManager();

  if (galleryFileInput) {
    galleryFileInput.value = "";
  }
}

async function replaceSelectedGalleryImage(file) {
  if (selectedGalleryIndex === null || !galleryWorkingImages[selectedGalleryIndex] || !file) return;
  if (!validateProfileImageFile(file)) return;
   
  setGalleryManagerStatus("Replacing selected photo...");

  const uploaded = await handleProfileMediaUpload(file, "gallery");

  if (uploaded?.url) {
    galleryWorkingImages[selectedGalleryIndex] = {
      ...galleryWorkingImages[selectedGalleryIndex],
      url: uploaded.url,
      updated_at: new Date().toISOString()
    };

    setGalleryManagerStatus("Photo replaced. Save your gallery to keep this change.");
    renderGalleryManager();
  }

  if (galleryReplaceFileInput) {
    galleryReplaceFileInput.value = "";
  }
}

function moveSelectedGalleryImage(direction) {
  if (selectedGalleryIndex === null) return;

  const nextIndex = selectedGalleryIndex + direction;

  if (nextIndex < 0 || nextIndex >= galleryWorkingImages.length) {
    setGalleryManagerStatus("This photo is already at the edge of your current gallery order.");
    return;
  }

  const current = galleryWorkingImages[selectedGalleryIndex];
  galleryWorkingImages[selectedGalleryIndex] = galleryWorkingImages[nextIndex];
  galleryWorkingImages[nextIndex] = current;

  selectedGalleryIndex = nextIndex;
  setGalleryManagerStatus("Gallery order updated. Save your gallery to keep this change.");
  renderGalleryManager();
}

function removeSelectedGalleryImage() {
  if (selectedGalleryIndex === null || !galleryWorkingImages[selectedGalleryIndex]) return;

  const shouldRemove = confirm("Remove this photo from your gallery?");

  if (!shouldRemove) return;

  galleryWorkingImages.splice(selectedGalleryIndex, 1);

  if (!galleryWorkingImages.length) {
    selectedGalleryIndex = null;
  } else if (selectedGalleryIndex >= galleryWorkingImages.length) {
    selectedGalleryIndex = galleryWorkingImages.length - 1;
  }

  setGalleryManagerStatus("Photo removed. Save your gallery to keep this change.");
  renderGalleryManager();
}

async function saveGalleryManagerChanges() {
  profileGalleryImages = galleryWorkingImages.map((image, index) => ({
    ...image,
    sort_order: index + 1
  }));

  setSectionStatus("gallery", profileGalleryImages.length ? "complete" : "missing");
  renderGalleryPreview();

  closeGalleryManagerModal();

  await saveProfile(false);
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

   const actions = document.createElement("div");
   actions.className = "team-member-actions";
   actions.appendChild(editBtn);
   actions.appendChild(removeBtn);
   
   card.appendChild(photoFrame);
   card.appendChild(name);
   card.appendChild(role);
   
   if (member.bio) {
     card.appendChild(bio);
   }
   
   card.appendChild(actions);

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

function getBuilderProductUnitLabel(unit) {
  if (!unit) return "unit";
  if (unit === "custom") return "custom unit";
  return unit;
}

function normalizeBuilderPreviewProduct(product = {}) {
  return {
    id: product.id,
    name: product.name || "",
    category: product.category || "Product",
    description: product.description || "",
    image_url: product.image_url || "",
    price_display: product.price_display || "",
    price_unit: product.price_unit || "",
    unit_description: product.unit_description || "",
    minimum_order: product.minimum_order || "",
    availability_status: product.availability_status || "",
    featured: Boolean(product.featured),
    visibility: product.visibility || "draft",
    sort_order: Number.isFinite(Number(product.sort_order)) ? Number(product.sort_order) : 0,
    created_at: product.created_at || null
  };
}

function sortBuilderPreviewProducts(productList = []) {
  return [...productList].sort((a, b) => {
    if (Number(b.featured) !== Number(a.featured)) {
      return Number(b.featured) - Number(a.featured);
    }

    const orderA = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : 0;
    const orderB = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : 0;

    if (orderA !== orderB) return orderA - orderB;

    return new Date(a.created_at || 0) - new Date(b.created_at || 0);
  });
}

function createBuilderPreviewProductCard(product) {
  const card = document.createElement("div");
  card.className = `product-preview-tile real-product${product.featured ? " is-featured" : ""}`;

  const imageFrame = document.createElement("div");
  imageFrame.className = "product-preview-image";

  if (product.image_url) {
    const image = document.createElement("img");
    image.src = product.image_url;
    image.alt = `${product.name || "Product"} image`;
    imageFrame.appendChild(image);
  } else {
    const placeholder = document.createElement("span");
    placeholder.textContent = product.category || "Product";
    imageFrame.appendChild(placeholder);
  }

  const title = document.createElement("strong");
  title.textContent = product.name || "Unnamed product";

  const description = document.createElement("span");
  description.textContent = product.description || product.availability_status || "Product details available on the Supply & Products page.";

  const meta = document.createElement("div");
  meta.className = "product-preview-meta";

  const priceLabel = document.createElement("small");
  priceLabel.textContent = "Price";

  const priceValue = document.createElement("div");
  priceValue.textContent = product.price_display
    ? `${product.price_display} / ${getBuilderProductUnitLabel(product.price_unit)}`
    : "Request quote";

  meta.appendChild(priceLabel);
  meta.appendChild(priceValue);

  card.appendChild(imageFrame);
  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(meta);

  return card;
}

async function renderBuilderProductPreview(profile) {
  if (!profileProductPreviewSection || !profileProductPreviewRow || !profile?.id) return;

  if (profileProductPreviewCta) {
    profileProductPreviewCta.href = isProfileSetupMode
      ? "supply-builder.html?setup=1"
      : "supply-builder.html";
  }

  if (!window.LocalityProductService?.getProductsForBusinessProfile) {
    console.warn("LocalityProductService is not available for builder product preview.");
    return;
  }

  const { data, error } = await window.LocalityProductService.getProductsForBusinessProfile(profile.id);

  if (error) {
    console.error("Unable to load products for builder preview:", error);
    return;
  }

  const visibleProducts = (data || [])
    .map(normalizeBuilderPreviewProduct)
    .filter((product) => product.visibility === "public");

  const previewProducts = sortBuilderPreviewProducts(visibleProducts).slice(0, 3);

  if (!previewProducts.length) {
    profileProductPreviewSection.classList.remove("has-products");

    if (profileProductPreviewPill) {
      profileProductPreviewPill.textContent = isProfileSetupMode
        ? "Supply page coming next"
        : "No public products yet";
    }

    if (profileProductPreviewTitle) {
      profileProductPreviewTitle.textContent = "Product preview";
    }

    if (profileProductPreviewDescription) {
      profileProductPreviewDescription.textContent =
        "Your business profile helps buyers understand who you are. Your supply page will show what buyers can order, including products, availability, unit sizes, pricing, minimum orders, and request details.";
    }

    if (profileProductPreviewCta) {
      profileProductPreviewCta.textContent = isProfileSetupMode
        ? "Set up Supply & Products"
        : "Edit Supply & Products";
    }

    return;
  }

  profileProductPreviewSection.classList.add("has-products");

  if (profileProductPreviewPill) {
    profileProductPreviewPill.textContent = "Live supply";
  }

  if (profileProductPreviewTitle) {
    profileProductPreviewTitle.textContent = previewProducts.some((product) => product.featured)
      ? "Featured product preview"
      : "Product preview";
  }

  if (profileProductPreviewDescription) {
    profileProductPreviewDescription.textContent =
      "These products are pulled from your Supply & Products page and help buyers understand what you offer before they view the full catalog.";
  }

  if (profileProductPreviewCta) {
    profileProductPreviewCta.textContent = "Edit Supply & Products";
  }

  profileProductPreviewRow.innerHTML = "";

  previewProducts.forEach((product) => {
    profileProductPreviewRow.appendChild(createBuilderPreviewProductCard(product));
  });
}

function hydrateBuilder(profile) {
  currentProfile = profile;

  fillBuilderAccountButton(currentProfile, currentUser);

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
  renderBuilderProductPreview(profile);
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
   onboarding_completed: markComplete
     ? (isProfileSetupMode ? false : currentProfile.onboarding_completed || false)
     : currentProfile.onboarding_completed || false,
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

logoFileInput?.addEventListener("change", async () => {
  const file = logoFileInput.files?.[0];
   if (!file) return;
   if (!validateProfileImageFile(file)) return;

  const uploaded = await handleProfileMediaUpload(file, "logo");
  if (!uploaded?.url) return;

  setImagePreview(logoPreviewImage, logoPlaceholder, uploaded.url);
  setSectionStatus("logo", "complete");
  await saveProfile(false);
});

bannerFileInput?.addEventListener("change", async () => {
  const file = bannerFileInput.files?.[0];
   if (!file) return;
   if (!validateProfileImageFile(file)) return;

  const uploaded = await handleProfileMediaUpload(file, "banner");
  if (!uploaded?.url) return;

  setImagePreview(bannerPreviewImage, bannerPlaceholder, uploaded.url);
  setSectionStatus("banner", "complete");
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

document.getElementById("builderCancelChangesBtn")?.addEventListener("click", () => {
  const confirmCancel = window.confirm(
    "Cancel your unsaved profile changes and reload the last saved version?"
  );

  if (confirmCancel) {
    window.location.reload();
  }
});

function scrollProfileGallery(direction) {
  if (!galleryPreviewGrid) return;

  const scrollAmount = Math.max(360, galleryPreviewGrid.clientWidth * 0.72);

  galleryPreviewGrid.scrollBy({
    left: direction * scrollAmount,
    behavior: "smooth"
  });
}

galleryScrollLeftBtn?.addEventListener("click", () => {
  scrollProfileGallery(-1);
});

galleryScrollRightBtn?.addEventListener("click", () => {
  scrollProfileGallery(1);
});

manageGalleryBtn?.addEventListener("click", openGalleryManagerModal);
galleryUploadBtn?.addEventListener("click", openGalleryManagerModal);
galleryInlineManageBtn?.addEventListener("click", openGalleryManagerModal);

closeGalleryManagerModalBtn?.addEventListener("click", closeGalleryManagerModal);
cancelGalleryManagerBtn?.addEventListener("click", closeGalleryManagerModal);

galleryManagerModal?.addEventListener("click", (event) => {
  if (event.target === galleryManagerModal) {
    closeGalleryManagerModal();
  }
});

galleryAddImagesBtn?.addEventListener("click", () => {
  galleryFileInput?.click();
});

galleryFileInput?.addEventListener("change", async () => {
  await addGalleryFiles(galleryFileInput.files);
});

replaceGalleryImageBtn?.addEventListener("click", () => {
  galleryReplaceFileInput?.click();
});

galleryReplaceFileInput?.addEventListener("change", async () => {
  const file = galleryReplaceFileInput.files?.[0];
  await replaceSelectedGalleryImage(file);
});

moveGalleryLeftBtn?.addEventListener("click", () => {
  moveSelectedGalleryImage(-1);
});

moveGalleryRightBtn?.addEventListener("click", () => {
  moveSelectedGalleryImage(1);
});

removeGalleryImageBtn?.addEventListener("click", removeSelectedGalleryImage);

galleryCaptionInput?.addEventListener("input", () => {
  if (selectedGalleryIndex === null || !galleryWorkingImages[selectedGalleryIndex]) return;

  galleryWorkingImages[selectedGalleryIndex].caption = galleryCaptionInput.value;
});

galleryCaptionInput?.addEventListener("blur", () => {
  if (selectedGalleryIndex === null || !galleryWorkingImages[selectedGalleryIndex]) return;

  galleryWorkingImages[selectedGalleryIndex].caption = galleryCaptionInput.value.trim();
  renderGalleryManager();
});

saveGalleryManagerBtn?.addEventListener("click", saveGalleryManagerChanges);

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
   if (!validateProfileImageFile(file)) return;

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

function openProfileSetupModal() {
  if (!profileSetupModal) return;

  profileSetupConfirmStep?.classList.remove("hidden");
  profileSetupNextStep?.classList.add("hidden");

  if (profileSetupModalStatus) {
    profileSetupModalStatus.textContent = "You can still make changes before continuing.";
  }

  profileSetupModal.classList.remove("hidden");
  profileSetupModal.setAttribute("aria-hidden", "false");
}

function closeProfileSetupModal() {
  if (!profileSetupModal) return;

  profileSetupModal.classList.add("hidden");
  profileSetupModal.setAttribute("aria-hidden", "true");
}

function showSupplySetupPrompt() {
  profileSetupConfirmStep?.classList.add("hidden");
  profileSetupNextStep?.classList.remove("hidden");
}

builderSaveDraftBtn?.addEventListener("click", async () => {
  await saveProfile(false);
});

builderFinishBtn?.addEventListener("click", async () => {
  if (!isProfileSetupMode) {
    await saveProfile(false);
    setBuilderStatus("Profile changes saved.");
    return;
  }

  const shortIntro = getCleanValue(shortIntroInput);
  const aboutUs = getCleanValue(aboutUsInput);

  if (!shortIntro) {
    alert("Please add a profile summary before continuing.");
    return;
  }

  if (!aboutUs) {
    alert("Please add an About us section before continuing.");
    return;
  }

  openProfileSetupModal();
});

confirmProfileSetupBtn?.addEventListener("click", async () => {
  if (confirmProfileSetupBtn) {
    confirmProfileSetupBtn.disabled = true;
    confirmProfileSetupBtn.textContent = "Saving profile...";
  }

  if (profileSetupModalStatus) {
    profileSetupModalStatus.textContent = "Saving your profile...";
  }

  if (getSectionStatus("short_intro") !== "complete") {
    setSectionStatus("short_intro", "complete");
  }

  if (getSectionStatus("about_us") !== "complete") {
    setSectionStatus("about_us", "complete");
  }

  const savedProfile = await saveProfile(true);

  if (!savedProfile) {
    if (confirmProfileSetupBtn) {
      confirmProfileSetupBtn.disabled = false;
      confirmProfileSetupBtn.textContent = "Save profile & continue";
    }

    if (profileSetupModalStatus) {
      profileSetupModalStatus.textContent = "Something went wrong. Please try saving again.";
    }

    return;
  }

  if (confirmProfileSetupBtn) {
    confirmProfileSetupBtn.disabled = false;
    confirmProfileSetupBtn.textContent = "Save profile & continue";
  }

  showSupplySetupPrompt();
});

closeProfileSetupModalBtn?.addEventListener("click", closeProfileSetupModal);
cancelProfileSetupBtn?.addEventListener("click", closeProfileSetupModal);

profileSetupModal?.addEventListener("click", (event) => {
  if (event.target === profileSetupModal) {
    closeProfileSetupModal();
  }
});

initializeBuilderAccountMenu();
applyProfileBuilderMode();
loadProfileBuilder();
