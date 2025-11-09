/**
 * Available colors for elements
 */
export enum Color {
  BLACK = '#1e1e1e',
  GRAY = '#gray',
  RED = '#e03131',
  PINK = '#f06595',
  GRAPE = '#9c36b5',
  VIOLET = '#7950f2',
  INDIGO = '#4c6ef5',
  BLUE = '#228be6',
  CYAN = '#15aabf',
  TEAL = '#12b886',
  GREEN = '#40c057',
  LIME = '#82c91e',
  YELLOW = '#fab005',
  ORANGE = '#fd7e14',
}

/**
 * Stroke widths
 */
export enum StrokeWidth {
  THIN = 1,
  MEDIUM = 2,
  THICK = 4,
  EXTRA_THICK = 8,
}

/**
 * Fill styles
 */
export enum FillStyle {
  SOLID = 'solid',
  HACHURE = 'hachure',
  CROSS_HATCH = 'cross-hatch',
  NONE = 'none',
}

/**
 * Border styles for text labels
 */
export enum BorderStyle {
  NONE = 'none',
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
}

/**
 * Line styles for arrows
 */
export enum LineStyle {
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
}

/**
 * Style configuration for drawable elements
 */
export interface StyleConfig {
  strokeColor: Color;
  backgroundColor: Color;
  fillStyle: FillStyle;
  strokeWidth: StrokeWidth;
  opacity: number;
}

/**
 * Default style configuration
 */
export const DEFAULT_STYLE: StyleConfig = {
  strokeColor: Color.BLACK,
  backgroundColor: Color.BLUE,
  fillStyle: FillStyle.SOLID,
  strokeWidth: StrokeWidth.MEDIUM,
  opacity: 1,
};

/**
 * Get a lighter version of a color for fills
 */
export function getLighterColor(color: Color, opacity: number = 0.2): string {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
}
