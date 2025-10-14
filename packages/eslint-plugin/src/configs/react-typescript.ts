import { defineConfig } from 'eslint/config';
import * as jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import * as reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export const reactTypescriptConfig = defineConfig(
  {
    files: ['**/*.ts', '**/*.cts', '**/*.mts', '**/*.tsx', '**/*.js', '**/*.cjs', '**/*.mjs', '**/*.jsx'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: reactHooksPlugin.configs.recommended.rules,
  },
  {
    files: ['**/*.ts', '**/*.cts', '**/*.mts', '**/*.tsx', '**/*.js', '**/*.cjs', '**/*.mjs', '**/*.jsx'],
    settings: { react: { version: 'detect' } },
    plugins: {
      'jsx-a11y': jsxA11yPlugin,
      react: reactPlugin,
    },
    rules: {
      ...jsxA11yPlugin.flatConfigs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
    },
  }
);
