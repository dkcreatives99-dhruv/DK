# DK Kinetic Digital LLP - Invoice Management System PRD

## Original Problem Statement
Create a modern, conversion-focused website for DK Kinetic Digital LLP with integrated GST Invoice Management System. The system should support advanced invoicing, income tracking, item-level discounts, accurate ledger reconciliation, and clean print/download outputs.

## Company Details
- **Name:** DK Kinetic Digital LLP
- **Location:** Rohtak, Haryana, India
- **Partners:** Dhruv Kaushik, Ram Phul Sharma
- **Business Nature:** Digital Marketing, Branding, Web Development, AI Solutions, Event Management

## User Personas
1. **Website Visitors** - Potential clients viewing services
2. **Admin User** - Business owner managing invoices, customers, income, expenses

## What's Been Implemented (January 2026)

### Public Website ✅
- Hero Section with animated background
- Services Section (5 service categories in bento grid)
- About Us Section with team and values
- Technology & AI Section
- Industries Section (8 industries)
- Contact Form (MongoDB storage)
- Footer with social links
- Smooth scroll navigation
- Mobile responsive design
- Framer Motion animations

### Admin Portal (/admin) ✅ - MongoDB Backend

#### Core Features
- [x] JWT-based authentication (signup/login)
- [x] Dashboard with comprehensive business stats
- [x] Customer management (CRUD)
- [x] Product/Service catalog (CRUD)
- [x] GST Invoice creation with CGST/SGST/IGST logic
- [x] Invoice viewing with professional PDF layout

#### Enhanced Features (January 18, 2026)
- [x] **Income Module** - Track actual payments received against invoices
  - Partial payment support
  - Multiple payments per invoice
  - Payment mode tracking (Cash, Bank, UPI, Cheque, Other)
  - Automatic invoice status updates (unpaid → partial → paid)
- [x] **Multiple Bank Accounts** - Add, edit, delete bank accounts
  - Primary account designation
  - Account details shown on invoices
- [x] **Opening Balance** - Admin can set opening balance for ledger
  - Opening balance date configuration
- [x] **Item-Level Discounts** - Percentage or fixed amount per line item
  - Discount applied before GST calculation
- [x] **Invoice-Level Discounts** - Additional discount on invoice total
- [x] **Soft Delete for Invoices** - Audit-safe deletion with restore capability
  - Deleted invoices excluded from ledger/reports
  - Restore functionality available
- [x] **Audit Logs** - Track all create/update/delete operations
- [x] **Professional PDF Layout** - Matches reference invoice structure
  - Company header with GSTIN
  - Buyer details section
  - Itemized table with HSN codes
  - Tax breakup table (Central Tax, State Tax)
  - Amount in words
  - Bank details
  - Authorised signatory section

#### Advanced Financial Features (January 18, 2026) ✅ NEW
- [x] **Dual-Type Income Support**
  - Invoice-linked income (Business) - Payment against invoices
  - Personal income (Non-invoice) - Family Support, Personal Transfer, Capital Infusion, Other
  - Separate tracking and reporting for business vs personal
- [x] **Mandatory Bank Account for Income**
  - All income entries must specify which bank received the money
  - "Credited To" field in income form
- [x] **Mandatory Bank Account for Expenses**
  - All expenses must specify which bank was debited
  - "Paid From" field in expense form
- [x] **Mandatory Opening Balance for Bank Accounts**
  - Opening balance required when creating new bank accounts
  - Opening balance date required
  - Opening balance locked after account creation (cannot be modified)
- [x] **Bank-wise Ledger View**
  - Individual ledger for each bank account
  - Running balance calculation
  - Transaction details with credit/debit columns
  - Opening balance row at top
- [x] **Consolidated Ledger View**
  - Combined view across all bank accounts
  - Business vs Personal income breakdown
  - Total opening balance from all accounts
  - Closing balance calculation
- [x] **Bank Transfers**
  - Transfer funds between bank accounts
  - Balance validation before transfer
  - Audit trail for transfers
- [x] **Dashboard Income Breakdown**
  - Business Income (from invoices)
  - Personal Income (non-invoice)
  - Current Balance across all accounts

#### Ledger Calculation (Corrected)
```
Opening Balance + Total Income Received - Total Expenses = Closing Balance
```
- Invoice total ≠ income unless payment is recorded
- Outstanding amount tracked separately
- Bank-wise balance calculated with running totals

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Shadcn/UI, jsPDF, html2canvas
- **Backend:** FastAPI, Python
- **Database:** MongoDB (all data - contacts, invoices, customers, products, expenses, income, bank accounts, audit logs, bank transfers)
- **Auth:** Custom JWT authentication (python-jose, passlib[bcrypt])

## Admin Credentials
- **Email:** dhruvk99999@gmail.com
- **Password:** Dhruv@1503
- **Access:** /admin route

## Database Collections (MongoDB)
- `users` - User accounts for admin access
- `business` - User business profile with GSTIN
- `bank_accounts` - Multiple bank accounts per user with opening balance
- `bank_transfers` - Inter-bank transfer records
- `customers` - Customer records with GST info
- `products` - Product/service catalog with GST rates
- `invoices` - Invoice records with GST calculations (supports soft delete)
- `income` - Payment records (invoice-linked or personal)
- `expenses` - Expense tracking with bank account link
- `audit_logs` - Action logs for all entities
- `contacts` - Contact form submissions

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login, returns JWT token
- `GET /api/auth/me` - Get current user

### Business
- `GET /api/business` - Get business profile
- `POST /api/business` - Create business profile
- `PUT /api/business` - Update business profile

### Bank Accounts (Enhanced)
- `GET /api/bank-accounts` - List all bank accounts with current balance
- `GET /api/bank-accounts/{id}` - Get single bank account
- `POST /api/bank-accounts` - Create bank account (opening_balance & opening_balance_date REQUIRED)
- `PUT /api/bank-accounts/{id}` - Update bank account (opening_balance NOT updatable)
- `PUT /api/bank-accounts/{id}/opening-balance` - Admin correction with reason for audit
- `DELETE /api/bank-accounts/{id}` - Delete bank account (only if no transactions)

### Bank Transfers (NEW)
- `GET /api/bank-transfers` - List all transfers
- `POST /api/bank-transfers` - Create transfer (validates balance)
- `DELETE /api/bank-transfers/{id}` - Delete transfer

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Invoices
- `GET /api/invoices` - List all invoices (include_deleted=true for deleted)
- `GET /api/invoices/{id}` - Get single invoice
- `GET /api/invoices/next-number/get` - Get next invoice number
- `POST /api/invoices` - Create invoice (supports item-level discounts)
- `PUT /api/invoices/{id}/payment` - Update payment status
- `PUT /api/invoices/{id}/status` - Update invoice status
- `DELETE /api/invoices/{id}` - Soft delete invoice
- `PUT /api/invoices/{id}/restore` - Restore deleted invoice

### Income (Enhanced - Dual Type)
- `GET /api/income` - List all income entries
- `GET /api/income?income_type=invoice` - Filter business income
- `GET /api/income?income_type=personal` - Filter personal income
- `POST /api/income` - Record income (bank_account_id REQUIRED)
- `PUT /api/income/{id}` - Update income entry
- `DELETE /api/income/{id}` - Delete income entry

### Expenses (Enhanced - Mandatory Bank)
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create expense (bank_account_id REQUIRED)
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Dashboard & Ledger (Enhanced)
- `GET /api/dashboard/stats` - Dashboard stats with business/personal income breakdown
- `GET /api/ledger` - Consolidated ledger data
- `GET /api/ledger/bank/{bank_id}` - Bank-wise ledger with running balance

### Reports
- `GET /api/reports/outstanding` - Outstanding invoices report
- `GET /api/reports/income-expense` - Income vs expense summary
- `GET /api/reports/audit-log` - Audit log entries

## Testing Status (January 18, 2026)
- ✅ All 22 enhanced financial feature tests passed (100%)
- ✅ Backend API tests: Authentication, Bank Accounts, Income, Expenses, Transfers, Ledger
- ✅ Frontend UI tests: All pages and flows working
- Test files: `/app/tests/test_enhanced_financial_features.py`

## Prioritized Backlog

### P0 (Critical) ✅ ALL DONE
- [x] Public website with all sections
- [x] Admin authentication (JWT)
- [x] Invoice management system with MongoDB
- [x] Income module for payment tracking
- [x] Multiple bank accounts with opening balance
- [x] Item-level and invoice-level discounts
- [x] Soft delete for invoices
- [x] Professional PDF invoice layout
- [x] Proper ledger calculation (Opening + Income - Expenses)
- [x] Dual-type income (Business vs Personal)
- [x] Mandatory bank account for income/expenses
- [x] Mandatory opening balance for bank accounts
- [x] Bank-wise and consolidated ledger views
- [x] Bank transfers between accounts

### P1 (High Priority) - Upcoming
- [ ] Super-admin feature for cross-user data visibility
- [ ] "Remember Me" option for 30-day JWT sessions
- [ ] CSV export for invoices and customers
- [ ] Email invoices to customers

### P2 (Medium Priority) - Future
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Dashboard chart visualizations
- [ ] Tax reports (GSTR-1, GSTR-3B)
- [ ] Recurring invoices

### P3 (Low Priority) - Future
- [ ] Multi-language support
- [ ] WhatsApp invoice sharing
- [ ] Blog section
- [ ] Client testimonials/portfolio

## Architecture

```
/app/
├── backend/
│   ├── server.py          # FastAPI with JWT auth & all CRUD endpoints
│   ├── requirements.txt
│   └── .env               # MONGO_URL, DB_NAME, JWT_SECRET_KEY
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx    # Navigation with Income tab
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.js     # JWT auth state management
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx    # Updated with income breakdown
│   │   │   │   ├── AdminIncome.jsx       # Dual type income support
│   │   │   │   ├── AdminExpenses.jsx     # Mandatory bank selection
│   │   │   │   ├── AdminLedger.jsx       # Consolidated + Bank-wise views
│   │   │   │   ├── AdminSettings.jsx     # Bank accounts with opening balance
│   │   │   │   ├── ViewInvoice.jsx       # Professional PDF layout
│   │   │   │   ├── CreateInvoice.jsx     # Item-level discounts
│   │   │   │   └── ...
│   │   │   └── HomePage.jsx      # Corporate website
│   │   ├── services/
│   │   │   └── api.js            # API wrapper with all endpoints
│   │   └── App.js
│   └── .env                      # REACT_APP_BACKEND_URL
└── tests/
    └── test_enhanced_financial_features.py  # 22 tests for enhanced features
```

## Notes
- Legacy data (income/expenses without bank_account_id) is supported with optional fields in response models
- All new income/expense entries require bank account selection (validated at API level)
- Opening balance is locked immediately after bank account creation
- Bank transfers validate sufficient balance before execution
