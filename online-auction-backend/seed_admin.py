from database import get_supabase
from main import hash_password
import json

def seed_admin():
    supabase = get_supabase()
    username = "admin"
    email = "admin@bidsphere.io"
    password = "adminpassword"
    
    # Check if admin exists
    res = supabase.table('users').select('*').eq('username', username).execute()
    if res.data:
        print("Admin user already exists.")
        return
        
    user_data = {
        "username": username,
        "email": email,
        "hashed_password": hash_password(password),
        "wallet_balance": 10000.0,
        "role": "admin",
        "items_won": "[]",
        "items_bid_on": "[]",
        "items_sold": "[]"
    }
    
    supabase.table('users').insert(user_data).execute()
    print(f"Admin user created successfully! Username: {username}, Password: {password}")

if __name__ == "__main__":
    seed_admin()
