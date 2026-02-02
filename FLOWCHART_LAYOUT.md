# Flowchart Layout Guide - ISE Policy Visualizer

## Overview

This document explains how to create the "diagonal layout" flowchart visualization for ISE policies. The goal is to create a compact, readable flowchart where policies flow both downward (on "No" matches) and horizontally (on "Yes" matches).

---

## The Diagonal Pattern Concept

### Problem with Traditional Linear Layout

**Bad (Linear/Vertical Only):**

```
┌─────────────────┐
│   Policy 1      │
│   Condition: X  │
└────────┬────────┘
         │ No
         ↓
┌─────────────────┐
│   Result 1      │  (Only shown if matched, but takes space)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Policy 2      │
│   Condition: Y  │
└────────┬────────┘
         │ No
         ↓
┌─────────────────┐
│   Result 2      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Policy 3      │
│   Condition: Z  │
└─────────────────┘
```

**Problems:**
- Very long vertical flowchart
- Lots of scrolling required
- Wasted horizontal space
- Hard to see the "short circuit" behavior

### Solution: Diagonal Layout

**Good (Diagonal Pattern):**

```
┌─────────────────┐
│   Policy 1      │───Yes──→ [Result 1]
│   Condition: X  │
└────────┬────────┘
         │ No
         ↓
┌─────────────────┐
│   Policy 2      │───Yes──→ [Result 2]
│   Condition: Y  │
└────────┬────────┘
         │ No
         ↓
┌─────────────────┐
│   Policy 3      │───Yes──→ [Result 3]
│   Condition: Z  │
└─────────────────┘
```

**Benefits:**
- More compact
- Clear visualization of "short circuit" logic
- Better use of screen space
- Easier to understand flow at a glance

---

## Layout Algorithm

### Coordinate System

- Origin (0, 0) is top-left
- X increases to the right
- Y increases downward
- Units: pixels

### Spacing Constants

```
POLICY_NODE_WIDTH = 300
RESULT_NODE_WIDTH = 200
HORIZONTAL_GAP = 100
VERTICAL_GAP = 150

POLICY_X = 0
RESULT_X = POLICY_X + POLICY_NODE_WIDTH + HORIZONTAL_GAP
         = 0 + 300 + 100
         = 400
```

### Node Positioning Formula

For a list of N policies with indices 0 to N-1:

**Policy Decision Nodes (Left Column):**
```
x = POLICY_X (always 0)
y = index * VERTICAL_GAP
```

**Result Nodes (Right Column):**
```
x = RESULT_X (always 400)
y = index * VERTICAL_GAP (same y as corresponding policy)
```

### Example Calculation

**3 policies:**

| Node | Type | Index | X | Y | Position |
|------|------|-------|---|---|----------|
| Policy 1 | Decision | 0 | 0 | 0 | (0, 0) |
| Result 1 | Result | 0 | 400 | 0 | (400, 0) |
| Policy 2 | Decision | 1 | 0 | 150 | (0, 150) |
| Result 2 | Result | 1 | 400 | 150 | (400, 150) |
| Policy 3 | Decision | 2 | 0 | 300 | (0, 300) |
| Result 3 | Result | 2 | 400 | 300 | (400, 300) |

---

## Edge (Connection) Routing

### Two Types of Edges

**1. "Yes" / "Match" Edge**
- From: Policy node (right side)
- To: Result node (left side)
- Direction: Horizontal (straight line or slight curve)
- Color: Green (#22c55e)
- Label: "Match" or "Yes"
- Style: Solid, thickness 2px

**2. "No" / "No Match" Edge**
- From: Policy node (bottom)
- To: Next policy node (top)
- Direction: Vertical (straight line or slight curve)
- Color: Gray (#6b7280)
- Label: "No Match" or "No"
- Style: Solid, thickness 1px
- Note: Last policy has no "No" edge (it's the default)

### Edge Connection Points

**Policy Node Anchors:**
```
┌─────────────────┐
│                 │
│   Policy Node   ├─→ Right side (for "Yes" edge)
│                 │
└────────┬────────┘
         ↓ Bottom (for "No" edge)
```

**Result Node Anchors:**
```
      ┌─────────────────┐
 ←────┤                 │
      │   Result Node   │
      │                 │
      └─────────────────┘
      Left side (for incoming "Yes" edge)
```

### React Flow Edge Configuration

**For "Yes" edges:**
```javascript
{
  id: `edge-yes-${policyIndex}`,
  source: `policy-${policyIndex}`,
  target: `result-${policyIndex}`,
  sourceHandle: 'right',  // Right side of policy node
  targetHandle: 'left',   // Left side of result node
  label: 'Match',
  type: 'smoothstep',     // Or 'straight' for simpler look
  style: {
    stroke: '#22c55e',    // Green
    strokeWidth: 2
  },
  labelStyle: {
    fill: '#22c55e',
    fontWeight: 'bold'
  },
  labelBgStyle: {
    fill: '#0f172a',      // Dark background
    fillOpacity: 0.8
  }
}
```

**For "No" edges:**
```javascript
{
  id: `edge-no-${policyIndex}`,
  source: `policy-${policyIndex}`,
  target: `policy-${policyIndex + 1}`,
  sourceHandle: 'bottom', // Bottom of policy node
  targetHandle: 'top',    // Top of next policy node
  label: 'No Match',
  type: 'smoothstep',
  style: {
    stroke: '#6b7280',    // Gray
    strokeWidth: 1
  },
  labelStyle: {
    fill: '#6b7280'
  },
  labelBgStyle: {
    fill: '#0f172a',
    fillOpacity: 0.8
  }
}
```

---

## Node Design

### Policy Decision Node

**Size:** 300px wide × 120px tall

**Structure:**
```
┌─────────────────────────────────────┐
│ Policy Name             [ENABLED]   │ ← Header
├─────────────────────────────────────┤
│ Condition Type: Simple              │ ← Condition summary
│ Normalised Radius.RadiusFlowType    │
│ EQUALS Wireless802_1x               │
└─────────────────────────────────────┘
```

**Styling:**
```css
.policy-node {
  background: #1e40af;     /* Dark blue */
  border: 2px solid #3b82f6; /* Light blue border */
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.policy-node:hover {
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.5); /* Glow effect */
  cursor: pointer;
}

.policy-node.disabled {
  background: #374151;     /* Dark gray */
  border-color: #6b7280;   /* Gray border */
  opacity: 0.6;
}

.policy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-weight: bold;
  margin-bottom: 8px;
}

.policy-badge {
  background: #10b981;     /* Green for enabled */
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
}

.policy-badge.disabled {
  background: #6b7280;     /* Gray for disabled */
}

.policy-condition {
  color: #cbd5e1;          /* Light gray text */
  font-size: 12px;
  line-height: 1.4;
}
```

**Content Priority:**
1. Policy name (truncate if too long)
2. State badge (enabled/disabled)
3. Condition type (Simple/AND/OR)
4. Brief condition summary (first 2 lines)

**Click Behavior:**
Opens detail sidebar with full condition information

### Result Node

**Size:** 200px wide × 80px tall

**For Authentication Results:**
```
┌─────────────────────┐
│  Continue           │ ← Result
│  ─────────────────  │
│  Internal Endpoints │ ← Identity Source
└─────────────────────┘
```

**For Authorization Results:**
```
┌─────────────────────┐
│  PermitAccess       │ ← Profile
│  ─────────────────  │
│  SGT: BYOD          │ ← Security Group (if present)
└─────────────────────┘
```

**Styling:**
```css
.result-node {
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  color: white;
  font-weight: 600;
}

/* Authentication results */
.result-continue {
  background: #854d0e;     /* Dark yellow */
  border: 2px solid #ca8a04;
}

.result-reject {
  background: #991b1b;     /* Dark red */
  border: 2px solid #dc2626;
}

.result-drop {
  background: #7c2d12;     /* Dark orange */
  border: 2px solid #ea580c;
}

/* Authorization results */
.result-permit {
  background: #166534;     /* Dark green */
  border: 2px solid #22c55e;
}

.result-deny {
  background: #991b1b;     /* Dark red */
  border: 2px solid #dc2626;
}

.result-node:hover {
  cursor: pointer;
  opacity: 0.9;
}

.result-detail {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}
```

---

## Canvas Configuration

### React Flow Setup

**Basic Configuration:**
```javascript
<ReactFlow
  nodes={nodes}
  edges={edges}
  fitView
  minZoom={0.5}
  maxZoom={1.5}
  defaultViewport={{ x: 50, y: 50, zoom: 1 }}
  nodeTypes={customNodeTypes}
>
  <Background color="#334155" gap={16} />
  <Controls />
  <MiniMap 
    nodeColor={(node) => {
      if (node.type === 'policy') return '#1e40af';
      if (node.type === 'result') return '#166534';
      return '#374151';
    }}
  />
</ReactFlow>
```

**Custom Node Types:**
```javascript
const customNodeTypes = {
  policy: PolicyDecisionNode,
  result: ResultNode
};
```

### Viewport Settings

**Initial view:**
- Fit all nodes in viewport
- Add 50px padding around edges
- Center vertically

**Zoom controls:**
- Zoom in: 110% per click
- Zoom out: 90% per click
- Min zoom: 50% (can see full flowchart for large configs)
- Max zoom: 150% (can read small text)

**Pan controls:**
- Click and drag on background to pan
- Cursor changes to grab hand
- Smooth momentum scrolling

---

## Responsive Sizing

### For Different Screen Sizes

**Large screens (>1920px):**
- Use full spacing constants
- Font size: 14px

**Medium screens (1280px - 1920px):**
- Use full spacing constants
- Font size: 12px

**Small screens (1024px - 1280px):**
- Reduce HORIZONTAL_GAP to 80px
- Reduce VERTICAL_GAP to 120px
- Font size: 11px

**Note:** Desktop only, so no mobile breakpoints needed

### Scaling for Large Configs

**If more than 20 policies:**
- Consider enabling "node virtualization" in React Flow
- Only render visible nodes
- Improves performance significantly

**If flowchart height > 3000px:**
- Show zoom-to-fit button
- Add "jump to policy" dropdown menu
- Enable keyboard shortcuts (arrow keys to navigate)

---

## Handle Positions (Advanced)

React Flow nodes can have multiple connection points (handles).

### Policy Node Handles

```javascript
<Handle
  type="target"
  position="top"
  id="top"
  style={{ opacity: 0 }} // Hidden but functional
/>

<Handle
  type="source"
  position="right"
  id="right"
  style={{ background: '#22c55e' }} // Green for "Yes" path
/>

<Handle
  type="source"
  position="bottom"
  id="bottom"
  style={{ background: '#6b7280' }} // Gray for "No" path
/>
```

### Result Node Handles

```javascript
<Handle
  type="target"
  position="left"
  id="left"
  style={{ opacity: 0 }} // Hidden but functional
/>
```

---

## Animation & Interactivity

### Smooth Transitions

When nodes or edges appear:
```css
.react-flow__node {
  transition: all 0.2s ease-in-out;
}

.react-flow__edge {
  transition: all 0.2s ease-in-out;
}
```

### Hover Effects

**On policy node hover:**
- Glow effect (box-shadow)
- Slightly increase size (scale: 1.02)
- Highlight connected edges

**On result node hover:**
- Slight opacity change
- Show tooltip with profile description

**On edge hover:**
- Increase thickness
- Brighten color

### Click Effects

**On node click:**
- Pulse animation
- Open sidebar with smooth slide-in
- Highlight node border

**Implementation:**
```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.node-clicked {
  animation: pulse 0.3s ease-in-out;
}
```

---

## Special Cases

### Default Policy (Last in List)

The default policy (always matches) should:
- Have no "No" edge (it's the end)
- Have visual distinction (border style or icon)
- Result node might say "Default: [result]"

**Visual marker:**
```
┌─────────────────────────────────────┐
│ Default ⭐             [ENABLED]    │
│ (always matches)                    │
└─────────────────────────────────────┘
```

### Disabled Policies

**Visual treatment:**
- Reduced opacity (0.6)
- Gray colors instead of blue/green
- Crossed-out style or "DISABLED" watermark
- Still interactive (can click to see details)

**Implementation:**
```css
.policy-node.disabled::after {
  content: "DISABLED";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.2);
  pointer-events: none;
}
```

### Empty Policy Sets

**If authentication_policies array is empty:**
```
┌─────────────────────────────────────┐
│ No Authentication Policies          │
│ Configured                          │
│                                     │
│ Access will likely be denied        │
└─────────────────────────────────────┘
```

Show as a single gray info box, not a flowchart.

---

## Performance Optimization

### For Large Flowcharts (>50 nodes)

**1. Use React Flow's built-in optimization:**
```javascript
<ReactFlow
  nodes={nodes}
  edges={edges}
  onlyRenderVisibleElements={true}  // Only render what's in viewport
  nodesDraggable={false}             // Disable dragging if not needed
  elementsSelectable={true}          // Keep clickable
/>
```

**2. Lazy load detail data:**
- Don't load full profile details until sidebar opens
- Cache loaded data

**3. Debounce zoom/pan events:**
- Only recalculate visible nodes every 100ms
- Improves smoothness on older hardware

---

## Accessibility

### Keyboard Navigation

**Arrow keys:**
- Up/Down: Move between policies in sequence
- Right: Focus on corresponding result node
- Left: Back to policy node
- Enter: Open detail sidebar

**Tab key:**
- Navigate between all interactive elements
- Skip order: Policies → Results → Zoom controls

### Screen Reader Support

**Policy nodes:**
```html
<div
  role="button"
  aria-label="Policy: MAB, Rank 0, Enabled. Condition: OR block with 2 conditions"
  tabindex="0"
>
```

**Result nodes:**
```html
<div
  role="button"
  aria-label="Result: Continue to authorization. Identity source: Internal Endpoints"
  tabindex="0"
>
```

**Edges:**
- Not focusable
- Information conveyed through node labels

---

## Testing Checklist

**Visual:**
- [ ] Nodes align correctly in two columns
- [ ] Spacing is consistent
- [ ] Edges connect to correct points
- [ ] Colors are readable on dark background
- [ ] Text doesn't overflow node boundaries

**Interaction:**
- [ ] Zoom in/out works smoothly
- [ ] Pan works by dragging background
- [ ] Minimap shows correct overview
- [ ] Clicking nodes opens sidebar
- [ ] Hover effects work

**Edge Cases:**
- [ ] Single policy displays correctly
- [ ] 50+ policies don't lag
- [ ] Disabled policies are visually distinct
- [ ] Default policy is marked
- [ ] Empty policy sets show message

**Responsive:**
- [ ] Works on 1920x1080
- [ ] Works on 1280x720
- [ ] Scales appropriately

---

## Example Code Structure

**Full Node Generation:**
```javascript
function generateFlowchartNodes(policies) {
  const nodes = [];
  const edges = [];
  
  policies.forEach((policy, index) => {
    // Policy decision node
    nodes.push({
      id: `policy-${index}`,
      type: 'policy',
      position: { 
        x: 0, 
        y: index * 150 
      },
      data: {
        name: policy.rule.name,
        rank: policy.rule.rank,
        state: policy.rule.state,
        condition: policy.rule.condition,
        isDefault: policy.rule.default
      }
    });
    
    // Result node
    nodes.push({
      id: `result-${index}`,
      type: 'result',
      position: { 
        x: 400, 
        y: index * 150 
      },
      data: {
        type: 'authentication', // or 'authorization'
        result: policy.ifUserNotFound, // or policy.profile
        details: policy
      }
    });
    
    // "Yes" edge
    edges.push({
      id: `edge-yes-${index}`,
      source: `policy-${index}`,
      target: `result-${index}`,
      sourceHandle: 'right',
      targetHandle: 'left',
      label: 'Match',
      type: 'smoothstep',
      style: { stroke: '#22c55e', strokeWidth: 2 }
    });
    
    // "No" edge (if not last policy)
    if (index < policies.length - 1) {
      edges.push({
        id: `edge-no-${index}`,
        source: `policy-${index}`,
        target: `policy-${index + 1}`,
        sourceHandle: 'bottom',
        targetHandle: 'top',
        label: 'No Match',
        type: 'smoothstep',
        style: { stroke: '#6b7280', strokeWidth: 1 }
      });
    }
  });
  
  return { nodes, edges };
}
```

---

## Visual Examples

### Small Configuration (3 policies)

```
x=0                    x=400

y=0    ┌────────────┐
       │ Policy 1   │────→ [Result 1]
       └──────┬─────┘
              │
y=150  ┌──────▼─────┐
       │ Policy 2   │────→ [Result 2]
       └──────┬─────┘
              │
y=300  ┌──────▼─────┐
       │ Policy 3   │────→ [Result 3]
       └────────────┘
```

### Large Configuration (10+ policies)

The pattern continues vertically:
- Policies stack down the left side
- Results aligned on the right
- Vertical spacing remains constant
- Use minimap for overview
- Scroll or zoom out to see all

---

## Summary

**Key Points:**
1. Two-column layout: Policies left, Results right
2. Diagonal flow: Yes goes right, No goes down
3. Consistent spacing using constants
4. Color-coded edges and nodes
5. Interactive with hover and click
6. Performant for large configs
7. Dark theme throughout

**Result:**
A clean, professional, easy-to-understand visualization of complex ISE policy logic.