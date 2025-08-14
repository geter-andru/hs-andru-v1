# Phase 4 Airtable Setup Guide

## Current Status

### ✅ Existing Table:
- **Customer Assets** (ID: tblV61SJBcLwKv0WP)

### ❌ Missing Tables (Need to Create):
1. **Customer Actions** - For tracking real-world business activities
2. **Customer Competency History** - For assessment history tracking

### ❌ Missing Fields in Customer Assets Table:

The following fields need to be added to the Customer Assets table through the Airtable Web UI:

1. **`Competency Level`** (Single line text)
   - Stores: Current professional level (e.g., "Customer Intelligence Foundation")
   
2. **`Achievement IDs`** (Long text)
   - Stores: Comma-separated list of unlocked achievements
   
3. **`Last Assessment Date`** (Date & time)
   - Stores: Date of most recent competency assessment
   
4. **`Development Plan Active`** (Checkbox)
   - Stores: Whether customer has active development plan
   
5. **`Development Focus`** (Single select)
   - Options: balanced, strength_based, gap_focused, career_accelerated
   
6. **`Learning Velocity`** (Number - 1 decimal place)
   - Stores: Progress points earned per week
   
7. **`Last Action Date`** (Date & time)
   - Stores: Date of most recent real-world action

## Manual Setup Instructions

### Step 1: Add Fields to Customer Assets Table

1. Open Airtable and navigate to your base: `app0jJkgTCqn46vp9`
2. Open the **Customer Assets** table
3. Click the **+** button to add each field listed above
4. Configure each field with the correct type and options

### Step 2: Create Customer Actions Table

1. Click **+ Add a table** in your base
2. Name it: **Customer Actions**
3. Add these fields:

```
Customer ID         - Single line text
Action Type         - Single select
                     Options: customer_meeting, prospect_qualification, 
                              value_proposition_delivery, roi_presentation,
                              proposal_creation, deal_closure, 
                              referral_generation, case_study_development
Action Description  - Long text
Impact Level        - Single select
                     Options: low, medium, high, critical
Points Awarded      - Number (whole number)
Category           - Single select
                     Options: customerAnalysis, valueCommunication, salesExecution
Action Date        - Date & time
Evidence Link      - URL
Verified           - Checkbox
Created At         - Date & time
```

### Step 3: Create Customer Competency History Table

1. Click **+ Add a table** in your base
2. Name it: **Customer Competency History**
3. Add these fields:

```
Customer ID                  - Single line text
Assessment Date              - Date & time
Customer Analysis Score      - Number (1 decimal)
Value Communication Score    - Number (1 decimal)
Sales Execution Score        - Number (1 decimal)
Total Progress Points        - Number (whole number)
Assessment Type              - Single select
                              Options: baseline, progress, retake
Competency Level            - Single line text
Notes                       - Long text
Created At                  - Date & time
```

## Testing the Integration

After creating all tables and fields, test the integration:

### 1. Test Read Operations
```javascript
// In browser console
import enhancedAirtableService from './services/enhancedAirtableService';

// Test fetching competency data
const data = await enhancedAirtableService.getCustomerCompetencyData('CUST_4');
console.log('Competency Data:', data);
```

### 2. Test Action Tracking
```javascript
// Track a sample action
const result = await enhancedAirtableService.trackRealWorldAction('CUST_4', {
  type: 'customer_meeting',
  description: 'Test meeting',
  impact: 'medium',
  category: 'customerAnalysis',
  pointsAwarded: 100
});
console.log('Action tracked:', result);
```

### 3. Test Assessment Recording
```javascript
// Record assessment results
const assessment = await enhancedAirtableService.recordAssessmentResults('CUST_4', {
  customerAnalysisScore: 65,
  valueCommunicationScore: 58,
  salesExecutionScore: 52,
  assessmentType: 'progress',
  updateCurrent: true
});
console.log('Assessment recorded:', assessment);
```

## Alternative: Using Airtable API (Limited)

While we can't create tables or fields via the standard API, we can:

1. **Add records** to existing tables
2. **Update records** in existing tables
3. **Query and filter** existing data

The enhanced services (`enhancedAirtableService.js` and `competencySyncService.js`) are ready to work once the tables and fields are created manually.

## Important Notes

1. **API Limitations**: The standard Airtable API (v0) cannot create tables or add fields
2. **Metadata API**: Requires special permissions not available with standard PAT tokens
3. **Manual Setup Required**: All table and field creation must be done through Airtable's web interface
4. **Field Names**: Use exact field names as specified (case-sensitive)
5. **Field Types**: Match the field types exactly for proper data handling

## Verification Checklist

- [ ] Customer Assets table has all 7 new fields
- [ ] Customer Actions table created with all 10 fields
- [ ] Customer Competency History table created with all 10 fields
- [ ] Test data can be written to Customer Actions
- [ ] Test data can be written to Customer Competency History
- [ ] Enhanced services can read/write all data correctly

Once these tables and fields are created manually in Airtable, the Phase 4 integration will be fully functional.