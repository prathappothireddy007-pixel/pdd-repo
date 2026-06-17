import json
from sqlalchemy import create_engine, Column, String, Float, Integer, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

DATABASE_URL = "sqlite:///./bidsphere.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class DBUser(Base):
    __tablename__ = "users"

    username = Column(String, primary_key=True, index=True)
    email = Column(String)
    hashed_password = Column(String, nullable=True) # Hashed password using hashlib
    wallet_balance = Column(Float, default=2500.0)
    role = Column(String, default="user") # user or admin
    
    # Store list of item IDs as JSON string
    _items_won = Column("items_won", Text, default="[]")
    _items_bid_on = Column("items_bid_on", Text, default="[]")
    _items_sold = Column("items_sold", Text, default="[]")

    @property
    def items_won(self):
        try:
            return json.loads(self._items_won or "[]")
        except:
            return []

    @items_won.setter
    def items_won(self, value):
        self._items_won = json.dumps(value)

    @property
    def items_bid_on(self):
        try:
            return json.loads(self._items_bid_on or "[]")
        except:
            return []

    @items_bid_on.setter
    def items_bid_on(self, value):
        self._items_bid_on = json.dumps(value)

    @property
    def items_sold(self):
        try:
            return json.loads(self._items_sold or "[]")
        except:
            return []

    @items_sold.setter
    def items_sold(self, value):
        self._items_sold = json.dumps(value)

class DBAuction(Base):
    __tablename__ = "auctions"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String)
    starting_bid = Column(Float)
    buy_now_price = Column(Float, nullable=True)
    current_bid = Column(Float)
    seller = Column(String)
    ends_at = Column(Float)  # Timestamp in milliseconds
    duration_hours = Column(Float, default=24.0) # original duration preserved for approvals
    bg_color = Column(String)  # gradient style or hex color
    icon = Column(String)  # emoji or key name
    status = Column(String, default="active")  # active, pending, ended, sold

    bids = relationship("DBBid", back_populates="auction", cascade="all, delete-orphan")

class DBBid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    auction_id = Column(String, ForeignKey("auctions.id"))
    bidder = Column(String)
    amount = Column(Float)
    timestamp = Column(String)  # ISO 8601 string

    auction = relationship("DBAuction", back_populates="bids")

class DBPayment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, index=True)
    amount = Column(Float)
    payment_method = Column(String)  # "Card" or "UPI"
    transaction_reference = Column(String)
    timestamp = Column(String)

class DBDelivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    auction_id = Column(String, unique=True, index=True)
    item_title = Column(String)
    buyer = Column(String)
    seller = Column(String)
    price = Column(Float)
    shipping_address = Column(String)
    tracking_number = Column(String, unique=True)
    delivery_status = Column(String, default="Pending Shipment") # "Pending Shipment", "In Transit", "Delivered"
    last_updated = Column(String)

def init_db():
    Base.metadata.create_all(bind=engine)
