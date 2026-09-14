import urllib.request
import urllib.parse
import json
import ast
import re
import time

def fetch_wikipedia_info(product_name):
    # Simplify the product name for better Wikipedia matching
    # E.g. "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 512GB)" -> "Samsung Galaxy S24 Ultra"
    search_query = product_name.split("(")[0].strip()
    
    # Try an opensearch first to get the closest page title
    try:
        url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={urllib.parse.quote(search_query)}&limit=1&format=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if data and len(data) > 1 and data[1]:
                title = data[1][0]
            else:
                return "", ""
                
        # Now get the image and extract
        url = f"https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&exintro&explaintext&titles={urllib.parse.quote(title)}&format=json&pithumbsize=800"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data.get('query', {}).get('pages', {})
            for page_id in pages:
                page = pages[page_id]
                img_url = page.get('thumbnail', {}).get('source', '')
                extract = page.get('extract', '')
                return img_url, extract
    except Exception as e:
        print(f"Error fetching from Wikipedia for {product_name}: {e}")
    
    return "", ""

def update_seed_file():
    with open("app/seed_100_products.py", "r", encoding="utf-8") as f:
        content = f.read()

    start_idx = content.find("catalog = [")
    if start_idx == -1:
        print("Could not find catalog list")
        return
        
    bracket_count = 0
    end_idx = -1
    for i in range(start_idx + 10, len(content)):
        if content[i] == '[':
            bracket_count += 1
        elif content[i] == ']':
            bracket_count -= 1
            if bracket_count == 0:
                end_idx = i + 1
                break

    if end_idx == -1:
        print("Could not parse catalog list")
        return

    catalog_str = content[start_idx+10:end_idx]
    
    temp_str = catalog_str.replace("tv_id", "'tv_id'").replace("fv_id", "'fv_id'").replace("mv_id", "'mv_id'").replace("gv_id", "'gv_id'")
    
    try:
        catalog = ast.literal_eval(temp_str)
    except Exception as e:
        print(f"Error parsing catalog: {e}")
        return

    print(f"Loaded {len(catalog)} products.")
    
    new_catalog = []
    for index, item in enumerate(catalog):
        print(f"[{index+1}/{len(catalog)}] {item['name']}")
        img_url, specs = fetch_wikipedia_info(item["name"])
        
        original_desc = item.get("desc", "")
        if specs:
            # Clean up newlines and extra spaces from Wikipedia extract
            specs_clean = re.sub(r'\s+', ' ', specs).strip()
            if len(specs_clean) > 350:
                specs_clean = specs_clean[:350] + "..."
            item["desc"] = f"{original_desc} | Details: {specs_clean}"
            
        if img_url:
            # We add a fetched_image field which we will use in the seed logic
            item["fetched_image"] = img_url
            
        new_catalog.append(item)
        time.sleep(0.5)

    new_catalog_str = "[\n"
    for item in new_catalog:
        item_str = json.dumps(item)
        item_str = item_str.replace('"tv_id"', "tv_id").replace('"fv_id"', "fv_id").replace('"mv_id"', "mv_id").replace('"gv_id"', "gv_id")
        new_catalog_str += f"            {item_str},\n"
    new_catalog_str += "        ]"

    new_content = content[:start_idx + 10] + new_catalog_str + content[end_idx:]
    
    seeding_loop_old = 'img = get_authentic_product_image(item["name"], item["cat"])'
    seeding_loop_new = 'img = item.get("fetched_image") or get_authentic_product_image(item["name"], item["cat"])'
    new_content = new_content.replace(seeding_loop_old, seeding_loop_new)

    with open("app/seed_100_products.py", "w", encoding="utf-8") as f:
        f.write(new_content)
        
    print("Successfully updated seed file app/seed_100_products.py")

if __name__ == "__main__":
    update_seed_file()
