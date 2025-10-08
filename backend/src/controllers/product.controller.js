import Product from '../models/product.model.js';
import User from '../models/user.model.js'; // To ensure mallId is valid

const uploadProducts = async (req, res) => {
  if (!req.user || !req.user.mallId) {
    return res.status(401).json({ message: 'Unauthorized: Mall ID not found.' });
  }

  const { products } = req.body; // Expecting an array of product objects

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: 'Product data must be a non-empty array.' });
  }

  try {
    const productsToAdd = products.map(p => ({
      mallId: req.user.mallId,
      productId: p.id || p.productId, // Handle both id and productId from frontend
      name: p.name,
      category: p.category,
      price: p.price,
    }));

    // Use insertMany with 'ordered: false' to allow some products to fail (e.g., duplicates)
    // while others succeed. 'rawResult: true' gives detailed success/failure info.
    const result = await Product.insertMany(productsToAdd, { ordered: false, rawResult: true });

    // Handle results to report successes and failures
    const insertedCount = result.insertedIds ? Object.keys(result.insertedIds).length : 0;
    const failedCount = result.writeErrors ? result.writeErrors.length : 0;
    
    let message = `${insertedCount} products uploaded successfully.`;
    if (failedCount > 0) {
      message += ` ${failedCount} products failed (e.g., duplicates or missing fields).`;
      console.warn('Product upload errors:', result.writeErrors);
    }

    res.status(200).json({ 
        message, 
        insertedCount, 
        failedCount,
        errors: result.writeErrors ? result.writeErrors.map(err => err.errmsg || err.message) : []
    });

  } catch (error) {
    // Catch unique index errors specifically for better reporting
    if (error.code === 11000) { // Duplicate key error
        return res.status(409).json({ message: 'One or more products with existing IDs already exist in this mall.', details: error.message });
    }
    console.error('Error uploading products:', error);
    res.status(500).json({ message: 'Server error during product upload.', error: error.message });
  }
};

const getMallProducts = async (req, res) => {
  if (!req.user || !req.user.mallId) {
    return res.status(401).json({ message: 'Unauthorized: Mall ID not found.' });
  }

  try {
    const products = await Product.find({ mallId: req.user.mallId }).sort({ category: 1, name: 1 });
    // Group products by category for easier display on frontend
    const groupedProducts = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = { name: product.category, products: [] };
      }
      acc[product.category].products.push(product);
      return acc;
    }, {});

    res.status(200).json({ categories: Object.values(groupedProducts) });

  } catch (error) {
    console.error('Error fetching mall products:', error);
    res.status(500).json({ message: 'Server error fetching products.', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
    if (!req.user || !req.user.mallId) {
        return res.status(401).json({ message: 'Unauthorized: Mall ID not found.' });
    }
    const { id } = req.params; // MongoDB _id of the product

    try {
        const product = await Product.findOneAndDelete({ _id: id, mallId: req.user.mallId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found or unauthorized to delete.' });
        }
        res.status(200).json({ message: `Product '${product.name}' deleted successfully.` });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error deleting product.', error: error.message });
    }
};

export { uploadProducts, getMallProducts, deleteProduct };