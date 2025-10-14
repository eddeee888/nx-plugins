import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export const baseTypescriptConfig = defineConfig({
  plugins: { '@typescript-eslint': tseslint.plugin },
  languageOptions: {
    parser: tseslint.parser,
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});
