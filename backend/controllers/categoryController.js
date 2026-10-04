const { supabase } = require('../config/supabase');
const { toApi, check, normalizeId, UNIQUE_VIOLATION } = require('../utils/db');

// Create slug from name
const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const findCategory = async (id) => {
  const categoryId = normalizeId(id);
  if (!categoryId) return null;
  return check(await supabase.from('categories').select('*').eq('id', categoryId).maybeSingle());
};

const categoryExists = (res) =>
  res.status(400).json({
    success: false,
    message: 'Category already exists',
  });

// @desc    Get all categories
// @route   GET /api/categories  (?stats=true adds productCount + a cover photo)
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const rows = check(await supabase.from('categories').select('*').order('name'));
    let categories = rows.map((row) => toApi(row));

    if (req.query.stats === 'true') {
      // Active products per category; cover = the category image, else the
      // photo of its best-rated product
      const products = check(
        await supabase
          .from('products')
          .select('category, image, variants, rating, num_reviews')
          .eq('is_active', true)
          .order('rating', { ascending: false })
          .order('num_reviews', { ascending: false })
      );
      categories = categories.map((category) => {
        const inCategory = products.filter((p) => p.category === category.name);
        const cover = inCategory
          .map((p) => p.image || p.variants?.find((v) => v.images?.length)?.images?.[0])
          .find(Boolean);
        return { ...category, productCount: inCategory.length, coverImage: category.image || cover || '' };
      });
    }

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
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const name = req.body.name && req.body.name.trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const categoryData = { name, slug: slugify(name) };

    // Add image URL (Supabase Storage) if file was uploaded
    if (req.file) {
      categoryData.image = req.file.path;
    }

    const row = check(await supabase.from('categories').insert(categoryData).select('*').single());

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: toApi(row),
    });
  } catch (error) {
    // Handle duplicate category name
    if (error.code === UNIQUE_VIOLATION) {
      return categoryExists(res);
    }
    next(error);
  }
};

// @desc    Update category (admin only)
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const name = req.body.name && req.body.name.trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const category = await findCategory(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const updates = { name, slug: slugify(name) };

    // Update image if a new file was uploaded
    if (req.file) {
      updates.image = req.file.path;
    }

    const row = check(
      await supabase.from('categories').update(updates).eq('id', category.id).select('*').single()
    );

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: toApi(row),
    });
  } catch (error) {
    // Handle duplicate category name
    if (error.code === UNIQUE_VIOLATION) {
      return categoryExists(res);
    }
    next(error);
  }
};

// @desc    Delete category (admin only)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await findCategory(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Delete all products that belong to this category (cascade delete)
    // Products store category as a string (category name), not an id
    const deleteResult = await supabase
      .from('products')
      .delete({ count: 'exact' })
      .eq('category', category.name);
    check(deleteResult);
    const deletedCount = deleteResult.count || 0;

    // Delete the category
    check(await supabase.from('categories').delete().eq('id', category.id));

    res.status(200).json({
      success: true,
      message: `Category "${category.name}" deleted successfully. ${deletedCount} product(s) also deleted.`,
      deletedProducts: deletedCount,
    });
  } catch (error) {
    next(error);
  }
};
