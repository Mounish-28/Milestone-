import urllib.request
import urllib.parse
import re

def search_bing_images(query):
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}&form=HDRSC2&first=1"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        html = urllib.request.urlopen(req, timeout=8).read().decode('utf-8', errors='ignore')
        # Bing embeds images in m="{...&quot;murl&quot;:&quot;https://...&quot;...}"
        murls = re.findall(r'&quot;murl&quot;:&quot;(https?://[^&]+)&quot;', html)
        print(f"Bing found {len(murls)} images for '{query}':")
        for u in murls[:5]:
            print(" ->", u)
        return murls
    except Exception as e:
        print(f"Bing error: {e}")
        return []

if __name__ == "__main__":
    search_bing_images("Samsung Galaxy S24 Ultra 5G amazon.in")
