from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
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

# ===================== CONSTANTS =====================

INCOME_TYPES = ["invoice", "personal"]
PERSONAL_INCOME_SOURCES = ["Family Support", "Personal Transfer", "Capital Infusion", "Other"]
PAYMENT_MODES = ["Cash", "Bank Transfer", "UPI", "Cheque", "Other"]
EXPENSE_CATEGORIES = ["Office Supplies", "Rent", "Utilities", "Travel", "Marketing", "Software", "Hardware", "Salary", "Professional Fees", "Miscellaneous", "Other"]

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

# Contact Model
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

# Bank Account Model (Enhanced - Opening Balance Mandatory)
class BankAccountCreate(BaseModel):
    bank_name: str
    account_number: str
    ifsc_code: str
    branch_name: Optional[str] = None
    account_type: str = "Current"  # Current, Savings, Cash
    is_primary: bool = False
    opening_balance: float  # MANDATORY
    opening_balance_date: str  # MANDATORY

class BankAccountUpdate(BaseModel):
    bank_name: str
    account_number: str
    ifsc_code: str
    branch_name: Optional[str] = None
    account_type: str = "Current"
    is_primary: bool = False
    # Opening balance NOT updatable here

class BankAccountResponse(BaseModel):
    id: str
    user_id: str
    bank_name: str
    account_number: str
    ifsc_code: str
    branch_name: Optional[str] = None
    account_type: str
    is_primary: bool
    opening_balance: float
    opening_balance_date: str
    opening_balance_locked: bool
    current_balance: float
    created_at: str
    updated_at: str

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
    state_code: Optional[str] = None
    jurisdiction: Optional[str] = None
    signatory_name: Optional[str] = None
    signatory_designation: Optional[str] = None

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
    state_code: Optional[str] = None
    jurisdiction: Optional[str] = None
    signatory_name: Optional[str] = None
    signatory_designation: Optional[str] = None
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
    state_code: Optional[str] = None

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
    state_code: Optional[str] = None
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
    discount_type: Optional[str] = None
    discount_value: float = 0
    discount_amount: float = 0
    amount: float
    gst_amount: float
    total: float

# Invoice Model
class InvoiceCreate(BaseModel):
    customer_id: str
    invoice_date: str
    due_date: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: float = 0
    notes: Optional[str] = None
    terms: Optional[str] = None
    items: List[InvoiceItemCreate]
    status: str = "issued"

class InvoiceResponse(BaseModel):
    id: str
    user_id: str
    invoice_number: str
    invoice_date: str
    due_date: Optional[str] = None
    customer_id: str
    customer: Optional[dict] = None
    subtotal: float
    item_discount_total: float
    subtotal_after_item_discount: float
    discount_type: Optional[str] = None
    discount_value: float
    discount_amount: float
    taxable_amount: float
    cgst: float
    sgst: float
    igst: float
    total_gst: float
    total_amount: float
    amount_paid: float
    balance_due: float
    payment_status: str
    status: str
    notes: Optional[str] = None
    terms: Optional[str] = None
    items: List[dict] = []
    is_deleted: bool = False
    deleted_at: Optional[str] = None
    deleted_by: Optional[str] = None
    created_at: str
    updated_at: str

class PaymentUpdateRequest(BaseModel):
    payment_status: str
    payment_date: Optional[str] = None
    payment_method: Optional[str] = None

# Income Model (ENHANCED - Dual Type Support)
class IncomeCreate(BaseModel):
    income_type: str  # "invoice" or "personal"
    # For invoice-linked income
    invoice_id: Optional[str] = None
    # For personal income
    income_source: Optional[str] = None  # Family Support, Personal Transfer, Capital Infusion, Other
    # Common fields
    amount: float
    payment_date: str
    payment_mode: str
    bank_account_id: str  # MANDATORY - which bank received the money
    reference_number: Optional[str] = None
    remarks: Optional[str] = None

class IncomeResponse(BaseModel):
    id: str
    user_id: str
    income_type: str
    invoice_id: Optional[str] = None
    invoice_number: Optional[str] = None
    customer_name: Optional[str] = None
    income_source: Optional[str] = None
    amount: float
    payment_date: str
    payment_mode: str
    bank_account_id: Optional[str] = None  # Optional for backward compatibility with legacy data
    bank_name: Optional[str] = None
    reference_number: Optional[str] = None
    remarks: Optional[str] = None
    created_at: str
    updated_at: str

# Expense Model (ENHANCED - Mandatory Bank Account)
class ExpenseCreate(BaseModel):
    category: str
    amount: float
    date: str
    vendor: Optional[str] = None
    description: Optional[str] = None
    payment_mode: str  # Cash, Bank Transfer, UPI, etc.
    bank_account_id: str  # MANDATORY - which bank was debited
    reference_number: Optional[str] = None

class ExpenseResponse(BaseModel):
    id: str
    user_id: str
    category: str
    amount: float
    date: str
    vendor: Optional[str] = None
    description: Optional[str] = None
    payment_mode: Optional[str] = None  # Optional for backward compatibility with legacy data
    bank_account_id: Optional[str] = None  # Optional for backward compatibility with legacy data
    bank_name: Optional[str] = None
    reference_number: Optional[str] = None
    created_at: str
    updated_at: str

# Bank Transfer Model (NEW)
class BankTransferCreate(BaseModel):
    from_bank_id: str
    to_bank_id: str
    amount: float
    transfer_date: str
    reference_number: Optional[str] = None
    remarks: Optional[str] = None

class BankTransferResponse(BaseModel):
    id: str
    user_id: str
    from_bank_id: str
    from_bank_name: Optional[str] = None
    to_bank_id: str
    to_bank_name: Optional[str] = None
    amount: float
    transfer_date: str
    reference_number: Optional[str] = None
    remarks: Optional[str] = None
    created_at: str

# Audit Log Model
class AuditLogResponse(BaseModel):
    id: str
    user_id: str
    action: str
    entity_type: str
    entity_id: str
    details: Optional[dict] = None
    created_at: str

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

async def create_audit_log(user_id: str, action: str, entity_type: str, entity_id: str, details: dict = None):
    """Create an audit log entry"""
    log_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "details": details,
        "created_at": get_timestamp()
    }
    await db.audit_logs.insert_one(log_doc)

async def update_invoice_payment_status(invoice_id: str, user_id: str):
    """Recalculate invoice payment status based on income entries"""
    invoice = await db.invoices.find_one({"id": invoice_id, "user_id": user_id}, {"_id": 0})
    if not invoice:
        return
    
    # Get total income for this invoice (only invoice-linked income)
    income_entries = await db.income.find({
        "invoice_id": invoice_id, 
        "user_id": user_id,
        "income_type": "invoice"
    }, {"_id": 0}).to_list(1000)
    total_paid = sum(entry["amount"] for entry in income_entries)
    
    # Determine payment status
    if total_paid >= invoice["total_amount"]:
        payment_status = "paid"
    elif total_paid > 0:
        payment_status = "partial"
    else:
        payment_status = "unpaid"
    
    # Update invoice
    await db.invoices.update_one(
        {"id": invoice_id, "user_id": user_id},
        {"$set": {
            "amount_paid": round(total_paid, 2),
            "balance_due": round(invoice["total_amount"] - total_paid, 2),
            "payment_status": payment_status,
            "updated_at": get_timestamp()
        }}
    )

async def calculate_bank_balance(bank_id: str, user_id: str) -> float:
    """Calculate current balance for a bank account"""
    bank = await db.bank_accounts.find_one({"id": bank_id, "user_id": user_id}, {"_id": 0})
    if not bank:
        return 0
    
    opening_balance = bank.get("opening_balance", 0)
    
    # Get all income credited to this bank
    income_entries = await db.income.find({"bank_account_id": bank_id, "user_id": user_id}, {"_id": 0}).to_list(10000)
    total_income = sum(entry["amount"] for entry in income_entries)
    
    # Get all expenses debited from this bank
    expense_entries = await db.expenses.find({"bank_account_id": bank_id, "user_id": user_id}, {"_id": 0}).to_list(10000)
    total_expenses = sum(entry["amount"] for entry in expense_entries)
    
    # Get transfers in and out
    transfers_in = await db.bank_transfers.find({"to_bank_id": bank_id, "user_id": user_id}, {"_id": 0}).to_list(10000)
    total_transfers_in = sum(t["amount"] for t in transfers_in)
    
    transfers_out = await db.bank_transfers.find({"from_bank_id": bank_id, "user_id": user_id}, {"_id": 0}).to_list(10000)
    total_transfers_out = sum(t["amount"] for t in transfers_out)
    
    current_balance = opening_balance + total_income - total_expenses + total_transfers_in - total_transfers_out
    return round(current_balance, 2)

# ===================== PUBLIC ENDPOINTS =====================

@api_router.get("/")
async def root():
    return {"message": "DK Kinetic Digital API", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": get_timestamp()}

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
    existing_user = await db.users.find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
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

@api_router.get("/business")
async def get_business(current_user: dict = Depends(get_current_user)):
    business = await db.business.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not business:
        return None
    return BusinessResponse(**business)

@api_router.post("/business", response_model=BusinessResponse)
async def create_business(data: BusinessCreate, current_user: dict = Depends(get_current_user)):
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
        return await create_business(data, current_user)
    del result["_id"]
    return BusinessResponse(**result)

# ===================== BANK ACCOUNT ENDPOINTS (ENHANCED) =====================

@api_router.get("/bank-accounts", response_model=List[BankAccountResponse])
async def get_bank_accounts(current_user: dict = Depends(get_current_user)):
    accounts = await db.bank_accounts.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Calculate current balance for each account
    result = []
    for a in accounts:
        current_balance = await calculate_bank_balance(a["id"], current_user["id"])
        a["current_balance"] = current_balance
        a.setdefault("opening_balance_locked", True)
        a.setdefault("opening_balance_date", a.get("created_at", "")[:10])
        result.append(BankAccountResponse(**a))
    
    return result

@api_router.get("/bank-accounts/{account_id}", response_model=BankAccountResponse)
async def get_bank_account(account_id: str, current_user: dict = Depends(get_current_user)):
    account = await db.bank_accounts.find_one({"id": account_id, "user_id": current_user["id"]}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    account["current_balance"] = await calculate_bank_balance(account_id, current_user["id"])
    account.setdefault("opening_balance_locked", True)
    account.setdefault("opening_balance_date", account.get("created_at", "")[:10])
    return BankAccountResponse(**account)

@api_router.post("/bank-accounts", response_model=BankAccountResponse)
async def create_bank_account(data: BankAccountCreate, current_user: dict = Depends(get_current_user)):
    # Validate opening balance is provided
    if data.opening_balance is None:
        raise HTTPException(status_code=400, detail="Opening balance is mandatory")
    
    if not data.opening_balance_date:
        raise HTTPException(status_code=400, detail="Opening balance date is mandatory")
    
    # If this is set as primary, unset other primary accounts
    if data.is_primary:
        await db.bank_accounts.update_many(
            {"user_id": current_user["id"]},
            {"$set": {"is_primary": False}}
        )
    
    account_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "bank_name": data.bank_name,
        "account_number": data.account_number,
        "ifsc_code": data.ifsc_code,
        "branch_name": data.branch_name,
        "account_type": data.account_type,
        "is_primary": data.is_primary,
        "opening_balance": data.opening_balance,
        "opening_balance_date": data.opening_balance_date,
        "opening_balance_locked": True,  # Locked immediately after creation
        "created_at": get_timestamp(),
        "updated_at": get_timestamp()
    }
    await db.bank_accounts.insert_one(account_doc)
    del account_doc["_id"]
    
    await create_audit_log(current_user["id"], "create", "bank_account", account_doc["id"], 
                          {"bank_name": data.bank_name, "opening_balance": data.opening_balance})
    
    account_doc["current_balance"] = data.opening_balance
    return BankAccountResponse(**account_doc)

@api_router.put("/bank-accounts/{account_id}", response_model=BankAccountResponse)
async def update_bank_account(account_id: str, data: BankAccountUpdate, current_user: dict = Depends(get_current_user)):
    # If this is set as primary, unset other primary accounts
    if data.is_primary:
        await db.bank_accounts.update_many(
            {"user_id": current_user["id"], "id": {"$ne": account_id}},
            {"$set": {"is_primary": False}}
        )
    
    # Don't update opening balance - it's locked
    update_data = {
        "bank_name": data.bank_name,
        "account_number": data.account_number,
        "ifsc_code": data.ifsc_code,
        "branch_name": data.branch_name,
        "account_type": data.account_type,
        "is_primary": data.is_primary,
        "updated_at": get_timestamp()
    }
    
    result = await db.bank_accounts.find_one_and_update(
        {"id": account_id, "user_id": current_user["id"]},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Bank account not found")
    del result["_id"]
    
    result["current_balance"] = await calculate_bank_balance(account_id, current_user["id"])
    return BankAccountResponse(**result)

@api_router.put("/bank-accounts/{account_id}/opening-balance")
async def update_opening_balance(account_id: str, opening_balance: float, reason: str = Query(..., description="Reason for correction"), current_user: dict = Depends(get_current_user)):
    """Admin-only correction for opening balance - requires reason for audit"""
    account = await db.bank_accounts.find_one({"id": account_id, "user_id": current_user["id"]}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    old_balance = account.get("opening_balance", 0)
    
    result = await db.bank_accounts.find_one_and_update(
        {"id": account_id, "user_id": current_user["id"]},
        {"$set": {"opening_balance": opening_balance, "updated_at": get_timestamp()}},
        return_document=True
    )
    
    # Create audit log for this sensitive operation
    await create_audit_log(
        current_user["id"], 
        "update_opening_balance", 
        "bank_account", 
        account_id,
        {
            "old_balance": old_balance,
            "new_balance": opening_balance,
            "reason": reason,
            "bank_name": account.get("bank_name")
        }
    )
    
    return {"success": True, "message": "Opening balance updated", "old_balance": old_balance, "new_balance": opening_balance}

@api_router.delete("/bank-accounts/{account_id}")
async def delete_bank_account(account_id: str, current_user: dict = Depends(get_current_user)):
    # Check if account has transactions
    income_count = await db.income.count_documents({"bank_account_id": account_id, "user_id": current_user["id"]})
    expense_count = await db.expenses.count_documents({"bank_account_id": account_id, "user_id": current_user["id"]})
    transfer_count = await db.bank_transfers.count_documents({
        "$or": [
            {"from_bank_id": account_id, "user_id": current_user["id"]},
            {"to_bank_id": account_id, "user_id": current_user["id"]}
        ]
    })
    
    if income_count > 0 or expense_count > 0 or transfer_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete bank account with existing transactions")
    
    result = await db.bank_accounts.delete_one({"id": account_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    return {"success": True, "message": "Bank account deleted"}

# ===================== BANK TRANSFER ENDPOINTS (NEW) =====================

@api_router.get("/bank-transfers", response_model=List[BankTransferResponse])
async def get_bank_transfers(current_user: dict = Depends(get_current_user)):
    transfers = await db.bank_transfers.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).sort("transfer_date", -1).to_list(1000)
    
    # Enrich with bank names
    for t in transfers:
        if t.get("from_bank_id"):
            from_bank = await db.bank_accounts.find_one({"id": t["from_bank_id"]}, {"_id": 0, "bank_name": 1})
            t["from_bank_name"] = from_bank.get("bank_name") if from_bank else None
        if t.get("to_bank_id"):
            to_bank = await db.bank_accounts.find_one({"id": t["to_bank_id"]}, {"_id": 0, "bank_name": 1})
            t["to_bank_name"] = to_bank.get("bank_name") if to_bank else None
    
    return [BankTransferResponse(**t) for t in transfers]

@api_router.post("/bank-transfers", response_model=BankTransferResponse)
async def create_bank_transfer(data: BankTransferCreate, current_user: dict = Depends(get_current_user)):
    # Validate both banks exist
    from_bank = await db.bank_accounts.find_one({"id": data.from_bank_id, "user_id": current_user["id"]}, {"_id": 0})
    if not from_bank:
        raise HTTPException(status_code=404, detail="Source bank account not found")
    
    to_bank = await db.bank_accounts.find_one({"id": data.to_bank_id, "user_id": current_user["id"]}, {"_id": 0})
    if not to_bank:
        raise HTTPException(status_code=404, detail="Destination bank account not found")
    
    if data.from_bank_id == data.to_bank_id:
        raise HTTPException(status_code=400, detail="Cannot transfer to the same account")
    
    # Check sufficient balance
    from_balance = await calculate_bank_balance(data.from_bank_id, current_user["id"])
    if from_balance < data.amount:
        raise HTTPException(status_code=400, detail=f"Insufficient balance. Available: ₹{from_balance:.2f}")
    
    transfer_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        **data.model_dump(),
        "created_at": get_timestamp()
    }
    await db.bank_transfers.insert_one(transfer_doc)
    del transfer_doc["_id"]
    
    await create_audit_log(current_user["id"], "create", "bank_transfer", transfer_doc["id"],
                          {"from_bank": from_bank.get("bank_name"), "to_bank": to_bank.get("bank_name"), "amount": data.amount})
    
    transfer_doc["from_bank_name"] = from_bank.get("bank_name")
    transfer_doc["to_bank_name"] = to_bank.get("bank_name")
    return BankTransferResponse(**transfer_doc)

@api_router.delete("/bank-transfers/{transfer_id}")
async def delete_bank_transfer(transfer_id: str, current_user: dict = Depends(get_current_user)):
    transfer = await db.bank_transfers.find_one({"id": transfer_id, "user_id": current_user["id"]}, {"_id": 0})
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    result = await db.bank_transfers.delete_one({"id": transfer_id, "user_id": current_user["id"]})
    
    await create_audit_log(current_user["id"], "delete", "bank_transfer", transfer_id,
                          {"amount": transfer.get("amount")})
    
    return {"success": True, "message": "Transfer deleted"}

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
    
    await create_audit_log(current_user["id"], "create", "customer", customer_doc["id"], {"name": data.name})
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
    
    await create_audit_log(current_user["id"], "create", "product", product_doc["id"], {"name": data.name})
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
async def get_invoices(include_deleted: bool = False, current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["id"]}
    if not include_deleted:
        query["is_deleted"] = {"$ne": True}
    
    invoices = await db.invoices.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for inv in invoices:
        if inv.get("customer_id"):
            customer = await db.customers.find_one({"id": inv["customer_id"]}, {"_id": 0})
            inv["customer"] = customer
        inv["items"] = inv.get("items", [])
        inv.setdefault("item_discount_total", 0)
        inv.setdefault("subtotal_after_item_discount", inv.get("subtotal", 0))
        inv.setdefault("taxable_amount", inv.get("subtotal_after_discount", inv.get("subtotal", 0)))
        inv.setdefault("amount_paid", 0)
        inv.setdefault("balance_due", inv.get("total_amount", 0))
        inv.setdefault("status", "issued")
        inv.setdefault("is_deleted", False)
        inv.setdefault("deleted_at", None)
        inv.setdefault("deleted_by", None)
        inv.setdefault("due_date", None)
        inv.setdefault("terms", None)
    
    return [InvoiceResponse(**inv) for inv in invoices]

@api_router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: str, current_user: dict = Depends(get_current_user)):
    invoice = await db.invoices.find_one(
        {"id": invoice_id, "user_id": current_user["id"]}, 
        {"_id": 0}
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if invoice.get("customer_id"):
        customer = await db.customers.find_one({"id": invoice["customer_id"]}, {"_id": 0})
        invoice["customer"] = customer
    
    invoice["items"] = invoice.get("items", [])
    invoice.setdefault("item_discount_total", 0)
    invoice.setdefault("subtotal_after_item_discount", invoice.get("subtotal", 0))
    invoice.setdefault("taxable_amount", invoice.get("subtotal_after_discount", invoice.get("subtotal", 0)))
    invoice.setdefault("amount_paid", 0)
    invoice.setdefault("balance_due", invoice.get("total_amount", 0))
    invoice.setdefault("status", "issued")
    invoice.setdefault("is_deleted", False)
    invoice.setdefault("deleted_at", None)
    invoice.setdefault("deleted_by", None)
    invoice.setdefault("due_date", None)
    invoice.setdefault("terms", None)
    
    return InvoiceResponse(**invoice)

@api_router.get("/invoices/next-number/get")
async def get_next_number(current_user: dict = Depends(get_current_user)):
    number = await get_next_invoice_number(current_user["id"])
    return {"invoice_number": number}

@api_router.post("/invoices", response_model=InvoiceResponse)
async def create_invoice(data: InvoiceCreate, current_user: dict = Depends(get_current_user)):
    customer = await db.customers.find_one({"id": data.customer_id, "user_id": current_user["id"]}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    business = await db.business.find_one({"user_id": current_user["id"]}, {"_id": 0})
    
    items = []
    subtotal = 0
    item_discount_total = 0
    
    for item in data.items:
        item_dict = item.model_dump()
        base_amount = item.quantity * item.rate
        
        item_discount = 0
        if item.discount_type == "percentage" and item.discount_value > 0:
            item_discount = (base_amount * item.discount_value) / 100
        elif item.discount_type == "amount" and item.discount_value > 0:
            item_discount = item.discount_value
        
        item_dict["discount_amount"] = round(item_discount, 2)
        item_discount_total += item_discount
        
        amount_after_discount = base_amount - item_discount
        item_dict["amount"] = round(amount_after_discount, 2)
        
        gst_amount = (amount_after_discount * item.gst_rate) / 100
        item_dict["gst_amount"] = round(gst_amount, 2)
        item_dict["total"] = round(amount_after_discount + gst_amount, 2)
        
        subtotal += base_amount
        items.append(item_dict)
    
    subtotal_after_item_discount = subtotal - item_discount_total
    
    invoice_discount = 0
    if data.discount_type == "percentage" and data.discount_value > 0:
        invoice_discount = (subtotal_after_item_discount * data.discount_value) / 100
    elif data.discount_type == "amount" and data.discount_value > 0:
        invoice_discount = data.discount_value
    
    taxable_amount = subtotal_after_item_discount - invoice_discount
    
    total_gst = sum(item["gst_amount"] for item in items)
    if invoice_discount > 0 and subtotal_after_item_discount > 0:
        adjustment_ratio = taxable_amount / subtotal_after_item_discount
        total_gst = total_gst * adjustment_ratio
    
    is_inter_state = business and customer.get("state") and business.get("state") and customer["state"] != business["state"]
    
    cgst = 0 if is_inter_state else total_gst / 2
    sgst = 0 if is_inter_state else total_gst / 2
    igst = total_gst if is_inter_state else 0
    
    total_amount = taxable_amount + total_gst
    
    invoice_number = await get_next_invoice_number(current_user["id"])
    
    invoice_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "invoice_number": invoice_number,
        "invoice_date": data.invoice_date,
        "due_date": data.due_date,
        "customer_id": data.customer_id,
        "subtotal": round(subtotal, 2),
        "item_discount_total": round(item_discount_total, 2),
        "subtotal_after_item_discount": round(subtotal_after_item_discount, 2),
        "discount_type": data.discount_type,
        "discount_value": data.discount_value,
        "discount_amount": round(invoice_discount, 2),
        "taxable_amount": round(taxable_amount, 2),
        "cgst": round(cgst, 2),
        "sgst": round(sgst, 2),
        "igst": round(igst, 2),
        "total_gst": round(total_gst, 2),
        "total_amount": round(total_amount, 2),
        "amount_paid": 0,
        "balance_due": round(total_amount, 2),
        "payment_status": "unpaid",
        "status": data.status,
        "notes": data.notes,
        "terms": data.terms,
        "items": items,
        "is_deleted": False,
        "deleted_at": None,
        "deleted_by": None,
        "created_at": get_timestamp(),
        "updated_at": get_timestamp()
    }
    
    await db.invoices.insert_one(invoice_doc)
    del invoice_doc["_id"]
    
    await create_audit_log(current_user["id"], "create", "invoice", invoice_doc["id"],
                          {"invoice_number": invoice_number, "total_amount": total_amount})
    
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
    
    if result.get("customer_id"):
        customer = await db.customers.find_one({"id": result["customer_id"]}, {"_id": 0})
        result["customer"] = customer
    
    result["items"] = result.get("items", [])
    result.setdefault("item_discount_total", 0)
    result.setdefault("subtotal_after_item_discount", result.get("subtotal", 0))
    result.setdefault("taxable_amount", result.get("subtotal_after_discount", result.get("subtotal", 0)))
    result.setdefault("amount_paid", 0)
    result.setdefault("balance_due", result.get("total_amount", 0))
    result.setdefault("status", "issued")
    result.setdefault("is_deleted", False)
    result.setdefault("deleted_at", None)
    result.setdefault("deleted_by", None)
    result.setdefault("due_date", None)
    result.setdefault("terms", None)
    
    return InvoiceResponse(**result)

@api_router.put("/invoices/{invoice_id}/status")
async def update_invoice_status(invoice_id: str, status: str, current_user: dict = Depends(get_current_user)):
    if status not in ["draft", "issued", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.invoices.find_one_and_update(
        {"id": invoice_id, "user_id": current_user["id"]},
        {"$set": {"status": status, "updated_at": get_timestamp()}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    await create_audit_log(current_user["id"], "update", "invoice", invoice_id, {"status": status})
    return {"success": True, "message": f"Invoice status updated to {status}"}

@api_router.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: str, current_user: dict = Depends(get_current_user)):
    invoice = await db.invoices.find_one({"id": invoice_id, "user_id": current_user["id"]})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    income_count = await db.income.count_documents({"invoice_id": invoice_id, "user_id": current_user["id"]})
    if income_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete invoice with linked income entries. Delete income entries first.")
    
    await db.invoices.update_one(
        {"id": invoice_id, "user_id": current_user["id"]},
        {"$set": {
            "is_deleted": True,
            "deleted_at": get_timestamp(),
            "deleted_by": current_user["id"],
            "updated_at": get_timestamp()
        }}
    )
    
    await create_audit_log(current_user["id"], "delete", "invoice", invoice_id,
                          {"invoice_number": invoice.get("invoice_number")})
    
    return {"success": True, "message": "Invoice deleted"}

@api_router.put("/invoices/{invoice_id}/restore")
async def restore_invoice(invoice_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.invoices.find_one_and_update(
        {"id": invoice_id, "user_id": current_user["id"], "is_deleted": True},
        {"$set": {
            "is_deleted": False,
            "deleted_at": None,
            "deleted_by": None,
            "updated_at": get_timestamp()
        }},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Deleted invoice not found")
    
    await create_audit_log(current_user["id"], "restore", "invoice", invoice_id,
                          {"invoice_number": result.get("invoice_number")})
    
    return {"success": True, "message": "Invoice restored"}

# ===================== INCOME ENDPOINTS (ENHANCED - DUAL TYPE) =====================

@api_router.get("/income", response_model=List[IncomeResponse])
async def get_income(income_type: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["id"]}
    if income_type and income_type in INCOME_TYPES:
        query["income_type"] = income_type
    
    income_entries = await db.income.find(query, {"_id": 0}).sort("payment_date", -1).to_list(1000)
    
    for entry in income_entries:
        # Ensure income_type exists (for backward compatibility)
        entry.setdefault("income_type", "invoice")
        entry.setdefault("income_source", None)
        
        if entry.get("invoice_id"):
            invoice = await db.invoices.find_one({"id": entry["invoice_id"]}, {"_id": 0, "invoice_number": 1, "customer_id": 1})
            if invoice:
                entry["invoice_number"] = invoice.get("invoice_number")
                if invoice.get("customer_id"):
                    customer = await db.customers.find_one({"id": invoice["customer_id"]}, {"_id": 0, "name": 1})
                    entry["customer_name"] = customer.get("name") if customer else None
        
        if entry.get("bank_account_id"):
            bank = await db.bank_accounts.find_one({"id": entry["bank_account_id"]}, {"_id": 0, "bank_name": 1})
            entry["bank_name"] = bank.get("bank_name") if bank else None
        
        entry.setdefault("invoice_number", None)
        entry.setdefault("customer_name", None)
        entry.setdefault("bank_name", None)
    
    return [IncomeResponse(**e) for e in income_entries]

@api_router.post("/income", response_model=IncomeResponse)
async def create_income(data: IncomeCreate, current_user: dict = Depends(get_current_user)):
    # Validate income type
    if data.income_type not in INCOME_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid income type. Must be one of: {INCOME_TYPES}")
    
    # Validate bank account (MANDATORY for all income)
    if not data.bank_account_id:
        raise HTTPException(status_code=400, detail="Bank account is mandatory - specify which account received the money")
    
    bank = await db.bank_accounts.find_one({"id": data.bank_account_id, "user_id": current_user["id"]}, {"_id": 0})
    if not bank:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    invoice = None
    invoice_number = None
    customer_name = None
    
    if data.income_type == "invoice":
        # Invoice-linked income
        if not data.invoice_id:
            raise HTTPException(status_code=400, detail="Invoice ID is required for invoice-linked income")
        
        invoice = await db.invoices.find_one(
            {"id": data.invoice_id, "user_id": current_user["id"], "is_deleted": {"$ne": True}},
            {"_id": 0}
        )
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found or deleted")
        
        # Check for overpayment
        current_paid = invoice.get("amount_paid", 0)
        total_amount = invoice.get("total_amount", 0)
        if current_paid + data.amount > total_amount + 0.01:
            raise HTTPException(status_code=400, detail=f"Payment amount exceeds balance due. Balance: ₹{total_amount - current_paid:.2f}")
        
        invoice_number = invoice.get("invoice_number")
        if invoice.get("customer_id"):
            customer = await db.customers.find_one({"id": invoice["customer_id"]}, {"_id": 0, "name": 1})
            customer_name = customer.get("name") if customer else None
    else:
        # Personal income
        if not data.income_source:
            raise HTTPException(status_code=400, detail="Income source is required for personal income")
        if data.income_source not in PERSONAL_INCOME_SOURCES:
            raise HTTPException(status_code=400, detail=f"Invalid income source. Must be one of: {PERSONAL_INCOME_SOURCES}")
    
    income_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "income_type": data.income_type,
        "invoice_id": data.invoice_id if data.income_type == "invoice" else None,
        "income_source": data.income_source if data.income_type == "personal" else None,
        "amount": data.amount,
        "payment_date": data.payment_date,
        "payment_mode": data.payment_mode,
        "bank_account_id": data.bank_account_id,
        "reference_number": data.reference_number,
        "remarks": data.remarks,
        "created_at": get_timestamp(),
        "updated_at": get_timestamp()
    }
    await db.income.insert_one(income_doc)
    del income_doc["_id"]
    
    # Update invoice payment status if invoice-linked
    if data.income_type == "invoice" and data.invoice_id:
        await update_invoice_payment_status(data.invoice_id, current_user["id"])
    
    await create_audit_log(current_user["id"], "create", "income", income_doc["id"],
                          {"income_type": data.income_type, "amount": data.amount, "bank": bank.get("bank_name")})
    
    income_doc["invoice_number"] = invoice_number
    income_doc["customer_name"] = customer_name
    income_doc["bank_name"] = bank.get("bank_name")
    
    return IncomeResponse(**income_doc)

@api_router.put("/income/{income_id}", response_model=IncomeResponse)
async def update_income(income_id: str, data: IncomeCreate, current_user: dict = Depends(get_current_user)):
    existing = await db.income.find_one({"id": income_id, "user_id": current_user["id"]}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Income entry not found")
    
    old_invoice_id = existing.get("invoice_id")
    
    # Validate bank account
    if not data.bank_account_id:
        raise HTTPException(status_code=400, detail="Bank account is mandatory")
    
    bank = await db.bank_accounts.find_one({"id": data.bank_account_id, "user_id": current_user["id"]}, {"_id": 0})
    if not bank:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    invoice_number = None
    customer_name = None
    
    if data.income_type == "invoice":
        if not data.invoice_id:
            raise HTTPException(status_code=400, detail="Invoice ID is required for invoice-linked income")
        
        invoice = await db.invoices.find_one(
            {"id": data.invoice_id, "user_id": current_user["id"], "is_deleted": {"$ne": True}},
            {"_id": 0}
        )
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found or deleted")
        
        invoice_number = invoice.get("invoice_number")
        if invoice.get("customer_id"):
            customer = await db.customers.find_one({"id": invoice["customer_id"]}, {"_id": 0, "name": 1})
            customer_name = customer.get("name") if customer else None
    
    update_data = {
        "income_type": data.income_type,
        "invoice_id": data.invoice_id if data.income_type == "invoice" else None,
        "income_source": data.income_source if data.income_type == "personal" else None,
        "amount": data.amount,
        "payment_date": data.payment_date,
        "payment_mode": data.payment_mode,
        "bank_account_id": data.bank_account_id,
        "reference_number": data.reference_number,
        "remarks": data.remarks,
        "updated_at": get_timestamp()
    }
    
    result = await db.income.find_one_and_update(
        {"id": income_id, "user_id": current_user["id"]},
        {"$set": update_data},
        return_document=True
    )
    del result["_id"]
    
    # Update payment status for affected invoices
    if data.income_type == "invoice" and data.invoice_id:
        await update_invoice_payment_status(data.invoice_id, current_user["id"])
    if old_invoice_id and old_invoice_id != data.invoice_id:
        await update_invoice_payment_status(old_invoice_id, current_user["id"])
    
    await create_audit_log(current_user["id"], "update", "income", income_id,
                          {"income_type": data.income_type, "amount": data.amount})
    
    result["invoice_number"] = invoice_number
    result["customer_name"] = customer_name
    result["bank_name"] = bank.get("bank_name")
    result.setdefault("income_source", None)
    
    return IncomeResponse(**result)

@api_router.delete("/income/{income_id}")
async def delete_income(income_id: str, current_user: dict = Depends(get_current_user)):
    existing = await db.income.find_one({"id": income_id, "user_id": current_user["id"]}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Income entry not found")
    
    invoice_id = existing.get("invoice_id")
    
    result = await db.income.delete_one({"id": income_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Income entry not found")
    
    # Update invoice payment status if invoice-linked
    if invoice_id:
        await update_invoice_payment_status(invoice_id, current_user["id"])
    
    await create_audit_log(current_user["id"], "delete", "income", income_id,
                          {"invoice_id": invoice_id, "amount": existing.get("amount")})
    
    return {"success": True, "message": "Income entry deleted"}

# ===================== EXPENSE ENDPOINTS (ENHANCED - MANDATORY BANK) =====================

@api_router.get("/expenses", response_model=List[ExpenseResponse])
async def get_expenses(current_user: dict = Depends(get_current_user)):
    expenses = await db.expenses.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).sort("date", -1).to_list(1000)
    
    for exp in expenses:
        if exp.get("bank_account_id"):
            bank = await db.bank_accounts.find_one({"id": exp["bank_account_id"]}, {"_id": 0, "bank_name": 1})
            exp["bank_name"] = bank.get("bank_name") if bank else None
        else:
            exp["bank_name"] = None
        exp.setdefault("reference_number", None)
        exp.setdefault("payment_mode", exp.get("payment_method", "Cash"))
    
    return [ExpenseResponse(**e) for e in expenses]

@api_router.post("/expenses", response_model=ExpenseResponse)
async def create_expense(data: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    # Validate bank account (MANDATORY)
    if not data.bank_account_id:
        raise HTTPException(status_code=400, detail="Bank account is mandatory - specify which account was debited")
    
    bank = await db.bank_accounts.find_one({"id": data.bank_account_id, "user_id": current_user["id"]}, {"_id": 0})
    if not bank:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    expense_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        **data.model_dump(),
        "created_at": get_timestamp(),
        "updated_at": get_timestamp()
    }
    await db.expenses.insert_one(expense_doc)
    del expense_doc["_id"]
    
    await create_audit_log(current_user["id"], "create", "expense", expense_doc["id"],
                          {"category": data.category, "amount": data.amount, "bank": bank.get("bank_name")})
    
    expense_doc["bank_name"] = bank.get("bank_name")
    return ExpenseResponse(**expense_doc)

@api_router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: str, data: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    # Validate bank account
    if not data.bank_account_id:
        raise HTTPException(status_code=400, detail="Bank account is mandatory")
    
    bank = await db.bank_accounts.find_one({"id": data.bank_account_id, "user_id": current_user["id"]}, {"_id": 0})
    if not bank:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    result = await db.expenses.find_one_and_update(
        {"id": expense_id, "user_id": current_user["id"]},
        {"$set": {**data.model_dump(), "updated_at": get_timestamp()}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Expense not found")
    del result["_id"]
    
    result["bank_name"] = bank.get("bank_name")
    result.setdefault("reference_number", None)
    result.setdefault("payment_mode", result.get("payment_method", "Cash"))
    
    return ExpenseResponse(**result)

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    expense = await db.expenses.find_one({"id": expense_id, "user_id": current_user["id"]}, {"_id": 0})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    result = await db.expenses.delete_one({"id": expense_id, "user_id": current_user["id"]})
    
    await create_audit_log(current_user["id"], "delete", "expense", expense_id,
                          {"category": expense.get("category"), "amount": expense.get("amount")})
    
    return {"success": True, "message": "Expense deleted"}

# ===================== DASHBOARD & LEDGER ENDPOINTS =====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    invoices = await db.invoices.find(
        {"user_id": user_id, "is_deleted": {"$ne": True}}, 
        {"_id": 0}
    ).to_list(1000)
    customers = await db.customers.count_documents({"user_id": user_id})
    products = await db.products.count_documents({"user_id": user_id})
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    income_entries = await db.income.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    bank_accounts = await db.bank_accounts.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    # Separate business income from personal income
    business_income = sum(entry["amount"] for entry in income_entries if entry.get("income_type", "invoice") == "invoice")
    personal_income = sum(entry["amount"] for entry in income_entries if entry.get("income_type") == "personal")
    total_income = business_income + personal_income
    
    total_expenses = sum(exp["amount"] for exp in expenses)
    total_invoiced = sum(inv["total_amount"] for inv in invoices)
    total_paid = sum(inv.get("amount_paid", 0) for inv in invoices)
    total_outstanding = total_invoiced - total_paid
    pending_count = len([inv for inv in invoices if inv.get("payment_status") != "paid"])
    
    # Calculate total opening balance from all bank accounts
    total_opening_balance = sum(acc.get("opening_balance", 0) for acc in bank_accounts)
    
    # Calculate total current balance across all banks
    total_current_balance = 0
    for acc in bank_accounts:
        balance = await calculate_bank_balance(acc["id"], user_id)
        total_current_balance += balance
    
    return {
        "totalInvoices": len(invoices),
        "totalInvoiced": round(total_invoiced, 2),
        "totalIncome": round(total_income, 2),
        "businessIncome": round(business_income, 2),
        "personalIncome": round(personal_income, 2),
        "totalCustomers": customers,
        "totalProducts": products,
        "totalExpenses": round(total_expenses, 2),
        "openingBalance": round(total_opening_balance, 2),
        "currentBalance": round(total_current_balance, 2),
        "netProfit": round(total_opening_balance + total_income - total_expenses, 2),
        "pendingPayments": pending_count,
        "totalOutstanding": round(total_outstanding, 2),
        "bankAccountsCount": len(bank_accounts)
    }

@api_router.get("/ledger")
async def get_ledger_data(current_user: dict = Depends(get_current_user)):
    """Get consolidated ledger data across all bank accounts"""
    user_id = current_user["id"]
    
    # Get all bank accounts
    bank_accounts = await db.bank_accounts.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    total_opening_balance = sum(acc.get("opening_balance", 0) for acc in bank_accounts)
    
    # Get all income entries
    income_entries = await db.income.find({"user_id": user_id}, {"_id": 0}).sort("payment_date", -1).to_list(1000)
    
    # Enrich and categorize income
    business_income_list = []
    personal_income_list = []
    for entry in income_entries:
        entry.setdefault("income_type", "invoice")
        entry.setdefault("income_source", None)
        
        if entry.get("invoice_id"):
            invoice = await db.invoices.find_one({"id": entry["invoice_id"]}, {"_id": 0, "invoice_number": 1, "customer_id": 1})
            if invoice:
                entry["invoice_number"] = invoice.get("invoice_number")
                if invoice.get("customer_id"):
                    customer = await db.customers.find_one({"id": invoice["customer_id"]}, {"_id": 0, "name": 1})
                    entry["customer_name"] = customer.get("name") if customer else None
        
        if entry.get("bank_account_id"):
            bank = await db.bank_accounts.find_one({"id": entry["bank_account_id"]}, {"_id": 0, "bank_name": 1})
            entry["bank_name"] = bank.get("bank_name") if bank else None
        
        if entry.get("income_type") == "personal":
            personal_income_list.append(entry)
        else:
            business_income_list.append(entry)
    
    # Get all expenses
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).sort("date", -1).to_list(1000)
    for exp in expenses:
        if exp.get("bank_account_id"):
            bank = await db.bank_accounts.find_one({"id": exp["bank_account_id"]}, {"_id": 0, "bank_name": 1})
            exp["bank_name"] = bank.get("bank_name") if bank else None
    
    # Get invoices for outstanding
    invoices = await db.invoices.find(
        {"user_id": user_id, "is_deleted": {"$ne": True}}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    for inv in invoices:
        if inv.get("customer_id"):
            customer = await db.customers.find_one({"id": inv["customer_id"]}, {"_id": 0, "name": 1})
            inv["customer_name"] = customer.get("name") if customer else None
    
    # Get bank transfers
    transfers = await db.bank_transfers.find({"user_id": user_id}, {"_id": 0}).sort("transfer_date", -1).to_list(1000)
    
    # Calculate totals
    total_business_income = sum(entry["amount"] for entry in business_income_list)
    total_personal_income = sum(entry["amount"] for entry in personal_income_list)
    total_income = total_business_income + total_personal_income
    total_expenses = sum(exp["amount"] for exp in expenses)
    total_invoiced = sum(inv["total_amount"] for inv in invoices)
    total_outstanding = sum(inv.get("balance_due", inv["total_amount"]) for inv in invoices if inv.get("payment_status") != "paid")
    
    closing_balance = total_opening_balance + total_income - total_expenses
    
    return {
        "openingBalance": round(total_opening_balance, 2),
        "totalIncome": round(total_income, 2),
        "businessIncome": round(total_business_income, 2),
        "personalIncome": round(total_personal_income, 2),
        "totalExpenses": round(total_expenses, 2),
        "closingBalance": round(closing_balance, 2),
        "totalInvoiced": round(total_invoiced, 2),
        "totalOutstanding": round(total_outstanding, 2),
        "recentBusinessIncome": business_income_list[:10],
        "recentPersonalIncome": personal_income_list[:10],
        "recentExpenses": expenses[:10],
        "outstandingInvoices": [inv for inv in invoices if inv.get("payment_status") != "paid"][:10],
        "allBusinessIncome": business_income_list,
        "allPersonalIncome": personal_income_list,
        "allIncome": income_entries,
        "allExpenses": expenses,
        "allInvoices": invoices,
        "bankTransfers": transfers[:20]
    }

@api_router.get("/ledger/bank/{bank_id}")
async def get_bank_ledger(bank_id: str, current_user: dict = Depends(get_current_user)):
    """Get individual bank account ledger with running balance"""
    user_id = current_user["id"]
    
    # Get bank account
    bank = await db.bank_accounts.find_one({"id": bank_id, "user_id": user_id}, {"_id": 0})
    if not bank:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    opening_balance = bank.get("opening_balance", 0)
    opening_date = bank.get("opening_balance_date", bank.get("created_at", "")[:10])
    
    # Get all transactions for this bank
    transactions = []
    
    # Add income entries
    income_entries = await db.income.find({"bank_account_id": bank_id, "user_id": user_id}, {"_id": 0}).to_list(10000)
    for entry in income_entries:
        entry.setdefault("income_type", "invoice")
        description = ""
        if entry.get("income_type") == "personal":
            description = f"Personal Income - {entry.get('income_source', 'Other')}"
        else:
            if entry.get("invoice_id"):
                invoice = await db.invoices.find_one({"id": entry["invoice_id"]}, {"_id": 0, "invoice_number": 1, "customer_id": 1})
                if invoice:
                    customer = await db.customers.find_one({"id": invoice.get("customer_id")}, {"_id": 0, "name": 1})
                    description = f"Invoice {invoice.get('invoice_number')} - {customer.get('name') if customer else 'Customer'}"
        
        transactions.append({
            "id": entry["id"],
            "date": entry["payment_date"],
            "type": "income",
            "income_type": entry.get("income_type", "invoice"),
            "description": description or f"Income - {entry.get('payment_mode', '')}",
            "reference": entry.get("reference_number"),
            "credit": entry["amount"],
            "debit": 0,
            "created_at": entry.get("created_at", entry["payment_date"])
        })
    
    # Add expense entries
    expense_entries = await db.expenses.find({"bank_account_id": bank_id, "user_id": user_id}, {"_id": 0}).to_list(10000)
    for exp in expense_entries:
        transactions.append({
            "id": exp["id"],
            "date": exp["date"],
            "type": "expense",
            "description": f"{exp['category']} - {exp.get('vendor', 'Expense')}",
            "reference": exp.get("reference_number"),
            "credit": 0,
            "debit": exp["amount"],
            "created_at": exp.get("created_at", exp["date"])
        })
    
    # Add transfers
    transfers_in = await db.bank_transfers.find({"to_bank_id": bank_id, "user_id": user_id}, {"_id": 0}).to_list(10000)
    for t in transfers_in:
        from_bank = await db.bank_accounts.find_one({"id": t["from_bank_id"]}, {"_id": 0, "bank_name": 1})
        transactions.append({
            "id": t["id"],
            "date": t["transfer_date"],
            "type": "transfer_in",
            "description": f"Transfer from {from_bank.get('bank_name') if from_bank else 'Account'}",
            "reference": t.get("reference_number"),
            "credit": t["amount"],
            "debit": 0,
            "created_at": t.get("created_at", t["transfer_date"])
        })
    
    transfers_out = await db.bank_transfers.find({"from_bank_id": bank_id, "user_id": user_id}, {"_id": 0}).to_list(10000)
    for t in transfers_out:
        to_bank = await db.bank_accounts.find_one({"id": t["to_bank_id"]}, {"_id": 0, "bank_name": 1})
        transactions.append({
            "id": t["id"],
            "date": t["transfer_date"],
            "type": "transfer_out",
            "description": f"Transfer to {to_bank.get('bank_name') if to_bank else 'Account'}",
            "reference": t.get("reference_number"),
            "credit": 0,
            "debit": t["amount"],
            "created_at": t.get("created_at", t["transfer_date"])
        })
    
    # Sort by date then by created_at
    transactions.sort(key=lambda x: (x["date"], x.get("created_at", "")))
    
    # Calculate running balance
    running_balance = opening_balance
    for t in transactions:
        running_balance = running_balance + t["credit"] - t["debit"]
        t["balance"] = round(running_balance, 2)
    
    # Calculate totals
    total_credit = sum(t["credit"] for t in transactions)
    total_debit = sum(t["debit"] for t in transactions)
    current_balance = opening_balance + total_credit - total_debit
    
    return {
        "bankAccount": {
            "id": bank["id"],
            "bank_name": bank["bank_name"],
            "account_number": bank["account_number"],
            "account_type": bank.get("account_type", "Current")
        },
        "openingBalance": round(opening_balance, 2),
        "openingDate": opening_date,
        "totalCredit": round(total_credit, 2),
        "totalDebit": round(total_debit, 2),
        "currentBalance": round(current_balance, 2),
        "transactions": transactions
    }

# ===================== REPORTS ENDPOINTS =====================

@api_router.get("/reports/outstanding")
async def get_outstanding_report(current_user: dict = Depends(get_current_user)):
    invoices = await db.invoices.find(
        {"user_id": current_user["id"], "is_deleted": {"$ne": True}, "payment_status": {"$ne": "paid"}},
        {"_id": 0}
    ).sort("invoice_date", -1).to_list(1000)
    
    for inv in invoices:
        if inv.get("customer_id"):
            customer = await db.customers.find_one({"id": inv["customer_id"]}, {"_id": 0, "name": 1})
            inv["customer_name"] = customer.get("name") if customer else None
    
    total_outstanding = sum(inv.get("balance_due", inv["total_amount"]) for inv in invoices)
    
    return {
        "invoices": invoices,
        "totalOutstanding": round(total_outstanding, 2),
        "count": len(invoices)
    }

@api_router.get("/reports/income-expense")
async def get_income_expense_report(current_user: dict = Depends(get_current_user)):
    income_entries = await db.income.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    expenses = await db.expenses.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    
    # Separate business and personal income
    business_income = [e for e in income_entries if e.get("income_type", "invoice") == "invoice"]
    personal_income = [e for e in income_entries if e.get("income_type") == "personal"]
    
    total_business_income = sum(entry["amount"] for entry in business_income)
    total_personal_income = sum(entry["amount"] for entry in personal_income)
    total_income = total_business_income + total_personal_income
    total_expenses = sum(exp["amount"] for exp in expenses)
    
    # Group by month
    income_by_month = {}
    for entry in income_entries:
        month = entry["payment_date"][:7]
        income_by_month[month] = income_by_month.get(month, 0) + entry["amount"]
    
    expense_by_month = {}
    for exp in expenses:
        month = exp["date"][:7]
        expense_by_month[month] = expense_by_month.get(month, 0) + exp["amount"]
    
    return {
        "totalIncome": round(total_income, 2),
        "businessIncome": round(total_business_income, 2),
        "personalIncome": round(total_personal_income, 2),
        "totalExpenses": round(total_expenses, 2),
        "netProfit": round(total_income - total_expenses, 2),
        "incomeByMonth": income_by_month,
        "expenseByMonth": expense_by_month
    }

@api_router.get("/reports/cash-flow")
async def get_cash_flow_report(current_user: dict = Depends(get_current_user)):
    """Cash flow statement showing inflows and outflows"""
    user_id = current_user["id"]
    
    bank_accounts = await db.bank_accounts.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    income_entries = await db.income.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    total_opening = sum(acc.get("opening_balance", 0) for acc in bank_accounts)
    
    business_income = sum(e["amount"] for e in income_entries if e.get("income_type", "invoice") == "invoice")
    personal_income = sum(e["amount"] for e in income_entries if e.get("income_type") == "personal")
    total_income = business_income + personal_income
    
    total_expenses = sum(exp["amount"] for exp in expenses)
    
    # Group expenses by category
    expense_by_category = {}
    for exp in expenses:
        cat = exp.get("category", "Other")
        expense_by_category[cat] = expense_by_category.get(cat, 0) + exp["amount"]
    
    net_cash_flow = total_income - total_expenses
    closing_balance = total_opening + net_cash_flow
    
    return {
        "openingBalance": round(total_opening, 2),
        "inflows": {
            "businessIncome": round(business_income, 2),
            "personalIncome": round(personal_income, 2),
            "totalInflows": round(total_income, 2)
        },
        "outflows": {
            "byCategory": {k: round(v, 2) for k, v in expense_by_category.items()},
            "totalOutflows": round(total_expenses, 2)
        },
        "netCashFlow": round(net_cash_flow, 2),
        "closingBalance": round(closing_balance, 2)
    }

@api_router.get("/reports/audit-log")
async def get_audit_log(limit: int = 100, current_user: dict = Depends(get_current_user)):
    logs = await db.audit_logs.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(limit)
    
    return logs

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
