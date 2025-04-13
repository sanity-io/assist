module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 200],
    'body-max-line-length': [2, 'always', 1000],
    'footer-max-line-length': [2, 'always', 300],
  },
}
