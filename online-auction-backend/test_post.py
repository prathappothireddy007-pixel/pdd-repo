import urllib.request
import json
import urllib.error

data = json.dumps({
    'title': 'test',
    'description': '1000',
    'category': 'Electronics',
    'starting_bid': 1.0,
    'buy_now_price': 10.0,
    'seller': 'admin',
    'duration_hours': 24,
    'bg_color': 'red',
    'icon': 'box',
    'image_url': 'https://example.com/a.jpg'
}).encode('utf-8')

req = urllib.request.Request('http://localhost:8000/api/auctions', data=data, headers={'Content-Type':'application/json'})

try:
    response = urllib.request.urlopen(req)
    print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print(e.read().decode('utf-8'))
