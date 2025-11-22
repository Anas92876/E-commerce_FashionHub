import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { API_URL, getImageUrl } from '../../utils/api';
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

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [categories, setCategories] = useState([]);

  // Product mode: 'simple' or 'variants'
  const [productMode, setProductMode] = useState('variants');

  // Basic product information
  const [productInfo, setProductInfo] = useState({
    name: '',
    description: '',
    category: '',
    basePrice: '',
    isActive: true
  });

  // Size options
  const [sizeType, setSizeType] = useState('clothing');
  const [availableSizes, setAvailableSizes] = useState([]);

  // Variants state
  const [variants, setVariants] = useState([]);
  const [expandedVariants, setExpandedVariants] = useState(new Set());

  // Size type configurations
  const SIZE_TYPES = {
    clothing: { label: 'Clothing', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    jeans: { label: 'Jeans', sizes: ['26', '28', '30', '32', '34', '36', '38', '40'] },
    shoes: { label: 'Shoes (US)', sizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'] },
    kids: { label: 'Kids', sizes: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14'] }
  };

  // Fetch product and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingProduct(true);

        // Fetch product
        const productRes = await axios.get(`${API_URL}/products/${id}`);
        const product = productRes.data.data;

        // Set basic product info
        setProductInfo({
          name: product.name || '',
          description: product.description || '',
          category: product.category || '',
          basePrice: product.basePrice || product.price || '',
          isActive: product.isActive !== false
        });

        // Check if product has variants
        if (product.variants && product.variants.length > 0) {
          setProductMode('variants');

          // Load existing variants
          const loadedVariants = product.variants.map(variant => ({
            id: variant._id || Math.random().toString(36).substr(2, 9),
            color: {
              name: variant.color.name,
              code: variant.color.code,
              hex: variant.color.hex
            },
            images: variant.images || [],
            newImages: [],
            imagePreviews: [],
            priceOverride: variant.priceOverride || '',
            stock: variant.sizes.reduce((acc, size) => {
              acc[size.size] = size.stock;
              return acc;
            }, {}),
            sku: variant.sku,
            existingImages: variant.images || []
          }));

          setVariants(loadedVariants);

          // Determine size type from first variant
          if (product.variants[0].sizes.length > 0) {
            const firstSize = product.variants[0].sizes[0].size;
            if (['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(firstSize)) {
              setSizeType('clothing');
              setAvailableSizes(SIZE_TYPES.clothing.sizes);
            } else if (['26', '28', '30', '32', '34', '36', '38', '40'].includes(firstSize)) {
              setSizeType('jeans');
              setAvailableSizes(SIZE_TYPES.jeans.sizes);
            } else if (firstSize.includes('.') || parseInt(firstSize) <= 14) {
              setSizeType('shoes');
              setAvailableSizes(SIZE_TYPES.shoes.sizes);
            } else {
              setSizeType('kids');
              setAvailableSizes(SIZE_TYPES.kids.sizes);
            }
          }
        } else {
          setProductMode('simple');
        }

        // Fetch categories
        const categoriesRes = await axios.get(`${API_URL}/categories`);
        setCategories(categoriesRes.data.data || []);

        setFetchingProduct(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
        setFetchingProduct(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Update available sizes when size type changes
  useEffect(() => {
    setAvailableSizes(SIZE_TYPES[sizeType]?.sizes || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeType]);

  // Handle product info change
  const handleProductInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add new variant
  const handleAddVariant = () => {
    const newVariant = {
      id: Math.random().toString(36).substr(2, 9),
      color: { name: '', code: '', hex: '#000000' },
      images: [],
      newImages: [],
      imagePreviews: [],
      priceOverride: '',
      stock: availableSizes.reduce((acc, size) => {
        acc[size] = 0;
        return acc;
      }, {}),
      sku: '',
      existingImages: []
    };

    setVariants([...variants, newVariant]);
    setExpandedVariants(new Set([...expandedVariants, newVariant.id]));
  };

  // Remove variant
  const handleRemoveVariant = (variantId) => {
    setVariants(variants.filter(v => v.id !== variantId));
    const newExpanded = new Set(expandedVariants);
    newExpanded.delete(variantId);
    setExpandedVariants(newExpanded);
  };

  // Toggle variant expansion
  const toggleVariantExpansion = (variantId) => {
    const newExpanded = new Set(expandedVariants);
    if (newExpanded.has(variantId)) {
      newExpanded.delete(variantId);
    } else {
      newExpanded.add(variantId);
    }
    setExpandedVariants(newExpanded);
  };

  // Update variant color
  const handleVariantColorChange = (variantId, field, value) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        const updatedColor = { ...v.color, [field]: value };

        // Auto-generate code from name if name changes
        if (field === 'name' && value) {
          updatedColor.code = value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
        }

        // Generate SKU when color changes
        const sku = generateSKU(productInfo.name, updatedColor.code);

        return { ...v, color: updatedColor, sku };
      }
      return v;
    }));
  };

  // Select common color
  const handleSelectCommonColor = (variantId, color) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        const sku = generateSKU(productInfo.name, color.code);
        return { ...v, color: { ...color }, sku };
      }
      return v;
    }));
  };

  // Handle variant image upload
  const handleVariantImageChange = (variantId, e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    setVariants(variants.map(v => {
      if (v.id === variantId) {
        const currentTotal = (v.existingImages?.length || 0) + (v.newImages?.length || 0);
        const available = 5 - currentTotal;
        const filesToAdd = files.slice(0, available);

        // Create previews for new images
        const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));

        return {
          ...v,
          newImages: [...(v.newImages || []), ...filesToAdd],
          imagePreviews: [...(v.imagePreviews || []), ...newPreviews]
        };
      }
      return v;
    }));
  };

  // Remove existing image
  const handleRemoveExistingImage = (variantId, imageIndex) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        const newExistingImages = [...v.existingImages];
        newExistingImages.splice(imageIndex, 1);
        return { ...v, existingImages: newExistingImages };
      }
      return v;
    }));
  };

  // Remove new image
  const handleRemoveNewImage = (variantId, imageIndex) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        const newImages = [...v.newImages];
        const newPreviews = [...v.imagePreviews];

        // Revoke object URL
        if (newPreviews[imageIndex]) {
          URL.revokeObjectURL(newPreviews[imageIndex]);
        }

        newImages.splice(imageIndex, 1);
        newPreviews.splice(imageIndex, 1);

        return { ...v, newImages, imagePreviews: newPreviews };
      }
      return v;
    }));
  };

  // Update variant price
  const handleVariantPriceChange = (variantId, value) => {
    setVariants(variants.map(v =>
      v.id === variantId ? { ...v, priceOverride: value } : v
    ));
  };

  // Update variant stock
  const handleVariantStockChange = (variantId, size, value) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        return {
          ...v,
          stock: { ...v.stock, [size]: parseInt(value) || 0 }
        };
      }
      return v;
    }));
  };

  // Quick fill stock for all sizes
  const handleQuickFillStock = (variantId, value) => {
    const stockValue = parseInt(value) || 0;
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        const newStock = {};
        availableSizes.forEach(size => {
          newStock[size] = stockValue;
        });
        return { ...v, stock: newStock };
      }
      return v;
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!productInfo.name.trim()) {
      setError('Product name is required');
      return false;
    }

    if (!productInfo.description.trim()) {
      setError('Product description is required');
      return false;
    }

    if (!productInfo.category) {
      setError('Please select a category');
      return false;
    }

    if (!productInfo.basePrice || parseFloat(productInfo.basePrice) <= 0) {
      setError('Please enter a valid base price');
      return false;
    }

    if (productMode === 'variants') {
      if (variants.length === 0) {
        setError('Please add at least one color variant');
        return false;
      }

      for (let variant of variants) {
        if (!variant.color.name || !variant.color.hex || !variant.color.code) {
          setError('Please complete color information for all variants');
          return false;
        }

        const totalStock = Object.values(variant.stock).reduce((sum, val) => sum + val, 0);
        if (totalStock === 0) {
          setError(`Please set stock for ${variant.color.name} variant`);
          return false;
        }
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();

      // Add basic product info
      formData.append('name', productInfo.name);
      formData.append('description', productInfo.description);
      formData.append('category', productInfo.category);
      formData.append('basePrice', productInfo.basePrice);
      formData.append('isActive', productInfo.isActive);

      if (productMode === 'variants') {
        // Prepare variants data
        const variantsData = variants.map(variant => ({
          sku: variant.sku || generateSKU(productInfo.name, variant.color.code),
          color: variant.color,
          priceOverride: variant.priceOverride ? parseFloat(variant.priceOverride) : null,
          imageCount: variant.newImages.length,
          existingImages: variant.existingImages,
          sizes: availableSizes.map(size => ({
            size,
            stock: variant.stock[size] || 0,
            sku: generateSKU(productInfo.name, variant.color.code, size),
            lowStockThreshold: 5
          }))
        }));

        formData.append('variants', JSON.stringify(variantsData));
        formData.append('sizes', JSON.stringify(availableSizes));

        // Add all variant images
        variants.forEach(variant => {
          variant.newImages.forEach(image => {
            formData.append('images', image);
          });
        });
      }

      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/products/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccessMessage('Product updated successfully!');
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);

    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading product...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen p-6 transition-colors duration-300">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Update product information and variants</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Product Information */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={productInfo.name}
                  onChange={handleProductInfoChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="e.g., Premium Cotton T-Shirt"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={productInfo.description}
                  onChange={handleProductInfoChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Detailed product description..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={productInfo.category}
                    onChange={handleProductInfoChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Base Price * ($)
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={productInfo.basePrice}
                    onChange={handleProductInfoChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Size Type *
                </label>
                <select
                  value={sizeType}
                  onChange={(e) => setSizeType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Object.entries(SIZE_TYPES).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Sizes: {availableSizes.join(', ')}
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={productInfo.isActive}
                  onChange={handleProductInfoChange}
                  className="h-4 w-4 text-primary-600 dark:text-primary-400 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Product is active and visible to customers
                </label>
              </div>
            </div>
          </div>

          {/* Variants Section */}
          {productMode === 'variants' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Color Variants</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Manage product colors and their stock</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                >
                  + Add Variant
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-gray-600 dark:text-gray-300">No variants yet. Click "Add Variant" to create one.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant, index) => {
                    const isExpanded = expandedVariants.has(variant.id);
                    const totalStock = Object.values(variant.stock).reduce((sum, val) => sum + val, 0);
                    const totalImages = (variant.existingImages?.length || 0) + (variant.newImages?.length || 0);

                    return (
                      <div key={variant.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                        {/* Variant Header */}
                        <div
                          onClick={() => toggleVariantExpansion(variant.id)}
                          className="px-4 py-3 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                              style={{ backgroundColor: variant.color.hex }}
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {variant.color.name || `Variant ${index + 1}`}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {totalImages} images • {totalStock} total stock
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveVariant(variant.id);
                              }}
                              className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            >
                              Remove
                            </button>
                            <svg
                              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {/* Variant Content */}
                        {isExpanded && (
                          <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
                            {/* Quick Color Selection */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Quick Color Selection
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {COMMON_COLORS.map(color => (
                                  <button
                                    key={color.code}
                                    type="button"
                                    onClick={() => handleSelectCommonColor(variant.id, color)}
                                    className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                                      variant.color.code === color.code
                                        ? 'border-primary-600 ring-2 ring-primary-200'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                  >
                                    {variant.color.code === color.code && (
                                      <svg className="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Custom Color */}
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Color Name *
                                </label>
                                <input
                                  type="text"
                                  value={variant.color.name}
                                  onChange={(e) => handleVariantColorChange(variant.id, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                  placeholder="e.g., Navy Blue"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Color Code *
                                </label>
                                <input
                                  type="text"
                                  value={variant.color.code}
                                  onChange={(e) => handleVariantColorChange(variant.id, 'code', e.target.value.toUpperCase())}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                  placeholder="e.g., NAVY"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Hex Color *
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={variant.color.hex}
                                    onChange={(e) => handleVariantColorChange(variant.id, 'hex', e.target.value)}
                                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={variant.color.hex}
                                    onChange={(e) => handleVariantColorChange(variant.id, 'hex', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="#000000"
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Images */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Product Images ({totalImages} / 5)
                              </label>

                              {/* Existing Images */}
                              {variant.existingImages && variant.existingImages.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Existing Images:</p>
                                  <div className="grid grid-cols-5 gap-2">
                                    {variant.existingImages.map((img, idx) => (
                                      <div key={idx} className="relative group">
                                        <img
                                          src={getImageUrl(img)}
                                          alt={`Existing ${idx + 1}`}
                                          className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveExistingImage(variant.id, idx)}
                                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* New Images Preview */}
                              {variant.imagePreviews && variant.imagePreviews.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">New Images:</p>
                                  <div className="grid grid-cols-5 gap-2">
                                    {variant.imagePreviews.map((preview, idx) => (
                                      <div key={idx} className="relative group">
                                        <img
                                          src={preview}
                                          alt={`Preview ${idx + 1}`}
                                          className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveNewImage(variant.id, idx)}
                                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Upload Button */}
                              {totalImages < 5 && (
                                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors bg-gray-50 dark:bg-gray-700">
                                  <div className="text-center">
                                    <svg className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Add Images ({5 - totalImages} remaining)</p>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleVariantImageChange(variant.id, e)}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>

                            {/* Price Override */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Price Override (Optional)
                              </label>
                              <input
                                type="number"
                                value={variant.priceOverride}
                                onChange={(e) => handleVariantPriceChange(variant.id, e.target.value)}
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder={`Leave empty to use base price ($${productInfo.basePrice || '0.00'})`}
                              />
                            </div>

                            {/* Stock Management */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Stock by Size *
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    placeholder="Quick fill"
                                    className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleQuickFillStock(variant.id, e.target.value);
                                        e.target.value = '';
                                      }
                                    }}
                                  />
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Press Enter</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 gap-2">
                                {availableSizes.map(size => (
                                  <div key={size} className="text-center">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                      {size}
                                    </label>
                                    <input
                                      type="number"
                                      value={variant.stock[size] || 0}
                                      onChange={(e) => handleVariantStockChange(variant.id, size, e.target.value)}
                                      min="0"
                                      className="w-full px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                  </div>
                                ))}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Total Stock: <span className="font-semibold text-gray-900 dark:text-white">{totalStock}</span> units
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : '✓ Update Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditProduct;
