import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';
import {
  ShoppingCartIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  ShareIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LazyImage from '../../components/LazyImage';
import { ProductDetailsSkeleton } from '../../components/skeletons';
import VariantSelector from '../../components/VariantSelector';
import ProductCard from '../../components/ProductCard';
import StarRating from '../../components/StarRating';
import WishlistButton from '../../components/WishlistButton';
import SEO from '../../components/SEO';
import ProductReviews from '../../components/product/ProductReviews';
import SizeGuideModal from '../../components/product/SizeGuideModal';
import ImageZoomModal from '../../components/product/ImageZoomModal';
import { API_URL, getImageUrl } from '../../utils/api';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // NEW: Variant state
  const [availabilityMatrix, setAvailabilityMatrix] = useState(null);
  const [variantSelection, setVariantSelection] = useState({
    color: null,
    size: null,
    isValid: false,
    variantSku: null,
    sizeSku: null,
    price: null,
    stock: null
  });
  const [currentImages, setCurrentImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // UI State
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Reviews (list + form live in ProductReviews; these let the top button open it)
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  // Fetch product details and availability matrix
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        // Fetch product
        const { data } = await axios.get(`${API_URL}/products/${id}`);
        setProduct(data.data);

        // Fetch availability matrix
        try {
          const matrixRes = await axios.get(`${API_URL}/products/${id}/availability-matrix`);
          setAvailabilityMatrix(matrixRes.data.data);

          // Set initial images
          if (matrixRes.data.data.hasVariants && matrixRes.data.data.colors && matrixRes.data.data.colors.length > 0) {
            // Use first available variant's images
            const firstVariant = matrixRes.data.data.colors.find(v => v.isAvailable);
            if (firstVariant && firstVariant.allImages && firstVariant.allImages.length > 0) {
              setCurrentImages(firstVariant.allImages);
            } else if (data.data.image) {
              setCurrentImages([data.data.image]);
            }
          } else if (data.data.image) {
            // Legacy product with single image
            setCurrentImages([data.data.image]);
          }
        } catch (matrixErr) {
          if (data.data.image) {
            setCurrentImages([data.data.image]);
          }
        }

        // Fetch related products
        if (data.data.category) {
          const relatedRes = await axios.get(`${API_URL}/products`, { params: { category: data.data.category, limit: 5 } });
          setRelatedProducts(relatedRes.data.data.filter(p => p._id !== id).slice(0, 4));
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load product details');
        setLoading(false);
        toast.error('Failed to load product');
      }
    };

    fetchProduct();
  }, [id]);

  const handleVariantChange = (selection) => {
    setVariantSelection(selection);

    // Update images when color is selected
    if (selection.color && availabilityMatrix && availabilityMatrix.colors) {
      const selectedVariant = availabilityMatrix.colors.find(
        c => c.code === selection.color || c.name === selection.color
      );

      if (selectedVariant && selectedVariant.allImages && selectedVariant.allImages.length > 0) {
        setCurrentImages(selectedVariant.allImages);
        setSelectedImageIndex(0); // Reset to first image
      }
    }
  };

  const handleAddToCart = async () => {
    // Validate variant selection for variant-based products
    if (availabilityMatrix && availabilityMatrix.hasVariants && !variantSelection.isValid) {
      if (!variantSelection.color) {
        toast.error('Please select a color');
        return;
      }
      if (!variantSelection.size) {
        toast.error('Please select a size');
        return;
      }
      return;
    }

    setIsAddingToCart(true);

    try {
      let cartItem;

      if (availabilityMatrix && availabilityMatrix.hasVariants) {
        // Variant-based product
        cartItem = {
          _id: product._id,
          name: product.name,
          price: variantSelection.price || product.basePrice || product.price,
          image: currentImages[0] || product.image,
          category: product.category,
          quantity: quantity,
          stock: variantSelection.stock || 999,
          variant: {
            color: variantSelection.color,
            size: variantSelection.size,
            variantSku: variantSelection.variantSku,
            sizeSku: variantSelection.sizeSku
          }
        };
      } else {
        // Legacy product
        cartItem = {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: quantity,
          stock: product.stock || 0,
          selectedSize: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'One Size'
        };
      }

      addToCart(cartItem);
      setQuantity(1); // Reset quantity
    } catch (err) {
      console.error('Error in handleAddToCart:', err);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Refresh rating / review count after a new review
  const refreshProduct = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/products/${id}`);
      setProduct(data.data);
    } catch {
      // keep the current data
    }
  };

  const openReviewForm = () => {
    setSelectedTab(1);
    setShowReviewForm(true);
    // wait for the Reviews tab to render, then scroll to it
    setTimeout(() => {
      document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <ProductDetailsSkeleton />
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The product you're looking for doesn't exist</p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate display price
  const displayPrice = variantSelection.price || product.basePrice || product.price;

  // Calculate stock display
  const displayStock = (() => {
    // If variant is selected, show that variant's stock
    if (variantSelection.stock !== null && variantSelection.stock !== undefined) {
      return variantSelection.stock;
    }

    // If product has variants but none selected, calculate total stock
    if (availabilityMatrix && availabilityMatrix.hasVariants && availabilityMatrix.colors) {
      return availabilityMatrix.colors.reduce((total, color) => {
        return total + color.sizes.reduce((sum, size) => sum + size.stock, 0);
      }, 0);
    }

    // Legacy product without variants
    return product.stock;
  })();

  const isOutOfStock = displayStock === 0;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      <SEO title={product.name} description={product.description?.slice(0, 160)} />
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Link to="/products" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Products
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-900 dark:text-white font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">

            {/* Image Gallery - Left Side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10 lg:mb-0"
            >
              <div className="sticky top-20">
                {/* Main Image */}
                <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-2 group">
                  {currentImages.length > 0 ? (
                    <>
                      <LazyImage
                        src={getImageUrl(currentImages[selectedImageIndex])}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Zoom Button */}
                      <button
                        onClick={() => setShowImageZoom(true)}
                        className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-700"
                      >
                        <MagnifyingGlassPlusIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </button>
                    </>
                  ) : product.image ? (
                    <LazyImage
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-400 dark:text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No Image Available</p>
                      </div>
                    </div>
                  )}

                  {/* Stock Badge */}
                  {isOutOfStock && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1.5 bg-red-600 dark:bg-red-700 text-white text-xs font-semibold rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {!isOutOfStock && displayStock > 0 && displayStock < 10 && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1.5 bg-amber-500 dark:bg-amber-600 text-white text-xs font-semibold rounded-full">
                        Only {displayStock} left
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {currentImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-1.5">
                    {currentImages.slice(0, 4).map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? 'border-primary-600 dark:border-primary-500 ring-2 ring-primary-600 dark:ring-primary-500 ring-offset-2 dark:ring-offset-gray-900'
                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <img
                          src={getImageUrl(img)}
                          alt={`${product.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Info - Right Side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Category & Share */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full uppercase tracking-wide">
                  {product.category}
                </span>
                <div className="flex items-center gap-2">
                  <WishlistButton productId={product._id} />
                  <button
                    onClick={handleShare}
                    aria-label="Share product"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <ShareIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Product Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Review Button */}
              <div className="flex items-center justify-between mb-6">
                {product.numReviews > 0 ? (
                  <div className="flex items-center gap-3">
                    <StarRating rating={product.rating} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {Number(product.rating).toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No reviews yet</div>
                )}
                {canReview && (
                  <button
                    onClick={openReviewForm}
                    className="px-4 py-2 border border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors text-sm font-medium"
                  >
                    Write Review
                  </button>
                )}
              </div>

              {/* Price */}
              {displayPrice && displayPrice > 0 && (
                <div className="mb-8">
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${displayPrice.toFixed(2)}
                  </p>
                  {availabilityMatrix?.hasVariablePricing && !variantSelection.color && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Price varies by color</p>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="mb-8">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Variant Selector */}
              {availabilityMatrix && availabilityMatrix.hasVariants && (
                <div className="mb-8">
                  <VariantSelector
                    availabilityMatrix={availabilityMatrix}
                    onSelectionChange={handleVariantChange}
                  />
                </div>
              )}

              {/* Size Guide Link */}
              {availabilityMatrix && availabilityMatrix.hasVariants && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium underline"
                  >
                    View Size Guide
                  </button>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">−</span>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-10 text-center border border-gray-300 dark:border-gray-600 rounded-lg font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    disabled={isOutOfStock || quantity >= displayStock}
                  >
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">+</span>
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    {displayStock} available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 dark:bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-700 dark:hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  {isOutOfStock ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>

              {/* Features */}
             
            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-16 lg:mt-20">
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
              <Tab.List className="flex gap-8 border-b border-gray-200 dark:border-gray-700">
                {['Description', 'Reviews', 'Shipping Info'].map((tab) => (
                  <Tab
                    key={tab}
                    className={({ selected }) =>
                      `py-4 px-1 text-sm font-medium border-b-2 transition-colors outline-none ${
                        selected
                          ? 'border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`
                    }
                  >
                    {tab}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="mt-8">
                {/* Description Panel */}
                <Tab.Panel className="prose max-w-none">
                  <div className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p className="text-lg mb-4">{product.description}</p>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Product Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <span>High-quality materials for lasting durability</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <span>Comfortable fit for all-day wear</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <span>Easy care and maintenance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <span>Available in multiple colors and sizes</span>
                      </li>
                    </ul>
                  </div>
                </Tab.Panel>

                {/* Reviews Panel */}
                <Tab.Panel id="reviews-section">
                  <ProductReviews
                    productId={id}
                    rating={product.rating}
                    numReviews={product.numReviews}
                    formOpen={showReviewForm}
                    setFormOpen={setShowReviewForm}
                    onCanReviewChange={setCanReview}
                    onReviewAdded={refreshProduct}
                  />
                </Tab.Panel>

                {/* Shipping Info Panel */}
                <Tab.Panel>
                  <div className="max-w-3xl space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Shipping Information</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We offer free standard shipping on all orders over $50. Orders are typically processed
                        within 1-2 business days and delivered within 3-5 business days.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Returns & Exchanges</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Not satisfied? We offer easy 30-day returns and exchanges. Items must be in original
                        condition with tags attached. Return shipping is free for exchanges.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">International Shipping</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We ship worldwide! International shipping rates and delivery times vary by location.
                        Customs fees and import taxes may apply.
                      </p>
                    </div>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct._id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <SizeGuideModal open={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
      <ImageZoomModal
        open={showImageZoom}
        onClose={() => setShowImageZoom(false)}
        src={currentImages.length > 0 ? getImageUrl(currentImages[selectedImageIndex]) : null}
        alt={product.name}
      />

      <Footer />
    </div>
  );
};

export default ProductDetails;
