/* =========================
   LOCALITY ORDERING RULES
   Shared buyer-facing order classification.
========================= */

(function () {
  const allowedOrderModes = new Set([
    "buy_now",
    "request_only",
    "not_orderable"
  ]);

  function normalizeOrderMode(value) {
    const mode =
      String(value || "")
        .trim()
        .toLowerCase();

    return allowedOrderModes.has(mode)
      ? mode
      : "buy_now";
  }

  function getSourceProduct(product = {}) {
    return product.sourceProduct || product;
  }

  function getField(
    product,
    snakeCaseName,
    camelCaseName
  ) {
    const source =
      getSourceProduct(product);

    return (
      product?.[snakeCaseName] ??
      product?.[camelCaseName] ??
      source?.[snakeCaseName] ??
      source?.[camelCaseName]
    );
  }

  function clampQuantity(value) {
    const parsed =
      Number.parseInt(value, 10);

    if (
      !Number.isFinite(parsed) ||
      parsed < 1
    ) {
      return 1;
    }

    return parsed;
  }

  function getPositiveNumber(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    const parsed =
      Number(value);

    return (
      Number.isFinite(parsed) &&
      parsed > 0
    )
      ? parsed
      : null;
  }

  function formatQuantity(value) {
    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      return "";
    }

    return Number.isInteger(number)
      ? String(number)
      : String(
          Number(number.toFixed(2))
        );
  }

  function getUnit(product = {}) {
    const unit =
      String(
        getField(
          product,
          "buy_now_limit_unit",
          "buyNowLimitUnit"
        ) ||
        getField(
          product,
          "price_unit",
          "priceUnit"
        ) ||
        "unit"
      ).trim();

    return unit === "custom"
      ? (
          getField(
            product,
            "unit_description",
            "unitDescription"
          ) ||
          "custom unit"
        )
      : unit;
  }

  function getProductOrderStatus(
    product = {},
    quantity = 1,
    businessName = "this business"
  ) {
    const orderMode =
      normalizeOrderMode(
        getField(
          product,
          "order_mode",
          "orderMode"
        )
      );

    const selectedQuantity =
      clampQuantity(quantity);

    const buyNowLimit =
      getPositiveNumber(
        getField(
          product,
          "buy_now_limit",
          "buyNowLimit"
        )
      );

    const unit =
      getUnit(product);

    const formattedQuantity =
      formatQuantity(selectedQuantity);

    const formattedLimit =
      formatQuantity(buyNowLimit);

    const sellerNote =
      String(
        getField(
          product,
          "request_threshold_note",
          "requestThresholdNote"
        ) || ""
      ).trim();

    if (orderMode === "not_orderable") {
      return {
        orderMode,
        tone: "blocked",
        compactLabel: "Not orderable",
        title: "Not available to order",
        description:
          "This product is currently shown for reference and cannot be added to your basket.",
        sellerNote,
        canAddToBasket: false,
        requiresRequest: false,
        isOverLimit: false,
        quantity: selectedQuantity,
        buyNowLimit,
        unit
      };
    }

    if (orderMode === "request_only") {
      return {
        orderMode,
        tone: "request",
        compactLabel:
          "Seller approval required",
        title:
          "Seller approval required",
        description:
          `This product must be confirmed by ${businessName} before the order is final. Adding it means your entire order from ${businessName} will be sent as a request.`,
        sellerNote,
        canAddToBasket: true,
        requiresRequest: true,
        isOverLimit: false,
        quantity: selectedQuantity,
        buyNowLimit: null,
        unit
      };
    }

    if (
      buyNowLimit !== null &&
      selectedQuantity > buyNowLimit
    ) {
      return {
        orderMode,
        tone: "request",
        compactLabel:
          "Seller approval required",
        title:
          `${formattedQuantity} ${unit} requires approval`,
        description:
          `You selected ${formattedQuantity} ${unit}, which is above the ${formattedLimit} ${unit} buy-now limit. Your entire order from ${businessName} will be sent as a request.`,
        sellerNote,
        canAddToBasket: true,
        requiresRequest: true,
        isOverLimit: true,
        quantity: selectedQuantity,
        buyNowLimit,
        unit
      };
    }

    if (buyNowLimit !== null) {
      return {
        orderMode,
        tone: "limited",
        compactLabel:
          `Buy now up to ${formattedLimit} ${unit}`,
        title:
          `Buy now up to ${formattedLimit} ${unit}`,
        description:
          `You can order up to ${formattedLimit} ${unit} immediately. Larger quantities require seller approval and turn your entire order from ${businessName} into a request.`,
        sellerNote,
        canAddToBasket: true,
        requiresRequest: false,
        isOverLimit: false,
        quantity: selectedQuantity,
        buyNowLimit,
        unit
      };
    }

    return {
      orderMode,
      tone: "buy-now",
      compactLabel: "Buy now",
      title: "Buy now",
      description:
        "This product can be ordered immediately without seller approval.",
      sellerNote,
      canAddToBasket: true,
      requiresRequest: false,
      isOverLimit: false,
      quantity: selectedQuantity,
      buyNowLimit: null,
      unit
    };
  }

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.LocalityOrderingRules = {
    normalizeOrderMode,
    clampQuantity,
    formatQuantity,
    getProductOrderStatus,
    escapeHtml
  };
})();
