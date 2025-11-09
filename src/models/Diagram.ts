import { Node } from './Node';
import { Arrow } from './Arrow';
import { TextLabel } from './TextLabel';
import { Point } from './Point';
import { SelectionBox } from './SelectionBox';
import { Whiteboard } from './Whiteboard';

/**
 * Manages the complete diagram state including nodes, arrows, and text labels
 */
export class Diagram {
  private nodes: Map<string, Node> = new Map();
  private arrows: Map<string, Arrow> = new Map();
  private textLabels: Map<string, TextLabel> = new Map();
  private whiteboards: Map<string, Whiteboard> = new Map();
  private selectedElementIds: Set<string> = new Set();

  // Keep 'whiteboard' as a getter for backward compatibility
  public get whiteboard(): Whiteboard {
    // Return the first whiteboard (primary)
    const first = Array.from(this.whiteboards.values())[0];
    if (!first) {
      // Fallback: create default whiteboard if none exists
      const defaultBoard = new Whiteboard(new Point(-800, -600), 1600, 1200);
      this.whiteboards.set(defaultBoard.id, defaultBoard);
      return defaultBoard;
    }
    return first;
  }

  constructor() {
    // Initialize with one default whiteboard centered at origin
    // Default size: 1600x1200 (landscape orientation)
    // Position top-left so that center is at (0, 0)
    const defaultWhiteboard = new Whiteboard(new Point(-800, -600), 1600, 1200);
    this.whiteboards.set(defaultWhiteboard.id, defaultWhiteboard);
  }

  /**
   * Add a node to the diagram
   */
  addNode(node: Node): void {
    this.nodes.set(node.id, node);
  }

  /**
   * Remove a node and all connected arrows
   */
  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);

    // Remove all arrows connected to this node
    const arrowsToRemove: string[] = [];
    this.arrows.forEach((arrow, id) => {
      if (arrow.fromNode.id === nodeId || arrow.toNode.id === nodeId) {
        arrowsToRemove.push(id);
      }
    });
    arrowsToRemove.forEach(id => this.arrows.delete(id));

    this.selectedElementIds.delete(nodeId);
  }

  /**
   * Get a node by ID
   */
  getNode(nodeId: string): Node | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Add an arrow to the diagram
   */
  addArrow(arrow: Arrow): void {
    this.arrows.set(arrow.id, arrow);
  }

  /**
   * Remove an arrow
   */
  removeArrow(arrowId: string): void {
    this.arrows.delete(arrowId);
    this.selectedElementIds.delete(arrowId);
  }

  /**
   * Get an arrow by ID
   */
  getArrow(arrowId: string): Arrow | undefined {
    return this.arrows.get(arrowId);
  }

  /**
   * Get all arrows
   */
  getAllArrows(): Arrow[] {
    return Array.from(this.arrows.values());
  }

  /**
   * Add a text label to the diagram
   */
  addTextLabel(label: TextLabel): void {
    this.textLabels.set(label.id, label);
  }

  /**
   * Remove a text label
   */
  removeTextLabel(labelId: string): void {
    this.textLabels.delete(labelId);
    this.selectedElementIds.delete(labelId);
  }

  /**
   * Get a text label by ID
   */
  getTextLabel(labelId: string): TextLabel | undefined {
    return this.textLabels.get(labelId);
  }

  /**
   * Get all text labels
   */
  getAllTextLabels(): TextLabel[] {
    return Array.from(this.textLabels.values());
  }

  /**
   * Add a whiteboard to the diagram
   */
  addWhiteboard(whiteboard: Whiteboard): void {
    this.whiteboards.set(whiteboard.id, whiteboard);
  }

  /**
   * Remove a whiteboard
   * Note: Cannot delete the last whiteboard - there must always be at least one
   * Note: Only deletes the whiteboard frame, not the contents (nodes, arrows, text)
   */
  removeWhiteboard(whiteboardId: string): void {
    // Prevent deleting the last whiteboard
    if (this.whiteboards.size <= 1) {
      console.warn('⚠️ Cannot delete the last whiteboard - there must be at least one');
      return;
    }

    this.whiteboards.delete(whiteboardId);
    this.selectedElementIds.delete(whiteboardId);
  }

  /**
   * Clear all whiteboards (used internally for loading from storage)
   * This bypasses the "cannot delete last whiteboard" protection
   */
  clearAllWhiteboards(): void {
    this.whiteboards.clear();
  }

  /**
   * Get a whiteboard by ID
   */
  getWhiteboard(whiteboardId: string): Whiteboard | undefined {
    return this.whiteboards.get(whiteboardId);
  }

  /**
   * Get all whiteboards
   */
  getAllWhiteboards(): Whiteboard[] {
    return Array.from(this.whiteboards.values());
  }

  /**
   * Get all elements (nodes and text labels) inside a specific whiteboard
   */
  getElementsInWhiteboard(whiteboardId: string): string[] {
    const whiteboard = this.whiteboards.get(whiteboardId);
    if (!whiteboard) {
      return [];
    }

    const elementIds: string[] = [];

    // Check all nodes
    this.nodes.forEach((node, id) => {
      if (whiteboard.containsPoint(node.position)) {
        elementIds.push(id);
      }
    });

    // Check all text labels
    this.textLabels.forEach((label, id) => {
      if (whiteboard.containsPoint(label.position)) {
        elementIds.push(id);
      }
    });

    return elementIds;
  }

  /**
   * Find the selected whiteboard (if any)
   */
  getSelectedWhiteboard(): Whiteboard | null {
    for (const whiteboard of this.whiteboards.values()) {
      if (whiteboard.isSelected()) {
        return whiteboard;
      }
    }
    return null;
  }

  /**
   * Duplicate a whiteboard (without its contents)
   * Positions the duplicate adjacent to the original
   */
  duplicateWhiteboard(whiteboardId: string): string | null {
    const original = this.whiteboards.get(whiteboardId);
    if (!original) {
      return null;
    }

    // Clone the whiteboard
    const duplicate = original.clone();

    // Position it to the right of the original with a small gap
    const gap = 50;
    duplicate.position = new Point(
      original.position.x + original.width + gap,
      original.position.y
    );

    // Deselect original, select duplicate
    original.setSelected(false);
    duplicate.setSelected(true);

    // Add to diagram
    this.addWhiteboard(duplicate);

    // Update selection
    this.selectedElementIds.delete(whiteboardId);
    this.selectedElementIds.add(duplicate.id);

    return duplicate.id;
  }

  /**
   * Find an element (node, arrow, or text) at a specific point
   */
  findElementAtPoint(point: Point): { type: 'node' | 'arrow' | 'text'; id: string } | null {
    // Check nodes first (they should be on top)
    for (const node of this.nodes.values()) {
      if (node.containsPoint(point)) {
        return { type: 'node', id: node.id };
      }
    }

    // Check text labels
    for (const label of this.textLabels.values()) {
      if (label.containsPoint(point)) {
        return { type: 'text', id: label.id };
      }
    }

    // Check arrows last
    for (const arrow of this.arrows.values()) {
      if (arrow.containsPoint(point)) {
        return { type: 'arrow', id: arrow.id };
      }
    }

    return null;
  }

  /**
   * Find a whiteboard at a specific point
   * Returns the topmost whiteboard if multiple overlap
   */
  findWhiteboardAtPoint(point: Point): Whiteboard | null {
    // Check whiteboards in reverse order (last added is on top)
    const whiteboardsArray = Array.from(this.whiteboards.values());
    for (let i = whiteboardsArray.length - 1; i >= 0; i--) {
      if (whiteboardsArray[i].containsPoint(point)) {
        return whiteboardsArray[i];
      }
    }
    return null;
  }

  /**
   * Find all elements within a selection box
   * OOP Principle: Encapsulation - Complex selection logic hidden in Diagram class
   */
  findElementsInBox(selectionBox: SelectionBox): string[] {
    const selectedIds: string[] = [];

    // Check nodes - use circle intersection
    for (const node of this.nodes.values()) {
      if (selectionBox.intersectsCircle(node.position, node.radius)) {
        selectedIds.push(node.id);
      }
    }

    // Check text labels - use rectangle intersection
    for (const label of this.textLabels.values()) {
      if (selectionBox.intersectsRect(label.position, label.width, label.height)) {
        selectedIds.push(label.id);
      }
    }

    // Check arrows - check if either endpoint is in the box
    for (const arrow of this.arrows.values()) {
      const startPoint = arrow.getStartPoint();
      const endPoint = arrow.getEndPoint();
      const midPoint = new Point(
        (startPoint.x + endPoint.x) / 2,
        (startPoint.y + endPoint.y) / 2
      );

      if (
        selectionBox.containsPoint(startPoint) ||
        selectionBox.containsPoint(endPoint) ||
        selectionBox.containsPoint(midPoint)
      ) {
        selectedIds.push(arrow.id);
      }
    }

    return selectedIds;
  }

  /**
   * Select multiple elements by their IDs
   * OOP Principle: Single Responsibility - Diagram manages selection state
   */
  selectElements(elementIds: string[], addToSelection: boolean = false): void {
    if (!addToSelection) {
      this.clearSelection();
    }

    elementIds.forEach(id => {
      this.selectedElementIds.add(id);

      // Update element state
      const node = this.nodes.get(id);
      if (node) node.setSelected(true);

      const arrow = this.arrows.get(id);
      if (arrow) arrow.setSelected(true);

      const label = this.textLabels.get(id);
      if (label) label.setSelected(true);
    });
  }

  /**
   * Select an element (node, arrow, text, or whiteboard)
   */
  selectElement(elementId: string, addToSelection: boolean = false): void {
    if (!addToSelection) {
      this.clearSelection();
    }
    this.selectedElementIds.add(elementId);

    // Update element state
    const node = this.nodes.get(elementId);
    if (node) node.setSelected(true);

    const arrow = this.arrows.get(elementId);
    if (arrow) arrow.setSelected(true);

    const whiteboard = this.whiteboards.get(elementId);
    if (whiteboard) whiteboard.setSelected(true);

    const label = this.textLabels.get(elementId);
    if (label) label.setSelected(true);
  }

  /**
   * Deselect an element
   */
  deselectElement(elementId: string): void {
    this.selectedElementIds.delete(elementId);

    const node = this.nodes.get(elementId);
    if (node) node.setSelected(false);

    const arrow = this.arrows.get(elementId);
    if (arrow) arrow.setSelected(false);

    const label = this.textLabels.get(elementId);
    if (label) label.setSelected(false);

    const whiteboard = this.whiteboards.get(elementId);
    if (whiteboard) whiteboard.setSelected(false);
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    this.selectedElementIds.forEach(id => {
      const node = this.nodes.get(id);
      if (node) node.setSelected(false);

      const arrow = this.arrows.get(id);
      if (arrow) arrow.setSelected(false);

      const label = this.textLabels.get(id);
      if (label) label.setSelected(false);

      const whiteboard = this.whiteboards.get(id);
      if (whiteboard) whiteboard.setSelected(false);
    });
    this.selectedElementIds.clear();
  }

  /**
   * Get selected element IDs
   */
  getSelectedIds(): string[] {
    return Array.from(this.selectedElementIds);
  }

  /**
   * Get selected elements
   */
  getSelectedElements(): Array<Node | Arrow | TextLabel> {
    const elements: Array<Node | Arrow | TextLabel> = [];
    this.selectedElementIds.forEach(id => {
      const node = this.nodes.get(id);
      if (node) elements.push(node);

      const arrow = this.arrows.get(id);
      if (arrow) elements.push(arrow);

      const label = this.textLabels.get(id);
      if (label) elements.push(label);
    });
    return elements;
  }

  /**
   * Delete selected elements (nodes, arrows, text labels, whiteboards)
   */
  deleteSelected(): void {
    const idsToDelete = Array.from(this.selectedElementIds);
    idsToDelete.forEach(id => {
      if (this.nodes.has(id)) {
        this.removeNode(id);
      } else if (this.arrows.has(id)) {
        this.removeArrow(id);
      } else if (this.textLabels.has(id)) {
        this.removeTextLabel(id);
      } else if (this.whiteboards.has(id)) {
        this.removeWhiteboard(id);
      }
    });
    this.selectedElementIds.clear();
  }

  /**
   * Select all elements in the diagram
   * OOP Principle: Single Responsibility - Diagram manages selection
   */
  selectAll(): void {
    this.clearSelection();

    // Select all nodes
    this.nodes.forEach(node => {
      this.selectedElementIds.add(node.id);
      node.setSelected(true);
    });

    // Select all arrows
    this.arrows.forEach(arrow => {
      this.selectedElementIds.add(arrow.id);
      arrow.setSelected(true);
    });

    // Select all text labels
    this.textLabels.forEach(label => {
      this.selectedElementIds.add(label.id);
      label.setSelected(true);
    });
  }

  /**
   * Duplicate selected elements
   * OOP Principle: Encapsulation - Complex duplication logic hidden
   */
  duplicateSelected(): string[] {
    const newIds: string[] = [];
    const offset = 20; // Offset for duplicated elements

    // Map old node IDs to new nodes (for arrow duplication)
    const nodeIdMap = new Map<string, Node>();

    // Duplicate nodes first
    this.selectedElementIds.forEach(id => {
      const node = this.nodes.get(id);
      if (node) {
        const newNode = node.clone();
        newNode.moveTo(new Point(node.position.x + offset, node.position.y + offset));
        newNode.setSelected(false);
        this.addNode(newNode);
        nodeIdMap.set(id, newNode);
        newIds.push(newNode.id);
      }
    });

    // Duplicate text labels
    this.selectedElementIds.forEach(id => {
      const label = this.textLabels.get(id);
      if (label) {
        const newLabel = label.clone();
        newLabel.moveTo(new Point(label.position.x + offset, label.position.y + offset));
        newLabel.setSelected(false);
        this.addTextLabel(newLabel);
        newIds.push(newLabel.id);
      }
    });

    // Duplicate arrows (only if both connected nodes were duplicated)
    this.selectedElementIds.forEach(id => {
      const arrow = this.arrows.get(id);
      if (arrow) {
        const newFromNode = nodeIdMap.get(arrow.fromNode.id);
        const newToNode = nodeIdMap.get(arrow.toNode.id);

        // Only create arrow if both nodes were duplicated
        if (newFromNode && newToNode) {
          const newArrow = new Arrow(
            newFromNode,
            newToNode,
            arrow.strokeColor,
            arrow.strokeWidth,
            arrow.lineStyle
          );
          this.addArrow(newArrow);
          newIds.push(newArrow.id);
        }
      }
    });

    // Clear old selection and select new elements
    this.clearSelection();
    this.selectElements(newIds, false);

    return newIds;
  }

  /**
   * Copy selected elements to clipboard (serialize to JSON)
   * OOP Principle: Abstraction - Hide serialization complexity
   */
  copySelectedToClipboard(): string {
    const selectedData = {
      nodes: [] as any[],
      arrows: [] as any[],
      textLabels: [] as any[],
    };

    // Create a map of selected node IDs for arrow filtering
    const selectedNodeIds = new Set<string>();

    this.selectedElementIds.forEach(id => {
      const node = this.nodes.get(id);
      if (node) {
        selectedNodeIds.add(id);
        selectedData.nodes.push({
          id: node.id,
          position: { x: node.position.x, y: node.position.y },
          text: node.text,
          radius: node.radius,
          style: node.style,
          fontFamily: node.fontFamily,
        });
      }

      const label = this.textLabels.get(id);
      if (label) {
        selectedData.textLabels.push({
          id: label.id,
          position: { x: label.position.x, y: label.position.y },
          text: label.text,
          fontSize: label.fontSize,
          color: label.color,
          fontFamily: label.fontFamily,
        });
      }

      const arrow = this.arrows.get(id);
      if (arrow) {
        selectedData.arrows.push({
          id: arrow.id,
          fromNodeId: arrow.fromNode.id,
          toNodeId: arrow.toNode.id,
          strokeColor: arrow.strokeColor,
          strokeWidth: arrow.strokeWidth,
        });
      }
    });

    return JSON.stringify(selectedData);
  }

  /**
   * Paste elements from clipboard data
   * OOP Principle: Abstraction - Hide deserialization complexity
   */
  pasteFromClipboard(clipboardData: string, offset: Point = new Point(20, 20)): string[] {
    const newIds: string[] = [];

    try {
      const data = JSON.parse(clipboardData);
      const nodeIdMap = new Map<string, Node>();

      // Create nodes
      data.nodes?.forEach((nodeData: any) => {
        const node = new Node(
          new Point(nodeData.position.x + offset.x, nodeData.position.y + offset.y),
          nodeData.text,
          nodeData.style
        );
        node.radius = nodeData.radius;
        node.fontFamily = nodeData.fontFamily;
        this.addNode(node);
        nodeIdMap.set(nodeData.id, node);
        newIds.push(node.id);
      });

      // Create text labels
      data.textLabels?.forEach((labelData: any) => {
        const label = new TextLabel(
          new Point(labelData.position.x + offset.x, labelData.position.y + offset.y),
          labelData.text
        );
        label.fontSize = labelData.fontSize;
        label.color = labelData.color;
        label.fontFamily = labelData.fontFamily;
        this.addTextLabel(label);
        newIds.push(label.id);
      });

      // Create arrows
      data.arrows?.forEach((arrowData: any) => {
        const fromNode = nodeIdMap.get(arrowData.fromNodeId);
        const toNode = nodeIdMap.get(arrowData.toNodeId);

        if (fromNode && toNode) {
          const arrow = new Arrow(fromNode, toNode, arrowData.strokeColor, arrowData.strokeWidth, arrowData.lineStyle);
          this.addArrow(arrow);
          newIds.push(arrow.id);
        }
      });

      // Select pasted elements
      this.clearSelection();
      this.selectElements(newIds, false);

      return newIds;
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
      return [];
    }
  }

  /**
   * Clear all elements and reset to one default whiteboard
   */
  clear(): void {
    this.nodes.clear();
    this.arrows.clear();
    this.textLabels.clear();
    this.selectedElementIds.clear();

    // Reset to one default whiteboard
    this.whiteboards.clear();
    const defaultWhiteboard = new Whiteboard(new Point(-800, -600), 1600, 1200);
    this.whiteboards.set(defaultWhiteboard.id, defaultWhiteboard);
  }

  /**
   * Export diagram data for saving
   */
  export(): any {
    return {
      nodes: Array.from(this.nodes.values()).map(node => ({
        id: node.id,
        position: { x: node.position.x, y: node.position.y },
        text: node.text,
        radius: node.radius,
        style: node.style,
        fontFamily: node.fontFamily,
      })),
      arrows: Array.from(this.arrows.values()).map(arrow => ({
        id: arrow.id,
        fromNodeId: arrow.fromNode.id,
        toNodeId: arrow.toNode.id,
        strokeColor: arrow.strokeColor,
        strokeWidth: arrow.strokeWidth,
        lineStyle: arrow.lineStyle,
      })),
      textLabels: Array.from(this.textLabels.values()).map(label => ({
        id: label.id,
        position: { x: label.position.x, y: label.position.y },
        text: label.text,
        fontSize: label.fontSize,
        color: label.color,
        fontFamily: label.fontFamily,
        showBorder: label.showBorder,
        borderStyle: label.borderStyle,
        borderColor: label.borderColor,
        borderWidth: label.borderWidth,
        padding: label.padding,
      })),
    };
  }

  /**
   * Serialize diagram to JSON for sharing/storage
   */
  toJSON(): any {
    return {
      nodes: Array.from(this.nodes.values()).map(node => node.toJSON()),
      arrows: Array.from(this.arrows.values()).map(arrow => arrow.toJSON()),
      textLabels: Array.from(this.textLabels.values()).map(label => label.toJSON()),
      whiteboards: Array.from(this.whiteboards.values()).map(wb => ({
        id: wb.id,
        position: { x: wb.position.x, y: wb.position.y },
        width: wb.width,
        height: wb.height,
        isSelected: wb.isSelected
      }))
    };
  }

  /**
   * Deserialize diagram from JSON
   */
  static fromJSON(data: any): Diagram {
    const diagram = new Diagram();

    // Clear default whiteboard
    diagram.whiteboards.clear();

    // Restore whiteboards
    if (data.whiteboards && data.whiteboards.length > 0) {
      data.whiteboards.forEach((wbData: any) => {
        const wb = new Whiteboard(
          new Point(wbData.position.x, wbData.position.y),
          wbData.width,
          wbData.height
        );
        (wb as any).id = wbData.id;
        wb.isSelected = wbData.isSelected || false;
        diagram.whiteboards.set(wb.id, wb);
      });
    } else {
      // Fallback: create default whiteboard if none
      const defaultWhiteboard = new Whiteboard(new Point(-800, -600), 1600, 1200);
      diagram.whiteboards.set(defaultWhiteboard.id, defaultWhiteboard);
    }

    // Restore nodes first (needed for arrows)
    const nodeMap = new Map<string, Node>();
    data.nodes.forEach((nodeData: any) => {
      const node = Node.fromJSON(nodeData);
      diagram.nodes.set(node.id, node);
      nodeMap.set(node.id, node);
    });

    // Restore arrows (need nodes to be loaded first)
    data.arrows.forEach((arrowData: any) => {
      try {
        const arrow = Arrow.fromJSON(arrowData, nodeMap);
        diagram.arrows.set(arrow.id, arrow);
      } catch (error) {
        console.warn('Skipping arrow due to missing nodes:', error);
      }
    });

    // Restore text labels
    data.textLabels.forEach((labelData: any) => {
      const label = TextLabel.fromJSON(labelData);
      diagram.textLabels.set(label.id, label);
    });

    return diagram;
  }
}
