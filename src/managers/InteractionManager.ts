import { Diagram } from '../models/Diagram';
import { Node } from '../models/Node';
import { Arrow } from '../models/Arrow';
import { TextLabel } from '../models/TextLabel';
import { Point } from '../models/Point';
import { SelectionBox } from '../models/SelectionBox';
import { ResizeHandle } from '../models/Whiteboard';
import { LaserTrail } from '../models/LaserTrail';

export enum Tool {
  SELECT = 'select',
  NODE = 'node',
  ARROW = 'arrow',
  TEXT = 'text',
  PAN = 'pan',
  LASER = 'laser',
}

export enum InteractionMode {
  IDLE = 'idle',
  DRAGGING = 'dragging',
  CREATING_ARROW = 'creating_arrow',
  EDITING_TEXT = 'editing_text',
  PANNING = 'panning',
  BOX_SELECTING = 'box_selecting',
  RESIZING_WHITEBOARD = 'resizing_whiteboard',
  LASER_ACTIVE = 'laser_active',
}

/**
 * Manages all user interactions with the canvas
 */
export class InteractionManager {
  private diagram: Diagram;
  private currentTool: Tool = Tool.SELECT;
  private mode: InteractionMode = InteractionMode.IDLE;
  private dragStartPoint: Point | null = null;
  private draggedElementId: string | null = null;
  private arrowStartNode: Node | null = null;
  private mousePosition: Point = new Point(0, 0);
  private panOffset: Point = new Point(0, 0);
  private panStartOffset: Point = new Point(0, 0);
  private panStartScreenPoint: Point | null = null; // Screen coordinates for panning
  private selectionBox: SelectionBox | null = null;
  private resizingHandle: ResizeHandle | null = null; // Track which handle is being dragged
  private laserTrail: LaserTrail = new LaserTrail();

  // Callbacks for UI updates
  // OOP Principle: Dependency Injection - Callbacks injected from outside
  private onUpdate: () => void = () => {};
  private onRequestTextEdit: (element: Node | TextLabel, initialText: string) => void = () => {};
  private onToolChange: ((tool: Tool) => void) | null = null;

  constructor(diagram: Diagram) {
    this.diagram = diagram;
  }

  /**
   * Set update callback
   */
  setOnUpdate(callback: () => void): void {
    this.onUpdate = callback;
  }

  /**
   * Set text edit request callback
   */
  setOnRequestTextEdit(callback: (element: Node | TextLabel, initialText: string) => void): void {
    this.onRequestTextEdit = callback;
  }

  /**
   * Set tool change callback
   * OOP Principle: Dependency Injection - Allows external control of tool state
   */
  setOnToolChange(callback: (tool: Tool) => void): void {
    this.onToolChange = callback;
  }

  /**
   * Set current tool
   */
  setTool(tool: Tool): void {
    // Clear laser trail when switching away from laser tool
    if (this.currentTool === Tool.LASER && tool !== Tool.LASER) {
      this.laserTrail.clear();
      this.onUpdate(); // Trigger re-render to clear the visual trail
    }

    this.currentTool = tool;
    this.mode = InteractionMode.IDLE;
    this.arrowStartNode = null;
  }

  /**
   * Get current tool
   */
  getTool(): Tool {
    return this.currentTool;
  }

  /**
   * Get current mode
   */
  getMode(): InteractionMode {
    return this.mode;
  }

  /**
   * Get temporary arrow data (for rendering during creation)
   */
  getTemporaryArrow(): { from: Point; to: Point } | null {
    if (this.mode === InteractionMode.CREATING_ARROW && this.arrowStartNode) {
      return {
        from: this.arrowStartNode.getCenter(),
        to: this.mousePosition,
      };
    }
    return null;
  }

  /**
   * Get active selection box (for rendering during box selection)
   * OOP Principle: Information Hiding - Returns copy, not internal state
   */
  getSelectionBox(): SelectionBox | null {
    return this.selectionBox;
  }

  /**
   * Get laser trail for rendering
   */
  getLaserTrail(): LaserTrail {
    return this.laserTrail;
  }

  /**
   * Handle mouse down event
   */
  handleMouseDown(point: Point, shiftKey: boolean = false): void {
    this.dragStartPoint = point;
    this.mousePosition = point;

    const element = this.diagram.findElementAtPoint(point);

    switch (this.currentTool) {
      case Tool.SELECT:
        this.handleSelectMouseDown(point, element, shiftKey);
        break;

      case Tool.NODE:
        this.handleNodeCreation(point);
        break;

      case Tool.ARROW:
        this.handleArrowCreationStart(point, element);
        break;

      case Tool.TEXT:
        this.handleTextCreation(point);
        break;

      case Tool.PAN:
        this.mode = InteractionMode.PANNING;
        this.panStartOffset = this.panOffset.clone();
        this.panStartScreenPoint = null; // Will be set with screen coordinates
        break;

      case Tool.LASER:
        this.mode = InteractionMode.LASER_ACTIVE;
        this.laserTrail.clear();
        this.laserTrail.addPoint(point);
        break;
    }

    this.onUpdate();
  }

  /**
   * Handle select tool mouse down
   * OOP Principle: Single Responsibility - Only handles select tool logic
   */
  private handleSelectMouseDown(
    point: Point,
    element: { type: string; id: string } | null,
    shiftKey: boolean
  ): void {
    // Check if clicking on whiteboard resize handle first (check selected whiteboard)
    const selectedWhiteboard = this.diagram.getSelectedWhiteboard();
    if (selectedWhiteboard) {
      const handle = selectedWhiteboard.getResizeHandleAtPoint(point, 12);
      if (handle) {
        this.mode = InteractionMode.RESIZING_WHITEBOARD;
        this.resizingHandle = handle;
        return;
      }
    }

    if (element) {
      // Clicking on an element - deselect all whiteboards
      this.diagram.getAllWhiteboards().forEach(wb => wb.setSelected(false));

      // Check if element was already selected before this click
      const wasAlreadySelected = this.diagram.getSelectedIds().includes(element.id);

      // Select and prepare for dragging
      if (!shiftKey) {
        if (!wasAlreadySelected) {
          this.diagram.selectElement(element.id, false);
        }
      } else {
        this.diagram.selectElement(element.id, true);
      }

      // Only enter DRAGGING mode for nodes/text
      if (element.type === 'node' || element.type === 'text') {
        this.mode = InteractionMode.DRAGGING;
        this.draggedElementId = element.id;

        const node = this.diagram.getNode(element.id);
        if (node) node.setDragging(true);

        const label = this.diagram.getTextLabel(element.id);
        if (label) label.setDragging(true);
      }
    } else {
      // Clicked on empty space - check if on ANY whiteboard
      const clickedWhiteboard = this.diagram.findWhiteboardAtPoint(point);

      if (clickedWhiteboard) {
        // Clicked on whiteboard - select it and enable dragging
        this.diagram.clearSelection();
        clickedWhiteboard.setSelected(true);
        // Add whiteboard to selection
        this.diagram.selectElement(clickedWhiteboard.id);

        // Enable dragging mode for whiteboard
        this.mode = InteractionMode.DRAGGING;
        this.draggedElementId = clickedWhiteboard.id;
      } else {
        // Clicked outside all whiteboards - deselect all and start box selection
        this.diagram.getAllWhiteboards().forEach(wb => wb.setSelected(false));

        if (!shiftKey) {
          this.diagram.clearSelection();
        }

        // Initialize selection box for drag-to-select
        // OOP Principle: Composition - InteractionManager uses SelectionBox
        this.selectionBox = new SelectionBox(point);
        this.mode = InteractionMode.BOX_SELECTING;
      }
    }
  }

  /**
   * Handle node creation
   */
  private handleNodeCreation(point: Point): void {
    const node = new Node(point, 'New Node');
    this.diagram.addNode(node);
    this.diagram.selectElement(node.id);

    // Auto-switch to Arrow tool for easy connection
    if (this.onToolChange) {
      this.onToolChange(Tool.ARROW);
    }
  }

  /**
   * Handle arrow creation start
   */
  private handleArrowCreationStart(
    _point: Point,
    element: { type: string; id: string } | null
  ): void {
    if (element && element.type === 'node') {
      const node = this.diagram.getNode(element.id);
      if (node) {
        this.arrowStartNode = node;
        this.mode = InteractionMode.CREATING_ARROW;
      }
    }
  }

  /**
   * Handle text label creation
   */
  private handleTextCreation(point: Point): void {
    const label = new TextLabel(point, 'Text');
    this.diagram.addTextLabel(label);
    this.diagram.selectElement(label.id);

    // Auto-switch to Select tool
    if (this.onToolChange) {
      this.onToolChange(Tool.SELECT);
    }
  }

  /**
   * Handle mouse move event
   */
  handleMouseMove(point: Point): void {
    this.mousePosition = point;

    // Handle laser trail even without drag start point
    if (this.mode === InteractionMode.LASER_ACTIVE) {
      this.laserTrail.addPoint(point);
      this.laserTrail.cleanup(); // Remove old points
      this.onUpdate();
      return;
    }

    if (!this.dragStartPoint) return;

    switch (this.mode) {
      case InteractionMode.DRAGGING:
        this.handleDragging(point);
        break;

      case InteractionMode.CREATING_ARROW:
        // Update is handled by getTemporaryArrow
        this.onUpdate();
        break;

      case InteractionMode.PANNING:
        this.handlePanning(point);
        break;

      case InteractionMode.BOX_SELECTING:
        this.handleBoxSelecting(point);
        break;

      case InteractionMode.RESIZING_WHITEBOARD:
        this.handleResizingWhiteboard(point);
        break;
    }
  }

  /**
   * Handle dragging
   */
  private handleDragging(point: Point): void {
    if (!this.dragStartPoint) return;

    const delta = point.subtract(this.dragStartPoint);

    // Move all selected elements
    const selectedIds = this.diagram.getSelectedIds();
    selectedIds.forEach(id => {
      const node = this.diagram.getNode(id);
      if (node) {
        node.moveBy(delta);
      }

      const label = this.diagram.getTextLabel(id);
      if (label) {
        label.moveBy(delta);
      }

      // Handle whiteboard dragging - move whiteboard AND all elements inside it
      const whiteboard = this.diagram.getWhiteboard(id);
      if (whiteboard) {
        // Move the whiteboard itself
        whiteboard.position.x += delta.x;
        whiteboard.position.y += delta.y;

        // Move all elements inside the whiteboard
        this.diagram.getElementsInWhiteboard(id).forEach(elementId => {
          const innerNode = this.diagram.getNode(elementId);
          if (innerNode) {
            innerNode.moveBy(delta);
          }

          const innerLabel = this.diagram.getTextLabel(elementId);
          if (innerLabel) {
            innerLabel.moveBy(delta);
          }

          // Note: Arrows don't need explicit movement - they're anchored to nodes
          // and will automatically follow their connected nodes
        });
      }
    });

    this.dragStartPoint = point;
    this.onUpdate();
  }

  /**
   * Handle panning with screen coordinates
   */
  handlePanningWithScreenCoords(screenPoint: Point): void {
    if (!this.panStartScreenPoint) {
      this.panStartScreenPoint = screenPoint;
      return;
    }

    // Calculate delta in screen coordinates (not affected by zoom)
    const delta = screenPoint.subtract(this.panStartScreenPoint);
    this.panOffset = this.panStartOffset.add(delta);
    this.onUpdate();
  }

  /**
   * Handle panning (deprecated - use handlePanningWithScreenCoords)
   */
  private handlePanning(point: Point): void {
    if (!this.dragStartPoint) return;

    const delta = point.subtract(this.dragStartPoint);
    this.panOffset = this.panStartOffset.add(delta);
    this.onUpdate();
  }

  /**
   * Handle box selection (drag-to-select multiple elements)
   * OOP Principle: Abstraction - Complex selection logic simplified
   */
  private handleBoxSelecting(point: Point): void {
    if (!this.selectionBox) return;

    // Update the selection box end point
    this.selectionBox.updateEndPoint(point);

    // Find and preview select elements within the box
    // This provides real-time feedback as user drags
    const elementsInBox = this.diagram.findElementsInBox(this.selectionBox);

    // Clear previous hover selections and show new ones
    this.diagram.clearSelection();
    if (elementsInBox.length > 0) {
      this.diagram.selectElements(elementsInBox, false);
    }

    this.onUpdate();
  }

  /**
   * Handle whiteboard resizing
   */
  private handleResizingWhiteboard(point: Point): void {
    if (!this.dragStartPoint || !this.resizingHandle) return;

    const selectedWhiteboard = this.diagram.getSelectedWhiteboard();
    if (!selectedWhiteboard) return;

    const delta = point.subtract(this.dragStartPoint);
    selectedWhiteboard.resize(this.resizingHandle, delta);
    this.dragStartPoint = point;
    this.onUpdate();
  }

  /**
   * Handle mouse up event
   */
  handleMouseUp(point: Point): void {
    this.mousePosition = point;

    if (this.mode === InteractionMode.CREATING_ARROW && this.arrowStartNode) {
      // Try to complete arrow creation
      const element = this.diagram.findElementAtPoint(point);

      if (element && element.type === 'node' && element.id !== this.arrowStartNode.id) {
        // Case 1: Arrow ends on an existing node
        const endNode = this.diagram.getNode(element.id);
        if (endNode) {
          const arrow = new Arrow(this.arrowStartNode, endNode);
          this.diagram.addArrow(arrow);
        }
      } else if (!element) {
        // Case 2: Arrow ends in empty space - create a new node there
        // Only create if the release point is far enough from the start node
        const distance = this.arrowStartNode.position.distanceTo(point);
        const minDistance = this.arrowStartNode.radius + 80; // Min distance: node radius + some spacing

        if (distance >= minDistance) {
          // Create new node at the release point
          const newNode = new Node(point, 'New Node');
          this.diagram.addNode(newNode);
          this.diagram.selectElement(newNode.id);

          // Create arrow connecting to the new node
          const arrow = new Arrow(this.arrowStartNode, newNode);
          this.diagram.addArrow(arrow);

          // Stay on Arrow tool (already on it) - user can continue drawing arrows
          this.arrowStartNode = null;
          return;
        }
      }

      this.arrowStartNode = null;
    }

    // Complete box selection
    if (this.mode === InteractionMode.BOX_SELECTING && this.selectionBox) {
      // Only finalize selection if box is significant (not just a click)
      if (this.selectionBox.isSignificant()) {
        const elementsInBox = this.diagram.findElementsInBox(this.selectionBox);
        this.diagram.selectElements(elementsInBox, false);
      }
      // Clear the selection box
      this.selectionBox = null;
    }

    // Handle laser pointer release
    if (this.mode === InteractionMode.LASER_ACTIVE) {
      this.mode = InteractionMode.IDLE;
      // Don't clear trail immediately - let it fade out naturally
    }

    // Clear dragging state
    if (this.draggedElementId) {
      const node = this.diagram.getNode(this.draggedElementId);
      if (node) node.setDragging(false);

      const label = this.diagram.getTextLabel(this.draggedElementId);
      if (label) label.setDragging(false);

      this.draggedElementId = null;
    }

    // Clear resizing state
    if (this.mode === InteractionMode.RESIZING_WHITEBOARD) {
      this.resizingHandle = null;
    }

    this.dragStartPoint = null;

    if (this.mode !== InteractionMode.EDITING_TEXT) {
      this.mode = InteractionMode.IDLE;
    }

    this.onUpdate();
  }

  /**
   * Handle double click for text editing
   */
  handleDoubleClick(point: Point): void {
    const element = this.diagram.findElementAtPoint(point);

    if (element && (element.type === 'node' || element.type === 'text')) {
      // Clear any dragging state that may have been set by mouseDown
      if (this.draggedElementId) {
        const draggedNode = this.diagram.getNode(this.draggedElementId);
        if (draggedNode) draggedNode.setDragging(false);

        const draggedLabel = this.diagram.getTextLabel(this.draggedElementId);
        if (draggedLabel) draggedLabel.setDragging(false);

        this.draggedElementId = null;
      }

      const node = this.diagram.getNode(element.id);
      if (node) {
        this.mode = InteractionMode.EDITING_TEXT;
        this.onRequestTextEdit(node, node.text);
        return;
      }

      const label = this.diagram.getTextLabel(element.id);
      if (label) {
        this.mode = InteractionMode.EDITING_TEXT;
        this.onRequestTextEdit(label, label.text);
      }
    } else {
      // Double-click on empty space
      // If on Arrow tool, switch to Select tool for easier navigation
      if (this.currentTool === Tool.ARROW && this.onToolChange) {
        this.onToolChange(Tool.SELECT);
      }
    }
  }

  /**
   * Update text for an element
   */
  updateElementText(elementId: string, text: string): void {
    const node = this.diagram.getNode(elementId);
    if (node) {
      node.setText(text);
    }

    const label = this.diagram.getTextLabel(elementId);
    if (label) {
      // If text is empty, delete the text label
      // (text labels have no purpose without text)
      if (!text || text.trim() === '') {
        this.diagram.removeTextLabel(elementId);
      } else {
        label.setText(text);
      }
    }

    this.mode = InteractionMode.IDLE;
    this.onUpdate();
  }

  /**
   * Handle keyboard events
   */
  handleKeyDown(key: string): void {
    switch (key) {
      case 'Delete':
      case 'Backspace':
        if (this.mode !== InteractionMode.EDITING_TEXT) {
          this.diagram.deleteSelected();
          this.onUpdate();
        }
        break;

      case 'Escape':
        // OOP Principle: Single Responsibility - InteractionManager coordinates state changes

        // Priority 1: Cancel active operations
        if (this.mode === InteractionMode.CREATING_ARROW) {
          this.arrowStartNode = null;
          this.mode = InteractionMode.IDLE;
          this.onUpdate();
        } else if (this.mode === InteractionMode.EDITING_TEXT) {
          this.mode = InteractionMode.IDLE;
          this.onUpdate();
        } else if (this.mode === InteractionMode.BOX_SELECTING) {
          this.selectionBox = null;
          this.mode = InteractionMode.IDLE;
          this.onUpdate();
        } else {
          // Priority 2: Clear selection if anything is selected
          if (this.diagram.getSelectedIds().length > 0) {
            this.diagram.clearSelection();
            this.onUpdate();
          }
          // Priority 3: Switch to Select tool if not already on it
          else if (this.currentTool !== Tool.SELECT) {
            if (this.onToolChange) {
              this.onToolChange(Tool.SELECT);
            }
          }
        }
        break;
    }
  }

  /**
   * Get pan offset
   */
  getPanOffset(): Point {
    return this.panOffset;
  }

  /**
   * Set initial pan offset (for centering whiteboard on load)
   */
  setInitialPan(panX: number, panY: number): void {
    this.panOffset = new Point(panX, panY);
    this.panStartOffset = this.panOffset.clone();
  }

  /**
   * Apply pan from wheel/trackpad scroll
   * Used for two-finger slide gesture on trackpad
   */
  applyWheelPan(deltaX: number, deltaY: number): void {
    // Apply delta directly to pan offset
    // Negative because wheel delta is opposite of pan direction
    this.panOffset = this.panOffset.add(new Point(-deltaX, -deltaY));
    this.panStartOffset = this.panOffset.clone();
    this.onUpdate();
  }

  /**
   * Get cursor for resize handle at point (for Canvas to show appropriate cursor)
   */
  getResizeCursor(point: Point): string | null {
    // Only show resize cursor if a whiteboard is selected
    const selectedWhiteboard = this.diagram.getSelectedWhiteboard();
    if (!selectedWhiteboard) return null;

    const handle = selectedWhiteboard.getResizeHandleAtPoint(point, 12);
    if (!handle) return null;

    switch (handle) {
      case ResizeHandle.TOP_LEFT:
      case ResizeHandle.BOTTOM_RIGHT:
        return 'nwse-resize';
      case ResizeHandle.TOP_RIGHT:
      case ResizeHandle.BOTTOM_LEFT:
        return 'nesw-resize';
      case ResizeHandle.TOP:
      case ResizeHandle.BOTTOM:
        return 'ns-resize';
      case ResizeHandle.LEFT:
      case ResizeHandle.RIGHT:
        return 'ew-resize';
      default:
        return null;
    }
  }
}
