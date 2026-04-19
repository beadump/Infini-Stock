# Infini-Stock Complete System Flow with RBAC

## 1. System Entry Point

### Authentication Phase
```
User URL Access → Login Page
                    ↓
        Enter Credentials (Email/Password)
                    ↓
        Backend Validation (Express.js)
                    ↓
        Check credentials against DB (Bcrypt verification)
                    ↓
        ✅ Valid → Generate JWT Token + Store in localStorage
        ❌ Invalid → Show Error & Redirect to Login
                    ↓
        Store Token: localStorage.authToken
        Store User: localStorage.user (includes role)
                    ↓
        Redirect to Dashboard
```

### Role Detection
```
localStorage.user = {
    id: "user-id",
    email: "user@example.com",
    role: "admin" | "manager" | "technician" | "staff" | "viewer",
    profile: {
        firstName: "John",
        lastName: "Doe"
    }
}
```

---

## 2. ADMIN Role Complete Flow

### 2.1 Authentication & Access
```
Admin Login
    ↓
JWT Token Generated (valid for 24 hours)
    ↓
Role: "admin" stored in localStorage
    ↓
Token used in ALL API requests: Authorization: Bearer {token}
    ↓
Backend Middleware Verification:
    - requireAuth: Validates JWT is present & not expired
    - requirePermission('asset:create'): Checks PERMISSIONS matrix
    ↓
Permissions Check Handler (backend/src/middleware/auth.js):
    User.role ("admin") → roles.js PERMISSIONS
    Check if "admin" in permissions['asset:create']
    ✅ Yes → Continue to controller
    ❌ No → Return 403 Forbidden
```

### 2.2 Admin Permission Matrix
```
PERMISSIONS FOR ADMIN:
├── Dashboard
│   ├── dashboard:view ✅
│   └── dashboard:edit ✅
├── Asset Management
│   ├── asset:create ✅
│   ├── asset:read ✅
│   ├── asset:update ✅
│   ├── asset:delete ✅
│   └── asset:scan ✅
├── Monitors
│   ├── monitor:create ✅
│   ├── monitor:read ✅
│   ├── monitor:update ✅
│   └── monitor:delete ✅
├── System Units
│   ├── unit:create ✅
│   ├── unit:read ✅
│   ├── unit:update ✅
│   └── unit:delete ✅
├── User Management
│   ├── user:create ✅
│   ├── user:read ✅
│   ├── user:update ✅
│   ├── user:delete ✅
│   └── user:assign_role ✅
├── QR Operations
│   ├── qr:generate ✅
│   └── qr:view ✅
├── Activity & Reports
│   ├── activity:view ✅
│   ├── activity:export ✅
│   └── report:view ✅
└── Account Management
    └── account:manage ✅
```

### 2.3 Admin UI Navigation
```
Sidebar Navigation (FULLY VISIBLE):
├── Dashboard
│   └── Overview [shows all graphs & activity]
├── Device Management
│   ├── Monitors [full CRUD]
│   └── System Units [full CRUD]
├── Account Management
│   ├── Activity Logs [fully accessible]
│   ├── Manage Users [fully accessible]
│   └── Account Settings
└── Help & Support
    └── Documentation
```

### 2.4 Admin Dashboard View
```
Dashboard Screen:
┌─────────────────────────────────────────┐
│ TOTAL ASSETS  │  ACTIVE  │  IN REPAIR  │
│      150      │    120   │      15     │
├─────────────────────────────────────────┤
│  Activity Graph ✅ VISIBLE              │
│  [Area chart showing last 30 days]      │
├─────────────────────────────────────────┤
│  Recent Activity ✅ VISIBLE             │
│  [All user actions + timestamps]        │
├─────────────────────────────────────────┤
│  Status Distribution                    │
│  [Pie chart: Active/Repair/Broken]      │
├─────────────────────────────────────────┤
│  Top Locations (by asset count)         │
│  [Bar chart: Building A, B, C...]       │
└─────────────────────────────────────────┘

NO RESTRICTIONS - ALL BUTTONS ENABLED:
├── ➕ Add Monitor Button [ENABLED]
├── ➕ Add Unit Button [ENABLED]
├── 👥 Manage Users Button [ENABLED]
└── 🔔 All Dropdowns [Full edit/delete options]
```

### 2.5 Admin API Endpoints Access (Full)
```
GET  /api/assets           → ✅ Fetch all assets
GET  /api/assets/:id       → ✅ Get single asset
POST /api/assets           → ✅ Create new asset
PATCH /api/assets/:id      → ✅ Update asset
DELETE /api/assets/:id     → ✅ Delete asset
POST /api/assets/scan      → ✅ Scan QR code

GET  /api/monitors         → ✅ Fetch all monitors
POST /api/monitors         → ✅ Create monitor
PATCH /api/monitors/:id    → ✅ Update monitor
DELETE /api/monitors/:id   → ✅ Delete monitor

GET  /api/units            → ✅ Fetch all units
POST /api/units            → ✅ Create unit
PATCH /api/units/:id       → ✅ Update unit
DELETE /api/units/:id      → ✅ Delete unit

GET  /api/admins/users     → ✅ Get all users
POST /api/admins/users     → ✅ Create user
PATCH /api/admins/users/:id → ✅ Update any user
DELETE /api/admins/users/:id → ✅ Delete user
PATCH /api/admins/users/:id/role → ✅ Assign role

GET  /api/logs             → ✅ Get activity logs
POST /api/logs/export      → ✅ Export logs
```

---

## 3. MANAGER Role Complete Flow

### 3.1 Authentication & Access
```
Manager Login
    ↓
JWT Token Generated
    ↓
Role: "manager" stored in localStorage
    ↓
Backend Middleware checks PERMISSIONS:
    On each API call → Check if "manager" in permission array
    
Example: Creating Asset
    POST /api/assets [header: Authorization: Bearer token]
        ↓
    Middleware: requirePermission('asset:create')
        ↓
    Check: 'asset:create': ['admin', 'manager'] ✅
    ✅ Allowed → Creator ID stored as manager's ID
```

### 3.2 Manager Permission Matrix (RESTRICTED)
```
PERMISSIONS FOR MANAGER:
├── Dashboard
│   ├── dashboard:view ✅
│   └── dashboard:edit ❌
├── Asset Management
│   ├── asset:create ✅
│   ├── asset:read ✅
│   ├── asset:update ✅
│   ├── asset:delete ❌ [BLOCKED - Only Admin can delete]
│   └── asset:scan ✅
├── Monitors & Units
│   ├── monitor:create ✅
│   ├── monitor:read ✅
│   ├── monitor:update ✅
│   ├── monitor:delete ❌
│   ├── unit:create ✅
│   ├── unit:read ✅
│   ├── unit:update ✅
│   └── unit:delete ❌
├── User Management (RESTRICTED)
│   ├── user:create ✅ [Staff & Technician ONLY]
│   ├── user:read ✅ [Staff & Technician ONLY]
│   ├── user:update ✅ [Staff & Technician ONLY]
│   ├── user:delete ❌
│   └── user:assign_role ❌ [Cannot assign Admin role]
├── Activity & Reports
│   ├── activity:view ❌
│   ├── activity:export ❌
│   └── report:view ❌
└── Account Management
    └── account:manage ❌
```

### 3.3 Manager Backend Restrictions
```
When Manager creates a User:
User.create(
    {
        email: "staff@example.com",
        role: "staff", // ✅ Allowed
        createdBy: manager.id
    }
)

If Manager tries to create Admin:
    → Backend validation fails
    → Returns 403: "Cannot assign admin role"

User.create(
    {
        email: "admin@example.com",
        role: "admin", // ❌ REJECTED
        createdBy: manager.id
    }
)

When Manager deletes a User:
    → Request hits DELETE /api/admins/users/:id
    → Middleware checks: 'user:delete' in manager permissions
    → ['admin'] only → ❌ FORBIDDEN
    → Return 403: "Missing permission 'user:delete'"
```

### 3.4 Manager UI Navigation
```
Sidebar Navigation (RESTRICTED):
├── Dashboard ✅
│   └── Overview [Activity & Recent Activity VISIBLE]
├── Device Management ✅
│   ├── Monitors [Add/Edit enabled, Delete disabled]
│   └── System Units [Add/Edit enabled, Delete disabled]
├── Account Management (PARTIALLY VISIBLE)
│   ├── Activity Logs ❌ [HIDDEN]
│   ├── Manage Users ✅ [Only Staff/Technician shown]
│   └── Account Settings ✅
└── Help & Support ✅
    └── Documentation
```

### 3.5 Manager Dashboard View
```
Dashboard Screen:
┌─────────────────────────────────────────┐
│ TOTAL ASSETS  │  ACTIVE  │  IN REPAIR  │
│      100      │    85    │      10     │
├─────────────────────────────────────────┤
│  Activity Graph ✅ VISIBLE              │
│  [Shows manager-created assets only]    │
├─────────────────────────────────────────┤
│  Recent Activity ✅ VISIBLE             │
│  [Shows manager's asset changes]        │
├─────────────────────────────────────────┤
│  Status Distribution & Location Maps    │
│  [Limited to manager's creations]       │
└─────────────────────────────────────────┘

RESTRICTED BUTTONS:
├── ➕ Add Monitor Button [ENABLED]
├── ➕ Add Unit Button [ENABLED]
├── 🗑️ Delete Buttons [DISABLED]
├── 👥 Manage Users [ONLY Staff/Tech visible]
└── 📋 Bulk Delete [DISABLED]

UI INDICATOR:
🎯 Purple Badge: "Manager Mode: Manage Staff & Technician"
   [Only on Users page]
```

### 3.6 Manager API Endpoints (Limited)
```
GET  /api/assets           → ✅ All assets
POST /api/assets           → ✅ Create (stored with managerId)
PATCH /api/assets/:id      → ✅ Update
DELETE /api/assets/:id     → ❌ FORBIDDEN

POST /api/admins/users     → ✅ Create Staff/Tech user
    (Backend validates role !== "admin")
PATCH /api/admins/users/:id → ✅ Update Staff/Tech user
DELETE /api/admins/users/:id → ❌ FORBIDDEN

GET  /api/logs             → ❌ FORBIDDEN
POST /api/logs/export      → ❌ FORBIDDEN
```

---

## 4. TECHNICIAN Role Complete Flow

### 4.1 Authentication & Access
```
Technician Login
    ↓
JWT Token Generated
    ↓
Role: "technician" stored in localStorage
    ↓
API calls with permission checks:
    asset:scan ✅    [Can scan QR codes]
    asset:update ✅  [Can edit assets]
    asset:create ❌  [Cannot add new assets]
    asset:delete ❌  [Cannot delete]
```

### 4.2 Technician Permission Matrix
```
PERMISSIONS FOR TECHNICIAN:
├── Dashboard
│   ├── dashboard:view ✅
│   └── dashboard:edit ❌
├── Asset Management
│   ├── asset:create ❌
│   ├── asset:read ✅
│   ├── asset:update ✅
│   ├── asset:delete ❌
│   ├── asset:scan ✅
│   ├── asset:move ✅
│   └── asset:swap ✅ [Critical operation - swap equipment]
├── Monitors & Units
│   ├── monitor:create ❌
│   ├── monitor:read ✅
│   ├── monitor:update ✅
│   ├── monitor:delete ❌
│   └── [Same for units]
├── User Management
│   ├── user:* ❌ [All blocked]
├── Activity & Reports
│   ├── activity:view ❌
│   └── report:view ❌
└── QR Operations
    ├── qr:generate ❌
    └── qr:view ✅
```

### 4.3 Technician UI Navigation
```
Sidebar Navigation (RESTRICTED):
├── Dashboard ✅ [Limited features]
├── Device Management ✅
│   ├── Monitors [Edit & Scan ONLY]
│   └── System Units [Edit & Scan ONLY]
├── Account Management ❌ [HIDDEN]
└── Help & Support ✅

RESTRICTED BUTTONS ON MONITORS/UNITS:
├── ➕ Add Button [DISABLED]
├── ✏️ Edit Button [ENABLED]
├── 🗑️ Delete Button [DISABLED/HIDDEN]
├── 📱 Scan QR Button [ENABLED]
└── 🔄 Swap Equipment [ENABLED]

UI INDICATOR:
🎯 Amber Banner: "Technician Mode: Edit & Scan"
   [On Monitors & Units pages]
```

### 4.4 Technician Dashboard View
```
Dashboard Screen (Full view):
┌─────────────────────────────────────────┐
│ TOTAL ASSETS  │  ACTIVE  │  IN REPAIR  │
│      150      │    120   │      15     │
├─────────────────────────────────────────┤
│  Activity Graph ✅ VISIBLE              │
├─────────────────────────────────────────┤
│  Recent Activity ✅ VISIBLE             │
│  [Shows all user actions]               │
├─────────────────────────────────────────┤
│  Status & Location graphs               │
└─────────────────────────────────────────┘

KEY OPERATIONS:
1. Scan Asset → View Details (no edit from modal)
2. Edit Asset → Status change, maintenance notes
3. Swap Equipment → Move monitor between locations
4. Cannot → Create new assets or delete anything
```

### 4.5 Technician Workflow Example
```
Typical Day for Technician:

Morning:
    1. Login → See Dashboard
    2. Scan QR code on broken monitor
    3. View Details → Status: "Active"
    4. Click Edit → Change Status to "Maintenance"
    5. Add Note: "Keyboard not working"
    6. Save → Asset updated

Afternoon:
    1. Fixed monitor → Scan QR again
    2. Edit → Change Status back to "Active"
    3. Swap Monitor with another location
    4. All operations logged in Activity

Cannot Do (all rejected):
    ❌ Add new monitor
    ❌ Delete broken monitor
    ❌ View activity logs
    ❌ Manage users
    ❌ Export reports
```

---

## 5. STAFF Role Complete Flow

### 5.1 Authentication & Access
```
Staff Login
    ↓
JWT Token Generated
    ↓
Role: "staff" stored in localStorage
    ↓
All API requests include permission check:
    Most operations return permission denied
    Except: asset:read, asset:scan (view only)
```

### 5.2 Staff Permission Matrix (HEAVILY RESTRICTED)
```
PERMISSIONS FOR STAFF:
├── Dashboard
│   ├── dashboard:view ✅ [Limited view]
│   └── dashboard:edit ❌
├── Asset Management
│   ├── asset:create ❌
│   ├── asset:read ✅ [View only]
│   ├── asset:update ❌
│   ├── asset:delete ❌
│   └── asset:scan ✅ [View details]
├── Monitors & Units
│   ├── All CRUD ❌ [View only]
├── User Management
│   ├── All ❌ [Blocked]
├── Activity & Reports
│   ├── activity:view ❌
│   └── report:view ❌
└── Account Management
    └── ❌ [All hidden]
```

### 5.3 Staff UI Navigation (Minimal)
```
Sidebar Navigation (HEAVILY RESTRICTED):
├── Dashboard ✅ [Limited data only]
├── Device Management ✅
│   ├── Monitors [Read-only view]
│   └── System Units [Read-only view]
├── Account Management ❌ [COMPLETELY HIDDEN]
└── Help & Support ✅

DISABLED BUTTONS EVERYWHERE:
├── ➕ Add Button [DISABLED]
├── ✏️ Edit Button [DISABLED]
├── 🗑️ Delete Button [HIDDEN]
└── All dropdowns [No edit/delete options]

UI INDICATOR (on all pages):
🔵 Blue Banner: "Read-Only Mode - View Permissions Only"
```

### 5.4 Staff Dashboard (Optimized View)
```
Dashboard Screen (LIMITED):
┌─────────────────────────────────────────┐
│ TOTAL ASSETS │  ACTIVE  │  IN REPAIR   │
│      150     │    120   │      15      │
├─────────────────────────────────────────┤
│  Activity Graph ❌ HIDDEN               │
├─────────────────────────────────────────┤
│  Recent Activity ❌ HIDDEN              │
├─────────────────────────────────────────┤
│  Status Distribution ✅ VISIBLE         │
│  [Pie: Active/Repair/Broken]           │
├─────────────────────────────────────────┤
│  Top Locations ✅ VISIBLE               │
│  [Bar: Location count]                 │
└─────────────────────────────────────────┘

LAYOUT OPTIMIZATION:
2-column grid instead of 3:
├── Status chart (left)
└── Location chart (right)

No Activity tracking, No trends
```

### 5.5 Staff Capabilities
```
What Staff CAN do:
✅ View all assets
✅ Scan QR codes to see device details
✅ View device location
✅ View device status
✅ See charts & statistics
✅ Access dashboard overview

What Staff CANNOT do:
❌ Add/Edit/Delete assets
❌ Change device status
❌ Add maintenance notes
❌ Manage users
❌ View activity logs
❌ Export reports
❌ Swap equipment
❌ View sensitive data
```

---

## 6. VIEWER Role Complete Flow

### 6.1 Authentication & Access
```
Viewer Login
    ↓
JWT Token Generated
    ↓
Role: "viewer" stored in localStorage
    ↓
Identical to STAFF permissioning
    (Audit-level read-only access)
```

### 6.2 Viewer Permission Matrix (IDENTICAL TO STAFF)
```
Permissions are same as staff, intended for:
- Auditors
- External stakeholders
- Compliance monitoring
- Historical data review
```

### 6.3 Viewer UI & Dashboard
```
Same as STAFF:
- Limited dashboard view
- All CRUD buttons disabled
- Blue banner: "Read-Only Mode"
- Cannot access Account Management
- Can scan QR & view details

Difference (Context): 
Staff = Operational team member
Viewer = Audit/Monitor role
```

---

## 7. Permission Checking Flow (Backend)

### 7.1 Middleware Stack
```
Request comes in:
    ↓
1️⃣ CORS Middleware
    Check origin allowed
    ↓
2️⃣ requireAuth Middleware
    Get Authorization header
    Verify JWT token
    Decode token → Extract user.id, user.role
    If invalid → Return 401 Unauthorized
    ↓
3️⃣ requirePermission('permission:key') Middleware
    Get user.role from decoded token
    Look up in roles.js PERMISSIONS
    Check: Does user.role exist in permissions array?
    
    Example:
    PERMISSIONS['asset:create'] = ['admin', 'manager']
    User role = 'staff'
    'staff' IN ['admin', 'manager']? NO
    → Return 403 Forbidden
    
    User role = 'admin'
    'admin' IN ['admin', 'manager']? YES
    → Continue to controller
    ↓
4️⃣ Controller Logic
    Execute actual operation
    (Check specific rules if needed)
    Return response
```

### 7.2 Permission Checking Example
```
POST /api/admins/users (Create User)

Route Definition:
router.post(
    '/admins/users',
    requireAuth,                    // Step 1: Check JWT
    requirePermission('user:create'), // Step 2: Check permission
    adminController.createUser      // Step 3: Run actual logic
)

Request from Manager:
    Header: Authorization: Bearer {manager-token}
    Body: { email: "newuser@example.com", role: "staff" }
    
    Step 1: requireAuth
        ✅ Token valid, user.role = "manager"
    
    Step 2: requirePermission('user:create')
        Check: PERMISSIONS['user:create'] = ['admin', 'manager']
        'manager' IN ['admin', 'manager']? YES ✅
    
    Step 3: adminController.createUser
        Run backend logic
        Check if manager creates admin role
        NO EXTRA CHECK NEEDED
        → User created, 200 OK
        
        But if tries to create admin:
        Email: "admin@example.com", Role: "admin"
        Backend validation: (in controller)
            User.role == "admin" && is NOT admin user
            → Throw error
            → Return 403: "Cannot assign admin role"

Request from Technician:
    Header: Authorization: Bearer {tech-token}
    Body: { email: "newuser@example.com", role: "staff" }
    
    Step 1: requireAuth
        ✅ Token valid, user.role = "technician"
    
    Step 2: requirePermission('user:create')
        Check: PERMISSIONS['user:create'] = ['admin', 'manager']
        'technician' IN ['admin', 'manager']? NO ❌
        → Return 403 Forbidden: "Missing permission 'user:create'"
        → STOP - Never reaches controller
```

---

## 8. Frontend Permission Hooks

### 8.1 Permission Utility Functions (lib/permissions.js)
```javascript
// Check if user can edit data
canEditData() → 
    return !viewOnly // false if staff/viewer

// Check if user is in view-only mode  
isViewOnly() →
    return role === 'staff' || role === 'viewer'

// Check if technician with limited operations
isTechnicianLimitedOps() →
    return role === 'technician'

// Get technician display
getTechnicianOperations() →
    return {
        canAdd: false,
        canEdit: true,
        canDelete: false,
        display: 'Edit & Scan'
    }

// Check if manager
isManager() →
    return role === 'manager'

// Get manager display
getManagerOperations() →
    return {
        canAdd: true,
        canEdit: true,
        canDelete: true,
        display: 'Manage Staff & Technician'
    }

// Get user role
getUserRole() →
    return localStorage.user.role
```

### 8.2 Conditional Rendering Examples
```jsx
// Technician page with limited buttons
{canEdit && !isTechnicianLimited && (
    <button>➕ Add Monitor</button>
)}

// Delete option in dropdown (hidden for Tech/Staff)
{canEdit && !isTechnicianLimited && (
    <DropdownOption>🗑️ Delete</DropdownOption>
)}

// Read-only banner
{viewOnly && (
    <Banner>🔵 Read-Only Mode - View Permissions Only</Banner>
)}

// Technician banner
{isTechnicianLimited && (
    <Banner>🎯 Technician Mode: Edit & Scan</Banner>
)}

// Manager badge (Users page only)
{isManager && isUsersPage && (
    <Badge>👔 Manager Mode: Manage Staff & Technician</Badge>
)}

// Staff/Viewer dashboard optimization
{!viewOnly ? (
    <>
        <ActivityCard /> {/* Full activity */}
    </>
) : (
    <></> {/* Hidden for staff/viewer */}
)}

// Grid layout optimization
<div className={`grid lg:grid-cols-3 ${!viewOnly ? 'lg:col-start-3' : ''}`}>
```

---

## 9. Database Operations with Role Enforcement

### 9.1 Asset Create Flow (with role-based ownership)
```
Admin creates asset:
    Asset {
        name: "Monitor XYZ",
        type: "monitor",
        createdBy: admin.id,
        location: "Building A",
        status: "active"
    }
    → Stored in DB with admin creator

Manager creates asset:
    Asset {
        name: "Monitor ABC",
        type: "monitor",
        createdBy: manager.id,
        location: "Building B",
        status: "active"
    }
    → Stored in DB with manager creator
    → Manager can edit/update later

Technician tries to create:
    → Permission denied at middleware
    → Never reaches DB

Query to fetch user's created assets:
    Admin: SELECT * FROM assets
    Manager: SELECT * FROM assets WHERE createdBy = manager.id
```

### 9.2 User Creation with Role Validation
```
Admin creates user with ANY role:
    User {
        email: "user@example.com",
        role: "admin", // ✅ Allowed
        createdBy: admin.id
    }

Manager creates user with staff/tech role:
    User {
        email: "staff@example.com",
        role: "staff", // ✅ Allowed
        createdBy: manager.id
    }
    
Backend validation (in controller):
    if (requestingUser.role === 'manager' && newUserRole === 'admin') {
        throw new Error("Cannot assign admin role")
    }

Manager tries admin role:
    → Backend rejects
    → Returns 403

Technician tries any user creation:
    → Permission denied at middleware
    → Never reaches controller
```

---

## 10. Complete Request-Response Cycle

### Example: Admin Creating a New Monitor

```
1. FRONTEND
   User clicks "Add Monitor" button
       ↓
   Opens AddMonitorModal
   Fills form: name, status, location, QR code
   Clicks "Save"
       ↓
   Frontend sends request:
   POST /api/monitors
   Headers: { Authorization: "Bearer {jwt-token}" }
   Body: { 
       deviceName: "Monitor-001",
       status: "active",
       location: "Building A",
       qrCode: "MON-1234-5678"
   }

2. BACKEND - CORS Layer
   Check if request origin is whitelisted
   ✅ Allowed → Continue

3. BACKEND - Auth Middleware (requireAuth)
   Extract JWT from headers
   Verify signature & expiration
   Decode token:
   {
       userId: "admin-id",
       role: "admin",
       iat: 1234567890
   }
   ✅ Valid → Continue

4. BACKEND - Permission Middleware (requirePermission)
   Check permission: 'monitor:create'
   PERMISSIONS['monitor:create'] = ['admin', 'manager']
   Incoming user role = 'admin'
   'admin' IN ['admin', 'manager']? ✅ YES
   → Continue to controller

5. BACKEND - Controller (monitorsController.createMonitor)
   Receive request data
   Validate required fields
   Check no duplicates (QR code not in use)
   Create new Monitor:
   Monitor {
       id: "generated-uuid",
       deviceName: "Monitor-001",
       status: "active",
       location: "Building A",
       qrCode: "MON-1234-5678",
       createdBy: "admin-id",
       createdAt: timestamp,
       updatedAt: timestamp
   }
   Save to database (TypeORM)
   ✅ Success
   Return response with created monitor

6. FRONTEND - Handle Response
   Status: 200 OK
   Body: { success: true, data: { monitor... } }
   ✅ Show success toast
   ✅ Add monitor to table
   ✅ Close modal
   ✅ Update UI


Example 2: Staff User Trying to Delete Asset
   
1. FRONTEND
   Staff clicks delete button on asset
       ↓
   Frontend would send:
   DELETE /api/assets/asset-id
   Headers: { Authorization: "Bearer {jwt-token-staff}" }

2. BACKEND - Auth Middleware ✅
   Token valid, role = 'staff'

3. BACKEND - Permission Middleware ❌
   Check permission: 'asset:delete'
   PERMISSIONS['asset:delete'] = ['admin'] ONLY
   Incoming user role = 'staff'
   'staff' IN ['admin']? ❌ NO
   → Return 403 Forbidden
   → Response: {
       success: false,
       error: "Forbidden",
       message: "Missing permission 'asset:delete'"
   }

4. FRONTEND - Handle Error
   Status: 403 Forbidden
   ❌ Show error toast: "You don't have permission to delete"
   ❌ Stay on current page
```

---

## 11. Activity Logging with Role Integration

### 11.1 What Gets Logged
```
Every mutation (create/update/delete) creates activity log:

ActivityLog {
    id: uuid,
    userId: "user-who-did-action",
    userRole: "admin|manager|technician|staff|viewer",
    action: "CREATE|UPDATE|DELETE", 
    entityType: "Asset|Monitor|Unit|User",
    entityId: "id-of-changed-entity",
    changes: {
        before: { status: "active" },
        after: { status: "maintenance" }
    },
    timestamp: ISO timestamp,
    ipAddress: client IP
}

Example logs:
├── Admin creates monitor
│   ActivityLog: userId=admin, action=CREATE, entity=Monitor
├── Manager edits asset location
│   ActivityLog: userId=manager, action=UPDATE, entity=Asset
├── Technician changes status
│   ActivityLog: userId=tech, action=UPDATE, entity=Asset
├── Admin deletes user
│   ActivityLog: userId=admin, action=DELETE, entity=User
└── Staff scans asset
    ActivityLog: userId=staff, action=SCAN, entity=Asset
```

### 11.2 Activity Log Access by Role
```
Admin:
    GET /api/logs → ✅ ALL activity from all users
    Filter by: date, user, action, entity type
    Export to CSV/PDF ✅

Manager:
    GET /api/logs → ❌ FORBIDDEN
    Cannot view activity logs

Technician:
    GET /api/logs → ❌ FORBIDDEN
    Cannot view activity logs

Staff:
    GET /api/logs → ❌ FORBIDDEN
    Cannot view activity logs

Viewer:
    GET /api/logs → ❌ FORBIDDEN
    Cannot view activity logs
    (Even though role suggests audit access)
```

---

## 12. QR Code Scanning Flow with Roles

### 12.1 Scan and View Details
```
User clicks QR scan button (FAB in corner)
    ↓
ScanQrFab component opens
    ↓
User chooses: Camera → Scan | Upload → Image
    
Selection 1 - Camera Scan:
    Browser asks: "Allow camera access?"
    User grants permission
    Camera stream starts
    Point at QR code
    Browser reads: "MON-1234-5678"
    
    Scanned. Now fetch details:
    POST /api/assets/scan
    Body: { qrCode: "MON-1234-5678" }
    
Selection 2 - Upload Image:
    User picks image file
    Browser reads QR from image
    Send to same endpoint

Backend handles scan (requireAuth, requirePermission):
    ✅ Admin: Can scan
    ✅ Manager: Can scan
    ✅ Technician: Can scan
    ✅ Staff: Can scan ← NEW!
    ✅ Viewer: Can scan ← NEW!
    
    (All roles allowed - permission changed to include staff/viewer)
    
Response includes full asset details:
    {
        id: "asset-id",
        type: "monitor",
        deviceName: "Monitor-001",
        status: "active",
        location: "Building A",
        condition: "good",
        history: [...],
        linkedAssets: [...]
    }

Display AssetDetailsModal:
├── Admin: Can edit/delete buttons shown
├── Manager: Can edit button shown
├── Technician: Can edit button shown
├── Staff: View-only, no edit button ← Shows just info
├── Viewer: View-only, no edit button ← Shows just info
```

---

## 13. UI State Summary Table

| Feature | Admin | Manager | Technician | Staff | Viewer |
|---------|-------|---------|------------|-------|--------|
| Dashboard | Full | Full | Full | Limited | Limited |
| Activity Graph | ✅ | ✅ | ✅ | ❌ | ❌ |
| Recent Activity | ✅ | ✅ | ✅ | ❌ | ❌ |
| Add Asset | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Asset | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete Asset | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Users | ✅ | ✅ (limited) | ❌ | ❌ | ❌ |
| View Logs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Scan QR | ✅ | ✅ | ✅ | ✅ | ✅ |
| Account Mgmt | ✅ | ✅ | ❌ | ❌ | ❌ |
| Banner | None | Purple | Amber | Blue | Blue |
| Icon | 🔐 | 👔 | 🔧 | 👤 | 👁️ |

---

## 14. Error Scenarios

### 14.1 Token Expiration
```
Tokens expire after 24 hours

User tries to create asset after 24h:
    POST /api/assets
    Header: { Authorization: "Bearer {expired-token}" }
    
    requireAuth checks: Token.exp < now?
    ✅ Expired detected
    → Return 401 Unauthorized
    → Frontend redirects to login
    → User must login again
```

### 14.2 Invalid Permission
```
Staff user tries to edit asset:
    PATCH /api/assets/asset-id
    
    requireAuth: ✅ Token valid
    requirePermission('asset:update'):
        PERMISSIONS['asset:update'] = ['admin', 'manager', 'technician']
        User role = 'staff'
        NOT found → 403 Forbidden
```

### 14.3 Role Changed While Logged In
```
User is logged in as manager
    → localStorage.user.role = 'manager'

Admin changes user role to 'staff'
    → Database updated

User refreshes page manually:
    → reloads localStorage.user
    → Now role = 'staff'
    → All permissions updated

User doesn't refresh:
    → Still thinks they're manager
    → Makes request with old role
    → Backend validates current role from DB
    → Conflict detected
    → Most requests fail permission check
    → Manual refresh required
```

---

## 15. Quick Reference: What Each Role Can Do

### Core Operations Matrix
```
                  Admin  Manager  Tech  Staff  Viewer
Create Asset       ✅     ✅      ❌     ❌    ❌
Edit Asset         ✅     ✅      ✅     ❌    ❌
Delete Asset       ✅     ❌      ❌     ❌    ❌
Create User        ✅     ✅*     ❌     ❌    ❌
Edit User          ✅     ✅*     ❌     ❌    ❌
Delete User        ✅     ❌      ❌     ❌    ❌
Assign Roles       ✅     ❌      ❌     ❌    ❌
View Activity      ✅     ❌      ❌     ❌    ❌
Export Reports     ✅     ❌      ❌     ❌    ❌
Scan QR Code       ✅     ✅      ✅     ✅    ✅
View Details       ✅     ✅      ✅     ✅    ✅

* Manager can only create/edit staff & technician, not admin
```

---

## 16. Deployment Checklist

- [ ] Verify all role permissions in `roles.js`
- [ ] Check middleware chain in routes
- [ ] Test token expiration
- [ ] Verify CORS origins whitelist
- [ ] Test permission denied responses
- [ ] Verify activity logging for all roles
- [ ] Check UI conditionals for all roles
- [ ] Test role assignment restrictions
- [ ] Verify dashboard optimizations
- [ ] Test QR scanning for all roles
- [ ] Check banner displays
- [ ] Verify button disabling

---

**System Status**: ✅ Complete RBAC implementation with 5 roles, granular permissions, role-aware UI, and comprehensive backend validation.
