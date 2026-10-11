const Click = require('../models/Click');
const Product = require('../models/Product');

// GET /api/click/:productId - logs the click, then redirects to the real affiliate URL
// This is the ONLY step in the whole affiliate flow we can see or control.
// What happens after the redirect (purchase, or not) is invisible to us —
// that data only ever appears later in the affiliate program's own dashboard.
const clickAndRedirect = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).send('Product not found.');
    }

    await Click.create({
      user: req.userId || null, // works even if called without auth (e.g. shared link)
      product: product._id,
      platform: product.platform,
    });

    // 302 redirect sends the user's browser to the real retailer via the affiliate link
    res.redirect(302, product.affiliateUrl);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

module.exports = { clickAndRedirect };
