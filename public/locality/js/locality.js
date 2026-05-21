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

   
const profiles = [
   {
     name: "Queen Creek Harvest",
     type: "farm",
     coalition: "east-valley-growers",
     iconVariant: "leaf",
     logo: "Queen Creek Harvest Logo.png",
     productType: "produce",
     product: "Leafy greens, tomatoes, herbs",
     location: "Queen Creek, AZ",
     organic: true,
     lat: 33.1917,
     lng: -111.5582
   },
   {
     name: "Desert Bloom Produce",
     type: "farm",
     iconVariant: "sprout",
     logo: "Desert Bloom Produce Logo.png",
     productType: "produce",
     product: "Citrus, melons, seasonal vegetables",
     location: "East Mesa / Apache Junction, AZ",
     organic: false,
     lat: 33.3707,
     lng: -111.5721
   },
   {
     name: "Copper Creek Dairy",
     type: "farm",
     coalition: "west-valley-dairy",
     iconVariant: "barn",
     logo: "Copper Creek Dairy Logo.png",
     productType: "dairy",
     product: "Milk, cheese, yogurt",
     location: "Buckeye, AZ",
     organic: true,
     lat: 33.3356,
     lng: -112.6175
   },
   {
     name: "Sonoran Pastures",
     type: "farm",
     coalition: "west-valley-dairy",
     iconVariant: "sun",
     logo: "Sonoran Pastures Logo.png",
     productType: "meat",
     product: "Beef, poultry, eggs",
     location: "Casa Grande, AZ",
     organic: false,
     lat: 32.9272,
     lng: -111.7419
   },
   {
     name: "Verde Citrus Collective",
     type: "farm",
     iconVariant: "orchard",
     logo: "Verde Citrus Collective Logo.png",
     productType: "produce",
     product: "Citrus, dates, specialty fruit",
     location: "Goodyear / Laveen, AZ",
     organic: true,
     lat: 33.3471,
     lng: -112.2576
   },
   
   {
     name: "Arcadia Table",
     type: "buyer",
     iconVariant: "table",
     logo: "Arcadia Table Logo.png",
     productType: "produce",
     product: "Weekly produce sourcing",
     location: "Phoenix, AZ",
     organic: false,
     lat: 33.4942,
     lng: -111.9865
   },
   {
     name: "Mesa Fresh Market",
     type: "buyer",
     iconVariant: "basket",
     logo: "Mesa Fresh Market Logo.png",
     productType: "produce",
     product: "Local produce and dairy",
     location: "Mesa, AZ",
     organic: false,
     lat: 33.4152,
     lng: -111.8315
   },
   {
     name: "Tempe Kitchen Co.",
     type: "buyer",
     iconVariant: "kitchen",
     logo: "Tempe Kitchen Co Logo.png",
     productType: "specialty",
     product: "Restaurant sourcing",
     location: "Tempe, AZ",
     organic: false,
     lat: 33.4255,
     lng: -111.9400
   },
   {
     name: "Scottsdale Grocer",
     type: "buyer",
     iconVariant: "store",
     logo: "Scottsdale Grocer Logo.png",
     productType: "produce",
     product: "Organic produce requests",
     location: "Scottsdale, AZ",
     organic: false,
     lat: 33.4942,
     lng: -111.9261
   },
   {
     name: "Chandler Local Pantry",
     type: "buyer",
     iconVariant: "kitchen",
     logo: "Chandler Local Pantry Logo.png",
     productType: "dairy",
     product: "Dairy, eggs, herbs",
     location: "Chandler, AZ",
     organic: false,
     lat: 33.3062,
     lng: -111.8413
},
   
{
  name: "Sonoran Grove Co.",
  type: "farm",
  coalition: "east-valley-growers",
  iconVariant: "orchard",
  logo: "Sonoran Grove Co Logo.png",
  productType: "produce",
  product: "Citrus, olives, herbs",
  location: "North Scottsdale, AZ",
  organic: true,
  lat: 33.7055,
  lng: -111.8892
},
{
  name: "Agua Fria Fields",
  type: "farm",
  iconVariant: "field",
  logo: "Agua Fria Fields Logo.png",
  productType: "grains",
  product: "Wheat, hay, feed crops",
  location: "Buckeye, AZ",
  organic: false,
  lat: 33.2768,
  lng: -112.8594
},
{
  name: "Mesa Verde Organics",
  type: "farm",
  iconVariant: "sprout",
  logo: "Mesa Verde Organics Logo.png",
  productType: "produce",
  product: "Microgreens, lettuce, herbs",
  location: "East Mesa, AZ",
  organic: true,
  lat: 33.3558,
  lng: -111.6285
},
{
  name: "Phoenix Artisan Market",
  type: "buyer",
  iconVariant: "market",
  logo: "Phoenix Artisan Market Logo.png",
  productType: "mixed",
  product: "Regional sourcing",
  location: "Downtown Phoenix, AZ",
  organic: false,
  lat: 33.4519,
  lng: -112.0735
},

   {
  name: "Roosevelt Row",
  type: "buyer",
  iconVariant: "kitchen",
  logo: "Roosevelt Row Logo.png",
  productType: "produce",
  product: "Seasonal vegetables, herbs, citrus",
  location: "Downtown Phoenix, AZ",
  organic: false,
  coalition: null,
  logoInitials: "RR",
  description: "A neighborhood restaurant sourcing seasonal ingredients from nearby farms for rotating menus.",
  demandNeed: "Fresh produce, herbs, citrus",
  orderFrequency: "Twice weekly",
  preferredRadius: "45 miles",
  lat: 33.4589,
  lng: -112.0737
},
{
  name: "Saguaro Kitchen",
  type: "buyer",
  iconVariant: "cactus",
  logo: "Saguaro Kitchen Logo.png",
  productType: "mixed",
  product: "Produce, eggs, dairy, specialty ingredients",
  location: "Arcadia, Phoenix, AZ",
  organic: true,
  coalition: null,
  logoInitials: "SK",
  description: "A farm-to-table restaurant focused on local sourcing and long-term supplier relationships.",
  demandNeed: "Produce, eggs, dairy",
  orderFrequency: "Weekly",
  preferredRadius: "35 miles",
  lat: 33.5224,
  lng: -111.9257
},
{
  name: "Grain & Garden",
  type: "buyer",
  iconVariant: "restaurant",
  logo: "Grain & Garden Logo.png",
  productType: "mixed",
  product: "Grains, greens, mushrooms, seasonal produce",
  location: "Tempe, AZ",
  organic: false,
  coalition: null,
  logoInitials: "GG",
  description: "A casual dining concept looking for reliable local supply across grains, greens, and seasonal produce.",
  demandNeed: "Grains, greens, seasonal produce",
  orderFrequency: "Weekly",
  preferredRadius: "40 miles",
  lat: 33.3474,
  lng: -111.9093
},
   
{
  name: "Gilbert Community Foods",
  type: "buyer",
  iconVariant: "basket",
  logo: "Gilbert Community Foods Logo.png",
  productType: "mixed",
  product: "Local produce purchasing",
  location: "Gilbert, AZ",
  organic: true,
  lat: 33.3526,
  lng: -111.7890
}
];

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

  document.getElementById("profileLogo").textContent =
    profile.logoInitials || profile.name.slice(0, 2).toUpperCase();

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

  document.getElementById("profileStats").innerHTML =
    profile.type === "farm"
      ? `
        <div class="profile-stat">
          <small>Availability</small>
          <strong>${profile.availability || "Seasonal"}</strong>
        </div>
        <div class="profile-stat">
          <small>Products</small>
          <strong>${profile.product}</strong>
        </div>
        <div class="profile-stat">
          <small>Lead Time</small>
          <strong>${profile.leadTime || "Contact supplier"}</strong>
        </div>
        <div class="profile-stat">
          <small>Minimum Order</small>
          <strong>${profile.minimumOrder || "Flexible"}</strong>
        </div>
      `
      : `
        <div class="profile-stat">
          <small>Demand Need</small>
          <strong>${profile.demandNeed || profile.product}</strong>
        </div>
        <div class="profile-stat">
          <small>Order Frequency</small>
          <strong>${profile.orderFrequency || "Recurring"}</strong>
        </div>
        <div class="profile-stat">
          <small>Preferred Radius</small>
          <strong>${profile.preferredRadius || "Regional"}</strong>
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

