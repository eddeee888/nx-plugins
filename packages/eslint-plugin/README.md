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

### Nx monorepo

```json
// Root .eslintrc.json
{
  // ... other options
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "extends": [
        "plugin:@nx/typescript",
        // 👇 Add this line for TypeScript files
        "plugin:@eddeee888/typescript"
      ],
      "rules": {}
    },
    {
      "files": ["*.tsx"],
      "extends": [
        "plugin:@nx/react-typescript",
        // 👇 Add this line if you use React TypeScript
        "plugin:@eddeee888/react-typescript"
      ],
      "rules": {}
    }
  ]
}

// Project .eslintrc.json
{
  "extends": ["../../.eslintrc.json"],
  "ignorePatterns": ["!**/*"],
  "overrides": [
    // ... other config
    {
      "files": ["*.ts", "*.tsx"],
      // 👇 Add parserOptions.project that points to your project tsconfig.json file
      "parserOptions": {
        "project": ["pathto/project/tsconfig(.*)?.json"]
      },
      "rules": {}
    },
    {
      "files": ["*.js", "*.jsx"],
      "rules": {}
    }
  ],
  "env": {
    "jest": true
  }
}

// (Optional) Choose files to lint by using `project.json` 's `lintFilePatterns`
//
// Sometimes, the patterns set in a project's .eslintrc.json may not work correctly,
// especially when running Nx CLI: `nx lint <project>`
// In such case, try using `lintFilePatterns` in the project's `project.json`
{
  // ... other configs
  "targets": {
    "lint": {
      "executor": "@nx/eslint:lint",
      "outputs": ["{options.outputFile}"],
      "options": {
        "lintFilePatterns": ["{projectRoot}/app/**/*.tsx", "{projectRoot}/app/**/*.ts"]
      }
    },
  }
}
```
