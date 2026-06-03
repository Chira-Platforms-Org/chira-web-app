/* =========================
   LOCALITY DATA SERVICE
   Temporary localStorage layer.
   Later, these functions can be replaced with Supabase calls.
========================= */

(function () {
  const DRAFTS_KEY = "localityContractDrafts";
  const CURRENT_DRAFT_KEY = "localityCurrentContractDraftId";
  const CURRENT_DEMO_USER_KEY = "localityCurrentDemoUserId";
   
  function createId(prefix = "LOC-DRAFT") {
    const randomPart =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8).toUpperCase()
        : String(Date.now()).slice(-8);

    return `${prefix}-${randomPart}`;
  }

  function safeParse(value, fallback) {
    try {
      return JSON.parse(value) || fallback;
    } catch (error) {
      console.error("Locality data parse error:", error);
      return fallback;
    }
  }

const DEMO_USERS = [
  {
    id: "user-qch-owner",
    fullName: "Queen Creek Harvest Owner",
    email: "queencreek@example.com",
    businessId: "business-queen-creek-harvest",
    businessName: "Queen Creek Harvest",
    workspaceType: "supplier",
    defaultDestination: "supplier.html"
  },
  {
    id: "user-rrm-owner",
    fullName: "Roosevelt Row Market Owner",
    email: "roosevelt@example.com",
    businessId: "business-roosevelt-row-market",
    businessName: "Roosevelt Row Market",
    workspaceType: "buyer",
    defaultDestination: "supplier.html"
  }
];
   
function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parsePriceDisplay(priceString = "") {
  const clean = String(priceString).replace("Suggested:", "").trim();

  const match = clean.match(/\$?\s*([\d.]+)\s*\/\s*([a-zA-Z]+)?/);

  return {
    priceAmount: match?.[1] ? Number(match[1]) : null,
    priceUnit: match?.[2] || null,
    priceDisplay: clean || "Price not listed"
  };
}

function getMockProfiles() {
  if (typeof profiles !== "undefined" && Array.isArray(profiles)) {
    return profiles;
  }

  return [];
}

function normalizeProductListing(product = {}, businessId = "") {
  const parsedPrice = parsePriceDisplay(
    product.price || product.listedPrice || product.unitPrice || ""
  );

  return {
    id:
      product.id ||
      `${businessId}-product-${slugify(
        product.name || product.product || "listed-product"
      )}`,

    businessId,

    name: product.name || product.product || product.label || "Listed product",
    category: product.category || "specialty",

    priceAmount: parsedPrice.priceAmount,
    priceUnit: parsedPrice.priceUnit,
    priceDisplay: parsedPrice.priceDisplay,

    availabilityNote:
      product.note ||
      product.status ||
      product.availability ||
      "Available",

    organic: Boolean(product.organic),

    minimumOrderQuantity: product.minimumOrderQuantity || null,
    minimumOrderUnit: product.minimumOrderUnit || parsedPrice.priceUnit || null,

    leadTime: product.leadTime || "",

    status: product.status || "active",

    raw: product
  };
}

function normalizeBusinessProfile(profile = {}) {
  const id = profile.id || `business-${slugify(profile.name || "profile")}`;

  const isSupplier =
    profile.type === "farm" ||
    profile.type === "supplier";

  // Temporary compatibility field for the current prototype UI.
  // Long-term, use marketplaceRoles instead.
  const type = isSupplier ? "supplier" : "buyer";

  // In production, marketplaceRoles and businessCategories should come from
  // required user profile setup fields. These fallbacks only support current
  // mock profiles from profiles.js.
  const marketplaceRoles =
    profile.marketplaceRoles ||
    (isSupplier ? ["seller"] : ["buyer"]);

  const businessCategories =
    profile.businessCategories ||
    [
      profile.businessSubtype ||
      (isSupplier ? "farm" : "store")
    ];

  const specialties = profile.specialties || [];

  const businessSubtype =
    profile.businessSubtype ||
    businessCategories[0] ||
    "other";

  const products = (
    profile.productsAvailable ||
    profile.availableProducts ||
    profile.products ||
    profile.listings ||
    []
  ).map((product) => normalizeProductListing(product, id));

  return {
    id,
    ownerUserId: profile.ownerUserId || null,

    name: profile.name || "Unnamed business",

    // Compatibility field.
    type,

    // Backend-ready profile fields.
    marketplaceRoles,
    businessCategories,
    specialties,
    businessSubtype,

    iconVariant: profile.iconVariant || "",
    logo: profile.logo || "",
    logoInitials:
      profile.logoInitials ||
      String(profile.name || "LC")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase(),

    description: profile.description || profile.product || "",

    locationLabel: profile.location || "Phoenix region",

    address: profile.address || {
      line1: "",
      line2: "",
      city: "",
      state: "AZ",
      postalCode: "",
      country: "US"
    },

    coordinates: {
      lat: profile.lat ?? null,
      lng: profile.lng ?? null
    },

    productFocus: profile.product || profile.demandNeed || "",
    productCategories: profile.productType ? [profile.productType] : [],

    organic: Boolean(profile.organic),
    coalitionId: profile.coalition || null,

    deliveryRadius: profile.deliveryRadius || "",
    leadTime: profile.leadTime || "",
    minimumOrder: profile.minimumOrder || "",

    preferredRadius: profile.preferredRadius || "",
    orderFrequency: profile.orderFrequency || "",

    featuredInsight: profile.featuredInsight || "",

    status: profile.status || "active",

    productListings: products,

    raw: profile
  };
}

function getMarketplaceProfiles() {
  return getMockProfiles().map(normalizeBusinessProfile);
}

function getMarketplaceProfile(idOrSlug) {
  if (!idOrSlug) return null;

  return (
    getMarketplaceProfiles().find((profile) => {
      return profile.id === idOrSlug || slugify(profile.name) === idOrSlug;
    }) || null
  );
}

function getProductListingsForBusiness(idOrSlug) {
  const profile = getMarketplaceProfile(idOrSlug);
  return profile?.productListings || [];
}

   function getDemoUsers() {
  return DEMO_USERS;
}

function getCurrentDemoUser() {
  const savedUserId = localStorage.getItem(CURRENT_DEMO_USER_KEY);
  const fallbackUser = DEMO_USERS[0];

  return (
    DEMO_USERS.find((user) => user.id === savedUserId) ||
    fallbackUser
  );
}

function setCurrentDemoUser(userId) {
  const user = DEMO_USERS.find((item) => item.id === userId);

  if (!user) {
    console.warn(`Demo user not found: ${userId}`);
    return null;
  }

  localStorage.setItem(CURRENT_DEMO_USER_KEY, user.id);
  return user;
}

// Local Demo User
function clearCurrentDemoUser() {
  localStorage.removeItem(CURRENT_DEMO_USER_KEY);
  localStorage.removeItem(CURRENT_DRAFT_KEY);
  return true;
}

function getCurrentBusinessProfile() {
  const currentUser = getCurrentDemoUser();

  if (!currentUser?.businessId) {
    return null;
  }

  return getMarketplaceProfile(currentUser.businessId);
}

function getCurrentBusinessId() {
  return getCurrentDemoUser()?.businessId || null;
}

  function getStoredDrafts() {
    return safeParse(localStorage.getItem(DRAFTS_KEY), []);
  }

  function saveStoredDrafts(drafts) {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  }

  function normalizeDraft(draft) {
    const now = new Date().toISOString();

    return {
      ...draft,
      id: draft.id || createId(),
      status: draft.status || "draft",
      timestamps: {
        createdAt: draft.timestamps?.createdAt || now,
        updatedAt: now
      }
    };
  }

  function saveContractDraft(draft) {
    const drafts = getStoredDrafts();
    const draftToSave = normalizeDraft(draft);

    const existingIndex = drafts.findIndex((item) => item.id === draftToSave.id);

    if (existingIndex >= 0) {
      drafts[existingIndex] = draftToSave;
    } else {
      drafts.unshift(draftToSave);
    }

    saveStoredDrafts(drafts);
    localStorage.setItem(CURRENT_DRAFT_KEY, draftToSave.id);

    return draftToSave;
  }

  function getContractDraft(id) {
    if (!id) return null;

    return getStoredDrafts().find((draft) => draft.id === id) || null;
  }

  function getContractDrafts() {
    return getStoredDrafts();
  }

   function getContractDraftsByStatus(status) {
  if (!status || status === "all") {
    return getStoredDrafts();
  }

  return getStoredDrafts().filter((draft) => draft.status === status);
}

function updateContractDraft(id, updates = {}) {
  if (!id) return null;

  const drafts = getStoredDrafts();
  const existingIndex = drafts.findIndex((draft) => draft.id === id);

  if (existingIndex < 0) {
  console.warn(`Contract draft not found: ${id}`);
  return null;
}

  const existingDraft = drafts[existingIndex];

  const updatedDraft = normalizeDraft({
    ...existingDraft,
    ...updates,
    id: existingDraft.id,
    timestamps: {
      ...existingDraft.timestamps,
      ...(updates.timestamps || {})
    }
  });

  drafts[existingIndex] = updatedDraft;
  saveStoredDrafts(drafts);

  return updatedDraft;
}

function updateContractStatus(id, status) {
  const allowedStatuses = [
    "draft",
    "sent",
    "viewed",
    "revision_requested",
    "accepted",
    "archived"
  ];

  if (!allowedStatuses.includes(status)) {
    console.warn(`Invalid contract status: ${status}`);
    return null;
  }

  return updateContractDraft(id, { status });
}

function archiveContractDraft(id) {
  return updateContractStatus(id, "archived");
}

  function getMostRecentContractDraft() {
    return getStoredDrafts()[0] || null;
  }

  function deleteContractDraft(id) {
    const drafts = getStoredDrafts().filter((draft) => draft.id !== id);
    saveStoredDrafts(drafts);

    if (localStorage.getItem(CURRENT_DRAFT_KEY) === id) {
      localStorage.removeItem(CURRENT_DRAFT_KEY);
    }
  }

  function setCurrentContractDraftId(id) {
    if (!id) return;
    localStorage.setItem(CURRENT_DRAFT_KEY, id);
  }

  function getCurrentContractDraftId() {
    return localStorage.getItem(CURRENT_DRAFT_KEY);
  }

  window.LocalityDataService = {
  createId,

  slugify,
  parsePriceDisplay,

  normalizeBusinessProfile,
  normalizeProductListing,
  getMarketplaceProfiles,
  getMarketplaceProfile,
  getProductListingsForBusiness,

   getDemoUsers,
   getCurrentDemoUser,
   setCurrentDemoUser,
   clearCurrentDemoUser,
   getCurrentBusinessProfile,
   getCurrentBusinessId,

   saveContractDraft,
   getContractDraft,
   getContractDrafts,
   getContractDraftsByStatus,
   updateContractDraft,
   updateContractStatus,
   archiveContractDraft,
   getMostRecentContractDraft,
   deleteContractDraft,
   setCurrentContractDraftId,
   getCurrentContractDraftId
};
})();
