import React from 'react';
import './VariantSelector.css';

const ColorSelector = ({ colors, selectedColor, onColorSelect, disabled }) => {
  if (!colors || colors.length === 0) {
    return null;
  }

  return (
    <div className="color-selector">
      <label className="selector-label font-heading">
        Color: {selectedColor ? <span className="font-semibold">{selectedColor.name}</span> : <span className="text-gray-500">Select a color</span>}
      </label>

      <div className="color-swatches">
        {colors.map((color) => {
          const isSelected = selectedColor && selectedColor.sku === color.sku;
          const isAvailable = color.isAvailable && !disabled;

          return (
            <button
              key={color.sku}
              type="button"
              onClick={() => isAvailable && onColorSelect(color)}
              disabled={!isAvailable}
              className={`color-swatch ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
              style={{
                backgroundColor: color.hex,
                borderColor: isSelected ? '#3B82F6' : '#E5E7EB'
              }}
              aria-label={`Select color: ${color.name}`}
              aria-disabled={!isAvailable}
              title={!isAvailable ? `${color.name} - Out of Stock` : color.name}
            >
              {/* Checkmark for selected */}
              {isSelected && (
                <svg
                  className="checkmark-icon"
                  fill="none"
                  stroke={isLightColor(color.hex) ? '#000' : '#fff'}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}

              {/* X mark for unavailable */}
              {!isAvailable && (
                <div className="unavailable-overlay">
                  <svg className="x-mark-icon" fill="none" stroke="#DC2626" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}

              {/* Small thumbnail image on hover */}
              {color.image && (
                <div className="color-image-preview">
                  <img src={`http://localhost:5000/${color.image}`} alt={color.name} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to determine if color is light (for checkmark visibility)
function isLightColor(hex) {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >>  8) & 0xff;
  const b = (rgb >>  0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma > 200;
}

export default ColorSelector;
