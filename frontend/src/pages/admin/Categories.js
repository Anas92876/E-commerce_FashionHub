import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';

const API_URL = 'http://localhost:5000/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/categories`);
      setCategories(data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setCategoryImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!categoryName.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', categoryName);

      if (categoryImage) {
        formData.append('image', categoryImage);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      };

      if (isEditing && currentCategory) {
        await axios.put(
          `${API_URL}/categories/${currentCategory._id}`,
          formData,
          config
        );
        toast.success('Category updated successfully');
      } else {
        await axios.post(
          `${API_URL}/categories`,
          formData,
          config
        );
        toast.success('Category created successfully');
      }

      setCategoryName('');
      setCategoryImage(null);
      setImagePreview(null);
      setIsEditing(false);
      setCurrentCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      const errorMessage =
        err.response?.data?.message || 'Failed to save category';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setCategoryName(category.name);
    setCategoryImage(null);
    // Set preview to existing image if available
    if (category.image) {
      setImagePreview(`http://localhost:5000${category.image}`);
    } else {
      setImagePreview(null);
    }
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setCategoryName('');
    setCategoryImage(null);
    setImagePreview(null);
    setError('');
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`
      )
    ) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/categories/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        const errorMessage =
          err.response?.data?.message || 'Failed to delete category';
        toast.error(errorMessage);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Categories Management</h1>
          <p className="text-gray-600">Organize your products with categories</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add/Edit Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="card p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                {isEditing ? (
                  <PencilIcon className="w-6 h-6 text-primary-600" />
                ) : (
                  <PlusIcon className="w-6 h-6 text-primary-600" />
                )}
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? 'Edit Category' : 'Add Category'}
                </h2>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g., T-Shirts, Jeans, Accessories"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="categoryImage" className="block text-sm font-medium text-gray-700 mb-2">
                    Category Image
                  </label>
                  <div className="space-y-3">
                    {imagePreview && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <label
                      htmlFor="categoryImage"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 font-medium">
                          {imagePreview ? 'Change Image' : 'Upload Image'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                      <input
                        id="categoryImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    {isEditing ? (
                      <>
                        <CheckIcon className="w-5 h-5" />
                        Update
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-5 h-5" />
                        Add
                      </>
                    )}
                  </button>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>

          {/* Categories List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  All Categories ({categories.length})
                </h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12">
                  <TagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No categories yet</p>
                  <p className="text-gray-400 text-sm mt-2">Add your first category to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {categories.map((category, index) => (
                      <motion.div
                        key={category._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all overflow-hidden"
                      >
                        {/* Category Image */}
                        {category.image ? (
                          <div className="w-full h-40 bg-gray-100 overflow-hidden">
                            <img
                              src={`http://localhost:5000${category.image}`}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <PhotoIcon className="w-16 h-16 text-gray-400" />
                          </div>
                        )}

                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <TagIcon className="w-5 h-5 text-primary-600" />
                                <h3 className="font-bold text-gray-900">{category.name}</h3>
                              </div>
                              <p className="text-sm text-gray-600">
                                Slug: <span className="font-mono">{category.slug}</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Created {new Date(category.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                            >
                              <PencilIcon className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(category._id, category.name)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Categories;
