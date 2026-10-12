/**
 * Sample product catalogue. Each item is listed on 1-3 platforms with
 * different prices, so price comparison has real data to work with.
 *
 * The links go to each retailer's search page for the item, so "Shop now"
 * lands somewhere real. To earn commission, replace each `url` with the
 * affiliate link from your affiliate dashboard (Amazon Associates, EarnKaro...).
 */

const q = encodeURIComponent;
const LINKS = {
  Amazon: (name) => `https://www.amazon.in/s?k=${q(name)}`,
  Flipkart: (name) => `https://www.flipkart.com/search?q=${q(name)}`,
  Myntra: (name) => `https://www.myntra.com/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  Meesho: (name) => `https://www.meesho.com/search?q=${q(name)}`,
};

// A generated colour card, so products have an image without any hosting.
function card(hex, label) {
  const n = parseInt(hex.slice(1), 16);
  const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  const fg = lum > 150 ? '#171310' : '#EDE6D6';
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400'>` +
    `<rect width='300' height='400' fill='${hex}'/>` +
    `<text x='150' y='205' font-family='Georgia,serif' font-size='19' fill='${fg}' text-anchor='middle'>${label}</text>` +
    `</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const ALL_SHAPES = ['hourglass', 'pear', 'rectangle', 'apple', 'invertedTriangle'];

// [group id, name, garmentType, categories, colorTags, silhouetteTags, hex, listings]
const ITEMS = [
  // ---- western dresses
  ['dress-mustard-aline', 'Mustard A-Line Midi Dress', 'dress', ['western-dresses'], ['warm', 'mustard', 'earthy'], ['aline', 'pear', 'apple'], '#C69A3D', { Myntra: 1299, Amazon: 1399, Flipkart: 1349 }],
  ['dress-emerald-wrap', 'Emerald Wrap Dress', 'dress', ['western-dresses'], ['cool', 'jewel', 'emerald'], ['wrap', 'hourglass'], '#1F6F5C', { Amazon: 1799, Myntra: 1699 }],
  ['dress-terracotta-belted', 'Terracotta Belted Shirt Dress', 'dress', ['western-dresses'], ['warm', 'terracotta', 'earthy'], ['belted', 'rectangle', 'hourglass'], '#B3573A', { Myntra: 1599, Flipkart: 1499 }],
  ['dress-navy-empire', 'Navy Empire Waist Dress', 'dress', ['western-dresses'], ['neutral', 'navy'], ['empire', 'flowy', 'apple'], '#1F2A44', { Amazon: 1399 }],
  ['dress-berry-flare', 'Berry Fit-and-Flare Dress', 'dress', ['western-dresses'], ['cool', 'berry'], ['aline', 'invertedTriangle'], '#8A2D52', { Meesho: 899, Myntra: 1099 }],

  // ---- indian traditional
  ['kurti-maroon-anarkali', 'Maroon Anarkali Kurti', 'dress', ['indian-traditional'], ['warm', 'rust', 'earthy'], ['aline', 'pear', 'hourglass'], '#7A2E2E', { Meesho: 899, Myntra: 1299 }],
  ['kurta-teal-set', 'Teal Straight Kurta Set', 'dress', ['indian-traditional'], ['cool', 'jewel', 'emerald'], ['rectangle', 'belted', 'apple'], '#1F6F5C', { Amazon: 1399, Flipkart: 1299 }],
  ['kurti-mustard-cotton', 'Mustard Cotton Kurti', 'dress', ['indian-traditional'], ['warm', 'mustard'], ['aline', 'apple', 'pear'], '#C69A3D', { Meesho: 599, Flipkart: 699 }],
  ['saree-sapphire-silk', 'Sapphire Silk-Blend Saree', 'dress', ['indian-traditional'], ['cool', 'sapphire', 'jewel'], ['wrap', 'hourglass', 'pear', 'apple'], '#2B3A5E', { Myntra: 2499, Amazon: 2699 }],

  // ---- tops for jeans-tops
  ['top-rust-boatneck', 'Rust Boatneck Top', 'top', ['jeans-tops'], ['warm', 'rust', 'terracotta'], ['boatneck', 'pear'], '#8C3B2E', { Meesho: 699, Myntra: 799 }],
  ['top-cream-wrap', 'Cream Wrap Blouse', 'top', ['jeans-tops'], ['warm', 'earthy'], ['wrap', 'hourglass', 'apple'], '#EDE6D6', { Amazon: 899, Flipkart: 849 }],
  ['top-sapphire-peplum', 'Sapphire Peplum Top', 'top', ['jeans-tops'], ['cool', 'sapphire', 'jewel'], ['peplum', 'belted', 'rectangle'], '#2B3A5E', { Myntra: 999, Amazon: 1049 }],
  ['top-lavender-vneck', 'Lavender V-Neck Tee', 'top', ['jeans-tops'], ['cool', 'lavender'], ['vneck', 'apple', 'flowy'], '#8E88C2', { Meesho: 499, Flipkart: 549 }],
  ['top-white-shirt', 'Crisp White Shirt', 'top', ['jeans-tops'], ['neutral', 'white'], ['structured-shoulder', 'aline', 'rectangle'], '#F1EBDD', { Amazon: 1099, Myntra: 1199 }],

  // ---- bottoms (jeans-tops and winter-wear)
  ['bottom-olive-straight', 'Olive Straight-Fit Jeans', 'bottom', ['jeans-tops', 'winter-wear'], ['warm', 'olive'], ['rectangle', 'hourglass'], '#6E7F52', { Myntra: 1499, Amazon: 1599, Flipkart: 1449 }],
  ['bottom-indigo-widelegs', 'Indigo Wide-Leg Jeans', 'bottom', ['jeans-tops', 'winter-wear'], ['cool', 'blue', 'sapphire'], ['wide-leg', 'invertedTriangle', 'pear'], '#2B3A5E', { Amazon: 1799, Myntra: 1699 }],
  ['bottom-black-fitted', 'Black High-Rise Fitted Jeans', 'bottom', ['jeans-tops', 'winter-wear'], ['neutral', 'black'], ['fitted', 'hourglass', 'rectangle'], '#2A2623', { Myntra: 1299, Meesho: 999 }],
  ['bottom-camel-trouser', 'Camel Tailored Trousers', 'bottom', ['jeans-tops', 'winter-wear'], ['warm', 'earthy'], ['aline', 'pear', 'hourglass'], '#B58B5A', { Flipkart: 1399, Amazon: 1499 }],

  // ---- winter tops
  ['sweater-camel-knit', 'Camel Knit Sweater', 'top', ['winter-wear'], ['warm', 'earthy'], ['layered', 'rectangle'], '#B58B5A', { Myntra: 1599, Amazon: 1699 }],
  ['sweater-charcoal-turtleneck', 'Charcoal Turtleneck', 'top', ['winter-wear'], ['neutral', 'grey'], ['fitted', 'hourglass', 'rectangle'], '#3A3A3C', { Amazon: 1299, Flipkart: 1199 }],
  ['jacket-olive-utility', 'Olive Utility Jacket', 'top', ['winter-wear'], ['warm', 'olive'], ['structured-shoulder', 'pear', 'rectangle'], '#6E7F52', { Myntra: 2299, Meesho: 1999 }],
  ['cardigan-lavender-long', 'Lavender Longline Cardigan', 'top', ['winter-wear'], ['cool', 'lavender'], ['flowy', 'apple', 'layered'], '#8E88C2', { Flipkart: 1499, Myntra: 1599 }],

  // ---- footwear
  ['shoe-tan-block-heel', 'Tan Block-Heel Sandals', 'footwear', ['western-dresses', 'indian-traditional'], ['warm', 'earthy'], ['aline', 'hourglass', 'rectangle', 'pear'], '#B58B5A', { Flipkart: 899, Amazon: 949 }],
  ['shoe-white-sneakers', 'White Leather Sneakers', 'footwear', ['jeans-tops', 'winter-wear'], ['neutral', 'white'], ALL_SHAPES, '#F1EBDD', { Amazon: 1199, Myntra: 1249, Flipkart: 1149 }],
  ['shoe-black-ankle-boots', 'Black Ankle Boots', 'footwear', ['winter-wear', 'jeans-tops'], ['neutral', 'black'], ALL_SHAPES, '#2A2623', { Myntra: 1999, Amazon: 2099 }],
  ['shoe-gold-flats', 'Gold Strap Flats', 'footwear', ['indian-traditional', 'western-dresses'], ['warm', 'gold'], ['aline', 'pear', 'hourglass'], '#C69A3D', { Meesho: 599, Flipkart: 649 }],
  ['shoe-silver-heels', 'Silver Strappy Heels', 'footwear', ['western-dresses', 'indian-traditional'], ['cool', 'silver'], ALL_SHAPES, '#B9BCC4', { Myntra: 1499, Amazon: 1399 }],
];

function buildCatalogue() {
  const docs = [];
  for (const [groupId, name, garmentType, categories, colorTags, silhouetteTags, hex, listings] of ITEMS) {
    const imageUrl = card(hex, name.split(' ').slice(0, 3).join(' '));
    for (const category of categories) {
      for (const [platform, price] of Object.entries(listings)) {
        docs.push({
          name, imageUrl, price, category, garmentType, colorTags, silhouetteTags,
          platform, affiliateUrl: LINKS[platform](name),
          productGroupId: `${groupId}:${category}`,
        });
      }
    }
  }
  return docs;
}

module.exports = { buildCatalogue };
