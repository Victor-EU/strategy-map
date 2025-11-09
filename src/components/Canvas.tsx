import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Diagram } from '../models/Diagram';
import { Node } from '../models/Node';
import { TextLabel } from '../models/TextLabel';
import { Point } from '../models/Point';
import { CanvasRenderer } from '../renderers/CanvasRenderer';
import { InteractionManager, Tool } from '../managers/InteractionManager';
import { loadViewState } from '../utils/storage';
import './Canvas.css';

interface CanvasProps {
  diagram: Diagram;
  currentTool: Tool;
  onDiagramChange?: () => void;
  onToolChange?: (tool: Tool) => void;
  onRendererReady?: (renderer: CanvasRenderer) => void;
  onZoomChange?: (zoom: number) => void;
  onViewStateChange?: () => void;
  onEditingChange?: (isEditing: boolean) => void;
  renderTrigger?: number;
}

export const Canvas: React.FC<CanvasProps> = ({
  diagram,
  currentTool,
  onDiagramChange,
  onToolChange,
  onRendererReady,
  onZoomChange,
  onViewStateChange,
  onEditingChange,
  renderTrigger
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const interactionManagerRef = useRef<InteractionManager | null>(null);
  const onRendererReadyRef = useRef(onRendererReady);
  const lastClickTimeRef = useRef<number>(0);
  const exitEditingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [editingElement, setEditingElement] = useState<{
    element: Node | TextLabel;
    text: string;
    cursorPosition: number; // Cursor position in the text
    selectionStart: number; // Selection start (-1 if no selection)
    selectionEnd: number;   // Selection end (-1 if no selection)
  } | null>(null);

  const [cursorStyle, setCursorStyle] = useState<string>('default');
  const [cursorVisible, setCursorVisible] = useState<boolean>(true);
  const [isDraggingText, setIsDraggingText] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<number>(-1);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Notify parent when editing state changes
  useEffect(() => {
    if (onEditingChange) {
      onEditingChange(editingElement !== null);
    }
  }, [editingElement, onEditingChange]);

  // Keep callback ref up to date
  useEffect(() => {
    onRendererReadyRef.current = onRendererReady;
  }, [onRendererReady]);

  // Initialize renderer and interaction manager
  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new CanvasRenderer(canvasRef.current);
    const interactionManager = new InteractionManager(diagram);

    rendererRef.current = renderer;
    interactionManagerRef.current = interactionManager;

    // Notify parent that renderer is ready
    if (onRendererReadyRef.current) {
      onRendererReadyRef.current(renderer);
    }

    // Set up callbacks
    // OOP Principle: Dependency Injection - Inject callbacks into InteractionManager
    interactionManager.setOnUpdate(() => {
      render();
      onDiagramChange?.();
    });

    interactionManager.setOnRequestTextEdit((element, text) => {
      // If it's a new node/text with default text, clear it and select all
      const isDefaultText = text === 'New Node' || text === 'Text';
      const editText = isDefaultText ? '' : text;

      setEditingElement({
        element,
        text: editText,
        cursorPosition: editText.length,
        selectionStart: -1,
        selectionEnd: -1
      });
    });

    if (onToolChange) {
      interactionManager.setOnToolChange(onToolChange);
    }

    // Try to restore saved view state first
    const savedViewState = loadViewState();
    if (savedViewState) {
      // Restore saved zoom and pan
      renderer.setViewState(savedViewState);

      // Also update interaction manager with saved pan
      interactionManager.setInitialPan(savedViewState.panX, savedViewState.panY);

      // Notify parent about zoom (for UI update)
      if (onZoomChange) {
        onZoomChange(savedViewState.zoom);
      }
    } else {
      // No saved state - center whiteboard in viewport on initial load
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const whiteboardCenter = diagram.whiteboard.getCenter();

        // Calculate pan offset to center the whiteboard
        const initialPanX = rect.width / 2 - whiteboardCenter.x;
        const initialPanY = rect.height / 2 - whiteboardCenter.y;

        // Set initial pan in renderer
        renderer.setPan(initialPanX, initialPanY);

        // Also set in interaction manager so panning continues from here
        interactionManager.setInitialPan(initialPanX, initialPanY);
      }
    }

    // Initial render (now with correct view state)
    render();

    // Handle resize
    const handleResize = () => {
      renderer.resize();
      render();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // Clean up any pending exit editing timeout
      if (exitEditingTimeoutRef.current) {
        clearTimeout(exitEditingTimeoutRef.current);
      }
    };
  }, [diagram]);

  // Update tool when it changes
  useEffect(() => {
    if (interactionManagerRef.current) {
      interactionManagerRef.current.setTool(currentTool);
      render();
    }
  }, [currentTool]);

  // Render function
  const render = useCallback(() => {
    if (!rendererRef.current || !interactionManagerRef.current) return;

    // Get pan offset from interaction manager and apply to renderer
    const panOffset = interactionManagerRef.current.getPanOffset();
    rendererRef.current.setPan(panOffset.x, panOffset.y);

    const temporaryArrow = interactionManagerRef.current.getTemporaryArrow();
    const selectionBox = interactionManagerRef.current.getSelectionBox();
    const laserTrail = interactionManagerRef.current.getLaserTrail();

    // Pass editing state to renderer
    const editingState = editingElement ? {
      elementId: editingElement.element.id,
      text: editingElement.text,
      cursorPosition: editingElement.cursorPosition,
      cursorVisible: cursorVisible,
      selectionStart: editingElement.selectionStart,
      selectionEnd: editingElement.selectionEnd
    } : undefined;

    rendererRef.current.render(diagram, temporaryArrow || undefined, selectionBox, editingState, laserTrail);
  }, [diagram, editingElement, cursorVisible]);

  // Re-render when renderTrigger changes (triggered by PropertiesPanel or other external changes)
  // This ensures properties changes are reflected in real-time
  useEffect(() => {
    render();
  }, [renderTrigger, render]);

  // Cursor blink effect when editing
  useEffect(() => {
    if (!editingElement) {
      setCursorVisible(true);
      return;
    }

    // Reset cursor to visible whenever text content changes
    // This ensures cursor is always visible after typing
    setCursorVisible(true);

    // Delay the blinking to give user time to see cursor after typing
    // This prevents the race condition where old interval might hide cursor
    // before the new interval starts
    let interval: NodeJS.Timeout | null = null;

    const blinkDelay = setTimeout(() => {
      interval = setInterval(() => {
        setCursorVisible(prev => !prev);
        render(); // Re-render to show/hide cursor
      }, 530);
    }, 530); // Start blinking after one full blink cycle

    return () => {
      clearTimeout(blinkDelay);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [editingElement?.text, editingElement?.element.id, render]);

  // Animation loop for laser trail fading
  useEffect(() => {
    let animationFrameId: number;
    let wasNotEmpty = false;

    const animate = () => {
      if (!interactionManagerRef.current) return;

      const laserTrail = interactionManagerRef.current.getLaserTrail();
      const isEmpty = laserTrail.isEmpty();

      // If trail has points, clean up old ones and render
      if (!isEmpty) {
        laserTrail.cleanup(); // Remove old points
        render(); // Re-render to show fading
        wasNotEmpty = true;
        animationFrameId = requestAnimationFrame(animate);
      }
      // If trail just became empty, render one final time to clear it
      else if (wasNotEmpty) {
        render(); // Final render to clear the laser
        wasNotEmpty = false;
      }
    };

    // Start animation loop
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [render]);

  // Get raw screen coordinates (relative to canvas)
  const getScreenPoint = (e: React.MouseEvent | React.WheelEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return new Point(0, 0);

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    return new Point(screenX, screenY);
  };

  // Convert screen coordinates to canvas coordinates (accounting for zoom)
  const getCanvasPoint = (e: React.MouseEvent | React.WheelEvent): Point => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !renderer) return new Point(0, 0);

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Convert to canvas coordinates accounting for zoom and pan
    return renderer.screenToCanvas(screenX, screenY);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactionManagerRef.current || !rendererRef.current) return;

    // Detect double-click by checking time between clicks (< 300ms is a double-click)
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    const isDoubleClick = timeSinceLastClick < 300;
    lastClickTimeRef.current = now;

    // If editing and this is a double-click, cancel any pending exit and let doubleClick handler handle it
    if (editingElement && isDoubleClick) {
      if (exitEditingTimeoutRef.current) {
        clearTimeout(exitEditingTimeoutRef.current);
        exitEditingTimeoutRef.current = null;
      }
      return; // Let the double-click handler select word at cursor
    }

    const point = getCanvasPoint(e);

    // If editing, check if click is inside the text element
    if (editingElement) {
      const clickedElement = diagram.findElementAtPoint(point);

      // If clicked inside the same element we're editing, position cursor
      if (clickedElement && clickedElement.id === editingElement.element.id) {
        e.preventDefault();

        // Clear any existing timeout
        if (exitEditingTimeoutRef.current) {
          clearTimeout(exitEditingTimeoutRef.current);
          exitEditingTimeoutRef.current = null;
        }

        // Calculate cursor position from mouse click
        const newCursorPos = rendererRef.current.getCursorPositionFromMouseClick(
          editingElement.element,
          point,
          editingElement.text
        );

        // Start drag selection
        setIsDraggingText(true);
        setDragStartPos(newCursorPos);

        setEditingElement({
          ...editingElement,
          cursorPosition: newCursorPos,
          selectionStart: -1,
          selectionEnd: -1
        });

        render();
        return;
      }

      // If clicked outside, exit editing
      // Clear any existing timeout
      if (exitEditingTimeoutRef.current) {
        clearTimeout(exitEditingTimeoutRef.current);
      }

      // Delay exit to see if double-click comes
      exitEditingTimeoutRef.current = setTimeout(() => {
        if (interactionManagerRef.current && editingElement) {
          interactionManagerRef.current.updateElementText(
            editingElement.element.id,
            editingElement.text
          );
          setEditingElement(null);
        }
        exitEditingTimeoutRef.current = null;
      }, 200); // Wait 200ms for potential double-click

      return;
    }

    // Normal mouseDown processing
    interactionManagerRef.current.handleMouseDown(point, e.shiftKey);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactionManagerRef.current || !rendererRef.current) return;

    const point = getCanvasPoint(e);

    // Handle text selection dragging
    if (isDraggingText && editingElement && dragStartPos !== -1) {
      e.preventDefault();

      // Calculate current cursor position from mouse
      const currentPos = rendererRef.current.getCursorPositionFromMouseClick(
        editingElement.element,
        point,
        editingElement.text
      );

      // Update selection range
      const selStart = Math.min(dragStartPos, currentPos);
      const selEnd = Math.max(dragStartPos, currentPos);

      setEditingElement({
        ...editingElement,
        cursorPosition: currentPos,
        selectionStart: selStart !== selEnd ? selStart : -1,
        selectionEnd: selStart !== selEnd ? selEnd : -1
      });

      render();
      return;
    }

    // For panning, use screen coordinates to avoid zoom sensitivity
    const mode = interactionManagerRef.current.getMode();
    if (mode === 'panning') {
      const screenPoint = getScreenPoint(e);
      interactionManagerRef.current.handlePanningWithScreenCoords(screenPoint);
    } else {
      interactionManagerRef.current.handleMouseMove(point);

      // Update cursor based on resize handle
      if (currentTool === Tool.SELECT) {
        const resizeCursor = interactionManagerRef.current.getResizeCursor(point);
        if (resizeCursor) {
          setCursorStyle(resizeCursor);
        } else {
          setCursorStyle('default');
        }
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!interactionManagerRef.current) return;

    // Check if we were panning before handling mouse up
    const wasPanning = interactionManagerRef.current.getMode() === 'panning';

    // End text selection dragging
    if (isDraggingText) {
      setIsDraggingText(false);
      setDragStartPos(-1);
      return;
    }

    const point = getCanvasPoint(e);
    interactionManagerRef.current.handleMouseUp(point);

    // Save view state after panning ends
    if (wasPanning && onViewStateChange) {
      onViewStateChange();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!interactionManagerRef.current || !rendererRef.current) return;

    e.preventDefault();  // Prevent default double-click behavior
    e.stopPropagation(); // Prevent event from bubbling

    const point = getCanvasPoint(e);

    // If already editing, select the word at cursor position
    if (editingElement) {
      // Get cursor position from click
      const clickPos = rendererRef.current.getCursorPositionFromMouseClick(
        editingElement.element,
        point,
        editingElement.text
      );

      // Find word boundaries at click position
      const [wordStart, wordEnd] = rendererRef.current.getWordBoundariesAtPosition(
        editingElement.text,
        clickPos
      );

      // Select the word (even if start === end, which means no word found)
      setEditingElement({
        ...editingElement,
        selectionStart: wordStart,
        selectionEnd: wordEnd,
        cursorPosition: wordEnd
      });

      render();
      return;
    }

    // Not editing - trigger normal double-click (enter edit mode)
    interactionManagerRef.current.handleDoubleClick(point);
  };


  // Handle wheel event for zoom (trackpad pinch) and pan (two-finger slide)
  const handleWheel = useCallback((e: WheelEvent) => {
    const renderer = rendererRef.current;
    const interactionManager = interactionManagerRef.current;
    if (!renderer || !interactionManager) return;

    // Check if this is a pinch gesture (Ctrl/Cmd + wheel or trackpad pinch)
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = e.clientX - rect.left;
      const centerY = e.clientY - rect.top;

      // deltaY < 0 means zoom in, deltaY > 0 means zoom out
      const zoomFactor = 1 + Math.abs(e.deltaY) * 0.01;

      if (e.deltaY < 0) {
        renderer.zoomIn(zoomFactor, centerX, centerY);
      } else {
        renderer.zoomOut(zoomFactor, centerX, centerY);
      }

      // Notify parent of zoom change
      const newZoom = renderer.getZoom();
      if (onZoomChange) {
        onZoomChange(newZoom);
      }

      // Notify parent of view state change (for persistence)
      if (onViewStateChange) {
        onViewStateChange();
      }

      render();
    } else {
      // Two-finger slide gesture for panning
      e.preventDefault();

      // Apply pan using wheel deltas
      interactionManager.applyWheelPan(e.deltaX, e.deltaY);

      // Notify parent of view state change (for persistence)
      if (onViewStateChange) {
        onViewStateChange();
      }

      render();
    }
  }, [onZoomChange, onViewStateChange, render]);

  // Set up wheel event listener with passive: false
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Handle Node editing keyboard input (single-line)
  const handleNodeEditKeyDown = useCallback((e: KeyboardEvent) => {
    if (!editingElement) return;

    // Cmd/Ctrl + A: Select all text
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault();
      setEditingElement({
        ...editingElement,
        selectionStart: 0,
        selectionEnd: editingElement.text.length,
        cursorPosition: editingElement.text.length
      });
      return;
    }

    // Enter: Finish editing node
    if (e.key === 'Enter') {
      e.preventDefault();
      if (interactionManagerRef.current) {
        interactionManagerRef.current.updateElementText(
          editingElement.element.id,
          editingElement.text
        );
      }
      setEditingElement(null);

      // Switch to Arrow tool for connecting nodes
      if (onToolChange && currentTool === Tool.NODE) {
        onToolChange(Tool.ARROW);
      }
      return;
    }

    // Escape: Cancel editing
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingElement(null);

      if (onToolChange && currentTool === Tool.NODE) {
        onToolChange(Tool.ARROW);
      }

      if (interactionManagerRef.current) {
        interactionManagerRef.current.handleKeyDown('Escape');
      }
      return;
    }
  }, [editingElement, currentTool, onToolChange]);

  // Handle TextLabel editing keyboard input (multi-line)
  const handleTextLabelEditKeyDown = useCallback((e: KeyboardEvent) => {
    if (!editingElement) return;

    // Cmd/Ctrl + A: Select all text
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault();
      setEditingElement({
        ...editingElement,
        selectionStart: 0,
        selectionEnd: editingElement.text.length,
        cursorPosition: editingElement.text.length
      });
      return;
    }

    // Cmd/Ctrl + Enter: Finish editing
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (interactionManagerRef.current) {
        interactionManagerRef.current.updateElementText(
          editingElement.element.id,
          editingElement.text
        );
      }
      setEditingElement(null);

      if (onToolChange && currentTool === Tool.TEXT) {
        onToolChange(Tool.SELECT);
      }
      return;
    }

    // Enter: Insert newline
    if (e.key === 'Enter') {
      e.preventDefault();

      const { text, cursorPosition, selectionStart, selectionEnd } = editingElement;
      const hasSelection = selectionStart !== -1 && selectionEnd !== -1;

      let newText: string;
      let newCursorPos: number;

      if (hasSelection) {
        const start = Math.min(selectionStart, selectionEnd);
        const end = Math.max(selectionStart, selectionEnd);
        newText = text.slice(0, start) + '\n' + text.slice(end);
        newCursorPos = start + 1;
      } else {
        newText = text.slice(0, cursorPosition) + '\n' + text.slice(cursorPosition);
        newCursorPos = cursorPosition + 1;
      }

      setEditingElement({
        ...editingElement,
        text: newText,
        cursorPosition: newCursorPos,
        selectionStart: -1,
        selectionEnd: -1
      });
      render();
      return;
    }

    // Escape: Cancel editing
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingElement(null);

      if (onToolChange && currentTool === Tool.TEXT) {
        onToolChange(Tool.SELECT);
      }

      if (interactionManagerRef.current) {
        interactionManagerRef.current.handleKeyDown('Escape');
      }
      return;
    }
  }, [editingElement, currentTool, onToolChange, render]);

  // Common text editing keyboard input (shared between Node and TextLabel)
  const handleCommonTextEditKeyDown = useCallback((e: KeyboardEvent) => {
    if (!editingElement) return;

    const { text, cursorPosition, selectionStart, selectionEnd } = editingElement;
    const hasSelection = selectionStart !== -1 && selectionEnd !== -1;

    // Backspace: Delete selection or character before cursor
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (hasSelection) {
        const start = Math.min(selectionStart, selectionEnd);
        const end = Math.max(selectionStart, selectionEnd);
        const newText = text.slice(0, start) + text.slice(end);
        setEditingElement({
          ...editingElement,
          text: newText,
          cursorPosition: start,
          selectionStart: -1,
          selectionEnd: -1
        });
      } else if (cursorPosition > 0) {
        const newText = text.slice(0, cursorPosition - 1) + text.slice(cursorPosition);
        setEditingElement({
          ...editingElement,
          text: newText,
          cursorPosition: cursorPosition - 1,
          selectionStart: -1,
          selectionEnd: -1
        });
      }
      return;
    }

    // Delete: Delete selection or character after cursor
    if (e.key === 'Delete') {
      e.preventDefault();
      if (hasSelection) {
        const start = Math.min(selectionStart, selectionEnd);
        const end = Math.max(selectionStart, selectionEnd);
        const newText = text.slice(0, start) + text.slice(end);
        setEditingElement({
          ...editingElement,
          text: newText,
          cursorPosition: start,
          selectionStart: -1,
          selectionEnd: -1
        });
      } else if (cursorPosition < text.length) {
        const newText = text.slice(0, cursorPosition) + text.slice(cursorPosition + 1);
        setEditingElement({
          ...editingElement,
          text: newText,
          selectionStart: -1,
          selectionEnd: -1
        });
      }
      return;
    }

    // ArrowLeft: Move cursor left (clear selection)
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (hasSelection) {
        // Move to start of selection
        const start = Math.min(selectionStart, selectionEnd);
        setEditingElement({
          ...editingElement,
          cursorPosition: start,
          selectionStart: -1,
          selectionEnd: -1
        });
      } else if (cursorPosition > 0) {
        setEditingElement({
          ...editingElement,
          cursorPosition: cursorPosition - 1,
          selectionStart: -1,
          selectionEnd: -1
        });
      }
      return;
    }

    // ArrowRight: Move cursor right (clear selection)
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (hasSelection) {
        // Move to end of selection
        const end = Math.max(selectionStart, selectionEnd);
        setEditingElement({
          ...editingElement,
          cursorPosition: end,
          selectionStart: -1,
          selectionEnd: -1
        });
      } else if (cursorPosition < text.length) {
        setEditingElement({
          ...editingElement,
          cursorPosition: cursorPosition + 1,
          selectionStart: -1,
          selectionEnd: -1
        });
      }
      return;
    }

    // Home: Move cursor to start
    if (e.key === 'Home') {
      e.preventDefault();
      setEditingElement({
        ...editingElement,
        cursorPosition: 0,
        selectionStart: -1,
        selectionEnd: -1
      });
      return;
    }

    // End: Move cursor to end
    if (e.key === 'End') {
      e.preventDefault();
      setEditingElement({
        ...editingElement,
        cursorPosition: text.length,
        selectionStart: -1,
        selectionEnd: -1
      });
      return;
    }

    // Regular character input - replace selection if exists
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      let newText: string;
      let newCursorPos: number;

      if (hasSelection) {
        // Replace selected text
        const start = Math.min(selectionStart, selectionEnd);
        const end = Math.max(selectionStart, selectionEnd);
        newText = text.slice(0, start) + e.key + text.slice(end);
        newCursorPos = start + 1;
      } else {
        // Insert at cursor
        newText = text.slice(0, cursorPosition) + e.key + text.slice(cursorPosition);
        newCursorPos = cursorPosition + 1;
      }

      setEditingElement({
        ...editingElement,
        text: newText,
        cursorPosition: newCursorPos,
        selectionStart: -1,
        selectionEnd: -1
      });
      render(); // Re-render to show new character
      return;
    }
  }, [editingElement, render]);

  // Keyboard event handlers - route to appropriate handler based on element type
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!interactionManagerRef.current) return;

      // Handle text editing - route to appropriate handler
      if (editingElement) {
        const isNode = editingElement.element instanceof Node;

        // First handle special keys (Cmd+A, Escape, Enter)
        if (isNode) {
          handleNodeEditKeyDown(e);
        } else {
          handleTextLabelEditKeyDown(e);
        }

        // Then handle common text editing (if not already handled)
        if (!e.defaultPrevented) {
          handleCommonTextEditKeyDown(e);
        }
        return;
      }

      interactionManagerRef.current.handleKeyDown(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingElement, handleNodeEditKeyDown, handleTextLabelEditKeyDown, handleCommonTextEditKeyDown]);

  // Get cursor style based on current tool
  const getCursorStyle = (): string => {
    switch (currentTool) {
      case Tool.SELECT:
        return cursorStyle; // Use dynamic cursor for resize handles
      case Tool.NODE:
      case Tool.TEXT:
        return 'crosshair';
      case Tool.ARROW:
        return 'crosshair';
      case Tool.PAN:
        return 'grab';
      default:
        return 'default';
    }
  };

  // Reset cursor when tool changes
  useEffect(() => {
    setCursorStyle('default');
  }, [currentTool]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // Copy canvas as image to clipboard (using proper export)
  const handleCopyImage = useCallback(async () => {
    if (!rendererRef.current) return;

    try {
      // Use the same export logic as the Export button
      const pngDataURL = rendererRef.current.exportToPNG(diagram);

      // Convert data URL to blob
      const response = await fetch(pngDataURL);
      const blob = await response.blob();

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);

      setContextMenu(null);
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  }, [diagram]);

  // Save canvas as image file with native file picker
  const handleSaveImage = useCallback(async () => {
    if (!rendererRef.current) return;

    try {
      // Use the same export logic as the Export button
      const pngDataURL = rendererRef.current.exportToPNG(diagram);

      // Convert data URL to blob
      const response = await fetch(pngDataURL);
      const blob = await response.blob();

      // Check if File System Access API is supported
      if ('showSaveFilePicker' in window) {
        try {
          // Show native file save dialog
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: `strategy-map-${Date.now()}.png`,
            types: [
              {
                description: 'PNG Image',
                accept: { 'image/png': ['.png'] },
              },
            ],
          });

          // Write the file
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err: any) {
          // User cancelled the dialog
          if (err.name !== 'AbortError') {
            throw err;
          }
        }
      } else {
        // Fallback for browsers that don't support File System Access API
        const link = document.createElement('a');
        link.download = `strategy-map-${Date.now()}.png`;
        link.href = pngDataURL;
        link.click();
      }

      setContextMenu(null);
    } catch (err) {
      console.error('Failed to save image:', err);
    }
  }, [diagram]);

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas
        ref={canvasRef}
        className="canvas"
        style={{ cursor: getCursorStyle() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      />

      {/* Custom Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 10000
          }}
        >
          <button
            className="context-menu-item"
            onClick={handleCopyImage}
          >
            Copy Image
          </button>
          <button
            className="context-menu-item"
            onClick={handleSaveImage}
          >
            Save Image As...
          </button>
        </div>
      )}
    </div>
  );
};
