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

## What's Been Implemented (December 2025)

### Public Website
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

### Admin Portal (/admin)
- [x] Admin authentication page (Supabase Auth)
- [x] Dashboard with stats
- [x] Invoice creation with GST calculation (CGST+SGST/IGST)
- [x] Invoice viewing with PDF download
- [x] Customer management (CRUD)
- [x] Product/Service catalog (CRUD)
- [x] Expense tracking (CRUD)
- [x] Financial ledger (Income/Expenses/Profit)
- [x] Business settings

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Shadcn/UI
- **Backend:** FastAPI, Python (contact form)
- **Databases:** 
  - MongoDB (contact form submissions)
  - Supabase PostgreSQL (invoice management)
- **Auth:** Supabase Authentication

## Admin Credentials
- **Email:** dhruvk99999@gmail.com
- **Password:** Dhruv@1503
- **NOTE:** Email confirmation required before login

## Database Schema (Supabase)
Tables created:
- business (user business profile)
- customers (customer records)
- products (product/service catalog)
- invoices (invoice records)
- invoice_items (line items)
- expenses (expense tracking)

## API Endpoints

### Backend (FastAPI)
- `GET /api/` - Health check
- `GET /api/health` - Status check
- `POST /api/contact` - Contact form submission
- `GET /api/contacts` - List contacts (admin)

### Frontend (Supabase)
All data operations through Supabase client library.

## Important Notes

### Email Confirmation Required
To use the admin portal, the user must:
1. Check email (dhruvk99999@gmail.com) for Supabase confirmation
2. Click the confirmation link
3. Then sign in at /admin

### Database Setup
The SQL schema file is at `/app/frontend/src/lib/schema.sql`
Tables and RLS policies should already be created in Supabase.

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Public website with all sections
- [x] Admin login page
- [x] Invoice management system

### P1 (High Priority) - User Action Required
- [ ] Confirm email to activate admin account
- [ ] Set up business profile in Settings

### P2 (Medium Priority) - Future
- [ ] Email notifications for new leads
- [ ] Blog section
- [ ] Client testimonials carousel
- [ ] Case studies/portfolio
- [ ] WhatsApp invoice sharing

### P3 (Low Priority) - Future
- [ ] Recurring invoices
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Tax reports export

## Next Tasks
1. Confirm email to activate admin account
2. Set up business profile with GSTIN
3. Add customers and products
4. Create first invoice
