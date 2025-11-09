# Strategy Map - Usage Guide

## Getting Started

When you open Strategy Map, you'll see:
- A **white canvas** in the center with an initial node saying "Start here" positioned at the top
- A **toolbar** at the top with tool buttons and actions
- A **properties panel** on the right for customizing styles
- **Zoom controls** in the bottom-left corner
- Your work is **automatically saved** to your browser's local storage

## Tools Overview

### 1. Select Tool (V)
**Icon**: ↖

**What it does**: Selects and moves elements

**How to use**:
- Click on any element to select it
- Drag selected elements to move them
- **Drag on empty space** to create a selection box and select multiple elements
- Hold Shift and click to add elements to your selection
- Click on empty space (without dragging) to deselect all

**Multi-Select Features**:
- **Drag Selection Box**: Click and drag on empty canvas to draw a blue selection rectangle - all elements touching the box will be selected
- **Shift+Click**: Hold Shift and click individual elements to add them to your selection
- **Move Together**: Drag any selected element to move all selected elements as a group
- **Style Together**: Use the Properties Panel to change colors, stroke, and fonts for all selected elements at once

**Tips**:
- Double-click any node or text to edit its content
- Selected elements will show a blue dashed outline
- The selection box appears as a semi-transparent blue rectangle with a dashed border
- Small accidental drags won't trigger selection - the box must be at least 5 pixels to activate

### 2. Node Tool (N)
**Icon**: ○

**What it does**: Creates circular nodes with text

**How to use**:
1. Click the Node tool (or press N)
2. Click anywhere on the canvas
3. A text input will appear - type your node's label
4. Press Enter to confirm

**Tips**:
- Nodes are perfect for representing concepts, steps, or entities
- You can edit node text later by double-clicking
- Customize node colors and styles in the Properties Panel

### 3. Arrow Tool (A)
**Icon**: →

**What it does**: Connects nodes with directional arrows

**How to use**:
1. Click the Arrow tool (or press A)
2. Click on a source node
3. Drag your mouse to the target node
4. Release to create the arrow

**Tips**:
- Arrows automatically attach to the edges of nodes
- You can't create arrows between the same node
- Arrows show relationships and flow between concepts

### 4. Text Tool (T)
**Icon**: T

**What it does**: Adds standalone text labels

**How to use**:
1. Click the Text tool (or press T)
2. Click where you want to place text
3. Type your text
4. Press Enter to confirm

**Tips**:
- Use text for annotations, notes, or labels
- Text can be moved independently of nodes
- Customize text color and font in the Properties Panel

### 5. Pan Tool (H)
**Icon**: ✋

**What it does**: Moves around the canvas

**How to use**:
1. Click the Pan tool (or press H)
2. Click and drag anywhere on the canvas to pan

**Tips**:
- Useful for navigating large diagrams
- Switch back to Select tool to interact with elements
- You can also use the zoom controls in the bottom-left corner

### 6. Laser Tool (L)
**Icon**: 🔴

**What it does**: Point and annotate during presentations

**How to use**:
1. Click the Laser tool (or press L)
2. Move your cursor around the canvas to point at elements
3. A red laser pointer follows your cursor
4. The laser fades after 500ms when you stop moving

**Tips**:
- Perfect for presentations and collaborative discussions
- Non-destructive - doesn't modify your diagram
- Automatically fades when cursor stops moving
- Switch to another tool when done

## Customizing Styles

Select any element and use the **Properties Panel** on the right:

### For Nodes:
- **Stroke/Text Color**: Choose from 14 colors for the outline and text
- **Background Color**: Set the fill color of the node
- **Stroke Width**: Thin, Medium, Thick, or Extra Thick
- **Fill Style**: Solid, Hachure (lines), Cross-Hatch, or None
- **Font**: Hand Drawn, Normal, or Code

### For Arrows:
- **Stroke Color**: Color of the arrow line
- **Stroke Width**: Thickness of the arrow

### For Text Labels:
- **Text Color**: Color of the text
- **Font**: Hand Drawn, Normal, or Code
- **Text Border**: Add borders with Solid, Dashed, or Dotted styles
- **Border Color**: Customize border color
- **Border Width**: Thin, Medium, or Thick borders
- **Padding**: Adjust space between text and border

## Keyboard Shortcuts

### Tools
| Key | Action |
|-----|--------|
| V | Select tool |
| N | Node tool |
| A | Arrow tool |
| T | Text tool |
| H | Pan tool |
| L | Laser tool |

### Editing
| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl + D | Duplicate selected elements |
| Cmd/Ctrl + C | Copy selected elements |
| Cmd/Ctrl + X | Cut selected elements |
| Cmd/Ctrl + V | Paste elements |
| Cmd/Ctrl + A | Select all elements |
| Delete/Backspace | Delete selected elements |
| Escape | Cancel action → Clear selection → Switch to Select tool |

### Selection
| Action | How |
|--------|-----|
| Multi-select | Shift + Click |
| Box select | Drag on empty space |
| Select all | Cmd/Ctrl + A |

## Common Workflows

### Creating a Simple Strategy Map:

1. **Start with a central concept**:
   - The default node says "Start here" - double-click to rename it

2. **Add related concepts**:
   - Press N to activate Node tool
   - Click around the central node to create related concepts

3. **Connect the concepts**:
   - Press A to activate Arrow tool
   - Click and drag from one node to another
   - Repeat for all relationships

4. **Add annotations**:
   - Press T to add text labels
   - Add notes, dates, or other information

5. **Customize the appearance**:
   - Select nodes and change colors to group related concepts
   - Use different stroke widths to emphasize importance
   - Choose fonts that match your style

### Creating a Process Flow:

1. **Create process steps** using the Node tool
2. **Arrange them in sequence** (left to right or top to bottom)
3. **Connect with arrows** to show flow direction
4. **Add decision points** with different colored nodes
5. **Use text labels** for conditions or notes

### Creating a Mind Map:

1. **Central idea** - rename the default node
2. **Main branches** - create nodes around the center
3. **Sub-branches** - add more detailed nodes
4. **Color code** - use different colors for different themes
5. **Add details** - use text labels for additional information

## Saving and Exporting Your Work

### Auto-Save
Your diagram is **automatically saved** to your browser's local storage as you work. When you return to Strategy Map, your work will be right where you left it.

### Exporting to Image

**Method 1: Export Button**
1. Click the **Export** button (↓) in the toolbar
2. A high-quality JPEG image will be downloaded to your Downloads folder

**Method 2: Right-Click Save** (New!)
1. Right-click anywhere on the canvas
2. Select **"Save image as..."** from the context menu
3. Choose your preferred folder and filename in the native file save dialog
4. The image saves as a high-quality PNG file

### What Gets Exported

The export includes:
   - The entire visible canvas area (exactly what you see on screen)
   - All nodes, arrows, and text in their positions
   - Clean rendering without selection indicators or UI overlays
   - 2x resolution for crisp, high-quality images
   - White background (suitable for presentations and documents)

**Export Features:**
- **Full canvas export** - Captures the entire board as you see it
- **High DPI** - 2x pixel density for sharp images
- **Professional quality** - 95% JPEG quality (Export button) or PNG (Right-click save)
- **What you see is what you get** - The exported image matches your view
- **Choose your location** - Right-click save lets you pick exactly where to save

## Tips for Great Diagrams

1. **Use Color Purposefully**:
   - Group related items with the same color
   - Use contrasting colors for different categories
   - Keep backgrounds light for readability

2. **Keep It Organized**:
   - Arrange elements in a logical flow
   - Use consistent spacing
   - Align similar elements

3. **Be Concise**:
   - Keep node labels short and clear
   - Use text labels for longer explanations
   - Don't overcrowd the canvas

4. **Visual Hierarchy**:
   - Use thicker strokes for important elements
   - Larger nodes for key concepts
   - Different fonts to distinguish types of information

5. **Iterate**:
   - Start with a rough layout
   - Refine positioning as you go
   - Don't be afraid to delete and recreate

## Troubleshooting

**Can't select anything?**
- Make sure you're using the Select tool (press V)

**Arrow won't connect?**
- Arrows can only connect between nodes
- Make sure you start and end on a node (not empty space)

**Text is cut off?**
- Node text wraps automatically, but try shortening it
- Use the Text tool for longer content outside nodes

**Lost your work?**
- Your diagrams are auto-saved to browser storage
- If you cleared browser data, your work may be lost
- Export important diagrams as backup!

## Have Fun!

Strategy Puzzle is designed to be intuitive and fun. Experiment with different tools and styles to create diagrams that work for you. The hand-drawn aesthetic gives your diagrams a friendly, approachable feel perfect for brainstorming, planning, and presentation.

Happy diagramming! 🎨
