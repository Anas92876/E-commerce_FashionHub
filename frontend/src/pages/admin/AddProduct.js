import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { API_URL } from '../../utils/api';
import './ProductForm.css';

// Helper function to generate SKU
const generateSKU = (productName, colorCode, size = null) => {
  const cleanName = productName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
  const cleanColor = colorCode.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (size) {
    return `${cleanName}-${cleanColor}-${size}`;
  }
  return `${cleanName}-${cleanColor}`;
};

// Common color options
const COMMON_COLORS = [
  { name: 'Black', hex: '#000000', code: 'BLACK' },
  { name: 'White', hex: '#FFFFFF', code: 'WHITE' },
  { name: 'Navy Blue', hex: '#1e3a8a', code: 'NAVY' },
  { name: 'Red', hex: '#dc2626', code: 'RED' },
  { name: 'Green', hex: '#16a34a', code: 'GREEN' },
  { name: 'Blue', hex: '#2563eb', code: 'BLUE' },
  { name: 'Gray', hex: '#6b7280', code: 'GRAY' },
  { name: 'Beige', hex: '#d4b896', code: 'BEIGE' },
  { name: 'Brown', hex: '#78350f', code: 'BROWN' },
  { name: 'Pink', hex: '#ec4899', code: 'PINK' }
];

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [categories, setCategories] = useState([]);

  // Product mode: 'simple' or 'variants'
  const [productMode, setProductMode] = useState('simple'); // Default to simple mode

  // Basic product information
  const [productInfo, setProductInfo] = useState({
    name: '',
    description: '',
    category: '',
    isActive: true
  });

  // Variant state
  const [variants, setVariants] = useState([]);
  const [expandedVariant, setExpandedVariant] = useState(null);

  // Simple product state
  const [simpleProduct, setSimpleProduct] = useState({
    price: '',
    stock: '',
    image: null,
    imagePreview: null
  });

  // Size options
  const [sizeType, setSizeType] = useState('clothing');
  const sizeOptions = {
    clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    jeans: ['26', '28', '30', '32', '34', '36', '38', '40'],
    shoes: ['6', '7', '8', '9', '10', '11', '12'],
    kids: ['2T', '3T', '4T', '5T', '6', '8', '10', '12']
  };

  const availableSizes = sizeOptions[sizeType] || [];

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/categories`);
        setCategories(data.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Handle product info change
  const handleProductInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle simple product field change
  const handleSimpleProductChange = (e) => {
    const { name, value } = e.target;
    setSimpleProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle simple product image upload
  const handleSimpleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSimpleProduct(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  // Add new variant
  const handleAddVariant = () => {
    const newVariant = {
      id: Date.now(), // Temporary ID
      color: {
        name: '',
        hex: '#000000',
        code: ''
      },
      images: [],
      imagePreviews: [],
      priceOverride: '',
      sizes: availableSizes.map(size => ({
        size,
        stock: 0,
        lowStockThreshold: 5
      }))
    };

    setVariants(prev => [...prev, newVariant]);
    setExpandedVariant(newVariant.id);
  };

  // Remove variant
  const handleRemoveVariant = (variantId) => {
    setVariants(prev => prev.filter(v => v.id !== variantId));
    if (expandedVariant === variantId) {
      setExpandedVariant(null);
    }
  };

  // Update variant color
  const handleVariantColorChange = (variantId, field, value) => {
    setVariants(prev => prev.map(v => {
      if (v.id === variantId) {
        return {
          ...v,
          color: {
            ...v.color,
            [field]: value
          }
        };
      }
      return v;
    }));
  };

  // Use predefined color
  const handleUsePredefinedColor = (variantId, color) => {
    setVariants(prev => prev.map(v => {
      if (v.id === variantId) {
        return {
          ...v,
          color: { ...color }
        };
      }
      return v;
    }));
  };

  // Update variant price override
  const handleVariantPriceChange = (variantId, value) => {
    setVariants(prev => prev.map(v => {
      if (v.id === variantId) {
        return { ...v, priceOverride: value };
      }
      return v;
    }));
  };

  // Update variant size stock
  const handleVariantSizeStockChange = (variantId, size, stock) => {
    setVariants(prev => prev.map(v => {
      if (v.id === variantId) {
        return {
          ...v,
          sizes: v.sizes.map(s =>
            s.size === size ? { ...s, stock: parseInt(stock) || 0 } : s
          )
        };
      }
      return v;
    }));
  };

  // Handle variant images
  const handleVariantImageChange = (variantId, e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate number of images (1-5)
    const variant = variants.find(v => v.id === variantId);
    const totalImages = (variant.images?.length || 0) + files.length;

    if (totalImages > 5) {
      setError('Maximum 5 images allowed per variant');
      return;
    }

    // Validate file types and sizes
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB');
        return;
      }
    }

    // Create previews and store files
    const newPreviews = [];
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(() => {
      setVariants(prev => prev.map(v => {
        if (v.id === variantId) {
          return {
            ...v,
            images: [...(v.images || []), ...files],
            imagePreviews: [...(v.imagePreviews || []), ...newPreviews]
          };
        }
        return v;
      }));
    });

    setError('');
  };

  // Remove variant image
  const handleRemoveVariantImage = (variantId, imageIndex) => {
    setVariants(prev => prev.map(v => {
      if (v.id === variantId) {
        return {
          ...v,
          images: v.images.filter((_, idx) => idx !== imageIndex),
          imagePreviews: v.imagePreviews.filter((_, idx) => idx !== imageIndex)
        };
      }
      return v;
    }));
  };

  // Quick fill all sizes with same stock
  const handleQuickFillStock = (variantId, stockValue) => {
    const stock = parseInt(stockValue) || 0;
    setVariants(prev => prev.map(v => {
      if (v.id === variantId) {
        return {
          ...v,
          sizes: v.sizes.map(s => ({ ...s, stock }))
        };
      }
      return v;
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Validation
      if (!productInfo.name.trim()) {
        throw new Error('Product name is required');
      }
      if (!productInfo.description.trim()) {
        throw new Error('Product description is required');
      }
      if (productMode === 'simple' && (!simpleProduct.price || simpleProduct.price <= 0)) {
        throw new Error('Price must be greater than 0');
      }
      if (!productInfo.category) {
        throw new Error('Please select a category');
      }

      if (productMode === 'variants') {
        // Validate variants
        if (variants.length === 0) {
          throw new Error('Please add at least one color variant');
        }

        for (const variant of variants) {
          if (!variant.color.name || !variant.color.hex || !variant.color.code) {
            throw new Error('All variants must have complete color information (name, hex, code)');
          }
          if (!variant.priceOverride || variant.priceOverride <= 0) {
            throw new Error(`Please set a price for the ${variant.color.name || 'variant'} color`);
          }
          // Images are now optional - no minimum requirement
        }

        // Calculate base price from variants (use the lowest price)
        const basePriceCalculated = Math.min(
          ...variants.map(v => v.priceOverride ? parseFloat(v.priceOverride) : 0).filter(p => p > 0)
        );

        // Create product with variants
        const formData = new FormData();
        formData.append('name', productInfo.name);
        formData.append('description', productInfo.description);
        formData.append('basePrice', basePriceCalculated || 0);
        formData.append('category', productInfo.category);
        formData.append('isActive', productInfo.isActive);

        // Add legacy fields for backward compatibility
        formData.append('price', basePriceCalculated || 0);
        formData.append('stock', 0);
        formData.append('sizes', JSON.stringify(availableSizes));

        // Build variants data and append all images
        const variantsData = variants.map((variant) => {
          const sku = generateSKU(productInfo.name, variant.color.code);

          // Append all variant images to FormData with 'images' field name
          variant.images.forEach((imageFile) => {
            formData.append('images', imageFile);
          });

          return {
            sku,
            color: variant.color,
            priceOverride: variant.priceOverride ? parseFloat(variant.priceOverride) : null,
            imageCount: variant.images.length,
            sizes: variant.sizes.map(s => ({
              size: s.size,
              stock: s.stock,
              sku: generateSKU(productInfo.name, variant.color.code, s.size),
              lowStockThreshold: s.lowStockThreshold
            }))
          };
        });

        formData.append('variants', JSON.stringify(variantsData));

        // Get token
        const token = localStorage.getItem('token');

        // Send request
        const response = await axios.post(`${API_URL}/products`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setSuccessMessage('Product with variants created successfully!');
          setTimeout(() => {
            navigate('/admin/products');
          }, 2000);
        }

      } else {
        // Simple mode - create legacy product
        if (!simpleProduct.image) {
          throw new Error('Please upload a product image');
        }
        if (!simpleProduct.stock || simpleProduct.stock < 0) {
          throw new Error('Stock must be 0 or greater');
        }

        const formData = new FormData();
        formData.append('name', productInfo.name);
        formData.append('description', productInfo.description);
        formData.append('price', simpleProduct.price);
        formData.append('category', productInfo.category);
        formData.append('stock', simpleProduct.stock);
        formData.append('sizes', JSON.stringify(['One Size']));
        formData.append('isActive', productInfo.isActive);
        formData.append('images', simpleProduct.image);

        const token = localStorage.getItem('token');

        const response = await axios.post(`${API_URL}/products`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setSuccessMessage('Simple product created successfully!');
          setTimeout(() => {
            navigate('/admin/products');
          }, 2000);
        }
      }

    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="product-form-page">
        <div className="page-header">
          <h1 className="page-title">Add New Product</h1>
          <button
            className="btn-secondary"
            onClick={() => navigate('/admin/products')}
          >
            ← Back to Products
          </button>
        </div>

        <div className="admin-card">
          {error && <div className="alert alert-error">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <form onSubmit={handleSubmit} className="product-form">

            {/* Product Mode Selection */}
            <div className="form-group">
              <label className="form-label-large">Product Type</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="variants"
                    checked={productMode === 'variants'}
                    onChange={(e) => setProductMode(e.target.value)}
                  />
                  <div className="radio-label-content">
                    <strong>Multiple Color Variants</strong>
                    <span>Product with different colors, each with individual stock per size</span>
                  </div>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="simple"
                    checked={productMode === 'simple'}
                    onChange={(e) => setProductMode(e.target.value)}
                  />
                  <div className="radio-label-content">
                    <strong>Simple Product (Legacy)</strong>
                    <span>Single color product with one image</span>
                  </div>
                </label>
              </div>
            </div>

            <hr className="form-divider" />

            {/* Basic Product Information */}
            <div className="form-section">
              <h2 className="form-section-title">Basic Information</h2>

              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={productInfo.name}
                  onChange={handleProductInfoChange}
                  placeholder="e.g., Classic Cotton T-Shirt"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={productInfo.description}
                  onChange={handleProductInfoChange}
                  placeholder="Describe the product in detail..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={productInfo.category}
                  onChange={handleProductInfoChange}
                  required
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size Type - Only for Variants Mode */}
              {productMode === 'variants' && (
                <div className="form-group">
                  <label htmlFor="sizeType">Size Type *</label>
                  <select
                    id="sizeType"
                    value={sizeType}
                    onChange={(e) => setSizeType(e.target.value)}
                    className="form-control"
                  >
                    <option value="clothing">Clothing Sizes (XS, S, M, L, XL, XXL)</option>
                    <option value="jeans">Jeans Sizes (26, 28, 30, 32, ...)</option>
                    <option value="shoes">Shoe Sizes (6, 7, 8, 9, ...)</option>
                    <option value="kids">Kids Sizes (2T, 3T, 4T, ...)</option>
                  </select>
                  <p className="form-hint">Selected sizes: {availableSizes.join(', ')}</p>
                </div>
              )}

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={productInfo.isActive}
                    onChange={handleProductInfoChange}
                  />
                  <span>Active (visible to customers)</span>
                </label>
              </div>
            </div>

            {/* Simple Product Section */}
            {productMode === 'simple' && (
              <>
                <hr className="form-divider" />

                <div className="form-section">
                  <h2 className="form-section-title">Product Details</h2>

                  {/* Price */}
                  <div className="form-group">
                    <label htmlFor="price">Price *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={simpleProduct.price}
                      onChange={handleSimpleProductChange}
                      placeholder="e.g., 29.99"
                      step="1"
                      min="0"
                      required
                    />
                  </div>

                  {/* Stock */}
                  <div className="form-group">
                    <label htmlFor="stock">Stock Quantity *</label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={simpleProduct.stock}
                      onChange={handleSimpleProductChange}
                      placeholder="e.g., 100"
                      min="0"
                      required
                    />
                    <p className="form-hint">Total available quantity for this product</p>
                  </div>

                  {/* Image Upload */}
                  <div className="form-group">
                    <label htmlFor="image">Product Image *</label>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleSimpleProductImageChange}
                      required
                    />
                    {simpleProduct.imagePreview && (
                      <div className="image-preview">
                        <img src={simpleProduct.imagePreview} alt="Product preview" />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Variants Section */}
            {productMode === 'variants' && (
              <>
                <hr className="form-divider" />

                <div className="form-section">
                  <div className="form-section-header">
                    <h2 className="form-section-title">Color Variants</h2>
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={handleAddVariant}
                    >
                      + Add Color Variant
                    </button>
                  </div>

                  {variants.length === 0 && (
                    <div className="empty-state">
                      <p>No color variants yet. Click "Add Color Variant" to get started.</p>
                    </div>
                  )}

                  {/* Variant Cards */}
                  <div className="variants-list">
                    {variants.map((variant, index) => (
                      <div key={variant.id} className="variant-card">
                        <div className="variant-card-header">
                          <button
                            type="button"
                            className="variant-expand-btn"
                            onClick={() => setExpandedVariant(
                              expandedVariant === variant.id ? null : variant.id
                            )}
                          >
                            <span className="variant-color-preview" style={{ backgroundColor: variant.color.hex }}></span>
                            <span className="variant-title">
                              {variant.color.name || `Variant ${index + 1}`}
                            </span>
                            <span className="variant-expand-icon">
                              {expandedVariant === variant.id ? '▼' : '▶'}
                            </span>
                          </button>
                          <button
                            type="button"
                            className="btn-danger btn-sm"
                            onClick={() => handleRemoveVariant(variant.id)}
                          >
                            ✕ Remove
                          </button>
                        </div>

                        {expandedVariant === variant.id && (
                          <div className="variant-card-body">

                            {/* Color Information */}
                            <div className="variant-section">
                              <h4 className="variant-section-title">Color Information</h4>

                              {/* Predefined Colors */}
                              <div className="predefined-colors">
                                <label className="form-label-sm">Quick Select:</label>
                                <div className="color-chips">
                                  {COMMON_COLORS.map(color => (
                                    <button
                                      key={color.code}
                                      type="button"
                                      className="color-chip"
                                      style={{ backgroundColor: color.hex }}
                                      title={color.name}
                                      onClick={() => handleUsePredefinedColor(variant.id, color)}
                                    >
                                      {variant.color.code === color.code && <span className="color-chip-check">✓</span>}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="form-row">
                                <div className="form-group">
                                  <label>Color Name *</label>
                                  <input
                                    type="text"
                                    value={variant.color.name}
                                    onChange={(e) => handleVariantColorChange(variant.id, 'name', e.target.value)}
                                    placeholder="e.g., Navy Blue"
                                    required
                                  />
                                </div>

                                <div className="form-group">
                                  <label>Color Code *</label>
                                  <input
                                    type="text"
                                    value={variant.color.code}
                                    onChange={(e) => handleVariantColorChange(variant.id, 'code', e.target.value.toUpperCase())}
                                    placeholder="e.g., NAVY"
                                    required
                                  />
                                </div>

                                <div className="form-group">
                                  <label>Hex Color *</label>
                                  <div className="color-input-group">
                                    <input
                                      type="color"
                                      value={variant.color.hex}
                                      onChange={(e) => handleVariantColorChange(variant.id, 'hex', e.target.value)}
                                      className="color-picker"
                                    />
                                    <input
                                      type="text"
                                      value={variant.color.hex}
                                      onChange={(e) => handleVariantColorChange(variant.id, 'hex', e.target.value)}
                                      placeholder="#000000"
                                      pattern="^#[0-9A-Fa-f]{6}$"
                                      required
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Images */}
                            <div className="variant-section">
                              <h4 className="variant-section-title">Images (1-5 required)</h4>

                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleVariantImageChange(variant.id, e)}
                                className="file-input"
                                disabled={variant.images?.length >= 5}
                              />
                              <p className="form-hint">
                                {variant.images?.length || 0} / 5 images added. Max size: 5MB each.
                              </p>

                              {variant.imagePreviews && variant.imagePreviews.length > 0 && (
                                <div className="image-preview-grid">
                                  {variant.imagePreviews.map((preview, idx) => (
                                    <div key={idx} className="image-preview-item">
                                      <img src={preview} alt={`Preview ${idx + 1}`} />
                                      <button
                                        type="button"
                                        className="remove-image-btn-small"
                                        onClick={() => handleRemoveVariantImage(variant.id, idx)}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Price */}
                            <div className="variant-section">
                              <h4 className="variant-section-title">Pricing</h4>
                              <div className="form-group">
                                <label>Price ($) *</label>
                                <input
                                  type="number"
                                  value={variant.priceOverride}
                                  onChange={(e) => handleVariantPriceChange(variant.id, e.target.value)}
                                  placeholder="Enter price for this color"
                                  min="0"
                                  step="1"
                                  required
                                />
                                <p className="form-hint">
                                  Set the selling price for this color variant
                                </p>
                              </div>
                            </div>

                            {/* Stock per Size */}
                            <div className="variant-section">
                              <div className="variant-section-header-inline">
                                <h4 className="variant-section-title">Stock by Size</h4>
                                <div className="quick-fill-group">
                                  <label className="form-label-sm">Quick Fill All:</label>
                                  <input
                                    type="number"
                                    placeholder="Stock"
                                    min="0"
                                    className="quick-fill-input"
                                    onBlur={(e) => {
                                      if (e.target.value) {
                                        handleQuickFillStock(variant.id, e.target.value);
                                        e.target.value = '';
                                      }
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="size-stock-grid">
                                {variant.sizes.map(sizeObj => (
                                  <div key={sizeObj.size} className="size-stock-item">
                                    <label className="size-label">{sizeObj.size}</label>
                                    <input
                                      type="number"
                                      value={sizeObj.stock}
                                      onChange={(e) => handleVariantSizeStockChange(variant.id, sizeObj.size, e.target.value)}
                                      min="0"
                                      className="size-stock-input"
                                      placeholder="0"
                                    />
                                  </div>
                                ))}
                              </div>

                              <p className="form-hint">
                                Total Stock: {variant.sizes.reduce((sum, s) => sum + s.stock, 0)} units
                              </p>
                            </div>

                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Submit Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating Product...' : '✓ Create Product'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/admin/products')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddProduct;
