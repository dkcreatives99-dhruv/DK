# DK Kinetic Digital LLP - Corporate Website with GST Invoice Management PRD

## Original Problem Statement
Create a modern, high-performance, conversion-focused website for DK Kinetic Digital LLP with integrated GST Invoice Management System accessible via hidden admin route.

## Company Details
- **Name:** DK Kinetic Digital LLP
- **Location:** Rohtak, Haryana, India
- **Partners:** Dhruv Kaushik, Ram Phul Sharma
- **Business Nature:** Digital Marketing, Branding, Web Development, AI Solutions, Event Management

## User Personas
1. **Website Visitors** - Potential clients viewing services
2. **Admin Users** - Business owners managing invoices, customers, expenses

## Core Requirements

### Public Website
- Modern corporate design with dark theme and electric blue accent
- All service categories showcased
- Contact form with database storage

### Admin Portal (Invoice Management)
- GST-compliant invoice generation
- Customer and product management
- Expense tracking
- Financial ledger
- PDF invoice download

## What's Been Implemented (January 2026)

### Public Website ✅
- [x] Hero Section with animated background
- [x] Services Section (5 service categories in bento grid)
- [x] About Us Section with team and values
- [x] Technology & AI Section
- [x] Industries Section (8 industries)
- [x] Contact Form (MongoDB storage)
- [x] Footer with social links
- [x] Smooth scroll navigation
- [x] Mobile responsive design
- [x] Framer Motion animations

### Admin Portal (/admin) ✅ - Migrated to MongoDB
- [x] JWT-based authentication (signup/login)
- [x] Dashboard with business stats
- [x] Invoice creation with GST calculation (CGST+SGST for intra-state, IGST for inter-state)
- [x] Invoice viewing with PDF download
- [x] Invoice list with payment status tracking
- [x] Customer management (CRUD)
- [x] Product/Service catalog (CRUD)
- [x] Expense tracking (CRUD)
- [x] Financial ledger (Income/Expenses/Profit)
- [x] Business settings

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Shadcn/UI
- **Backend:** FastAPI, Python
- **Database:** MongoDB (all data - contacts, invoices, customers, products, expenses)
- **Auth:** Custom JWT authentication (python-jose, passlib[bcrypt])

## Admin Credentials
- **Email:** dhruvk99999@gmail.com
- **Password:** Dhruv@1503
- **Access:** /admin route

## Database Collections (MongoDB)
- `users` - User accounts for admin access
- `business` - User business profile with GSTIN
- `customers` - Customer records with GST info
- `products` - Product/service catalog with GST rates
- `invoices` - Invoice records with GST calculations
- `invoice_items` - Line items for invoices
- `expenses` - Expense tracking
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
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/{id}` - Get single invoice
- `GET /api/invoices/next-number/get` - Get next invoice number
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/{id}/payment` - Update payment status

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Dashboard & Ledger
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/ledger` - Get ledger data

### Public
- `GET /api/` - API info
- `GET /api/health` - Health check
- `POST /api/contact` - Contact form submission

## Testing Status (January 16, 2026)
- ✅ All 27 backend API tests passed (100%)
- ✅ All frontend UI tests passed
- ✅ Authentication flow verified
- ✅ CRUD operations verified for all entities
- ✅ GST calculations verified (CGST/SGST and IGST)
- Test file: `/app/tests/test_gst_api.py`

## Prioritized Backlog

### P0 (Critical) ✅ DONE
- [x] Public website with all sections
- [x] Admin authentication (JWT)
- [x] Invoice management system with MongoDB

### P1 (High Priority) - Upcoming
- [ ] Super-admin feature for cross-user data visibility
- [ ] "Remember Me" option for 30-day JWT sessions
- [ ] CSV export for invoices and customers

### P2 (Medium Priority) - Future
- [ ] Email invoices to customers
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Recurring invoices
- [ ] Tax reports (GSTR-1, GSTR-3B)
- [ ] Dashboard chart visualizations

### P3 (Low Priority) - Future
- [ ] Multi-language support
- [ ] WhatsApp invoice sharing
- [ ] Blog section
- [ ] Client testimonials
- [ ] Case studies/portfolio

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
│   │   │   ├── AdminLayout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.js     # JWT auth state management
│   │   ├── pages/
│   │   │   ├── admin/            # All admin pages
│   │   │   └── HomePage.jsx      # Corporate website
│   │   ├── services/
│   │   │   └── api.js            # API wrapper with token handling
│   │   └── App.js
│   └── .env                      # REACT_APP_BACKEND_URL
└── tests/
    └── test_gst_api.py           # Comprehensive API tests
```

## Migration Notes (Supabase → MongoDB)
The invoice management system was migrated from Supabase to MongoDB on January 16, 2026:
- Removed external Supabase dependency
- Implemented custom JWT authentication
- All data now stored in MongoDB
- User data isolation enforced via user_id field in all collections
- Deleted obsolete files: `supabaseClient.js`, `schema.sql`
