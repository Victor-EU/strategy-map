import { useState, useCallback, useEffect, useRef } from 'react';
import { Diagram } from '../models/Diagram';
import { Node } from '../models/Node';
import { Point } from '../models/Point';
import { Canvas } from '../components/Canvas';
import { Toolbar } from '../components/Toolbar';
import { PropertiesPanel } from '../components/PropertiesPanel';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ShareModal } from '../components/ShareModal';
import { ZoomControls } from '../components/ZoomControls';
import { Tool } from '../managers/InteractionManager';
import { KeyboardShortcutManager, createPlatformShortcut } from '../managers/KeyboardShortcutManager';
import { CanvasRenderer } from '../renderers/CanvasRenderer';
import { loadDiagram, saveDiagram, saveViewState } from '../utils/storage';
import { trackSessionStart, trackDiagramSave, trackDiagramExport } from '../utils/analytics';
import './StrategyMap.css';

export function StrategyMap() {
  const [diagram] = useState(() => {
    // Try to load saved diagram from localStorage
    const savedDiagram = loadDiagram();

    if (savedDiagram) {
      return savedDiagram;
    }

    // Create new diagram if no saved data
    const d = new Diagram();

    // Add initial node at the top-center of the whiteboard
    // Users typically start at the top and work downward
    const whiteboardBounds = d.whiteboard.getBounds();
    const topCenterPoint = new Point(
      whiteboardBounds.x + whiteboardBounds.width / 2,  // Centered horizontally
      whiteboardBounds.y + 150  // Near the top with some padding
    );
    const initialNode = new Node(topCenterPoint, 'Start here');
    d.addNode(initialNode);

    return d;
  });

  const [currentTool, setCurrentTool] = useState<Tool>(Tool.SELECT);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const [clipboardData, setClipboardData] = useState<string>('');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [zoom, setZoom] = useState(0.5); // Start at 50% to show full whiteboard
  const shortcutManagerRef = useRef<KeyboardShortcutManager | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  // Handle editing state change - disable shortcuts when editing
  const handleEditingChange = useCallback((isEditing: boolean) => {
    if (shortcutManagerRef.current) {
      shortcutManagerRef.current.setEnabled(!isEditing);
    }
  }, []);

  // Force re-render when diagram changes and save to localStorage
  const handleDiagramChange = useCallback(() => {
    setRenderTrigger(prev => prev + 1);
    // Save diagram to localStorage for persistence
    saveDiagram(diagram);
    // Track diagram save (local stats only)
    trackDiagramSave();
  }, [diagram]);

  // Save initial diagram on first load and track session start
  useEffect(() => {
    saveDiagram(diagram);
    // Track session start (privacy-friendly, one ping per browser session)
    trackSessionStart();
  }, [diagram]);

  // Initialize keyboard shortcut manager
  // OOP Principle: Dependency Injection - Shortcuts injected with callbacks
  useEffect(() => {
    const shortcutManager = new KeyboardShortcutManager();

    // Tool shortcuts (no modifiers)
    shortcutManager.register({
      key: 'v',
      description: 'Select Tool',
      action: () => setCurrentTool(Tool.SELECT),
    });

    shortcutManager.register({
      key: 'n',
      description: 'Node Tool',
      action: () => setCurrentTool(Tool.NODE),
    });

    shortcutManager.register({
      key: 't',
      description: 'Text Tool',
      action: () => setCurrentTool(Tool.TEXT),
    });

    shortcutManager.register({
      key: 'h',
      description: 'Pan Tool',
      action: () => setCurrentTool(Tool.PAN),
    });

    shortcutManager.register({
      key: 'l',
      description: 'Laser Tool',
      action: () => setCurrentTool(Tool.LASER),
    });

    // Arrow tool (but not Cmd+A)
    shortcutManager.register({
      key: 'a',
      description: 'Arrow Tool',
      action: () => setCurrentTool(Tool.ARROW),
    });

    // Cmd/Ctrl + D: Duplicate
    shortcutManager.register(
      createPlatformShortcut('d', () => {
        const selectedWhiteboard = diagram.getSelectedWhiteboard();
        const selectedElements = diagram.getSelectedIds();

        // Check if ONLY a whiteboard is selected (no other elements)
        if (selectedWhiteboard && selectedElements.length === 1 && selectedElements[0] === selectedWhiteboard.id) {
          diagram.duplicateWhiteboard(selectedWhiteboard.id);
        } else {
          diagram.duplicateSelected();
        }
        handleDiagramChange();
      }, 'Duplicate selected elements')
    );

    // Cmd/Ctrl + A: Select All
    shortcutManager.register(
      createPlatformShortcut('a', () => {
        diagram.selectAll();
        handleDiagramChange();
      }, 'Select all elements')
    );

    // Cmd/Ctrl + C: Copy
    shortcutManager.register(
      createPlatformShortcut('c', () => {
        const data = diagram.copySelectedToClipboard();
        setClipboardData(data);
        // Try to use system clipboard if available
        if (navigator.clipboard) {
          navigator.clipboard.writeText(data).catch(console.error);
        }
      }, 'Copy selected elements')
    );

    // Cmd/Ctrl + V: Paste
    shortcutManager.register(
      createPlatformShortcut('v', () => {
        if (clipboardData) {
          diagram.pasteFromClipboard(clipboardData);
          handleDiagramChange();
        }
      }, 'Paste elements')
    );

    // Cmd/Ctrl + X: Cut
    shortcutManager.register(
      createPlatformShortcut('x', () => {
        const data = diagram.copySelectedToClipboard();
        setClipboardData(data);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(data).catch(console.error);
        }
        diagram.deleteSelected();
        handleDiagramChange();
      }, 'Cut selected elements')
    );

    shortcutManagerRef.current = shortcutManager;

    // Global keyboard handler
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcutManager.handleKeyDown(e);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      shortcutManager.clear();
    };
  }, [diagram, handleDiagramChange, clipboardData]);

  // Handle clear - show dialog
  const handleClear = useCallback(() => {
    setShowClearDialog(true);
  }, []);

  // Confirm clear
  const confirmClear = useCallback(() => {
    diagram.clear();

    // Add initial node back at top-center of whiteboard
    // Users typically start at the top and work downward
    const whiteboardBounds = diagram.whiteboard.getBounds();
    const topCenterPoint = new Point(
      whiteboardBounds.x + whiteboardBounds.width / 2,  // Centered horizontally
      whiteboardBounds.y + 150  // Near the top with some padding
    );
    const initialNode = new Node(topCenterPoint, 'Start here');
    diagram.addNode(initialNode);

    handleDiagramChange();
    setShowClearDialog(false);
  }, [diagram, handleDiagramChange]);

  // Cancel clear
  const cancelClear = useCallback(() => {
    setShowClearDialog(false);
  }, []);

  // Handle export to JPEG
  const handleExport = useCallback(() => {
    if (!rendererRef.current) {
      console.error('Renderer not ready');
      return;
    }

    // Export diagram to JPEG with high quality
    const jpegDataURL = rendererRef.current.exportToJPEG(diagram, 0.95);

    // Convert data URL to blob and download
    fetch(jpegDataURL)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `strategy-map-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        // Track export (sends anonymous ping)
        trackDiagramExport();
      })
      .catch(err => console.error('Export failed:', err));
  }, [diagram]);

  // Handle share diagram
  const handleShare = useCallback(async () => {
    try {
      // Serialize diagram
      const diagramData = diagram.toJSON();

      // Call share API
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagramData),
      });

      if (!response.ok) {
        throw new Error('Failed to create share link');
      }

      const { url } = await response.json();
      setShareUrl(url);
      setShowShareModal(true);
    } catch (error) {
      console.error('Share failed:', error);
      alert('Failed to create share link. Please try again.');
    }
  }, [diagram]);

  // Save view state (zoom and pan) to localStorage
  const handleViewStateChange = useCallback(() => {
    if (rendererRef.current) {
      const viewState = rendererRef.current.getViewState();
      saveViewState(viewState);
    }
  }, []);

  // Handle zoom controls from UI buttons
  const handleZoomIn = useCallback(() => {
    if (!rendererRef.current) return;
    rendererRef.current.zoomIn();
    const newZoom = rendererRef.current.getZoom();
    setZoom(newZoom);
    handleViewStateChange();
    handleDiagramChange();
  }, [handleViewStateChange, handleDiagramChange]);

  const handleZoomOut = useCallback(() => {
    if (!rendererRef.current) return;
    rendererRef.current.zoomOut();
    const newZoom = rendererRef.current.getZoom();
    setZoom(newZoom);
    handleViewStateChange();
    handleDiagramChange();
  }, [handleViewStateChange, handleDiagramChange]);

  const handleResetZoom = useCallback(() => {
    if (!rendererRef.current) return;
    rendererRef.current.resetZoom();
    const newZoom = rendererRef.current.getZoom();
    setZoom(newZoom);
    handleViewStateChange();
    handleDiagramChange();
  }, [handleViewStateChange, handleDiagramChange]);

  return (
    <div className="app">
      <Toolbar
        currentTool={currentTool}
        onToolChange={setCurrentTool}
        onClear={handleClear}
        onExport={handleExport}
        onShare={handleShare}
      />

      <div className="app-content">
        <Canvas
          diagram={diagram}
          currentTool={currentTool}
          onDiagramChange={handleDiagramChange}
          onToolChange={setCurrentTool}
          onRendererReady={(renderer) => {
            rendererRef.current = renderer;
          }}
          onZoomChange={setZoom}
          onViewStateChange={handleViewStateChange}
          onEditingChange={handleEditingChange}
          renderTrigger={renderTrigger}
        />

        <PropertiesPanel
          diagram={diagram}
          onDiagramChange={handleDiagramChange}
        />
      </div>

      {showClearDialog && (
        <ConfirmDialog
          title="Clear Canvas"
          message="Are you sure you want to clear the entire canvas? This action cannot be undone."
          onConfirm={confirmClear}
          onCancel={cancelClear}
        />
      )}

      {showShareModal && (
        <ShareModal
          url={shareUrl}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
      />
    </div>
  );
}
