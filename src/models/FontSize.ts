/**
 * Font size options for text labels
 */
export enum FontSize {
  SMALL = 12,
  MEDIUM = 16,
  LARGE = 48,
}

/**
 * Display names for font sizes
 */
export const FONT_SIZE_NAMES: Record<FontSize, string> = {
  [FontSize.SMALL]: 'Small',
  [FontSize.MEDIUM]: 'Medium',
  [FontSize.LARGE]: 'Large',
};
