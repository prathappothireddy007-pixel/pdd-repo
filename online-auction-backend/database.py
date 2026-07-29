import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

# Initialize the Supabase client
use_mock = os.environ.get("USE_MOCK_DB", "False").lower() == "true"
if use_mock:
    from mock_supabase import MockSupabaseClient
    supabase_mock = MockSupabaseClient()
else:
    # Do not instantiate a global client to avoid httpx socket errors across threads on Windows
    pass

def get_supabase():
    if use_mock:
        return supabase_mock
    return create_client(url, key)

def init_db():
    pass
