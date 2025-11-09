import { Point } from './Point';
import { StyleConfig, DEFAULT_STYLE } from './Style';
import { FontFamily } from './FontFamily';

/**
 * Represents a node (circle) in the strategy diagram
 */
export class Node {
  private static nextId = 0;

  public readonly id: string;
  public position: Point;
  public text: string;
  public radius: number = 60;
  public isSelected: boolean = false;
  public isDragging: boolean = false;
  public style: StyleConfig;
  public fontFamily: FontFamily = FontFamily.HAND_DRAWN;

  constructor(position: Point, text: string = 'Node', style?: Partial<StyleConfig>) {
    this.id = `node-${Node.nextId++}`;
    this.position = position;
    this.text = text;
    this.style = { ...DEFAULT_STYLE, ...style };
  }

  /**
   * Check if a point is inside this node
   */
  containsPoint(point: Point): boolean {
    return this.position.distanceTo(point) <= this.radius;
  }

  /**
   * Update the position of the node
   */
  moveTo(position: Point): void {
    this.position = position;
  }

  /**
   * Move the node by a delta
   */
  moveBy(delta: Point): void {
    this.position = this.position.add(delta);
  }

  /**
   * Update the text content
   */
  setText(text: string): void {
    this.text = text;
  }

  /**
   * Select or deselect the node
   */
  setSelected(selected: boolean): void {
    this.isSelected = selected;
  }

  /**
   * Set dragging state
   */
  setDragging(dragging: boolean): void {
    this.isDragging = dragging;
  }

  /**
   * Get the center position of the node
   */
  getCenter(): Point {
    return this.position.clone();
  }

  /**
   * Get a point on the edge of the circle in the direction of another point
   */
  getEdgePoint(targetPoint: Point): Point {
    const angle = Math.atan2(
      targetPoint.y - this.position.y,
      targetPoint.x - this.position.x
    );
    return new Point(
      this.position.x + Math.cos(angle) * this.radius,
      this.position.y + Math.sin(angle) * this.radius
    );
  }

  /**
   * Update the style
   */
  setStyle(style: Partial<StyleConfig>): void {
    this.style = { ...this.style, ...style };
  }

  /**
   * Set font family
   */
  setFontFamily(fontFamily: FontFamily): void {
    this.fontFamily = fontFamily;
  }

  /**
   * Clone this node
   */
  clone(): Node {
    const node = new Node(this.position.clone(), this.text, this.style);
    node.radius = this.radius;
    node.isSelected = this.isSelected;
    node.isDragging = this.isDragging;
    node.fontFamily = this.fontFamily;
    return node;
  }

  /**
   * Serialize to JSON for sharing/storage
   */
  toJSON(): any {
    return {
      id: this.id,
      position: { x: this.position.x, y: this.position.y },
      text: this.text,
      radius: this.radius,
      style: this.style,
      fontFamily: this.fontFamily
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(data: any): Node {
    const node = new Node(
      new Point(data.position.x, data.position.y),
      data.text,
      data.style
    );
    // Preserve the original ID
    (node as any).id = data.id;
    node.radius = data.radius;
    node.fontFamily = data.fontFamily;
    return node;
  }
}
