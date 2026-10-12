/**
 * FitCheck Outfit Scoring & Construction Engine
 *
 * A deterministic, explainable algorithm (not an AI agent). For every garment
 * slot it scores owned items and catalogue products, then picks the best one.
 */

// Which colour tags suit which undertone (colour-theory rules).
const UNDERTONE_COLOR_MAP = {
  warm: ['warm', 'earthy', 'mustard', 'olive', 'rust', 'terracotta', 'gold', 'coral', 'orange', 'yellow', 'brown', 'camel', 'tan', 'maroon', 'peach', 'red', 'cream'],
  cool: ['cool', 'blue', 'jewel', 'emerald', 'sapphire', 'lavender', 'berry', 'silver', 'teal', 'purple', 'plum', 'pink', 'sky blue'],
  neutral: ['neutral', 'navy', 'grey', 'charcoal', 'white', 'black', 'beige', 'taupe', 'dusty rose'],
};

// Which silhouette tags suit which body shape.
const BODYSHAPE_SILHOUETTE_MAP = {
  hourglass: ['fitted', 'wrap', 'belted', 'hourglass'],
  pear: ['aline', 'structured-shoulder', 'boatneck', 'pear'],
  rectangle: ['belted', 'peplum', 'layered', 'rectangle'],
  apple: ['empire', 'flowy', 'vneck', 'apple'],
  invertedTriangle: ['aline', 'wide-leg', 'invertedTriangle'],
};

function scoreColorMatch(itemColorTags = [], undertone) {
  const good = UNDERTONE_COLOR_MAP[undertone] || [];
  return itemColorTags.some((c) => c && good.includes(String(c).toLowerCase())) ? 3 : 0;
}

function scoreSilhouetteMatch(itemSilhouetteTags = [], bodyShape) {
  const good = BODYSHAPE_SILHOUETTE_MAP[bodyShape] || [];
  return itemSilhouetteTags.some((s) => good.includes(s)) ? 3 : 0;
}

function scoreBudgetFit(price, remainingBudget) {
  if (remainingBudget == null) return 1;
  return price <= remainingBudget ? 2 : -5;
}

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
        score: scoreColorMatch([item.color], undertone) + scoreSilhouetteMatch([item.styleTag], bodyShape) + 5,
      }));

    const productCandidates = products
      .filter((p) => p.garmentType === slot)
      .map((p) => ({
        source: 'product',
        refId: p._id,
        garmentType: slot,
        price: p.price,
        score: scoreColorMatch(p.colorTags, undertone) + scoreSilhouetteMatch(p.silhouetteTags, bodyShape) + scoreBudgetFit(p.price, remainingBudget),
      }));

    const all = [...ownedCandidates, ...productCandidates];
    if (all.length === 0) continue;

    all.sort((a, b) => b.score - a.score);
    const chosen = all[0];
    selected.push(chosen);
    totalPrice += chosen.price;
    if (remainingBudget != null) remainingBudget -= chosen.price;
  }

  return { items: selected, totalPrice };
}

module.exports = { buildOutfit, UNDERTONE_COLOR_MAP, BODYSHAPE_SILHOUETTE_MAP };
