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
      lat: 33.2487,
      lng: -111.6343
    },
    {
      name: "Desert Bloom Produce",
      type: "farm",
      productType: "produce",
      product: "Citrus, melons, seasonal vegetables",
      location: "Mesa, AZ",
      organic: false,
      lat: 33.3650,
      lng: -111.7200
    },
    {
      name: "Copper Creek Dairy",
      type: "farm",
      productType: "dairy",
      product: "Milk, cheese, yogurt",
      location: "Buckeye, AZ",
      organic: true,
      lat: 33.3703,
      lng: -112.5838
    },
    {
      name: "Sonoran Pastures",
      type: "farm",
      productType: "meat",
      product: "Beef, poultry, eggs",
      location: "Casa Grande, AZ",
      organic: false,
      lat: 32.8795,
      lng: -111.7574
    },
    {
      name: "Verde Citrus Collective",
      type: "farm",
      productType: "produce",
      product: "Citrus, dates, specialty fruit",
      location: "Goodyear, AZ",
      organic: true,
      lat: 33.4353,
      lng: -112.3582
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

  function createPin(profile) {
    const iconSymbol = profile.type === "farm" ? "🌱" : "◎";
    const pinClass = profile.type === "farm" ? "farm-pin" : "buyer-pin";

    const organicBadge = profile.organic
      ? `<div class="organic-badge">✓</div>`
      : "";

    return L.divIcon({
      className: "",
      html: `
        <div class="locality-pin ${pinClass}">
          <span>${iconSymbol}</span>
          ${organicBadge}
        </div>
      `,
      iconSize: [46, 46],
      iconAnchor: [23, 46],
      popupAnchor: [0, -44]
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
