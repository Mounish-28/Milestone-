# ShopSense AI — Customer Marketplace Backend API Service

This folder contains the **Customer Storefront Backend API Service** for the ShopSense AI Marketplace.

## 🚀 Key Modules & Endpoints
- **Product Catalog Search & Browsing**: `/products/`
- **Customer Checkout & Order Tracking**: `/transactions/`
- **Customer Profile & Address Book**: `/customers/`
- **AI Top-Selling & Related Recommendations**: `/recommendations/`
- **Multilingual Gemini Shopping Assistant & Voice Search**: `/assistant/`
- **Customer Authentication & Google Sign-In**: `/auth/`

## ⚙️ How to Run
```bash
# From project root:
cd customer-backend
python -m uvicorn main:app --port 8001 --reload
```

## 🌐 OpenAPI Documentation
- Interactive Swagger UI: `http://localhost:8001/docs`
- Redoc Documentation: `http://localhost:8001/redoc`
