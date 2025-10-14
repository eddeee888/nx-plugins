# @eddeee888/eslint-plugin

This plugin contains extendable ESLint configs.

## Installation

```bash
yarn add -DE eslint @eddeee888/eslint-plugin
```

## Usage

### Normal repo

```js
// eslint.config.mjs
import { defineConfig } from 'eslint/config';
import ed from '@eddeee888/eslint-plugin';

export default defineConfig(
  ...ed.configs['base-typescript'],
  ...ed.configs.typescript,
  ...ed.configs['react-typescript'], // 👈 Omit this line if you don't use React TypeScript
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  }
);
```

### Nx monorepo

```js
// eslint.config.mjs
import { defineConfig } from 'eslint/config';
import nx from '@nx/eslint-plugin';
import ed from '@eddeee888/eslint-plugin';

export default defineConfig(
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...ed.configs.typescript,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    ignores: ['**/dist', 'eslint.config.mjs'],
  }
  // Other configs below...
);
```
