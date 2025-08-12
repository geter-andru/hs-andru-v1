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
run_test "Component Files" "test -f src/components/dashboard/CustomerDashboard.jsx"
run_test "Hook Files" "test -f src/hooks/useWorkflowProgress.js"
run_test "Utils Files" "test -f src/utils/airtableWorkflow.js"
run_test "Service Files" "test -f src/services/airtableService.js"
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