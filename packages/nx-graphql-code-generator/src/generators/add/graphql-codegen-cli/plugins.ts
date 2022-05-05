// This is a simplified version of plugins from @graphql-codegen/cli init
// https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-cli/src/init/plugins.ts

export interface PluginOption {
  name: string;
  package: string;
  value: string;
}

export interface PluginPresets {
  'typescript-react-apollo-client': PluginOption[];
  'typescript-angular-apollo-client': PluginOption[];
  'typescript-vue-apollo-client': PluginOption[];
  'typescript-resolvers': PluginOption[];
}

const typescriptLanguagePlugin: PluginOption = {
  name: 'TypeScript (required by other typescript plugins)',
  package: '@graphql-codegen/typescript',
  value: 'typescript',
};
const typescriptOperationsPlugin: PluginOption = {
  name: 'TypeScript Operations (operations and fragments)',
  package: '@graphql-codegen/typescript-operations',
  value: 'typescript-operations',
};
const typescriptVueOperationsPlugin: PluginOption = {
  name: 'TypeScript Vue Apollo Smart Operations (typed functions)',
  package: '@graphql-codegen/typescript-vue-apollo-smart-ops',
  value: 'typescript-vue-apollo-smart-ops',
};
const typescriptApolloFragmentMatcher: PluginOption = {
  name: `Introspection Fragment Matcher (for Apollo Client)`,
  package: '@graphql-codegen/fragment-matcher',
  value: 'fragment-matcher',
};

export const pluginPresets: PluginPresets = {
  'typescript-react-apollo-client': [
    typescriptLanguagePlugin,
    typescriptOperationsPlugin,
    {
      name: 'TypeScript React Apollo (typed components and HOCs)',
      package: '@graphql-codegen/typescript-react-apollo',
      value: 'typescript-react-apollo',
    },
    typescriptApolloFragmentMatcher,
  ],
  'typescript-angular-apollo-client': [
    typescriptLanguagePlugin,
    typescriptOperationsPlugin,
    {
      name: 'TypeScript Apollo Angular (typed GQL services)',
      package: '@graphql-codegen/typescript-apollo-angular',
      value: 'typescript-apollo-angular',
    },
    typescriptApolloFragmentMatcher,
  ],
  'typescript-vue-apollo-client': [
    typescriptLanguagePlugin,
    typescriptVueOperationsPlugin,
    {
      name: 'TypeScript Vue Apollo Composition API (typed functions)',
      package: '@graphql-codegen/typescript-vue-apollo',
      value: 'typescript-vue-apollo',
    },
    typescriptApolloFragmentMatcher,
  ],
  'typescript-resolvers': [
    typescriptLanguagePlugin,
    {
      name: 'TypeScript Resolvers (strongly typed resolve functions)',
      package: '@graphql-codegen/typescript-resolvers',
      value: 'typescript-resolvers',
    },
  ],
};

// FIXME: work these out
// [
//   {
//     type: 'support',
//     name: `TypeScript GraphQL files modules (declarations for .graphql files)`,
//     package: '@graphql-codegen/typescript-graphql-files-modules',
//     value: 'typescript-graphql-files-modules',
//   },
//   {
//     type: 'support',
//     name: `TypeScript GraphQL document nodes (embedded GraphQL document)`,
//     package: '@graphql-codegen/typescript-document-nodes',
//     value: 'typescript-document-nodes',
//   },
//   {
//     name: `TypeScript MongoDB (typed MongoDB objects)`,
//     package: '@graphql-codegen/typescript-mongodb',
//     value: 'typescript-mongodb',
//   },
//   {
//     name: `Urql Introspection (for Urql Client)`,
//     package: '@graphql-codegen/urql-introspection',
//     value: 'urql-introspection',
//   },
// ];
