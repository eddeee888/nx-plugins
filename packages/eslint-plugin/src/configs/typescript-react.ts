export const typescriptReactConfig = {
  extends: ['plugin:react-hooks/recommended'],
  rules: {
    'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
  },
};
