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

#### Ledger Calculation (Corrected)
```
Opening Balance + Total Income Received - Total Expenses = Closing Balance
```
- Invoice total ≠ income unless payment is recorded
- Outstanding amount tracked separately

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Shadcn/UI, jsPDF, html2canvas
- **Backend:** FastAPI, Python
- **Database:** MongoDB (all data - contacts, invoices, customers, products, expenses, income, bank accounts)
- **Auth:** Custom JWT authentication (python-jose, passlib[bcrypt])

## Admin Credentials
- **Email:** dhruvk99999@gmail.com
- **Password:** Dhruv@1503
- **Access:** /admin route

## Database Collections (MongoDB)
- `users` - User accounts for admin access
- `business` - User business profile with GSTIN
- `bank_accounts` - Multiple bank accounts per user
- `customers` - Customer records with GST info
- `products` - Product/service catalog with GST rates
- `invoices` - Invoice records with GST calculations (supports soft delete)
- `income` - Payment records against invoices
- `expenses` - Expense tracking
- `ledger_settings` - Opening balance configuration
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

### Bank Accounts
- `GET /api/bank-accounts` - List all bank accounts
- `POST /api/bank-accounts` - Create bank account
- `PUT /api/bank-accounts/{id}` - Update bank account
- `PUT /api/bank-accounts/{id}/opening-balance` - Set opening balance
- `DELETE /api/bank-accounts/{id}` - Delete bank account

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

### Income (NEW)
- `GET /api/income` - List all income entries
- `POST /api/income` - Record payment against invoice
- `PUT /api/income/{id}` - Update income entry
- `DELETE /api/income/{id}` - Delete income entry

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Ledger Settings
- `GET /api/ledger-settings` - Get ledger settings
- `POST /api/ledger-settings` - Create settings
- `PUT /api/ledger-settings` - Update settings (opening balance)

### Dashboard & Ledger
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/ledger` - Get ledger data with all calculations

### Reports
- `GET /api/reports/outstanding` - Outstanding invoices report
- `GET /api/reports/income-expense` - Income vs expense summary
- `GET /api/reports/audit-log` - Audit log entries

## Testing Status (January 18, 2026)
- ✅ All 47 backend API tests passed (100%)
  - 27 existing tests (auth, customers, products, expenses, invoices, dashboard)
  - 20 new tests (bank accounts, ledger settings, income, soft delete, discounts)
- ✅ All frontend UI tests passed
- Test files: `/app/tests/test_gst_api.py`, `/app/tests/test_enhanced_features.py`

## Prioritized Backlog

### P0 (Critical) ✅ DONE
- [x] Public website with all sections
- [x] Admin authentication (JWT)
- [x] Invoice management system with MongoDB
- [x] Income module for payment tracking
- [x] Multiple bank accounts
- [x] Item-level and invoice-level discounts
- [x] Soft delete for invoices
- [x] Professional PDF invoice layout
- [x] Proper ledger calculation (Opening + Income - Expenses)

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
│   │   │   │   ├── AdminIncome.jsx       # NEW - Payment tracking
│   │   │   │   ├── AdminSettings.jsx     # Bank accounts, opening balance
│   │   │   │   ├── AdminLedger.jsx       # Updated ledger calculation
│   │   │   │   ├── AdminDashboard.jsx    # Updated stats
│   │   │   │   ├── ViewInvoice.jsx       # Professional PDF layout
│   │   │   │   ├── CreateInvoice.jsx     # Item-level discounts
│   │   │   │   └── ...
│   │   │   └── HomePage.jsx      # Corporate website
│   │   ├── services/
│   │   │   └── api.js            # API wrapper with all endpoints
│   │   └── App.js
│   └── .env                      # REACT_APP_BACKEND_URL
└── tests/
    ├── test_gst_api.py           # Original API tests (27 tests)
    └── test_enhanced_features.py # New features tests (20 tests)
```

## Notes
- The "Made with Emergent" badge in preview is from Emergent platform script and is expected for Emergent-hosted apps
- All user data (business, invoices, customers, etc.) has been preserved during migrations
