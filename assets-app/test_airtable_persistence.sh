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