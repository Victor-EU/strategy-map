import React from 'react';
import { Diagram } from '../models/Diagram';
import { Color, StrokeWidth, FillStyle, BorderStyle, LineStyle } from '../models/Style';
import { FontFamily, FONT_FAMILY_NAMES } from '../models/FontFamily';
import { FontSize } from '../models/FontSize';
import './PropertiesPanel.css';

interface PropertiesPanelProps {
  diagram: Diagram;
  onDiagramChange: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  diagram,
  onDiagramChange,
}) => {
  const selectedIds = diagram.getSelectedIds();
  const selectedElements = diagram.getSelectedElements();

  if (selectedIds.length === 0) {
    return (
      <div className="properties-panel">
        <div className="properties-empty">
          Select an element to edit its properties
        </div>
      </div>
    );
  }

  const selectedNode = selectedIds.length === 1 ? diagram.getNode(selectedIds[0]) : null;
  const selectedLabel = selectedIds.length === 1 ? diagram.getTextLabel(selectedIds[0]) : null;
  const selectedArrow = selectedIds.length === 1 ? diagram.getArrow(selectedIds[0]) : null;

  const handleColorChange = (color: Color) => {
    selectedElements.forEach((element) => {
      if ('style' in element && element.style) {
        element.setStyle({ strokeColor: color });
      } else if ('setColor' in element) {
        element.setColor(color);
      } else if ('setStrokeColor' in element) {
        element.setStrokeColor(color);
      }
    });
    onDiagramChange();
  };

  const handleBackgroundColorChange = (color: Color) => {
    selectedElements.forEach((element) => {
      if ('style' in element && element.style) {
        element.setStyle({ backgroundColor: color });
      }
    });
    onDiagramChange();
  };

  const handleStrokeWidthChange = (width: StrokeWidth) => {
    selectedElements.forEach((element) => {
      if ('style' in element && element.style) {
        element.setStyle({ strokeWidth: width });
      } else if ('setStrokeWidth' in element) {
        element.setStrokeWidth(width);
      }
    });
    onDiagramChange();
  };

  const handleFontFamilyChange = (fontFamily: FontFamily) => {
    selectedElements.forEach((element) => {
      if ('setFontFamily' in element) {
        element.setFontFamily(fontFamily);
      }
    });
    onDiagramChange();
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    selectedElements.forEach((element) => {
      if ('setFontSize' in element) {
        element.setFontSize(fontSize);
      }
    });
    onDiagramChange();
  };

  const handleFillStyleChange = (fillStyle: FillStyle) => {
    selectedElements.forEach((element) => {
      if ('style' in element && element.style) {
        element.setStyle({ fillStyle });
      }
    });
    onDiagramChange();
  };

  // Border handlers for text labels
  const handleShowBorderChange = (show: boolean) => {
    selectedElements.forEach((element) => {
      if ('setShowBorder' in element) {
        element.setShowBorder(show);
      }
    });
    onDiagramChange();
  };

  const handleBorderStyleChange = (borderStyle: BorderStyle) => {
    selectedElements.forEach((element) => {
      if ('setBorderStyle' in element) {
        element.setBorderStyle(borderStyle);
      }
    });
    onDiagramChange();
  };

  const handleBorderColorChange = (color: Color) => {
    selectedElements.forEach((element) => {
      if ('setBorderColor' in element) {
        element.setBorderColor(color);
      }
    });
    onDiagramChange();
  };

  const handleBorderWidthChange = (width: StrokeWidth) => {
    selectedElements.forEach((element) => {
      if ('setBorderWidth' in element) {
        element.setBorderWidth(width);
      }
    });
    onDiagramChange();
  };

  const handlePaddingChange = (padding: number) => {
    selectedElements.forEach((element) => {
      if ('setPadding' in element) {
        element.setPadding(padding);
      }
    });
    onDiagramChange();
  };

  const handleLineStyleChange = (lineStyle: LineStyle) => {
    selectedElements.forEach((element) => {
      if ('setLineStyle' in element) {
        element.setLineStyle(lineStyle);
      }
    });
    onDiagramChange();
  };

  const colors = Object.values(Color);
  const strokeWidths = [
    { value: StrokeWidth.THIN, label: 'Thin' },
    { value: StrokeWidth.MEDIUM, label: 'Medium' },
    { value: StrokeWidth.THICK, label: 'Thick' },
    { value: StrokeWidth.EXTRA_THICK, label: 'Extra' },
  ];
  const fillStyles = [
    { value: FillStyle.SOLID, label: 'Solid' },
    { value: FillStyle.HACHURE, label: 'Hachure' },
    { value: FillStyle.CROSS_HATCH, label: 'Cross' },
    { value: FillStyle.NONE, label: 'None' },
  ];
  const fontSizes = [
    { value: FontSize.SMALL, label: 'Small' },
    { value: FontSize.MEDIUM, label: 'Medium' },
    { value: FontSize.LARGE, label: 'Large' },
  ];
  const borderStyles = [
    { value: BorderStyle.NONE, label: 'None' },
    { value: BorderStyle.SOLID, label: 'Solid' },
    { value: BorderStyle.DASHED, label: 'Dashed' },
    { value: BorderStyle.DOTTED, label: 'Dotted' },
  ];
  const paddingSizes = [
    { value: 4, label: 'XS' },
    { value: 8, label: 'S' },
    { value: 12, label: 'M' },
    { value: 16, label: 'L' },
    { value: 24, label: 'XL' },
  ];
  const lineStyles = [
    { value: LineStyle.SOLID, label: 'Solid' },
    { value: LineStyle.DASHED, label: 'Dashed' },
    { value: LineStyle.DOTTED, label: 'Dotted' },
  ];

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <h3>Properties</h3>
        <span className="properties-count">{selectedIds.length} selected</span>
      </div>

      <div className="properties-content">
        {/* Stroke Color */}
        {(selectedNode || selectedArrow || selectedLabel) && (
          <div className="properties-section">
            <label className="properties-label">
              {selectedArrow ? 'Arrow Line Color' : selectedLabel ? 'Text Color' : 'Stroke Color'}
            </label>
            <div className="properties-color-grid">
              {colors.map((color) => (
                <button
                  key={color}
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Background Color (Nodes only) */}
        {selectedNode && (
          <div className="properties-section">
            <label className="properties-label">Background Color</label>
            <div className="properties-color-grid">
              {colors.map((color) => (
                <button
                  key={color}
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                  onClick={() => handleBackgroundColorChange(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Line Width */}
        {(selectedNode || selectedArrow) && (
          <div className="properties-section">
            <label className="properties-label">Line Width</label>
            <div className="properties-button-group">
              {strokeWidths.map(({ value, label }) => (
                <button
                  key={value}
                  className="properties-button"
                  onClick={() => handleStrokeWidthChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Line Style (Arrows only) */}
        {selectedArrow && (
          <div className="properties-section">
            <label className="properties-label">Line Style</label>
            <div className="properties-button-group">
              {lineStyles.map(({ value, label }) => (
                <button
                  key={value}
                  className="properties-button"
                  onClick={() => handleLineStyleChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fill Style (Nodes only) */}
        {selectedNode && (
          <div className="properties-section">
            <label className="properties-label">Fill Style</label>
            <div className="properties-button-group">
              {fillStyles.map(({ value, label }) => (
                <button
                  key={value}
                  className="properties-button"
                  onClick={() => handleFillStyleChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Font Family */}
        {(selectedNode || selectedLabel) && (
          <div className="properties-section">
            <label className="properties-label">Font</label>
            <div className="properties-button-group">
              {Object.values(FontFamily).map((fontFamily) => (
                <button
                  key={fontFamily}
                  className="properties-button"
                  onClick={() => handleFontFamilyChange(fontFamily)}
                  style={{ fontFamily }}
                >
                  {FONT_FAMILY_NAMES[fontFamily]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Font Size (Text labels only) */}
        {selectedLabel && (
          <div className="properties-section">
            <label className="properties-label">Font Size</label>
            <div className="properties-button-group">
              {fontSizes.map(({ value, label }) => (
                <button
                  key={value}
                  className="properties-button"
                  onClick={() => handleFontSizeChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Border Controls (Text labels only) */}
        {selectedLabel && (
          <>
            <div className="properties-divider" />

            {/* Show Border Toggle */}
            <div className="properties-section">
              <label className="properties-label">Border</label>
              <div className="properties-button-group">
                <button
                  className={`properties-button ${selectedLabel.showBorder ? 'active' : ''}`}
                  onClick={() => handleShowBorderChange(!selectedLabel.showBorder)}
                >
                  {selectedLabel.showBorder ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Border Style */}
            {selectedLabel.showBorder && (
              <>
                <div className="properties-section">
                  <label className="properties-label">Border Style</label>
                  <div className="properties-button-group">
                    {borderStyles.map(({ value, label }) => (
                      <button
                        key={value}
                        className={`properties-button ${selectedLabel.borderStyle === value ? 'active' : ''}`}
                        onClick={() => handleBorderStyleChange(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Color */}
                <div className="properties-section">
                  <label className="properties-label">Border Color</label>
                  <div className="properties-color-grid">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`color-swatch ${selectedLabel.borderColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleBorderColorChange(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Border Width */}
                <div className="properties-section">
                  <label className="properties-label">Border Width</label>
                  <div className="properties-button-group">
                    {strokeWidths.map(({ value, label }) => (
                      <button
                        key={value}
                        className={`properties-button ${selectedLabel.borderWidth === value ? 'active' : ''}`}
                        onClick={() => handleBorderWidthChange(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Padding */}
                <div className="properties-section">
                  <label className="properties-label">Padding</label>
                  <div className="properties-button-group">
                    {paddingSizes.map(({ value, label }) => (
                      <button
                        key={value}
                        className={`properties-button ${selectedLabel.padding === value ? 'active' : ''}`}
                        onClick={() => handlePaddingChange(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
