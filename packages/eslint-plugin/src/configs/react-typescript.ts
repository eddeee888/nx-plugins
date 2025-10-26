import { defineConfig } from 'eslint/config';
import * as jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import * as reactPlugin from 'eslint-plugin-react';
const reactHooksPlugin = require('eslint-plugin-react-hooks'); // We must use require() here because react-hooks is cjs, and import will use `default` instead of the cjs module.exports

const filePatterns = ['**/*.ts', '**/*.cts', '**/*.mts', '**/*.tsx', '**/*.js', '**/*.cjs', '**/*.mjs', '**/*.jsx'];

export const reactTypescriptConfig = defineConfig(
  {
    name: '@eddeee888/eslint-plugin/react-typescript/hooks',
    files: filePatterns,
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: reactHooksPlugin.configs.recommended.rules,
  },
  {
    name: '@eddeee888/eslint-plugin/react-typescript/react',
    files: filePatterns,
    settings: { react: { version: 'detect' } },
    plugins: {
      'jsx-a11y': jsxA11yPlugin,
      react: reactPlugin,
    },
    rules: {
      ...jsxA11yPlugin.flatConfigs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // This is used for legacy React apps where `import React` must be explicit. Modern apps do not need this import.
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
    },
  }
);
