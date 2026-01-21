# 🏢 DK KINETIC DIGITAL LLP - COMPLETE GST INVOICE MANAGEMENT SYSTEM

## MASTER PROMPT (Final & Professional)

---

### 📋 PROJECT OVERVIEW

Build a **modern corporate website** for **DK Kinetic Digital LLP** with an integrated **GST Invoice Management System**. The system should be production-ready, professional, and tailored for Indian GST compliance.

---

### 🏗️ ARCHITECTURE

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Tailwind CSS, Shadcn/UI, Framer Motion |
| Backend | FastAPI (Python) |
| Database | MongoDB |
| Authentication | Custom JWT (python-jose, passlib[bcrypt]) |
| PDF Generation | jsPDF, html2canvas |

---

### 🌐 PART 1: PUBLIC CORPORATE WEBSITE

**Route:** `/`

**Sections Required:**
1. **Hero Section** - Animated gradient background, company tagline, CTA buttons
2. **Services Section** - Bento grid layout with 5 services:
   - Digital Marketing
   - Brand Identity & Design
   - Web Development
   - AI & Automation Solutions
   - Event Management
3. **About Us Section** - Company story, team (Dhruv Kaushik, Ram Phul Sharma), core values
4. **Technology & AI Section** - Modern tech stack showcase
5. **Industries Section** - 8 industries served (Healthcare, E-commerce, Real Estate, Education, etc.)
6. **Contact Form** - Name, Email, Phone, Message (stored in MongoDB)
7. **Footer** - Social links, copyright, quick links

**Design Requirements:**
- Mobile-first responsive design
- Smooth scroll navigation
- Framer Motion animations
- Professional color palette (Blue primary, clean whites)
- NO emoji icons - use Lucide React icons

---

### 🔐 PART 2: ADMIN PORTAL - AUTHENTICATION

**Route:** `/admin`

**Features:**
- Sign Up (Name, Email, Password with bcrypt hashing)
- Sign In (JWT token generation, 24-hour expiry)
- Protected routes requiring valid JWT
- User session management via AuthContext
- Logout functionality

**Security:**
- JWT stored in localStorage
- Authorization header: `Bearer {token}`
- All admin API endpoints require authentication

---

### 📊 PART 3: ADMIN DASHBOARD

**Route:** `/admin/dashboard`

**Stats Cards:**
| Card | Description |
|------|-------------|
| Opening Balance | Sum of all bank account opening balances |
| Income Received | Total payments received (with Business/Personal breakdown) |
| Total Expenses | Sum of all recorded expenses |
| Current Balance | Opening + Income - Expenses |
| Business Income | Invoice-linked payments only |
| Personal Income | Non-invoice income (family, capital, etc.) |

**Additional Stats:**
- Total Invoices count
- Total Customers count
- Total Products count
- Pending Payments count
- Outstanding Amount alert

**Quick Actions:**
- New Invoice
- Record Payment
- Add Expense
- View Ledger

**Recent Invoices Table:**
- Invoice #, Date, Customer, Amount, Paid, Status, Action

---

### 👥 PART 4: CUSTOMER MANAGEMENT

**Route:** `/admin/customers`

**Fields:**
| Field | Type | Required |
|-------|------|----------|
| name | string | ✅ |
| email | string | ❌ |
| phone | string | ❌ |
| gstin | string | ❌ |
| address | string | ❌ |
| city | string | ❌ |
| state | string | ✅ (dropdown - Indian states) |
| pincode | string | ❌ |

**Features:**
- CRUD operations
- Search/filter
- State dropdown with all Indian states

---

### 📦 PART 5: PRODUCT/SERVICE CATALOG

**Route:** `/admin/products`

**Fields:**
| Field | Type | Required |
|-------|------|----------|
| name | string | ✅ |
| hsn_code | string | ✅ |
| description | string | ❌ |
| unit | string | ✅ (Nos, Hrs, Days, etc.) |
| price | number | ✅ |
| gst_rate | number | ✅ (0, 5, 12, 18, 28) |

**Features:**
- CRUD operations
- GST rate dropdown
- Unit type dropdown

---

### 🧾 PART 6: INVOICE MANAGEMENT

**Route:** `/admin/invoices`

#### Invoice Creation (`/admin/invoices/new`)

**Header Fields:**
| Field | Description |
|-------|-------------|
| Invoice Number | Auto-generated (DKK/2025-26/001 format) |
| Invoice Date | Date picker |
| Due Date | Date picker |
| Customer | Dropdown (from customers) |
| Place of Supply | State dropdown |

**Line Items:**
| Field | Description |
|-------|-------------|
| Product | Dropdown (from products) |
| Description | Auto-filled, editable |
| HSN Code | Auto-filled from product |
| Quantity | Number input |
| Rate | Auto-filled, editable |
| Discount | **Item-level** - % or Fixed amount |
| Taxable Value | (Qty × Rate) - Discount |
| GST Rate | Auto-filled from product |
| GST Amount | CGST + SGST or IGST |
| Total | Taxable + GST |

**Invoice-Level Discount:**
| Field | Description |
|-------|-------------|
| Discount Type | Percentage or Fixed |
| Discount Value | Applied after subtotal |

**GST Logic:**
```
IF (Place of Supply == Business State) THEN
    CGST = GST Rate / 2
    SGST = GST Rate / 2
    IGST = 0
ELSE
    CGST = 0
    SGST = 0
    IGST = GST Rate
```

**Totals Section:**
- Subtotal (sum of line items before GST)
- Total CGST
- Total SGST
- Total IGST
- Invoice Discount
- Grand Total
- Amount in Words (Indian format)

#### Invoice View (`/admin/invoices/{id}`)

**Professional PDF Layout:**
```
┌─────────────────────────────────────────────────────┐
│ [LOGO]  COMPANY NAME                    TAX INVOICE │
│         Address, City, State - Pincode              │
│         GSTIN: XXAAAAA0000A1Z5                      │
├─────────────────────────────────────────────────────┤
│ Invoice No: DKK/2025-26/001    Date: 18-Jan-2026   │
│ Place of Supply: Haryana                            │
├─────────────────────────────────────────────────────┤
│ BILL TO:                      SHIP TO:              │
│ Customer Name                 (Same or different)   │
│ Address                                             │
│ GSTIN: XXBBBB0000B1Z5                              │
├─────────────────────────────────────────────────────┤
│ # │ Description │ HSN │ Qty │ Rate │ Disc │ Amount │
│ 1 │ Service XYZ │ 998 │ 10  │ 1000 │ 5%   │ 9,500  │
├─────────────────────────────────────────────────────┤
│                              Subtotal:    ₹9,500.00 │
│                              CGST @9%:      ₹855.00 │
│                              SGST @9%:      ₹855.00 │
│                              Discount:     -₹500.00 │
│                              ─────────────────────  │
│                              TOTAL:      ₹10,710.00 │
├─────────────────────────────────────────────────────┤
│ Amount in Words: Rupees Ten Thousand Seven Hundred  │
│ and Ten Only                                        │
├─────────────────────────────────────────────────────┤
│ Bank Details:                                       │
│ Bank: HDFC Bank │ A/C: 1234567890 │ IFSC: HDFC00123│
├─────────────────────────────────────────────────────┤
│ Terms & Conditions                                  │
│ 1. Payment due within 30 days                       │
├─────────────────────────────────────────────────────┤
│                              Authorised Signatory   │
│                              [Signature Area]       │
│                              DK Kinetic Digital LLP │
└─────────────────────────────────────────────────────┘
```

**Invoice Actions:**
- Print (optimized for A4)
- Download PDF
- Record Payment
- Edit (if Draft)
- Delete (Soft delete)
- Restore (if deleted)

**Invoice Status Flow:**
```
Draft → Issued → Partial → Paid
                    ↓
               Cancelled
```

---

### 💰 PART 7: INCOME MODULE (Dual-Type)

**Route:** `/admin/income`

**Income Types:**

| Type | Description | Required Fields |
|------|-------------|-----------------|
| `invoice` (Business) | Payment against invoice | invoice_id, bank_account_id |
| `personal` | Non-invoice income | income_source, bank_account_id |

**Personal Income Sources:**
- Family Support
- Personal Transfer
- Capital Infusion
- Investment Returns
- Other

**Income Entry Fields:**
| Field | Type | Required |
|-------|------|----------|
| income_type | enum | ✅ |
| invoice_id | ObjectId | ✅ (if type=invoice) |
| income_source | string | ✅ (if type=personal) |
| amount | number | ✅ |
| payment_date | date | ✅ |
| payment_mode | enum | ✅ (Cash/Bank/UPI/Cheque/Other) |
| bank_account_id | ObjectId | ✅ **MANDATORY** |
| reference_number | string | ❌ |
| remarks | string | ❌ |

**Business Logic:**
- When invoice income recorded → Update invoice `amount_paid`
- When `amount_paid >= total_amount` → Status = `paid`
- When `amount_paid > 0 && < total_amount` → Status = `partial`
- Income credited to specified bank account

**Summary Cards:**
- Total Income
- Business Income (with count)
- Personal Income (with count)

---

### 💸 PART 8: EXPENSE MODULE

**Route:** `/admin/expenses`

**Expense Fields:**
| Field | Type | Required |
|-------|------|----------|
| category | string | ✅ |
| amount | number | ✅ |
| date | date | ✅ |
| vendor | string | ❌ |
| description | string | ❌ |
| payment_mode | enum | ✅ |
| bank_account_id | ObjectId | ✅ **MANDATORY** |
| reference_number | string | ❌ |

**Expense Categories:**
- Office Supplies
- Marketing
- Utilities
- Rent
- Salaries
- Travel
- Professional Services
- Software & Subscriptions
- Other

**Business Logic:**
- Expense debited from specified bank account
- Bank current_balance reduced

**Summary Cards:**
- Total Expenses
- Category-wise breakdown (pie chart data)

---

### 🏦 PART 9: BANK ACCOUNTS

**Route:** `/admin/settings` (Bank Accounts section)

**Bank Account Fields:**
| Field | Type | Required | Editable After Creation |
|-------|------|----------|------------------------|
| bank_name | string | ✅ | ✅ |
| account_number | string | ✅ | ✅ |
| ifsc_code | string | ✅ | ✅ |
| branch_name | string | ❌ | ✅ |
| account_type | enum | ✅ | ✅ |
| is_primary | boolean | ❌ | ✅ |
| opening_balance | number | ✅ | ❌ **LOCKED** |
| opening_balance_date | date | ✅ | ❌ **LOCKED** |

**Account Types:**
- Savings
- Current
- Overdraft

**Business Logic:**
- Opening balance is **MANDATORY** and **LOCKED** after creation
- `current_balance` = opening_balance + credits - debits
- Credits: Income entries to this account + transfers in
- Debits: Expense entries from this account + transfers out
- Primary account shown on invoices by default

**Features:**
- Add/Edit/Delete bank accounts
- View current balance per account
- Total balance across all accounts
- Bank transfer between accounts

---

### 🔄 PART 10: BANK TRANSFERS

**Route:** `/admin/settings` (Transfer button)

**Transfer Fields:**
| Field | Type | Required |
|-------|------|----------|
| from_account | ObjectId | ✅ |
| to_account | ObjectId | ✅ |
| amount | number | ✅ |
| transfer_date | date | ✅ |
| reference_number | string | ❌ |
| remarks | string | ❌ |

**Validations:**
- `from_account` ≠ `to_account`
- `amount` ≤ `from_account.current_balance`

**Business Logic:**
- Debit from source account
- Credit to destination account
- Record in bank_transfers collection
- Appears in both bank ledgers

---

### 📒 PART 11: LEDGER SYSTEM

**Route:** `/admin/ledger`

#### Consolidated View (Default)

**Summary Flow:**
```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   OPENING    │ + │   INCOME     │ - │   EXPENSES   │ = │   CLOSING    │
│   BALANCE    │   │   RECEIVED   │   │              │   │   BALANCE    │
│   ₹50,000    │   │   ₹1,50,000  │   │   ₹45,000    │   │   ₹1,55,000  │
│  (3 accounts)│   │ (Biz+Personal)   │   │ (15 entries) │   │              │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

**Income Breakdown Cards:**
| Card | Description |
|------|-------------|
| Business Income | From invoice payments |
| Personal Income | Non-invoice sources |

**Tabs:**
1. **Overview** - Recent income & expenses (5 each)
2. **Income** - All income entries table
3. **Expenses** - All expenses table
4. **Outstanding** - Unpaid invoices

#### Bank-wise View

**Bank Selector:**
- Tabs/buttons for each bank account
- Shows current balance per account

**Bank Summary:**
```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   OPENING    │ + │   CREDITS    │ - │   DEBITS     │
│   ₹10,000    │   │   ₹50,000    │   │   ₹15,000    │
└──────────────┘   └──────────────┘   └──────────────┘
                         ↓
              Current Balance: ₹45,000
```

**Transaction Table:**
| Date | Type | Description | Ref | Credit | Debit | Balance |
|------|------|-------------|-----|--------|-------|---------|
| 01-Jan | Opening | Opening Balance | - | ₹10,000 | - | ₹10,000 |
| 05-Jan | income | INV-001 Payment | CHQ123 | ₹25,000 | - | ₹35,000 |
| 10-Jan | expense | Office Supplies | - | - | ₹5,000 | ₹30,000 |
| 15-Jan | transfer_in | From HDFC | TRF001 | ₹20,000 | - | ₹50,000 |
| 18-Jan | transfer_out | To ICICI | TRF002 | - | ₹5,000 | ₹45,000 |

---

### ⚙️ PART 12: BUSINESS SETTINGS

**Route:** `/admin/settings`

**Business Information:**
| Field | Type | Required |
|-------|------|----------|
| business_name | string | ✅ |
| gstin | string | ✅ (15 char, validated) |
| address | string | ❌ |
| city | string | ❌ |
| state | string | ✅ (dropdown) |
| pincode | string | ❌ |
| phone | string | ❌ |
| email | string | ❌ |
| signatory_name | string | ❌ |
| signatory_designation | string | ❌ |

---

### 📊 PART 13: REPORTS (Future Enhancement)

**Planned Reports:**
1. **Outstanding Report** - Invoices with pending payments
2. **Income vs Expense** - Monthly comparison
3. **Tax Summary** - CGST/SGST/IGST collected
4. **GSTR-1** - Outward supplies
5. **GSTR-3B** - Summary return
6. **Cash Flow** - Monthly inflows/outflows by bank

---

### 🗄️ DATABASE SCHEMA

```javascript
// users
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  created_at: DateTime,
  updated_at: DateTime
}

// business
{
  _id: ObjectId,
  user_id: ObjectId,
  business_name: String,
  gstin: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  phone: String,
  email: String,
  signatory_name: String,
  signatory_designation: String,
  created_at: DateTime,
  updated_at: DateTime
}

// bank_accounts
{
  _id: ObjectId,
  user_id: ObjectId,
  bank_name: String,
  account_number: String,
  ifsc_code: String,
  branch_name: String,
  account_type: String,
  is_primary: Boolean,
  opening_balance: Number (LOCKED),
  opening_balance_date: String (LOCKED),
  opening_balance_locked: Boolean (true after creation),
  current_balance: Number (calculated),
  created_at: DateTime,
  updated_at: DateTime
}

// bank_transfers
{
  _id: ObjectId,
  user_id: ObjectId,
  from_account_id: ObjectId,
  to_account_id: ObjectId,
  amount: Number,
  transfer_date: String,
  reference_number: String,
  remarks: String,
  created_at: DateTime
}

// customers
{
  _id: ObjectId,
  user_id: ObjectId,
  name: String,
  email: String,
  phone: String,
  gstin: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  created_at: DateTime,
  updated_at: DateTime
}

// products
{
  _id: ObjectId,
  user_id: ObjectId,
  name: String,
  hsn_code: String,
  description: String,
  unit: String,
  price: Number,
  gst_rate: Number,
  created_at: DateTime,
  updated_at: DateTime
}

// invoices
{
  _id: ObjectId,
  user_id: ObjectId,
  invoice_number: String,
  invoice_date: String,
  due_date: String,
  customer_id: ObjectId,
  customer: Object (denormalized),
  place_of_supply: String,
  items: [{
    product_id: ObjectId,
    name: String,
    description: String,
    hsn_code: String,
    quantity: Number,
    rate: Number,
    discount_type: String,
    discount_value: Number,
    discount_amount: Number,
    taxable_amount: Number,
    gst_rate: Number,
    cgst_amount: Number,
    sgst_amount: Number,
    igst_amount: Number,
    total_amount: Number
  }],
  subtotal: Number,
  total_cgst: Number,
  total_sgst: Number,
  total_igst: Number,
  discount_type: String,
  discount_value: Number,
  discount_amount: Number,
  total_amount: Number,
  amount_in_words: String,
  status: String (Draft/Issued/Cancelled),
  payment_status: String (unpaid/partial/paid),
  amount_paid: Number,
  balance_due: Number,
  bank_account_id: ObjectId,
  notes: String,
  terms: String,
  deleted_at: DateTime (soft delete),
  created_at: DateTime,
  updated_at: DateTime
}

// income
{
  _id: ObjectId,
  user_id: ObjectId,
  income_type: String (invoice/personal),
  invoice_id: ObjectId (if type=invoice),
  income_source: String (if type=personal),
  amount: Number,
  payment_date: String,
  payment_mode: String,
  bank_account_id: ObjectId (MANDATORY),
  reference_number: String,
  remarks: String,
  created_at: DateTime,
  updated_at: DateTime
}

// expenses
{
  _id: ObjectId,
  user_id: ObjectId,
  category: String,
  amount: Number,
  date: String,
  vendor: String,
  description: String,
  payment_mode: String,
  bank_account_id: ObjectId (MANDATORY),
  reference_number: String,
  created_at: DateTime,
  updated_at: DateTime
}

// audit_logs
{
  _id: ObjectId,
  user_id: ObjectId,
  entity_type: String,
  entity_id: ObjectId,
  action: String (create/update/delete/restore),
  changes: Object,
  timestamp: DateTime
}

// contacts (website form)
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  message: String,
  created_at: DateTime
}
```

---

### 🔌 API ENDPOINTS SUMMARY

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register user |
| POST | /api/auth/login | Login, get JWT |
| GET | /api/auth/me | Get current user |
| GET/POST/PUT | /api/business | Business profile CRUD |
| GET/POST/PUT/DELETE | /api/bank-accounts | Bank accounts CRUD |
| GET/POST/DELETE | /api/bank-transfers | Bank transfers |
| GET/POST/PUT/DELETE | /api/customers | Customers CRUD |
| GET/POST/PUT/DELETE | /api/products | Products CRUD |
| GET/POST | /api/invoices | Invoices CRUD |
| PUT | /api/invoices/{id}/restore | Restore deleted |
| DELETE | /api/invoices/{id} | Soft delete |
| GET/POST/PUT/DELETE | /api/income | Income CRUD |
| GET/POST/PUT/DELETE | /api/expenses | Expenses CRUD |
| GET | /api/ledger | Consolidated ledger |
| GET | /api/ledger/bank/{id} | Bank-wise ledger |
| GET | /api/dashboard/stats | Dashboard statistics |
| POST | /api/contact | Website contact form |

---

### ✅ ACCEPTANCE CRITERIA

1. **Authentication**
   - [x] Users can sign up and log in
   - [x] JWT token valid for 24 hours
   - [x] Protected routes redirect to login

2. **Invoicing**
   - [x] Create invoices with GST calculation
   - [x] Item-level and invoice-level discounts
   - [x] Professional PDF generation
   - [x] Soft delete with restore

3. **Income Tracking**
   - [x] Dual-type income (business/personal)
   - [x] Mandatory bank account selection
   - [x] Auto-update invoice payment status

4. **Expense Tracking**
   - [x] Category-based expenses
   - [x] Mandatory bank account selection

5. **Bank Management**
   - [x] Multiple bank accounts
   - [x] Mandatory opening balance (locked)
   - [x] Inter-bank transfers
   - [x] Real-time balance calculation

6. **Ledger**
   - [x] Consolidated view with income breakdown
   - [x] Bank-wise view with running balance
   - [x] Accurate calculation: Opening + Income - Expenses = Closing

7. **Dashboard**
   - [x] Financial overview with all key metrics
   - [x] Business vs Personal income split
   - [x] Outstanding amount alert

---

### 🎨 DESIGN SYSTEM

**Colors:**
- Primary: #2563EB (Blue)
- Success: #16A34A (Green)
- Warning: #F59E0B (Amber)
- Error: #DC2626 (Red)
- Background: #F8FAFC (Slate-50)
- Text: #0F172A (Slate-900)

**Typography:**
- Headings: Syne (Google Fonts)
- Body: Manrope (Google Fonts)

**Components:**
- Use Shadcn/UI components
- Consistent border-radius: 8px
- Card shadows: shadow-sm
- Hover states on all interactive elements

---

### 📱 RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Columns |
|------------|-------|---------|
| Mobile | < 640px | 1 |
| Tablet | 640-1024px | 2 |
| Desktop | > 1024px | 4 |

---

### 🚀 DEPLOYMENT NOTES

- Backend runs on port 8001
- Frontend runs on port 3000
- All API calls prefixed with `/api`
- Environment variables in `.env` files
- MongoDB connection via `MONGO_URL`

---

**END OF MASTER PROMPT**

---

*Last Updated: January 18, 2026*
*Version: 2.0 (Advanced Financial Features)*
*Author: DK Kinetic Digital LLP*
