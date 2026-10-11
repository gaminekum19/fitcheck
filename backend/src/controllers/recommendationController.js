const Profile = require('../models/Profile');
const OwnedItem = require('../models/OwnedItem');
const Product = require('../models/Product');
const Outfit = require('../models/Outfit');
const { buildOutfit } = require('../utils/outfitEngine');
const axios = require('axios');

const SLOTS_BY_CATEGORY = {
  'western-dresses': ['dress', 'footwear'],
  'jeans-tops': ['top', 'bottom', 'footwear'],
  'indian-traditional': ['dress', 'footwear'],
  'winter-wear': ['top', 'bottom', 'footwear'],
};

// Calls the free-tier Gemini API to turn the outfit into a friendly explanation.
// If no API key is set, falls back to a simple templated sentence so the app
// still works end-to-end without requiring the GenAI key immediately.
async function generateExplanation(profile, items) {
  const apiKey = process.env.GEMINI_API_KEY;
  const itemSummary = items.map((i) => `${i.garmentType} (${i.source === 'owned' ? 'from your closet' : 'new pick'})`).join(', ');

  if (!apiKey || apiKey === 'your_gemini_key') {
    return `Based on your ${profile.undertone} undertone and ${profile.bodyShape} body shape, we've put together: ${itemSummary}.`;
  }

  try {
    const prompt = `In one warm, friendly sentence (under 40 words), explain why this outfit suits someone with a ${profile.undertone} undertone and ${profile.bodyShape} body shape. The outfit: ${itemSummary}. Do not use markdown.`;
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );
    return response.data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('GenAI explanation failed, using fallback:', error.message);
    return `Based on your ${profile.undertone} undertone and ${profile.bodyShape} body shape, we've put together: ${itemSummary}.`;
  }
}

// GET /api/recommendations?category=western-dresses&budget=2000
const getRecommendations = async (req, res) => {
  try {
    const { category, budget } = req.query;

    if (!category || !SLOTS_BY_CATEGORY[category]) {
      return res.status(400).json({
        message: `Please provide a valid category. Options: ${Object.keys(SLOTS_BY_CATEGORY).join(', ')}`,
      });
    }

    const profile = await Profile.findOne({ user: req.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Please upload your photos first so we can analyze your profile.' });
    }

    const ownedItems = await OwnedItem.find({ user: req.userId });
    const products = await Product.find({ category });
    const requiredSlots = SLOTS_BY_CATEGORY[category];
    const parsedBudget = budget ? Number(budget) : null;

    const { items, totalPrice } = buildOutfit(profile, ownedItems, products, requiredSlots, parsedBudget);

    if (items.length === 0) {
      return res.status(404).json({ message: 'No matching products found yet for this category. Try adding more products to the catalog.' });
    }

    const explanationText = await generateExplanation(profile, items);

    const outfit = await Outfit.create({
      user: req.userId,
      occasion: category,
      items,
      explanationText,
      totalPrice,
    });

    // Populate the actual product/owned-item details for the response
    const populatedItems = await Promise.all(
      items.map(async (item) => {
        const doc = item.source === 'owned'
          ? await OwnedItem.findById(item.refId)
          : await Product.findById(item.refId);
        return { ...item, details: doc };
      })
    );

    res.status(200).json({ outfit: { ...outfit.toObject(), items: populatedItems } });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong building your recommendation.', error: error.message });
  }
};

module.exports = { getRecommendations, SLOTS_BY_CATEGORY };
