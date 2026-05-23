/* =========================
   LOCALITY MAP PAGE
========================= */

const mapElement = document.getElementById("localityMap");

if (mapElement) {
  const map = L.map("localityMap", {
    zoomControl: false
  }).setView([33.45, -111.95], 9);

  L.control.zoom({
    position: "bottomright"
  }).addTo(map);

   L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
     attribution: "&copy; OpenStreetMap contributors",
     maxZoom: 19
   }).addTo(map);

   
const markers = [];
   

function getProfileIcon(variant) {
  const icons = {
    leaf: "❦",
    sun: "◉",
    field: "≋",
    sprout: "◜",
    barn: "⌂",
    orchard: "✿",

    market: "▣",
    basket: "◫",
    store: "⌑",
    kitchen: "◌",
    table: "⬒",
    hall: "◈",
    restaurant: "◫",
    chef: "◍",
    cactus: "✦"
  };

  return icons[variant] || "●";
}

   function getProductIcon(category) {
  const icons = {
    "leafy-greens": "🥬",
    "root-vegetables": "🥕",
    "fruit": "🍎",
    "citrus": "🍊",
    "dairy": "🥛",
    "eggs": "🥚",
    "meat": "🥩",
    "poultry": "🍗",
    "grains": "🌾",
    "rice": "🍚",
    "nuts": "🌰",
    "herbs": "🌿",
    "honey": "🍯",
    "specialty": "✦"
  };

  return icons[category] || "•";
}



function getOrganicBadge() {
  return `
    <div class="organic-badge">
      <span class="organic-inner">
        <svg viewBox="0 0 24 24">
          <path d="M5 13c0-4.8 3.7-8.7 8.6-8.9 1.3-.1 2.5.1 3.7.5-.2 1.2-.6 2.5-1.3 3.7C14 11.8 10.1 13.5 5 13Z"/>
          <path d="M5 13c2.8-.1 6.5-1.6 10.2-5.5"/>
          <path d="M5 13c.5 4 3.5 6.4 7 6.4"/>
        </svg>
      </span>
    </div>
  `;
}

   function getCoalitionBadge() {
  return `
    <div class="coalition-badge">
      <span class="coalition-inner">
        <svg viewBox="0 0 24 24">
          <circle cx="8" cy="8" r="3"></circle>
          <circle cx="16" cy="8" r="3"></circle>
          <circle cx="12" cy="15" r="3"></circle>
        </svg>
      </span>
    </div>
  `;
}

 function createPin(profile) {
  const pinClass = profile.type === "farm" ? "farm-pin" : "buyer-pin";
  const mainIcon = getProfileIcon(profile.iconVariant);

  const organicBadge = profile.organic ? getOrganicBadge() : "";
  const coalitionBadge = profile.coalition ? getCoalitionBadge() : "";

  return L.divIcon({
    className: "",
    html: `
      <div class="pin-wrap">
        <div class="locality-pin ${pinClass}">
          <span class="pin-glyph">${mainIcon}</span>
          ${organicBadge}
          ${coalitionBadge}
        </div>
      </div>
    `,
    iconSize: [68, 78],
    iconAnchor: [34, 68],
    popupAnchor: [0, -62]
  });
}
 function popupContent(profile) {
  return `
    <div class="profile-popup">

      ${
        profile.logo
          ? `
            <div class="popup-logo-wrap">
              <img
                src="images/logos/${profile.logo}"
                alt="${profile.name} logo"
                class="popup-logo"
              />
            </div>
          `
          : ""
      }

      <h3>${profile.name}</h3>

      <div class="profile-meta">
        ${profile.location}
      </div>

      <p>${profile.product}</p>

      <div class="profile-stats">
        <span class="profile-stat">
          ${profile.type === "farm" ? "Supplier" : "Buyer"}
        </span>

        ${
          profile.organic
            ? `<span class="profile-stat">Organic</span>`
            : ""
        }

        ${
          profile.coalition
            ? `<span class="profile-stat">Coalition</span>`
            : ""
        }

        <span class="profile-stat">
          Weekly Availability
        </span>
      </div>

    </div>
  `;
}

  function renderMarkers() {
    markers.forEach((marker) => map.removeLayer(marker));
    markers.length = 0;

    const typeFilter = document.getElementById("typeFilter")?.value || "all";
    const productFilter = document.getElementById("productFilter")?.value || "all";
    const organicOnly = document.getElementById("organicFilter")?.checked || false;

    profiles.forEach((profile) => {
      const matchesType = typeFilter === "all" || profile.type === typeFilter;
      const matchesProduct = productFilter === "all" || profile.productType === productFilter;
      const matchesOrganic = !organicOnly || profile.organic;

      if (!matchesType || !matchesProduct || !matchesOrganic) return;

      const marker = L.marker([profile.lat, profile.lng], {
        icon: createPin(profile)
      }).addTo(map);

      marker.bindTooltip(popupContent(profile), {
  permanent: false,
  direction: "top",
  offset: [0, -50],
  className: "profile-hover-card",
         
});
       marker.on("click", () => {
  openProfilePanel(profile);
});

marker.on("mouseover", function () {
  this.openTooltip();
});

marker.on("mouseout", function () {
  this.closeTooltip();
});

      markers.push(marker);
    });
  }

function openProfilePanel(profile) {
  const panel = document.getElementById("profilePanel");
  if (!panel) return;

  const profileLogo = document.getElementById("profileLogo");

   document
  .getElementById("profileCover")
  .classList.toggle("buyer", profile.type === "buyer");

if (profile.logo) {
  profileLogo.innerHTML = `
    <img
      src="images/logos/${profile.logo}"
      alt="${profile.name} logo"
    />
  `;
} else {
  profileLogo.textContent =
    profile.logoInitials || profile.name.slice(0, 2).toUpperCase();
}

  document.getElementById("profileLogo").classList.toggle("buyer", profile.type === "buyer");
  document.getElementById("profileType").textContent =
    profile.type === "farm" ? "Supplier profile" : "Buyer profile";

  document.getElementById("profileName").textContent = profile.name;
  document.getElementById("profileLocation").textContent = profile.location;
  document.getElementById("profileDescription").textContent =
    profile.description || profile.product;

  document.getElementById("profileTags").innerHTML = `
    <span>${profile.productType}</span>
    ${profile.organic ? "<span>Organic</span>" : ""}
    ${profile.coalition ? `<span>Coalition</span>` : ""}
  `;

  const productCards = (profile.productsAvailable || [])
  .map((item) => {
    const itemIsOrganic = item.organic ?? profile.organic;

    return `
      <div class="product-card">
        ${itemIsOrganic ? `<div class="product-organic-badge">Organic</div>` : ""}

        <h4>${item.name}</h4>

        <div class="product-price">
          ${item.price}
        </div>

        ${
          item.marketComparison
            ? `<div class="market-comparison">${item.marketComparison}</div>`
            : ""
        }

        <div class="product-note">
          ${item.note || ""}
        </div>
      </div>
    `;
  })
  .join("");

document.getElementById("profileStats").innerHTML =
  profile.type === "farm"
    ? `
      <div class="profile-overview-grid">
        <div class="overview-card">
          <span>Availability</span>
          <strong>${profile.availability || "Seasonal"}</strong>
        </div>

        <div class="overview-card">
          <span>Lead Time</span>
          <strong>${profile.leadTime || "Contact supplier"}</strong>
        </div>

        <div class="overview-card">
          <span>Minimum Order</span>
          <strong>${profile.minimumOrder || "Flexible"}</strong>
        </div>

        <div class="overview-card">
          <span>Supply Type</span>
          <strong>${profile.organic ? "Organic" : "Conventional"}</strong>
        </div>
      </div>

      <div class="profile-section-title">Available Products</div>

      <div class="product-scroll">
        ${productCards}
      </div>
    `
    : `
      <div class="profile-overview-grid">
        <div class="overview-card">
          <span>Demand Need</span>
          <strong>${profile.demandNeed || profile.product}</strong>
        </div>

        <div class="overview-card">
          <span>Order Frequency</span>
          <strong>${profile.orderFrequency || "Recurring"}</strong>
        </div>

        <div class="overview-card">
          <span>Preferred Radius</span>
          <strong>${profile.preferredRadius || "Regional"}</strong>
        </div>

        <div class="overview-card">
          <span>Sourcing Style</span>
          <strong>${profile.sourcingStyle || "Mixed suppliers"}</strong>
        </div>
      </div>
    `;

panel.classList.add("active");
}

   
  renderMarkers();

  document.getElementById("typeFilter")?.addEventListener("change", renderMarkers);
  document.getElementById("productFilter")?.addEventListener("change", renderMarkers);
  document.getElementById("organicFilter")?.addEventListener("change", renderMarkers);

  /* Soft regional demand zones */

  L.circle([33.4152, -111.8315], {
    radius: 12000,
    color: "#08c464",
    weight: 1.4,
    fillColor: "#7ed957",
    fillOpacity: 0.12,
    opacity: 0.35
  }).addTo(map).bindPopup(`
    <div class="profile-popup">
      <h3>East Valley Demand Region</h3>
      <p>Mesa, Gilbert, Chandler, and Tempe show strong sample demand for produce, dairy, and recurring restaurant sourcing.</p>
    </div>
  `);

   document.getElementById("profileClose")?.addEventListener("click", () => {
  document.getElementById("profilePanel")?.classList.remove("active");
});

  L.circle([33.4484, -112.0740], {
    radius: 10000,
    color: "#14325c",
    weight: 1.2,
    fillColor: "#14325c",
    fillOpacity: 0.055,
    opacity: 0.25
  }).addTo(map).bindPopup(`
    <div class="profile-popup">
      <h3>Phoenix Buyer Cluster</h3>
      <p>Urban restaurant and grocery demand concentrated around recurring weekly orders.</p>
    </div>
  `);
}

