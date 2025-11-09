import { Diagram } from '../models/Diagram';
import { Node } from '../models/Node';
import { Arrow } from '../models/Arrow';
import { TextLabel } from '../models/TextLabel';
import { Point } from '../models/Point';
import { Whiteboard } from '../models/Whiteboard';

const STORAGE_KEY = 'strategy-map-diagram';
const VIEW_STATE_KEY = 'strategy-map-view-state';
const STORAGE_VERSION = '1.0';

/**
 * Storage utility for persisting diagram data to localStorage
 * OOP Principle: Single Responsibility - Handles only storage operations
 */

export interface StorageData {
  version: string;
  timestamp: number;
  nodes: any[];
  arrows: any[];
  textLabels: any[];
  whiteboards: any[];  // Changed from single whiteboard to array
}

export interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
}

/**
 * Save diagram to localStorage
 */
export function saveDiagram(diagram: Diagram): void {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      nodes: diagram.getAllNodes().map(node => ({
        id: node.id,
        position: { x: node.position.x, y: node.position.y },
        text: node.text,
        radius: node.radius,
        style: node.style,
        fontFamily: node.fontFamily,
      })),
      arrows: diagram.getAllArrows().map(arrow => ({
        id: arrow.id,
        fromNodeId: arrow.fromNode.id,
        toNodeId: arrow.toNode.id,
        strokeColor: arrow.strokeColor,
        strokeWidth: arrow.strokeWidth,
        lineStyle: arrow.lineStyle,
      })),
      textLabels: diagram.getAllTextLabels().map(label => ({
        id: label.id,
        position: { x: label.position.x, y: label.position.y },
        text: label.text,
        fontSize: label.fontSize,
        color: label.color,
        fontFamily: label.fontFamily,
        // Border properties
        showBorder: label.showBorder,
        borderStyle: label.borderStyle,
        borderColor: label.borderColor,
        borderWidth: label.borderWidth,
        padding: label.padding,
      })),
      whiteboards: diagram.getAllWhiteboards().map(wb => wb.toJSON()),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save diagram to localStorage:', error);
  }
}

/**
 * Load diagram from localStorage
 * Returns null if no saved data exists or if loading fails
 */
export function loadDiagram(): Diagram | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const data: StorageData = JSON.parse(stored);

    // Check version compatibility
    if (data.version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch, starting fresh');
      return null;
    }

    // Create new diagram (starts with one default whiteboard)
    const diagram = new Diagram();

    // Clear ALL default whiteboards before restoring saved ones
    diagram.clearAllWhiteboards();

    // Restore whiteboards (new format)
    if (data.whiteboards && data.whiteboards.length > 0) {
      data.whiteboards.forEach((wbData: any) => {
        const whiteboard = Whiteboard.fromJSON(wbData);
        diagram.addWhiteboard(whiteboard);
      });
    } else if ((data as any).whiteboard) {
      // Backward compatibility: old format had single 'whiteboard' field
      const whiteboard = Whiteboard.fromJSON((data as any).whiteboard);
      diagram.addWhiteboard(whiteboard);
    }

    // Create a map to store nodes by ID for arrow reconstruction
    const nodeMap = new Map<string, Node>();

    // Restore nodes
    data.nodes?.forEach((nodeData: any) => {
      const node = new Node(
        new Point(nodeData.position.x, nodeData.position.y),
        nodeData.text,
        nodeData.style
      );
      node.radius = nodeData.radius;
      node.fontFamily = nodeData.fontFamily;
      diagram.addNode(node);
      nodeMap.set(nodeData.id, node);
    });

    // Restore text labels
    data.textLabels?.forEach((labelData: any) => {
      const label = new TextLabel(
        new Point(labelData.position.x, labelData.position.y),
        labelData.text
      );
      label.fontSize = labelData.fontSize;
      label.color = labelData.color;
      label.fontFamily = labelData.fontFamily;
      // Restore border properties (with defaults for backward compatibility)
      if (labelData.showBorder !== undefined) {
        label.showBorder = labelData.showBorder;
      }
      if (labelData.borderStyle !== undefined) {
        label.borderStyle = labelData.borderStyle;
      }
      if (labelData.borderColor !== undefined) {
        label.borderColor = labelData.borderColor;
      }
      if (labelData.borderWidth !== undefined) {
        label.borderWidth = labelData.borderWidth;
      }
      if (labelData.padding !== undefined) {
        label.padding = labelData.padding;
      }
      diagram.addTextLabel(label);
    });

    // Restore arrows
    data.arrows?.forEach((arrowData: any) => {
      const fromNode = nodeMap.get(arrowData.fromNodeId);
      const toNode = nodeMap.get(arrowData.toNodeId);

      if (fromNode && toNode) {
        const arrow = new Arrow(
          fromNode,
          toNode,
          arrowData.strokeColor,
          arrowData.strokeWidth,
          arrowData.lineStyle
        );
        diagram.addArrow(arrow);
      }
    });

    return diagram;
  } catch (error) {
    console.error('Failed to load diagram from localStorage:', error);
    return null;
  }
}

/**
 * Clear saved diagram from localStorage
 */
export function clearSavedDiagram(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear saved diagram:', error);
  }
}

/**
 * Check if there is saved diagram data
 */
export function hasSavedDiagram(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Save view state (zoom and pan) to localStorage
 */
export function saveViewState(viewState: ViewState): void {
  try {
    localStorage.setItem(VIEW_STATE_KEY, JSON.stringify(viewState));
  } catch (error) {
    console.error('Failed to save view state to localStorage:', error);
  }
}

/**
 * Load view state from localStorage
 * Returns null if no saved data exists or if loading fails
 */
export function loadViewState(): ViewState | null {
  try {
    const stored = localStorage.getItem(VIEW_STATE_KEY);
    if (!stored) {
      return null;
    }

    const viewState: ViewState = JSON.parse(stored);

    // Validate the data
    if (typeof viewState.zoom !== 'number' ||
        typeof viewState.panX !== 'number' ||
        typeof viewState.panY !== 'number') {
      console.warn('Invalid view state data, ignoring');
      return null;
    }

    return viewState;
  } catch (error) {
    console.error('Failed to load view state from localStorage:', error);
    return null;
  }
}

/**
 * Clear saved view state from localStorage
 */
export function clearViewState(): void {
  try {
    localStorage.removeItem(VIEW_STATE_KEY);
  } catch (error) {
    console.error('Failed to clear view state:', error);
  }
}
