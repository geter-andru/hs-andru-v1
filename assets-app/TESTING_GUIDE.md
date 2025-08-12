# 📋 COMPREHENSIVE TESTING GUIDE
# H&S Business Platform - Enhanced Workflow Components

## 🚀 LOCAL DEVELOPMENT TESTING

### **Prerequisites Setup**
```bash
# 1. Start development server
cd /Users/geter/hs-andru-v1/assets-app
npm start

# 2. Open browser console for debugging
# Navigate to: http://localhost:3000/customer/CUST_2?token=test-token-123456

# 3. Enable React DevTools
# Install: https://chrome.google.com/webstore/detail/react-developer-tools/
```

### **Component Rendering Tests**

#### **Test 1: CustomerDashboard Initialization**
```javascript
// Console commands to verify state
console.log('=== CustomerDashboard State Test ===');
// Check if workflow progress loads
document.querySelector('[data-testid="workflow-progress"]') || 
document.querySelector('.debug-info') // Development debug panel

// Expected: Should see workflow data loading without errors
```

#### **Test 2: Navigation Component States**
```javascript
// Test tab navigation states
const tabs = document.querySelectorAll('[role="tab"], .nav-tab');
console.log('Navigation tabs:', tabs.length);

// Expected: 4 tabs (ICP, Cost Calculator, Business Case, Results)
// Check disabled/enabled states based on workflow progress
```

#### **Test 3: Tool Component Loading**
```bash
# Test each tool component individually:

# ICP Display
curl -s "http://localhost:3000/customer/CUST_2/dashboard/icp?token=test-token-123456" | grep -c "ICP Identification"

# Cost Calculator  
curl -s "http://localhost:3000/customer/CUST_2/dashboard/cost-calculator?token=test-token-123456" | grep -c "Cost of Inaction"

# Business Case
curl -s "http://localhost:3000/customer/CUST_2/dashboard/business-case?token=test-token-123456" | grep -c "Business Case"

# Results Dashboard
curl -s "http://localhost:3000/customer/CUST_2/dashboard/results?token=test-token-123456" | grep -c "Results Dashboard"
```

### **Dark Theme Consistency Verification**
```javascript
// Console test for dark theme elements
console.log('=== Dark Theme Test ===');
const darkElements = {
  background: document.body.style.backgroundColor || getComputedStyle(document.body).backgroundColor,
  cards: document.querySelectorAll('.bg-gray-900, .bg-gray-800').length,
  text: document.querySelectorAll('.text-white, .text-gray-300, .text-gray-400').length,
  borders: document.querySelectorAll('.border-gray-700, .border-gray-600').length
};
console.table(darkElements);

// Expected: All values > 0, background should be dark
```

### **Mobile Responsive Testing**
```javascript
// Simulate different device sizes
const testResponsive = () => {
  const sizes = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];
  
  sizes.forEach(size => {
    console.log(`Testing ${size.name}: ${size.width}x${size.height}`);
    window.resizeTo(size.width, size.height);
    
    // Check layout
    const sidebar = document.querySelector('.sidebar');
    const grid = document.querySelector('.grid, .lg\\:grid-cols-2');
    
    console.log(`${size.name} layout:`, {
      sidebar: sidebar ? 'visible' : 'hidden',
      gridColumns: grid ? getComputedStyle(grid).gridTemplateColumns : 'none'
    });
  });
};

// Run test
testResponsive();

## 🔗 INTEGRATION TESTING

### **Test 1: Tool Completion Flow**
```bash
# Test ICP completion workflow
echo "Testing ICP Completion Flow..."

# Check initial state
curl -H "Authorization: Bearer patRFDDPSFiB0N35f.7cb603a542780224d3954da972d86021a78bc7d9862a6ae16887c45a2efb6ce9" \
"https://api.airtable.com/v0/app0jJkgTCqn46vp9/Customer%20Assets/rechze4X0QFwHRD01" | \
jq '.fields["Workflow Progress"]'

# Expected: Should show default workflow progress JSON
```

#### **Integration Test Commands**
```javascript
// Test workflow completion in browser console
const testWorkflowIntegration = async () => {
  console.log('=== Workflow Integration Test ===');
  
  // 1. Test ICP completion
  const icpForm = document.querySelector('form[data-testid="icp-form"]') || 
                  document.querySelector('form');
  
  if (icpForm) {
    const companyInput = icpForm.querySelector('input[type="text"]');
    if (companyInput) {
      companyInput.value = 'Test Company Inc';
      companyInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      const submitBtn = icpForm.querySelector('button[type="submit"]');
      if (submitBtn && !submitBtn.disabled) {
        console.log('✅ ICP form ready for submission');
        // submitBtn.click(); // Uncomment to actually test
      }
    }
  }
  
  // 2. Check navigation state updates
  setTimeout(() => {
    const costTab = document.querySelector('[data-tab="cost-calculator"]') ||
                   document.querySelector('[href*="cost-calculator"]');
    console.log('Cost Calculator tab enabled:', !costTab?.disabled);
  }, 100);
};

testWorkflowIntegration();
```

### **Test 2: Airtable Data Persistence**
```bash
# Create test script for Airtable persistence
cat > test_airtable_persistence.sh << 'EOF'
#!/bin/bash

echo "=== Airtable Persistence Test ==="

# Test 1: Update workflow progress
echo "Testing workflow progress update..."
curl -X PATCH "https://api.airtable.com/v0/app0jJkgTCqn46vp9/Customer%20Assets/rechze4X0QFwHRD01" \
  -H "Authorization: Bearer patRFDDPSFiB0N35f.7cb603a542780224d3954da972d86021a78bc7d9862a6ae16887c45a2efb6ce9" \
  -H "Content-Type: application/json" \
  --data '{
    "fields": {
      "Workflow Progress": "{\"icp_completed\": true, \"icp_score\": 85, \"company_name\": \"Test Corp\", \"completion_percentage\": 40, \"last_updated\": \"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'\"}"
    }
  }' | jq '.fields["Workflow Progress"]'

sleep 2

# Test 2: Verify data persisted
echo "Verifying data persistence..."
curl -H "Authorization: Bearer patRFDDPSFiB0N35f.7cb603a542780224d3954da972d86021a78bc7d9862a6ae16887c45a2efb6ce9" \
"https://api.airtable.com/v0/app0jJkgTCqn46vp9/Customer%20Assets/rechze4X0QFwHRD01" | \
jq -r '.fields["Workflow Progress"]' | jq '.icp_completed'

echo "Test complete!"
EOF

chmod +x test_airtable_persistence.sh
./test_airtable_persistence.sh
```

### **Test 3: State Management Across Components**
```javascript
// Browser console test for state management
const testStateManagement = () => {
  console.log('=== State Management Test ===');
  
  // Check if React DevTools is available
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools detected');
    
    // Test state updates
    const testState = {
      workflowProgress: {
        icp_completed: true,
        cost_calculated: false,
        business_case_ready: false,
        completion_percentage: 40
      }
    };
    
    console.log('Test state object:', testState);
    
    // Verify state propagation between components
    const navComponent = document.querySelector('[data-component="navigation"]');
    const toolComponent = document.querySelector('[data-component="tool"]');
    
    console.log('Component communication test:', {
      navigation: !!navComponent,
      tool: !!toolComponent,
      stateSync: 'Manual verification required'
    });
  } else {
    console.warn('❌ React DevTools not available');
  }
};

testStateManagement();
```

## 👥 USER JOURNEY TESTING

### **Scenario 1: New Customer Journey**
```bash
# Reset customer workflow for testing
echo "=== New Customer Journey Test ==="

# Step 1: Reset customer data to default state
curl -X PATCH "https://api.airtable.com/v0/app0jJkgTCqn46vp9/Customer%20Assets/rechze4X0QFwHRD01" \
  -H "Authorization: Bearer patRFDDPSFiB0N35f.7cb603a542780224d3954da972d86021a78bc7d9862a6ae16887c45a2efb6ce9" \
  -H "Content-Type: application/json" \
  --data '{
    "fields": {
      "Workflow Progress": "{\"icp_completed\": false, \"icp_score\": null, \"cost_calculated\": false, \"annual_cost\": null, \"business_case_ready\": false, \"selected_template\": null, \"completion_percentage\": 0, \"company_name\": \"\", \"last_active_tool\": \"icp\"}",
      "User Preferences": "{\"icp_framework_customized\": false, \"preferred_export_format\": \"pdf\", \"methodology_transparency\": false, \"custom_criteria\": [], \"export_history\": []}",
      "Usage Analytics": "{\"session_start\": null, \"time_per_tool\": {}, \"export_count\": 0, \"share_count\": 0, \"tools_completed\": [], \"last_login\": null}"
    }
  }'

echo "Customer data reset. Navigate to:"
echo "http://localhost:3000/customer/CUST_2/dashboard/icp?token=test-token-123456"
```

#### **Manual Testing Steps - New Customer:**
1. **Initial State Verification:**
   - ✅ Only ICP tab enabled/clickable
   - ✅ Cost Calculator, Business Case, Results tabs locked/grayed out
   - ✅ Progress indicator shows 0%
   - ✅ "Get Started" messaging visible

2. **ICP Completion Test:**
   - ✅ Enter company name: "TechStartup Inc"
   - ✅ Click "Calculate Fit Score" button
   - ✅ Wait for analysis (2 second simulation)
   - ✅ Verify score appears (70-100 range)
   - ✅ Check auto-navigation to Cost Calculator after 2 seconds

3. **Progressive Unlocking:**
   - ✅ Cost Calculator tab now enabled
   - ✅ Progress indicator updates to ~40%
   - ✅ Company name pre-populated in Cost Calculator

### **Scenario 2: Returning Customer**
```bash
# Set up returning customer with partial progress
echo "=== Returning Customer Test ==="

curl -X PATCH "https://api.airtable.com/v0/app0jJkgTCqn46vp9/Customer%20Assets/rechze4X0QFwHRD01" \
  -H "Authorization: Bearer patRFDDPSFiB0N35f.7cb603a542780224d3954da972d86021a78bc7d9862a6ae16887c45a2efb6ce9" \
  -H "Content-Type: application/json" \
  --data '{
    "fields": {
      "Workflow Progress": "{\"icp_completed\": true, \"icp_score\": 85, \"cost_calculated\": false, \"annual_cost\": null, \"business_case_ready\": false, \"selected_template\": null, \"completion_percentage\": 40, \"company_name\": \"Existing Corp\", \"last_active_tool\": \"cost\"}"
    }
  }'

echo "Returning customer setup complete."
```

#### **Manual Testing Steps - Returning Customer:**
1. **Resume State Verification:**
   - ✅ ICP tab shows completed (checkmark/green state)
   - ✅ Cost Calculator tab active/highlighted
   - ✅ Business Case tab still locked
   - ✅ Progress indicator shows 40%
   - ✅ Company name "Existing Corp" visible

2. **Complete Remaining Workflow:**
   - ✅ Complete Cost Calculator
   - ✅ Auto-navigate to Business Case
   - ✅ Complete Business Case
   - ✅ Auto-navigate to Results Dashboard
   - ✅ Final progress shows 100%

### **Scenario 3: Edge Cases**

#### **Test 1: Invalid Workflow States**
```javascript
// Test invalid state handling
const testInvalidStates = async () => {
  console.log('=== Edge Cases Test ===');
  
  // Test 1: Corrupted workflow data
  try {
    localStorage.setItem('workflow_debug', JSON.stringify({
      icp_completed: "invalid_boolean",
      completion_percentage: "not_a_number"
    }));
    location.reload();
  } catch (e) {
    console.log('✅ Handles corrupted data gracefully');
  }
  
  // Test 2: Missing session data
  const originalSession = localStorage.getItem('session');
  localStorage.removeItem('session');
  
  // Should show authentication error
  setTimeout(() => {
    console.log('Auth error handling test complete');
    if (originalSession) {
      localStorage.setItem('session', originalSession);
    }
  }, 1000);
};
```

#### **Test 2: API Error Simulation**
```bash
# Test API error handling
echo "=== API Error Test ==="

# Temporarily use invalid API key
curl -X PATCH "https://api.airtable.com/v0/app0jJkgTCqn46vp9/Customer%20Assets/rechze4X0QFwHRD01" \
  -H "Authorization: Bearer invalid_key_test" \
  -H "Content-Type: application/json" \
  --data '{"fields": {"test": "error"}}' 2>&1 | grep -E "(error|401|403)"

echo "Expected: Should see authentication error"
echo "App should handle gracefully with error messages"
```

#### **Test 3: Network Conditions**
```javascript
// Test slow network simulation
const testSlowNetwork = () => {
  console.log('=== Slow Network Test ===');
  
  // Simulate slow network in DevTools:
  // 1. Open DevTools (F12)
  // 2. Go to Network tab
  // 3. Select "Slow 3G" or "Fast 3G" from throttling dropdown
  // 4. Reload page and test workflow
  
  console.log('Manual steps:');
  console.log('1. Open DevTools Network tab');
  console.log('2. Enable network throttling');
  console.log('3. Test loading states and timeouts');
  console.log('4. Verify loading spinners appear');
  console.log('5. Check error handling for timeouts');
};

testSlowNetwork();
```

#### **Test 4: Mobile Device Testing**
```bash
# Mobile testing checklist
echo "=== Mobile Device Testing ==="
echo "Test on actual devices or browser dev tools:"
echo ""
echo "📱 iPhone 12 Pro (390x844)"
echo "📱 Samsung Galaxy S21 (360x800)"  
echo "📱 iPad Pro (834x1194)"
echo ""
echo "Manual verification points:"
echo "✅ Touch targets are 44px minimum"
echo "✅ Text is readable without zooming"
echo "✅ Horizontal scrolling not required"
echo "✅ Forms work with mobile keyboards"
echo "✅ Navigation accessible with thumb"
echo "✅ Loading states visible on slow connections"
```

## 🚀 DEPLOYMENT CHECKLIST

### **1. GitHub Integration Verification**
```bash
# Verify all components are committed
echo "=== GitHub Integration Check ==="

# Check git status
git status

# Verify all new components are tracked
echo "New components that should be committed:"
git ls-files | grep -E "(CustomerDashboard|useWorkflowProgress|airtableWorkflow|ContentDisplay|EnhancedTabNavigation)" || echo "❌ Missing components"

# Check file structure matches specification
echo "Verifying file structure..."
find src/ -name "*.jsx" -o -name "*.js" | sort

# Expected files:
echo "Expected new/updated files:"
echo "- src/components/dashboard/CustomerDashboard.jsx"
echo "- src/hooks/useWorkflowProgress.js"  
echo "- src/utils/airtableWorkflow.js"
echo "- src/components/common/ContentDisplay.jsx"
echo "- src/services/airtableService.js"
```

#### **Dependencies Check**
```bash
# Verify package.json has all dependencies
echo "=== Dependencies Verification ==="

# Check React dependencies
npm ls react react-dom react-router-dom

# Check if any new dependencies were added
echo "Recently added dependencies:"
git diff HEAD~5 package.json | grep "^\+"

# Verify no missing dependencies
npm audit --audit-level moderate
```

### **2. Netlify Deployment Verification**
```bash
# Build process verification
echo "=== Build Process Test ==="

# Test local build
npm run build

# Check build output
echo "Build artifacts:"
ls -la build/

# Verify CSS builds properly with new styles
grep -r "bg-gray-900\|text-white\|prose-invert" build/ | head -5

# Check for build errors
echo "Checking for build warnings/errors:"
npm run build 2>&1 | grep -E "(error|Error|warn|Warn|failed)"
```

#### **Environment Variables for Netlify**
```bash
# Create environment variables checklist
echo "=== Netlify Environment Variables ==="
echo "Required environment variables:"
echo "✅ REACT_APP_AIRTABLE_BASE_ID=app0jJkgTCqn46vp9"
echo "✅ REACT_APP_AIRTABLE_API_KEY=[your-api-key]"
echo ""
echo "To set in Netlify:"
echo "1. Go to Site Settings > Environment Variables"
echo "2. Add each variable with production values"
echo "3. Redeploy site to apply changes"

# Test environment variables locally
echo "Local environment test:"
if [[ -n "$REACT_APP_AIRTABLE_BASE_ID" ]]; then
    echo "✅ REACT_APP_AIRTABLE_BASE_ID is set"
else
    echo "❌ REACT_APP_AIRTABLE_BASE_ID missing"
fi

if [[ -n "$REACT_APP_AIRTABLE_API_KEY" ]]; then
    echo "✅ REACT_APP_AIRTABLE_API_KEY is set"
else
    echo "❌ REACT_APP_AIRTABLE_API_KEY missing"
fi
```

### **3. Airtable Schema Verification**
```bash
# Verify Airtable schema matches requirements
echo "=== Airtable Schema Verification ==="

# Test all required fields exist
curl -H "Authorization: Bearer patRFDDPSFiB0N35f.7cb603a542780224d3954da972d86021a78bc7d9862a6ae16887c45a2efb6ce9" \
"https://api.airtable.com/v0/meta/bases/app0jJkgTCqn46vp9/tables" | \
jq '.tables[] | select(.name == "Customer Assets") | .fields[] | select(.name | test("Workflow Progress|User Preferences|Usage Analytics")) | .name'

# Expected output: "Workflow Progress", "User Preferences", "Usage Analytics"

# Test field types are correct
curl -H "Authorization: Bearer patRFDDPSFiB0N35f.7cb603a542780224d3954da972d86021a78bc7d9862a6ae16887c45a2efb6ce9" \
"https://api.airtable.com/v0/meta/bases/app0jJkgTCqn46vp9/tables" | \
jq '.tables[] | select(.name == "Customer Assets") | .fields[] | select(.name | test("Workflow Progress|User Preferences|Usage Analytics")) | {name, type}'

# Verify record has default values
curl -H "Authorization: Bearer patRFDDPSFiB0N35f.7cb603a542780224d3954da972d86021a78bc7d9862a6ae16887c45a2efb6ce9" \
"https://api.airtable.com/v0/app0jJkgTCqn46vp9/Customer%20Assets/rechze4X0QFwHRD01" | \
jq '.fields | has("Workflow Progress") and has("User Preferences") and has("Usage Analytics")'
```

#### **API Permissions Test**
```bash
# Test API permissions for all operations
echo "=== API Permissions Test ==="

# Test read permission
curl -s -w "%{http_code}" -H "Authorization: Bearer patRFDDPSFiB0N35f.7cb603a542780224d3954da972d86021a78bc7d9862a6ae16887c45a2efb6ce9" \
"https://api.airtable.com/v0/app0jJkgTCqn46vp9/Customer%20Assets/rechze4X0QFwHRD01" | tail -1

# Test write permission
curl -s -w "%{http_code}" -X PATCH "https://api.airtable.com/v0/app0jJkgTCqn46vp9/Customer%20Assets/rechze4X0QFwHRD01" \
  -H "Authorization: Bearer patRFDDPSFiB0N35f.7cb603a542780224d3954da972d86021a78bc7d9862a6ae16887c45a2efb6ce9" \
  -H "Content-Type: application/json" \
  --data '{"fields": {"test_field": "test_value"}}' | tail -1

# Expected: Both should return 200
echo "Expected: Both calls should return 200 status codes"
```

## ✅ FINAL VERIFICATION CHECKLIST

### **Pre-Deployment Verification**
```bash
# Run complete verification suite
echo "=== Final Pre-Deployment Check ==="

# 1. Build Test
echo "1. Testing build..."
npm run build > /dev/null 2>&1 && echo "✅ Build successful" || echo "❌ Build failed"

# 2. Component Load Test
echo "2. Testing component loading..."
npm start &
SERVER_PID=$!
sleep 10

# Test if server is running
curl -s http://localhost:3000 > /dev/null && echo "✅ Server running" || echo "❌ Server failed"

# Kill test server
kill $SERVER_PID 2>/dev/null

# 3. Airtable Connection Test
echo "3. Testing Airtable connection..."
curl -s -H "Authorization: Bearer patRFDDPSFiB0N35f.7cb603a542780224d3954da972d86021a78bc7d9862a6ae16887c45a2efb6ce9" \
"https://api.airtable.com/v0/app0jJkgTCqn46vp9/Customer%20Assets" | jq '.records | length' > /dev/null && \
echo "✅ Airtable connected" || echo "❌ Airtable connection failed"

echo "Pre-deployment verification complete!"
```

### **Post-Deployment Verification**
```bash
# After deploying to Netlify/production
echo "=== Post-Deployment Verification ==="

# Replace with your actual Netlify URL
DEPLOYMENT_URL="https://your-app.netlify.app"

# Test deployment
echo "Testing deployment at: $DEPLOYMENT_URL"

# 1. Basic connectivity
curl -s -w "%{http_code}" "$DEPLOYMENT_URL" | tail -1 | grep -q "200" && \
echo "✅ Site accessible" || echo "❌ Site not accessible"

# 2. Test customer route
curl -s -w "%{http_code}" "$DEPLOYMENT_URL/customer/CUST_2?token=test-token-123456" | tail -1 | grep -q "200" && \
echo "✅ Customer routes working" || echo "❌ Customer routes failed"

# 3. Test assets loading
curl -s -w "%{http_code}" "$DEPLOYMENT_URL/static/css/main.[hash].css" | tail -1 | grep -q "200" && \
echo "✅ CSS assets loading" || echo "❌ CSS assets failed"

# 4. Manual verification points
echo ""
echo "Manual verification required:"
echo "✅ Navigate to customer dashboard"
echo "✅ Test workflow progression"
echo "✅ Verify data persistence"
echo "✅ Test on mobile device"
echo "✅ Check browser console for errors"
```

### **Automated Testing Script**
```bash
# Create comprehensive test runner
cat > run_all_tests.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Running comprehensive test suite..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}Running: $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $test_name PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $test_name FAILED${NC}"
        ((TESTS_FAILED++))
    fi
}

# Run all tests
run_test "Build Test" "npm run build"
run_test "Lint Check" "npm run lint --silent"
run_test "Component Files" "test -f src/components/dashboard/CustomerDashboard.jsx"
run_test "Hook Files" "test -f src/hooks/useWorkflowProgress.js"
run_test "Airtable Connection" "curl -s -H 'Authorization: Bearer patRFDDPSFiB0N35f.7cb603a542780224d3954da972d86021a78bc7d9862a6ae16887c45a2efb6ce9' 'https://api.airtable.com/v0/app0jJkgTCqn46vp9/Customer%20Assets' | jq '.records | length'"

echo ""
echo "📊 Test Results:"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Ready for deployment.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Fix issues before deploying.${NC}"
    exit 1
fi
EOF

chmod +x run_all_tests.sh
echo "Test runner created: ./run_all_tests.sh"
```

## 🎯 QUICK START TESTING COMMANDS

### **Essential Test Commands**
```bash
# Quick verification (run these first)
npm run build                    # Build test
./test_airtable_persistence.sh   # Data persistence test
./run_all_tests.sh              # Full automated test suite

# Manual testing URLs
echo "Test URLs:"
echo "New customer:      http://localhost:3000/customer/CUST_2/dashboard/icp?token=test-token-123456"  
echo "Returning customer: http://localhost:3000/customer/CUST_2/dashboard/cost-calculator?token=test-token-123456"
echo "Results page:      http://localhost:3000/customer/CUST_2/dashboard/results?token=test-token-123456"
```

### **Emergency Rollback Plan**
```bash
# If deployment fails, quick rollback
echo "=== Emergency Rollback ==="
echo "1. Revert to previous Git commit:"
echo "   git reset --hard HEAD~1"
echo ""  
echo "2. Force push to trigger Netlify rebuild:"
echo "   git push --force origin assets-feature"
echo ""
echo "3. Restore previous Airtable schema:"
curl -X PATCH "https://api.airtable.com/v0/app0jJkgTCqn46vp9/Customer%20Assets/rechze4X0QFwHRD01" \
  -H "Authorization: Bearer patRFDDPSFiB0N35f.7cb603a542780224d3954da972d86021a78bc7d9862a6ae16887c45a2efb6ce9" \
  -H "Content-Type: application/json" \
  --data '{"fields": {"Workflow Progress": null, "User Preferences": null, "Usage Analytics": null}}'
```

---

**📝 Notes:**
- Replace `your-app.netlify.app` with your actual Netlify URL
- Update API keys and base IDs as needed for your environment
- Run tests in order: Local → Integration → User Journey → Deployment
- Always test on multiple devices and browsers
- Keep rollback plan ready for production deployments
<parameter name="todos">[{"id": "1", "content": "Create local development testing commands", "status": "completed"}, {"id": "2", "content": "Set up integration testing scenarios", "status": "in_progress"}, {"id": "3", "content": "Document user journey testing steps", "status": "pending"}, {"id": "4", "content": "Create edge case testing procedures", "status": "pending"}, {"id": "5", "content": "Verify deployment checklist items", "status": "pending"}, {"id": "6", "content": "Create final verification commands", "status": "pending"}]