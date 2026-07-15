/* =========================
   LOCALITY SHARED APP SHELL
========================= */

(function () {
  const shellHost =
    document.getElementById("localityAppHeader");

  if (!shellHost) return;

  const activePage =
    shellHost.dataset.activePage || "";

  const showMarketplaceSearch =
    shellHost.dataset.marketplaceSearch === "true";

  let appContext = {
    user: null,
    userProfile: null,
    businessProfile: null,
    isBusiness: false,
    canSell: false
  };

   let notificationDismissTimer = null;
   let notificationRemoveTimer = null;
   let notificationBellTimer = null;

  function parseArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function escapeHtml(value = "") {
    return String(value).replace(
      /[&<>"']/g,
      (character) => {
        const entities = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        };

        return entities[character];
      }
    );
  }

  function getInitials(name = "") {
    const words = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return (
      words
        .slice(0, 2)
        .map((word) =>
          word[0]?.toUpperCase()
        )
        .join("") || "LC"
    );
  }

  function getSafeImageUrl(value = "") {
    if (!value) return "";

    try {
      const url = new URL(
        value,
        window.location.origin
      );

      if (
        url.protocol === "http:" ||
        url.protocol === "https:"
      ) {
        return url.href;
      }
    } catch {
      return "";
    }

    return "";
  }

  function messageIconSvg() {
    return `
      <svg
        viewBox="0 0 24 24"
        stroke-width="1.9"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
        ></path>
        <path d="M8 9h8"></path>
        <path d="M8 13h5"></path>
      </svg>
    `;
  }

  function bellIconSvg() {
    return `
      <svg
        viewBox="0 0 24 24"
        stroke-width="1.9"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
        ></path>
        <path d="M10 21h4"></path>
      </svg>
    `;
  }

  function renderShellSkeleton() {
    shellHost.className =
      "locality-app-shell";

    if (showMarketplaceSearch) {
      shellHost.classList.add(
        "has-marketplace-search"
      );
    }

    shellHost.innerHTML = `
      <a
        href="index.html"
        class="app-shell-brand"
        aria-label="Locality home"
      >
        <img
          src="images/LOCALITY LOGO.png"
          alt="Locality"
        />
      </a>

      ${
        showMarketplaceSearch
          ? `
            <div class="app-shell-search">
              <input
                id="marketplaceSearchInput"
                type="search"
                placeholder="Search products, businesses, and pickup windows..."
                aria-label="Search Locality Marketplace"
              />
            </div>
          `
          : ""
      }

      <nav
        class="app-shell-nav"
        aria-label="Locality navigation"
      >
        <a
          href="map.html"
          class="${
            activePage === "marketplace"
              ? "active"
              : ""
          }"
        >
          Marketplace
        </a>

        <a
          href="my-locality.html"
          class="${
            activePage === "my-locality"
              ? "active"
              : ""
          }"
        >
          My Locality
        </a>

        <details class="app-shell-tools">
          <summary>
            Tools
          </summary>

          <div
            id="appShellToolsMenu"
            class="app-shell-tools-menu"
          >
            <a href="my-locality.html">
              Open My Locality
            </a>
          </div>
        </details>
      </nav>

      <div class="app-shell-utilities">
        <div class="app-shell-notification-wrap">
          <div
            id="appShellNotificationToast"
            class="app-shell-notification-toast"
            hidden
          ></div>

          <button
            id="appShellNotificationButton"
            type="button"
            class="app-shell-icon-button"
            aria-label="Notifications"
            aria-expanded="false"
            aria-controls="appShellNotificationMenu"
            title="Notifications"
          >
            ${bellIconSvg()}

            <span
              id="appShellNotificationIndicator"
              class="app-shell-indicator"
              hidden
            ></span>
          </button>

          <div
            id="appShellNotificationMenu"
            class="app-shell-notification-menu"
            hidden
          >
            <div class="app-shell-notification-header">
              <strong>
                Notifications
              </strong>

              <span id="appShellNotificationSummary">
                No unread notifications
              </span>
            </div>

            <div
              id="appShellNotificationList"
              class="app-shell-notification-list"
            >
              <div class="app-shell-notification-empty">
                New orders, contracts, payments,
                messages, and reminders will appear here.
              </div>
            </div>
          </div>
        </div>

        <a
          id="appShellMessagesButton"
          href="coming-soon.html"
          class="app-shell-icon-link"
          aria-label="Messages"
          title="Messages"
        >
          ${messageIconSvg()}

          <span
            id="appShellMessageIndicator"
            class="app-shell-indicator"
            hidden
          ></span>
        </a>

        <div class="app-shell-account-wrap">
          <button
            id="appShellAccountToggle"
            type="button"
            class="app-shell-account-toggle"
            aria-expanded="false"
            aria-controls="appShellAccountMenu"
          >
            <span class="app-shell-avatar">
              <img
                id="appShellAccountImage"
                alt=""
                hidden
              />

              <span id="appShellAccountInitials">
                LC
              </span>
            </span>

            <span
              id="appShellAccountName"
              class="app-shell-account-name"
            >
              Loading...
            </span>

            <span aria-hidden="true">
              ▾
            </span>
          </button>

          <div
            id="appShellAccountMenu"
            class="app-shell-account-menu"
            hidden
          ></div>
        </div>
      </div>
    `;
  }

  renderShellSkeleton();

  const toolsMenu =
    document.getElementById(
      "appShellToolsMenu"
    );

  const messagesButton =
    document.getElementById(
      "appShellMessagesButton"
    );

  const messageIndicator =
    document.getElementById(
      "appShellMessageIndicator"
    );

  const notificationButton =
    document.getElementById(
      "appShellNotificationButton"
    );

  const notificationIndicator =
    document.getElementById(
      "appShellNotificationIndicator"
    );

  const notificationMenu =
    document.getElementById(
      "appShellNotificationMenu"
    );

  const notificationList =
    document.getElementById(
      "appShellNotificationList"
    );

  const notificationSummary =
    document.getElementById(
      "appShellNotificationSummary"
    );

  const notificationToast =
    document.getElementById(
      "appShellNotificationToast"
    );

  const accountToggle =
    document.getElementById(
      "appShellAccountToggle"
    );

  const accountMenu =
    document.getElementById(
      "appShellAccountMenu"
    );

  const accountName =
    document.getElementById(
      "appShellAccountName"
    );

  const accountImage =
    document.getElementById(
      "appShellAccountImage"
    );

  const accountInitials =
    document.getElementById(
      "appShellAccountInitials"
    );

  function closeMenus() {
    if (notificationMenu) {
      notificationMenu.hidden = true;
    }

    notificationButton?.setAttribute(
      "aria-expanded",
      "false"
    );

    if (accountMenu) {
      accountMenu.hidden = true;
    }

    accountToggle?.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  function updateIndicator(
    element,
    count = 0,
    urgent = false
  ) {
    if (!element) return;

    const number = Number(count) || 0;

    element.hidden = number <= 0;
    element.classList.toggle(
      "is-urgent",
      urgent
    );

    element.classList.toggle(
      "has-count",
      number > 1
    );

    element.textContent =
      number > 1
        ? String(Math.min(number, 99))
        : "";

    if (number > 0) {
      element.classList.remove("is-new");

      void element.offsetWidth;

      element.classList.add("is-new");
    }
  }

  function setUnreadMessages(
    count = 0,
    urgent = false
  ) {
    updateIndicator(
      messageIndicator,
      count,
      urgent
    );

    if (messagesButton) {
      messagesButton.setAttribute(
        "aria-label",
        count > 0
          ? `${count} unread ${
              count === 1
                ? "message"
                : "messages"
            }`
          : "Messages"
      );
    }
  }

function setUnreadNotifications(
  count = 0,
  urgent = false,
  animate = false
) {
  const number =
    Number(count) || 0;

  updateIndicator(
    notificationIndicator,
    number,
    urgent
  );

  notificationButton?.classList.toggle(
    "has-unread",
    number > 0
  );

  notificationButton?.classList.toggle(
    "is-urgent",
    number > 0 && urgent
  );

  if (
    number > 0 &&
    animate
  ) {
    animateNotificationBell(
      urgent
    );
  }

  if (number <= 0) {
    window.clearTimeout(
      notificationBellTimer
    );

    notificationButton?.classList.remove(
      "has-unread",
      "is-ringing",
      "is-urgent"
    );
  }

  if (notificationSummary) {
    notificationSummary.textContent =
      number > 0
        ? `${number} unread`
        : "No unread notifications";
  }

  notificationButton?.setAttribute(
    "aria-label",
    number > 0
      ? `${number} unread ${
          number === 1
            ? "notification"
            : "notifications"
        }`
      : "Notifications"
  );
}

function hideNotificationPreview() {
  window.clearTimeout(
    notificationDismissTimer
  );

  window.clearTimeout(
    notificationRemoveTimer
  );

  if (!notificationToast) return;

  notificationToast.hidden = true;

  notificationToast.classList.remove(
    "is-visible",
    "is-leaving",
    "is-urgent"
  );
}

function animateNotificationBell(
  urgent = false
) {
  if (!notificationButton) return;

  window.clearTimeout(
    notificationBellTimer
  );

  notificationButton.classList.remove(
    "is-ringing"
  );

  notificationButton.classList.toggle(
    "is-urgent",
    urgent
  );

  /*
    Force the browser to restart the animation
    when multiple notifications arrive.
  */
  void notificationButton.offsetWidth;

  notificationButton.classList.add(
    "is-ringing"
  );

  notificationBellTimer =
    window.setTimeout(() => {
      notificationButton.classList.remove(
        "is-ringing"
      );
    }, 1100);
}
   
function showNotificationPreview(
  shortLabel,
  urgent = false
) {
  if (
    !notificationToast ||
    !shortLabel
  ) {
    return;
  }

  window.clearTimeout(
    notificationDismissTimer
  );

  window.clearTimeout(
    notificationRemoveTimer
  );

  notificationToast.textContent =
    shortLabel;

  notificationToast.classList.remove(
    "is-visible",
    "is-leaving"
  );

  notificationToast.classList.toggle(
    "is-urgent",
    urgent
  );

  notificationToast.hidden = false;

  /*
    Restart the slide-out animation when
    notifications arrive close together.
  */
  void notificationToast.offsetWidth;

  notificationToast.classList.add(
    "is-visible"
  );

  notificationDismissTimer =
    window.setTimeout(() => {
      notificationToast.classList.remove(
        "is-visible"
      );

      notificationToast.classList.add(
        "is-leaving"
      );

      notificationRemoveTimer =
        window.setTimeout(() => {
          notificationToast.hidden = true;

          notificationToast.classList.remove(
            "is-leaving",
            "is-urgent"
          );
        }, 320);
    }, 5500);
}

  function addNotification({
    label = "New notification",
    detail = "",
    timeLabel = "Just now",
    urgent = false,
    showPreview = true
  } = {}) {
    const emptyState =
      notificationList?.querySelector(
        ".app-shell-notification-empty"
      );

    emptyState?.remove();

    if (notificationList) {
      const item =
        document.createElement("div");

      item.className =
        `app-shell-notification-item${
          urgent ? " is-urgent" : ""
        }`;

      item.innerHTML = `
        <span class="app-shell-notification-dot"></span>

        <div>
          <strong>
            ${escapeHtml(label)}
          </strong>

          ${
            detail
              ? `
                <span>
                  ${escapeHtml(detail)}
                </span>
              `
              : ""
          }

          <small>
            ${escapeHtml(timeLabel)}
          </small>
        </div>
      `;

      notificationList.prepend(item);
    }

    const currentCount =
      Number(
        notificationIndicator?.dataset
          .count || 0
      ) + 1;

    if (notificationIndicator) {
      notificationIndicator.dataset.count =
        String(currentCount);
    }

      setUnreadNotifications(
        currentCount,
        urgent,
        true
      );

    if (showPreview) {
      showNotificationPreview(
        label,
        urgent
      );
    }
  }

  function renderAvatar(name, imageUrl) {
    const safeImageUrl =
      getSafeImageUrl(imageUrl);

    if (accountInitials) {
      accountInitials.textContent =
        getInitials(name);
    }

    if (!safeImageUrl || !accountImage) {
      accountImage?.setAttribute(
        "hidden",
        ""
      );

      accountInitials?.removeAttribute(
        "hidden"
      );

      return;
    }

    accountImage.src = safeImageUrl;
    accountImage.alt = `${name} logo`;
    accountImage.removeAttribute("hidden");

    accountInitials?.setAttribute(
      "hidden",
      ""
    );

    accountImage.addEventListener(
      "error",
      () => {
        accountImage.setAttribute(
          "hidden",
          ""
        );

        accountInitials?.removeAttribute(
          "hidden"
        );
      },
      { once: true }
    );
  }

  function renderSignedOutState() {
    if (accountName) {
      accountName.textContent = "Sign in";
    }

    renderAvatar("Locality", "");

    messagesButton?.setAttribute(
      "hidden",
      ""
    );

    notificationButton
      ?.closest(
        ".app-shell-notification-wrap"
      )
      ?.setAttribute("hidden", "");

    if (accountMenu) {
      accountMenu.innerHTML = `
        <a href="account.html">
          Sign in
        </a>

        <a href="signup.html">
          Create account
        </a>
      `;
    }
  }

  function renderToolsMenu() {
    if (!toolsMenu) return;

    if (!appContext.user) {
      toolsMenu.innerHTML = `
        <a href="map.html">
          Browse Marketplace
        </a>

        <a href="account.html">
          Sign in
        </a>
      `;

      return;
    }

    if (!appContext.isBusiness) {
      toolsMenu.innerHTML = `
        <a href="my-locality.html">
          My Locality
        </a>

        <a href="map.html?view=products">
          Browse products
        </a>

        <a href="coming-soon.html">
          Saved items
        </a>

        <a href="coming-soon.html">
          Messages
        </a>
      `;

      return;
    }

    toolsMenu.innerHTML = `
      ${
        appContext.canSell
          ? `
            <a href="supply-builder.html">
              Products & Availability
            </a>
          `
          : ""
      }

      <a href="contracts.html">
        Contract Studio
      </a>

      <a href="profile-builder.html">
        Business Profile Editor
      </a>

      <a href="public-profile.html">
        View Public Profile
      </a>

      <a href="coming-soon.html">
        ${
          appContext.canSell
            ? "Orders & Fulfillment"
            : "Purchases & Deliveries"
        }
      </a>

      <a href="coming-soon.html">
        Messages
      </a>

      <a href="coming-soon.html">
        Payments
      </a>
    `;
  }

  function renderAccountMenu() {
    if (!accountMenu) return;

    if (!appContext.user) {
      renderSignedOutState();
      return;
    }

    if (!appContext.isBusiness) {
      accountMenu.innerHTML = `
        <a href="my-locality.html">
          My Locality
        </a>

        <a href="coming-soon.html">
          Account settings
        </a>

        <button
          type="button"
          class="is-logout"
          data-app-shell-logout
        >
          Log out
        </button>
      `;

      return;
    }

    accountMenu.innerHTML = `
      <a href="my-locality.html">
        My Locality
      </a>

      <a href="public-profile.html">
        View public profile
      </a>

      <a href="profile-builder.html">
        Edit business profile
      </a>

      ${
        appContext.canSell
          ? `
            <a href="supply-builder.html">
              Manage products
            </a>
          `
          : ""
      }

      <a href="coming-soon.html">
        Account settings
      </a>

      <button
        type="button"
        class="is-logout"
        data-app-shell-logout
      >
        Log out
      </button>
    `;
  }

  async function handleSignOut() {
    if (
      !window.LocalityAuthService
        ?.signOut
    ) {
      return;
    }

    const { error } =
      await window.LocalityAuthService
        .signOut();

    if (error) {
      console.error(
        "Unable to sign out:",
        error
      );

      return;
    }

    window.location.href =
      "index.html";
  }

  async function loadAppContext() {
    if (
      !window.LocalityAuthService
        ?.getCurrentUser ||
      !window.LocalitySupabase
    ) {
      renderSignedOutState();
      renderToolsMenu();
      renderAccountMenu();
      return;
    }

    const user =
      await window.LocalityAuthService
        .getCurrentUser();

    appContext.user = user;

    if (!user) {
      renderSignedOutState();
      renderToolsMenu();
      renderAccountMenu();
      return;
    }

    const [userProfileResult, businessResult] =
      await Promise.all([
        window.LocalitySupabase
          .from("user_profiles")
          .select(
            "full_name, buyer_display_name, locality_account_type"
          )
          .eq("id", user.id)
          .maybeSingle(),

        window.LocalityProfileService
          ?.getMyPrimaryBusinessProfile
          ? window.LocalityProfileService
              .getMyPrimaryBusinessProfile()
          : Promise.resolve({
              data: null,
              error: null
            })
      ]);

    if (userProfileResult.error) {
      console.warn(
        "Unable to load app-shell user profile:",
        userProfileResult.error
      );
    }

    if (businessResult?.error) {
      console.warn(
        "Unable to load app-shell business profile:",
        businessResult.error
      );
    }

    appContext.userProfile =
      userProfileResult.data || null;

    appContext.businessProfile =
      businessResult?.data || null;

    appContext.isBusiness =
      Boolean(appContext.businessProfile) ||
      appContext.userProfile
        ?.locality_account_type ===
        "business";

    const roles = parseArray(
      appContext.businessProfile
        ?.marketplace_roles
    );

    appContext.canSell =
      roles.includes("seller") ||
      roles.includes("buyer_seller");

    const displayName =
      appContext.businessProfile?.name ||
      appContext.userProfile
        ?.buyer_display_name ||
      appContext.userProfile
        ?.full_name ||
      user.email?.split("@")[0] ||
      "My account";

    const logoUrl =
      appContext.businessProfile
        ?.logo_url || "";

    if (accountName) {
      accountName.textContent =
        displayName;
    }

    renderAvatar(
      displayName,
      logoUrl
    );

    renderToolsMenu();
    renderAccountMenu();

    window.dispatchEvent(
      new CustomEvent(
        "locality:app-context-ready",
        {
          detail: { ...appContext }
        }
      )
    );
  }

  notificationButton?.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
      hideNotificationPreview();

      const willOpen =
        notificationMenu?.hidden;

      closeMenus();

      if (notificationMenu) {
        notificationMenu.hidden =
          !willOpen;
      }

      notificationButton.setAttribute(
        "aria-expanded",
        String(Boolean(willOpen))
      );

      if (willOpen) {
        if (notificationIndicator) {
          notificationIndicator.dataset.count =
            "0";
        }

        setUnreadNotifications(0);
      }
    }
  );

  accountToggle?.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();

      if (!appContext.user) {
        window.location.href =
          "account.html";
        return;
      }

      const willOpen =
        accountMenu?.hidden;

      closeMenus();

      if (accountMenu) {
        accountMenu.hidden =
          !willOpen;
      }

      accountToggle.setAttribute(
        "aria-expanded",
        String(Boolean(willOpen))
      );
    }
  );

  notificationMenu?.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
    }
  );

  accountMenu?.addEventListener(
    "click",
    async (event) => {
      event.stopPropagation();

      const logoutButton =
        event.target.closest(
          "[data-app-shell-logout]"
        );

      if (logoutButton) {
        await handleSignOut();
      }
    }
  );

  document.addEventListener(
    "click",
    closeMenus
  );

  window.LocalityAppShell = {
    getContext() {
      return { ...appContext };
    },

    setUnreadMessages,

    setUnreadNotifications,

    showNotification({
      label,
      detail,
      timeLabel,
      urgent = false,
      showPreview = true
    } = {}) {
      addNotification({
        label,
        detail,
        timeLabel,
        urgent,
        showPreview
      });
    }
  };

  loadAppContext();
})();
