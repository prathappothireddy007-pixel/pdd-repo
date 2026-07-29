import os
from sqlalchemy import create_engine

url = "postgresql://postgres:Reddy%40140405S@db.cescsdalxkujhivgacfo.supabase.co:5432/postgres"

try:
    engine = create_engine(url)
    connection = engine.connect()
    print("SUCCESS: Connected to DB!")
    connection.close()
except Exception as e:
    print(f"FAILED: {e}")

