/* =========================
   LOCALITY SOURCING SERVICE
   Saved businesses, saved products, and basket.
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

  function uniqueIds(ids = []) {
    return [
      ...new Set(
        ids
          .map((id) => String(id || "").trim())
          .filter(Boolean)
      )
    ];
  }

  async function fetchBusinessesByIds(ids = []) {
    const supabase = getClient();
    const businessIds = uniqueIds(ids);

    if (!supabase || !businessIds.length) {
      return { data: [], error: null };
    }

    return await supabase
      .from("business_profiles")
      .select("*")
      .in("id", businessIds);
  }

  async function fetchProductsByIds(ids = []) {
    const supabase = getClient();
    const productIds = uniqueIds(ids);

    if (!supabase || !productIds.length) {
      return { data: [], error: null };
    }

    return await supabase
      .from("business_products")
      .select("*")
      .in("id", productIds);
  }

  async function getProductById(productId) {
    const supabase = getClient();

    if (!supabase || !productId) {
      return { data: null, error: "Missing product id." };
    }

    return await supabase
      .from("business_products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();
  }

  async function getBasketCount() {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user) {
      return { data: 0, error: null };
    }

    const { count, error } = await supabase
      .from("buyer_basket_items")
      .select("id", {
        count: "exact",
        head: true
      })
      .eq("user_id", user.id);

    return {
      data: count || 0,
      error
    };
  }

  async function emitBasketUpdated() {
    const { data: count } = await getBasketCount();

    try {
      window.localStorage.setItem(
        "localityBasketCount",
        String(count || 0)
      );
    } catch {
      // localStorage is optional.
    }

    window.dispatchEvent(
      new CustomEvent("locality:basket-updated", {
        detail: {
          count: count || 0
        }
      })
    );

    window.LocalityAppShell?.setBasketCount?.(count || 0);
  }

  async function saveBusiness(businessProfileId) {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user || !businessProfileId) {
      return {
        data: null,
        error: "Missing authenticated user or business profile id."
      };
    }

    return await supabase
      .from("buyer_saved_businesses")
      .upsert(
        {
          user_id: user.id,
          business_profile_id: businessProfileId
        },
        {
          onConflict: "user_id,business_profile_id"
        }
      )
      .select()
      .single();
  }

  async function unsaveBusiness(businessProfileId) {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user || !businessProfileId) {
      return {
        data: null,
        error: "Missing authenticated user or business profile id."
      };
    }

    return await supabase
      .from("buyer_saved_businesses")
      .delete()
      .eq("user_id", user.id)
      .eq("business_profile_id", businessProfileId);
  }

  async function saveProduct({
    productId,
    businessProfileId
  } = {}) {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user || !productId) {
      return {
        data: null,
        error: "Missing authenticated user or product id."
      };
    }

    let resolvedBusinessId = businessProfileId || "";

    if (!resolvedBusinessId) {
      const productResult = await getProductById(productId);

      if (productResult.error || !productResult.data) {
        return {
          data: null,
          error: productResult.error || "Product not found."
        };
      }

      resolvedBusinessId =
        productResult.data.business_profile_id;
    }

    if (!resolvedBusinessId) {
      return {
        data: null,
        error: "Missing business profile id for saved product."
      };
    }

    await saveBusiness(resolvedBusinessId);

    return await supabase
      .from("buyer_saved_products")
      .upsert(
        {
          user_id: user.id,
          business_profile_id: resolvedBusinessId,
          product_id: productId
        },
        {
          onConflict: "user_id,product_id"
        }
      )
      .select()
      .single();
  }

  async function unsaveProduct(productId) {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user || !productId) {
      return {
        data: null,
        error: "Missing authenticated user or product id."
      };
    }

    return await supabase
      .from("buyer_saved_products")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
  }

  async function addProductToBasket({
    productId,
    businessProfileId,
    quantityValue = 1,
    quantityNote = "",
    buyerNote = ""
  } = {}) {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user || !productId) {
      return {
        data: null,
        error: "Missing authenticated user or product id."
      };
    }

    let resolvedBusinessId = businessProfileId || "";

    if (!resolvedBusinessId) {
      const productResult = await getProductById(productId);

      if (productResult.error || !productResult.data) {
        return {
          data: null,
          error: productResult.error || "Product not found."
        };
      }

      resolvedBusinessId =
        productResult.data.business_profile_id;
    }

    if (!resolvedBusinessId) {
      return {
        data: null,
        error: "Missing business profile id for basket item."
      };
    }

    const safeQuantity =
      Math.max(1, Number(quantityValue) || 1);

    const existingResult = await supabase
      .from("buyer_basket_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingResult.error) {
      return {
        data: null,
        error: existingResult.error
      };
    }

    let result;

    if (existingResult.data) {
      result = await supabase
        .from("buyer_basket_items")
        .update({
          quantity_value:
            Number(existingResult.data.quantity_value || 0) +
            safeQuantity,
          quantity_note:
            quantityNote || existingResult.data.quantity_note || "",
          buyer_note:
            buyerNote || existingResult.data.buyer_note || "",
          updated_at: new Date().toISOString()
        })
        .eq("id", existingResult.data.id)
        .eq("user_id", user.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("buyer_basket_items")
        .insert({
          user_id: user.id,
          business_profile_id: resolvedBusinessId,
          product_id: productId,
          quantity_value: safeQuantity,
          quantity_note: quantityNote || "",
          buyer_note: buyerNote || ""
        })
        .select()
        .single();
    }

    await emitBasketUpdated();

    return result;
  }

  async function updateBasketItem(
    basketItemId,
    updates = {}
  ) {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user || !basketItemId) {
      return {
        data: null,
        error: "Missing authenticated user or basket item id."
      };
    }

    const safeUpdates = {
      updated_at: new Date().toISOString()
    };

    if ("quantityValue" in updates) {
      safeUpdates.quantity_value =
        Math.max(1, Number(updates.quantityValue) || 1);
    }

    if ("quantityNote" in updates) {
      safeUpdates.quantity_note =
        String(updates.quantityNote || "");
    }

    if ("buyerNote" in updates) {
      safeUpdates.buyer_note =
        String(updates.buyerNote || "");
    }

    const result = await supabase
      .from("buyer_basket_items")
      .update(safeUpdates)
      .eq("id", basketItemId)
      .eq("user_id", user.id)
      .select()
      .single();

    await emitBasketUpdated();

    return result;
  }

  async function removeBasketItem(basketItemId) {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user || !basketItemId) {
      return {
        data: null,
        error: "Missing authenticated user or basket item id."
      };
    }

    const result = await supabase
      .from("buyer_basket_items")
      .delete()
      .eq("id", basketItemId)
      .eq("user_id", user.id);

    await emitBasketUpdated();

    return result;
  }

  async function clearBasket() {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user) {
      return {
        data: null,
        error: "Missing authenticated user."
      };
    }

    const result = await supabase
      .from("buyer_basket_items")
      .delete()
      .eq("user_id", user.id);

    await emitBasketUpdated();

    return result;
  }

  async function getSavedNetwork() {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user) {
      return {
        data: {
          savedBusinesses: [],
          savedProducts: [],
          businesses: [],
          products: []
        },
        error: "Missing authenticated user."
      };
    }

    const [savedBusinessesResult, savedProductsResult] =
      await Promise.all([
        supabase
          .from("buyer_saved_businesses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("buyer_saved_products")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      ]);

    if (savedBusinessesResult.error) {
      return {
        data: null,
        error: savedBusinessesResult.error
      };
    }

    if (savedProductsResult.error) {
      return {
        data: null,
        error: savedProductsResult.error
      };
    }

    const savedBusinesses =
      savedBusinessesResult.data || [];

    const savedProducts =
      savedProductsResult.data || [];

    const productIds =
      savedProducts.map((row) => row.product_id);

    const productsResult =
      await fetchProductsByIds(productIds);

    if (productsResult.error) {
      return {
        data: null,
        error: productsResult.error
      };
    }

    const products = productsResult.data || [];

    const businessIds = uniqueIds([
      ...savedBusinesses.map(
        (row) => row.business_profile_id
      ),
      ...savedProducts.map(
        (row) => row.business_profile_id
      ),
      ...products.map(
        (product) => product.business_profile_id
      )
    ]);

    const businessesResult =
      await fetchBusinessesByIds(businessIds);

    if (businessesResult.error) {
      return {
        data: null,
        error: businessesResult.error
      };
    }

    return {
      data: {
        savedBusinesses,
        savedProducts,
        businesses: businessesResult.data || [],
        products
      },
      error: null
    };
  }

  async function getBasketItems() {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user) {
      return {
        data: {
          basketItems: [],
          businesses: [],
          products: []
        },
        error: "Missing authenticated user."
      };
    }

    const basketResult = await supabase
      .from("buyer_basket_items")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (basketResult.error) {
      return {
        data: null,
        error: basketResult.error
      };
    }

    const basketItems = basketResult.data || [];

    const productsResult =
      await fetchProductsByIds(
        basketItems.map((item) => item.product_id)
      );

    if (productsResult.error) {
      return {
        data: null,
        error: productsResult.error
      };
    }

    const products = productsResult.data || [];

    const businessesResult =
      await fetchBusinessesByIds([
        ...basketItems.map(
          (item) => item.business_profile_id
        ),
        ...products.map(
          (product) => product.business_profile_id
        )
      ]);

    if (businessesResult.error) {
      return {
        data: null,
        error: businessesResult.error
      };
    }

    return {
      data: {
        basketItems,
        businesses: businessesResult.data || [],
        products
      },
      error: null
    };
  }

  window.LocalitySourcingService = {
    getSavedNetwork,
    getBasketItems,
    getBasketCount,

    saveBusiness,
    unsaveBusiness,
    saveProduct,
    unsaveProduct,

    addProductToBasket,
    updateBasketItem,
    removeBasketItem,
    clearBasket,

    emitBasketUpdated
  };
})();
