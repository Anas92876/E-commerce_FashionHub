import React, { useState, useEffect } from 'react';
import ColorSelector from './ColorSelector';
import SizeSelector from './SizeSelector';
import './VariantSelector.css';

const VariantSelector = ({
  availabilityMatrix,
  onSelectionChange,
  disabled = false,
  initialColor = null,
  initialSize = null
}) => {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [availableSizes, setAvailableSizes] = useState([]);

  // Auto-select first available color on mount if no initial color
  useEffect(() => {
    if (availabilityMatrix && availabilityMatrix.hasVariants) {
      if (!selectedColor && availabilityMatrix.colors && availabilityMatrix.colors.length > 0) {
        const firstAvailableColor = availabilityMatrix.colors.find(c => c.isAvailable);
        if (firstAvailableColor) {
          handleColorSelect(firstAvailableColor);
        }
      }
    }
  }, [availabilityMatrix]);

  // Update available sizes when color changes
  useEffect(() => {
    if (selectedColor && selectedColor.sizes) {
      setAvailableSizes(selectedColor.sizes);
    } else {
      setAvailableSizes([]);
    }
  }, [selectedColor]);

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange({
        color: selectedColor,
        size: selectedSize,
        isValid: !!(selectedColor && selectedSize),
        variantSku: selectedColor?.sku,
        sizeSku: selectedColor?.sizes.find(s => s.size === selectedSize)?.sku,
        price: selectedColor?.price,
        stock: selectedColor?.sizes.find(s => s.size === selectedSize)?.stock
      });
    }
  }, [selectedColor, selectedSize]);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    // Reset size when color changes
    setSelectedSize(null);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  // Handle legacy products without variants
  if (!availabilityMatrix || !availabilityMatrix.hasVariants) {
    return (
      <SizeSelector
        sizes={availabilityMatrix?.sizes || []}
        selectedSize={selectedSize}
        onSizeSelect={handleSizeSelect}
        disabled={disabled}
      />
    );
  }

  const selectedSizeObj = availableSizes.find(s => s.size === selectedSize);

  return (
    <div className="variant-selector">
      {/* Color Selector */}
      <ColorSelector
        colors={availabilityMatrix.colors}
        selectedColor={selectedColor}
        onColorSelect={handleColorSelect}
        disabled={disabled}
      />

      {/* Size Selector */}
      {selectedColor && (
        <SizeSelector
          sizes={availableSizes}
          selectedSize={selectedSize}
          onSizeSelect={handleSizeSelect}
          disabled={disabled}
        />
      )}

      {/* Stock Warning */}
      {selectedColor && selectedSize && selectedSizeObj && (
        <div className="stock-warnings">
          {selectedSizeObj.lowStock && selectedSizeObj.stock > 0 && (
            <div className="stock-warning low-stock">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Only {selectedSizeObj.stock} left in stock!</span>
            </div>
          )}
        </div>
      )}

      {/* Price Display (if variable pricing) */}
      {availabilityMatrix.hasVariablePricing && selectedColor && (
        <div className="variant-price">
          <span className="text-gray-600">Price:</span>
          <span className="font-heading font-bold text-2xl text-primary-600">
            ${selectedColor.price.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
