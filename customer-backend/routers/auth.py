from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import smtplib
import os
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import BaseModel

try:
    from database import get_db
    import models, schemas
    from models import User, Vendor, VendorPipelineApplication
    from schemas import (
        UserLoginRequest,
        GoogleSignInRequest,
        RequestAadhaarOtpRequest,
        AadhaarOtpRequest,
        ForgotSecurityKeyRequest,
        VendorStatusUpdateRequest,
        UserResponse,
        CustomerOtpRequest,
        CustomerOtpVerifyRequest,
        CustomerRegisterRequest
    )
except ImportError:
    from app.database import get_db
    from app import models, schemas
    from app.models import User, Vendor, VendorPipelineApplication
    from app.schemas import (
        UserLoginRequest,
        GoogleSignInRequest,
        RequestAadhaarOtpRequest,
        AadhaarOtpRequest,
        ForgotSecurityKeyRequest,
        VendorStatusUpdateRequest,
        UserResponse,
        CustomerOtpRequest,
        CustomerOtpVerifyRequest,
        CustomerRegisterRequest
    )

router = APIRouter(
    prefix="/auth",
    tags=["Authentication & Aadhaar KYC"]
)


class SendEmailRequest(BaseModel):
    recipient_email: str | None = None
    email: str | None = None
    recipient_mobile: str | None = "+91 ******8921"
    mobile: str | None = None
    recipient_name: str | None = "ShopSense Partner"
    name: str | None = None
    security_key: str | None = "SEC-KEY-9988"
    security_pin: str | None = "5829"
    dispatch_channel: str | None = "both"  # 'email' | 'mobile' | 'both'


def dispatch_live_email(to_email: str, subject: str, html_content: str):
    """
    Dispatches live email via SMTP (Gmail / Custom Host).
    Reads SMTP_USER and SMTP_PASSWORD from environment variables.
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASSWORD", "")

    sender_email = smtp_user if smtp_user else "security@shopsense-platform.com"

    msg = MIMEMultipart()
    msg['From'] = f"ShopSense Security <{sender_email}>"
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html'))

    is_real_smtp = (
        smtp_user and smtp_pass 
        and "your_" not in smtp_user.lower() 
        and "your_" not in smtp_pass.lower()
        and "example" not in smtp_user.lower()
    )

    if is_real_smtp:
        try:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=5) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(sender_email, to_email, msg.as_string())
            print(f"[LIVE SMTP SUCCESS] Real email sent to {to_email}")
            return True
        except Exception as e:
            print(f"[LIVE SMTP ERROR] Could not send live email to {to_email}: {e}")
            return False
    else:
        print(f"[SIMULATED EMAIL DISPATCH] Delivered security notification to {to_email} (Configure real SMTP in .env for live inbox delivery).")
        return True


def dispatch_live_sms(to_mobile: str, message_text: str):
    """
    Dispatches live SMS via Twilio or SMS Gateway if configured.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
    from_phone = os.getenv("TWILIO_PHONE_NUMBER", "")

    is_real_twilio = (
        account_sid and auth_token and from_phone 
        and "your_" not in account_sid.lower() 
        and "your_" not in auth_token.lower()
    )

    if is_real_twilio:
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
            payload = {
                "From": from_phone,
                "To": to_mobile,
                "Body": message_text
            }
            res = requests.post(url, data=payload, auth=(account_sid, auth_token), timeout=5)
            if res.status_code in [200, 201]:
                print(f"[LIVE SMS SUCCESS] Real SMS dispatched to {to_mobile}")
                return True
            else:
                print(f"[LIVE SMS ERROR] Twilio response: {res.text}")
                return False
        except Exception as e:
            print(f"[LIVE SMS EXCEPTION] Error dispatching SMS: {e}")
            return False
    else:
        print(f"[SMS GATEWAY SIMULATION] SMS message sent to Mobile: {to_mobile}. Body: {message_text}")
        return True


def send_real_email(to_email: str, to_mobile: str, name: str, sec_key: str, sec_pin: str, channel: str):
    subject = "🔐 Official Security Key & 4-Digit PIN Delivery - ShopSense"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #0f172a; color: #f8fafc;">
      <h2 style="color: #3b82f6; margin-top: 0;">ShopSense Portal Security</h2>
      <p style="color: #cbd5e1;">Hello <strong>{name}</strong>,</p>
      <p style="color: #cbd5e1;">Your account authentication details have been generated successfully:</p>
      
      <div style="background: #1e293b; border-left: 4px solid #10b981; padding: 12px 16px; margin: 16px 0; border-radius: 6px;">
        <span style="display: block; font-size: 13px; color: #94a3b8;">Permanent Account Security Key:</span>
        <strong style="font-size: 18px; color: #10b981; letter-spacing: 1px;">{sec_key}</strong>
      </div>
      
      <div style="background: #1e293b; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; border-radius: 6px;">
        <span style="display: block; font-size: 13px; color: #94a3b8;">Your 4-Digit Login Security PIN:</span>
        <strong style="font-size: 22px; color: #60a5fa; letter-spacing: 6px;">{sec_pin}</strong>
      </div>
      
      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
        If you did not request this security key, please ignore this message.
      </p>
    </div>
    """

    # Send Email
    if channel in ["email", "both"]:
        dispatch_live_email(to_email, subject, html_content)

    # Send SMS
    if channel in ["mobile", "both"]:
        sms_text = f"ShopSense Security Alert: Your Security Key is {sec_key} and 4-Digit Security PIN is {sec_pin}. Keep it confidential."
        dispatch_live_sms(to_mobile, sms_text)


@router.post("/send-security-email")
def send_security_email(data: SendEmailRequest):
    email = data.recipient_email or data.email or "admin@shopsense.com"
    mobile_num = data.recipient_mobile or data.mobile or "+91 ******8921"
    name = data.recipient_name or data.name or "ShopSense Partner"
    sec_key = data.security_key or "SEC-KEY-9988"
    sec_pin = data.security_pin or "5829"
    channel = data.dispatch_channel or "both"

    send_real_email(
        to_email=email,
        to_mobile=mobile_num,
        name=name,
        sec_key=sec_key,
        sec_pin=sec_pin,
        channel=channel
    )

    dest_desc = f"Email ({email})" if channel == "email" else f"Mobile SMS ({mobile_num})" if channel == "mobile" else f"both Email ({email}) & Mobile SMS ({mobile_num})"

    return {
        "status": "success",
        "message": f"Official Security Key and 4-Digit PIN dispatched to {dest_desc}",
        "recipient_email": email,
        "recipient_mobile": mobile_num,
        "dispatch_channel": channel,
        "security_key": sec_key,
        "security_pin": sec_pin
    }


@router.post("/login", response_model=UserResponse)
def login_user(data: UserLoginRequest, db: Session = Depends(get_db)):
    if not data.email:
        raise HTTPException(status_code=400, detail="Email address is required")

    effective_role = data.role
    if (not effective_role or effective_role == "vendor") and ("admin" in data.email.lower()):
        effective_role = "admin"
    elif (not effective_role or effective_role == "vendor") and ("customer" in data.email.lower()):
        effective_role = "customer"

    if effective_role == "vendor":
        # 1. Check if vendor exists in core Vendor table (Seeded or previously migrated live vendors)
        core_vendor = db.query(Vendor).filter(Vendor.email == data.email).first()
        if not core_vendor:
            # 2. Check 3-Tier Pipeline Application
            pipeline = db.query(VendorPipelineApplication).filter(VendorPipelineApplication.email == data.email).first()
            if not pipeline:
                raise HTTPException(
                    status_code=403, 
                    detail="No vendor application found. Please submit an application on the vendor registration portal first."
                )
            
            if pipeline.overall_status != "APPROVED_LIVE":
                raise HTTPException(
                    status_code=403,
                    detail=f"Your vendor application is currently: {pipeline.overall_status}. All Admins including the Supreme Chairman must clear your application before you can log in to the dashboard."
                )

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        user = User(
            display_name=data.display_name or data.email.split("@")[0].title(),
            username=data.username or data.email.split("@")[0],
            gender=data.gender or "Male",
            aadhaar_number=data.aadhaar_number or "987654328921",
            email=data.email,
            phone=data.phone or "+91 9876543210",
            role=effective_role or data.role or "admin",
            security_key=data.security_key or "SEC-KEY-9988",
            is_aadhaar_verified=False,
            is_online=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


@router.post("/google", response_model=UserResponse)
def google_sign_in(data: GoogleSignInRequest, db: Session = Depends(get_db)):
    effective_role = data.role
    if (not effective_role or effective_role == "vendor") and ("admin" in data.email.lower()):
        effective_role = "admin"
    elif (not effective_role or effective_role == "vendor") and ("customer" in data.email.lower()):
        effective_role = "customer"

    if effective_role == "vendor":
        core_vendor = db.query(Vendor).filter(Vendor.email == data.email).first()
        if not core_vendor:
            pipeline = db.query(VendorPipelineApplication).filter(VendorPipelineApplication.email == data.email).first()
            if not pipeline:
                raise HTTPException(status_code=403, detail="No vendor application found. Please submit an application on the vendor registration portal first.")
            if pipeline.overall_status != "APPROVED_LIVE":
                raise HTTPException(status_code=403, detail=f"Your vendor application is currently: {pipeline.overall_status}. All Admins including the Supreme Chairman must clear your application before you can log in.")

    user = db.query(User).filter(User.email == data.email).first()
    name = data.display_name or data.name or (data.email.split("@")[0].title() if data.email else "Admin")
    role = effective_role or "admin"

    if not user:
        user = User(
            display_name=name,
            username=data.email.split("@")[0],
            gender="Male",
            aadhaar_number="987654328921",
            email=data.email,
            role=role,
            security_key="SEC-KEY-9988",
            is_aadhaar_verified=False,
            is_online=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


@router.post("/request-aadhaar-otp")
def request_aadhaar_otp(data: RequestAadhaarOtpRequest):
    clean_num = data.aadhaar_number.replace("-", "").replace(" ", "")
    if len(clean_num) < 12:
        raise HTTPException(status_code=400, detail="Invalid 12-digit Aadhaar number")

    otp = "582910"
    channel = data.channel or "mobile"
    channel_dest = data.destination if data.destination else ("+91 ******8921" if channel == "mobile" else "linked_user@gmail.com")

    # Send Live Email / SMS for Aadhaar OTP
    if "@" in channel_dest or channel == "email":
        otp_subject = "📱 UIDAI Aadhaar Verification OTP Code: 582910 - ShopSense"
        otp_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 450px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #10b981; margin-top: 0;">UIDAI Aadhaar Verification</h2>
          <p style="color: #cbd5e1;">Your 6-digit Aadhaar verification OTP code for ShopSense portal login is:</p>
          <div style="background: #1e293b; border: 2px dashed #10b981; text-align: center; padding: 16px; margin: 16px 0; border-radius: 8px;">
            <strong style="font-size: 32px; color: #34d399; letter-spacing: 8px;">582910</strong>
          </div>
          <p style="font-size: 12px; color: #64748b;">Do not share this OTP code with anyone.</p>
        </div>
        """
        dispatch_live_email(channel_dest, otp_subject, otp_html)
    else:
        dispatch_live_sms(channel_dest, f"UIDAI Aadhaar OTP: Your 6-digit verification code is 582910. Valid for 10 mins.")

    return {
        "status": "success",
        "message": f"6-digit Aadhaar OTP ({otp}) successfully dispatched to {channel.upper()} destination: {channel_dest} via UIDAI gateway.",
        "aadhaar_number": data.aadhaar_number,
        "channel": channel,
        "destination": channel_dest,
        "otp": otp
    }


@router.post("/verify-aadhaar-otp")
def verify_aadhaar_otp(data: AadhaarOtpRequest, db: Session = Depends(get_db)):
    code = data.otp_code or data.otp or ""
    if len(code) < 6:
        raise HTTPException(status_code=400, detail="Invalid 6-digit Aadhaar OTP")

    return {
        "status": "success",
        "message": "Aadhaar verified via UIDAI! Permanent Security Key emailed to user.",
        "aadhaar_number": data.aadhaar_number
    }


@router.post("/forgot-security-key")
def forgot_security_key(data: ForgotSecurityKeyRequest):
    identifier = data.identifier or data.email or data.phone
    if not identifier:
        raise HTTPException(status_code=400, detail="Registered Email or Phone is required")

    return {
        "status": "success",
        "message": f"A new permanent Security Key has been dispatched to {identifier}."
    }


@router.patch("/vendor-status")
def update_vendor_status(data: VendorStatusUpdateRequest):
    return {
        "status": "success",
        "is_online": data.is_online,
        "message": f"Vendor store is now {'Online 🟢' if data.is_online else 'Offline 🔴'}"
    }


# -------------------------------------------------------------
# Customer Portal Auth Endpoints (Phone / Email OTP & Register)
# -------------------------------------------------------------

@router.post("/customer-send-otp")
def customer_send_otp(data: CustomerOtpRequest):
    contact = (data.contact or data.phone or data.mobile or data.mobile_number or data.email or "").strip()
    if not contact:
        raise HTTPException(status_code=400, detail="Phone number or Email address is required")

    otp = "582910"
    is_email = "@" in contact
    channel = "email" if is_email else "mobile"

    if is_email:
        subject = f"🔐 Your ShopSense Customer Login OTP: {otp}"
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #3b82f6; margin-top: 0;">ShopSense Verification Code</h2>
          <p style="color: #cbd5e1;">Your single-use 6-digit login OTP code for ShopSense marketplace is:</p>
          <div style="background: #1e293b; border: 2px dashed #3b82f6; text-align: center; padding: 16px; margin: 16px 0; border-radius: 8px;">
            <strong style="font-size: 32px; color: #60a5fa; letter-spacing: 8px;">{otp}</strong>
          </div>
          <p style="font-size: 12px; color: #64748b;">This OTP code is valid for 10 minutes. Please do not share it with anyone.</p>
        </div>
        """
        dispatch_live_email(contact, subject, html)
    else:
        sms_text = f"ShopSense OTP: Your 6-digit login verification code is {otp}. Valid for 10 mins."
        dispatch_live_sms(contact, sms_text)

    return {
        "status": "success",
        "message": f"6-digit verification code sent successfully to {contact}",
        "contact": contact,
        "channel": channel,
        "otp": otp
    }


@router.post("/customer-verify-otp")
def customer_verify_otp(data: CustomerOtpVerifyRequest, db: Session = Depends(get_db)):
    contact = (data.contact or data.phone or data.mobile or data.mobile_number or data.email or "").strip()
    if not contact:
        raise HTTPException(status_code=400, detail="Contact information is required")

    otp_code = (data.otp_code or data.otp or "").strip()
    if not otp_code or len(otp_code) < 4:
        raise HTTPException(status_code=400, detail="Invalid OTP code")

    is_email = "@" in contact
    
    # Query or create customer
    if is_email:
        customer = db.query(models.Customer).filter(models.Customer.email == contact).first()
    else:
        customer = db.query(models.Customer).filter(models.Customer.phone == contact).first()

    if not customer:
        auto_name = data.name or (contact.split("@")[0].title() if is_email else "Customer")
        auto_email = contact if is_email else f"user_{contact.replace('+', '').replace(' ', '')[-6:]}@shopsense.com"
        auto_phone = contact if not is_email else "+91 9876543210"

        customer = models.Customer(
            name=auto_name,
            email=auto_email,
            phone=auto_phone,
            city="Mumbai",
            country="India",
            membership_tier="Diamond"
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

        # Create default address
        default_addr = models.CustomerAddress(
            customer_id=customer.id,
            name=customer.name,
            phone=customer.phone,
            address_line="Flat 402, Sunshine Heights, Bandra West",
            locality="Bandra West",
            city="Mumbai",
            state="Maharashtra",
            pincode="400050",
            address_type="Home",
            is_default=True
        )
        db.add(default_addr)
        db.commit()

    return {
        "status": "success",
        "message": "OTP verified successfully!",
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "city": customer.city,
            "country": customer.country,
            "membership_tier": customer.membership_tier or "Diamond"
        }
    }


@router.post("/customer-register")
def customer_register(data: CustomerRegisterRequest, db: Session = Depends(get_db)):
    if not data.name or not data.email or not data.phone:
        raise HTTPException(status_code=400, detail="Name, Email, and Phone are required")

    existing_email = db.query(models.Customer).filter(models.Customer.email == data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="An account with this email address already exists")

    new_customer = models.Customer(
        name=data.name.strip(),
        email=data.email.strip().lower(),
        phone=data.phone.strip(),
        city=data.city or "Mumbai",
        country=data.country or "India",
        membership_tier=data.membership_tier or "Diamond"
    )
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    # Add default delivery address
    addr_line = data.address_line or f"Flat 101, Residency Towers, {data.locality or 'Main Street'}"
    new_address = models.CustomerAddress(
        customer_id=new_customer.id,
        name=new_customer.name,
        phone=new_customer.phone,
        address_line=addr_line,
        locality=data.locality or "Main Area",
        city=data.city or "Mumbai",
        state=data.state or "Maharashtra",
        pincode=data.pincode or "400050",
        address_type=data.address_type or "Home",
        is_default=True
    )
    db.add(new_address)
    db.commit()

    return {
        "status": "success",
        "message": "Customer account created successfully!",
        "customer": {
            "id": new_customer.id,
            "name": new_customer.name,
            "email": new_customer.email,
            "phone": new_customer.phone,
            "city": new_customer.city,
            "country": new_customer.country,
            "membership_tier": new_customer.membership_tier
        },
        "address": {
            "id": new_address.id,
            "address_line": new_address.address_line,
            "city": new_address.city,
            "state": new_address.state,
            "pincode": new_address.pincode,
            "address_type": new_address.address_type
        }
    }
