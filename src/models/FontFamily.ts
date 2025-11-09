/**
 * Available font families for text rendering
 */
export enum FontFamily {
  HAND_DRAWN = 'Virgil, Segoe UI Emoji',
  NORMAL = '-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif',
  CODE = 'Cascadia, Consolas, Monaco, Courier New, monospace',
}

export const FONT_FAMILY_NAMES: Record<FontFamily, string> = {
  [FontFamily.HAND_DRAWN]: 'Hand Drawn',
  [FontFamily.NORMAL]: 'Normal',
  [FontFamily.CODE]: 'Code',
};

/**
 * Get font family from string
 */
export function getFontFamily(name: string): FontFamily {
  switch (name) {
    case 'Hand Drawn':
      return FontFamily.HAND_DRAWN;
    case 'Code':
      return FontFamily.CODE;
    default:
      return FontFamily.NORMAL;
  }
}
