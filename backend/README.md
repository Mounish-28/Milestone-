# ShopSense AI — Admin & Vendor Backend API Service

This folder contains the **Admin & Vendor Backend API Service** for ShopSense AI.

## 🚀 Key Modules & Endpoints
- **Vendor Governance & Verification**: `/admin/` & `/vendors/`
- **Product Catalog Management**: `/products/`
- **Live Inventory Tracking & ML Forecasting**: `/inventory/`
- **Customer Segmentation (RFM + K-Means)**: `/segmentation/`
- **Business Intelligence & Analytics**: `/analytics/`
- **Aadhaar e-KYC & Security Key Auth**: `/auth/`
- **Gemini Autonomous AI Assistant**: `/assistant/`

## ⚙️ How to Run
```bash
# From project root:
cd backend
python -m uvicorn main:app --port 8000 --reload
```

## 🌐 OpenAPI Documentation
- Interactive Swagger UI: `http://localhost:8000/docs`
- Redoc Documentation: `http://localhost:8000/redoc`
