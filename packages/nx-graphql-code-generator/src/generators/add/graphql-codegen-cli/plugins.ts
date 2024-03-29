// This is a simplified version of plugins from @graphql-codegen/cli init
// https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-cli/src/init/plugins.ts

export interface PluginOption {
  name: string;
  package: string;
  version: string;
  value: string;
}

export interface PluginPresets {
  basic: PluginOption[];
  'typescript-types': PluginOption[];
  'typescript-react-apollo-client-only': PluginOption[];
  'typescript-react-apollo-client-with-types': PluginOption[];
  'typescript-resolver-files': PluginOption[];
}

const typescriptLanguagePlugin: PluginOption = {
  name: 'TypeScript (required by other typescript plugins)',
  package: '@graphql-codegen/typescript',
  value: 'typescript',
  version: '^4.0.0',
};

const baseApolloClientPlugins: PluginOption[] = [
  {
    name: 'TypeScript Operations (operations and fragments)',
    package: '@graphql-codegen/typescript-operations',
    value: 'typescript-operations',
    version: '^4.0.0',
  },
  {
    name: 'TypeScript React Apollo (typed components and HOCs)',
    package: '@graphql-codegen/typescript-react-apollo',
    value: 'typescript-react-apollo',
    version: '^4.1.0',
  },
  {
    name: 'Near operation file preset',
    package: '@graphql-codegen/near-operation-file-preset',
    value: 'near-operation-file',
    version: '^3.0.0',
  },
];

export const pluginPresets: PluginPresets = {
  basic: [],
  'typescript-types': [typescriptLanguagePlugin],
  'typescript-react-apollo-client-only': baseApolloClientPlugins,
  'typescript-react-apollo-client-with-types': [...baseApolloClientPlugins, typescriptLanguagePlugin],
  'typescript-resolver-files': [
    {
      name: 'TypeScript Resolver Files preset',
      package: '@eddeee888/gcg-typescript-resolver-files',
      value: '@eddeee888/gcg-typescript-resolver-files',
      version: '^0.7.2',
    },
  ],
};
