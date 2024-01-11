export const reactTypescriptConfig = {
  settings: { react: { version: 'detect' } },
  plugins: ['jsx-a11y', 'react'],
  extends: ['plugin:react-hooks/recommended', 'plugin:jsx-a11y/recommended'],
  rules: {
    'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
  },
};
