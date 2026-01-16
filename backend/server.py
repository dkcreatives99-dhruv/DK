from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dk-kinetic-digital-secret-key-2024-secure')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI(title="DK Kinetic Digital API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===================== MODELS =====================

# Auth Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Contact Model (existing - keeping for website contact form)
class ContactSubmissionCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    service_interest: Optional[str] = None
    message: str

class ContactResponse(BaseModel):
    success: bool
    message: str
    id: Optional[str] = None

# Business Model
class BusinessCreate(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gstin: str
    phone: Optional[str] = None
    email: Optional[str] = None
    logo_url: Optional[str] = None

class BusinessResponse(BaseModel):
    id: str
    user_id: str
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gstin: str
    phone: Optional[str] = None
    email: Optional[str] = None
    logo_url: Optional[str] = None
    created_at: str
    updated_at: str

# Customer Model
class CustomerCreate(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gstin: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class CustomerResponse(BaseModel):
    id: str
    user_id: str
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gstin: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    created_at: str
    updated_at: str

# Product Model
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    hsn_code: Optional[str] = None
    unit: str = "Nos"
    price: float
    gst_rate: float = 18

class ProductResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    hsn_code: Optional[str] = None
    unit: str
    price: float
    gst_rate: float
    created_at: str
    updated_at: str

# Invoice Item Model
class InvoiceItemCreate(BaseModel):
    product_id: Optional[str] = None
    product_name: str
    description: Optional[str] = None
    hsn_code: Optional[str] = None
    quantity: float = 1
    unit: str = "Nos"
    rate: float
    gst_rate: float = 18
    amount: float
    gst_amount: float
    total: float

# Invoice Model
class InvoiceCreate(BaseModel):
    customer_id: str
    invoice_date: str
    discount_type: Optional[str] = None
    discount_value: float = 0
    notes: Optional[str] = None
    items: List[InvoiceItemCreate]

class InvoiceResponse(BaseModel):
    id: str
    user_id: str
    invoice_number: str
    invoice_date: str
    customer_id: str
    customer: Optional[dict] = None
    subtotal: float
    discount_type: Optional[str] = None
    discount_value: float
    discount_amount: float
    subtotal_after_discount: float
    cgst: float
    sgst: float
    igst: float
    total_gst: float
    total_amount: float
    payment_status: str
    payment_date: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    items: List[dict] = []
    created_at: str
    updated_at: str

class PaymentUpdateRequest(BaseModel):
    payment_status: str
    payment_date: Optional[str] = None
    payment_method: Optional[str] = None

# Expense Model
class ExpenseCreate(BaseModel):
    category: str
    amount: float
    date: str
    vendor: Optional[str] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None

class ExpenseResponse(BaseModel):
    id: str
    user_id: str
    category: str
    amount: float
    date: str
    vendor: Optional[str] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None
    created_at: str
    updated_at: str

# ===================== HELPER FUNCTIONS =====================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if user is None:
            raise credentials_exception
        return user
    except JWTError:
        raise credentials_exception

def get_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()

# ===================== PUBLIC ENDPOINTS =====================

@api_router.get("/")
async def root():
    return {"message": "DK Kinetic Digital API", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": get_timestamp()}

# Contact form (public - for website visitors)
@api_router.post("/contact", response_model=ContactResponse)
async def submit_contact(input: ContactSubmissionCreate):
    try:
        contact_doc = {
            "id": str(uuid.uuid4()),
            **input.model_dump(),
            "created_at": get_timestamp()
        }
        await db.contacts.insert_one(contact_doc)
        return ContactResponse(
            success=True,
            message="Thank you for reaching out! We'll get back to you shortly.",
            id=contact_doc["id"]
        )
    except Exception as e:
        logger.error(f"Error submitting contact: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit contact form")

# ===================== AUTH ENDPOINTS =====================

@api_router.post("/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email.lower(),
        "name": user_data.name,
        "password": get_password_hash(user_data.password),
        "created_at": get_timestamp(),
        "updated_at": get_timestamp()
    }
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user_id, "email": user_doc["email"]})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user_id,
            email=user_doc["email"],
            name=user_doc["name"],
            created_at=user_doc["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email.lower()})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        created_at=current_user["created_at"]
    )

# ===================== BUSINESS ENDPOINTS =====================

@api_router.get("/business", response_model=Optional[BusinessResponse])
async def get_business(current_user: dict = Depends(get_current_user)):
    business = await db.business.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not business:
        return None
    return BusinessResponse(**business)

@api_router.post("/business", response_model=BusinessResponse)
async def create_business(data: BusinessCreate, current_user: dict = Depends(get_current_user)):
    # Check if business exists
    existing = await db.business.find_one({"user_id": current_user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Business profile already exists. Use PUT to update.")
    
    business_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        **data.model_dump(),
        "created_at": get_timestamp(),
        "updated_at": get_timestamp()
    }
    await db.business.insert_one(business_doc)
    del business_doc["_id"]
    return BusinessResponse(**business_doc)

@api_router.put("/business", response_model=BusinessResponse)
async def update_business(data: BusinessCreate, current_user: dict = Depends(get_current_user)):
    result = await db.business.find_one_and_update(
        {"user_id": current_user["id"]},
        {"$set": {**data.model_dump(), "updated_at": get_timestamp()}},
        return_document=True
    )
    if not result:
        # Create if doesn't exist
        return await create_business(data, current_user)
    del result["_id"]
    return BusinessResponse(**result)

# ===================== CUSTOMER ENDPOINTS =====================

@api_router.get("/customers", response_model=List[CustomerResponse])
async def get_customers(current_user: dict = Depends(get_current_user)):
    customers = await db.customers.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    return [CustomerResponse(**c) for c in customers]

@api_router.post("/customers", response_model=CustomerResponse)
async def create_customer(data: CustomerCreate, current_user: dict = Depends(get_current_user)):
    customer_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        **data.model_dump(),
        "created_at": get_timestamp(),
        "updated_at": get_timestamp()
    }
    await db.customers.insert_one(customer_doc)
    del customer_doc["_id"]
    return CustomerResponse(**customer_doc)

@api_router.put("/customers/{customer_id}", response_model=CustomerResponse)
async def update_customer(customer_id: str, data: CustomerCreate, current_user: dict = Depends(get_current_user)):
    result = await db.customers.find_one_and_update(
        {"id": customer_id, "user_id": current_user["id"]},
        {"$set": {**data.model_dump(), "updated_at": get_timestamp()}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Customer not found")
    del result["_id"]
    return CustomerResponse(**result)

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.customers.delete_one({"id": customer_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"success": True, "message": "Customer deleted"}

# ===================== PRODUCT ENDPOINTS =====================

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(current_user: dict = Depends(get_current_user)):
    products = await db.products.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    return [ProductResponse(**p) for p in products]

@api_router.post("/products", response_model=ProductResponse)
async def create_product(data: ProductCreate, current_user: dict = Depends(get_current_user)):
    product_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        **data.model_dump(),
        "created_at": get_timestamp(),
        "updated_at": get_timestamp()
    }
    await db.products.insert_one(product_doc)
    del product_doc["_id"]
    return ProductResponse(**product_doc)

@api_router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, data: ProductCreate, current_user: dict = Depends(get_current_user)):
    result = await db.products.find_one_and_update(
        {"id": product_id, "user_id": current_user["id"]},
        {"$set": {**data.model_dump(), "updated_at": get_timestamp()}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    del result["_id"]
    return ProductResponse(**result)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.products.delete_one({"id": product_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True, "message": "Product deleted"}

# ===================== INVOICE ENDPOINTS =====================

async def get_next_invoice_number(user_id: str) -> str:
    last_invoice = await db.invoices.find_one(
        {"user_id": user_id},
        sort=[("created_at", -1)]
    )
    if not last_invoice:
        return "INV-00001"
    
    last_num = int(last_invoice["invoice_number"].split("-")[1])
    return f"INV-{str(last_num + 1).zfill(5)}"

@api_router.get("/invoices", response_model=List[InvoiceResponse])
async def get_invoices(current_user: dict = Depends(get_current_user)):
    invoices = await db.invoices.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    # Fetch customer details for each invoice
    for inv in invoices:
        if inv.get("customer_id"):
            customer = await db.customers.find_one({"id": inv["customer_id"]}, {"_id": 0})
            inv["customer"] = customer
        inv["items"] = inv.get("items", [])
    
    return [InvoiceResponse(**inv) for inv in invoices]

@api_router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: str, current_user: dict = Depends(get_current_user)):
    invoice = await db.invoices.find_one(
        {"id": invoice_id, "user_id": current_user["id"]}, 
        {"_id": 0}
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Fetch customer details
    if invoice.get("customer_id"):
        customer = await db.customers.find_one({"id": invoice["customer_id"]}, {"_id": 0})
        invoice["customer"] = customer
    
    invoice["items"] = invoice.get("items", [])
    return InvoiceResponse(**invoice)

@api_router.get("/invoices/next-number/get")
async def get_next_number(current_user: dict = Depends(get_current_user)):
    number = await get_next_invoice_number(current_user["id"])
    return {"invoice_number": number}

@api_router.post("/invoices", response_model=InvoiceResponse)
async def create_invoice(data: InvoiceCreate, current_user: dict = Depends(get_current_user)):
    # Get customer and business for GST calculation
    customer = await db.customers.find_one({"id": data.customer_id, "user_id": current_user["id"]})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    business = await db.business.find_one({"user_id": current_user["id"]})
    
    # Calculate totals
    items = [item.model_dump() for item in data.items]
    subtotal = sum(item["amount"] for item in items)
    total_item_gst = sum(item["gst_amount"] for item in items)
    
    # Calculate discount
    discount_amount = 0
    if data.discount_type == "percentage" and data.discount_value > 0:
        discount_amount = (subtotal * data.discount_value) / 100
    elif data.discount_type == "amount" and data.discount_value > 0:
        discount_amount = data.discount_value
    
    subtotal_after_discount = subtotal - discount_amount
    
    # Adjust GST proportionally
    adjusted_gst = total_item_gst * (subtotal_after_discount / subtotal) if subtotal > 0 else 0
    
    # Determine GST type (inter-state vs intra-state)
    is_inter_state = business and customer.get("state") and business.get("state") and customer["state"] != business["state"]
    
    cgst = 0 if is_inter_state else adjusted_gst / 2
    sgst = 0 if is_inter_state else adjusted_gst / 2
    igst = adjusted_gst if is_inter_state else 0
    
    total_amount = subtotal_after_discount + adjusted_gst
    
    invoice_number = await get_next_invoice_number(current_user["id"])
    
    invoice_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "invoice_number": invoice_number,
        "invoice_date": data.invoice_date,
        "customer_id": data.customer_id,
        "subtotal": round(subtotal, 2),
        "discount_type": data.discount_type,
        "discount_value": data.discount_value,
        "discount_amount": round(discount_amount, 2),
        "subtotal_after_discount": round(subtotal_after_discount, 2),
        "cgst": round(cgst, 2),
        "sgst": round(sgst, 2),
        "igst": round(igst, 2),
        "total_gst": round(adjusted_gst, 2),
        "total_amount": round(total_amount, 2),
        "payment_status": "unpaid",
        "payment_date": None,
        "payment_method": None,
        "notes": data.notes,
        "items": items,
        "created_at": get_timestamp(),
        "updated_at": get_timestamp()
    }
    
    await db.invoices.insert_one(invoice_doc)
    del invoice_doc["_id"]
    
    invoice_doc["customer"] = customer
    return InvoiceResponse(**invoice_doc)

@api_router.put("/invoices/{invoice_id}/payment", response_model=InvoiceResponse)
async def update_invoice_payment(invoice_id: str, data: PaymentUpdateRequest, current_user: dict = Depends(get_current_user)):
    update_data = {
        "payment_status": data.payment_status,
        "updated_at": get_timestamp()
    }
    if data.payment_date:
        update_data["payment_date"] = data.payment_date
    if data.payment_method:
        update_data["payment_method"] = data.payment_method
    
    result = await db.invoices.find_one_and_update(
        {"id": invoice_id, "user_id": current_user["id"]},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    del result["_id"]
    
    # Fetch customer
    if result.get("customer_id"):
        customer = await db.customers.find_one({"id": result["customer_id"]}, {"_id": 0})
        result["customer"] = customer
    
    result["items"] = result.get("items", [])
    return InvoiceResponse(**result)

# ===================== EXPENSE ENDPOINTS =====================

@api_router.get("/expenses", response_model=List[ExpenseResponse])
async def get_expenses(current_user: dict = Depends(get_current_user)):
    expenses = await db.expenses.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).sort("date", -1).to_list(1000)
    return [ExpenseResponse(**e) for e in expenses]

@api_router.post("/expenses", response_model=ExpenseResponse)
async def create_expense(data: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    expense_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        **data.model_dump(),
        "created_at": get_timestamp(),
        "updated_at": get_timestamp()
    }
    await db.expenses.insert_one(expense_doc)
    del expense_doc["_id"]
    return ExpenseResponse(**expense_doc)

@api_router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: str, data: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    result = await db.expenses.find_one_and_update(
        {"id": expense_id, "user_id": current_user["id"]},
        {"$set": {**data.model_dump(), "updated_at": get_timestamp()}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Expense not found")
    del result["_id"]
    return ExpenseResponse(**result)

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.expenses.delete_one({"id": expense_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"success": True, "message": "Expense deleted"}

# ===================== DASHBOARD & LEDGER ENDPOINTS =====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    # Get counts and sums
    invoices = await db.invoices.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    customers = await db.customers.count_documents({"user_id": user_id})
    products = await db.products.count_documents({"user_id": user_id})
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    total_revenue = sum(inv["total_amount"] for inv in invoices if inv.get("payment_status") == "paid")
    total_expenses = sum(exp["amount"] for exp in expenses)
    pending_payments = len([inv for inv in invoices if inv.get("payment_status") != "paid"])
    
    return {
        "totalInvoices": len(invoices),
        "totalRevenue": round(total_revenue, 2),
        "totalCustomers": customers,
        "totalProducts": products,
        "totalExpenses": round(total_expenses, 2),
        "netProfit": round(total_revenue - total_expenses, 2),
        "pendingPayments": pending_payments
    }

@api_router.get("/ledger")
async def get_ledger_data(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    invoices = await db.invoices.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).sort("date", -1).to_list(1000)
    
    # Fetch customer names for invoices
    for inv in invoices:
        if inv.get("customer_id"):
            customer = await db.customers.find_one({"id": inv["customer_id"]}, {"_id": 0, "name": 1})
            inv["customer"] = customer
    
    paid_invoices = [inv for inv in invoices if inv.get("payment_status") == "paid"]
    total_income = sum(inv["total_amount"] for inv in paid_invoices)
    total_expenses = sum(exp["amount"] for exp in expenses)
    pending_amount = sum(inv["total_amount"] for inv in invoices if inv.get("payment_status") != "paid")
    
    return {
        "totalIncome": round(total_income, 2),
        "totalExpenses": round(total_expenses, 2),
        "netProfit": round(total_income - total_expenses, 2),
        "pendingAmount": round(pending_amount, 2),
        "recentIncome": paid_invoices[:5],
        "recentExpenses": expenses[:5],
        "allInvoices": invoices
    }

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
