import urllib.request
import urllib.parse
import re
import json

# Search Bing for Amazon/Flipkart/Official images and verify HTTP 200
def get_verified_image(query, preferred_domains=['m.media-amazon.com', 'rukminim2.flixcart.com', 'rukminim1.flixcart.com', 'images.samsung.com', 'store.storeimages.cdn-apple.com', 'static.nike.com']):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=headers)
    try:
        html = urllib.request.urlopen(req, timeout=7).read().decode('utf-8', errors='ignore')
        murls = re.findall(r'&quot;murl&quot;:&quot;(https?://[^&]+)&quot;', html)
        # First check preferred domains
        for domain in preferred_domains:
            for u in murls:
                if domain in u:
                    if verify_url(u):
                        return u
        # Fallback to any valid high-res image
        for u in murls[:10]:
            if not any(x in u for x in ['logo', 'icon', 'wallpaper', 'vector', 'transparent', 'drawing']):
                if verify_url(u):
                    return u
    except Exception as e:
        print(f"Error searching {query}: {e}")
    return None

def verify_url(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=4)
        return res.status == 200
    except:
        return False

if __name__ == "__main__":
    queries = [
        "Samsung Galaxy S24 Ultra Titanium Gray amazon",
        "Apple iPhone 16 Pro Max Desert Titanium amazon",
        "Google Pixel 9 Pro XL Obsidian amazon",
        "Sony WH-1000XM5 wireless headphones amazon",
        "PlayStation 5 Slim disc edition amazon",
        "Nike Air Jordan 1 Retro High OG Chicago amazon"
    ]
    for q in queries:
        img = get_verified_image(q)
        print(f"{q} => {img}")
