/**
 * FitCheck Outfit Scoring & Construction Engine
 *
 * This is a deterministic, explainable algorithm — NOT an AI agent.
 * It scores candidate items (owned items + catalog products) for each
 * required garment slot, and picks the best-scoring combination.
 *
 * Why not an AI agent? Because this is a bounded, well-structured
 * combinatorial problem. A scoring algorithm is faster, free, and
 * fully explainable (you can always see exactly why an item was chosen).
 */

// Simple color-theory rules: which color tags suit which undertone
const UNDERTONE_COLOR_MAP = {
  warm: ['warm', 'earthy', 'mustard', 'olive', 'rust', 'terracotta', 'gold', 'coral'],
  cool: ['cool', 'blue', 'jewel', 'emerald', 'sapphire', 'lavender', 'berry', 'silver'],
  neutral: ['neutral', 'navy', 'grey', 'white', 'black', 'beige'],
};

// Which silhouette tags suit which body shape
const BODYSHAPE_SILHOUETTE_MAP = {
  hourglass: ['fitted', 'wrap', 'belted', 'hourglass'],
  pear: ['aline', 'structured-shoulder', 'boatneck', 'pear'],
  rectangle: ['belted', 'peplum', 'layered', 'rectangle'],
  apple: ['empire', 'flowy', 'vneck', 'apple'],
  invertedTriangle: ['aline', 'wide-leg', 'invertedTriangle'],
};

function scoreColorMatch(itemColorTags = [], undertone) {
  const goodColors = UNDERTONE_COLOR_MAP[undertone] || [];
  const matches = itemColorTags.filter((c) => goodColors.includes(c));
  return matches.length > 0 ? 3 : 0;
}

function scoreSilhouetteMatch(itemSilhouetteTags = [], bodyShape) {
  const goodSilhouettes = BODYSHAPE_SILHOUETTE_MAP[bodyShape] || [];
  const matches = itemSilhouetteTags.filter((s) => goodSilhouettes.includes(s));
  return matches.length > 0 ? 3 : 0;
}

function scoreBudgetFit(price, remainingBudget) {
  if (remainingBudget == null) return 1; // no budget set, neutral score
  if (price <= remainingBudget) return 2;
  return -5; // heavily penalize going over budget
}

/**
 * Builds the best outfit for a given profile, occasion, and set of
 * available owned items + catalog products.
 *
 * @param {Object} profile - { undertone, depth, bodyShape }
 * @param {Array} ownedItems - user's closet items
 * @param {Array} products - catalog products (already filtered by category)
 * @param {Array} requiredSlots - e.g. ['top', 'bottom', 'footwear']
 * @param {Number} budget - optional total budget
 */
function buildOutfit(profile, ownedItems, products, requiredSlots, budget = null) {
  const { undertone, bodyShape } = profile;
  const selected = [];
  let remainingBudget = budget;
  let totalPrice = 0;

  for (const slot of requiredSlots) {
    const ownedCandidates = ownedItems
      .filter((item) => item.garmentType === slot)
      .map((item) => ({
        source: 'owned',
        refId: item._id,
        garmentType: slot,
        price: 0,
        score:
          scoreColorMatch([item.color], undertone) +
          scoreSilhouetteMatch([item.styleTag], bodyShape) +
          5, // bonus for already owning it — no new purchase needed
      }));

    const productCandidates = products
      .filter((p) => p.garmentType === slot)
      .map((p) => ({
        source: 'product',
        refId: p._id,
        garmentType: slot,
        price: p.price,
        score:
          scoreColorMatch(p.colorTags, undertone) +
          scoreSilhouetteMatch(p.silhouetteTags, bodyShape) +
          scoreBudgetFit(p.price, remainingBudget),
      }));

    const allCandidates = [...ownedCandidates, ...productCandidates];

    if (allCandidates.length === 0) continue; // no candidate available for this slot, skip it

    // Pick the highest-scoring candidate for this slot
    allCandidates.sort((a, b) => b.score - a.score);
    const chosen = allCandidates[0];

    selected.push(chosen);
    totalPrice += chosen.price;
    if (remainingBudget != null) remainingBudget -= chosen.price;
  }

  return { items: selected, totalPrice };
}

module.exports = { buildOutfit, UNDERTONE_COLOR_MAP, BODYSHAPE_SILHOUETTE_MAP };
