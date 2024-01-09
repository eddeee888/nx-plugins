# @eddeee888/eslint-plugin

This plugin contains extendable ESLint configs.

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
