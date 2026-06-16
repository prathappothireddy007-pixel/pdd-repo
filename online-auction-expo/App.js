import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView, 
  StatusBar,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

// ----------------------------------------------------
// DEFAULT INITIAL MOCK DATA
// ----------------------------------------------------
const INITIAL_AUCTIONS = [
  {
    id: "auc-1",
    title: "Apex-X Cyberpunk Keyboard",
    description: "Handcrafted 75% mechanical keyboard featuring customized hot-swappable tactile switches, dynamic neon RGB underglow, custom resin cyberpunk keycaps, and a solid CNC-milled aluminum case with clear polycarbonate bottom.",
    category: "Electronics",
    startingBid: 150,
    buyNowPrice: 350,
    currentBid: 195,
    seller: "NeonCustoms",
    endsAt: Date.now() + (3.5 * 60 * 60 * 1000), 
    bgColor: "#2b1055",
    icon: "⌨️",
    status: "active",
    bids: [
      { bidder: "ShiftKey99", amount: 150, timestamp: "2026-06-15T08:00:00Z" },
      { bidder: "CyberRider", amount: 175, timestamp: "2026-06-15T08:30:00Z" },
      { bidder: "ShiftKey99", amount: 195, timestamp: "2026-06-15T09:00:00Z" }
    ]
  },
  {
    id: "auc-2",
    title: "Chrono-Classic Vintage Watch",
    description: "Restored 1984 GMT wristwatch. Stainless steel case, dual-timezone bezel, original matte black dial with tritium markers, and authentic leather strap.",
    category: "Fashion & Luxury",
    startingBid: 1200,
    buyNowPrice: 2200,
    currentBid: 1450,
    seller: "LegacyTimepieces",
    endsAt: Date.now() + (8 * 60 * 60 * 1000), 
    bgColor: "#1f4037",
    icon: "⌚",
    status: "active",
    bids: [
      { bidder: "AeroCollector", amount: 1200, timestamp: "2026-06-15T07:15:00Z" },
      { bidder: "TimeLord", amount: 1350, timestamp: "2026-06-15T08:05:00Z" },
      { bidder: "AeroCollector", amount: 1450, timestamp: "2026-06-15T08:50:00Z" }
    ]
  },
  {
    id: "auc-3",
    title: "SynthWave Holographic Sneakers",
    description: "Limited-run designer sneakers featuring light-responsive holographic panels, smart mesh lining, self-lacing technology interface, and dynamic LED accents.",
    category: "Fashion & Luxury",
    startingBid: 400,
    buyNowPrice: 850,
    currentBid: 400,
    seller: "SoleSynth",
    endsAt: Date.now() + (1.2 * 60 * 60 * 1000), 
    bgColor: "#f857a6",
    icon: "👟",
    status: "active",
    bids: []
  },
  {
    id: "auc-4",
    title: "RetroStation 95 - Modded Console",
    description: "Fully customized vintage home console updated for modern HDMI outputs. Translucent crystal-blue casing, pre-loaded custom emulator firmware, and wireless controllers.",
    category: "Gaming & Entertainment",
    startingBid: 250,
    buyNowPrice: 490,
    currentBid: 320,
    seller: "PixelNostalgia",
    endsAt: Date.now() + (18 * 60 * 60 * 1000), 
    bgColor: "#0f2027",
    icon: "🎮",
    status: "active",
    bids: [
      { bidder: "MarioBros85", amount: 250, timestamp: "2026-06-15T05:00:00Z" },
      { bidder: "SegaFanatic", amount: 290, timestamp: "2026-06-15T06:10:00Z" },
      { bidder: "MarioBros85", amount: 320, timestamp: "2026-06-15T07:30:00Z" }
    ]
  },
  {
    id: "auc-5",
    title: "Elysium Citadel Concept Art",
    description: "High-resolution digital illustration showcasing a soaring utopian metropolis among clouds. Winner receives ownership certificate and source project files.",
    category: "Art & Collectibles",
    startingBid: 500,
    buyNowPrice: 1200,
    currentBid: 780,
    seller: "VaporVector",
    endsAt: Date.now() + (22.5 * 60 * 60 * 1000), 
    bgColor: "#fc00ff",
    icon: "🎨",
    status: "active",
    bids: [
      { bidder: "GalleryDirector", amount: 500, timestamp: "2026-06-15T03:00:00Z" },
      { bidder: "CryptoCurator", amount: 650, timestamp: "2026-06-15T04:30:00Z" },
      { bidder: "GalleryDirector", amount: 720, timestamp: "2026-06-15T06:00:00Z" },
      { bidder: "CryptoCurator", amount: 780, timestamp: "2026-06-15T07:15:00Z" }
    ]
  }
];

const CATEGORIES = ["All", "Electronics", "Fashion & Luxury", "Gaming & Entertainment", "Art & Collectibles"];

const THEME_PRESETS = [
  { color: "#2b1055", icon: "⌨️" },
  { color: "#1f4037", icon: "⌚" },
  { color: "#f857a6", icon: "👟" },
  { color: "#0f2027", icon: "🎮" },
  { color: "#fc00ff", icon: "🎨" }
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'sell' | 'profile'
  const [activeDetailId, setActiveDetailId] = useState(null);

  // Core App States
  const [auctions, setAuctions] = useState(INITIAL_AUCTIONS);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // User Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    username: "Guest",
    email: "guest@bidsphere.io",
    walletBalance: 0,
    role: "user",
    itemsWon: [],
    itemsBidOn: [],
    itemsSold: []
  });

  // Auth Forms State
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Payment Form State
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('500');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sell Page States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Electronics');
  const [newDuration, setNewDuration] = useState('24');
  const [newStartingBid, setNewStartingBid] = useState('');
  const [newBuyNow, setNewBuyNow] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(THEME_PRESETS[0]);

  // Detail Page Bid Input
  const [bidAmountInput, setBidAmountInput] = useState('');

  // Profile Tab History Selection
  const [activeProfileTab, setActiveProfileTab] = useState('bids'); // 'bids' | 'won' | 'listed'

  // Custom Toast Banner Notification State
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info'); // 'info' | 'success' | 'error'

  // Backend Integration States
  const [serverIp, setServerIp] = useState(''); // E.g., "192.168.1.15" or empty
  const [isOnline, setIsOnline] = useState(false);

  // Get current backend base URL
  const getBackendUrl = () => {
    if (!serverIp.trim()) return null;
    let ip = serverIp.trim();
    if (!ip.startsWith('http://') && !ip.startsWith('https://')) {
      ip = 'http://' + ip;
    }
    if (!ip.includes(':8000') && !ip.includes(':80')) {
      if (ip.endsWith('/')) ip = ip.slice(0, -1);
      ip = ip + ':8000';
    }
    return ip + '/api';
  };

  // Helper function to dispatch alerts/toasts
  const triggerToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Format Time Remaining Helper
  const getTimerStr = (endsAt) => {
    const diff = endsAt - currentTime;
    if (diff <= 0) return "Ended";
    
    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    let timeStr = "";
    if (days > 0) timeStr += `${days}d `;
    timeStr += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return timeStr;
  };

  // Format Currency Helper
  const formatCurrency = (val) => {
    return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Map backend JSON to camelCase format
  const mapServerAuction = (a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    category: a.category,
    startingBid: a.starting_bid,
    buyNowPrice: a.buy_now_price,
    currentBid: a.current_bid,
    seller: a.seller,
    endsAt: a.ends_at,
    bgColor: a.bg_color,
    icon: mapIconName(a.icon),
    status: a.status,
    bids: (a.bids || []).map(b => ({
      bidder: b.bidder,
      amount: b.amount,
      timestamp: b.timestamp
    }))
  });

  const mapIconName = (name) => {
    switch (name) {
      case 'keyboard': return '⌨️';
      case 'watch': return '⌚';
      case 'shoe': return '👟';
      case 'gamepad': return '🎮';
      case 'image': return '🎨';
      default: return name;
    }
  };

  const getIconName = (emoji) => {
    switch (emoji) {
      case '⌨️': return 'keyboard';
      case '⌚': return 'watch';
      case '👟': return 'shoe';
      case '🎮': return 'gamepad';
      case '🎨': return 'image';
      default: return 'box';
    }
  };

  // Sync data from Server helper
  const fetchFromServer = async (url) => {
    if (!isLoggedIn) return false;
    try {
      const uRes = await fetch(`${url}/user/${user.username}`);
      const aRes = await fetch(`${url}/auctions`);
      if (uRes.ok && aRes.ok) {
        const uData = await uRes.json();
        const aData = await aRes.json();
        
        setUser({
          username: uData.username,
          email: uData.email,
          walletBalance: uData.wallet_balance,
          role: uData.role || "user",
          itemsWon: uData.items_won,
          itemsBidOn: uData.items_bid_on,
          itemsSold: uData.items_sold
        });
        
        setAuctions(aData.map(mapServerAuction));
        setIsOnline(true);
        return true;
      }
    } catch (e) {
      // Fail silently
    }
    setIsOnline(false);
    return false;
  };

  // Try connecting to input server IP
  const handleConnectPress = async () => {
    const url = getBackendUrl();
    if (!url) {
      setIsOnline(false);
      triggerToast("Please enter a valid IP address.", "error");
      return;
    }

    triggerToast("Connecting to backend...", "info");
    const ok = await fetchFromServer(url);
    if (ok) {
      triggerToast("Connected successfully to Live Database!", "success");
    } else {
      triggerToast("Failed to connect. Make sure your Python server is running.", "error");
    }
  };

  // Periodic server polling effect
  useEffect(() => {
    if (!isOnline || !isLoggedIn) return;
    const url = getBackendUrl();
    if (!url) return;

    const interval = setInterval(() => {
      fetchFromServer(url);
    }, 5000);

    return () => clearInterval(interval);
  }, [isOnline, serverIp, isLoggedIn]);

  // 1-Second Timer Ticker Engine
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // Only settle finished auctions locally if Offline
      if (!isOnline && isLoggedIn) {
        setAuctions(prevAuctions => {
          let stateChanged = false;
          const updated = prevAuctions.map(item => {
            if (item.status === 'active' && item.endsAt <= now) {
              stateChanged = true;
              const updatedItem = { ...item, status: 'ended' };
              
              // Check winning bid
              if (item.bids.length > 0) {
                const winningBid = item.bids[item.bids.length - 1];
                
                if (winningBid.bidder === user.username) {
                  setUser(prevUser => {
                    const itemsWon = [...prevUser.itemsWon, item.id];
                    const walletBalance = prevUser.walletBalance - winningBid.amount;
                    return { ...prevUser, itemsWon, walletBalance };
                  });
                  triggerToast(`🎉 You won the auction for "${item.title}" for ${formatCurrency(winningBid.amount)}!`, 'success');
                } else if (item.seller === user.username) {
                  setUser(prevUser => {
                    const itemsSold = [...prevUser.itemsSold, item.id];
                    const walletBalance = prevUser.walletBalance + winningBid.amount;
                    return { ...prevUser, itemsSold, walletBalance };
                  });
                  triggerToast(`💰 Your listed item "${item.title}" was sold for ${formatCurrency(winningBid.amount)}!`, 'success');
                }
              } else {
                if (item.seller === user.username) {
                  triggerToast(`⚠️ Your listing "${item.title}" has closed with no bids.`, 'info');
                }
              }
              return updatedItem;
            }
            return item;
          });

          return stateChanged ? updated : prevAuctions;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user.username, isOnline, isLoggedIn]);

  // ----------------------------------------------------
  // BUSINESS TRANSACTIONS
  // ----------------------------------------------------
  
  // 1. Submit Bid
  const handlePlaceBid = async (itemId) => {
    if (!isLoggedIn) {
      Alert.alert("Authentication Required", "Please sign in or register to place bids.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => { setActiveDetailId(null); setActiveTab('profile'); } }
      ]);
      return;
    }

    const amount = parseFloat(bidAmountInput);
    if (isNaN(amount) || amount <= 0) {
      triggerToast("Please enter a valid bid amount.", "error");
      return;
    }

    const item = auctions.find(a => a.id === itemId);
    if (!item) return;

    const minIncrement = 5;
    const minAllowedBid = item.bids.length > 0 ? (item.currentBid + minIncrement) : item.startingBid;

    if (amount < minAllowedBid) {
      triggerToast(`Bid must be at least ${formatCurrency(minAllowedBid)}.`, "error");
      return;
    }

    if (user.walletBalance < amount) {
      triggerToast("Insufficient wallet funds.", "error");
      return;
    }

    // Try live server API call
    const backendUrl = getBackendUrl();
    if (isOnline && backendUrl) {
      try {
        const res = await fetch(`${backendUrl}/auctions/${itemId}/bid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bidder: user.username, amount })
        });
        if (res.ok) {
          triggerToast(`Bid of ${formatCurrency(amount)} placed successfully!`, "success");
          setBidAmountInput('');
          await fetchFromServer(backendUrl);
          return;
        } else {
          const err = await res.json();
          triggerToast(err.detail || "Bid rejected.", "error");
          return;
        }
      } catch (e) {
        triggerToast("Connection failed to server.", "error");
        return;
      }
    }

    // Fallback: local auction state update
    const newBidLog = {
      bidder: user.username,
      amount: amount,
      timestamp: new Date().toISOString()
    };

    setAuctions(prev => prev.map(a => {
      if (a.id === itemId) {
        return {
          ...a,
          currentBid: amount,
          bids: [...a.bids, newBidLog]
        };
      }
      return a;
    }));

    setUser(prev => {
      const itemsBidOn = prev.itemsBidOn.includes(itemId) 
        ? prev.itemsBidOn 
        : [...prev.itemsBidOn, itemId];
      return { ...prev, itemsBidOn };
    });

    triggerToast(`Bid of ${formatCurrency(amount)} placed successfully!`, "success");
    setBidAmountInput('');
  };

  // 2. Buy Out Outright
  const handleBuyOut = async (itemId) => {
    if (!isLoggedIn) {
      Alert.alert("Authentication Required", "Please sign in or register to buy items outright.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => { setActiveDetailId(null); setActiveTab('profile'); } }
      ]);
      return;
    }

    const item = auctions.find(a => a.id === itemId);
    if (!item || !item.buyNowPrice) return;

    if (user.walletBalance < item.buyNowPrice) {
      triggerToast("Insufficient wallet funds for buyout.", "error");
      return;
    }

    // Try live server API call
    const backendUrl = getBackendUrl();
    if (isOnline && backendUrl) {
      try {
        const res = await fetch(`${backendUrl}/auctions/${itemId}/buyout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bidder: user.username })
        });
        if (res.ok) {
          triggerToast(`Purchased "${item.title}" outright!`, "success");
          setActiveDetailId(null);
          await fetchFromServer(backendUrl);
          setActiveTab('profile');
          setActiveProfileTab('won');
          return;
        } else {
          const err = await res.json();
          triggerToast(err.detail || "Buyout failed.", "error");
          return;
        }
      } catch (e) {
        triggerToast("Connection failed to server.", "error");
        return;
      }
    }

    // Fallback: local buyout
    const buyoutBid = {
      bidder: user.username,
      amount: item.buyNowPrice,
      timestamp: new Date().toISOString()
    };

    setAuctions(prev => prev.map(a => {
      if (a.id === itemId) {
        return {
          ...a,
          status: 'sold',
          endsAt: Date.now(),
          currentBid: item.buyNowPrice,
          bids: [...a.bids, buyoutBid]
        };
      }
      return a;
    }));

    setUser(prev => {
      const itemsWon = [...prev.itemsWon, itemId];
      const walletBalance = prev.walletBalance - item.buyNowPrice;
      return { ...prev, itemsWon, walletBalance };
    });

    triggerToast(`Purchased "${item.title}" outright!`, "success");
    setActiveDetailId(null);
    setActiveTab('profile');
    setActiveProfileTab('won');
  };

  // 3. Create Listing Submission
  const handleCreateListing = async () => {
    const startingBid = parseFloat(newStartingBid);
    const duration = parseFloat(newDuration);
    const buyNowPrice = newBuyNow ? parseFloat(newBuyNow) : null;

    if (!newTitle.trim() || !newCategory || isNaN(startingBid) || isNaN(duration)) {
      triggerToast("Please fill all required fields.", "error");
      return;
    }

    if (buyNowPrice !== null && buyNowPrice <= startingBid) {
      triggerToast("Buy now price must exceed starting bid.", "error");
      return;
    }

    // Try live server API call
    const backendUrl = getBackendUrl();
    const mappedIcon = selectedTheme.icon === '⌨️' ? 'keyboard' : (selectedTheme.icon === '⌚' ? 'watch' : (selectedTheme.icon === '👟' ? 'shoe' : (selectedTheme.icon === '🎮' ? 'gamepad' : 'image')));
    
    if (isOnline && backendUrl) {
      try {
        const res = await fetch(`${backendUrl}/auctions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newTitle.trim(),
            description: newDescription.trim() || "No description provided.",
            category: newCategory,
            starting_bid: startingBid,
            buy_now_price: buyNowPrice,
            duration_hours: duration,
            bg_color: selectedTheme.color,
            icon: mappedIcon,
            seller: user.username
          })
        });
        if (res.ok) {
          const data = await res.json();
          const isPending = data.status === 'pending';
          if (isPending) {
            triggerToast("Listing submitted successfully! Awaiting Admin approval.", "success");
          } else {
            triggerToast("Listing published to marketplace!", "success");
          }
          // Reset Form
          setNewTitle('');
          setNewStartingBid('');
          setNewBuyNow('');
          setNewDescription('');
          setNewDuration('24');
          
          await fetchFromServer(backendUrl);
          setActiveTab(isPending ? 'profile' : 'home');
          return;
        } else {
          const err = await res.json();
          triggerToast(err.detail || "Listing rejected.", "error");
          return;
        }
      } catch (e) {
        triggerToast("Connection failed to server.", "error");
        return;
      }
    }

    // Fallback: local add
    const isPending = user.role !== 'admin';
    const newAuctionItem = {
      id: `auc-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || "No description provided.",
      category: newCategory,
      startingBid: startingBid,
      buyNowPrice: buyNowPrice,
      currentBid: startingBid,
      seller: user.username,
      endsAt: isPending ? 0 : Date.now() + (duration * 60 * 60 * 1000),
      durationHours: duration,
      bgColor: selectedTheme.color,
      icon: selectedTheme.icon,
      status: isPending ? "pending" : "active",
      bids: []
    };

    setAuctions(prev => [newAuctionItem, ...prev]);

    // Update seller listings locally
    setUser(prev => ({
      ...prev,
      itemsSold: [...prev.itemsSold, newAuctionItem.id]
    }));

    // Reset Form
    setNewTitle('');
    setNewStartingBid('');
    setNewBuyNow('');
    setNewDescription('');
    setNewDuration('24');

    if (isPending) {
      triggerToast("Listing submitted locally! Awaiting Admin approval.", "success");
      setActiveTab('profile');
    } else {
      triggerToast("Listing published locally!", "success");
      setActiveTab('home');
    }
  };

  // ===================================================
  // USER ACCOUNT AUTHENTICATION SUBMIT HANDLERS
  // ===================================================

  const handleAuthSubmit = async () => {
    const username = usernameInput.trim();
    const email = emailInput.trim();
    const password = passwordInput;

    if (!username || !password) {
      triggerToast("Username and password are required.", "error");
      return;
    }

    const backendUrl = getBackendUrl();

    if (authTab === 'login') {
      triggerToast("Verifying credentials...", "info");
      
      if (isOnline && backendUrl) {
        try {
          const res = await fetch(`${backendUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          if (res.ok) {
            const uData = await res.json();
            setUser({
              username: uData.username,
              email: uData.email,
              walletBalance: uData.wallet_balance,
              role: uData.role || "user",
              itemsWon: uData.items_won,
              itemsBidOn: uData.items_bid_on,
              itemsSold: uData.items_sold
            });
            setIsLoggedIn(true);
            triggerToast(`Welcome back, @${username}!`, "success");
            
            // Clean forms
            setUsernameInput('');
            setPasswordInput('');
            // Sync Auctions list
            await fetchFromServer(backendUrl);
          } else {
            const err = await res.json();
            triggerToast(err.detail || "Invalid login credentials.", "error");
          }
        } catch (e) {
          triggerToast("Connection failed to server.", "error");
        }
      } else {
        // Offline demo account login (auto-create if doesn't exist)
        setUser({
          username: username,
          email: `${username.toLowerCase()}@bidsphere.io`,
          walletBalance: 2500,
          role: (username.toLowerCase().includes("admin") || username === "admin") ? "admin" : "user",
          itemsWon: [],
          itemsBidOn: [],
          itemsSold: []
        });
        setIsLoggedIn(true);
        triggerToast(`Signed in offline as @${username}!`, "success");
        setUsernameInput('');
        setPasswordInput('');
      }
    } else {
      // REGISTER
      if (!email) {
        triggerToast("Email is required for registration.", "error");
        return;
      }
      if (password.length < 6) {
        triggerToast("Password must be at least 6 char.", "error");
        return;
      }

      triggerToast("Registering account...", "info");
      
      if (isOnline && backendUrl) {
        try {
          const res = await fetch(`${backendUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
          });
          if (res.ok) {
            const uData = await res.json();
            setUser({
              username: uData.username,
              email: uData.email,
              walletBalance: uData.wallet_balance,
              role: uData.role || "user",
              itemsWon: uData.items_won,
              itemsBidOn: uData.items_bid_on,
              itemsSold: uData.items_sold
            });
            setIsLoggedIn(true);
            triggerToast(`Registration complete! Welcome, @${username}!`, "success");
            
            setUsernameInput('');
            setEmailInput('');
            setPasswordInput('');
            await fetchFromServer(backendUrl);
          } else {
            const err = await res.json();
            triggerToast(err.detail || "Registration failed.", "error");
          }
        } catch (e) {
          triggerToast("Connection failed to server.", "error");
        }
      } else {
        // Offline registration
        setUser({
          username: username,
          email: email,
          walletBalance: 2500.0,
          role: (username.toLowerCase().includes("admin") || username === "admin") ? "admin" : "user",
          itemsWon: [],
          itemsBidOn: [],
          itemsSold: []
        });
        setIsLoggedIn(true);
        triggerToast(`Registered offline as @${username}!`, "success");
        setUsernameInput('');
        setEmailInput('');
        setPasswordInput('');
      }
    }
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUser({
      username: "Guest",
      email: "guest@bidsphere.io",
      walletBalance: 0,
      role: "user",
      itemsWon: [],
      itemsBidOn: [],
      itemsSold: []
    });
    triggerToast("Signed out successfully.", "info");
    setActiveTab('home');
  };

  // ===================================================
  // WALLET PAYMENT TOP-UP HANDLER
  // ===================================================

  const handleTopUpSubmit = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      triggerToast("Please enter a valid amount.", "error");
      return;
    }

    if (!cardHolder.trim() || cardNumber.length < 16 || cardExpiry.length < 5 || cardCvv.length < 3) {
      triggerToast("Please fill all payment fields correctly.", "error");
      return;
    }

    triggerToast("Processing simulated payment...", "info");

    const backendUrl = getBackendUrl();
    if (isOnline && backendUrl) {
      try {
        const res = await fetch(`${backendUrl}/user/${user.username}/topup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            card_number: cardNumber,
            expiry: cardExpiry,
            cvv: cardCvv
          })
        });
        if (res.ok) {
          triggerToast(`Success! Credited ${formatCurrency(amount)} to wallet.`, "success");
          // Clear payment inputs
          setCardHolder('');
          setCardNumber('');
          setCardExpiry('');
          setCardCvv('');
          
          await fetchFromServer(backendUrl);
          return;
        } else {
          const err = await res.json();
          triggerToast(err.detail || "Simulated payment failed.", "error");
          return;
        }
      } catch (e) {
        triggerToast("Payment connection failure.", "error");
        return;
      }
    }

    // Offline Top Up
    setUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + amount
    }));
    triggerToast(`Success! Mock Refilled wallet by ${formatCurrency(amount)}.`, "success");
    setCardHolder('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
  };

  // ----------------------------------------------------
  // SCENE RENDER LOGIC
  // ----------------------------------------------------

  // 1. Dashboard View
  const renderDashboardScreen = () => {
    const filteredAuctions = auctions.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const isNotPending = item.status !== 'pending';
      return matchSearch && matchCat && isNotPending;
    });

    return (
      <View style={styles.tabContent}>
        {/* Hero banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>BidSphere Mobile</Text>
          <Text style={styles.heroSubtitle}>Bid on premium modded electronics, watch edits & luxury art.</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search active auctions..."
            placeholderTextColor="#6b6675"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories scroll bar */}
        <View style={{ marginBottom: 15 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.categoryPill, selectedCategory === cat && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Listings Scroll */}
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {filteredAuctions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No Active Auctions Found</Text>
            </View>
          ) : (
            filteredAuctions.map(item => {
              const isLive = item.status === 'active' && item.endsAt > currentTime;
              const timerStr = getTimerStr(item.endsAt);
              
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => setActiveDetailId(item.id)}
                >
                  {/* Card Banner */}
                  <View style={[styles.cardBanner, { backgroundColor: item.bgColor }]}>
                    <Text style={styles.cardIcon}>{item.icon}</Text>
                    <View style={[styles.timerBadge, !isLive && styles.timerBadgeEnded]}>
                      <Text style={styles.timerBadgeText}>⏱️ {timerStr}</Text>
                    </View>
                  </View>

                  {/* Card Info */}
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardCategory}>{item.category}</Text>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                    
                    <View style={styles.cardFooterDivider} />
                    
                    <View style={styles.cardFooterRow}>
                      <View>
                        <Text style={styles.priceLabel}>Current Bid</Text>
                        <Text style={styles.priceVal}>{formatCurrency(item.currentBid)}</Text>
                      </View>
                      {item.buyNowPrice && (
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.priceLabel}>Buy Out</Text>
                          <Text style={[styles.priceVal, { color: '#ffd000' }]}>{formatCurrency(item.buyNowPrice)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    );
  };

  // 2. Detail Screen (Overlay)
  const renderDetailScreen = () => {
    const item = auctions.find(a => a.id === activeDetailId);
    if (!item) return null;

    const isLive = item.status === 'active' && item.endsAt > currentTime;
    const minIncrement = 5;
    const minAllowedBid = item.bids.length > 0 ? (item.currentBid + minIncrement) : item.startingBid;
    const isSeller = isLoggedIn && item.seller === user.username;

    const sortedBids = [...item.bids].reverse();

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.detailHeaderBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => { setActiveDetailId(null); setBidAmountInput(''); }}>
            <Text style={styles.backBtnText}>⬅ Back</Text>
          </TouchableOpacity>
          <Text style={styles.detailBarTitle}>Auction Details</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.detailScrollContent}>
          {/* Main Visual */}
          <View style={[styles.detailGallery, { backgroundColor: item.bgColor }]}>
            <Text style={styles.detailGalleryIcon}>{item.icon}</Text>
            <View style={styles.detailTimerPill}>
              <Text style={styles.detailTimerText}>⏱️ {getTimerStr(item.endsAt)}</Text>
            </View>
          </View>

          {/* Details Container */}
          <View style={styles.detailContainer}>
            <Text style={styles.detailCategory}>{item.category}</Text>
            <Text style={styles.detailTitle}>{item.title}</Text>
            <Text style={styles.detailSeller}>Listed by @{item.seller}</Text>
            
            <Text style={styles.detailDesc}>{item.description}</Text>

            {/* Transaction Controls */}
            <View style={styles.detailControlCard}>
              <View style={styles.priceDisplayRow}>
                <View>
                  <Text style={styles.detailPriceLabel}>{isLive ? "Highest Bid" : "Settled Price"}</Text>
                  <Text style={styles.detailPriceValue}>{formatCurrency(item.currentBid)}</Text>
                </View>
                {item.buyNowPrice && (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.detailPriceLabel, { color: '#ffd000' }]}>Buyout Price</Text>
                    <Text style={[styles.detailPriceValue, { color: '#ffd000' }]}>{formatCurrency(item.buyNowPrice)}</Text>
                  </View>
                )}
              </View>

              {isLive ? (
                isSeller ? (
                  <Text style={styles.sellerWarning}>You listed this item. Placing bids is disabled.</Text>
                ) : (
                  <View style={{ marginTop: 15 }}>
                    <Text style={styles.inputBidLabel}>Enter Bid (Min. {formatCurrency(minAllowedBid)})</Text>
                    <View style={styles.bidInputWrapper}>
                      <TextInput
                        style={styles.bidTextInput}
                        keyboardType="numeric"
                        placeholder={`${minAllowedBid}`}
                        placeholderTextColor="#6b6675"
                        value={bidAmountInput}
                        onChangeText={setBidAmountInput}
                      />
                      <TouchableOpacity style={styles.bidButton} onPress={() => handlePlaceBid(item.id)}>
                        <Text style={styles.bidButtonText}>Place Bid</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {item.buyNowPrice && (
                      <TouchableOpacity style={styles.buyoutBtn} onPress={() => handleBuyOut(item.id)}>
                        <Text style={styles.buyoutBtnText}>⚡ Buy Out Outright</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )
              ) : (
                <Text style={styles.endedWarning}>This auction has officially closed.</Text>
              )}
            </View>

            {/* Bidding Log */}
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>Bid History ({item.bids.length} bids)</Text>
              {sortedBids.length === 0 ? (
                <Text style={styles.emptyHistory}>No bids placed yet.</Text>
              ) : (
                sortedBids.map((bid, index) => (
                  <View key={index} style={[styles.historyRow, index === 0 && styles.historyRowHighest]}>
                    <View>
                      <Text style={styles.historyBidder}>
                        {bid.bidder} {isLoggedIn && bid.bidder === user.username && "(You)"}
                      </Text>
                      <Text style={styles.historyTime}>{new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <Text style={[styles.historyAmount, index === 0 && { color: '#39ff14' }]}>{formatCurrency(bid.amount)}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // 3. Sell Screen (Protected)
  const renderSellScreen = () => {
    if (!isLoggedIn) {
      return renderAuthScreen();
    }

    return (
      <ScrollView contentContainerStyle={styles.tabContentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.formHeadline}>Launch Your Listing</Text>
          <Text style={styles.formSubHeadline}>Setup starting bids and optional instant buyouts for the marketplace.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Vintage Mechanical Keyboard"
              placeholderTextColor="#6b6675"
              value={newTitle}
              onChangeText={setNewTitle}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 40, marginTop: 5 }}>
                {CATEGORIES.slice(1).map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryPickerPill, newCategory === cat && styles.categoryPickerPillActive]}
                    onPress={() => setNewCategory(cat)}
                  >
                    <Text style={[styles.categoryPickerText, newCategory === cat && styles.categoryPickerTextActive]}>{cat.split(" ")[0]}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={[styles.inputGroup, { width: 100 }]}>
              <Text style={styles.label}>Duration (Hrs)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={newDuration}
                onChangeText={setNewDuration}
              />
            </View>
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Starting Bid ($)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="50"
                placeholderTextColor="#6b6675"
                value={newStartingBid}
                onChangeText={setNewStartingBid}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Buy Out Price (Optional)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="150"
                placeholderTextColor="#6b6675"
                value={newBuyNow}
                onChangeText={setNewBuyNow}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              placeholder="Describe condition, authenticity, custom mods..."
              placeholderTextColor="#6b6675"
              value={newDescription}
              onChangeText={setNewDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item Visual Theme Color</Text>
            <View style={styles.themeRow}>
              {THEME_PRESETS.map((preset, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.themeButton, 
                    { backgroundColor: preset.color },
                    selectedTheme.color === preset.color && styles.themeButtonSelected
                  ]}
                  onPress={() => setSelectedTheme(preset)}
                >
                  <Text style={{ fontSize: 22 }}>{preset.icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.publishBtn} onPress={handleCreateListing}>
            <Text style={styles.publishBtnText}>Publish Active Auction</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // 4. Account Authentication Screen (Guest Fallback)
  const renderAuthScreen = () => {
    return (
      <ScrollView contentContainerStyle={styles.tabContentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Auth tabs */}
          <View style={styles.authTabsRow}>
            <TouchableOpacity 
              style={[styles.authTabBtn, authTab === 'login' && styles.authTabBtnActive]} 
              onPress={() => setAuthTab('login')}
            >
              <Text style={[styles.authTabText, authTab === 'login' && styles.authTabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.authTabBtn, authTab === 'register' && styles.authTabBtnActive]} 
              onPress={() => setAuthTab('register')}
            >
              <Text style={[styles.authTabText, authTab === 'register' && styles.authTabTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.formHeadline}>
            {authTab === 'login' ? "Welcome Back" : "Create Account"}
          </Text>
          <Text style={styles.formSubHeadline}>
            {authTab === 'login' 
              ? "Login to bid, buy outright, and list items for sale." 
              : "Register to participate in the real-time cyberpunk auctions."}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. BuyerOne"
              placeholderTextColor="#6b6675"
              value={usernameInput}
              onChangeText={setUsernameInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {authTab === 'register' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. buyer@bidsphere.io"
                placeholderTextColor="#6b6675"
                value={emailInput}
                onChangeText={setEmailInput}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#6b6675"
              value={passwordInput}
              onChangeText={setPasswordInput}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.publishBtn} onPress={handleAuthSubmit}>
            <Text style={styles.publishBtnText}>
              {authTab === 'login' ? "Sign In" : "Register Account"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // 5. Profile Screen
  const renderProfileScreen = () => {
    if (!isLoggedIn) {
      return renderAuthScreen();
    }

    const userListed = auctions.filter(a => a.seller === user.username);
    const userWon = auctions.filter(a => user.itemsWon.includes(a.id));
    const userBidding = auctions.filter(a => user.itemsBidOn.includes(a.id) && a.status === 'active');

    return (
      <View style={styles.tabContent}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* User Card */}
          <View style={styles.profileHeaderCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{user.username.slice(0, 1).toUpperCase()}</Text>
            </View>
            <Text style={styles.profileName}>@{user.username}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Available Balance</Text>
                <Text style={styles.walletBalanceHighlight}>{formatCurrency(user.walletBalance)}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Wins</Text>
                <Text style={styles.statValue}>{user.itemsWon.length}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Listed</Text>
                <Text style={styles.statValue}>{userListed.length}</Text>
              </View>
            </View>
          </View>

          {/* Connection Settings */}
          <View style={styles.connectionCard}>
            <Text style={styles.connectionTitle}>API Connection Manager</Text>
            <Text style={styles.connectionSubtitle}>
              Connect your mobile device to your computer's running Python FastAPI backend.
            </Text>
            <View style={styles.connectionRow}>
              <TextInput
                style={styles.connectionInput}
                placeholder="Computer IP e.g. 192.168.1.5"
                placeholderTextColor="#6b6675"
                value={serverIp}
                onChangeText={setServerIp}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={[styles.connectBtn, isOnline && styles.connectBtnActive]} 
                onPress={handleConnectPress}
              >
                <Text style={styles.connectBtnText}>{isOnline ? "Connected" : "Connect"}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.statusIndicatorDot, { backgroundColor: isOnline ? '#39ff14' : '#ff7f00' }]} />
              <Text style={styles.statusIndicatorText}>
                {isOnline ? `Live Database (${serverIp})` : "Local Offline Demo Mode"}
              </Text>
            </View>
          </View>

          {/* Payment Card / Wallet Refill */}
          <View style={styles.connectionCard}>
            <Text style={styles.connectionTitle}>Refill Wallet Balance</Text>
            <Text style={styles.connectionSubtitle}>
              Enter card details to simulate adding funds to your account instantly.
            </Text>

            <View style={{ marginTop: 8 }}>
              <TextInput
                style={[styles.connectionInput, { marginBottom: 8, marginRight: 0 }]}
                placeholder="Cardholder Name"
                placeholderTextColor="#6b6675"
                value={cardHolder}
                onChangeText={setCardHolder}
              />
              <TextInput
                style={[styles.connectionInput, { marginBottom: 8, marginRight: 0 }]}
                placeholder="Card Number (16 digits)"
                placeholderTextColor="#6b6675"
                keyboardType="numeric"
                maxLength={16}
                value={cardNumber}
                onChangeText={setCardNumber}
              />
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                <TextInput
                  style={[styles.connectionInput, { flex: 1, marginRight: 8 }]}
                  placeholder="Expiry (MM/YY)"
                  placeholderTextColor="#6b6675"
                  maxLength={5}
                  value={cardExpiry}
                  onChangeText={setCardExpiry}
                />
                <TextInput
                  style={[styles.connectionInput, { width: 90, marginRight: 0 }]}
                  placeholder="CVV"
                  placeholderTextColor="#6b6675"
                  secureTextEntry
                  maxLength={4}
                  keyboardType="numeric"
                  value={cardCvv}
                  onChangeText={setCardCvv}
                />
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <TextInput
                  style={[styles.connectionInput, { width: 120, marginRight: 10 }]}
                  placeholder="Amount ($)"
                  placeholderTextColor="#6b6675"
                  keyboardType="numeric"
                  value={topUpAmount}
                  onChangeText={setTopUpAmount}
                />
                <TouchableOpacity 
                  style={[styles.connectBtn, { flex: 1, backgroundColor: '#ffd000' }]} 
                  onPress={handleTopUpSubmit}
                >
                  <Text style={styles.connectBtnText}>Pay & Refill Wallet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Sub-tabs toggling listing history */}
          <View style={styles.subTabRow}>
            <TouchableOpacity 
              style={[styles.subTabBtn, activeProfileTab === 'bids' && styles.subTabBtnActive]} 
              onPress={() => setActiveProfileTab('bids')}
            >
              <Text style={[styles.subTabText, activeProfileTab === 'bids' && styles.subTabTextActive]}>Active Bids</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.subTabBtn, activeProfileTab === 'won' && styles.subTabBtnActive]} 
              onPress={() => setActiveProfileTab('won')}
            >
              <Text style={[styles.subTabText, activeProfileTab === 'won' && styles.subTabTextActive]}>Wins & Bought</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.subTabBtn, activeProfileTab === 'listed' && styles.subTabBtnActive]} 
              onPress={() => setActiveProfileTab('listed')}
            >
              <Text style={[styles.subTabText, activeProfileTab === 'listed' && styles.subTabTextActive]}>My Listings</Text>
            </TouchableOpacity>
          </View>

          {/* Dynamic history lists */}
          <View>
            {activeProfileTab === 'bids' && (
              userBidding.length === 0 ? (
                <Text style={styles.emptySubTab}>No active bids currently.</Text>
              ) : (
                userBidding.map(item => (
                  <TouchableOpacity key={item.id} style={styles.historyCardItem} onPress={() => setActiveDetailId(item.id)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, marginRight: 10 }}>{item.icon}</Text>
                      <View>
                        <Text style={styles.historyCardTitle}>{item.title}</Text>
                        <Text style={styles.historyCardTimer}>⏱️ {getTimerStr(item.endsAt)} left</Text>
                      </View>
                    </View>
                    <Text style={styles.historyCardPrice}>{formatCurrency(item.currentBid)}</Text>
                  </TouchableOpacity>
                ))
              )
            )}

            {activeProfileTab === 'won' && (
              userWon.length === 0 ? (
                <Text style={styles.emptySubTab}>You haven't won any items yet.</Text>
              ) : (
                userWon.map(item => (
                  <View key={item.id} style={styles.historyCardItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, marginRight: 10 }}>{item.icon}</Text>
                      <View>
                        <Text style={styles.historyCardTitle}>{item.title}</Text>
                        <Text style={styles.historyCardSeller}>Bought from @{item.seller}</Text>
                      </View>
                    </View>
                    <Text style={[styles.historyCardPrice, { color: '#ffd000' }]}>{formatCurrency(item.currentBid)}</Text>
                  </View>
                ))
              )
            )}

            {activeProfileTab === 'listed' && (
              userListed.length === 0 ? (
                <Text style={styles.emptySubTab}>You haven't listed any items.</Text>
              ) : (
                userListed.map(item => (
                  <TouchableOpacity key={item.id} style={styles.historyCardItem} onPress={() => setActiveDetailId(item.id)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, marginRight: 10 }}>{item.icon}</Text>
                      <View>
                        <Text style={styles.historyCardTitle}>{item.title}</Text>
                        <Text style={styles.historyCardSeller}>{item.status === 'active' ? "Active" : "Closed"}</Text>
                      </View>
                    </View>
                    <Text style={styles.historyCardPrice}>{formatCurrency(item.currentBid)}</Text>
                  </TouchableOpacity>
                ))
              )
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={[styles.publishBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ff007f', marginTop: 30 }]} 
            onPress={handleSignOut}
          >
            <Text style={[styles.publishBtnText, { color: '#ff007f' }]}>Sign Out Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // ----------------------------------------------------
  // ADMIN PANEL SCREEN RENDER
  // ----------------------------------------------------
  const renderAdminScreen = () => {
    const pendingItems = auctions.filter(a => a.status === 'pending');
    const activeItems = auctions.filter(a => a.status === 'active');

    const handleApprove = async (itemId) => {
      const backendUrl = getBackendUrl();
      if (isOnline && backendUrl) {
        try {
          const res = await fetch(`${backendUrl}/admin/auctions/${itemId}/approve`, {
            method: 'POST'
          });
          if (res.ok) {
            triggerToast("Listing approved and is now live!", "success");
            await fetchFromServer(backendUrl);
          } else {
            triggerToast("Failed to approve.", "error");
          }
        } catch (e) {
          triggerToast("Connection failed.", "error");
        }
      } else {
        // Offline Approve
        setAuctions(prev => prev.map(a => {
          if (a.id === itemId) {
            return {
              ...a,
              status: 'active',
              endsAt: Date.now() + (a.durationHours || 24) * 60 * 60 * 1000
            };
          }
          return a;
        }));
        triggerToast("Listing approved locally!", "success");
      }
    };

    const handleReject = async (itemId) => {
      const backendUrl = getBackendUrl();
      if (isOnline && backendUrl) {
        try {
          const res = await fetch(`${backendUrl}/admin/auctions/${itemId}/reject`, {
            method: 'POST'
          });
          if (res.ok) {
            triggerToast("Listing rejected.", "success");
            await fetchFromServer(backendUrl);
          } else {
            triggerToast("Failed to reject.", "error");
          }
        } catch (e) {
          triggerToast("Connection failed.", "error");
        }
      } else {
        // Offline Reject
        setAuctions(prev => prev.filter(a => a.id !== itemId));
        triggerToast("Listing rejected locally.", "success");
      }
    };

    const handleDelete = async (itemId) => {
      const backendUrl = getBackendUrl();
      if (isOnline && backendUrl) {
        try {
          const res = await fetch(`${backendUrl}/admin/auctions/${itemId}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            triggerToast("Active listing deleted.", "success");
            await fetchFromServer(backendUrl);
          } else {
            triggerToast("Failed to delete.", "error");
          }
        } catch (e) {
          triggerToast("Connection failed.", "error");
        }
      } else {
        // Offline Delete
        setAuctions(prev => prev.filter(a => a.id !== itemId));
        triggerToast("Listing deleted locally.", "success");
      }
    };

    return (
      <View style={styles.tabContent}>
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>Admin Moderation</Text>
          <Text style={styles.heroSubtitle}>Approve user listings and moderate active auctions.</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* Pending Approvals */}
          <View style={styles.connectionCard}>
            <Text style={styles.connectionTitle}>Pending Approvals ({pendingItems.length})</Text>
            {pendingItems.length === 0 ? (
              <Text style={styles.emptySubTab}>No pending listing approvals.</Text>
            ) : (
              pendingItems.map(item => (
                <View key={item.id} style={[styles.historyCardItem, { flexDirection: 'column', alignItems: 'stretch' }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 24, marginRight: 10 }}>{item.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyCardTitle}>{item.title}</Text>
                        <Text style={styles.historyCardSeller}>Seller: @{item.seller}</Text>
                      </View>
                    </View>
                    <Text style={styles.historyCardPrice}>{formatCurrency(item.startingBid)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity 
                      style={[styles.connectBtn, { flex: 1, backgroundColor: '#39ff14' }]} 
                      onPress={() => handleApprove(item.id)}
                    >
                      <Text style={[styles.connectBtnText, { color: '#0a0813' }]}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.connectBtn, { flex: 1, backgroundColor: '#ff007f', borderColor: '#ff007f' }]} 
                      onPress={() => handleReject(item.id)}
                    >
                      <Text style={styles.connectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Active Listings Moderation */}
          <View style={styles.connectionCard}>
            <Text style={styles.connectionTitle}>Active Marketplace Listings ({activeItems.length})</Text>
            {activeItems.length === 0 ? (
              <Text style={styles.emptySubTab}>No active listings.</Text>
            ) : (
              activeItems.map(item => (
                <View key={item.id} style={[styles.historyCardItem, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
                    <Text style={{ fontSize: 24, marginRight: 10 }}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyCardTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.historyCardSeller}>Seller: @{item.seller}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.connectBtn, { backgroundColor: '#ff007f', borderColor: '#ff007f', width: 80 }]} 
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={styles.connectBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Main Return containing layout skeleton
  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0813" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}><Text style={styles.logoBadgeText}>B</Text></View>
          <Text style={styles.logoText}>Bid<Text style={{ color: '#00f0ff' }}>Sphere</Text></Text>
          <View style={[styles.headerStatusDot, { backgroundColor: isOnline ? '#39ff14' : '#ff7f00' }]} />
        </View>
        <View style={styles.walletPill}>
          <Text style={walletStyle(user.walletBalance)}>💰 {formatCurrency(user.walletBalance)}</Text>
        </View>
      </View>

      {/* Dynamic Tab Body */}
      {activeTab === 'home' && renderDashboardScreen()}
      {activeTab === 'sell' && renderSellScreen()}
      {activeTab === 'profile' && renderProfileScreen()}
      {activeTab === 'admin' && renderAdminScreen()}

      {/* Detail view Modal popup overlay */}
      {activeDetailId !== null && renderDetailScreen()}

      {/* Floating custom Toast messages */}
      {toastMessage && (
        <View style={[
          styles.toast, 
          toastType === 'success' && styles.toastSuccess, 
          toastType === 'error' && styles.toastError
        ]}>
          <Text style={styles.toastMessage}>{toastMessage}</Text>
        </View>
      )}

      {/* Bottom Navigation Menu */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'home' && styles.navBtnActive]} 
          onPress={() => { setActiveTab('home'); setActiveDetailId(null); }}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>Browse</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'sell' && styles.navBtnActive]} 
          onPress={() => { setActiveTab('sell'); setActiveDetailId(null); }}
        >
          <Text style={styles.navIcon}>➕</Text>
          <Text style={[styles.navLabel, activeTab === 'sell' && styles.navLabelActive]}>Sell</Text>
        </TouchableOpacity>

        {user.role === 'admin' && (
          <TouchableOpacity 
            style={[styles.navBtn, activeTab === 'admin' && styles.navBtnActive]} 
            onPress={() => { setActiveTab('admin'); setActiveDetailId(null); }}
          >
            <Text style={styles.navIcon}>🛡️</Text>
            <Text style={[styles.navLabel, activeTab === 'admin' && styles.navLabelActive]}>Admin</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'profile' && styles.navBtnActive]} 
          onPress={() => { setActiveTab('profile'); setActiveDetailId(null); }}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Simple dynamic styling helper for header wallet
const walletStyle = (balance) => {
  return {
    color: '#ffd700',
    fontWeight: 'bold',
  };
};

// ----------------------------------------------------
// MOBILE STYLING SHEET
// ----------------------------------------------------
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#0a0813',
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0813',
    zIndex: 999,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 32,
    height: 32,
    backgroundColor: '#00f0ff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoBadgeText: {
    color: '#0a0813',
    fontWeight: '900',
    fontSize: 18,
  },
  logoText: {
    color: '#f5f4f8',
    fontFamily: 'System',
    fontWeight: '800',
    fontSize: 20,
  },
  headerStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    alignSelf: 'center',
  },
  walletPill: {
    backgroundColor: 'rgba(255, 208, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 208, 0, 0.3)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  walletText: {
    color: '#ffd000',
    fontWeight: '700',
    fontSize: 14,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  tabContentScroll: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 80,
  },
  heroBanner: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(22, 18, 38, 0.4)',
    marginBottom: 20,
  },
  heroTitle: {
    color: '#f5f4f8',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: '#9f9aa9',
    fontSize: 13,
    lineHeight: 18,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: 'rgba(14, 11, 26, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#f5f4f8',
    fontSize: 15,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  categoryText: {
    color: '#9f9aa9',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#00f0ff',
  },
  listContainer: {
    paddingBottom: 90,
  },
  card: {
    borderRadius: 16,
    backgroundColor: 'rgba(30, 25, 53, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardBanner: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardIcon: {
    fontSize: 55,
  },
  timerBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.4)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  timerBadgeEnded: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timerBadgeText: {
    color: '#f5f4f8',
    fontSize: 11,
    fontWeight: '700',
  },
  cardInfo: {
    padding: 16,
  },
  cardCategory: {
    color: '#ff007f',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardTitle: {
    color: '#f5f4f8',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDesc: {
    color: '#9f9aa9',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  cardFooterDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#6b6675',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  priceVal: {
    color: '#00f0ff',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6b6675',
    fontSize: 15,
  },

  // Detail Screen Overlay
  detailHeaderBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  backBtnText: {
    color: '#f5f4f8',
    fontSize: 13,
    fontWeight: '600',
  },
  detailBarTitle: {
    color: '#f5f4f8',
    fontSize: 16,
    fontWeight: '700',
  },
  detailScrollContent: {
    paddingBottom: 40,
  },
  detailGallery: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  detailGalleryIcon: {
    fontSize: 90,
  },
  detailTimerPill: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(10, 8, 19, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  detailTimerText: {
    color: '#ff007f',
    fontSize: 14,
    fontWeight: '800',
  },
  detailContainer: {
    padding: 20,
  },
  detailCategory: {
    color: '#00f0ff',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  detailTitle: {
    color: '#f5f4f8',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  detailSeller: {
    color: '#9f9aa9',
    fontSize: 14,
    marginBottom: 16,
  },
  detailDesc: {
    color: '#9f9aa9',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  detailControlCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
  },
  priceDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailPriceLabel: {
    color: '#6b6675',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailPriceValue: {
    color: '#00f0ff',
    fontSize: 22,
    fontWeight: '800',
  },
  inputBidLabel: {
    color: '#9f9aa9',
    fontSize: 12,
    marginBottom: 8,
  },
  bidInputWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bidTextInput: {
    flex: 1,
    backgroundColor: '#0e0b1a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#f5f4f8',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
  },
  bidButton: {
    backgroundColor: '#00f0ff',
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidButtonText: {
    color: '#0a0813',
    fontWeight: '800',
    fontSize: 14,
  },
  buyoutBtn: {
    backgroundColor: '#ffd000',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  buyoutBtnText: {
    color: '#0a0813',
    fontWeight: '800',
    fontSize: 14,
  },
  sellerWarning: {
    color: '#9f9aa9',
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 13,
  },
  endedWarning: {
    color: '#6b6675',
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  historySection: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
  },
  historyTitle: {
    color: '#f5f4f8',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 15,
  },
  emptyHistory: {
    color: '#6b6675',
    textAlign: 'center',
    paddingVertical: 10,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  historyRowHighest: {
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
  },
  historyBidder: {
    color: '#f5f4f8',
    fontSize: 13,
    fontWeight: '600',
  },
  historyTime: {
    color: '#6b6675',
    fontSize: 11,
    marginTop: 2,
  },
  historyAmount: {
    color: '#00f0ff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Sell Screen
  formContainer: {
    backgroundColor: 'rgba(30, 25, 53, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
  },
  formHeadline: {
    color: '#f5f4f8',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  formSubHeadline: {
    color: '#9f9aa9',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  label: {
    color: '#9f9aa9',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0e0b1a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: '#f5f4f8',
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryPickerPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginRight: 6,
    height: 30,
    justifyContent: 'center',
  },
  categoryPickerPillActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
  categoryPickerText: {
    color: '#9f9aa9',
    fontSize: 11,
    fontWeight: '600',
  },
  categoryPickerTextActive: {
    color: '#00f0ff',
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  themeButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeButtonSelected: {
    borderColor: '#00f0ff',
  },
  publishBtn: {
    backgroundColor: '#00f0ff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  publishBtnText: {
    color: '#0a0813',
    fontWeight: '800',
    fontSize: 15,
  },

  // Connection Manager Card
  connectionCard: {
    backgroundColor: 'rgba(30, 25, 53, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  connectionTitle: {
    color: '#f5f4f8',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  connectionSubtitle: {
    color: '#6b6675',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 12,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  connectionInput: {
    flex: 1,
    backgroundColor: '#0e0b1a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#f5f4f8',
    fontSize: 13,
    marginRight: 10,
  },
  connectBtn: {
    backgroundColor: '#00f0ff',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectBtnActive: {
    backgroundColor: '#39ff14',
  },
  connectBtnText: {
    color: '#0a0813',
    fontWeight: '800',
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusIndicatorText: {
    color: '#9f9aa9',
    fontSize: 11,
    fontWeight: '600',
  },

  // Profile Screen
  profileHeaderCard: {
    backgroundColor: 'rgba(30, 25, 53, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ff007f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#f5f4f8',
    fontWeight: '800',
    fontSize: 24,
  },
  profileName: {
    color: '#f5f4f8',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    color: '#6b6675',
    fontSize: 13,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 15,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  statLabel: {
    color: '#6b6675',
    fontSize: 9,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    color: '#f5f4f8',
    fontSize: 15,
    fontWeight: '700',
  },
  walletBalanceHighlight: {
    color: '#ffd000',
    fontSize: 15,
    fontWeight: '800',
  },
  subTabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 15,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  subTabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#00f0ff',
  },
  subTabText: {
    color: '#6b6675',
    fontSize: 13,
    fontWeight: '600',
  },
  subTabTextActive: {
    color: '#00f0ff',
  },
  emptySubTab: {
    color: '#6b6675',
    textAlign: 'center',
    paddingVertical: 30,
    fontSize: 13,
  },
  historyCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  historyCardTitle: {
    color: '#f5f4f8',
    fontSize: 14,
    fontWeight: '700',
  },
  historyCardTimer: {
    color: '#ff007f',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  historyCardSeller: {
    color: '#6b6675',
    fontSize: 11,
    marginTop: 2,
  },
  historyCardPrice: {
    color: '#00f0ff',
    fontWeight: '800',
    fontSize: 14,
  },

  // Bottom Navigation Bar
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: 'rgba(22, 18, 38, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    paddingBottom: 5,
  },
  navBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnActive: {
    // optional active styling
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navLabel: {
    color: '#6b6675',
    fontSize: 10,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#00f0ff',
  },

  // Custom Toast Banner
  toast: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(10, 8, 19, 0.95)',
    borderLeftWidth: 4,
    borderLeftColor: '#00f0ff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 9999,
  },
  toastSuccess: {
    borderLeftColor: '#39ff14',
  },
  toastError: {
    borderLeftColor: '#ff007f',
  },
  toastMessage: {
    color: '#f5f4f8',
    fontSize: 13,
    fontWeight: '600',
  },

  // Auth screen specific styles
  authTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  authTabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  authTabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#00f0ff',
  },
  authTabText: {
    color: '#6b6675',
    fontSize: 14,
    fontWeight: '700',
  },
  authTabTextActive: {
    color: '#00f0ff',
  }
});
