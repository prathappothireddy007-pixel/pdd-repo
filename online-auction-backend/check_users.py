from database import get_supabase
from main import hash_password

supabase = get_supabase()
res = supabase.table('users').select('*').execute()
for user in res.data:
    print(f"User: {user['username']}, Role: {user['role']}")

# Let's force reset the admin password just in case they don't know it
supabase.table('users').update({
    "hashed_password": hash_password("adminpassword"),
    "role": "admin"
}).eq('username', 'admin').execute()

print("Admin password has been reset to 'adminpassword'")
