// BidSphere - Application Controller with Backend Sync

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
    if (btn.textContent.trim().includes(category) || 
        (category === 'All' && btn.textContent.trim() === 'All Categories') || 
        (category === 'Gaming & Entertainment' && btn.textContent.trim() === 'Gaming') || 
        (category === 'Art & Collectibles' && btn.textContent.trim() === 'Art')) {
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
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// ----------------------------------------------------
// UI RENDERING FUNCTIONS
// ----------------------------------------------------

// 1. Render Dashboard Listings
async function renderDashboard() {
  const auctions = await getAuctions();
  
  const filtered = auctions.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery) || 
                          item.description.toLowerCase().includes(searchQuery);
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
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
        <div class="card-image-wrapper" style="background: ${item.imageGradient};">
          <span class="card-badge ${isLive ? 'badge-live' : 'badge-ended'}">
            ${isLive ? `<i data-lucide="flame" style="width: 12px; height: 12px; display: inline; vertical-align: middle;"></i> <span class="timer-text">${timeRemainingStr}</span>` : 'Ended'}
          </span>
          <i data-lucide="${iconName}" class="card-icon"></i>
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
    const isUserBid = bid.bidder === user.username;
    
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
    <div class="detail-gallery" style="background: ${item.imageGradient};">
      <i data-lucide="${iconName}" class="detail-gallery-icon"></i>
      
      <div class="detail-timer-bar">
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
          ${item.seller === user.username ? `
            <div style="text-align: center; color: var(--text-secondary); padding: 10px 0;">
              <i data-lucide="shield-alert" style="vertical-align: middle; margin-right: 5px;"></i>
              You are the seller of this auction listing.
            </div>
          ` : `
            <div>
              <span class="price-label">Enter Bid (Min. {formatCurrency(minAllowedBid)})</span>
              <div class="bid-input-group">
                <div class="bid-input-wrapper">
                  <span class="bid-currency">$</span>
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
    
    if (wonItems.length === 0) {
      htmlContent = `<div class="glass" style="text-align:center; padding: 40px; border-radius: 12px; color: var(--text-secondary);">You haven't won any auctions yet.</div>`;
    } else {
      htmlContent = wonItems.map(item => {
        return `
          <div class="glass" style="display:flex; justify-content:space-between; align-items:center; padding: 18px 24px; border-radius:12px; margin-bottom:12px; border-left: 4px solid var(--accent-yellow);">
            <div>
              <h4 style="margin-bottom:4px;">${item.title}</h4>
              <span class="price-label">Purchased from: <span style="color:var(--accent-cyan);">@${item.seller}</span></span>
            </div>
            <div style="text-align:right;">
              <div class="price-value" style="color:var(--accent-yellow); font-weight:800;">${formatCurrency(item.currentBid)}</div>
              <span class="price-label" style="font-size:0.75rem; color:var(--accent-green); font-weight:700;">Transaction Settled</span>
            </div>
          </div>
        `;
      }).join('');
    }
  } else if (activeProfileTab === 'listed') {
    // User listings
    const userListings = auctions.filter(a => a.seller === user.username);
    
    if (userListings.length === 0) {
      htmlContent = `<div class="glass" style="text-align:center; padding: 40px; border-radius: 12px; color: var(--text-secondary);">You haven't listed any items for sale.</div>`;
    } else {
      htmlContent = userListings.map(item => {
        const isLive = item.status === 'active' && item.endsAt > Date.now();
        return `
          <div class="glass" style="display:flex; justify-content:space-between; align-items:center; padding: 18px 24px; border-radius:12px; margin-bottom:12px;">
            <div>
              <h4 style="margin-bottom:4px;">${item.title}</h4>
              <span class="price-label">Status: <span style="color:${isLive ? 'var(--accent-green)' : 'var(--text-muted)'}; font-weight:700;">${isLive ? 'Active' : 'Closed'}</span></span>
            </div>
            <div style="text-align:right; margin-right:15px;">
              <div class="price-value">${formatCurrency(item.currentBid)}</div>
              <span class="price-label" style="font-size:0.75rem;">${item.bids.length} bids placed</span>
            </div>
            <button class="btn btn-secondary" style="flex: 0 0 100px; padding: 8px;" onclick="navigateTo('detail', '${item.id}')">View</button>
          </div>
        `;
      }).join('');
    }
  }

  elProfileTabContent.innerHTML = htmlContent;
}

// ----------------------------------------------------
// TRANSACTION & BID BUSINESS LOGIC
// ----------------------------------------------------

// 1. Place a Bid
async function placeBid(itemId) {
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

// 2. Buy Out Item Outright
async function buyOutItem(itemId) {
  // Call database buyout API
  const result = await buyOutAPI(itemId, currentUsername);
  if (result.success) {
    showToast(`Congratulations! You bought ${result.item.title} outright!`, "success");
    activeProfileTab = 'won';
    await navigateTo('profile');
    await updateHeaderWallet();
  } else {
    showToast(result.message, "error");
  }
}

// 3. Create Listing Submission
async function handleCreateListing(event) {
  event.preventDefault();

  const title = document.getElementById('item-title').value.trim();
  const category = document.getElementById('item-category').value;
  const durationHours = parseFloat(document.getElementById('item-duration').value);
  const startingBid = parseFloat(document.getElementById('item-starting-bid').value);
  const buyNowVal = document.getElementById('item-buyout').value;
  const buyNowPrice = buyNowVal ? parseFloat(buyNowVal) : null;
  const description = document.getElementById('item-description').value.trim();

  // Validations
  if (!title || !category || isNaN(durationHours) || isNaN(startingBid)) {
    showToast("Please fill all required fields.", "error");
    return;
  }

  if (buyNowPrice !== null && buyNowPrice <= startingBid) {
    showToast("Buy Out Price must be higher than the starting bid.", "error");
    return;
  }

  const result = await createListingAPI(
    title, description, category, startingBid, buyNowPrice, durationHours,
    selectedPresetGradient, selectedPresetIcon, currentUsername
  );

  if (result.success) {
    document.getElementById('sell-form').reset();
    showToast("Your auction has been published successfully!", "success");
    await navigateTo('dashboard');
  } else {
    showToast(result.message, "error");
  }
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
    // Only fetch from memory cache to avoid performance block
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
      const user = getLocalUserProfile();
      const now = Date.now();

      auctions.forEach((item) => {
        if (item.status === 'active' && item.endsAt <= now) {
          item.status = 'ended';
          stateChanged = true;

          if (item.bids.length > 0) {
            const winningBid = item.bids[item.bids.length - 1];
            if (winningBid.bidder === user.username) {
              user.itemsWon.push(item.id);
              user.walletBalance -= winningBid.amount;
              showToast(`🎉 Auction Won! You purchased "${item.title}" for ${formatCurrency(winningBid.amount)}`, "success");
            } else if (item.seller === user.username) {
              user.walletBalance += winningBid.amount;
              user.itemsSold.push(item.id);
              showToast(`💰 Listing Sold! Your "${item.title}" sold to @${winningBid.bidder} for ${formatCurrency(winningBid.amount)}`, "success");
            }
          } else {
            if (item.seller === user.username) {
              showToast(`⚠️ Auction Ended: Your listing "${item.title}" closed without any bids.`, "info");
            }
          }
        }
      });

      if (stateChanged) {
        saveLocalAuctions(auctions);
        saveLocalUserProfile(user);
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
  } else if (activePage === 'profile' && activeProfileTab === 'bids') {
    // We let the interval sync it
  }
}

// ----------------------------------------------------
// APPLICATION BOOTSTRAP
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  // Sync state with backend immediately if available
  await checkBackendActive();
  
  // Update wallet UI
  await updateHeaderWallet();
  
  // Render primary dashboard view
  await renderDashboard();
  
  // Fire off clock timers
  startTimerEngine();
});
