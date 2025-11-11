import React from 'react';
import './VariantSelector.css';

const SizeSelector = ({ sizes, selectedSize, onSizeSelect, disabled }) => {
  if (!sizes || sizes.length === 0) {
    return null;
  }

  return (
    <div className="size-selector">
      <label className="selector-label font-heading">
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

      {/* Size guide link (optional) */}
      <button
        type="button"
        className="size-guide-link"
        onClick={(e) => {
          e.preventDefault();
          // Open size guide modal or page
          alert('Size Guide feature coming soon!');
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Size Guide
      </button>
    </div>
  );
};

export default SizeSelector;
