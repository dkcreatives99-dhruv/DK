#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class DKKineticAPITester:
    def __init__(self, base_url="https://modern-kinetic.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: Dict[str, Any]):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": name,
            "success": success,
            "timestamp": datetime.now().isoformat(),
            **details
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if not success and "error" in details:
            print(f"   Error: {details['error']}")
        if "response_data" in details:
            print(f"   Response: {details['response_data']}")

    def test_health_endpoint(self):
        """Test /api/health endpoint"""
        try:
            response = requests.get(f"{self.api_url}/health", timeout=10)
            success = response.status_code == 200
            
            response_data = {}
            if success:
                try:
                    response_data = response.json()
                except:
                    response_data = {"raw_response": response.text}
            
            self.log_test(
                "Health Check Endpoint",
                success,
                {
                    "status_code": response.status_code,
                    "response_data": response_data,
                    "error": None if success else f"Expected 200, got {response.status_code}"
                }
            )
            return success
            
        except Exception as e:
            self.log_test(
                "Health Check Endpoint",
                False,
                {
                    "status_code": None,
                    "response_data": {},
                    "error": str(e)
                }
            )
            return False

    def test_root_endpoint(self):
        """Test /api/ root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            
            response_data = {}
            if success:
                try:
                    response_data = response.json()
                except:
                    response_data = {"raw_response": response.text}
            
            self.log_test(
                "API Root Endpoint",
                success,
                {
                    "status_code": response.status_code,
                    "response_data": response_data,
                    "error": None if success else f"Expected 200, got {response.status_code}"
                }
            )
            return success
            
        except Exception as e:
            self.log_test(
                "API Root Endpoint",
                False,
                {
                    "status_code": None,
                    "response_data": {},
                    "error": str(e)
                }
            )
            return False

    def test_contact_submission(self):
        """Test /api/contact POST endpoint"""
        test_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+91 98765 43210",
            "company": "Test Company",
            "service_interest": "Web Development",
            "message": "This is a test message for API testing."
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/contact",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            success = response.status_code == 200
            response_data = {}
            
            if response.status_code in [200, 201]:
                try:
                    response_data = response.json()
                    # Check if response has expected structure
                    if "success" in response_data and "message" in response_data:
                        success = True
                    else:
                        success = False
                except:
                    response_data = {"raw_response": response.text}
                    success = False
            
            self.log_test(
                "Contact Form Submission",
                success,
                {
                    "status_code": response.status_code,
                    "response_data": response_data,
                    "request_data": test_data,
                    "error": None if success else f"Expected 200/201, got {response.status_code}"
                }
            )
            return success, response_data.get("id") if success else None
            
        except Exception as e:
            self.log_test(
                "Contact Form Submission",
                False,
                {
                    "status_code": None,
                    "response_data": {},
                    "request_data": test_data,
                    "error": str(e)
                }
            )
            return False, None

    def test_contact_submission_validation(self):
        """Test contact form validation with invalid data"""
        invalid_data = {
            "name": "",  # Empty name
            "email": "invalid-email",  # Invalid email
            "message": ""  # Empty message
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/contact",
                json=invalid_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            # Should return 422 for validation error or 400 for bad request
            success = response.status_code in [400, 422]
            
            response_data = {}
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
            
            self.log_test(
                "Contact Form Validation",
                success,
                {
                    "status_code": response.status_code,
                    "response_data": response_data,
                    "request_data": invalid_data,
                    "error": None if success else f"Expected 400/422, got {response.status_code}"
                }
            )
            return success
            
        except Exception as e:
            self.log_test(
                "Contact Form Validation",
                False,
                {
                    "status_code": None,
                    "response_data": {},
                    "request_data": invalid_data,
                    "error": str(e)
                }
            )
            return False

    def test_get_contacts(self):
        """Test /api/contacts GET endpoint (if accessible)"""
        try:
            response = requests.get(f"{self.api_url}/contacts", timeout=10)
            
            # This endpoint might be protected or return 200 with data
            success = response.status_code in [200, 401, 403]
            
            response_data = {}
            if response.status_code == 200:
                try:
                    response_data = response.json()
                except:
                    response_data = {"raw_response": response.text}
            
            self.log_test(
                "Get Contacts Endpoint",
                success,
                {
                    "status_code": response.status_code,
                    "response_data": response_data if response.status_code == 200 else {"status": "protected_or_error"},
                    "error": None if success else f"Unexpected status code: {response.status_code}"
                }
            )
            return success
            
        except Exception as e:
            self.log_test(
                "Get Contacts Endpoint",
                False,
                {
                    "status_code": None,
                    "response_data": {},
                    "error": str(e)
                }
            )
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting DK Kinetic Digital API Tests")
        print(f"📍 Testing API at: {self.api_url}")
        print("=" * 50)
        
        # Test basic endpoints
        self.test_health_endpoint()
        self.test_root_endpoint()
        
        # Test contact form functionality
        success, contact_id = self.test_contact_submission()
        self.test_contact_submission_validation()
        
        # Test contacts retrieval
        self.test_get_contacts()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check details above.")
            return 1

    def get_test_results(self):
        """Return detailed test results"""
        return {
            "summary": {
                "total_tests": self.tests_run,
                "passed_tests": self.tests_passed,
                "failed_tests": self.tests_run - self.tests_passed,
                "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
            },
            "detailed_results": self.test_results
        }

def main():
    tester = DKKineticAPITester()
    exit_code = tester.run_all_tests()
    
    # Save detailed results
    results = tester.get_test_results()
    with open("/app/backend_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
    return exit_code

if __name__ == "__main__":
    sys.exit(main())