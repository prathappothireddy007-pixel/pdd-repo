// BidSphere - Shared State & Backend Integration with Auth and Payments

const API_BASE = "http://localhost:8000/api";
let isBackendActive = false;

// Dynamic logged-in user state
let currentUsername = localStorage.getItem("bidsphere_username") || null;

const DEFAULT_AUCTIONS = [
  {
    id: "auc-1",
    title: "Apex-X Cyberpunk Mechanical Keyboard",
    description: "Handcrafted 75% mechanical keyboard featuring customized hot-swappable tactile switches, dynamic neon RGB underglow, custom resin cyberpunk keycaps, and a solid CNC-milled aluminum case with clear polycarbonate bottom.",
    category: "Electronics",
    startingBid: 150,
    buyNowPrice: 350,
    currentBid: 195,
    seller: "NeonCustoms",
    endsAt: Date.now() + (3.5 * 60 * 60 * 1000), // 3.5 hours from now
    imageGradient: "linear-gradient(135deg, #2b1055, #7597de)",
    imageIcon: "keyboard",
    status: "active",
    bids: [
      { bidder: "ShiftKey99", amount: 150, timestamp: "2026-06-15T08:00:00Z" },
      { bidder: "CyberRider", amount: 175, timestamp: "2026-06-15T08:30:00Z" },
      { bidder: "ShiftKey99", amount: 195, timestamp: "2026-06-15T09:00:00Z" }
    ]
  },
  {
    id: "auc-2",
    title: "Chrono-Classic Vintage GMT Watch",
    description: "Restored 1984 automatic GMT wristwatch. Stainless steel case, dual-timezone bezel, original matte black dial with tritium markers, and authentic leather strap. Includes certificate of authenticity and original box.",
    category: "Fashion & Luxury",
    startingBid: 1200,
    buyNowPrice: 2200,
    currentBid: 1450,
    seller: "LegacyTimepieces",
    endsAt: Date.now() + (8 * 60 * 60 * 1000), // 8 hours from now
    imageGradient: "linear-gradient(135deg, #1f4037, #99f2c8)",
    imageIcon: "watch",
    status: "active",
    bids: [
      { bidder: "AeroCollector", amount: 1200, timestamp: "2026-06-15T07:15:00Z" },
      { bidder: "TimeLord", amount: 1350, timestamp: "2026-06-15T08:05:00Z" },
      { bidder: "AeroCollector", amount: 1450, timestamp: "2026-06-15T08:50:00Z" }
    ]
  },
  {
    id: "auc-3",
    title: "SynthWave Holographic Sneakers (Size 10)",
    description: "Limited-run designer sneakers featuring light-responsive holographic panels, smart mesh lining, self-lacing technology interface, and dynamic LED accents controllable via custom mobile application.",
    category: "Fashion & Luxury",
    startingBid: 400,
    buyNowPrice: 850,
    currentBid: 400,
    seller: "SoleSynth",
    endsAt: Date.now() + (1.2 * 60 * 60 * 1000), // 1.2 hours from now
    imageGradient: "linear-gradient(135deg, #f857a6, #ff5858)",
    imageIcon: "shoe",
    status: "active",
    bids: []
  },
  {
    id: "auc-4",
    title: "RetroStation 95 - Modded Console Edition",
    description: "Fully customized vintage home console updated for modern HDMI outputs. Translucent crystal-blue casing, pre-loaded custom emulator firmware, clean motherboard recap, and two custom wireless retro controllers.",
    category: "Gaming & Entertainment",
    startingBid: 250,
    buyNowPrice: 490,
    currentBid: 320,
    seller: "PixelNostalgia",
    endsAt: Date.now() + (18 * 60 * 60 * 1000), // 18 hours from now
    imageGradient: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    imageIcon: "gamepad",
    status: "active",
    bids: [
      { bidder: "MarioBros85", amount: 250, timestamp: "2026-06-15T05:00:00Z" },
      { bidder: "SegaFanatic", amount: 290, timestamp: "2026-06-15T06:10:00Z" },
      { bidder: "MarioBros85", amount: 320, timestamp: "2026-06-15T07:30:00Z" }
    ]
  },
  {
    id: "auc-5",
    title: "Elysium Citadel Digital Concept Art",
    description: "High-resolution digital illustration showcasing a soaring utopian metropolis among clouds. Rendered in photorealistic detail with cinematic lighting. Winner receives ownership certificate and source project files.",
    category: "Art & Collectibles",
    startingBid: 500,
    buyNowPrice: 1200,
    currentBid: 780,
    seller: "VaporVector",
    endsAt: Date.now() + (22.5 * 60 * 60 * 1000), // 22.5 hours from now
    imageGradient: "linear-gradient(135deg, #fc00ff, #00dbde)",
    imageIcon: "image",
    status: "active",
    bids: [
      { bidder: "GalleryDirector", amount: 500, timestamp: "2026-06-15T03:00:00Z" },
      { bidder: "CryptoCurator", amount: 650, timestamp: "2026-06-15T04:30:00Z" },
      { bidder: "GalleryDirector", amount: 720, timestamp: "2026-06-15T06:00:00Z" },
      { bidder: "CryptoCurator", amount: 780, timestamp: "2026-06-15T07:15:00Z" }
    ]
  }
];

const DEFAULT_USER_PROFILE = {
  username: "BidMaster_X",
  email: "bidmaster@bidsphere.io",
  walletBalance: 2500,
  itemsWon: [],
  itemsBidOn: ["auc-1", "auc-2", "auc-4"],
  itemsSold: []
};

// Local storage fallback helpers
function getLocalAuctions() {
  return JSON.parse(localStorage.getItem("bidsphere_auctions")) || DEFAULT_AUCTIONS;
}

function saveLocalAuctions(auctions) {
  localStorage.setItem("bidsphere_auctions", JSON.stringify(auctions));
}

function getLocalUserProfile(username = null) {
  const targetUsername = username || currentUsername || "BidMaster_X";
  
  // Try retrieving this specific user from a local mock user base
  const userBase = JSON.parse(localStorage.getItem("bidsphere_users_base")) || {};
  if (userBase[targetUsername]) {
    return userBase[targetUsername];
  }
  
  // Fallback to legacy single user key
  if (targetUsername === "BidMaster_X") {
    return JSON.parse(localStorage.getItem("bidsphere_user")) || DEFAULT_USER_PROFILE;
  }
  
  // Return new mock user details
  return {
    username: targetUsername,
    email: `${targetUsername.toLowerCase()}@bidsphere.io`,
    walletBalance: 2500,
    itemsWon: [],
    itemsBidOn: [],
    itemsSold: []
  };
}

function saveLocalUserProfile(user) {
  if (user.username === currentUsername) {
    localStorage.setItem("bidsphere_user", JSON.stringify(user));
  }
  const userBase = JSON.parse(localStorage.getItem("bidsphere_users_base")) || {};
  userBase[user.username] = user;
  localStorage.setItem("bidsphere_users_base", JSON.stringify(userBase));
}

function initializeStore() {
  if (!localStorage.getItem("bidsphere_auctions")) {
    localStorage.setItem("bidsphere_auctions", JSON.stringify(DEFAULT_AUCTIONS));
  }
  if (!localStorage.getItem("bidsphere_user")) {
    localStorage.setItem("bidsphere_user", JSON.stringify(DEFAULT_USER_PROFILE));
  }
  // Initialize mock users base
  if (!localStorage.getItem("bidsphere_users_base")) {
    const base = {};
    base["BidMaster_X"] = DEFAULT_USER_PROFILE;
    localStorage.setItem("bidsphere_users_base", JSON.stringify(base));
  }
}

// Check if Python FastAPI server is running & validate authentication
async function checkBackendActive() {
  try {
    const checkUsername = currentUsername || "BidMaster_X";
    const res = await fetch(`${API_BASE}/user/${checkUsername}`, { method: 'GET' });
    if (res.ok) {
      isBackendActive = true;
      // If we are logged in, sync our profile details
      if (currentUsername) {
        const serverUser = await res.json();
        const mappedUser = {
          username: serverUser.username,
          email: serverUser.email,
          walletBalance: serverUser.wallet_balance,
          role: serverUser.role || "user",
          itemsWon: serverUser.items_won,
          itemsBidOn: serverUser.items_bid_on,
          itemsSold: serverUser.items_sold
        };
        saveLocalUserProfile(mappedUser);
      }
      updateBackendIndicator(true);
      return true;
    }
  } catch (e) {
    // Fail silently
  }
  isBackendActive = false;
  updateBackendIndicator(false);
  return false;
}

// Convert Backend Auction fields to match Frontend casing
function mapBackendAuction(a) {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    category: a.category,
    startingBid: a.starting_bid,
    buyNowPrice: a.buy_now_price,
    currentBid: a.current_bid,
    seller: a.seller,
    endsAt: a.ends_at,
    imageGradient: a.bg_color,
    imageIcon: a.icon,
    status: a.status,
    bids: (a.bids || []).map(b => ({
      bidder: b.bidder,
      amount: b.amount,
      timestamp: b.timestamp
    }))
  };
}

// Integrated Getter/Setter APIs
async function getAuctions() {
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/auctions`);
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(mapBackendAuction);
        saveLocalAuctions(mapped); // Sync local cache
        return mapped;
      }
    } catch (e) {
      isBackendActive = false;
      updateBackendIndicator(false);
    }
  }
  return getLocalAuctions().filter(a => a.status !== "pending");
}

async function getUserProfile() {
  if (!currentUsername) {
    return null;
  }
  
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/user/${currentUsername}`);
      if (res.ok) {
        const serverUser = await res.json();
        const mappedUser = {
          username: serverUser.username,
          email: serverUser.email,
          walletBalance: serverUser.wallet_balance,
          role: serverUser.role || "user",
          itemsWon: serverUser.items_won,
          itemsBidOn: serverUser.items_bid_on,
          itemsSold: serverUser.items_sold
        };
        saveLocalUserProfile(mappedUser); // Sync local cache
        return mappedUser;
      }
    } catch (e) {
      isBackendActive = false;
      updateBackendIndicator(false);
    }
  }
  return getLocalUserProfile(currentUsername);
}

// ===================================================
// USER AUTHENTICATION APIS
// ===================================================

async function authLoginAPI(username, password) {
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const serverUser = await res.json();
        currentUsername = serverUser.username;
        localStorage.setItem("bidsphere_username", currentUsername);
        
        const mappedUser = {
          username: serverUser.username,
          email: serverUser.email,
          walletBalance: serverUser.wallet_balance,
          role: serverUser.role || "user",
          itemsWon: serverUser.items_won,
          itemsBidOn: serverUser.items_bid_on,
          itemsSold: serverUser.items_sold
        };
        saveLocalUserProfile(mappedUser);
        return { success: true, user: mappedUser };
      } else {
        const err = await res.json();
        return { success: false, message: err.detail || "Invalid credentials." };
      }
    } catch (e) {
      return { success: false, message: "Backend connection error." };
    }
  }
  
  // Local fallback auth
  const userBase = JSON.parse(localStorage.getItem("bidsphere_users_base")) || {};
  if (userBase[username]) {
    // For demo purposes, we log them in directly
    currentUsername = username;
    localStorage.setItem("bidsphere_username", currentUsername);
    return { success: true, user: userBase[username] };
  } else {
    // Auto-create user on the fly if offline to make it friction-free!
    return authRegisterAPI(username, `${username.toLowerCase()}@bidsphere.io`, password);
  }
}

async function authRegisterAPI(username, email, password) {
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      if (res.ok) {
        const serverUser = await res.json();
        currentUsername = serverUser.username;
        localStorage.setItem("bidsphere_username", currentUsername);
        
        const mappedUser = {
          username: serverUser.username,
          email: serverUser.email,
          walletBalance: serverUser.wallet_balance,
          role: serverUser.role || "user",
          itemsWon: serverUser.items_won,
          itemsBidOn: serverUser.items_bid_on,
          itemsSold: serverUser.items_sold
        };
        saveLocalUserProfile(mappedUser);
        return { success: true, user: mappedUser };
      } else {
        const err = await res.json();
        return { success: false, message: err.detail || "Registration failed." };
      }
    } catch (e) {
      return { success: false, message: "Backend connection error." };
    }
  }
  
  // Local fallback registration
  const userBase = JSON.parse(localStorage.getItem("bidsphere_users_base")) || {};
  if (userBase[username]) {
    return { success: false, message: "Username already exists." };
  }
  
  const role = (username.toLowerCase().includes("admin") || username === "admin") ? "admin" : "user";
  const newUser = {
    username: username,
    email: email,
    walletBalance: 2500.0,
    role: role,
    itemsWon: [],
    itemsBidOn: [],
    itemsSold: []
  };
  
  userBase[username] = newUser;
  localStorage.setItem("bidsphere_users_base", JSON.stringify(userBase));
  
  currentUsername = username;
  localStorage.setItem("bidsphere_username", currentUsername);
  saveLocalUserProfile(newUser);
  
  return { success: true, user: newUser };
}

function authLogout() {
  currentUsername = null;
  localStorage.removeItem("bidsphere_username");
  localStorage.removeItem("bidsphere_user");
}

// ===================================================
// WALLET PAYMENT / TOP-UP API
// ===================================================

function getLocalPayments() {
  return JSON.parse(localStorage.getItem("bidsphere_payments")) || [];
}
function saveLocalPayments(payments) {
  localStorage.setItem("bidsphere_payments", JSON.stringify(payments));
}
function getLocalDeliveries() {
  return JSON.parse(localStorage.getItem("bidsphere_deliveries")) || [];
}
function saveLocalDeliveries(deliveries) {
  localStorage.setItem("bidsphere_deliveries", JSON.stringify(deliveries));
}

async function userTopupAPI(amount, paymentMethod = "Card", cardNumber = null, expiry = null, cvv = null, transactionReference = null) {
  if (!currentUsername) {
    return { success: false, message: "Must be logged in to add balance." };
  }

  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/user/${currentUsername}/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount, 
          payment_method: paymentMethod, 
          card_number: cardNumber, 
          expiry, 
          cvv,
          transaction_reference: transactionReference
        })
      });
      if (res.ok) {
        const serverUser = await res.json();
        const mappedUser = {
          username: serverUser.username,
          email: serverUser.email,
          walletBalance: serverUser.wallet_balance,
          role: serverUser.role || "user",
          itemsWon: serverUser.items_won,
          itemsBidOn: serverUser.items_bid_on,
          itemsSold: serverUser.items_sold
        };
        saveLocalUserProfile(mappedUser);
        await getUserProfile(); // Refresh
        return { success: true, user: mappedUser };
      } else {
        const err = await res.json();
        return { success: false, message: err.detail || "Top-up failed." };
      }
    } catch (e) {
      return { success: false, message: "Backend connection error during transaction." };
    }
  }
  
  // Local fallback top-up
  const user = getLocalUserProfile(currentUsername);
  user.walletBalance += amount;
  saveLocalUserProfile(user);

  // Log payment record locally
  const payments = getLocalPayments();
  const txRef = paymentMethod === "Card" 
    ? `TXN-CARD-${Math.floor(10000000 + Math.random() * 90000000)}` 
    : (transactionReference || `TXN-UPI-${Math.floor(10000000 + Math.random() * 90000000)}`);
  
  const newPayment = {
    id: Date.now(),
    username: currentUsername,
    amount: amount,
    payment_method: paymentMethod,
    transaction_reference: txRef,
    timestamp: new Date().toISOString()
  };
  payments.unshift(newPayment);
  saveLocalPayments(payments);
  
  return { success: true, user };
}

// ===================================================
// TRANSACTION BUSINESS APIS
// ===================================================

async function placeBidAPI(itemId, bidder, amount) {
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/auctions/${itemId}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidder, amount })
      });
      if (res.ok) {
        const updatedAuction = await res.json();
        await getAuctions();
        await getUserProfile();
        return { success: true, item: mapBackendAuction(updatedAuction) };
      } else {
        const err = await res.json();
        return { success: false, message: err.detail || "Bid rejected by server." };
      }
    } catch (e) {
      return { success: false, message: "Backend server connection error." };
    }
  }
  
  // Local fallback logic
  const auctions = getLocalAuctions();
  const itemIndex = auctions.findIndex(a => a.id === itemId);
  if (itemIndex === -1) return { success: false, message: "Item not found." };
  
  const item = auctions[itemIndex];
  const user = getLocalUserProfile(bidder);
  
  const minIncrement = 5;
  const minAllowed = item.bids.length > 0 ? (item.currentBid + minIncrement) : item.startingBid;
  if (amount < minAllowed) return { success: false, message: `Bid must be at least $${minAllowed}` };
  if (user.walletBalance < amount) return { success: false, message: "Insufficient wallet balance." };
  
  item.bids.push({ bidder, amount, timestamp: new Date().toISOString() });
  item.currentBid = amount;
  
  if (!user.itemsBidOn.includes(itemId)) {
    user.itemsBidOn.push(itemId);
  }
  
  auctions[itemIndex] = item;
  saveLocalAuctions(auctions);
  saveLocalUserProfile(user);
  return { success: true, item };
}

async function buyOutAPI(itemId, bidder) {
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/auctions/${itemId}/buyout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidder })
      });
      if (res.ok) {
        const updatedAuction = await res.json();
        await getAuctions();
        await getUserProfile();
        return { success: true, item: mapBackendAuction(updatedAuction) };
      } else {
        const err = await res.json();
        return { success: false, message: err.detail || "Buyout failed." };
      }
    } catch (e) {
      return { success: false, message: "Backend server connection error." };
    }
  }
  
  // Local fallback logic
  const auctions = getLocalAuctions();
  const itemIndex = auctions.findIndex(a => a.id === itemId);
  if (itemIndex === -1) return { success: false, message: "Item not found." };
  
  const item = auctions[itemIndex];
  const user = getLocalUserProfile(bidder);
  
  if (!item.buyNowPrice) return { success: false, message: "Item doesn't support buyout." };
  if (user.walletBalance < item.buyNowPrice) return { success: false, message: "Insufficient wallet balance." };
  
  item.status = "sold";
  item.endsAt = Date.now();
  item.currentBid = item.buyNowPrice;
  item.bids.push({ bidder, amount: item.buyNowPrice, timestamp: new Date().toISOString() });
  
  user.walletBalance -= item.buyNowPrice;
  user.itemsWon.push(itemId);
  
  auctions[itemIndex] = item;
  saveLocalAuctions(auctions);
  saveLocalUserProfile(user);

  // Log delivery record locally
  const deliveries = getLocalDeliveries();
  const trackingNum = `TRK-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  const newDelivery = {
    id: Date.now(),
    auction_id: itemId,
    item_title: item.title,
    buyer: bidder,
    seller: item.seller,
    price: item.buyNowPrice,
    shipping_address: "104 Cyberpunk Blvd, Sector 7",
    tracking_number: trackingNum,
    delivery_status: "Pending Shipment",
    last_updated: new Date().toISOString()
  };
  deliveries.unshift(newDelivery);
  saveLocalDeliveries(deliveries);

  return { success: true, item };
}

async function createListingAPI(title, description, category, startingBid, buyNowPrice, durationHours, bgColor, icon, seller) {
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/auctions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, category,
          starting_bid: startingBid,
          buy_now_price: buyNowPrice,
          duration_hours: durationHours,
          bg_color: bgColor,
          icon: icon,
          seller
        })
      });
      if (res.ok) {
        const newAuction = await res.json();
        await getAuctions();
        await getUserProfile();
        return { success: true, item: mapBackendAuction(newAuction) };
      } else {
        const err = await res.json();
        return { success: false, message: err.detail || "Failed to create listing." };
      }
    } catch (e) {
      return { success: false, message: "Backend server connection error." };
    }
  }
  
  // Local fallback logic
  const newAuction = {
    id: `auc-${Date.now()}`,
    title, description, category,
    startingBid, buyNowPrice, currentBid: startingBid,
    seller, endsAt: Date.now() + (durationHours * 60 * 60 * 1000),
    imageGradient: bgColor,
    imageIcon: icon,
    status: "active",
    bids: []
  };
  
  const auctions = getLocalAuctions();
  auctions.unshift(newAuction);
  saveLocalAuctions(auctions);
  
  const user = getLocalUserProfile(seller);
  user.itemsSold.push(newAuction.id);
  saveLocalUserProfile(user);
  
  return { success: true, item: newAuction };
}

async function resetDatabaseAPI() {
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/user/reset`, { method: "POST" });
      if (res.ok) {
        await getAuctions();
        await getUserProfile();
        return true;
      }
    } catch (e) {
      // ignore
    }
  }
  localStorage.removeItem("bidsphere_auctions");
  localStorage.removeItem("bidsphere_user");
  localStorage.removeItem("bidsphere_users_base");
  initializeStore();
  return true;
}

// Indicator element update helper
function updateBackendIndicator(active) {
  const el = document.getElementById("backend-status-badge");
  if (el) {
    if (active) {
      el.className = "status-badge badge-active";
      el.innerHTML = '<span class="status-dot green"></span> Live Server';
    } else {
      el.className = "status-badge badge-fallback";
      el.innerHTML = '<span class="status-dot orange"></span> Offline (Demo Mode)';
    }
  }
}

// Auto-run bootstrap initializers
initializeStore();
checkBackendActive();
// Periodically check server
setInterval(checkBackendActive, 8000);

// ===================================================
// ADMIN API WRAPPER METHODS
// ===================================================

async function getPendingAuctions() {
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/admin/pending`);
      if (res.ok) {
        const data = await res.json();
        return data.map(mapBackendAuction);
      }
    } catch (e) {
      isBackendActive = false;
      updateBackendIndicator(false);
    }
  }
  return getLocalAuctions().filter(a => a.status === "pending");
}

async function approveAuctionAPI(auctionId) {
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/admin/auctions/${auctionId}/approve`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        await getAuctions(); // Sync
        return { success: true, item: mapBackendAuction(data) };
      }
      const err = await res.json();
      return { success: false, message: err.detail || "Failed to approve." };
    } catch (e) {
      return { success: false, message: "Backend server connection error." };
    }
  }
  
  // Offline Fallback
  const auctions = getLocalAuctions();
  const idx = auctions.findIndex(a => a.id === auctionId);
  if (idx !== -1) {
    auctions[idx].status = "active";
    auctions[idx].endsAt = Date.now() + (auctions[idx].durationHours || 24) * 60 * 60 * 1000;
    saveLocalAuctions(auctions);
    return { success: true, item: auctions[idx] };
  }
  return { success: false, message: "Listing not found." };
}

async function rejectAuctionAPI(auctionId) {
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/admin/auctions/${auctionId}/reject`, {
        method: "POST"
      });
      if (res.ok) {
        await getAuctions(); // Sync
        return { success: true };
      }
      const err = await res.json();
      return { success: false, message: err.detail || "Failed to reject." };
    } catch (e) {
      return { success: false, message: "Backend server connection error." };
    }
  }
  
  // Offline Fallback
  const auctions = getLocalAuctions();
  const filtered = auctions.filter(a => a.id !== auctionId);
  saveLocalAuctions(filtered);
  return { success: true };
}

async function deleteAuctionAPI(auctionId) {
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/admin/auctions/${auctionId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await getAuctions(); // Sync
        return { success: true };
      }
      const err = await res.json();
      return { success: false, message: err.detail || "Failed to delete listing." };
    } catch (e) {
      return { success: false, message: "Backend server connection error." };
    }
  }
  
  // Offline Fallback
  const auctions = getLocalAuctions();
  const filtered = auctions.filter(a => a.id !== auctionId);
  saveLocalAuctions(filtered);
  return { success: true };
}

async function getPayments() {
  if (!currentUsername) return [];
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/payments?username=${currentUsername}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // fallback
    }
  }
  
  // Local fallback
  const localPay = getLocalPayments();
  if (currentUsername === "admin") {
    return localPay;
  }
  return localPay.filter(p => p.username === currentUsername);
}

async function getDeliveries() {
  if (!currentUsername) return [];
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/deliveries?username=${currentUsername}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // fallback
    }
  }
  
  // Local fallback
  const localDel = getLocalDeliveries();
  if (currentUsername === "admin") {
    return localDel;
  }
  return localDel.filter(d => d.buyer === currentUsername || d.seller === currentUsername);
}

async function updateDeliveryStatusAPI(deliveryId, status) {
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/admin/deliveries/${deliveryId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delivery_status: status })
      });
      if (res.ok) {
        return { success: true, delivery: await res.json() };
      }
      const err = await res.json();
      return { success: false, message: err.detail || "Failed to update status." };
    } catch (e) {
      return { success: false, message: "Backend server connection error." };
    }
  }
  
  // Local fallback
  const deliveries = getLocalDeliveries();
  const idx = deliveries.findIndex(d => d.id === parseInt(deliveryId) || d.id === deliveryId);
  if (idx !== -1) {
    deliveries[idx].delivery_status = status;
    deliveries[idx].last_updated = new Date().toISOString();
    saveLocalDeliveries(deliveries);
    return { success: true, delivery: deliveries[idx] };
  }
  return { success: false, message: "Delivery record not found." };
}
