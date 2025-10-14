import { defineConfig } from 'eslint/config';
import * as eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export const baseTypescriptConfig = defineConfig(
  {
    name: '@eddeee888/eslint-plugin/base-typescript',
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
  eslint.configs.recommended,
  tseslint.configs.recommended
);
