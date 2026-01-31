# ISE Policy Flow Visualizer

A Next.js web application that visualizes Cisco ISE (Identity Services Engine) network access policies as interactive flowcharts.

## Features

- **Automatic data loading**: Data loads automatically on page load
- **Interactive flowcharts**: Visualize authentication and authorization policy flows
- **Diagonal layout**: Policies flow down the left side, results on the right
- **Detail sidebar**: Click any node to see full policy details
- **Condition rendering**: Beautiful recursive display of AND/OR condition blocks
- **Dark theme**: Desktop-optimized interface

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- React Flow - Interactive flowchart visualization
- Tailwind CSS - Styling
- Lucide React - Icons

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically load the policy data from `public/data/processed_data.json`.

### Updating Data

To update the policy data:

1. Download the latest `processed_data.json` from your ISE processing script
2. Replace `public/data/processed_data.json` with the new file
3. Refresh the browser (Cmd+R or F5)

Or download directly from GitHub:
```bash
curl https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/COMMIT_HASH/configs/processed_data.json \
  -o public/data/processed_data.json
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Usage

### Viewing Policy Sets

When you open the app, you'll see a list of all policy sets with:
- Policy set name and rank
- Enabled/disabled status
- Default policy badge (if applicable)
- Condition summary
- Buttons to view authentication or authorization flows

### Viewing Flowcharts

Click "View Auth Flow" or "View Authz Flow" to see the interactive flowchart:
- **Pan**: Click and drag the background
- **Zoom**: Use mouse wheel or the +/- controls
- **Click nodes**: View detailed information in the sidebar
- **Minimap**: See overview in bottom-right corner

### Policy Details

Click any node in the flowchart to see:
- Full policy information
- Complete condition tree (with AND/OR blocks)
- Authentication results (identity source, fail behaviors)
- Authorization profiles with full configuration
- Web redirection settings
- DACL assignments
- Security group tags

## Project Structure

```
/app
  /flowchart
    /[policySetId]
      /[type]
        page.tsx   # Dynamic flowchart route (auth/authz)
  page.tsx         # Main page (state router)
  layout.tsx       # Root layout with DataProvider
  globals.css      # Global styles

/components
  IdleState.tsx          # Waiting message (if data missing)
  LoadingState.tsx       # Loading spinner
  ErrorState.tsx         # Error display
  PolicySetList.tsx      # List of policy sets
  FlowChart.tsx          # React Flow visualization
  DetailSidebar.tsx      # Node details panel
  ConditionRenderer.tsx  # Recursive condition tree renderer

/lib
  types.ts               # TypeScript type definitions
  DataContext.tsx        # React Context for state management
  flowchartBuilder.ts    # Convert policies to nodes/edges

/public
  /data
    processed_data.json  # ISE policy data (update this file)
```

## Flowchart Layout

### Diagonal Pattern

Policies flow diagonally - decision nodes on the left, results on the right:

```
Policy 1 (x=0, y=0)    ───Match──→  Result 1 (x=400, y=0)
    │
    │ No Match
    ↓
Policy 2 (x=0, y=180)  ───Match──→  Result 2 (x=400, y=180)
    │
    │ No Match
    ↓
Policy 3 (x=0, y=360)  ───Match──→  Result 3 (x=400, y=360)
```

### Color Coding

**Policy Nodes:**
- Blue background: Enabled policies
- Gray background: Disabled policies
- Yellow ring: Default policy

**Result Nodes:**
- Green: Permit/Accept
- Red: Reject/Deny
- Orange: Drop
- Yellow: Continue

**Edges:**
- Green (2px): Match path
- Gray (1px): No match path

## Data Format

The app expects a JSON file with this structure:

```json
{
  "metadata": {
    "generated_at": "2026-01-31T21:58:45Z",
    "total_policy_sets": 3,
    "total_authentication_policies": 5,
    "total_authorization_policies": 14
  },
  "policy_sets": [
    {
      "id": "...",
      "name": "PolicySet1",
      "rank": 0,
      "state": "enabled",
      "condition": { ... },
      "authentication_policies": [ ... ],
      "authorization_policies": [ ... ]
    }
  ],
  "reference_data": {
    "authorization_profiles": { ... },
    "authorization_profiles_detail": { ... }
  }
}
```

See `DATA_STRUCTURE.md` for complete documentation.

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Deploy (no environment variables needed!)
4. Your data is bundled with the app

### Updating Data in Production

**Option 1: Rebuild and redeploy**
1. Update `public/data/processed_data.json`
2. Commit and push to GitHub
3. Vercel auto-deploys

**Option 2: Manual update**
1. Download new `processed_data.json`
2. Upload to Vercel's file system (if supported)
3. Or use a separate data API endpoint

## Browser Compatibility

Tested on:
- Chrome (latest) ✓
- Safari (latest) ✓
- Firefox (latest) ✓
- Edge (latest) ✓

## Performance

- Data loads in <100ms (cached after first load)
- Flowchart renders in ~50ms
- Smooth pan/zoom with 50+ nodes
- Instant node click interactions

## Documentation

- `DEVELOPER_INSTRUCTIONS.md` - Original development guide
- `API_SPEC.md` - API specifications (now deprecated)
- `DATA_STRUCTURE.md` - JSON data format documentation
- `PHASE1_COMPLETE.md` - Phase 1 implementation notes
- `PHASE2_COMPLETE.md` - Phase 2 implementation notes

## License

Private project for Taimoor Ahmed

---

## Changelog

### v2.0.0 - Simplified Architecture
- Removed SSE and API endpoints
- Data now loads directly from `public/data/`
- Simplified state management
- Faster page loads
- No authentication needed

### v1.0.0 - Original Release
- SSE-based real-time updates
- API trigger endpoint
- HTTP Basic Auth
- GitHub URL loading
