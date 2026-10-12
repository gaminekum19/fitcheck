/**
 * Price comparison helper.
 *
 * Catalogue rows that share a productGroupId are the SAME item listed on
 * different platforms. For outfit building we keep only the cheapest listing
 * of each group, and remember the other listings so the UI can show them.
 */
function groupKey(p) {
  return p.productGroupId || String(p._id);
}

function pickBestPerGroup(products) {
  const groups = new Map();
  for (const p of products) {
    const k = groupKey(p);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(p);
  }

  const primaries = [];
  const alternativesByPrimary = new Map();
  for (const list of groups.values()) {
    list.sort((a, b) => a.price - b.price);
    const [best, ...others] = list;
    primaries.push(best);
    alternativesByPrimary.set(String(best._id), others);
  }
  return { primaries, alternativesByPrimary };
}

module.exports = { pickBestPerGroup };
