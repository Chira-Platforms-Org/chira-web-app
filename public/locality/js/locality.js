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
     productType: "dairy",
     product: "Dairy, eggs, herbs",
     location: "Chandler, AZ",
     organic: false,
     lat: 33.3062,
     lng: -111.8413
}
];

const markers = [];
   

function getProductIcon(productType) {
  if (productType === "produce") {
    return `
      <svg viewBox="0 0 24 24" class="pin-svg">
        <path d="M6 13c0-4.8 3.7-8.7 8.5-8.9 1.1 0 2.2.1 3.2.4-.1 1-.4 2.1-1 3.1C14.8 11.5 10.7 13.3 6 13Z"/>
        <path d="M6 13c.5 4.2 3.6 6.7 7.1 6.7 3.8 0 6.8-3.1 6.8-6.9 0-1.4-.4-2.7-1.1-3.8"/>
        <path d="M6 13c2.8-.2 6.2-1.7 9.5-5.6"/>
      </svg>
    `;
  }

  if (productType === "dairy") {
    return `
      <svg viewBox="0 0 24 24" class="pin-svg">
        <path d="M9 3h6l-.6 4.2 1.7 2.2c.6.8.9 1.7.9 2.7V20c0 .7-.5 1-1.1 1H8.1C7.5 21 7 20.7 7 20v-7.9c0-1 .3-1.9.9-2.7l1.7-2.2L9 3Z"/>
        <path d="M8 13h8"/>
        <path d="M10 7h4"/>
      </svg>
    `;
  }

  if (productType === "meat") {
    return `
      <svg viewBox="0 0 24 24" class="pin-svg">
        <path d="M8.5 18.5c-3-2.1-3.9-5.9-1.9-8.8 2.3-3.3 6.8-4.5 10.3-2.7 2.9 1.5 4.1 4.8 2.7 7.4-1.8 3.4-7 6.3-11.1 4.1Z"/>
        <path d="M8.5 18.5 5 22"/>
        <path d="M15.5 9.5c.8.5 1.2 1.4 1 2.2"/>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" class="pin-svg">
      <path d="M12 21c4.5-4.6 7-8.2 7-11.2C19 5.9 15.9 3 12 3S5 5.9 5 9.8C5 12.8 7.5 16.4 12 21Z"/>
      <circle cx="12" cy="9.5" r="2.4"/>
    </svg>
  `;
}

function getBuyerIcon(productType) {
  if (productType === "specialty") {
    return `
      <svg viewBox="0 0 24 24" class="pin-svg">
        <path d="M6 9h11v5.5A4.5 4.5 0 0 1 12.5 19h-2A4.5 4.5 0 0 1 6 14.5V9Z"/>
        <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/>
        <path d="M8 5c0 1 .6 1.4.6 2.2"/>
        <path d="M12 5c0 1 .6 1.4.6 2.2"/>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" class="pin-svg">
      <path d="M6 8h12l-1.2 10H7.2L6 8Z"/>
      <path d="M9 8a3 3 0 0 1 6 0"/>
      <path d="M8 12h8"/>
    </svg>
  `;
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
   
  function createPin(profile) {
  const pinClass = profile.type === "farm" ? "farm-pin" : "buyer-pin";

  const mainIcon = profile.type === "farm"
    ? getProductIcon(profile.productType)
    : getBuyerIcon(profile.productType);

  const organicBadge = profile.organic ? getOrganicBadge() : "";

  const productChip = profile.type === "farm"
    ? `<div class="product-chip">${profile.productType}</div>`
    : "";

  return L.divIcon({
    className: "",
    html: `
      <div class="pin-wrap">
        <div class="locality-pin ${pinClass}">
          ${mainIcon}
          ${organicBadge}
        </div>
        ${productChip}
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
        <p><strong>${profile.location}</strong></p>
        <p>${profile.product}</p>
        <p>${profile.type === "farm" ? "Supplier profile" : "Buyer profile"}</p>
        ${profile.organic ? `<span class="popup-badge">Organic certified</span>` : ""}
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

      marker.bindPopup(popupContent(profile));

      markers.push(marker);
    });
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
