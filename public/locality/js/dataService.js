/* =========================
   LOCALITY DATA SERVICE
   Temporary localStorage layer.
   Later, these functions can be replaced with Supabase calls.
========================= */

(function () {
  const DRAFTS_KEY = "localityContractDrafts";
  const CURRENT_DRAFT_KEY = "localityCurrentContractDraftId";

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
    saveContractDraft,
    getContractDraft,
    getContractDrafts,
    getMostRecentContractDraft,
    deleteContractDraft,
    setCurrentContractDraftId,
    getCurrentContractDraftId
  };
})();
