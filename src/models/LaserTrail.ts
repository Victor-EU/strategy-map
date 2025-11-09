import { Point } from './Point';

/**
 * Represents a single point in the laser trail
 */
interface TrailPoint {
  point: Point;
  timestamp: number;
}

/**
 * LaserTrail - Manages the laser pointer trail effect
 *
 * OOP Principles:
 * - Single Responsibility: Manages only laser trail data
 * - Encapsulation: Hides internal trail management
 * - Clean interface for adding points and getting renderable data
 */
export class LaserTrail {
  private trail: TrailPoint[] = [];
  private readonly maxAge: number; // milliseconds before point disappears
  private readonly maxPoints: number; // maximum trail length

  constructor(maxAge: number = 800, maxPoints: number = 100) {
    this.maxAge = maxAge;
    this.maxPoints = maxPoints;
  }

  /**
   * Add a new point to the trail
   */
  addPoint(point: Point): void {
    this.trail.push({
      point,
      timestamp: Date.now()
    });

    // Limit trail length
    if (this.trail.length > this.maxPoints) {
      this.trail.shift();
    }
  }

  /**
   * Clean up old trail points
   */
  cleanup(): void {
    const now = Date.now();
    this.trail = this.trail.filter(tp => now - tp.timestamp < this.maxAge);
  }

  /**
   * Get all trail points with their age-based opacity
   * Returns array of { point, opacity } for rendering
   */
  getTrailPoints(): Array<{ point: Point; opacity: number }> {
    const now = Date.now();

    return this.trail.map(tp => {
      const age = now - tp.timestamp;
      // Opacity decreases linearly from 1.0 to 0.0 over maxAge
      const opacity = Math.max(0, 1 - (age / this.maxAge));

      return {
        point: tp.point,
        opacity
      };
    });
  }

  /**
   * Clear all trail points
   */
  clear(): void {
    this.trail = [];
  }

  /**
   * Check if trail has any visible points
   */
  isEmpty(): boolean {
    return this.trail.length === 0;
  }

  /**
   * Get the most recent point (current laser position)
   */
  getCurrentPoint(): Point | null {
    if (this.trail.length === 0) return null;
    return this.trail[this.trail.length - 1].point;
  }
}
