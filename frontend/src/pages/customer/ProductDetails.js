import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tab, Dialog, Transition } from '@headlessui/react';
import {
  ShoppingCartIcon,
  StarIcon as StarIconOutline,
  ChevronRightIcon,
  XMarkIcon,
  MagnifyingGlassPlusIcon,
  ShareIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LazyImage from '../../components/LazyImage';
import { ProductDetailsSkeleton } from '../../components/skeletons';
import VariantSelector from '../../components/VariantSelector';
import { API_URL, getImageUrl } from '../../utils/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

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

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

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
          const relatedRes = await axios.get(`${API_URL}/products?category=${data.data.category}&limit=4`);
          setRelatedProducts(relatedRes.data.data.filter(p => p._id !== id));
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

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/reviews/product/${id}`);
        setReviews(data.data || []);
      } catch (err) {
        console.error('Failed to fetch reviews');
        setReviews([]); // Set empty array on error
      }
    };

    if (product) {
      fetchReviews();
    }
  }, [id, product]);

  // Check if user can review
  useEffect(() => {
    const checkCanReview = async () => {
      if (!user) {
        setCanReview(false);
        return;
      }

      try {
        const { data } = await axios.get(`${API_URL}/reviews/can-review/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setCanReview(data.canReview);
      } catch (err) {
        setCanReview(false);
      }
    };

    if (product) {
      checkCanReview();
    }
  }, [id, product, user]);

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

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }

    if (!reviewData.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/reviews`,
        {
          product: id,
          rating: reviewData.rating,
          comment: reviewData.comment
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });

      // Refresh reviews
      const { data } = await axios.get(`${API_URL}/reviews/product/${id}`);
      setReviews(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      index < rating ? (
        <StarIconSolid key={index} className="w-4 h-4 text-yellow-400" />
      ) : (
        <StarIconOutline key={index} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
      )
    ));
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
                <button
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <ShareIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Product Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Review Button */}
              <div className="flex items-center justify-between mb-6">
                {product.numReviews > 0 ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {renderStars(Math.round(product.rating))}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {product.rating.toFixed(1)}
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
                    onClick={() => {
                      setShowReviewForm(true);
                      // Scroll to reviews tab
                      const reviewsSection = document.getElementById('reviews-section');
                      if (reviewsSection) {
                        reviewsSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
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
            <Tab.Group>
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
                  <div className="max-w-3xl">
                    {/* Reviews Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h3>
                        {product.numReviews > 0 && (
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                              {renderStars(Math.round(product.rating))}
                            </div>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {product.rating.toFixed(1)} out of 5
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              ({product.numReviews} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                      {canReview && (
                        <button
                          onClick={() => setShowReviewForm(!showReviewForm)}
                          className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm font-medium"
                        >
                          Write a Review
                        </button>
                      )}
                    </div>

                    {/* Review Form */}
                    {showReviewForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8"
                      >
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Write Your Review</h4>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Rating
                            </label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                                  className="focus:outline-none"
                                >
                                  {star <= reviewData.rating ? (
                                    <StarIconSolid className="w-8 h-8 text-yellow-400" />
                                  ) : (
                                    <StarIconOutline className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Your Review
                            </label>
                            <textarea
                              value={reviewData.comment}
                              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                              placeholder="Share your thoughts about this product..."
                              required
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="submit"
                              className="px-6 py-2.5 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium"
                            >
                              Submit Review
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowReviewForm(false)}
                              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-6">
                      {reviews.length > 0 ? (
                        reviews.map((review) => (
                          <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{review.user?.name || 'Anonymous'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex gap-0.5">
                                    {renderStars(review.rating)}
                                  </div>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <StarIconOutline className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-lg">No reviews yet</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Be the first to review this product</p>
                        </div>
                      )}
                    </div>
                  </div>
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct._id}
                    to={`/product/${relatedProduct._id}`}
                    className="group"
                  >
                    <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-3">
                      {relatedProduct.image ? (
                        <img
                          src={getImageUrl(relatedProduct.image)}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${relatedProduct.price?.toFixed(2)}
                    </p>
                    {relatedProduct.numReviews > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex gap-0.5">
                          {renderStars(Math.round(relatedProduct.rating))}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({relatedProduct.numReviews})
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Size Guide Modal */}
      <Transition appear show={showSizeGuide} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowSizeGuide(false)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white">
                      Size Guide
                    </Dialog.Title>
                    <button
                      onClick={() => setShowSizeGuide(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                          <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Size</th>
                          <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Chest (in)</th>
                          <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Waist (in)</th>
                          <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Hips (in)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">XS</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">32-34</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">24-26</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">34-36</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">S</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">34-36</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">26-28</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">36-38</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">M</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">36-38</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">28-30</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">38-40</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">L</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">38-40</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">30-32</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">40-42</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">XL</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">40-42</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">32-34</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">42-44</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">XXL</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">42-44</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">34-36</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">44-46</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Note:</strong> Measurements are in inches. For the best fit, measure yourself
                      and compare with the size chart above. If you're between sizes, we recommend sizing up.
                    </p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Image Zoom Modal */}
      <Transition appear show={showImageZoom} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowImageZoom(false)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-90" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative max-w-5xl w-full">
                  <button
                    onClick={() => setShowImageZoom(false)}
                    className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-white" />
                  </button>
                  {currentImages.length > 0 && (
                    <img
                      src={getImageUrl(currentImages[selectedImageIndex])}
                      alt={product.name}
                      className="w-full h-auto rounded-lg"
                    />
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Footer />
    </div>
  );
};

export default ProductDetails;
