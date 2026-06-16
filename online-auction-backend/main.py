import time
import hashlib
import secrets
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import SessionLocal, init_db, DBUser, DBAuction, DBBid

# Initialize Database tables
init_db()

app = FastAPI(title="BidSphere Auction API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency for DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Password hashing utilities
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

# Pydantic Schemas
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
    card_number: str
    expiry: str
    cvv: str

class BidResponse(BaseModel):
    id: int
    bidder: str
    amount: float
    timestamp: str

    class Config:
        from_attributes = True

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

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    username: str
    email: str
    wallet_balance: float
    items_won: List[str]
    items_bid_on: List[str]
    items_sold: List[str]

    class Config:
        from_attributes = True

# Helper to settle expired auctions
def settle_auctions(db: Session):
    now_ms = time.time() * 1000
    active_expired = db.query(DBAuction).filter(
        DBAuction.status == "active",
        DBAuction.ends_at <= now_ms
    ).all()

    for auction in active_expired:
        bids = db.query(DBBid).filter(DBBid.auction_id == auction.id).order_by(DBBid.amount.asc()).all()
        
        if bids:
            winning_bid = bids[-1]
            auction.status = "sold"
            auction.current_bid = winning_bid.amount
            
            # Update winner profile
            winner = db.query(DBUser).filter(DBUser.username == winning_bid.bidder).first()
            if winner:
                won_list = winner.items_won
                if auction.id not in won_list:
                    won_list.append(auction.id)
                    winner.items_won = won_list
                    winner.wallet_balance = winner.wallet_balance - winning_bid.amount
            
            # Update seller profile
            seller = db.query(DBUser).filter(DBUser.username == auction.seller).first()
            if seller:
                sold_list = seller.items_sold
                if auction.id not in sold_list:
                    sold_list.append(auction.id)
                    seller.items_sold = sold_list
                    seller.wallet_balance = seller.wallet_balance + winning_bid.amount
        else:
            auction.status = "ended"
            
    if active_expired:
        db.commit()

# Populate Mock Data
def seed_data(db: Session):
    # Check if data already exists
    if db.query(DBUser).first() is not None:
        return
        
    default_hashed = hash_password("password123")
    
    # Seed Users
    users = [
        DBUser(username="BidMaster_X", email="bidmaster@bidsphere.io", hashed_password=default_hashed, wallet_balance=2500.0),
        DBUser(username="NeonCustoms", email="neon@bidsphere.io", hashed_password=default_hashed, wallet_balance=1000.0),
        DBUser(username="LegacyTimepieces", email="legacy@bidsphere.io", hashed_password=default_hashed, wallet_balance=1000.0),
        DBUser(username="SoleSynth", email="soles@bidsphere.io", hashed_password=default_hashed, wallet_balance=1000.0),
        DBUser(username="PixelNostalgia", email="pixel@bidsphere.io", hashed_password=default_hashed, wallet_balance=1000.0),
        DBUser(username="VaporVector", email="vapor@bidsphere.io", hashed_password=default_hashed, wallet_balance=1000.0),
        DBUser(username="ShiftKey99", email="shift@bidsphere.io", hashed_password=default_hashed, wallet_balance=500.0),
        DBUser(username="CyberRider", email="rider@bidsphere.io", hashed_password=default_hashed, wallet_balance=800.0),
        DBUser(username="AeroCollector", email="aero@bidsphere.io", hashed_password=default_hashed, wallet_balance=3000.0),
        DBUser(username="TimeLord", email="timelord@bidsphere.io", hashed_password=default_hashed, wallet_balance=2500.0),
        DBUser(username="MarioBros85", email="mario@bidsphere.io", hashed_password=default_hashed, wallet_balance=600.0),
        DBUser(username="SegaFanatic", email="sega@bidsphere.io", hashed_password=default_hashed, wallet_balance=700.0),
        DBUser(username="GalleryDirector", email="gallery@bidsphere.io", hashed_password=default_hashed, wallet_balance=2000.0),
        DBUser(username="CryptoCurator", email="crypto@bidsphere.io", hashed_password=default_hashed, wallet_balance=3500.0)
    ]
    for u in users:
        db.add(u)
    db.commit()

    # Seed Auctions and Bids
    now_ms = time.time() * 1000
    
    # Setup initial items bid on for BidMaster_X
    bm = db.query(DBUser).filter(DBUser.username == "BidMaster_X").first()
    bm.items_bid_on = ["auc-1", "auc-2", "auc-4"]
    db.commit()

    # Auction 1
    a1 = DBAuction(
        id="auc-1",
        title="Apex-X Cyberpunk Keyboard",
        description="Handcrafted 75% mechanical keyboard featuring customized hot-swappable tactile switches, dynamic neon RGB underglow, custom resin cyberpunk keycaps, and a solid CNC-milled aluminum case with clear polycarbonate bottom.",
        category="Electronics",
        starting_bid=150.0,
        buy_now_price=350.0,
        current_bid=195.0,
        seller="NeonCustoms",
        ends_at=now_ms + (3.5 * 60 * 60 * 1000),
        bg_color="#2b1055",
        icon="keyboard",
        status="active"
    )
    db.add(a1)
    db.commit()
    
    bids1 = [
        DBBid(auction_id="auc-1", bidder="ShiftKey99", amount=150.0, timestamp="2026-06-15T08:00:00Z"),
        DBBid(auction_id="auc-1", bidder="CyberRider", amount=175.0, timestamp="2026-06-15T08:30:00Z"),
        DBBid(auction_id="auc-1", bidder="ShiftKey99", amount=195.0, timestamp="2026-06-15T09:00:00Z")
    ]
    for b in bids1:
        db.add(b)
    db.commit()

    # Auction 2
    a2 = DBAuction(
        id="auc-2",
        title="Chrono-Classic Vintage Watch",
        description="Restored 1984 GMT wristwatch. Stainless steel case, dual-timezone bezel, original matte black dial with tritium markers, and authentic leather strap.",
        category="Fashion & Luxury",
        starting_bid=1200.0,
        buy_now_price=2200.0,
        current_bid=1450.0,
        seller="LegacyTimepieces",
        ends_at=now_ms + (8 * 60 * 60 * 1000),
        bg_color="#1f4037",
        icon="watch",
        status="active"
    )
    db.add(a2)
    db.commit()
    
    bids2 = [
        DBBid(auction_id="auc-2", bidder="AeroCollector", amount=1200.0, timestamp="2026-06-15T07:15:00Z"),
        DBBid(auction_id="auc-2", bidder="TimeLord", amount=1350.0, timestamp="2026-06-15T08:05:00Z"),
        DBBid(auction_id="auc-2", bidder="AeroCollector", amount=1450.0, timestamp="2026-06-15T08:50:00Z")
    ]
    for b in bids2:
        db.add(b)
    db.commit()

    # Auction 3
    a3 = DBAuction(
        id="auc-3",
        title="SynthWave Holographic Sneakers",
        description="Limited-run designer sneakers featuring light-responsive holographic panels, smart mesh lining, self-lacing technology interface, and dynamic LED accents.",
        category="Fashion & Luxury",
        starting_bid=400.0,
        buy_now_price=850.0,
        current_bid=400.0,
        seller="SoleSynth",
        ends_at=now_ms + (1.2 * 60 * 60 * 1000),
        bg_color="#f857a6",
        icon="shoe",
        status="active"
    )
    db.add(a3)
    db.commit()

    # Auction 4
    a4 = DBAuction(
        id="auc-4",
        title="RetroStation 95 - Modded Console",
        description="Fully customized vintage home console updated for modern HDMI outputs. Translucent crystal-blue casing, pre-loaded custom emulator firmware, and wireless controllers.",
        category="Gaming & Entertainment",
        starting_bid=250.0,
        buy_now_price=490.0,
        current_bid=320.0,
        seller="PixelNostalgia",
        ends_at=now_ms + (18 * 60 * 60 * 1000),
        bg_color="#0f2027",
        icon="gamepad",
        status="active"
    )
    db.add(a4)
    db.commit()
    
    bids4 = [
        DBBid(auction_id="auc-4", bidder="MarioBros85", amount=250.0, timestamp="2026-06-15T05:00:00Z"),
        DBBid(auction_id="auc-4", bidder="SegaFanatic", amount=290.0, timestamp="2026-06-15T06:10:00Z"),
        DBBid(auction_id="auc-4", bidder="MarioBros85", amount=320.0, timestamp="2026-06-15T07:30:00Z")
    ]
    for b in bids4:
        db.add(b)
    db.commit()

    # Auction 5
    a5 = DBAuction(
        id="auc-5",
        title="Elysium Citadel Concept Art",
        description="High-resolution digital illustration showcasing a soaring utopian metropolis among clouds. Winner receives ownership certificate and source project files.",
        category="Art & Collectibles",
        starting_bid=500.0,
        buy_now_price=1200.0,
        current_bid=780.0,
        seller="VaporVector",
        ends_at=now_ms + (22.5 * 60 * 60 * 1000),
        bg_color="#fc00ff",
        icon="image",
        status="active"
    )
    db.add(a5)
    db.commit()
    
    bids5 = [
        DBBid(auction_id="auc-5", bidder="GalleryDirector", amount=500.0, timestamp="2026-06-15T03:00:00Z"),
        DBBid(auction_id="auc-5", bidder="CryptoCurator", amount=650.0, timestamp="2026-06-15T04:30:00Z"),
        DBBid(auction_id="auc-5", bidder="GalleryDirector", amount=720.0, timestamp="2026-06-15T06:00:00Z"),
        DBBid(auction_id="auc-5", bidder="CryptoCurator", amount=780.0, timestamp="2026-06-15T07:15:00Z")
    ]
    for b in bids5:
        db.add(b)
    db.commit()

# Seed database on startup
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


# ===================================================
# AUTHENTICATION API ENDPOINTS
# ===================================================

@app.post("/api/auth/register", response_model=UserResponse)
def register_user(reg: UserRegister, db: Session = Depends(get_db)):
    # Validate username length/chars
    username = reg.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")
    
    # Check if user already exists
    existing = db.query(DBUser).filter(DBUser.username == username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
        
    email = reg.email.strip()
    
    # Create user
    db_user = DBUser(
        username=username,
        email=email,
        hashed_password=hash_password(reg.password),
        wallet_balance=2500.0 # Default starting money
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=UserResponse)
def login_user(login: UserLogin, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.username == login.username.strip()).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid username or password")
        
    if not verify_password(login.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
        
    return user


# ===================================================
# WALLET TOP-UP / PAYMENT API ENDPOINT
# ===================================================

@app.post("/api/user/{username}/topup", response_model=UserResponse)
def topup_wallet(username: str, card_in: CardTopUp, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if card_in.amount <= 0:
        raise HTTPException(status_code=400, detail="Top-up amount must be positive")
        
    # Basic mock credit card checksum/format checks
    card_clean = card_in.card_number.replace(" ", "").replace("-", "")
    if len(card_clean) < 13 or len(card_clean) > 19 or not card_clean.isdigit():
        raise HTTPException(status_code=400, detail="Invalid card number format")
        
    # Expiry format MM/YY check
    expiry = card_in.expiry.strip()
    if "/" not in expiry or len(expiry) != 5:
        raise HTTPException(status_code=400, detail="Invalid expiry date (Expected MM/YY)")
        
    # CVV check (3 or 4 digits)
    cvv = card_in.cvv.strip()
    if len(cvv) < 3 or len(cvv) > 4 or not cvv.isdigit():
        raise HTTPException(status_code=400, detail="Invalid CVV code")
        
    # Process simulated credit card top-up
    user.wallet_balance += card_in.amount
    db.commit()
    db.refresh(user)
    
    return user


# ===================================================
# STANDARD AUCTION API ENDPOINTS
# ===================================================

@app.get("/api/auctions", response_model=List[AuctionResponse])
def get_auctions(category: Optional[str] = None, db: Session = Depends(get_db)):
    settle_auctions(db)
    query = db.query(DBAuction)
    if category and category != "All":
        query = query.filter(DBAuction.category == category)
    return query.order_by(DBAuction.ends_at.asc()).all()

@app.get("/api/auctions/{auction_id}", response_model=AuctionResponse)
def get_auction(auction_id: str, db: Session = Depends(get_db)):
    settle_auctions(db)
    auction = db.query(DBAuction).filter(DBAuction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    return auction

@app.post("/api/auctions", response_model=AuctionResponse)
def create_auction(auction_in: AuctionCreate, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(DBUser).filter(DBUser.username == auction_in.seller).first()
    if not user:
        # Create seller on the fly (for backwards compatibility)
        user = DBUser(username=auction_in.seller, email=f"{auction_in.seller}@bidsphere.io", hashed_password=hash_password("password123"), wallet_balance=1000.0)
        db.add(user)
        db.commit()

    now_ms = time.time() * 1000
    ends_at_ms = now_ms + (auction_in.duration_hours * 60 * 60 * 1000)
    new_id = f"auc-{int(time.time() * 1000)}"

    db_auc = DBAuction(
        id=new_id,
        title=auction_in.title,
        description=auction_in.description,
        category=auction_in.category,
        starting_bid=auction_in.starting_bid,
        buy_now_price=auction_in.buy_now_price,
        current_bid=auction_in.starting_bid,
        seller=auction_in.seller,
        ends_at=ends_at_ms,
        bg_color=auction_in.bg_color,
        icon=auction_in.icon,
        status="active"
    )
    db.add(db_auc)
    
    # Track listed item in seller profile
    sold_list = user.items_sold
    sold_list.append(new_id)
    user.items_sold = sold_list
    
    db.commit()
    db.refresh(db_auc)
    return db_auc

@app.post("/api/auctions/{auction_id}/bid", response_model=AuctionResponse)
def place_bid(auction_id: str, bid_in: BidCreate, db: Session = Depends(get_db)):
    settle_auctions(db)
    
    auction = db.query(DBAuction).filter(DBAuction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    if auction.status != "active":
        raise HTTPException(status_code=400, detail="Auction is no longer active")
        
    if auction.seller == bid_in.bidder:
        raise HTTPException(status_code=400, detail="Sellers cannot bid on their own listings")
    
    user = db.query(DBUser).filter(DBUser.username == bid_in.bidder).first()
    if not user:
        user = DBUser(username=bid_in.bidder, email=f"{bid_in.bidder}@bidsphere.io", hashed_password=hash_password("password123"), wallet_balance=2500.0)
        db.add(user)
        db.commit()

    min_increment = 5.0
    bids = db.query(DBBid).filter(DBBid.auction_id == auction_id).all()
    min_allowed = (auction.current_bid + min_increment) if bids else auction.starting_bid
    
    if bid_in.amount < min_allowed:
        raise HTTPException(status_code=400, detail=f"Bid amount must be at least {min_allowed}")
        
    if user.wallet_balance < bid_in.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    # Add bid
    db_bid = DBBid(
        auction_id=auction_id,
        bidder=bid_in.bidder,
        amount=bid_in.amount,
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
    db.add(db_bid)
    
    # Update auction current bid
    auction.current_bid = bid_in.amount
    
    # Add to user items bid on
    bidded_list = user.items_bid_on
    if auction_id not in bidded_list:
        bidded_list.append(auction_id)
        user.items_bid_on = bidded_list

    db.commit()
    db.refresh(auction)
    return auction

@app.post("/api/auctions/{auction_id}/buyout", response_model=AuctionResponse)
def buyout_auction(auction_id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    settle_auctions(db)
    
    bidder = payload.get("bidder")
    if not bidder:
        raise HTTPException(status_code=400, detail="Bidder username is required")
        
    auction = db.query(DBAuction).filter(DBAuction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
        
    if auction.status != "active":
        raise HTTPException(status_code=400, detail="Auction is no longer active")
        
    if not auction.buy_now_price:
        raise HTTPException(status_code=400, detail="This auction does not support buyouts")
        
    if auction.seller == bidder:
        raise HTTPException(status_code=400, detail="Sellers cannot buy out their own listings")
        
    user = db.query(DBUser).filter(DBUser.username == bidder).first()
    if not user:
        user = DBUser(username=bidder, email=f"{bidder}@bidsphere.io", hashed_password=hash_password("password123"), wallet_balance=2500.0)
        db.add(user)
        db.commit()
        
    if user.wallet_balance < auction.buy_now_price:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance for buyout")
        
    # Process buyout
    buyout_amount = auction.buy_now_price
    
    # Add buyout bid
    db_bid = DBBid(
        auction_id=auction_id,
        bidder=bidder,
        amount=buyout_amount,
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
    db.add(db_bid)
    
    auction.status = "sold"
    auction.current_bid = buyout_amount
    auction.ends_at = time.time() * 1000  # Ends now
    
    # Update winner profile
    won_list = user.items_won
    won_list.append(auction_id)
    user.items_won = won_list
    user.wallet_balance = user.wallet_balance - buyout_amount
    
    # Update seller profile
    seller = db.query(DBUser).filter(DBUser.username == auction.seller).first()
    if seller:
        sold_list = seller.items_sold
        sold_list.append(auction_id)
        seller.items_sold = sold_list
        seller.wallet_balance = seller.wallet_balance + buyout_amount
        
    db.commit()
    db.refresh(auction)
    return auction

@app.get("/api/user/{username}", response_model=UserResponse)
def get_user(username: str, db: Session = Depends(get_db)):
    settle_auctions(db)
    user = db.query(DBUser).filter(DBUser.username == username).first()
    if not user:
        # Create default on the fly
        user = DBUser(username=username, email=f"{username}@bidsphere.io", hashed_password=hash_password("password123"), wallet_balance=2500.0)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@app.post("/api/user/reset")
def reset_database(db: Session = Depends(get_db)):
    db.query(DBBid).delete()
    db.query(DBAuction).delete()
    db.query(DBUser).delete()
    db.commit()
    
    seed_data(db)
    return {"message": "Database successfully reset to mock data"}
