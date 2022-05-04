// This is a simplified version of plugins from @graphql-codegen/cli init
// https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-cli/src/init/plugins.ts

interface PluginOption {
  name: string;
  package: string;
  value: string;
}

export const plugins: Array<PluginOption> = [
  {
    name: 'TypeScript (required by other typescript plugins)',
    package: '@graphql-codegen/typescript',
    value: 'typescript',
  },
  {
    name: 'TypeScript Operations (operations and fragments)',
    package: '@graphql-codegen/typescript-operations',
    value: 'typescript-operations',
  },
  {
    name: 'TypeScript Resolvers (strongly typed resolve functions)',
    package: '@graphql-codegen/typescript-resolvers',
    value: 'typescript-resolvers',
  },
  {
    name: 'Flow (required by other flow plugins)',
    package: '@graphql-codegen/flow',
    value: 'flow',
  },
  {
    name: 'Flow Operations (operations and fragments)',
    package: '@graphql-codegen/flow-operations',
    value: 'flow-operations',
  },
  {
    name: 'Flow Resolvers (strongly typed resolve functions)',
    package: '@graphql-codegen/flow-resolvers',
    value: 'flow-resolvers',
  },
  {
    name: 'TypeScript Apollo Angular (typed GQL services)',
    package: '@graphql-codegen/typescript-apollo-angular',
    value: 'typescript-apollo-angular',
  },
  {
    name: 'TypeScript Vue Apollo Composition API (typed functions)',
    package: '@graphql-codegen/typescript-vue-apollo',
    value: 'typescript-vue-apollo',
  },
  {
    name: 'TypeScript Vue Apollo Smart Operations (typed functions)',
    package: '@graphql-codegen/typescript-vue-apollo-smart-ops',
    value: 'typescript-vue-apollo-smart-ops',
  },
  {
    name: 'TypeScript React Apollo (typed components and HOCs)',
    package: '@graphql-codegen/typescript-react-apollo',
    value: 'typescript-react-apollo',
  },
  {
    name: `TypeScript Stencil Apollo (typed components)`,
    package: '@graphql-codegen/typescript-stencil-apollo',
    value: 'typescript-stencil-apollo',
  },
  {
    name: `TypeScript MongoDB (typed MongoDB objects)`,
    package: '@graphql-codegen/typescript-mongodb',
    value: 'typescript-mongodb',
  },
  {
    name: `TypeScript GraphQL files modules (declarations for .graphql files)`,
    package: '@graphql-codegen/typescript-graphql-files-modules',
    value: 'typescript-graphql-files-modules',
  },
  {
    name: `TypeScript GraphQL document nodes (embedded GraphQL document)`,
    package: '@graphql-codegen/typescript-document-nodes',
    value: 'typescript-document-nodes',
  },
  {
    name: `Introspection Fragment Matcher (for Apollo Client)`,
    package: '@graphql-codegen/fragment-matcher',
    value: 'fragment-matcher',
  },
  {
    name: `Urql Introspection (for Urql Client)`,
    package: '@graphql-codegen/urql-introspection',
    value: 'urql-introspection',
  },
];
