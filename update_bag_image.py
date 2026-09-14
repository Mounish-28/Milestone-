import sqlite3

conn = sqlite3.connect('shopsense.db')
c = conn.cursor()
c.execute("UPDATE products SET image_url='https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80' WHERE name LIKE '%Premium Leather Laptop Bag%'")
conn.commit()
print(c.rowcount, 'rows updated')
conn.close()
