from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

try:
    from database import get_db
    from models import Product, Vendor
    from schemas import ProductCreate, ProductResponse, ProductUpdate
except ImportError:
    from app.database import get_db
    from app.models import Product, Vendor
    from app.schemas import ProductCreate, ProductResponse, ProductUpdate


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.post("/", response_model=ProductResponse)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):
    vendor = db.query(Vendor).filter(
        Vendor.id == product_data.vendor_id
    ).first()

    if not vendor:
        vendor = Vendor(id=product_data.vendor_id, name="Default Vendor", email=f"vendor{product_data.vendor_id}@shopsense.com")
        db.add(vendor)
        db.commit()

    if product_data.price <= 0:
        raise HTTPException(
            status_code=400,
            detail="Product price must be greater than zero"
        )

    new_product = Product(
        name=product_data.name,
        category=product_data.category,
        price=product_data.price,
        stock=product_data.stock or "In Stock",
        stock_quantity=product_data.stock_quantity if product_data.stock_quantity is not None else 25,
        reorder_threshold=product_data.reorder_threshold if product_data.reorder_threshold is not None else 10,
        description=product_data.description,
        image_url=product_data.image_url,
        vendor_id=product_data.vendor_id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@router.get("/", response_model=list[ProductResponse])
def get_all_products(
    category: str | None = None,
    search: str | None = None,
    vendor_id: int | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if vendor_id is not None:
        query = query.filter(Product.vendor_id == vendor_id)
    if category and category.lower() != "all":
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) |
            (Product.description.ilike(f"%{search}%")) |
            (Product.category.ilike(f"%{search}%"))
        )
    return query.all()


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    product.name = product_data.name
    product.category = product_data.category
    product.price = product_data.price
    product.stock = product_data.stock or product.stock
    if product_data.stock_quantity is not None:
        product.stock_quantity = product_data.stock_quantity
    if product_data.reorder_threshold is not None:
        product.reorder_threshold = product_data.reorder_threshold
    if product_data.description is not None:
        product.description = product_data.description
    if product_data.image_url is not None:
        product.image_url = product_data.image_url

    db.commit()
    db.refresh(product)

    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}