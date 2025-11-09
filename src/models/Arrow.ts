import { Node } from './Node';
import { Point } from './Point';
import { Color, StrokeWidth, LineStyle } from './Style';

/**
 * Represents an arrow connection between two nodes
 */
export class Arrow {
  private static nextId = 0;

  public readonly id: string;
  public fromNode: Node;
  public toNode: Node;
  public isSelected: boolean = false;
  public strokeColor: Color = Color.BLACK;
  public strokeWidth: StrokeWidth = StrokeWidth.MEDIUM;
  public lineStyle: LineStyle = LineStyle.SOLID;

  constructor(fromNode: Node, toNode: Node, strokeColor?: Color, strokeWidth?: StrokeWidth, lineStyle?: LineStyle) {
    this.id = `arrow-${Arrow.nextId++}`;
    this.fromNode = fromNode;
    this.toNode = toNode;
    if (strokeColor) this.strokeColor = strokeColor;
    if (strokeWidth) this.strokeWidth = strokeWidth;
    if (lineStyle) this.lineStyle = lineStyle;
  }

  /**
   * Get the start point of the arrow (on the edge of the from node)
   */
  getStartPoint(): Point {
    return this.fromNode.getEdgePoint(this.toNode.getCenter());
  }

  /**
   * Get the end point of the arrow (on the edge of the to node)
   */
  getEndPoint(): Point {
    return this.toNode.getEdgePoint(this.fromNode.getCenter());
  }

  /**
   * Get the angle of the arrow
   */
  getAngle(): number {
    const start = this.getStartPoint();
    const end = this.getEndPoint();
    return Math.atan2(end.y - start.y, end.x - start.x);
  }

  /**
   * Check if a point is close to this arrow line
   */
  containsPoint(point: Point, threshold: number = 10): boolean {
    const start = this.getStartPoint();
    const end = this.getEndPoint();

    // Calculate distance from point to line segment
    const lineLength = start.distanceTo(end);
    if (lineLength === 0) return false;

    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - start.x) * (end.x - start.x) +
          (point.y - start.y) * (end.y - start.y)) /
          (lineLength * lineLength)
      )
    );

    const projection = new Point(
      start.x + t * (end.x - start.x),
      start.y + t * (end.y - start.y)
    );

    return point.distanceTo(projection) <= threshold;
  }

  /**
   * Select or deselect the arrow
   */
  setSelected(selected: boolean): void {
    this.isSelected = selected;
  }

  /**
   * Set stroke color
   */
  setStrokeColor(color: Color): void {
    this.strokeColor = color;
  }

  /**
   * Set stroke width
   */
  setStrokeWidth(width: StrokeWidth): void {
    this.strokeWidth = width;
  }

  /**
   * Set line style
   */
  setLineStyle(style: LineStyle): void {
    this.lineStyle = style;
  }

  /**
   * Serialize to JSON for sharing/storage
   * Note: We store node IDs, not the full node objects
   */
  toJSON(): any {
    return {
      id: this.id,
      fromNodeId: this.fromNode.id,
      toNodeId: this.toNode.id,
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      lineStyle: this.lineStyle
    };
  }

  /**
   * Deserialize from JSON
   * Note: This requires a node lookup map to reconnect arrows to nodes
   */
  static fromJSON(data: any, nodeMap: Map<string, Node>): Arrow {
    const fromNode = nodeMap.get(data.fromNodeId);
    const toNode = nodeMap.get(data.toNodeId);

    if (!fromNode || !toNode) {
      throw new Error(`Arrow references missing nodes: ${data.fromNodeId} -> ${data.toNodeId}`);
    }

    const arrow = new Arrow(fromNode, toNode, data.strokeColor, data.strokeWidth, data.lineStyle);
    // Preserve the original ID
    (arrow as any).id = data.id;
    return arrow;
  }
}
