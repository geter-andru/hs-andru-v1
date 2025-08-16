# Customer Task Progress Table Schema

## Table Overview
**Table Name:** `Customer Task Progress`  
**Purpose:** Track customer task completions and progress within the simplified platform milestone system.

## Field Definitions

### Primary Fields
- **Progress ID** (Primary Key)
  - Type: AutoNumber
  - Format: `PROG_{0001}`
  - Description: Unique identifier for each task progress record

- **Customer ID** (Link to Customer Assets)
  - Type: Link to another record
  - Linked Table: Customer Assets
  - Description: Links to the customer who completed the task

### Task Information
- **Task ID** (Single line text)
  - Type: Single line text
  - Description: Reference ID from source task tables (Seed_Tasks, Series_A_Tasks, or default)

- **Task Name** (Single line text)
  - Type: Single line text
  - Required: Yes
  - Description: Human-readable name of the completed task

- **Task Source** (Single select)
  - Type: Single select
  - Options: ["Seed_Tasks", "Series_A_Tasks", "default", "custom"]
  - Description: Source table or system where task originated

### Milestone & Classification
- **Stage Milestone** (Single line text)
  - Type: Single line text
  - Description: Milestone category (e.g., "Initial PMF", "Key Hires", "Scalability/Revenue")

- **Competency Area** (Single select)
  - Type: Single select
  - Options: ["customerAnalysis", "valueCommunication", "executiveReadiness", "general"]
  - Description: Primary competency area this task develops

- **Priority Level** (Single select)
  - Type: Single select
  - Options: ["critical", "high", "medium", "low"]
  - Description: Task priority based on competency gaps

### Progress Tracking
- **Status** (Single select)
  - Type: Single select
  - Options: ["not_started", "in_progress", "completed", "skipped"]
  - Default: "completed"
  - Description: Current status of the task

- **Completed Date** (Date)
  - Type: Date
  - Description: When the task was marked as completed

- **Platform Tool Used** (Single select)
  - Type: Single select
  - Options: ["icp-analysis", "financial-impact", "resource-library", "none"]
  - Description: Which platform tool was used to implement the task

### Impact & Notes
- **Completion Notes** (Long text)
  - Type: Long text
  - Description: Optional notes about task completion or implementation details

- **Competency Impact** (Number)
  - Type: Number
  - Precision: 0 (whole numbers)
  - Description: Points gained toward competency development (1-10 scale)

### Metadata
- **Created Date** (Created time)
  - Type: Created time
  - Description: When this progress record was created

- **Last Updated** (Last modified time)
  - Type: Last modified time
  - Description: When this record was last modified

## API Integration Examples

### Create Task Progress Record
```javascript
const record = {
  fields: {
    'Customer ID': 'recXXXXXXXXXXXXXX', // Link to Customer Assets
    'Task ID': 'seed-task-001',
    'Task Name': 'Define Ideal Customer Profile (ICP)',
    'Task Source': 'Seed_Tasks',
    'Stage Milestone': 'Initial PMF (Product-Market Fit)',
    'Competency Area': 'customerAnalysis',
    'Priority Level': 'high',
    'Status': 'completed',
    'Completed Date': '2024-08-15',
    'Platform Tool Used': 'icp-analysis',
    'Completion Notes': 'Completed via simplified platform ICP tool',
    'Competency Impact': 5
  }
};
```

### Query Customer Task Progress
```javascript
// Get all completed tasks for a customer
const filter = `AND({Customer ID} = "CUST_02", {Status} = "completed")`;

// Get tasks by competency area
const filter = `AND({Customer ID} = "CUST_02", {Competency Area} = "customerAnalysis")`;

// Get recent completions
const filter = `AND({Customer ID} = "CUST_02", IS_AFTER({Completed Date}, "2024-08-01"))`;
```

## Enhanced Customer Assets Fields

### Add to Existing Customer Assets Table
- **Current Milestone Category** (Single select)
  - Options: ["Product_Launch", "Initial_PMF", "Key_Hires", "Scalability_Revenue", "User_Base", "Scaling_Product", "Revenue_Growth", "Market_Penetration"]
  
- **Task Completion Rate** (Percent)
  - Formula: `{Completed Tasks Count} / ({Completed Tasks Count} + {Active Tasks Count})`
  
- **Active Tasks Count** (Number - Rollup)
  - Rollup from: Customer Task Progress
  - Field: Status
  - Aggregation: COUNTA(values) WHERE Status = "in_progress"
  
- **Completed Tasks Count** (Number - Rollup)
  - Rollup from: Customer Task Progress
  - Field: Status  
  - Aggregation: COUNTA(values) WHERE Status = "completed"
  
- **Next Recommended Tasks** (Multiple select)
  - Auto-populated based on milestone and competency gaps
  
- **Task Progress Analytics** (Long text)
  - JSON data: `{"competencyGains": {...}, "completionVelocity": 0.8, "preferredTools": [...]}`
  
- **Last Task Completed** (Date - Rollup)
  - Rollup from: Customer Task Progress
  - Field: Completed Date
  - Aggregation: MAX(values)
  
- **Task Competency Gains** (Long text)
  - JSON tracking: `{"customerAnalysis": 15, "valueCommunication": 12, "executiveReadiness": 8}`

## Implementation Commands

### Create Table (via Airtable MCP Server)
```bash
AIRTABLE_API_KEY=<key> npx -y airtable-mcp-server create-table <baseId> "Customer Task Progress" '{
  "fields": [
    {"name": "Progress ID", "type": "autoNumber", "options": {"format": "PROG_{0001}"}},
    {"name": "Customer ID", "type": "multipleRecordLinks", "options": {"linkedTableId": "<customerAssetsTableId>"}},
    {"name": "Task ID", "type": "singleLineText"},
    {"name": "Task Name", "type": "singleLineText"},
    {"name": "Task Source", "type": "singleSelect", "options": {"choices": [{"name": "Seed_Tasks"}, {"name": "Series_A_Tasks"}, {"name": "default"}, {"name": "custom"}]}},
    {"name": "Stage Milestone", "type": "singleLineText"},
    {"name": "Competency Area", "type": "singleSelect", "options": {"choices": [{"name": "customerAnalysis"}, {"name": "valueCommunication"}, {"name": "executiveReadiness"}, {"name": "general"}]}},
    {"name": "Priority Level", "type": "singleSelect", "options": {"choices": [{"name": "critical"}, {"name": "high"}, {"name": "medium"}, {"name": "low"}]}},
    {"name": "Status", "type": "singleSelect", "options": {"choices": [{"name": "not_started"}, {"name": "in_progress"}, {"name": "completed"}, {"name": "skipped"}]}},
    {"name": "Completed Date", "type": "date"},
    {"name": "Platform Tool Used", "type": "singleSelect", "options": {"choices": [{"name": "icp-analysis"}, {"name": "financial-impact"}, {"name": "resource-library"}, {"name": "none"}]}},
    {"name": "Completion Notes", "type": "multilineText"},
    {"name": "Competency Impact", "type": "number", "options": {"precision": 0}},
    {"name": "Created Date", "type": "createdTime"},
    {"name": "Last Updated", "type": "lastModifiedTime"}
  ]
}'
```

### Add Fields to Customer Assets Table
```bash
# Current Milestone Category
AIRTABLE_API_KEY=<key> npx -y airtable-mcp-server create-field <baseId> "Customer Assets" "Current Milestone Category" '{
  "type": "singleSelect",
  "options": {
    "choices": [
      {"name": "Product_Launch"},
      {"name": "Initial_PMF"},
      {"name": "Key_Hires"},
      {"name": "Scalability_Revenue"},
      {"name": "User_Base"},
      {"name": "Scaling_Product"},
      {"name": "Revenue_Growth"},
      {"name": "Market_Penetration"}
    ]
  }
}'

# Task Progress Analytics
AIRTABLE_API_KEY=<key> npx -y airtable-mcp-server create-field <baseId> "Customer Assets" "Task Progress Analytics" '{
  "type": "multilineText",
  "description": "JSON data for task completion analytics and behavioral insights"
}'

# Task Competency Gains
AIRTABLE_API_KEY=<key> npx -y airtable-mcp-server create-field <baseId> "Customer Assets" "Task Competency Gains" '{
  "type": "multilineText", 
  "description": "JSON tracking competency improvements from task completions"
}'
```

## Usage Analytics Integration

The task progress data integrates with the existing usage assessment framework:

1. **Behavioral Assessment**: Task completion patterns indicate user engagement
2. **Competency Tracking**: Task completions drive competency score improvements
3. **Milestone Progression**: Systematic task completion enables milestone advancement
4. **Platform Usage**: Task-to-tool connections drive platform engagement

## Performance Considerations

- **Batch Updates**: Use throttled writes to prevent API rate limits
- **Local Caching**: Cache task progress locally for immediate UI updates
- **Graceful Degradation**: Continue operation even if Airtable writes fail
- **Data Validation**: Validate task data before writing to prevent errors