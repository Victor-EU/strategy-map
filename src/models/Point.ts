/**
 * Represents a 2D point in canvas coordinates
 */
export class Point {
  constructor(
    public x: number,
    public y: number
  ) {}

  /**
   * Calculate distance to another point
   */
  distanceTo(other: Point): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Add another point to this point
   */
  add(other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y);
  }

  /**
   * Subtract another point from this point
   */
  subtract(other: Point): Point {
    return new Point(this.x - other.x, this.y - other.y);
  }

  /**
   * Create a copy of this point
   */
  clone(): Point {
    return new Point(this.x, this.y);
  }
}
