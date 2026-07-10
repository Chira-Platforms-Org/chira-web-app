/* =========================
   LOCALITY PRODUCT SERVICE
   Supabase business products wrapper.
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

  function normalizeProductPayload(product = {}) {
    return {
      business_profile_id: product.business_profile_id,
      name: product.name || "",
      category: product.category || "",
      description: product.description || "",

      image_url: product.image_url || "",

      price_display: product.price_display || "",
      price_unit: product.price_unit || "",
      unit_description: product.unit_description || "",
      minimum_order: product.minimum_order || "",

      availability_status: product.availability_status || "",
      season_notes: product.season_notes || "",
      fulfillment_notes: product.fulfillment_notes || "",

      featured: Boolean(product.featured),
      visibility: product.visibility || "draft",
      sort_order: Number.isFinite(Number(product.sort_order))
        ? Number(product.sort_order)
        : 0
    };
  }

  async function getProductsForBusinessProfile(businessProfileId) {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user || !businessProfileId) {
      return {
        data: [],
        error: "Missing Supabase client, authenticated user, or business profile id."
      };
    }

    return await supabase
      .from("business_products")
      .select("*")
      .eq("business_profile_id", businessProfileId)
      .eq("owner_user_id", user.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
  }


   async function getPublicProductsForBusinessProfile(businessProfileId) {
  const supabase = getClient();

  if (!supabase || !businessProfileId) {
    return {
      data: [],
      error: "Missing Supabase client or business profile ID."
    };
  }

  return await supabase
    .from("business_products")
    .select("*")
    .eq("business_profile_id", businessProfileId)
    .eq("visibility", "public")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
}

async function getPublicMarketplaceProducts() {
  const supabase = getClient();

  if (!supabase) {
    return {
      data: [],
      error: "Supabase client is unavailable."
    };
  }

  return await supabase
    .from("business_products")
    .select("*")
    .eq("visibility", "public")
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false });
}

  async function createProduct(product = {}) {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user) {
      return {
        data: null,
        error: "No authenticated user."
      };
    }

    const payload = normalizeProductPayload(product);

    if (!payload.business_profile_id) {
      return {
        data: null,
        error: "Missing business profile id."
      };
    }

    if (!payload.name) {
      return {
        data: null,
        error: "Product name is required."
      };
    }

    return await supabase
      .from("business_products")
      .insert({
        ...payload,
        owner_user_id: user.id
      })
      .select()
      .single();
  }

  async function updateProduct(productId, updates = {}) {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user || !productId) {
      return {
        data: null,
        error: "Missing Supabase client, authenticated user, or product id."
      };
    }

    const normalizedUpdates = normalizeProductPayload({
      ...updates,
      business_profile_id: updates.business_profile_id || null
    });

    const safeUpdates = {
      name: normalizedUpdates.name,
      category: normalizedUpdates.category,
      description: normalizedUpdates.description,

      image_url: normalizedUpdates.image_url,

      price_display: normalizedUpdates.price_display,
      price_unit: normalizedUpdates.price_unit,
      unit_description: normalizedUpdates.unit_description,
      minimum_order: normalizedUpdates.minimum_order,

      availability_status: normalizedUpdates.availability_status,
      season_notes: normalizedUpdates.season_notes,
      fulfillment_notes: normalizedUpdates.fulfillment_notes,

      featured: normalizedUpdates.featured,
      visibility: normalizedUpdates.visibility,
      sort_order: normalizedUpdates.sort_order
    };

    return await supabase
      .from("business_products")
      .update(safeUpdates)
      .eq("id", productId)
      .eq("owner_user_id", user.id)
      .select()
      .single();
  }

  async function deleteProduct(productId) {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user || !productId) {
      return {
        data: null,
        error: "Missing Supabase client, authenticated user, or product id."
      };
    }

    return await supabase
      .from("business_products")
      .delete()
      .eq("id", productId)
      .eq("owner_user_id", user.id)
      .select()
      .single();
  }

  async function updateProductSortOrder(productId, sortOrder) {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user || !productId) {
      return {
        data: null,
        error: "Missing Supabase client, authenticated user, or product id."
      };
    }

    return await supabase
      .from("business_products")
      .update({
        sort_order: Number(sortOrder) || 0
      })
      .eq("id", productId)
      .eq("owner_user_id", user.id)
      .select()
      .single();
  }

  async function reorderProducts(products = []) {
    const results = [];

    for (let index = 0; index < products.length; index += 1) {
      const product = products[index];

      if (!product?.id) continue;

      const result = await updateProductSortOrder(product.id, index);
      results.push(result);
    }

    const firstError = results.find((result) => result.error);

    return {
      data: results.map((result) => result.data).filter(Boolean),
      error: firstError?.error || null
    };
  }

    window.LocalityProductService = {
     getProductsForBusinessProfile,
   
     getPublicProductsForBusinessProfile,
     getPublicMarketplaceProducts,
   
     createProduct,
     updateProduct,
     deleteProduct,
     updateProductSortOrder,
     reorderProducts
   };
})();
