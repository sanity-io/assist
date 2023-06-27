module.exports = {
  '**/*.{js,jsx}': ['eslint'],
  '**/*.{ts,tsx}': ['eslint', () => 'npm run compile'],
}
