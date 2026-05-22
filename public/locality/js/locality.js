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
     product: "Leafy greens, tomatoes, seasonal vegetables, herbs",
     location: "Queen Creek, AZ",
     organic: true,
     lat: 33.1917,
     lng: -111.5582,
         featuredInsight: "Above average lead time on certain products.",
         deliveryRadius: "100 miles",
         minimumOrder: "Fixed",
         leadTime: "10–14 days",
         productsAvailable: [
           { name: "Red Cabbage", price: "$0.90/lb", note: "Available" },
           { name: "Rainbow Carrots", price: "$2.50/lb", note: "Low inventory" },
           { name: "Heirloom Tomatoes", price: "$4.40/lb", note: "High availability" },
           { name: "Sugar Snap Peas", price: "$4.90/lb", note: "Limited weekly harvest" },
           { name: "Black Tuscan Kale", price: "$4.20/lb", note: "Limited weekly harvest" },
           { name: "Red Beets", price: "$3.00/lb", note: "Available" },
           { name: "Golden Beets", price: "$3.10/lb", note: "Available" },
           { name: "Broccoli", price: "$3.50/lb", note: "Available" },
           { name: "Broccolini", price: "$5.10/lb", note: "Pre-order preferred" },
           { name: "Eggplant", price: "$2.10/lb", note: "Longer than average lead times" },
           { name: "Dried Rosemary", price: "$6.50/oz", note: "Limited" },
           { name: "Basil", price: "$2.90/oz", note: "Available" },
           { name: "Thyme", price: "$2.90/oz", note: "Longer than average lead times" },
           { name: "Mint", price: "$3.10/oz", note: "Longer than average lead times" }
            
            
         ]
   },
   {
     name: "Desert Bloom Produce",
     type: "farm",
     iconVariant: "sprout",
     logo: "Desert Bloom Produce Logo.png",
     productType: "produce",
     product: "Basic produce",
     location: "East Mesa / Apache Junction, AZ",
     organic: false,
     lat: 33.3707,
     lng: -111.5721,
         featuredInsight: "High availability of products.",
         deliveryRadius: "60 miles",
         minimumOrder: "Flexible",
         leadTime: "2–4 days",
         productsAvailable: [
           { name: "Iceberg Lettuce", price: "$2.10/lb", note: "High availability" },
           { name: "Carrots", price: "$0.60/lb", note: "Available" },
           { name: "Russet Potatoes", price: "$0.90/lb", note: "High availability" },
           { name: "Yukon Gold Potatoes", price: "$1.20/lb", note: "High availability" },
           { name: "Yellow Onions", price: "$1.00/lb", note: "High availability" },
           { name: "Red Onions", price: "$1.10/lb", note: "High availability" },
           { name: "Sweet Onions", price: "$1.40/lb", note: "Available" },
           { name: "Broccoli", price: "$3.10/lb", note: "Available" },
           { name: "Purple Shallots", price: "$4.10/lb", note: "Pre-order preferred" }
         ]
   },
   {
     name: "Copper Creek Dairy",
     type: "farm",
     coalition: "west-valley-dairy",
     iconVariant: "barn",
     logo: "Copper Creek Dairy Logo.png",
     productType: "dairy",
     product: "Milk, cheese, butter",
     location: "Buckeye, AZ",
     organic: true,
     lat: 33.3356,
     lng: -112.6175,
         featuredInsight: "Discounts available when purchasing larger quantities.",
         deliveryRadius: "100 miles",
         minimumOrder: "Fixed",
         leadTime: "10–14 days",
         productsAvailable: [
           { name: "Raw Milk", price: "$7.50/gal", note: "Pre-order preferred" },
           { name: "Pasteurized Whole Milk", price: "$3.10/lb", note: "Available" },
           { name: "Pasteurized 2% Milk", price: "$3.10/lb", note: "Available" },
           { name: "Pasteurized 1% Milk", price: "$3.10/lb", note: "Available" },
           { name: "Cultured Butter", price: "$4.00/lb", note: "Available" },
           { name: "Ricotta", price: "$6.90/lb", note: "Available" },
           { name: "Queso Fresco", price: "$6.10/lb", note: "Available" },
           { name: "Farmhouse Cheddar", price: "$3.90/lb", note: "Available" },
           { name: "Gouda", price: "$4.20/lb", note: "Pre-order preferred" },
           { name: "Sharp Manchego", price: "$12.50/lb", note: "Longer than average lead times" },
           { name: "Parmesan", price: "$14.00/lb", note: "Longer than average lead times" },
           { name: "Clover Honey", price: "$9.10/lb", note: "Bulk pre-orders preferred" },
           { name: "Beeswax Blocks", price: "$11.10/lb", note: "Limited Availability" }
            
         ]
   },
   {
     name: "Sonoran Pastures",
     type: "farm",
     coalition: "west-valley-dairy",
     iconVariant: "sun",
     logo: "Sonoran Pastures Logo.png",
     productType: "meat",
     product: "Milk, butter, eggs",
     location: "Casa Grande, AZ",
     organic: false,
     lat: 32.9272,
     lng: -111.7419,
     productsAvailable: [
           { name: "Pasteurized Whole Milk", price: "$2.90/lb", note: "Available" },
           { name: "Pasteurized 2% Milk", price: "$2.90/lb", note: "Available" },
           { name: "Pasteurized Whole Milk", price: "$2.90/lb", note: "Available" },
           { name: "Salted Butter", price: "$4.20/lb", note: "Available" },
           { name: "European Style Butter", price: "$4.10/lb", note: "Available"},
           { name: "Raw Butter", price: "$5.50/lb", note: "Pre-order preferred" },
           { name: "Eggs", price: "$3.70/dozen", note: "Available" }
            
         ]

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
     lng: -112.2576,
         featuredInsight: "Listed citrus is 8% below the Phoenix regional average.",
         deliveryRadius: "45 miles",
         minimumOrder: "Flexible",
         leadTime: "3–5 days",
         productsAvailable: [
           { name: "Citrus Box", price: "$34/case", note: "Seasonal" },
           { name: "Dates", price: "$18/lb", note: "Limited" },
           { name: "Eureka Lemons", price: "$1.90/lb", note: "High Availability" },
           { name: "Meyer Lemons", price: "$2.30/lb", note: "Available" },
           { name: "Persian Limes", price: "$2.30/lb", note: "Available" },
           { name: "Cara Cara Oranges", price: "$2.40/lb", note: "Available" },
           { name: "Blood Oranges", price: "$3.25/lb", note: "Limited" },
           { name: "Navel Oranges", price: "$1.65/lb", note: "High Availability" },
           { name: "Ruby Red Grapefruits", price: "$2.40/lb", note: "Seasonal" },
           { name: "Pomelos", price: "$3.10/lb", note: "Seasonal" },
           { name: "Clementines/Mandarins", price: "$2.55/lb", note: "Available" }
         ]
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
     logo: "Chandler Local Pantry logo.png",
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
  product: "Meat, Poultry, Eggs",
  location: "North Scottsdale, AZ",
  organic: true,
  lat: 33.7055,
  lng: -111.8892,
        featuredInsight: "Pre-orders are preferred due to limited availability.",
         deliveryRadius: "40 miles",
         minimumOrder: "Flexible",
         leadTime: "2–4 days",
         productsAvailable: [
           { name: "Grass-Fed Ribeye", price: "$15.10/lb", note: "Limited" },
           { name: "Heritage Breed Pork Chops", price: "$8.20/lb", note: "Pre-order preferred" },
           { name: "Heritage Breed Pork Shoulder", price: "$8.90/lb", note: "Pre-order preferred" },
           { name: "Grass-Fed Beef Flank Steak", price: "$6.20/lb", note: "High availability" },
           { name: "Bulk Grass-Fed Beef", price: "negotiable", note: "Please message for info" },
           { name: "Bulk Heritage Pork", price: "negotiable", note: "Please message for info" },
           { name: "Pastured Whole Chicken", price: "$2.80/lb", note: "Available" },
           { name: "Whole Pasture-Raised Ducks", price: "$11.80/lb", note: "Limited" },
           { name: "Homemade Variety Sausages", price: "$3.00/lb", note: "Pre-order preferred" },
           { name: "Eggs", price: "$3.90/dozen", note: "Limited" }
         ]
   
},
{
  name: "Agua Fria Fields",
  type: "farm",
  iconVariant: "field",
  logo: "Agua Fria Fields Logo.png",
  productType: "grains",
  product: "Grains, nuts, produce",
  location: "Buckeye, AZ",
  organic: false,
  lat: 33.2768,
  lng: -112.8594,
   featuredInsight: "Listed goods below average market costs.",
         deliveryRadius: "100 miles",
         minimumOrder: "Fixed",
         leadTime: "10–14 days",
         productsAvailable: [
           { name: "Red Cabbage", price: "$0.80/lb", note: "Available" },
           { name: "Carrots", price: "$1.90/lb", note: "Available" },
           { name: "Heirloom Tomatoes", price: "$3.50/lb", note: "High availability" },
           { name: "Summer Squash (Multiple Types)", price: "$3.20/lb", note: "Seasonal" },
           { name: "Winter Squash (Multiple Types)", price: "$3.90/lb", note: "Seasonal" },
           { name: "Specialty Squash (Multiple Types)", price: "$6.00/lb", note: "Pre-order preferred" },
           { name: "Red Beets", price: "$2.40/lb", note: "Available" },
           { name: "Broccoli", price: "$3.10/lb", note: "Available" },
           { name: "Wheat", price: "$2.10/lb", note: "Available" },
           { name: "Rice", price: "$2.70/lb", note: "Available" },
           { name: "Stone-Ground Yellow Cornmeal", price: "$2.55/lb", note: "Available" },
           { name: "Pecans", price: "$9.10/lb", note: "Pre-order preferred" },
           { name: "Walnuts", price: "$6.25/lb", note: "Available" },
           { name: "Almonds", price: "$8.45/lb", note: "Available" },
           { name: "Pistachios", price: "$9.50/lb", note: "Pre-order preferred" },
           { name: "Cashews", price: "$8.70/lb", note: "Pre-order preferred" }
            ]
},
{
  name: "Mesa Verde Organics",
  type: "farm",
  iconVariant: "sprout",
  logo: "Mesa Verde Logo.png",
  productType: "produce",
  product: "Microgreens, lettuce, herbs",
  location: "East Mesa, AZ",
  organic: true,
  lat: 33.3558,
  lng: -111.6285,
   featuredInsight: "Above average costs - bulk orders preferred.",
         deliveryRadius: "100 miles",
         minimumOrder: "Fixed",
         leadTime: "10–14 days",
         productsAvailable: [
           { name: "Broccoli Microgreens", price: "$3.00/oz", note: "Pre-order preferred" },
           { name: "Radish Microgreens (Triton)", price: "$2.00/oz", note: "Pre-order preferred" },
           { name: "Sunflowers Shoots", price: "$1.90/oz", note: "Pre-order preferred" },
           { name: "Pea Shoots", price: "$1.80/oz", note: "Pre-order preferred" },
           { name: "Red Amaranth Microgreens", price: "$4.50/oz", note: "Pre-order preferred" },
           { name: "Iceberg Lettuce", price: "2.00/lb", note: "Pre-order preferred" },
           { name: "Green Leaf Lettuce", price: "$2.70/lb", note: "Available" },
           { name: "Romaine Lettuce (Whole Heads)", price: "$3.50/lb", note: "Available" },
           { name: "Little Gem Lettuce", price: "$5.10/lb", note: "Available" },
           { name: "Butterhead (Boston/Bibb) Lettuce", price: "$5.70/lb", note: "Limited" },
           { name: "Wild Arugula", price: "$7.55/lb", note: "Limited" },
           { name: "Genovese Basil", price: "$3.10/oz", note: "Pre-order preferred" },
           { name: "Thai Basil", price: "$2.20/oz", note: "Available" },
           { name: "Italian Flat-Leaf Parsley", price: "$8.45/lb", note: "Available" },
           { name: "Fresh Cilantro", price: "$9.50/lb", note: "Available" },
           { name: "Fresh Dill", price: "$2.20/oz", note: "Available" },
           { name: "Rosemary", price: "$2.00/oz", note: "Available" },
           { name: "Thyme", price: "$2.00/oz", note: "Available" },
           { name: "French Tarragon", price: "$3.20/oz", note: "Pre-order preferred" },
           { name: "Lemongrass", price: "$1.80/oz", note: "Pre-order preferred" }
            ]
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

