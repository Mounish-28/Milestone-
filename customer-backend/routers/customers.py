from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

try:
    from database import get_db
    import models, schemas
except ImportError:
    from app.database import get_db
    from app import models, schemas

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


@router.post("/", response_model=schemas.CustomerResponse)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Customer).filter(
        models.Customer.email == customer.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Customer already exists with this email"
        )

    new_customer = models.Customer(**customer.dict())

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


@router.get("/", response_model=list[schemas.CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()


@router.get("/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=schemas.CustomerResponse)
def update_customer(customer_id: int, customer_data: schemas.CustomerUpdate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer.name = customer_data.name
    customer.email = customer_data.email
    customer.phone = customer_data.phone
    customer.city = customer_data.city
    if customer_data.country:
        customer.country = customer_data.country

    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    db.delete(customer)
    db.commit()
    return {"message": "Customer deleted successfully"}


# -------------------------------------------------------------
# Customer Address Management Endpoints
# -------------------------------------------------------------

@router.get("/{customer_id}/addresses", response_model=list[schemas.CustomerAddressResponse])
def get_customer_addresses(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        # Fallback or auto-generate
        return []
    return db.query(models.CustomerAddress).filter(models.CustomerAddress.customer_id == customer_id).all()


@router.post("/{customer_id}/addresses", response_model=schemas.CustomerAddressResponse)
def add_customer_address(customer_id: int, data: schemas.CustomerAddressCreate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # If new address is default, reset other defaults
    if data.is_default:
        db.query(models.CustomerAddress).filter(
            models.CustomerAddress.customer_id == customer_id
        ).update({"is_default": False})

    new_addr = models.CustomerAddress(
        customer_id=customer_id,
        name=data.name,
        phone=data.phone,
        address_line=data.address_line,
        locality=data.locality,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        address_type=data.address_type or "Home",
        is_default=data.is_default or False
    )
    db.add(new_addr)
    db.commit()
    db.refresh(new_addr)
    return new_addr


@router.delete("/{customer_id}/addresses/{address_id}")
def delete_customer_address(customer_id: int, address_id: int, db: Session = Depends(get_db)):
    addr = db.query(models.CustomerAddress).filter(
        models.CustomerAddress.id == address_id,
        models.CustomerAddress.customer_id == customer_id
    ).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")

    db.delete(addr)
    db.commit()
    return {"message": "Address removed successfully"}


@router.patch("/{customer_id}/addresses/{address_id}/set-default")
def set_default_customer_address(customer_id: int, address_id: int, db: Session = Depends(get_db)):
    # Unset all
    db.query(models.CustomerAddress).filter(
        models.CustomerAddress.customer_id == customer_id
    ).update({"is_default": False})

    addr = db.query(models.CustomerAddress).filter(
        models.CustomerAddress.id == address_id,
        models.CustomerAddress.customer_id == customer_id
    ).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")

    addr.is_default = True
    db.commit()
    return {"status": "success", "message": "Default address updated"}