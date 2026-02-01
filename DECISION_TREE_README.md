# Decision Tree Analysis - Implementation Guide

## Overview

Your UI has been successfully updated to display decision tree analysis alongside the existing policy sets view. The implementation includes interactive visualizations, detailed path analysis, and comprehensive tree exploration.

## What's New

### 1. **Dual View System**
   - **Policy Sets View**: Original view showing policy sets, authentication/authorization flows
   - **Decision Tree View**: New view with 5 tabs for comprehensive decision tree analysis

### 2. **Decision Tree Components**

#### Summary Tab
- Total rules count
- Endpoint attribute rules vs other rules
- Unique values for rVLAN, NetworkZone, and Tenant attributes
- Visual breakdown with color-coded badges

#### Flowchart Tab
- Interactive Mermaid diagram visualization
- Pan and zoom controls
- Shows all decision paths visually
- Dark-themed flowchart matching your existing UI

#### Paths Tab
- Sortable table of all decision paths
- Search functionality across all fields
- Filter by attribute presence (rVLAN, NetworkZone, Tenant)
- Shows path ID, conditions, rule name, rank, profile, and policy set

#### Tree Structure Tab
- Interactive hierarchical tree explorer
- Expand/collapse nodes
- Visual indicators for root, decision, and leaf nodes
- Click to view detailed rule information at leaf nodes

#### Other Rules Tab
- Expandable list of rules not using endpoint attributes
- Shows rule name, rank, profile, policy set, conditions, and state
- Color-coded by enabled/disabled state

## File Structure

```
components/
├── DecisionTreeView.tsx          # Main container with tabs
├── SummarySection.tsx            # Summary statistics display
├── MermaidFlowchart.tsx          # Interactive flowchart with zoom/pan
├── PathsTable.tsx                # Sortable/filterable paths table
├── TreeStructureExplorer.tsx     # Hierarchical tree explorer
├── OtherRulesSection.tsx         # Non-endpoint-attribute rules
├── IdleState.tsx                 # Updated: Two upload options
├── PolicySetList.tsx             # Existing policy sets view
└── ...

lib/
├── types.ts                      # Updated with decision tree types
└── DataContext.tsx               # Updated to handle both data sources

app/
└── page.tsx                      # Updated with view tabs

public/data/
├── processed_data.json           # Your existing policy data
└── decision_tree.json            # New decision tree data
```

## Data Format

Your `decision_tree.json` should have this structure:

```json
{
  "summary": {
    "total_rules": 10,
    "endpoint_attribute_rules": 7,
    "other_rules": 3,
    "unique_values": {
      "rVLAN": ["VLAN-100", "VLAN-200"],
      "NetworkZone": ["Campus", "Remote"],
      "Tenant": ["Engineering", "Sales"]
    }
  },
  "mermaid_flowchart": "graph TD\n  Start([Start]) --> Decision{Check}\n  ...",
  "tree_structure": {
    "type": "root",
    "children": {
      "rVLAN": {
        "type": "decision",
        "attribute": "rVLAN",
        "children": { ... }
      }
    }
  },
  "paths": [
    {
      "path_id": "path_001",
      "rVLAN": "VLAN-100",
      "NetworkZone": "Campus",
      "Tenant": "Engineering",
      "rule_name": "Engineering_Full_Access",
      "rule_rank": 1,
      "profile": "Engineering_Full",
      "policy_set": "PolicySet1"
    }
  ],
  "other_rules": [
    {
      "rule_name": "Time_Based_Access",
      "rank": 10,
      "profile": "Time_Limited",
      "policy_set": "PolicySet1",
      "conditions": "DEVICE:Location EQUALS Office",
      "state": "enabled"
    }
  ]
}
```

## How to Use

### Loading Data

1. **Start the dev server**: Already running at http://localhost:3000
2. **Initial screen**: You'll see two upload options:
   - **Policy Sets**: Upload `processed_data.json`
   - **Decision Tree**: Upload `decision_tree.json`

### Navigation

#### If Both Files Are Loaded
You'll see a sticky header with two tabs:
- **Policy Sets** button (blue)
- **Decision Tree** button (purple)

Click to switch between views.

#### If Only One File Is Loaded
The appropriate view displays automatically.

### Using the Decision Tree View

1. **Summary Tab**: Get a quick overview of the analysis
   - See total rules and breakdown
   - View all unique attribute values with color-coded badges

2. **Flowchart Tab**: Visualize the decision flow
   - Use zoom controls (top-right)
   - Click and drag to pan around
   - Reset view with the maximize button

3. **Paths Tab**: Explore all possible paths
   - Search across all fields
   - Sort by clicking column headers
   - Filter by attribute presence
   - See detailed conditions and outcomes

4. **Tree Structure Tab**: Interactive exploration
   - Expand/collapse nodes to explore
   - See the full hierarchy
   - View rule details at leaf nodes

5. **Other Rules Tab**: Review non-attribute rules
   - Click to expand rule details
   - See full conditions
   - View enabled/disabled state

## New Dependencies

### Already Installed
- **mermaid** (v11.12.2): For flowchart rendering

No additional installations needed!

## Testing

A sample `decision_tree.json` file has been created at:
```
/public/data/decision_tree.json
```

To test:
1. Go to http://localhost:3000
2. Click "Decision Tree" upload area
3. Select `/public/data/decision_tree.json`
4. Explore all 5 tabs

## Features

### Interactive Elements
- ✅ Sortable table columns
- ✅ Search across all fields
- ✅ Attribute filters
- ✅ Expandable tree nodes
- ✅ Expandable rule details
- ✅ Zoom/pan flowchart
- ✅ Tab navigation

### Responsive Design
- ✅ Mobile-friendly grid layouts
- ✅ Responsive table with horizontal scroll
- ✅ Adaptive tab layout
- ✅ Touch-friendly controls

### Visual Design
- ✅ Consistent with existing dark theme
- ✅ Color-coded attributes (cyan/purple/yellow)
- ✅ State indicators (enabled/disabled)
- ✅ Visual hierarchy with icons
- ✅ Smooth transitions and hover effects

## Integration with Existing UI

The decision tree view is completely integrated with your existing codebase:

1. **Shared Context**: Both views use the same `DataContext`
2. **Consistent Styling**: Uses your existing Tailwind theme and color scheme
3. **Same Components**: Reuses icons from `lucide-react`
4. **Navigation**: Seamless switching between views
5. **File Upload**: Unified upload experience

## Customization

### Changing Colors
Edit the Tailwind classes in each component:
- `bg-blue-600` → Change button colors
- `text-cyan-400` → Change rVLAN color
- `text-purple-400` → Change NetworkZone color
- `text-yellow-400` → Change Tenant color

### Modifying Flowchart Theme
Edit `MermaidFlowchart.tsx`, line 14-27:
```javascript
mermaid.initialize({
  theme: "dark",
  themeVariables: {
    primaryColor: "#3b82f6",  // Change colors here
    // ...
  }
});
```

### Adding More Tabs
1. Add to `tabs` array in `DecisionTreeView.tsx`
2. Create new component for the tab content
3. Add to the switch statement in the render

## Troubleshooting

### Flowchart Not Rendering
- Check that `mermaid_flowchart` string has valid Mermaid syntax
- Test your Mermaid code at https://mermaid.live
- Ensure line breaks use `\n`

### Data Not Loading
- Verify JSON structure matches expected format
- Check browser console for error messages
- Ensure all required fields are present

### Performance Issues
- Large trees (>1000 paths) may be slow
- Consider pagination for the paths table
- Limit auto-expanded tree levels

## Next Steps

1. **Generate Your Real Data**: Create `decision_tree.json` from your ISE policies
2. **Test the Features**: Upload and explore all tabs
3. **Customize**: Adjust colors, labels, or layouts as needed
4. **Extend**: Add more visualization types or analysis features

## Questions?

The implementation follows these patterns:
- React functional components with hooks
- TypeScript for type safety
- Tailwind CSS for styling
- Client-side rendering with "use client"
- Lucide React for icons
- Mermaid.js for flowcharts

All components are modular and can be customized independently!
