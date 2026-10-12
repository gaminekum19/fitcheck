const Profile = require('../models/Profile');
const OwnedItem = require('../models/OwnedItem');
const Product = require('../models/Product');
const Outfit = require('../models/Outfit');
const { buildOutfit } = require('../utils/outfitEngine');
const { pickBestPerGroup } = require('../utils/priceCompare');
const axios = require('axios');

const SLOTS_BY_CATEGORY = {
  'western-dresses': ['dress', 'footwear'],
  'jeans-tops': ['top', 'bottom', 'footwear'],
  'indian-traditional': ['dress', 'footwear'],
  'winter-wear': ['top', 'bottom', 'footwear'],
};

const prettyShape = (s) => String(s || '').replace(/([A-Z])/g, ' $1').toLowerCase();

function describeItem(item) {
  const d = item.details || {};
  if (item.source === 'owned') return `your ${d.color ? d.color + ' ' : ''}${d.garmentType || 'piece'}`;
  return d.name || item.garmentType;
}

function joinList(parts) {
  if (parts.length <= 1) return parts.join('');
  return parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];
}

// Template explanation used when no Gemini key is set (or the call fails).
function templateExplanation(profile, items) {
  const names = joinList(items.map(describeItem));
  const ownedCount = items.filter((i) => i.source === 'owned').length;
  let text = `For your ${profile.undertone} undertone and ${prettyShape(profile.bodyShape)} silhouette, we paired ${names}.`;
  if (ownedCount > 0) text += ` ${ownedCount === 1 ? 'One piece is' : ownedCount + ' pieces are'} already in your closet, so you only buy what's missing.`;
  return text;
}

async function generateExplanation(profile, items) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_key') return templateExplanation(profile, items);

  try {
    const names = joinList(items.map(describeItem));
    const prompt = `In two warm, friendly sentences (under 55 words), explain why this outfit suits someone with a ${profile.undertone} undertone and a ${prettyShape(profile.bodyShape)} body shape. Outfit: ${names}. Plain text only, no markdown.`;
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { timeout: 10000 }
    );
    return response.data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('GenAI explanation failed, using template:', error.message);
    return templateExplanation(profile, items);
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
    const listings = await Product.find({ category }).lean();

    // Same item on several platforms -> keep the cheapest, remember the rest.
    const { primaries, alternativesByPrimary } = pickBestPerGroup(listings);

    const parsedBudget = budget ? Number(budget) : null;
    const { items, totalPrice } = buildOutfit(profile, ownedItems, primaries, SLOTS_BY_CATEGORY[category], parsedBudget);

    if (items.length === 0) {
      return res.status(404).json({ message: 'No matching products found yet for this category.' });
    }

    const ownedById = new Map(ownedItems.map((o) => [String(o._id), o]));
    const productById = new Map(primaries.map((p) => [String(p._id), p]));

    const populatedItems = items.map((item) => {
      const key = String(item.refId);
      if (item.source === 'owned') return { ...item, details: ownedById.get(key) };
      const alternatives = (alternativesByPrimary.get(key) || []).map((a) => ({
        _id: a._id, platform: a.platform, price: a.price,
      }));
      return { ...item, details: productById.get(key), alternatives };
    });

    const explanationText = await generateExplanation(profile, populatedItems);

    const outfit = await Outfit.create({
      user: req.userId,
      occasion: category,
      items: items.map(({ source, refId, garmentType }) => ({ source, refId, garmentType })),
      explanationText,
      totalPrice,
    });

    res.status(200).json({ outfit: { ...outfit.toObject(), items: populatedItems } });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong building your recommendation.', error: error.message });
  }
};

module.exports = { getRecommendations, SLOTS_BY_CATEGORY };
