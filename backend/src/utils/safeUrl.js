// Accepts only public https URLs. Blocks localhost and private network ranges so the
// AI service can't be tricked into fetching internal addresses.
function isSafeHttpsUrl(value) {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:') return false;
    const h = u.hostname.toLowerCase();
    if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return false;
    if (/^(127\.|10\.|0\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)) return false;
    if (h === '::1' || h === '[::1]') return false;
    return true;
  } catch (e) {
    return false;
  }
}
module.exports = { isSafeHttpsUrl };
