import React from 'react';
import './VariantSelector.css';

const SizeSelector = ({ sizes, selectedSize, onSizeSelect, disabled }) => {
  if (!sizes || sizes.length === 0) {
    return null;
  }

  return (
    <div className="size-selector">
      <label className="selector-label">
        Size: {selectedSize ? <span className="font-semibold">{selectedSize}</span> : <span className="text-gray-500">Select a size</span>}
      </label>

      <div className="size-buttons">
        {sizes.map((sizeObj) => {
          const isSelected = selectedSize === sizeObj.size;
          const isAvailable = sizeObj.available && !disabled;

          return (
            <button
              key={sizeObj.size}
              type="button"
              onClick={() => isAvailable && onSizeSelect(sizeObj.size)}
              disabled={!isAvailable}
              className={`size-button ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
              aria-label={`Select size: ${sizeObj.size}`}
              aria-disabled={!isAvailable}
              title={
                !isAvailable
                  ? `Size ${sizeObj.size} - Out of Stock`
                  : sizeObj.lowStock
                    ? `Size ${sizeObj.size} - Only ${sizeObj.stock} left`
                    : `Size ${sizeObj.size} - ${sizeObj.stock} available`
              }
            >
              <span className={!isAvailable ? 'strikethrough' : ''}>
                {sizeObj.size}
              </span>

              {/* Low stock indicator */}
              {isAvailable && sizeObj.lowStock && (
                <span className="low-stock-badge">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default SizeSelector;
