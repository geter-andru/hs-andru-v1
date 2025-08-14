# Airtable Schema Updates for Phase 4

## Tables and Fields Required for Professional Competency Tracking System

### 1. Customer Assets Table (Existing - Add New Fields)

**New Fields to Add:**
- `Competency Level` (Single line text) - Current professional level
- `Achievement IDs` (Long text) - Comma-separated achievement IDs
- `Last Assessment Date` (Date) - Most recent assessment
- `Development Plan Active` (Checkbox) - Active development plan status
- `Development Focus` (Single select: balanced, strength_based, gap_focused, career_accelerated)
- `Learning Velocity` (Number with 1 decimal) - Points per week
- `Last Action Date` (Date) - Most recent real-world action

### 2. Customer Actions Table (New Table)

**Create Table with Fields:**
```
- Customer ID (Single line text) - Links to Customer Assets
- Action Type (Single select):
  - customer_meeting
  - prospect_qualification
  - value_proposition_delivery
  - roi_presentation
  - proposal_creation
  - deal_closure
  - referral_generation
  - case_study_development
- Action Description (Long text)
- Impact Level (Single select: low, medium, high, critical)
- Points Awarded (Number)
- Category (Single select: customerAnalysis, valueCommunication, salesExecution)
- Action Date (Date)
- Evidence Link (URL)
- Verified (Checkbox)
- Created At (Date)
```

### 3. Customer Competency History Table (New Table)

**Create Table with Fields:**
```
- Customer ID (Single line text) - Links to Customer Assets
- Assessment Date (Date)
- Customer Analysis Score (Number with 1 decimal)
- Value Communication Score (Number with 1 decimal)
- Sales Execution Score (Number with 1 decimal)
- Total Progress Points (Number)
- Assessment Type (Single select: baseline, progress, retake)
- Competency Level (Single line text)
- Notes (Long text)
- Created At (Date)
```

## API Integration Architecture

### Services Created:

1. **enhancedAirtableService.js**
   - Complete CRUD operations for competency data
   - Action tracking and history management
   - Achievement unlock tracking
   - Batch operations for efficiency

2. **competencySyncService.js**
   - Optimistic updates with caching
   - Batch processing of updates
   - Periodic sync (30-second intervals)
   - Offline capability with retry logic

### Key Integration Points:

1. **Real-World Action Tracking:**
   - Actions logged to Customer Actions table
   - Points calculated server-side (security consideration)
   - Automatic competency score updates
   - Achievement checking on each action

2. **Assessment Integration:**
   - History tracked in Customer Competency History table
   - Baseline vs current comparison
   - Professional level calculation
   - Tool unlock checking

3. **Achievement System:**
   - Achievement IDs stored as comma-separated list
   - Bonus points awarded on unlock
   - Professional milestones tracked
   - Integration with competency scores

4. **Analytics & Reporting:**
   - Action statistics aggregation
   - Learning velocity calculation
   - Competency trend analysis
   - Development plan tracking

## Security Considerations (Production Implementation)

1. **Move Calculations Server-Side:**
   - Point calculations should happen on backend
   - Validation of action submissions
   - Rate limiting (max 10 actions/hour)
   - Anomaly detection for unusual patterns

2. **Data Validation:**
   - Plausibility checks on actions
   - Historical pattern analysis
   - Session-based verification
   - Audit trail maintenance

3. **Performance Optimization:**
   - Batch API calls where possible
   - Implement caching layer (Redis recommended)
   - Use webhooks for real-time updates
   - Pagination for large data sets

## Testing Checklist

- [ ] Customer Actions table created in Airtable
- [ ] Customer Competency History table created in Airtable
- [ ] New fields added to Customer Assets table
- [ ] API integration tested with real customer data
- [ ] Action tracking works end-to-end
- [ ] Achievement unlocking updates Airtable
- [ ] Assessment recording creates history entries
- [ ] Analytics calculations are accurate
- [ ] Sync service handles offline/online transitions
- [ ] Cache invalidation works correctly

## Next Steps

1. **Manual Airtable Setup:**
   - Create the two new tables through Airtable UI
   - Add the new fields to Customer Assets table
   - Test with sample data

2. **Backend Service (Future):**
   - Create Node.js/Express backend for secure calculations
   - Implement proper authentication middleware
   - Add rate limiting and validation
   - Deploy to production environment

3. **Production Deployment:**
   - Environment variables for API keys
   - Error monitoring (Sentry recommended)
   - Performance monitoring
   - User activity analytics