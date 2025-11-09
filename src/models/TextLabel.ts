import { Point } from './Point';
import { Color, BorderStyle, StrokeWidth } from './Style';
import { FontFamily } from './FontFamily';

/**
 * Represents a standalone text label on the canvas
 */
export class TextLabel {
  private static nextId = 0;

  public readonly id: string;
  public position: Point;
  public text: string;
  public fontSize: number = 16;
  public isSelected: boolean = false;
  public isDragging: boolean = false;
  public width: number = 100;
  public height: number = 30;
  public color: Color = Color.BLACK;
  public fontFamily: FontFamily = FontFamily.HAND_DRAWN;

  // Border properties
  public showBorder: boolean = false;
  public borderStyle: BorderStyle = BorderStyle.SOLID;
  public borderColor: Color = Color.BLACK;
  public borderWidth: StrokeWidth = StrokeWidth.THIN;
  public padding: number = 8; // Padding inside the border

  constructor(position: Point, text: string = 'Text') {
    this.id = `text-${TextLabel.nextId++}`;
    this.position = position;
    this.text = text;
  }

  /**
   * Check if a point is inside this text label's bounds
   */
  containsPoint(point: Point): boolean {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    return (
      point.x >= this.position.x - halfWidth &&
      point.x <= this.position.x + halfWidth &&
      point.y >= this.position.y - halfHeight &&
      point.y <= this.position.y + halfHeight
    );
  }

  /**
   * Update the position of the text label
   */
  moveTo(position: Point): void {
    this.position = position;
  }

  /**
   * Move the text label by a delta
   */
  moveBy(delta: Point): void {
    this.position = this.position.add(delta);
  }

  /**
   * Update the text content
   */
  setText(text: string): void {
    this.text = text;
    // Estimate width based on text length
    this.width = Math.max(100, text.length * 10);
  }

  /**
   * Select or deselect the text label
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
   * Set color
   */
  setColor(color: Color): void {
    this.color = color;
  }

  /**
   * Set font family
   */
  setFontFamily(fontFamily: FontFamily): void {
    this.fontFamily = fontFamily;
  }

  /**
   * Set font size
   */
  setFontSize(size: number): void {
    this.fontSize = size;
  }

  /**
   * Set border visibility
   */
  setShowBorder(show: boolean): void {
    this.showBorder = show;
  }

  /**
   * Set border style
   */
  setBorderStyle(style: BorderStyle): void {
    this.borderStyle = style;
  }

  /**
   * Set border color
   */
  setBorderColor(color: Color): void {
    this.borderColor = color;
  }

  /**
   * Set border width
   */
  setBorderWidth(width: StrokeWidth): void {
    this.borderWidth = width;
  }

  /**
   * Set padding
   */
  setPadding(padding: number): void {
    this.padding = padding;
  }

  /**
   * Clone this text label
   */
  clone(): TextLabel {
    const label = new TextLabel(this.position.clone(), this.text);
    label.fontSize = this.fontSize;
    label.isSelected = this.isSelected;
    label.isDragging = this.isDragging;
    label.width = this.width;
    label.height = this.height;
    label.color = this.color;
    label.fontFamily = this.fontFamily;
    // Clone border properties
    label.showBorder = this.showBorder;
    label.borderStyle = this.borderStyle;
    label.borderColor = this.borderColor;
    label.borderWidth = this.borderWidth;
    label.padding = this.padding;
    return label;
  }

  /**
   * Serialize to JSON for sharing/storage
   */
  toJSON(): any {
    return {
      id: this.id,
      position: { x: this.position.x, y: this.position.y },
      text: this.text,
      fontSize: this.fontSize,
      width: this.width,
      height: this.height,
      color: this.color,
      fontFamily: this.fontFamily,
      showBorder: this.showBorder,
      borderStyle: this.borderStyle,
      borderColor: this.borderColor,
      borderWidth: this.borderWidth,
      padding: this.padding
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(data: any): TextLabel {
    const label = new TextLabel(
      new Point(data.position.x, data.position.y),
      data.text
    );
    // Preserve the original ID
    (label as any).id = data.id;
    label.fontSize = data.fontSize;
    label.width = data.width;
    label.height = data.height;
    label.color = data.color;
    label.fontFamily = data.fontFamily;
    label.showBorder = data.showBorder;
    label.borderStyle = data.borderStyle;
    label.borderColor = data.borderColor;
    label.borderWidth = data.borderWidth;
    label.padding = data.padding;
    return label;
  }
}
