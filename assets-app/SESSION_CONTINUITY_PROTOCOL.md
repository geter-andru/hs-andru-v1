# Claude Code Session Continuity Protocol

## 🔄 **AUTOMATIC SESSION STARTUP PROCESS**

### **Phase 1: Context Loading (First 30 seconds)**
When starting any new session, I should immediately:

1. **Read Core Documentation Files** (in this order):
   ```
   📖 Read PROJECT_STATUS.md        # Complete system status
   📖 Read CLAUDE.md               # Project context & recent work  
   📖 Read STARTUP_VERIFICATION.md # Environment & testing
   ```

2. **Generate Automatic Status Report**:
   - Current project completion percentage
   - Last major milestone achieved
   - System operational status
   - Critical URLs for testing
   - Next recommended actions

3. **Verify Working Environment**:
   ```bash
   git status                      # Check for uncommitted work
   git log --oneline -3           # Latest commits
   npm run build                  # Verify build status (optional)
   ```

## 🔧 **PRE-RESTART PROTOCOL** (End of Session)

### **Critical Actions Checklist:**
- [ ] **Update CLAUDE.md** - Add session achievements and current status
- [ ] **Update PROJECT_STATUS.md** - Any new features, fixes, or documentation
- [ ] **Create/Update Verification Guide** - Ensure testing instructions are current
- [ ] **Commit & Push All Work** - Both main and assets-feature branches
- [ ] **Verify Build Status** - `npm run build` compiles successfully
- [ ] **Test Critical Paths** - Verify main user flows work
- [ ] **Document Any Known Issues** - Note anything that needs attention

### **Documentation Standards:**
- **CLAUDE.md**: Project context, recent work, session summaries
- **PROJECT_STATUS.md**: Complete system documentation, architecture, features
- **STARTUP_VERIFICATION.md**: Environment setup, testing procedures, troubleshooting
- **Git History**: Descriptive commit messages with feature summaries

## 🤖 **AUTO-GENERATED STATUS REPORT TEMPLATE**

### **Session Startup Report Format:**
```markdown
# 🎯 H&S Revenue Intelligence Platform - Session Status

## 📊 **Current Progress**
- **Completion**: [X]% complete
- **Phase**: [Current Phase]
- **Last Major Achievement**: [Latest milestone]
- **Build Status**: [✅ Passing / ⚠️ Warnings / ❌ Errors]
- **Git Status**: [Clean / Uncommitted changes]

## 🚀 **Operational Status**
- **Main Dashboard**: [✅ Working / ⚠️ Issues / ❌ Broken]
- **Test Environment**: [✅ All tests passing / ⚠️ Some issues / ❌ Failures]
- **Critical URLs**: 
  - Admin: http://localhost:3000/customer/CUST_4?token=admin-demo-token-2025
  - Test: http://localhost:3000/test

## 🔧 **Technical Status**
- **Components Built**: [Number] components
- **Services**: [List key services]
- **Database**: [Airtable integration status]
- **Documentation**: [Current doc completeness]

## 🎯 **Recommended Next Actions**
1. [Priority 1 task]
2. [Priority 2 task]
3. [Priority 3 task]

## ⚠️ **Known Issues**
- [Any blockers or issues to address]

## 📋 **Quick Verification Commands**
- `npm start` - Start development server
- `npm run build` - Verify build
- `git status` - Check repository status
```

## 🎯 **IMPLEMENTATION STRATEGY**

### **For You (User):**
Before ending any session, simply ask:
> "Before I restart you, please run the pre-restart protocol to ensure session continuity."

### **For Claude (Me):**
At the start of any new session, I should:
1. Automatically detect if I'm in a project directory
2. Look for key documentation files (CLAUDE.md, PROJECT_STATUS.md)
3. If found, immediately read them and generate a status report
4. Present the status report to you for confirmation before proceeding

### **Magic Phrase for Context Loading:**
If I don't automatically detect the project, you can say:
> "Load project context from documentation files"

And I'll immediately read all documentation and provide the status report.

## 🔍 **CONTEXT DETECTION INDICATORS**

### **I should automatically load context if I detect:**
- `CLAUDE.md` file in working directory
- `PROJECT_STATUS.md` file in working directory  
- `package.json` with specific project identifiers
- Git repository with recognizable commit patterns
- React project structure with our specific components

### **Status Report Triggers:**
- First message in a new session
- User asks "What's our current status?"
- User asks "Where are we in the project?"
- User mentions restarting or continuing work
- I detect significant documentation files

## 🎯 **PROJECT-SPECIFIC IDENTIFIERS**

### **H&S Revenue Intelligence Platform Markers:**
- **Project Name**: "H&S Revenue Intelligence Platform"
- **Key Files**: CLAUDE.md, PROJECT_STATUS.md, STARTUP_VERIFICATION.md
- **Repository**: https://github.com/geter-andru/hs-andru-v1.git
- **Key Directories**: `/src/components/`, `/src/services/`
- **Airtable Base**: `app0jJkgTCqn46vp9`

### **Auto-Load Triggers:**
If I detect these elements, I should automatically:
1. Read all documentation files
2. Generate comprehensive status report
3. Present next recommended actions
4. Ask for confirmation to proceed

## 🔄 **CONTINUOUS IMPROVEMENT**

### **After Each Session:**
- Review what worked well in continuity
- Update this protocol if gaps are identified
- Ensure documentation standards are maintained
- Verify all critical information is preserved

### **Protocol Evolution:**
This document should be updated whenever we discover better practices for session continuity or identify gaps in the process.

---

**🎯 Goal: Zero context loss between sessions, immediate productivity restoration**