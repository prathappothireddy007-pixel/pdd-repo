import os

NEW_MAIN_PY = """import time
import json
import hashlib
import secrets
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from database import get_supabase

app = FastAPI(title="BidSphere Auction API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def hash_password(password: str) -> str:
    salt = secrets.token_hex(8)
    h = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return f"{salt}${h}"

def verify_password(password: str, hashed: str) -> bool:
    if not hashed:
        return False
    try:
        salt, h = hashed.split('$')
        return hashlib.sha256((password + salt).encode('utf-8')).hexdigest() == h
    except Exception:
        return False

class BidCreate(BaseModel):
    bidder: str
    amount: float

class AuctionCreate(BaseModel):
    title: str
    description: str
    category: str
    starting_bid: float
    buy_now_price: Optional[float] = None
    seller: str
    duration_hours: float
    bg_color: str
    icon: str

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class CardTopUp(BaseModel):
    amount: float
    card_number: Optional[str] = None
    expiry: Optional[str] = None
    cvv: Optional[str] = None
    payment_method: str = "Card"
    transaction_reference: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    username: str
    amount: float
    payment_method: str
    transaction_reference: str
    timestamp: str

class DeliveryResponse(BaseModel):
    id: int
    auction_id: str
    item_title: str
    buyer: str
    seller: str
    price: float
    shipping_address: str
    tracking_number: str
    delivery_status: str
    last_updated: str

class DeliveryStatusUpdate(BaseModel):
    delivery_status: str

class BidResponse(BaseModel):
    id: int
    bidder: str
    amount: float
    timestamp: str

class AuctionResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    starting_bid: float
    buy_now_price: Optional[float]
    current_bid: float
    seller: str
    ends_at: float
    bg_color: str
    icon: str
    status: str
    bids: List[BidResponse] = []

class UserResponse(BaseModel):
    username: str
    email: str
    wallet_balance: float
    role: str
    items_won: List[str]
    items_bid_on: List[str]
    items_sold: List[str]

# Helpers to parse JSON lists from strings
def parse_json_list(val):
    if not val:
        return []
    if isinstance(val, list):
        return val
    try:
        return json.loads(val)
    except:
        return []

def settle_auctions():
    supabase = get_supabase()
    now_ms = time.time() * 1000
    # Can't do <= directly in one eq query easily without gt/lt, but we can use lte
    active_expired_res = supabase.table('auctions').select('*').eq('status', 'active').lte('ends_at', now_ms).execute()
    active_expired = active_expired_res.data
    
    for auction in active_expired:
        bids_res = supabase.table('bids').select('*').eq('auction_id', auction['id']).order('amount', desc=False).execute()
        bids = bids_res.data
        
        if bids:
            winning_bid = bids[-1]
            supabase.table('auctions').update({'status': 'ended', 'current_bid': winning_bid['amount']}).eq('id', auction['id']).execute()
            
            winner_res = supabase.table('users').select('*').eq('username', winning_bid['bidder']).execute()
            if winner_res.data:
                winner = winner_res.data[0]
                won_list = parse_json_list(winner.get('items_won'))
                if auction['id'] not in won_list:
                    won_list.append(auction['id'])
                    supabase.table('users').update({'items_won': json.dumps(won_list)}).eq('username', winner['username']).execute()
        else:
            supabase.table('auctions').update({'status': 'ended'}).eq('id', auction['id']).execute()


def seed_data():
    supabase = get_supabase()
    users_res = supabase.table('users').select('username').limit(1).execute()
    if users_res.data:
        return # Already seeded
        
    default_hashed = hash_password("password123")
    admin_hashed = hash_password("admin123")
    
    users = [
        {"username": "admin", "email": "admin@bidsphere.io", "hashed_password": admin_hashed, "wallet_balance": 100000.0, "role": "admin", "items_won": "[]", "items_bid_on": "[]", "items_sold": "[]"},
        {"username": "BidMaster_X", "email": "bidmaster@bidsphere.io", "hashed_password": default_hashed, "wallet_balance": 2500.0, "role": "user", "items_won": "[]", "items_bid_on": json.dumps(["auc-1", "auc-2", "auc-4"]), "items_sold": "[]"},
        {"username": "NeonCustoms", "email": "neon@bidsphere.io", "hashed_password": default_hashed, "wallet_balance": 1000.0, "role": "user", "items_won": "[]", "items_bid_on": "[]", "items_sold": json.dumps(["auc-1"])},
        {"username": "LegacyTimepieces", "email": "legacy@bidsphere.io", "hashed_password": default_hashed, "wallet_balance": 1000.0, "role": "user", "items_won": "[]", "items_bid_on": "[]", "items_sold": json.dumps(["auc-2"])},
        {"username": "SoleSynth", "email": "soles@bidsphere.io", "hashed_password": default_hashed, "wallet_balance": 1000.0, "role": "user", "items_won": "[]", "items_bid_on": "[]", "items_sold": json.dumps(["auc-3"])},
        {"username": "PixelNostalgia", "email": "pixel@bidsphere.io", "hashed_password": default_hashed, "wallet_balance": 1000.0, "role": "user", "items_won": "[]", "items_bid_on": "[]", "items_sold": json.dumps(["auc-4"])},
        {"username": "VaporVector", "email": "vapor@bidsphere.io", "hashed_password": default_hashed, "wallet_balance": 1000.0, "role": "user", "items_won": "[]", "items_bid_on": "[]", "items_sold": json.dumps(["auc-5"])},
        {"username": "ShiftKey99", "email": "shift@bidsphere.io", "hashed_password": default_hashed, "wallet_balance": 500.0, "role": "user", "items_won": "[]", "items_bid_on": "[]", "items_sold": "[]"},
        {"username": "CyberRider", "email": "rider@bidsphere.io", "hashed_password": default_hashed, "wallet_balance": 800.0, "role": "user", "items_won": "[]", "items_bid_on": "[]", "items_sold": "[]"},
        {"username": "AeroCollector", "email": "aero@bidsphere.io", "hashed_password": default_hashed, "wallet_balance": 3000.0, "role": "user", "items_won": "[]", "items_bid_on": "[]", "items_sold": "[]"},
        {"username": "TimeLord", "email": "timelord@bidsphere.io", "hashed_password": default_hashed, "wallet_balance": 2500.0, "role": "user", "items_won": "[]", "items_bid_on": "[]", "items_sold": "[]"},
        {"username": "MarioBros85", "email": "mario@bidsphere.io", "hashed_password": default_hashed, "wallet_balance": 600.0, "role": "user", "items_won": "[]", "items_bid_on": "[]", "items_sold": "[]"},
        {"username": "SegaFanatic", "email": "sega@bidsphere.io", "hashed_password": default_hashed, "wallet_balance": 700.0, "role": "user", "items_won": "[]", "items_bid_on": "[]", "items_sold": "[]"},
        {"username": "GalleryDirector", "email": "gallery@bidsphere.io", "hashed_password": default_hashed, "wallet_balance": 2000.0, "role": "user", "items_won": "[]", "items_bid_on": "[]", "items_sold": "[]"},
        {"username": "CryptoCurator", "email": "crypto@bidsphere.io", "hashed_password": default_hashed, "wallet_balance": 3500.0, "role": "user", "items_won": "[]", "items_bid_on": "[]", "items_sold": "[]"}
    ]
    supabase.table('users').insert(users).execute()

    now_ms = time.time() * 1000
    
    auctions = [
        {
            "id": "auc-1", "title": "Apex-X Cyberpunk Keyboard", "description": "Handcrafted 75% mechanical keyboard...", "category": "Electronics", "starting_bid": 150.0, "buy_now_price": 350.0, "current_bid": 195.0, "seller": "NeonCustoms", "ends_at": now_ms + (3.5 * 60 * 60 * 1000), "bg_color": "#2b1055", "icon": "keyboard", "status": "active"
        },
        {
            "id": "auc-2", "title": "Chrono-Classic Vintage Watch", "description": "Restored 1984 GMT wristwatch...", "category": "Fashion & Luxury", "starting_bid": 1200.0, "buy_now_price": 2200.0, "current_bid": 1450.0, "seller": "LegacyTimepieces", "ends_at": now_ms + (8 * 60 * 60 * 1000), "bg_color": "#1f4037", "icon": "watch", "status": "active"
        },
        {
            "id": "auc-3", "title": "SynthWave Holographic Sneakers", "description": "Limited-run designer sneakers...", "category": "Fashion & Luxury", "starting_bid": 400.0, "buy_now_price": 850.0, "current_bid": 400.0, "seller": "SoleSynth", "ends_at": now_ms + (1.2 * 60 * 60 * 1000), "bg_color": "#f857a6", "icon": "shoe", "status": "active"
        },
        {
            "id": "auc-4", "title": "RetroStation 95 - Modded Console", "description": "Fully customized vintage home console...", "category": "Gaming & Entertainment", "starting_bid": 250.0, "buy_now_price": 490.0, "current_bid": 320.0, "seller": "PixelNostalgia", "ends_at": now_ms + (18 * 60 * 60 * 1000), "bg_color": "#0f2027", "icon": "gamepad", "status": "active"
        },
        {
            "id": "auc-5", "title": "Elysium Citadel Concept Art", "description": "High-resolution digital illustration...", "category": "Art & Collectibles", "starting_bid": 500.0, "buy_now_price": 1200.0, "current_bid": 780.0, "seller": "VaporVector", "ends_at": now_ms + (22.5 * 60 * 60 * 1000), "bg_color": "#fc00ff", "icon": "image", "status": "active"
        }
    ]
    supabase.table('auctions').insert(auctions).execute()
    
    bids = [
        {"auction_id": "auc-1", "bidder": "ShiftKey99", "amount": 150.0, "timestamp": "2026-06-15T08:00:00Z"},
        {"auction_id": "auc-1", "bidder": "CyberRider", "amount": 175.0, "timestamp": "2026-06-15T08:30:00Z"},
        {"auction_id": "auc-1", "bidder": "ShiftKey99", "amount": 195.0, "timestamp": "2026-06-15T09:00:00Z"},
        {"auction_id": "auc-2", "bidder": "AeroCollector", "amount": 1200.0, "timestamp": "2026-06-15T07:15:00Z"},
        {"auction_id": "auc-2", "bidder": "TimeLord", "amount": 1350.0, "timestamp": "2026-06-15T08:05:00Z"},
        {"auction_id": "auc-2", "bidder": "AeroCollector", "amount": 1450.0, "timestamp": "2026-06-15T08:50:00Z"},
        {"auction_id": "auc-4", "bidder": "MarioBros85", "amount": 250.0, "timestamp": "2026-06-15T05:00:00Z"},
        {"auction_id": "auc-4", "bidder": "SegaFanatic", "amount": 290.0, "timestamp": "2026-06-15T06:10:00Z"},
        {"auction_id": "auc-4", "bidder": "MarioBros85", "amount": 320.0, "timestamp": "2026-06-15T07:30:00Z"},
        {"auction_id": "auc-5", "bidder": "GalleryDirector", "amount": 500.0, "timestamp": "2026-06-15T03:00:00Z"},
        {"auction_id": "auc-5", "bidder": "CryptoCurator", "amount": 650.0, "timestamp": "2026-06-15T04:30:00Z"},
        {"auction_id": "auc-5", "bidder": "GalleryDirector", "amount": 720.0, "timestamp": "2026-06-15T06:00:00Z"},
        {"auction_id": "auc-5", "bidder": "CryptoCurator", "amount": 780.0, "timestamp": "2026-06-15T07:15:00Z"}
    ]
    supabase.table('bids').insert(bids).execute()

@app.on_event("startup")
def startup_event():
    seed_data()

def format_user(user):
    user['items_won'] = parse_json_list(user.get('items_won'))
    user['items_bid_on'] = parse_json_list(user.get('items_bid_on'))
    user['items_sold'] = parse_json_list(user.get('items_sold'))
    return user

@app.post("/api/auth/register", response_model=UserResponse)
def register_user(reg: UserRegister):
    supabase = get_supabase()
    username = reg.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")
    
    existing = supabase.table('users').select('*').eq('username', username).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Username already exists")
        
    user_data = {
        "username": username,
        "email": reg.email.strip(),
        "hashed_password": hash_password(reg.password),
        "wallet_balance": 2500.0,
        "role": "user",
        "items_won": "[]",
        "items_bid_on": "[]",
        "items_sold": "[]"
    }
    res = supabase.table('users').insert(user_data).execute()
    return format_user(res.data[0])

@app.post("/api/auth/login", response_model=UserResponse)
def login_user(login: UserLogin):
    supabase = get_supabase()
    user_res = supabase.table('users').select('*').eq('username', login.username.strip()).execute()
    if not user_res.data:
        raise HTTPException(status_code=400, detail="Invalid username or password")
        
    user = user_res.data[0]
    if not verify_password(login.password, user['hashed_password']):
        raise HTTPException(status_code=400, detail="Invalid username or password")
        
    return format_user(user)

@app.post("/api/user/{username}/topup", response_model=UserResponse)
def topup_wallet(username: str, card_in: CardTopUp):
    supabase = get_supabase()
    user_res = supabase.table('users').select('*').eq('username', username).execute()
    if not user_res.data:
        raise HTTPException(status_code=404, detail="User not found")
    user = user_res.data[0]
        
    if card_in.amount <= 0:
        raise HTTPException(status_code=400, detail="Top-up amount must be positive")
        
    if card_in.payment_method == "Card":
        if not card_in.card_number or not card_in.expiry or not card_in.cvv:
            raise HTTPException(status_code=400, detail="Card number, expiry, and CVV are required")
        card_clean = card_in.card_number.replace(" ", "").replace("-", "")
        if len(card_clean) < 13 or len(card_clean) > 19 or not card_clean.isdigit():
            raise HTTPException(status_code=400, detail="Invalid card number format")
            
        tx_ref = f"TXN-CARD-{''.join(secrets.choice('0123456789') for _ in range(8))}"
    else:
        tx_ref = card_in.transaction_reference or f"TXN-UPI-{''.join(secrets.choice('0123456789') for _ in range(8))}"
        
    new_balance = user['wallet_balance'] + card_in.amount
    supabase.table('users').update({'wallet_balance': new_balance}).eq('username', username).execute()
    
    payment_rec = {
        "username": username,
        "amount": card_in.amount,
        "payment_method": card_in.payment_method,
        "transaction_reference": tx_ref,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    supabase.table('payments').insert(payment_rec).execute()
    
    user['wallet_balance'] = new_balance
    return format_user(user)

@app.get("/api/auctions", response_model=List[AuctionResponse])
def get_auctions(category: Optional[str] = None):
    supabase = get_supabase()
    settle_auctions()
    
    query = supabase.table('auctions').select('*').neq('status', 'pending')
    if category and category != "All":
        query = query.eq('category', category)
    
    res = query.execute()
    auctions = res.data
    
    # Supabase REST API doesn't do deep joins automatically without explicitly setting it up or fetching manually.
    # Let's fetch bids manually to be safe.
    for auc in auctions:
        bids_res = supabase.table('bids').select('*').eq('auction_id', auc['id']).execute()
        auc['bids'] = bids_res.data
        
    return sorted(auctions, key=lambda x: x['ends_at'])

@app.get("/api/auctions/{auction_id}", response_model=AuctionResponse)
def get_auction(auction_id: str):
    supabase = get_supabase()
    settle_auctions()
    res = supabase.table('auctions').select('*').eq('id', auction_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Auction not found")
    auction = res.data[0]
    
    bids_res = supabase.table('bids').select('*').eq('auction_id', auction['id']).execute()
    auction['bids'] = bids_res.data
    return auction

@app.post("/api/auctions", response_model=AuctionResponse)
def create_auction(auction_in: AuctionCreate):
    supabase = get_supabase()
    user_res = supabase.table('users').select('*').eq('username', auction_in.seller).execute()
    if not user_res.data:
        user_data = {
            "username": auction_in.seller,
            "email": f"{auction_in.seller}@bidsphere.io",
            "hashed_password": hash_password("password123"),
            "wallet_balance": 1000.0,
            "role": "user",
            "items_won": "[]", "items_bid_on": "[]", "items_sold": "[]"
        }
        user_res = supabase.table('users').insert(user_data).execute()
    
    user = user_res.data[0]
    now_ms = time.time() * 1000
    is_admin = user['role'] == "admin"
    status = "active" if is_admin else "pending"
    ends_at_ms = (now_ms + (auction_in.duration_hours * 60 * 60 * 1000)) if is_admin else 0.0
    new_id = f"auc-{int(time.time() * 1000)}"
    
    auc_data = {
        "id": new_id,
        "title": auction_in.title,
        "description": auction_in.description,
        "category": auction_in.category,
        "starting_bid": auction_in.starting_bid,
        "buy_now_price": auction_in.buy_now_price,
        "current_bid": auction_in.starting_bid,
        "seller": auction_in.seller,
        "ends_at": ends_at_ms,
        "duration_hours": auction_in.duration_hours,
        "bg_color": auction_in.bg_color,
        "icon": auction_in.icon,
        "status": status
    }
    res = supabase.table('auctions').insert(auc_data).execute()
    auction = res.data[0]
    auction['bids'] = []
    
    sold_list = parse_json_list(user.get('items_sold'))
    sold_list.append(new_id)
    supabase.table('users').update({'items_sold': json.dumps(sold_list)}).eq('username', user['username']).execute()
    
    return auction

@app.post("/api/auctions/{auction_id}/bid", response_model=AuctionResponse)
def place_bid(auction_id: str, bid_in: BidCreate):
    supabase = get_supabase()
    settle_auctions()
    
    auc_res = supabase.table('auctions').select('*').eq('id', auction_id).execute()
    if not auc_res.data:
        raise HTTPException(status_code=404, detail="Auction not found")
    auction = auc_res.data[0]
    
    if auction['status'] != "active":
        raise HTTPException(status_code=400, detail="Auction is no longer active")
    if auction['seller'] == bid_in.bidder:
        raise HTTPException(status_code=400, detail="Sellers cannot bid on their own listings")
        
    user_res = supabase.table('users').select('*').eq('username', bid_in.bidder).execute()
    if not user_res.data:
        user_data = {
            "username": bid_in.bidder,
            "email": f"{bid_in.bidder}@bidsphere.io",
            "hashed_password": hash_password("password123"),
            "wallet_balance": 2500.0,
            "role": "user",
            "items_won": "[]", "items_bid_on": "[]", "items_sold": "[]"
        }
        user_res = supabase.table('users').insert(user_data).execute()
    user = user_res.data[0]
    
    bids_res = supabase.table('bids').select('*').eq('auction_id', auction_id).execute()
    bids = bids_res.data
    
    min_increment = 5.0
    min_allowed = (auction['current_bid'] + min_increment) if bids else auction['starting_bid']
    
    if bid_in.amount < min_allowed:
        raise HTTPException(status_code=400, detail=f"Bid amount must be at least {min_allowed}")
    if auction['buy_now_price'] and bid_in.amount >= auction['buy_now_price']:
        raise HTTPException(status_code=400, detail="Your bid meets the Buy Now price! Please use the Buy Out button.")
    if user['wallet_balance'] < bid_in.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        
    bid_data = {
        "auction_id": auction_id,
        "bidder": bid_in.bidder,
        "amount": bid_in.amount,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    supabase.table('bids').insert(bid_data).execute()
    supabase.table('auctions').update({'current_bid': bid_in.amount}).eq('id', auction_id).execute()
    
    bidded_list = parse_json_list(user.get('items_bid_on'))
    if auction_id not in bidded_list:
        bidded_list.append(auction_id)
        supabase.table('users').update({'items_bid_on': json.dumps(bidded_list)}).eq('username', user['username']).execute()
        
    auction['current_bid'] = bid_in.amount
    bids_res = supabase.table('bids').select('*').eq('auction_id', auction_id).execute()
    auction['bids'] = bids_res.data
    return auction

@app.post("/api/auctions/{auction_id}/buyout", response_model=AuctionResponse)
def buyout_auction(auction_id: str, payload: dict = Body(...)):
    supabase = get_supabase()
    settle_auctions()
    
    bidder = payload.get("bidder")
    address = payload.get("address", "Pending User Address")
    if not bidder:
        raise HTTPException(status_code=400, detail="Bidder username is required")
        
    auc_res = supabase.table('auctions').select('*').eq('id', auction_id).execute()
    if not auc_res.data:
        raise HTTPException(status_code=404, detail="Auction not found")
    auction = auc_res.data[0]
    
    if auction['status'] not in ["active", "ended"]:
        raise HTTPException(status_code=400, detail="Auction is no longer active or already sold")
        
    buyout_amount = 0
    if auction['status'] == "ended":
        bids_res = supabase.table('bids').select('*').eq('auction_id', auction['id']).order('amount', desc=True).execute()
        if not bids_res.data or bids_res.data[0]['bidder'] != bidder:
            raise HTTPException(status_code=400, detail="You are not the winner of this auction")
        buyout_amount = bids_res.data[0]['amount']
    else:
        if not auction['buy_now_price']:
            raise HTTPException(status_code=400, detail="This auction does not support buyouts")
        if auction['seller'] == bidder:
            raise HTTPException(status_code=400, detail="Sellers cannot buy out their own listings")
        buyout_amount = auction['buy_now_price']
        
    user_res = supabase.table('users').select('*').eq('username', bidder).execute()
    if not user_res.data:
        user_data = {
            "username": bidder,
            "email": f"{bidder}@bidsphere.io",
            "hashed_password": hash_password("password123"),
            "wallet_balance": 2500.0,
            "role": "user",
            "items_won": "[]", "items_bid_on": "[]", "items_sold": "[]"
        }
        user_res = supabase.table('users').insert(user_data).execute()
    user = user_res.data[0]
    
    if user['wallet_balance'] < buyout_amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance for checkout")
        
    if auction['status'] == "active":
        bid_data = {
            "auction_id": auction_id,
            "bidder": bidder,
            "amount": buyout_amount,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        supabase.table('bids').insert(bid_data).execute()
        supabase.table('auctions').update({'ends_at': time.time() * 1000}).eq('id', auction_id).execute()
        
    supabase.table('auctions').update({'status': 'sold', 'current_bid': buyout_amount}).eq('id', auction_id).execute()
    
    won_list = parse_json_list(user.get('items_won'))
    if auction_id not in won_list:
        won_list.append(auction_id)
        
    supabase.table('users').update({
        'items_won': json.dumps(won_list),
        'wallet_balance': user['wallet_balance'] - buyout_amount
    }).eq('username', bidder).execute()
    
    seller_res = supabase.table('users').select('*').eq('username', auction['seller']).execute()
    if seller_res.data:
        seller = seller_res.data[0]
        sold_list = parse_json_list(seller.get('items_sold'))
        if auction_id not in sold_list:
            sold_list.append(auction_id)
        supabase.table('users').update({
            'items_sold': json.dumps(sold_list),
            'wallet_balance': seller['wallet_balance'] + buyout_amount
        }).eq('username', seller['username']).execute()
        
    del_res = supabase.table('deliveries').select('*').eq('auction_id', auction_id).execute()
    if not del_res.data:
        tracking_num = f"TRK-{''.join(secrets.choice('0123456789') for _ in range(10))}"
        del_data = {
            "auction_id": auction_id,
            "item_title": auction['title'],
            "buyer": bidder,
            "seller": auction['seller'],
            "price": buyout_amount,
            "shipping_address": address,
            "tracking_number": tracking_num,
            "delivery_status": "Pending Shipment",
            "last_updated": datetime.utcnow().isoformat() + "Z"
        }
        supabase.table('deliveries').insert(del_data).execute()
        
    auc_res = supabase.table('auctions').select('*').eq('id', auction_id).execute()
    auction = auc_res.data[0]
    bids_res = supabase.table('bids').select('*').eq('auction_id', auction_id).execute()
    auction['bids'] = bids_res.data
    return auction

@app.get("/api/user/{username}", response_model=UserResponse)
def get_user(username: str):
    supabase = get_supabase()
    settle_auctions()
    user_res = supabase.table('users').select('*').eq('username', username).execute()
    if not user_res.data:
        user_data = {
            "username": username,
            "email": f"{username}@bidsphere.io",
            "hashed_password": hash_password("password123"),
            "wallet_balance": 2500.0,
            "role": "user",
            "items_won": "[]", "items_bid_on": "[]", "items_sold": "[]"
        }
        user_res = supabase.table('users').insert(user_data).execute()
    
    return format_user(user_res.data[0])

@app.post("/api/user/reset")
def reset_database():
    supabase = get_supabase()
    # Delete all data - requires explicit delete by id since REST API needs conditions
    # For safety, let's just delete by looking up all ids and deleting them, or using not.is.null
    supabase.table('bids').delete().neq('id', 0).execute()
    supabase.table('deliveries').delete().neq('id', 0).execute()
    supabase.table('auctions').delete().neq('id', 'xyz').execute()
    supabase.table('payments').delete().neq('id', 0).execute()
    supabase.table('users').delete().neq('username', 'xyz').execute()
    
    seed_data()
    return {"message": "Database successfully reset to mock data"}

@app.get("/api/admin/pending", response_model=List[AuctionResponse])
def get_pending_auctions():
    supabase = get_supabase()
    res = supabase.table('auctions').select('*').eq('status', 'pending').execute()
    auctions = res.data
    for auc in auctions:
        bids_res = supabase.table('bids').select('*').eq('auction_id', auc['id']).execute()
        auc['bids'] = bids_res.data
    return auctions

@app.post("/api/admin/auctions/{auction_id}/approve", response_model=AuctionResponse)
def approve_auction(auction_id: str):
    supabase = get_supabase()
    auc_res = supabase.table('auctions').select('*').eq('id', auction_id).execute()
    if not auc_res.data:
        raise HTTPException(status_code=404, detail="Auction not found")
        
    auction = auc_res.data[0]
    now_ms = time.time() * 1000
    ends_at_ms = now_ms + (auction['duration_hours'] * 60 * 60 * 1000)
    
    res = supabase.table('auctions').update({'status': 'active', 'ends_at': ends_at_ms}).eq('id', auction_id).execute()
    updated_auction = res.data[0]
    bids_res = supabase.table('bids').select('*').eq('auction_id', auction_id).execute()
    updated_auction['bids'] = bids_res.data
    return updated_auction

@app.post("/api/admin/auctions/{auction_id}/reject", response_model=AuctionResponse)
def reject_auction(auction_id: str):
    supabase = get_supabase()
    auc_res = supabase.table('auctions').select('*').eq('id', auction_id).execute()
    if not auc_res.data:
        raise HTTPException(status_code=404, detail="Auction not found")
    auction = auc_res.data[0]
    bids_res = supabase.table('bids').select('*').eq('auction_id', auction_id).execute()
    auction['bids'] = bids_res.data
    supabase.table('auctions').delete().eq('id', auction_id).execute()
    return auction

@app.delete("/api/admin/auctions/{auction_id}")
def delete_auction(auction_id: str):
    supabase = get_supabase()
    auc_res = supabase.table('auctions').select('*').eq('id', auction_id).execute()
    if not auc_res.data:
        raise HTTPException(status_code=404, detail="Auction not found")
    supabase.table('auctions').delete().eq('id', auction_id).execute()
    return {"message": "Auction successfully deleted"}

@app.get("/api/payments", response_model=List[PaymentResponse])
def get_payments(username: str):
    supabase = get_supabase()
    if username == "admin":
        res = supabase.table('payments').select('*').order('id', desc=True).execute()
    else:
        res = supabase.table('payments').select('*').eq('username', username).order('id', desc=True).execute()
    return res.data

@app.get("/api/deliveries", response_model=List[DeliveryResponse])
def get_deliveries(username: str):
    supabase = get_supabase()
    if username == "admin":
        res = supabase.table('deliveries').select('*').order('id', desc=True).execute()
    else:
        res = supabase.table('deliveries').select('*').or_(f"buyer.eq.{username},seller.eq.{username}").order('id', desc=True).execute()
    return res.data

@app.post("/api/admin/deliveries/{delivery_id}/status", response_model=DeliveryResponse)
def update_delivery_status(delivery_id: int, status_in: DeliveryStatusUpdate):
    supabase = get_supabase()
    del_res = supabase.table('deliveries').select('*').eq('id', delivery_id).execute()
    if not del_res.data:
        raise HTTPException(status_code=404, detail="Delivery record not found")
        
    valid_statuses = ["Pending Shipment", "In Transit", "Delivered"]
    if status_in.delivery_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid delivery status.")
        
    update_data = {
        'delivery_status': status_in.delivery_status,
        'last_updated': datetime.utcnow().isoformat() + "Z"
    }
    res = supabase.table('deliveries').update(update_data).eq('id', delivery_id).execute()
    return res.data[0]
"""

with open(r"c:\Users\Suchithra\.gemini\antigravity\scratch\online-auction-backend\main.py", "w") as f:
    f.write(NEW_MAIN_PY)
