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
    "leafy-greens": `<svg viewBox="0 0 24 24"><path d="M5 14c5-7 10-8 15-7-1 6-5 10-12 11"/><path d="M5 14c4-1 8-3 12-7"/></svg>`,
    "root-vegetables": `<svg viewBox="0 0 24 24"><path d="M12 6c4 3 5 8 0 14-5-6-4-11 0-14Z"/><path d="M12 6c-1-2-3-3-5-3"/><path d="M12 6c1-2 3-3 5-3"/></svg>`,
    vegetables: `<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="6"/><path d="M12 7c1-3 3-4 6-4"/></svg>`,
    citrus: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M12 5v14M5 12h14M7 7l10 10M17 7 7 17"/></svg>`,
    fruit: `<svg viewBox="0 0 24 24"><path d="M12 7c5 0 7 4 6 8-1 4-4 6-6 6s-5-2-6-6c-1-4 1-8 6-8Z"/><path d="M12 7c0-3 2-5 5-5"/></svg>`,
    dairy: `<svg viewBox="0 0 24 24"><path d="M8 9h8l1 11H7L8 9Z"/><path d="M9 4h6l1 5H8l1-5Z"/></svg>`,
    eggs: `<svg viewBox="0 0 24 24"><path d="M12 3c4 4 6 8 6 12a6 6 0 0 1-12 0c0-4 2-8 6-12Z"/></svg>`,
    beef: `<svg viewBox="0 0 24 24"><path d="M5 12c2-5 8-7 13-4 3 2 2 7-1 9-4 3-10 1-12-5Z"/><circle cx="15" cy="12" r="2"/></svg>`,
    pork: `<svg viewBox="0 0 24 24"><path d="M6 13c0-4 3-7 7-7s7 3 7 7-3 7-7 7-7-3-7-7Z"/><path d="M6 13H3v-3"/><circle cx="11" cy="13" r=".7"/><circle cx="15" cy="13" r=".7"/></svg>`,
    poultry: `<svg viewBox="0 0 24 24"><path d="M6 18c3-8 9-11 14-8-2 6-7 9-14 8Z"/><path d="M6 18l-2 3"/><path d="M10 16l-2 4"/></svg>`,
    grains: `<svg viewBox="0 0 24 24"><path d="M12 21V3"/><path d="M12 6c-3 0-5 2-5 4 3 0 5-2 5-4Z"/><path d="M12 10c3 0 5 2 5 4-3 0-5-2-5-4Z"/><path d="M12 14c-3 0-5 2-5 4 3 0 5-2 5-4Z"/></svg>`,
    rice: `<svg viewBox="0 0 24 24"><path d="M5 13h14l-2 7H7l-2-7Z"/><path d="M8 10c1-3 3-5 4-7 1 2 3 4 4 7"/></svg>`,
    nuts: `<svg viewBox="0 0 24 24"><path d="M12 4c5 3 7 7 5 12-2 5-8 5-10 0-2-5 0-9 5-12Z"/></svg>`,
    herbs: `<svg viewBox="0 0 24 24"><path d="M12 21V5"/><path d="M12 9c-4 0-6 2-7 5 4 0 6-2 7-5Z"/><path d="M12 13c4 0 6 2 7 5-4 0-6-2-7-5Z"/></svg>`,
    honey: `<svg viewBox="0 0 24 24"><path d="M8 8h8l2 4-2 8H8l-2-8 2-4Z"/><path d="M9 4h6v4H9z"/></svg>`,
    specialty: `<svg viewBox="0 0 24 24"><path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/></svg>`
  };

  return icons[category] || icons.specialty;
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

function updateProfileContent(profile) {
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

  document
    .getElementById("profileLogo")
    .classList.toggle("buyer", profile.type === "buyer");

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
          <div class="product-card-top">
            <div class="product-icon">
              ${getProductIcon(item.category)}
            </div>

            ${
              itemIsOrganic
                ? `<div class="product-mini-organic">${getOrganicBadge()}</div>`
                : ""
            }
          </div>

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

        <div class="profile-mini-meta">
          <span>${(profile.productsAvailable || []).length} listed items</span>
          <span>${profile.deliveryRadius || "Regional"} radius</span>
        </div>

        <div class="profile-trust-row">
          <span>Verified Supplier</span>

          ${
            profile.deliveryRadius
              ? `<span>Regional Delivery</span>`
              : ``
          }

          ${
            profile.coalition
              ? `<span>Coalition Member</span>`
              : ``
          }

          ${
            profile.organic
              ? `<span>Organic Certified</span>`
              : ``
          }
        </div>

        <div class="profile-insight-card">
          <span>Marketplace Insight</span>
          <p>
            ${
              profile.featuredInsight ||
              "Regional pricing and sourcing insights available."
            }
          </p>
        </div>

        <div class="profile-section-title">
          Available Products
        </div>

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

  activeProfile = profile;
}

function openProfilePanel(profile) {
  const panel = document.getElementById("profilePanel");
  if (!panel) return;

  const isAlreadyOpen = panel.classList.contains("active");

  if (isAlreadyOpen) {
    panel.classList.add("switching");

    setTimeout(() => {
      updateProfileContent(profile);
      panel.classList.remove("switching");
    }, 180);
  } else {
    updateProfileContent(profile);
    panel.classList.add("active");
  }
}   
  renderMarkers();

   let activeProfile = null;

function openMessageModal(profile) {
  activeProfile = profile;

  const modal = document.getElementById("messageModal");
  const logo = document.getElementById("messageLogo");

  document.getElementById("messageName").textContent = profile.name;
  document.getElementById("messageType").textContent =
    profile.type === "farm" ? "Supplier conversation" : "Buyer conversation";

   document.getElementById("messageStatus").textContent =
     "Most suppliers respond within 2 business days.";

   if (profile.logo) {
  logo.innerHTML = `
    <img src="images/logos/${profile.logo}" alt="${profile.name} logo">
  `;
} else {
  logo.textContent =
    profile.logoInitials || profile.name.slice(0, 2).toUpperCase();
}

  document.getElementById("messageThread").innerHTML = `
    <div class="chat-bubble system">
      Start a sourcing conversation with ${profile.name}.
    </div>
  `;
   
const savedDraft = localStorage.getItem(
  `localityDraft-${profile.name}`
);

if (savedDraft) {
  document.getElementById("messageInput").value = savedDraft;

  addMessage(
    "Unsaved draft restored.",
    "system"
  );
}
  modal.classList.add("active");
}

function addMessage(text, sender = "user") {
  const thread = document.getElementById("messageThread");

  thread.insertAdjacentHTML(
    "beforeend",
    `<div class="chat-bubble ${sender}">${text}</div>`
  );

  thread.scrollTop = thread.scrollHeight;
}

function fakeSupplierReply(promptText) {
  const name = activeProfile?.name || "this profile";

  setTimeout(() => {
    addMessage(
      `Thanks for reaching out. ${name} can share availability, pricing, and delivery options based on your sourcing needs.`,
      "reply"
    );
  }, 700);
}

document.querySelector(".profile-actions .secondary")?.addEventListener("click", () => {
  if (activeProfile) openMessageModal(activeProfile);
});

document.getElementById("messageClose")?.addEventListener("click", () => {
  document.getElementById("messageModal")?.classList.remove("active");
});

document.getElementById("messageSend")?.addEventListener("click", () => {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (!text) return;

  addMessage(text, "user");
  input.value = "";
  fakeSupplierReply(text);
   localStorage.removeItem(
  `localityDraft-${activeProfile.name}`
);
});

document.getElementById("saveDraftButton")?.addEventListener("click", () => {
  const input = document.getElementById("messageInput");

  if (!input || !activeProfile) return;

  const text = input.value.trim();

  localStorage.setItem(
    `localityDraft-${activeProfile.name}`,
    text
  );

  addMessage("Draft saved locally.", "system");
});
   
document.getElementById("messageInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.getElementById("messageSend")?.click();
  }
});

document.querySelectorAll(".message-prompts button").forEach((button) => {
  button.addEventListener("click", () => {
    const text = button.dataset.prompt;
    addMessage(text, "user");
    fakeSupplierReply(text);
  });
});

  document.getElementById("typeFilter")?.addEventListener("change", renderMarkers);
  document.getElementById("productFilter")?.addEventListener("change", renderMarkers);
  document.getElementById("organicFilter")?.addEventListener("change", renderMarkers);
   
   const mapLoader = document.getElementById("mapLoader");

      function hideMapLoader() {
        mapLoader?.classList.add("hidden");
      }

      map.whenReady(() => {
        setTimeout(hideMapLoader, 700);
      });

   setTimeout(hideMapLoader, 3500);

function scrollActivityFeedToBottom() {
  const activityList = document.querySelector(".activity-list");
     if (!activityList) return;

     activityList.scrollTop = activityList.scrollHeight;
}
window.addEventListener("load", () => {
  setTimeout(scrollActivityFeedToBottom, 450);
});



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

