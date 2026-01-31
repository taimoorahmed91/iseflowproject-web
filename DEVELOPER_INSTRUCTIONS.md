# ISE Policy Flow Visualizer - Developer Instructions

## Project Overview

Build a web application that visualizes Cisco ISE (Identity Services Engine) network access policies as interactive flowcharts. This is a single-user, view-only application that receives data via API trigger and displays it without any user-initiated data loading or editing.

## Deployment Target

- **Platform:** Vercel
- **Framework:** Next.js with TypeScript
- **User Base:** Single user (desktop only)
- **Theme:** Dark mode

## Core Concept

The application has three distinct states:

1. **IDLE** - Waiting for data to be pushed
2. **LOADING** - Fetching and processing data from GitHub
3. **DISPLAYING** - Showing interactive flowcharts

The user NEVER manually loads data. A Python script triggers data loading via API call.

---

## Application Flow

### Initial State (IDLE)

**What the user sees:**
- Dark background
- Centered text: "Ask Taimoor to push data"
- No buttons, no inputs, no controls
- Clean, minimal interface

**What's happening:**
- App is connected to a real-time update mechanism (SSE or WebSocket)
- Waiting for API call from external script

### Triggered State (LOADING)

**What triggers this:**
- Python script makes POST request to `/api/load` endpoint
- API authenticated via HTTP Basic Auth

**What the user sees:**
- Message changes to: "New request received"
- Loading spinner appears
- Optional: Progress indicator showing download status

**What's happening:**
- API validates the incoming GitHub URL
- Frontend receives notification to start loading
- Data is fetched from GitHub raw URL
- JSON is parsed and validated

### Display State (DISPLAYING)

**What the user sees:**
- List of policy sets with details
- Interactive buttons to view flowcharts
- Flowchart visualization when selected
- Detail panels when nodes are clicked

**What's happening:**
- Data is held in memory (not persisted)
- User can navigate between different views
- Stays in this state until next API call

---

## Technical Requirements

### Technology Stack

**Required:**
- Next.js 14+ (App Router)
- TypeScript
- React Flow (https://reactflow.dev/) - for flowchart visualization
- Tailwind CSS for styling
- Server-Sent Events (SSE) or WebSockets for real-time updates

**Recommended:**
- Zustand or React Context for state management
- Lucide React for icons
- Radix UI for accessible components (sidebar, modals)

### API Specification

**Endpoint:** `POST /api/load`

**Authentication:** HTTP Basic Auth
- Username: `taimoor`
- Password: (will be provided separately)

**Request Body:**
```json
{
  "dataUrl": "https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/{COMMIT_HASH}/configs/processed_data.json"
}
```

**Success Response (200):**
```json
{
  "status": "loading",
  "message": "Data fetch initiated"
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Invalid URL format"
}
```

**Error Response (401):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Validation Rules:**
- URL must start with `https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/`
- URL must end with `/configs/processed_data.json`
- URL must be properly formatted

See `API_SPEC.md` for complete details.

### Real-Time Updates

**Requirement:**
When the API is called, ALL open browser windows must immediately see the "New request received" message and load the new data.

**Implementation Options:**

**Option A: Server-Sent Events (SSE) - RECOMMENDED**
- Client connects to `/api/events` on page load
- When `/api/load` is called, broadcast event to all connected clients
- Clients receive event and trigger data fetch
- Simpler than WebSockets, one-way communication is sufficient

**Option B: WebSockets**
- More complex but fully bidirectional
- Use if you need two-way communication later

**Why real-time matters:**
The user may have the app open while the Python script pushes new data. They should see the update without manual refresh.

---

## User Interface Requirements

### Layout: Idle State

```
┌────────────────────────────────────────────┐
│                                            │
│                                            │
│                                            │
│         Ask Taimoor to push data          │
│                                            │
│                                            │
│                                            │
└────────────────────────────────────────────┘
```

- Dark background (#0f172a or similar)
- Text centered vertically and horizontally
- Text color: muted gray (#94a3b8)
- Font size: Large (24px or 1.5rem)
- No other UI elements

### Layout: Loading State

```
┌────────────────────────────────────────────┐
│                                            │
│                                            │
│        New request received                │
│                                            │
│              ⟳ Loading...                  │
│                                            │
│    Fetching data from GitHub...           │
│                                            │
└────────────────────────────────────────────┘
```

- Same dark background
- Animated spinner
- Status text below spinner
- Optional: Progress bar if fetch can be tracked

### Layout: Policy Set List

```
┌────────────────────────────────────────────┐
│  ISE Policy Visualizer                     │
├────────────────────────────────────────────┤
│                                            │
│  PolicySet2 (Rank: 0) [ENABLED]           │
│  Condition: Wireless_802.1X                │
│  [View Auth Flow] [View Authz Flow]       │
│                                            │
│  PolicySet1 (Rank: 1) [ENABLED]           │
│  Condition: Wireless_802.1X                │
│  [View Auth Flow] [View Authz Flow]       │
│                                            │
│  Default (Rank: 2) [ENABLED]              │
│  Condition: (always matches)               │
│  [View Auth Flow] [View Authz Flow]       │
│                                            │
└────────────────────────────────────────────┘
```

**Requirements:**
- List sorted by rank (ascending)
- Show policy set name, rank, state
- Show brief condition summary
- Two buttons per policy set
- Visual distinction for default policy sets
- Disabled policies shown with reduced opacity

### Layout: Flowchart View

```
┌────────────────────────────────────────────┐
│  ← Back to Policy Sets          [Zoom] [-][+] │
├────────────────────────────────────────────┤
│                                            │
│        [Flowchart Canvas]                  │
│     (React Flow component)                 │
│                                            │
│                                            │
└────────────────────────────────────────────┘
```

**Requirements:**
- Full-screen flowchart
- Back button to return to list
- Zoom controls (+/- buttons)
- Pan by dragging background
- Minimap in bottom-right corner
- Dark theme compatible

---

## Flowchart Visualization

### Layout Algorithm: "Diagonal Pattern"

**Concept:**
Policies flow diagonally rather than straight down. This creates a more compact, readable layout.

**Pattern:**
```
┌──────────────┐
│  Policy 1    │──Yes──→ [Result 1]
└──────┬───────┘
       │ No
       ↓
┌──────────────┐
│  Policy 2    │──Yes──→ [Result 2]
└──────┬───────┘
       │ No
       ↓
┌──────────────┐
│  Default     │────────→ [Result 3]
└──────────────┘
```

**Positioning:**
- Policy decision nodes: Left side (x = 0)
- Result nodes: Right side (x = 400px from policy)
- Vertical spacing: 150px between policies
- "Yes" edges go horizontally right (green)
- "No" edges go vertically down (gray)

**Node Types:**

1. **Policy Decision Node**
   - Shows policy name
   - Shows rank number
   - Shows enabled/disabled badge
   - Shows condition type (simple/AND/OR)
   - Click → show details in sidebar

2. **Result Node**
   - For Authentication: Shows result (Continue/Reject/Drop)
   - For Authorization: Shows profile name(s) and security group
   - Click → show full profile details

### Node Styling

**Policy Node (enabled):**
- Background: Dark blue (#1e40af)
- Border: Light blue (#3b82f6)
- Text: White
- Rounded corners
- Shadow on hover

**Policy Node (disabled):**
- Background: Dark gray (#374151)
- Border: Gray (#6b7280)
- Text: Light gray (#9ca3af)
- Reduced opacity (0.6)

**Result Node:**
- Background: Dark green (#166534) for success
- Background: Dark red (#991b1b) for reject/deny
- Background: Dark yellow (#854d0e) for continue
- Border matches background but lighter
- Text: White

**Edges:**
- "Match" / "Yes" path: Green (#22c55e), thickness 2px
- "No Match" / "No" path: Gray (#6b7280), thickness 1px
- Labeled with text on the edge
- Smooth curves, not straight lines

### Interactivity

**Click on Policy Node:**
- Open sidebar on right side
- Show full condition details
- For AND/OR blocks: show nested tree of conditions
- Show all policy metadata

**Click on Result Node:**
- Open sidebar on right side
- For Authorization results:
  - Fetch profile details from `reference_data.authorization_profiles_detail`
  - Show: accessType, daclName, webRedirection, advanced attributes
  - Format JSON nicely with syntax highlighting
- For Authentication results:
  - Show: ifAuthFail, ifUserNotFound, ifProcessFail
  - Show identity source information

**Hover effects:**
- Subtle glow on nodes
- Cursor changes to pointer
- Connected edges highlight

---

## Data Handling

### Loading Process

1. API endpoint receives dataUrl
2. Validate URL format
3. Broadcast to all connected clients via SSE
4. Frontend receives notification
5. Frontend fetches from GitHub URL
6. Parse JSON
7. Validate structure (check for required fields)
8. Store in application state (memory only)
9. Transition to display view

### Validation

**Required fields in JSON:**
- `metadata` object
- `policy_sets` array (must have at least 1 item)
- `reference_data` object

**If validation fails:**
- Show error message: "Invalid data format"
- Log specific validation errors to console
- Return to idle state
- Allow retry when script calls API again

### Error Scenarios

**GitHub URL returns 404:**
```
Error: Failed to load data from GitHub
Details: Commit hash not found or file does not exist

This usually means:
• The commit hash is incorrect
• The file hasn't been pushed yet
• The file path has changed
```

**GitHub URL returns invalid JSON:**
```
Error: Invalid data format
Details: The file exists but does not contain valid JSON

Please check:
• The processed_data.json file is properly formatted
• The processing script completed successfully
```

**Network timeout:**
```
Error: Request timeout
Details: Could not connect to GitHub within 30 seconds

Please try again or check your internet connection
```

---

## Detail Sidebar Component

### Trigger
Opens when user clicks any node in the flowchart

### Layout
```
┌──────────────────────────────┐
│  [X] Close                   │
├──────────────────────────────┤
│                              │
│  Policy Name: MAB            │
│  Rank: 0                     │
│  State: Enabled              │
│                              │
│  Condition:                  │
│  ┌─ OR Block                │
│  │  ├─ Wired_MAB            │
│  │  └─ Wireless_MAB         │
│                              │
│  Identity Source:            │
│  Internal Endpoints          │
│                              │
│  Results:                    │
│  • If Auth Fail: REJECT      │
│  • If User Not Found: CONTINUE│
│  • If Process Fail: DROP     │
│                              │
└──────────────────────────────┘
```

### Content Rules

**For Authentication Policies:**
- Show: name, rank, state, condition
- Show: identitySourceName
- Show: ifAuthFail, ifUserNotFound, ifProcessFail
- Format conditions as nested tree for AND/OR blocks

**For Authorization Policies:**
- Show: name, rank, state, condition
- Show: profile array (clickable to see profile details)
- Show: securityGroup if present
- When profile clicked: fetch from `authorization_profiles_detail`

**For Condition Details:**
```
Simple Condition:
  Dictionary: Normalised Radius
  Attribute: RadiusFlowType
  Operator: equals
  Value: WiredMAB

AND Block:
  ├─ Condition 1 (details...)
  ├─ Condition 2 (details...)
  └─ Condition 3 (details...)

OR Block:
  ├─ Condition A (details...)
  └─ Condition B (details...)
```

---

## Performance Considerations

### Data Size
- JSON file can be 50-200KB
- May contain 10-50 policy sets
- Each policy set may have 1-20 policies
- Optimize rendering for smooth interactions

### React Flow Optimization
- Use React Flow's built-in virtualization
- Don't render off-screen nodes in detail
- Lazy load detail data when sidebar opens
- Debounce zoom/pan events

### Loading States
- Show skeleton loaders while fetching
- Progressive rendering if possible
- Cancel previous fetch if new API call comes

---

## Testing Checklist

Before deployment, verify:

**Basic Functionality:**
- [ ] App shows idle message on first load
- [ ] API call with correct auth triggers loading
- [ ] API call with wrong auth returns 401
- [ ] Valid GitHub URL loads successfully
- [ ] Invalid GitHub URL shows error
- [ ] Malformed JSON shows error

**Real-time Updates:**
- [ ] Opening second browser window shows same state
- [ ] API call updates all open windows simultaneously
- [ ] No manual refresh needed

**Display:**
- [ ] Policy sets display in correct order (by rank)
- [ ] Auth flow button shows authentication flowchart
- [ ] Authz flow button shows authorization flowchart
- [ ] Default policy sets are visually distinct
- [ ] Disabled policies have reduced opacity

**Flowchart:**
- [ ] Nodes positioned in diagonal layout
- [ ] Zoom controls work
- [ ] Pan by dragging works
- [ ] Minimap appears and functions
- [ ] Clicking policy node opens sidebar
- [ ] Clicking result node opens sidebar
- [ ] Sidebar shows correct details
- [ ] Conditions display in readable format
- [ ] AND/OR blocks show nested structure

**Edge Cases:**
- [ ] Very long policy names don't break layout
- [ ] Policy sets with 0 auth policies handled
- [ ] Policy sets with 0 authz policies handled
- [ ] Null conditions display correctly
- [ ] Missing reference data handled gracefully

---

## Security Notes

**Authentication:**
- Use environment variables for Basic Auth credentials
- Never commit credentials to repository
- Rotate password periodically

**URL Validation:**
- Only accept URLs from exact repo: `taimoorahmed91/iseflowproject`
- Reject URLs with unusual characters
- Validate commit hash format (alphanumeric)

**Data Handling:**
- No persistent storage
- Data exists only in browser memory
- Cleared on page refresh
- No localStorage or sessionStorage

---

## Deployment

**Vercel Configuration:**
1. Connect GitHub repository
2. Set environment variables:
   - `BASIC_AUTH_USERNAME=taimoor`
   - `BASIC_AUTH_PASSWORD=[provided separately]`
3. Deploy main branch
4. Custom domain (optional): `ise-visualizer.yourdomain.com`

**Build Settings:**
- Framework: Next.js
- Node version: 18.x or higher
- Build command: `next build`
- Output directory: `.next`

---

## File Structure

```
/app
  /page.tsx                    # Main page (idle/loading/display states)
  /flowchart/[type]/page.tsx   # Flowchart view (auth or authz)
  /api
    /load/route.ts             # API endpoint
    /events/route.ts           # SSE endpoint
/components
  /PolicySetList.tsx           # List of policy sets
  /FlowChart.tsx               # React Flow wrapper
  /DetailSidebar.tsx           # Node details sidebar
  /ConditionRenderer.tsx       # Formats conditions
  /LoadingState.tsx            # Loading UI
  /IdleState.tsx              # Idle UI
/lib
  /dataLoader.ts              # Fetch from GitHub
  /flowchartBuilder.ts        # Convert data to nodes/edges
  /types.ts                   # TypeScript interfaces
  /validators.ts              # URL and data validation
/styles
  /globals.css                # Tailwind + custom dark theme
```

---

## Timeline Estimate

**Phase 1: Basic Setup (Day 1)**
- Next.js project setup
- API endpoint with Basic Auth
- SSE implementation
- Idle/Loading states

**Phase 2: Data Display (Day 2)**
- GitHub data fetching
- JSON parsing and validation
- Policy set list view
- Error handling

**Phase 3: Flowchart (Day 3-4)**
- React Flow integration
- Node/edge generation
- Diagonal layout algorithm
- Basic styling

**Phase 4: Interactivity (Day 5)**
- Click handlers
- Detail sidebar
- Condition formatting
- Profile detail lookups

**Phase 5: Polish (Day 6)**
- Dark theme refinement
- Loading states
- Error messages
- Testing

**Total: ~1 week for experienced Next.js developer**

---

## Questions for Developer

Before starting, please confirm:

1. Which real-time approach will you use (SSE or WebSocket)?
2. State management preference (Context, Zustand, other)?
3. Any concerns about the diagonal layout algorithm?
4. Preferred component library for sidebar/modals?
5. Timeline for completion?

---

## Support

**Data Structure Questions:** See `DATA_STRUCTURE.md`
**API Questions:** See `API_SPEC.md`
**Flowchart Layout Questions:** See `FLOWCHART_LAYOUT.md`

**Contact:**
For questions or clarifications, contact Taimoor.