import { Point } from './Point';

/**
 * Represents a rectangular selection box for multi-selecting elements
 * Follows OOP principle: Single Responsibility - only manages selection box geometry
 */
export class SelectionBox {
  private startPoint: Point;
  private endPoint: Point;

  constructor(startPoint: Point) {
    this.startPoint = startPoint;
    this.endPoint = startPoint.clone();
  }

  /**
   * Update the end point of the selection box
   * Encapsulation: Controlled modification of internal state
   */
  updateEndPoint(endPoint: Point): void {
    this.endPoint = endPoint;
  }

  /**
   * Get the top-left corner of the selection box
   * Abstraction: Hide min/max calculation details
   */
  getTopLeft(): Point {
    return new Point(
      Math.min(this.startPoint.x, this.endPoint.x),
      Math.min(this.startPoint.y, this.endPoint.y)
    );
  }

  /**
   * Get the bottom-right corner of the selection box
   */
  getBottomRight(): Point {
    return new Point(
      Math.max(this.startPoint.x, this.endPoint.x),
      Math.max(this.startPoint.y, this.endPoint.y)
    );
  }

  /**
   * Get the width of the selection box
   */
  getWidth(): number {
    return Math.abs(this.endPoint.x - this.startPoint.x);
  }

  /**
   * Get the height of the selection box
   */
  getHeight(): number {
    return Math.abs(this.endPoint.y - this.startPoint.y);
  }

  /**
   * Get the center point of the selection box
   */
  getCenter(): Point {
    const topLeft = this.getTopLeft();
    const bottomRight = this.getBottomRight();
    return new Point(
      (topLeft.x + bottomRight.x) / 2,
      (topLeft.y + bottomRight.y) / 2
    );
  }

  /**
   * Check if a point is inside the selection box
   * Information Hiding: Complex intersection logic hidden behind simple interface
   */
  containsPoint(point: Point): boolean {
    const topLeft = this.getTopLeft();
    const bottomRight = this.getBottomRight();

    return (
      point.x >= topLeft.x &&
      point.x <= bottomRight.x &&
      point.y >= topLeft.y &&
      point.y <= bottomRight.y
    );
  }

  /**
   * Check if a rectangular area intersects with the selection box
   * Used for detecting if nodes/elements overlap with selection
   */
  intersectsRect(center: Point, width: number, height: number): boolean {
    const topLeft = this.getTopLeft();
    const bottomRight = this.getBottomRight();

    const rectLeft = center.x - width / 2;
    const rectRight = center.x + width / 2;
    const rectTop = center.y - height / 2;
    const rectBottom = center.y + height / 2;

    return !(
      rectRight < topLeft.x ||
      rectLeft > bottomRight.x ||
      rectBottom < topLeft.y ||
      rectTop > bottomRight.y
    );
  }

  /**
   * Check if a circle intersects with the selection box
   * Used for detecting if circular nodes overlap with selection
   */
  intersectsCircle(center: Point, radius: number): boolean {
    const topLeft = this.getTopLeft();
    const bottomRight = this.getBottomRight();

    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(topLeft.x, Math.min(center.x, bottomRight.x));
    const closestY = Math.max(topLeft.y, Math.min(center.y, bottomRight.y));

    const closestPoint = new Point(closestX, closestY);
    const distance = center.distanceTo(closestPoint);

    return distance <= radius;
  }

  /**
   * Check if the selection box is large enough to be considered valid
   * Prevents accidental selections from tiny drags
   */
  isSignificant(minSize: number = 5): boolean {
    return this.getWidth() >= minSize || this.getHeight() >= minSize;
  }

  /**
   * Get all four corners of the selection box
   * Useful for rendering or collision detection
   */
  getCorners(): Point[] {
    const topLeft = this.getTopLeft();
    const bottomRight = this.getBottomRight();

    return [
      topLeft,
      new Point(bottomRight.x, topLeft.y),
      bottomRight,
      new Point(topLeft.x, bottomRight.y),
    ];
  }

  /**
   * Clone this selection box
   * Enables creating copies without sharing state
   */
  clone(): SelectionBox {
    const box = new SelectionBox(this.startPoint.clone());
    box.endPoint = this.endPoint.clone();
    return box;
  }

  /**
   * Get the start point (for rendering)
   */
  getStartPoint(): Point {
    return this.startPoint.clone();
  }

  /**
   * Get the end point (for rendering)
   */
  getEndPoint(): Point {
    return this.endPoint.clone();
  }
}
