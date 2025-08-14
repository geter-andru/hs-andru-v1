# H&S Revenue Intelligence Platform - Startup Verification Guide

## 🚀 Quick Start Verification (After Restart)

### **Essential Commands**
```bash
cd /Users/geter/hs-andru-v1/assets-app
npm start
```
App runs on `http://localhost:3000`

### **Critical URLs to Test**
1. **Admin Dashboard**: `http://localhost:3000/customer/CUST_4?token=admin-demo-token-2025`
2. **Regular User**: `http://localhost:3000/customer/CUST_02?token=test-token-123456`
3. **Test Environment**: `http://localhost:3000/test`

## ✅ **Verification Checklist**

### **Environment Variables**
```bash
# Check .env file exists with:
REACT_APP_AIRTABLE_BASE_ID=app0jJkgTCqn46vp9
REACT_APP_AIRTABLE_API_KEY=pat5kFmJsBxfL5Yqr...
REACT_APP_APP_NAME=H&S Revenue Intelligence Platform
```

### **Build Status**
```bash
npm run build
# Should compile with ESLint warnings only (no errors)
```

### **Git Status**
```bash
git status
# Should show: "nothing to commit, working tree clean"
git branch -v
# Should show both main and assets-feature at commit 60aa8db
```

### **Airtable Connection**
```bash
# Test Airtable connection:
curl -H "Authorization: Bearer pat5kFmJsBxfL5Yqr.f44840b8b82995ec43ac998191c43f19d0471c9550d0fea9e0327cc4f4aa4815" \
  "https://api.airtable.com/v0/app0jJkgTCqn46vp9/Customer%20Assets?maxRecords=1"
```

## 🔧 **Functional Testing**

### **1. Test Environment (`/test`)**
- [ ] Phase 1 Test: Component interactions work
- [ ] Phase 4 Integration Test: All 6 tests pass (CRUD operations)
- [ ] Welcome Experience: No loading screen stuck
- [ ] Full Dashboard: Authentication launcher works

### **2. Admin User (`CUST_4`)**
- [ ] Dashboard loads without loading screen
- [ ] Blue "Demo Mode" badge visible
- [ ] All tools unlocked and accessible
- [ ] Navigation between phases works
- [ ] Progress sidebar shows competency data

### **3. Regular User (`CUST_02`)**
- [ ] Dashboard loads with populated data
- [ ] Progressive tool unlocking works (70+ threshold)
- [ ] Welcome experience shows personalized content
- [ ] ICP analysis loads with sample data

## 🗂️ **Key Project Files**

### **Critical Documentation**
- `PROJECT_STATUS.md` - Complete system documentation
- `CLAUDE.md` - Session context and project memory
- `AIRTABLE_SCHEMA_PHASE4.md` - Database schema
- `STARTUP_VERIFICATION.md` - This file

### **Core Services**
- `src/services/enhancedAirtableService.js` - Phase 4 CRUD operations
- `src/services/authService.js` - Authentication system
- `src/services/assessmentService.js` - Competency tracking

### **Main Components**
- `src/pages/CustomerDashboard.jsx` - Main dashboard
- `src/components/test/Phase4Test.jsx` - Integration testing
- `src/components/tracking/RealWorldActionTracker.jsx` - Action tracking

## 🐛 **Common Issues & Solutions**

### **Loading Screen Stuck**
- **Issue**: Dashboard or Welcome Experience stuck on loading
- **Solution**: Check authentication parameters in URL, ensure tokens are correct

### **Import Errors**
- **Issue**: ContextualHelp import errors
- **Solution**: Verify `src/components/guidance/ToolGuidanceWrapper.jsx` uses correct import

### **Test Failures**
- **Issue**: Phase 4 tests failing
- **Solution**: Verify Airtable fields exist (may need manual creation in Airtable UI)

### **Build Failures**
- **Issue**: npm start or npm run build fails
- **Solution**: Check environment variables, run `npm install` if needed

## 🎯 **Development Workflow**

### **Branch Management**
- `main` - Production-ready, stable builds
- `assets-feature` - Active development branch
- Both branches synchronized at commit `60aa8db`

### **Making Changes**
1. Always work on `assets-feature` branch
2. Test locally with verification checklist
3. Commit with descriptive messages
4. Merge to `main` when ready
5. Push both branches to GitHub

## 📊 **System Status**

### **Current State**
- ✅ **Phase 4 Complete**: Professional competency tracking fully operational
- ✅ **All Systems Working**: 4 phases + Welcome + Implementation Guidance
- ✅ **Documentation Complete**: Full system documentation available
- ✅ **Testing Suite**: Comprehensive testing environment built
- ✅ **GitHub Deployed**: All changes committed and pushed

### **Production Readiness**
- 45+ React components built and tested
- 3 Airtable tables with 50+ fields documented
- Mobile-responsive dark theme UI
- Error boundaries and graceful failure handling
- Admin user system for testing/demos

**🎉 Platform is production-ready for MVP deployment!**