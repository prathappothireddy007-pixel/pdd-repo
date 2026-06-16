// BidSphere - Shared State & Backend Integration

const API_BASE = "http://localhost:8000/api";
let isBackendActive = false;
let currentUsername = "BidMaster_X"; // Default current logged-in user

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
  itemsBidOn: ["auc-1", "auc-2", "auc-4"], // Track list of IDs the user bid on
  itemsSold: []
};

// Local storage fallback helpers
function getLocalAuctions() {
  return JSON.parse(localStorage.getItem("bidsphere_auctions")) || DEFAULT_AUCTIONS;
}

function saveLocalAuctions(auctions) {
  localStorage.setItem("bidsphere_auctions", JSON.stringify(auctions));
}

function getLocalUserProfile() {
  return JSON.parse(localStorage.getItem("bidsphere_user")) || DEFAULT_USER_PROFILE;
}

function saveLocalUserProfile(user) {
  localStorage.setItem("bidsphere_user", JSON.stringify(user));
}

function initializeStore() {
  if (!localStorage.getItem("bidsphere_auctions")) {
    localStorage.setItem("bidsphere_auctions", JSON.stringify(DEFAULT_AUCTIONS));
  }
  if (!localStorage.getItem("bidsphere_user")) {
    localStorage.setItem("bidsphere_user", JSON.stringify(DEFAULT_USER_PROFILE));
  }
}

// Check if Python FastAPI server is running
async function checkBackendActive() {
  try {
    const res = await fetch(`${API_BASE}/user/${currentUsername}`, { method: 'GET' });
    if (res.ok) {
      isBackendActive = true;
      // Sync local user profile cache
      const serverUser = await res.json();
      const mappedUser = {
        username: serverUser.username,
        email: serverUser.email,
        walletBalance: serverUser.wallet_balance,
        itemsWon: serverUser.items_won,
        itemsBidOn: serverUser.items_bid_on,
        itemsSold: serverUser.items_sold
      };
      saveLocalUserProfile(mappedUser);
      updateBackendIndicator(true);
      return true;
    }
  } catch (e) {
    // Fail silently, fall back to local storage
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
  return getLocalAuctions();
}

async function getUserProfile() {
  if (isBackendActive) {
    try {
      const res = await fetch(`${API_BASE}/user/${currentUsername}`);
      if (res.ok) {
        const serverUser = await res.json();
        const mappedUser = {
          username: serverUser.username,
          email: serverUser.email,
          walletBalance: serverUser.wallet_balance,
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
  return getLocalUserProfile();
}

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
        // Refresh local cache by re-fetching all auctions
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
  const user = getLocalUserProfile();
  
  const minIncrement = 5;
  const minAllowed = item.bids.length > 0 ? (item.currentBid + minIncrement) : item.startingBid;
  if (amount < minAllowed) return { success: false, message: `Bid must be at least $${minAllowed}` };
  if (user.walletBalance < amount) return { success: false, message: "Insufficient wallet balance." };
  
  // Apply local bid
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
  const user = getLocalUserProfile();
  
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
      // ignore and reset locally
    }
  }
  localStorage.removeItem("bidsphere_auctions");
  localStorage.removeItem("bidsphere_user");
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
