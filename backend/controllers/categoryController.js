const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category (admin only)
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    // Create category object
    const categoryData = { name };

    // Add image path if file was uploaded
    if (req.file) {
      categoryData.image = '/' + req.file.path.replace(/\\/g, '/');
    }

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    // Handle duplicate category name
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }
    next(error);
  }
};

// @desc    Update category (admin only)
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    category.name = name;

    // Update image if a new file was uploaded
    if (req.file) {
      category.image = '/' + req.file.path.replace(/\\/g, '/');
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    // Handle duplicate category name
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }
    next(error);
  }
};

// @desc    Delete category (admin only)
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Delete all products that belong to this category (cascade delete)
    const deleteResult = await Product.deleteMany({ category: req.params.id });

    // Delete the category
    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Category deleted successfully. ${deleteResult.deletedCount} product(s) also deleted.`,
      deletedProducts: deleteResult.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};
