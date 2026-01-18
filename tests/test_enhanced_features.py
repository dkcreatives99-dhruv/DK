"""
Enhanced Invoice Management System - New Features API Tests
Tests: Bank Accounts, Ledger Settings, Income Module, Soft Delete, Item Discounts
"""
import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "dhruvk99999@gmail.com"
TEST_PASSWORD = "Dhruv@1503"

# Test data prefix for cleanup
TEST_PREFIX = "TEST_"


class TestBankAccounts:
    """Bank Account CRUD operations tests"""
    
    def test_get_bank_accounts(self, auth_headers):
        """Test getting all bank accounts"""
        response = requests.get(f"{BASE_URL}/api/bank-accounts", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get bank accounts passed: {len(data)} accounts found")
    
    def test_create_bank_account(self, auth_headers):
        """Test creating a new bank account"""
        bank_data = {
            "bank_name": f"{TEST_PREFIX}HDFC Bank",
            "account_number": f"TEST{uuid.uuid4().hex[:8].upper()}",
            "ifsc_code": "HDFC0001234",
            "branch_name": "Test Branch",
            "account_type": "Current",
            "is_primary": False
        }
        response = requests.post(f"{BASE_URL}/api/bank-accounts", json=bank_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["bank_name"] == bank_data["bank_name"]
        assert data["account_number"] == bank_data["account_number"]
        assert data["ifsc_code"] == bank_data["ifsc_code"]
        assert "id" in data
        assert "opening_balance" in data
        assert "current_balance" in data
        print(f"✓ Bank account created: {data['bank_name']} - {data['account_number']}")
        return data
    
    def test_create_primary_bank_account(self, auth_headers):
        """Test creating a primary bank account"""
        bank_data = {
            "bank_name": f"{TEST_PREFIX}Primary Bank",
            "account_number": f"PRIM{uuid.uuid4().hex[:8].upper()}",
            "ifsc_code": "ICIC0001234",
            "branch_name": "Main Branch",
            "account_type": "Current",
            "is_primary": True
        }
        response = requests.post(f"{BASE_URL}/api/bank-accounts", json=bank_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["is_primary"] == True
        print(f"✓ Primary bank account created: {data['bank_name']}")
        return data
    
    def test_update_bank_account(self, auth_headers):
        """Test updating a bank account"""
        # Create bank account first
        bank_data = {
            "bank_name": f"{TEST_PREFIX}Update Bank",
            "account_number": f"UPD{uuid.uuid4().hex[:8].upper()}",
            "ifsc_code": "SBIN0001234",
            "account_type": "Savings"
        }
        create_response = requests.post(f"{BASE_URL}/api/bank-accounts", json=bank_data, headers=auth_headers)
        account_id = create_response.json()["id"]
        
        # Update bank account
        update_data = {
            "bank_name": f"{TEST_PREFIX}Updated Bank",
            "account_number": bank_data["account_number"],
            "ifsc_code": "SBIN0005678",
            "branch_name": "Updated Branch",
            "account_type": "Current",
            "is_primary": False
        }
        update_response = requests.put(f"{BASE_URL}/api/bank-accounts/{account_id}", json=update_data, headers=auth_headers)
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["ifsc_code"] == "SBIN0005678"
        assert updated["branch_name"] == "Updated Branch"
        print(f"✓ Bank account updated: {updated['bank_name']}")
    
    def test_delete_bank_account_without_transactions(self, auth_headers):
        """Test deleting a bank account without transactions"""
        # Create bank account
        bank_data = {
            "bank_name": f"{TEST_PREFIX}Delete Bank",
            "account_number": f"DEL{uuid.uuid4().hex[:8].upper()}",
            "ifsc_code": "AXIS0001234",
            "account_type": "Current"
        }
        create_response = requests.post(f"{BASE_URL}/api/bank-accounts", json=bank_data, headers=auth_headers)
        account_id = create_response.json()["id"]
        
        # Delete bank account
        delete_response = requests.delete(f"{BASE_URL}/api/bank-accounts/{account_id}", headers=auth_headers)
        assert delete_response.status_code == 200
        print(f"✓ Bank account deleted: {account_id}")


class TestLedgerSettings:
    """Ledger Settings tests"""
    
    def test_get_ledger_settings(self, auth_headers):
        """Test getting ledger settings"""
        response = requests.get(f"{BASE_URL}/api/ledger-settings", headers=auth_headers)
        assert response.status_code == 200
        # Can be null if not set up yet
        print(f"✓ Get ledger settings passed")
    
    def test_create_or_update_ledger_settings(self, auth_headers):
        """Test creating/updating ledger settings with opening balance"""
        settings_data = {
            "opening_balance": 50000.00,
            "opening_balance_date": datetime.now().strftime("%Y-%m-%d")
        }
        
        # Try POST first
        response = requests.post(f"{BASE_URL}/api/ledger-settings", json=settings_data, headers=auth_headers)
        if response.status_code == 400:  # Already exists, try PUT
            response = requests.put(f"{BASE_URL}/api/ledger-settings", json=settings_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["opening_balance"] == 50000.00
        print(f"✓ Ledger settings saved: Opening Balance = ₹{data['opening_balance']}")
        return data
    
    def test_opening_balance_reflects_in_ledger(self, auth_headers):
        """Test that opening balance reflects in ledger calculation"""
        # First set opening balance
        settings_data = {
            "opening_balance": 25000.00,
            "opening_balance_date": datetime.now().strftime("%Y-%m-%d")
        }
        requests.post(f"{BASE_URL}/api/ledger-settings", json=settings_data, headers=auth_headers)
        
        # Get ledger data
        ledger_response = requests.get(f"{BASE_URL}/api/ledger", headers=auth_headers)
        assert ledger_response.status_code == 200
        ledger = ledger_response.json()
        
        assert "openingBalance" in ledger
        assert "closingBalance" in ledger
        print(f"✓ Ledger shows Opening Balance: ₹{ledger['openingBalance']}")
        print(f"  Closing Balance: ₹{ledger['closingBalance']}")


class TestIncomeModule:
    """Income Module tests - tracking actual payments"""
    
    def test_get_income(self, auth_headers):
        """Test getting all income entries"""
        response = requests.get(f"{BASE_URL}/api/income", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get income passed: {len(data)} entries found")
    
    def test_create_income_for_invoice(self, auth_headers, test_invoice_id):
        """Test recording a payment against an invoice"""
        income_data = {
            "invoice_id": test_invoice_id,
            "amount": 5000.00,
            "payment_date": datetime.now().strftime("%Y-%m-%d"),
            "payment_mode": "Bank",
            "reference_number": f"REF{uuid.uuid4().hex[:6].upper()}",
            "remarks": "Test payment"
        }
        response = requests.post(f"{BASE_URL}/api/income", json=income_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 5000.00
        assert data["payment_mode"] == "Bank"
        assert "invoice_number" in data
        print(f"✓ Income recorded: ₹{data['amount']} for invoice {data.get('invoice_number')}")
        return data
    
    def test_partial_payment_updates_invoice_status(self, auth_headers, test_invoice_id):
        """Test that partial payment updates invoice payment status"""
        # Record a partial payment
        income_data = {
            "invoice_id": test_invoice_id,
            "amount": 1000.00,
            "payment_date": datetime.now().strftime("%Y-%m-%d"),
            "payment_mode": "UPI",
            "remarks": "Partial payment test"
        }
        response = requests.post(f"{BASE_URL}/api/income", json=income_data, headers=auth_headers)
        assert response.status_code == 200
        
        # Check invoice payment status
        invoice_response = requests.get(f"{BASE_URL}/api/invoices/{test_invoice_id}", headers=auth_headers)
        assert invoice_response.status_code == 200
        invoice = invoice_response.json()
        
        assert invoice["amount_paid"] > 0
        assert invoice["payment_status"] in ["partial", "paid"]
        print(f"✓ Invoice payment status updated: {invoice['payment_status']}")
        print(f"  Amount Paid: ₹{invoice['amount_paid']}, Balance Due: ₹{invoice['balance_due']}")
    
    def test_update_income(self, auth_headers, test_invoice_id):
        """Test updating an income entry"""
        # Create income first
        income_data = {
            "invoice_id": test_invoice_id,
            "amount": 2000.00,
            "payment_date": datetime.now().strftime("%Y-%m-%d"),
            "payment_mode": "Cash"
        }
        create_response = requests.post(f"{BASE_URL}/api/income", json=income_data, headers=auth_headers)
        if create_response.status_code != 200:
            pytest.skip(f"Could not create income: {create_response.text}")
        income_id = create_response.json()["id"]
        
        # Update income
        update_data = {
            "invoice_id": test_invoice_id,
            "amount": 2500.00,
            "payment_date": datetime.now().strftime("%Y-%m-%d"),
            "payment_mode": "Cheque",
            "reference_number": "CHQ123456"
        }
        update_response = requests.put(f"{BASE_URL}/api/income/{income_id}", json=update_data, headers=auth_headers)
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["amount"] == 2500.00
        assert updated["payment_mode"] == "Cheque"
        print(f"✓ Income updated: ₹{updated['amount']} via {updated['payment_mode']}")
    
    def test_delete_income(self, auth_headers, test_invoice_id):
        """Test deleting an income entry"""
        # Create income first
        income_data = {
            "invoice_id": test_invoice_id,
            "amount": 500.00,
            "payment_date": datetime.now().strftime("%Y-%m-%d"),
            "payment_mode": "Cash"
        }
        create_response = requests.post(f"{BASE_URL}/api/income", json=income_data, headers=auth_headers)
        if create_response.status_code != 200:
            pytest.skip(f"Could not create income: {create_response.text}")
        income_id = create_response.json()["id"]
        
        # Delete income
        delete_response = requests.delete(f"{BASE_URL}/api/income/{income_id}", headers=auth_headers)
        assert delete_response.status_code == 200
        print(f"✓ Income deleted: {income_id}")


class TestInvoiceSoftDelete:
    """Invoice Soft Delete and Restore tests"""
    
    def test_soft_delete_invoice(self, auth_headers, test_invoice_for_delete):
        """Test soft deleting an invoice"""
        invoice_id = test_invoice_for_delete
        
        # Delete invoice (soft delete)
        delete_response = requests.delete(f"{BASE_URL}/api/invoices/{invoice_id}", headers=auth_headers)
        assert delete_response.status_code == 200
        print(f"✓ Invoice soft deleted: {invoice_id}")
        
        # Verify invoice is not in normal list
        invoices_response = requests.get(f"{BASE_URL}/api/invoices", headers=auth_headers)
        invoices = invoices_response.json()
        found = next((inv for inv in invoices if inv["id"] == invoice_id), None)
        assert found is None, "Deleted invoice should not appear in normal list"
        print("✓ Deleted invoice not in normal list")
        
        # Verify invoice appears with include_deleted=true
        invoices_with_deleted = requests.get(f"{BASE_URL}/api/invoices?include_deleted=true", headers=auth_headers)
        all_invoices = invoices_with_deleted.json()
        found_deleted = next((inv for inv in all_invoices if inv["id"] == invoice_id), None)
        assert found_deleted is not None, "Deleted invoice should appear with include_deleted=true"
        assert found_deleted["is_deleted"] == True
        print("✓ Deleted invoice visible with include_deleted=true")
    
    def test_restore_deleted_invoice(self, auth_headers, test_invoice_for_restore):
        """Test restoring a soft-deleted invoice"""
        invoice_id = test_invoice_for_restore
        
        # First delete the invoice
        requests.delete(f"{BASE_URL}/api/invoices/{invoice_id}", headers=auth_headers)
        
        # Restore the invoice
        restore_response = requests.put(f"{BASE_URL}/api/invoices/{invoice_id}/restore", headers=auth_headers)
        assert restore_response.status_code == 200
        print(f"✓ Invoice restored: {invoice_id}")
        
        # Verify invoice is back in normal list
        invoices_response = requests.get(f"{BASE_URL}/api/invoices", headers=auth_headers)
        invoices = invoices_response.json()
        found = next((inv for inv in invoices if inv["id"] == invoice_id), None)
        assert found is not None, "Restored invoice should appear in normal list"
        assert found["is_deleted"] == False
        print("✓ Restored invoice visible in normal list")


class TestItemLevelDiscounts:
    """Item-level and Invoice-level discount tests"""
    
    def test_create_invoice_with_item_discount_percentage(self, auth_headers, test_customer_id):
        """Test creating invoice with item-level percentage discount"""
        invoice_data = {
            "customer_id": test_customer_id,
            "invoice_date": datetime.now().strftime("%Y-%m-%d"),
            "items": [{
                "product_name": "Test Service with Discount",
                "quantity": 1,
                "unit": "Nos",
                "rate": 10000,
                "gst_rate": 18,
                "discount_type": "percentage",
                "discount_value": 10,  # 10% discount
                "discount_amount": 1000,  # 10% of 10000
                "amount": 9000,  # 10000 - 1000
                "gst_amount": 1620,  # 18% of 9000
                "total": 10620
            }]
        }
        response = requests.post(f"{BASE_URL}/api/invoices", json=invoice_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["item_discount_total"] == 1000
        assert data["subtotal_after_item_discount"] == 9000
        print(f"✓ Invoice with item discount created: {data['invoice_number']}")
        print(f"  Subtotal: ₹{data['subtotal']}, Item Discount: ₹{data['item_discount_total']}")
        print(f"  Taxable: ₹{data['taxable_amount']}, Total: ₹{data['total_amount']}")
        return data
    
    def test_create_invoice_with_item_discount_amount(self, auth_headers, test_customer_id):
        """Test creating invoice with item-level fixed amount discount"""
        invoice_data = {
            "customer_id": test_customer_id,
            "invoice_date": datetime.now().strftime("%Y-%m-%d"),
            "items": [{
                "product_name": "Test Service with Fixed Discount",
                "quantity": 2,
                "unit": "Hours",
                "rate": 5000,
                "gst_rate": 18,
                "discount_type": "amount",
                "discount_value": 500,  # ₹500 flat discount
                "discount_amount": 500,
                "amount": 9500,  # (2*5000) - 500
                "gst_amount": 1710,  # 18% of 9500
                "total": 11210
            }]
        }
        response = requests.post(f"{BASE_URL}/api/invoices", json=invoice_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["item_discount_total"] == 500
        print(f"✓ Invoice with fixed discount created: {data['invoice_number']}")
        return data
    
    def test_create_invoice_with_invoice_level_discount(self, auth_headers, test_customer_id):
        """Test creating invoice with invoice-level discount"""
        invoice_data = {
            "customer_id": test_customer_id,
            "invoice_date": datetime.now().strftime("%Y-%m-%d"),
            "discount_type": "percentage",
            "discount_value": 5,  # 5% invoice discount
            "items": [{
                "product_name": "Test Service",
                "quantity": 1,
                "unit": "Nos",
                "rate": 20000,
                "gst_rate": 18,
                "amount": 20000,
                "gst_amount": 3600,
                "total": 23600
            }]
        }
        response = requests.post(f"{BASE_URL}/api/invoices", json=invoice_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["discount_amount"] == 1000  # 5% of 20000
        assert data["taxable_amount"] == 19000  # 20000 - 1000
        print(f"✓ Invoice with invoice-level discount created: {data['invoice_number']}")
        print(f"  Invoice Discount: ₹{data['discount_amount']}")
        return data


class TestDashboardNewStats:
    """Dashboard new statistics tests"""
    
    def test_dashboard_has_new_stats(self, auth_headers):
        """Test dashboard includes new stats fields"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check for new fields
        assert "openingBalance" in data, "Missing openingBalance"
        assert "totalIncome" in data, "Missing totalIncome"
        assert "totalOutstanding" in data, "Missing totalOutstanding"
        
        print(f"✓ Dashboard stats include new fields:")
        print(f"  Opening Balance: ₹{data.get('openingBalance', 0)}")
        print(f"  Total Income: ₹{data.get('totalIncome', 0)}")
        print(f"  Total Expenses: ₹{data.get('totalExpenses', 0)}")
        print(f"  Net Profit: ₹{data.get('netProfit', 0)}")
        print(f"  Outstanding: ₹{data.get('totalOutstanding', 0)}")


class TestLedgerCalculation:
    """Ledger calculation tests"""
    
    def test_ledger_calculation(self, auth_headers):
        """Test ledger calculation: Opening + Income - Expenses = Closing"""
        response = requests.get(f"{BASE_URL}/api/ledger", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        opening = data.get("openingBalance", 0)
        income = data.get("totalIncome", 0)
        expenses = data.get("totalExpenses", 0)
        closing = data.get("closingBalance", 0)
        
        # Verify calculation
        expected_closing = opening + income - expenses
        assert abs(closing - expected_closing) < 0.01, f"Closing balance mismatch: {closing} != {expected_closing}"
        
        print(f"✓ Ledger calculation verified:")
        print(f"  Opening: ₹{opening} + Income: ₹{income} - Expenses: ₹{expenses} = Closing: ₹{closing}")


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

@pytest.fixture(scope="function")
def test_customer_id(auth_headers):
    """Create a test customer and return its ID"""
    customer_data = {
        "name": f"{TEST_PREFIX}DiscountCustomer_{uuid.uuid4().hex[:6]}",
        "state": "Haryana"
    }
    response = requests.post(f"{BASE_URL}/api/customers", json=customer_data, headers=auth_headers)
    if response.status_code == 200:
        return response.json()["id"]
    pytest.skip("Could not create test customer")

@pytest.fixture(scope="function")
def test_invoice_id(auth_headers, test_customer_id):
    """Create a test invoice and return its ID"""
    invoice_data = {
        "customer_id": test_customer_id,
        "invoice_date": datetime.now().strftime("%Y-%m-%d"),
        "items": [{
            "product_name": "Test Service for Income",
            "quantity": 1,
            "unit": "Nos",
            "rate": 50000,
            "gst_rate": 18,
            "amount": 50000,
            "gst_amount": 9000,
            "total": 59000
        }]
    }
    response = requests.post(f"{BASE_URL}/api/invoices", json=invoice_data, headers=auth_headers)
    if response.status_code == 200:
        return response.json()["id"]
    pytest.skip(f"Could not create test invoice: {response.text}")

@pytest.fixture(scope="function")
def test_invoice_for_delete(auth_headers, test_customer_id):
    """Create a test invoice for delete testing"""
    invoice_data = {
        "customer_id": test_customer_id,
        "invoice_date": datetime.now().strftime("%Y-%m-%d"),
        "items": [{
            "product_name": "Test Service for Delete",
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
    if response.status_code == 200:
        return response.json()["id"]
    pytest.skip(f"Could not create test invoice: {response.text}")

@pytest.fixture(scope="function")
def test_invoice_for_restore(auth_headers, test_customer_id):
    """Create a test invoice for restore testing"""
    invoice_data = {
        "customer_id": test_customer_id,
        "invoice_date": datetime.now().strftime("%Y-%m-%d"),
        "items": [{
            "product_name": "Test Service for Restore",
            "quantity": 1,
            "unit": "Nos",
            "rate": 15000,
            "gst_rate": 18,
            "amount": 15000,
            "gst_amount": 2700,
            "total": 17700
        }]
    }
    response = requests.post(f"{BASE_URL}/api/invoices", json=invoice_data, headers=auth_headers)
    if response.status_code == 200:
        return response.json()["id"]
    pytest.skip(f"Could not create test invoice: {response.text}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
