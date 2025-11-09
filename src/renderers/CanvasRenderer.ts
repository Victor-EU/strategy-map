import { Diagram } from '../models/Diagram';
import { Node } from '../models/Node';
import { Arrow } from '../models/Arrow';
import { TextLabel } from '../models/TextLabel';
import { Point } from '../models/Point';
import { SelectionBox } from '../models/SelectionBox';
import { LaserTrail } from '../models/LaserTrail';
import { getLighterColor, FillStyle, Color, LineStyle } from '../models/Style';

/**
 * Handles all canvas rendering operations with hand-drawn aesthetic
 */
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private roughness: number = 1;
  private zoom: number = 0.5; // Start at 50% to show full whiteboard
  private panX: number = 0; // Pan offset X
  private panY: number = 0; // Pan offset Y

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = context;
    this.setupCanvas();
  }

  /**
   * Setup canvas with proper DPI scaling
   */
  private setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);

    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  /**
   * Resize canvas
   */
  resize(): void {
    this.setupCanvas();
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  /**
   * Set zoom level
   */
  setZoom(zoom: number, centerX?: number, centerY?: number): void {
    const oldZoom = this.zoom;
    this.zoom = Math.max(0.1, Math.min(5, zoom)); // Clamp between 10% and 500%

    // If center point provided, adjust pan to zoom towards that point
    if (centerX !== undefined && centerY !== undefined) {
      const zoomRatio = this.zoom / oldZoom;
      this.panX = centerX - (centerX - this.panX) * zoomRatio;
      this.panY = centerY - (centerY - this.panY) * zoomRatio;
    }
  }

  /**
   * Get current zoom level
   */
  getZoom(): number {
    return this.zoom;
  }

  /**
   * Zoom in by a factor
   */
  zoomIn(factor: number = 1.2, centerX?: number, centerY?: number): void {
    this.setZoom(this.zoom * factor, centerX, centerY);
  }

  /**
   * Zoom out by a factor
   */
  zoomOut(factor: number = 1.2, centerX?: number, centerY?: number): void {
    this.setZoom(this.zoom / factor, centerX, centerY);
  }

  /**
   * Reset zoom to 100%
   */
  resetZoom(): void {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }

  /**
   * Set pan offset
   */
  setPan(panX: number, panY: number): void {
    this.panX = panX;
    this.panY = panY;
  }

  /**
   * Get current pan offset
   */
  getPan(): { x: number; y: number } {
    return { x: this.panX, y: this.panY };
  }

  /**
   * Get complete view state (zoom and pan)
   */
  getViewState(): { zoom: number; panX: number; panY: number } {
    return {
      zoom: this.zoom,
      panX: this.panX,
      panY: this.panY,
    };
  }

  /**
   * Set complete view state (zoom and pan)
   */
  setViewState(viewState: { zoom: number; panX: number; panY: number }): void {
    this.zoom = Math.max(0.1, Math.min(5, viewState.zoom)); // Clamp zoom
    this.panX = viewState.panX;
    this.panY = viewState.panY;
  }

  /**
   * Convert screen coordinates to canvas coordinates (accounting for zoom and pan)
   */
  screenToCanvas(screenX: number, screenY: number): Point {
    const canvasX = (screenX - this.panX) / this.zoom;
    const canvasY = (screenY - this.panY) / this.zoom;
    return new Point(canvasX, canvasY);
  }

  /**
   * Convert canvas coordinates to screen coordinates (accounting for zoom and pan)
   */
  canvasToScreen(canvasX: number, canvasY: number): Point {
    const screenX = canvasX * this.zoom + this.panX;
    const screenY = canvasY * this.zoom + this.panY;
    return new Point(screenX, screenY);
  }

  /**
   * Render the entire diagram
   * OOP Principle: Single Responsibility - CanvasRenderer only handles rendering
   */
  render(
    diagram: Diagram,
    temporaryArrow?: { from: Point; to: Point },
    selectionBox?: SelectionBox | null,
    editingState?: {
      elementId: string;
      text: string;
      cursorPosition: number;
      cursorVisible: boolean;
      selectionStart: number;
      selectionEnd: number;
    },
    laserTrail?: LaserTrail | null
  ): void {
    this.clear();

    const ctx = this.ctx;
    ctx.save();

    // Apply zoom and pan transformation
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.zoom, this.zoom);

    // Draw all whiteboards first (base layer)
    diagram.getAllWhiteboards().forEach(whiteboard => this.drawWhiteboard(whiteboard));

    // Draw arrows first (behind nodes)
    diagram.getAllArrows().forEach(arrow => this.drawArrow(arrow));

    // Draw temporary arrow if in progress
    if (temporaryArrow) {
      this.drawTemporaryArrow(temporaryArrow.from, temporaryArrow.to);
    }

    // Draw text labels (with editing support)
    diagram.getAllTextLabels().forEach(label => {
      if (editingState && label.id === editingState.elementId) {
        this.drawTextLabelEditing(label, editingState.text, editingState.cursorPosition, editingState.cursorVisible, editingState.selectionStart, editingState.selectionEnd);
      } else {
        this.drawTextLabel(label);
      }
    });

    // Draw nodes (on top, with editing support)
    diagram.getAllNodes().forEach(node => {
      if (editingState && node.id === editingState.elementId) {
        this.drawNodeEditing(node, editingState.text, editingState.cursorPosition, editingState.cursorVisible, editingState.selectionStart, editingState.selectionEnd);
      } else {
        this.drawNode(node);
      }
    });

    // Draw laser trail (on top of diagram elements, before selection box)
    if (laserTrail && !laserTrail.isEmpty()) {
      this.drawLaserTrail(laserTrail);
    }

    // Draw selection box (on top of everything)
    if (selectionBox) {
      this.drawSelectionBox(selectionBox);
    }

    ctx.restore();
  }

  /**
   * Draw a node with hand-drawn style
   */
  private drawNode(node: Node): void {
    const ctx = this.ctx;
    const { x, y } = node.position;
    const radius = node.radius;

    ctx.save();

    // For hachure/cross-hatch: we need to use Path2D to preserve the path
    if (node.style.fillStyle === FillStyle.HACHURE || node.style.fillStyle === FillStyle.CROSS_HATCH) {
      // Create a Path2D that we can reuse
      const circlePath = new Path2D();
      const steps = 64;
      const roughness = this.roughness;

      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const wobble = (Math.random() - 0.5) * roughness;
        const r = radius + wobble;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;

        if (i === 0) {
          circlePath.moveTo(px, py);
        } else {
          circlePath.lineTo(px, py);
        }
      }
      circlePath.closePath();

      // Clip with the path
      ctx.save();
      ctx.clip(circlePath);
      this.drawHatchPattern(ctx, node.style.fillStyle, node.style.backgroundColor, x, y, radius);
      ctx.restore();

      // Stroke the SAME path
      ctx.strokeStyle = node.style.strokeColor;
      ctx.lineWidth = node.style.strokeWidth;
      ctx.stroke(circlePath);
    } else {
      // For solid and none: simpler approach
      ctx.beginPath();
      this.drawRoughCircle(x, y, radius);

      if (node.style.fillStyle === FillStyle.SOLID) {
        ctx.fillStyle = getLighterColor(node.style.backgroundColor, 0.3);
        ctx.fill();
      }

      ctx.strokeStyle = node.style.strokeColor;
      ctx.lineWidth = node.style.strokeWidth;
      ctx.stroke();
    }

    // Draw selection indicator
    if (node.isSelected) {
      ctx.strokeStyle = '#1971c2';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw text
    ctx.fillStyle = node.style.strokeColor;
    ctx.font = `${16}px ${node.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Wrap text if too long
    const maxWidth = radius * 1.6;
    this.wrapText(ctx, node.text, x, y, maxWidth, 20);

    ctx.restore();
  }

  /**
   * Draw a rough circle with hand-drawn effect
   */
  private drawRoughCircle(x: number, y: number, radius: number): void {
    const ctx = this.ctx;
    const steps = 64;
    const roughness = this.roughness;

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const wobble = (Math.random() - 0.5) * roughness;
      const r = radius + wobble;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
  }

  /**
   * Draw hatch pattern (hachure or cross-hatch) inside a clipped region
   * Must be called after ctx.clip() has been set
   */
  private drawHatchPattern(
    ctx: CanvasRenderingContext2D,
    fillStyle: FillStyle,
    backgroundColor: Color,
    x: number,
    y: number,
    radius: number
  ): void {
    ctx.strokeStyle = backgroundColor;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    const size = radius * 2.5;

    if (fillStyle === FillStyle.HACHURE) {
      // Diagonal lines at 45 degrees
      const spacing = 5;
      for (let i = -size; i < size; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(x + i - size, y - size);
        ctx.lineTo(x + i + size, y + size);
        ctx.stroke();
      }
    } else if (fillStyle === FillStyle.CROSS_HATCH) {
      // Cross-hatch: diagonal lines both directions
      const crossSpacing = 7;
      ctx.globalAlpha = 0.25;

      // Diagonal lines one direction (45 degrees)
      for (let i = -size; i < size; i += crossSpacing) {
        ctx.beginPath();
        ctx.moveTo(x + i - size, y - size);
        ctx.lineTo(x + i + size, y + size);
        ctx.stroke();
      }

      // Diagonal lines other direction (-45 degrees)
      for (let i = -size; i < size; i += crossSpacing) {
        ctx.beginPath();
        ctx.moveTo(x - i - size, y - size);
        ctx.lineTo(x - i + size, y + size);
        ctx.stroke();
      }
    }
  }

  /**
   * Draw an arrow connection
   */
  private drawArrow(arrow: Arrow): void {
    const ctx = this.ctx;
    const start = arrow.getStartPoint();
    const end = arrow.getEndPoint();
    const angle = arrow.getAngle();

    ctx.save();

    // Set line style (solid, dashed, or dotted)
    if (arrow.lineStyle === LineStyle.DASHED) {
      ctx.setLineDash([10, 5]);
    } else if (arrow.lineStyle === LineStyle.DOTTED) {
      ctx.setLineDash([2, 4]);
    } else {
      ctx.setLineDash([]);
    }

    // Draw line
    ctx.strokeStyle = arrow.strokeColor;
    ctx.lineWidth = arrow.strokeWidth;
    ctx.beginPath();
    this.drawRoughLine(start, end);
    ctx.stroke();

    // Reset line dash for arrowhead
    ctx.setLineDash([]);

    // Draw arrowhead
    this.drawArrowhead(end, angle);

    // Draw selection indicator
    if (arrow.isSelected) {
      ctx.strokeStyle = '#1971c2';
      ctx.lineWidth = arrow.strokeWidth + 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  /**
   * Draw a rough line with hand-drawn effect
   */
  private drawRoughLine(from: Point, to: Point): void {
    const ctx = this.ctx;
    const segments = 20;
    const roughness = this.roughness;

    ctx.moveTo(from.x, from.y);

    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const wobble = (Math.random() - 0.5) * roughness * 2;
      const x = from.x + (to.x - from.x) * t + wobble;
      const y = from.y + (to.y - from.y) * t + wobble;
      ctx.lineTo(x, y);
    }
  }

  /**
   * Draw arrowhead
   */
  private drawArrowhead(point: Point, angle: number): void {
    const ctx = this.ctx;
    const headLength = 15;
    const headAngle = Math.PI / 6;

    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(
      point.x - headLength * Math.cos(angle - headAngle),
      point.y - headLength * Math.sin(angle - headAngle)
    );
    ctx.lineTo(
      point.x - headLength * Math.cos(angle + headAngle),
      point.y - headLength * Math.sin(angle + headAngle)
    );
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Draw temporary arrow while creating connection
   */
  private drawTemporaryArrow(from: Point, to: Point): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.strokeStyle = '#868e96';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  /**
   * Draw a text label
   */
  private drawTextLabel(label: TextLabel): void {
    const ctx = this.ctx;
    const { x, y } = label.position;

    ctx.save();

    // Set up font for text measurement
    ctx.font = `${label.fontSize}px ${label.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Split text into lines for multi-line support
    const lines = label.text ? label.text.split('\n') : [''];
    const lineHeight = label.fontSize * 1.4;

    // Measure text to calculate bounding box
    let maxWidth = 20;
    for (const line of lines) {
      // Use 'A' only for measuring empty lines, not for display
      const measureText = line || 'A';
      const metrics = ctx.measureText(measureText);
      maxWidth = Math.max(maxWidth, metrics.width);
    }
    const textWidth = maxWidth;
    const textHeight = lineHeight * lines.length;

    // Calculate box dimensions with padding
    const boxWidth = textWidth + (label.padding * 2);
    const boxHeight = textHeight + (label.padding / 2 * 2);
    const boxX = x - boxWidth / 2;
    const boxY = y - boxHeight / 2;

    // Draw custom border if enabled
    if (label.showBorder && label.borderStyle !== 'none') {
      ctx.strokeStyle = label.borderColor;
      ctx.lineWidth = label.borderWidth;

      // Apply border style
      switch (label.borderStyle) {
        case 'solid':
          ctx.setLineDash([]);
          break;
        case 'dashed':
          ctx.setLineDash([10, 5]);
          break;
        case 'dotted':
          ctx.setLineDash([2, 4]);
          break;
      }

      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
      ctx.setLineDash([]); // Reset
    }

    // Draw selection indicator (different from border)
    if (label.isSelected) {
      ctx.fillStyle = 'rgba(25, 113, 194, 0.1)';
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

      ctx.strokeStyle = '#1971c2';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
      ctx.setLineDash([]);
    }

    // Draw multi-line text
    ctx.fillStyle = label.color;
    const startY = y - (textHeight / 2) + (lineHeight / 2);
    lines.forEach((line, index) => {
      const lineY = startY + (index * lineHeight);
      ctx.fillText(line, x, lineY);
    });

    ctx.restore();
  }

  /**
   * Draw a text label in editing mode with cursor
   * Dynamic bounding box that adjusts as user types
   */
  private drawTextLabelEditing(
    label: TextLabel,
    text: string,
    cursorPosition: number,
    cursorVisible: boolean,
    selectionStart: number,
    selectionEnd: number
  ): void {
    const ctx = this.ctx;
    const { x, y } = label.position;

    ctx.save();

    // Set up font first for measurements
    ctx.font = `${label.fontSize}px ${label.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Split text into lines for multi-line support
    const lines = text ? text.split('\n') : [''];
    const lineHeight = label.fontSize * 1.4;
    const padding = 8;
    const verticalPadding = 4;

    // DYNAMIC: Measure text width for each line
    let maxWidth = 20;
    for (const line of lines) {
      // Use 'A' only for measuring empty lines, not for display
      const measureText = line || 'A';
      const metrics = ctx.measureText(measureText);
      maxWidth = Math.max(maxWidth, metrics.width);
    }
    const textWidth = maxWidth;
    const textHeight = lineHeight * lines.length;

    // Calculate box dimensions - DYNAMICALLY based on current text
    const boxWidth = textWidth + (padding * 2);
    const boxHeight = textHeight + (verticalPadding * 2);
    const boxX = x - boxWidth / 2;
    const boxY = y - boxHeight / 2;

    // Draw editing background (light blue highlight)
    ctx.fillStyle = 'rgba(25, 113, 194, 0.15)';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // Draw dotted border around editing area - DYNAMICALLY SIZED
    ctx.strokeStyle = '#1971c2';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.setLineDash([]);

    // Calculate cursor line and position within line
    let charsProcessed = 0;
    let cursorLineIndex = 0;
    let cursorPosInLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineTextLength = lines[i].length;
      // Each line except the last has a newline character after it
      const hasNewline = i < lines.length - 1;
      const lineLength = lineTextLength + (hasNewline ? 1 : 0);

      // If cursor is within this line's text OR at the newline position (but not after)
      if (cursorPosition <= charsProcessed + lineTextLength) {
        cursorLineIndex = i;
        cursorPosInLine = cursorPosition - charsProcessed;
        break;
      }

      // If this is the last line, cursor must be here
      if (i === lines.length - 1) {
        cursorLineIndex = i;
        cursorPosInLine = cursorPosition - charsProcessed;
        break;
      }

      charsProcessed += lineLength;
    }

    // Draw selection highlight if exists
    const hasSelection = selectionStart !== -1 && selectionEnd !== -1;
    const startY = y - (textHeight / 2) + (lineHeight / 2);

    if (hasSelection && text) {
      ctx.fillStyle = 'rgba(25, 113, 194, 0.3)'; // Light blue selection highlight

      // Calculate which lines and characters are selected
      let charsProcessed = 0;
      for (let i = 0; i < lines.length; i++) {
        const lineTextLength = lines[i].length;
        const hasNewline = i < lines.length - 1;
        const lineLength = lineTextLength + (hasNewline ? 1 : 0);
        const lineStart = charsProcessed;
        const lineEnd = charsProcessed + lineTextLength;

        // Check if this line has any selection
        if (selectionEnd > lineStart && selectionStart < lineEnd) {
          // Calculate selection bounds within this line
          const selStartInLine = Math.max(0, selectionStart - charsProcessed);
          const selEndInLine = Math.min(lineTextLength, selectionEnd - charsProcessed);

          const lineText = lines[i];
          const lineWidth = lineText ? ctx.measureText(lineText).width : 0;
          const lineStartX = x - lineWidth / 2;
          const lineY = startY + (i * lineHeight);

          // Measure text widths
          const textBeforeSelection = lineText.substring(0, selStartInLine);
          const selectedText = lineText.substring(selStartInLine, selEndInLine);
          const selectionStartX = lineStartX + ctx.measureText(textBeforeSelection).width;
          const selectionWidth = ctx.measureText(selectedText).width;

          // Draw selection rectangle
          ctx.fillRect(
            selectionStartX,
            lineY - lineHeight / 2,
            selectionWidth || 2, // Minimum width of 2px for empty selection
            lineHeight
          );
        }

        charsProcessed += lineLength;
      }
    }

    // Draw multi-line text
    ctx.fillStyle = label.color;
    lines.forEach((line, index) => {
      const lineY = startY + (index * lineHeight);
      ctx.fillText(line, x, lineY);
    });

    // Draw cursor (only if no selection)
    if (cursorVisible && !hasSelection) {
      const currentLine = lines[cursorLineIndex] || '';
      const textBeforeCursor = currentLine.substring(0, cursorPosInLine);
      const cursorOffset = ctx.measureText(textBeforeCursor).width;

      // For empty lines, use actual empty width (0), not 'A' placeholder
      const lineTextWidth = currentLine ? ctx.measureText(currentLine).width : 0;
      const lineStartX = x - lineTextWidth / 2;
      const cursorX = lineStartX + cursorOffset;
      const cursorY = startY + (cursorLineIndex * lineHeight);

      ctx.strokeStyle = label.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cursorX, cursorY - label.fontSize / 2);
      ctx.lineTo(cursorX, cursorY + label.fontSize / 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draw a node in editing mode with cursor
   */
  private drawNodeEditing(
    node: Node,
    text: string,
    cursorPosition: number,
    cursorVisible: boolean,
    selectionStart: number,
    selectionEnd: number
  ): void {
    const ctx = this.ctx;
    const { x, y } = node.position;

    ctx.save();

    // Draw the node circle (same as regular) - use lighter color for consistency
    ctx.fillStyle = getLighterColor(node.style.backgroundColor, 0.3);
    ctx.strokeStyle = node.style.strokeColor;
    ctx.lineWidth = node.style.strokeWidth;

    ctx.beginPath();
    ctx.arc(x, y, node.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw editing indicator (thicker border)
    ctx.strokeStyle = '#1971c2';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(x, y, node.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Set up text rendering
    ctx.fillStyle = node.style.strokeColor;
    ctx.font = `16px ${node.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(text || 'A').width;
    const textStartX = x - textWidth / 2;

    // Draw selection highlight if exists
    const hasSelection = selectionStart !== -1 && selectionEnd !== -1;
    if (hasSelection && text) {
      const start = Math.min(selectionStart, selectionEnd);
      const end = Math.max(selectionStart, selectionEnd);

      const textBeforeSelection = text.substring(0, start);
      const selectedText = text.substring(start, end);

      const beforeWidth = ctx.measureText(textBeforeSelection).width;
      const selectedWidth = ctx.measureText(selectedText).width;

      // Draw selection background
      ctx.fillStyle = 'rgba(25, 113, 194, 0.3)';
      ctx.fillRect(
        textStartX + beforeWidth,
        y - 10,
        selectedWidth,
        20
      );

      // Reset fill style for text
      ctx.fillStyle = node.style.strokeColor;
    }

    // Draw text
    if (text) {
      ctx.fillText(text, x, y);
    }

    // Draw cursor (only if no selection)
    if (cursorVisible && !hasSelection) {
      const textBeforeCursor = text.substring(0, cursorPosition);
      const cursorOffset = ctx.measureText(textBeforeCursor).width;
      const cursorX = textStartX + cursorOffset;

      ctx.strokeStyle = node.style.strokeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cursorX, y - 10);
      ctx.lineTo(cursorX, y + 10);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Wrap text to fit within maxWidth, respecting explicit newlines
   */
  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): void {
    // First split by explicit newlines
    const paragraphs = text.split('\n');
    const lines: string[] = [];

    // Process each paragraph with word wrapping
    for (const paragraph of paragraphs) {
      if (paragraph === '') {
        // Empty line - preserve it
        lines.push('');
        continue;
      }

      const words = paragraph.split(' ');
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
    }

    // Center the text vertically
    const totalHeight = lines.length * lineHeight;
    const startY = y - totalHeight / 2 + lineHeight / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, x, startY + i * lineHeight);
    });
  }

  /**
   * Draw selection box for multi-select
   * OOP Principle: Encapsulation - Uses SelectionBox's public interface
   */
  private drawSelectionBox(selectionBox: SelectionBox): void {
    const ctx = this.ctx;
    const topLeft = selectionBox.getTopLeft();
    const width = selectionBox.getWidth();
    const height = selectionBox.getHeight();

    ctx.save();

    // Fill with semi-transparent blue
    ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
    ctx.fillRect(topLeft.x, topLeft.y, width, height);

    // Border with dashed line
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(topLeft.x, topLeft.y, width, height);
    ctx.setLineDash([]);

    ctx.restore();
  }

  /**
   * Draw laser pointer trail with fading effect
   */
  private drawLaserTrail(laserTrail: LaserTrail): void {
    const ctx = this.ctx;
    const trailPoints = laserTrail.getTrailPoints();

    if (trailPoints.length === 0) return;

    ctx.save();

    // Draw trail as connected line segments
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw from oldest to newest
    for (let i = 0; i < trailPoints.length - 1; i++) {
      const current = trailPoints[i];
      const next = trailPoints[i + 1];

      // Line width increases towards the tip (current point)
      const baseWidth = 3;
      const tipWidth = 8;
      const progress = i / (trailPoints.length - 1);
      const lineWidth = baseWidth + (tipWidth - baseWidth) * progress;

      // Color with opacity based on age
      const opacity = current.opacity * 0.8; // Max 80% opacity
      ctx.strokeStyle = `rgba(255, 50, 50, ${opacity})`; // Red laser

      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(current.point.x, current.point.y);
      ctx.lineTo(next.point.x, next.point.y);
      ctx.stroke();
    }

    // Draw bright dot at the current position (tip of laser)
    const currentPoint = laserTrail.getCurrentPoint();
    if (currentPoint) {
      // Outer glow
      const gradient = ctx.createRadialGradient(
        currentPoint.x, currentPoint.y, 0,
        currentPoint.x, currentPoint.y, 15
      );
      gradient.addColorStop(0, 'rgba(255, 50, 50, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 100, 100, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 150, 150, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Bright center dot
      ctx.fillStyle = '#ff3232';
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Export whiteboard to JPEG
   * OOP Principle: Single Responsibility - Handles export rendering
   * Exports the whiteboard bounds (cropped to whiteboard rectangle)
   */
  exportToJPEG(diagram: Diagram, quality: number = 0.95): string {
    // Get whiteboard bounds
    const whiteboard = diagram.whiteboard;
    const bounds = whiteboard.getBounds();
    const whiteboardWidth = bounds.width;
    const whiteboardHeight = bounds.height;

    // Create high-resolution export canvas based on whiteboard dimensions
    const dpr = 2; // 2x resolution for crisp output
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = whiteboardWidth * dpr;
    exportCanvas.height = whiteboardHeight * dpr;

    const exportCtx = exportCanvas.getContext('2d')!;

    // Scale for high DPI
    exportCtx.scale(dpr, dpr);

    // Fill with white background (JPEG doesn't support transparency)
    exportCtx.fillStyle = '#ffffff';
    exportCtx.fillRect(0, 0, whiteboardWidth, whiteboardHeight);

    // Translate to whiteboard origin so (0,0) is at whiteboard top-left
    exportCtx.translate(-bounds.x, -bounds.y);

    // Temporarily swap context to render without selection indicators
    const originalCtx = this.ctx;
    this.ctx = exportCtx;

    // Render whiteboard content (without selection indicators)
    this.renderForExport(diagram);

    // Restore original context
    this.ctx = originalCtx;

    // Convert to JPEG data URL
    return exportCanvas.toDataURL('image/jpeg', quality);
  }

  /**
   * Export diagram as PNG (with white background)
   */
  exportToPNG(diagram: Diagram): string {
    // Get whiteboard bounds
    const whiteboard = diagram.whiteboard;
    const bounds = whiteboard.getBounds();
    const whiteboardWidth = bounds.width;
    const whiteboardHeight = bounds.height;

    // Create high-resolution export canvas based on whiteboard dimensions
    const dpr = 2; // 2x resolution for crisp output
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = whiteboardWidth * dpr;
    exportCanvas.height = whiteboardHeight * dpr;

    const exportCtx = exportCanvas.getContext('2d')!;

    // Scale for high DPI
    exportCtx.scale(dpr, dpr);

    // Fill with white background
    exportCtx.fillStyle = '#ffffff';
    exportCtx.fillRect(0, 0, whiteboardWidth, whiteboardHeight);

    // Translate to whiteboard origin so (0,0) is at whiteboard top-left
    exportCtx.translate(-bounds.x, -bounds.y);

    // Temporarily swap context to render without selection indicators
    const originalCtx = this.ctx;
    this.ctx = exportCtx;

    // Render whiteboard content (without selection indicators)
    this.renderForExport(diagram);

    // Restore original context
    this.ctx = originalCtx;

    // Convert to PNG data URL
    return exportCanvas.toDataURL('image/png');
  }

  /**
   * Render diagram for export (without selection indicators)
   */
  private renderForExport(diagram: Diagram): void {
    const nodes = diagram.getAllNodes();
    const arrows = diagram.getAllArrows();
    const labels = diagram.getAllTextLabels();

    // Draw arrows first (behind nodes)
    arrows.forEach(arrow => this.drawArrowForExport(arrow));

    // Draw text labels
    labels.forEach(label => this.drawTextLabelForExport(label));

    // Draw nodes (on top)
    nodes.forEach(node => this.drawNodeForExport(node));
  }

  /**
   * Draw node without selection indicator
   */
  private drawNodeForExport(node: Node): void {
    const ctx = this.ctx;
    const { x, y } = node.position;
    const radius = node.radius;

    ctx.save();

    // For hachure/cross-hatch: we need to use Path2D to preserve the path
    if (node.style.fillStyle === FillStyle.HACHURE || node.style.fillStyle === FillStyle.CROSS_HATCH) {
      // Create a Path2D that we can reuse
      const circlePath = new Path2D();
      const steps = 64;
      const roughness = this.roughness;

      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const wobble = (Math.random() - 0.5) * roughness;
        const r = radius + wobble;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;

        if (i === 0) {
          circlePath.moveTo(px, py);
        } else {
          circlePath.lineTo(px, py);
        }
      }
      circlePath.closePath();

      // Clip with the path
      ctx.save();
      ctx.clip(circlePath);
      this.drawHatchPattern(ctx, node.style.fillStyle, node.style.backgroundColor, x, y, radius);
      ctx.restore();

      // Stroke the SAME path
      ctx.strokeStyle = node.style.strokeColor;
      ctx.lineWidth = node.style.strokeWidth;
      ctx.stroke(circlePath);
    } else {
      // For solid and none: simpler approach
      ctx.beginPath();
      this.drawRoughCircle(x, y, radius);

      if (node.style.fillStyle === FillStyle.SOLID) {
        ctx.fillStyle = getLighterColor(node.style.backgroundColor, 0.3);
        ctx.fill();
      }

      ctx.strokeStyle = node.style.strokeColor;
      ctx.lineWidth = node.style.strokeWidth;
      ctx.stroke();
    }

    // Draw text
    ctx.fillStyle = node.style.strokeColor;
    ctx.font = `${16}px ${node.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Wrap text if too long
    const maxWidth = radius * 1.6;
    this.wrapText(ctx, node.text, x, y, maxWidth, 20);

    ctx.restore();
  }

  /**
   * Draw arrow without selection indicator
   */
  private drawArrowForExport(arrow: Arrow): void {
    const ctx = this.ctx;
    const start = arrow.getStartPoint();
    const end = arrow.getEndPoint();
    const angle = arrow.getAngle();

    ctx.save();

    // Set line style (solid, dashed, or dotted)
    if (arrow.lineStyle === LineStyle.DASHED) {
      ctx.setLineDash([10, 5]);
    } else if (arrow.lineStyle === LineStyle.DOTTED) {
      ctx.setLineDash([2, 4]);
    } else {
      ctx.setLineDash([]);
    }

    // Draw line
    ctx.strokeStyle = arrow.strokeColor;
    ctx.lineWidth = arrow.strokeWidth;
    ctx.beginPath();
    this.drawRoughLine(start, end);
    ctx.stroke();

    // Reset line dash for arrowhead
    ctx.setLineDash([]);

    // Draw arrowhead
    this.drawArrowhead(end, angle);

    ctx.restore();
  }

  /**
   * Draw text label without selection indicator
   */
  private drawTextLabelForExport(label: TextLabel): void {
    const ctx = this.ctx;
    const { x, y } = label.position;

    ctx.save();

    // Set up font for text measurement
    ctx.font = `${label.fontSize}px ${label.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Measure text to calculate bounding box
    const metrics = ctx.measureText(label.text || 'A');
    const textWidth = Math.max(metrics.width, 20);
    const textHeight = label.fontSize * 1.4;

    // Calculate box dimensions with padding
    const boxWidth = textWidth + (label.padding * 2);
    const boxHeight = textHeight + (label.padding / 2 * 2);
    const boxX = x - boxWidth / 2;
    const boxY = y - boxHeight / 2;

    // Draw custom border if enabled
    if (label.showBorder && label.borderStyle !== 'none') {
      ctx.strokeStyle = label.borderColor;
      ctx.lineWidth = label.borderWidth;

      // Apply border style
      switch (label.borderStyle) {
        case 'solid':
          ctx.setLineDash([]);
          break;
        case 'dashed':
          ctx.setLineDash([10, 5]);
          break;
        case 'dotted':
          ctx.setLineDash([2, 4]);
          break;
      }

      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
      ctx.setLineDash([]); // Reset
    }

    // Draw text
    ctx.fillStyle = label.color;
    ctx.fillText(label.text, x, y);

    ctx.restore();
  }

  /**
   * Draw the whiteboard (base workspace)
   */
  private drawWhiteboard(whiteboard: any): void {
    const ctx = this.ctx;
    const { x, y, width, height } = whiteboard.getBounds();

    ctx.save();

    // Draw white rectangle with subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = whiteboard.backgroundColor;
    ctx.fillRect(x, y, width, height);

    // Draw border
    ctx.shadowColor = 'transparent';

    // Different border color when selected
    if (whiteboard.isSelected()) {
      ctx.strokeStyle = '#228be6';
      ctx.lineWidth = 2;
    } else {
      ctx.strokeStyle = '#d0d0d0';
      ctx.lineWidth = 1;
    }
    ctx.strokeRect(x, y, width, height);

    ctx.restore();

    // Draw resize handles only if whiteboard is selected
    if (whiteboard.isSelected()) {
      this.drawWhiteboardResizeHandles(whiteboard);
    }
  }

  /**
   * Draw resize handles for the whiteboard
   */
  private drawWhiteboardResizeHandles(whiteboard: any): void {
    const ctx = this.ctx;
    const { x, y, width, height } = whiteboard.getBounds();
    const handleSize = 12;
    const halfHandle = handleSize / 2;

    ctx.save();

    // Handle style
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#228be6';
    ctx.lineWidth = 2;

    // Define handle positions
    const handles = [
      // Corners
      { x: x, y: y },                           // top-left
      { x: x + width, y: y },                   // top-right
      { x: x + width, y: y + height },          // bottom-right
      { x: x, y: y + height },                  // bottom-left
      // Edges
      { x: x + width / 2, y: y },               // top
      { x: x + width, y: y + height / 2 },      // right
      { x: x + width / 2, y: y + height },      // bottom
      { x: x, y: y + height / 2 },              // left
    ];

    // Draw each handle
    handles.forEach(handle => {
      ctx.fillRect(
        handle.x - halfHandle,
        handle.y - halfHandle,
        handleSize,
        handleSize
      );
      ctx.strokeRect(
        handle.x - halfHandle,
        handle.y - halfHandle,
        handleSize,
        handleSize
      );
    });

    ctx.restore();
  }

  /**
   * Convert mouse coordinates to cursor position in text
   * Returns the character index where the cursor should be placed
   * Handles multi-line text and center-aligned text
   */
  getCursorPositionFromMouseClick(
    element: Node | TextLabel,
    clickPoint: Point,
    text: string
  ): number {
    const ctx = this.ctx;
    ctx.save();

    // Determine font properties based on element type
    let fontSize: number;
    let fontFamily: string;
    let centerX: number;
    let centerY: number;

    if ('radius' in element) {
      // Node
      fontSize = 18;
      fontFamily = element.fontFamily;
      centerX = element.position.x;
      centerY = element.position.y;
    } else {
      // TextLabel
      fontSize = element.fontSize;
      fontFamily = element.fontFamily;
      centerX = element.position.x;
      centerY = element.position.y;
    }

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';

    const lines = text ? text.split('\n') : [''];
    const lineHeight = fontSize * 1.4;

    // Calculate starting Y position
    const textHeight = lineHeight * lines.length;
    const startY = centerY - (textHeight / 2) + (lineHeight / 2);

    // Find which line was clicked
    let clickedLineIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineY = startY + (i * lineHeight);
      const lineTop = lineY - lineHeight / 2;
      const lineBottom = lineY + lineHeight / 2;

      if (clickPoint.y >= lineTop && clickPoint.y <= lineBottom) {
        clickedLineIndex = i;
        break;
      }

      // If click is below all lines, use last line
      if (i === lines.length - 1) {
        clickedLineIndex = i;
      }
    }

    // Find position within the clicked line
    const clickedLine = lines[clickedLineIndex] || '';
    const lineWidth = clickedLine ? ctx.measureText(clickedLine).width : 0;
    const lineStartX = centerX - lineWidth / 2;

    // Find character position in line by measuring progressively
    let closestPos = 0;
    let closestDistance = Math.abs(clickPoint.x - lineStartX);

    for (let i = 0; i <= clickedLine.length; i++) {
      const textBeforePos = clickedLine.substring(0, i);
      const width = ctx.measureText(textBeforePos).width;
      const charX = lineStartX + width;
      const distance = Math.abs(clickPoint.x - charX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestPos = i;
      }
    }

    // Convert line position to absolute cursor position
    let absolutePosition = 0;
    for (let i = 0; i < clickedLineIndex; i++) {
      absolutePosition += lines[i].length + 1; // +1 for newline
    }
    absolutePosition += closestPos;

    ctx.restore();
    return absolutePosition;
  }

  /**
   * Get selection range from mouse drag in text
   * Returns [start, end] where start <= end
   */
  getSelectionFromMouseDrag(
    element: Node | TextLabel,
    startPoint: Point,
    endPoint: Point,
    text: string
  ): [number, number] {
    const startPos = this.getCursorPositionFromMouseClick(element, startPoint, text);
    const endPos = this.getCursorPositionFromMouseClick(element, endPoint, text);

    return [Math.min(startPos, endPos), Math.max(startPos, endPos)];
  }

  /**
   * Find word boundaries at a given cursor position
   * Returns [start, end] of the word at the cursor position
   * A word is defined as contiguous alphanumeric characters and underscores
   */
  getWordBoundariesAtPosition(text: string, cursorPosition: number): [number, number] {
    if (!text || text.length === 0) {
      return [0, 0];
    }

    // Clamp cursor position to valid range
    const pos = Math.max(0, Math.min(cursorPosition, text.length));

    // If cursor is at the very end or on whitespace/punctuation, return no selection
    if (pos >= text.length) {
      return [pos, pos];
    }

    // Check if we're on a word character
    const onWordChar = this.isWordCharacter(text[pos]);

    if (!onWordChar) {
      // Not on a word character (whitespace, punctuation, etc.)
      return [pos, pos];
    }

    // Find start of word (move backwards while on word characters)
    let start = pos;
    while (start > 0 && this.isWordCharacter(text[start - 1])) {
      start--;
    }

    // Find end of word (move forwards while on word characters)
    let end = pos;
    while (end < text.length && this.isWordCharacter(text[end])) {
      end++;
    }

    return [start, end];
  }

  /**
   * Check if a character is part of a word
   * Word characters: alphanumeric (a-z, A-Z, 0-9) and underscore (_)
   */
  private isWordCharacter(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }
}
