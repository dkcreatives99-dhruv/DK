"""
Test Suite for GST Invoice Management System - Enhanced Financial Features
Tests: Dual-type income, bank-linked expenses, mandatory opening balance, bank-wise ledger, bank transfers
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "dhruvk99999@gmail.com"
TEST_PASSWORD = "Dhruv@1503"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Authentication failed - skipping tests")


@pytest.fixture(scope="module")
def api_client(auth_token):
    """Authenticated requests session"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    })
    return session


class TestHealthAndAuth:
    """Basic health and authentication tests"""
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
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
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✓ Login successful for {TEST_EMAIL}")
    
    def test_login_invalid_credentials(self):
        """Test login rejection with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials rejected correctly")


class TestBankAccountsWithOpeningBalance:
    """Test bank accounts CRUD with mandatory opening balance"""
    
    def test_get_bank_accounts(self, api_client):
        """Test listing bank accounts"""
        response = api_client.get(f"{BASE_URL}/api/bank-accounts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} bank accounts")
    
    def test_create_bank_account_with_opening_balance(self, api_client):
        """Test creating bank account with mandatory opening balance"""
        today = datetime.now().strftime("%Y-%m-%d")
        response = api_client.post(f"{BASE_URL}/api/bank-accounts", json={
            "bank_name": "TEST_HDFC Bank",
            "account_number": "TEST123456789",
            "ifsc_code": "HDFC0001234",
            "branch_name": "Test Branch",
            "account_type": "Current",
            "is_primary": False,
            "opening_balance": 50000.00,
            "opening_balance_date": today
        })
        assert response.status_code == 200
        data = response.json()
        assert data["bank_name"] == "TEST_HDFC Bank"
        assert data["opening_balance"] == 50000.00
        assert data["opening_balance_locked"] == True
        assert data["current_balance"] == 50000.00  # Initially equals opening balance
        print(f"✓ Created bank account with opening balance: ₹{data['opening_balance']}")
        return data["id"]
    
    def test_create_bank_account_without_opening_balance_fails(self, api_client):
        """Test that creating bank account without opening balance fails"""
        response = api_client.post(f"{BASE_URL}/api/bank-accounts", json={
            "bank_name": "TEST_Fail Bank",
            "account_number": "FAIL123456",
            "ifsc_code": "FAIL0001234",
            "account_type": "Savings"
            # Missing opening_balance and opening_balance_date
        })
        # Should fail with 422 (validation error) since opening_balance is required
        assert response.status_code == 422
        print("✓ Bank account creation without opening balance correctly rejected")
    
    def test_update_bank_account_cannot_change_opening_balance(self, api_client):
        """Test that opening balance cannot be changed via regular update"""
        # First get existing accounts
        response = api_client.get(f"{BASE_URL}/api/bank-accounts")
        accounts = response.json()
        test_accounts = [a for a in accounts if a["bank_name"].startswith("TEST_")]
        
        if test_accounts:
            account = test_accounts[0]
            original_opening = account["opening_balance"]
            
            # Try to update - opening_balance should not be in update model
            response = api_client.put(f"{BASE_URL}/api/bank-accounts/{account['id']}", json={
                "bank_name": account["bank_name"],
                "account_number": account["account_number"],
                "ifsc_code": account["ifsc_code"],
                "branch_name": "Updated Branch",
                "account_type": account["account_type"],
                "is_primary": account["is_primary"]
            })
            assert response.status_code == 200
            
            # Verify opening balance unchanged
            updated = response.json()
            assert updated["opening_balance"] == original_opening
            print(f"✓ Opening balance remains locked at ₹{original_opening}")
        else:
            pytest.skip("No test bank accounts found")


class TestDualTypeIncome:
    """Test income with dual types: invoice-linked and personal"""
    
    def test_get_income_entries(self, api_client):
        """Test listing all income entries"""
        response = api_client.get(f"{BASE_URL}/api/income")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} income entries")
    
    def test_get_income_filtered_by_type(self, api_client):
        """Test filtering income by type"""
        # Get invoice-linked income
        response = api_client.get(f"{BASE_URL}/api/income?income_type=invoice")
        assert response.status_code == 200
        invoice_income = response.json()
        
        # Get personal income
        response = api_client.get(f"{BASE_URL}/api/income?income_type=personal")
        assert response.status_code == 200
        personal_income = response.json()
        
        print(f"✓ Invoice income: {len(invoice_income)}, Personal income: {len(personal_income)}")
    
    def test_create_personal_income(self, api_client):
        """Test creating personal income entry"""
        # First get a bank account
        response = api_client.get(f"{BASE_URL}/api/bank-accounts")
        accounts = response.json()
        if not accounts:
            pytest.skip("No bank accounts available")
        
        bank_id = accounts[0]["id"]
        today = datetime.now().strftime("%Y-%m-%d")
        
        response = api_client.post(f"{BASE_URL}/api/income", json={
            "income_type": "personal",
            "income_source": "Family Support",
            "amount": 10000.00,
            "payment_date": today,
            "payment_mode": "Bank Transfer",
            "bank_account_id": bank_id,
            "reference_number": "TEST_PERSONAL_001",
            "remarks": "Test personal income"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["income_type"] == "personal"
        assert data["income_source"] == "Family Support"
        assert data["amount"] == 10000.00
        assert data["bank_account_id"] == bank_id
        print(f"✓ Created personal income: ₹{data['amount']} from {data['income_source']}")
        return data["id"]
    
    def test_create_personal_income_without_source_fails(self, api_client):
        """Test that personal income without source fails"""
        response = api_client.get(f"{BASE_URL}/api/bank-accounts")
        accounts = response.json()
        if not accounts:
            pytest.skip("No bank accounts available")
        
        bank_id = accounts[0]["id"]
        today = datetime.now().strftime("%Y-%m-%d")
        
        response = api_client.post(f"{BASE_URL}/api/income", json={
            "income_type": "personal",
            # Missing income_source
            "amount": 5000.00,
            "payment_date": today,
            "payment_mode": "Cash",
            "bank_account_id": bank_id
        })
        assert response.status_code == 400
        assert "income source" in response.json()["detail"].lower()
        print("✓ Personal income without source correctly rejected")
    
    def test_create_income_without_bank_account_fails(self, api_client):
        """Test that income without bank account fails"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        response = api_client.post(f"{BASE_URL}/api/income", json={
            "income_type": "personal",
            "income_source": "Other",
            "amount": 5000.00,
            "payment_date": today,
            "payment_mode": "Cash",
            "bank_account_id": ""  # Empty bank account
        })
        assert response.status_code == 400
        assert "bank account" in response.json()["detail"].lower()
        print("✓ Income without bank account correctly rejected")


class TestExpensesWithMandatoryBank:
    """Test expenses with mandatory bank account selection"""
    
    def test_get_expenses(self, api_client):
        """Test listing expenses"""
        response = api_client.get(f"{BASE_URL}/api/expenses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} expenses")
    
    def test_create_expense_with_bank_account(self, api_client):
        """Test creating expense with mandatory bank account"""
        response = api_client.get(f"{BASE_URL}/api/bank-accounts")
        accounts = response.json()
        if not accounts:
            pytest.skip("No bank accounts available")
        
        bank_id = accounts[0]["id"]
        today = datetime.now().strftime("%Y-%m-%d")
        
        response = api_client.post(f"{BASE_URL}/api/expenses", json={
            "category": "Office Supplies",
            "amount": 2500.00,
            "date": today,
            "vendor": "TEST_Vendor",
            "description": "Test expense",
            "payment_mode": "UPI",
            "bank_account_id": bank_id,
            "reference_number": "TEST_EXP_001"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "Office Supplies"
        assert data["amount"] == 2500.00
        assert data["bank_account_id"] == bank_id
        assert data["bank_name"] is not None
        print(f"✓ Created expense: ₹{data['amount']} from {data['bank_name']}")
        return data["id"]
    
    def test_create_expense_without_bank_account_fails(self, api_client):
        """Test that expense without bank account fails"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        response = api_client.post(f"{BASE_URL}/api/expenses", json={
            "category": "Travel",
            "amount": 1000.00,
            "date": today,
            "payment_mode": "Cash",
            "bank_account_id": ""  # Empty bank account
        })
        assert response.status_code == 400
        assert "bank account" in response.json()["detail"].lower()
        print("✓ Expense without bank account correctly rejected")


class TestBankTransfers:
    """Test bank transfers between accounts"""
    
    def test_get_bank_transfers(self, api_client):
        """Test listing bank transfers"""
        response = api_client.get(f"{BASE_URL}/api/bank-transfers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} bank transfers")
    
    def test_create_bank_transfer(self, api_client):
        """Test creating bank transfer between accounts"""
        response = api_client.get(f"{BASE_URL}/api/bank-accounts")
        accounts = response.json()
        
        if len(accounts) < 2:
            pytest.skip("Need at least 2 bank accounts for transfer test")
        
        from_bank = accounts[0]
        to_bank = accounts[1]
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Check if source has sufficient balance
        if from_bank["current_balance"] < 1000:
            pytest.skip(f"Insufficient balance in source account: ₹{from_bank['current_balance']}")
        
        response = api_client.post(f"{BASE_URL}/api/bank-transfers", json={
            "from_bank_id": from_bank["id"],
            "to_bank_id": to_bank["id"],
            "amount": 1000.00,
            "transfer_date": today,
            "reference_number": "TEST_TRF_001",
            "remarks": "Test transfer"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["from_bank_id"] == from_bank["id"]
        assert data["to_bank_id"] == to_bank["id"]
        assert data["amount"] == 1000.00
        print(f"✓ Created transfer: ₹{data['amount']} from {data['from_bank_name']} to {data['to_bank_name']}")
        return data["id"]
    
    def test_transfer_to_same_account_fails(self, api_client):
        """Test that transfer to same account fails"""
        response = api_client.get(f"{BASE_URL}/api/bank-accounts")
        accounts = response.json()
        
        if not accounts:
            pytest.skip("No bank accounts available")
        
        bank = accounts[0]
        today = datetime.now().strftime("%Y-%m-%d")
        
        response = api_client.post(f"{BASE_URL}/api/bank-transfers", json={
            "from_bank_id": bank["id"],
            "to_bank_id": bank["id"],  # Same account
            "amount": 500.00,
            "transfer_date": today
        })
        assert response.status_code == 400
        assert "same account" in response.json()["detail"].lower()
        print("✓ Transfer to same account correctly rejected")


class TestLedgerViews:
    """Test consolidated and bank-wise ledger views"""
    
    def test_get_consolidated_ledger(self, api_client):
        """Test consolidated ledger data"""
        response = api_client.get(f"{BASE_URL}/api/ledger")
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "openingBalance" in data
        assert "totalIncome" in data
        assert "businessIncome" in data
        assert "personalIncome" in data
        assert "totalExpenses" in data
        assert "closingBalance" in data
        
        # Verify calculation: closing = opening + income - expenses
        expected_closing = data["openingBalance"] + data["totalIncome"] - data["totalExpenses"]
        assert abs(data["closingBalance"] - expected_closing) < 0.01
        
        print(f"✓ Consolidated Ledger:")
        print(f"  Opening: ₹{data['openingBalance']}")
        print(f"  Business Income: ₹{data['businessIncome']}")
        print(f"  Personal Income: ₹{data['personalIncome']}")
        print(f"  Total Income: ₹{data['totalIncome']}")
        print(f"  Expenses: ₹{data['totalExpenses']}")
        print(f"  Closing: ₹{data['closingBalance']}")
    
    def test_get_bank_wise_ledger(self, api_client):
        """Test bank-wise ledger with running balance"""
        response = api_client.get(f"{BASE_URL}/api/bank-accounts")
        accounts = response.json()
        
        if not accounts:
            pytest.skip("No bank accounts available")
        
        bank = accounts[0]
        response = api_client.get(f"{BASE_URL}/api/ledger/bank/{bank['id']}")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "bankAccount" in data
        assert "openingBalance" in data
        assert "totalCredit" in data
        assert "totalDebit" in data
        assert "currentBalance" in data
        assert "transactions" in data
        
        # Verify calculation
        expected_balance = data["openingBalance"] + data["totalCredit"] - data["totalDebit"]
        assert abs(data["currentBalance"] - expected_balance) < 0.01
        
        # Verify running balance in transactions
        if data["transactions"]:
            last_transaction = data["transactions"][-1]
            assert "balance" in last_transaction
        
        print(f"✓ Bank Ledger for {data['bankAccount']['bank_name']}:")
        print(f"  Opening: ₹{data['openingBalance']}")
        print(f"  Credits: ₹{data['totalCredit']}")
        print(f"  Debits: ₹{data['totalDebit']}")
        print(f"  Current: ₹{data['currentBalance']}")
        print(f"  Transactions: {len(data['transactions'])}")


class TestDashboardStats:
    """Test dashboard statistics with income breakdown"""
    
    def test_dashboard_stats(self, api_client):
        """Test dashboard stats include income breakdown"""
        response = api_client.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "totalIncome" in data
        assert "businessIncome" in data
        assert "personalIncome" in data
        assert "totalExpenses" in data
        assert "openingBalance" in data
        assert "currentBalance" in data
        assert "netProfit" in data
        
        # Verify income breakdown adds up
        assert abs(data["totalIncome"] - (data["businessIncome"] + data["personalIncome"])) < 0.01
        
        print(f"✓ Dashboard Stats:")
        print(f"  Opening Balance: ₹{data['openingBalance']}")
        print(f"  Business Income: ₹{data['businessIncome']}")
        print(f"  Personal Income: ₹{data['personalIncome']}")
        print(f"  Total Income: ₹{data['totalIncome']}")
        print(f"  Total Expenses: ₹{data['totalExpenses']}")
        print(f"  Current Balance: ₹{data['currentBalance']}")
        print(f"  Net Profit: ₹{data['netProfit']}")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_data(self, api_client):
        """Clean up TEST_ prefixed data"""
        # Clean up test income
        response = api_client.get(f"{BASE_URL}/api/income")
        if response.status_code == 200:
            for entry in response.json():
                ref = entry.get("reference_number") or ""
                if ref.startswith("TEST_"):
                    api_client.delete(f"{BASE_URL}/api/income/{entry['id']}")
        
        # Clean up test expenses
        response = api_client.get(f"{BASE_URL}/api/expenses")
        if response.status_code == 200:
            for exp in response.json():
                vendor = exp.get("vendor") or ""
                ref = exp.get("reference_number") or ""
                if vendor.startswith("TEST_") or ref.startswith("TEST_"):
                    api_client.delete(f"{BASE_URL}/api/expenses/{exp['id']}")
        
        # Clean up test transfers
        response = api_client.get(f"{BASE_URL}/api/bank-transfers")
        if response.status_code == 200:
            for transfer in response.json():
                ref = transfer.get("reference_number") or ""
                if ref.startswith("TEST_"):
                    api_client.delete(f"{BASE_URL}/api/bank-transfers/{transfer['id']}")
        
        # Clean up test bank accounts (only those without transactions)
        response = api_client.get(f"{BASE_URL}/api/bank-accounts")
        if response.status_code == 200:
            for account in response.json():
                bank_name = account.get("bank_name") or ""
                if bank_name.startswith("TEST_"):
                    try:
                        api_client.delete(f"{BASE_URL}/api/bank-accounts/{account['id']}")
                    except:
                        pass  # May fail if account has transactions
        
        print("✓ Test data cleanup completed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
