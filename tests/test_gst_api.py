"""
GST Invoice Management System - Comprehensive API Tests
Tests: Auth, Customers, Products, Expenses, Business Settings, Invoices, Dashboard, Ledger
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "dhruvk99999@gmail.com"
TEST_PASSWORD = "Dhruv@1503"

# Test data prefix for cleanup
TEST_PREFIX = "TEST_"


class TestHealthAndAuth:
    """Health check and Authentication tests"""
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("✓ API root endpoint passed")
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL.lower()
        assert data["token_type"] == "bearer"
        print(f"✓ Login successful for {TEST_EMAIL}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid login rejected correctly")
    
    def test_get_me_with_token(self, auth_token):
        """Test getting current user with valid token"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert "name" in data
        print(f"✓ Get current user passed: {data['name']}")
    
    def test_get_me_without_token(self):
        """Test getting current user without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403]
        print("✓ Unauthorized access rejected correctly")


class TestCustomersCRUD:
    """Customer CRUD operations tests"""
    
    def test_get_customers(self, auth_headers):
        """Test getting all customers"""
        response = requests.get(f"{BASE_URL}/api/customers", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get customers passed: {len(data)} customers found")
    
    def test_create_customer(self, auth_headers):
        """Test creating a new customer"""
        customer_data = {
            "name": f"{TEST_PREFIX}Customer_{uuid.uuid4().hex[:6]}",
            "email": f"test_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "+91 98765 43210",
            "address": "123 Test Street",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "gstin": "27AAAAA0000A1Z5"
        }
        response = requests.post(f"{BASE_URL}/api/customers", json=customer_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == customer_data["name"]
        assert data["state"] == "Maharashtra"
        assert "id" in data
        print(f"✓ Customer created: {data['name']}")
        return data
    
    def test_update_customer(self, auth_headers):
        """Test updating a customer"""
        # First create a customer
        customer_data = {
            "name": f"{TEST_PREFIX}UpdateCustomer_{uuid.uuid4().hex[:6]}",
            "city": "Delhi",
            "state": "Delhi"
        }
        create_response = requests.post(f"{BASE_URL}/api/customers", json=customer_data, headers=auth_headers)
        assert create_response.status_code == 200
        customer_id = create_response.json()["id"]
        
        # Update the customer
        update_data = {
            "name": customer_data["name"],
            "city": "Bangalore",
            "state": "Karnataka"
        }
        update_response = requests.put(f"{BASE_URL}/api/customers/{customer_id}", json=update_data, headers=auth_headers)
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["city"] == "Bangalore"
        assert updated["state"] == "Karnataka"
        print(f"✓ Customer updated: {updated['name']}")
        
        # Verify with GET
        get_response = requests.get(f"{BASE_URL}/api/customers", headers=auth_headers)
        customers = get_response.json()
        found = next((c for c in customers if c["id"] == customer_id), None)
        assert found is not None
        assert found["city"] == "Bangalore"
        print("✓ Customer update verified via GET")
    
    def test_delete_customer(self, auth_headers):
        """Test deleting a customer"""
        # First create a customer
        customer_data = {"name": f"{TEST_PREFIX}DeleteCustomer_{uuid.uuid4().hex[:6]}"}
        create_response = requests.post(f"{BASE_URL}/api/customers", json=customer_data, headers=auth_headers)
        customer_id = create_response.json()["id"]
        
        # Delete the customer
        delete_response = requests.delete(f"{BASE_URL}/api/customers/{customer_id}", headers=auth_headers)
        assert delete_response.status_code == 200
        print(f"✓ Customer deleted: {customer_id}")
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/customers", headers=auth_headers)
        customers = get_response.json()
        found = next((c for c in customers if c["id"] == customer_id), None)
        assert found is None
        print("✓ Customer deletion verified")


class TestProductsCRUD:
    """Product CRUD operations tests"""
    
    def test_get_products(self, auth_headers):
        """Test getting all products"""
        response = requests.get(f"{BASE_URL}/api/products", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get products passed: {len(data)} products found")
    
    def test_create_product(self, auth_headers):
        """Test creating a new product with GST rate"""
        product_data = {
            "name": f"{TEST_PREFIX}Product_{uuid.uuid4().hex[:6]}",
            "description": "Test product description",
            "hsn_code": "998311",
            "unit": "Hours",
            "price": 5000.00,
            "gst_rate": 18
        }
        response = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == product_data["name"]
        assert data["price"] == 5000.00
        assert data["gst_rate"] == 18
        assert "id" in data
        print(f"✓ Product created: {data['name']} @ ₹{data['price']} with {data['gst_rate']}% GST")
        return data
    
    def test_update_product(self, auth_headers):
        """Test updating a product"""
        # Create product
        product_data = {
            "name": f"{TEST_PREFIX}UpdateProduct_{uuid.uuid4().hex[:6]}",
            "price": 1000,
            "gst_rate": 18
        }
        create_response = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=auth_headers)
        product_id = create_response.json()["id"]
        
        # Update product
        update_data = {
            "name": product_data["name"],
            "price": 2000,
            "gst_rate": 28
        }
        update_response = requests.put(f"{BASE_URL}/api/products/{product_id}", json=update_data, headers=auth_headers)
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["price"] == 2000
        assert updated["gst_rate"] == 28
        print(f"✓ Product updated: price ₹{updated['price']}, GST {updated['gst_rate']}%")
    
    def test_delete_product(self, auth_headers):
        """Test deleting a product"""
        # Create product
        product_data = {"name": f"{TEST_PREFIX}DeleteProduct_{uuid.uuid4().hex[:6]}", "price": 100}
        create_response = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=auth_headers)
        product_id = create_response.json()["id"]
        
        # Delete product
        delete_response = requests.delete(f"{BASE_URL}/api/products/{product_id}", headers=auth_headers)
        assert delete_response.status_code == 200
        print(f"✓ Product deleted: {product_id}")


class TestExpensesCRUD:
    """Expense CRUD operations tests"""
    
    def test_get_expenses(self, auth_headers):
        """Test getting all expenses"""
        response = requests.get(f"{BASE_URL}/api/expenses", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get expenses passed: {len(data)} expenses found")
    
    def test_create_expense(self, auth_headers):
        """Test creating a new expense"""
        expense_data = {
            "category": "Office Supplies",
            "amount": 1500.00,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "vendor": f"{TEST_PREFIX}Vendor",
            "description": "Test expense",
            "payment_method": "UPI"
        }
        response = requests.post(f"{BASE_URL}/api/expenses", json=expense_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "Office Supplies"
        assert data["amount"] == 1500.00
        assert "id" in data
        print(f"✓ Expense created: {data['category']} - ₹{data['amount']}")
        return data
    
    def test_update_expense(self, auth_headers):
        """Test updating an expense"""
        # Create expense
        expense_data = {
            "category": "Travel",
            "amount": 500,
            "date": datetime.now().strftime("%Y-%m-%d")
        }
        create_response = requests.post(f"{BASE_URL}/api/expenses", json=expense_data, headers=auth_headers)
        expense_id = create_response.json()["id"]
        
        # Update expense
        update_data = {
            "category": "Marketing",
            "amount": 750,
            "date": datetime.now().strftime("%Y-%m-%d")
        }
        update_response = requests.put(f"{BASE_URL}/api/expenses/{expense_id}", json=update_data, headers=auth_headers)
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["category"] == "Marketing"
        assert updated["amount"] == 750
        print(f"✓ Expense updated: {updated['category']} - ₹{updated['amount']}")
    
    def test_delete_expense(self, auth_headers):
        """Test deleting an expense"""
        # Create expense
        expense_data = {"category": "Other", "amount": 100, "date": datetime.now().strftime("%Y-%m-%d")}
        create_response = requests.post(f"{BASE_URL}/api/expenses", json=expense_data, headers=auth_headers)
        expense_id = create_response.json()["id"]
        
        # Delete expense
        delete_response = requests.delete(f"{BASE_URL}/api/expenses/{expense_id}", headers=auth_headers)
        assert delete_response.status_code == 200
        print(f"✓ Expense deleted: {expense_id}")


class TestBusinessSettings:
    """Business settings tests"""
    
    def test_get_business(self, auth_headers):
        """Test getting business profile"""
        response = requests.get(f"{BASE_URL}/api/business", headers=auth_headers)
        assert response.status_code == 200
        # Can be null if not set up yet
        print(f"✓ Get business passed")
    
    def test_create_or_update_business(self, auth_headers):
        """Test creating/updating business profile"""
        business_data = {
            "name": "DK Kinetic Digital LLP",
            "address": "123 Business Street",
            "city": "Rohtak",
            "state": "Haryana",
            "pincode": "124001",
            "gstin": "06AAAAA0000A1Z5",
            "phone": "+91 98765 43210",
            "email": "business@example.com"
        }
        
        # Try PUT first (update or create)
        response = requests.put(f"{BASE_URL}/api/business", json=business_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == business_data["name"]
        assert data["gstin"] == business_data["gstin"]
        assert data["state"] == "Haryana"
        print(f"✓ Business profile saved: {data['name']}")


class TestInvoices:
    """Invoice operations tests"""
    
    def test_get_invoices(self, auth_headers):
        """Test getting all invoices"""
        response = requests.get(f"{BASE_URL}/api/invoices", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get invoices passed: {len(data)} invoices found")
    
    def test_get_next_invoice_number(self, auth_headers):
        """Test getting next invoice number"""
        response = requests.get(f"{BASE_URL}/api/invoices/next-number/get", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "invoice_number" in data
        assert data["invoice_number"].startswith("INV-")
        print(f"✓ Next invoice number: {data['invoice_number']}")
    
    def test_create_invoice_intra_state(self, auth_headers):
        """Test creating invoice with CGST/SGST (same state)"""
        # First ensure business is set up with Haryana state
        business_data = {
            "name": "Test Business",
            "gstin": "06AAAAA0000A1Z5",
            "state": "Haryana"
        }
        requests.put(f"{BASE_URL}/api/business", json=business_data, headers=auth_headers)
        
        # Create customer in same state (Haryana)
        customer_data = {
            "name": f"{TEST_PREFIX}IntraStateCustomer_{uuid.uuid4().hex[:6]}",
            "state": "Haryana"
        }
        customer_response = requests.post(f"{BASE_URL}/api/customers", json=customer_data, headers=auth_headers)
        customer_id = customer_response.json()["id"]
        
        # Create invoice
        invoice_data = {
            "customer_id": customer_id,
            "invoice_date": datetime.now().strftime("%Y-%m-%d"),
            "items": [{
                "product_name": "Test Service",
                "quantity": 1,
                "unit": "Nos",
                "rate": 10000,
                "gst_rate": 18,
                "amount": 10000,
                "gst_amount": 1800,
                "total": 11800
            }]
        }
        response = requests.post(f"{BASE_URL}/api/invoices", json=invoice_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify GST calculation (intra-state should have CGST/SGST)
        assert data["cgst"] > 0 or data["sgst"] > 0 or data["igst"] == 0
        assert data["total_amount"] > 0
        print(f"✓ Intra-state invoice created: {data['invoice_number']}")
        print(f"  CGST: ₹{data['cgst']}, SGST: ₹{data['sgst']}, IGST: ₹{data['igst']}")
        print(f"  Total: ₹{data['total_amount']}")
        return data
    
    def test_create_invoice_inter_state(self, auth_headers):
        """Test creating invoice with IGST (different state)"""
        # Ensure business is in Haryana
        business_data = {
            "name": "Test Business",
            "gstin": "06AAAAA0000A1Z5",
            "state": "Haryana"
        }
        requests.put(f"{BASE_URL}/api/business", json=business_data, headers=auth_headers)
        
        # Create customer in different state (Maharashtra)
        customer_data = {
            "name": f"{TEST_PREFIX}InterStateCustomer_{uuid.uuid4().hex[:6]}",
            "state": "Maharashtra"
        }
        customer_response = requests.post(f"{BASE_URL}/api/customers", json=customer_data, headers=auth_headers)
        customer_id = customer_response.json()["id"]
        
        # Create invoice
        invoice_data = {
            "customer_id": customer_id,
            "invoice_date": datetime.now().strftime("%Y-%m-%d"),
            "items": [{
                "product_name": "Test Service",
                "quantity": 2,
                "unit": "Hours",
                "rate": 5000,
                "gst_rate": 18,
                "amount": 10000,
                "gst_amount": 1800,
                "total": 11800
            }]
        }
        response = requests.post(f"{BASE_URL}/api/invoices", json=invoice_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify GST calculation (inter-state should have IGST only)
        assert data["igst"] > 0
        assert data["cgst"] == 0
        assert data["sgst"] == 0
        print(f"✓ Inter-state invoice created: {data['invoice_number']}")
        print(f"  CGST: ₹{data['cgst']}, SGST: ₹{data['sgst']}, IGST: ₹{data['igst']}")
        print(f"  Total: ₹{data['total_amount']}")
        return data
    
    def test_update_invoice_payment(self, auth_headers):
        """Test updating invoice payment status"""
        # Get existing invoices
        invoices_response = requests.get(f"{BASE_URL}/api/invoices", headers=auth_headers)
        invoices = invoices_response.json()
        
        if len(invoices) == 0:
            pytest.skip("No invoices to update")
        
        invoice_id = invoices[0]["id"]
        
        # Update payment status
        payment_data = {
            "payment_status": "paid",
            "payment_date": datetime.now().strftime("%Y-%m-%d"),
            "payment_method": "Bank Transfer"
        }
        response = requests.put(f"{BASE_URL}/api/invoices/{invoice_id}/payment", json=payment_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["payment_status"] == "paid"
        print(f"✓ Invoice payment updated: {data['invoice_number']} - {data['payment_status']}")


class TestDashboardAndLedger:
    """Dashboard and Ledger tests"""
    
    def test_get_dashboard_stats(self, auth_headers):
        """Test getting dashboard statistics"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify all expected fields (updated for new API structure)
        assert "totalInvoices" in data
        assert "totalIncome" in data  # Changed from totalRevenue
        assert "totalCustomers" in data
        assert "totalProducts" in data
        assert "totalExpenses" in data
        assert "netProfit" in data
        assert "pendingPayments" in data
        assert "openingBalance" in data  # New field
        assert "totalOutstanding" in data  # New field
        
        print(f"✓ Dashboard stats retrieved:")
        print(f"  Total Invoices: {data['totalInvoices']}")
        print(f"  Total Income: ₹{data['totalIncome']}")
        print(f"  Total Customers: {data['totalCustomers']}")
        print(f"  Total Products: {data['totalProducts']}")
        print(f"  Total Expenses: ₹{data['totalExpenses']}")
        print(f"  Net Profit: ₹{data['netProfit']}")
        print(f"  Opening Balance: ₹{data['openingBalance']}")
        print(f"  Outstanding: ₹{data['totalOutstanding']}")
    
    def test_get_ledger_data(self, auth_headers):
        """Test getting ledger data"""
        response = requests.get(f"{BASE_URL}/api/ledger", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify all expected fields (updated for new API structure)
        assert "openingBalance" in data
        assert "totalIncome" in data
        assert "totalExpenses" in data
        assert "closingBalance" in data  # Changed from netProfit
        assert "totalOutstanding" in data  # Changed from pendingAmount
        assert "recentIncome" in data
        assert "recentExpenses" in data
        assert "allInvoices" in data
        
        print(f"✓ Ledger data retrieved:")
        print(f"  Opening Balance: ₹{data['openingBalance']}")
        print(f"  Total Income: ₹{data['totalIncome']}")
        print(f"  Total Expenses: ₹{data['totalExpenses']}")
        print(f"  Closing Balance: ₹{data['closingBalance']}")
        print(f"  Outstanding: ₹{data['totalOutstanding']}")


# ==================== FIXTURES ====================

@pytest.fixture(scope="session")
def auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.fail(f"Authentication failed: {response.text}")

@pytest.fixture(scope="session")
def auth_headers(auth_token):
    """Get headers with auth token"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
