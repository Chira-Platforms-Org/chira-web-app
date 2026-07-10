/* =========================
   LOCALITY PROFILE SERVICE
   Supabase business profile wrapper.
========================= */

(function () {
  function getClient() {
    if (!window.LocalitySupabase) {
      console.error("LocalitySupabase client is not available.");
      return null;
    }

    return window.LocalitySupabase;
  }

  async function getCurrentUser() {
    if (!window.LocalityAuthService?.getCurrentUser) {
      console.error("LocalityAuthService is not available.");
      return null;
    }

    return await window.LocalityAuthService.getCurrentUser();
  }

  async function getMyBusinessProfiles() {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user) {
      return { data: [], error: "No authenticated user." };
    }

    return await supabase
      .from("business_profiles")
      .select("*")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false });
  }

  async function getMyPrimaryBusinessProfile() {
    const { data, error } = await getMyBusinessProfiles();

    if (error) {
      return { data: null, error };
    }

    return {
      data: data?.[0] || null,
      error: null
    };
  }

   async function getPublicMarketplaceProfiles() {
  const supabase = getClient();

  if (!supabase) {
    return {
      data: [],
      error: "Supabase client is unavailable."
    };
  }

  return await supabase
    .from("business_profiles")
    .select("*")
    .eq("profile_visibility", "public")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("updated_at", { ascending: false });
}

async function getPublicBusinessProfileById(profileId) {
  const supabase = getClient();

  if (!supabase || !profileId) {
    return {
      data: null,
      error: "Missing Supabase client or public business profile ID."
    };
  }

  return await supabase
    .from("business_profiles")
    .select("*")
    .eq("id", profileId)
    .eq("profile_visibility", "public")
    .maybeSingle();
}

  async function createBusinessProfile(profile) {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user) {
      return { data: null, error: "No authenticated user." };
    }

    return await supabase
      .from("business_profiles")
      .insert({
        owner_user_id: user.id,
        name: profile.name,
        marketplace_roles: profile.marketplace_roles || [],
        business_categories: profile.business_categories || [],
        specialties: profile.specialties || [],
        description: profile.description || "",
        location_label: profile.location_label || "",
        product_focus: profile.product_focus || "",
        status: profile.status || "active"
      })
      .select()
      .single();
  }

  async function updateBusinessProfile(id, updates = {}) {
    const supabase = getClient();

    if (!supabase || !id) {
      return { data: null, error: "Missing Supabase client or profile id." };
    }

    return await supabase
      .from("business_profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();
  }

   window.LocalityProfileService = {
     getMyBusinessProfiles,
     getMyPrimaryBusinessProfile,
   
     getPublicMarketplaceProfiles,
     getPublicBusinessProfileById,
   
     createBusinessProfile,
     updateBusinessProfile
   };
})();
