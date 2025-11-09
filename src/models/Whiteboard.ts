import { Point } from './Point';

/**
 * Whiteboard - Represents the main workspace area
 * OOP Principle: Single Responsibility - Manages whiteboard dimensions and position
 */
export class Whiteboard {
  private static nextId = 0;

  public readonly id: string;
  public position: Point;  // Top-left corner
  public width: number;
  public height: number;
  public backgroundColor: string;
  private selected: boolean = false;

  constructor(
    position: Point = new Point(0, 0),
    width: number = 1600,
    height: number = 1200,
    backgroundColor: string = '#ffffff'
  ) {
    this.id = `whiteboard-${Whiteboard.nextId++}`;
    this.position = position;
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
  }

  /**
   * Set selected state
   */
  setSelected(selected: boolean): void {
    this.selected = selected;
  }

  /**
   * Get selected state
   */
  isSelected(): boolean {
    return this.selected;
  }

  /**
   * Check if a point is inside the whiteboard
   */
  containsPoint(point: Point): boolean {
    return (
      point.x >= this.position.x &&
      point.x <= this.position.x + this.width &&
      point.y >= this.position.y &&
      point.y <= this.position.y + this.height
    );
  }

  /**
   * Get center point of whiteboard
   */
  getCenter(): Point {
    return new Point(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }

  /**
   * Get bounds of whiteboard
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Resize whiteboard from a specific handle
   */
  resize(handle: ResizeHandle, delta: Point): void {
    switch (handle) {
      case ResizeHandle.TOP_LEFT:
        this.position.x += delta.x;
        this.position.y += delta.y;
        this.width -= delta.x;
        this.height -= delta.y;
        break;
      case ResizeHandle.TOP:
        this.position.y += delta.y;
        this.height -= delta.y;
        break;
      case ResizeHandle.TOP_RIGHT:
        this.position.y += delta.y;
        this.width += delta.x;
        this.height -= delta.y;
        break;
      case ResizeHandle.RIGHT:
        this.width += delta.x;
        break;
      case ResizeHandle.BOTTOM_RIGHT:
        this.width += delta.x;
        this.height += delta.y;
        break;
      case ResizeHandle.BOTTOM:
        this.height += delta.y;
        break;
      case ResizeHandle.BOTTOM_LEFT:
        this.position.x += delta.x;
        this.width -= delta.x;
        this.height += delta.y;
        break;
      case ResizeHandle.LEFT:
        this.position.x += delta.x;
        this.width -= delta.x;
        break;
    }

    // Enforce minimum dimensions
    const minWidth = 400;
    const minHeight = 300;

    if (this.width < minWidth) {
      if (handle === ResizeHandle.LEFT || handle === ResizeHandle.TOP_LEFT || handle === ResizeHandle.BOTTOM_LEFT) {
        this.position.x -= (minWidth - this.width);
      }
      this.width = minWidth;
    }

    if (this.height < minHeight) {
      if (handle === ResizeHandle.TOP || handle === ResizeHandle.TOP_LEFT || handle === ResizeHandle.TOP_RIGHT) {
        this.position.y -= (minHeight - this.height);
      }
      this.height = minHeight;
    }
  }

  /**
   * Get resize handle at a point (for cursor interaction)
   */
  getResizeHandleAtPoint(point: Point, handleSize: number = 12): ResizeHandle | null {
    const { x, y, width, height } = this.getBounds();
    const halfSize = handleSize / 2;

    // Check corners first (higher priority)
    if (this.isNearPoint(point, new Point(x, y), halfSize)) {
      return ResizeHandle.TOP_LEFT;
    }
    if (this.isNearPoint(point, new Point(x + width, y), halfSize)) {
      return ResizeHandle.TOP_RIGHT;
    }
    if (this.isNearPoint(point, new Point(x + width, y + height), halfSize)) {
      return ResizeHandle.BOTTOM_RIGHT;
    }
    if (this.isNearPoint(point, new Point(x, y + height), halfSize)) {
      return ResizeHandle.BOTTOM_LEFT;
    }

    // Check edges
    if (this.isNearPoint(point, new Point(x + width / 2, y), halfSize)) {
      return ResizeHandle.TOP;
    }
    if (this.isNearPoint(point, new Point(x + width, y + height / 2), halfSize)) {
      return ResizeHandle.RIGHT;
    }
    if (this.isNearPoint(point, new Point(x + width / 2, y + height), halfSize)) {
      return ResizeHandle.BOTTOM;
    }
    if (this.isNearPoint(point, new Point(x, y + height / 2), halfSize)) {
      return ResizeHandle.LEFT;
    }

    return null;
  }

  private isNearPoint(p1: Point, p2: Point, threshold: number): boolean {
    return Math.abs(p1.x - p2.x) <= threshold && Math.abs(p1.y - p2.y) <= threshold;
  }

  /**
   * Clone whiteboard (for duplication)
   * Creates a new whiteboard with same properties but new ID
   */
  clone(): Whiteboard {
    const cloned = new Whiteboard(
      this.position.clone(),
      this.width,
      this.height,
      this.backgroundColor
    );
    return cloned;
  }

  /**
   * Serialize whiteboard to JSON
   */
  toJSON(): any {
    return {
      id: this.id,
      position: { x: this.position.x, y: this.position.y },
      width: this.width,
      height: this.height,
      backgroundColor: this.backgroundColor,
    };
  }

  /**
   * Deserialize whiteboard from JSON
   */
  static fromJSON(data: any): Whiteboard {
    return new Whiteboard(
      new Point(data.position.x, data.position.y),
      data.width,
      data.height,
      data.backgroundColor
    );
  }
}

/**
 * Resize handle positions
 */
export enum ResizeHandle {
  TOP_LEFT = 'top-left',
  TOP = 'top',
  TOP_RIGHT = 'top-right',
  RIGHT = 'right',
  BOTTOM_RIGHT = 'bottom-right',
  BOTTOM = 'bottom',
  BOTTOM_LEFT = 'bottom-left',
  LEFT = 'left',
}
