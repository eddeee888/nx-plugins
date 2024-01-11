# @eddeee888/eslint-plugin

This plugin contains extendable ESLint configs.

## Installation

1. Install the plugin and TypeScript config

```
yarn add -DE @eddeee888/eslint-plugin @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

2. Install React plugins - only if you are planning to work with React files

```
yarn add -DE eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y
```

## Usage

### Normal repo

```json
{
  "plugins": ["@eddeee888"],
  "parserOptions": {
    "project": ["tsconfig.json"]
  },
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "extends": ["plugin:@eddeee888/typescript"],
      "rules": {}
    },
    {
      "files": ["*.tsx"],
      "extends": ["plugin:@eddeee888/react-typescript"],
      "rules": {}
    }
  ]
}
```
