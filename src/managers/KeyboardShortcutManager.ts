/**
 * Manages keyboard shortcuts following OOP principles
 * Single Responsibility: Only handles keyboard shortcut detection and execution
 */

export interface ShortcutAction {
  key: string;
  ctrl?: boolean;
  meta?: boolean;  // Command on Mac, Windows key on Windows
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

/**
 * KeyboardShortcutManager class
 * OOP Principle: Encapsulation - Hides keyboard event complexity
 */
export class KeyboardShortcutManager {
  private shortcuts: Map<string, ShortcutAction> = new Map();
  private enabled: boolean = true;

  /**
   * Register a new keyboard shortcut
   * OOP Principle: Open/Closed - Add new shortcuts without modifying class
   */
  register(shortcut: ShortcutAction): void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(key: string, modifiers?: { ctrl?: boolean; meta?: boolean; shift?: boolean }): void {
    const shortcutKey = this.createKey(key, modifiers);
    this.shortcuts.delete(shortcutKey);
  }

  /**
   * Handle keyboard event
   * OOP Principle: Information Hiding - Implementation details hidden
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.enabled) return false;

    // Don't handle shortcuts when user is typing in input/textarea
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return false;
    }

    const key = this.createKeyFromEvent(event);
    const shortcut = this.shortcuts.get(key);

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
      return true;
    }

    return false;
  }

  /**
   * Enable or disable all shortcuts
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if shortcuts are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get all registered shortcuts (for documentation/help)
   */
  getAllShortcuts(): ShortcutAction[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Clear all shortcuts
   */
  clear(): void {
    this.shortcuts.clear();
  }

  /**
   * Create a unique key from shortcut definition
   * Private method - implementation detail
   */
  private getShortcutKey(shortcut: ShortcutAction): string {
    return this.createKey(shortcut.key, {
      ctrl: shortcut.ctrl,
      meta: shortcut.meta,
      shift: shortcut.shift,
    });
  }

  /**
   * Create a unique key string from key and modifiers
   * Private method - implementation detail
   */
  private createKey(
    key: string,
    modifiers?: { ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean }
  ): string {
    const parts: string[] = [];

    if (modifiers?.ctrl) parts.push('ctrl');
    if (modifiers?.meta) parts.push('meta');
    if (modifiers?.shift) parts.push('shift');
    if (modifiers?.alt) parts.push('alt');

    parts.push(key.toLowerCase());

    return parts.join('+');
  }

  /**
   * Create key string from keyboard event
   * Private method - implementation detail
   */
  private createKeyFromEvent(event: KeyboardEvent): string {
    return this.createKey(event.key, {
      ctrl: event.ctrlKey,
      meta: event.metaKey,
      shift: event.shiftKey,
      alt: event.altKey,
    });
  }
}

/**
 * Helper function to check if running on Mac
 */
export function isMac(): boolean {
  return typeof window !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

/**
 * Get the appropriate modifier key name for the platform
 */
export function getModifierKeyName(): string {
  return isMac() ? 'Cmd' : 'Ctrl';
}

/**
 * Create platform-specific shortcut
 * Automatically uses Cmd on Mac, Ctrl on Windows/Linux
 */
export function createPlatformShortcut(
  key: string,
  action: () => void,
  description: string,
  additionalModifiers?: { shift?: boolean; alt?: boolean }
): ShortcutAction {
  const useMeta = isMac();

  return {
    key,
    meta: useMeta,
    ctrl: !useMeta,
    shift: additionalModifiers?.shift,
    alt: additionalModifiers?.alt,
    description,
    action,
  };
}
