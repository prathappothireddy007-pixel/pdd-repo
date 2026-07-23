import os
import json
from database import get_supabase
from main import hash_password

def seed_custom():
    supabase = get_supabase()
    
    users_to_add = [
        {"username": "test_user_7554", "email": "test_user_7554@bidsphere.io", "password": "password123", "role": "user"},
        {"username": "buyer123", "email": "buyer123@bidsphere.io", "password": "password123", "role": "user"},
        {"username": "BuyerOne", "email": "BuyerOne@bidsphere.io", "password": "password123", "role": "user"},
        {"username": "venkata_subhash_reddy", "email": "venkata@bidsphere.io", "password": "098765", "role": "user"},
        {"username": "testuser", "email": "testuser@bidsphere.io", "password": "password123", "role": "user"},
        {"username": "sanekommuvsr", "email": "sanekommuvsr@gmail.com", "password": "12345678", "role": "user"},
        {"username": "admin", "email": "admin@bidsphere.io", "password": "admin123", "role": "admin"},
        {"username": "seller123", "email": "seller123@bidsphere.io", "password": "password123", "role": "user"},
        {"username": "buyer_test", "email": "buyer_test@bidsphere.io", "password": "password123", "role": "user"},
        {"username": "admin3", "email": "admin3@bidsphere.io", "password": "adminpass3", "role": "admin"},
        {"username": "reddy", "email": "reddy@bidsphere.io", "password": "123456", "role": "user"},
        {"username": "SellerOne", "email": "SellerOne@bidsphere.io", "password": "password123", "role": "user"},
        {"username": "user", "email": "user@bidsphere.io", "password": "user123", "role": "user"},
        {"username": "myworker", "email": "myworker@bidsphere.io", "password": "password123", "role": "worker"},
        {"username": "admin2", "email": "admin2@bidsphere.io", "password": "adminpass2", "role": "admin"},
        {"username": "testbuyer", "email": "testbuyer@bidsphere.io", "password": "password123", "role": "user"}
    ]
    
    formatted_users = []
    for u in users_to_add:
        formatted_users.append({
            "username": u["username"],
            "email": u["email"],
            "hashed_password": hash_password(u["password"]),
            "wallet_balance": 2500.0,
            "role": u["role"],
            "items_won": "[]",
            "items_bid_on": "[]",
            "items_sold": "[]"
        })
        
    res = supabase.table('users').insert(formatted_users).execute()
    print("Custom users seeded successfully!")

if __name__ == "__main__":
    seed_custom()
