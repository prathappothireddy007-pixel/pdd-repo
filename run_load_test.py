import time
import requests
import statistics

URL = "http://localhost:8000/docs"
REQUESTS = 100

times = []

for _ in range(REQUESTS):
    start = time.time()
    try:
        r = requests.get(URL)
    except Exception as e:
        print(f"Error: {e}")
        continue
    end = time.time()
    times.append(end - start)

if not times:
    print("No successful requests")
    exit(1)

min_time = min(times) * 1000
max_time = max(times) * 1000
avg_time = statistics.mean(times) * 1000

print(f"{min_time:.0f}")
print(f"{max_time:.0f}")
print(f"{avg_time:.0f}")
