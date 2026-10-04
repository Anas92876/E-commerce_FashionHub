import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';
import {
  ShoppingBagIcon,
  MagnifyingGlassPlusIcon,
  ShareIcon,
  TruckIcon,
  BanknotesIcon,
  MapIcon,
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
      <div className="flex min-h-screen flex-col bg-canvas pt-16 dark:bg-gray-950">
        <Navbar />
        <ProductDetailsSkeleton />
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas pt-16 dark:bg-gray-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-4xl font-medium text-ink dark:text-white">Product <span className="font-serif italic">not found</span></h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The product you're looking for doesn't exist</p>
            <Link
              to="/products"
              className="inline-flex h-12 items-center rounded-md bg-primary-600 px-7 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
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

  // Real product facts for the Details tab
  const colorNames = (availabilityMatrix?.colors || []).map((c) => c.name).filter(Boolean);
  const sizeNames = [
    ...new Set(
      (availabilityMatrix?.colors || []).flatMap((c) => (c.sizes || []).map((sz) => sz.size || sz.name)).filter(Boolean)
    ),
  ];
  const facts = [
    { label: 'Category', value: product.category },
    colorNames.length > 0 && { label: colorNames.length === 1 ? 'Colour' : 'Colours', value: colorNames.join(', ') },
    sizeNames.length > 0 && { label: 'Sizes', value: sizeNames.join(', ') },
    product.numReviews > 0 && { label: 'Rating', value: `${Number(product.rating).toFixed(1)} out of 5 (${product.numReviews} ${product.numReviews === 1 ? 'review' : 'reviews'})` },
  ].filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-canvas pt-16 dark:bg-gray-950">
      <SEO title={product.name} description={product.description?.slice(0, 160)} />
      <Navbar />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-gray-400">
          <li>
            <Link to="/" className="hover:text-ink dark:hover:text-white">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/products" className="hover:text-ink dark:hover:text-white">Shop</Link>
          </li>
          {product.category && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-ink dark:hover:text-white">
                  {product.category}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="truncate font-medium text-ink dark:text-white">{product.name}</li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">

            {/* Image Gallery - Left Side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10 lg:mb-0"
            >
              <div className="lg:sticky lg:top-24">
                {/* Main Image */}
                <div className="group relative mb-3 aspect-[4/5] overflow-hidden bg-sand dark:bg-gray-800">
                  {currentImages.length > 0 ? (
                    <>
                      <LazyImage
                        src={getImageUrl(currentImages[selectedImageIndex])}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Zoom Button */}
                      <button
                        type="button"
                        onClick={() => setShowImageZoom(true)}
                        aria-label="Zoom image"
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-opacity hover:bg-white focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:bg-gray-900/90 dark:text-white sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <MagnifyingGlassPlusIcon className="h-5 w-5" aria-hidden="true" />
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
                      <span className="inline-block bg-ink px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {!isOutOfStock && displayStock > 0 && displayStock < 10 && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-block bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink">
                        Only {displayStock} left
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {currentImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {currentImages.slice(0, 4).map((img, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        aria-label={`Show image ${index + 1}`}
                        aria-pressed={selectedImageIndex === index}
                        className={`relative aspect-[4/5] overflow-hidden bg-sand transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:bg-gray-800 ${
                          selectedImageIndex === index
                            ? 'ring-1 ring-ink dark:ring-white'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={getImageUrl(img)}
                          alt=""
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
              {/* Category & actions */}
              <div className="flex items-start justify-between gap-4">
                <Link
                  to={`/products?category=${encodeURIComponent(product.category)}`}
                  className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 hover:text-ink dark:text-gray-400 dark:hover:text-white"
                >
                  <span aria-hidden="true" className="h-px w-8 bg-stone-400 dark:bg-gray-600" />
                  {product.category}
                </Link>
                <div className="flex items-center gap-1">
                  <WishlistButton productId={product._id} className="shadow-none ring-1 ring-stone-200 dark:ring-gray-800" />
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share product"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-sand focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:text-white dark:hover:bg-gray-800"
                  >
                    <ShareIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <h1 className="mt-5 text-4xl font-medium leading-[1.05] tracking-[-0.02em] text-ink dark:text-white lg:text-5xl">
                {product.name}
              </h1>

              {/* Rating & Review Button */}
              <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
                {product.numReviews > 0 ? (
                  <div className="flex items-center gap-3">
                    <StarRating rating={product.rating} />
                    <span className="text-sm font-semibold text-ink dark:text-white">
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
                    className="text-sm font-semibold text-ink underline underline-offset-4 hover:text-primary-700 dark:text-white"
                  >
                    Write Review
                  </button>
                )}
              </div>

              {/* Price */}
              {displayPrice && displayPrice > 0 && (
                <div className="mb-8">
                  <p className="text-2xl font-semibold text-ink dark:text-white">
                    ${displayPrice.toFixed(2)}
                  </p>
                  {availabilityMatrix?.hasVariablePricing && !variantSelection.color && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Price varies by color</p>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="mb-8">
                <p className="leading-relaxed text-stone-600 dark:text-gray-300">
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
                    type="button"
                    className="text-sm font-medium text-ink underline underline-offset-4 hover:text-primary-700 dark:text-white"
                  >
                    View Size Guide
                  </button>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <label htmlFor="quantity" className="mb-3 block text-sm font-semibold text-ink dark:text-white">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    type="button"
                    aria-label="Decrease quantity"
                    className="flex h-11 w-11 items-center justify-center rounded-md border border-stone-300 text-ink transition-colors hover:border-ink disabled:opacity-40 dark:border-gray-700 dark:text-white"
                    disabled={quantity <= 1}
                  >
                    <span aria-hidden="true" className="text-lg">−</span>
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-11 w-16 rounded-md border border-stone-300 bg-white text-center font-medium text-ink focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    type="button"
                    aria-label="Increase quantity"
                    className="flex h-11 w-11 items-center justify-center rounded-md border border-stone-300 text-ink transition-colors hover:border-ink disabled:opacity-40 dark:border-gray-700 dark:text-white"
                    disabled={isOutOfStock || quantity >= displayStock}
                  >
                    <span aria-hidden="true" className="text-lg">+</span>
                  </button>
                  <span className="ml-2 text-sm text-stone-600 dark:text-gray-400">
                    {displayStock} available
                  </span>
                </div>
              </div>

              {/* Add to cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-primary-600 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:bg-stone-300 dark:disabled:bg-gray-800"
              >
                <ShoppingBagIcon className="h-5 w-5" aria-hidden="true" />
                {isOutOfStock ? 'Out of stock' : isAddingToCart ? 'Adding…' : 'Add to bag'}
              </button>

              {/* What the store really offers (same as the home page) */}
              <ul className="mt-8 divide-y divide-stone-200 border-y border-stone-200 text-sm dark:divide-gray-800 dark:border-gray-800">
                {[
                  { icon: TruckIcon, text: 'Free shipping on every order' },
                  { icon: BanknotesIcon, text: 'Pay cash on delivery' },
                  { icon: MapIcon, text: 'Track your order step by step in My Orders' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 py-3.5 text-stone-700 dark:text-gray-300">
                    <Icon className="h-5 w-5 flex-shrink-0 text-ink dark:text-white" aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>

                         </motion.div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-20 lg:mt-24">
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
              <Tab.List className="flex gap-8 overflow-x-auto border-b border-stone-200 dark:border-gray-800">
                {['Details', `Reviews${product.numReviews ? ` (${product.numReviews})` : ''}`, 'Delivery & payment'].map((tab) => (
                  <Tab
                    key={tab}
                    className={({ selected }) =>
                      `-mb-px whitespace-nowrap border-b-2 py-4 text-sm font-semibold transition-colors outline-none focus-visible:text-ink ${
                        selected
                          ? 'border-ink text-ink dark:border-white dark:text-white'
                          : 'border-transparent text-stone-500 hover:text-ink dark:text-gray-400 dark:hover:text-white'
                      }`
                    }
                  >
                    {tab}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="mt-10">
                {/* Details Panel: the description and real facts from the product */}
                <Tab.Panel className="grid gap-10 focus:outline-none lg:grid-cols-[1.4fr_1fr] lg:gap-16">
                  <p className="font-serif text-xl leading-relaxed text-ink dark:text-white sm:text-2xl">{product.description}</p>
                  <dl className="divide-y divide-stone-200 border-y border-stone-200 text-sm dark:divide-gray-800 dark:border-gray-800">
                    {facts.map((fact) => (
                      <div key={fact.label} className="flex justify-between gap-6 py-3.5">
                        <dt className="text-stone-500 dark:text-gray-400">{fact.label}</dt>
                        <dd className="text-right font-medium text-ink dark:text-white">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
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

                {/* Delivery & payment: only what the store really does */}
                <Tab.Panel className="grid max-w-4xl gap-8 focus:outline-none sm:grid-cols-3">
                  {[
                    { icon: TruckIcon, title: 'Free shipping', text: 'Shipping costs nothing on every order, with no minimum.' },
                    { icon: BanknotesIcon, title: 'Cash on delivery', text: 'No card needed: you pay when your order arrives.' },
                    { icon: MapIcon, title: 'Order tracking', text: 'Every order has a timeline in My Orders, from placed to delivered.' },
                  ].map(({ icon: Icon, title, text }) => (
                    <div key={title}>
                      <Icon className="h-6 w-6 text-ink dark:text-white" aria-hidden="true" />
                      <h3 className="mt-3 text-sm font-semibold text-ink dark:text-white">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-gray-400">{text}</p>
                    </div>
                  ))}
                  <p className="text-sm text-stone-600 dark:text-gray-400 sm:col-span-3">
                    Questions about an order?{' '}
                    <Link to="/contact" className="font-semibold text-ink underline underline-offset-4 dark:text-white">
                      Send us a message
                    </Link>
                    .
                  </p>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section aria-labelledby="related-heading" className="mt-24">
              <h2 id="related-heading" className="mb-8 text-2xl font-medium text-ink dark:text-white sm:text-3xl">
                You may also <span className="font-serif italic">like</span>
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct._id} product={relatedProduct} />
                ))}
              </div>
            </section>
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
