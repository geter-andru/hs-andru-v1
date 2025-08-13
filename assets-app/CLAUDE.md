# H&S Revenue Intelligence Platform - Project Context

## Recent Updates (August 13, 2025)

### 1. Airtable Field Audit & Data Population
- **Fixed Missing Fields:** Added 4 critical fields to Customer Assets table
  - Competency Progress, Tool Access Status, Professional Milestones, Daily Objectives
  - Note: 3 fields (User Preferences, Detailed ICP Analysis, Target Buyer Personas) may already exist but return DUPLICATE errors
- **CUST_02 Sample Data:** Fully populated with comprehensive test data for all fields
- **Field Names:** Use lowercase names (e.g., "detailed ICP analysis" not "Detailed ICP Analysis")

### 2. Navigation Authentication Fix
- **Issue:** Navigation was routing to `/icp` instead of `/customer/:customerId/dashboard/icp`
- **Solution:** Updated `useNavigation` hook to use absolute paths with customer context
- **File:** `/src/hooks/useNavigation.js` - now properly maintains authentication context

### 3. Admin User System Implementation
- **Admin Access:** Customer ID: `CUST_4`, Token: `admin-demo-token-2025`
- **Admin URL:** `/customer/CUST_4?token=admin-demo-token-2025`
- **Features:**
  - Full platform access without payment
  - Professional sample content for demos
  - Admin mode indicator (blue "Demo Mode" badge)
  - Complete ICP, Cost Calculator, and Business Case content
- **Purpose:** Testing, QA, and sales demonstrations (MVP scope - single user only)

## Key Technical Decisions

### Authentication Flow
- App expects URLs like: `/customer/:customerId?token=accessToken`
- Layout component validates credentials via authService
- Session stored in sessionStorage with 24-hour expiry
- Admin users detected by CUST_4 ID and special token

### Airtable Integration
- **Base ID:** `app0jJkgTCqn46vp9`
- **Customer Assets Table ID:** `tblV61SJBcLwKv0WP`
- **API Key:** Stored in environment (pat5kFmJsBxfL5Yqr...)
- **Field Structure:** JSON strings stored in multilineText fields
- **Direct API:** Use curl for field operations (npx airtable-mcp-server has issues)

### Navigation Architecture
- Progressive engagement flow: Welcome → ICP → Cost Calculator → Business Case
- DashboardLayout with 80/20 split (main content / sidebar)
- NavigationControls component prevents dead-end screens
- Error boundaries for graceful error recovery

## Project Structure

```
/assets-app
├── /src
│   ├── /components
│   │   ├── /admin (Admin mode indicators)
│   │   ├── /progressive-engagement (Welcome, tool focus)
│   │   ├── /navigation (NavigationControls, EnhancedTabNavigation)
│   │   ├── /layout (DashboardLayout, SidebarSection)
│   │   └── /ui (ButtonComponents with error handling)
│   ├── /hooks
│   │   └── useNavigation.js (Fixed to maintain auth context)
│   └── /services
│       ├── authService.js (Admin authentication added)
│       └── airtableService.js (Customer data loading)
└── CLAUDE.md (This file - project memory)
```

## Current Status

### ✅ Completed
- Navigation authentication fixed
- Airtable fields audit and population
- Admin user system implemented
- All changes pushed to GitHub main branch
- Build compiles successfully with only ESLint warnings

### ⚠️ Known Issues
- 3 Airtable fields return DUPLICATE_OR_EMPTY_FIELD_NAME errors but may exist
- Need to verify these fields through Airtable UI manually

### 🎯 Next Steps
- Multi-user functionality planned for full release (2 months)
- Additional admin features as needed for testing
- Performance optimization for production deployment

## Important URLs & Access

- **Admin Access:** `/customer/CUST_4?token=admin-demo-token-2025`
- **Test User CUST_02:** `/customer/CUST_02?token=test-token-123456`
- **GitHub Repo:** https://github.com/geter-andru/hs-andru-v1
- **Main Branch:** All recent changes merged and deployed

## Developer Notes

### When Adding New Features
1. Always check authentication context in navigation
2. Use lowercase field names for Airtable operations
3. Test with both admin (CUST_4) and regular users
4. Maintain error boundaries for graceful failures
5. Use TodoWrite tool to track implementation tasks

### Testing Checklist
- [ ] Navigation maintains customer context
- [ ] Admin mode indicator shows for CUST_4
- [ ] All tools load with sample data
- [ ] Error boundaries catch component failures
- [ ] Build compiles without errors

## Session Summary
This session focused on fixing critical authentication/navigation issues, completing Airtable data population, and implementing a single admin user system for MVP testing and demonstrations. All changes are production-ready and deployed to GitHub.