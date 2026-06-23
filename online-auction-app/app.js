// BidSphere - Application Controller with Backend Sync, Auth, and Payments

// Global App State
let activePage = 'dashboard';
let activeCategory = 'All';
let searchQuery = '';
let activeAuctionId = null;
let selectedPresetGradient = 'linear-gradient(135deg, #2b1055, #7597de)';
let selectedPresetIcon = 'keyboard';
let activeProfileTab = 'bids';

// DOM Element References
const elWalletBalance = document.getElementById('wallet-balance');
const elListingsContainer = document.getElementById('listings-container');
const elDetailContainer = document.getElementById('detail-container-target');
const elToastContainer = document.getElementById('toast-container');
const elProfileUserName = document.getElementById('profile-user-name');
const elProfileUserEmail = document.getElementById('profile-user-email');
const elProfileWallet = document.getElementById('profile-wallet');
const elProfileWonCount = document.getElementById('profile-won-count');
const elProfileListedCount = document.getElementById('profile-listed-count');
const elProfileTabContent = document.getElementById('profile-tab-content');

// Navigate to different tabs/pages
async function navigateTo(pageId, itemId = null) {
  // Authentication Guard for protected pages
  if ((pageId === 'address' || pageId === 'payment' || pageId === 'profile' || pageId === 'admin') && !currentUsername) {
    showToast("Authentication required. Please sign in first.", "error");
    openAuthModal();
    return;
  }

  // Admin authorization guard
  if (pageId === 'admin') {
    const user = getLocalUserProfile(currentUsername);
    if (!user || user.role !== 'admin') {
      showToast("Access Denied: Administrator privileges required.", "error");
      navigateTo('dashboard');
      return;
    }
  }

  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Remove active class from nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show target page
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.add('active');
    activePage = pageId;
  }

  // Set nav button active
  const navBtn = document.getElementById(`nav-${pageId}`);
  if (navBtn) {
    navBtn.classList.add('active');
  }

  // Page specific initializers
  if (pageId === 'dashboard') {
    await renderDashboard();
  } else if (pageId === 'detail' && itemId) {
    activeAuctionId = itemId;
    await renderDetailPage(itemId);
  } else if (pageId === 'profile') {
    await renderProfilePage();
  } else if (pageId === 'admin') {
    await renderAdminPage();
  } else if (pageId === 'payment') {
    const auctions = getLocalAuctions();
    const item = auctions.find(a => a.id === activeAuctionId);
    if (item) {
        const user = currentUsername ? getLocalUserProfile(currentUsername) : null;
        const isWonBid = item.status === 'ended' && user && user.itemsWon.includes(activeAuctionId);
        const amount = isWonBid ? item.currentBid : item.buyNowPrice;
        const elAmount = document.getElementById('easebuzz-pay-amount');
        if (elAmount) {
            elAmount.textContent = `Pay ${formatCurrency(amount)}`;
            elAmount.style.color = '#1f2937';
            const shieldIcon = elAmount.previousElementSibling;
            if (shieldIcon) shieldIcon.style.color = '#1f2937';
        }
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Search and Filter Handlers
async function handleSearchFilter() {
  searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
  await renderDashboard();
}

async function filterCategory(category) {
  activeCategory = category;
  
  // Update UI filters
  const filterButtons = document.querySelectorAll('#category-filters .filter-btn');
  filterButtons.forEach(btn => {
    const text = btn.textContent.trim();
    if (text.includes(category) || 
        (category === 'All' && text === 'All Categories') || 
        (category === 'Gaming & Entertainment' && text === 'Gaming') || 
        (category === 'Art & Collectibles' && text === 'Art') ||
        (category === 'Vehicles & Motors' && text === 'Vehicles') ||
        (category === 'Books & Comics' && text === 'Books') ||
        (category === 'Sports & Outdoors' && text === 'Sports')) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  await renderDashboard();
}

// Image Preset Selection (Sell Page)
function selectPreset(element) {
  document.querySelectorAll('.preset-option').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
  selectedPresetGradient = element.getAttribute('data-gradient');
  selectedPresetIcon = element.getAttribute('data-icon');
}

// Toast Notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'info';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'alert-triangle';

  toast.innerHTML = `
    <i data-lucide="${icon}" class="toast-icon ${type}"></i>
    <span class="toast-message">${message}</span>
  `;
  
  elToastContainer.appendChild(toast);
  lucide.createIcons();
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// Format Time Remaining Helper
function formatTimeRemaining(ms) {
  if (ms <= 0) return "Ended";
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  let timeStr = "";
  if (days > 0) timeStr += `${days}d `;
  timeStr += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return timeStr;
}

// Format Currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

// ----------------------------------------------------
// AUTHENTICATION INTERACTIVE CONTROLS
// ----------------------------------------------------

function updateAuthHeaderUI() {
  const elPill = document.getElementById('wallet-pill-container');
  const elUserBtn = document.getElementById('header-user-btn');
  const elLoginBtn = document.getElementById('header-login-btn');
  const elUsernameSpan = document.getElementById('header-username');
  
  if (currentUsername) {
    if (elPill) elPill.style.display = 'flex';
    if (elUserBtn) {
      elUserBtn.style.display = 'flex';
      elUsernameSpan.textContent = currentUsername;
    }
    if (elLoginBtn) elLoginBtn.style.display = 'none';
    
    // Check if user is Admin
    const user = getLocalUserProfile(currentUsername);
    const elNavAdmin = document.getElementById('li-nav-admin');
    if (elNavAdmin) {
      elNavAdmin.style.display = (user && user.role === 'admin') ? 'block' : 'none';
    }
  } else {
    if (elPill) elPill.style.display = 'none';
    if (elUserBtn) elUserBtn.style.display = 'none';
    if (elLoginBtn) elLoginBtn.style.display = 'inline-flex';
    
    const elNavAdmin = document.getElementById('li-nav-admin');
    if (elNavAdmin) elNavAdmin.style.display = 'none';
  }
}

function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('active');
  switchAuthTab('login');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('active');
  document.getElementById('login-form').reset();
  document.getElementById('register-form').reset();
}

function switchAuthTab(tabType) {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('login-form');
  const formRegister = document.getElementById('register-form');
  
  if (tabType === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
  } else {
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    formLogin.style.display = 'none';
    formRegister.style.display = 'block';
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const usernameInput = document.getElementById('login-username').value.trim();
  const passwordInput = document.getElementById('login-password').value;
  
  showToast("Verifying credentials...", "info");
  const res = await authLoginAPI(usernameInput, passwordInput);
  if (res.success) {
    showToast(`Welcome back, @${usernameInput}!`, "success");
    closeAuthModal();
    updateAuthHeaderUI();
    await updateHeaderWallet();
    
    // Repaint UI
    if (activePage === 'dashboard') await renderDashboard();
    if (activePage === 'detail') await renderDetailPage(activeAuctionId);
    if (activePage === 'profile') await renderProfilePage();
  } else {
    showToast(res.message, "error");
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const usernameInput = document.getElementById('register-username').value.trim();
  const emailInput = document.getElementById('register-email').value.trim();
  const passwordInput = document.getElementById('register-password').value;
  
  if (passwordInput.length < 6) {
    showToast("Password must be at least 6 characters.", "error");
    return;
  }
  
  showToast("Registering account...", "info");
  const res = await authRegisterAPI(usernameInput, emailInput, passwordInput);
  if (res.success) {
    showToast(`Account successfully registered! Welcome, @${usernameInput}!`, "success");
    closeAuthModal();
    updateAuthHeaderUI();
    await updateHeaderWallet();
    
    if (activePage === 'dashboard') await renderDashboard();
    if (activePage === 'profile') await renderProfilePage();
  } else {
    showToast(res.message, "error");
  }
}

async function handleLogout() {
  authLogout();
  showToast("Signed out successfully.", "info");
  updateAuthHeaderUI();
  await updateHeaderWallet();
  await navigateTo('dashboard');
}

// ----------------------------------------------------
// CHECKOUT & PAYMENT CONTROLS
// ----------------------------------------------------

function resetCheckoutForm() {
  const addrForm = document.getElementById('address-form');
  const payForm = document.getElementById('payment-checkout-form');
  if (addrForm) addrForm.reset();
  if (payForm) payForm.reset();
}



// ----------------------------------------------------
// UI RENDERING FUNCTIONS
// ----------------------------------------------------

// 1. Render Dashboard Listings
async function renderDashboard() {
  const auctions = await getAuctions();
  
  const filtered = auctions.filter(item => {
    const isLive = item.status === 'active' && item.endsAt > Date.now();
    const matchesSearch = item.title.toLowerCase().includes(searchQuery) || 
                          item.description.toLowerCase().includes(searchQuery);
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory && isLive;
  });

  if (filtered.length === 0) {
    elListingsContainer.innerHTML = `
      <div class="glass form-full-width" style="grid-column: 1/-1; text-align: center; padding: 50px; border-radius: 16px;">
        <i data-lucide="inbox" style="width: 50px; height: 50px; color: var(--text-muted); margin-bottom: 15px;"></i>
        <h3 style="margin-bottom: 10px;">No Active Auctions Found</h3>
        <p style="color: var(--text-secondary);">Try adjusting your filters or search keywords.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  elListingsContainer.innerHTML = filtered.map(item => {
    const isLive = item.status === 'active' && item.endsAt > Date.now();
    const timeRemainingStr = isLive ? formatTimeRemaining(item.endsAt - Date.now()) : "Ended";
    
    // Icon mapping
    let iconName = 'box';
    if (item.imageIcon === 'keyboard') iconName = 'keyboard';
    if (item.imageIcon === 'watch') iconName = 'watch';
    if (item.imageIcon === 'shoe') iconName = 'footprints';
    if (item.imageIcon === 'gamepad') iconName = 'gamepad-2';
    if (item.imageIcon === 'image') iconName = 'image';

    return `
      <div class="glass-card listing-card" id="card-${item.id}">
        <div class="card-image-wrapper" style="${item.imageUrl ? `background-image: url('${item.imageUrl}'); background-size: cover; background-position: center;` : `background: ${item.imageGradient};`}">
          <span class="card-badge ${isLive ? 'badge-live' : 'badge-ended'}">
            ${isLive ? `<i data-lucide="flame" style="width: 12px; height: 12px; display: inline; vertical-align: middle;"></i> <span class="timer-text">${timeRemainingStr}</span>` : 'Ended'}
          </span>
          ${item.imageUrl ? '' : `<i data-lucide="${iconName}" class="card-icon"></i>`}
        </div>
        
        <div class="card-content">
          <span class="card-category">${item.category}</span>
          <h3 class="card-title">${item.title}</h3>
          <p class="card-description">${item.description}</p>
          
          <div class="card-footer">
            <div class="price-row">
              <div class="price-block">
                <span class="price-label">Current Bid</span>
                <span class="price-value current-bid-val">${formatCurrency(item.currentBid)}</span>
              </div>
              ${item.buyNowPrice ? `
                <div class="price-block" style="text-align: right;">
                  <span class="price-label">Buy Out</span>
                  <span class="price-value buynow-val">${formatCurrency(item.buyNowPrice)}</span>
                </div>
              ` : ''}
            </div>
            
            <div class="card-actions">
              <button class="btn btn-primary" onclick="navigateTo('detail', '${item.id}')">
                <i data-lucide="gavel"></i> View Auction
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

// 2. Render Detail / Bidding Page
async function renderDetailPage(itemId) {
  const auctions = await getAuctions();
  const item = auctions.find(a => a.id === itemId);
  
  if (!item) {
    elDetailContainer.innerHTML = `<p>Auction listing not found.</p>`;
    return;
  }

  const isLive = item.status === 'active' && item.endsAt > Date.now();
  const timeRemainingStr = isLive ? formatTimeRemaining(item.endsAt - Date.now()) : "Ended";
  const user = await getUserProfile();
  const loggedInUsername = user ? user.username : null;

  // Icon mapping
  let iconName = 'box';
  if (item.imageIcon === 'keyboard') iconName = 'keyboard';
  if (item.imageIcon === 'watch') iconName = 'watch';
  if (item.imageIcon === 'shoe') iconName = 'footprints';
  if (item.imageIcon === 'gamepad') iconName = 'gamepad-2';
  if (item.imageIcon === 'image') iconName = 'image';

  // Calculate min bid
  const minIncrement = 5;
  const minAllowedBid = item.bids.length > 0 ? (item.currentBid + minIncrement) : item.startingBid;

  // Render Bid History List
  const sortedBids = [...item.bids].reverse();
  const bidsHTML = sortedBids.length > 0 ? sortedBids.map(bid => {
    const bidDate = new Date(bid.timestamp);
    const timeFormatted = bidDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isUserBid = loggedInUsername && bid.bidder === loggedInUsername;
    
    return `
      <div class="bid-history-item">
        <div class="bidder-info">
          <span class="bidder-name">${bid.bidder} ${isUserBid ? '<span style="color:var(--accent-cyan); font-size:0.75rem;">(You)</span>' : ''}</span>
          <span class="bidder-time">${timeFormatted}</span>
        </div>
        <span class="bid-amount">${formatCurrency(bid.amount)}</span>
      </div>
    `;
  }).join('') : `<div class="empty-history">No bids placed yet. Be the first to bid!</div>`;

  // Render Page Content
  elDetailContainer.innerHTML = `
    <!-- Gallery/Image representation -->
    <div class="detail-gallery" style="${item.imageUrl ? `background-image: url('${item.imageUrl}'); background-size: cover; background-position: center;` : `background: ${item.imageGradient};`}">
      ${item.imageUrl ? '' : `<i data-lucide="${iconName}" class="detail-gallery-icon"></i>`}
      <div class="detail-clock-container">
        <div>
          <span class="countdown-label">Time Remaining</span>
          <div class="countdown-clock" id="detail-clock">${timeRemainingStr}</div>
        </div>
        <span class="card-badge ${isLive ? 'badge-live' : 'badge-ended'}">
          ${isLive ? 'Active Auction' : 'Closed'}
        </span>
      </div>
    </div>

    <!-- Details and bidding form -->
    <div class="detail-info">
      <div class="detail-header">
        <span class="detail-category">${item.category}</span>
        <h2 class="detail-title">${item.title}</h2>
        <div class="detail-seller">Listed by <span>@${item.seller}</span></div>
      </div>

      <p class="detail-description">${item.description}</p>

      <!-- Bid Interaction Panel -->
      <div class="bid-action-box glass">
        <div class="bid-pricing">
          <div class="bid-price-box">
            <span class="bid-price-title">${isLive ? 'Current Highest Bid' : 'Winning Bid'}</span>
            <span class="bid-price-value current-bid-val" style="color:var(--accent-cyan);">${formatCurrency(item.currentBid)}</span>
          </div>
          ${item.buyNowPrice ? `
            <div class="bid-price-box" style="text-align: right;">
              <span class="bid-price-title">Buy Now Outright</span>
              <span class="bid-price-value buynow-val" style="color:var(--accent-yellow);">${formatCurrency(item.buyNowPrice)}</span>
            </div>
          ` : ''}
        </div>

        ${isLive ? `
          ${loggedInUsername && item.seller === loggedInUsername ? `
            <div style="text-align: center; color: var(--text-secondary); padding: 10px 0;">
              <i data-lucide="shield-alert" style="vertical-align: middle; margin-right: 5px;"></i>
              You are the seller of this auction listing.
            </div>
          ` : `
            <div>
              <span class="price-label">Enter Bid (Min. ${formatCurrency(minAllowedBid)})</span>
              <div class="bid-input-group">
                <div class="bid-input-wrapper">
                  <span class="bid-currency">₹</span>
                  <input type="number" id="bid-amount-input" min="${minAllowedBid}" value="${minAllowedBid}" required>
                </div>
                <button class="btn btn-primary" style="flex:0 0 140px;" onclick="placeBid('${item.id}')">
                  Place Bid
                </button>
              </div>
            </div>
            
            ${item.buyNowPrice ? `
              <div class="detail-actions-row">
                <button class="btn btn-buy" style="width: 100%;" onclick="buyOutItem('${item.id}')">
                  <i data-lucide="zap"></i> Buy Out Immediately for ${formatCurrency(item.buyNowPrice)}
                </button>
              </div>
            ` : ''}
          `}
        ` : `
          <div style="text-align: center; font-weight: 700; color: var(--text-muted); padding: 15px 0;">
            <i data-lucide="lock" style="vertical-align: middle; margin-right: 5px; width: 16px;"></i> 
            This auction has officially closed.
          </div>
        `}
      </div>

      <!-- Bids History -->
      <div class="bid-history-panel">
        <h3 class="bid-history-title">
          Bidding History
          <span class="bid-history-count">${item.bids.length} bids</span>
        </h3>
        <div class="bid-list">
          ${bidsHTML}
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();
}

// 3. Render Profile Page
async function renderProfilePage() {
  const user = await getUserProfile();
  if (!user) {
    navigateTo('dashboard');
    return;
  }
  const auctions = await getAuctions();

  // Populate Sidebar
  elProfileUserName.textContent = `@${user.username}`;
  elProfileUserEmail.textContent = user.email;
  elProfileWallet.textContent = formatCurrency(user.walletBalance);
  elProfileWonCount.textContent = user.itemsWon.length;
  
  // Count user listings
  const userListings = auctions.filter(a => a.seller === user.username);
  elProfileListedCount.textContent = userListings.length;

  // Load Sub-Tab contents
  await renderProfileTab();
}

async function switchProfileTab(tabName, element) {
  activeProfileTab = tabName;
  document.querySelectorAll('.tab-sub-btn').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
  await renderProfileTab();
}

async function renderProfileTab() {
  const user = await getUserProfile();
  if (!user) return;
  
  const auctions = await getAuctions();
  let htmlContent = "";

  if (activeProfileTab === 'bids') {
    // Active bids the user participated in
    const bidItems = auctions.filter(a => user.itemsBidOn.includes(a.id) && a.status === 'active');
    
    if (bidItems.length === 0) {
      htmlContent = `<div class="glass" style="text-align:center; padding: 40px; border-radius: 12px; color: var(--text-secondary);">You have no active bids currently.</div>`;
    } else {
      htmlContent = bidItems.map(item => {
        const lastBid = item.bids.length > 0 ? item.bids[item.bids.length - 1] : null;
        const isHighest = lastBid && lastBid.bidder === user.username;
        return `
          <div class="glass" style="display:flex; justify-content:space-between; align-items:center; padding: 18px 24px; border-radius:12px; margin-bottom:12px;">
            <div>
              <h4 style="margin-bottom:4px;">${item.title}</h4>
              <span class="price-label">Time left: <span style="color:var(--accent-magenta); font-weight:700;">${formatTimeRemaining(item.endsAt - Date.now())}</span></span>
            </div>
            <div style="text-align:right; margin-right: 15px;">
              <div class="price-value" style="color:${isHighest ? 'var(--accent-green)' : 'var(--accent-cyan)'};">${formatCurrency(item.currentBid)}</div>
              <span class="price-label" style="font-size:0.75rem;">${isHighest ? 'Highest Bidder' : 'Outbid!'}</span>
            </div>
            <button class="btn btn-secondary" style="flex: 0 0 100px; padding: 8px;" onclick="navigateTo('detail', '${item.id}')">View</button>
          </div>
        `;
      }).join('');
    }
  } else if (activeProfileTab === 'won') {
    // Won items
    const wonItems = auctions.filter(a => user.itemsWon.includes(a.id));
    const deliveries = await getDeliveries();
    
    if (wonItems.length === 0) {
      htmlContent = `<div class="glass" style="text-align:center; padding: 40px; border-radius: 12px; color: var(--text-secondary);">You haven't won any auctions yet.</div>`;
    } else {
      htmlContent = wonItems.map(item => {
        const delivery = deliveries.find(d => d.auction_id === item.id);
        let trackingHTML = "";
        let statusBadge = "";
        if (delivery) {
          statusBadge = `<span class="price-label" style="font-size:0.75rem; color:var(--accent-green); font-weight:700;">Transaction Settled</span>`;
          let statusClass = "status-pending-shipment";
          if (delivery.delivery_status === "In Transit") statusClass = "status-in-transit";
          if (delivery.delivery_status === "Delivered") statusClass = "status-delivered";
          
          trackingHTML = `
            <div class="tracking-info-box" style="margin-top: 10px; width: 100%; text-align: left;">
              <p style="margin: 4px 0;"><strong>Shipping Status:</strong> <span class="delivery-badge ${statusClass}">${delivery.delivery_status}</span></p>
              <p style="margin: 4px 0;"><strong>Tracking ID:</strong> <code>${delivery.tracking_number}</code></p>
              <p style="margin: 4px 0;"><strong>Shipping Address:</strong> ${delivery.shipping_address}</p>
            </div>
          `;
        } else {
          statusBadge = `<span class="price-label" style="font-size:0.75rem; color:var(--accent-yellow); font-weight:700;">Payment Pending</span>`;
          trackingHTML = `
            <div style="margin-top: 15px;">
              <button class="btn btn-primary" style="width: 100%;" onclick="buyOutItem('${item.id}')">
                Provide Address & Checkout
              </button>
            </div>
          `;
        }
        return `
          <div class="glass" style="display:flex; flex-direction:column; padding: 18px 24px; border-radius:12px; margin-bottom:12px; border-left: 4px solid var(--accent-yellow);">
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
              <div>
                <h4 style="margin-bottom:4px;">${item.title}</h4>
                <span class="price-label">Purchased from: <span style="color:var(--accent-cyan);">@${item.seller}</span></span>
              </div>
              <div style="text-align:right;">
                <div class="price-value" style="color:var(--accent-yellow); font-weight:800;">${formatCurrency(item.currentBid)}</div>
                ${statusBadge}
              </div>
            </div>
            ${trackingHTML}
          </div>
        `;
      }).join('');
    }
  } else if (activeProfileTab === 'listed') {
    // User listings
    const userListings = auctions.filter(a => a.seller === user.username);
    const deliveries = await getDeliveries();
    
    if (userListings.length === 0) {
      htmlContent = `<div class="glass" style="text-align:center; padding: 40px; border-radius: 12px; color: var(--text-secondary);">You haven't listed any items for sale.</div>`;
    } else {
      htmlContent = userListings.map(item => {
        const isLive = item.status === 'active' && item.endsAt > Date.now();
        const delivery = deliveries.find(d => d.auction_id === item.id);
        let trackingHTML = "";
        if (delivery) {
          let statusClass = "status-pending-shipment";
          if (delivery.delivery_status === "In Transit") statusClass = "status-in-transit";
          if (delivery.delivery_status === "Delivered") statusClass = "status-delivered";
          
          trackingHTML = `
            <div class="tracking-info-box" style="margin-top: 10px; width: 100%; text-align: left;">
              <p style="margin: 4px 0;"><strong>Shipment to @${delivery.buyer}:</strong> <span class="delivery-badge ${statusClass}">${delivery.delivery_status}</span></p>
              <p style="margin: 4px 0;"><strong>Tracking ID:</strong> <code>${delivery.tracking_number}</code></p>
            </div>
          `;
        }
        return `
          <div class="glass" style="display:flex; flex-direction:column; padding: 18px 24px; border-radius:12px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
              <div>
                <h4 style="margin-bottom:4px;">${item.title}</h4>
                <span class="price-label">Status: <span style="color:${isLive ? 'var(--accent-green)' : 'var(--text-muted)'}; font-weight:700;">${isLive ? 'Active' : 'Closed'}</span></span>
              </div>
              <div style="text-align:right; margin-right:15px; display:flex; flex-direction:column; align-items:flex-end; flex:1;">
                <div class="price-value">${formatCurrency(item.currentBid)}</div>
                <span class="price-label" style="font-size:0.75rem;">${item.bids.length} bids placed</span>
              </div>
              <button class="btn btn-secondary" style="flex: 0 0 100px; padding: 8px;" onclick="navigateTo('detail', '${item.id}')">View</button>
            </div>
            ${trackingHTML}
          </div>
        `;
      }).join('');
    }
  } else if (activeProfileTab === 'payments') {
    const userPayments = await getPayments();
    
    if (userPayments.length === 0) {
      htmlContent = `<div class="glass" style="text-align:center; padding: 40px; border-radius: 12px; color: var(--text-secondary);">You have no deposit transactions.</div>`;
    } else {
      htmlContent = `
        <div class="glass" style="padding: 20px; border-radius: 12px; overflow-x: auto;">
          <table class="ledger-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
            <thead>
              <tr style="border-bottom: 2px solid rgba(255, 255, 255, 0.1); color: var(--text-secondary);">
                <th style="padding: 10px;">ID</th>
                <th style="padding: 10px;">Amount</th>
                <th style="padding: 10px;">Payment Method</th>
                <th style="padding: 10px;">Transaction Ref</th>
                <th style="padding: 10px;">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${userPayments.map(p => {
                const dateStr = new Date(p.timestamp).toLocaleString();
                const methodBadge = p.payment_method === "UPI" 
                  ? `<span style="color: var(--accent-cyan); font-weight: 700;">UPI Refill</span>` 
                  : `<span style="color: var(--accent-purple); font-weight: 700;">Credit Card</span>`;
                return `
                  <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <td style="padding: 10px;">${p.id}</td>
                    <td style="padding: 10px; color: var(--accent-green); font-weight: 700;">+${formatCurrency(p.amount)}</td>
                    <td style="padding: 10px;">${methodBadge}</td>
                    <td style="padding: 10px; font-family: monospace; font-size: 0.8rem; color: var(--text-secondary);">${p.transaction_reference}</td>
                    <td style="padding: 10px; color: var(--text-muted); font-size: 0.8rem;">${dateStr}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  elProfileTabContent.innerHTML = htmlContent;
}

// ----------------------------------------------------
// TRANSACTION & BID BUSINESS LOGIC
// ----------------------------------------------------

// 1. Place a Bid
async function placeBid(itemId) {
  if (!currentUsername) {
    showToast("Authentication required. Please sign in to place a bid.", "error");
    openAuthModal();
    return;
  }

  const amountInput = document.getElementById('bid-amount-input');
  if (!amountInput) return;

  const bidAmount = parseFloat(amountInput.value);
  if (isNaN(bidAmount) || bidAmount <= 0) {
    showToast("Please enter a valid bid amount.", "error");
    return;
  }

  // Call database place bid API
  const result = await placeBidAPI(itemId, currentUsername, bidAmount);
  if (result.success) {
    showToast(`Bid of ${formatCurrency(bidAmount)} placed successfully!`, "success");
    await renderDetailPage(itemId);
    await updateHeaderWallet();
  } else {
    showToast(result.message, "error");
  }
}

// 2. Buy Out Item Outright -> Proceed to Address
async function buyOutItem(itemId) {
  if (!currentUsername) {
    showToast("Authentication required. Please sign in to buy out.", "error");
    openAuthModal();
    return;
  }

  activeAuctionId = itemId;
  resetCheckoutForm();
  await navigateTo('address');
}

// 3. Checkout Flow Handlers
function handleAddressSubmit(event) {
  event.preventDefault();
  navigateTo('payment');
}

// Interactive Easebuzz UI Tabs
function selectEasebuzzTab(formId, tabElement) {
  // 1. Reset all tabs
  document.querySelectorAll('.eb-tab').forEach(tab => {
    tab.style.background = 'transparent';
    tab.style.border = 'none';
    tab.style.boxShadow = 'none';
    const icon = tab.querySelector('.eb-tab-icon');
    if (icon) icon.style.color = '#64748b';
    const text = tab.querySelector('.eb-tab-text');
    if (text) text.style.color = '#475569';
  });

  // 2. Set active tab
  if (tabElement) {
    tabElement.style.background = '#f8fafc';
    tabElement.style.border = '1px solid #e2e8f0';
    tabElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
    const icon = tabElement.querySelector('.eb-tab-icon');
    if (icon) icon.style.color = '#4f46e5';
    const text = tabElement.querySelector('.eb-tab-text');
    if (text) text.style.color = '#0f172a';
  }

  // 3. Hide all form sections
  document.querySelectorAll('.eb-form-section').forEach(section => {
    section.style.display = 'none';
  });

  // 4. Show selected form section
  const activeForm = document.getElementById(`eb-form-${formId}`);
  if (activeForm) {
    activeForm.style.display = 'block';
  }
}

async function handlePaymentSubmit(event) {
  event.preventDefault();
  if (!activeAuctionId) {
    showToast("No active item selected for checkout.", "error");
    return;
  }
  
  const elAmount = document.getElementById('easebuzz-pay-amount');
  if (elAmount) {
      elAmount.textContent = "Processing...";
      elAmount.style.color = '#eab308';
  }
  
  // Simulate network delay for Easebuzz
  setTimeout(async () => {
    if (elAmount) {
        elAmount.textContent = "Success!";
        elAmount.style.color = '#16a34a';
    }
    
    // Process transaction after showing success
    setTimeout(async () => {
      const result = await buyOutAPI(activeAuctionId, currentUsername);
      if (result.success) {
        showToast(`Payment successful! You bought ${result.item.title}.`, "success");
        activeProfileTab = 'won';
        await navigateTo('profile');
        await updateHeaderWallet();
      } else {
        showToast(result.message, "error");
      }
    }, 1500);
  }, 2000);
}



// Update wallet balance in header
async function updateHeaderWallet() {
  const user = await getUserProfile();
  if (user && elWalletBalance) {
    elWalletBalance.textContent = formatCurrency(user.walletBalance);
  }
}

// ----------------------------------------------------
// TIMER RUNTIME TICK ENGINE
// ----------------------------------------------------
function startTimerEngine() {
  // 1. One-second countdown timer for UI responsiveness
  setInterval(() => {
    const auctions = getLocalAuctions();
    updateActiveClocks(auctions);
  }, 1000);

  // 2. Five-second server sync poll
  setInterval(async () => {
    if (isBackendActive) {
      const oldAuctions = JSON.stringify(getLocalAuctions());
      const oldUser = JSON.stringify(getLocalUserProfile());
      
      const newAuctions = await getAuctions();
      const newUser = await getUserProfile();

      // If data changed, refresh UI
      if (JSON.stringify(newAuctions) !== oldAuctions || JSON.stringify(newUser) !== oldUser) {
        await updateHeaderWallet();
        if (activePage === 'dashboard') await renderDashboard();
        if (activePage === 'detail') await renderDetailPage(activeAuctionId);
        if (activePage === 'profile') await renderProfilePage();
      }
    } else {
      // Local fallback mode settlement run
      let stateChanged = false;
      const auctions = getLocalAuctions();
      const user = currentUsername ? getLocalUserProfile(currentUsername) : null;
      const now = Date.now();

      auctions.forEach((item) => {
        if (item.status === 'active' && item.endsAt <= now) {
          item.status = 'ended';
          stateChanged = true;

          if (item.bids.length > 0) {
            const winningBid = item.bids[item.bids.length - 1];
            if (user && winningBid.bidder === user.username) {
              user.itemsWon.push(item.id);
              user.walletBalance -= winningBid.amount;
              showToast(`🎉 Auction Won! You purchased "${item.title}" for ${formatCurrency(winningBid.amount)}`, "success");
            } else if (user && item.seller === user.username) {
              user.walletBalance += winningBid.amount;
              user.itemsSold.push(item.id);
              showToast(`💰 Listing Sold! Your "${item.title}" sold to @${winningBid.bidder} for ${formatCurrency(winningBid.amount)}`, "success");
            }
          } else {
            if (user && item.seller === user.username) {
              showToast(`⚠️ Auction Ended: Your listing "${item.title}" closed without any bids.`, "info");
            }
          }
        }
      });

      if (stateChanged) {
        saveLocalAuctions(auctions);
        if (user) saveLocalUserProfile(user);
        await updateHeaderWallet();
        if (activePage === 'dashboard') await renderDashboard();
        if (activePage === 'detail') await renderDetailPage(activeAuctionId);
        if (activePage === 'profile') await renderProfilePage();
      }
    }
  }, 5000);
}

// Update countdown clocks text on UI
function updateActiveClocks(auctions) {
  const now = Date.now();
  
  if (activePage === 'dashboard') {
    auctions.forEach(item => {
      const cardEl = document.getElementById(`card-${item.id}`);
      if (cardEl) {
        const badgeEl = cardEl.querySelector('.card-badge');
        if (badgeEl) {
          if (item.status === 'active' && item.endsAt > now) {
            badgeEl.className = 'card-badge badge-live';
            const timerTextEl = badgeEl.querySelector('.timer-text');
            if (timerTextEl) {
              timerTextEl.textContent = formatTimeRemaining(item.endsAt - now);
            }
          } else {
            if (badgeEl.className !== 'card-badge badge-ended') {
              badgeEl.className = 'card-badge badge-ended';
              badgeEl.textContent = 'Ended';
            }
          }
        }
      }
    });
  } else if (activePage === 'detail' && activeAuctionId) {
    const clockEl = document.getElementById('detail-clock');
    if (clockEl) {
      const item = auctions.find(a => a.id === activeAuctionId);
      if (item) {
        clockEl.textContent = item.status === 'active' && item.endsAt > now ? formatTimeRemaining(item.endsAt - now) : 'Ended';
      }
    }
  }
}

// ----------------------------------------------------
// APPLICATION BOOTSTRAP
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  // Sync state with backend immediately if available
  await checkBackendActive();
  
  // Render login/logout indicator
  updateAuthHeaderUI();
  
  // Update wallet UI
  await updateHeaderWallet();
  
  // Render primary dashboard view
  await renderDashboard();
  
  // Fire off clock timers
  startTimerEngine();
});
// ===================================================
// ADMIN MODERATION PANEL CONTROLLER
// ===================================================

async function renderAdminPage() {
  const pending = await getPendingAuctions();
  const allAuctions = await getAuctions();
  const activeAuctions = allAuctions.filter(a => a.status === 'active');

  const elPending = document.getElementById('admin-pending-container');
  const elActive = document.getElementById('admin-active-container');

  if (!elPending || !elActive) return;

  // 1. Render Pending Approvals
  if (pending.length === 0) {
    elPending.innerHTML = `
      <div style="text-align: center; padding: 30px; color: var(--text-muted); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px;">
        <i data-lucide="check-square" style="width: 36px; height: 36px; margin-bottom: 10px; opacity: 0.5;"></i>
        <p>All listings have been reviewed. No pending approvals.</p>
      </div>
    `;
  } else {
    elPending.innerHTML = pending.map(item => {
      return `
        <div class="glass" style="display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-radius: 12px; border-left: 4px solid var(--accent-cyan);">
          <div>
            <h4 style="font-size: 1.1rem; margin-bottom: 4px; color: var(--text-primary);">${item.title}</h4>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">
              Seller: <span style="color: var(--accent-cyan); font-weight: 700;">@${item.seller}</span> | Category: ${item.category}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
              Starting Bid: ${formatCurrency(item.startingBid)} ${item.buyNowPrice ? ` | Buyout: ${formatCurrency(item.buyNowPrice)}` : ''}
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" style="border-color: var(--accent-green); color: var(--accent-green); padding: 8px 16px; border-radius: 8px;" onclick="approveAuction('${item.id}')">
              Approve
            </button>
            <button class="btn btn-secondary" style="border-color: var(--accent-magenta); color: var(--accent-magenta); padding: 8px 16px; border-radius: 8px;" onclick="rejectAuction('${item.id}')">
              Reject
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. Render Active Moderation list
  if (activeAuctions.length === 0) {
    elActive.innerHTML = `
      <div style="text-align: center; padding: 30px; color: var(--text-muted); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px;">
        <p>No active marketplace auctions.</p>
      </div>
    `;
  } else {
    elActive.innerHTML = activeAuctions.map(item => {
      return `
        <div class="glass" style="display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-radius: 12px;">
          <div>
            <h4 style="font-size: 1.1rem; margin-bottom: 4px; color: var(--text-primary);">${item.title}</h4>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">
              Seller: @${item.seller} | Current Bid: <span style="color: var(--accent-cyan); font-weight: 700;">${formatCurrency(item.currentBid)}</span>
            </div>
          </div>
          <button class="btn btn-secondary" style="border-color: var(--accent-magenta); color: var(--accent-magenta); padding: 8px 16px; border-radius: 8px;" onclick="deleteAuction('${item.id}')">
            Delete
          </button>
        </div>
      `;
    }).join('');
  }

  // 3. Render Shipments Tracker
  const deliveries = await getDeliveries();
  const elDeliveriesTbody = document.getElementById('admin-deliveries-tbody');
  if (elDeliveriesTbody) {
    if (deliveries.length === 0) {
      elDeliveriesTbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 20px; color: var(--text-muted);">No shipping records found.</td>
        </tr>
      `;
    } else {
      elDeliveriesTbody.innerHTML = deliveries.map(d => {
        let statusClass = "status-pending-shipment";
        if (d.delivery_status === "In Transit") statusClass = "status-in-transit";
        if (d.delivery_status === "Delivered") statusClass = "status-delivered";
        
        let actionBtn = "";
        if (d.delivery_status === "Pending Shipment") {
          actionBtn = `<button class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.75rem; border-color: var(--accent-cyan); color: var(--accent-cyan);" onclick="updateDeliveryStatus('${d.id}', 'In Transit')">Ship Item</button>`;
        } else if (d.delivery_status === "In Transit") {
          actionBtn = `<button class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.75rem; border-color: var(--accent-green); color: var(--accent-green);" onclick="updateDeliveryStatus('${d.id}', 'Delivered')">Deliver</button>`;
        } else {
          actionBtn = `<span style="color: var(--text-muted); font-size: 0.75rem;">Completed</span>`;
        }

        return `
          <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
            <td style="padding: 12px 10px; font-weight: 600;">${d.item_title}</td>
            <td style="padding: 12px 10px;">@${d.buyer}</td>
            <td style="padding: 12px 10px;">@${d.seller}</td>
            <td style="padding: 12px 10px; color: var(--accent-yellow); font-weight: 700;">${formatCurrency(d.price)}</td>
            <td style="padding: 12px 10px; font-family: monospace;">${d.tracking_number}</td>
            <td style="padding: 12px 10px; color: var(--text-secondary); font-size: 0.8rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${d.shipping_address}">${d.shipping_address}</td>
            <td style="padding: 12px 10px;"><span class="delivery-badge ${statusClass}">${d.delivery_status}</span></td>
            <td style="padding: 12px 10px; text-align: right;">${actionBtn}</td>
          </tr>
        `;
      }).join('');
    }
  }

  // 4. Render Payments History Ledger
  const payments = await getPayments();
  const elPaymentsTbody = document.getElementById('admin-payments-tbody');
  if (elPaymentsTbody) {
    if (payments.length === 0) {
      elPaymentsTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">No payment transaction records found.</td>
        </tr>
      `;
    } else {
      elPaymentsTbody.innerHTML = payments.map(p => {
        const dateStr = new Date(p.timestamp).toLocaleString();
        const methodBadge = p.payment_method === "UPI" 
          ? `<span style="color: var(--accent-cyan); font-weight: 700;">UPI Refill</span>` 
          : `<span style="color: var(--accent-purple); font-weight: 700;">Credit Card</span>`;
        return `
          <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
            <td style="padding: 12px 10px;">${p.id}</td>
            <td style="padding: 12px 10px; font-weight: 600;">@${p.username}</td>
            <td style="padding: 12px 10px; color: var(--accent-green); font-weight: 700;">+${formatCurrency(p.amount)}</td>
            <td style="padding: 12px 10px;">${methodBadge}</td>
            <td style="padding: 12px 10px; font-family: monospace; font-size: 0.8rem; color: var(--text-secondary);">${p.transaction_reference}</td>
            <td style="padding: 12px 10px; color: var(--text-muted); font-size: 0.8rem;">${dateStr}</td>
          </tr>
        `;
      }).join('');
    }
  }

  lucide.createIcons();
}

async function approveAuction(itemId) {
  showToast("Approving listing...", "info");
  const res = await approveAuctionAPI(itemId);
  if (res.success) {
    showToast(`Approved "${res.item.title}"! It is now active in the browse grid.`, "success");
    await renderAdminPage();
  } else {
    showToast(res.message, "error");
  }
}

async function rejectAuction(itemId) {
  if (confirm("Are you sure you want to reject and delete this user listing?")) {
    showToast("Rejecting listing...", "info");
    const res = await rejectAuctionAPI(itemId);
    if (res.success) {
      showToast("Listing rejected.", "success");
      await renderAdminPage();
    } else {
      showToast(res.message, "error");
    }
  }
}

async function deleteAuction(itemId) {
  if (confirm("Are you sure you want to permanently delete this active auction? All active bids will be voided.")) {
    showToast("Deleting listing...", "info");
    const res = await deleteAuctionAPI(itemId);
    if (res.success) {
      showToast("Active auction listing deleted successfully.", "success");
      await renderAdminPage();
    } else {
      showToast(res.message, "error");
    }
  }
}

async function updateDeliveryStatus(deliveryId, status) {
  showToast(`Updating shipping status to ${status}...`, "info");
  const res = await updateDeliveryStatusAPI(deliveryId, status);
  if (res.success) {
    showToast(`Shipping status updated to "${status}"!`, "success");
    await renderAdminPage();
  } else {
    showToast(res.message, "error");
  }
}

async function handleAdminCreateListing(event) {
  event.preventDefault();

  const title = document.getElementById('admin-item-title').value.trim();
  const category = document.getElementById('admin-item-category').value;
  const durationHours = parseFloat(document.getElementById('admin-item-duration').value);
  const startingBid = parseFloat(document.getElementById('admin-item-starting-bid').value);
  const buyNowVal = document.getElementById('admin-item-buyout').value;
  const buyNowPrice = buyNowVal ? parseFloat(buyNowVal) : null;
  const description = document.getElementById('admin-item-description').value.trim();
  const elImage = document.getElementById('admin-item-image');
  const imageUrl = elImage ? elImage.value.trim() : null;

  if (!title || !category || isNaN(durationHours) || isNaN(startingBid)) {
    showToast("Please fill all required fields.", "error");
    return;
  }

  showToast("Publishing live auction...", "info");

  // Admin listed items bypass pending status and start active
  const result = await createListingAPI(
    title, description, category, startingBid, buyNowPrice, durationHours,
    selectedPresetGradient, selectedPresetIcon, currentUsername, imageUrl
  );

  if (result.success) {
    document.getElementById('admin-sell-form').reset();
    showToast(`"${title}" is now active in the browse grid!`, "success");
    await renderAdminPage();
    // Refresh dashboard if active
    if (activePage === 'dashboard') await renderDashboard();
  } else {
    showToast(result.message, "error");
  }
}
